<?php

declare(strict_types=1);

namespace App\Modules\Booking\Application\Actions;

use App\Models\Booking;

class CancelBookingAction
{
    public function execute(Booking $booking, string $reason, ?int $refundAmountCents = 0): void
    {
        $booking->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancellation_reason' => $reason,
            'refund_amount_cents' => $refundAmountCents ?? 0,
        ]);
    }
}
