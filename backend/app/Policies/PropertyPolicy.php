<?php

namespace App\Policies;

use App\Models\Property;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class PropertyPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any properties.
     */
    public function viewAny(?User $user): bool
    {
        // Public users can view published listings; authenticated users with permission can view administrative list
        if (! $user) {
            return true;
        }

        if ($user->is_admin || $user->hasRole('super_admin')) {
            return true;
        }

        return $user->hasPermission('properties.view');
    }

    /**
     * Determine whether the user can view the specific property.
     */
    public function view(?User $user, Property $property): bool
    {
        // Publicly published properties are viewable by anyone
        if ($property->is_published && $property->status === 'published') {
            return true;
        }

        // Unpublished / draft / archived requires administrative view permission
        if (! $user) {
            return false;
        }

        if ($user->is_admin || $user->hasRole('super_admin')) {
            return true;
        }

        return $user->hasPermission('properties.view');
    }

    /**
     * Determine whether the user can create properties.
     */
    public function create(User $user): bool
    {
        if ($user->is_admin || $user->hasRole('super_admin')) {
            return true;
        }

        return $user->hasPermission('properties.create');
    }

    /**
     * Determine whether the user can update the property.
     */
    public function update(User $user, Property $property): bool
    {
        if ($user->is_admin || $user->hasRole('super_admin')) {
            return true;
        }

        // Must possess edit permission
        if (! $user->hasPermission('properties.update')) {
            return false;
        }

        // Sales role can only update properties that are for sale
        if ($user->hasRole('sales')) {
            return in_array($property->listing_type, ['sale', 'both'], true);
        }

        // Property manager can update rental and sale properties
        return $user->hasRole('property_manager');
    }

    /**
     * Determine whether the user can delete the property.
     */
    public function delete(User $user, Property $property): bool
    {
        if ($user->is_admin || $user->hasRole('super_admin')) {
            return true;
        }

        // Staff and Sales are STRICTLY FORBIDDEN from deleting properties
        if ($user->hasRole('staff') || $user->hasRole('sales')) {
            return false;
        }

        return $user->hasPermission('properties.delete') && $user->hasRole('property_manager');
    }

    /**
     * Determine whether the user can manage pricing.
     */
    public function managePricing(User $user, Property $property): bool
    {
        if ($user->is_admin || $user->hasRole('super_admin')) {
            return true;
        }

        return $user->hasPermission('pricing.manage');
    }

    /**
     * Determine whether the user can manage availability.
     */
    public function manageAvailability(User $user, Property $property): bool
    {
        if ($user->is_admin || $user->hasRole('super_admin')) {
            return true;
        }

        return $user->hasPermission('availability.manage');
    }
}
