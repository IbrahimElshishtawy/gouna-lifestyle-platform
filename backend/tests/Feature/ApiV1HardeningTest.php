<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Location;
use App\Models\PaymentMethod;
use App\Models\Property;
use App\Models\PropertyCategory;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Tests\TestCase;

class ApiV1HardeningTest extends TestCase
{
    use RefreshDatabase;

    private Property $property;
    private PaymentMethod $paymentMethod;

    protected function setUp(): void
    {
        parent::setUp();

        RateLimiter::clear('api');
        RateLimiter::clear('auth');
        RateLimiter::clear('booking');

        $category = PropertyCategory::create([
            'name_en' => 'Luxury Villas',
            'name_ar' => 'فلل فاخرة',
            'slug' => 'luxury-villas',
            'is_active' => true,
        ]);

        $location = Location::create([
            'name_en' => 'Marina',
            'name_ar' => 'المارينا',
            'slug' => 'marina',
            'is_active' => true,
        ]);

        $this->property = Property::create([
            'reference_number' => 'GON-TEST-001',
            'slug' => 'villa-azure-test',
            'property_category_id' => $category->id,
            'location_id' => $location->id,
            'title_en' => 'Villa Azure El Gouna',
            'title_ar' => 'فيلا أزور الجونة',
            'listing_type' => 'rent',
            'bedrooms' => 4,
            'bathrooms' => 4,
            'max_guests' => 8,
            'base_price_cents' => 150000,
            'cleaning_fee_cents' => 20000,
            'service_fee_cents' => 10000,
            'tax_percentage' => 14,
            'payment_requirement' => 'full',
            'booking_mode' => 'instant',
            'cancellation_policy' => 'moderate',
            'status' => 'published',
            'is_published' => true,
            'is_available' => true,
        ]);

        $this->paymentMethod = PaymentMethod::create([
            'name' => 'Credit / Debit Card',
            'code' => 'card',
            'type' => 'gateway',
            'gateway' => 'card',
            'is_enabled' => true,
            'sort_order' => 1,
        ]);
    }

    /**
     * P2-T03: ApiAlwaysReturnsJsonTest
     */
    public function test_api_always_returns_json(): void
    {
        // 1. Successful request without Accept header still returns application/json
        $response = $this->get('/api/v1/stays');
        $response->assertStatus(200);
        $this->assertStringContainsString('application/json', (string) $response->headers->get('Content-Type'));

        // 2. 404 response on /api/* is JSON, not HTML
        $notFound = $this->get('/api/v1/stays/non-existent-villa-xyz-999');
        $notFound->assertStatus(404);
        $this->assertStringContainsString('application/json', (string) $notFound->headers->get('Content-Type'));
        $notFound->assertJsonStructure([
            'error' => ['code', 'message', 'request_id', 'timestamp'],
        ]);
    }

    /**
     * P2-T04: ErrorEnvelopeContractTest
     */
    public function test_error_envelope_contract(): void
    {
        // Validation error -> 422
        $response = $this->postJson('/api/v1/checkout/quote', []);
        $response->assertStatus(422);
        $response->assertJsonStructure([
            'error' => [
                'code',
                'message',
                'details',
                'request_id',
                'timestamp',
            ],
        ]);
        $this->assertEquals('VALIDATION_ERROR', $response->json('error.code'));
        $this->assertNotNull($response->json('error.request_id'));

        // Method Not Allowed -> 405
        $mna = $this->postJson('/api/v1/stays', []);
        $mna->assertStatus(405);
        $this->assertEquals('METHOD_NOT_ALLOWED', $mna->json('error.code'));
    }

    /**
     * P2-T03: RequestIdHeaderTest
     */
    public function test_request_id_header(): void
    {
        // 1. Without header, backend generates valid UUID v4
        $res1 = $this->getJson('/api/v1/stays');
        $res1->assertStatus(200);
        $requestId1 = $res1->headers->get('X-Request-ID');
        $this->assertNotNull($requestId1);
        $this->assertTrue(Str::isUuid($requestId1));

        // 2. Client provides valid UUID, backend echoes identical UUID
        $clientUuid = Str::uuid()->toString();
        $res2 = $this->getJson('/api/v1/stays', ['X-Request-ID' => $clientUuid]);
        $res2->assertStatus(200);
        $this->assertEquals($clientUuid, $res2->headers->get('X-Request-ID'));
        $this->assertEquals($clientUuid, $res2->json('meta.request_id'));
    }

    /**
     * P2-T05: FormRequestMassAssignmentTest
     */
    public function test_form_request_mass_assignment(): void
    {
        // Sending prohibited fields to quote calculation must fail with 422
        $response = $this->postJson('/api/v1/checkout/quote', [
            'property_id' => $this->property->id,
            'check_in' => now()->addDays(5)->toDateString(),
            'check_out' => now()->addDays(8)->toDateString(),
            'guests' => 2,
            // Prohibited client tampering fields
            'total' => 10,
            'subtotal' => 10,
            'status' => 'confirmed',
        ]);

        $response->assertStatus(422);
        $this->assertEquals('VALIDATION_ERROR', $response->json('error.code'));
        $this->assertArrayHasKey('total', $response->json('error.details'));
    }

