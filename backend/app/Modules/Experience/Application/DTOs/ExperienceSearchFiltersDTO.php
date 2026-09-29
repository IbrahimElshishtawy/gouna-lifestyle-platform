<?php

declare(strict_types=1);

namespace App\Modules\Experience\Application\DTOs;

final class ExperienceSearchFiltersDTO
{
    public function __construct(
        public readonly ?string $categorySlug = null,
        public readonly ?string $locationSlug = null,
        public readonly int $perPage = 12,
    ) {}
}
