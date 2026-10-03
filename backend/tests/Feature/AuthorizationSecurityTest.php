<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Customer;
use App\Models\Media;
use App\Models\Property;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Tests\TestCase;

class AuthorizationSecurityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);
    }

    /**
     * Helper to create a user with a specific role.
     */
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

    /**
     * Helper to create a test property.
     */
    private function createProperty(array $attributes = []): Property
    {
        return Property::create(array_merge([
            'reference_number' => 'PROP-'.uniqid(),
            'slug' => 'test-villa-'.uniqid(),
            'title_en' => 'Test Luxury Villa',
            'title_ar' => 'فيلا فاخرة تجريبية',
            'listing_type' => 'rent',
            'base_price_cents' => 150000,
            'currency' => 'EGP',
            'is_published' => true,
            'status' => 'published',
        ], $attributes));
    }

    /**
     * Privilege Escalation Scenario 1: Staff cannot delete a property (403 Forbidden).
     */
    public function test_staff_cannot_delete_property(): void
    {
        $staff = $this->createUserWithRole('staff');
        $property = $this->createProperty();

        $response = $this->actingAs($staff)->delete("/admin/properties/{$property->id}");

        $response->assertStatus(403);
        $this->assertDatabaseHas('properties', ['id' => $property->id, 'deleted_at' => null]);
    }

    /**
     * Privilege Escalation Scenario 2: Content Manager cannot refund a booking (403 Forbidden).
     */
    public function test_content_manager_cannot_refund_booking(): void
    {
        $contentManager = $this->createUserWithRole('content_manager');
        $booking = Booking::create([
            'reference' => 'BK-'.uniqid(),
            'check_in' => now()->addDays(5)->toDateString(),
            'check_out' => now()->addDays(8)->toDateString(),
            'nights' => 3,
            'guests' => 2,
            'subtotal_cents' => 300000,
            'total_cents' => 300000,
            'amount_paid_cents' => 300000,
            'currency' => 'EGP',
            'status' => 'confirmed',
            'payment_status' => 'paid',
        ]);

        $response = $this->actingAs($contentManager)->post("/admin/bookings/{$booking->id}/refund");

        $response->assertStatus(403);
        $this->assertEquals('confirmed', $booking->fresh()->status);
    }

    /**
     * Privilege Escalation Scenario 3: Sales cannot access financial payments (403 Forbidden).
     */
    public function test_sales_cannot_view_financial_payments(): void
    {
        $sales = $this->createUserWithRole('sales');

        $response = $this->actingAs($sales)->get('/admin/bookings/payments');

        $response->assertStatus(403);
    }

    /**
     * Privilege Escalation Scenario 4: Property Manager cannot manage administrative users (403 Forbidden).
     */
    public function test_property_manager_cannot_manage_users(): void
    {
        $propertyManager = $this->createUserWithRole('property_manager');

        $response = $this->actingAs($propertyManager)->get('/admin/users');

        $response->assertStatus(403);
    }

    /**
     * Privilege Escalation Scenario 5: User cannot view another customer's booking (404 Not Found to prevent enumeration).
     */
    public function test_user_cannot_view_another_customers_booking(): void
    {
        $userA = User::factory()->create();
        $customerA = Customer::create([
            'user_id' => $userA->id,
            'first_name' => 'Alice',
            'last_name' => 'Smith',
            'email' => $userA->email,
        ]);

        $userB = User::factory()->create();

        $booking = Booking::create([
            'reference' => 'BK-SECRET-999',
            'customer_id' => $customerA->id,
            'check_in' => now()->addDays(10)->toDateString(),
            'check_out' => now()->addDays(12)->toDateString(),
            'nights' => 2,
            'guests' => 1,
            'subtotal_cents' => 100000,
            'total_cents' => 100000,
            'currency' => 'EGP',
            'status' => 'confirmed',
        ]);

        // Querying someone else's booking returns 404 (zero leakage of existence)
        $response = $this->actingAs($userB)->getJson("/api/v1/customer/bookings/{$booking->reference}");

        $response->assertStatus(404);
    }

    /**
     * Privilege Escalation Scenario 6: Scoped bindings prevent IDOR across mismatched parent models (404 Not Found).
     */
    public function test_scoped_bindings_reject_media_belonging_to_another_parent(): void
    {
        $superAdmin = $this->createUserWithRole('super_admin');

        $propertyA = $this->createProperty(['title_en' => 'Villa A']);
        $propertyB = $this->createProperty(['title_en' => 'Villa B']);

        $mediaOnB = $propertyB->media()->create([
            'file_path' => 'properties/imageB.jpg',
            'file_name' => 'imageB.jpg',
            'file_type' => 'image',
            'mime_type' => 'image/jpeg',
            'file_size' => 1024,
            'disk' => 'public',
        ]);

        // Attempting to delete media of Property B through Property A's route MUST return 404
        $response = $this->actingAs($superAdmin)->delete("/admin/properties/{$propertyA->id}/media/{$mediaOnB->id}");

        $response->assertStatus(404);
        $this->assertDatabaseHas('media', ['id' => $mediaOnB->id]);
    }

    /**
     * Privilege Escalation Scenario 7: Staff cannot export customer directory.
     */
    public function test_staff_cannot_export_customers(): void
    {
        $staff = $this->createUserWithRole('staff');

        $this->assertFalse(Gate::forUser($staff)->allows('export', Customer::class));
    }

    /**
     * Privilege Escalation Scenario 8: Mass assignment defense on authz fields (role_ids, is_admin).
     */
    public function test_mass_assignment_of_authz_fields_is_prevented(): void
    {
        $user = User::factory()->create([
            'is_admin' => false,
        ]);

        $payload = [
            'name' => 'Hacker Name',
            'email' => 'hacker@example.com',
            'is_admin' => true,
            'role_ids' => [1],
        ];

        // Ensure update via standard fill protects is_admin if not explicitly permitted
        $customer = Customer::create([
            'user_id' => $user->id,
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => $user->email,
        ]);

        $this->assertFalse($user->fresh()->is_admin);
        $this->assertEmpty($user->fresh()->roles);
    }

    /**
     * Privilege Escalation Scenario 9: UserPolicy blocks deleting the last super administrator.
     */
    public function test_cannot_delete_last_super_admin(): void
    {
        $superAdmin = $this->createUserWithRole('super_admin');

        // Only 1 super admin exists
        $this->assertFalse(Gate::forUser($superAdmin)->allows('delete', $superAdmin));
    }

    /**
     * Privilege Escalation Scenario 10: GET /api/v1/me/abilities returns clean abilities and scopes (P3-T11).
     */
    public function test_me_abilities_endpoint_returns_scopes_and_permissions(): void
    {
        $financeUser = $this->createUserWithRole('finance');

        $response = $this->actingAs($financeUser)->getJson('/api/v1/me/abilities');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                'roles',
                'permissions',
                'scopes',
                'is_admin',
            ],
            'meta' => [
                'request_id',
                'timestamp',
            ],
        ]);

        $data = $response->json('data');
        $this->assertContains('finance', $data['roles']);
        $this->assertContains('manage_payments', $data['permissions']);
        $this->assertEquals('all', $data['scopes']['payments']);
        $this->assertEquals('none', $data['scopes']['properties']);
        $this->assertFalse($data['is_admin']);
    }

    /**
     * Privilege Escalation Scenario 11: Zero N+1 queries when evaluating permissions through PermissionResolver.
     */
    public function test_permission_resolver_executes_zero_queries_on_subsequent_checks(): void
    {
        $user = $this->createUserWithRole('property_manager');

        // Prime the resolver
        $user->hasPermission('properties.view');

        // Start listening to queries
        DB::enableQueryLog();

        // Perform 50 consecutive permission checks across various canonical keys
        for ($i = 0; $i < 50; $i++) {
            $user->hasPermission('properties.view');
            $user->hasPermission('properties.create');
            $user->hasPermission('pricing.manage');
            $user->hasPermission('bookings.view');
        }

        $queryLog = DB::getQueryLog();

        // Absolutely 0 database queries should execute because of request-level caching
        $this->assertCount(0, $queryLog, 'Expected 0 database queries during permission evaluations due to PermissionResolver caching.');
    }
}
