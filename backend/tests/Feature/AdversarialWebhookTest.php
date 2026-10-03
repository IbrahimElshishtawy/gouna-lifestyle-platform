<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Customer;
use App\Models\PaymentTransaction;
use App\Models\Property;
use App\Models\User;
use App\Services\Payment\WebhookSignatureVerifier;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdversarialWebhookTest extends TestCase
{
    use RefreshDatabase;

    private string $secret = 'whsec_placeholder';

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);
        config(['services.payment.webhook_secret' => $this->secret]);
        config(['services.payment.paymob.hmac_secret' => $this->secret]);
    }

    private function createCustomer(): Customer
    {
        $user = User::factory()->create([
            'is_admin' => false,
            'is_active' => true,
        ]);

        return Customer::create([
            'user_id' => $user->id,
            'first_name' => 'Webhook',
            'last_name' => 'User',
            'email' => $user->email,
            'phone' => '+2010'.rand(10000000, 99999999),
        ]);
    }

    private function createProperty(): Property
    {
        return Property::create([
            'reference_number' => 'PROP-WH-'.uniqid(),
            'slug' => 'wh-villa-'.uniqid(),
            'title_en' => 'Webhook Villa',
            'title_ar' => 'فيلا تجربة الويب هوك',
            'listing_type' => 'rent',
            'base_price_cents' => 150000,
            'currency' => 'EGP',
            'is_published' => true,
            'status' => 'published',
        ]);
    }

    private function createBooking(string $ref, int $totalCents = 600000, string $status = 'pending', string $currency = 'EGP'): Booking
    {
        return Booking::create([
            'reference' => $ref,
            'customer_id' => $this->createCustomer()->id,
            'bookable_type' => Property::class,
            'bookable_id' => $this->createProperty()->id,
            'check_in' => '2026-12-01',
            'check_out' => '2026-12-05',
            'nights' => 4,
            'status' => $status,
            'payment_status' => 'unpaid',
            'total_cents' => $totalCents,
            'currency' => $currency,
        ]);
    }

    /**
     * Test 1: Missing signature header is rejected with 401 (FINDING-001 Verification).
     */
    public function test_missing_signature_rejected(): void
    {
        $response = $this->postJson('/api/v1/webhooks/payments', [
            'reference' => 'BK-NO-SIG',
            'status' => 'success',
            'transaction_id' => 'tx-123',
        ]);

        $response->assertStatus(401);
        $response->assertJsonPath('error.code', 'INVALID_WEBHOOK_SIGNATURE');
    }

    /**
     * Test 2: Forged / invalid signature is rejected with 401 (FINDING-001 Verification).
     */
    public function test_invalid_signature_rejected(): void
    {
        $response = $this->withHeaders([
            'X-Webhook-Signature' => 'forged_fake_signature_hex_1234567890abcdef',
        ])->postJson('/api/v1/webhooks/payments', [
            'reference' => 'BK-FORGED-SIG',
            'status' => 'success',
            'transaction_id' => 'tx-123',
        ]);

        $response->assertStatus(401);
        $response->assertJsonPath('error.code', 'INVALID_WEBHOOK_SIGNATURE');
    }

    /**
     * Test 3: Authentic webhook updates booking status to confirmed/paid atomically.
     */
    public function test_valid_webhook_marks_booking_confirmed(): void
    {
        $ref = 'BK-WH-'.uniqid();
        $booking = $this->createBooking($ref, 600000);

        $payload = [
            'reference' => $ref,
            'status' => 'success',
            'transaction_id' => 'tx-123456',
            'amount_cents' => 600000,
            'currency' => 'EGP',
        ];

        $rawBody = json_encode($payload);
        $signature = hash_hmac('sha256', $rawBody, $this->secret);

        $response = $this->call(
            'POST',
            '/api/v1/webhooks/payments',
            [],
            [],
            [],
            [
                'HTTP_X-Webhook-Signature' => $signature,
                'CONTENT_TYPE' => 'application/json',
            ],
            $rawBody
        );

        $response->assertStatus(200);
        $this->assertEquals('confirmed', $booking->fresh()->status);
        $this->assertEquals('paid', $booking->fresh()->payment_status);
        $this->assertEquals(600000, $booking->fresh()->amount_paid_cents);
    }

    /**
     * Test 4: Duplicate webhook delivery is idempotent and does not duplicate PaymentTransaction.
     */
    public function test_duplicate_webhook_delivery_is_idempotent(): void
    {
        $ref = 'BK-WH-DUP-'.uniqid();
        $booking = $this->createBooking($ref, 600000);

        $payload = [
            'reference' => $ref,
            'status' => 'success',
            'transaction_id' => 'tx-repeatable-999',
            'amount_cents' => 600000,
            'currency' => 'EGP',
        ];

        $rawBody = json_encode($payload);
        $signature = hash_hmac('sha256', $rawBody, $this->secret);

        // Delivery 1
        $this->call(
            'POST',
            '/api/v1/webhooks/payments',
            [],
            [],
            [],
            [
                'HTTP_X-Webhook-Signature' => $signature,
                'CONTENT_TYPE' => 'application/json',
            ],
            $rawBody
        )->assertStatus(200);

        // Delivery 2 (Replay)
        $replayResponse = $this->call(
            'POST',
            '/api/v1/webhooks/payments',
            [],
            [],
            [],
            [
                'HTTP_X-Webhook-Signature' => $signature,
                'CONTENT_TYPE' => 'application/json',
            ],
            $rawBody
        );

        $replayResponse->assertStatus(200);
        $replayResponse->assertJsonPath('data.replayed', true);

        // Verify exactly 1 PaymentTransaction row exists
        $txCount = PaymentTransaction::where('transaction_id', 'tx-repeatable-999')->count();
        $this->assertEquals(1, $txCount);
    }

    /**
     * Test 5: Amount mismatch in webhook payload is rejected with 422 AMOUNT_MISMATCH.
     */
    public function test_amount_mismatch_rejected(): void
    {
        $ref = 'BK-WH-AMT-'.uniqid();
        $booking = $this->createBooking($ref, 600000);

        // Attacker attempts to pay 1000 cents instead of 600000 cents
        $payload = [
            'reference' => $ref,
            'status' => 'success',
            'transaction_id' => 'tx-undercut-'.uniqid(),
            'amount_cents' => 1000,
            'currency' => 'EGP',
        ];

        $rawBody = json_encode($payload);
        $signature = hash_hmac('sha256', $rawBody, $this->secret);

        $response = $this->call(
            'POST',
            '/api/v1/webhooks/payments',
            [],
            [],
            [],
            [
                'HTTP_X-Webhook-Signature' => $signature,
                'CONTENT_TYPE' => 'application/json',
            ],
            $rawBody
        );

        $response->assertStatus(422);
        $response->assertJsonPath('error.code', 'AMOUNT_MISMATCH');
        $this->assertEquals('pending', $booking->fresh()->status);
        $this->assertEquals('unpaid', $booking->fresh()->payment_status);
    }

    /**
     * Test 6: Currency mismatch in webhook payload is rejected with 422 CURRENCY_MISMATCH.
     */
    public function test_currency_mismatch_rejected(): void
    {
        $ref = 'BK-WH-CURR-'.uniqid();
        $booking = $this->createBooking($ref, 600000, 'pending', 'EGP');

        $payload = [
            'reference' => $ref,
            'status' => 'success',
            'transaction_id' => 'tx-currency-tampered-'.uniqid(),
            'amount_cents' => 600000,
            'currency' => 'USD', // Tampered currency
        ];

        $rawBody = json_encode($payload);
        $signature = hash_hmac('sha256', $rawBody, $this->secret);

        $response = $this->call(
            'POST',
            '/api/v1/webhooks/payments',
            [],
            [],
            [],
            [
                'HTTP_X-Webhook-Signature' => $signature,
                'CONTENT_TYPE' => 'application/json',
            ],
            $rawBody
        );

        $response->assertStatus(422);
        $response->assertJsonPath('error.code', 'CURRENCY_MISMATCH');
        $this->assertEquals('pending', $booking->fresh()->status);
    }

    /**
     * Test 7: Webhook cannot confirm a cancelled or refunded booking (State Transition Security).
     */
    public function test_cannot_confirm_cancelled_booking(): void
    {
        $ref = 'BK-WH-CANCELLED-'.uniqid();
        $booking = $this->createBooking($ref, 600000, 'cancelled');

        $payload = [
            'reference' => $ref,
            'status' => 'success',
            'transaction_id' => 'tx-revive-attempt-'.uniqid(),
            'amount_cents' => 600000,
            'currency' => 'EGP',
        ];

        $rawBody = json_encode($payload);
        $signature = hash_hmac('sha256', $rawBody, $this->secret);

        $response = $this->call(
            'POST',
            '/api/v1/webhooks/payments',
            [],
            [],
            [],
            [
                'HTTP_X-Webhook-Signature' => $signature,
                'CONTENT_TYPE' => 'application/json',
            ],
            $rawBody
        );

        $response->assertStatus(409);
        $response->assertJsonPath('error.code', 'INVALID_STATE_TRANSITION');
        $this->assertEquals('cancelled', $booking->fresh()->status);
    }

    /**
     * Test 8: Authentic Paymob SHA-512 callback verification succeeds.
     */
    public function test_paymob_hmac_sha512_verification_succeeds(): void
    {
        $ref = 'BK-PAYMOB-'.uniqid();
        $booking = $this->createBooking($ref, 450000, 'pending', 'EGP');

        $paymobObj = [
            'id' => 987654321,
            'pending' => false,
            'amount_cents' => 450000,
            'success' => true,
            'is_auth' => false,
            'is_capture' => true,
            'is_standalone_payment' => true,
            'is_voided' => false,
            'is_refunded' => false,
            'is_3d_secure' => true,
            'integration_id' => 12345,
            'currency' => 'EGP',
            'error_occured' => false,
            'has_parent_transaction' => false,
            'owner' => 999,
            'created_at' => '2026-10-03T18:00:00.000000',
            'order' => [
                'id' => 888123,
                'merchant_order_id' => $ref,
            ],
            'source_data' => [
                'type' => 'card',
                'pan' => '2346',
                'sub_type' => 'Visa',
            ],
        ];

        $paymobHmac = WebhookSignatureVerifier::generatePaymobSignature($paymobObj, $this->secret);

        $payload = [
            'type' => 'TRANSACTION',
            'obj' => $paymobObj,
        ];

        $rawBody = json_encode($payload);

        $response = $this->call(
            'POST',
            '/api/v1/webhooks/payments?hmac='.$paymobHmac,
            [],
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
            ],
            $rawBody
        );

        $response->assertStatus(200);
        $this->assertEquals('confirmed', $booking->fresh()->status);
        $this->assertEquals('paid', $booking->fresh()->payment_status);
        $this->assertEquals(450000, $booking->fresh()->amount_paid_cents);
    }
}
