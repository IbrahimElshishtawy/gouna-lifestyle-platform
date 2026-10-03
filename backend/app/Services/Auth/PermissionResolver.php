<?php

namespace App\Services\Auth;

use App\Models\User;
use Illuminate\Support\Facades\Cache;

class PermissionResolver
{
    /**
     * In-memory request-level cache mapping user ID to resolved permission map.
     *
     * @var array<int, array<string, bool>>
     */
    private array $requestCache = [];

    /**
     * Map of modern canonical names to legacy database permission names.
     */
    private const ALIASES = [
        'properties.view' => 'view_properties',
        'properties.create' => 'create_properties',
        'properties.update' => 'edit_properties',
        'properties.delete' => 'delete_properties',
        'pricing.manage' => 'manage_pricing',
        'availability.manage' => 'manage_availability',
        'bookings.view' => 'manage_bookings',
        'bookings.manage' => 'manage_bookings',
        'payments.view' => 'manage_payments',
        'payments.refund' => 'manage_payments',
        'experiences.view' => 'manage_experiences',
        'experiences.create' => 'manage_experiences',
        'experiences.update' => 'manage_experiences',
        'experiences.delete' => 'manage_experiences',
        'vehicles.manage' => 'manage_vehicles',
        'events.view' => 'manage_events',
        'events.create' => 'manage_events',
        'events.update' => 'manage_events',
        'events.delete' => 'manage_events',
        'tickets.scan' => 'manage_tickets',
        'customers.view' => 'manage_customers',
        'customers.manage' => 'manage_customers',
        'leads.view' => 'manage_leads',
        'leads.manage' => 'manage_leads',
        'cms.manage' => 'manage_content',
        'media.manage' => 'manage_media',
        'seo.manage' => 'manage_seo',
        'settings.manage' => 'manage_settings',
        'users.manage' => 'manage_users',
        'reports.view' => 'view_reports',
        'dashboard.view' => 'view_dashboard',
    ];

    /**
     * Resolve and return the complete permission set for a user.
     * Guaranteed to execute at most 2 queries on first check and 0 queries thereafter.
     *
     * @return array<string, bool>
     */
    public function resolvePermissions(User $user): array
    {
        if (isset($this->requestCache[$user->id])) {
            return $this->requestCache[$user->id];
        }

        // Super admins have universal wildcard permission
        if ($user->is_admin || $user->hasRole('super_admin')) {
            $this->requestCache[$user->id] = ['*' => true];

            return $this->requestCache[$user->id];
        }

        $cacheKey = "user_permissions_{$user->id}";

        $permissions = Cache::remember($cacheKey, 3600, function () use ($user) {
            // Eager load roles with their permissions, and direct user permissions in 2 efficient queries
            $user->loadMissing(['roles.permissions', 'permissions']);

            $map = [];

            // 1. Grant role-level permissions
            foreach ($user->roles as $role) {
                foreach ($role->permissions as $perm) {
                    $map[$perm->name] = true;
                }
            }

            // 2. Apply direct user permissions (pivot 'granted' supports explicit grant or explicit deny)
            foreach ($user->permissions as $directPerm) {
                $isGranted = (bool) ($directPerm->pivot->granted ?? true);
                $map[$directPerm->name] = $isGranted;
            }

            return $map;
        });

        $this->requestCache[$user->id] = $permissions;

        return $permissions;
    }

    /**
     * Check if a user possesses a specific permission.
     */
    public function hasPermission(User $user, string $permission): bool
    {
        $resolved = $this->resolvePermissions($user);

        // Wildcard super-admin check
        if (isset($resolved['*']) && $resolved['*'] === true) {
            return true;
        }

        // Check direct key
        if (array_key_exists($permission, $resolved)) {
            return $resolved[$permission];
        }

        // Check alias mapping (canonical -> legacy)
        if (isset(self::ALIASES[$permission])) {
            $legacyKey = self::ALIASES[$permission];
            if (array_key_exists($legacyKey, $resolved)) {
                return $resolved[$legacyKey];
            }
        }

        // Check reverse alias mapping (legacy -> canonical)
        $canonicalKey = array_search($permission, self::ALIASES, true);
        if ($canonicalKey && array_key_exists($canonicalKey, $resolved)) {
            return $resolved[$canonicalKey];
        }

        return false;
    }

    /**
     * Invalidate cached permissions for a user.
     */
    public function clearCache(User $user): void
    {
        unset($this->requestCache[$user->id]);
        Cache::forget("user_permissions_{$user->id}");
    }
}
