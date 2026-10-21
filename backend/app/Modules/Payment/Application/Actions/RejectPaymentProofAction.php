<?php

declare(strict_types=1);

namespace App\Modules\Payment\Application\Actions;

use App\Models\ActivityLog;
use App\Models\PaymentProof;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class RejectPaymentProofAction
{
    /**
     * Reject a submitted payment proof with an explicit reason.
     *
     * @return PaymentProof
     */
    public function execute(
        PaymentProof $paymentProof,
        User $adminUser,
        string $rejectionReason
    ): PaymentProof {
        if (trim($rejectionReason) === '') {
            throw new InvalidArgumentException('A rejection reason must be provided.');
        }

        return DB::transaction(function () use ($paymentProof, $adminUser, $rejectionReason) {
            /** @var PaymentProof $lockedProof */
            $lockedProof = PaymentProof::where('id', $paymentProof->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($lockedProof->status !== 'pending_verification') {
                throw new InvalidArgumentException(
                    "Cannot reject payment proof #{$lockedProof->id} with current status '{$lockedProof->status}'."
                );
            }

            $oldStatus = $lockedProof->status;

            $lockedProof->update([
                'status' => 'rejected',
                'rejection_reason' => trim($rejectionReason),
                'reviewed_by' => $adminUser->id,
                'reviewed_at' => now(),
            ]);

            // Keep associated booking in awaiting_payment / unpaid so customer can re-submit
            $booking = $lockedProof->booking;
            if ($booking && $booking->amount_paid_cents == 0) {
                $booking->update([
                    'payment_status' => 'unpaid',
                ]);
            }

            // Record Audit Trail
            ActivityLog::create([
                'user_id' => $adminUser->id,
                'action' => 'payment_proof_rejected',
                'entity_type' => PaymentProof::class,
                'entity_id' => $lockedProof->id,
                'description' => "Admin #{$adminUser->id} rejected payment proof for booking {$booking?->reference}. Reason: {$rejectionReason}",
                'old_values' => ['status' => $oldStatus],
                'new_values' => [
                    'status' => 'rejected',
                    'rejection_reason' => trim($rejectionReason),
                    'reviewed_by' => $adminUser->id,
                ],
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            return $lockedProof;
        });
    }
}
