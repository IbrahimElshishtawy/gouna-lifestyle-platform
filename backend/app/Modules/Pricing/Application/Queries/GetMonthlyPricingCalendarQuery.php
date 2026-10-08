<?php

declare(strict_types=1);

namespace App\Modules\Pricing\Application\Queries;

use App\Models\Property;
use App\Models\SeasonalPrice;
use Carbon\Carbon;

class GetMonthlyPricingCalendarQuery
{
    /**
     * Generate daily calendar pricing matrix for a given month.
     * Pre-loads all active seasonal rules once for high performance.
     */
    public function execute(Property $property, int $year, int $month): array
    {
        $startOfMonth = Carbon::createFromDate($year, $month, 1)->startOfMonth();
        $endOfMonth = $startOfMonth->copy()->endOfMonth();

        $seasons = SeasonalPrice::where('is_active', true)
            ->where(function ($q) use ($property) {
                $q->where('property_id', $property->id);
                if ($property->parent_id) {
                    $q->orWhere('property_id', $property->parent_id);
                }
                $q->orWhereNull('property_id');
            })
            ->whereDate('start_date', '<=', $endOfMonth->toDateString())
            ->whereDate('end_date', '>=', $startOfMonth->toDateString())
            ->get();

        // Sort rules by Pricing Hierarchy (Section 25 of promit.md):
        // Tier 4: Date-specific Override (rule_type === 'override')
        // Tier 3: Unit-specific Rule (property_id === $property->id)
        // Tier 2: Property-level Rule (property_id === $property->parent_id)
        // Tier 1: Global Rule (property_id === null)
        $seasons = $seasons->sort(function (SeasonalPrice $a, SeasonalPrice $b) use ($property) {
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

        $calendar = [];
        $current = $startOfMonth->copy();

        while ($current->lte($endOfMonth)) {
            $dateStr = $current->toDateString();
            $dayName = $current->format('l');
            $winner = null;

            foreach ($seasons as $season) {
                if ($current->between($season->start_date, $season->end_date)) {
                    if (!empty($season->days_of_week) && is_array($season->days_of_week)) {
                        if (!in_array($dayName, $season->days_of_week, true)) {
                            continue;
                        }
                    }
                    $winner = $season;
                    break;
                }
            }

            $priceCents = $property->base_price_cents;
            if ($winner) {
                if ($winner->adjustment_type === 'percentage' && $winner->adjustment_percent) {
                    $priceCents = (int) round($property->base_price_cents * (1 + ((float) $winner->adjustment_percent / 100)));
                } else {
                    $priceCents = (int) $winner->price_cents;
                }
            }

            $calendar[$dateStr] = [
                'date' => $dateStr,
                'day' => (int) $current->format('j'),
                'day_of_week' => $current->format('D'),
                'price_cents' => (int) $priceCents,
                'price_formatted' => number_format($priceCents / 100),
                'season_name' => $winner ? $winner->name_en : 'Base Price',
                'seasonal_price_id' => $winner?->id,
                'rule_type' => $winner ? ($winner->rule_type ?? 'season') : 'base',
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
