<?php

declare(strict_types=1);

namespace App\Shared\Domain\Exceptions;

use RuntimeException;

/**
 * Base Domain Exception. All business rule violation exceptions extend this class.
 */
abstract class DomainException extends RuntimeException
{
    protected int $statusCode = 422;

    public function getStatusCode(): int
    {
        return $this->statusCode;
    }
}
