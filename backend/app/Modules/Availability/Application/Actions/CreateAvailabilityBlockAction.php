<?php

declare(strict_types=1);

namespace App\Modules\Availability\Application\Actions;

use App\Models\AvailabilityBlock;
use App\Models\Property;
use Carbon\Carbon;
use InvalidArgumentException;

class CreateAvailabilityBlockAction
{
    /**
     * Create a manual availability block for owner use, maintenance, or administrative holds.
     */
    public function execute(
        Property $property,
        Carbon $startDate,
        Carbon $endDate,
        string $status = 'blocked',
        ?string $reason = null,
        ?int $userId = null
    ): AvailabilityBlock {
        if ($startDate->gte($endDate)) {
            throw new InvalidArgumentException('End date must be after start date.');
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
}
