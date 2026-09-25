<?php

declare(strict_types=1);

namespace App\Shared\Domain\Exceptions;

class PaymentFailedException extends DomainException
{
    public function __construct(string $message = 'Payment processing failed.')
    {
        parent::__construct($message);
    }
}
