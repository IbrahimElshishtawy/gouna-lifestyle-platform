<?php

namespace App\Http\Controllers\Api\V1\Customer;

use App\Http\Controllers\Controller;
use App\Models\ConciergeQuote;
use App\Models\ConciergeRequest;
use App\Services\ConciergeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;

class CustomerConciergeController extends Controller
{
    public function __construct(
        protected ConciergeService $conciergeService
    ) {}

    /**
     * List authenticated customer's concierge requests.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $email = strtolower($user?->email ?? '');

        $requests = ConciergeRequest::with(['customerVisibleNotes', 'quotes.items', 'booking'])
            ->where(function ($q) use ($user, $email) {
                if ($user?->id) {
                    $q->where('customer_id', $user->id);
                }
                if ($email) {
                    $q->orWhere('customer_email', $email);
                }
            })
            ->latest()
            ->get()
            ->map(function ($req) {
                return [
                    'request_number' => $req->request_number,
                    'request_type' => $req->request_type,
                    'status' => $req->status,
                    'priority' => $req->priority,
                    'description' => $req->description,
                    'preferred_date' => $req->preferred_date?->toDateString(),
                    'preferred_time' => $req->preferred_time,
                    'location' => $req->location,
                    'guests_count' => $req->guests_count,
                    'budget_cents' => $req->budget_cents,
                    'currency' => $req->currency,
                    'booking_reference' => $req->booking?->reference,
                    'created_at' => $req->created_at->toIso8601String(),
                    'quotes_count' => $req->quotes->count(),
                ];
            });

        return response()->json([
            'data' => $requests,
            'meta' => [
                'request_id' => $request->attributes->get('request_id'),
                'timestamp' => now()->toIso8601String(),
            ],
        ]);
    }

    /**
     * Show single customer concierge request with quotes and customer-visible messages only.
     * Guaranteed never to leak private internal notes.
     */
    public function show(Request $request, string $idOrNumber): JsonResponse
    {
        $user = $request->user();
        $email = strtolower($user?->email ?? '');

        $conciergeRequest = ConciergeRequest::with([
            'customerVisibleNotes',
            'quotes' => function ($q) {
                $q->with('items')->orderByDesc('created_at');
            },
            'booking',
        ])
        ->where(function ($q) use ($idOrNumber) {
            $q->where('request_number', $idOrNumber)
              ->orWhere('id', $idOrNumber);
        })
        ->where(function ($q) use ($user, $email) {
            if ($user?->id) {
                $q->where('customer_id', $user->id);
            }
            if ($email) {
                $q->orWhere('customer_email', $email);
            }
        })
        ->firstOrFail();

        $notesList = $conciergeRequest->customerVisibleNotes->map(function ($note) {
            return [
                'id' => $note->id,
                'author' => $note->author_name,
                'content' => $note->content,
                'is_customer_visible' => true,
                'created_at' => $note->created_at->toIso8601String(),
            ];
        });

        return response()->json([
            'data' => [
                'id' => $conciergeRequest->id,
                'request_number' => $conciergeRequest->request_number,
                'customer_name' => $conciergeRequest->customer_name,
                'customer_email' => $conciergeRequest->customer_email,
                'customer_phone' => $conciergeRequest->customer_phone,
                'request_type' => $conciergeRequest->request_type,
                'status' => $conciergeRequest->status,
                'priority' => $conciergeRequest->priority,
                'description' => $conciergeRequest->description,
                'preferred_date' => $conciergeRequest->preferred_date?->toDateString(),
                'preferred_time' => $conciergeRequest->preferred_time,
                'location' => $conciergeRequest->location,
                'guests_count' => $conciergeRequest->guests_count,
                'budget_cents' => $conciergeRequest->budget_cents,
                'currency' => $conciergeRequest->currency,
                'booking' => $conciergeRequest->booking ? [
                    'reference' => $conciergeRequest->booking->reference,
                    'status' => $conciergeRequest->booking->status,
                ] : null,
                'notes' => $notesList,
                'messages' => $notesList,
                'quotes' => $conciergeRequest->quotes->map(function ($q) {
                    return [
                        'id' => $q->id,
                        'quote_number' => $q->quote_number,
                        'status' => $q->status,
                        'currency' => $q->currency,
                        'subtotal_cents' => $q->subtotal_cents,
                        'discount_cents' => $q->discount_cents,
                        'fees_cents' => $q->fees_cents,
                        'total_cents' => $q->total_cents,
                        'valid_until' => $q->valid_until?->toIso8601String(),
                        'notes' => $q->notes,
                        'items' => $q->items->map(function ($item) {
                            return [
                                'title' => $item->title,
                                'description' => $item->description,
                                'quantity' => $item->quantity,
                                'unit_price_cents' => $item->unit_price_cents,
                                'total_price_cents' => $item->total_price_cents,
                            ];
                        }),
                    ];
                }),
                'created_at' => $conciergeRequest->created_at->toIso8601String(),
            ],
            'meta' => [
                'request_id' => $request->attributes->get('request_id'),
                'timestamp' => now()->toIso8601String(),
            ],
        ]);
    }

    /**
     * Customer accepts authoritative quote, triggering availability revalidation
     * and conversion into an official booking reservation.
     */
    public function acceptQuote(Request $request, string $idOrNumber, string $quoteIdOrNumber): JsonResponse
    {
        $user = $request->user();
        $email = strtolower($user?->email ?? '');

        $conciergeRequest = ConciergeRequest::where(function ($q) use ($idOrNumber) {
                $q->where('request_number', $idOrNumber)
                  ->orWhere('id', $idOrNumber);
            })
            ->where(function ($q) use ($user, $email) {
                if ($user?->id) {
                    $q->where('customer_id', $user->id);
                }
                if ($email) {
                    $q->orWhere('customer_email', $email);
                }
            })
            ->firstOrFail();

        $quote = ConciergeQuote::where('concierge_request_id', $conciergeRequest->id)
            ->where(function ($q) use ($quoteIdOrNumber) {
                $q->where('quote_number', $quoteIdOrNumber)
                  ->orWhere('id', $quoteIdOrNumber);
            })
            ->firstOrFail();

        try {
            $booking = $this->conciergeService->acceptQuoteAndConvert($quote, $user);

            return response()->json([
                'data' => [
                    'quote' => [
                        'id' => $quote->id,
                        'quote_number' => $quote->quote_number,
                        'status' => $quote->status,
                    ],
                    'booking' => [
                        'id' => $booking->id,
                        'reference' => $booking->reference,
                        'status' => $booking->status,
                        'total_cents' => $booking->total_cents,
                        'currency' => $booking->currency,
                    ],
                    'quote_number' => $quote->quote_number,
                    'booking_reference' => $booking->reference,
                    'status' => 'confirmed',
                    'total_cents' => $booking->total_cents,
                    'currency' => $booking->currency,
                ],
                'message' => "Quote accepted! Reservation {$booking->reference} has been created and confirmed.",
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
