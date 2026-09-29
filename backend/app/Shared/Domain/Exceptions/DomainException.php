<?php

declare(strict_types=1);

namespace App\Shared\Domain\Exceptions;

use InvalidArgumentException;

/**
 * Base Domain Exception. All business rule violation exceptions extend this class.
 * Extends InvalidArgumentException to maintain 100% backward compatibility with legacy consumers.
 */
abstract class DomainException extends InvalidArgumentException
{
    protected int $statusCode = 422;

    public function getStatusCode(): int
    {
        return $this->statusCode;
    }
}
