<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventOrder;
use App\Models\EventSchedule;
use App\Models\EventTicket;
use App\Models\EventTicketType;
use App\Models\Location;
use App\Models\TicketScan;
use App\Models\Venue;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class EventApiController extends Controller
{
    /**
     * List all events with filters, search, and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Event::with(['venue', 'location', 'ticketTypes'])
            ->withCount(['ticketTypes', 'orders', 'tickets']);

        if ($request->filled('q')) {
            $q = trim($request->input('q'));
            $query->where(function ($b) use ($q) {
                $b->where('title_en', 'like', "%{$q}%")
                    ->orWhere('title_ar', 'like', "%{$q}%")
                    ->orWhere('organizer', 'like', "%{$q}%")
                    ->orWhere('venue_name', 'like', "%{$q}%");
            });
        }

        if ($request->filled('category') && $request->input('category') !== 'all') {
            $query->where('category', $request->input('category'));
        }

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('venue_id')) {
            $query->where('venue_id', $request->input('venue_id'));
        }

        if ($request->filled('date_from')) {
            $query->whereDate('event_date', '>=', $request->input('date_from'));
        }

        $events = $query->orderBy('event_date', 'asc')->paginate($request->input('per_page', 12));

        return response()->json([
            'success' => true,
            'data' => $events->items(),
            'meta' => [
                'current_page' => $events->currentPage(),
                'last_page' => $events->lastPage(),
                'per_page' => $events->perPage(),
                'total' => $events->total(),
            ],
        ]);
    }

    /**
     * Operational KPIs for Events, Tickets & Check-in.
     */
    public function dashboard(): JsonResponse
    {
        $today = Carbon::today()->toDateString();

        $upcomingCount = Event::where('event_date', '>=', $today)
            ->where('status', 'published')
            ->count();

        $todayEventsCount = Event::whereDate('event_date', $today)->count();

        $totalCapacity = (int) EventTicketType::sum('capacity');
        $totalSold = (int) EventTicketType::sum('sold_count');
        $ticketsRemaining = max(0, $totalCapacity - $totalSold);

        $totalCheckins = EventTicket::where('status', 'used')->count();

        $revenueCents = EventOrder::whereIn('status', ['paid', 'completed'])
            ->sum('total_cents');

        $recentCheckins = EventTicket::with(['customer', 'event', 'ticketType'])
            ->where('status', 'used')
            ->latest('used_at')
            ->limit(5)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'upcoming_events' => $upcomingCount,
                'today_events' => $todayEventsCount,
                'tickets_sold' => $totalSold,
                'tickets_remaining' => $ticketsRemaining,
                'total_checkins' => $totalCheckins,
                'revenue_egp' => round($revenueCents / 100, 2),
                'recent_checkins' => $recentCheckins,
            ],
        ]);
    }

    /**
     * Event creation taxonomies.
     */
    public function taxonomies(): JsonResponse
    {
        $venues = Venue::active()->select('id', 'name_en', 'name_ar', 'venue_type', 'capacity', 'address')->get();
        $locations = Location::active()->select('id', 'name_en', 'name_ar', 'slug')->get();

        $categories = [
            ['id' => 'Party', 'name_en' => 'Beach Party & Nightlife', 'name_ar' => 'حفلات شاطئية وسهر'],
            ['id' => 'Festival', 'name_en' => 'Festivals & Film Galas', 'name_ar' => 'مهرجانات وسينما'],
            ['id' => 'Concert', 'name_en' => 'Live Concert & Performances', 'name_ar' => 'حفلات غنائية وموسيقية'],
            ['id' => 'Wedding', 'name_en' => 'Luxury Weddings', 'name_ar' => 'أعراس وزفاف فاخر'],
            ['id' => 'Birthday', 'name_en' => 'Private Celebrations & Birthdays', 'name_ar' => 'أعياد ميلاد واحتفالات خاصة'],
            ['id' => 'Corporate', 'name_en' => 'Corporate Summits & Galas', 'name_ar' => 'فعاليات وقمم شركات'],
            ['id' => 'Sports', 'name_en' => 'Sports & Regattas', 'name_ar' => 'بطولات رياضية وسباقات'],
            ['id' => 'Cultural', 'name_en' => 'Cultural & Art Exhibitions', 'name_ar' => 'معارض ثقافية وفنية'],
            ['id' => 'Other', 'name_en' => 'Other Experiences', 'name_ar' => 'فعاليات أخرى'],
        ];

        $statuses = [
            ['id' => 'draft', 'name_en' => 'Draft', 'name_ar' => 'مسودة'],
            ['id' => 'published', 'name_en' => 'Published', 'name_ar' => 'منشور ومتاح'],
            ['id' => 'cancelled', 'name_en' => 'Cancelled', 'name_ar' => 'ملغي'],
            ['id' => 'completed', 'name_en' => 'Completed', 'name_ar' => 'مكتمل'],
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'venues' => $venues,
                'locations' => $locations,
                'categories' => $categories,
                'statuses' => $statuses,
            ],
        ]);
    }

    /**
     * Store a new event with ticket tiers.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title_en' => ['required', 'string', 'max:255'],
            'title_ar' => ['nullable', 'string', 'max:255'],
            'venue_id' => ['nullable', 'exists:venues,id'],
            'location_id' => ['nullable', 'exists:locations,id'],
            'category' => ['required', 'string', 'max:100'],
            'organizer' => ['nullable', 'string', 'max:255'],
            'event_date' => ['required', 'date'],
            'start_time' => ['required', 'string'],
            'end_time' => ['nullable', 'string'],
            'doors_open_time' => ['nullable', 'string'],
            'age_restriction' => ['nullable', 'string', 'max:50'],
            'dress_code' => ['nullable', 'string', 'max:100'],
            'short_description_en' => ['nullable', 'string'],
            'short_description_ar' => ['nullable', 'string'],
            'description_en' => ['nullable', 'string'],
            'description_ar' => ['nullable', 'string'],
            'rules_en' => ['nullable', 'string'],
            'rules_ar' => ['nullable', 'string'],
            'status' => ['required', 'in:draft,published,cancelled,completed'],
            'is_featured' => ['nullable', 'boolean'],
            'is_ticketed' => ['nullable', 'boolean'],
            'is_published' => ['nullable', 'boolean'],
            // Ticket types array
            'tickets' => ['nullable', 'array'],
            'tickets.*.name_en' => ['required', 'string', 'max:255'],
            'tickets.*.name_ar' => ['nullable', 'string', 'max:255'],
            'tickets.*.price' => ['required', 'numeric', 'min:0'],
            'tickets.*.capacity' => ['nullable', 'integer', 'min:1'],
            'tickets.*.max_per_order' => ['nullable', 'integer', 'min:1'],
            'tickets.*.description_en' => ['nullable', 'string'],
            // Timeline array
            'schedules' => ['nullable', 'array'],
            'schedules.*.title_en' => ['required', 'string'],
            'schedules.*.start_time' => ['nullable', 'string'],
            'schedules.*.performer_name' => ['nullable', 'string'],
        ]);

        $slug = Str::slug($validated['title_en']).'-'.strtolower(Str::random(4));

        $venue = !empty($validated['venue_id']) ? Venue::find($validated['venue_id']) : null;

        $event = DB::transaction(function () use ($validated, $slug, $venue) {
            $createdEvent = Event::create([
                'venue_id' => $validated['venue_id'] ?? null,
                'location_id' => $validated['location_id'] ?? ($venue?->location_id),
                'slug' => $slug,
                'title_en' => $validated['title_en'],
                'title_ar' => $validated['title_ar'] ?? null,
                'short_description_en' => $validated['short_description_en'] ?? null,
                'short_description_ar' => $validated['short_description_ar'] ?? null,
                'description_en' => $validated['description_en'] ?? null,
                'description_ar' => $validated['description_ar'] ?? null,
                'category' => $validated['category'],
                'organizer' => $validated['organizer'] ?? 'GouNow Events',
                'event_date' => $validated['event_date'],
                'start_time' => $validated['start_time'],
                'end_time' => $validated['end_time'] ?? null,
                'doors_open_time' => $validated['doors_open_time'] ?? null,
                'venue_name' => $venue ? $venue->name_en : ($validated['venue_name'] ?? 'El Gouna'),
                'venue_address' => $venue ? $venue->address : ($validated['venue_address'] ?? 'El Gouna'),
                'latitude' => $venue?->latitude,
                'longitude' => $venue?->longitude,
                'age_restriction' => $validated['age_restriction'] ?? '18+',
                'dress_code' => $validated['dress_code'] ?? 'Smart Casual',
                'rules_en' => $validated['rules_en'] ?? null,
                'rules_ar' => $validated['rules_ar'] ?? null,
                'is_ticketed' => $validated['is_ticketed'] ?? true,
                'is_featured' => $validated['is_featured'] ?? false,
                'is_published' => $validated['status'] === 'published',
                'status' => $validated['status'],
            ]);

            // Save ticket tiers
            if (!empty($validated['tickets'])) {
                foreach ($validated['tickets'] as $idx => $t) {
                    EventTicketType::create([
                        'event_id' => $createdEvent->id,
                        'name_en' => $t['name_en'],
                        'name_ar' => $t['name_ar'] ?? null,
                        'price_cents' => (int) round($t['price'] * 100),
                        'capacity' => $t['capacity'] ?? 100,
                        'max_per_order' => $t['max_per_order'] ?? 4,
                        'description_en' => $t['description_en'] ?? null,
                        'is_active' => true,
                        'sort_order' => $idx + 1,
                    ]);
                }
            }

            // Save schedule timeline
            if (!empty($validated['schedules'])) {
                foreach ($validated['schedules'] as $idx => $s) {
                    EventSchedule::create([
                        'event_id' => $createdEvent->id,
                        'title_en' => $s['title_en'],
                        'start_time' => $s['start_time'] ?? null,
                        'performer_name' => $s['performer_name'] ?? null,
                        'sort_order' => $idx + 1,
                    ]);
                }
            }

            return $createdEvent;
        });

        return response()->json([
            'success' => true,
            'message' => 'Event published successfully.',
            'data' => $event->load(['venue', 'ticketTypes', 'schedules']),
        ], 201);
    }

    /**
     * Show single event details.
     */
    public function show($id): JsonResponse
    {
        $event = Event::with(['venue', 'location', 'ticketTypes', 'schedules', 'performers'])
            ->withCount(['orders', 'tickets'])
            ->findOrFail($id);

        $checkinsCount = EventTicket::where('event_id', $event->id)->where('status', 'used')->count();
        $totalSold = (int) $event->ticketTypes->sum('sold_count');
        $totalCapacity = (int) $event->ticketTypes->sum('capacity');

        return response()->json([
            'success' => true,
            'data' => $event,
            'stats' => [
                'total_sold' => $totalSold,
                'total_capacity' => $totalCapacity,
                'total_checkins' => $checkinsCount,
                'checkin_rate' => $totalSold > 0 ? round(($checkinsCount / $totalSold) * 100, 1) : 0,
            ],
        ]);
    }

    /**
     * Update an event.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $event = Event::findOrFail($id);

        $validated = $request->validate([
            'title_en' => ['sometimes', 'required', 'string', 'max:255'],
            'title_ar' => ['nullable', 'string', 'max:255'],
            'venue_id' => ['nullable', 'exists:venues,id'],
            'location_id' => ['nullable', 'exists:locations,id'],
            'category' => ['sometimes', 'required', 'string', 'max:100'],
            'organizer' => ['nullable', 'string', 'max:255'],
            'event_date' => ['sometimes', 'required', 'date'],
            'start_time' => ['sometimes', 'required', 'string'],
            'end_time' => ['nullable', 'string'],
            'doors_open_time' => ['nullable', 'string'],
            'age_restriction' => ['nullable', 'string', 'max:50'],
            'dress_code' => ['nullable', 'string', 'max:100'],
            'short_description_en' => ['nullable', 'string'],
            'short_description_ar' => ['nullable', 'string'],
            'description_en' => ['nullable', 'string'],
            'description_ar' => ['nullable', 'string'],
            'rules_en' => ['nullable', 'string'],
            'rules_ar' => ['nullable', 'string'],
            'status' => ['sometimes', 'required', 'in:draft,published,cancelled,completed'],
            'is_featured' => ['nullable', 'boolean'],
            'is_ticketed' => ['nullable', 'boolean'],
        ]);

        if (isset($validated['venue_id'])) {
            $venue = Venue::find($validated['venue_id']);
            if ($venue) {
                $validated['venue_name'] = $venue->name_en;
                $validated['venue_address'] = $venue->address;
                $validated['latitude'] = $venue->latitude;
                $validated['longitude'] = $venue->longitude;
            }
        }

        if (isset($validated['status'])) {
            $validated['is_published'] = $validated['status'] === 'published';
        }

        $event->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Event updated successfully.',
            'data' => $event->load(['venue', 'ticketTypes', 'schedules']),
        ]);
    }

    /**
     * Delete event.
     */
    public function destroy($id): JsonResponse
    {
        $event = Event::findOrFail($id);
        $event->delete();

        return response()->json([
            'success' => true,
            'message' => 'Event removed successfully.',
        ]);
    }

    /**
     * Toggle event status.
     */
    public function toggleStatus($id): JsonResponse
    {
        $event = Event::findOrFail($id);
        $newStatus = $event->status === 'published' ? 'draft' : 'published';
        $event->update([
            'status' => $newStatus,
            'is_published' => $newStatus === 'published',
        ]);

        return response()->json([
            'success' => true,
            'message' => "Event status updated to {$newStatus}.",
            'status' => $newStatus,
        ]);
    }

    /**
     * List ticket types for event.
     */
    public function tickets($id): JsonResponse
    {
        $event = Event::findOrFail($id);
        $ticketTypes = $event->ticketTypes()->orderBy('sort_order')->get();

        return response()->json([
            'success' => true,
            'data' => $ticketTypes,
        ]);
    }

    /**
     * Store / update a ticket type.
     */
    public function storeTicketType(Request $request, $id): JsonResponse
    {
        $event = Event::findOrFail($id);

        $validated = $request->validate([
            'id' => ['nullable', 'exists:event_ticket_types,id'],
            'name_en' => ['required', 'string', 'max:255'],
            'name_ar' => ['nullable', 'string', 'max:255'],
            'price' => ['required', 'numeric', 'min:0'],
            'capacity' => ['required', 'integer', 'min:1'],
            'max_per_order' => ['nullable', 'integer', 'min:1'],
            'description_en' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $ticketType = EventTicketType::updateOrCreate(
            ['id' => $validated['id'] ?? null, 'event_id' => $event->id],
            [
                'name_en' => $validated['name_en'],
                'name_ar' => $validated['name_ar'] ?? null,
                'price_cents' => (int) round($validated['price'] * 100),
                'capacity' => $validated['capacity'],
                'max_per_order' => $validated['max_per_order'] ?? 4,
                'description_en' => $validated['description_en'] ?? null,
                'is_active' => $validated['is_active'] ?? true,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Ticket tier saved.',
            'data' => $ticketType,
        ], 201);
    }

    /**
     * Delete ticket type.
     */
    public function deleteTicketType($id, $ticketTypeId): JsonResponse
    {
        $event = Event::findOrFail($id);
        $ticketType = $event->ticketTypes()->findOrFail($ticketTypeId);
        $ticketType->delete();

        return response()->json([
            'success' => true,
            'message' => 'Ticket tier removed.',
        ]);
    }

    /**
     * List event orders.
     */
    public function orders($id, Request $request): JsonResponse
    {
        $event = Event::findOrFail($id);

        $query = EventOrder::with(['customer', 'tickets.ticketType'])
            ->where('event_id', $event->id);

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        $orders = $query->latest('id')->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $orders->items(),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    /**
     * Cancel an event order.
     */
    public function cancelOrder($id, $orderId): JsonResponse
    {
        $event = Event::findOrFail($id);
        $order = EventOrder::where('event_id', $event->id)->findOrFail($orderId);

        DB::transaction(function () use ($order) {
            $order->update(['status' => 'cancelled']);
            $order->tickets()->update(['status' => 'cancelled']);
        });

        return response()->json([
            'success' => true,
            'message' => "Order #{$order->order_number} cancelled.",
        ]);
    }

    /**
     * Refund an event order.
     */
    public function refundOrder($id, $orderId): JsonResponse
    {
        $event = Event::findOrFail($id);
        $order = EventOrder::where('event_id', $event->id)->findOrFail($orderId);

        DB::transaction(function () use ($order) {
            $order->update(['status' => 'refunded', 'payment_status' => 'refunded']);
            $order->tickets()->update(['status' => 'refunded']);
        });

        return response()->json([
            'success' => true,
            'message' => "Order #{$order->order_number} refunded.",
        ]);
    }

    /**
     * Search tickets for manual or fast search check-in.
     */
    public function searchTickets(Request $request, $id): JsonResponse
    {
        $event = Event::findOrFail($id);
        $q = trim($request->input('q', ''));

        if (strlen($q) < 2) {
            return response()->json(['success' => true, 'data' => []]);
        }

        $tickets = EventTicket::with(['customer', 'ticketType', 'order'])
            ->where('event_id', $event->id)
            ->where(function ($b) use ($q) {
                $b->where('ticket_number', 'like', "%{$q}%")
                    ->orWhere('qr_token', 'like', "%{$q}%")
                    ->orWhereHas('customer', function ($cq) use ($q) {
                        $cq->where('first_name', 'like', "%{$q}%")
                            ->orWhere('last_name', 'like', "%{$q}%")
                            ->orWhere('email', 'like', "%{$q}%")
                            ->orWhere('phone', 'like', "%{$q}%");
                    });
            })
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $tickets,
        ]);
    }

    /**
     * Live Event Check-in Validator & Scanner.
     * Prevents double check-in, fake/wrong tickets, cancelled/refunded tickets.
     */
    public function checkIn(Request $request, $id): JsonResponse
    {
        $event = Event::findOrFail($id);

        $validated = $request->validate([
            'ticket_code' => ['required', 'string'], // can be ticket_number or qr_token
            'device_info' => ['nullable', 'string', 'max:255'],
        ]);

        $code = trim($validated['ticket_code']);
        $ip = $request->ip();
        $device = $validated['device_info'] ?? 'Admin Dispatch Web Console';

        // 1. Locate ticket
        $ticket = EventTicket::with(['customer', 'ticketType', 'event'])
            ->where(function ($q) use ($code) {
                $q->where('ticket_number', $code)
                    ->orWhere('qr_token', $code);
            })
            ->first();

        // 2. Ticket not found in system
        if (!$ticket) {
            return response()->json([
                'success' => false,
                'result' => 'invalid',
                'message' => 'Ticket not found in the GouNow database. Fake or invalid ticket.',
            ], 404);
        }

        // 3. Ticket belongs to a different event
        if ($ticket->event_id !== $event->id) {
            TicketScan::create([
                'event_ticket_id' => $ticket->id,
                'scanned_by' => auth()->id() ?? 1,
                'result' => 'wrong_event',
                'device_info' => $device,
                'ip_address' => $ip,
            ]);

            return response()->json([
                'success' => false,
                'result' => 'wrong_event',
                'message' => "Wrong Event! Ticket is valid for \"{$ticket->event->title_en}\", not this event.",
                'ticket' => [
                    'ticket_number' => $ticket->ticket_number,
                    'correct_event' => $ticket->event->title_en,
                ],
            ], 422);
        }

        // 4. Ticket is cancelled or refunded
        if (in_array($ticket->status, ['cancelled', 'refunded'])) {
            TicketScan::create([
                'event_ticket_id' => $ticket->id,
                'scanned_by' => auth()->id() ?? 1,
                'result' => 'cancelled_or_refunded',
                'device_info' => $device,
                'ip_address' => $ip,
            ]);

            return response()->json([
                'success' => false,
                'result' => 'cancelled_or_refunded',
                'message' => "Entry Denied: This ticket has been {$ticket->status}.",
            ], 422);
        }

        // 5. Ticket is already used (Double Check-in prevention)
        if ($ticket->status === 'used') {
            TicketScan::create([
                'event_ticket_id' => $ticket->id,
                'scanned_by' => auth()->id() ?? 1,
                'result' => 'already_used',
                'device_info' => $device,
                'ip_address' => $ip,
            ]);

            return response()->json([
                'success' => false,
                'result' => 'already_used',
                'message' => "DOUBLE ENTRY ALERT: Ticket was already used on {$ticket->used_at?->format('H:i d M Y')}.",
                'ticket' => [
                    'ticket_number' => $ticket->ticket_number,
                    'customer_name' => $ticket->customer ? "{$ticket->customer->first_name} {$ticket->customer->last_name}" : 'Guest',
                    'used_at' => $ticket->used_at?->toIso8601String(),
                ],
            ], 422);
        }

        // 6. Valid ticket — atomic commit of check-in
        DB::transaction(function () use ($ticket, $device, $ip) {
            $ticket->update([
                'status' => 'used',
                'used_at' => now(),
                'scanned_by' => auth()->id() ?? 1,
            ]);

            TicketScan::create([
                'event_ticket_id' => $ticket->id,
                'scanned_by' => auth()->id() ?? 1,
                'result' => 'success',
                'device_info' => $device,
                'ip_address' => $ip,
            ]);
        });

        return response()->json([
            'success' => true,
            'result' => 'success',
            'message' => 'Check-in Verified. Welcome to El Gouna!',
            'ticket' => [
                'id' => $ticket->id,
                'ticket_number' => $ticket->ticket_number,
                'ticket_tier' => $ticket->ticketType?->name_en ?? 'General',
                'customer_name' => $ticket->customer ? "{$ticket->customer->first_name} {$ticket->customer->last_name}" : 'Guest',
                'customer_phone' => $ticket->customer?->phone,
                'customer_email' => $ticket->customer?->email,
                'checked_in_at' => now()->toIso8601String(),
            ],
        ]);
    }
}
