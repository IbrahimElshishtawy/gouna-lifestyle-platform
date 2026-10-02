<?php

namespace App\Policies;

use App\Models\Lead;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class LeadPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any leads.
     */
    public function viewAny(User $user): bool
    {
        if ($user->is_admin || $user->hasRole('super_admin')) {
            return true;
        }

        if ($user->hasRole('staff') || $user->hasRole('content_manager')) {
            return false;
        }

        return $user->hasPermission('leads.view');
    }

    /**
     * Determine whether the user can view the lead.
     */
    public function view(User $user, Lead $lead): bool
    {
        if ($user->is_admin || $user->hasRole('super_admin')) {
            return true;
        }

        if ($user->hasRole('staff') || $user->hasRole('content_manager')) {
            return false;
        }

        // Property managers can view all operational leads
        if ($user->hasRole('property_manager') && $user->hasPermission('leads.view')) {
            return true;
        }

        // Sales agents can view leads assigned to them or general sales inquiries
        if ($user->hasRole('sales') && $user->hasPermission('leads.view')) {
            return $lead->assigned_to === $user->id
                || in_array($lead->type, ['sale', 'viewing', 'buyer'], true);
        }

        return false;
    }

    /**
     * Determine whether the user can create leads.
     */
    public function create(?User $user): bool
    {
        // Public users and authenticated agents can submit leads
        return true;
    }

    /**
     * Determine whether the user can update the lead.
     */
    public function update(User $user, Lead $lead): bool
    {
        if ($user->is_admin || $user->hasRole('super_admin')) {
            return true;
        }

        if ($user->hasRole('staff') || $user->hasRole('content_manager')) {
            return false;
        }

        if ($user->hasRole('property_manager') && $user->hasPermission('leads.manage')) {
            return true;
        }

        if ($user->hasRole('sales') && $user->hasPermission('leads.manage')) {
            return $lead->assigned_to === $user->id;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the lead.
     */
    public function delete(User $user, Lead $lead): bool
    {
        return $user->is_admin || $user->hasRole('super_admin');
    }
}
