<?php

declare(strict_types=1);

namespace App\Shared\Domain\Exceptions;

class BookingUnavailableException extends DomainException
{
    protected int $statusCode = 409; // Conflict

    public function __construct(string $message = 'The property is not available for the selected dates.')
    {
        parent::__construct($message);
    }
}
