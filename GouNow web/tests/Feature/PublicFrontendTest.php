<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\Experience;
use App\Models\ExperienceCategory;
use App\Models\Lead;
use App\Models\Location;
use App\Models\Property;
use App\Models\PropertyCategory;
use Tests\TestCase;

class PublicFrontendTest extends TestCase
{
    private Property $rentalProperty;
    private Property $saleProperty;
    private Experience $experience;
    private Event $event;
    private Location $location;
    private PropertyCategory $propertyCategory;
    private ExperienceCategory $experienceCategory;

    protected function setUp(): void
    {
        parent::setUp();

        // Clean up test data from previous runs
        Lead::where('email', 'like', '%@frontend-test.com')->forceDelete();
        Property::where('reference_number', 'like', 'GON-FRONT-%')->forceDelete();
        Experience::where('slug', 'test-tawila-island-yacht')->forceDelete();
        Event::where('slug', 'test-el-gouna-sunset-sessions')->forceDelete();

        $this->location = Location::firstOrCreate(
            ['slug' => 'marina-test-bay'],
            ['name_en' => 'Marina Test Bay', 'name_ar' => 'خليج المارينا التجريبي', 'city' => 'El Gouna', 'country' => 'Egypt', 'is_active' => true]
        );

        $this->propertyCategory = PropertyCategory::firstOrCreate(
            ['slug' => 'test-signature-villas'],
            ['name_en' => 'Signature Villas', 'name_ar' => 'فلل مميزة', 'is_active' => true]
        );

        $this->experienceCategory = ExperienceCategory::firstOrCreate(
            ['slug' => 'boat-trips-test'],
            ['name_en' => 'Boat Trips', 'name_ar' => 'رحلات بحرية', 'is_active' => true]
        );

        $this->rentalProperty = Property::create([
            'reference_number' => 'GON-FRONT-RENT-01',
            'slug' => 'marina-waterfront-test-villa',
            'property_category_id' => $this->propertyCategory->id,
            'location_id' => $this->location->id,
            'title_en' => 'Marina Waterfront Test Villa',
            'title_ar' => 'فيلا المارينا البحرية التجريبية',
            'short_description_en' => 'Panoramic lagoon views with private heated pool and direct sandy beach.',
            'short_description_ar' => 'إطلالة بانورامية على البحيرة مع حمام سباحة خاص.',
            'description_en' => 'Experience complete tranquility in this boho chic villa in El Gouna.',
            'listing_type' => 'rent',
            'bedrooms' => 3,
            'bathrooms' => 3,
            'max_guests' => 6,
            'base_price_cents' => 600000, // 6,000 EGP / night
            'cleaning_fee_cents' => 100000,
            'service_fee_cents' => 50000,
            'tax_percentage' => 14.00,
            'is_published' => true,
            'is_available' => true,
            'status' => 'published',
        ]);

        $this->saleProperty = Property::create([
            'reference_number' => 'GON-FRONT-SALE-01',
            'slug' => 'hill-villa-test-sale',
            'property_category_id' => $this->propertyCategory->id,
            'location_id' => $this->location->id,
            'title_en' => 'The Hill Signature Estate For Sale',
            'short_description_en' => 'Breathtaking elevation with endless lagoon and golf course panoramas.',
            'description_en' => 'Ready to move in luxury estate on the highest vantage point of El Gouna.',
            'listing_type' => 'sale',
            'bedrooms' => 5,
            'bathrooms' => 6,
            'area_sqm' => 650.00,
            'sale_price_cents' => 4500000000, // 45,000,000 EGP
            'completion_status' => 'ready',
            'furnished_status' => 'furnished',
            'is_published' => true,
            'is_available' => true,
            'status' => 'published',
        ]);

        $this->experience = Experience::create([
            'experience_category_id' => $this->experienceCategory->id,
            'location_id' => $this->location->id,
            'slug' => 'test-tawila-island-yacht',
            'title_en' => 'Tawila Island Private Yacht Cruise',
            'short_description_en' => 'Full day yacht charter to untouched coral reefs and dolphin spots.',
            'description_en' => 'Includes private skipper, snorkeling gear, fresh seafood lunch, and lagoon drinks.',
            'pricing_model' => 'per_group',
            'base_price_cents' => 2500000, // 25,000 EGP
            'duration' => '8 Hours',
            'max_capacity' => 12,
            'is_published' => true,
            'status' => 'published',
        ]);

        $this->event = Event::create([
            'location_id' => $this->location->id,
            'slug' => 'test-el-gouna-sunset-sessions',
            'title_en' => 'Sunset Lagoon Acoustic Sessions',
            'short_description_en' => 'Live bohemian deep house and acoustic sunset gatherings in Abu Tig Marina.',
            'event_date' => now()->addDays(7)->toDateString(),
            'start_time' => '17:00:00',
            'venue_name' => 'Club 88 Marina',
            'is_published' => true,
            'status' => 'published',
        ]);
    }

    /**
     * Test Homepage renders properly with all sections (Sections 7 & 126).
     */
    public function test_homepage_renders_successfully_with_sections(): void
    {
        $response = $this->get(route('home'));

        $response->assertStatus(200);
        $response->assertSee('GOUNOW');
        $response->assertSee('Live the Unrivaled El Gouna Lifestyle');
        $response->assertSee('Discover El Gouna with GouNow');
        $response->assertSee('Featured Vacation Rentals');
        $response->assertSee('Curated Experiences');
        $response->assertSee('Search Stays');
        $response->assertSee('Browse Sale');
    }

