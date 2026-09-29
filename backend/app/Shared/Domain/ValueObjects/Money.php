<?php

declare(strict_types=1);

namespace App\Shared\Domain\ValueObjects;

use InvalidArgumentException;
use JsonSerializable;
use Stringable;

/**
 * Value Object representing a monetary amount in the smallest currency unit (cents).
 * Immutable and self-validating.
 */
final class Money implements JsonSerializable, Stringable
{
    public function __construct(
        private readonly int $amountCents,
        private readonly string $currency = 'EGP'
    ) {
        if ($this->amountCents < 0) {
            throw new InvalidArgumentException("Money amount cannot be negative: {$this->amountCents}");
        }
    }

    public static function fromCents(int $cents, string $currency = 'EGP'): self
    {
        return new self($cents, strtoupper($currency));
    }

    public static function fromDecimal(float|int|string $amount, string $currency = 'EGP'): self
    {
        return new self((int) round(((float) $amount) * 100), strtoupper($currency));
    }

    public static function zero(string $currency = 'EGP'): self
    {
        return new self(0, strtoupper($currency));
    }

    public function getAmountCents(): int
    {
        return $this->amountCents;
    }

    public function getDecimalAmount(): float
    {
        return $this->amountCents / 100;
    }

    public function getCurrency(): string
    {
        return $this->currency;
    }

    public function add(self $other): self
    {
        $this->assertSameCurrency($other);
        return new self($this->amountCents + $other->amountCents, $this->currency);
    }

    public function subtract(self $other): self
    {
        $this->assertSameCurrency($other);
        $result = $this->amountCents - $other->amountCents;
        return new self(max(0, $result), $this->currency);
    }

    public function multiply(float|int $multiplier): self
    {
        return new self((int) round($this->amountCents * $multiplier), $this->currency);
    }

    public function percentage(float|int $percentage): self
    {
        return new self((int) round($this->amountCents * ($percentage / 100)), $this->currency);
    }

    public function isZero(): bool
    {
        return $this->amountCents === 0;
    }

    public function isGreaterThan(self $other): bool
    {
        $this->assertSameCurrency($other);
        return $this->amountCents > $other->amountCents;
    }

    public function isGreaterThanOrEqual(self $other): bool
    {
        $this->assertSameCurrency($other);
        return $this->amountCents >= $other->amountCents;
    }

    public function isLessThan(self $other): bool
    {
        $this->assertSameCurrency($other);
        return $this->amountCents < $other->amountCents;
    }

    public function formatted(int $decimals = 2): string
    {
        return number_format($this->getDecimalAmount(), $decimals);
    }

    public function formattedWithCurrency(int $decimals = 2): string
    {
        return "{$this->formatted($decimals)} {$this->currency}";
    }

    private function assertSameCurrency(self $other): void
    {
        if ($this->currency !== $other->currency) {
            throw new InvalidArgumentException(
                "Cannot perform arithmetic on different currencies: {$this->currency} and {$other->currency}"
            );
        }
    }

    public function jsonSerialize(): array
    {
        return [
            'cents' => $this->amountCents,
            'decimal' => $this->getDecimalAmount(),
            'currency' => $this->currency,
            'formatted' => $this->formatted(),
            'formatted_with_currency' => $this->formattedWithCurrency(),
        ];
    }

    public function __toString(): string
    {
        return $this->formattedWithCurrency();
    }
}
