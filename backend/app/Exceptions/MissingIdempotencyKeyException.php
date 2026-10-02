<?php

namespace App\Exceptions;

class MissingIdempotencyKeyException extends DomainException
{
    public function __construct(string $message = 'The Idempotency-Key header is required for this operation.')
    {
        parent::__construct(
            message: $message,
            errorCode: 'MISSING_IDEMPOTENCY_KEY',
            statusCode: 400,
            details: null
        );
    }
}
