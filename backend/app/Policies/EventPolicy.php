<?php

namespace App\Policies;

use App\Models\Event;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class EventPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any events.
     */
    public function viewAny(?User $user): bool
    {
        if (! $user) {
            return true;
        }

        if ($user->is_admin || $user->hasRole('super_admin')) {
            return true;
        }

        return $user->hasPermission('events.view');
    }

    /**
     * Determine whether the user can view the event.
     */
    public function view(?User $user, Event $event): bool
    {
        if ($event->is_published && $event->status === 'published') {
            return true;
        }

        if (! $user) {
            return false;
        }

        if ($user->is_admin || $user->hasRole('super_admin')) {
            return true;
        }

        return $user->hasPermission('events.view');
    }

    /**
     * Determine whether the user can create events.
     */
    public function create(User $user): bool
    {
        if ($user->is_admin || $user->hasRole('super_admin')) {
            return true;
        }

        return $user->hasRole('events_manager') && $user->hasPermission('events.create');
    }

    /**
     * Determine whether the user can update the event.
     */
    public function update(User $user, Event $event): bool
    {
        if ($user->is_admin || $user->hasRole('super_admin')) {
            return true;
        }

        return $user->hasRole('events_manager') && $user->hasPermission('events.update');
    }

    /**
     * Determine whether the user can delete the event.
     */
    public function delete(User $user, Event $event): bool
    {
        if ($user->is_admin || $user->hasRole('super_admin')) {
            return true;
        }

        return $user->hasRole('events_manager') && $user->hasPermission('events.delete');
    }
}
