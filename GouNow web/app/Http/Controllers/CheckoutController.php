<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Customer;
use App\Models\PaymentMethod;
use App\Models\PaymentTransaction;
use App\Models\Property;
use App\Services\BookingService;
use App\Services\Payment\PaymentService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class CheckoutController extends Controller
{
    public function __construct(
        private BookingService $bookingService,
        private PaymentService $paymentService,
    ) {}

    /**
     * Calculate pricing quote dynamically (API / AJAX endpoint).
     */
    public function calculate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'property_id' => ['required', 'exists:properties,id'],
            'check_in' => ['required', 'date'],
            'check_out' => ['required', 'date', 'after:check_in'],
            'guests' => ['required', 'integer', 'min:1'],
            'promo_code' => ['nullable', 'string', 'max:50'],
        ]);

        $property = Property::findOrFail($validated['property_id']);
        $checkIn = Carbon::parse($validated['check_in']);
        $checkOut = Carbon::parse($validated['check_out']);
        $guests = (int) $validated['guests'];
        $promoCode = $validated['promo_code'] ?? null;

        try {
            $quote = $this->bookingService->getQuote($property, $checkIn, $checkOut, $guests, $promoCode);
            return response()->json([
                'success' => true,
                'quote' => $quote,
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Display the checkout page for a selected property and dates.
     */
    public function show(Request $request, Property $property): View|RedirectResponse
    {
        $checkInStr = $request->query('check_in', now()->addDays(2)->toDateString());
        $checkOutStr = $request->query('check_out', now()->addDays(5)->toDateString());
        $guests = (int) $request->query('guests', 2);
        $promoCode = $request->query('promo_code');

        $checkIn = Carbon::parse($checkInStr);
        $checkOut = Carbon::parse($checkOutStr);

        try {
            $quote = $this->bookingService->getQuote($property, $checkIn, $checkOut, $guests, $promoCode);
        } catch (\InvalidArgumentException $e) {
            return back()->with('error', $e->getMessage());
        }

        $paymentMethods = $property->paymentMethods()
            ->wherePivot('is_enabled', true)
            ->where('payment_methods.is_enabled', true)
            ->get();
        if ($paymentMethods->isEmpty()) {
            $paymentMethods = PaymentMethod::enabled()->get();
        }

        return view('checkout.show', compact('property', 'quote', 'paymentMethods', 'checkIn', 'checkOut', 'guests', 'promoCode'));
    }

    /**
     * Process checkout form submission: server-side validation, booking creation, and payment initiation.
     */
    public function process(Request $request): RedirectResponse|JsonResponse
    {
        $validated = $request->validate([
            'property_id' => ['required', 'exists:properties,id'],
            'check_in' => ['required', 'date', 'after_or_equal:today'],
            'check_out' => ['required', 'date', 'after:check_in'],
            'guests' => ['required', 'integer', 'min:1'],
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:30'],
            'country' => ['nullable', 'string', 'max:100'],
            'special_requests' => ['nullable', 'string', 'max:1000'],
            'payment_method_id' => ['required', 'exists:payment_methods,id'],
            'payment_type' => ['required', 'in:full,deposit'],
            'promo_code' => ['nullable', 'string', 'max:50'],
        ]);

        $property = Property::findOrFail($validated['property_id']);
        $paymentMethod = PaymentMethod::findOrFail($validated['payment_method_id']);
        $checkIn = Carbon::parse($validated['check_in']);
        $checkOut = Carbon::parse($validated['check_out']);

        try {
            [$booking, $paymentResult] = DB::transaction(function () use ($validated, $property, $paymentMethod, $checkIn, $checkOut) {
                // Find or create customer profile inside transaction
                $customer = Customer::firstOrCreate(
                    ['email' => $validated['email']],
                    [
                        'first_name' => $validated['first_name'],
                        'last_name' => $validated['last_name'],
                        'phone' => $validated['phone'],
                        'country_of_residence' => $validated['country'] ?? 'Egypt',
                        'user_id' => auth()->id(),
                        'notes' => $validated['special_requests'] ?? null,
                        'source' => 'website_checkout',
                    ]
                );

                // Create booking inside atomic transaction with availability locking
                $booking = $this->bookingService->createPropertyBooking(
                    property: $property,
                    customer: $customer,
                    checkIn: $checkIn,
                    checkOut: $checkOut,
                    guests: (int) $validated['guests'],
                    paymentType: $validated['payment_type'],
                    paymentMethod: $paymentMethod,
                    promoCode: $validated['promo_code'] ?? null,
                    source: 'website_checkout',
                    internalNotes: $validated['special_requests'] ?? null,
                );

                // Initiate payment via resolved gateway
                $paymentResult = $this->paymentService->initiatePayment($booking);

                return [$booking, $paymentResult];
            });

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'booking_reference' => $booking->reference,
                    'redirect_url' => $paymentResult['redirect_url'] ?? route('checkout.confirmation', $booking->reference),
                    'payment_result' => $paymentResult,
                ]);
            }

            // If payment gateway returned a redirect URL (e.g. Card 3DS, PayPal), redirect user there
            if (! empty($paymentResult['redirect_url'])) {
                return redirect($paymentResult['redirect_url']);
            }

            // For manual cash / wire transfer payments, redirect to confirmation directly
            return redirect()->route('checkout.confirmation', $booking->reference)
                ->with('success', 'Your reservation has been created! Please follow the payment instructions below.');

        } catch (\InvalidArgumentException $e) {
            if ($request->wantsJson()) {
                return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
            }
            return back()->withInput()->with('error', $e->getMessage());
        }
    }

    /**
     * Show the booking confirmation voucher page.
     */
    public function confirmation(string $reference): View
    {
        $booking = Booking::where('reference', $reference)
            ->with(['bookable', 'customer', 'nightlyPrices', 'transactions', 'paymentMethod'])
            ->firstOrFail();

        return view('checkout.confirmation', compact('booking'));
    }

    /**
     * Sandbox: Card 3DS Mock Simulation Page.
     */
    public function cardMock(Request $request, string $reference): View
    {
        $booking = Booking::where('reference', $reference)
            ->with(['bookable', 'paymentMethod', 'transactions'])
            ->firstOrFail();

        $transaction = $booking->transactions()->latest()->firstOrFail();
        $sessionId = $request->query('session', $transaction->transaction_id);

        return view('checkout.card_mock', compact('booking', 'transaction', 'sessionId'));
    }

    /**
     * Sandbox: Confirm Card Mock Payment.
     */
    public function cardMockComplete(Request $request, string $reference): RedirectResponse
    {
        $booking = Booking::where('reference', $reference)->firstOrFail();
        $transaction = $booking->transactions()->where('status', 'pending')->latest()->firstOrFail();

        $this->paymentService->confirmPayment($transaction->transaction_id, 'GATEWAY-REF-' . time());

        return redirect()->route('checkout.confirmation', $booking->reference)
            ->with('success', 'Card payment approved and verified! Your reservation is now confirmed.');
    }

    /**
     * Sandbox: Decline Card Mock Payment.
     */
    public function cardMockDecline(Request $request, string $reference): RedirectResponse
    {
        $booking = Booking::where('reference', $reference)->firstOrFail();
        $transaction = $booking->transactions()->where('status', 'pending')->latest()->firstOrFail();

        $this->paymentService->failPayment($transaction->transaction_id, 'Card authorization declined by issuer (Simulation).');

        return redirect()->route('checkout.confirmation', $booking->reference)
            ->with('error', 'Payment was declined. Please try another card or alternative payment method.');
    }

    /**
     * Sandbox: PayPal Mock Simulation Page.
     */
    public function paypalMock(Request $request, string $reference): View
    {
        $booking = Booking::where('reference', $reference)
            ->with(['bookable', 'paymentMethod', 'transactions'])
            ->firstOrFail();

        $transaction = $booking->transactions()->latest()->firstOrFail();
        $orderId = $request->query('order_id', $transaction->transaction_id);

        return view('checkout.paypal_mock', compact('booking', 'transaction', 'orderId'));
    }

    /**
     * Sandbox: Confirm PayPal Mock Payment.
     */
    public function paypalMockComplete(Request $request, string $reference): RedirectResponse
    {
        $booking = Booking::where('reference', $reference)->firstOrFail();
        $transaction = $booking->transactions()->where('status', 'pending')->latest()->firstOrFail();

        $this->paymentService->confirmPayment($transaction->transaction_id, 'PAYPAL-CAP-' . time());

        return redirect()->route('checkout.confirmation', $booking->reference)
            ->with('success', 'PayPal order captured successfully! Your reservation is confirmed.');
    }
}
