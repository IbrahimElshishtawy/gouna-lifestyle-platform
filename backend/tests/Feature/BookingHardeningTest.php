<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Customer;
use App\Models\Location;
use App\Models\PaymentMethod;
use App\Models\Property;
use App\Models\PropertyCategory;
use App\Models\User;
use App\Modules\Availability\Application\Queries\CheckPropertyAvailabilityQuery;
use App\Modules\Booking\Application\Actions\CreateBookingAction;
use App\Modules\Booking\Application\DTOs\CreateBookingDTO;
use App\Modules\Booking\Domain\Enums\BookingStatus;
use App\Modules\Booking\Domain\Exceptions\InvalidBookingTransitionException;
use App\Modules\Booking\Domain\Services\BookingStateMachine;
use App\Shared\Domain\Exceptions\BookingUnavailableException;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

class BookingHardeningTest extends TestCase
{
    private Property $property;

    private PaymentMethod $cardMethod;

    private PaymentMethod $cashMethod;

    private Customer $customer;

    private User $customerUser;

    protected function setUp(): void
    {
        parent::setUp();

        // Clean up test data
        Booking::where('reference', 'like', 'GON-HARDEN-%')->forceDelete();
        Property::where('reference_number', 'like', 'GON-PROP-HARDEN%')->forceDelete();
        Customer::where('email', 'like', '%@harden-test.com')->forceDelete();
        User::where('email', 'like', '%@harden-test.com')->forceDelete();

        $category = PropertyCategory::firstOrCreate(
            ['slug' => 'harden-cat'],
            ['name_en' => 'Hardening Category', 'is_active' => true]
        );

        $location = Location::firstOrCreate(
            ['slug' => 'harden-loc'],
            ['name_en' => 'Hardening Lagoon', 'city' => 'El Gouna', 'country' => 'Egypt', 'is_active' => true]
        );

        $this->cardMethod = PaymentMethod::firstOrCreate(
            ['code' => 'card'],
            [
                'name' => 'Credit / Debit Card',
                'is_enabled' => true,
                'is_online' => true,
                'gateway_driver' => 'App\\Services\\Payment\\Gateways\\CardGateway',
                'test_mode' => true,
            ]
        );

        $this->cashMethod = PaymentMethod::firstOrCreate(
            ['code' => 'cash'],
            [
                'name' => 'Cash on Arrival',
                'is_enabled' => true,
                'is_online' => false,
                'gateway_driver' => 'App\\Services\\Payment\\Gateways\\ManualCashGateway',
                'test_mode' => true,
            ]
        );

        $this->property = Property::create([
            'reference_number' => 'GON-PROP-HARDEN-01',
            'slug' => 'test-hardening-villa',
            'property_category_id' => $category->id,
            'location_id' => $location->id,
            'title_en' => 'Test Hardening Luxury Villa',
            'listing_type' => 'rent',
            'bedrooms' => 2,
            'bathrooms' => 2,
            'max_guests' => 4,
            'min_stay_nights' => 2,
            'max_stay_nights' => 30,
            'base_price_cents' => 300000, // 3,000 EGP / night
            'currency' => 'EGP',
            'cleaning_fee_cents' => 50000, // 500 EGP
            'service_fee_cents' => 20000,  // 200 EGP
            'tax_percentage' => 14.00,
            'payment_requirement' => 'both',
            'deposit_percentage' => 25.00,
            'booking_mode' => 'instant',
            'is_published' => true,
            'is_available' => true,
            'status' => 'published',
        ]);

        $this->customerUser = User::create([
            'name' => 'Harden Customer User',
            'email' => 'customer@harden-test.com',
            'password' => 'SecurePass123!@#',
            'role' => 'customer',
            'is_active' => true,
        ]);

        $this->customer = Customer::create([
            'user_id' => $this->customerUser->id,
            'first_name' => 'Harden',
            'last_name' => 'Customer',
            'email' => 'customer@harden-test.com',
            'phone' => '+201011112222',
        ]);
    }

