<?php

declare(strict_types=1);

namespace App\Shared\Domain\ValueObjects;

use InvalidArgumentException;
use JsonSerializable;
use Stringable;

/**
 * Value Object representing party guest capacity and limits.
 */
final class GuestCount implements JsonSerializable, Stringable
{
    public function __construct(
        private readonly int $count
    ) {
        if ($this->count < 1) {
            throw new InvalidArgumentException("Guest count must be at least 1, {$this->count} given.");
        }
    }

    public static function fromInt(int $count): self
    {
        return new self($count);
    }

    public function toInt(): int
    {
        return $this->count;
    }

    public function fitsInCapacity(int $maxCapacity): bool
    {
        return $this->count <= $maxCapacity;
    }

    public function jsonSerialize(): int
    {
        return $this->count;
    }

    public function __toString(): string
    {
        return (string) $this->count;
    }
}
