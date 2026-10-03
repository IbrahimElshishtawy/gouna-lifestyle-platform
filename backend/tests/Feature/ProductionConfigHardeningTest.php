<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Customer;
use App\Models\PaymentTransaction;
use App\Models\User;
use App\Services\Payment\WebhookSignatureVerifier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Tests\TestCase;

class ProductionConfigHardeningTest extends TestCase
{
    public function test_audit_production_config_detects_insecure_development_settings(): void
    {
        // When running in local/test settings with sqlite, file cache, etc.
        $this->artisan('config:audit-production')
            ->assertExitCode(1);
    }

    public function test_audit_production_config_passes_with_hardened_production_matrix(): void
    {
        $originalDb = Config::get('database.default');

        try {
            Config::set('app.env', 'production');
            Config::set('app.debug', false);
            Config::set('app.key', 'base64:'.base64_encode(random_bytes(32)));
            Config::set('database.default', 'pgsql');
            Config::set('session.driver', 'database');
            Config::set('session.secure', true);
            Config::set('session.http_only', true);
            Config::set('session.same_site', 'lax');
            Config::set('cache.default', 'database');
            Config::set('queue.default', 'database');
            Config::set('cors.allowed_origins', ['https://gounow.com']);
            Config::set('cors.supports_credentials', true);
            Config::set('services.payment.webhook_secret', 'live_webhook_secret_998877665544');
            Config::set('services.payment.paymob.hmac_secret', 'live_paymob_hmac_secret_112233');
            Config::set('mail.default', 'smtp');

            $this->artisan('config:audit-production')
                ->assertExitCode(0);
        } finally {
            Config::set('database.default', $originalDb);
        }
    }

    public function test_user_model_serialization_hides_sensitive_credentials(): void
    {
        $user = new User([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'secretPassword123',
            'two_factor_secret' => 'SECRETBASE32KEY12',
            'two_factor_recovery_codes' => ['code1', 'code2'],
            'remember_token' => 'rememberToken123',
        ]);

        $serialized = $user->toArray();

        $this->assertArrayNotHasKey('password', $serialized);
        $this->assertArrayNotHasKey('remember_token', $serialized);
        $this->assertArrayNotHasKey('two_factor_secret', $serialized);
        $this->assertArrayNotHasKey('two_factor_recovery_codes', $serialized);
    }

    public function test_booking_model_serialization_hides_access_token_and_internal_notes(): void
    {
        $booking = new Booking([
            'reference' => 'BK-TEST-1234',
            'booking_access_token' => hash('sha256', 'plain_token_123'),
            'internal_notes' => 'Sensitive VIP internal comment',
            'subtotal_cents' => 10000,
            'total_cents' => 10000,
            'currency' => 'EUR',
            'status' => 'confirmed',
            'payment_status' => 'paid',
        ]);

        $serialized = $booking->toArray();

        $this->assertArrayNotHasKey('booking_access_token', $serialized);
        $this->assertArrayNotHasKey('internal_notes', $serialized);
        $this->assertEquals('BK-TEST-1234', $serialized['reference']);
    }

    public function test_payment_transaction_serialization_hides_gateway_response_and_manual_notes(): void
    {
        $transaction = new PaymentTransaction([
            'transaction_id' => 'TXN-001',
            'amount_cents' => 5000,
            'currency' => 'EUR',
            'status' => 'completed',
            'gateway_response' => ['raw' => 'secret_gateway_payload', 'card' => '4111'],
            'manual_notes' => 'Staff verified offline bank receipt',
        ]);

        $serialized = $transaction->toArray();

        $this->assertArrayNotHasKey('gateway_response', $serialized);
        $this->assertArrayNotHasKey('manual_notes', $serialized);
        $this->assertEquals('TXN-001', $serialized['transaction_id']);
    }

    public function test_customer_model_serialization_hides_internal_notes(): void
    {
        $customer = new Customer([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'notes' => 'Internal risk note: client requested high limit',
        ]);

        $serialized = $customer->toArray();

        $this->assertArrayNotHasKey('notes', $serialized);
        $this->assertEquals('John', $serialized['first_name']);
    }

    public function test_webhook_verification_fails_closed_with_placeholder_secret_in_production(): void
    {
        $verifier = new WebhookSignatureVerifier;
        $request = Request::create('/api/v1/payments/webhook', 'POST', [
            'type' => 'TRANSACTION',
            'obj' => ['id' => 12345, 'amount_cents' => 10000],
        ]);

        // In production environment with placeholder secret
        $this->app->detectEnvironment(fn () => 'production');
        Config::set('services.payment.webhook_secret', 'whsec_placeholder');
        Config::set('services.payment.paymob.hmac_secret', 'whsec_placeholder');

        $isValid = $verifier->verify($request);

        $this->assertFalse($isValid, 'Webhook verifier must reject placeholder secret in production.');
    }

    public function test_cors_config_does_not_permit_wildcard_with_credentials(): void
    {
        $allowedOrigins = Config::get('cors.allowed_origins');
        $supportsCredentials = Config::get('cors.supports_credentials');

        $this->assertTrue($supportsCredentials);
        $this->assertNotContains('*', (array) $allowedOrigins, 'CORS must never permit wildcard origin when credentials are supported.');
    }
}
