<?php

declare(strict_types=1);

namespace App\Shared\Domain\ValueObjects;

use InvalidArgumentException;
use JsonSerializable;
use Stringable;

/**
 * Value Object for human-readable booking references (GON-YYYY-XXXXXX).
 */
final class BookingReference implements JsonSerializable, Stringable
{
    public const PATTERN = '/^GON-\d{4}-\d{6}$/';

    public function __construct(
        private readonly string $reference
    ) {
        if (! preg_match(self::PATTERN, $this->reference)) {
            throw new InvalidArgumentException("Invalid booking reference format: {$this->reference}");
        }
    }

    public static function fromString(string $reference): self
    {
        return new self($reference);
    }

    public static function generate(?int $year = null): self
    {
        $yearStr = (string) ($year ?? (int) date('Y'));
        $number = str_pad((string) random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
        return new self("GON-{$yearStr}-{$number}");
    }

    public function toString(): string
    {
        return $this->reference;
    }

    public function equals(self $other): bool
    {
        return $this->reference === $other->reference;
    }

    public function jsonSerialize(): string
    {
        return $this->reference;
    }

    public function __toString(): string
    {
        return $this->reference;
    }
}
