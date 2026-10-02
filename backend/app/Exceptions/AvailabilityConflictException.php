<?php

namespace App\Exceptions;

class AvailabilityConflictException extends DomainException
{
    public function __construct(string $message = 'The selected property is not available for the specified date range.', ?array $dates = null)
    {
        parent::__construct(
            message: $message,
            errorCode: 'AVAILABILITY_COLLISION',
            statusCode: 409,
            details: $dates ? ['conflicting_dates' => $dates] : null
        );
    }
}
