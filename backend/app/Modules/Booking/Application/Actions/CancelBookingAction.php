<?php

declare(strict_types=1);

namespace App\Modules\Booking\Application\Actions;

use App\Models\Booking;
use App\Models\User;
use App\Modules\Booking\Domain\Enums\BookingStatus;
use App\Modules\Booking\Domain\Services\BookingStateMachine;

class CancelBookingAction
{
    public function __construct(
        private readonly BookingStateMachine $stateMachine
    ) {}

    public function execute(Booking $booking, string $reason, ?int $refundAmountCents = 0, ?User $actor = null): void
    {
        $this->stateMachine->transition(
            booking: $booking,
            targetStatus: BookingStatus::CANCELLED,
            actor: $actor,
            context: [
                'reason' => $reason,
                'refund_amount_cents' => $refundAmountCents ?? 0,
            ]
        );
    }
}
