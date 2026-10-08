<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class RoleApiController extends Controller
{
    /**
     * List all roles with permissions count and assigned staff count.
     */
    public function index(Request $request): JsonResponse
    {
        $roles = Role::with(['permissions'])
            ->withCount(['users', 'permissions'])
            ->get()
            ->map(function ($r) {
                return [
                    'id' => $r->id,
                    'name' => $r->name,
                    'display_name' => $r->display_name ?? $r->name,
                    'description' => $r->description,
                    'is_system' => (bool) $r->is_system,
                    'users_count' => $r->users_count,
                    'permissions_count' => $r->permissions_count,
                    'permissions' => $r->permissions->pluck('name'),
                ];
            });

        return response()->json([
            'data' => $roles,
            'meta' => [
                'request_id' => $request->attributes->get('request_id'),
                'timestamp' => now()->toIso8601String(),
            ],
        ]);
    }

    /**
     * Show single role with all assigned permissions and users.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $role = Role::with(['permissions', 'users' => function ($q) {
            $q->select('id', 'name', 'email', 'phone', 'is_active', 'scope');
        }])->findOrFail($id);

        return response()->json([
            'data' => [
                'id' => $role->id,
                'name' => $role->name,
                'display_name' => $role->display_name ?? $role->name,
                'description' => $role->description,
                'is_system' => (bool) $role->is_system,
                'permissions' => $role->permissions->pluck('name'),
                'assigned_users' => $role->users,
            ],
            'meta' => [
                'request_id' => $request->attributes->get('request_id'),
                'timestamp' => now()->toIso8601String(),
            ],
        ]);
    }

    /**
     * Create custom role.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'display_name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'permissions' => ['required', 'array'],
        ]);

        $name = Str::slug($request->input('display_name'), '_');
        if (Role::withTrashed()->where('name', $name)->exists()) {
            $name = $name . '_' . Str::lower(Str::random(6));
        }

        $role = Role::create([
            'name' => $name,
            'display_name' => $request->input('display_name'),
            'description' => $request->input('description'),
            'is_system' => false,
        ]);

        $permissions = Permission::whereIn('name', $request->input('permissions'))->pluck('id');
        $role->permissions()->sync($permissions);

        ActivityLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'role_created',
            'entity_type' => 'Role',
            'entity_id' => $role->id,
            'description' => "Role {$role->display_name} ({$role->name}) created with " . count($permissions) . " permissions.",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'data' => $role->load('permissions'),
            'message' => 'Role created successfully.',
        ], 201);
    }

    /**
     * Update role and its assigned permissions.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $role = Role::findOrFail($id);

        $request->validate([
            'display_name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'permissions' => ['sometimes', 'array'],
        ]);

        if ($request->has('display_name')) {
            $role->display_name = $request->input('display_name');
        }
        if ($request->has('description')) {
            $role->description = $request->input('description');
        }
        $role->save();

        if ($request->has('permissions')) {
            // Cannot strip all permissions from super_admin
            if ($role->name === 'super_admin' && count($request->input('permissions')) === 0) {
                return response()->json([
                    'error' => [
                        'code' => 'INVALID_OPERATION',
                        'message' => 'Cannot strip all permissions from Super Administrator.',
                    ],
                ], 422);
            }

            $permissions = Permission::whereIn('name', $request->input('permissions'))->pluck('id');
            $role->permissions()->sync($permissions);
        }

        ActivityLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'role_updated',
            'entity_type' => 'Role',
            'entity_id' => $role->id,
            'description' => "Role {$role->name} updated.",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'data' => $role->fresh(['permissions']),
            'message' => 'Role updated successfully.',
        ]);
    }

    /**
     * Delete role. System roles and roles with active assigned staff are strictly protected.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $role = Role::withCount('users')->findOrFail($id);

        if ($role->is_system) {
            return response()->json([
                'error' => [
                    'code' => 'SYSTEM_ROLE_PROTECTED',
                    'message' => 'System-defined roles cannot be deleted.',
                ],
            ], 403);
        }

        if ($role->users_count > 0) {
            return response()->json([
                'error' => [
                    'code' => 'ROLE_HAS_ASSIGNED_STAFF',
                    'message' => "Cannot delete role '{$role->display_name}' because it is currently assigned to {$role->users_count} staff member(s). Please reassign staff first.",
                ],
            ], 422);
        }

        $role->permissions()->detach();
        $role->delete();

        ActivityLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'role_deleted',
            'entity_type' => 'Role',
            'entity_id' => $id,
            'description' => "Role {$role->name} deleted.",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Role '{$role->display_name}' deleted successfully.",
        ]);
    }

    /**
     * Get grouped list of all permissions for permission matrix & selection UI.
     */
    public function permissions(Request $request): JsonResponse
    {
        $all = Permission::all();

        $grouped = $all->groupBy('group')->map(function ($items, $group) {
            return [
                'group' => $group,
                'group_label' => ucfirst(str_replace('_', ' ', $group)),
                'permissions' => $items->map(function ($p) {
                    return [
                        'id' => $p->id,
                        'name' => $p->name,
                        'display_name' => $p->display_name,
                        'description' => $p->description,
                    ];
                }),
            ];
        })->values();

        return response()->json([
            'data' => $grouped,
            'flat' => $all->pluck('name'),
        ]);
    }
}
