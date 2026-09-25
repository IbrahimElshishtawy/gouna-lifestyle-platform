<?php

namespace App\Services;

use App\Models\Discount;
use App\Models\Property;
use App\Models\SeasonalPrice;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Support\Collection;

class PricingService
{
    /**
     * Calculate the nightly price for a specific date for a property.
     * Uses the highest-priority active seasonal rule that covers the date.
     * In case of identical priority, the most recently updated rule takes precedence.
     * Falls back to base_price_cents if no active seasonal rule applies.
     *
     * @return array [
     *   'price_cents' => int,
     *   'seasonal_price_id' => ?int,
     *   'season_name' => ?string,
     *   'is_base_price' => bool,
     *   'priority' => int,
     *   'min_stay_nights' => ?int
     * ]
     */
    public function getNightlyPriceCents(Property $property, Carbon $date): array
    {
        $dateStr = $date->toDateString();

        // Load all active seasonal rules covering this specific night, ordered by priority DESC
        $seasons = SeasonalPrice::where('property_id', $property->id)
            ->where('is_active', true)
            ->whereDate('start_date', '<=', $dateStr)
            ->whereDate('end_date', '>=', $dateStr)
            ->orderByDesc('priority')
            ->orderByDesc('id')
            ->get();

        if ($seasons->isNotEmpty()) {
            $winner = $seasons->first(); // Highest priority wins
            return [
                'price_cents' => (int) $winner->price_cents,
                'seasonal_price_id' => $winner->id,
                'season_name' => $winner->name_en,
                'is_base_price' => false,
                'priority' => (int) $winner->priority,
                'min_stay_nights' => $winner->min_stay_nights ? (int) $winner->min_stay_nights : null,
            ];
        }

        return [
            'price_cents' => (int) $property->base_price_cents,
            'seasonal_price_id' => null,
            'season_name' => null,
            'is_base_price' => true,
            'priority' => 0,
            'min_stay_nights' => null,
        ];
    }

