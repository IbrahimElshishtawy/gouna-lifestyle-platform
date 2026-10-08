<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\ConciergeNote;
use App\Models\ConciergeQuote;
use App\Models\ConciergeRequest;
use App\Models\User;
use App\Services\ConciergeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;

class ConciergeApiController extends Controller
{
    public function __construct(
        protected ConciergeService $conciergeService
    ) {}

    /**
     * Dashboard KPIs for Concierge Command Center.
     */
    public function dashboard(Request $request): JsonResponse
    {
        $totalRequests = ConciergeRequest::count();
        $newRequests = ConciergeRequest::where('status', 'new')->count();
        $urgentRequests = ConciergeRequest::where('priority', 'urgent')->whereNotIn('status', ['completed', 'cancelled', 'rejected'])->count();
        $unassigned = ConciergeRequest::whereNull('assigned_to')->whereNotIn('status', ['completed', 'cancelled', 'rejected'])->count();
        $inProgress = ConciergeRequest::whereIn('status', ['assigned', 'in_progress', 'waiting_customer', 'waiting_partner'])->count();
        $pendingQuotes = ConciergeRequest::where('status', 'quoted')->count();
        $completedToday = ConciergeRequest::where('status', 'completed')->whereDate('resolved_at', today())->count();
        $confirmedOrCompleted = ConciergeRequest::whereIn('status', ['confirmed', 'completed'])->count();

        $conversionRate = $totalRequests > 0
            ? round(($confirmedOrCompleted / $totalRequests) * 100, 1)
            : 0;

        $recentUrgent = ConciergeRequest::with(['assignedTo', 'customer'])
            ->where('priority', 'urgent')
            ->whereNotIn('status', ['completed', 'cancelled', 'rejected'])
            ->latest()
            ->take(5)
            ->get();

        return response()->json([
            'data' => [
                'total_requests' => $totalRequests,
                'new_requests' => $newRequests,
                'urgent_requests' => $urgentRequests,
                'unassigned' => $unassigned,
                'in_progress' => $inProgress,
                'pending_quotes' => $pendingQuotes,
                'completed_today' => $completedToday,
                'conversion_rate' => $conversionRate,
                'recent_urgent' => $recentUrgent,
            ],
            'meta' => [
                'request_id' => $request->attributes->get('request_id'),
                'timestamp' => now()->toIso8601String(),
            ],
        ]);
    }

