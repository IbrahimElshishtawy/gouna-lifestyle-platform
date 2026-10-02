<?php

namespace App\Policies;

use App\Models\Experience;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ExperiencePolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any experiences.
     */
    public function viewAny(?User $user): bool
    {
        if (! $user) {
            return true;
        }

        if ($user->is_admin || $user->hasRole('super_admin')) {
            return true;
        }

        return $user->hasPermission('experiences.view');
    }

    /**
     * Determine whether the user can view the experience.
     */
    public function view(?User $user, Experience $experience): bool
    {
        if ($experience->is_published && $experience->status === 'published') {
            return true;
        }

        if (! $user) {
            return false;
        }

        if ($user->is_admin || $user->hasRole('super_admin')) {
            return true;
        }

        return $user->hasPermission('experiences.view');
    }

    /**
     * Determine whether the user can create experiences.
     */
    public function create(User $user): bool
    {
        if ($user->is_admin || $user->hasRole('super_admin')) {
            return true;
        }

        return $user->hasRole('events_manager') && $user->hasPermission('experiences.create');
    }

    /**
     * Determine whether the user can update the experience.
     */
    public function update(User $user, Experience $experience): bool
    {
        if ($user->is_admin || $user->hasRole('super_admin')) {
            return true;
        }

        return $user->hasRole('events_manager') && $user->hasPermission('experiences.update');
    }

    /**
     * Determine whether the user can delete the experience.
     */
    public function delete(User $user, Experience $experience): bool
    {
        if ($user->is_admin || $user->hasRole('super_admin')) {
            return true;
        }

        return $user->hasRole('events_manager') && $user->hasPermission('experiences.delete');
    }
}
