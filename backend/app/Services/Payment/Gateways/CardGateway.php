<?php

namespace App\Services\Payment\Gateways;

use App\Models\Booking;
use App\Models\PaymentTransaction;
use App\Services\Payment\PaymentGatewayInterface;

/**
 * Card Gateway adapter — architecture-ready placeholder.
 * When real credentials (Stripe/Paymob/etc.) are configured,
 * the driver class can be swapped here without changing BookingService.
 *
 * This implementation runs in test mode only and simulates the gateway flow.
 * Replace the body with real API calls when credentials are available.
 */
class CardGateway implements PaymentGatewayInterface
{
    private array $config;
    private bool $testMode;

    public function __construct(array $config = [])
    {
        $this->config = $config;
        $this->testMode = $config['test_mode'] ?? true;
    }

    public function createPayment(Booking $booking, int $amountCents, string $currency): array
    {
        if ($this->testMode) {
            // Test mode: simulate a checkout session
            $sessionId = 'CARD-' . strtoupper(\Illuminate\Support\Str::random(16));
            $checkoutUrl = route('checkout.card-mock', [
                'reference' => $booking->reference,
                'session' => $sessionId,
            ]);

            return [
                'redirect_url' => $checkoutUrl,
                'transaction_id' => $sessionId,
                'status' => 'pending',
                'meta' => [
                    'provider' => 'card',
                    'session_id' => $sessionId,
                    'amount_cents' => $amountCents,
                    'currency' => $currency,
                    'test_mode' => true,
                ],
            ];
        }

        // Production: integrate with real payment provider API
        // Example: Paymob, Stripe, etc.
        throw new \RuntimeException(
            'Card gateway credentials not configured. Please set up payment provider in admin settings.'
        );
    }

    public function capturePayment(string $gatewayReference): array
    {
        if ($this->testMode) {
            return ['status' => 'completed', 'gateway_reference' => $gatewayReference];
        }

        throw new \RuntimeException('Card gateway not configured for live payments.');
    }

    public function refundPayment(PaymentTransaction $transaction, int $refundAmountCents): array
    {
        if ($this->testMode) {
            return ['status' => 'refunded', 'refund_id' => 'TEST-REFUND-' . time()];
        }

        throw new \RuntimeException('Card gateway not configured for live refunds.');
    }

    public function getPaymentStatus(string $gatewayReference): string
    {
        if ($this->testMode) {
            return 'completed';
        }
        return 'unknown';
    }

    public function handleWebhook(array $payload, string $signature): array
    {
        // Verify signature before processing
        // Production implementation must verify the signature against provider secret
        if (! $this->testMode) {
            throw new \RuntimeException('Card gateway webhook not configured.');
        }

        return [
            'status' => $payload['status'] ?? 'unknown',
            'event_id' => $payload['id'] ?? null,
            'amount_cents' => $payload['amount'] ?? 0,
        ];
    }

    public function getDriverCode(): string
    {
        return 'card';
    }

    public function isTestMode(): bool
    {
        return $this->testMode;
    }
}
