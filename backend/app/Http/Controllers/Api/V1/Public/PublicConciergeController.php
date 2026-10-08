<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Services\ConciergeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicConciergeController extends Controller
{
    public function __construct(
        protected ConciergeService $conciergeService
    ) {}

    /**
     * Submit a public VIP concierge request.
     */
    public function store(Request $request): JsonResponse
    {
        $raw = $request->all();
        $merged = array_merge($raw, [
            'request_type' => $raw['request_type'] ?? $raw['type'] ?? 'custom',
            'description' => $raw['description'] ?? $raw['subject'] ?? '',
            'guests_count' => $raw['guests_count'] ?? $raw['guest_count'] ?? null,
            'preferred_date' => $raw['preferred_date'] ?? $raw['requested_date'] ?? null,
        ]);
        $request->merge($merged);

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
        ]);

        $created = $this->conciergeService->createRequest($validated);

        return response()->json([
            'data' => [
                'id' => $created->id,
                'request_number' => $created->request_number,
                'status' => $created->status,
                'customer_name' => $created->customer_name,
                'customer_email' => $created->customer_email,
                'created_at' => $created->created_at->toIso8601String(),
            ],
            'message' => 'Thank you! Your VIP Concierge request has been submitted. Our operations desk will review and contact you shortly.',
        ], 201);
    }
}
