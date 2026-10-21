<?php

declare(strict_types=1);

namespace App\Modules\Payment\Application\Actions;

use App\Models\ActivityLog;
use App\Models\Booking;
use App\Models\PaymentProof;
use App\Models\PaymentTransaction;
use App\Models\User;
use App\Modules\Booking\Domain\Enums\BookingStatus;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use InvalidArgumentException;

class VerifyPaymentProofAction
{
    /**
     * Verify and approve a submitted payment proof by an authorized admin.
     * Uses pessimistic locking to prevent concurrent double-verifications.
     *
     * @return array{proof: PaymentProof, transaction: PaymentTransaction, booking: Booking}
     */
    public function execute(
        PaymentProof $paymentProof,
        User $adminUser,
        ?string $adminNotes = null
    ): array {
        return DB::transaction(function () use ($paymentProof, $adminUser, $adminNotes) {
            /** @var PaymentProof $lockedProof */
            $lockedProof = PaymentProof::where('id', $paymentProof->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($lockedProof->status !== 'pending_verification') {
                throw new InvalidArgumentException(
                    "Cannot verify payment proof #{$lockedProof->id} with current status '{$lockedProof->status}'."
                );
            }

            /** @var Booking $lockedBooking */
            $lockedBooking = Booking::where('id', $lockedProof->booking_id)
                ->lockForUpdate()
                ->firstOrFail();

            // 1. Create authoritative completed payment transaction ledger record
            $transaction = PaymentTransaction::create([
                'transaction_id' => 'MANUAL-' . strtoupper(Str::random(12)),
                'booking_id' => $lockedBooking->id,
                'customer_id' => $lockedBooking->customer_id,
                'payment_method_id' => $lockedProof->payment_method_id ?? $lockedBooking->payment_method_id,
                'amount_cents' => $lockedProof->amount_cents,
                'currency' => $lockedProof->currency,
                'type' => $lockedBooking->payment_type === 'deposit' ? 'deposit' : 'payment',
                'status' => 'completed',
                'gateway_provider' => 'manual_' . $lockedProof->payment_method_code,
                'manual_reference' => $lockedProof->reference_number,
                'manual_payment_date' => $lockedProof->transfer_date ?? now()->toDateString(),
                'manual_notes' => $adminNotes ?: "Verified by admin #{$adminUser->id} ({$adminUser->name})",
                'recorded_by' => $adminUser->id,
                'completed_at' => now(),
            ]);

            // 2. Mark PaymentProof as verified
            $oldProofStatus = $lockedProof->status;
            $lockedProof->update([
                'status' => 'verified',
                'reviewed_by' => $adminUser->id,
                'reviewed_at' => now(),
                'payment_transaction_id' => $transaction->id,
            ]);

            // 3. Atomically update Booking financials & confirm reservation
            $newAmountPaid = (int) $lockedBooking->amount_paid_cents + (int) $lockedProof->amount_cents;
            $newRemaining = max(0, (int) $lockedBooking->total_cents - $newAmountPaid);
            $newPaymentStatus = ($newRemaining <= 0) ? 'paid' : 'partially_paid';

            $oldBookingStatus = $lockedBooking->status;
            $currentStatusEnum = BookingStatus::tryFrom($lockedBooking->status);
            $canConfirm = $currentStatusEnum ? $currentStatusEnum->canTransitionTo(BookingStatus::CONFIRMED) : true;

            $lockedBooking->update([
                'amount_paid_cents' => $newAmountPaid,
                'amount_remaining_cents' => $newRemaining,
                'payment_status' => $newPaymentStatus,
                'status' => $canConfirm ? BookingStatus::CONFIRMED->value : $lockedBooking->status,
                'expires_at' => null, // Clear pending hold
            ]);

            // 4. Record Immutable Audit Trail
            ActivityLog::create([
                'user_id' => $adminUser->id,
                'action' => 'payment_proof_verified',
                'entity_type' => PaymentProof::class,
                'entity_id' => $lockedProof->id,
                'description' => "Admin #{$adminUser->id} verified payment proof of {$lockedProof->amount_cents} cents for booking {$lockedBooking->reference}.",
                'old_values' => [
                    'proof_status' => $oldProofStatus,
                    'booking_status' => $oldBookingStatus,
                    'amount_paid_cents' => $lockedBooking->getOriginal('amount_paid_cents'),
                ],
                'new_values' => [
                    'proof_status' => 'verified',
                    'booking_status' => $lockedBooking->status,
                    'payment_status' => $newPaymentStatus,
                    'transaction_id' => $transaction->transaction_id,
                ],
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            return [
                'proof' => $lockedProof,
                'transaction' => $transaction,
                'booking' => $lockedBooking,
            ];
        });
    }
}
