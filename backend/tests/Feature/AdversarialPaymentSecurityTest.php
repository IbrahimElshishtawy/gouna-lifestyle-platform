<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Customer;
use App\Models\PaymentMethod;
use App\Models\PaymentTransaction;
use App\Models\Property;
use App\Models\User;
use App\Services\Payment\PaymentService;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use InvalidArgumentException;
use Tests\TestCase;

class AdversarialPaymentSecurityTest extends TestCase
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
            'first_name' => 'Adversary',
            'last_name' => 'Tester',
            'email' => $user->email,
            'phone' => '+2010'.rand(10000000, 99999999),
        ]);
    }

    private function createProperty(): Property
    {
        $prop = Property::create([
            'reference_number' => 'PROP-ADV-'.uniqid(),
            'slug' => 'adv-villa-'.uniqid(),
            'title_en' => 'Adversarial Villa',
            'title_ar' => 'فيلا تجربة الأمان المالي',
            'listing_type' => 'rent',
            'base_price_cents' => 200000,
            'currency' => 'EGP',
            'is_published' => true,
            'status' => 'published',
        ]);

        $cardMethod = PaymentMethod::firstOrCreate(
            ['code' => 'card'],
            ['name' => 'Card', 'is_enabled' => true, 'is_online' => true]
        );
        $prop->paymentMethods()->sync([$cardMethod->id => ['is_enabled' => true]]);

        return $prop;
    }

    private function createBooking(string $ref, int $totalCents = 800000, string $status = 'pending', string $currency = 'EGP'): Booking
    {
        return Booking::create([
            'reference' => $ref,
            'customer_id' => $this->createCustomer()->id,
            'bookable_type' => Property::class,
            'bookable_id' => $this->createProperty()->id,
            'check_in' => '2026-11-10',
            'check_out' => '2026-11-14',
            'nights' => 4,
            'status' => $status,
            'payment_status' => 'unpaid',
            'total_cents' => $totalCents,
            'currency' => $currency,
        ]);
    }

    /**
     * Test 1: Forged signature attempt is rejected with 401.
     */
    public function test_forged_signature_is_rejected(): void
    {
        $ref = 'BK-FORGE-'.uniqid();
        $this->createBooking($ref);

        $payload = [
            'reference' => $ref,
            'status' => 'success',
            'transaction_id' => 'tx-forge-1',
            'amount_cents' => 800000,
        ];

        $response = $this->withHeaders([
            'X-Webhook-Signature' => 'fake_invalid_signature_hex_code',
        ])->postJson('/api/v1/webhooks/payments', $payload);

        $response->assertStatus(401);
        $response->assertJsonPath('error.code', 'INVALID_WEBHOOK_SIGNATURE');
    }

    /**
     * Test 2: Tampered payload with valid signature for original payload is rejected.
     */
    public function test_tampered_payload_with_original_signature_is_rejected(): void
    {
        $ref = 'BK-TAMPER-'.uniqid();
        $this->createBooking($ref, 800000);

        $originalPayload = [
            'reference' => $ref,
            'status' => 'success',
            'transaction_id' => 'tx-tamper-1',
            'amount_cents' => 800000,
        ];
        $originalRaw = json_encode($originalPayload);
        $validSignature = hash_hmac('sha256', $originalRaw, $this->secret);

        // Attacker changes amount_cents in payload but leaves the original signature
        $tamperedPayload = $originalPayload;
        $tamperedPayload['amount_cents'] = 1000;
        $tamperedRaw = json_encode($tamperedPayload);

        $response = $this->call(
            'POST',
            '/api/v1/webhooks/payments',
            [],
            [],
            [],
            [
                'HTTP_X-Webhook-Signature' => $validSignature,
                'CONTENT_TYPE' => 'application/json',
            ],
            $tamperedRaw
        );

        $response->assertStatus(401);
        $response->assertJsonPath('error.code', 'INVALID_WEBHOOK_SIGNATURE');
    }

    /**
     * Test 3: Amount tampering is rejected even if signature matches modified payload.
     */
    public function test_amount_undercut_is_rejected_with_422(): void
    {
        $ref = 'BK-UNDERCUT-'.uniqid();
        $booking = $this->createBooking($ref, 800000);

        $undercutPayload = [
            'reference' => $ref,
            'status' => 'success',
            'transaction_id' => 'tx-undercut-'.uniqid(),
            'amount_cents' => 50000, // 500 EGP instead of 8000 EGP
            'currency' => 'EGP',
        ];
        $raw = json_encode($undercutPayload);
        $validSig = hash_hmac('sha256', $raw, $this->secret);

        $response = $this->call(
            'POST',
            '/api/v1/webhooks/payments',
            [],
            [],
            [],
            [
                'HTTP_X-Webhook-Signature' => $validSig,
                'CONTENT_TYPE' => 'application/json',
            ],
            $raw
        );

        $response->assertStatus(422);
        $response->assertJsonPath('error.code', 'AMOUNT_MISMATCH');
        $this->assertEquals('pending', $booking->fresh()->status);
        $this->assertEquals('unpaid', $booking->fresh()->payment_status);
    }

    /**
     * Test 4: Currency manipulation is rejected with 422 CURRENCY_MISMATCH.
     */
    public function test_currency_manipulation_is_rejected(): void
    {
        $ref = 'BK-CURR-'.uniqid();
        $booking = $this->createBooking($ref, 800000, 'pending', 'EGP');

        $tamperedPayload = [
            'reference' => $ref,
            'status' => 'success',
            'transaction_id' => 'tx-curr-'.uniqid(),
            'amount_cents' => 800000,
            'currency' => 'USD', // Manipulated
        ];
        $raw = json_encode($tamperedPayload);
        $sig = hash_hmac('sha256', $raw, $this->secret);

        $response = $this->call(
            'POST',
            '/api/v1/webhooks/payments',
            [],
            [],
            [],
            [
                'HTTP_X-Webhook-Signature' => $sig,
                'CONTENT_TYPE' => 'application/json',
            ],
            $raw
        );

        $response->assertStatus(422);
        $response->assertJsonPath('error.code', 'CURRENCY_MISMATCH');
        $this->assertEquals('pending', $booking->fresh()->status);
    }

    /**
     * Test 5: Replay attack produces identical response and no duplicate financial records.
     */
    public function test_webhook_replay_produces_no_duplicate_financial_mutation(): void
    {
        $ref = 'BK-REPLAY-'.uniqid();
        $booking = $this->createBooking($ref, 800000);

        $txId = 'tx-idempotent-'.uniqid();
        $payload = [
            'reference' => $ref,
            'status' => 'success',
            'transaction_id' => $txId,
            'amount_cents' => 800000,
            'currency' => 'EGP',
        ];
        $raw = json_encode($payload);
        $sig = hash_hmac('sha256', $raw, $this->secret);

        // Run webhook 3 times sequentially
        for ($i = 0; $i < 3; $i++) {
            $res = $this->call(
                'POST',
                '/api/v1/webhooks/payments',
                [],
                [],
                [],
                [
                    'HTTP_X-Webhook-Signature' => $sig,
                    'CONTENT_TYPE' => 'application/json',
                ],
                $raw
            );
            $res->assertStatus(200);
        }

        $this->assertEquals('confirmed', $booking->fresh()->status);
        $this->assertEquals(800000, $booking->fresh()->amount_paid_cents);

        // Verify only 1 PaymentTransaction row was generated
        $txRows = PaymentTransaction::where('transaction_id', $txId)->count();
        $this->assertEquals(1, $txRows);
    }

    /**
     * Test 6: Webhook cannot confirm a cancelled reservation (State Machine Security).
     */
    public function test_webhook_cannot_revive_cancelled_booking(): void
    {
        $ref = 'BK-DEAD-'.uniqid();
        $booking = $this->createBooking($ref, 800000, 'cancelled');

        $payload = [
            'reference' => $ref,
            'status' => 'success',
            'transaction_id' => 'tx-revive-'.uniqid(),
            'amount_cents' => 800000,
            'currency' => 'EGP',
        ];
        $raw = json_encode($payload);
        $sig = hash_hmac('sha256', $raw, $this->secret);

        $res = $this->call(
            'POST',
            '/api/v1/webhooks/payments',
            [],
            [],
            [],
            [
                'HTTP_X-Webhook-Signature' => $sig,
                'CONTENT_TYPE' => 'application/json',
            ],
            $raw
        );

        $res->assertStatus(409);
        $res->assertJsonPath('error.code', 'INVALID_STATE_TRANSITION');
        $this->assertEquals('cancelled', $booking->fresh()->status);
    }

    /**
     * Test 7: Non-existent booking reference returns 404 BOOKING_NOT_FOUND.
     */
    public function test_webhook_with_nonexistent_reference_returns_404(): void
    {
        $payload = [
            'reference' => 'BK-DOES-NOT-EXIST-999',
            'status' => 'success',
            'transaction_id' => 'tx-ghost-'.uniqid(),
            'amount_cents' => 800000,
            'currency' => 'EGP',
        ];
        $raw = json_encode($payload);
        $sig = hash_hmac('sha256', $raw, $this->secret);

        $res = $this->call(
            'POST',
            '/api/v1/webhooks/payments',
            [],
            [],
            [],
            [
                'HTTP_X-Webhook-Signature' => $sig,
                'CONTENT_TYPE' => 'application/json',
            ],
            $raw
        );

        $res->assertStatus(404);
        $res->assertJsonPath('error.code', 'BOOKING_NOT_FOUND');
    }

    /**
     * Test 8: Refund cannot exceed the remaining refundable amount.
     */
    public function test_refund_cannot_exceed_captured_amount(): void
    {
        $ref = 'BK-REFUND-'.uniqid();
        $booking = $this->createBooking($ref, 50000); // 500 EGP

        $cardMethod = PaymentMethod::where('code', 'card')->first();

        /** @var PaymentTransaction $tx */
        $tx = PaymentTransaction::create([
            'booking_id' => $booking->id,
            'payment_method_id' => $cardMethod->id,
            'transaction_id' => 'tx-refund-test-'.uniqid(),
            'amount_cents' => 50000,
            'currency' => 'EGP',
            'status' => 'completed',
            'type' => 'payment',
        ]);

        $admin = User::factory()->create(['is_admin' => true]);
        $service = app(PaymentService::class);

        // Attempt to refund 60000 cents (exceeds 50000 cents captured)
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('exceeds remaining refundable balance');

        $service->initiateRefund($tx, 60000, 'Customer requested excessive refund', $admin->id);
    }

    /**
     * Test 9: Completed refund accumulates correctly and marks transaction refunded when fully settled.
     */
    public function test_valid_refund_updates_status_and_booking_financials(): void
    {
        $ref = 'BK-REFUND-VALID-'.uniqid();
        $booking = $this->createBooking($ref, 50000);
        $booking->update([
            'status' => 'confirmed',
            'payment_status' => 'paid',
            'amount_paid_cents' => 50000,
        ]);

        $cardMethod = PaymentMethod::where('code', 'card')->first();

        /** @var PaymentTransaction $tx */
        $tx = PaymentTransaction::create([
            'booking_id' => $booking->id,
            'payment_method_id' => $cardMethod->id,
            'transaction_id' => 'tx-refund-valid-'.uniqid(),
            'amount_cents' => 50000,
            'currency' => 'EGP',
            'status' => 'completed',
            'type' => 'payment',
        ]);

        $admin = User::factory()->create(['is_admin' => true]);
        $service = app(PaymentService::class);

        // Execute full refund
        $service->initiateRefund($tx, 50000, 'Customer cancellation refund', $admin->id);

        $tx->refresh();
        $this->assertEquals('refunded', $tx->status);
        $this->assertEquals(50000, $tx->refund_amount_cents);

        $booking->refresh();
        $this->assertEquals('refunded', $booking->payment_status);
        $this->assertEquals(50000, $booking->refund_amount_cents);
    }

    /**
     * Test 10: Mock payment endpoints are blocked in production environment (FINDING-002 Verification).
     */
    public function test_mock_endpoints_return_forbidden_in_production(): void
    {
        $ref = 'BK-MOCK-TEST-'.uniqid();
        $this->createBooking($ref);

        // Temporarily simulate production environment via detectEnvironment
        $this->app->detectEnvironment(fn () => 'production');

        $response = $this->get(route('checkout.card-mock', $ref));
        $this->assertTrue(in_array($response->getStatusCode(), [403, 404], true));

        $this->withoutMiddleware([
            ValidateCsrfToken::class,
            VerifyCsrfToken::class,
        ]);

        $completeResponse = $this->post(route('checkout.card-mock.complete', $ref));
        $this->assertTrue(in_array($completeResponse->getStatusCode(), [403, 404], true));

        // Restore testing environment
        $this->app->detectEnvironment(fn () => 'testing');
    }

    /**
     * Test 11: Web checkout double-submission lock prevents concurrent duplicate booking creation (FINDING-004 Verification).
     */
    public function test_web_checkout_double_submission_lock_prevents_duplicate(): void
    {
        $property = $this->createProperty();
        $cardMethod = PaymentMethod::where('code', 'card')->first();

        $checkoutData = [
            'property_id' => $property->id,
            'check_in' => now()->addDays(20)->toDateString(),
            'check_out' => now()->addDays(23)->toDateString(),
            'guests' => 2,
            'first_name' => 'Rapid',
            'last_name' => 'Clicker',
            'email' => 'rapid@example.com',
            'phone' => '+201011112222',
            'payment_method_id' => $cardMethod->id,
            'payment_type' => 'full',
        ];

        // Simulate an existing in-flight submission by holding the lock
        $submissionKey = 'checkout_lock_'.md5(
            $property->id.'|'.
            $checkoutData['check_in'].'|'.
            $checkoutData['check_out'].'|'.
            strtolower(trim($checkoutData['email']))
        );

        $lock = Cache::lock($submissionKey, 10);
        $lock->get();

        // While lock is held, simultaneous submission must be rejected with 409 or redirect error
        $response = $this->post(route('checkout.process'), $checkoutData);
        $response->assertSessionHas('error', 'A checkout submission is already being processed. Please wait a moment.');

        $lock->release();
    }
}
