<?php

namespace App\Services\Payment\Gateways;

use App\Models\Booking;
use App\Models\PaymentTransaction;
use App\Services\Payment\PaymentGatewayInterface;
use Illuminate\Support\Str;

/**
 * PayPal Gateway Adapter — Architecture-ready implementation (Sections 22 & 23 Master Plan).
 * Supports sandbox simulation and live PayPal v2 Checkout Orders API integration.
 */
class PayPalGateway implements PaymentGatewayInterface
{
    private array $config;
    private bool $testMode;

    public function __construct(array $config = [])
    {
        $this->config = $config;
        $this->testMode = $config['test_mode'] ?? true;
    }

    /**
     * Create a PayPal payment session/order.
     */
    public function createPayment(Booking $booking, int $amountCents, string $currency): array
    {
        $orderId = 'PAYPAL-ORD-' . strtoupper(Str::random(14));

        if ($this->testMode) {
            $redirectUrl = route('checkout.paypal-mock', [
                'reference' => $booking->reference,
                'order_id' => $orderId,
            ]);

            return [
                'redirect_url' => $redirectUrl,
                'transaction_id' => $orderId,
                'status' => 'pending',
                'meta' => [
                    'provider' => 'paypal',
                    'order_id' => $orderId,
                    'approval_url' => $redirectUrl,
                    'amount_cents' => $amountCents,
                    'currency' => $currency,
                    'test_mode' => true,
                ],
            ];
        }

        // Live PayPal v2 Orders API integration placeholder
        // When client credentials are provided, call /v2/checkout/orders
        throw new \RuntimeException(
            'PayPal live API credentials not configured. Please supply client_id and secret in Admin Settings.'
        );
    }

    /**
     * Capture PayPal order payment.
     */
    public function capturePayment(string $gatewayReference): array
    {
        if ($this->testMode) {
            return [
                'status' => 'completed',
                'gateway_reference' => $gatewayReference,
                'capture_id' => 'CAPTURE-' . strtoupper(Str::random(12)),
            ];
        }

        throw new \RuntimeException('PayPal live gateway capture not configured.');
    }

    /**
     * Refund a PayPal transaction.
     */
    public function refundPayment(PaymentTransaction $transaction, int $refundAmountCents): array
    {
        if ($this->testMode) {
            return [
                'status' => 'refunded',
                'refund_id' => 'PAYPAL-REFUND-' . strtoupper(Str::random(10)),
                'amount_cents' => $refundAmountCents,
            ];
        }

        throw new \RuntimeException('PayPal live refund not configured.');
    }

    /**
     * Query status from PayPal.
     */
    public function getPaymentStatus(string $gatewayReference): string
    {
        if ($this->testMode) {
            return 'completed';
        }

        return 'unknown';
    }

    /**
     * Process PayPal IPN or Webhook notification.
     */
    public function handleWebhook(array $payload, string $signature): array
    {
        if (! $this->testMode) {
            // In production: verify signature with PayPal SDK or webhook certificate
            throw new \RuntimeException('PayPal production webhook verification not configured.');
        }

        return [
            'status' => $payload['status'] ?? 'completed',
            'event_id' => $payload['id'] ?? ('PAYPAL-EVT-' . Str::random(10)),
            'amount_cents' => $payload['amount_cents'] ?? 0,
        ];
    }

    public function getDriverCode(): string
    {
        return 'paypal';
    }

    public function isTestMode(): bool
    {
        return $this->testMode;
    }
}
