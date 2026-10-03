<?php

declare(strict_types=1);

namespace App\Modules\Booking\Domain\Exceptions;

use App\Exceptions\DomainException;

class InvalidBookingTransitionException extends DomainException
{
    public function __construct(string $from, string $to)
    {
        parent::__construct(
            message: "Cannot transition booking from '{$from}' to '{$to}'.",
            errorCode: 'INVALID_BOOKING_TRANSITION',
            statusCode: 422
        );
    }
}