    /**
     * Helper to create a test booking.
     */
    private function createTestBooking(string $checkIn, string $checkOut, string $status = 'awaiting_payment'): Booking
    {
        $plainToken = Str::random(64);

        $booking = Booking::create([
            'reference' => 'GON-HARDEN-'.strtoupper(Str::random(6)),
            'customer_id' => $this->customer->id,
            'bookable_type' => Property::class,
            'bookable_id' => $this->property->id,
            'check_in' => $checkIn,
            'check_out' => $checkOut,
            'nights' => 3,
            'guests' => 2,
            'subtotal_cents' => 900000,
            'cleaning_fee_cents' => 50000,
            'service_fee_cents' => 20000,
            'tax_cents' => 135800,
            'discount_cents' => 0,
            'total_cents' => 1105800,
            'deposit_cents' => 276450,
            'amount_paid_cents' => 0,
            'amount_remaining_cents' => 1105800,
            'currency' => 'EGP',
            'payment_type' => 'full',
            'payment_method_id' => $this->cardMethod->id,
            'status' => $status,
            'payment_status' => 'unpaid',
            'booking_access_token' => hash('sha256', $plainToken),
            'pricing_snapshot' => ['total_cents' => 1105800],
            'cancellation_policy_snapshot' => ['policy' => 'moderate'],
        ]);

        $booking->plain_access_token = $plainToken;

        return $booking;
    }

    /**
     * P5-T01: State machine valid transition pipeline.
     */
    public function test_booking_state_machine_valid_transitions_succeed(): void
    {
        $stateMachine = app(BookingStateMachine::class);
        $booking = $this->createTestBooking('2026-11-10', '2026-11-13', 'pending');

        // pending -> awaiting_payment
        $booking = $stateMachine->transition($booking, BookingStatus::AWAITING_PAYMENT, null, ['reason' => 'Awaiting payment from user']);
        $this->assertEquals(BookingStatus::AWAITING_PAYMENT, $booking->booking_status);

        // awaiting_payment -> confirmed
        $booking = $stateMachine->transition($booking, BookingStatus::CONFIRMED, null, ['reason' => 'Payment captured']);
        $this->assertEquals(BookingStatus::CONFIRMED, $booking->booking_status);

        // confirmed -> completed
        $booking = $stateMachine->transition($booking, BookingStatus::COMPLETED, null, ['reason' => 'Stay completed successfully']);
        $this->assertEquals(BookingStatus::COMPLETED, $booking->booking_status);
    }

    /**
     * P5-T01: State machine invalid transitions throw InvalidBookingTransitionException (422).
     */
    public function test_booking_state_machine_invalid_transitions_throw_exception(): void
    {
        $stateMachine = app(BookingStateMachine::class);
        $booking = $this->createTestBooking('2026-11-10', '2026-11-13', 'cancelled');

        $this->expectException(InvalidBookingTransitionException::class);
        $stateMachine->transition($booking, BookingStatus::CONFIRMED, null, ['reason' => 'Attempting resurrection of cancelled booking']);
    }

    /**
     * P5-T01: State machine idempotent self-transitions do not throw and no-op cleanly.
     */
    public function test_booking_state_machine_idempotent_self_transitions_no_op(): void
    {
        $stateMachine = app(BookingStateMachine::class);
        $booking = $this->createTestBooking('2026-11-10', '2026-11-13', 'confirmed');

        $result = $stateMachine->transition($booking, BookingStatus::CONFIRMED, null, ['reason' => 'Redundant confirmation']);
        $this->assertEquals(BookingStatus::CONFIRMED, $result->booking_status);
    }

    /**
     * P5-T02: Client cannot tamper with prices (prohibited fields cause 422).
     */
    public function test_price_cannot_be_tampered_by_client(): void
    {
        $tamperedPayload = [
            'property_id' => $this->property->id,
            'check_in' => now()->addDays(10)->toDateString(),
            'check_out' => now()->addDays(13)->toDateString(),
            'guests' => 2,
            'first_name' => 'Attacker',
            'last_name' => 'User',
            'email' => 'attacker@harden-test.com',
            'phone' => '+201099887766',
            'payment_method' => 'card',
            'price' => 10,           // Prohibited price injection
            'total_cents' => 1000,   // Prohibited total override
        ];

        $response = $this->withHeader('Idempotency-Key', 'test-key-price-tamper-'.Str::random(10))
            ->postJson('/api/v1/checkout/bookings', $tamperedPayload);
        $response->assertStatus(422);
        $this->assertEquals('VALIDATION_ERROR', $response->json('error.code'));
        $details = $response->json('error.details') ?? [];
        $this->assertTrue(isset($details['price']) && isset($details['total_cents']), 'Price and total_cents must be prohibited validation errors.');
    }

