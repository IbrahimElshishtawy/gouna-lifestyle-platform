<?php

declare(strict_types=1);

namespace App\Modules\Property\Application\DTOs;

final class PropertySearchFiltersDTO
{
    public function __construct(
        public readonly string $listingType = 'rent',
        public readonly ?string $locationSlug = null,
        public readonly ?string $categorySlug = null,
        public readonly ?int $bedrooms = null,
        public readonly ?int $guests = null,
        public readonly ?int $minPrice = null,
        public readonly ?int $maxPrice = null,
        public readonly string $sort = 'featured',
        public readonly ?string $checkIn = null,
        public readonly ?string $checkOut = null,
        public readonly int $perPage = 12,
    ) {}
}
