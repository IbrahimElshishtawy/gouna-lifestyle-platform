<?php

namespace App\Services\Payment\Gateways;

use App\Models\Booking;
use App\Models\PaymentTransaction;
use App\Services\Payment\PaymentGatewayInterface;

/**
 * Manual Cash Gateway — no real payment processing.
 * Creates a pending transaction that admin must manually confirm.
 */
class ManualCashGateway implements PaymentGatewayInterface
{
    public function createPayment(Booking $booking, int $amountCents, string $currency): array
    {
        $transactionId = 'CASH-' . strtoupper(\Illuminate\Support\Str::random(12));

        return [
            'redirect_url' => null,
            'transaction_id' => $transactionId,
            'status' => 'pending_manual',
            'meta' => [
                'message' => 'Please pay in cash at our office. Your booking reference is: ' . $booking->reference,
                'amount_cents' => $amountCents,
                'currency' => $currency,
            ],
        ];
    }

    public function capturePayment(string $gatewayReference): array
    {
        // Manual gateways do not support programmatic capture
        return ['status' => 'pending_manual', 'message' => 'Awaiting manual confirmation by admin.'];
    }

    public function refundPayment(PaymentTransaction $transaction, int $refundAmountCents): array
    {
        return [
            'status' => 'manual_refund',
            'message' => 'Refund must be processed manually. Amount: ' . number_format($refundAmountCents / 100, 2),
        ];
    }

    public function getPaymentStatus(string $gatewayReference): string
    {
        return 'pending';
    }

    public function handleWebhook(array $payload, string $signature): array
    {
        return ['status' => 'not_applicable'];
    }

    public function getDriverCode(): string
    {
        return 'manual_cash';
    }

    public function isTestMode(): bool
    {
        return false;
    }
}