    /**
     * Test submitting a general concierge inquiry lead from homepage (Section 131).
     */
    public function test_homepage_concierge_inquiry_stores_lead(): void
    {
        $leadData = [
            'name' => 'Sarah Connor',
            'email' => 'sarah@frontend-test.com',
            'phone' => '+201012345678',
            'type' => 'concierge',
            'message' => 'Looking to book a private catamaran for a birthday celebration in Tawila.',
        ];

        $response = $this->post(route('home.inquire'), $leadData);

        $response->assertSessionHas('success');

        $this->assertDatabaseHas('leads', [
            'name' => 'Sarah Connor',
            'email' => 'sarah@frontend-test.com',
            'type' => 'concierge',
            'status' => 'new',
        ]);
    }

    /**
     * Test Stays catalog renders and filters correctly.
     */
    public function test_stays_catalog_renders_and_filters(): void
    {
        // 1. Rent catalog
        $responseRent = $this->get(route('properties.index', ['listing_type' => 'rent']));
        $responseRent->assertStatus(200);
        $responseRent->assertSee('Marina Waterfront Test Villa');
        $responseRent->assertDontSee('The Hill Signature Estate For Sale');

        // 2. Sale catalog
        $responseSale = $this->get(route('properties.index', ['listing_type' => 'sale']));
        $responseSale->assertStatus(200);
        $responseSale->assertSee('The Hill Signature Estate For Sale');
        $responseSale->assertDontSee('Marina Waterfront Test Villa');

        // 3. Location filter
        $responseLocation = $this->get(route('properties.index', [
            'listing_type' => 'rent',
            'location' => $this->location->slug,
        ]));
        $responseLocation->assertStatus(200);
        $responseLocation->assertSee('Marina Waterfront Test Villa');
    }

    /**
     * Test Property detail page renders with editorial gallery and interactive booking widget (Section 127).
     */
    public function test_property_detail_page_renders_with_booking_widget(): void
    {
        $response = $this->get(route('properties.show', $this->rentalProperty->slug));

        $response->assertStatus(200);
        $response->assertSee('Marina Waterfront Test Villa');
        $response->assertSee('GON-FRONT-RENT-01');
        $response->assertSee('3 Beds');
        $response->assertSee('3 Baths');
        $response->assertSee('Reserve Villa Now');
        $response->assertSee('Instant Booking');
        $response->assertSee('WhatsApp Concierge');
    }

    /**
     * Test for-sale property detail shows viewing inquiry form.
     */
    public function test_sale_property_shows_viewing_inquiry_and_stores_lead(): void
    {
        $response = $this->get(route('properties.show', $this->saleProperty->slug));

        $response->assertStatus(200);
        $response->assertSee('The Hill Signature Estate For Sale');
        $response->assertSee('Request Private Viewing');
        $response->assertSee('45,000,000');

        // Submit viewing inquiry
        $inquiryResponse = $this->post(route('properties.inquire', $this->saleProperty->slug), [
            'name' => 'Investor Jack',
            'email' => 'jack@frontend-test.com',
            'phone' => '+201099887766',
            'message' => 'I would like to schedule a private viewing this Saturday afternoon.',
            'type' => 'property_sale',
        ]);

        $inquiryResponse->assertSessionHas('success');

        $this->assertDatabaseHas('leads', [
            'name' => 'Investor Jack',
            'email' => 'jack@frontend-test.com',
            'leadable_id' => $this->saleProperty->id,
            'leadable_type' => Property::class,
            'type' => 'property_sale',
        ]);
    }

    /**
     * Test Experiences catalog page renders.
     */
    public function test_experiences_catalog_renders(): void
    {
        $response = $this->get(route('experiences.index'));

        $response->assertStatus(200);
        $response->assertSee('Curated Experiences');
        $response->assertSee('Tawila Island Private Yacht Cruise');
        $response->assertSee('Boat Trips');
    }

    /**
     * Test Experience detail page and booking inquiry.
     */
    public function test_experience_detail_page_and_inquiry(): void
    {
        $response = $this->get(route('experiences.show', $this->experience->slug));

        $response->assertStatus(200);
        $response->assertSee('Tawila Island Private Yacht Cruise');
        $response->assertSee('8 Hours');
        $response->assertSee('Request Experience Booking');

        // Submit experience inquiry
        $inquiryResponse = $this->post(route('experiences.inquire', $this->experience->slug), [
            'name' => 'Traveler Emma',
            'email' => 'emma@frontend-test.com',
            'phone' => '+201055443322',
            'requested_date' => now()->addDays(5)->toDateString(),
            'guests' => 4,
            'message' => 'Please arrange sunset timing and champagne on board.',
        ]);

        $inquiryResponse->assertSessionHas('success');

        $this->assertDatabaseHas('leads', [
            'name' => 'Traveler Emma',
            'email' => 'emma@frontend-test.com',
            'leadable_id' => $this->experience->id,
            'leadable_type' => Experience::class,
            'type' => 'experience',
        ]);
    }

    /**
     * Test Arabic bilingual locale rendering (RTL).
     */
    public function test_arabic_locale_renders_rtl_direction(): void
    {
        $response = $this->withSession(['locale' => 'ar'])->get(route('home'));

        $response->assertStatus(200);
        $response->assertSee('dir="rtl"', false);
        $response->assertSee('lang="ar"', false);
    }
}
