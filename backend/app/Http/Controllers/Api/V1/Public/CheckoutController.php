<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Exceptions\AvailabilityConflictException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\CalculateQuoteRequest;
use App\Http\Requests\Api\V1\CreateBookingRequest;
use App\Http\Resources\Api\V1\BookingResource;
use App\Http\Resources\Api\V1\QuoteResource;
use App\Models\Booking;
use App\Models\PaymentMethod;
use App\Models\Property;
use App\Modules\Booking\Application\Actions\CreateBookingAction;
use App\Modules\Booking\Application\DTOs\CreateBookingDTO;
use App\Modules\Customer\Application\Actions\FindOrCreateCustomerAction;
use App\Modules\Payment\Application\Actions\InitiatePaymentAction;
use App\Modules\Pricing\Application\Queries\CalculateBookingQuoteQuery;
use App\Shared\Domain\Exceptions\BookingUnavailableException as DomainAvailabilityException;
use App\Services\Payment\PaymentService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CheckoutController extends Controller
{
    public function __construct(
        private readonly CalculateBookingQuoteQuery $quoteQuery,
        private readonly FindOrCreateCustomerAction $findOrCreateCustomerAction,
        private readonly CreateBookingAction $createBookingAction,
        private readonly InitiatePaymentAction $initiatePaymentAction,
        private readonly PaymentService $paymentService,
    ) {}

    /**
     * Calculate an authoritative pricing quote for a stay.
     */
    public function quote(CalculateQuoteRequest $request): QuoteResource
    {
        $validated = $request->validated();
        $property = Property::findOrFail($validated['property_id']);
        $checkIn = Carbon::parse($validated['check_in']);
        $checkOut = Carbon::parse($validated['check_out']);
        $guests = (int) $validated['guests'];
        $promoCode = $validated['promo_code'] ?? null;

        $pricing = $this->quoteQuery->execute(
            $property,
            $checkIn,
            $checkOut,
            $guests,
            $promoCode
        );

        return new QuoteResource([
            'property_id' => $property->id,
            'check_in' => $checkIn->toDateString(),
            'check_out' => $checkOut->toDateString(),
            'nights' => $pricing->nights,
            'guests' => $guests,
            'nightly_rate_cents' => $pricing->nights > 0 ? (int) round($pricing->subtotalCents / $pricing->nights) : $property->base_price_cents,
            'subtotal_cents' => $pricing->subtotalCents,
            'cleaning_fee_cents' => $pricing->cleaningFeeCents,
            'service_fee_cents' => $pricing->serviceFeeCents,
            'tax_cents' => $pricing->taxCents,
            'discount_cents' => $pricing->discountCents,
            'total_cents' => $pricing->totalCents,
            'deposit_cents' => $pricing->depositCents,
            'currency' => $pricing->currency,
            'breakdown' => $pricing->nightlyPrices,
        ]);
    }

    /**
     * Create a booking with server-side pricing, pessimistic concurrency locks, and idempotency.
     */
    public function createBooking(CreateBookingRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $property = Property::findOrFail($validated['property_id']);

        // Resolve payment method by type or default enabled
        $paymentMethodType = $validated['payment_method'];
        $paymentMethod = PaymentMethod::where('code', $paymentMethodType)
            ->orWhere('id', is_numeric($paymentMethodType) ? (int) $paymentMethodType : 0)
            ->first();

        if (! $paymentMethod) {
            $paymentMethod = PaymentMethod::where('is_enabled', true)->firstOrFail();
        }

        $checkIn = Carbon::parse($validated['check_in']);
        $checkOut = Carbon::parse($validated['check_out']);

        try {
            [$booking, $paymentResult] = DB::transaction(function () use (
                $validated, $property, $paymentMethod, $checkIn, $checkOut, $request
            ) {
                // Find or create customer record
                $customerData = [
                    'first_name' => $validated['first_name'],
                    'last_name' => $validated['last_name'],
                    'email' => $validated['email'],
                    'phone' => $validated['phone'],
                ];
                $customer = $this->findOrCreateCustomerAction->execute($customerData, $request->user()?->id);

                // Build strict DTO
                $dto = new CreateBookingDTO(
                    property: $property,
                    customer: $customer,
                    checkIn: $checkIn,
                    checkOut: $checkOut,
                    guests: (int) $validated['guests'],
                    paymentType: $property->payment_requirement === 'deposit' ? 'deposit' : 'full',
                    paymentMethod: $paymentMethod,
                    promoCode: $validated['promo_code'] ?? null,
                    source: 'api_v1_checkout',
                    internalNotes: $validated['special_requests'] ?? null,
                    idempotencyKey: $request->header('Idempotency-Key') ?? $request->header('X-Idempotency-Key'),
                );

                $booking = $this->createBookingAction->execute($dto);
                $paymentResultDTO = $this->initiatePaymentAction->execute($booking);

                return [$booking, $paymentResultDTO->toArray()];
            });

            $bookingResource = (new BookingResource($booking))->additional([
                'meta' => [
                    'payment_result' => $paymentResult,
                    'redirect_url' => $paymentResult['redirect_url'] ?? null,
                    'access_token' => $booking->plain_access_token ?? null,
                ],
            ]);

            return $bookingResource->response()->setStatusCode(201);

        } catch (DomainAvailabilityException $e) {
            throw new AvailabilityConflictException($e->getMessage());
        }
    }

    /**
     * Retrieve booking by reference code with multi-tier authorization and IDOR defense.
     */
    public function show(Request $request, string $reference): BookingResource
    {
        $booking = Booking::where('reference', $reference)
            ->with(['bookable', 'customer'])
            ->first();

        if (! $booking) {
            abort(404, 'Reservation not found or access denied.');
        }

        $user = $request->user('sanctum') ?? auth()->user();
        $isAuthorized = false;

        if ($user) {
            if ($user->is_admin || $user->hasRole('super_admin') || $user->hasRole('property_manager') || $user->hasRole('finance')) {
                $isAuthorized = true;
            } elseif ($user->hasRole('staff') && $booking->assigned_to === $user->id) {
                $isAuthorized = true;
            } elseif ($booking->customer && ($booking->customer->user_id === $user->id || Str::lower((string) $booking->customer->email) === Str::lower((string) $user->email))) {
                $isAuthorized = true;
            }
        }

        // Token-based guest authorization
        $token = $request->query('token') ?? $request->header('X-Booking-Token');
        if (! $isAuthorized && $token && ! empty($booking->booking_access_token)) {
            if (hash_equals($booking->booking_access_token, hash('sha256', (string) $token))) {
                $isAuthorized = true;
            }
        }

        // Guest email verification fallback
        $email = $request->query('email') ?? $request->header('X-Customer-Email');
        if (! $isAuthorized && $email && $booking->customer && Str::lower((string) $email) === Str::lower((string) $booking->customer->email)) {
            $isAuthorized = true;
        }

        if (! $isAuthorized) {
            abort(404, 'Reservation not found or access denied.');
        }

        return new BookingResource($booking);
    }

    /**
     * Authorize and confirm payment completed via Paymob hosted gateway or simulator.
     */
    public function completePaymobPayment(Request $request, string $reference): JsonResponse
    {
        $booking = Booking::where('reference', $reference)
            ->with(['transactions', 'customer', 'bookable'])
            ->firstOrFail();

        $token = $request->input('token') ?? $request->query('token');
        if ($token && ! empty($booking->booking_access_token)) {
            if (! hash_equals($booking->booking_access_token, hash('sha256', (string) $token))) {
                return response()->json(['error' => 'Invalid booking security token.'], 403);
            }
        }

        $transaction = $booking->transactions()->where('status', 'pending')->latest()->first();
        if (! $transaction) {
            $transaction = $booking->transactions()->latest()->first();
        }

        if (! $transaction) {
            return response()->json(['error' => 'No transaction record found for this booking.'], 404);
        }

        if ($transaction->status === 'completed') {
            return response()->json([
                'success' => true,
                'status' => 'completed',
                'booking_reference' => $booking->reference,
                'redirect_url' => "/checkout/confirmation/{$booking->reference}?token={$token}",
                'message' => 'Payment already completed.',
            ]);
        }

        $gatewayRef = (string) ($request->input('gateway_reference') ?? ('PAYMOB-' . time() . '-' . rand(1000, 9999)));
        $confirmedTransaction = $this->paymentService->confirmPayment($transaction->transaction_id, $gatewayRef);

        return response()->json([
            'success' => true,
            'status' => 'completed',
            'booking_reference' => $booking->reference,
            'transaction_id' => $confirmedTransaction->transaction_id,
            'gateway_reference' => $gatewayRef,
            'amount_cents' => $confirmedTransaction->amount_cents,
            'currency' => $confirmedTransaction->currency,
            'redirect_url' => "/checkout/confirmation/{$booking->reference}?token={$token}",
            'message' => 'Payment has been successfully authorized and confirmed by Paymob.',
        ]);
    }

    /**
     * Mark Paymob payment as declined / cancelled.
     */
    public function declinePaymobPayment(Request $request, string $reference): JsonResponse
    {
        $booking = Booking::where('reference', $reference)->firstOrFail();
        $transaction = $booking->transactions()->where('status', 'pending')->latest()->first();
        if ($transaction) {
            $reason = (string) ($request->input('reason') ?? 'Payment declined or cancelled by customer.');
            $this->paymentService->failPayment($transaction->transaction_id, $reason);
        }

        return response()->json([
            'success' => false,
            'status' => 'failed',
            'message' => 'Payment authorization declined.',
        ], 400);
    }
}
