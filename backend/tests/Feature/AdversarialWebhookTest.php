<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Customer;
use App\Models\PaymentTransaction;
use App\Models\Property;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdversarialWebhookTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);
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

    /**
     * Test 1: Webhook execution updates booking status to confirmed/paid atomically.
     */
    public function test_valid_webhook_marks_booking_confirmed(): void
    {
        $customer = $this->createCustomer();
        $ref = 'BK-WH-'.uniqid();

        $booking = Booking::create([
            'reference' => $ref,
            'customer_id' => $customer->id,
            'bookable_type' => Property::class,
            'bookable_id' => $this->createProperty()->id,
            'check_in' => '2026-12-01',
            'check_out' => '2026-12-05',
            'nights' => 4,
            'status' => 'pending',
            'payment_status' => 'unpaid',
            'total_cents' => 600000,
            'currency' => 'EGP',
        ]);

        $response = $this->withHeaders([
            'X-Webhook-Signature' => 'sandbox-signature',
        ])->postJson('/api/v1/webhooks/payments', [
            'reference' => $ref,
            'status' => 'success',
            'transaction_id' => 'tx-123456',
        ]);

        $response->assertStatus(200);
        $this->assertEquals('confirmed', $booking->fresh()->status);
        $this->assertEquals('paid', $booking->fresh()->payment_status);
        $this->assertEquals(600000, $booking->fresh()->amount_paid_cents);
    }

    /**
     * Test 2: Concurrent/Duplicate webhook replay is idempotent and does not duplicate PaymentTransaction.
     */
    public function test_duplicate_webhook_delivery_is_idempotent(): void
    {
        $customer = $this->createCustomer();
        $ref = 'BK-WH-DUP-'.uniqid();

        $booking = Booking::create([
            'reference' => $ref,
            'customer_id' => $customer->id,
            'bookable_type' => Property::class,
            'bookable_id' => $this->createProperty()->id,
            'check_in' => '2026-12-01',
            'check_out' => '2026-12-05',
            'nights' => 4,
            'status' => 'pending',
            'payment_status' => 'unpaid',
            'total_cents' => 600000,
            'currency' => 'EGP',
        ]);

        $payload = [
            'reference' => $ref,
            'status' => 'success',
            'transaction_id' => 'tx-repeatable-999',
        ];

        // Delivery 1
        $this->withHeaders(['X-Webhook-Signature' => 'test-sig'])
            ->postJson('/api/v1/webhooks/payments', $payload)
            ->assertStatus(200);

        // Delivery 2 (Replay)
        $this->withHeaders(['X-Webhook-Signature' => 'test-sig'])
            ->postJson('/api/v1/webhooks/payments', $payload)
            ->assertStatus(200);

        // Verify only 1 PaymentTransaction row exists for this transaction_id
        $txCount = PaymentTransaction::where('transaction_id', 'tx-repeatable-999')->count();
        $this->assertEquals(1, $txCount);
    }
}
