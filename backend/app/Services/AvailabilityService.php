<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\AvailabilityBlock;
use App\Models\Property;
use App\Modules\Availability\Application\Actions\CreateAvailabilityBlockAction;
use App\Modules\Availability\Application\Actions\LockAndValidateAvailabilityAction;
use App\Modules\Availability\Application\Queries\CheckPropertyAvailabilityQuery;
use App\Modules\Availability\Application\Queries\FilterAvailablePropertiesQuery;
use App\Modules\Availability\Application\Queries\GetUnavailableDatesQuery;
use Carbon\Carbon;

/**
 * Availability Service (Backward-compatibility adapter delegating to Modular Availability domain).
 */
class AvailabilityService
{
    public const BLOCKING_BOOKING_STATUSES = CheckPropertyAvailabilityQuery::BLOCKING_BOOKING_STATUSES;

    public function __construct(
        private readonly ?CheckPropertyAvailabilityQuery $checkQuery = null,
        private readonly ?LockAndValidateAvailabilityAction $lockAction = null,
        private readonly ?CreateAvailabilityBlockAction $createBlockAction = null,
        private readonly ?GetUnavailableDatesQuery $unavailableDatesQuery = null,
        private readonly ?FilterAvailablePropertiesQuery $filterAvailableQuery = null,
    ) {}

    private function getCheckQuery(): CheckPropertyAvailabilityQuery
    {
        return $this->checkQuery ?? app(CheckPropertyAvailabilityQuery::class);
    }

    private function getLockAction(): LockAndValidateAvailabilityAction
    {
        return $this->lockAction ?? app(LockAndValidateAvailabilityAction::class);
    }

    private function getCreateBlockAction(): CreateAvailabilityBlockAction
    {
        return $this->createBlockAction ?? app(CreateAvailabilityBlockAction::class);
    }

    private function getUnavailableDatesQuery(): GetUnavailableDatesQuery
    {
        return $this->unavailableDatesQuery ?? app(GetUnavailableDatesQuery::class);
    }

    private function getFilterAvailableQuery(): FilterAvailablePropertiesQuery
    {
        return $this->filterAvailableQuery ?? app(FilterAvailablePropertiesQuery::class);
    }

    /**
     * Quick boolean check if a property is available for a date range.
     */
    public function isAvailable(
        Property $property,
        Carbon $checkIn,
        Carbon $checkOut,
        ?int $excludeBookingId = null
    ): bool {
        $result = $this->getCheckQuery()->execute($property, $checkIn, $checkOut, $excludeBookingId);
        return $result->isAvailable;
    }

    /**
     * Detailed availability evaluation returning diagnostic reasons for availability status.
     */
    public function checkAvailabilityDetails(
        Property $property,
        Carbon $checkIn,
        Carbon $checkOut,
        ?int $excludeBookingId = null
    ): array {
        $result = $this->getCheckQuery()->execute($property, $checkIn, $checkOut, $excludeBookingId);
        return $result->toArray();
    }

    /**
     * Lock property and validate availability in a database transaction to prevent race conditions.
     * Throws InvalidArgumentException / DomainException if unavailable.
     */
    public function lockAndValidateForBooking(
        Property $property,
        Carbon $checkIn,
        Carbon $checkOut,
        int $guests,
        ?int $excludeBookingId = null
    ): void {
        $this->getLockAction()->execute($property, $checkIn, $checkOut, $guests, $excludeBookingId);
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
        return $this->getCreateBlockAction()->execute($property, $startDate, $endDate, $status, $reason, $userId);
    }

    /**
     * Return all unavailable dates in a given window for calendar display.
     */
    public function getUnavailableDateMap(Property $property, Carbon $from, Carbon $to): array
    {
        return $this->getUnavailableDatesQuery()->execute($property, $from, $to);
    }

    /**
     * Batch filter available properties for search catalogs.
     */
    public function filterAvailablePropertyIds(iterable $candidateIds, Carbon $checkIn, Carbon $checkOut): array
    {
        return $this->getFilterAvailableQuery()->execute($candidateIds, $checkIn, $checkOut);
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
