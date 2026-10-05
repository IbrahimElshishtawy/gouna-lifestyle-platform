<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsApiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $settings = Setting::all()->pluck('value', 'key');

        return response()->json([
            'data' => $settings,
            'meta' => [
                'request_id' => $request->attributes->get('request_id'),
                'timestamp' => now()->toIso8601String(),
            ],
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'settings' => ['required', 'array'],
        ]);

        $settings = $request->input('settings');
        foreach ($settings as $key => $val) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => is_array($val) ? json_encode($val) : (string) $val]
            );
        }

        ActivityLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'settings_updated',
            'entity_type' => 'Setting',
            'description' => 'Platform settings updated.',
            'new_values' => $settings,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Settings updated successfully.',
        ]);
    }

    public function auditLogs(Request $request): JsonResponse
    {
        $query = ActivityLog::with('user')->orderByDesc('created_at');

        if ($action = $request->query('action')) {
            $query->where('action', $action);
        }

        $paginator = $query->paginate(25);

        $items = collect($paginator->items())->map(function ($act) {
            return [
                'id' => $act->id,
                'user_id' => $act->user_id,
                'user_name' => $act->user?->name ?? 'System',
                'action' => $act->action,
                'entity_type' => $act->entity_type,
                'entity_id' => $act->entity_id,
                'description' => $act->description,
                'ip_address' => $act->ip_address,
                'created_at' => $act->created_at ? $act->created_at->toIso8601String() : '',
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
}
