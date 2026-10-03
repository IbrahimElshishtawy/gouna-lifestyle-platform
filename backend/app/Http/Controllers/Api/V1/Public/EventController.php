<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\EventResource;
use App\Models\Event;
use App\Support\Traits\AppliesListingStandard;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class EventController extends Controller
{
    use AppliesListingStandard;

    /**
     * Display a paginated listing of events adhering to Standard S2.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Event::query()
            ->where('is_published', true);

        if ($search = $request->input('q')) {
            $query->where(function ($q) use ($search) {
                $q->where('title_en', 'like', "%{$search}%")
                    ->orWhere('title_ar', 'like', "%{$search}%")
                    ->orWhere('venue_name', 'like', "%{$search}%");
            });
        }

        $paginated = $this->paginateWithListingStandard(
            query: $query,
            request: $request,
            allowedSorts: ['id', 'event_date', 'created_at'],
            allowedFilters: ['location_id', 'category', 'is_ticketed'],
            allowedIncludes: ['location', 'media'],
            defaultSort: 'event_date',
            defaultPerPage: 15,
            maxPerPage: 100
        );

        return EventResource::collection($paginated);
    }

    /**
     * Display the specified event.
     */
    public function show(string $slug): EventResource
    {
        $event = Event::where('slug', $slug)
            ->orWhere('id', is_numeric($slug) ? (int) $slug : 0)
            ->where('is_published', true)
            ->with(['location', 'media'])
            ->firstOrFail();

        return new EventResource($event);
    }
}
