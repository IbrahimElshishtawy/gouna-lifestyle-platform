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
        Property::firstOrCreate(
            ['slug' => 'lagoon-villa'],
            [
                'reference_number' => 'PROP-TEST-01',
                'title_en' => 'Lagoon Villa',
                'property_category_id' => 1,
                'location_id' => 1,
                'base_price_cents' => 100000,
                'cleaning_fee_cents' => 5000,
                'security_deposit_cents' => 10000,
                'bedrooms' => 3,
                'bathrooms' => 2,
                'max_guests' => 6,
                'is_published' => true,
            ]
        );

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
}
