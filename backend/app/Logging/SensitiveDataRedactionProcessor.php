<?php

namespace App\Logging;

use Monolog\LogRecord;
use Monolog\Processor\ProcessorInterface;

class SensitiveDataRedactionProcessor implements ProcessorInterface
{
    private const SENSITIVE_KEYS = [
        'password',
        'password_confirmation',
        'token',
        'access_token',
        'two_factor_token',
        'secret',
        'two_factor_secret',
        'recovery_code',
        'recovery_codes',
        'two_factor_recovery_codes',
        'code',
        'otp',
        'authorization',
        'card',
        'card_number',
        'cvv',
        'cvc',
        'api_key',
        'apikey',
    ];

    public function __invoke(LogRecord $record): LogRecord
    {
        $context = $this->redactArray($record->context);
        $extra = $this->redactArray($record->extra);

        return $record->with(context: $context, extra: $extra);
    }

    /**
     * Recursively redact sensitive keys in data array.
     */
    public function redactArray(mixed $data): mixed
    {
        if (! is_array($data)) {
            return $data;
        }

        $clean = [];
        foreach ($data as $key => $value) {
            $lowerKey = is_string($key) ? strtolower($key) : $key;

            if (is_string($lowerKey) && $this->isSensitiveKey($lowerKey)) {
                $clean[$key] = '[REDACTED]';
            } elseif (is_array($value)) {
                $clean[$key] = $this->redactArray($value);
            } else {
                $clean[$key] = $value;
            }
        }

        return $clean;
    }

    private function isSensitiveKey(string $key): bool
    {
        foreach (self::SENSITIVE_KEYS as $sensitive) {
            if ($key === $sensitive || str_contains($key, $sensitive)) {
                return true;
            }
        }

        return false;
    }
}
