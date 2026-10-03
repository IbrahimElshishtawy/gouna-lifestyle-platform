<?php

declare(strict_types=1);

namespace App\Modules\Booking\Application\Actions;

use App\Models\Booking;
use App\Modules\Booking\Domain\Enums\BookingStatus;
use App\Modules\Booking\Domain\Services\BookingStateMachine;
use Illuminate\Support\Facades\DB;

class RecordBookingPaymentAction
{
    public function __construct(
        private readonly BookingStateMachine $stateMachine
    ) {}

    public function execute(Booking $booking, int $amountCents, string $type = 'payment'): void
    {
        DB::transaction(function () use ($booking, $amountCents) {
            $booking->increment('amount_paid_cents', $amountCents);
            $booking->amount_remaining_cents = max(0, $booking->total_cents - $booking->amount_paid_cents);

            $shouldConfirm = false;
            if ($booking->amount_paid_cents >= $booking->total_cents) {
                $booking->payment_status = 'paid';
                if (in_array($booking->status, ['draft', 'pending', 'awaiting_payment', 'partially_paid', 'payment_processing'], true)) {
                    $shouldConfirm = true;
                }
            } elseif ($booking->amount_paid_cents > 0) {
                $booking->payment_status = 'partially_paid';
                if (in_array($booking->status, ['draft', 'pending', 'awaiting_payment', 'payment_processing'], true)) {
                    $shouldConfirm = true; // Confirmed with deposit
                }
            }

            $booking->save();

            if ($shouldConfirm) {
                $this->stateMachine->transition(
                    booking: $booking,
                    targetStatus: BookingStatus::CONFIRMED,
                    context: ['payment_recorded' => $amountCents]
                );
            }
        });
    }
}
