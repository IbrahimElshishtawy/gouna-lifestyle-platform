<?php

declare(strict_types=1);

namespace App\Modules\Property\Application\Queries;

use App\Models\Location;
use App\Models\Property;
use App\Models\PropertyCategory;
use App\Modules\Property\Application\DTOs\PropertySearchFiltersDTO;
use App\Services\AvailabilityService;
use App\Shared\Infrastructure\Caching\CacheKeys;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;

class SearchPropertiesQuery
{
    public function __construct(
        private readonly AvailabilityService $availabilityService
    ) {}

    /**
     * Execute property search and return an array of view-ready results.
     *
     * @return array{
     *     properties: LengthAwarePaginator,
     *     categories: \Illuminate\Database\Eloquent\Collection,
     *     locations: \Illuminate\Database\Eloquent\Collection,
     *     minPossiblePrice: int,
     *     maxPossiblePrice: int,
     *     activeFilters: array<string, mixed>
     * }
     */
    public function execute(PropertySearchFiltersDTO $filters): array
    {
        $query = Property::published()->with(['category', 'location', 'images']);

        // 1. Listing Type
        if ($filters->listingType === 'rent') {
            $query->forRent();
        } elseif ($filters->listingType === 'sale') {
            $query->forSale();
        }

        // 2. Location
        if (! empty($filters->locationSlug) && $filters->locationSlug !== 'all') {
            $query->whereHas('location', fn($q) => $q->where('slug', $filters->locationSlug));
        }

        // 3. Category
        if (! empty($filters->categorySlug) && $filters->categorySlug !== 'all') {
            $query->whereHas('category', fn($q) => $q->where('slug', $filters->categorySlug));
        }

        // 4. Bedrooms
        if ($filters->bedrooms !== null && $filters->bedrooms > 0) {
            $query->where('bedrooms', '>=', $filters->bedrooms);
        }

        // 5. Guests
        if ($filters->guests !== null && $filters->guests > 0) {
            $query->where('max_guests', '>=', $filters->guests);
        }

        // 6. Price range
        $isSale = $filters->listingType === 'sale';
        $priceColumn = $isSale ? 'sale_price_cents' : 'base_price_cents';

        if ($filters->minPrice !== null && $filters->minPrice > 0) {
            $query->where($priceColumn, '>=', $filters->minPrice * 100);
        }

        if ($filters->maxPrice !== null && $filters->maxPrice > 0) {
            $query->where($priceColumn, '<=', $filters->maxPrice * 100);
        }

        // 7. Date Availability Filter
        if (! empty($filters->checkIn) && ! empty($filters->checkOut) && $filters->listingType !== 'sale') {
            try {
                $checkIn = Carbon::parse($filters->checkIn);
                $checkOut = Carbon::parse($filters->checkOut);

                if ($checkOut->gt($checkIn)) {
                    $candidateIds = (clone $query)->pluck('id');
                    $availableIds = $this->availabilityService->filterAvailablePropertyIds(
                        $candidateIds,
                        $checkIn,
                        $checkOut
                    );
                    $query->whereIn('id', $availableIds);
                }
            } catch (\Exception) {
                // Ignore invalid date format and continue
            }
        }

        // 8. Sorting
        match ($filters->sort) {
            'price_asc' => $query->orderBy($priceColumn, 'asc'),
            'price_desc' => $query->orderBy($priceColumn, 'desc'),
            'newest' => $query->orderBy('created_at', 'desc'),
            default => $query->orderByDesc('is_featured')->orderBy('id'),
        };

        $properties = $query->paginate($filters->perPage)->withQueryString();

        // 9. Cached Metadata
        $categories = Cache::remember(
            CacheKeys::PROPERTY_CATEGORIES_ACTIVE,
            CacheKeys::TTL_EXTENDED,
            fn() => PropertyCategory::active()->get()
        );

        $locations = Cache::remember(
            CacheKeys::LOCATIONS_ACTIVE,
            CacheKeys::TTL_EXTENDED,
            fn() => Location::active()->get()
        );

        // Price range boundaries
        $priceStats = Property::published()
            ->selectRaw('MIN(' . $priceColumn . ') as min_cents, MAX(' . $priceColumn . ') as max_cents')
            ->first();

        $minPossiblePrice = $priceStats?->min_cents ? (int) floor($priceStats->min_cents / 100) : 50;
        $maxPossiblePrice = $priceStats?->max_cents ? (int) ceil($priceStats->max_cents / 100) : 5000;

        return [
            'properties' => $properties,
            'locations' => $locations,
            'categories' => $categories,
            'listingType' => $filters->listingType,
            'locationSlug' => $filters->locationSlug,
            'categorySlug' => $filters->categorySlug,
            'bedrooms' => $filters->bedrooms,
            'guests' => $filters->guests,
            'minPrice' => $filters->minPrice,
            'maxPrice' => $filters->maxPrice,
            'checkInStr' => $filters->checkIn,
            'checkOutStr' => $filters->checkOut,
            'sort' => $filters->sort,
            'minPossiblePrice' => $minPossiblePrice,
            'maxPossiblePrice' => $maxPossiblePrice,
        ];
    }
}
