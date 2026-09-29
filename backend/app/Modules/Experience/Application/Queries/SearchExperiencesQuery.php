<?php

declare(strict_types=1);

namespace App\Modules\Experience\Application\Queries;

use App\Models\Experience;
use App\Models\ExperienceCategory;
use App\Models\Location;
use App\Modules\Experience\Application\DTOs\ExperienceSearchFiltersDTO;
use App\Shared\Infrastructure\Caching\CacheKeys;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;

class SearchExperiencesQuery
{
    /**
     * @return array{
     *     experiences: LengthAwarePaginator,
     *     categories: \Illuminate\Database\Eloquent\Collection,
     *     locations: \Illuminate\Database\Eloquent\Collection,
     *     categorySlug: ?string,
     *     locationSlug: ?string
     * }
     */
    public function execute(ExperienceSearchFiltersDTO $filters): array
    {
        $query = Experience::published()->with(['category', 'location', 'images']);

        if (! empty($filters->categorySlug) && $filters->categorySlug !== 'all') {
            $query->whereHas('category', fn($q) => $q->where('slug', $filters->categorySlug));
        }

        if (! empty($filters->locationSlug) && $filters->locationSlug !== 'all') {
            $query->whereHas('location', fn($q) => $q->where('slug', $filters->locationSlug));
        }

        $experiences = $query->orderByDesc('is_featured')
            ->orderBy('id')
            ->paginate($filters->perPage)
            ->withQueryString();

        $categories = Cache::remember(
            CacheKeys::EXPERIENCE_CATEGORIES_ACTIVE,
            CacheKeys::TTL_EXTENDED,
            fn() => ExperienceCategory::active()->get()
        );

        $locations = Cache::remember(
            CacheKeys::LOCATIONS_ACTIVE,
            CacheKeys::TTL_EXTENDED,
            fn() => Location::active()->get()
        );

        return [
            'experiences' => $experiences,
            'categories' => $categories,
            'locations' => $locations,
            'categorySlug' => $filters->categorySlug,
            'locationSlug' => $filters->locationSlug,
        ];
    }
}
