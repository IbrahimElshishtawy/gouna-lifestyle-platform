<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleAndPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds idempotently.
     */
    public function run(): void
    {
        // Define all permissions (Legacy + Canonical aligned)
        $permissions = [
            // Dashboard
            ['name' => 'view_dashboard', 'display_name' => 'View Dashboard', 'group' => 'system'],

            // Properties
            ['name' => 'view_properties', 'display_name' => 'View Properties', 'group' => 'properties'],
            ['name' => 'create_properties', 'display_name' => 'Create Properties', 'group' => 'properties'],
            ['name' => 'edit_properties', 'display_name' => 'Edit Properties', 'group' => 'properties'],
            ['name' => 'delete_properties', 'display_name' => 'Delete Properties', 'group' => 'properties'],

            // Pricing & Availability
            ['name' => 'manage_pricing', 'display_name' => 'Manage Pricing & Seasons', 'group' => 'pricing'],
            ['name' => 'manage_availability', 'display_name' => 'Manage Availability Blocks', 'group' => 'pricing'],

            // Bookings & Payments
            ['name' => 'manage_bookings', 'display_name' => 'Manage Bookings', 'group' => 'bookings'],
            ['name' => 'manage_payments', 'display_name' => 'Manage Payments & Refunds', 'group' => 'payments'],

            // Yachts
            ['name' => 'manage_yachts', 'display_name' => 'Manage Yachts & Fleet', 'group' => 'yachts'],
            ['name' => 'view_yachts', 'display_name' => 'View Yachts', 'group' => 'yachts'],

            // Concierge
            ['name' => 'manage_concierge', 'display_name' => 'Manage Concierge Requests & Quotes', 'group' => 'concierge'],
            ['name' => 'view_concierge', 'display_name' => 'View Concierge Requests', 'group' => 'concierge'],

            // Experiences & Vehicles
            ['name' => 'manage_experiences', 'display_name' => 'Manage Experiences', 'group' => 'experiences'],
            ['name' => 'manage_vehicles', 'display_name' => 'Manage Car Rentals', 'group' => 'vehicles'],

            // Events & Ticketing
            ['name' => 'manage_events', 'display_name' => 'Manage Events', 'group' => 'events'],
            ['name' => 'manage_tickets', 'display_name' => 'Manage Tickets & QR Check-in', 'group' => 'events'],

            // Customers & Leads
            ['name' => 'manage_customers', 'display_name' => 'Manage Customers', 'group' => 'customers'],
            ['name' => 'manage_leads', 'display_name' => 'Manage Leads & Inquiries', 'group' => 'leads'],

            // Content & CMS
            ['name' => 'manage_content', 'display_name' => 'Manage Pages & CMS', 'group' => 'cms'],
            ['name' => 'manage_media', 'display_name' => 'Manage Media Library', 'group' => 'cms'],
            ['name' => 'manage_seo', 'display_name' => 'Manage SEO & Redirects', 'group' => 'seo'],

            // Administration & Settings
            ['name' => 'manage_settings', 'display_name' => 'Manage System Settings', 'group' => 'system'],
            ['name' => 'manage_users', 'display_name' => 'Manage Admins & Staff', 'group' => 'system'],
            ['name' => 'manage_roles', 'display_name' => 'Manage Roles & Permissions', 'group' => 'system'],
            ['name' => 'view_audit_logs', 'display_name' => 'View Audit & Activity Logs', 'group' => 'system'],
            ['name' => 'view_reports', 'display_name' => 'View Financial & Business Reports', 'group' => 'reports'],
        ];

        foreach ($permissions as $p) {
            Permission::updateOrCreate(
                ['name' => $p['name']],
                [
                    'display_name' => $p['display_name'],
                    'group' => $p['group'],
                ]
            );
        }

        // Define Roles with explicit scopes and permission assignments
        $roles = [
            'super_admin' => [
                'display_name' => 'Super Administrator',
                'description' => 'Full access to all system features and configurations.',
                'is_system' => true,
                'permissions' => array_column($permissions, 'name'),
            ],
            'property_manager' => [
                'display_name' => 'Property Manager',
                'description' => 'Manages rentals, property listings, seasonal pricing, and availability.',
                'is_system' => true,
                'permissions' => [
                    'view_dashboard', 'view_properties', 'create_properties', 'edit_properties', 'delete_properties',
                    'manage_pricing', 'manage_availability', 'manage_bookings', 'manage_customers',
                    'manage_leads', 'manage_media',
                ],
            ],
            'yacht_manager' => [
                'display_name' => 'Yacht Fleet Manager',
                'description' => 'Oversees yacht fleet, marina charters, dynamic boat pricing, and schedules.',
                'is_system' => false,
                'permissions' => [
                    'view_dashboard', 'manage_yachts', 'view_yachts', 'manage_pricing', 'manage_availability',
                    'manage_bookings', 'manage_customers', 'manage_media',
                ],
            ],
            'concierge_manager' => [
                'display_name' => 'Concierge Operations Manager',
                'description' => 'Assigns and supervises concierge requests, custom quotes, and VIP bookings.',
                'is_system' => false,
                'permissions' => [
                    'view_dashboard', 'manage_concierge', 'view_concierge', 'manage_bookings', 'manage_customers',
                    'manage_leads', 'view_yachts', 'view_properties',
                ],
            ],
            'concierge_agent' => [
                'display_name' => 'Concierge Desk Agent',
                'description' => 'Handles assigned concierge requests, client quotes, and reservation workflows.',
                'is_system' => false,
                'permissions' => [
                    'view_dashboard', 'view_concierge', 'manage_concierge', 'view_yachts', 'view_properties',
                ],
            ],
            'sales' => [
                'display_name' => 'Sales & Real Estate Agent',
                'description' => 'Manages property sale listings, inquiries, and customer leads.',
                'is_system' => true,
                'permissions' => [
                    'view_dashboard', 'view_properties', 'create_properties', 'edit_properties',
                    'manage_leads', 'manage_customers',
                ],
            ],
            'events_manager' => [
                'display_name' => 'Events & Experiences Manager',
                'description' => 'Manages events, ticket types, check-ins, and experience packages.',
                'is_system' => true,
                'permissions' => [
                    'view_dashboard', 'manage_events', 'manage_tickets', 'manage_experiences', 'manage_vehicles',
                    'manage_customers', 'manage_media',
                ],
            ],
            'content_manager' => [
                'display_name' => 'Content & Marketing Manager',
                'description' => 'Edits homepage, pages, blogs, FAQs, SEO metadata, and media.',
                'is_system' => true,
                'permissions' => [
                    'view_dashboard', 'manage_content', 'manage_media', 'manage_seo', 'view_properties',
                ],
            ],
            'finance' => [
                'display_name' => 'Finance & Accounting',
                'description' => 'Oversees payments, refunds, manual payment reconciliations, and financial reporting.',
                'is_system' => true,
                'permissions' => [
                    'view_dashboard', 'manage_payments', 'manage_bookings', 'view_reports',
                ],
            ],
            'support_agent' => [
                'display_name' => 'Support Agent',
                'description' => 'Customer support desk for general inquiries and guest communications.',
                'is_system' => false,
                'permissions' => [
                    'view_dashboard', 'manage_customers', 'view_concierge',
                ],
            ],
            'staff' => [
                'display_name' => 'Operations & Staff',
                'description' => 'Staff level access for guest check-ins, QR ticket scanning, and view-only operational info.',
                'is_system' => true,
                'permissions' => [
                    'view_dashboard', 'view_properties', 'manage_tickets',
                ],
            ],
        ];

        foreach ($roles as $roleKey => $roleData) {
            $role = Role::updateOrCreate(
                ['name' => $roleKey],
                [
                    'display_name' => $roleData['display_name'],
                    'description' => $roleData['description'],
                    'is_system' => $roleData['is_system'],
                ]
            );

            $permissionIds = Permission::whereIn('name', $roleData['permissions'])->pluck('id');
            $role->permissions()->sync($permissionIds);
        }
    }
}
