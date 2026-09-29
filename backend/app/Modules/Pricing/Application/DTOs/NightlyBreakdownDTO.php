<?php

declare(strict_types=1);

namespace App\Modules\Pricing\Application\DTOs;

use JsonSerializable;

final class NightlyBreakdownDTO implements JsonSerializable
{
    public function __construct(
        public readonly string $nightDate,
        public readonly string $dayOfWeek,
        public readonly int $priceCents,
        public readonly string $priceFormatted,
        public readonly string $currency,
        public readonly ?int $seasonalPriceId,
        public readonly ?string $seasonName,
        public readonly bool $isBasePrice,
        public readonly int $priority,
        public readonly ?int $minStayNights,
    ) {}

    public function toArray(): array
    {
        return [
            'night_date' => $this->nightDate,
            'day_of_week' => $this->dayOfWeek,
            'price_cents' => $this->priceCents,
            'price_formatted' => $this->priceFormatted,
            'currency' => $this->currency,
            'seasonal_price_id' => $this->seasonalPriceId,
            'season_name' => $this->seasonName,
            'is_base_price' => $this->isBasePrice,
            'priority' => $this->priority,
            'min_stay_nights' => $this->minStayNights,
        ];
    }

    public function jsonSerialize(): array
    {
        return $this->toArray();
    }
}
