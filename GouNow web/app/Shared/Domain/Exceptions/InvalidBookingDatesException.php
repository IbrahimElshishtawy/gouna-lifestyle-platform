<?php

declare(strict_types=1);

namespace App\Shared\Domain\Exceptions;

class InvalidBookingDatesException extends DomainException
{
    public function __construct(string $message = 'Check-out date must be strictly after check-in date.')
    {
        parent::__construct($message);
    }
}
