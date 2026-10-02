<?php

namespace App\Policies;

use App\Models\PaymentTransaction;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class PaymentPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any payment transactions.
     */
    public function viewAny(User $user): bool
    {
        if ($user->is_admin || $user->hasRole('super_admin')) {
            return true;
        }

        // Sales, Property Manager, Content Manager, and Staff are strictly forbidden
        if ($user->hasRole('sales') || $user->hasRole('property_manager') || $user->hasRole('content_manager') || $user->hasRole('staff')) {
            return false;
        }

        return $user->hasRole('finance') && $user->hasPermission('payments.view');
    }

    /**
     * Determine whether the user can view the payment transaction.
     */
    public function view(User $user, PaymentTransaction $transaction): bool
    {
        if ($user->is_admin || $user->hasRole('super_admin')) {
            return true;
        }

        // Customer viewing their own payment receipt
        if ($transaction->customer && $transaction->customer->user_id === $user->id) {
            return true;
        }

        // Sales, Property Manager, Content Manager, and Staff are strictly forbidden
        if ($user->hasRole('sales') || $user->hasRole('property_manager') || $user->hasRole('content_manager') || $user->hasRole('staff')) {
            return false;
        }

        return $user->hasRole('finance') && $user->hasPermission('payments.view');
    }

    /**
     * Determine whether the user can create a payment transaction.
     */
    public function create(User $user): bool
    {
        if ($user->is_admin || $user->hasRole('super_admin')) {
            return true;
        }

        return $user->hasRole('finance') && $user->hasPermission('payments.view');
    }

    /**
     * Determine whether the user can refund the transaction.
     */
    public function refund(User $user, PaymentTransaction $transaction): bool
    {
        if ($user->is_admin || $user->hasRole('super_admin')) {
            return $this->isRefundable($transaction);
        }

        // Content Manager, Sales, Property Manager, Staff are STRICTLY FORBIDDEN from issuing refunds
        if ($user->hasRole('content_manager') || $user->hasRole('sales') || $user->hasRole('property_manager') || $user->hasRole('staff')) {
            return false;
        }

        return $user->hasRole('finance')
            && $user->hasPermission('payments.refund')
            && $this->isRefundable($transaction);
    }

    /**
     * Verify transaction state invariants for refundability.
     */
    private function isRefundable(PaymentTransaction $transaction): bool
    {
        $netPaid = $transaction->amount_cents - ($transaction->refund_amount_cents ?? 0);
        return $transaction->status === 'completed' && $netPaid > 0;
    }
}
