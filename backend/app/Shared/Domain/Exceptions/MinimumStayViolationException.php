<?php

declare(strict_types=1);

namespace App\Shared\Domain\Exceptions;

class MinimumStayViolationException extends DomainException
{
    public function __construct(int $minNights)
    {
        parent::__construct("Minimum stay for the selected dates is {$minNights} nights.");
    }
}
