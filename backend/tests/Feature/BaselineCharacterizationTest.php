<?php

namespace Tests\Feature;

use App\Models\Amenity;
use App\Models\Booking;
use App\Models\Location;
use App\Models\PaymentMethod;
use App\Models\PaymentTransaction;
use App\Models\Property;
use App\Models\PropertyCategory;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use PHPUnit\Framework\Attributes\Group;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * Baseline Characterization Tests (P0-T06)
 * Locks in existing behavior for all critical flows before any hardening changes.
 */
#[Group('baseline')]
class BaselineCharacterizationTest extends TestCase
{
    private User $adminUser;

    private Property $testProperty;

    private PaymentMethod $cardMethod;

    private Amenity $amenity;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');

        Booking::where('guest_email', 'baseline@gounow.com')->forceDelete();
        Property::where('reference_number', 'GON-BASE-001')->forceDelete();
        Property::where('title_en', 'Characterization Villa')->forceDelete();
        Property::where('title_en', 'Villa with Media Upload')->forceDelete();

        // Setup base test admin user
        $this->adminUser = User::firstOrCreate(
            ['email' => 'admin@gounow.com'],
            [
                'name' => 'Super Admin',
                'password' => bcrypt('GouNow@2026!Secure'),
                'is_admin' => true,
                'is_active' => true,
            ]
        );

        $category = PropertyCategory::firstOrCreate(
            ['slug' => 'baseline-villas'],
            ['name_en' => 'Baseline Villas', 'is_active' => true]
        );

        $location = Location::firstOrCreate(
            ['slug' => 'baseline-lagoon'],
            ['name_en' => 'Baseline Lagoon', 'city' => 'El Gouna', 'country' => 'Egypt', 'is_active' => true]
        );

        $this->amenity = Amenity::firstOrCreate(
            ['name_en' => 'Baseline Pool'],
            ['group' => 'outdoor', 'is_active' => true]
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

        $this->testProperty = Property::create([
            'reference_number' => 'GON-BASE-001',
            'slug' => 'baseline-luxury-villa',
            'property_category_id' => $category->id,
            'location_id' => $location->id,
            'title_en' => 'Baseline Luxury Villa',
            'title_ar' => 'فيلا بيزلاين الفاخرة',
            'listing_type' => 'rent',
            'bedrooms' => 3,
            'bathrooms' => 3,
            'max_guests' => 6,
            'min_stay_nights' => 2,
            'max_stay_nights' => 30,
            'base_price_cents' => 500000, // 5,000 EGP Base Price
            'currency' => 'EGP',
            'cleaning_fee_cents' => 50000,
            'service_fee_cents' => 25000,
            'tax_percentage' => 14.00,
            'payment_requirement' => 'both',
            'deposit_percentage' => 50.00,
            'booking_mode' => 'instant',
            'cancellation_policy' => 'flexible',
            'is_published' => true,
            'is_available' => true,
            'status' => 'published',
        ]);

        $this->testProperty->paymentMethods()->sync([
            $this->cardMethod->id => ['is_enabled' => true],
        ]);
    }

    /**
     * Flow 1: Admin Login Characterization
     */
    #[Test]
    public function characterization_login(): void
    {
        // 1. Invalid login shows error
        $failResponse = $this->post(route('admin.login.submit'), [
            'email' => 'admin@gounow.com',
            'password' => 'WrongPassword',
        ]);
        $failResponse->assertSessionHasErrors('email');
        $this->assertGuest();

        // 2. Valid login authenticates and redirects to dashboard
        $successResponse = $this->post(route('admin.login.submit'), [
            'email' => 'admin@gounow.com',
            'password' => 'GouNow@2026!Secure',
        ]);
        $successResponse->assertRedirect(route('admin.dashboard'));
        $this->assertAuthenticatedAs($this->adminUser);
    }

    /**
     * Flow 2: Booking Creation & Calculation Quote Characterization
     */
    #[Test]
    public function characterization_booking_creation(): void
    {
        $checkIn = Carbon::now()->addDays(15)->format('Y-m-d');
        $checkOut = Carbon::now()->addDays(18)->format('Y-m-d');

        $calcResponse = $this->postJson(route('checkout.calculate'), [
            'property_id' => $this->testProperty->id,
            'check_in' => $checkIn,
            'check_out' => $checkOut,
            'guests' => 2,
        ]);

        $calcResponse->assertStatus(200);
        $calcResponse->assertJson(['success' => true]);

        $quote = $calcResponse->json('quote');
        $this->assertEquals(3, $quote['nights']);
        $this->assertEquals(1500000, $quote['subtotal_cents']);
        $this->assertArrayHasKey('total_cents', $quote);
    }

