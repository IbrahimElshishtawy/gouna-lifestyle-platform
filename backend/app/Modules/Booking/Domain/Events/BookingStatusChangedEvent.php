<?php

declare(strict_types=1);

namespace App\Modules\Booking\Domain\Events;

use App\Models\Booking;
use App\Models\User;
use App\Modules\Booking\Domain\Enums\BookingStatus;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BookingStatusChangedEvent implements ShouldDispatchAfterCommit
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly Booking $booking,
        public readonly BookingStatus $previousStatus,
        public readonly BookingStatus $newStatus,
        public readonly ?User $actor = null,
        public readonly array $context = [],
    ) {}
}
