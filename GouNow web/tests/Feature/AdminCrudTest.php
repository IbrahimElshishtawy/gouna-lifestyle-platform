<?php

namespace Tests\Feature;

use App\Models\Amenity;
use App\Models\Event;
use App\Models\Experience;
use App\Models\ExperienceCategory;
use App\Models\Location;
use App\Models\PaymentMethod;
use App\Models\Property;
use App\Models\PropertyCategory;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminCrudTest extends TestCase
{
    private User $admin;
    private PropertyCategory $propCategory;
    private Location $location;
    private Amenity $amenity;
    private PaymentMethod $paymentMethod;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');

        // Clean up any test records from prior runs
        Property::where('reference_number', 'like', 'GON-P-TEST%')->forceDelete();
        Property::where('reference_number', 'like', 'GON-P-DEL%')->forceDelete();
        Property::where('title_en', 'like', '%Tawila Island%')->forceDelete();
        Experience::where('title_en', 'like', '%Sunseeker%')->forceDelete();
        Event::where('title_en', 'like', '%Sunset Festival%')->forceDelete();

        $this->admin = User::firstOrCreate(
            ['email' => 'admin@gounow.com'],
            [
                'name' => 'Super Admin',
                'password' => bcrypt('Admin@GouNow2026!'),
                'is_admin' => true,
                'is_active' => true,
            ]
        );

        $this->propCategory = PropertyCategory::firstOrCreate(
            ['slug' => 'test-villas'],
            ['name_en' => 'Test Villas', 'is_active' => true]
        );

        $this->location = Location::firstOrCreate(
            ['slug' => 'test-el-gouna'],
            ['name_en' => 'Test El Gouna', 'city' => 'El Gouna', 'country' => 'Egypt', 'is_active' => true]
        );

        $this->amenity = Amenity::firstOrCreate(
            ['name_en' => 'Private Lagoon Pool'],
            ['group' => 'outdoor', 'is_active' => true]
        );

        $this->paymentMethod = PaymentMethod::firstOrCreate(
            ['code' => 'card'],
            ['name' => 'Credit / Debit Card', 'is_enabled' => true, 'is_online' => true]
        );
    }

    public function test_admin_can_view_properties_index(): void
    {
        $response = $this->actingAs($this->admin)->get(route('admin.properties.index'));

        $response->assertStatus(200);
        $response->assertViewIs('admin.properties.index');
        $response->assertViewHas('properties');
        $response->assertSee('Property Inventory & Stays');
    }

    public function test_admin_can_view_property_create_form(): void
    {
        $response = $this->actingAs($this->admin)->get(route('admin.properties.create'));

        $response->assertStatus(200);
        $response->assertViewIs('admin.properties.create');
        $response->assertViewHas(['categories', 'locations', 'amenities', 'paymentMethods']);
        $response->assertSee('Section 20 Payment Architecture');
        $response->assertSee('Section 21 Booking Mode');
    }

    public function test_admin_can_create_property_with_media_and_section_20_21_settings(): void
    {
        $image = UploadedFile::fake()->create('villa-front.png', 500, 'image/png');

        $postData = [
            'title_en' => 'Tawila Island Waterfront Mansion',
            'title_ar' => 'قصر جزيرة تاويلة المطل على المياه',
            'property_category_id' => $this->propCategory->id,
            'location_id' => $this->location->id,
            'listing_type' => 'both',
            'short_description_en' => 'Ultra-exclusive private villa on Tawila Island.',
            'description_en' => 'Full luxury mansion with private boat dock, heated infinity pool, and concierge.',
            'bedrooms' => 5,
            'bathrooms' => 6,
            'max_guests' => 10,
            'area_sqm' => 650.00,
            'compound' => 'Tawila Islands',
            'base_price' => 18000.00,
            'sale_price' => 35000000.00,
            'cleaning_fee' => 1500.00,
            'service_fee' => 1000.00,
            'tax_percentage' => 14.00,
            'min_stay_nights' => 3,
            // Section 20 Payment Settings
            'payment_requirement' => 'both',
            'deposit_percentage' => 50.00,
            'payment_methods' => [$this->paymentMethod->id],
            // Section 21 Booking Mode
            'booking_mode' => 'instant',
            'cancellation_policy' => 'moderate',
            'status' => 'published',
            'is_published' => '1',
            'is_featured' => '1',
            'is_available' => '1',
            'amenities' => [$this->amenity->id],
            'images' => [$image],
        ];

        $response = $this->actingAs($this->admin)->post(route('admin.properties.store'), $postData);

        $response->assertRedirect(route('admin.properties.index'));
        $response->assertSessionHas('success');

        $property = Property::where('title_en', 'Tawila Island Waterfront Mansion')->first();
        $this->assertNotNull($property);
        $this->assertEquals(1800000, $property->base_price_cents); // 18000 EGP = 1,800,000 cents
        $this->assertEquals(3500000000, $property->sale_price_cents);
        $this->assertEquals('both', $property->payment_requirement);
        $this->assertEquals(50.00, $property->deposit_percentage);
        $this->assertEquals('instant', $property->booking_mode);
        $this->assertTrue($property->is_published);
        $this->assertTrue($property->is_featured);

        // Check amenities pivot
        $this->assertTrue($property->amenities->contains($this->amenity->id));

        // Check media upload
        $this->assertCount(1, $property->media);
        $this->assertTrue($property->media->first()->is_featured);
    }

    public function test_admin_can_edit_and_update_property(): void
    {
        $property = Property::create([
            'reference_number' => 'GON-P-TEST' . rand(1000, 9999),
            'slug' => 'test-edit-villa-' . uniqid(),
            'property_category_id' => $this->propCategory->id,
            'location_id' => $this->location->id,
            'title_en' => 'Original Villa Title',
            'listing_type' => 'rent',
            'bedrooms' => 3,
            'bathrooms' => 3,
            'max_guests' => 6,
            'base_price_cents' => 600000, // 6,000 EGP
            'currency' => 'EGP',
            'payment_requirement' => 'deposit',
            'deposit_percentage' => 30.00,
            'booking_mode' => 'request',
            'cancellation_policy' => 'strict',
            'status' => 'draft',
        ]);

        // Edit form
        $response = $this->actingAs($this->admin)->get(route('admin.properties.edit', $property));
        $response->assertStatus(200);
        $response->assertSee('Original Villa Title');

        // Update
        $updateData = [
            'title_en' => 'Updated Villa Title Premium',
            'property_category_id' => $this->propCategory->id,
            'location_id' => $this->location->id,
            'listing_type' => 'rent',
            'bedrooms' => 4,
            'bathrooms' => 4,
            'max_guests' => 8,
            'base_price' => 7500.00,
            'payment_requirement' => 'full',
            'booking_mode' => 'instant',
            'cancellation_policy' => 'flexible',
            'status' => 'published',
            'is_published' => '1',
            'amenities' => [$this->amenity->id],
        ];

        $updateResponse = $this->actingAs($this->admin)->put(route('admin.properties.update', $property), $updateData);
        $updateResponse->assertRedirect(route('admin.properties.index'));

        $property->refresh();
        $this->assertEquals('Updated Villa Title Premium', $property->title_en);
        $this->assertEquals(750000, $property->base_price_cents);
        $this->assertEquals('full', $property->payment_requirement);
        $this->assertEquals('instant', $property->booking_mode);
        $this->assertTrue($property->is_published);
    }

    public function test_admin_can_delete_property_and_attached_media(): void
    {
        $property = Property::create([
            'reference_number' => 'GON-P-DEL' . rand(1000, 9999),
            'slug' => 'test-delete-villa-' . uniqid(),
            'property_category_id' => $this->propCategory->id,
            'location_id' => $this->location->id,
            'title_en' => 'Delete Me Villa',
            'listing_type' => 'rent',
            'bedrooms' => 2,
            'bathrooms' => 2,
            'max_guests' => 4,
            'base_price_cents' => 300000,
            'currency' => 'EGP',
            'payment_requirement' => 'full',
            'booking_mode' => 'instant',
            'cancellation_policy' => 'flexible',
            'status' => 'draft',
        ]);

        $image = UploadedFile::fake()->create('photo.png', 500, 'image/png');
        $mediaService = app(\App\Services\MediaService::class);
        $media = $mediaService->uploadMedia($property, $image, true, 'Delete Me');

        $this->assertDatabaseHas('media', ['id' => $media->id]);

        // Delete media
        $mediaDeleteResponse = $this->actingAs($this->admin)->delete(
            route('admin.properties.media.destroy', ['property' => $property, 'media' => $media])
        );
        $mediaDeleteResponse->assertSessionHas('success');
        $this->assertDatabaseMissing('media', ['id' => $media->id]);

        // Delete property
        $propDeleteResponse = $this->actingAs($this->admin)->delete(route('admin.properties.destroy', $property));
        $propDeleteResponse->assertRedirect(route('admin.properties.index'));
        $this->assertSoftDeleted('properties', ['id' => $property->id]);
    }

    public function test_admin_can_manage_experiences(): void
    {
        $expCategory = ExperienceCategory::firstOrCreate(
            ['slug' => 'yacht-charters'],
            ['name_en' => 'Yacht Charters', 'is_active' => true]
        );

        // Index
        $indexResponse = $this->actingAs($this->admin)->get(route('admin.experiences.index'));
        $indexResponse->assertStatus(200);

        // Create form
        $createResponse = $this->actingAs($this->admin)->get(route('admin.experiences.create'));
        $createResponse->assertStatus(200);

        // Store
        $image = UploadedFile::fake()->create('yacht.png', 500, 'image/png');
        $storeResponse = $this->actingAs($this->admin)->post(route('admin.experiences.store'), [
            'title_en' => 'Luxury Sunseeker Yacht Tour',
            'title_ar' => 'جولة يخت صن سيكر الفاخر',
            'experience_category_id' => $expCategory->id,
            'location_id' => $this->location->id,
            'pricing_model' => 'per_group',
            'base_price' => 15000.00,
            'duration' => '4 Hours',
            'max_capacity' => 10,
            'payment_requirement' => 'deposit',
            'deposit_percentage' => 50.00,
            'booking_mode' => 'whatsapp',
            'status' => 'published',
            'is_published' => '1',
            'images' => [$image],
        ]);

        $storeResponse->assertRedirect(route('admin.experiences.index'));

        $experience = Experience::where('title_en', 'Luxury Sunseeker Yacht Tour')->first();
        $this->assertNotNull($experience);
        $this->assertEquals(1500000, $experience->base_price_cents);
        $this->assertEquals('per_group', $experience->pricing_model);
        $this->assertEquals('whatsapp', $experience->booking_mode);
        $this->assertCount(1, $experience->media);

        // Edit
        $editResponse = $this->actingAs($this->admin)->get(route('admin.experiences.edit', $experience));
        $editResponse->assertStatus(200);

        // Update
        $updateResponse = $this->actingAs($this->admin)->put(route('admin.experiences.update', $experience), [
            'title_en' => 'Luxury Sunseeker Yacht Tour (Updated)',
            'experience_category_id' => $expCategory->id,
            'pricing_model' => 'per_group',
            'base_price' => 18000.00,
            'payment_requirement' => 'full',
            'booking_mode' => 'instant',
            'status' => 'published',
        ]);
        $updateResponse->assertRedirect(route('admin.experiences.index'));

        $experience->refresh();
        $this->assertEquals(1800000, $experience->base_price_cents);

        // Delete
        $deleteResponse = $this->actingAs($this->admin)->delete(route('admin.experiences.destroy', $experience));
        $deleteResponse->assertRedirect(route('admin.experiences.index'));
        $this->assertSoftDeleted('experiences', ['id' => $experience->id]);
    }

    public function test_admin_can_manage_events_with_ticket_tiers(): void
    {
        // Index
        $indexResponse = $this->actingAs($this->admin)->get(route('admin.events.index'));
        $indexResponse->assertStatus(200);

        // Create form
        $createResponse = $this->actingAs($this->admin)->get(route('admin.events.create'));
        $createResponse->assertStatus(200);

        // Store
        $banner = UploadedFile::fake()->create('festival.png', 500, 'image/png');
        $storeResponse = $this->actingAs($this->admin)->post(route('admin.events.store'), [
            'title_en' => 'Gouna Beach Sunset Festival',
            'title_ar' => 'مهرجان شاطئ الجونة للغروب',
            'category' => 'beach_party',
            'event_date' => now()->addDays(14)->toDateString(),
            'start_time' => '18:00',
            'end_time' => '03:00',
            'venue_name' => 'Club 88 Beach Lounge',
            'status' => 'published',
            'is_ticketed' => '1',
            'is_published' => '1',
            'banner_image' => $banner,
            'tickets' => [
                [
                    'name_en' => 'Early Bird Access',
                    'name_ar' => 'دخول مبكر',
                    'price' => 850.00,
                    'capacity' => 150,
                    'max_per_order' => 4,
                ],
                [
                    'name_en' => 'VIP Backstage Table',
                    'name_ar' => 'طاولة كبار الزوار خلف المسرح',
                    'price' => 4500.00,
                    'capacity' => 20,
                    'max_per_order' => 2,
                ],
            ],
        ]);

        $storeResponse->assertRedirect(route('admin.events.index'));

        $event = Event::where('title_en', 'Gouna Beach Sunset Festival')->first();
        $this->assertNotNull($event);
        $this->assertEquals('beach_party', $event->category);
        $this->assertCount(2, $event->ticketTypes);
        $this->assertEquals(85000, $event->ticketTypes->first()->price_cents);
        $this->assertEquals(450000, $event->ticketTypes->last()->price_cents);
        $this->assertCount(1, $event->media);

        // Edit
        $editResponse = $this->actingAs($this->admin)->get(route('admin.events.edit', $event));
        $editResponse->assertStatus(200);

        // Update
        $tierId = $event->ticketTypes->first()->id;
        $updateResponse = $this->actingAs($this->admin)->put(route('admin.events.update', $event), [
            'title_en' => 'Gouna Beach Sunset Festival 2026',
            'event_date' => now()->addDays(14)->toDateString(),
            'status' => 'published',
            'tickets' => [
                [
                    'id' => $tierId,
                    'name_en' => 'Regular Entry Tier',
                    'price' => 950.00,
                    'capacity' => 200,
                    'max_per_order' => 6,
                ]
            ],
        ]);
        $updateResponse->assertRedirect(route('admin.events.index'));

        $event->refresh();
        $this->assertEquals('Gouna Beach Sunset Festival 2026', $event->title_en);

        // Delete
        $deleteResponse = $this->actingAs($this->admin)->delete(route('admin.events.destroy', $event));
        $deleteResponse->assertRedirect(route('admin.events.index'));
        $this->assertSoftDeleted('events', ['id' => $event->id]);
    }
}
