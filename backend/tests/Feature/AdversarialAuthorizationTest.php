<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Customer;
use App\Models\Location;
use App\Models\Property;
use App\Models\PropertyCategory;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdversarialAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);
    }

    private function createCustomer(?string $email = null): Customer
    {
        $user = User::factory()->create([
            'email' => $email ?? ('customer_'.uniqid().'@test.com'),
            'is_admin' => false,
            'is_active' => true,
        ]);

        return Customer::create([
            'user_id' => $user->id,
            'first_name' => 'Adversarial',
            'last_name' => 'Customer',
            'email' => $user->email,
            'phone' => '+2010'.rand(10000000, 99999999),
        ]);
    }

    private function createUserWithRole(string $roleName, array $attributes = []): User
    {
        $user = User::factory()->create(array_merge([
            'is_admin' => $roleName === 'super_admin',
            'is_active' => true,
        ], $attributes));

        $role = Role::where('name', $roleName)->first();
        if ($role) {
            $user->roles()->attach($role->id);
        }

        return $user;
    }

    private function createProperty(): Property
    {
        $category = PropertyCategory::firstOrCreate(['slug' => 'auth-cat'], ['name_en' => 'Auth Cat', 'is_active' => true]);
        $location = Location::firstOrCreate(['slug' => 'auth-loc'], ['name_en' => 'Auth Loc', 'city' => 'El Gouna', 'country' => 'Egypt', 'is_active' => true]);

        return Property::create([
            'reference_number' => 'PROP-AUTH-'.uniqid(),
            'slug' => 'villa-'.uniqid(),
            'property_category_id' => $category->id,
            'location_id' => $location->id,
            'title_en' => 'Adversarial Villa',
            'title_ar' => 'فيلا عدائية',
            'listing_type' => 'rent',
            'bedrooms' => 2,
            'bathrooms' => 2,
            'max_guests' => 4,
            'min_stay_nights' => 1,
            'max_stay_nights' => 30,
            'base_price_cents' => 200000,
            'currency' => 'EGP',
            'is_published' => true,
            'status' => 'published',
        ]);
    }

    /**
     * Attack 1: Horizontal privilege escalation — Customer A attempting to access Customer B booking.
     */
    public function test_customer_cannot_view_or_cancel_other_customer_booking(): void
    {
        $customerA = $this->createCustomer();
        $customerB = $this->createCustomer();

        $bookingB = Booking::create([
            'reference' => 'BK-'.uniqid(),
            'customer_id' => $customerB->id,
            'bookable_type' => Property::class,
            'bookable_id' => $this->createProperty()->id,
            'check_in' => '2026-11-01',
            'check_out' => '2026-11-05',
            'nights' => 4,
            'status' => 'confirmed',
            'payment_status' => 'paid',
            'total_cents' => 800000,
            'currency' => 'EGP',
            'booking_access_token' => hash('sha256', 'token-b'),
        ]);

        // Customer A tries to view Customer B's booking via customer API
        $response = $this->actingAs($customerA->user, 'sanctum')
            ->getJson("/api/v1/customer/bookings/{$bookingB->reference}");

        $response->assertStatus(404); // Must be 404 to avoid leaking existence

        // Customer A tries to cancel Customer B's booking
        $cancelResponse = $this->actingAs($customerA->user, 'sanctum')
            ->postJson("/api/v1/customer/bookings/{$bookingB->reference}/cancel");

        $cancelResponse->assertStatus(404);
        $this->assertEquals('confirmed', $bookingB->fresh()->status);
    }

    /**
     * Attack 2: Vertical privilege escalation — Customer attempting to access Admin endpoint.
     */
    public function test_customer_cannot_access_any_admin_endpoint(): void
    {
        $customer = $this->createCustomer();

        $response = $this->actingAs($customer->user)
            ->get('/admin');

        // Customer must be denied (redirected or 403)
        $this->assertTrue(in_array($response->status(), [302, 403]));
    }

    /**
     * Attack 3: Vertical privilege escalation — Staff attempting super-admin user deletion.
     */
    public function test_staff_cannot_escalate_to_user_management(): void
    {
        $staff = $this->createUserWithRole('staff');

        $response = $this->actingAs($staff)
            ->get('/admin/users');

        $response->assertStatus(403);
    }

    /**
     * Attack 4: Mass assignment attack — Attempting to inject is_admin / role_ids into customer profile.
     */
    public function test_mass_assignment_of_admin_flags_is_ignored_or_rejected(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/customer/me', [
                'name' => 'Attacker',
                'is_admin' => true,
                'role_id' => 1,
                'role' => 'super_admin',
            ]);

        $this->assertFalse((bool) $user->fresh()->is_admin);
    }

    /**
     * Attack 5: State-dependent authorization — Customer cannot cancel an already completed booking.
     */
    public function test_customer_cannot_cancel_completed_booking(): void
    {
        $customer = $this->createCustomer();

        $booking = Booking::create([
            'reference' => 'BK-COMPLETED-'.uniqid(),
            'customer_id' => $customer->id,
            'bookable_type' => Property::class,
            'bookable_id' => $this->createProperty()->id,
            'check_in' => '2026-09-01',
            'check_out' => '2026-09-05',
            'nights' => 4,
            'status' => 'completed',
            'payment_status' => 'paid',
            'total_cents' => 800000,
            'currency' => 'EGP',
            'booking_access_token' => hash('sha256', 'token-completed'),
        ]);

        $response = $this->actingAs($customer->user, 'sanctum')
            ->postJson("/api/v1/customer/bookings/{$booking->reference}/cancel");

        $response->assertStatus(422); // Invalid transition from completed
        $this->assertEquals('completed', $booking->fresh()->status);
    }
}
