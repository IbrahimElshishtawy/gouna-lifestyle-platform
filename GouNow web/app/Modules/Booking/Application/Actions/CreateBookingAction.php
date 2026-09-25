<?php

declare(strict_types=1);

namespace App\Modules\Booking\Application\Actions;

use App\Models\Booking;
use App\Models\BookingNightlyPrice;
use App\Models\Discount;
use App\Models\DiscountUsage;
use App\Models\Property;
use App\Modules\Availability\Application\Actions\LockAndValidateAvailabilityAction;
use App\Modules\Booking\Application\DTOs\CreateBookingDTO;
use App\Modules\Pricing\Application\Queries\CalculateBookingQuoteQuery;
use App\Shared\Domain\Exceptions\MaximumGuestsExceededException;
use App\Shared\Domain\Exceptions\MinimumStayViolationException;
use App\Shared\Domain\Exceptions\PaymentMethodNotAllowedException;
use App\Shared\Domain\Exceptions\PaymentRequirementMismatchException;
use App\Shared\Domain\ValueObjects\BookingReference;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class CreateBookingAction
{
    public function __construct(
        private readonly CalculateBookingQuoteQuery $pricingQuery,
        private readonly LockAndValidateAvailabilityAction $lockAndValidateAction,
    ) {}

    public function execute(CreateBookingDTO $dto): Booking
    {
        $property = $dto->property;
        $customer = $dto->customer;
        $checkIn = $dto->checkIn;
        $checkOut = $dto->checkOut;
        $guests = $dto->guests;
        $paymentType = $dto->paymentType;
        $paymentMethod = $dto->paymentMethod;
        $promoCode = $dto->promoCode;
        $source = $dto->source;
        $internalNotes = $dto->internalNotes;

        // Enforce guest limits
        if ($guests < 1 || $guests > $property->max_guests) {
            throw new MaximumGuestsExceededException(
                "Guest count must be between 1 and {$property->max_guests}."
            );
        }

        // Validate Section 20 Payment Requirement
        if ($property->payment_requirement === 'full' && $paymentType !== 'full') {
            throw new PaymentRequirementMismatchException('This property requires full payment upfront.');
        }
        if ($property->payment_requirement === 'deposit' && $paymentType !== 'deposit') {
            throw new PaymentRequirementMismatchException('This property only accepts deposit payments upon checkout.');
        }

        // Validate allowed payment method for this property (Section 20)
        $configuredMethods = $property->paymentMethods;
        if ($configuredMethods->isNotEmpty() && ! $configuredMethods->contains($paymentMethod->id)) {
            throw new PaymentMethodNotAllowedException($paymentMethod->name);
        }

        return DB::transaction(function () use (
            $property, $customer, $checkIn, $checkOut, $guests,
            $paymentType, $paymentMethod, $promoCode, $source, $internalNotes
        ) {
            // Re-validate availability inside transaction with pessimistic property row lock
            $this->lockAndValidateAction->execute(
                $property, $checkIn, $checkOut, $guests
            );

            // Calculate exact pricing and minimum stay rules server-side
            $pricing = $this->pricingQuery->execute(
                $property, $checkIn, $checkOut, $guests, $promoCode
            );

            if (! $pricing->satisfiesMinStay) {
                throw new MinimumStayViolationException($pricing->minStayRequired);
            }

            $subtotal = $pricing->subtotalCents;
            $cleaningFee = $pricing->cleaningFeeCents;
            $serviceFee = $pricing->serviceFeeCents;
            $tax = $pricing->taxCents;
            $discountCents = $pricing->discountCents;
            $discountId = $pricing->discountId;
            $total = $pricing->totalCents;

            // Calculate upfront deposit required
            $depositCents = $paymentType === 'deposit'
                ? $pricing->depositCents
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

            $reference = BookingReference::generate()->toString();
            while (Booking::where('reference', $reference)->exists()) {
                $reference = BookingReference::generate()->toString();
            }

            $booking = Booking::create([
                'reference' => $reference,
                'customer_id' => $customer->id,
                'bookable_type' => Property::class,
                'bookable_id' => $property->id,
                'check_in' => $checkIn->toDateString(),
                'check_out' => $checkOut->toDateString(),
                'nights' => $pricing->nights,
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
                'currency' => $pricing->currency,
                'payment_type' => $paymentType,
                'payment_method_id' => $paymentMethod->id,
                'status' => $initialStatus,
                'payment_status' => 'unpaid',
                'discount_id' => $discountId,
                'promo_code' => $pricing->promoCode,
                'balance_due_date' => $balanceDueDate,
                'internal_notes' => $internalNotes,
                'source' => $source ?? 'website_checkout',
            ]);

            // Store immutable nightly price snapshots (Section 18)
            foreach ($pricing->nightlyPrices as $nightData) {
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
}