    /**
     * P2-T08: ListingStandardTest
     */
    public function test_listing_standard(): void
    {
        // 1. Per page capped at 100
        $res1 = $this->getJson('/api/v1/stays?per_page=999999');
        $res1->assertStatus(200);
        $this->assertLessThanOrEqual(100, count($res1->json('data')));

        // 2. Disallowed sort column returns 422
        $res2 = $this->getJson('/api/v1/stays?sort=password');
        $res2->assertStatus(422);
        $this->assertEquals('VALIDATION_ERROR', $res2->json('error.code'));
        $this->assertArrayHasKey('sort', $res2->json('error.details'));

        // 3. Valid sort works cleanly
        $res3 = $this->getJson('/api/v1/stays?sort=-base_price_cents');
        $res3->assertStatus(200);
    }

    /**
     * P2-T09: IdempotencyKeyTest
     */
    public function test_idempotency_key(): void
    {
        $payload = [
            'property_id' => $this->property->id,
            'check_in' => now()->addDays(20)->toDateString(),
            'check_out' => now()->addDays(23)->toDateString(),
            'guests' => 2,
            'first_name' => 'Omar',
            'last_name' => 'Khaled',
            'email' => 'omar.khaled@example.com',
            'phone' => '+201099887766',
            'payment_method' => 'card',
        ];

        // 1. Missing Idempotency-Key returns 400
        $noKey = $this->postJson('/api/v1/checkout/bookings', $payload);
        $noKey->assertStatus(400);
        $this->assertEquals('MISSING_IDEMPOTENCY_KEY', $noKey->json('error.code'));

        // 2. First call with valid key creates booking (201)
        $key = Str::uuid()->toString();
        $res1 = $this->postJson('/api/v1/checkout/bookings', $payload, [
            'Idempotency-Key' => $key,
        ]);
        $res1->assertStatus(201);
        $bookingReference = $res1->json('data.attributes.reference');
        $this->assertNotNull($bookingReference);

        $initialBookingCount = Booking::count();

        // 3. Exact same key & payload replays cached response without duplicate creation
        $res2 = $this->postJson('/api/v1/checkout/bookings', $payload, [
            'Idempotency-Key' => $key,
        ]);
        $res2->assertStatus(201);
        $this->assertEquals($bookingReference, $res2->json('data.attributes.reference'));
        $this->assertEquals($initialBookingCount, Booking::count()); // Zero duplicate rows

        // 4. Same key with different payload triggers 409 Conflict
        $differentPayload = array_merge($payload, ['first_name' => 'TamperedName']);
        $res3 = $this->postJson('/api/v1/checkout/bookings', $differentPayload, [
            'Idempotency-Key' => $key,
        ]);
        $res3->assertStatus(409);
        $this->assertEquals('IDEMPOTENCY_CONFLICT', $res3->json('error.code'));
    }

    /**
     * P2-T10: CorsPolicyTest
     */
    public function test_cors_policy(): void
    {
        // 1. Allowed origin preflight options request
        $response = $this->call('OPTIONS', '/api/v1/stays', [], [], [], [
            'HTTP_ORIGIN' => 'http://localhost:3000',
            'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => 'GET',
            'HTTP_ACCESS_CONTROL_REQUEST_HEADERS' => 'X-Request-ID,Content-Type',
        ]);

        $response->assertStatus(204);
        $this->assertEquals('http://localhost:3000', $response->headers->get('Access-Control-Allow-Origin'));
        $this->assertEquals('true', $response->headers->get('Access-Control-Allow-Credentials'));
    }

    /**
     * P2-T11: RateLimiterTest
     */
    public function test_rate_limiter(): void
    {
        $credentials = [
            'email' => 'attacker@test.com',
            'password' => 'wrong-password',
        ];

        // Hit auth limiter 5 times
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/auth/login', $credentials);
        }

        // 6th attempt should be blocked with 429
        $throttled = $this->postJson('/api/v1/auth/login', $credentials);
        $throttled->assertStatus(429);
        $this->assertEquals('RATE_LIMIT_EXCEEDED', $throttled->json('error.code'));
        $this->assertNotNull($throttled->headers->get('Retry-After'));
    }

    /**
     * P2-T12: ResourceNoLeakTest
     */
    public function test_resource_no_leak(): void
    {
        $response = $this->getJson("/api/v1/stays/{$this->property->slug}");
        $response->assertStatus(200);

        $json = $response->json('data.attributes');

        // Verify sensitive or internal columns are not leaked
        $this->assertArrayNotHasKey('password', $json);
        $this->assertArrayNotHasKey('deleted_at', $json);
        $this->assertArrayNotHasKey('internal_notes', $json);
        $this->assertArrayNotHasKey('assigned_to', $json);
    }

    /**
     * P2-T02: ApiVersioningTest
     */
    public function test_api_versioning(): void
    {
        // V1 exists
        $v1 = $this->getJson('/api/v1/stays');
        $v1->assertStatus(200);

        // V2 does not exist yet (404)
        $v2 = $this->getJson('/api/v2/stays');
        $v2->assertStatus(404);
        $this->assertEquals('RESOURCE_NOT_FOUND', $v2->json('error.code'));
    }
}
