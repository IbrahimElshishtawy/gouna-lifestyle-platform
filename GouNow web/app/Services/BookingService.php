<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\BookingNightlyPrice;
use App\Models\Customer;
use App\Models\Discount;
use App\Models\DiscountUsage;
use App\Models\PaymentMethod;
use App\Models\Property;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BookingService
{
    public function __construct(
        private PricingService $pricingService,
        private AvailabilityService $availabilityService,
    ) {}

    /**
     * Generate a fast calculation quote for checkout or frontend pricing display.
     */
    public function getQuote(
        Property $property,
        Carbon $checkIn,
        Carbon $checkOut,
        int $guests = 1,
        ?string $promoCode = null
    ): array {
        // Enforce guest capacity
        if ($guests > $property->max_guests) {
            throw new \InvalidArgumentException(
                "Maximum allowable guests for {$property->title_en} is {$property->max_guests}."
            );
        }

        // Validate date order
        if ($checkIn->gte($checkOut)) {
            throw new \InvalidArgumentException('Check-out date must be after check-in date.');
        }

        $isAvailable = $this->availabilityService->isAvailable($property, $checkIn, $checkOut);
        if (! $isAvailable) {
            throw new \InvalidArgumentException('The property is not available for the selected dates.');
        }

        $pricing = $this->pricingService->calculateBooking($property, $checkIn, $checkOut, $guests, $promoCode);
        if (! $pricing['satisfies_min_stay']) {
            throw new \InvalidArgumentException(
                "Minimum stay for the selected dates is {$pricing['min_stay_required']} nights."
            );
        }

        // Allowed payment options for this property
        $allowedPaymentMethods = $property->paymentMethods()
            ->wherePivot('is_enabled', true)
            ->where('payment_methods.is_enabled', true)
            ->get();
        if ($allowedPaymentMethods->isEmpty()) {
            $allowedPaymentMethods = PaymentMethod::enabled()->get();
        }

        return array_merge($pricing, [
            'is_available' => $isAvailable,
            'booking_mode' => $property->booking_mode,
            'payment_requirement' => $property->payment_requirement,
            'allowed_payment_methods' => $allowedPaymentMethods,
            'property_id' => $property->id,
            'property_title' => $property->title,
        ]);
    }

    /**
     * Create a new booking with full pricing snapshot and server-side validation.
     * Uses a DB transaction and re-validates availability before creation to avoid race conditions.
     */
    public function createPropertyBooking(
        Property $property,
        Customer $customer,
        Carbon $checkIn,
        Carbon $checkOut,
        int $guests,
        string $paymentType,        // 'full' or 'deposit'
        PaymentMethod $paymentMethod,
        ?string $promoCode = null,
        ?string $source = null,
        ?string $internalNotes = null,
    ): Booking {
        // Enforce guest limits
        if ($guests < 1 || $guests > $property->max_guests) {
            throw new \InvalidArgumentException(
                "Guest count must be between 1 and {$property->max_guests}."
            );
        }

        // Validate Section 20 Payment Requirement
        if ($property->payment_requirement === 'full' && $paymentType !== 'full') {
            throw new \InvalidArgumentException('This property requires full payment upfront.');
        }
        if ($property->payment_requirement === 'deposit' && $paymentType !== 'deposit') {
            throw new \InvalidArgumentException('This property only accepts deposit payments upon checkout.');
        }

        // Validate allowed payment method for this property (Section 20)
        $configuredMethods = $property->paymentMethods;
        if ($configuredMethods->isNotEmpty() && ! $configuredMethods->contains($paymentMethod->id)) {
            throw new \InvalidArgumentException("Payment method '{$paymentMethod->name}' is not accepted for this property.");
        }

        return DB::transaction(function () use (
            $property, $customer, $checkIn, $checkOut, $guests,
            $paymentType, $paymentMethod, $promoCode, $source, $internalNotes
        ) {
            // Re-validate availability inside the transaction to lock out concurrent double-bookings
            $this->availabilityService->lockAndValidateForBooking(
                $property, $checkIn, $checkOut, $guests
            );

            // Calculate exact pricing and minimum stay rules server-side
            $pricing = $this->pricingService->calculateBooking(
                $property, $checkIn, $checkOut, $guests, $promoCode
            );

            if (! $pricing['satisfies_min_stay']) {
                throw new \InvalidArgumentException(
                    "Minimum stay for the selected dates is {$pricing['min_stay_required']} nights."
                );
            }

            $subtotal = $pricing['subtotal_cents'];
            $cleaningFee = $pricing['cleaning_fee_cents'];
            $serviceFee = $pricing['service_fee_cents'];
            $tax = $pricing['tax_cents'];
            $discountCents = $pricing['discount_cents'];
            $discountId = $pricing['discount_id'];
            $total = $pricing['total_cents'];

            // Calculate upfront deposit required
            $depositCents = $paymentType === 'deposit'
                ? $pricing['deposit_cents']
                : $total;

            $amountRemaining = max(0, $total - $depositCents);

            // Calculate balance due date (e.g. 14 days before arrival)
            $balanceDueDate = null;
            if ($amountRemaining > 0) {
                $candidateDueDate = $checkIn->copy()->subDays(14);
                $balanceDueDate = $candidateDueDate->isPast() ? now()->toDateString() : $candidateDueDate->toDateString();
            }

            // Determine initial status based on property booking mode (Section 21)
            $initialStatus = match ($property->booking_mode) {
                'instant' => 'awaiting_payment',
                'request' => 'pending',
                'whatsapp' => 'pending',
                'manual' => 'pending',
                default => 'pending',
            };

            $reference = $this->generateReference();

            $booking = Booking::create([
                'reference' => $reference,
                'customer_id' => $customer->id,
                'bookable_type' => Property::class,
                'bookable_id' => $property->id,
                'check_in' => $checkIn->toDateString(),
                'check_out' => $checkOut->toDateString(),
                'nights' => $pricing['nights'],
                'guests' => $guests,
                'subtotal_cents' => $subtotal,
                'cleaning_fee_cents' => $cleaningFee,
                'service_fee_cents' => $serviceFee,
                'tax_cents' => $tax,
                'discount_cents' => $discountCents,
                'total_cents' => $total,
                'deposit_cents' => $depositCents,
                'amount_paid_cents' => 0,
                'amount_remaining_cents' => $total,
                'currency' => $pricing['currency'],
                'payment_type' => $paymentType,
                'payment_method_id' => $paymentMethod->id,
                'status' => $initialStatus,
                'payment_status' => 'unpaid',
                'discount_id' => $discountId,
                'promo_code' => $pricing['promo_code'],
                'balance_due_date' => $balanceDueDate,
                'internal_notes' => $internalNotes,
                'source' => $source ?? 'website_checkout',
            ]);

            // Store immutable nightly price snapshots (Section 18)
            foreach ($pricing['nightly_prices'] as $nightData) {
                BookingNightlyPrice::create([
                    'booking_id' => $booking->id,
                    'night_date' => $nightData['night_date'],
                    'price_cents' => $nightData['price_cents'],
                    'currency' => $nightData['currency'],
                    'seasonal_price_id' => $nightData['seasonal_price_id'],
                    'season_name' => $nightData['season_name'],
                    'is_base_price' => $nightData['is_base_price'],
                ]);
            }

            // Record discount usage if applicable
            if ($discountId && $discountCents > 0) {
                DiscountUsage::create([
                    'discount_id' => $discountId,
                    'booking_id' => $booking->id,
                    'customer_id' => $customer->id,
                    'amount_discounted_cents' => $discountCents,
                ]);

                Discount::where('id', $discountId)->increment('used_count');
            }

            return $booking;
        });
    }

    /**
     * Record a payment against a booking (manual or gateway confirmed).
     */
    public function recordPayment(Booking $booking, int $amountCents, string $type = 'payment'): void
    {
        DB::transaction(function () use ($booking, $amountCents, $type) {
            $booking->increment('amount_paid_cents', $amountCents);
            $booking->amount_remaining_cents = max(0, $booking->total_cents - $booking->amount_paid_cents);

            if ($booking->amount_paid_cents >= $booking->total_cents) {
                $booking->payment_status = 'paid';
                if (in_array($booking->status, ['draft', 'pending', 'awaiting_payment', 'partially_paid', 'payment_processing'])) {
                    $booking->status = 'confirmed';
                }
            } elseif ($booking->amount_paid_cents > 0) {
                $booking->payment_status = 'partially_paid';
                if (in_array($booking->status, ['draft', 'pending', 'awaiting_payment', 'payment_processing'])) {
                    $booking->status = 'confirmed'; // Confirmed with deposit
                }
            }

            $booking->save();
        });
    }

    /**
     * Cancel a booking.
     */
    public function cancelBooking(Booking $booking, string $reason, ?int $refundAmountCents = 0): void
    {
        $booking->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancellation_reason' => $reason,
            'refund_amount_cents' => $refundAmountCents ?? 0,
        ]);
    }

    /**
     * Generate a human-readable booking reference: GON-YYYY-XXXXXX
     */
    public function generateReference(): string
    {
        $year = now()->format('Y');
        do {
            $number = str_pad((string) random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
            $reference = "GON-{$year}-{$number}";
        } while (Booking::where('reference', $reference)->exists());

        return $reference;
    }
}
