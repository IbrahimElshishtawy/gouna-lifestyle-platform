<?php

declare(strict_types=1);

namespace App\Modules\Availability\Application\DTOs;

use JsonSerializable;

final class AvailabilityCheckResultDTO implements JsonSerializable
{
    public function __construct(
        public readonly bool $isAvailable,
        public readonly ?string $reason = null,
        public readonly string $conflictType = 'none', // 'none' | 'unlisted' | 'invalid_dates' | 'booking_conflict' | 'manual_block'
        public readonly ?array $conflictingBooking = null,
        public readonly ?array $conflictingBlock = null,
    ) {}

    public function toArray(): array
    {
        return [
            'available' => $this->isAvailable,
            'reason' => $this->reason,
            'conflict_type' => $this->conflictType,
            'conflicting_booking' => $this->conflictingBooking,
            'conflicting_block' => $this->conflictingBlock,
        ];
    }

    public function jsonSerialize(): array
    {
        return $this->toArray();
    }
}
