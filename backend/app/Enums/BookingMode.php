<?php

namespace App\Enums;

enum BookingMode: string
{
    case Instant = 'instant';
    case Request = 'request';
    case WhatsApp = 'whatsapp';
    case Manual = 'manual';

    public function label(): string
    {
        return match($this) {
            self::Instant => 'Instant Booking',
            self::Request => 'Request to Book',
            self::WhatsApp => 'WhatsApp Inquiry',
            self::Manual => 'Manual Confirmation',
        };
    }
}
