<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventTicketType;
use App\Models\Location;
use App\Models\Media;
use App\Services\MediaService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\View\View;

class EventController extends Controller
{
    public function __construct(
        private MediaService $mediaService,
    ) {}

    /**
     * Display a listing of nightlife, concert, and beach events.
     */
    public function index(Request $request): View
    {
        $query = Event::with(['location', 'ticketTypes', 'featuredImage'])->latest('event_date');

        if ($request->filled('search')) {
            $s = $request->input('search');
            $query->where(function ($q) use ($s) {
                $q->where('title_en', 'like', "%{$s}%")
                  ->orWhere('title_ar', 'like', "%{$s}%")
                  ->orWhere('venue_name', 'like', "%{$s}%");
            });
        }

        if ($request->filled('category')) {
            $query->where('category', $request->input('category'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $events = $query->paginate(12)->withQueryString();

        return view('admin.events.index', compact('events'));
    }

    /**
     * Show the form for creating a new event.
     */
    public function create(): View
    {
        $locations = Location::active()->get();

        return view('admin.events.create', compact('locations'));
    }

    /**
     * Store a newly created event with its ticket types.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title_en' => ['required', 'string', 'max:255'],
            'title_ar' => ['nullable', 'string', 'max:255'],
            'location_id' => ['nullable', 'exists:locations,id'],
            'organizer' => ['nullable', 'string', 'max:255'],
            'event_date' => ['required', 'date'],
            'start_time' => ['nullable', 'string'],
            'end_time' => ['nullable', 'string'],
            'venue_name' => ['nullable', 'string', 'max:255'],
            'venue_address' => ['nullable', 'string'],
            'latitude' => ['nullable', 'numeric'],
            'longitude' => ['nullable', 'numeric'],
            'category' => ['nullable', 'string', 'max:100'],
            'short_description_en' => ['nullable', 'string'],
            'short_description_ar' => ['nullable', 'string'],
            'description_en' => ['nullable', 'string'],
            'description_ar' => ['nullable', 'string'],
            'status' => ['required', 'in:draft,published,cancelled,completed'],
            'is_ticketed' => ['nullable', 'boolean'],
            'is_published' => ['nullable', 'boolean'],
            'is_featured' => ['nullable', 'boolean'],
            'banner_image' => ['nullable', 'image', 'max:10240'],
            // Ticket Types Array
            'tickets' => ['nullable', 'array'],
            'tickets.*.name_en' => ['required', 'string', 'max:255'],
            'tickets.*.name_ar' => ['nullable', 'string', 'max:255'],
            'tickets.*.price' => ['required', 'numeric', 'min:0'],
            'tickets.*.capacity' => ['nullable', 'integer', 'min:1'],
            'tickets.*.max_per_order' => ['nullable', 'integer', 'min:1'],
            'tickets.*.description_en' => ['nullable', 'string'],
        ]);

        $slug = Str::slug($validated['title_en']) . '-' . strtolower(Str::random(4));

        $event = Event::create([
            'slug' => $slug,
            'location_id' => $validated['location_id'] ?? null,
            'title_en' => $validated['title_en'],
            'title_ar' => $validated['title_ar'] ?? null,
            'organizer' => $validated['organizer'] ?? null,
            'event_date' => $validated['event_date'],
            'start_time' => $validated['start_time'] ?? null,
            'end_time' => $validated['end_time'] ?? null,
            'venue_name' => $validated['venue_name'] ?? null,
            'venue_address' => $validated['venue_address'] ?? null,
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
            'category' => $validated['category'] ?? 'nightlife',
            'short_description_en' => $validated['short_description_en'] ?? null,
            'short_description_ar' => $validated['short_description_ar'] ?? null,
            'description_en' => $validated['description_en'] ?? null,
            'description_ar' => $validated['description_ar'] ?? null,
            'is_ticketed' => $request->boolean('is_ticketed', true),
            'is_published' => $request->boolean('is_published'),
            'is_featured' => $request->boolean('is_featured'),
            'status' => $validated['status'],
        ]);

        // Create Ticket Types
        if ($request->has('tickets')) {
            $sort = 1;
            foreach ($request->input('tickets') as $tData) {
                if (! empty($tData['name_en'])) {
                    $event->ticketTypes()->create([
                        'name_en' => $tData['name_en'],
                        'name_ar' => $tData['name_ar'] ?? null,
                        'price_cents' => (int) round($tData['price'] * 100),
                        'currency' => 'EGP',
                        'capacity' => ! empty($tData['capacity']) ? (int) $tData['capacity'] : null,
                        'max_per_order' => ! empty($tData['max_per_order']) ? (int) $tData['max_per_order'] : 6,
                        'description_en' => $tData['description_en'] ?? null,
                        'is_active' => true,
                        'sort_order' => $sort++,
                    ]);
                }
            }
        }

        // Upload banner image
        if ($request->hasFile('banner_image')) {
            $this->mediaService->uploadMedia(
                $event,
                $request->file('banner_image'),
                true,
                $event->title_en,
                $event->title_ar
            );
        }

        return redirect()->route('admin.events.index')->with('success', "Event '{$event->title_en}' created successfully!");
    }

    /**
     * Show the form for editing an existing event.
     */
    public function edit(Event $event): View
    {
        $event->load(['ticketTypes', 'media']);
        $locations = Location::active()->get();

        return view('admin.events.edit', compact('event', 'locations'));
    }

    /**
     * Update an existing event and its ticket tiers.
     */
    public function update(Request $request, Event $event): RedirectResponse
    {
        $validated = $request->validate([
            'title_en' => ['required', 'string', 'max:255'],
            'title_ar' => ['nullable', 'string', 'max:255'],
            'location_id' => ['nullable', 'exists:locations,id'],
            'organizer' => ['nullable', 'string', 'max:255'],
            'event_date' => ['required', 'date'],
            'start_time' => ['nullable', 'string'],
            'end_time' => ['nullable', 'string'],
            'venue_name' => ['nullable', 'string', 'max:255'],
            'venue_address' => ['nullable', 'string'],
            'latitude' => ['nullable', 'numeric'],
            'longitude' => ['nullable', 'numeric'],
            'category' => ['nullable', 'string', 'max:100'],
            'short_description_en' => ['nullable', 'string'],
            'short_description_ar' => ['nullable', 'string'],
            'description_en' => ['nullable', 'string'],
            'description_ar' => ['nullable', 'string'],
            'status' => ['required', 'in:draft,published,cancelled,completed'],
            'banner_image' => ['nullable', 'image', 'max:10240'],
            'tickets' => ['nullable', 'array'],
            'tickets.*.id' => ['nullable', 'exists:event_ticket_types,id'],
            'tickets.*.name_en' => ['required', 'string', 'max:255'],
            'tickets.*.name_ar' => ['nullable', 'string', 'max:255'],
            'tickets.*.price' => ['required', 'numeric', 'min:0'],
            'tickets.*.capacity' => ['nullable', 'integer', 'min:1'],
            'tickets.*.max_per_order' => ['nullable', 'integer', 'min:1'],
            'tickets.*.description_en' => ['nullable', 'string'],
        ]);

        $event->update([
            'location_id' => $validated['location_id'] ?? null,
            'title_en' => $validated['title_en'],
            'title_ar' => $validated['title_ar'] ?? null,
            'organizer' => $validated['organizer'] ?? null,
            'event_date' => $validated['event_date'],
            'start_time' => $validated['start_time'] ?? null,
            'end_time' => $validated['end_time'] ?? null,
            'venue_name' => $validated['venue_name'] ?? null,
            'venue_address' => $validated['venue_address'] ?? null,
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
            'category' => $validated['category'] ?? 'nightlife',
            'short_description_en' => $validated['short_description_en'] ?? null,
            'short_description_ar' => $validated['short_description_ar'] ?? null,
            'description_en' => $validated['description_en'] ?? null,
            'description_ar' => $validated['description_ar'] ?? null,
            'is_ticketed' => $request->boolean('is_ticketed', true),
            'is_published' => $request->boolean('is_published'),
            'is_featured' => $request->boolean('is_featured'),
            'status' => $validated['status'],
        ]);

        // Sync Ticket Types
        if ($request->has('tickets')) {
            $ticketIdsToKeep = [];
            $sort = 1;

            foreach ($request->input('tickets') as $tData) {
                if (empty($tData['name_en'])) {
                    continue;
                }

                $tierData = [
                    'name_en' => $tData['name_en'],
                    'name_ar' => $tData['name_ar'] ?? null,
                    'price_cents' => (int) round($tData['price'] * 100),
                    'currency' => 'EGP',
                    'capacity' => ! empty($tData['capacity']) ? (int) $tData['capacity'] : null,
                    'max_per_order' => ! empty($tData['max_per_order']) ? (int) $tData['max_per_order'] : 6,
                    'description_en' => $tData['description_en'] ?? null,
                    'is_active' => true,
                    'sort_order' => $sort++,
                ];

                if (! empty($tData['id'])) {
                    $tier = EventTicketType::where('event_id', $event->id)->find($tData['id']);
                    if ($tier) {
                        $tier->update($tierData);
                        $ticketIdsToKeep[] = $tier->id;
                    }
                } else {
                    $newTier = $event->ticketTypes()->create($tierData);
                    $ticketIdsToKeep[] = $newTier->id;
                }
            }

            // Remove tiers that were deleted in the UI (only if no tickets sold yet)
            $event->ticketTypes()
                ->whereNotIn('id', $ticketIdsToKeep)
                ->where('sold_count', 0)
                ->delete();
        }

        // Upload new banner
        if ($request->hasFile('banner_image')) {
            $this->mediaService->uploadMedia(
                $event,
                $request->file('banner_image'),
                true,
                $event->title_en,
                $event->title_ar
            );
        }

        return redirect()->route('admin.events.index')->with('success', "Event '{$event->title_en}' updated successfully!");
    }

    /**
     * Delete an event.
     */
    public function destroy(Event $event): RedirectResponse
    {
        $title = $event->title_en;
        $event->delete();

        return redirect()->route('admin.events.index')->with('success', "Event '{$title}' moved to archive.");
    }

    /**
     * Delete attached media.
     */
    public function deleteMedia(Event $event, Media $media): RedirectResponse
    {
        if ($media->mediable_id === $event->id && $media->mediable_type === Event::class) {
            $this->mediaService->deleteMedia($media);
            return back()->with('success', 'Banner image removed successfully.');
        }

        abort(403);
    }
}
