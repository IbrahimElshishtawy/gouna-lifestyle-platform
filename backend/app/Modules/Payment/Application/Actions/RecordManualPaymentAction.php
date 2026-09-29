<?php

declare(strict_types=1);

namespace App\Modules\Payment\Application\Actions;

use App\Models\Booking;
use App\Models\PaymentTransaction;
use App\Modules\Booking\Application\Actions\RecordBookingPaymentAction;
use DateTimeInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class RecordManualPaymentAction
{
    public function __construct(
        private readonly RecordBookingPaymentAction $recordBookingPaymentAction
    ) {}

    public function execute(
        Booking $booking,
        int $amountCents,
        string $paymentMethodCode,
        string $reference,
        DateTimeInterface $paymentDate,
        int $adminUserId,
        ?string $notes = null
    ): PaymentTransaction {
        return DB::transaction(function () use (
            $booking, $amountCents, $paymentMethodCode, $reference, $paymentDate, $adminUserId, $notes
        ) {
            $transaction = PaymentTransaction::create([
                'transaction_id' => 'MANUAL-' . Str::upper(Str::random(12)),
                'booking_id' => $booking->id,
                'customer_id' => $booking->customer_id,
                'payment_method_id' => $booking->payment_method_id,
                'amount_cents' => $amountCents,
                'currency' => $booking->currency,
                'type' => 'payment',
                'status' => 'completed',
                'gateway_provider' => $paymentMethodCode,
                'manual_reference' => $reference,
                'manual_payment_date' => $paymentDate,
                'manual_notes' => $notes,
                'recorded_by' => $adminUserId,
                'completed_at' => now(),
            ]);

            $this->recordBookingPaymentAction->execute($booking, $amountCents);

            return $transaction;
        });
    }
}
