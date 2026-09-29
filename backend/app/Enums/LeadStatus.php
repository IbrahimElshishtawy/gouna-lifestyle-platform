<?php

namespace App\Enums;

enum LeadStatus: string
{
    case New = 'new';
    case Contacted = 'contacted';
    case Qualified = 'qualified';
    case Closed = 'closed';
    case Rejected = 'rejected';

    public function label(): string
    {
        return match($this) {
            self::New => 'New',
            self::Contacted => 'Contacted',
            self::Qualified => 'Qualified',
            self::Closed => 'Closed',
            self::Rejected => 'Rejected',
        };
    }

    public function color(): string
    {
        return match($this) {
            self::New => 'blue',
            self::Contacted => 'yellow',
            self::Qualified => 'green',
            self::Closed => 'teal',
            self::Rejected => 'red',
        };
    }
}
