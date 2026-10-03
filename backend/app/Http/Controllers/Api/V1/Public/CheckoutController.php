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
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class CheckoutController extends Controller
{
    public function __construct(
        private readonly CalculateBookingQuoteQuery $quoteQuery,
        private readonly FindOrCreateCustomerAction $findOrCreateCustomerAction,
        private readonly CreateBookingAction $createBookingAction,
        private readonly InitiatePaymentAction $initiatePaymentAction,
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
     * Retrieve booking by public reference code.
     */
    public function show(string $reference): BookingResource
    {
        $booking = Booking::where('reference', $reference)
            ->with(['bookable', 'customer'])
            ->firstOrFail();

        return new BookingResource($booking);
    }
}
