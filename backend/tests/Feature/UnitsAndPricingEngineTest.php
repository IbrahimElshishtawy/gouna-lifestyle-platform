<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Property;
use App\Models\SeasonalPrice;
use App\Models\User;
use App\Modules\Pricing\Application\Queries\CalculateBookingQuoteQuery;
use App\Modules\Pricing\Application\Queries\GetMonthlyPricingCalendarQuery;
use Carbon\Carbon;
use Tests\TestCase;

class UnitsAndPricingEngineTest extends TestCase
{
    private User $admin;
    private Property $parentProperty;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::where('email', 'admin@gounow.com')->first()
            ?? User::create([
                'name' => 'Super Administrator',
                'email' => 'admin@gounow.com',
                'password' => bcrypt('GouNow@2026!Secure'),
                'is_admin' => true,
                'is_active' => true,
            ]);

        $this->parentProperty = Property::create([
            'reference_number' => 'GON-CMP-' . uniqid(),
            'slug' => 'test-compound-' . uniqid(),
            'title_en' => 'Lagoon Heights Compound',
            'title_ar' => 'كمبوند لاجون هايتس',
            'listing_type' => 'rent',
            'compound' => 'Lagoon Heights',
            'bedrooms' => 10,
            'bathrooms' => 10,
            'max_guests' => 20,
            'base_price_cents' => 1000000, // 10,000 EGP
            'currency' => 'EGP',
            'min_stay_nights' => 2,
            'cleaning_fee_cents' => 50000,
            'service_fee_cents' => 30000,
            'tax_percentage' => 14,
            'is_published' => true,
            'is_available' => true,
            'status' => 'published',
        ]);
    }

    public function test_admin_can_create_sub_unit_under_parent_property(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->withSession(['2fa_verified' => true])
            ->postJson("/api/v1/admin/properties/{$this->parentProperty->id}/units", [
                'unit_number' => 'Villa 4B',
                'title_en' => 'Villa 4B Deluxe Lagoon View',
                'title_ar' => 'فيلا 4B ديلوكس إطلالة لاجون',
                'view' => 'Lagoon View',
                'bedrooms' => 3,
                'bathrooms' => 3,
                'max_guests' => 6,
                'area_sqm' => 220,
                'base_price_cents' => 850000, // 8,500 EGP
                'currency' => 'EGP',
                'status' => 'published',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.unit_number', 'Villa 4B')
            ->assertJsonPath('data.parent_id', $this->parentProperty->id)
            ->assertJsonPath('data.view', 'Lagoon View')
            ->assertJsonPath('data.base_price_cents', 850000);

        $unitId = $response->json('data.id');
        $this->assertDatabaseHas('properties', [
            'id' => $unitId,
            'parent_id' => $this->parentProperty->id,
            'unit_number' => 'Villa 4B',
        ]);
    }

    public function test_admin_can_list_and_show_sub_units(): void
    {
        // Create 2 child units
        $unit1 = Property::create([
            'parent_id' => $this->parentProperty->id,
            'reference_number' => 'GON-UNT-' . rand(1000, 9999),
            'slug' => 'test-unit-1-' . rand(1000, 9999),
            'unit_number' => 'Apt 101',
            'title_en' => 'Apartment 101',
            'view' => 'Sea View',
            'bedrooms' => 2,
            'bathrooms' => 2,
            'max_guests' => 4,
            'base_price_cents' => 500000,
            'currency' => 'EGP',
            'is_published' => true,
            'is_available' => true,
            'status' => 'published',
        ]);

        $unit2 = Property::create([
            'parent_id' => $this->parentProperty->id,
            'reference_number' => 'GON-UNT-' . rand(1000, 9999),
            'slug' => 'test-unit-2-' . rand(1000, 9999),
            'unit_number' => 'Apt 102',
            'title_en' => 'Apartment 102',
            'view' => 'Golf View',
            'bedrooms' => 1,
            'bathrooms' => 1,
            'max_guests' => 2,
            'base_price_cents' => 350000,
            'currency' => 'EGP',
            'is_published' => false,
            'is_available' => true,
            'status' => 'draft',
        ]);

        // List units
        $listResponse = $this->actingAs($this->admin, 'sanctum')
            ->withSession(['2fa_verified' => true])
            ->getJson("/api/v1/admin/properties/{$this->parentProperty->id}/units");

        $listResponse->assertStatus(200)
            ->assertJsonCount(2, 'data');

        // Show single unit
        $showResponse = $this->actingAs($this->admin, 'sanctum')
            ->withSession(['2fa_verified' => true])
            ->getJson("/api/v1/admin/properties/{$this->parentProperty->id}/units/{$unit1->id}");

        $showResponse->assertStatus(200)
            ->assertJsonPath('data.id', $unit1->id)
            ->assertJsonPath('data.parent.id', $this->parentProperty->id)
            ->assertJsonPath('data.unit_number', 'Apt 101');
    }

    public function test_admin_can_update_and_delete_sub_unit(): void
    {
        $unit = Property::create([
            'parent_id' => $this->parentProperty->id,
            'reference_number' => 'GON-UNT-' . rand(1000, 9999),
            'slug' => 'test-unit-del-' . rand(1000, 9999),
            'unit_number' => 'Chalet 1',
            'title_en' => 'Chalet 1 Original',
            'view' => 'Garden View',
            'bedrooms' => 2,
            'bathrooms' => 2,
            'max_guests' => 4,
            'base_price_cents' => 400000,
            'currency' => 'EGP',
            'is_published' => true,
            'is_available' => true,
            'status' => 'published',
        ]);

        // Update
        $updateResponse = $this->actingAs($this->admin, 'sanctum')
            ->withSession(['2fa_verified' => true])
            ->putJson("/api/v1/admin/properties/{$this->parentProperty->id}/units/{$unit->id}", [
                'unit_number' => 'Chalet 1 Renovation',
                'title_en' => 'Chalet 1 Deluxe Modern',
                'view' => 'Lagoon View',
                'base_price_cents' => 550000,
            ]);

        $updateResponse->assertStatus(200)
            ->assertJsonPath('data.unit_number', 'Chalet 1 Renovation')
            ->assertJsonPath('data.view', 'Lagoon View')
            ->assertJsonPath('data.base_price_cents', 550000);

        // Delete
        $deleteResponse = $this->actingAs($this->admin, 'sanctum')
            ->withSession(['2fa_verified' => true])
            ->deleteJson("/api/v1/admin/properties/{$this->parentProperty->id}/units/{$unit->id}");

        $deleteResponse->assertStatus(200);
        $this->assertSoftDeleted('properties', ['id' => $unit->id]);
    }

    public function test_pricing_engine_supports_hierarchy_and_global_rules(): void
    {
        $startDate = Carbon::now()->addDays(10)->format('Y-m-d');
        $endDate = Carbon::now()->addDays(20)->format('Y-m-d');

        // 1. Create a Global Rule (property_id = null)
        $globalRule = SeasonalPrice::create([
            'property_id' => null,
            'name_en' => 'Global Low Season Discount',
            'start_date' => $startDate,
            'end_date' => $endDate,
            'price_cents' => 450000, // 4,500 EGP
            'priority' => 10,
            'rule_type' => 'season',
            'adjustment_type' => 'fixed',
            'is_active' => true,
        ]);

        $query = new CalculateBookingQuoteQuery();

        // Check calculation for parent property (base price is 10,000 EGP)
        // With global rule at 4,500 EGP, it should use global rate
        $quote1 = $query->execute(
            $this->parentProperty,
            Carbon::now()->addDays(12)->startOfDay(),
            Carbon::now()->addDays(15)->startOfDay(),
            2
        );

        $this->assertEquals(450000, $quote1->nightlyPrices[0]['price_cents']);
        $this->assertEquals($globalRule->id, $quote1->nightlyPrices[0]['seasonal_price_id']);

        // 2. Add Property-level rule with higher priority (20)
        $propertyRule = SeasonalPrice::create([
            'property_id' => $this->parentProperty->id,
            'name_en' => 'Lagoon Heights Summer Peak',
            'start_date' => $startDate,
            'end_date' => $endDate,
            'price_cents' => 1200000, // 12,000 EGP
            'priority' => 20,
            'rule_type' => 'season',
            'adjustment_type' => 'fixed',
            'is_active' => true,
        ]);

        $quote2 = $query->execute(
            $this->parentProperty,
            Carbon::now()->addDays(12)->startOfDay(),
            Carbon::now()->addDays(15)->startOfDay(),
            2
        );

        $this->assertEquals(1200000, $quote2->nightlyPrices[0]['price_cents']);
        $this->assertEquals($propertyRule->id, $quote2->nightlyPrices[0]['seasonal_price_id']);
    }

    public function test_pricing_engine_supports_weekend_percentage_markup(): void
    {
        // Parent property base price is 10,000 EGP (1,000,000 cents)
        // Weekend rule: +20% on Friday & Saturday
        SeasonalPrice::create([
            'property_id' => $this->parentProperty->id,
            'name_en' => 'Weekend 20% Markup',
            'start_date' => Carbon::now()->subDays(5)->format('Y-m-d'),
            'end_date' => Carbon::now()->addDays(60)->format('Y-m-d'),
            'price_cents' => 0,
            'priority' => 15,
            'rule_type' => 'weekend',
            'adjustment_type' => 'percentage',
            'adjustment_percent' => 20,
            'days_of_week' => ['Friday', 'Saturday'],
            'is_active' => true,
        ]);

        // Find next Friday and Thursday
        $nextFriday = Carbon::now()->next(Carbon::FRIDAY);
        $nextSaturday = (clone $nextFriday)->addDay();
        $nextSunday = (clone $nextSaturday)->addDay();

        $query = new CalculateBookingQuoteQuery();

        // Quote from Friday to Sunday (2 nights: Friday night + Saturday night)
        $quoteWeekend = $query->execute(
            $this->parentProperty,
            $nextFriday->copy()->startOfDay(),
            $nextSunday->copy()->startOfDay(),
            2
        );

        // Friday night should be 10,000 + 20% = 12,000 EGP (1,200,000 cents)
        $this->assertEquals(1200000, $quoteWeekend->nightlyPrices[0]['price_cents']);
        $this->assertEquals(1200000, $quoteWeekend->nightlyPrices[1]['price_cents']);

        // Now test Thursday night (should be base rate: 10,000 EGP)
        $thursday = (clone $nextFriday)->subDay();
        $quoteWeekday = $query->execute(
            $this->parentProperty,
            $thursday->copy()->startOfDay(),
            $nextFriday->copy()->startOfDay(),
            2
        );

        $this->assertEquals(1000000, $quoteWeekday->nightlyPrices[0]['price_cents']);
    }

    public function test_monthly_pricing_calendar_matrix_reflects_rules(): void
    {
        $year = (int) Carbon::now()->year;
        $month = (int) Carbon::now()->month;

        $matrixQuery = new GetMonthlyPricingCalendarQuery();
        $calendar = $matrixQuery->execute($this->parentProperty, $year, $month);

        $this->assertNotEmpty($calendar);
        $firstDayKey = sprintf('%04d-%02d-01', $year, $month);
        $this->assertArrayHasKey($firstDayKey, $calendar);
        $this->assertEquals($this->parentProperty->base_price_cents, $calendar[$firstDayKey]['price_cents']);
    }

    public function test_admin_can_parse_google_maps_location_url(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->withSession(['2fa_verified' => true])
            ->postJson('/api/v1/admin/properties/parse-location', [
                'url' => 'https://www.google.com/maps?q=27.3965,33.6782',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertEquals(27.3965, round((float) $response->json('latitude'), 4));
        $this->assertEquals(33.6782, round((float) $response->json('longitude'), 4));
    }

    public function test_admin_can_update_property_geolocation_coordinates(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->withSession(['2fa_verified' => true])
            ->putJson("/api/v1/admin/properties/{$this->parentProperty->id}", [
                'latitude' => 27.3965,
                'longitude' => 33.6782,
                'address' => 'Abu Tig Marina, El Gouna',
                'map_url' => 'https://maps.google.com/?q=27.3965,33.6782',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.address', 'Abu Tig Marina, El Gouna');

        $this->assertEquals(27.3965, round((float) $response->json('data.latitude'), 4));
        $this->assertEquals(33.6782, round((float) $response->json('data.longitude'), 4));

        $this->assertDatabaseHas('properties', [
            'id' => $this->parentProperty->id,
            'address' => 'Abu Tig Marina, El Gouna',
        ]);
    }

    public function test_pricing_overview_and_rules_include_parent_and_sub_unit_hierarchy(): void
    {
        // Create a child unit
        $unit = Property::create([
            'parent_id' => $this->parentProperty->id,
            'reference_number' => 'GON-UNT-' . rand(1000, 9999),
            'slug' => 'test-pricing-unit-' . rand(1000, 9999),
            'unit_number' => 'Lagoon Suite 101',
            'title_en' => 'Lagoon Suite 101',
            'listing_type' => 'rent',
            'base_price_cents' => 600000,
            'currency' => 'EGP',
            'is_published' => true,
            'is_available' => true,
            'status' => 'published',
        ]);

        // Create rule targeting this child unit
        SeasonalPrice::create([
            'property_id' => $unit->id,
            'name_en' => 'Spring Suite Rate',
            'start_date' => Carbon::now()->addDays(5)->toDateString(),
            'end_date' => Carbon::now()->addDays(20)->toDateString(),
            'price_cents' => 750000,
            'priority' => 5,
            'is_active' => true,
        ]);

        // Check Overview
        $overviewResponse = $this->actingAs($this->admin, 'sanctum')
            ->withSession(['2fa_verified' => true])
            ->getJson('/api/v1/admin/pricing/overview');

        $overviewResponse->assertStatus(200);
        $unitsInOverview = collect($overviewResponse->json('properties'))->firstWhere('id', $unit->id);
        $this->assertNotNull($unitsInOverview);
        $this->assertEquals($this->parentProperty->id, $unitsInOverview['parent_id']);
        $this->assertEquals($this->parentProperty->title_en, $unitsInOverview['parent_title']);

        // Check Rules
        $rulesResponse = $this->actingAs($this->admin, 'sanctum')
            ->withSession(['2fa_verified' => true])
            ->getJson("/api/v1/admin/pricing/rules?property_id={$unit->id}");

        $rulesResponse->assertStatus(200);
        $ruleItem = collect($rulesResponse->json('data'))->firstWhere('property_id', $unit->id);
        $this->assertNotNull($ruleItem);
        $this->assertEquals($this->parentProperty->id, $ruleItem['parent_id']);
    }

    public function test_location_parser_handles_at_coordinates_url(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->withSession(['2fa_verified' => true])
            ->postJson('/api/v1/admin/properties/parse-location', [
                'url' => 'https://www.google.com/maps/@27.412000,33.681000,16z',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true);
        $this->assertEquals(27.412, round((float) $response->json('latitude'), 4));
        $this->assertEquals(33.681, round((float) $response->json('longitude'), 4));
    }

    public function test_location_parser_handles_direct_coordinate_string(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->withSession(['2fa_verified' => true])
            ->postJson('/api/v1/admin/properties/parse-location', [
                'url' => '27.382000, 33.665000',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true);
        $this->assertEquals(27.382, round((float) $response->json('latitude'), 4));
        $this->assertEquals(33.665, round((float) $response->json('longitude'), 4));
    }

    public function test_location_parser_rejects_url_without_coordinates(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->withSession(['2fa_verified' => true])
            ->postJson('/api/v1/admin/properties/parse-location', [
                'url' => 'https://www.google.com/search?q=el+gouna+properties',
            ]);

        $response->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Unable to detect the exact coordinates from this link. Please choose the location on the map.');
    }

    public function test_property_update_rejects_invalid_latitude_or_longitude(): void
    {
        // Latitude out of bounds (> 90)
        $response1 = $this->actingAs($this->admin, 'sanctum')
            ->withSession(['2fa_verified' => true])
            ->putJson("/api/v1/admin/properties/{$this->parentProperty->id}", [
                'latitude' => 95.5,
                'longitude' => 33.6,
            ]);
        $response1->assertStatus(422)
            ->assertJsonPath('error.code', 'VALIDATION_ERROR')
            ->assertJsonStructure(['error' => ['details' => ['latitude']]]);

        // Longitude out of bounds (> 180)
        $response2 = $this->actingAs($this->admin, 'sanctum')
            ->withSession(['2fa_verified' => true])
            ->putJson("/api/v1/admin/properties/{$this->parentProperty->id}", [
                'latitude' => 27.5,
                'longitude' => 195.0,
            ]);
        $response2->assertStatus(422)
            ->assertJsonPath('error.code', 'VALIDATION_ERROR')
            ->assertJsonStructure(['error' => ['details' => ['longitude']]]);
    }

    public function test_four_tier_pricing_hierarchy_specificity_resolution(): void
    {
        $startDate = Carbon::now()->addDays(30)->format('Y-m-d');
        $endDate = Carbon::now()->addDays(40)->format('Y-m-d');

        // Create Child Unit (base: 5,000 EGP = 500,000 cents)
        $unit = Property::create([
            'parent_id' => $this->parentProperty->id,
            'reference_number' => 'GON-UNT-HIER-' . uniqid(),
            'slug' => 'test-hierarchy-unit-' . uniqid(),
            'unit_number' => 'Villa H1',
            'title_en' => 'Villa Hierarchy 1',
            'listing_type' => 'rent',
            'base_price_cents' => 500000,
            'currency' => 'EGP',
            'is_published' => true,
            'is_available' => true,
            'status' => 'published',
        ]);

        $query = new CalculateBookingQuoteQuery();
        $targetDate = Carbon::now()->addDays(32)->startOfDay();

        // 1. Only Global Rule exists: Global = 6,000 EGP (Priority 10)
        $globalRule = SeasonalPrice::create([
            'property_id' => null,
            'name_en' => 'Global Summer',
            'start_date' => $startDate,
            'end_date' => $endDate,
            'price_cents' => 600000,
            'priority' => 10,
            'rule_type' => 'season',
            'is_active' => true,
        ]);

        $quoteGlobal = $query->execute($unit, $targetDate, (clone $targetDate)->addDay(), 2);
        $this->assertEquals(600000, $quoteGlobal->nightlyPrices[0]['price_cents']);

        // 2. Property-level rule added: Property = 7,000 EGP (Priority 5, lower than Global's 10)
        // Property rule must WIN over Global rule due to higher specificity
        $propertyRule = SeasonalPrice::create([
            'property_id' => $this->parentProperty->id,
            'name_en' => 'Property Compound Summer',
            'start_date' => $startDate,
            'end_date' => $endDate,
            'price_cents' => 700000,
            'priority' => 5,
            'rule_type' => 'season',
            'is_active' => true,
        ]);

        $quoteProp = $query->execute($unit, $targetDate, (clone $targetDate)->addDay(), 2);
        $this->assertEquals(700000, $quoteProp->nightlyPrices[0]['price_cents']);

        // 3. Unit-specific rule added: Unit = 8,000 EGP (Priority 2, lower than Property's 5)
        // Unit rule must WIN over Property and Global rules due to higher specificity
        $unitRule = SeasonalPrice::create([
            'property_id' => $unit->id,
            'name_en' => 'Villa H1 Exclusive Rate',
            'start_date' => $startDate,
            'end_date' => $endDate,
            'price_cents' => 800000,
            'priority' => 2,
            'rule_type' => 'season',
            'is_active' => true,
        ]);

        $quoteUnit = $query->execute($unit, $targetDate, (clone $targetDate)->addDay(), 2);
        $this->assertEquals(800000, $quoteUnit->nightlyPrices[0]['price_cents']);

        // 4. Date-specific Override added: Override = 12,000 EGP (Priority 1)
        // Override must WIN over everything due to highest specificity
        SeasonalPrice::create([
            'property_id' => $unit->id,
            'name_en' => 'Special Festival Date Override',
            'start_date' => $startDate,
            'end_date' => $endDate,
            'price_cents' => 1200000,
            'priority' => 1,
            'rule_type' => 'override',
            'is_active' => true,
        ]);

        $quoteOverride = $query->execute($unit, $targetDate, (clone $targetDate)->addDay(), 2);
        $this->assertEquals(1200000, $quoteOverride->nightlyPrices[0]['price_cents']);
    }
}
