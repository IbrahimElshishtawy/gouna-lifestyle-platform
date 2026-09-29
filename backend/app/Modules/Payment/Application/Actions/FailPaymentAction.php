<?php

declare(strict_types=1);

namespace App\Modules\Payment\Application\Actions;

use App\Models\PaymentTransaction;
use Illuminate\Support\Facades\DB;

class FailPaymentAction
{
    public function execute(string $transactionId, ?string $reason = null): PaymentTransaction
    {
        return DB::transaction(function () use ($transactionId, $reason) {
            $transaction = PaymentTransaction::where('transaction_id', $transactionId)
                ->lockForUpdate()
                ->firstOrFail();

            $transaction->update([
                'status' => 'failed',
                'failure_reason' => $reason ?? 'Payment declined by gateway or user cancelled.',
            ]);

            $booking = $transaction->booking;
            if ($booking) {
                $booking->update(['payment_status' => 'failed']);
            }

            return $transaction;
        });
    }
}
