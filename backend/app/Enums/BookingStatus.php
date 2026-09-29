<?php

namespace App\Enums;

enum BookingStatus: string
{
    case Draft = 'draft';
    case Pending = 'pending';
    case AwaitingPayment = 'awaiting_payment';
    case PaymentProcessing = 'payment_processing';
    case PartiallyPaid = 'partially_paid';
    case Paid = 'paid';
    case Confirmed = 'confirmed';
    case Cancelled = 'cancelled';
    case Rejected = 'rejected';
    case Expired = 'expired';
    case Completed = 'completed';
    case RefundRequested = 'refund_requested';
    case Refunded = 'refunded';

    public function label(): string
    {
        return match($this) {
            self::Draft => 'Draft',
            self::Pending => 'Pending',
            self::AwaitingPayment => 'Awaiting Payment',
            self::PaymentProcessing => 'Payment Processing',
            self::PartiallyPaid => 'Partially Paid',
            self::Paid => 'Paid',
            self::Confirmed => 'Confirmed',
            self::Cancelled => 'Cancelled',
            self::Rejected => 'Rejected',
            self::Expired => 'Expired',
            self::Completed => 'Completed',
            self::RefundRequested => 'Refund Requested',
            self::Refunded => 'Refunded',
        };
    }

    public function color(): string
    {
        return match($this) {
            self::Draft => 'gray',
            self::Pending => 'yellow',
            self::AwaitingPayment => 'orange',
            self::PaymentProcessing => 'blue',
            self::PartiallyPaid => 'indigo',
            self::Paid => 'green',
            self::Confirmed => 'green',
            self::Cancelled => 'red',
            self::Rejected => 'red',
            self::Expired => 'gray',
            self::Completed => 'teal',
            self::RefundRequested => 'purple',
            self::Refunded => 'purple',
        };
    }

    public function isActive(): bool
    {
        return in_array($this, [self::Confirmed, self::Paid, self::PartiallyPaid]);
    }
}
