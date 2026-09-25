<?php

declare(strict_types=1);

namespace App\Modules\Availability\Application\Actions;

use App\Models\Property;
use App\Modules\Availability\Application\Queries\CheckPropertyAvailabilityQuery;
use App\Shared\Domain\Exceptions\BookingUnavailableException;
use App\Shared\Domain\Exceptions\InvalidBookingDatesException;
use App\Shared\Domain\Exceptions\MaximumGuestsExceededException;
use Carbon\Carbon;
use InvalidArgumentException;

class LockAndValidateAvailabilityAction
{
    public function __construct(
        private readonly CheckPropertyAvailabilityQuery $availabilityQuery
    ) {}

    /**
     * Lock property and validate availability in a database transaction to prevent race conditions.
     * Throws InvalidArgumentException / DomainException if unavailable.
     */
    public function execute(
        Property $property,
        Carbon $checkIn,
        Carbon $checkOut,
        int $guests,
        ?int $excludeBookingId = null
    ): void {
        // Enforce guest capacity
        if ($guests > $property->max_guests) {
            throw new MaximumGuestsExceededException(
                "Maximum allowable guests for {$property->title_en} is {$property->max_guests}."
            );
        }

        $nights = $checkIn->diffInDays($checkOut);

        // Enforce stay duration limits
        if ($nights <= 0) {
            throw new InvalidBookingDatesException('Check-out must be after check-in.');
        }

        if ($property->max_stay_nights && $nights > $property->max_stay_nights) {
            throw new InvalidArgumentException("Maximum stay length is {$property->max_stay_nights} nights.");
        }

        // Concurrency safeguard: acquire pessimistic lock on the parent property row if inside transaction
        Property::where('id', $property->id)->lockForUpdate()->first();

        $availability = $this->availabilityQuery->execute($property, $checkIn, $checkOut, $excludeBookingId);

        if (! $availability->isAvailable) {
            throw new BookingUnavailableException((string) $availability->reason);
        }
    }
}
