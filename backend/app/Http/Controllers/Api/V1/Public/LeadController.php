<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreLeadRequest;
use App\Models\Lead;
use Illuminate\Http\JsonResponse;

class LeadController extends Controller
{
    /**
     * Store a guest concierge or viewing lead inquiry.
     */
    public function store(StoreLeadRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $lead = Lead::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'message' => $validated['message'],
            'type' => $validated['type'] ?? 'general',
            'property_id' => $validated['property_id'] ?? null,
            'source' => $request->header('User-Agent') ? 'web' : 'api',
            'status' => 'new',
        ]);

        $requestId = $request->attributes->get('request_id');

        return response()->json([
            'data' => [
                'id' => $lead->id,
                'message' => 'Thank you for your inquiry. Our team will contact you shortly.',
            ],
            'meta' => [
                'request_id' => $requestId,
                'timestamp' => now()->toIso8601String(),
            ],
        ], 201);
    }
}