    /**
     * Paginated Queue of Concierge Requests with search & filters.
     */
    public function index(Request $request): JsonResponse
    {
        $query = ConciergeRequest::with(['customer', 'assignedTo', 'quotes'])
            ->orderByRaw("CASE WHEN priority = 'urgent' THEN 1 WHEN priority = 'high' THEN 2 WHEN priority = 'normal' THEN 3 ELSE 4 END")
            ->orderByDesc('created_at');

        // Queue filter
        $queue = $request->query('queue');
        $user = $request->user();

        if ($queue === 'new') {
            $query->where('status', 'new');
        } elseif ($queue === 'unassigned') {
            $query->whereNull('assigned_to')->whereNotIn('status', ['completed', 'cancelled', 'rejected']);
        } elseif ($queue === 'assigned') {
            $query->whereNotNull('assigned_to')->whereNotIn('status', ['completed', 'cancelled', 'rejected']);
        } elseif ($queue === 'my_requests' && $user) {
            $query->where('assigned_to', $user->id);
        } elseif ($queue === 'in_progress') {
            $query->whereIn('status', ['in_progress', 'waiting_customer', 'waiting_partner']);
        } elseif ($queue === 'quoted') {
            $query->where('status', 'quoted');
        } elseif ($queue === 'confirmed') {
            $query->where('status', 'confirmed');
        } elseif ($queue === 'completed') {
            $query->where('status', 'completed');
        } elseif ($queue === 'urgent') {
            $query->where('priority', 'urgent')->whereNotIn('status', ['completed', 'cancelled', 'rejected']);
        }

        // Additional query filters
        if ($status = $request->query('status')) {
            if ($status !== 'all') {
                $query->where('status', $status);
            }
        }

        if ($priority = $request->query('priority')) {
            if ($priority !== 'all') {
                $query->where('priority', $priority);
            }
        }

        if ($type = $request->query('type')) {
            if ($type !== 'all') {
                $query->where('request_type', $type);
            }
        }

        if ($assignedTo = $request->query('assigned_to')) {
            $query->where('assigned_to', $assignedTo);
        }

        if ($search = $request->query('q')) {
            $query->where(function ($q) use ($search) {
                $q->where('request_number', 'like', "%{$search}%")
                    ->orWhere('customer_name', 'like', "%{$search}%")
                    ->orWhere('customer_email', 'like', "%{$search}%")
                    ->orWhere('customer_phone', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $paginator = $query->paginate($request->query('per_page', 15));

        $staffList = User::where('is_admin', true)->where('is_active', true)->select('id', 'name', 'email')->get();

        return response()->json([
            'data' => $paginator->items(),
            'staff' => $staffList,
            'links' => [
                'first' => $paginator->url(1),
                'last' => $paginator->url($paginator->lastPage()),
                'prev' => $paginator->previousPageUrl(),
                'next' => $paginator->nextPageUrl(),
            ],
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'from' => $paginator->firstItem(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'to' => $paginator->lastItem(),
                'total' => $paginator->total(),
                'request_id' => $request->attributes->get('request_id'),
                'timestamp' => now()->toIso8601String(),
            ],
        ]);
    }

    /**
     * Show single Concierge Request with detailed timeline, notes, quotes, and converted booking.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $conciergeRequest = ConciergeRequest::with([
            'customer',
            'assignedTo',
            'booking',
            'notes.user',
            'quotes.items',
            'quotes.creator',
            'quotes.booking',
        ])->findOrFail($id);

        $staffList = User::where('is_admin', true)->where('is_active', true)->select('id', 'name', 'email')->get();

        return response()->json([
            'data' => $conciergeRequest,
            'staff' => $staffList,
            'meta' => [
                'request_id' => $request->attributes->get('request_id'),
                'timestamp' => now()->toIso8601String(),
            ],
        ]);
    }

    /**
     * Create a new Concierge Request.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_email' => ['required', 'email', 'max:255'],
            'customer_phone' => ['nullable', 'string', 'max:50'],
            'request_type' => ['required', 'string', 'in:yacht,experience,event,stay,transportation,dining,celebration,custom'],
            'priority' => ['nullable', 'string', 'in:low,normal,high,urgent'],
            'description' => ['required', 'string'],
            'preferred_date' => ['nullable', 'date'],
            'preferred_time' => ['nullable', 'string'],
            'location' => ['nullable', 'string'],
            'guests_count' => ['nullable', 'integer', 'min:1'],
            'budget' => ['nullable', 'numeric', 'min:0'],
            'assigned_to' => ['nullable', 'exists:users,id'],
            'initial_note' => ['nullable', 'string'],
        ]);

        $created = $this->conciergeService->createRequest($validated, $request->user());

        return response()->json([
            'data' => $created->fresh(['assignedTo', 'customer']),
            'message' => "Concierge request {$created->request_number} created successfully.",
        ], 201);
    }

    /**
     * Update request details / priority / dates.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $conciergeRequest = ConciergeRequest::findOrFail($id);

        $validated = $request->validate([
            'priority' => ['sometimes', 'string', 'in:low,normal,high,urgent'],
            'request_type' => ['sometimes', 'string'],
            'description' => ['sometimes', 'string'],
            'preferred_date' => ['nullable', 'date'],
            'preferred_time' => ['nullable', 'string'],
            'location' => ['nullable', 'string'],
            'guests_count' => ['nullable', 'integer', 'min:1'],
            'internal_notes' => ['nullable', 'string'],
        ]);

        $conciergeRequest->fill($validated);
        $conciergeRequest->save();

        return response()->json([
            'data' => $conciergeRequest->fresh(['assignedTo', 'customer']),
            'message' => 'Concierge request updated successfully.',
        ]);
    }

    /**
     * Assign request to an authorized staff member.
     */
    public function assign(Request $request, int $id): JsonResponse
    {
        $conciergeRequest = ConciergeRequest::findOrFail($id);

        $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'reason' => ['nullable', 'string'],
        ]);

        $updated = $this->conciergeService->assignRequest(
            $conciergeRequest,
            (int) $request->input('user_id'),
            $request->user(),
            $request->input('reason')
        );

        return response()->json([
            'data' => $updated,
            'message' => "Request {$updated->request_number} assigned to {$updated->assignedTo->name}.",
        ]);
    }

    /**
     * Transition status machine.
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $conciergeRequest = ConciergeRequest::findOrFail($id);

        $request->validate([
            'status' => ['required', 'string', 'in:new,assigned,in_progress,waiting_customer,waiting_partner,quoted,confirmed,completed,cancelled,rejected,escalated'],
            'reason' => ['nullable', 'string'],
        ]);

        try {
            $updated = $this->conciergeService->updateStatus(
                $conciergeRequest,
                $request->input('status'),
                $request->user(),
                $request->input('reason')
            );

            return response()->json([
                'data' => $updated,
                'message' => "Status updated to {$updated->status}.",
            ]);
        } catch (InvalidArgumentException $e) {
            return response()->json([
                'error' => [
                    'code' => 'INVALID_TRANSITION',
                    'message' => $e->getMessage(),
                ],
            ], 422);
        }
    }

    /**
     * Add note (Internal private vs Customer visible).
     */
    public function addNote(Request $request, int $id): JsonResponse
    {
        $conciergeRequest = ConciergeRequest::findOrFail($id);

        $request->validate([
            'content' => ['required', 'string'],
            'is_customer_visible' => ['boolean'],
        ]);

        $note = ConciergeNote::create([
            'concierge_request_id' => $conciergeRequest->id,
            'user_id' => $request->user()?->id,
            'author_name' => $request->user()?->name ?? 'Admin',
            'content' => $request->input('content'),
            'is_customer_visible' => $request->boolean('is_customer_visible', false),
        ]);

        return response()->json([
            'data' => $note,
            'message' => 'Note appended successfully.',
        ], 201);
    }

    /**
     * Create an authoritative quote for the request.
     */
    public function createQuote(Request $request, int $id): JsonResponse
    {
        $conciergeRequest = ConciergeRequest::findOrFail($id);

        $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.title' => ['required', 'string'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.unit_price' => ['sometimes', 'numeric', 'min:0'],
            'items.*.unit_price_cents' => ['sometimes', 'integer', 'min:0'],
            'items.*.item_type' => ['sometimes', 'string'],
            'items.*.reference_id' => ['nullable', 'integer'],
            'discount' => ['nullable', 'numeric', 'min:0'],
            'fees' => ['nullable', 'numeric', 'min:0'],
            'valid_until' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
        ]);

        try {
            $quote = $this->conciergeService->createQuote($conciergeRequest, $request->all(), $request->user());

            return response()->json([
                'data' => $quote,
                'message' => "Quote {$quote->quote_number} generated successfully.",
            ], 201);
        } catch (InvalidArgumentException $e) {
            return response()->json([
                'error' => [
                    'code' => 'QUOTE_CREATION_FAILED',
                    'message' => $e->getMessage(),
                ],
            ], 422);
        }
    }

    /**
     * Accept quote and convert into a real, server-authoritative Booking!
     */
    public function acceptQuote(Request $request, int $id, int $quoteId): JsonResponse
    {
        $quote = ConciergeQuote::where('concierge_request_id', $id)->findOrFail($quoteId);

        try {
            $booking = $this->conciergeService->acceptQuoteAndConvert($quote, $request->user());

            return response()->json([
                'data' => [
                    'quote' => $quote->fresh(),
                    'booking' => $booking,
                ],
                'message' => "Quote accepted. Reservation #{$booking->reference} created and confirmed successfully.",
            ]);
        } catch (InvalidArgumentException $e) {
            return response()->json([
                'error' => [
                    'code' => 'QUOTE_ACCEPTANCE_FAILED',
                    'message' => $e->getMessage(),
                ],
            ], 422);
        }
    }
}
