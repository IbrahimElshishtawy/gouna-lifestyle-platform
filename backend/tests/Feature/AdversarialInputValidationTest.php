<?php

namespace Tests\Feature;

use App\Models\Property;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdversarialInputValidationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);
    }

    private function createProperty(): Property
    {
        return Property::create([
            'reference_number' => 'PROP-INP-'.uniqid(),
            'slug' => 'inp-villa-'.uniqid(),
            'title_en' => 'Input Test Villa',
            'title_ar' => 'فيلا تدقيق المدخلات',
            'listing_type' => 'rent',
            'base_price_cents' => 100000,
            'currency' => 'EGP',
            'is_published' => true,
            'status' => 'published',
        ]);
    }

    /**
     * Attack 1: Negative numbers and invalid formats in booking calculation.
     */
    public function test_negative_or_malformed_values_rejected_with_422(): void
    {
        $property = $this->createProperty();

        // Case A: Negative guests
        $resNegative = $this->postJson('/api/v1/checkout/quote', [
            'property_id' => $property->id,
            'check_in' => '2026-11-01',
            'check_out' => '2026-11-05',
            'guests' => -5,
        ]);
        $resNegative->assertStatus(422);

        // Case B: Inverted dates (check_out before check_in)
        $resInverted = $this->postJson('/api/v1/checkout/quote', [
            'property_id' => $property->id,
            'check_in' => '2026-11-10',
            'check_out' => '2026-11-05',
            'guests' => 2,
        ]);
        $resInverted->assertStatus(422);

        // Case C: Non-date string injection
        $resStringDate = $this->postJson('/api/v1/checkout/quote', [
            'property_id' => $property->id,
            'check_in' => '<script>alert(1)</script>',
            'check_out' => "' OR '1'='1",
            'guests' => 2,
        ]);
        $resStringDate->assertStatus(422);
    }

    /**
     * Attack 2: Resource exhaustion — per_page capped at 100.
     */
    public function test_pagination_exhaustion_is_capped_at_standard_maximum(): void
    {
        // Request per_page=1000000
        $response = $this->getJson('/api/v1/stays?per_page=1000000');

        $response->assertStatus(200);
        // Meta per_page must not exceed 100
        $perPage = $response->json('meta.per_page') ?? $response->json('meta.pagination.per_page');
        $this->assertLessThanOrEqual(100, (int) $perPage);
    }

    /**
     * Attack 3: SQL Injection pattern inside search/filter parameter.
     */
    public function test_sql_injection_patterns_in_search_queries_are_handled_safely(): void
    {
        $sqliPayload = "' OR '1'='1' UNION SELECT * FROM users --";

        $response = $this->getJson('/api/v1/stays?search='.urlencode($sqliPayload));

        $response->assertStatus(200);
        // Must return safe JSON structure without SQLSTATE or error
        $response->assertJsonStructure(['data']);
    }
}
