<?php

namespace App\Exceptions;

class IdempotencyConflictException extends DomainException
{
    public function __construct(string $message = 'Idempotency key was previously used with a different request payload.')
    {
        parent::__construct(
            message: $message,
            errorCode: 'IDEMPOTENCY_CONFLICT',
            statusCode: 409,
            details: null
        );
    }
}
