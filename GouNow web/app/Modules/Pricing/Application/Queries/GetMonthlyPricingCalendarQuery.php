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
                    $winner = $season;
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
