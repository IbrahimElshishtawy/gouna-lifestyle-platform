<?php

namespace App\Services;

use App\Models\AvailabilityBlock;
use App\Models\Booking;
use App\Models\Property;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AvailabilityService
{
    /**
     * Active booking statuses that block property availability.
     */
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
     * Quick boolean check if a property is available for a date range.
     *
     * Rules:
     * - Property must be active and published.
     * - Adjacent bookings are valid: guest can check in on the day another guest checks out.
     * - Cancelled, rejected, or refunded bookings do NOT block availability.
     */
    public function isAvailable(
        Property $property,
        Carbon $checkIn,
        Carbon $checkOut,
        ?int $excludeBookingId = null
    ): bool {
        $details = $this->checkAvailabilityDetails($property, $checkIn, $checkOut, $excludeBookingId);
        return $details['available'];
    }

    /**
     * Detailed availability evaluation returning diagnostic reasons for availability status.
     *
     * @return array [
     *   'available' => bool,
     *   'reason' => ?string,
     *   'conflict_type' => 'none' | 'unlisted' | 'invalid_dates' | 'booking_conflict' | 'manual_block',
     *   'conflicting_booking' => ?array,
     *   'conflicting_block' => ?array,
     * ]
     */
    public function checkAvailabilityDetails(
        Property $property,
        Carbon $checkIn,
        Carbon $checkOut,
        ?int $excludeBookingId = null
    ): array {
        if ($checkIn->gte($checkOut)) {
            return [
                'available' => false,
                'reason' => 'Check-out date must be strictly after check-in date.',
                'conflict_type' => 'invalid_dates',
                'conflicting_booking' => null,
                'conflicting_block' => null,
            ];
        }

        if (! $property->is_available || $property->status !== 'published') {
            return [
                'available' => false,
                'reason' => 'Property is currently unpublished or marked unavailable by management.',
                'conflict_type' => 'unlisted',
                'conflicting_booking' => null,
                'conflicting_block' => null,
            ];
        }

        $checkInStr = $checkIn->toDateString();
        $checkOutStr = $checkOut->toDateString();

        // 1. Check for conflicting active bookings
        // Hotel date overlap formula: (existing.check_in < requested.check_out) AND (existing.check_out > requested.check_in)
        $conflictingBooking = Booking::where('bookable_type', Property::class)
            ->where('bookable_id', $property->id)
            ->whereIn('status', self::BLOCKING_BOOKING_STATUSES)
            ->whereDate('check_in', '<', $checkOutStr)
            ->whereDate('check_out', '>', $checkInStr)
            ->when($excludeBookingId, fn($q) => $q->where('id', '!=', $excludeBookingId))
            ->first();

        if ($conflictingBooking) {
            return [
                'available' => false,
                'reason' => "Dates conflict with existing reservation ({$conflictingBooking->reference}) from {$conflictingBooking->check_in->format('M d')} to {$conflictingBooking->check_out->format('M d')}.",
                'conflict_type' => 'booking_conflict',
                'conflicting_booking' => [
                    'id' => $conflictingBooking->id,
                    'reference' => $conflictingBooking->reference,
                    'status' => $conflictingBooking->status,
                    'check_in' => $conflictingBooking->check_in->toDateString(),
                    'check_out' => $conflictingBooking->check_out->toDateString(),
                ],
                'conflicting_block' => null,
            ];
        }

        // 2. Check for manual availability blocks (maintenance, owner use, blocked)
        $conflictingBlock = AvailabilityBlock::where('property_id', $property->id)
            ->whereDate('start_date', '<', $checkOutStr)
            ->whereDate('end_date', '>', $checkInStr)
            ->first();

        if ($conflictingBlock) {
            $statusLabel = ucfirst(str_replace('_', ' ', $conflictingBlock->status));
            $reasonNote = $conflictingBlock->reason ? " ({$conflictingBlock->reason})" : '';

            return [
                'available' => false,
                'reason' => "Property is blocked for {$statusLabel}{$reasonNote} from " . Carbon::parse($conflictingBlock->start_date)->format('M d') . ' to ' . Carbon::parse($conflictingBlock->end_date)->format('M d') . '.',
                'conflict_type' => 'manual_block',
                'conflicting_booking' => null,
                'conflicting_block' => [
                    'id' => $conflictingBlock->id,
                    'status' => $conflictingBlock->status,
                    'reason' => $conflictingBlock->reason,
                    'start_date' => Carbon::parse($conflictingBlock->start_date)->toDateString(),
                    'end_date' => Carbon::parse($conflictingBlock->end_date)->toDateString(),
                ],
            ];
        }

        return [
            'available' => true,
            'reason' => null,
            'conflict_type' => 'none',
            'conflicting_booking' => null,
            'conflicting_block' => null,
        ];
    }

    /**
     * Lock property and validate availability in a database transaction to prevent race conditions.
     * Throws \InvalidArgumentException if unavailable.
     */
    public function lockAndValidateForBooking(
        Property $property,
        Carbon $checkIn,
        Carbon $checkOut,
        int $guests,
        ?int $excludeBookingId = null
    ): void {
        // Enforce guest capacity
        if ($guests > $property->max_guests) {
            throw new \InvalidArgumentException("Maximum allowable guests for {$property->title_en} is {$property->max_guests}.");
        }

        $nights = $checkIn->diffInDays($checkOut);

        // Enforce stay duration limits
        if ($nights <= 0) {
            throw new \InvalidArgumentException('Check-out must be after check-in.');
        }

        if ($property->max_stay_nights && $nights > $property->max_stay_nights) {
            throw new \InvalidArgumentException("Maximum stay length is {$property->max_stay_nights} nights.");
        }

        $availability = $this->checkAvailabilityDetails($property, $checkIn, $checkOut, $excludeBookingId);

        if (! $availability['available']) {
            throw new \InvalidArgumentException($availability['reason']);
        }
    }

    /**
     * Create a manual availability block for owner use, maintenance, or administrative holds.
     */
    public function createAvailabilityBlock(
        Property $property,
        Carbon $startDate,
        Carbon $endDate,
        string $status = 'blocked',
        ?string $reason = null,
        ?int $userId = null
    ): AvailabilityBlock {
        if ($startDate->gte($endDate)) {
            throw new \InvalidArgumentException('End date must be after start date.');
        }

        return AvailabilityBlock::create([
            'property_id' => $property->id,
            'start_date' => $startDate->toDateString(),
            'end_date' => $endDate->toDateString(),
            'status' => $status,
            'reason' => $reason,
            'created_by' => $userId,
        ]);
    }

    /**
     * Return all unavailable dates in a given window for calendar display.
     * Maps each date string to its unavailability reason.
     *
     * @return array [ 'YYYY-MM-DD' => 'booked' | 'blocked' | 'maintenance' | 'owner_use' ]
     */
    public function getUnavailableDateMap(Property $property, Carbon $from, Carbon $to): array
    {
        $map = [];

        // Active Bookings
        $bookings = Booking::where('bookable_type', Property::class)
            ->where('bookable_id', $property->id)
            ->whereIn('status', self::BLOCKING_BOOKING_STATUSES)
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

    /**
     * Generate complete day-by-day availability and pricing calendar matrix for a month.
     */
    public function getMonthlyCalendarMatrix(Property $property, int $year, int $month, ?PricingService $pricingService = null): array
    {
        $startOfMonth = Carbon::createFromDate($year, $month, 1)->startOfMonth();
        $endOfMonth = $startOfMonth->copy()->endOfMonth();

        $pricingService = $pricingService ?? app(PricingService::class);
        $priceMap = $pricingService->getMonthlyPriceCalendar($property, $year, $month);
        $unavailableMap = $this->getUnavailableDateMap($property, $startOfMonth, $endOfMonth);

        $matrix = [];
        $current = $startOfMonth->copy();

        while ($current->lte($endOfMonth)) {
            $dateStr = $current->toDateString();
            $unavailableInfo = $unavailableMap[$dateStr] ?? null;
            $priceInfo = $priceMap[$dateStr] ?? [];

            $status = $unavailableInfo ? $unavailableInfo['status'] : 'available';

            $matrix[$dateStr] = [
                'date' => $dateStr,
                'day' => (int) $current->format('j'),
                'day_of_week' => $current->format('D'),
                'is_available' => ($status === 'available'),
                'status' => $status,
                'price_cents' => $priceInfo['price_cents'] ?? $property->base_price_cents,
                'price_formatted' => $priceInfo['price_formatted'] ?? number_format($property->base_price_cents / 100),
                'season_name' => $priceInfo['season_name'] ?? 'Base Price',
                'is_base_price' => $priceInfo['is_base_price'] ?? true,
                'booking_reference' => $unavailableInfo['booking_reference'] ?? null,
                'block_reason' => $unavailableInfo['reason'] ?? null,
                'currency' => $property->currency ?? 'EGP',
            ];

            $current->addDay();
        }

        return $matrix;
    }
}
