<?php

declare(strict_types=1);

namespace App\Shared\Domain\Exceptions;

class MaximumGuestsExceededException extends DomainException
{
    public function __construct(string $message = 'The number of guests exceeds the maximum capacity for this property.')
    {
        parent::__construct($message);
    }
}
