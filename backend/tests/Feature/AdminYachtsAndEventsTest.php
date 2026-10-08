<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Event;
use App\Models\EventOrder;
use App\Models\EventTicket;
use App\Models\EventTicketType;
use App\Models\User;
use App\Models\Venue;
use App\Models\Yacht;
use Tests\TestCase;

class AdminYachtsAndEventsTest extends TestCase
{
    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::firstOrCreate(
            ['email' => 'admin@gounow.com'],
            [
                'name' => 'Super Administrator',
                'password' => bcrypt('GouNow@2026!Secure'),
                'is_admin' => true,
                'is_active' => true,
                'two_factor_secret' => 'SECRET',
                'two_factor_confirmed_at' => now(),
            ]
        );
    }

    public function test_admin_can_manage_yachts_lifecycle_and_dashboard(): void
    {
        // 1. Dashboard & taxonomies
        $dashRes = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/admin/yachts/dashboard');
        $dashRes->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data' => ['total_yachts', 'active_yachts', 'revenue_egp']]);

        $taxRes = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/admin/yachts/taxonomies');
        $taxRes->assertStatus(200)
            ->assertJsonPath('success', true);

        // 2. Create Yacht
        $createRes = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/admin/yachts', [
                'name_en' => 'Majesty 56 Flybridge Luxury Yacht',
                'name_ar' => 'يخت ماجستي 56 فلاي بريدج الفاخر',
                'yacht_type' => 'motor_yacht',
                'category' => 'luxury',
                'brand' => 'Gulf Craft',
                'model' => 'Majesty 56',
                'year' => 2024,
                'length_ft' => 56,
                'capacity' => 12,
                'crew_capacity' => 2,
                'cabins' => 3,
                'bathrooms' => 2,
                'pricing_model' => 'hourly',
                'base_price' => 15000.00, // 15,000 EGP / hr
                'weekend_price' => 18000.00,
                'min_duration_hours' => 3,
                'marina_berth' => 'Abu Tig Marina, Berth C-09',
                'address' => 'Abu Tig Marina, El Gouna',
                'status' => 'active',
            ]);

        $createRes->assertStatus(201)
            ->assertJsonPath('success', true);
        $yachtId = $createRes->json('data.id');

        // 3. Show & Update
        $showRes = $this->actingAs($this->admin, 'sanctum')
            ->getJson("/api/v1/admin/yachts/{$yachtId}");
        $showRes->assertStatus(200)
            ->assertJsonPath('data.brand', 'Gulf Craft');

        $updateRes = $this->actingAs($this->admin, 'sanctum')
            ->putJson("/api/v1/admin/yachts/{$yachtId}", [
                'capacity' => 14,
                'base_price' => 16500.00,
            ]);
        $updateRes->assertStatus(200)
            ->assertJsonPath('data.capacity', 14);

        // 4. Add Package
        $pkgRes = $this->actingAs($this->admin, 'sanctum')
            ->postJson("/api/v1/admin/yachts/{$yachtId}/packages", [
                'name_en' => 'VIP Sunset Toast Cruise',
                'name_ar' => 'جولة الغروب الخاصة مع الشمبانيا',
                'duration_hours' => 3.0,
                'capacity' => 14,
                'price' => 45000.00,
                'inclusions_en' => ['Captain & Crew', 'Artisan Platters'],
            ]);
        $pkgRes->assertStatus(201)
            ->assertJsonPath('data.name_en', 'VIP Sunset Toast Cruise');
        $pkgId = $pkgRes->json('data.id');

        // 4.1 Add Add-on
        $addonRes = $this->actingAs($this->admin, 'sanctum')
            ->postJson("/api/v1/admin/yachts/{$yachtId}/addons", [
                'name_en' => 'Live Saxophonist & DJ',
                'price' => 7500.00,
                'pricing_model' => 'per_booking',
            ]);
        $addonRes->assertStatus(201)
            ->assertJsonPath('data.name_en', 'Live Saxophonist & DJ');
        $addonId = $addonRes->json('data.id');

        // 4.2 Test Authoritative Price Calculation
        $priceRes = $this->actingAs($this->admin, 'sanctum')
            ->postJson("/api/v1/admin/yachts/{$yachtId}/calculate-price", [
                'date' => now()->next('Friday')->toDateString(), // weekend
                'duration_hours' => 4, // 1 extra hour
                'package_id' => $pkgId,
                'addon_ids' => [$addonId],
            ]);
        $priceRes->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data' => ['base_price', 'weekend_adjustment', 'extra_hours_cost', 'addons_cost', 'final_price']]);

        // 4.3 View Bookings
        $bookingsRes = $this->actingAs($this->admin, 'sanctum')
            ->getJson("/api/v1/admin/yachts/{$yachtId}/bookings");
        $bookingsRes->assertStatus(200)
            ->assertJsonPath('success', true);

        // 5. Add Availability Block
        $blockRes = $this->actingAs($this->admin, 'sanctum')
            ->postJson("/api/v1/admin/yachts/{$yachtId}/availability-blocks", [
                'start_date' => now()->addDays(5)->toDateString(),
                'end_date' => now()->addDays(7)->toDateString(),
                'status' => 'maintenance',
                'reason' => 'Engine inspection and polishing',
            ]);
        $blockRes->assertStatus(201)
            ->assertJsonPath('data.status', 'maintenance');

        // 6. Toggle Status
        $toggleRes = $this->actingAs($this->admin, 'sanctum')
            ->patchJson("/api/v1/admin/yachts/{$yachtId}/toggle-status");
        $toggleRes->assertStatus(200)
            ->assertJsonPath('status', 'suspended');

        // 7. Delete
        $deleteRes = $this->actingAs($this->admin, 'sanctum')
            ->deleteJson("/api/v1/admin/yachts/{$yachtId}");
        $deleteRes->assertStatus(200);
        $this->assertSoftDeleted('yachts', ['id' => $yachtId]);
    }

    public function test_admin_can_manage_events_and_perform_secure_checkin(): void
    {
        // 1. Dashboard & Taxonomies
        $dashRes = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/admin/events/dashboard');
        $dashRes->assertStatus(200)
            ->assertJsonPath('success', true);

        // 2. Create Venue
        $venueRes = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/admin/venues', [
                'name_en' => 'The Smokery Yacht Club Deck',
                'name_ar' => 'تراس نادي سموكري لليخوت',
                'venue_type' => 'marina',
                'capacity' => 400,
                'address' => 'Abu Tig Marina, South Gate',
                'status' => 'active',
            ]);
        $venueRes->assertStatus(201);
        $venueId = $venueRes->json('data.id');

        // 3. Create Event with Ticket Tiers and Timeline
        $eventRes = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/admin/events', [
                'title_en' => 'Full Moon Electronic Yacht Party',
                'title_ar' => 'حفلة البدر الإلكترونية على شاطئ المارينا',
                'venue_id' => $venueId,
                'category' => 'Party',
                'event_date' => now()->addDays(10)->toDateString(),
                'start_time' => '21:00',
                'doors_open_time' => '19:30',
                'age_restriction' => '21+',
                'status' => 'published',
                'tickets' => [
                    [
                        'name_en' => 'Early Bird Access',
                        'price' => 1200.00,
                        'capacity' => 150,
                        'max_per_order' => 4,
                    ],
                    [
                        'name_en' => 'VIP Backstage Deck',
                        'price' => 3500.00,
                        'capacity' => 30,
                        'max_per_order' => 2,
                    ],
                ],
                'schedules' => [
                    [
                        'title_en' => 'Doors Open & Warmup Lounge',
                        'start_time' => '19:30',
                    ],
                    [
                        'title_en' => 'Headliner DJ Set',
                        'start_time' => '22:00',
                        'performer_name' => 'DJ Solomun Red Sea Tour',
                    ],
                ],
            ]);

        $eventRes->assertStatus(201)
            ->assertJsonPath('data.title_en', 'Full Moon Electronic Yacht Party');
        $eventId = $eventRes->json('data.id');

        // 4. Create an order and ticket for check-in verification
        $customer = Customer::create([
            'first_name' => 'Nour',
            'last_name' => 'El-Sayed',
            'email' => 'nour.'.uniqid().'@example.com',
            'phone' => '+201122334455',
        ]);

        $event = Event::with('ticketTypes')->find($eventId);
        $tier = $event->ticketTypes->first();

        $ticketCode = 'TCK-VERIFY-'.uniqid();
        $order = EventOrder::create([
            'order_number' => 'ORD-TEST-'.uniqid(),
            'event_id' => $event->id,
            'customer_id' => $customer->id,
            'total_cents' => $tier->price_cents,
            'currency' => 'EGP',
            'status' => 'paid',
            'payment_status' => 'paid',
        ]);

        $validTicket = EventTicket::create([
            'event_order_id' => $order->id,
            'event_id' => $event->id,
            'event_ticket_type_id' => $tier->id,
            'customer_id' => $customer->id,
            'ticket_number' => $ticketCode,
            'qr_token' => 'QR-TOKEN-'.uniqid(),
            'price_cents' => $tier->price_cents,
            'currency' => 'EGP',
            'status' => 'valid',
        ]);

        // 5. Test Live Ticket Check-in (Success)
        $checkinRes = $this->actingAs($this->admin, 'sanctum')
            ->postJson("/api/v1/admin/events/{$eventId}/check-in", [
                'ticket_code' => $ticketCode,
            ]);

        $checkinRes->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('result', 'success')
            ->assertJsonPath('ticket.customer_name', 'Nour El-Sayed');

        // Verify status mutated to used
        $this->assertEquals('used', $validTicket->fresh()->status);

        // 6. Test Double Check-in Prevention (Should fail with 422)
        $doubleCheckinRes = $this->actingAs($this->admin, 'sanctum')
            ->postJson("/api/v1/admin/events/{$eventId}/check-in", [
                'ticket_code' => $ticketCode,
            ]);

        $doubleCheckinRes->assertStatus(422)
            ->assertJsonPath('result', 'already_used');

        // 7. Test Fake Ticket (Should fail with 404)
        $fakeCheckinRes = $this->actingAs($this->admin, 'sanctum')
            ->postJson("/api/v1/admin/events/{$eventId}/check-in", [
                'ticket_code' => 'FAKE-TICKET-CODE-XYZ',
            ]);

        $fakeCheckinRes->assertStatus(404)
            ->assertJsonPath('result', 'invalid');

        // 8. Test Search Tickets
        $searchRes = $this->actingAs($this->admin, 'sanctum')
            ->getJson("/api/v1/admin/events/{$eventId}/check-in/search?q=Nour");

        $searchRes->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(1, 'data');
    }
}
