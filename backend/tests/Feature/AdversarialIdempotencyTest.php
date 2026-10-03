<?php

namespace Tests\Feature;

use App\Models\Location;
use App\Models\PaymentMethod;
use App\Models\Property;
use App\Models\PropertyCategory;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class AdversarialIdempotencyTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);
    }

    private function createProperty(): Property
    {
        $category = PropertyCategory::firstOrCreate(['slug' => 'idem-cat'], ['name_en' => 'Idem Cat', 'is_active' => true]);
        $location = Location::firstOrCreate(['slug' => 'idem-loc'], ['name_en' => 'Idem Loc', 'city' => 'El Gouna', 'country' => 'Egypt', 'is_active' => true]);

        $property = Property::create([
            'reference_number' => 'PROP-IDEM-'.uniqid(),
            'slug' => 'idem-villa-'.uniqid(),
            'property_category_id' => $category->id,
            'location_id' => $location->id,
            'title_en' => 'Idempotency Villa',
            'title_ar' => 'فيلا تجربة التكرار',
            'listing_type' => 'rent',
            'bedrooms' => 2,
            'bathrooms' => 2,
            'max_guests' => 4,
            'min_stay_nights' => 1,
            'max_stay_nights' => 30,
            'base_price_cents' => 100000,
            'currency' => 'EGP',
            'is_published' => true,
            'status' => 'published',
        ]);

        $cardMethod = PaymentMethod::firstOrCreate(
            ['code' => 'card'],
            ['name' => 'Card', 'is_enabled' => true, 'is_online' => true]
        );
        $property->paymentMethods()->sync([$cardMethod->id => ['is_enabled' => true]]);

        return $property;
    }

    /**
     * Test 1: Same key + different payload MUST throw IdempotencyConflictException (409).
     */
    public function test_same_key_different_payload_throws_conflict(): void
    {
        $property = $this->createProperty();
        $key = 'test-idempotency-key-'.uniqid();

        $payloadA = [
            'property_id' => $property->id,
            'check_in' => now()->addDays(5)->toDateString(),
            'check_out' => now()->addDays(8)->toDateString(),
            'guests' => 2,
            'first_name' => 'Alice',
            'last_name' => 'Valid',
            'email' => 'alice@example.com',
            'phone' => '+201000000001',
            'payment_method' => 'card',
        ];

        // First request succeeds
        $resA = $this->withHeaders(['Idempotency-Key' => $key])
            ->postJson('/api/v1/checkout/bookings', $payloadA);

        $resA->assertStatus(201);

        // Second request with SAME key but DIFFERENT payload (different dates)
        $payloadB = $payloadA;
        $payloadB['check_out'] = now()->addDays(9)->toDateString();

        $resB = $this->withHeaders(['Idempotency-Key' => $key])
            ->postJson('/api/v1/checkout/bookings', $payloadB);

        $resB->assertStatus(409);
        $resB->assertJsonPath('error.code', 'IDEMPOTENCY_CONFLICT');
    }

    /**
     * Test 2: In-flight request blocks duplicate concurrent request with 409 REQUEST_IN_FLIGHT.
     */
    public function test_inflight_request_blocks_duplicate(): void
    {
        $key = 'in-flight-key-'.uniqid();

        DB::table('idempotency_keys')->insert([
            'key' => $key,
            'user_id' => null,
            'route' => 'api/v1/checkout/bookings',
            'request_hash' => hash('sha256', 'POST|api/v1/checkout/bookings|[]'),
            'status' => 'pending',
            'created_at' => now(),
            'updated_at' => now(),
            'expires_at' => now()->addHours(24),
        ]);

        $res = $this->withHeaders(['Idempotency-Key' => $key])
            ->postJson('/api/v1/checkout/bookings', []);

        $res->assertStatus(409);
        $res->assertJsonPath('error.code', 'REQUEST_IN_FLIGHT');
    }

    /**
     * Test 3: Invalid idempotency key format is rejected with 400.
     */
    public function test_invalid_idempotency_key_format_rejected(): void
    {
        $res = $this->withHeaders(['Idempotency-Key' => 'short']) // Less than 16 chars
            ->postJson('/api/v1/checkout/bookings', []);

        $res->assertStatus(400);
        $res->assertJsonPath('error.code', 'INVALID_IDEMPOTENCY_KEY');
    }

    /**
     * Test 4: Different users with identical idempotency key do NOT collide (FINDING-003 Closure).
     */
    public function test_different_users_with_same_key_do_not_collide(): void
    {
        $propertyA = $this->createProperty();
        $propertyB = $this->createProperty();

        $user1 = User::factory()->create(['is_admin' => false]);
        $user2 = User::factory()->create(['is_admin' => false]);

        $sharedKey = 'shared-idempotency-key-'.uniqid();

        $payload1 = [
            'property_id' => $propertyA->id,
            'check_in' => now()->addDays(5)->toDateString(),
            'check_out' => now()->addDays(8)->toDateString(),
            'guests' => 2,
            'first_name' => 'User',
            'last_name' => 'One',
            'email' => 'user1@example.com',
            'phone' => '+201000000001',
            'payment_method' => 'card',
        ];

        $payload2 = [
            'property_id' => $propertyB->id,
            'check_in' => now()->addDays(10)->toDateString(),
            'check_out' => now()->addDays(14)->toDateString(),
            'guests' => 2,
            'first_name' => 'User',
            'last_name' => 'Two',
            'email' => 'user2@example.com',
            'phone' => '+201000000002',
            'payment_method' => 'card',
        ];

        // User 1 executes with shared key
        $res1 = $this->actingAs($user1)
            ->withHeaders(['Idempotency-Key' => $sharedKey])
            ->postJson('/api/v1/checkout/bookings', $payload1);

        $res1->assertStatus(201);

        // User 2 executes with SAME shared key but different payload
        // Under FINDING-003 without partition, this would fail with 409 IDEMPOTENCY_CONFLICT
        // With actor_scope partition, it succeeds cleanly with 201!
        $res2 = $this->actingAs($user2)
            ->withHeaders(['Idempotency-Key' => $sharedKey])
            ->postJson('/api/v1/checkout/bookings', $payload2);

        $res2->assertStatus(201);
        $this->assertNotEmpty($res1->json('data.attributes.reference'));
        $this->assertNotEmpty($res2->json('data.attributes.reference'));
        $this->assertNotEquals(
            $res1->json('data.attributes.reference'),
            $res2->json('data.attributes.reference')
        );
    }

    /**
     * Test 5: Replaying same key by the same user returns cached response without duplicating mutations.
     */
    public function test_same_user_replay_returns_cached_response(): void
    {
        $property = $this->createProperty();
        $user = User::factory()->create(['is_admin' => false]);
        $key = 'replay-key-'.uniqid();

        $payload = [
            'property_id' => $property->id,
            'check_in' => now()->addDays(5)->toDateString(),
            'check_out' => now()->addDays(8)->toDateString(),
            'guests' => 2,
            'first_name' => 'Replay',
            'last_name' => 'User',
            'email' => 'replay@example.com',
            'phone' => '+201000000003',
            'payment_method' => 'card',
        ];

        $resA = $this->actingAs($user)
            ->withHeaders(['Idempotency-Key' => $key])
            ->postJson('/api/v1/checkout/bookings', $payload);

        $resA->assertStatus(201);
        $refA = $resA->json('data.attributes.reference');

        // Replay
        $resB = $this->actingAs($user)
            ->withHeaders(['Idempotency-Key' => $key])
            ->postJson('/api/v1/checkout/bookings', $payload);

        $resB->assertStatus(201);
        $resB->assertHeader('X-Cache-Lookup', 'HIT-IDEMPOTENT');
        $this->assertEquals($refA, $resB->json('data.attributes.reference'));
    }
}
