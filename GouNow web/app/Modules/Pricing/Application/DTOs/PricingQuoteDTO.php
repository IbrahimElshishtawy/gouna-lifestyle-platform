<?php

declare(strict_types=1);

namespace App\Modules\Pricing\Application\DTOs;

use JsonSerializable;

final class PricingQuoteDTO implements JsonSerializable
{
    /**
     * @param array<int, array<string, mixed>> $nightlyPrices
     */
    public function __construct(
        public readonly int $nights,
        public readonly array $nightlyPrices,
        public readonly int $subtotalCents,
        public readonly string $subtotalFormatted,
        public readonly int $cleaningFeeCents,
        public readonly int $serviceFeeCents,
        public readonly int $discountCents,
        public readonly ?int $discountId,
        public readonly ?string $promoCode,
        public readonly float $taxPercentage,
        public readonly int $taxCents,
        public readonly int $totalCents,
        public readonly string $totalFormatted,
        public readonly int $depositCents,
        public readonly int $amountRemainingCents,
        public readonly string $currency,
        public readonly int $minStayRequired,
        public readonly int $propertyMinStay,
        public readonly ?int $seasonalMinStayOverride,
        public readonly bool $satisfiesMinStay,
    ) {}

    public function toArray(): array
    {
        return [
            'nights' => $this->nights,
            'nightly_prices' => $this->nightlyPrices,
            'subtotal_cents' => $this->subtotalCents,
            'subtotal_formatted' => $this->subtotalFormatted,
            'cleaning_fee_cents' => $this->cleaningFeeCents,
            'service_fee_cents' => $this->serviceFeeCents,
            'discount_cents' => $this->discountCents,
            'discount_id' => $this->discountId,
            'promo_code' => $this->promoCode,
            'tax_percentage' => $this->taxPercentage,
            'tax_cents' => $this->taxCents,
            'total_cents' => $this->totalCents,
            'total_formatted' => $this->totalFormatted,
            'deposit_cents' => $this->depositCents,
            'amount_remaining_cents' => $this->amountRemainingCents,
            'currency' => $this->currency,
            'min_stay_required' => $this->minStayRequired,
            'property_min_stay' => $this->propertyMinStay,
            'seasonal_min_stay_override' => $this->seasonalMinStayOverride,
            'satisfies_min_stay' => $this->satisfiesMinStay,
        ];
    }

    public function jsonSerialize(): array
    {
        return $this->toArray();
    }
}
