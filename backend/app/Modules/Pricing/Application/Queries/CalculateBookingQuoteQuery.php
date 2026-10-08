<?php

declare(strict_types=1);

namespace App\Modules\Pricing\Application\Queries;

use App\Models\Discount;
use App\Models\Property;
use App\Models\SeasonalPrice;
use App\Modules\Pricing\Application\DTOs\PricingQuoteDTO;
use Carbon\Carbon;
use InvalidArgumentException;

class CalculateBookingQuoteQuery
{
    /**
     * Calculate the nightly price for a specific date for a property.
     * Uses highest-priority active seasonal rule covering the date.
     * In case of identical priority, the most recently updated rule takes precedence.
     */
    public function getNightlyPriceCents(Property $property, Carbon $date): array
    {
        $dateStr = $date->toDateString();
        $dayName = $date->format('l');

        // Retrieve candidates covering this date
        $candidates = SeasonalPrice::where('is_active', true)
            ->where(function ($q) use ($property) {
                $q->where('property_id', $property->id);
                if ($property->parent_id) {
                    $q->orWhere('property_id', $property->parent_id);
                }
                $q->orWhereNull('property_id');
            })
            ->whereDate('start_date', '<=', $dateStr)
            ->whereDate('end_date', '>=', $dateStr)
            ->get();

        // Sort candidates by Pricing Hierarchy (Section 25 of promit.md):
        // Tier 4: Date-specific Override (rule_type === 'override')
        // Tier 3: Unit-specific Rule (property_id === $property->id)
        // Tier 2: Property-level Rule (property_id === $property->parent_id)
        // Tier 1: Global Rule (property_id === null)
        $candidates = $candidates->sort(function (SeasonalPrice $a, SeasonalPrice $b) use ($property) {
            $getTier = function (SeasonalPrice $sp) use ($property): int {
                if ($sp->rule_type === 'override') {
                    return 4;
                }
                if ($sp->property_id === $property->id) {
                    return 3;
                }
                if ($property->parent_id && $sp->property_id === $property->parent_id) {
                    return 2;
                }
                return 1;
            };

            $tierA = $getTier($a);
            $tierB = $getTier($b);
            if ($tierA !== $tierB) {
                return $tierB <=> $tierA;
            }

            $pA = (int) $a->priority;
            $pB = (int) $b->priority;
            if ($pA !== $pB) {
                return $pB <=> $pA;
            }

            return $b->id <=> $a->id;
        })->values();

        // Match first candidate that conforms to days_of_week constraint (if weekend/day restricted)
        $winner = $candidates->first(function (SeasonalPrice $sp) use ($dayName) {
            if (!empty($sp->days_of_week) && is_array($sp->days_of_week)) {
                return in_array($dayName, $sp->days_of_week, true);
            }
            return true;
        });

        if ($winner) {
            $effectivePriceCents = (int) $winner->price_cents;
            if ($winner->adjustment_type === 'percentage' && $winner->adjustment_percent) {
                $baseCents = (int) $property->base_price_cents;
                $effectivePriceCents = (int) round($baseCents * (1 + ((float) $winner->adjustment_percent / 100)));
            }

            return [
                'price_cents' => $effectivePriceCents,
                'seasonal_price_id' => $winner->id,
                'season_name' => $winner->name_en,
                'rule_type' => $winner->rule_type ?? 'season',
                'is_base_price' => false,
                'priority' => (int) $winner->priority,
                'min_stay_nights' => $winner->min_stay_nights ? (int) $winner->min_stay_nights : null,
            ];
        }

        return [
            'price_cents' => (int) $property->base_price_cents,
            'seasonal_price_id' => null,
            'season_name' => null,
            'rule_type' => 'base',
            'is_base_price' => true,
            'priority' => 0,
            'min_stay_nights' => null,
        ];
    }

