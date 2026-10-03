<?php

declare(strict_types=1);

namespace App\Modules\Booking\Domain\Services;

use App\Models\ActivityLog;
use App\Models\Booking;
use App\Models\User;
use App\Modules\Booking\Domain\Enums\BookingStatus;
use App\Modules\Booking\Domain\Events\BookingStatusChangedEvent;
use App\Modules\Booking\Domain\Exceptions\InvalidBookingTransitionException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\UnauthorizedException;

class BookingStateMachine
{
    /**
     * Atomically transition a booking to a new lifecycle state.
     *
     * @param  array<string, mixed>  $context
     *
     * @throws InvalidBookingTransitionException
     */
    public function transition(
        Booking $booking,
        BookingStatus|string $targetStatus,
        ?User $actor = null,
        array $context = []
    ): Booking {
        $target = is_string($targetStatus)
            ? BookingStatus::from($targetStatus)
            : $targetStatus;

        return DB::transaction(function () use ($booking, $target, $actor, $context) {
            // Lock booking row against concurrent state transitions
            /** @var Booking $lockedBooking */
            $lockedBooking = Booking::where('id', $booking->id)
                ->lockForUpdate()
                ->firstOrFail();

            $current = BookingStatus::from($lockedBooking->status);

            // Idempotency: if already in the target status, return cleanly without side effects
            if ($current === $target) {
                return $lockedBooking;
            }

            // Verify transition validity against state transition matrix
            if (! $current->canTransitionTo($target)) {
                throw new InvalidBookingTransitionException($current->value, $target->value);
            }

            // Authorization verification if actor is present
            if ($actor) {
                $this->assertActorCanTransition($lockedBooking, $actor, $current, $target);
            }

            // Apply state-specific side effects and timestamps
            $this->applySideEffects($lockedBooking, $target, $context);

            $lockedBooking->status = $target->value;
            $lockedBooking->save();

            // Create immutable audit log entry
            ActivityLog::create([
                'user_id' => $actor?->id,
                'action' => 'booking_status_transition',
                'entity_type' => Booking::class,
                'entity_id' => $lockedBooking->id,
                'description' => "Booking {$lockedBooking->reference} transitioned from {$current->value} to {$target->value}.",
                'payload' => array_merge($context, [
                    'from' => $current->value,
                    'to' => $target->value,
                ]),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            // Dispatch domain event (fires after transaction commits)
            BookingStatusChangedEvent::dispatch(
                $lockedBooking,
                $current,
                $target,
                $actor,
                $context
            );

            return $lockedBooking;
        }, 3);
    }

    /**
     * Verify whether the acting user has permission to trigger this specific transition.
     */
    private function assertActorCanTransition(
        Booking $booking,
        User $actor,
        BookingStatus $from,
        BookingStatus $to
    ): void {
        // Super admin, finance, and property managers possess system-wide transition privileges
        if ($actor->is_admin || $actor->hasRole('super_admin') || $actor->hasRole('property_manager') || $actor->hasRole('finance')) {
            return;
        }

        // Assigned staff can manage active bookings assigned to them
        if ($actor->hasRole('staff') && $booking->assigned_to === $actor->id) {
            return;
        }

        // Customer can only cancel their own uncompleted bookings
        if ($to === BookingStatus::CANCELLED) {
            if ($booking->customer && $booking->customer->user_id === $actor->id) {
                return;
            }
        }

        throw new UnauthorizedException("User is not authorized to transition booking {$booking->reference} to {$to->value}.");
    }

    /**
     * Apply model field side effects based on target status.
     *
     * @param  array<string, mixed>  $context
     */
    private function applySideEffects(Booking $booking, BookingStatus $target, array $context): void
    {
        switch ($target) {
            case BookingStatus::CANCELLED:
                $booking->cancelled_at = now();
                $booking->cancellation_reason = $context['reason'] ?? $context['cancellation_reason'] ?? 'User requested cancellation';
                if (isset($context['refund_amount_cents'])) {
                    $booking->refund_amount_cents = (int) $context['refund_amount_cents'];
                }
                break;

            case BookingStatus::CONFIRMED:
                $booking->expires_at = null; // Clear pending hold expiry
                break;

            case BookingStatus::EXPIRED:
                $booking->cancelled_at = now();
                $booking->cancellation_reason = 'Payment hold expired';
                break;

            case BookingStatus::REFUNDED:
                if (isset($context['refund_amount_cents'])) {
                    $booking->refund_amount_cents = (int) $context['refund_amount_cents'];
                }
                break;

            default:
                break;
        }
    }
}
