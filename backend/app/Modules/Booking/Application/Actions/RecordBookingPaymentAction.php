<?php

declare(strict_types=1);

namespace App\Modules\Booking\Application\Actions;

use App\Models\Booking;
use Illuminate\Support\Facades\DB;

class RecordBookingPaymentAction
{
    public function execute(Booking $booking, int $amountCents, string $type = 'payment'): void
    {
        DB::transaction(function () use ($booking, $amountCents, $type) {
            $booking->increment('amount_paid_cents', $amountCents);
            $booking->amount_remaining_cents = max(0, $booking->total_cents - $booking->amount_paid_cents);

            if ($booking->amount_paid_cents >= $booking->total_cents) {
                $booking->payment_status = 'paid';
                if (in_array($booking->status, ['draft', 'pending', 'awaiting_payment', 'partially_paid', 'payment_processing'])) {
                    $booking->status = 'confirmed';
                }
            } elseif ($booking->amount_paid_cents > 0) {
                $booking->payment_status = 'partially_paid';
                if (in_array($booking->status, ['draft', 'pending', 'awaiting_payment', 'payment_processing'])) {
                    $booking->status = 'confirmed'; // Confirmed with deposit
                }
            }

            $booking->save();
        });
    }
}
