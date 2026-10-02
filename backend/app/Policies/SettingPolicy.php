<?php

namespace App\Policies;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class SettingPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view platform settings.
     */
    public function viewAny(User $user): bool
    {
        return (bool) ($user->is_admin || $user->hasRole('super_admin'));
    }

    /**
     * Determine whether the user can update platform settings.
     */
    public function update(User $user, ?Setting $setting = null): bool
    {
        return (bool) ($user->is_admin || $user->hasRole('super_admin'));
    }
}
