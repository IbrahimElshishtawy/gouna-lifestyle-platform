<?php

declare(strict_types=1);

namespace App\Modules\Payment\Application\Actions;

use App\Models\PaymentTransaction;
use App\Modules\Booking\Application\Actions\RecordBookingPaymentAction;
use Illuminate\Support\Facades\DB;

class ConfirmPaymentAction
{
    public function __construct(
        private readonly RecordBookingPaymentAction $recordBookingPaymentAction
    ) {}

    public function execute(string $transactionId, string $gatewayReference): PaymentTransaction
    {
        return DB::transaction(function () use ($transactionId, $gatewayReference) {
            $transaction = PaymentTransaction::where('transaction_id', $transactionId)
                ->lockForUpdate()
                ->firstOrFail();

            if ($transaction->status === 'completed') {
                return $transaction; // Idempotent: already confirmed
            }

            $transaction->update([
                'status' => 'completed',
                'gateway_reference' => $gatewayReference,
                'completed_at' => now(),
            ]);

            // Update booking financials atomically
            if ($transaction->booking) {
                $this->recordBookingPaymentAction->execute(
                    $transaction->booking,
                    (int) $transaction->amount_cents,
                    (string) $transaction->type
                );
            }

            return $transaction;
        });
    }
}
