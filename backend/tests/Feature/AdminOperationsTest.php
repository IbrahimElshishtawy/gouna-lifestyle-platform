<?php

namespace Tests\Feature;

use App\Models\AvailabilityBlock;
use App\Models\Booking;
use App\Models\Customer;
use App\Models\Property;
use App\Models\SeasonalPrice;
use App\Models\User;
use Carbon\Carbon;
use Tests\TestCase;

class AdminOperationsTest extends TestCase
{
    private User $admin;
    private Property $property;
    private Booking $booking;

    protected function setUp(): void
    {
        parent::setUp();

        // Retrieve or create super admin
        $this->admin = User::firstOrCreate(
            ['email' => 'admin@gounow.com'],
            [
                'name' => 'Super Administrator',
                'password' => bcrypt('GouNow@2026!Secure'),
                'is_admin' => true,
                'is_active' => true,
                'two_factor_secret' => 'SECRET',
                'two_factor_confirmed_at' => now(),
            ]
        );

        $this->property = Property::first() ?? Property::create([
            'reference_number' => 'GON-P-TEST01',
            'slug' => 'test-villa',
            'title_en' => 'Test Luxury Villa',
            'title_ar' => 'فيلا فاخرة تجريبية',
            'listing_type' => 'rent',
            'bedrooms' => 4,
            'bathrooms' => 4,
            'max_guests' => 8,
            'base_price_cents' => 500000,
            'currency' => 'EGP',
            'is_published' => true,
            'is_available' => true,
            'status' => 'published',
        ]);

        $customer = Customer::first() ?? Customer::create([
            'first_name' => 'Ahmed',
            'last_name' => 'Mohamed',
            'email' => 'ahmed@example.com',
            'phone' => '+201012345678',
        ]);

        $this->booking = Booking::firstOrCreate(
            ['reference' => 'GON-2026-TEST01'],
            [
                'customer_id' => $customer->id,
                'bookable_type' => Property::class,
                'bookable_id' => $this->property->id,
                'check_in' => now()->toDateString(),
                'check_out' => now()->addDays(3)->toDateString(),
                'nights' => 3,
                'guests' => 4,
                'subtotal_cents' => 1500000,
                'total_cents' => 1500000,
                'amount_paid_cents' => 1500000,
                'amount_remaining_cents' => 0,
                'currency' => 'EGP',
                'status' => 'confirmed',
                'payment_status' => 'paid',
            ]
        );
    }

    public function test_admin_can_view_booking_details(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson("/api/v1/admin/bookings/{$this->booking->id}");

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                'id',
                'reference',
                'status',
                'payment_status',
                'check_in',
                'check_out',
                'financials',
                'customer',
                'property',
                'transactions',
                'timeline',
            ],
        ]);
    }

    public function test_admin_can_checkin_and_checkout_guest(): void
    {
        // 1. Checkin
        $checkinResponse = $this->actingAs($this->admin, 'sanctum')
            ->postJson("/api/v1/admin/bookings/{$this->booking->id}/checkin", [
                'notes' => 'Guest arrived on time via limousine.',
            ]);

        $checkinResponse->assertStatus(200);
        $checkinResponse->assertJson(['success' => true]);

        // 2. Checkout
        $checkoutResponse = $this->actingAs($this->admin, 'sanctum')
            ->postJson("/api/v1/admin/bookings/{$this->booking->id}/checkout", [
                'notes' => 'Checked out smoothly, keys returned.',
            ]);

        $checkoutResponse->assertStatus(200);
        $checkoutResponse->assertJson([
            'success' => true,
            'data' => [
                'status' => 'completed',
            ],
        ]);
    }

    public function test_admin_can_extend_stay_with_availability_check(): void
    {
        $newCheckOut = Carbon::parse($this->booking->check_out)->addDays(2)->toDateString();

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson("/api/v1/admin/bookings/{$this->booking->id}/extend", [
                'new_check_out' => $newCheckOut,
            ]);

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);
        $this->assertEquals($newCheckOut, $this->booking->fresh()->check_out->toDateString());
    }

    public function test_admin_can_view_stay_management_dashboard(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/admin/bookings/stays');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'summary' => [
                'active_stays_count',
                'today_checkins_count',
                'today_checkouts_count',
            ],
            'data' => [
                'active_stays',
                'today_checkins',
                'today_checkouts',
            ],
        ]);
    }

    public function test_admin_can_manage_property_availability_blocks(): void
    {
        $startDate = now()->addMonths(2)->toDateString();
        $endDate = now()->addMonths(2)->addDays(5)->toDateString();

        // Add block
        $blockResponse = $this->actingAs($this->admin, 'sanctum')
            ->postJson("/api/v1/admin/properties/{$this->property->id}/availability-blocks", [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'status' => 'maintenance',
                'reason' => 'Annual pool maintenance',
            ]);

        $blockResponse->assertStatus(200);
        $blockId = $blockResponse->json('data.id');

        // Verify in calendar
        $calResponse = $this->actingAs($this->admin, 'sanctum')
            ->getJson("/api/v1/admin/properties/{$this->property->id}/calendar?year=" . now()->year);

        $calResponse->assertStatus(200);
        $calResponse->assertJsonStructure([
            'booked_ranges',
            'blocked_ranges',
            'seasonal_prices',
        ]);

        // Remove block
        $deleteResponse = $this->actingAs($this->admin, 'sanctum')
            ->deleteJson("/api/v1/admin/properties/{$this->property->id}/availability-blocks/{$blockId}");

        $deleteResponse->assertStatus(200);
        $this->assertDatabaseMissing('availability_blocks', ['id' => $blockId]);
    }

    public function test_admin_can_manage_seasonal_prices(): void
    {
        $startDate = now()->addMonths(3)->toDateString();
        $endDate = now()->addMonths(3)->addDays(14)->toDateString();

        // Add seasonal price
        $addResponse = $this->actingAs($this->admin, 'sanctum')
            ->postJson("/api/v1/admin/properties/{$this->property->id}/seasonal-prices", [
                'name_en' => 'High Season GFF',
                'start_date' => $startDate,
                'end_date' => $endDate,
                'price_cents' => 850000,
                'priority' => 5,
                'min_stay_nights' => 3,
            ]);

        $addResponse->assertStatus(200);
        $seasonId = $addResponse->json('data.id');

        // Delete seasonal price
        $deleteResponse = $this->actingAs($this->admin, 'sanctum')
            ->deleteJson("/api/v1/admin/properties/{$this->property->id}/seasonal-prices/{$seasonId}");

        $deleteResponse->assertStatus(200);
        $this->assertDatabaseMissing('seasonal_prices', ['id' => $seasonId]);
    }

    public function test_admin_can_fetch_taxonomies(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/admin/properties/taxonomies');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'categories',
            'locations',
            'amenities',
        ]);
    }
}
