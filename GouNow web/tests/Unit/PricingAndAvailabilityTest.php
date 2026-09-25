<?php

namespace Tests\Unit;

use App\Models\AvailabilityBlock;
use App\Models\Booking;
use App\Models\Customer;
use App\Models\Location;
use App\Models\PaymentMethod;
use App\Models\Property;
use App\Models\PropertyCategory;
use App\Models\SeasonalPrice;
use App\Services\AvailabilityService;
use App\Services\PricingService;
use Carbon\Carbon;
use Tests\TestCase;

class PricingAndAvailabilityTest extends TestCase
{
    private PricingService $pricingService;
    private AvailabilityService $availabilityService;
    private Property $testProperty;

    protected function setUp(): void
    {
        parent::setUp();

        $this->pricingService = app(PricingService::class);
        $this->availabilityService = app(AvailabilityService::class);

        // Fetch or create a dedicated property for testing
        $category = PropertyCategory::firstOrCreate(
            ['slug' => 'test-category'],
            ['name_en' => 'Test Villa Category', 'is_active' => true]
        );

        $location = Location::firstOrCreate(
            ['slug' => 'test-location'],
            ['name_en' => 'Test Lagoon', 'is_active' => true]
        );

        $this->testProperty = Property::updateOrCreate(
            ['reference_number' => 'GON-TEST-UNIT-01'],
            [
                'slug' => 'unit-test-lagoon-villa',
                'property_category_id' => $category->id,
                'location_id' => $location->id,
                'title_en' => 'Unit Test Lagoon Villa',
                'listing_type' => 'rent',
                'bedrooms' => 3,
                'bathrooms' => 3,
                'max_guests' => 6,
                'min_stay_nights' => 2,
                'max_stay_nights' => 30,
                'base_price_cents' => 500000, // 5,000 EGP Base Price
                'currency' => 'EGP',
                'cleaning_fee_cents' => 100000, // 1,000 EGP
                'service_fee_cents' => 50000,   // 500 EGP
                'tax_percentage' => 14.00,
                'is_published' => true,
                'is_available' => true,
                'status' => 'published',
            ]
        );

        // Clean up test property's seasons and blocks before each test
        SeasonalPrice::where('property_id', $this->testProperty->id)->forceDelete();
        AvailabilityBlock::where('property_id', $this->testProperty->id)->forceDelete();
        Booking::where('bookable_id', $this->testProperty->id)->forceDelete();
        Booking::whereIn('reference', ['GON-TEST-CONF-01', 'GON-TEST-CANCELLED'])->forceDelete();
    }

    public function test_base_price_applies_when_no_seasonal_rule_covers_date(): void
    {
        $date = Carbon::parse('2026-05-15');
        $nightData = $this->pricingService->getNightlyPriceCents($this->testProperty, $date);

        $this->assertTrue($nightData['is_base_price']);
        $this->assertEquals(500000, $nightData['price_cents']); // 5,000 EGP
        $this->assertNull($nightData['seasonal_price_id']);
    }

    public function test_three_overlapping_seasons_highest_priority_wins(): void
    {
        // Setup the exact Master Plan example (Section 11):
        // Base: 5,000 EGP
        // Season 1: Winter (Nov 1 -> Mar 31), 10,000 EGP, Priority 1
        SeasonalPrice::create([
            'property_id' => $this->testProperty->id,
            'name_en' => 'Winter Season',
            'start_date' => '2026-11-01',
            'end_date' => '2027-03-31',
            'price_cents' => 1000000, // 10,000 EGP
            'priority' => 1,
            'is_active' => true,
        ]);

        // Season 2: December (Dec 1 -> Jan 31), 15,000 EGP, Priority 2
        SeasonalPrice::create([
            'property_id' => $this->testProperty->id,
            'name_en' => 'December Season',
            'start_date' => '2026-12-01',
            'end_date' => '2027-01-31',
            'price_cents' => 1500000, // 15,000 EGP
            'priority' => 2,
            'is_active' => true,
        ]);

        // Season 3: Christmas/New Year (Dec 20 -> Jan 15), 25,000 EGP, Priority 3
        SeasonalPrice::create([
            'property_id' => $this->testProperty->id,
            'name_en' => 'Christmas & NYE Peak',
            'start_date' => '2026-12-20',
            'end_date' => '2027-01-15',
            'price_cents' => 2500000, // 25,000 EGP
            'priority' => 3,
            'is_active' => true,
        ]);

        // 1. Date covered by Christmas (Dec 25): Priority 3 wins -> 25,000 EGP
        $christmasNight = $this->pricingService->getNightlyPriceCents($this->testProperty, Carbon::parse('2026-12-25'));
        $this->assertEquals(2500000, $christmasNight['price_cents']);
        $this->assertEquals('Christmas & NYE Peak', $christmasNight['season_name']);
        $this->assertEquals(3, $christmasNight['priority']);

        // 2. Date covered by December but not Christmas (Dec 05): Priority 2 wins -> 15,000 EGP
        $decemberNight = $this->pricingService->getNightlyPriceCents($this->testProperty, Carbon::parse('2026-12-05'));
        $this->assertEquals(1500000, $decemberNight['price_cents']);
        $this->assertEquals('December Season', $decemberNight['season_name']);
        $this->assertEquals(2, $decemberNight['priority']);

        // 3. Date covered only by Winter (Nov 15): Priority 1 wins -> 10,000 EGP
        $winterNight = $this->pricingService->getNightlyPriceCents($this->testProperty, Carbon::parse('2026-11-15'));
        $this->assertEquals(1000000, $winterNight['price_cents']);
        $this->assertEquals('Winter Season', $winterNight['season_name']);
        $this->assertEquals(1, $winterNight['priority']);

        // 4. Date not covered by any season (Oct 15): Base price applies -> 5,000 EGP
        $baseNight = $this->pricingService->getNightlyPriceCents($this->testProperty, Carbon::parse('2026-10-15'));
        $this->assertEquals(500000, $baseNight['price_cents']);
        $this->assertTrue($baseNight['is_base_price']);
    }

