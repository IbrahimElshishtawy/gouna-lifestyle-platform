<?php

namespace App\Policies;

use App\Models\Media;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class MediaPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any media.
     */
    public function viewAny(?User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can upload/create media.
     */
    public function create(User $user): bool
    {
        if ($user->is_admin || $user->hasRole('super_admin')) {
            return true;
        }

        return $user->hasPermission('media.manage')
            || $user->hasPermission('properties.update')
            || $user->hasPermission('events.update')
            || $user->hasPermission('cms.manage');
    }

    /**
     * Determine whether the user can update media details.
     */
    public function update(User $user, Media $media): bool
    {
        if ($user->is_admin || $user->hasRole('super_admin')) {
            return true;
        }

        return $user->hasPermission('media.manage');
    }

    /**
     * Determine whether the user can delete media.
     */
    public function delete(User $user, Media $media): bool
    {
        if ($user->is_admin || $user->hasRole('super_admin')) {
            return true;
        }

        return $user->hasPermission('media.manage');
    }
}
