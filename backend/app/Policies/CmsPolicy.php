<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class CmsPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any CMS resources.
     */
    public function viewAny(?User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the specific CMS resource.
     */
    public function view(?User $user, mixed $model): bool
    {
        if (isset($model->is_published) && $model->is_published) {
            return true;
        }

        if (! $user) {
            return false;
        }

        if ($user->is_admin || $user->hasRole('super_admin')) {
            return true;
        }

        return $user->hasRole('content_manager') && $user->hasPermission('cms.manage');
    }

    /**
     * Determine whether the user can create CMS content.
     */
    public function create(User $user): bool
    {
        if ($user->is_admin || $user->hasRole('super_admin')) {
            return true;
        }

        return $user->hasRole('content_manager') && $user->hasPermission('cms.manage');
    }

    /**
     * Determine whether the user can update CMS content.
     */
    public function update(User $user, mixed $model): bool
    {
        if ($user->is_admin || $user->hasRole('super_admin')) {
            return true;
        }

        return $user->hasRole('content_manager') && $user->hasPermission('cms.manage');
    }

    /**
     * Determine whether the user can delete CMS content.
     */
    public function delete(User $user, mixed $model): bool
    {
        if ($user->is_admin || $user->hasRole('super_admin')) {
            return true;
        }

        return $user->hasRole('content_manager') && $user->hasPermission('cms.manage');
    }
}
