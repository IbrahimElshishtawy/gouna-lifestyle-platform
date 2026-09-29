<?php

namespace App\Enums;

enum PaymentStatus: string
{
    case Unpaid = 'unpaid';
    case Pending = 'pending';
    case PartiallyPaid = 'partially_paid';
    case Paid = 'paid';
    case Failed = 'failed';
    case Refunded = 'refunded';
    case PartiallyRefunded = 'partially_refunded';

    public function label(): string
    {
        return match($this) {
            self::Unpaid => 'Unpaid',
            self::Pending => 'Pending',
            self::PartiallyPaid => 'Partially Paid',
            self::Paid => 'Paid',
            self::Failed => 'Failed',
            self::Refunded => 'Refunded',
            self::PartiallyRefunded => 'Partially Refunded',
        };
    }

    public function color(): string
    {
        return match($this) {
            self::Unpaid => 'red',
            self::Pending => 'yellow',
            self::PartiallyPaid => 'indigo',
            self::Paid => 'green',
            self::Failed => 'red',
            self::Refunded => 'purple',
            self::PartiallyRefunded => 'purple',
        };
    }
}
