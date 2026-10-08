<?php

namespace Tests\Feature;

use App\Models\ConciergeQuote;
use App\Models\ConciergeRequest;
use App\Models\Permission;
use App\Models\Property;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminStaffRbacAndConciergeTest extends TestCase
{
    protected User $superAdmin;
    protected User $manager;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\RoleAndPermissionSeeder::class);

        $superAdminRole = Role::where('name', 'super_admin')->first();
        $this->superAdmin = User::factory()->create([
            'is_admin' => true,
            'is_active' => true,
            'email' => 'testsuperadmin_' . uniqid() . '@gounow.com',
            'scope' => 'all',
        ]);
        $this->superAdmin->roles()->sync([$superAdminRole->id]);

        $managerRole = Role::where('name', 'concierge_manager')->first();
        $this->manager = User::factory()->create([
            'is_admin' => true,
            'is_active' => true,
            'email' => 'conciergemanager_' . uniqid() . '@gounow.com',
            'scope' => 'concierge',
        ]);
        $this->manager->roles()->sync([$managerRole->id]);
    }

    public function test_super_admin_can_manage_staff_lifecycle_and_scope(): void
    {
        // 1. List staff
        $response = $this->actingAs($this->superAdmin, 'sanctum')
            ->getJson('/api/v1/admin/users');
        $response->assertStatus(200)
            ->assertJsonStructure(['data' => ['staff', 'roles']]);

        // 2. Create new staff member with scope
        $agentEmail = 'agent.omar.' . uniqid() . '@gounow.com';
        $createRes = $this->actingAs($this->superAdmin, 'sanctum')
            ->postJson('/api/v1/admin/users', [
                'name' => 'Agent Omar',
                'email' => $agentEmail,
                'password' => 'SecurePass123!',
                'phone' => '+201001234567',
                'role' => 'concierge_agent',
                'scope' => 'concierge',
            ]);
        $createRes->assertStatus(201)
            ->assertJsonPath('data.scope', 'concierge');

        $agentId = $createRes->json('data.id');
        $this->assertDatabaseHas('users', ['id' => $agentId, 'scope' => 'concierge']);

        // 3. View staff details
        $showRes = $this->actingAs($this->superAdmin, 'sanctum')
            ->getJson("/api/v1/admin/users/{$agentId}");
        $showRes->assertStatus(200)
            ->assertJsonPath('data.name', 'Agent Omar')
            ->assertJsonStructure(['data' => ['recent_activity']]);

        // 4. Suspend staff member
        $suspendRes = $this->actingAs($this->superAdmin, 'sanctum')
            ->postJson("/api/v1/admin/users/{$agentId}/suspend");
        $suspendRes->assertStatus(200)
            ->assertJsonPath('data.is_active', false);

        // 5. Suspended staff member cannot access protected admin API
        $agentUser = User::find($agentId);
        $agentAccessRes = $this->actingAs($agentUser, 'sanctum')
            ->getJson('/api/v1/admin/users');
        $agentAccessRes->assertStatus(403);

        // 6. Reactivate staff member
        $reactivateRes = $this->actingAs($this->superAdmin, 'sanctum')
            ->postJson("/api/v1/admin/users/{$agentId}/reactivate");
        $reactivateRes->assertStatus(200)
            ->assertJsonPath('data.is_active', true);

        // 7. Prevent self-suspension
        $selfSuspendRes = $this->actingAs($this->superAdmin, 'sanctum')
            ->postJson("/api/v1/admin/users/{$this->superAdmin->id}/suspend");
        $selfSuspendRes->assertStatus(403);
    }

    public function test_privilege_escalation_is_prevented(): void
    {
        // Manager attempts to create a Super Admin -> must be rejected
        $escalateRes = $this->actingAs($this->manager, 'sanctum')
            ->postJson('/api/v1/admin/users', [
                'name' => 'Sneaky Admin',
                'email' => 'sneaky_' . uniqid() . '@gounow.com',
                'password' => 'Password123!',
                'role' => 'super_admin',
            ]);
        $escalateRes->assertStatus(403);
    }

    public function test_roles_and_permissions_management(): void
    {
        // 1. List permissions
        $permRes = $this->actingAs($this->superAdmin, 'sanctum')
            ->getJson('/api/v1/admin/roles/permissions');
        $permRes->assertStatus(200)
            ->assertJsonStructure(['data', 'flat']);

        // 2. Create custom role
        $roleTitle = 'Custom Yacht Coordinator ' . uniqid();
        $roleRes = $this->actingAs($this->superAdmin, 'sanctum')
            ->postJson('/api/v1/admin/roles', [
                'display_name' => $roleTitle,
                'description' => 'Dedicated marina logistics officer',
                'permissions' => ['view_dashboard', 'manage_yachts', 'view_yachts'],
            ]);
        $roleRes->assertStatus(201);
        $roleId = $roleRes->json('data.id');

        // 3. Update custom role
        $updateRoleRes = $this->actingAs($this->superAdmin, 'sanctum')
            ->putJson("/api/v1/admin/roles/{$roleId}", [
                'display_name' => 'Senior Yacht Coordinator ' . uniqid(),
                'permissions' => ['view_dashboard', 'manage_yachts', 'view_yachts', 'manage_pricing'],
            ]);
        $updateRoleRes->assertStatus(200);

        // 4. Deleting system role must fail
        $systemRole = Role::where('name', 'super_admin')->first();
        $delSystemRes = $this->actingAs($this->superAdmin, 'sanctum')
            ->deleteJson("/api/v1/admin/roles/{$systemRole->id}");
        $delSystemRes->assertStatus(403);

        // 5. Deleting role with assigned users must fail
        $assignedRole = Role::where('name', 'concierge_manager')->first();
        $delAssignedRes = $this->actingAs($this->superAdmin, 'sanctum')
            ->deleteJson("/api/v1/admin/roles/{$assignedRole->id}");
        $delAssignedRes->assertStatus(422);

        // 6. Delete empty custom role succeeds
        $delRoleRes = $this->actingAs($this->superAdmin, 'sanctum')
            ->deleteJson("/api/v1/admin/roles/{$roleId}");
        $delRoleRes->assertStatus(200);
    }

    public function test_concierge_operations_and_booking_conversion(): void
    {
        // Ensure at least one property exists for booking attachment
        Property::first() ?? Property::create([
            'slug' => 'lagoon-villa',
            'reference_number' => 'PROP-TEST-01',
            'title_en' => 'Lagoon Villa',
            'listing_type' => 'rent',
            'base_price_cents' => 100000,
            'cleaning_fee_cents' => 5000,
            'security_deposit_cents' => 10000,
            'bedrooms' => 3,
            'bathrooms' => 2,
            'max_guests' => 6,
            'is_published' => true,
            'is_available' => true,
            'status' => 'published',
        ]);

        // 1. Create Concierge Request
        $customerEmail = 'lord_' . uniqid() . '@luxurytravel.com';
        $createRes = $this->actingAs($this->manager, 'sanctum')
            ->postJson('/api/v1/admin/concierge', [
                'customer_name' => 'Lord Mountbatten',
                'customer_email' => $customerEmail,
                'customer_phone' => '+447911123456',
                'request_type' => 'yacht',
                'priority' => 'urgent',
                'description' => 'Sunset yacht cruise with sushi catering and photographer for 8 guests.',
                'preferred_date' => now()->addDays(5)->toDateString(),
                'preferred_time' => '17:00',
                'guests_count' => 8,
                'budget' => 35000,
                'initial_note' => 'Client requires champagne upon embarkation.',
            ]);
        $createRes->assertStatus(201)
            ->assertJsonPath('data.priority', 'urgent');

        $requestId = $createRes->json('data.id');
        $this->assertDatabaseHas('concierge_requests', ['id' => $requestId, 'status' => 'new']);

        // 2. Assign to Agent
        $assignRes = $this->actingAs($this->manager, 'sanctum')
            ->postJson("/api/v1/admin/concierge/{$requestId}/assign", [
                'user_id' => $this->manager->id,
                'reason' => 'High profile VIP client handling',
            ]);
        $assignRes->assertStatus(200)
            ->assertJsonPath('data.status', 'assigned');

        // 3. Status transition machine: assigned -> in_progress
        $statusRes = $this->actingAs($this->manager, 'sanctum')
            ->postJson("/api/v1/admin/concierge/{$requestId}/status", [
                'status' => 'in_progress',
                'reason' => 'Sourcing available 60ft yachts',
            ]);
        $statusRes->assertStatus(200)
            ->assertJsonPath('data.status', 'in_progress');

        // 4. Illegal state transition check (e.g. in_progress -> completed without quote/booking)
        $illegalStatusRes = $this->actingAs($this->manager, 'sanctum')
            ->postJson("/api/v1/admin/concierge/{$requestId}/status", [
                'status' => 'completed',
            ]);
        $illegalStatusRes->assertStatus(422);

        // 5. Append private internal note
        $noteRes = $this->actingAs($this->manager, 'sanctum')
            ->postJson("/api/v1/admin/concierge/{$requestId}/notes", [
                'content' => 'Captain Tamer confirmed yacht availability for Friday 5 PM.',
                'is_customer_visible' => false,
            ]);
        $noteRes->assertStatus(201)
            ->assertJsonPath('data.is_customer_visible', false);

        // 6. Generate authoritative quote
        $quoteRes = $this->actingAs($this->manager, 'sanctum')
            ->postJson("/api/v1/admin/concierge/{$requestId}/quotes", [
                'items' => [
                    [
                        'item_type' => 'yacht',
                        'title' => '65ft Luxury Motor Yacht (4 Hours)',
                        'quantity' => 1,
                        'unit_price' => 25000,
                    ],
                    [
                        'item_type' => 'addon',
                        'title' => 'Gourmet Sushi & Seafood Catering',
                        'quantity' => 8,
                        'unit_price' => 1000,
                    ],
                    [
                        'item_type' => 'custom',
                        'title' => 'Private Drone & Camera Crew',
                        'quantity' => 1,
                        'unit_price' => 3000,
                    ],
                ],
                'discount' => 1000,
                'fees' => 500,
                'valid_until' => now()->addDays(2)->toDateTimeString(),
            ]);
        $quoteRes->assertStatus(201);
        $quoteId = $quoteRes->json('data.id');

        // Subtotal = 25000 + 8000 + 3000 = 36000. Total = 36000 - 1000 + 500 = 35500 EGP (3,550,000 cents)
        $this->assertEquals(3550000, $quoteRes->json('data.total_cents'));

        // 7. Accept quote and convert to real authoritative Booking!
        $acceptRes = $this->actingAs($this->manager, 'sanctum')
            ->postJson("/api/v1/admin/concierge/{$requestId}/quotes/{$quoteId}/accept");
        $acceptRes->assertStatus(200)
            ->assertJsonStructure(['data' => ['quote', 'booking']]);

        $bookingRef = $acceptRes->json('data.booking.reference');
        $this->assertNotNull($bookingRef);
        $this->assertDatabaseHas('bookings', ['reference' => $bookingRef, 'status' => 'confirmed']);

        // Check request status updated to confirmed
        $this->assertDatabaseHas('concierge_requests', [
            'id' => $requestId,
            'status' => 'confirmed',
        ]);

        // 8. Replay protection: Accepting quote second time must be rejected
        $replayRes = $this->actingAs($this->manager, 'sanctum')
            ->postJson("/api/v1/admin/concierge/{$requestId}/quotes/{$quoteId}/accept");
        $replayRes->assertStatus(422);

        // 9. Dashboard KPIs reflect new activity
        $dashRes = $this->actingAs($this->manager, 'sanctum')
            ->getJson('/api/v1/admin/concierge/dashboard');
        $dashRes->assertStatus(200)
            ->assertJsonStructure(['data' => ['total_requests', 'conversion_rate']]);
    }

    public function test_fine_grained_rbac_and_scope_isolation_prevent_unauthorized_access(): void
    {
        // 1. Setup specialized staff roles
        $propManagerRole = Role::where('name', 'property_manager')->first();
        $propertyManager = User::factory()->create([
            'is_admin' => true,
            'is_active' => true,
            'email' => 'prop_mgr_' . uniqid() . '@gounow.com',
            'scope' => 'properties',
        ]);
        $propertyManager->roles()->sync([$propManagerRole->id]);

        $financeRole = Role::where('name', 'finance')->first();
        $financeManager = User::factory()->create([
            'is_admin' => true,
            'is_active' => true,
            'email' => 'finance_' . uniqid() . '@gounow.com',
            'scope' => 'all',
        ]);
        $financeManager->roles()->sync([$financeRole->id]);

        $agentRole = Role::where('name', 'concierge_agent')->first();
        $conciergeAgent = User::factory()->create([
            'is_admin' => true,
            'is_active' => true,
            'email' => 'agent_' . uniqid() . '@gounow.com',
            'scope' => 'concierge',
        ]);
        $conciergeAgent->roles()->sync([$agentRole->id]);

        // A. Concierge Agent cannot modify roles or permissions (needs manage_roles)
        $this->actingAs($conciergeAgent, 'sanctum')
            ->postJson('/api/v1/admin/roles', [
                'display_name' => 'Escalated Role',
                'permissions' => ['manage_settings'],
            ])->assertStatus(403);

        // B. Concierge Agent cannot access staff list or view another staff member (needs manage_users - IDOR guard)
        $this->actingAs($conciergeAgent, 'sanctum')
            ->getJson('/api/v1/admin/users')
            ->assertStatus(403);

        $this->actingAs($conciergeAgent, 'sanctum')
            ->getJson("/api/v1/admin/users/{$this->superAdmin->id}")
            ->assertStatus(403);

        // C. Property Manager cannot modify settings or finances (needs manage_settings)
        $this->actingAs($propertyManager, 'sanctum')
            ->putJson('/api/v1/admin/settings', [
                'site_name' => 'Hacked Name',
            ])->assertStatus(403);

        $this->actingAs($propertyManager, 'sanctum')
            ->getJson('/api/v1/admin/settings')
            ->assertStatus(403);

        // D. Property Manager cannot access concierge module (scope is properties, needs all/concierge)
        $this->actingAs($propertyManager, 'sanctum')
            ->getJson('/api/v1/admin/concierge')
            ->assertStatus(403);

        // E. Finance Manager cannot create or assign Super Admin
        $this->actingAs($financeManager, 'sanctum')
            ->postJson('/api/v1/admin/users', [
                'name' => 'Finance Escalation',
                'email' => 'fin_escalate_' . uniqid() . '@gounow.com',
                'password' => 'Password123!',
                'role' => 'super_admin',
            ])->assertStatus(403);

        // F. Normal staff cannot self-elevate role, scope, or status
        $this->actingAs($conciergeAgent, 'sanctum')
            ->putJson("/api/v1/admin/users/{$conciergeAgent->id}", [
                'role' => 'super_admin',
                'scope' => 'all',
            ])->assertStatus(403);
    }

    public function test_customer_concierge_privacy_and_quote_acceptance(): void
    {
        // Ensure property exists for quote booking conversion
        Property::first() ?? Property::create([
            'slug' => 'lagoon-villa',
            'reference_number' => 'PROP-TEST-01',
            'title_en' => 'Lagoon Villa',
            'listing_type' => 'rent',
            'base_price_cents' => 100000,
            'cleaning_fee_cents' => 5000,
            'security_deposit_cents' => 10000,
            'bedrooms' => 3,
            'bathrooms' => 2,
            'max_guests' => 6,
            'is_published' => true,
            'is_available' => true,
            'status' => 'published',
        ]);

        $customer1 = User::factory()->create([
            'is_admin' => false,
            'is_active' => true,
            'email' => 'vip_client_' . uniqid() . '@luxury.com',
        ]);

        $customer2 = User::factory()->create([
            'is_admin' => false,
            'is_active' => true,
            'email' => 'intruder_' . uniqid() . '@other.com',
        ]);

        // 1. Customer submits inquiry via public concierge endpoint
        $publicRes = $this->postJson('/api/v1/concierge', [
            'customer_name' => 'VIP Client',
            'customer_email' => $customer1->email,
            'customer_phone' => '+201099998888',
            'request_type' => 'dining',
            'description' => 'Private beachside candlelit dinner for two with live violinist.',
            'preferred_date' => now()->addDays(7)->toDateString(),
            'guests_count' => 2,
            'budget' => 15000,
        ]);
        $publicRes->assertStatus(201)
            ->assertJsonPath('data.customer_email', $customer1->email);

        $requestId = $publicRes->json('data.id');
        $this->assertNotNull($requestId);

        // Verify internal notes are NOT exposed in public response
        $this->assertArrayNotHasKey('internal_notes', $publicRes->json('data'));

        // 2. Admin adds internal note & customer visible note
        $this->actingAs($this->manager, 'sanctum')
            ->postJson("/api/v1/admin/concierge/{$requestId}/notes", [
                'content' => 'SECRET INTERNAL: Negotiate with restaurant manager for 20% commission.',
                'is_customer_visible' => false,
            ])->assertStatus(201);

        $this->actingAs($this->manager, 'sanctum')
            ->postJson("/api/v1/admin/concierge/{$requestId}/notes", [
                'content' => 'Table booked at The Smokery with private beach setup.',
                'is_customer_visible' => true,
            ])->assertStatus(201);

        // 3. Admin generates quote
        $quoteRes = $this->actingAs($this->manager, 'sanctum')
            ->postJson("/api/v1/admin/concierge/{$requestId}/quotes", [
                'items' => [
                    [
                        'item_type' => 'dining',
                        'title' => 'VIP 5-Course Dinner Setup',
                        'quantity' => 2,
                        'unit_price' => 5000,
                    ],
                    [
                        'item_type' => 'custom',
                        'title' => 'Private Violinist (2 Hours)',
                        'quantity' => 1,
                        'unit_price' => 4000,
                    ],
                ],
                'valid_until' => now()->addDays(3)->toDateTimeString(),
            ]);
        $quoteRes->assertStatus(201);
        $quoteId = $quoteRes->json('data.id');

        // 4. Authenticated Customer 1 views their concierge request
        $custViewRes = $this->actingAs($customer1, 'sanctum')
            ->getJson("/api/v1/customer/concierge/{$requestId}");
        $custViewRes->assertStatus(200)
            ->assertJsonPath('data.id', $requestId);

        // Verify internal notes are strictly hidden from Customer
        $this->assertArrayNotHasKey('internal_notes', $custViewRes->json('data'));
        $notes = $custViewRes->json('data.notes');
        $this->assertCount(1, $notes);
        $this->assertEquals('Table booked at The Smokery with private beach setup.', $notes[0]['content']);

        // 5. Customer 2 (intruder) cannot view or accept Customer 1's request
        $this->actingAs($customer2, 'sanctum')
            ->getJson("/api/v1/customer/concierge/{$requestId}")
            ->assertStatus(404);

        $this->actingAs($customer2, 'sanctum')
            ->postJson("/api/v1/customer/concierge/{$requestId}/quotes/{$quoteId}/accept")
            ->assertStatus(404);

        // 6. Customer 1 accepts quote
        $acceptRes = $this->actingAs($customer1, 'sanctum')
            ->postJson("/api/v1/customer/concierge/{$requestId}/quotes/{$quoteId}/accept");
        $acceptRes->assertStatus(200)
            ->assertJsonStructure(['data' => ['quote', 'booking']]);

        $this->assertDatabaseHas('concierge_requests', [
            'id' => $requestId,
            'status' => 'confirmed',
        ]);

        // 7. Replay acceptance is rejected with 422
        $this->actingAs($customer1, 'sanctum')
            ->postJson("/api/v1/customer/concierge/{$requestId}/quotes/{$quoteId}/accept")
            ->assertStatus(422);
    }

    public function test_quote_total_tampering_and_expired_quote_rejection(): void
    {
        $request = ConciergeRequest::create([
            'customer_name' => 'Dr. Ahmed',
            'customer_email' => 'ahmed_' . uniqid() . '@med.eg',
            'customer_phone' => '+201122334455',
            'request_type' => 'custom',
            'description' => 'Medical escort and transportation',
            'status' => 'in_progress',
        ]);

        // A. Reject quote with negative prices
        $negativeRes = $this->actingAs($this->manager, 'sanctum')
            ->postJson("/api/v1/admin/concierge/{$request->id}/quotes", [
                'items' => [
                    [
                        'item_type' => 'custom',
                        'title' => 'Fraudulent negative credit',
                        'quantity' => 1,
                        'unit_price' => -5000,
                    ],
                ],
            ]);
        $negativeRes->assertStatus(422);

        // B. Expired quote cannot be accepted
        $expiredQuoteRes = $this->actingAs($this->manager, 'sanctum')
            ->postJson("/api/v1/admin/concierge/{$request->id}/quotes", [
                'items' => [
                    [
                        'item_type' => 'custom',
                        'title' => 'Standard Transfer',
                        'quantity' => 1,
                        'unit_price' => 1000,
                    ],
                ],
                'valid_until' => now()->subDay()->toDateTimeString(),
            ]);
        $expiredQuoteRes->assertStatus(201);
        $expiredQuoteId = $expiredQuoteRes->json('data.id');

        $acceptExpiredRes = $this->actingAs($this->manager, 'sanctum')
            ->postJson("/api/v1/admin/concierge/{$request->id}/quotes/{$expiredQuoteId}/accept");
        $acceptExpiredRes->assertStatus(422);
    }
}