    public function test_hotel_date_rule_checkout_night_is_never_charged(): void
    {
        // Normal date: 5,000 EGP per night
        // Peak Christmas season: 25,000 EGP per night
        SeasonalPrice::create([
            'property_id' => $this->testProperty->id,
            'name_en' => 'Christmas Peak',
            'start_date' => '2026-12-20',
            'end_date' => '2026-12-25',
            'price_cents' => 2500000, // 25,000 EGP
            'priority' => 3,
            'is_active' => true,
        ]);

        // Check-in Dec 18 (base: 5,000), Dec 19 (base: 5,000), Dec 20 (Christmas: 25,000). Check-out Dec 21.
        // Nights = 3 (18th, 19th, 20th). Dec 21 is NOT charged!
        $checkIn = Carbon::parse('2026-12-18');
        $checkOut = Carbon::parse('2026-12-21');

        $result = $this->pricingService->calculateBooking($this->testProperty, $checkIn, $checkOut);

        $this->assertEquals(3, $result['nights']);
        // Subtotal = 5,000 + 5,000 + 25,000 = 35,000 EGP
        $this->assertEquals(3500000, $result['subtotal_cents']);
        $this->assertCount(3, $result['nightly_prices']);
        $this->assertEquals('2026-12-18', $result['nightly_prices'][0]['night_date']);
        $this->assertEquals('2026-12-19', $result['nightly_prices'][1]['night_date']);
        $this->assertEquals('2026-12-20', $result['nightly_prices'][2]['night_date']);
    }

    public function test_seasonal_minimum_stay_override(): void
    {
        // Property default min stay is 2 nights
        // Christmas peak season specifies 5 nights minimum
        SeasonalPrice::create([
            'property_id' => $this->testProperty->id,
            'name_en' => 'Christmas Strict Minimum',
            'start_date' => '2026-12-20',
            'end_date' => '2027-01-05',
            'price_cents' => 2000000,
            'priority' => 2,
            'min_stay_nights' => 5,
            'is_active' => true,
        ]);

        // Attempt a 3-night booking inside Christmas
        $checkIn = Carbon::parse('2026-12-22');
        $checkOut = Carbon::parse('2026-12-25'); // 3 nights

        $result = $this->pricingService->calculateBooking($this->testProperty, $checkIn, $checkOut);

        $this->assertEquals(3, $result['nights']);
        $this->assertEquals(5, $result['min_stay_required']);
        $this->assertFalse($result['satisfies_min_stay']);

        // Attempt a 5-night booking inside Christmas
        $fiveNightCheckOut = Carbon::parse('2026-12-27'); // 5 nights
        $validResult = $this->pricingService->calculateBooking($this->testProperty, $checkIn, $fiveNightCheckOut);

        $this->assertEquals(5, $validResult['nights']);
        $this->assertTrue($validResult['satisfies_min_stay']);
    }