    /**
     * Flow 3: Checkout Page Render Characterization
     */
    #[Test]
    public function characterization_checkout(): void
    {
        $checkIn = Carbon::now()->addDays(20)->format('Y-m-d');
        $checkOut = Carbon::now()->addDays(23)->format('Y-m-d');

        $response = $this->get(route('checkout.show', [
            'property' => $this->testProperty->slug,
            'check_in' => $checkIn,
            'check_out' => $checkOut,
            'guests' => 2,
        ]));

        $response->assertStatus(200);
        $response->assertSee($this->testProperty->title_en);
        $response->assertSee('Credit / Debit Card');
    }

    /**
     * Flow 4: Payment Callback & Webhook Simulation Characterization
     */
    #[Test]
    public function characterization_payment_webhook(): void
    {
        $checkIn = Carbon::now()->addDays(30)->format('Y-m-d');
        $checkOut = Carbon::now()->addDays(33)->format('Y-m-d');

        $processResponse = $this->post(route('checkout.process'), [
            'property_id' => $this->testProperty->id,
            'check_in' => $checkIn,
            'check_out' => $checkOut,
            'guests' => 2,
            'first_name' => 'Baseline',
            'last_name' => 'Tester',
            'email' => 'baseline@gounow.com',
            'phone' => '+201099999999',
            'country' => 'Egypt',
            'payment_method_id' => $this->cardMethod->id,
            'payment_type' => 'full',
            'special_requests' => 'Baseline request',
        ]);

        $booking = Booking::where('bookable_id', $this->testProperty->id)
            ->whereHas('customer', fn ($q) => $q->where('email', 'baseline@gounow.com'))
            ->latest()
            ->first();
        $this->assertNotNull($booking);

        $this->assertStringContainsString('/checkout/mock/card/'.$booking->reference, $processResponse->headers->get('Location'));

        // Simulate successful 3DS callback
        $callbackResponse = $this->post(route('checkout.card-mock.complete', ['reference' => $booking->reference]));
        $callbackResponse->assertRedirect(route('checkout.confirmation', ['reference' => $booking->reference]));

        $booking->refresh();
        $this->assertEquals('confirmed', $booking->status);
        $this->assertEquals('paid', $booking->payment_status);

        $transaction = PaymentTransaction::where('booking_id', $booking->id)->latest()->first();
        $this->assertNotNull($transaction);
        $this->assertEquals('completed', $transaction->status);
    }

    /**
     * Flow 5: Admin Property CRUD Characterization
     */
    #[Test]
    public function characterization_admin_crud_property(): void
    {
        $postData = [
            'title_en' => 'Characterization Villa',
            'title_ar' => 'فيلا تجريبية لتثبيت السلوك',
            'property_category_id' => $this->testProperty->property_category_id,
            'location_id' => $this->testProperty->location_id,
            'listing_type' => 'rent',
            'bedrooms' => 4,
            'bathrooms' => 4,
            'max_guests' => 8,
            'base_price' => 7500,
            'currency' => 'EGP',
            'payment_requirement' => 'both',
            'cancellation_policy' => 'flexible',
            'is_published' => '1',
            'status' => 'published',
            'booking_mode' => 'instant',
            'amenities' => [$this->amenity->id],
        ];

        $response = $this->actingAs($this->adminUser)->post(route('admin.properties.store'), $postData);
        $response->assertRedirect(route('admin.properties.index'));

        $this->assertDatabaseHas('properties', [
            'title_en' => 'Characterization Villa',
            'base_price_cents' => 750000,
        ]);
    }

    /**
     * Flow 6: Media Upload Characterization
     */
    #[Test]
    public function characterization_media_upload(): void
    {
        $fakeImage = UploadedFile::fake()->create('villa-showcase.png', 400, 'image/png');

        $postData = [
            'title_en' => 'Villa with Media Upload',
            'title_ar' => 'فيلا مع صور تجريبية',
            'property_category_id' => $this->testProperty->property_category_id,
            'location_id' => $this->testProperty->location_id,
            'listing_type' => 'rent',
            'bedrooms' => 2,
            'bathrooms' => 2,
            'max_guests' => 4,
            'base_price' => 4000,
            'currency' => 'EGP',
            'payment_requirement' => 'both',
            'cancellation_policy' => 'flexible',
            'images' => [$fakeImage],
            'is_published' => '1',
            'status' => 'published',
            'booking_mode' => 'instant',
            'amenities' => [$this->amenity->id],
        ];

        $response = $this->actingAs($this->adminUser)->post(route('admin.properties.store'), $postData);
        $response->assertRedirect(route('admin.properties.index'));

        $property = Property::where('title_en', 'Villa with Media Upload')->first();
        $this->assertNotNull($property);

        $this->assertDatabaseHas('media', [
            'mediable_id' => $property->id,
            'mediable_type' => Property::class,
        ]);
    }
}
