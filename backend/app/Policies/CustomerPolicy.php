<?php

namespace App\Policies;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class CustomerPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any customers.
     */
    public function viewAny(User $user): bool
    {
        if ($user->is_admin || $user->hasRole('super_admin')) {
            return true;
        }

        // Staff is strictly forbidden from viewing the customer directory
        if ($user->hasRole('staff') || $user->hasRole('content_manager')) {
            return false;
        }

        return $user->hasPermission('customers.view');
    }

    /**
     * Determine whether the user can view the customer.
     */
    public function view(User $user, Customer $customer): bool
    {
        if ($user->is_admin || $user->hasRole('super_admin')) {
            return true;
        }

        // Customer viewing their own record
        if ($customer->user_id === $user->id) {
            return true;
        }

        // Staff cannot view individual customer profiles
        if ($user->hasRole('staff')) {
            return false;
        }

        // Sales can only view if customer has an assigned lead
        if ($user->hasRole('sales')) {
            return $customer->leads()->where('assigned_to', $user->id)->exists();
        }

        // Property manager or Events manager with view permission
        return $user->hasPermission('customers.view');
    }

    /**
     * Determine whether the user can create customers.
     */
    public function create(User $user): bool
    {
        if ($user->is_admin || $user->hasRole('super_admin')) {
            return true;
        }

        return $user->hasPermission('customers.manage');
    }

    /**
     * Determine whether the user can update the customer.
     */
    public function update(User $user, Customer $customer): bool
    {
        if ($user->is_admin || $user->hasRole('super_admin')) {
            return true;
        }

        // Customer updating their own profile
        if ($customer->user_id === $user->id) {
            return true;
        }

        // Staff and Sales cannot update customer records
        if ($user->hasRole('staff') || $user->hasRole('sales')) {
            return false;
        }

        return $user->hasPermission('customers.manage') && $user->hasRole('property_manager');
    }

    /**
     * Determine whether the user can delete the customer.
     */
    public function delete(User $user, Customer $customer): bool
    {
        return $user->is_admin || $user->hasRole('super_admin');
    }

    /**
     * Determine whether the user can export customer data.
     */
    public function export(User $user): bool
    {
        if ($user->is_admin || $user->hasRole('super_admin')) {
            return true;
        }

        // Staff and Content Manager are strictly forbidden from exporting customers
        if ($user->hasRole('staff') || $user->hasRole('content_manager')) {
            return false;
        }

        return $user->hasPermission('reports.view') && $user->hasRole('finance');
    }
}
