<?php

namespace App\Services\Payment\Gateways;

use App\Models\Booking;
use App\Models\PaymentTransaction;
use App\Services\Payment\PaymentGatewayInterface;

/**
 * Manual Bank Transfer Gateway.
 * Shows bank transfer instructions. Admin confirms payment manually.
 */
class ManualBankTransferGateway implements PaymentGatewayInterface
{
    private array $config;

    public function __construct(array $config = [])
    {
        $this->config = $config;
    }

    public function createPayment(Booking $booking, int $amountCents, string $currency): array
    {
        $transactionId = 'BANK-' . strtoupper(\Illuminate\Support\Str::random(12));

        return [
            'redirect_url' => null,
            'transaction_id' => $transactionId,
            'status' => 'pending_manual',
            'meta' => [
                'instructions' => $this->config['instructions'] ?? 'Please transfer to our bank account and send proof of payment.',
                'bank_name' => $this->config['bank_name'] ?? '',
                'account_name' => $this->config['account_name'] ?? '',
                'account_number' => $this->config['account_number'] ?? '',
                'amount_cents' => $amountCents,
                'currency' => $currency,
                'reference' => $booking->reference,
            ],
        ];
    }

    public function capturePayment(string $gatewayReference): array
    {
        return ['status' => 'pending_manual', 'message' => 'Awaiting bank transfer confirmation.'];
    }

    public function refundPayment(PaymentTransaction $transaction, int $refundAmountCents): array
    {
        return [
            'status' => 'manual_refund',
            'message' => 'Bank transfer refund must be processed manually.',
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
        return 'manual_bank_transfer';
    }

    public function isTestMode(): bool
    {
        return false;
    }
}
