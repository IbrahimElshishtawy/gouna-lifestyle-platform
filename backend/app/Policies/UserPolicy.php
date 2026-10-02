<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class UserPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any administrative users.
     */
    public function viewAny(User $user): bool
    {
        // Strictly restricted to Super Admin
        return (bool) ($user->is_admin || $user->hasRole('super_admin'));
    }

    /**
     * Determine whether the user can view a specific user.
     */
    public function view(User $user, User $target): bool
    {
        // Users can view their own profile; Super Admins can view any user
        return $user->id === $target->id || (bool) ($user->is_admin || $user->hasRole('super_admin'));
    }

    /**
     * Determine whether the user can create administrative users.
     */
    public function create(User $user): bool
    {
        return (bool) ($user->is_admin || $user->hasRole('super_admin'));
    }

    /**
     * Determine whether the user can update the target user.
     */
    public function update(User $user, User $target): bool
    {
        // Self-update of profile is allowed, but self-escalation is handled separately
        if ($user->id === $target->id) {
            return true;
        }

        // Updating other users requires super admin privilege
        if (! ($user->is_admin || $user->hasRole('super_admin'))) {
            return false;
        }

        return true;
    }

    /**
     * Determine whether the user can delete the target user.
     */
    public function delete(User $user, User $target): bool
    {
        // Cannot delete self
        if ($user->id === $target->id) {
            return false;
        }

        // Only super admin can delete users
        if (! ($user->is_admin || $user->hasRole('super_admin'))) {
            return false;
        }

        // Cannot delete the last active super administrator
        if ($target->is_admin || $target->hasRole('super_admin')) {
            $superAdminCount = User::where(function ($query) {
                $query->where('is_admin', true)
                    ->orWhereHas('roles', function ($rq) {
                        $rq->where('name', 'super_admin');
                    });
            })->whereNull('deleted_at')->count();

            if ($superAdminCount <= 1) {
                return false;
            }
        }

        return true;
    }

    /**
     * Determine whether the user can manage roles and permissions for the target user.
     */
    public function manageRoles(User $user, User $target): bool
    {
        // Strictly forbid self-escalation
        if ($user->id === $target->id) {
            return false;
        }

        return (bool) ($user->is_admin || $user->hasRole('super_admin'));
    }
}
