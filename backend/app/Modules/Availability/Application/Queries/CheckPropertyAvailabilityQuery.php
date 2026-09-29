<?php

declare(strict_types=1);

namespace App\Modules\Availability\Application\Queries;

use App\Models\AvailabilityBlock;
use App\Models\Booking;
use App\Models\Property;
use App\Modules\Availability\Application\DTOs\AvailabilityCheckResultDTO;
use Carbon\Carbon;

class CheckPropertyAvailabilityQuery
{
    public const BLOCKING_BOOKING_STATUSES = [
        'pending',
        'awaiting_payment',
        'payment_processing',
        'partially_paid',
        'paid',
        'confirmed',
        'completed',
    ];

    /**
     * Detailed availability evaluation returning diagnostic reasons for availability status.
     */
    public function execute(
        Property $property,
        Carbon $checkIn,
        Carbon $checkOut,
        ?int $excludeBookingId = null
    ): AvailabilityCheckResultDTO {
        if ($checkIn->gte($checkOut)) {
            return new AvailabilityCheckResultDTO(
                isAvailable: false,
                reason: 'Check-out date must be strictly after check-in date.',
                conflictType: 'invalid_dates',
            );
        }

        if (! $property->is_available || $property->status !== 'published') {
            return new AvailabilityCheckResultDTO(
                isAvailable: false,
                reason: 'Property is currently unpublished or marked unavailable by management.',
                conflictType: 'unlisted',
            );
        }

        $checkInStr = $checkIn->toDateString();
        $checkOutStr = $checkOut->toDateString();

        // 1. Check for conflicting active bookings (hotel date overlap formula: check_in < checkOut AND check_out > checkIn)
        $conflictingBooking = Booking::where('bookable_type', Property::class)
            ->where('bookable_id', $property->id)
            ->whereIn('status', self::BLOCKING_BOOKING_STATUSES)
            ->whereDate('check_in', '<', $checkOutStr)
            ->whereDate('check_out', '>', $checkInStr)
            ->when($excludeBookingId, fn($q) => $q->where('id', '!=', $excludeBookingId))
            ->first();

        if ($conflictingBooking) {
            return new AvailabilityCheckResultDTO(
                isAvailable: false,
                reason: "Dates conflict with existing reservation ({$conflictingBooking->reference}) from {$conflictingBooking->check_in->format('M d')} to {$conflictingBooking->check_out->format('M d')}.",
                conflictType: 'booking_conflict',
                conflictingBooking: [
                    'id' => $conflictingBooking->id,
                    'reference' => $conflictingBooking->reference,
                    'status' => $conflictingBooking->status,
                    'check_in' => $conflictingBooking->check_in->toDateString(),
                    'check_out' => $conflictingBooking->check_out->toDateString(),
                ]
            );
        }

        // 2. Check for manual availability blocks (maintenance, owner use, blocked)
        $conflictingBlock = AvailabilityBlock::where('property_id', $property->id)
            ->whereDate('start_date', '<', $checkOutStr)
            ->whereDate('end_date', '>', $checkInStr)
            ->first();

        if ($conflictingBlock) {
            $statusLabel = ucfirst(str_replace('_', ' ', $conflictingBlock->status));
            $reasonNote = $conflictingBlock->reason ? " ({$conflictingBlock->reason})" : '';

            return new AvailabilityCheckResultDTO(
                isAvailable: false,
                reason: "Property is blocked for {$statusLabel}{$reasonNote} from " . Carbon::parse($conflictingBlock->start_date)->format('M d') . ' to ' . Carbon::parse($conflictingBlock->end_date)->format('M d') . '.',
                conflictType: 'manual_block',
                conflictingBlock: [
                    'id' => $conflictingBlock->id,
                    'status' => $conflictingBlock->status,
                    'reason' => $conflictingBlock->reason,
                    'start_date' => Carbon::parse($conflictingBlock->start_date)->toDateString(),
                    'end_date' => Carbon::parse($conflictingBlock->end_date)->toDateString(),
                ]
            );
        }

        return new AvailabilityCheckResultDTO(
            isAvailable: true,
            reason: null,
            conflictType: 'none',
        );
    }
}
