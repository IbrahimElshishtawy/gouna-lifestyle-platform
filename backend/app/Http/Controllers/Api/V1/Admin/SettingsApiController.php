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
        $actor = $request->user();
        if (! $actor?->hasRole('super_admin') && ! $actor?->hasPermission('manage_settings')) {
            return response()->json([
                'error' => [
                    'code' => 'UNAUTHORIZED_ACCESS',
                    'message' => 'You do not have permission to view platform settings.',
                ],
            ], 403);
        }

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
        $actor = $request->user();
        if (! $actor?->hasRole('super_admin') && ! $actor?->hasPermission('manage_settings')) {
            return response()->json([
                'error' => [
                    'code' => 'UNAUTHORIZED_ACCESS',
                    'message' => 'You do not have permission to modify platform settings.',
                ],
            ], 403);
        }

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
        $actor = $request->user();
        if (! $actor?->hasRole('super_admin') && ! $actor?->hasPermission('view_audit_logs')) {
            return response()->json([
                'error' => [
                    'code' => 'UNAUTHORIZED_ACCESS',
                    'message' => 'You do not have permission to view activity and audit logs.',
                ],
            ], 403);
        }

        $query = ActivityLog::with('user')->orderByDesc('created_at');

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('action', 'like', "%{$search}%")
                  ->orWhere('entity_type', 'like', "%{$search}%");
            });
        }

        if ($action = $request->query('action')) {
            $query->where('action', $action);
        }

        if ($userId = $request->query('user_id')) {
            $query->where('user_id', $userId);
        }

        if ($entityType = $request->query('entity_type')) {
            $query->where('entity_type', $entityType);
        }

        if ($from = $request->query('from')) {
            $query->whereDate('created_at', '>=', $from);
        }

        if ($to = $request->query('to')) {
            $query->whereDate('created_at', '<=', $to);
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
