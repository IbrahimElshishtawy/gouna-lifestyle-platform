<?php

declare(strict_types=1);

namespace App\Modules\Payment\Application\Actions;

use App\Models\PaymentMethod;
use App\Models\PaymentTransaction;
use App\Services\Payment\PaymentService;
use Illuminate\Support\Facades\DB;

class ProcessPaymentWebhookAction
{
    public function __construct(
        private readonly PaymentService $paymentService,
        private readonly ConfirmPaymentAction $confirmPaymentAction,
    ) {}

    public function execute(PaymentMethod $method, array $payload, string $signature): void
    {
        $gateway = $this->paymentService->resolveGateway($method);
        $result = $gateway->handleWebhook($payload, $signature);

        if (! isset($result['event_id'])) {
            return;
        }

        $eventId = (string) $result['event_id'];

        // Atomic check with row lock on payment transaction to prevent concurrent webhook duplicate execution
        DB::transaction(function () use ($eventId, $result) {
            if (PaymentTransaction::where('webhook_event_id', $eventId)->exists()) {
                return; // Replay safe
            }

            $transaction = PaymentTransaction::where('gateway_reference', $eventId)
                ->orWhere('transaction_id', $result['transaction_id'] ?? null)
                ->lockForUpdate()
                ->first();

            if ($transaction) {
                $transaction->update([
                    'webhook_event_id' => $eventId,
                    'webhook_processed' => true,
                ]);

                if (($result['status'] ?? '') === 'completed') {
                    $this->confirmPaymentAction->execute($transaction->transaction_id, $eventId);
                }
            }
        });
    }
}
