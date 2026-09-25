<?php

declare(strict_types=1);

namespace App\Shared\Domain\Exceptions;

class PaymentMethodNotAllowedException extends DomainException
{
    public function __construct(string $methodName)
    {
        parent::__construct("Payment method '{$methodName}' is not accepted for this property.");
    }
}
