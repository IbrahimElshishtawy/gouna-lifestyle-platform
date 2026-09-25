<?php

declare(strict_types=1);

namespace App\Modules\Pricing\Domain\ValueObjects;

use App\Shared\Domain\ValueObjects\Money;
use JsonSerializable;
use Stringable;

final class NightlyRate implements JsonSerializable, Stringable
{
    public function __construct(
        private readonly string $date,
        private readonly Money $price,
        private readonly ?int $seasonalPriceId = null,
        private readonly ?string $seasonName = null,
        private readonly bool $isBasePrice = true,
        private readonly int $priority = 0,
        private readonly ?int $minStayNights = null,
    ) {}

    public function getDate(): string
    {
        return $this->date;
    }

    public function getPrice(): Money
    {
        return $this->price;
    }

    public function getSeasonalPriceId(): ?int
    {
        return $this->seasonalPriceId;
    }

    public function getSeasonName(): ?string
    {
        return $this->seasonName;
    }

    public function isBasePrice(): bool
    {
        return $this->isBasePrice;
    }

    public function getPriority(): int
    {
        return $this->priority;
    }

    public function getMinStayNights(): ?int
    {
        return $this->minStayNights;
    }

    public function jsonSerialize(): array
    {
        return [
            'night_date' => $this->date,
            'price_cents' => $this->price->getAmountCents(),
            'price_formatted' => $this->price->formatted(),
            'currency' => $this->price->getCurrency(),
            'seasonal_price_id' => $this->seasonalPriceId,
            'season_name' => $this->seasonName,
            'is_base_price' => $this->isBasePrice,
            'priority' => $this->priority,
            'min_stay_nights' => $this->minStayNights,
        ];
    }

    public function __toString(): string
    {
        return "{$this->date}: {$this->price->formattedWithCurrency()} (" . ($this->isBasePrice ? 'Base' : $this->seasonName) . ')';
    }
}
