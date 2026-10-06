<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Discount;
use App\Models\Property;
use App\Models\SeasonalPrice;
use App\Models\User;
use Carbon\Carbon;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminPricingAndPropertyTest extends TestCase
{
    private User $admin;
    private Property $property;

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

        $this->property = Property::create([
            'reference_number' => 'GON-TEST-' . rand(1000, 9999),
            'slug' => 'test-pricing-villa-' . rand(1000, 9999),
            'title_en' => 'Test Pricing Villa',
            'title_ar' => 'فيلا تسعير تجريبية',
            'listing_type' => 'rent',
            'bedrooms' => 3,
            'bathrooms' => 3,
            'max_guests' => 6,
            'base_price_cents' => 600000, // 6,000 EGP
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

    public function test_admin_can_parse_google_maps_location(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->withSession(['2fa_verified' => true])
            ->postJson('/api/v1/admin/properties/parse-location', [
                'url' => 'https://www.google.com/maps/@27.394851,33.678219,15z',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'latitude' => 27.394851,
                'longitude' => 33.678219,
            ]);
    }

    public function test_admin_can_create_property_with_valid_coordinates(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->withSession(['2fa_verified' => true])
            ->postJson('/api/v1/admin/properties', [
                'title_en' => 'New Laguna Chalet',
                'listing_type' => 'rent',
                'bedrooms' => 2,
                'bathrooms' => 2,
                'max_guests' => 4,
                'base_price_cents' => 400000,
                'latitude' => 27.395,
                'longitude' => 33.678,
                'min_stay_nights' => 2,
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
            ]);

        $this->assertDatabaseHas('properties', [
            'title_en' => 'New Laguna Chalet',
            'latitude' => 27.395,
        ]);
    }

    public function test_admin_can_fetch_pricing_overview(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->withSession(['2fa_verified' => true])
            ->getJson('/api/v1/admin/pricing');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'summary' => [
                    'total_rent_inventory',
                    'total_active_seasonal_rules',
                    'average_nightly_rate_cents',
                ],
                'properties',
                'upcoming_rules',
            ]);
    }

    public function test_admin_can_preview_price_quote_with_explanation(): void
    {
        $checkIn = Carbon::now()->addDays(5)->toDateString();
        $checkOut = Carbon::now()->addDays(8)->toDateString(); // 3 nights

        $response = $this->actingAs($this->admin, 'sanctum')
            ->withSession(['2fa_verified' => true])
            ->postJson('/api/v1/admin/pricing/preview', [
                'property_id' => $this->property->id,
                'check_in' => $checkIn,
                'check_out' => $checkOut,
                'guests' => 2,
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonStructure([
                'quote' => [
                    'nights',
                    'nightly_prices',
                    'subtotal_cents',
                    'cleaning_fee_cents',
                    'service_fee_cents',
                    'tax_cents',
                    'total_cents',
                    'deposit_cents',
                    'satisfies_min_stay',
                ],
                'explanation' => [
                    'base_nightly_rate',
                    'nights_count',
                    'final_total',
                    'min_stay_check',
                ],
            ]);
    }

    public function test_admin_can_fetch_pricing_calendar_matrix(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->withSession(['2fa_verified' => true])
            ->getJson("/api/v1/admin/pricing/calendar?property_id={$this->property->id}&year=2026&month=8");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'property' => ['id', 'reference_number', 'base_price_cents'],
                'year',
                'month',
                'calendar',
            ]);
    }

    public function test_admin_can_apply_date_range_price_override(): void
    {
        $start = Carbon::now()->addDays(10)->toDateString();
        $end = Carbon::now()->addDays(15)->toDateString();

        $response = $this->actingAs($this->admin, 'sanctum')
            ->withSession(['2fa_verified' => true])
            ->postJson('/api/v1/admin/pricing/override', [
                'property_id' => $this->property->id,
                'start_date' => $start,
                'end_date' => $end,
                'price_cents' => 950000, // 9,500 EGP
                'reason' => 'Peak El Gouna Festival Event',
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
            ]);

        $this->assertDatabaseHas('seasonal_prices', [
            'property_id' => $this->property->id,
            'price_cents' => 950000,
        ]);
    }

    public function test_admin_can_manage_discounts(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->withSession(['2fa_verified' => true])
            ->postJson('/api/v1/admin/pricing/discounts', [
                'name_en' => 'Summer Promo 2026',
                'code' => 'SUMMER26_' . rand(100, 999),
                'type' => 'percentage',
                'value' => 15,
                'is_active' => true,
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
            ]);
    }
}