    public function test_season_overlap_analysis_detects_priority_wins_and_losses(): void
    {
        SeasonalPrice::create([
            'property_id' => $this->testProperty->id,
            'name_en' => 'Existing Mid Season',
            'start_date' => '2026-07-01',
            'end_date' => '2026-07-31',
            'price_cents' => 1200000,
            'priority' => 2,
            'is_active' => true,
        ]);

        // Proposed new rule overlapping July with higher priority (Priority 3)
        $analysisHigh = $this->pricingService->analyzeSeasonalOverlap(
            $this->testProperty,
            Carbon::parse('2026-07-15'),
            Carbon::parse('2026-07-25'),
            3 // Higher priority
        );

        $this->assertTrue($analysisHigh['has_overlap']);
        $this->assertEquals('new_rule_wins', $analysisHigh['overlaps'][0]['outcome']);

        // Proposed new rule overlapping July with lower priority (Priority 1)
        $analysisLow = $this->pricingService->analyzeSeasonalOverlap(
            $this->testProperty,
            Carbon::parse('2026-07-15'),
            Carbon::parse('2026-07-25'),
            1 // Lower priority
        );

        $this->assertTrue($analysisLow['has_overlap']);
        $this->assertEquals('existing_rule_wins', $analysisLow['overlaps'][0]['outcome']);
    }

    public function test_availability_service_detects_conflicts_and_allows_adjacent_changeovers(): void
    {
        $customer = Customer::first();
        $paymentMethod = PaymentMethod::first();

        // Create an existing booking: June 10 to June 15
        Booking::create([
            'reference' => 'GON-TEST-CONF-01',
            'customer_id' => $customer?->id,
            'bookable_type' => Property::class,
            'bookable_id' => $this->testProperty->id,
            'check_in' => '2026-06-10',
            'check_out' => '2026-06-15',
            'nights' => 5,
            'guests' => 2,
            'total_cents' => 2500000,
            'status' => 'confirmed',
            'payment_status' => 'paid',
            'payment_method_id' => $paymentMethod?->id,
        ]);

        // 1. Direct overlap: June 12 to June 14 -> MUST BE UNAVAILABLE
        $overlapResult = $this->availabilityService->checkAvailabilityDetails(
            $this->testProperty,
            Carbon::parse('2026-06-12'),
            Carbon::parse('2026-06-14')
        );
        $this->assertFalse($overlapResult['available']);
        $this->assertEquals('booking_conflict', $overlapResult['conflict_type']);

        // 2. Adjacent check-in on existing check-out day: June 15 to June 20 -> MUST BE AVAILABLE!
        // Standard hotel turnaround rule: guest checks out at 11:00, new guest checks in at 15:00
        $adjacentResult = $this->availabilityService->checkAvailabilityDetails(
            $this->testProperty,
            Carbon::parse('2026-06-15'),
            Carbon::parse('2026-06-20')
        );
        $this->assertTrue($adjacentResult['available']);
        $this->assertEquals('none', $adjacentResult['conflict_type']);

        // 3. Adjacent check-out on existing check-in day: June 05 to June 10 -> MUST BE AVAILABLE!
        $adjacentBeforeResult = $this->availabilityService->checkAvailabilityDetails(
            $this->testProperty,
            Carbon::parse('2026-06-05'),
            Carbon::parse('2026-06-10')
        );
        $this->assertTrue($adjacentBeforeResult['available']);
    }

    public function test_cancelled_booking_does_not_block_property(): void
    {
        $customer = Customer::first();
        $paymentMethod = PaymentMethod::first();

        // Create a cancelled booking: August 1 to August 5
        Booking::create([
            'reference' => 'GON-TEST-CANCELLED',
            'customer_id' => $customer?->id,
            'bookable_type' => Property::class,
            'bookable_id' => $this->testProperty->id,
            'check_in' => '2026-08-01',
            'check_out' => '2026-08-05',
            'nights' => 4,
            'guests' => 2,
            'total_cents' => 2000000,
            'status' => 'cancelled', // Cancelled!
            'payment_status' => 'refunded',
            'payment_method_id' => $paymentMethod?->id,
        ]);

        $result = $this->availabilityService->isAvailable(
            $this->testProperty,
            Carbon::parse('2026-08-02'),
            Carbon::parse('2026-08-04')
        );

        $this->assertTrue($result);
    }

    public function test_manual_availability_block_prevents_booking(): void
    {
        // Owner blocks property for maintenance
        $this->availabilityService->createAvailabilityBlock(
            $this->testProperty,
            Carbon::parse('2026-09-01'),
            Carbon::parse('2026-09-07'),
            'maintenance',
            'Annual pool resurfacing and AC servicing'
        );

        $result = $this->availabilityService->checkAvailabilityDetails(
            $this->testProperty,
            Carbon::parse('2026-09-03'),
            Carbon::parse('2026-09-05')
        );

        $this->assertFalse($result['available']);
        $this->assertEquals('manual_block', $result['conflict_type']);
        $this->assertStringContainsString('Maintenance', $result['reason']);
    }
}
