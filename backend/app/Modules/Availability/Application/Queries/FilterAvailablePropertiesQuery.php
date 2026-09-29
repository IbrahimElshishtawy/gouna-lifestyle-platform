<?php

declare(strict_types=1);

namespace App\Modules\Availability\Application\Queries;

use App\Models\AvailabilityBlock;
use App\Models\Booking;
use App\Models\Property;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class FilterAvailablePropertiesQuery
{
    /**
     * Batch-filters property IDs to only those that are available between checkIn and checkOut.
     * Executes in 2 single set-based queries instead of N individual queries.
     *
     * @param array<int>|Collection<int, int> $candidateIds
     * @return array<int> Available Property IDs
     */
    public function execute(array|Collection $candidateIds, Carbon $checkIn, Carbon $checkOut): array
    {
        $candidateIdsArray = $candidateIds instanceof Collection ? $candidateIds->all() : $candidateIds;
        if (empty($candidateIdsArray)) {
            return [];
        }

        $checkInStr = $checkIn->toDateString();
        $checkOutStr = $checkOut->toDateString();

        // Find all property IDs that have conflicting active bookings
        $bookedPropertyIds = Booking::where('bookable_type', Property::class)
            ->whereIn('bookable_id', $candidateIdsArray)
            ->whereIn('status', CheckPropertyAvailabilityQuery::BLOCKING_BOOKING_STATUSES)
            ->whereDate('check_in', '<', $checkOutStr)
            ->whereDate('check_out', '>', $checkInStr)
            ->pluck('bookable_id')
            ->unique()
            ->all();

        // Find all property IDs that have manual availability blocks
        $blockedPropertyIds = AvailabilityBlock::whereIn('property_id', $candidateIdsArray)
            ->whereDate('start_date', '<', $checkOutStr)
            ->whereDate('end_date', '>', $checkInStr)
            ->pluck('property_id')
            ->unique()
            ->all();

        $excludedIds = array_flip(array_merge($bookedPropertyIds, $blockedPropertyIds));

        return array_values(array_filter(
            $candidateIdsArray,
            fn($id) => ! isset($excludedIds[$id])
        ));
    }
}
