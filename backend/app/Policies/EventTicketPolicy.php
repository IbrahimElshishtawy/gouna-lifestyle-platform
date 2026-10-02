<?php

namespace App\Policies;

use App\Models\EventTicket;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class EventTicketPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any tickets.
     */
    public function viewAny(User $user): bool
    {
        if ($user->is_admin || $user->hasRole('super_admin')) {
            return true;
        }

        return $user->hasPermission('tickets.scan') || $user->hasRole('events_manager');
    }

    /**
     * Determine whether the user can view the specific ticket.
     */
    public function view(User $user, EventTicket $ticket): bool
    {
        if ($user->is_admin || $user->hasRole('super_admin')) {
            return true;
        }

        // Customer who purchased the ticket
        if ($ticket->order && $ticket->order->customer && $ticket->order->customer->user_id === $user->id) {
            return true;
        }

        // Staff / Events Manager scanning tickets
        return $user->hasPermission('tickets.scan') || $user->hasRole('events_manager');
    }

    /**
     * Determine whether the user can scan/check-in tickets at the venue.
     */
    public function scan(User $user): bool
    {
        if ($user->is_admin || $user->hasRole('super_admin')) {
            return true;
        }

        // Staff and Events Manager are explicitly permitted to scan tickets
        return $user->hasPermission('tickets.scan')
            || $user->hasRole('staff')
            || $user->hasRole('events_manager');
    }
}
