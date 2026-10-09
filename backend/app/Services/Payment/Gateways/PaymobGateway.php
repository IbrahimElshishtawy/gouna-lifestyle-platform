<?php

declare(strict_types=1);

namespace App\Services\Payment\Gateways;

use App\Models\Booking;
use App\Models\PaymentTransaction;
use App\Services\Payment\PaymentGatewayInterface;
use App\Services\Payment\WebhookSignatureVerifier;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PaymobGateway implements PaymentGatewayInterface
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
        $integrationId = $this->config['integration_id'] ?? config('services.payment.paymob.integration_id');
        $instapayIntegrationId = $this->config['instapay_integration_id'] ?? config('services.payment.paymob.instapay_integration_id');
        $frontendUrl = rtrim((string) ($this->config['frontend_url'] ?? config('services.payment.frontend_url', 'http://localhost:3000')), '/');

        $preferredChannel = $this->config['payment_channel'] ?? ($booking->paymentMethod?->code === 'instapay' ? 'instapay' : 'card');

        // Check if real Paymob Secret & Public keys are configured
        $hasLiveCredentials = ! empty($secretKey) && ! empty($publicKey) && ! in_array($secretKey, ['pk_test_placeholder_key', 'sk_test_placeholder_secret', 'placeholder'], true);

        if ($hasLiveCredentials) {
            try {
                $paymentMethods = [];
                if ($preferredChannel === 'instapay' && ! empty($instapayIntegrationId)) {
                    $paymentMethods[] = (int) $instapayIntegrationId;
                } elseif (! empty($integrationId)) {
                    $paymentMethods[] = (int) $integrationId;
                }

                $customer = $booking->customer;
                $names = explode(' ', (string) ($customer?->name ?? 'Guest'), 2);
                $firstName = $customer?->first_name ?? $names[0] ?? 'Guest';
                $lastName = $customer?->last_name ?? ($names[1] ?? 'User');
                $phone = $customer?->phone ?: '+201000000000';
                $email = $customer?->email ?: 'guest@gounow.com';

                $payload = [
                    'amount' => $amountCents,
                    'currency' => $currency ?: 'EGP',
                    'payment_methods' => $paymentMethods,
                    'items' => [
                        [
                            'name' => $booking->bookable?->title ?? 'El Gouna Luxury Stay',
                            'amount' => $amountCents,
                            'description' => "Booking reference: {$booking->reference}",
                            'quantity' => 1,
                        ],
                    ],
                    'billing_data' => [
                        'first_name' => $firstName,
                        'last_name' => $lastName,
                        'phone_number' => $phone,
                        'email' => $email,
                        'apartment' => 'NA',
                        'floor' => 'NA',
                        'street' => 'Abu Tig Marina',
                        'building' => 'NA',
                        'shipping_method' => 'PKG',
                        'postal_code' => '84513',
                        'city' => 'El Gouna',
                        'state' => 'Red Sea',
                        'country' => 'EG',
                    ],
                    'customer' => [
                        'first_name' => $firstName,
                        'last_name' => $lastName,
                        'email' => $email,
                    ],
                    'special_reference' => $booking->reference,
                    'notification_url' => url('/api/v1/webhooks/payments'),
                    'redirection_url' => "{$frontendUrl}/checkout/confirmation/{$booking->reference}",
                ];

                $response = Http::withHeaders([
                    'Authorization' => "Token {$secretKey}",
                    'Content-Type' => 'application/json',
                ])->timeout(10)->post('https://accept.paymob.com/v1/intention/', $payload);

                if ($response->successful()) {
                    $resData = $response->json();
                    $clientSecret = $resData['client_secret'] ?? null;
                    $intentionId = (string) ($resData['id'] ?? 'INT-'.Str::random(12));

                    if ($clientSecret) {
                        return [
                            'redirect_url' => "https://accept.paymob.com/unifiedcheckout/?publicKey={$publicKey}&clientSecret={$clientSecret}",
                            'transaction_id' => $intentionId,
                            'status' => 'pending',
                            'meta' => [
                                'provider' => 'paymob',
                                'intention_id' => $intentionId,
                                'amount_cents' => $amountCents,
                                'currency' => $currency,
                                'live' => true,
                            ],
                        ];
                    }
                }

                Log::warning('Paymob Intention API returned unexpected response, falling back to hosted gateway simulation', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
            } catch (\Throwable $e) {
                Log::error('Paymob API call exception: '.$e->getMessage(), [
                    'exception' => $e,
                ]);
            }
        }

        // Test Mode or Fallback to Native Hosted Paymob Gateway Simulation
        $sessionId = 'PAYMOB-'.strtoupper(Str::random(16));
        $token = $booking->plain_access_token ?? '';

        $checkoutUrl = "{$frontendUrl}/checkout/paymob-gateway?" . http_build_query([
            'reference' => $booking->reference,
            'session' => $sessionId,
            'amount' => $amountCents,
            'currency' => $currency ?: 'EGP',
            'token' => $token,
            'channel' => $preferredChannel,
        ]);

        return [
            'redirect_url' => $checkoutUrl,
            'transaction_id' => $sessionId,
            'status' => 'pending',
            'meta' => [
                'provider' => 'paymob',
                'session_id' => $sessionId,
                'amount_cents' => $amountCents,
                'currency' => $currency,
                'channel' => $preferredChannel,
                'test_mode' => true,
            ],
        ];
    }

    public function capturePayment(string $gatewayReference): array
    {
        return [
            'status' => 'completed',
            'gateway_reference' => $gatewayReference,
        ];
    }

    public function refundPayment(PaymentTransaction $transaction, int $refundAmountCents): array
    {
        return [
            'status' => 'refunded',
            'refund_id' => 'PAYMOB-REFUND-'.time(),
        ];
    }

    public function getPaymentStatus(string $gatewayReference): string
    {
        return 'completed';
    }

    public function handleWebhook(array $payload, string $signature): array
    {
        $secret = (string) ($this->config['webhook_secret']
            ?? config('services.payment.paymob.hmac_secret')
            ?? config('services.payment.webhook_secret')
            ?? 'whsec_placeholder');

        if (empty($signature)) {
            throw new \InvalidArgumentException('Missing webhook signature.');
        }

        $paymobObj = $payload['obj'] ?? $payload;
        $expected = WebhookSignatureVerifier::generatePaymobSignature($paymobObj, $secret);

        if (! hash_equals(strtolower($expected), strtolower(trim($signature)))) {
            // Also test generic sha256
            $genericExpected = hash_hmac('sha256', json_encode($payload), $secret);
            if (! hash_equals(strtolower($genericExpected), strtolower(trim($signature)))) {
                throw new \InvalidArgumentException('Invalid Paymob webhook signature.');
            }
        }

        $isSuccess = ($payload['obj']['success'] ?? $payload['success'] ?? false) === true;

        return [
            'status' => $isSuccess ? 'completed' : 'failed',
            'event_id' => (string) ($payload['obj']['id'] ?? $payload['id'] ?? uniqid('evt_')),
            'transaction_id' => (string) ($payload['obj']['id'] ?? $payload['id'] ?? ''),
            'amount_cents' => (int) ($payload['obj']['amount_cents'] ?? $payload['amount_cents'] ?? 0),
        ];
    }

    public function getDriverCode(): string
    {
        return 'paymob';
    }

    public function isTestMode(): bool
    {
        return $this->testMode;
    }
}
