<?php

declare(strict_types=1);

namespace App\Modules\Pricing\Application\Queries;

use App\Models\Property;
use App\Models\SeasonalPrice;
use Carbon\Carbon;

class AnalyzeSeasonalOverlapQuery
{
    /**
     * Detect and analyze overlapping seasonal pricing rules for a property.
     */
    public function execute(
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
}