    /**
     * Calculate the complete pricing breakdown for a booking request.
     *
     * Standard Hotel Date Rule (Master Plan Section 188):
     * Number of nights = checkOut - checkIn.
     * Charges nights: checkIn, checkIn+1, ..., checkOut-1.
     * Check-out date is NOT charged as an overnight stay.
     *
     * Returns:
     * - nights: int
     * - nightly_prices: array of each night's detailed calculation
     * - subtotal_cents: int
     * - cleaning_fee_cents: int
     * - service_fee_cents: int
     * - tax_cents: int
     * - discount_cents: int
     * - total_cents: int
     * - currency: string (EGP)
     * - min_stay_required: int (effective minimum stay across the window)
     * - satisfies_min_stay: bool
     */
    public function calculateBooking(
        Property $property,
        Carbon $checkIn,
        Carbon $checkOut,
        int $guests = 1,
        ?string $promoCode = null
    ): array {
        $nights = $checkIn->diffInDays($checkOut);

        if ($nights <= 0) {
            throw new \InvalidArgumentException('Check-out date must be at least 1 day after check-in date.');
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

            // Track any seasonal minimum stay overrides
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
                // Check minimum booking requirements
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

        return [
            'nights' => (int) $nights,
            'nightly_prices' => $nightlyPrices,
            'subtotal_cents' => $subtotalCents,
            'subtotal_formatted' => number_format($subtotalCents / 100, 2),
            'cleaning_fee_cents' => $cleaningFeeCents,
            'service_fee_cents' => $serviceFeeCents,
            'discount_cents' => $discountCents,
            'discount_id' => $discountId,
            'promo_code' => $appliedPromoCode,
            'tax_percentage' => $taxPercentage,
            'tax_cents' => $taxCents,
            'total_cents' => $totalCents,
            'total_formatted' => number_format($totalCents / 100, 2),
            'deposit_cents' => $depositCents,
            'amount_remaining_cents' => $amountRemainingCents,
            'currency' => $property->currency ?? 'EGP',
            'min_stay_required' => $effectiveMinStay,
            'property_min_stay' => $propertyDefaultMin,
            'seasonal_min_stay_override' => $maxSeasonalMinStay,
            'satisfies_min_stay' => $satisfiesMinStay,
        ];
    }

    /**
     * Calculate the required upfront deposit in cents.
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

        return $totalCents; // Default to full if not configured
    }

    /**
     * Detect and analyze overlapping seasonal pricing rules for a property (Section 13).
     *
     * Informs the admin whether the new rule will OVERRIDE an existing rule (higher priority),
     * will be SUBORDINATED by an existing rule (lower priority), or has EQUAL priority.
     *
     * @return array [
     *   'has_overlap' => bool,
     *   'conflicts_count' => int,
     *   'overlaps' => array [
     *      'season_id' => int,
     *      'season_name' => string,
     *      'existing_priority' => int,
     *      'new_priority' => int,
     *      'overlap_start' => string,
     *      'overlap_end' => string,
     *      'outcome' => 'new_rule_wins' | 'existing_rule_wins' | 'equal_priority',
     *      'message' => string
     *   ]
     * ]
     */
    public function analyzeSeasonalOverlap(
        Property $property,
        Carbon $startDate,
        Carbon $endDate,
        int $priority,
        ?int $ignoreSeasonId = null
    ): array {
        $existingSeasons = SeasonalPrice::where('property_id', $property->id)
            ->where('is_active', true)
            ->whereDate('start_date', '<=', $endDate->toDateString())
            ->whereDate('end_date', '>=', $startDate->toDateString())
            ->when($ignoreSeasonId, fn($q) => $q->where('id', '!=', $ignoreSeasonId))
            ->orderByDesc('priority')
            ->get();

        if ($existingSeasons->isEmpty()) {
            return [
                'has_overlap' => false,
                'conflicts_count' => 0,
                'overlaps' => [],
            ];
        }

        $overlaps = [];

        foreach ($existingSeasons as $season) {
            // Compute overlapping date boundary
            $overlapStart = $startDate->max(Carbon::parse($season->start_date));
            $overlapEnd = $endDate->min(Carbon::parse($season->end_date));

            if ($priority > $season->priority) {
                $outcome = 'new_rule_wins';
                $message = "New rule (Priority {$priority}) will OVERRIDE '{$season->name_en}' (Priority {$season->priority}) from {$overlapStart->format('M d, Y')} to {$overlapEnd->format('M d, Y')}.";
            } elseif ($priority < $season->priority) {
                $outcome = 'existing_rule_wins';
                $message = "Existing rule '{$season->name_en}' (Priority {$season->priority}) will PREVAIL over new rule (Priority {$priority}) from {$overlapStart->format('M d, Y')} to {$overlapEnd->format('M d, Y')}.";
            } else {
                $outcome = 'equal_priority';
                $message = "Warning: Both rules share equal Priority {$priority} from {$overlapStart->format('M d, Y')} to {$overlapEnd->format('M d, Y')}. Higher ID rule will apply.";
            }

            $overlaps[] = [
                'season_id' => $season->id,
                'season_name' => $season->name_en,
                'existing_priority' => (int) $season->priority,
                'new_priority' => (int) $priority,
                'overlap_start' => $overlapStart->toDateString(),
                'overlap_end' => $overlapEnd->toDateString(),
                'existing_price_cents' => (int) $season->price_cents,
                'outcome' => $outcome,
                'message' => $message,
            ];
        }

        return [
            'has_overlap' => true,
            'conflicts_count' => count($overlaps),
            'overlaps' => $overlaps,
        ];
    }

    /**
     * Generate daily calendar pricing matrix for a given month.
     * Pre-loads all active seasonal rules once for high performance.
     */
    public function getMonthlyPriceCalendar(Property $property, int $year, int $month): array
    {
        $startOfMonth = Carbon::createFromDate($year, $month, 1)->startOfMonth();
        $endOfMonth = $startOfMonth->copy()->endOfMonth();

        // Single query for all relevant seasonal rules
        $seasons = SeasonalPrice::where('property_id', $property->id)
            ->where('is_active', true)
            ->whereDate('start_date', '<=', $endOfMonth->toDateString())
            ->whereDate('end_date', '>=', $startOfMonth->toDateString())
            ->orderByDesc('priority')
            ->orderByDesc('id')
            ->get();

        $calendar = [];
        $current = $startOfMonth->copy();

        while ($current->lte($endOfMonth)) {
            $dateStr = $current->toDateString();
            $winner = null;

            foreach ($seasons as $season) {
                if ($current->between($season->start_date, $season->end_date)) {
                    $winner = $season; // First match = highest priority
                    break;
                }
            }

            $priceCents = $winner ? $winner->price_cents : $property->base_price_cents;

            $calendar[$dateStr] = [
                'date' => $dateStr,
                'day' => (int) $current->format('j'),
                'day_of_week' => $current->format('D'),
                'price_cents' => (int) $priceCents,
                'price_formatted' => number_format($priceCents / 100),
                'season_name' => $winner ? $winner->name_en : 'Base Price',
                'seasonal_price_id' => $winner?->id,
                'priority' => $winner ? (int) $winner->priority : 0,
                'min_stay_nights' => $winner?->min_stay_nights ?? $property->min_stay_nights ?? 1,
                'is_base_price' => ($winner === null),
                'currency' => $property->currency ?? 'EGP',
            ];

            $current->addDay();
        }

        return $calendar;
    }
}
