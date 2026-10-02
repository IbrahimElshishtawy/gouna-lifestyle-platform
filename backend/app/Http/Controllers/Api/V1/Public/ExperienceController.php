<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\ExperienceResource;
use App\Models\Experience;
use App\Support\Traits\AppliesListingStandard;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ExperienceController extends Controller
{
    use AppliesListingStandard;

    /**
     * Display a paginated listing of experiences adhering to Standard S2.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Experience::query()
            ->where('is_published', true);

        if ($search = $request->input('q')) {
            $query->where(function ($q) use ($search) {
                $q->where('title_en', 'like', "%{$search}%")
                  ->orWhere('title_ar', 'like', "%{$search}%");
            });
        }

        $paginated = $this->paginateWithListingStandard(
            query: $query,
            request: $request,
            allowedSorts: ['id', 'base_price_cents', 'duration', 'created_at'],
            allowedFilters: ['experience_category_id', 'location_id', 'pricing_model'],
            allowedIncludes: ['category', 'media'],
            defaultSort: '-created_at',
            defaultPerPage: 15,
            maxPerPage: 100
        );

        return ExperienceResource::collection($paginated);
    }

    /**
     * Display the specified experience.
     */
    public function show(string $slug): ExperienceResource
    {
        $experience = Experience::where('slug', $slug)
            ->orWhere('id', is_numeric($slug) ? (int) $slug : 0)
            ->where('is_published', true)
            ->with(['category', 'media'])
            ->firstOrFail();

        return new ExperienceResource($experience);
    }
}
