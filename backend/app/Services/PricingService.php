<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Property;
use App\Modules\Pricing\Application\Queries\AnalyzeSeasonalOverlapQuery;
use App\Modules\Pricing\Application\Queries\CalculateBookingQuoteQuery;
use App\Modules\Pricing\Application\Queries\GetMonthlyPricingCalendarQuery;
use Carbon\Carbon;

/**
 * Pricing Service (Backward-compatibility adapter delegating to Modular Pricing queries).
 */
class PricingService
{
    public function __construct(
        private readonly ?CalculateBookingQuoteQuery $calculateBookingQuoteQuery = null,
        private readonly ?AnalyzeSeasonalOverlapQuery $analyzeSeasonalOverlapQuery = null,
        private readonly ?GetMonthlyPricingCalendarQuery $getMonthlyPricingCalendarQuery = null,
    ) {}

    private function getQuoteQuery(): CalculateBookingQuoteQuery
    {
        return $this->calculateBookingQuoteQuery ?? app(CalculateBookingQuoteQuery::class);
    }

    private function getOverlapQuery(): AnalyzeSeasonalOverlapQuery
    {
        return $this->analyzeSeasonalOverlapQuery ?? app(AnalyzeSeasonalOverlapQuery::class);
    }

    private function getCalendarQuery(): GetMonthlyPricingCalendarQuery
    {
        return $this->getMonthlyPricingCalendarQuery ?? app(GetMonthlyPricingCalendarQuery::class);
    }

    /**
     * Calculate the nightly price for a specific date for a property.
     */
    public function getNightlyPriceCents(Property $property, Carbon $date): array
    {
        return $this->getQuoteQuery()->getNightlyPriceCents($property, $date);
    }

    /**
     * Calculate the complete pricing breakdown for a booking request.
     */
    public function calculateBooking(
        Property $property,
        Carbon $checkIn,
        Carbon $checkOut,
        int $guests = 1,
        ?string $promoCode = null
    ): array {
        $quoteDTO = $this->getQuoteQuery()->execute($property, $checkIn, $checkOut, $guests, $promoCode);
        return $quoteDTO->toArray();
    }

    /**
     * Calculate the required upfront deposit in cents.
     */
    public function calculateDepositCents(Property $property, int $totalCents): int
    {
        return $this->getQuoteQuery()->calculateDepositCents($property, $totalCents);
    }

    /**
     * Detect and analyze overlapping seasonal pricing rules for a property.
     */
    public function analyzeSeasonalOverlap(
        Property $property,
        Carbon $startDate,
        Carbon $endDate,
        int $priority,
        ?int $ignoreSeasonId = null
    ): array {
        return $this->getOverlapQuery()->execute($property, $startDate, $endDate, $priority, $ignoreSeasonId);
    }

    /**
     * Generate daily calendar pricing matrix for a given month.
     */
    public function getMonthlyPriceCalendar(Property $property, int $year, int $month): array
    {
        return $this->getCalendarQuery()->execute($property, $year, $month);
    }
}
