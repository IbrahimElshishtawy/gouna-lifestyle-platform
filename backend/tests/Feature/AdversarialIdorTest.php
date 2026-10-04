<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Customer;
use App\Models\Property;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdversarialIdorTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);
    }

    private function createCustomer(): Customer
    {
        $user = User::factory()->create([
            'is_admin' => false,
            'is_active' => true,
        ]);

        return Customer::create([
            'user_id' => $user->id,
            'first_name' => 'IDOR',
            'last_name' => 'User',
            'email' => $user->email,
            'phone' => '+2010'.rand(10000000, 99999999),
        ]);
    }

    private function createProperty(): Property
    {
        return Property::create([
            'reference_number' => 'PROP-IDOR-'.uniqid(),
            'slug' => 'idor-villa-'.uniqid(),
            'title_en' => 'IDOR Test Villa',
            'title_ar' => 'فيلا تجربة IDOR',
            'listing_type' => 'rent',
            'base_price_cents' => 300000,
            'currency' => 'EGP',
            'is_published' => true,
            'status' => 'published',
        ]);
    }

    /**
     * IDOR Matrix 1: Accessing another user's booking via checkout confirmation endpoint.
     */
    public function test_idor_matrix_checkout_confirmation_page(): void
    {
        $owner = $this->createCustomer();
        $attacker = $this->createCustomer();

        $booking = Booking::create([
            'reference' => 'BK-IDOR-'.uniqid(),
            'customer_id' => $owner->id,
            'bookable_type' => Property::class,
            'bookable_id' => $this->createProperty()->id,
            'check_in' => '2026-12-01',
            'check_out' => '2026-12-05',
            'nights' => 4,
            'status' => 'confirmed',
            'payment_status' => 'paid',
            'total_cents' => 1200000,
            'currency' => 'EGP',
            'booking_access_token' => hash('sha256', 'secret-token-xyz'),
        ]);

        // Scenario A: Attacker tries bare reference without token -> 404
        $resBare = $this->get("/checkout/confirmation/{$booking->reference}");
        $resBare->assertStatus(404);

        // Scenario B: Attacker tries forged token -> 404
        $resForged = $this->get("/checkout/confirmation/{$booking->reference}?token=forged-token");
        $resForged->assertStatus(404);

        // Scenario C: Authenticated Attacker tries accessing Owner's booking -> 404
        $resAuthAttacker = $this->actingAs($attacker->user)
            ->get("/checkout/confirmation/{$booking->reference}");
        $resAuthAttacker->assertStatus(404);

        // Scenario D: Valid token -> 200
        $resValid = $this->get("/checkout/confirmation/{$booking->reference}?token=secret-token-xyz");
        $resValid->assertStatus(200);

        // Scenario E: Legitimate Owner logged in -> 200
        $resOwner = $this->actingAs($owner->user)
            ->get("/checkout/confirmation/{$booking->reference}");
        $resOwner->assertStatus(200);
    }

    /**
     * IDOR Matrix 2: Non-existent booking reference must return 404 without leaking stack trace.
     */
    public function test_idor_non_existent_reference_returns_404(): void
    {
        $response = $this->get('/checkout/confirmation/BK-DOES-NOT-EXIST-999');
        $response->assertStatus(404);
    }

    /**
     * IDOR Matrix 3: Customer API booking lookup with ID of another customer returns 404.
     */
    public function test_idor_customer_api_isolated_by_authenticated_customer(): void
    {
        $customerA = $this->createCustomer();
        $customerB = $this->createCustomer();

        $bookingB = Booking::create([
            'reference' => 'BK-B-'.uniqid(),
            'customer_id' => $customerB->id,
            'bookable_type' => Property::class,
            'bookable_id' => $this->createProperty()->id,
            'check_in' => '2026-12-10',
            'check_out' => '2026-12-15',
            'nights' => 5,
            'status' => 'confirmed',
            'payment_status' => 'paid',
            'total_cents' => 1500000,
            'currency' => 'EGP',
            'booking_access_token' => hash('sha256', 'token-b'),
        ]);

        $response = $this->actingAs($customerA->user, 'sanctum')
            ->getJson("/api/v1/customer/bookings/{$bookingB->reference}");

        $response->assertStatus(404);
        $response->assertJsonMissing(['total_cents' => 1500000]);
    }

    /**
     * IDOR Matrix 4: Public Checkout API booking lookup isolated and requires token/ownership.
     */
    public function test_idor_public_checkout_api_isolated_and_requires_authorization(): void
    {
        $customerA = $this->createCustomer();
        $customerB = $this->createCustomer();

        $bookingB = Booking::create([
            'reference' => 'BK-PUB-'.uniqid(),
            'customer_id' => $customerB->id,
            'bookable_type' => Property::class,
            'bookable_id' => $this->createProperty()->id,
            'check_in' => '2026-12-10',
            'check_out' => '2026-12-15',
            'nights' => 5,
            'status' => 'confirmed',
            'payment_status' => 'paid',
            'total_cents' => 1800000,
            'currency' => 'EGP',
            'booking_access_token' => hash('sha256', 'valid-api-token-123'),
        ]);

        // 1. Unauthenticated bare reference -> 404
        $resBare = $this->getJson("/api/v1/checkout/bookings/{$bookingB->reference}");
        $resBare->assertStatus(404);

        // 2. Unauthenticated forged token -> 404
        $resForged = $this->getJson("/api/v1/checkout/bookings/{$bookingB->reference}?token=wrong-token");
        $resForged->assertStatus(404);

        // 3. Authenticated customer A (different user) without token -> 404
        $resOtherUser = $this->actingAs($customerA->user, 'sanctum')
            ->getJson("/api/v1/checkout/bookings/{$bookingB->reference}");
        $resOtherUser->assertStatus(404);

        // 4. Authenticated owner customer B -> 200
        $resOwner = $this->actingAs($customerB->user, 'sanctum')
            ->getJson("/api/v1/checkout/bookings/{$bookingB->reference}");
        $resOwner->assertStatus(200)
            ->assertJsonPath('data.attributes.reference', $bookingB->reference);

        // 5. Guest with valid token in query -> 200
        $resGuest = $this->getJson("/api/v1/checkout/bookings/{$bookingB->reference}?token=valid-api-token-123");
        $resGuest->assertStatus(200)
            ->assertJsonPath('data.attributes.reference', $bookingB->reference);
    }
}
