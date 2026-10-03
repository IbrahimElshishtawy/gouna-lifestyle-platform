<?php

namespace Tests\Feature;

use App\Models\Location;
use App\Models\PaymentMethod;
use App\Models\Property;
use App\Models\PropertyCategory;
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
}
