<?php

namespace App\Exceptions;

use Exception;

class DomainException extends Exception
{
    protected string $errorCode;

    protected int $statusCode;

    protected ?array $details;

    public function __construct(
        string $message,
        string $errorCode = 'DOMAIN_ERROR',
        int $statusCode = 422,
        ?array $details = null,
        ?\Throwable $previous = null
    ) {
        parent::__construct($message, 0, $previous);
        $this->errorCode = $errorCode;
        $this->statusCode = $statusCode;
        $this->details = $details;
    }

    public function getErrorCode(): string
    {
        return $this->errorCode;
    }

    public function getStatusCode(): int
    {
        return $this->statusCode;
    }

    public function getDetails(): ?array
    {
        return $this->details;
    }
}
