<?php

declare(strict_types=1);

namespace App\Modules\Availability\Application\Queries;

use App\Models\AvailabilityBlock;
use App\Models\Booking;
use App\Models\Property;
use Carbon\Carbon;

class GetUnavailableDatesQuery
{
    /**
     * Return all unavailable dates in a given window for calendar display.
     * Maps each date string to its unavailability reason.
     *
     * @return array<string, array{status: string, booking_reference?: string, reason?: ?string}>
     */
    public function execute(Property $property, Carbon $from, Carbon $to): array
    {
        $map = [];

        // Active Bookings
        $bookings = Booking::where('bookable_type', Property::class)
            ->where('bookable_id', $property->id)
            ->whereIn('status', CheckPropertyAvailabilityQuery::BLOCKING_BOOKING_STATUSES)
            ->whereDate('check_in', '<', $to->toDateString())
            ->whereDate('check_out', '>', $from->toDateString())
            ->get(['check_in', 'check_out', 'status', 'reference']);

        foreach ($bookings as $booking) {
            $current = Carbon::parse($booking->check_in);
            $end = Carbon::parse($booking->check_out);
            while ($current->lt($end)) {
                $map[$current->toDateString()] = [
                    'status' => 'booked',
                    'booking_reference' => $booking->reference,
                ];
                $current->addDay();
            }
        }

        // Manual Blocks
        $blocks = AvailabilityBlock::where('property_id', $property->id)
            ->whereDate('start_date', '<', $to->toDateString())
            ->whereDate('end_date', '>', $from->toDateString())
            ->get(['start_date', 'end_date', 'status', 'reason']);

        foreach ($blocks as $block) {
            $current = Carbon::parse($block->start_date);
            $end = Carbon::parse($block->end_date);
            while ($current->lt($end)) {
                $map[$current->toDateString()] = [
                    'status' => $block->status, // 'blocked', 'maintenance', 'owner_use'
                    'reason' => $block->reason,
                ];
                $current->addDay();
            }
        }

        return $map;
    }
}
