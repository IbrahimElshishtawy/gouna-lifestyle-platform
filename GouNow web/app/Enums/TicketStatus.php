<?php

namespace App\Enums;

enum TicketStatus: string
{
    case Valid = 'valid';
    case Used = 'used';
    case Cancelled = 'cancelled';
    case Refunded = 'refunded';
    case Expired = 'expired';

    public function label(): string
    {
        return match($this) {
            self::Valid => 'Valid',
            self::Used => 'Used',
            self::Cancelled => 'Cancelled',
            self::Refunded => 'Refunded',
            self::Expired => 'Expired',
        };
    }

    public function color(): string
    {
        return match($this) {
            self::Valid => 'green',
            self::Used => 'gray',
            self::Cancelled => 'red',
            self::Refunded => 'purple',
            self::Expired => 'orange',
        };
    }
}
