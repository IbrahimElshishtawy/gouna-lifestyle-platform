<?php

namespace App\Services\Payment\Gateways;

use App\Models\Booking;
use App\Models\PaymentTransaction;
use App\Services\Payment\PaymentGatewayInterface;
use App\Services\Payment\WebhookSignatureVerifier;
use Illuminate\Support\Str;

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
        $secretKey = $this->config['secret_key'] ?? config('services.payment.paymob.secret_key');
        $publicKey = $this->config['public_key'] ?? config('services.payment.paymob.public_key');
        $hasLiveCredentials = ! empty($secretKey) && ! empty($publicKey) && ! in_array($secretKey, ['pk_test_placeholder_key', 'sk_test_placeholder_secret', 'placeholder'], true);

        if ($hasLiveCredentials) {
            return (new PaymobGateway($this->config))->createPayment($booking, $amountCents, $currency);
        }

        if ($this->testMode) {
            // Test mode: simulate a checkout session
            $sessionId = 'CARD-'.strtoupper(Str::random(16));
            $token = $booking->plain_access_token ?? '';

            if (request()?->is('api/*') || request()?->wantsJson()) {
                $frontendUrl = rtrim((string) config('services.payment.frontend_url', 'http://localhost:3000'), '/');
                $checkoutUrl = "{$frontendUrl}/checkout/paymob-gateway?" . http_build_query([
                    'reference' => $booking->reference,
                    'session' => $sessionId,
                    'amount' => $amountCents,
                    'currency' => $currency ?: 'EGP',
                    'token' => $token,
                    'channel' => 'card',
                ]);
            } else {
                $checkoutUrl = route('checkout.card-mock', [
                    'reference' => $booking->reference,
                    'session' => $sessionId,
                ]);
            }

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
            return ['status' => 'refunded', 'refund_id' => 'TEST-REFUND-'.time()];
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
        $secret = (string) ($this->config['webhook_secret'] ?? config('services.payment.webhook_secret', 'whsec_placeholder'));

        if (empty($signature)) {
            throw new \InvalidArgumentException('Missing webhook signature.');
        }

        // Verify SHA-256 or Paymob SHA-512 signature
        $expected = hash_hmac('sha256', json_encode($payload), $secret);
        if (! hash_equals(strtolower($expected), strtolower(trim($signature)))) {
            $paymobObj = $payload['obj'] ?? $payload;
            $paymobExpected = WebhookSignatureVerifier::generatePaymobSignature($paymobObj, $secret);
            if (! hash_equals(strtolower($paymobExpected), strtolower(trim($signature)))) {
                throw new \InvalidArgumentException('Invalid webhook signature.');
            }
        }

        $isSuccess = ($payload['status'] ?? null) === 'completed'
            || ($payload['status'] ?? null) === 'success'
            || ($payload['success'] ?? false) === true;

        return [
            'status' => $isSuccess ? 'completed' : 'failed',
            'event_id' => (string) ($payload['transaction_id'] ?? $payload['id'] ?? uniqid('evt_')),
            'transaction_id' => (string) ($payload['transaction_id'] ?? $payload['id'] ?? ''),
            'amount_cents' => (int) ($payload['amount_cents'] ?? $payload['amount'] ?? 0),
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
