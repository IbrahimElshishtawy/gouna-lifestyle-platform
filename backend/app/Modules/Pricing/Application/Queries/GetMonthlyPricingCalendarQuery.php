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
            ->orderByDesc('priority')
            ->orderByDesc('id')
            ->get();

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