    /**
     * P5-T03: Half-open range check [check_in, check_out) allows same-day turnaround.
     */
    public function test_half_open_range_availability_allows_turnaround(): void
    {
        // Booking A: 2026-12-01 to 2026-12-05 (check-out on 2026-12-05)
        $this->createTestBooking('2026-12-01', '2026-12-05', 'confirmed');

        $query = app(CheckPropertyAvailabilityQuery::class);

        // Booking B: 2026-12-05 to 2026-12-10 (check-in on 2026-12-05) -> MUST BE AVAILABLE!
        $resultB = $query->execute($this->property, Carbon::parse('2026-12-05'), Carbon::parse('2026-12-10'));
        $this->assertTrue($resultB->isAvailable, 'Same-day check-in on prior check-out day must be allowed under [check_in, check_out) half-open interval semantics.');

        // Booking C: 2026-12-03 to 2026-12-07 -> MUST CONFLICT!
        $resultC = $query->execute($this->property, Carbon::parse('2026-12-03'), Carbon::parse('2026-12-07'));
        $this->assertFalse($resultC->isAvailable, 'Overlapping range must be reported unavailable.');
    }

    /**
     * P5-T05: Expired pending holds are ignored by availability check and purged by artisan command.
     */
    public function test_pending_hold_expiry_frees_inventory(): void
    {
        $expiredBooking = $this->createTestBooking('2026-12-15', '2026-12-18', 'awaiting_payment');
        $expiredBooking->update([
            'expires_at' => now()->subMinutes(5), // Hold expired 5 minutes ago
        ]);

        $query = app(CheckPropertyAvailabilityQuery::class);

        // Expired hold must NOT block new reservations
        $result = $query->execute($this->property, Carbon::parse('2026-12-15'), Carbon::parse('2026-12-18'));
        $this->assertTrue($result->isAvailable, 'Expired booking holds must not block availability checks.');

        // Run artisan command bookings:expire-pending
        $this->artisan('bookings:expire-pending')
            ->expectsOutputToContain('Released')
            ->assertExitCode(0);

        $this->assertEquals('expired', $expiredBooking->fresh()->status);
    }

    /**
     * P5-T06: Idempotent booking creation prevents duplicates via Idempotency-Key.
     */
    public function test_idempotent_booking_creation_with_header(): void
    {
        $idempotencyKey = 'idem-key-'.Str::random(16);

        $payload = [
            'property_id' => $this->property->id,
            'check_in' => now()->addDays(20)->toDateString(),
            'check_out' => now()->addDays(23)->toDateString(),
            'guests' => 2,
            'first_name' => 'Idem',
            'last_name' => 'Guest',
            'email' => 'idem@harden-test.com',
            'phone' => '+201099112233',
            'payment_method' => 'card',
        ];

        // Call 1
        $response1 = $this->withHeader('Idempotency-Key', $idempotencyKey)
            ->postJson('/api/v1/checkout/bookings', $payload);
        $response1->assertStatus(201);
        $ref1 = $response1->json('data.reference');

        // Call 2 with exact same Idempotency-Key
        $response2 = $this->withHeader('Idempotency-Key', $idempotencyKey)
            ->postJson('/api/v1/checkout/bookings', $payload);
        $response2->assertStatus(201);
        $ref2 = $response2->json('data.reference');

        $this->assertEquals($ref1, $ref2, 'Idempotent replay must return original booking reference.');

        // Verify only 1 booking exists in DB
        $count = Booking::where('idempotency_key', $idempotencyKey)->count();
        $this->assertEquals(1, $count);
    }

    /**
     * P5-T07: Transaction boundary enforcement (all-or-nothing rollback).
     */
    public function test_booking_creation_atomic_rollback_on_failure(): void
    {
        $initialBookingsCount = Booking::count();

        try {
            DB::transaction(function () {
                $this->createTestBooking('2026-12-25', '2026-12-28');
                throw new \RuntimeException('Simulated payment gateway timeout midway through transaction');
            });
        } catch (\RuntimeException $e) {
            // Expected simulation
        }

        $this->assertEquals($initialBookingsCount, Booking::count(), 'Aborted booking creation must roll back all records.');
    }

