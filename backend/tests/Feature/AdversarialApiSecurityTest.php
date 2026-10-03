<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Customer;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdversarialApiSecurityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);
    }

    public function test_api_responses_include_mandatory_security_headers(): void
    {
        $response = $this->getJson('/api/v1/stays');

        $response->assertStatus(200);
        $response->assertHeader('X-Content-Type-Options', 'nosniff');
        $response->assertHeader('X-Frame-Options', 'SAMEORIGIN');
        $response->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->assertHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
    }

    public function test_web_responses_include_mandatory_security_headers(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
        $response->assertHeader('X-Content-Type-Options', 'nosniff');
        $response->assertHeader('X-Frame-Options', 'SAMEORIGIN');
        $response->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    }

    public function test_customer_cannot_view_another_customers_booking_via_api(): void
    {
        $userA = User::factory()->create(['is_admin' => false]);
        $customerA = Customer::create([
            'user_id' => $userA->id,
            'first_name' => 'Alice',
            'last_name' => 'Smith',
            'email' => $userA->email,
        ]);

        $userB = User::factory()->create(['is_admin' => false]);
        $customerB = Customer::create([
            'user_id' => $userB->id,
            'first_name' => 'Bob',
            'last_name' => 'Jones',
            'email' => $userB->email,
        ]);

        $bookingB = Booking::create([
            'reference' => 'BK-SECRET-B01',
            'customer_id' => $customerB->id,
            'check_in' => now()->addDays(5)->toDateString(),
            'check_out' => now()->addDays(10)->toDateString(),
            'nights' => 5,
            'guests' => 2,
            'subtotal_cents' => 50000,
            'total_cents' => 50000,
            'currency' => 'EUR',
            'status' => 'confirmed',
            'payment_status' => 'paid',
        ]);

        // User A attempts to view User B's booking
        $response = $this->actingAs($userA, 'sanctum')
            ->getJson("/api/v1/customer/bookings/{$bookingB->reference}");

        // Must reject with 403 or 404 (IDOR prevention)
        $this->assertContains($response->status(), [403, 404]);
    }

    public function test_customer_cannot_cancel_another_customers_booking(): void
    {
        $userA = User::factory()->create(['is_admin' => false]);
        $customerA = Customer::create([
            'user_id' => $userA->id,
            'first_name' => 'Alice',
            'last_name' => 'Smith',
            'email' => $userA->email,
        ]);

        $userB = User::factory()->create(['is_admin' => false]);
        $customerB = Customer::create([
            'user_id' => $userB->id,
            'first_name' => 'Bob',
            'last_name' => 'Jones',
            'email' => $userB->email,
        ]);

        $bookingB = Booking::create([
            'reference' => 'BK-CANCEL-TARGET-02',
            'customer_id' => $customerB->id,
            'check_in' => now()->addDays(5)->toDateString(),
            'check_out' => now()->addDays(10)->toDateString(),
            'nights' => 5,
            'guests' => 2,
            'subtotal_cents' => 50000,
            'total_cents' => 50000,
            'currency' => 'EUR',
            'status' => 'confirmed',
            'payment_status' => 'paid',
        ]);

        $response = $this->actingAs($userA, 'sanctum')
            ->postJson("/api/v1/customer/bookings/{$bookingB->reference}/cancel", [
                'cancellation_reason' => 'Malicious cancel attempt',
            ]);

        $this->assertContains($response->status(), [403, 404]);
        $this->assertEquals('confirmed', $bookingB->fresh()->status);
    }

    public function test_unauthenticated_and_regular_customers_cannot_access_admin_endpoints(): void
    {
        // Unauthenticated
        $this->get('/admin/properties')->assertRedirect('/admin/login');
        $this->getJson('/api/v1/admin/ping')->assertStatus(401);

        // Authenticated customer without admin role
        $customerUser = User::factory()->create(['is_admin' => false]);
        $this->actingAs($customerUser, 'web')
            ->get('/admin/properties')
            ->assertStatus(403);

        $this->actingAs($customerUser, 'sanctum')
            ->getJson('/api/v1/admin/ping')
            ->assertStatus(403);
    }

    public function test_login_returns_identical_generic_error_for_nonexistent_and_wrong_password(): void
    {
        $existingUser = User::factory()->create([
            'email' => 'realuser@gounow.com',
            'password' => bcrypt('CorrectPassword123!'),
        ]);

        $resWrongPassword = $this->postJson('/api/v1/auth/login', [
            'email' => 'realuser@gounow.com',
            'password' => 'WrongPassword999!',
        ]);

        $resNonexistentUser = $this->postJson('/api/v1/auth/login', [
            'email' => 'fake_nonexistent_user_999@gounow.com',
            'password' => 'AnyPassword123!',
        ]);

        $this->assertEquals(422, $resWrongPassword->status());
        $this->assertEquals(422, $resNonexistentUser->status());
        $this->assertEquals(
            $resWrongPassword->json('error.details.email.0'),
            $resNonexistentUser->json('error.details.email.0'),
            'Account enumeration defense: Error messages for nonexistent vs wrong password must be identical.'
        );
    }

    public function test_path_traversal_attempts_return_404_not_error(): void
    {
        $traversalAttempts = [
            '../../etc/passwd',
            '..%2F..%2Fetc%2Fpasswd',
            '....//....//config.php',
            '%2e%2e%2f%2e%2e%2fenv',
        ];

        foreach ($traversalAttempts as $attempt) {
            $response = $this->getJson("/api/v1/stays/{$attempt}");
            $this->assertContains($response->status(), [404, 400]);
        }
    }

    public function test_sql_injection_payloads_in_filter_parameters_are_safely_handled(): void
    {
        $payloads = [
            "' OR '1'='1",
            '1; DROP TABLE users; --',
            "admin'--",
            'UNION SELECT * FROM users',
        ];

        foreach ($payloads as $payload) {
            $response = $this->getJson('/api/v1/stays?location='.$payload.'&search='.$payload);
            // Must return 200 with empty list or 422 validation error, NEVER 500 database error
            $this->assertNotEquals(500, $response->status(), 'SQL injection attempt must not cause 500 DB error');
        }
    }
}
