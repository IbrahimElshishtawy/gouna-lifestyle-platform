<?php

namespace App\Policies;

use App\Models\Booking;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class BookingPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any bookings.
     */
    public function viewAny(User $user): bool
    {
        if ($user->is_admin || $user->hasRole('super_admin')) {
            return true;
        }

        // Sales and Content Manager are strictly forbidden from viewing bookings
        if ($user->hasRole('sales') || $user->hasRole('content_manager')) {
            return false;
        }

        return $user->hasPermission('bookings.view');
    }

    /**
     * Determine whether the user can view the booking.
     */
    public function view(User $user, Booking $booking): bool
    {
        if ($user->is_admin || $user->hasRole('super_admin')) {
            return true;
        }

        // Customer viewing their own booking
        if ($booking->customer && $booking->customer->user_id === $user->id) {
            return true;
        }

        // Sales is strictly forbidden from viewing booking records
        if ($user->hasRole('sales')) {
            return false;
        }

        // Finance or Property Manager with permission
        if (($user->hasRole('finance') || $user->hasRole('property_manager')) && $user->hasPermission('bookings.view')) {
            return true;
        }

        // Staff can only view if explicitly assigned to this booking
        if ($user->hasRole('staff') && $booking->assigned_to === $user->id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can create bookings.
     */
    public function create(User $user): bool
    {
        if ($user->is_admin || $user->hasRole('super_admin')) {
            return true;
        }

        // Authenticated customer or authorized staff
        return $user->hasPermission('bookings.manage') || ! $user->hasRole('staff');
    }

    /**
     * Determine whether the user can update the booking.
     */
    public function update(User $user, Booking $booking): bool
    {
        if ($user->is_admin || $user->hasRole('super_admin')) {
            return true;
        }

        // Sales and Staff cannot update bookings
        if ($user->hasRole('sales') || $user->hasRole('staff')) {
            return false;
        }

        // Cannot update cancelled bookings
        if ($booking->status === 'cancelled') {
            return false;
        }

        return $user->hasPermission('bookings.manage') && $user->hasRole('property_manager');
    }

    /**
     * Determine whether the user can cancel the booking.
     */
    public function cancel(User $user, Booking $booking): bool
    {
        if ($user->is_admin || $user->hasRole('super_admin')) {
            return true;
        }

        if ($booking->status === 'cancelled') {
            return false;
        }

        // Customer cancelling their own active booking
        if ($booking->customer && $booking->customer->user_id === $user->id) {
            return true;
        }

        return $user->hasPermission('bookings.manage') && $user->hasRole('property_manager');
    }

    /**
     * Determine whether the user can delete the booking.
     */
    public function delete(User $user, Booking $booking): bool
    {
        // Only super administrator can hard/soft delete booking records
        return $user->is_admin || $user->hasRole('super_admin');
    }

    /**
     * Determine whether the user can refund the booking.
     */
    public function refund(User $user, Booking $booking): bool
    {
        $remainingRefundable = (int) $booking->amount_paid_cents - (int) ($booking->refund_amount_cents ?? 0);
        if ($remainingRefundable <= 0) {
            return false;
        }

        if ($user->is_admin || $user->hasRole('super_admin')) {
            return true;
        }

        // Property Manager, Content Manager, Sales, Staff are STRICTLY FORBIDDEN from issuing refunds
        if ($user->hasRole('property_manager') || $user->hasRole('content_manager') || $user->hasRole('sales') || $user->hasRole('staff')) {
            return false;
        }

        // Only Finance role with refund capability
        return $user->hasRole('finance')
            && $user->hasPermission('payments.refund');
    }
}
