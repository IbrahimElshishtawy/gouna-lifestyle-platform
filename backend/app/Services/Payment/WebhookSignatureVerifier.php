<?php

declare(strict_types=1);

namespace App\Services\Payment;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookSignatureVerifier
{
    /**
     * Canonical list of Paymob Transaction Processed callback keys in strict sequence.
     *
     * @var array<int, string>
     */
    public const PAYMOB_HMAC_KEYS = [
        'amount_cents',
        'created_at',
        'currency',
        'error_occured',
        'has_parent_transaction',
        'id',
        'integration_id',
        'is_3d_secure',
        'is_auth',
        'is_capture',
        'is_refunded',
        'is_standalone_payment',
        'is_voided',
        'order.id',
        'owner',
        'pending',
        'source_data.pan',
        'source_data.sub_type',
        'source_data.type',
        'success',
    ];

    /**
     * Verify whether an incoming webhook request has a valid cryptographic signature.
     */
    public function verify(Request $request): bool
    {
        $secret = config('services.payment.webhook_secret')
            ?? config('services.payment.paymob.hmac_secret')
            ?? 'whsec_placeholder';

        if (empty($secret)) {
            Log::error('Webhook verification blocked: payment webhook secret is not configured.');

            return false;
        }

        // Production fail-safe: reject placeholder secrets in production environment
        if (app()->isProduction() && $secret === 'whsec_placeholder') {
            Log::critical('Webhook verification blocked: placeholder webhook secret present in production.');

            return false;
        }

        // 1. Paymob HMAC check (query param 'hmac' or header 'X-Paymob-Signature')
        $paymobSignature = $request->query('hmac')
            ?? $request->header('X-Paymob-Signature');

        if ($paymobSignature) {
            return $this->verifyPaymob($request, (string) $paymobSignature, (string) $secret);
        }

        // 2. Generic HMAC check (header 'X-Webhook-Signature' or 'Stripe-Signature')
        $signature = $request->header('X-Webhook-Signature')
            ?? $request->header('Stripe-Signature');

        if (! empty($signature)) {
            // Check if payload has Paymob structure with X-Webhook-Signature
            if ($request->has('obj') || $request->input('type') === 'TRANSACTION') {
                if ($this->verifyPaymob($request, (string) $signature, (string) $secret)) {
                    return true;
                }
            }

            return $this->verifyGeneric($request, (string) $signature, (string) $secret);
        }

        return false;
    }

    /**
     * Verify Paymob SHA-512 HMAC signature across concatenated transaction parameters.
     */
    public function verifyPaymob(Request $request, string $signature, string $secret): bool
    {
        $payload = $request->all();
        $source = isset($payload['obj']) && is_array($payload['obj']) ? $payload['obj'] : $payload;

        $concatenated = $this->buildPaymobConcatenatedString($source);
        $expectedHmac = hash_hmac('sha512', $concatenated, $secret);

        return hash_equals(strtolower($expectedHmac), strtolower(trim($signature)));
    }

    /**
     * Build the canonical Paymob concatenated string from the specified ordered keys.
     *
     * @param  array<string, mixed>  $source
     */
    public function buildPaymobConcatenatedString(array $source): string
    {
        $concatenated = '';

        foreach (self::PAYMOB_HMAC_KEYS as $key) {
            $value = $this->extractNestedValue($source, $key);

            if (is_bool($value)) {
                $concatenated .= $value ? 'true' : 'false';
            } elseif ($value !== null) {
                $concatenated .= (string) $value;
            }
        }

        return $concatenated;
    }

    /**
     * Extract nested dot-notation value or direct property.
     *
     * @param  array<string, mixed>  $source
     */
    private function extractNestedValue(array $source, string $key): mixed
    {
        if (str_contains($key, '.')) {
            $parts = explode('.', $key);
            $curr = $source;
            foreach ($parts as $part) {
                if (is_array($curr) && array_key_exists($part, $curr)) {
                    $curr = $curr[$part];
                } else {
                    return null;
                }
            }

            return $curr;
        }

        return $source[$key] ?? null;
    }

    /**
     * Verify generic HMAC-SHA256 signature calculated from raw request body.
     */
    public function verifyGeneric(Request $request, string $signature, string $secret): bool
    {
        $rawBody = $request->getContent();

        // Support Stripe-style timestamped signatures: t=timestamp,v1=signature
        if (str_contains($signature, 't=') && str_contains($signature, 'v1=')) {
            return $this->verifyStripeSignature($rawBody, $signature, $secret);
        }

        $expected = hash_hmac('sha256', $rawBody, $secret);

        return hash_equals(strtolower($expected), strtolower(trim($signature)));
    }

    /**
     * Verify Stripe-style timestamped HMAC signature with tolerance against replay.
     */
    private function verifyStripeSignature(string $rawBody, string $header, string $secret, int $tolerance = 300): bool
    {
        $parts = explode(',', $header);
        $timestamp = null;
        $signatures = [];

        foreach ($parts as $part) {
            $kv = explode('=', trim($part), 2);
            if (count($kv) === 2) {
                if ($kv[0] === 't') {
                    $timestamp = (int) $kv[1];
                } elseif ($kv[0] === 'v1') {
                    $signatures[] = $kv[1];
                }
            }
        }

        if (! $timestamp || empty($signatures)) {
            return false;
        }

        // Replay defense: verify timestamp is within allowed tolerance window
        if (abs(time() - $timestamp) > $tolerance) {
            Log::warning('Webhook rejected: Stripe signature timestamp expired.', [
                'timestamp' => $timestamp,
                'current_time' => time(),
            ]);

            return false;
        }

        $signedPayload = "{$timestamp}.{$rawBody}";
        $expected = hash_hmac('sha256', $signedPayload, $secret);

        foreach ($signatures as $sig) {
            if (hash_equals(strtolower($expected), strtolower($sig))) {
                return true;
            }
        }

        return false;
    }

    /**
     * Generate a valid HMAC-SHA256 signature for test payloads.
     */
    public static function generateGenericSignature(string $rawBody, string $secret = 'whsec_placeholder'): string
    {
        return hash_hmac('sha256', $rawBody, $secret);
    }

    /**
     * Generate a valid Paymob HMAC-SHA512 signature for test payloads.
     *
     * @param  array<string, mixed>  $source
     */
    public static function generatePaymobSignature(array $source, string $secret = 'whsec_placeholder'): string
    {
        $verifier = new self;
        $concatenated = $verifier->buildPaymobConcatenatedString($source);

        return hash_hmac('sha512', $concatenated, $secret);
    }
}