    /**
     * P5-T08: IDOR defense on confirmation page.
     */
    public function test_confirmation_page_idor_protection(): void
    {
        $booking = $this->createTestBooking('2026-11-20', '2026-11-23');

        // 1. Bare reference without session or token -> 404 (prevents enumeration)
        $response = $this->get(route('checkout.confirmation', $booking->reference));
        $response->assertStatus(404);

        // 2. Invalid token -> 404
        $invalidResponse = $this->get(route('checkout.confirmation', [
            'reference' => $booking->reference,
            'token' => 'bogus-token-123',
        ]));
        $invalidResponse->assertStatus(404);

        // 3. Valid secret access token -> 200
        $validResponse = $this->get(route('checkout.confirmation', [
            'reference' => $booking->reference,
            'token' => $booking->plain_access_token,
        ]));
        $validResponse->assertStatus(200);

        // 4. Authenticated owner user -> 200 without token
        $ownerResponse = $this->actingAs($this->customerUser)
            ->get(route('checkout.confirmation', $booking->reference));
        $ownerResponse->assertStatus(200);

        // 5. Unrelated authenticated user -> 404
        $strangerUser = User::create([
            'name' => 'Stranger User',
            'email' => 'stranger@harden-test.com',
            'password' => 'SecurePass123!@#',
            'role' => 'customer',
            'is_active' => true,
        ]);

        $strangerResponse = $this->actingAs($strangerUser)
            ->get(route('checkout.confirmation', $booking->reference));
        $strangerResponse->assertStatus(404);
    }

    /**
     * P5-T10: Customer cancellation self-service via API.
     */
    public function test_customer_can_cancel_own_booking(): void
    {
        $booking = $this->createTestBooking('2026-11-25', '2026-11-28', 'awaiting_payment');

        // Non-owner cannot cancel
        $strangerUser = User::create([
            'name' => 'Stranger 2',
            'email' => 'stranger2@harden-test.com',
            'password' => 'SecurePass123!@#',
            'role' => 'customer',
            'is_active' => true,
        ]);

        $unauthResponse = $this->actingAs($strangerUser, 'sanctum')
            ->postJson("/api/v1/customer/bookings/{$booking->reference}/cancel", [
                'reason' => 'Unauthorized cancellation attempt',
            ]);
        $unauthResponse->assertStatus(404);

        // Owner can cancel
        $cancelResponse = $this->actingAs($this->customerUser, 'sanctum')
            ->postJson("/api/v1/customer/bookings/{$booking->reference}/cancel", [
                'reason' => 'Changed travel dates',
            ]);
        $cancelResponse->assertStatus(200);
        $this->assertEquals('cancelled', $booking->fresh()->status);
    }

    /**
     * P5-T10: Cancelling twice is idempotent.
     */
    public function test_cancel_twice_is_idempotent(): void
    {
        $booking = $this->createTestBooking('2026-11-25', '2026-11-28', 'cancelled');

        $response = $this->actingAs($this->customerUser, 'sanctum')
            ->postJson("/api/v1/customer/bookings/{$booking->reference}/cancel", [
                'reason' => 'Redundant cancellation call',
            ]);

        $response->assertStatus(200);
        $this->assertEquals('cancelled', $booking->fresh()->status);
    }

    /**
     * P5-T11: Confirmation endpoint rate limiting (15/min).
     */
    public function test_confirmation_page_rate_limiting(): void
    {
        $booking = $this->createTestBooking('2026-11-20', '2026-11-23');

        // Make 15 requests
        for ($i = 0; $i < 15; $i++) {
            $res = $this->get(route('checkout.confirmation', [
                'reference' => $booking->reference,
                'token' => $booking->plain_access_token,
            ]));
            $this->assertNotEquals(429, $res->status());
        }

        // 16th request must be throttled with 429
        $throttledRes = $this->get(route('checkout.confirmation', [
            'reference' => $booking->reference,
            'token' => $booking->plain_access_token,
        ]));
        $throttledRes->assertStatus(429);
    }

    /**
     * P5-T12: Concurrency conflict control (competing requests for exact same dates).
     */
    public function test_concurrent_booking_same_inventory_concurrency(): void
    {
        $action = app(CreateBookingAction::class);

        $dto1 = new CreateBookingDTO(
            property: $this->property,
            customer: $this->customer,
            checkIn: Carbon::parse('2026-12-08'),
            checkOut: Carbon::parse('2026-12-12'),
            guests: 2,
            paymentType: 'full',
            paymentMethod: $this->cardMethod,
        );

        $dto2 = new CreateBookingDTO(
            property: $this->property,
            customer: $this->customer,
            checkIn: Carbon::parse('2026-12-09'),
            checkOut: Carbon::parse('2026-12-14'), // overlaps with dto1
            guests: 2,
            paymentType: 'full',
            paymentMethod: $this->cardMethod,
        );

        // Booking 1 succeeds
        $booking1 = $action->execute($dto1);
        $this->assertNotNull($booking1->id);

        // Booking 2 must throw BookingUnavailableException
        $this->expectException(BookingUnavailableException::class);
        $action->execute($dto2);
    }
}
