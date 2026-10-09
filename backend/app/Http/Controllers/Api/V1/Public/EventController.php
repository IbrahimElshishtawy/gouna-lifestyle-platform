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
            ->where(function ($q) {
                $q->where('is_published', true)
                  ->orWhere('status', 'published');
            })
            ->with(['location', 'media', 'ticketTypes', 'venue']);

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
            allowedIncludes: ['location', 'media', 'ticketTypes', 'schedules', 'venue'],
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
        $event = Event::where(function ($q) use ($slug) {
                $q->where('slug', $slug)
                  ->orWhere('id', is_numeric($slug) ? (int) $slug : 0);
            })
            ->where(function ($q) {
                $q->where('is_published', true)
                  ->orWhere('status', 'published');
            })
            ->with(['location', 'media', 'ticketTypes', 'schedules', 'venue'])
            ->firstOrFail();

        return new EventResource($event);
    }

    /**
     * Book tickets for an event.
     */
    public function book(Request $request, string $slug): \Illuminate\Http\JsonResponse
    {
        $event = Event::where('slug', $slug)
            ->orWhere('id', is_numeric($slug) ? (int) $slug : 0)
            ->where('is_published', true)
            ->firstOrFail();

        $validated = $request->validate([
            'ticket_type_id' => 'required|exists:event_ticket_types,id',
            'quantity' => 'required|integer|min:1|max:10',
            'customer_name' => 'required|string|max:120',
            'customer_email' => 'required|email|max:120',
            'customer_phone' => 'required|string|max:30',
            'payment_method' => 'nullable|string|in:card,instapay,cash_on_arrival',
            'special_requests' => 'nullable|string|max:500',
        ]);

        $ticketType = \App\Models\EventTicketType::where('event_id', $event->id)
            ->where('id', $validated['ticket_type_id'])
            ->where('is_active', true)
            ->firstOrFail();

        // Check availability
        $available = max(0, ($ticketType->capacity ?? 100) - ($ticketType->sold_count ?? 0));
        if ($available < $validated['quantity']) {
            return response()->json([
                'message' => 'عفواً، لا توجد تذاكر كافية متاحة لهذه الفئة.',
                'errors' => ['quantity' => ['The requested quantity exceeds available tickets.']],
            ], 422);
        }

        // Find or create Customer
        $parts = explode(' ', trim($validated['customer_name']), 2);
        $firstName = $parts[0] ?: 'Guest';
        $lastName = !empty($parts[1]) ? $parts[1] : 'VIP';

        $customer = \App\Models\Customer::firstOrCreate(
            ['email' => $validated['customer_email']],
            [
                'first_name' => $firstName,
                'last_name' => $lastName,
                'phone' => $validated['customer_phone'],
                'phone_country_code' => '+20',
                'source' => 'event_booking',
                'is_active' => true,
            ]
        );

        $totalCents = ($ticketType->price_cents ?? 0) * $validated['quantity'];
        $currency = $ticketType->currency ?? 'EGP';

        $orderNumber = 'EVT-' . strtoupper(\Illuminate\Support\Str::random(8));

        $isPaid = $validated['payment_method'] !== 'cash_on_arrival';

        $order = \App\Models\EventOrder::create([
            'order_number' => $orderNumber,
            'event_id' => $event->id,
            'customer_id' => $customer->id,
            'total_cents' => $totalCents,
            'currency' => $currency,
            'status' => $isPaid ? 'paid' : 'pending',
            'payment_status' => $isPaid ? 'paid' : 'unpaid',
            'gateway_reference' => 'MANUAL-' . strtoupper(\Illuminate\Support\Str::random(6)),
        ]);

        // Generate tickets
        $tickets = [];
        for ($i = 0; $i < $validated['quantity']; $i++) {
            $ticketNumber = 'TKT-' . strtoupper(\Illuminate\Support\Str::random(10));
            $qrToken = (string) \Illuminate\Support\Str::uuid();

            $ticket = \App\Models\EventTicket::create([
                'event_order_id' => $order->id,
                'event_id' => $event->id,
                'event_ticket_type_id' => $ticketType->id,
                'customer_id' => $customer->id,
                'ticket_number' => $ticketNumber,
                'qr_token' => $qrToken,
                'price_cents' => $ticketType->price_cents ?? 0,
                'currency' => $currency,
                'status' => 'valid',
            ]);

            $tickets[] = [
                'ticket_number' => $ticket->ticket_number,
                'ticket_type' => $ticketType->name_ar ?: $ticketType->name_en,
                'qr_token' => $qrToken,
            ];
        }

        $ticketType->increment('sold_count', $validated['quantity']);

        return response()->json([
            'status' => 'success',
            'message' => 'تم تأكيد حجز تذاكر الفعالية بنجاح!',
            'data' => [
                'order_number' => $order->order_number,
                'event_title' => $event->title_ar ?: $event->title_en,
                'event_date' => $event->event_date?->format('Y-m-d'),
                'venue_name' => $event->venue_name,
                'quantity' => $validated['quantity'],
                'total_amount' => $totalCents / 100,
                'currency' => $currency,
                'customer_name' => $customer->name,
                'customer_phone' => $customer->phone,
                'tickets' => $tickets,
            ],
        ], 201);
    }

    /**
     * VIP concierge inquiry for an event.
     */
    public function inquire(Request $request, string $slug): \Illuminate\Http\JsonResponse
    {
        $event = Event::where('slug', $slug)
            ->orWhere('id', is_numeric($slug) ? (int) $slug : 0)
            ->where('is_published', true)
            ->firstOrFail();

        $validated = $request->validate([
            'name' => 'required|string|max:120',
            'email' => 'required|email|max:120',
            'phone' => 'required|string|max:30',
            'guests_count' => 'nullable|integer|min:1',
            'message' => 'required|string|max:1000',
        ]);

        \App\Models\Lead::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'inquiry_type' => 'event',
            'subject' => "VIP Concierge Inquiry for: {$event->title_en}",
            'message' => "Event: {$event->title_en} ({$event->event_date?->format('Y-m-d')})\nGuests: " . ($validated['guests_count'] ?? 1) . "\nNotes: " . $validated['message'],
            'status' => 'new',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'تم استلام طلبكم بنجاح! سيتواصل معكم فريق الكونسيرج الخاص لترتيب كافة التفاصيل.',
        ], 201);
    }
}
