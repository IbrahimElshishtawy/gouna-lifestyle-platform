<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Location;
use App\Models\Venue;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class VenueApiController extends Controller
{
    /**
     * List all event venues.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Venue::with('location')->withCount('events');

        if ($request->filled('q')) {
            $q = trim($request->input('q'));
            $query->where(function ($b) use ($q) {
                $b->where('name_en', 'like', "%{$q}%")
                    ->orWhere('name_ar', 'like', "%{$q}%")
                    ->orWhere('address', 'like', "%{$q}%");
            });
        }

        if ($request->filled('venue_type')) {
            $query->where('venue_type', $request->input('venue_type'));
        }

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        $venues = $query->latest('id')->paginate($request->input('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $venues->items(),
            'meta' => [
                'current_page' => $venues->currentPage(),
                'last_page' => $venues->lastPage(),
                'total' => $venues->total(),
            ],
        ]);
    }

    /**
     * Store new venue.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name_en' => ['required', 'string', 'max:255'],
            'name_ar' => ['nullable', 'string', 'max:255'],
            'location_id' => ['nullable', 'exists:locations,id'],
            'venue_type' => ['required', 'string', 'max:50'],
            'capacity' => ['nullable', 'integer', 'min:1'],
            'address' => ['nullable', 'string', 'max:255'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'map_url' => ['nullable', 'string', 'max:500'],
            'description_en' => ['nullable', 'string'],
            'description_ar' => ['nullable', 'string'],
            'facilities' => ['nullable', 'array'],
            'cover_image' => ['nullable', 'string'],
            'status' => ['required', 'in:active,inactive,maintenance'],
        ]);

        $slug = Str::slug($validated['name_en']).'-'.strtolower(Str::random(4));

        $venue = Venue::create([
            'name_en' => $validated['name_en'],
            'name_ar' => $validated['name_ar'] ?? null,
            'slug' => $slug,
            'location_id' => $validated['location_id'] ?? null,
            'venue_type' => $validated['venue_type'],
            'capacity' => $validated['capacity'] ?? null,
            'address' => $validated['address'] ?? null,
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
            'map_url' => $validated['map_url'] ?? null,
            'description_en' => $validated['description_en'] ?? null,
            'description_ar' => $validated['description_ar'] ?? null,
            'facilities' => $validated['facilities'] ?? [],
            'cover_image' => $validated['cover_image'] ?? null,
            'status' => $validated['status'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Venue created successfully.',
            'data' => $venue->load('location'),
        ], 201);
    }

    /**
     * Show single venue.
     */
    public function show($id): JsonResponse
    {
        $venue = Venue::with(['location', 'events'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $venue,
        ]);
    }

    /**
     * Update venue.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $venue = Venue::findOrFail($id);

        $validated = $request->validate([
            'name_en' => ['sometimes', 'required', 'string', 'max:255'],
            'name_ar' => ['nullable', 'string', 'max:255'],
            'location_id' => ['nullable', 'exists:locations,id'],
            'venue_type' => ['sometimes', 'required', 'string', 'max:50'],
            'capacity' => ['nullable', 'integer', 'min:1'],
            'address' => ['nullable', 'string', 'max:255'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'map_url' => ['nullable', 'string', 'max:500'],
            'description_en' => ['nullable', 'string'],
            'description_ar' => ['nullable', 'string'],
            'facilities' => ['nullable', 'array'],
            'cover_image' => ['nullable', 'string'],
            'status' => ['sometimes', 'required', 'in:active,inactive,maintenance'],
        ]);

        $venue->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Venue updated successfully.',
            'data' => $venue->load('location'),
        ]);
    }

    /**
     * Delete venue.
     */
    public function destroy($id): JsonResponse
    {
        $venue = Venue::findOrFail($id);
        $venue->delete();

        return response()->json([
            'success' => true,
            'message' => 'Venue removed successfully.',
        ]);
    }
}
