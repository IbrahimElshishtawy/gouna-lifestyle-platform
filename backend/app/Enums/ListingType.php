<?php

namespace App\Enums;

enum ListingType: string
{
    case Rent = 'rent';
    case Sale = 'sale';
    case Both = 'both';

    public function label(): string
    {
        return match($this) {
            self::Rent => 'For Rent',
            self::Sale => 'For Sale',
            self::Both => 'For Rent & Sale',
        };
    }
}
