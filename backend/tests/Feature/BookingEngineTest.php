<?php

namespace Tests\Feature;

use App\Models\AvailabilityBlock;
use App\Models\Booking;
use App\Models\Customer;
use App\Models\Discount;
use App\Models\DiscountUsage;
use App\Models\Location;
use App\Models\PaymentMethod;
use App\Models\Property;
use App\Models\PropertyCategory;
use App\Models\SeasonalPrice;
use Carbon\Carbon;
use Tests\TestCase;

class BookingEngineTest extends TestCase
{
    private Property $property;
    private PaymentMethod $cardMethod;
    private PaymentMethod $paypalMethod;
    private PaymentMethod $cashMethod;
    private PaymentMethod $bankMethod;
    private Discount $promoCode;

    protected function setUp(): void
    {
        parent::setUp();

        // Clean up test data from prior test executions
        Booking::where('reference', 'like', 'GON-%-TEST%')->forceDelete();
        Property::where('reference_number', 'like', 'GON-PROP-BOOK%')->forceDelete();
        Discount::where('code', 'TESTSUMMER20')->forceDelete();
        Customer::where('email', 'like', '%@test-booking.com')->forceDelete();

        $category = PropertyCategory::firstOrCreate(
            ['slug' => 'test-checkout-category'],
            ['name_en' => 'Checkout Category', 'is_active' => true]
        );

        $location = Location::firstOrCreate(
            ['slug' => 'test-checkout-location'],
            ['name_en' => 'Checkout Lagoon', 'city' => 'El Gouna', 'country' => 'Egypt', 'is_active' => true]
        );

        // Ensure Payment Methods exist
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

        $this->paypalMethod = PaymentMethod::firstOrCreate(
            ['code' => 'paypal'],
            [
                'name' => 'PayPal',
                'is_enabled' => true,
                'is_online' => true,
                'gateway_driver' => 'App\\Services\\Payment\\Gateways\\PayPalGateway',
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

        $this->bankMethod = PaymentMethod::firstOrCreate(
            ['code' => 'bank_transfer'],
            [
                'name' => 'Bank Wire Transfer',
                'is_enabled' => true,
                'is_online' => false,
                'gateway_driver' => 'App\\Services\\Payment\\Gateways\\ManualBankTransferGateway',
                'test_mode' => true,
            ]
        );

        // Setup test Property with 5,000 EGP base, 500 cleaning, 14% tax, deposit requirement 'both'
        $this->property = Property::create([
            'reference_number' => 'GON-PROP-BOOK-01',
            'slug' => 'test-booking-villa',
            'property_category_id' => $category->id,
            'location_id' => $location->id,
            'title_en' => 'Test Booking Luxury Villa',
            'listing_type' => 'rent',
            'bedrooms' => 3,
            'bathrooms' => 3,
            'max_guests' => 6,
            'min_stay_nights' => 2,
            'max_stay_nights' => 30,
            'base_price_cents' => 500000, // 5,000 EGP / night
            'currency' => 'EGP',
            'cleaning_fee_cents' => 100000, // 1,000 EGP
            'service_fee_cents' => 50000,   // 500 EGP
            'tax_percentage' => 14.00,
            'payment_requirement' => 'both', // allows full or deposit
            'deposit_percentage' => 30.00,   // 30% deposit
            'booking_mode' => 'instant',
            'is_published' => true,
            'is_available' => true,
            'status' => 'published',
        ]);

        // Attach payment methods
        $this->property->paymentMethods()->sync([
            $this->cardMethod->id => ['is_enabled' => true],
            $this->paypalMethod->id => ['is_enabled' => true],
            $this->cashMethod->id => ['is_enabled' => true],
        ]);

        // Setup Discount Promo Code: 20% off
        $this->promoCode = Discount::create([
            'name_en' => 'Test Summer 20% Off',
            'code' => 'TESTSUMMER20',
            'type' => 'percentage',
            'value' => 20.00,
            'applies_to_all' => true,
            'is_active' => true,
            'valid_from' => now()->subDay()->toDateString(),
            'valid_until' => now()->addMonths(3)->toDateString(),
            'max_uses' => 10,
            'used_count' => 0,
        ]);
    }

    /**
     * Test dynamic quote AJAX calculation endpoint.
     */
    public function test_calculate_quote_api_returns_accurate_financials(): void
    {
        $checkIn = now()->addDays(5)->toDateString();
        $checkOut = now()->addDays(8)->toDateString(); // 3 nights

        $response = $this->postJson(route('checkout.calculate'), [
            'property_id' => $this->property->id,
            'check_in' => $checkIn,
            'check_out' => $checkOut,
            'guests' => 4,
            'promo_code' => 'TESTSUMMER20',
        ]);

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);

        $quote = $response->json('quote');

        // 3 nights * 5,000 = 15,000 subtotal
        $this->assertEquals(3, $quote['nights']);
        $this->assertEquals(1500000, $quote['subtotal_cents']);

        // 20% discount on 15,000 = 3,000 discount
        $this->assertEquals(300000, $quote['discount_cents']);

        // Cleaning fee = 1,000, Service fee = 500
        $this->assertEquals(100000, $quote['cleaning_fee_cents']);
        $this->assertEquals(50000, $quote['service_fee_cents']);

        // Taxable base = (15,000 - 3,000) + 1,000 + 500 = 13,500
        // 14% tax = 1,890. Total = 13,500 + 1,890 = 15,390
        $this->assertEquals(189000, $quote['tax_cents']);
        $this->assertEquals(1539000, $quote['total_cents']);

        // 30% deposit of 15,390 = 4,617
        $this->assertEquals(461700, $quote['deposit_cents']);
    }

    /**
     * Test quote calculation fails when dates violate min stay or guests exceed capacity.
     */
    public function test_calculate_quote_rejects_exceeded_guests_or_short_stay(): void
    {
        // 1 night stay (property requires min 2 nights)
        $responseShort = $this->postJson(route('checkout.calculate'), [
            'property_id' => $this->property->id,
            'check_in' => now()->addDays(5)->toDateString(),
            'check_out' => now()->addDays(6)->toDateString(),
            'guests' => 2,
        ]);
        $responseShort->assertStatus(422);

        // 10 guests (property allows max 6 guests)
        $responseGuests = $this->postJson(route('checkout.calculate'), [
            'property_id' => $this->property->id,
            'check_in' => now()->addDays(5)->toDateString(),
            'check_out' => now()->addDays(8)->toDateString(),
            'guests' => 10,
        ]);
        $responseGuests->assertStatus(422);
    }

    /**
     * Test public checkout page displays property, initial quote, and payment methods.
     */
    public function test_checkout_show_page_renders_successfully(): void
    {
        $response = $this->get(route('checkout.show', [
            'property' => $this->property->slug,
            'check_in' => now()->addDays(10)->toDateString(),
            'check_out' => now()->addDays(13)->toDateString(),
            'guests' => 2,
        ]));

        $response->assertStatus(200);
        $response->assertSee('Test Booking Luxury Villa');
        $response->assertSee('Credit / Debit Card');
        $response->assertSee('PayPal');
        $response->assertSee('Cash on Arrival');
    }

    /**
     * Test checkout process creates customer and booking, and redirects to Card 3DS sandbox.
     */
    public function test_card_checkout_flow_redirects_to_3ds_and_confirms_successfully(): void
    {
        $checkIn = now()->addDays(15)->toDateString();
        $checkOut = now()->addDays(18)->toDateString(); // 3 nights

        $checkoutData = [
            'property_id' => $this->property->id,
            'check_in' => $checkIn,
            'check_out' => $checkOut,
            'guests' => 3,
            'first_name' => 'Menas',
            'last_name' => 'Elgouna',
            'email' => 'menas@test-booking.com',
            'phone' => '+201099887766',
            'country' => 'Egypt',
            'payment_method_id' => $this->cardMethod->id,
            'payment_type' => 'full',
            'special_requests' => 'Late check-in please',
        ];

        $response = $this->post(route('checkout.process'), $checkoutData);

        // Card gateway redirects to mock 3DS simulation
        $booking = Booking::where('bookable_id', $this->property->id)
            ->whereHas('customer', fn($q) => $q->where('email', 'menas@test-booking.com'))
            ->latest()
            ->first();

        $this->assertNotNull($booking);
        $this->assertEquals(3, $booking->nights);
        $this->assertEquals('awaiting_payment', $booking->status);
        $this->assertEquals('pending', $booking->payment_status);

        // Verify nightly price snapshot created
        $this->assertCount(3, $booking->nightlyPrices);
        $this->assertEquals(500000, $booking->nightlyPrices->first()->price_cents);

        // Assert redirect to 3DS mock
        $this->assertStringContainsString('/checkout/mock/card/' . $booking->reference, $response->headers->get('Location'));

        // Visit 3DS mock view
        $mockViewResponse = $this->get(route('checkout.card-mock', $booking->reference));
        $mockViewResponse->assertStatus(200);
        $mockViewResponse->assertSee('Verified by 3D Secure');

        // Simulate 3DS approval
        $completeResponse = $this->post(route('checkout.card-mock.complete', $booking->reference));
        $completeResponse->assertRedirect(route('checkout.confirmation', $booking->reference));

        // Refresh and check confirmed state
        $booking->refresh();
        $this->assertEquals('confirmed', $booking->status);
        $this->assertEquals('paid', $booking->payment_status);
        $this->assertEquals($booking->total_cents, $booking->amount_paid_cents);
        $this->assertEquals(0, $booking->amount_remaining_cents);

        // Check confirmation page
        $voucherResponse = $this->get(route('checkout.confirmation', $booking->reference));
        $voucherResponse->assertStatus(200);
        $voucherResponse->assertSee($booking->reference);
        $voucherResponse->assertSee('CONFIRMED');
    }

    /**
     * Test card payment decline handling.
     */
    public function test_card_checkout_decline_marks_transaction_failed(): void
    {
        $checkIn = now()->addDays(20)->toDateString();
        $checkOut = now()->addDays(22)->toDateString();

        $checkoutData = [
            'property_id' => $this->property->id,
            'check_in' => $checkIn,
            'check_out' => $checkOut,
            'guests' => 2,
            'first_name' => 'Decline',
            'last_name' => 'Tester',
            'email' => 'decline@test-booking.com',
            'phone' => '+201011112222',
            'payment_method_id' => $this->cardMethod->id,
            'payment_type' => 'full',
        ];

        $this->post(route('checkout.process'), $checkoutData);

        $booking = Booking::where('bookable_id', $this->property->id)
            ->whereHas('customer', fn($q) => $q->where('email', 'decline@test-booking.com'))
            ->latest()
            ->first();

        $this->post(route('checkout.card-mock.decline', $booking->reference));

        $booking->refresh();
        $this->assertEquals('awaiting_payment', $booking->status);
        $this->assertEquals('failed', $booking->payment_status);
        $this->assertEquals('failed', $booking->transactions->last()->status);
    }

    /**
     * Test PayPal checkout flow redirects to PayPal mock and completes successfully.
     */
    public function test_paypal_checkout_flow_and_completion(): void
    {
        $checkIn = now()->addDays(25)->toDateString();
        $checkOut = now()->addDays(28)->toDateString();

        $checkoutData = [
            'property_id' => $this->property->id,
            'check_in' => $checkIn,
            'check_out' => $checkOut,
            'guests' => 2,
            'first_name' => 'PayPal',
            'last_name' => 'Buyer',
            'email' => 'paypal-buyer@test-booking.com',
            'phone' => '+201044332211',
            'payment_method_id' => $this->paypalMethod->id,
            'payment_type' => 'full',
        ];

        $response = $this->post(route('checkout.process'), $checkoutData);

        $booking = Booking::where('bookable_id', $this->property->id)
            ->whereHas('customer', fn($q) => $q->where('email', 'paypal-buyer@test-booking.com'))
            ->latest()
            ->first();

        $this->assertStringContainsString('/checkout/mock/paypal/' . $booking->reference, $response->headers->get('Location'));

        $paypalView = $this->get(route('checkout.paypal-mock', $booking->reference));
        $paypalView->assertStatus(200);
        $paypalView->assertSee('PayPal');

        // Complete PayPal simulation
        $completeResponse = $this->post(route('checkout.paypal-mock.complete', $booking->reference));
        $completeResponse->assertRedirect(route('checkout.confirmation', $booking->reference));

        $booking->refresh();
        $this->assertEquals('confirmed', $booking->status);
        $this->assertEquals('paid', $booking->payment_status);
    }

    /**
     * Test Cash on Arrival checkout flow creates pending transaction with offline instructions.
     */
    public function test_cash_checkout_flow_creates_pending_offline_booking(): void
    {
        $checkIn = now()->addDays(30)->toDateString();
        $checkOut = now()->addDays(33)->toDateString();

        $checkoutData = [
            'property_id' => $this->property->id,
            'check_in' => $checkIn,
            'check_out' => $checkOut,
            'guests' => 2,
            'first_name' => 'Cash',
            'last_name' => 'Client',
            'email' => 'cash-client@test-booking.com',
            'phone' => '+201088776655',
            'payment_method_id' => $this->cashMethod->id,
            'payment_type' => 'deposit', // Choose deposit
        ];

        $response = $this->post(route('checkout.process'), $checkoutData);

        $booking = Booking::where('bookable_id', $this->property->id)
            ->whereHas('customer', fn($q) => $q->where('email', 'cash-client@test-booking.com'))
            ->latest()
            ->first();

        // Redirects directly to confirmation voucher
        $response->assertRedirect(route('checkout.confirmation', $booking->reference));

        $this->assertEquals('awaiting_payment', $booking->status);
        $this->assertEquals('pending', $booking->payment_status);
        $this->assertEquals('deposit', $booking->payment_type);
        $this->assertGreaterThan(0, $booking->deposit_cents);
        $this->assertGreaterThan(0, $booking->amount_remaining_cents);
    }

    /**
     * Test Section 20 payment requirement enforcement:
     * When property requires 'full', selecting 'deposit' is rejected.
     */
    public function test_deposit_rejected_when_property_requires_full_payment(): void
    {
        $this->property->update(['payment_requirement' => 'full']);

        $checkoutData = [
            'property_id' => $this->property->id,
            'check_in' => now()->addDays(35)->toDateString(),
            'check_out' => now()->addDays(38)->toDateString(),
            'guests' => 2,
            'first_name' => 'Deposit',
            'last_name' => 'Denied',
            'email' => 'denied@test-booking.com',
            'phone' => '+201088776655',
            'payment_method_id' => $this->cardMethod->id,
            'payment_type' => 'deposit', // Rejected!
        ];

        $response = $this->post(route('checkout.process'), $checkoutData);
        $response->assertSessionHas('error');

        $this->assertDatabaseMissing('customers', ['email' => 'denied@test-booking.com']);
    }

    /**
     * Test promo code discount application and DiscountUsage recording.
     */
    public function test_promo_code_decrements_uses_and_records_usage(): void
    {
        $checkIn = now()->addDays(40)->toDateString();
        $checkOut = now()->addDays(43)->toDateString();

        $initialUsageCount = $this->promoCode->used_count;

        $checkoutData = [
            'property_id' => $this->property->id,
            'check_in' => $checkIn,
            'check_out' => $checkOut,
            'guests' => 2,
            'first_name' => 'Discount',
            'last_name' => 'User',
            'email' => 'promo@test-booking.com',
            'phone' => '+201088776655',
            'payment_method_id' => $this->cashMethod->id,
            'payment_type' => 'full',
            'promo_code' => 'TESTSUMMER20',
        ];

        $this->post(route('checkout.process'), $checkoutData);

        $booking = Booking::where('bookable_id', $this->property->id)
            ->whereHas('customer', fn($q) => $q->where('email', 'promo@test-booking.com'))
            ->latest()
            ->first();

        $this->assertNotNull($booking);
        $this->assertEquals('TESTSUMMER20', $booking->promo_code);
        $this->assertGreaterThan(0, $booking->discount_cents);

        // Verify Discount usage incremented
        $this->promoCode->refresh();
        $this->assertEquals($initialUsageCount + 1, $this->promoCode->used_count);

        // Verify DiscountUsage record
        $this->assertDatabaseHas('discount_usages', [
            'discount_id' => $this->promoCode->id,
            'booking_id' => $booking->id,
        ]);
    }

    /**
     * Test double-booking prevention:
     * Overlapping booking dates are rejected with validation error.
     */
    public function test_overlapping_booking_dates_are_rejected(): void
    {
        $checkIn = now()->addDays(50)->toDateString();
        $checkOut = now()->addDays(55)->toDateString();

        // 1st booking confirmed
        $firstBookingData = [
            'property_id' => $this->property->id,
            'check_in' => $checkIn,
            'check_out' => $checkOut,
            'guests' => 2,
            'first_name' => 'First',
            'last_name' => 'Booker',
            'email' => 'first@test-booking.com',
            'phone' => '+201000000001',
            'payment_method_id' => $this->cardMethod->id,
            'payment_type' => 'full',
        ];
        $this->post(route('checkout.process'), $firstBookingData);

        $firstBooking = Booking::where('bookable_id', $this->property->id)
            ->whereHas('customer', fn($q) => $q->where('email', 'first@test-booking.com'))
            ->latest()
            ->first();

        // Confirm 1st booking
        $this->post(route('checkout.card-mock.complete', $firstBooking->reference));

        // 2nd booking attempt overlapping (e.g. checkin on day 52 to 57)
        $secondBookingData = [
            'property_id' => $this->property->id,
            'check_in' => now()->addDays(52)->toDateString(),
            'check_out' => now()->addDays(57)->toDateString(),
            'guests' => 2,
            'first_name' => 'Second',
            'last_name' => 'Attempt',
            'email' => 'second@test-booking.com',
            'phone' => '+201000000002',
            'payment_method_id' => $this->cardMethod->id,
            'payment_type' => 'full',
        ];

        $response = $this->post(route('checkout.process'), $secondBookingData);
        $response->assertSessionHas('error');

        // Confirm 2nd booking was NOT created
        $this->assertDatabaseMissing('customers', ['email' => 'second@test-booking.com']);
    }
}
