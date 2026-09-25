<?php

declare(strict_types=1);

namespace App\Shared\Domain\ValueObjects;

use Carbon\Carbon;
use Carbon\CarbonPeriod;
use InvalidArgumentException;
use JsonSerializable;
use Stringable;

/**
 * Value Object representing a check-in and check-out booking date range.
 * Hotel standard date rule: Check-out date is not charged as an overnight stay.
 */
final class DateRange implements JsonSerializable, Stringable
{
    private readonly Carbon $checkIn;
    private readonly Carbon $checkOut;
    private readonly int $nights;

    public function __construct(Carbon|string $checkIn, Carbon|string $checkOut)
    {
        $start = $checkIn instanceof Carbon ? $checkIn->copy()->startOfDay() : Carbon::parse($checkIn)->startOfDay();
        $end = $checkOut instanceof Carbon ? $checkOut->copy()->startOfDay() : Carbon::parse($checkOut)->startOfDay();

        if ($start->gte($end)) {
            throw new InvalidArgumentException('Check-out date must be strictly after check-in date.');
        }

        $this->checkIn = $start;
        $this->checkOut = $end;
        $this->nights = (int) $start->diffInDays($end);
    }

    public static function create(Carbon|string $checkIn, Carbon|string $checkOut): self
    {
        return new self($checkIn, $checkOut);
    }

    public function getCheckIn(): Carbon
    {
        return $this->checkIn->copy();
    }

    public function getCheckOut(): Carbon
    {
        return $this->checkOut->copy();
    }

    public function getCheckInDateString(): string
    {
        return $this->checkIn->toDateString();
    }

    public function getCheckOutDateString(): string
    {
        return $this->checkOut->toDateString();
    }

    public function getNights(): int
    {
        return $this->nights;
    }

    /**
     * Checks if this date range overlaps with another date range.
     * Adjacent stays (same day check-out / check-in) do NOT overlap.
     */
    public function overlapsWith(self $other): bool
    {
        return $this->checkIn->lt($other->checkOut) && $this->checkOut->gt($other->checkIn);
    }

    /**
     * Checks if a given date falls strictly within the charged nights (checkIn <= date < checkOut).
     */
    public function containsNight(Carbon|string $date): bool
    {
        $d = $date instanceof Carbon ? $date->copy()->startOfDay() : Carbon::parse($date)->startOfDay();
        return $d->gte($this->checkIn) && $d->lt($this->checkOut);
    }

    /**
     * Iterate each overnight stay from checkIn up to (checkOut - 1 day).
     *
     * @return CarbonPeriod
     */
    public function getNightsPeriod(): CarbonPeriod
    {
        return CarbonPeriod::create(
            $this->checkIn,
            $this->checkOut->copy()->subDay()
        );
    }

    public function jsonSerialize(): array
    {
        return [
            'check_in' => $this->getCheckInDateString(),
            'check_out' => $this->getCheckOutDateString(),
            'nights' => $this->nights,
        ];
    }

    public function __toString(): string
    {
        return "{$this->getCheckInDateString()} to {$this->getCheckOutDateString()} ({$this->nights} nights)";
    }
}