    /**
     * Calculate the complete pricing breakdown for a booking request.
     * Check-out date is NOT charged as an overnight stay (Hotel standard date rule).
     */
    public function execute(
        Property $property,
        Carbon $checkIn,
        Carbon $checkOut,
        int $guests = 1,
        ?string $promoCode = null
    ): PricingQuoteDTO {
        $nights = $checkIn->diffInDays($checkOut);

        if ($nights <= 0) {
            throw new InvalidArgumentException('Check-out date must be at least 1 day after check-in date.');
        }

        $nightlyPrices = [];
        $subtotalCents = 0;
        $maxSeasonalMinStay = null;

        // Iterate each night individually (checkIn to checkOut - 1 day)
        $current = $checkIn->copy();
        while ($current->lt($checkOut)) {
            $nightData = $this->getNightlyPriceCents($property, $current);

            $nightlyPrices[] = array_merge($nightData, [
                'night_date' => $current->toDateString(),
                'day_of_week' => $current->format('l'),
                'currency' => $property->currency ?? 'EGP',
                'price_formatted' => number_format($nightData['price_cents'] / 100, 2),
            ]);

            $subtotalCents += $nightData['price_cents'];

            if ($nightData['min_stay_nights'] !== null) {
                if ($maxSeasonalMinStay === null || $nightData['min_stay_nights'] > $maxSeasonalMinStay) {
                    $maxSeasonalMinStay = $nightData['min_stay_nights'];
                }
            }

            $current->addDay();
        }

        // Determine effective minimum stay (property default vs seasonal override)
        $propertyDefaultMin = (int) ($property->min_stay_nights ?? 1);
        $effectiveMinStay = max($propertyDefaultMin, $maxSeasonalMinStay ?? 0);
        $satisfiesMinStay = ($nights >= $effectiveMinStay);

        // Fees & Taxes
        $cleaningFeeCents = (int) ($property->cleaning_fee_cents ?? 0);
        $serviceFeeCents = (int) ($property->service_fee_cents ?? 0);

        // Promo Code Discount Calculation
        $discountCents = 0;
        $appliedPromoCode = null;
        $discountId = null;

        if ($promoCode) {
            $discount = Discount::where('code', $promoCode)
                ->where('is_active', true)
                ->first();

            if ($discount && $discount->isValid()) {
                $meetsMinNights = (! $discount->min_stay_nights || $nights >= $discount->min_stay_nights);
                $meetsMinAmount = (! $discount->min_booking_amount_cents || $subtotalCents >= $discount->min_booking_amount_cents);

                if ($meetsMinNights && $meetsMinAmount) {
                    $discountCents = $discount->calculateDiscount($subtotalCents);
                    $appliedPromoCode = $discount->code;
                    $discountId = $discount->id;
                }
            }
        }

        // Tax calculation on net amount
        $taxableAmountCents = max(0, $subtotalCents + $cleaningFeeCents + $serviceFeeCents - $discountCents);
        $taxPercentage = (float) ($property->tax_percentage ?? 0);
        $taxCents = (int) round($taxableAmountCents * ($taxPercentage / 100));

        $totalCents = max(0, $taxableAmountCents + $taxCents);

        // Required deposit
        $depositCents = $this->calculateDepositCents($property, $totalCents);
        $amountRemainingCents = max(0, $totalCents - $depositCents);

        return new PricingQuoteDTO(
            nights: (int) $nights,
            nightlyPrices: $nightlyPrices,
            subtotalCents: $subtotalCents,
            subtotalFormatted: number_format($subtotalCents / 100, 2),
            cleaningFeeCents: $cleaningFeeCents,
            serviceFeeCents: $serviceFeeCents,
            discountCents: $discountCents,
            discountId: $discountId,
            promoCode: $appliedPromoCode,
            taxPercentage: $taxPercentage,
            taxCents: $taxCents,
            totalCents: $totalCents,
            totalFormatted: number_format($totalCents / 100, 2),
            depositCents: $depositCents,
            amountRemainingCents: $amountRemainingCents,
            currency: $property->currency ?? 'EGP',
            minStayRequired: $effectiveMinStay,
            propertyMinStay: $propertyDefaultMin,
            seasonalMinStayOverride: $maxSeasonalMinStay,
            satisfiesMinStay: $satisfiesMinStay
        );
    }

    /**
     * Calculate required upfront deposit in cents.
     */
    public function calculateDepositCents(Property $property, int $totalCents): int
    {
        if ($property->payment_requirement === 'full') {
            return $totalCents;
        }

        if ($property->deposit_fixed_cents && $property->deposit_fixed_cents > 0) {
            return min((int) $property->deposit_fixed_cents, $totalCents);
        }

        if ($property->deposit_percentage && $property->deposit_percentage > 0) {
            return (int) round($totalCents * ($property->deposit_percentage / 100));
        }

        return $totalCents;
    }
}
