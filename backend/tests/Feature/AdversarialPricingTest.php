<?php

namespace Tests\Feature;

use App\Models\Location;
use App\Models\PaymentMethod;
use App\Models\Property;
use App\Models\PropertyCategory;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdversarialPricingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);
    }

    private function createProperty(): Property
    {
        $category = PropertyCategory::firstOrCreate(['slug' => 'pricing-cat'], ['name_en' => 'Pricing Cat', 'is_active' => true]);
        $location = Location::firstOrCreate(['slug' => 'pricing-loc'], ['name_en' => 'Pricing Loc', 'city' => 'El Gouna', 'country' => 'Egypt', 'is_active' => true]);

        $property = Property::create([
            'reference_number' => 'PROP-PRICING-'.uniqid(),
            'slug' => 'pricing-villa-'.uniqid(),
            'property_category_id' => $category->id,
            'location_id' => $location->id,
            'title_en' => 'Pricing Integrity Villa',
            'title_ar' => 'فيلا سلامة التسعير',
            'listing_type' => 'rent',
            'bedrooms' => 2,
            'bathrooms' => 2,
            'max_guests' => 4,
            'min_stay_nights' => 1,
            'max_stay_nights' => 30,
            'base_price_cents' => 500000, // 5,000 EGP per night
            'currency' => 'EGP',
            'cleaning_fee_cents' => 0,
            'service_fee_cents' => 0,
            'tax_percentage' => 0,
            'is_published' => true,
            'is_available' => true,
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
     * Attack 1: Client attempts to inject financial tampering fields into booking creation.
     * FormRequest must reject them via `prohibited` rule (422).
     */
    public function test_tampered_price_injection_is_rejected_or_recalculated(): void
    {
        $property = $this->createProperty();

        $tamperedPayload = [
            'property_id' => $property->id,
            'check_in' => now()->addDays(5)->toDateString(),
            'check_out' => now()->addDays(8)->toDateString(), // 3 nights
            'guests' => 2,
            'first_name' => 'Adversarial',
            'last_name' => 'Buyer',
            'email' => 'buyer@example.com',
            'phone' => '+201000000000',
            'payment_method' => 'card',
            // Tampered financial values
            'total' => 1,
            'price' => 1,
            'total_cents' => 100,
            'discount_cents' => 999999,
        ];

        $response = $this->withHeaders([
            'Idempotency-Key' => 'pricing-test-key-'.uniqid(),
        ])->postJson('/api/v1/checkout/bookings', $tamperedPayload);

        // FormRequest prohibits client pricing fields with 422
        $response->assertStatus(422);
        $this->assertEquals('VALIDATION_ERROR', $response->json('error.code'));
        $this->assertArrayHasKey('price', $response->json('error.details'));
        $this->assertArrayHasKey('total', $response->json('error.details'));
    }

    /**
     * Attack 2: Quote calculation ignores client-injected amounts and computes authoritative values.
     */
    public function test_quote_endpoint_computes_server_authoritative_pricing(): void
    {
        $property = $this->createProperty();

        $quotePayload = [
            'property_id' => $property->id,
            'check_in' => now()->addDays(5)->toDateString(),
            'check_out' => now()->addDays(8)->toDateString(), // 3 nights
            'guests' => 2,
        ];

        $response = $this->postJson('/api/v1/checkout/quote', $quotePayload);

        $response->assertStatus(200);
        // Authoritative 3 nights * 5000 EGP = 15000 EGP = 1,500,000 cents for subtotal (Standard S2 JSON API)
        $subtotal = $response->json('data.attributes.pricing.subtotal_cents') ?? $response->json('data.subtotal_cents');
        $total = $response->json('data.attributes.pricing.total_cents') ?? $response->json('data.total_cents');

        $this->assertEquals(1500000, $subtotal);
        $this->assertEquals(1500000, $total);
    }
}
