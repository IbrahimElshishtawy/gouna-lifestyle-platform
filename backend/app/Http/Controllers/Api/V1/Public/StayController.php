<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\PropertyCollection;
use App\Http\Resources\Api\V1\PropertyResource;
use App\Models\Property;
use App\Support\Traits\AppliesListingStandard;
use Illuminate\Http\Request;

class StayController extends Controller
{
    use AppliesListingStandard;

    /**
     * Display a paginated listing of available properties adhering to Standard S2 and S3.
     */
    public function index(Request $request): PropertyCollection
    {
        $query = Property::query()
            ->where('is_published', true)
            ->where('is_available', true);

        // Support full-text or title/compound search
        if ($search = $request->input('q')) {
            $query->where(function ($q) use ($search) {
                $q->where('title_en', 'like', "%{$search}%")
                  ->orWhere('title_ar', 'like', "%{$search}%")
                  ->orWhere('compound', 'like', "%{$search}%")
                  ->orWhere('reference_number', 'like', "%{$search}%");
            });
        }

        // Support guest capacity filtering
        if ($guests = $request->input('guests')) {
            $query->where('max_guests', '>=', (int) $guests);
        }

        // Support price range filtering
        if ($minPrice = $request->input('min_price')) {
            $query->where('base_price_cents', '>=', (int) $minPrice);
        }
        if ($maxPrice = $request->input('max_price')) {
            $query->where('base_price_cents', '<=', (int) $maxPrice);
        }

        $paginated = $this->paginateWithListingStandard(
            query: $query,
            request: $request,
            allowedSorts: ['id', 'base_price_cents', 'bedrooms', 'bathrooms', 'created_at'],
            allowedFilters: ['bedrooms', 'bathrooms', 'compound', 'location_id', 'property_category_id', 'listing_type'],
            allowedIncludes: ['category', 'location', 'amenities', 'media'],
            defaultSort: '-created_at',
            defaultPerPage: 15,
            maxPerPage: 100
        );

        return new PropertyCollection($paginated);
    }

    /**
     * Display the specified property by slug or ID.
     */
    public function show(string $slug): PropertyResource
    {
        $property = Property::where(function ($q) use ($slug) {
            $q->where('slug', $slug);
            if (is_numeric($slug)) {
                $q->orWhere('id', (int) $slug);
            }
        })
        ->where('is_published', true)
        ->with(['category', 'location', 'amenities', 'media'])
        ->firstOrFail();

        return new PropertyResource($property);
    }
}
