<?php

declare(strict_types=1);

namespace App\Modules\Booking\Domain\Enums;

enum BookingStatus: string
{
    case DRAFT = 'draft';
    case PENDING = 'pending';
    case AWAITING_PAYMENT = 'awaiting_payment';
    case PAYMENT_PROCESSING = 'payment_processing';
    case CONFIRMED = 'confirmed';
    case COMPLETED = 'completed';
    case CANCELLED = 'cancelled';
    case REFUNDED = 'refunded';
    case EXPIRED = 'expired';

    /**
     * Determine if a transition from the current status to the target status is valid.
     */
    public function canTransitionTo(self $target): bool
    {
        if ($this === $target) {
            return true; // Idempotent self-transition allowed
        }

        return match ($this) {
            self::DRAFT => in_array($target, [
                self::PENDING,
                self::AWAITING_PAYMENT,
                self::CANCELLED,
            ], true),

            self::PENDING => in_array($target, [
                self::AWAITING_PAYMENT,
                self::CONFIRMED,
                self::CANCELLED,
                self::EXPIRED,
            ], true),

            self::AWAITING_PAYMENT => in_array($target, [
                self::PAYMENT_PROCESSING,
                self::CONFIRMED,
                self::CANCELLED,
                self::EXPIRED,
            ], true),

            self::PAYMENT_PROCESSING => in_array($target, [
                self::CONFIRMED,
                self::AWAITING_PAYMENT,
                self::CANCELLED,
                self::EXPIRED,
            ], true),

            self::CONFIRMED => in_array($target, [
                self::COMPLETED,
                self::CANCELLED,
            ], true),

            self::COMPLETED => in_array($target, [
                self::REFUNDED,
            ], true),

            self::CANCELLED => in_array($target, [
                self::REFUNDED,
            ], true),

            self::REFUNDED, self::EXPIRED => false,
        };
    }

    /**
     * Determine if bookings in this status occupy inventory and block availability.
     */
    public function isBlockingAvailability(): bool
    {
        return in_array($this, [
            self::PENDING,
            self::AWAITING_PAYMENT,
            self::PAYMENT_PROCESSING,
            self::CONFIRMED,
            self::COMPLETED,
        ], true);
    }
}
