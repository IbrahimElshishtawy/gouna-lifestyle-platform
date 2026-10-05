<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Lead;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ConciergeApiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Lead::with(['customer', 'assignedTo'])->orderByDesc('created_at');

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($type = $request->query('type')) {
            $query->where('type', $type);
        }

        $paginator = $query->paginate(15);

        $items = collect($paginator->items())->map(function ($l) {
            return [
                'id' => $l->id,
                'name' => $l->name,
                'email' => $l->email,
                'phone' => $l->phone,
                'type' => $l->type ?? 'concierge',
                'source' => $l->source,
                'message' => $l->message,
                'status' => $l->status ?? 'new',
                'assigned_to' => $l->assignedTo ? [
                    'id' => $l->assignedTo->id,
                    'name' => $l->assignedTo->name,
                ] : null,
                'admin_notes' => $l->admin_notes,
                'created_at' => $l->created_at ? $l->created_at->toIso8601String() : '',
                'updated_at' => $l->updated_at ? $l->updated_at->toIso8601String() : '',
            ];
        });

        return response()->json([
            'data' => $items,
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

    public function update(Request $request, int $id): JsonResponse
    {
        $lead = Lead::findOrFail($id);

        $request->validate([
            'status' => ['sometimes', 'string', 'in:new,contacted,in_progress,converted,closed'],
            'admin_notes' => ['nullable', 'string'],
        ]);

        if ($request->has('status')) $lead->status = $request->input('status');
        if ($request->has('admin_notes')) $lead->admin_notes = $request->input('admin_notes');
        $lead->save();

        ActivityLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'concierge_lead_updated',
            'entity_type' => 'Lead',
            'entity_id' => $lead->id,
            'description' => "Concierge lead #{$lead->id} updated (Status: {$lead->status}).",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'data' => [
                'id' => $lead->id,
                'status' => $lead->status,
                'admin_notes' => $lead->admin_notes,
            ],
            'message' => 'Concierge request updated successfully.',
        ]);
    }

    public function assign(Request $request, int $id): JsonResponse
    {
        $lead = Lead::findOrFail($id);

        $request->validate([
            'user_id' => ['required', 'exists:users,id'],
        ]);

        $assignee = User::findOrFail($request->input('user_id'));
        $lead->assigned_to = $assignee->id;
        $lead->status = 'in_progress';
        $lead->save();

        ActivityLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'concierge_lead_assigned',
            'entity_type' => 'Lead',
            'entity_id' => $lead->id,
            'description' => "Concierge lead #{$lead->id} assigned to {$assignee->name}.",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'data' => [
                'id' => $lead->id,
                'assigned_to' => [
                    'id' => $assignee->id,
                    'name' => $assignee->name,
                ],
                'status' => $lead->status,
            ],
            'message' => "Lead assigned to {$assignee->name}.",
        ]);
    }
}
