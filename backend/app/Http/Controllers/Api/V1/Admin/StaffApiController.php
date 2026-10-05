<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class StaffApiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $staff = User::where('is_admin', true)
            ->with(['roles.permissions'])
            ->orderBy('id', 'asc')
            ->get()
            ->map(function ($u) {
                return [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'phone' => $u->phone,
                    'locale' => $u->locale ?? 'en',
                    'is_admin' => (bool) $u->is_admin,
                    'is_active' => (bool) $u->is_active,
                    'roles' => $u->roles->pluck('name'),
                    'two_factor_enabled' => ! empty($u->two_factor_confirmed_at),
                    'last_login_at' => $u->last_login_at ? $u->last_login_at->toIso8601String() : null,
                    'last_login_ip' => $u->last_login_ip,
                    'created_at' => $u->created_at ? $u->created_at->toIso8601String() : '',
                ];
            });

        $roles = Role::withCount('permissions')->get()->map(function ($r) {
            return [
                'id' => $r->id,
                'name' => $r->name,
                'display_name' => $r->display_name ?? $r->name,
                'description' => $r->description,
                'is_system' => (bool) $r->is_system,
                'permissions_count' => $r->permissions_count,
            ];
        });

        return response()->json([
            'data' => [
                'staff' => $staff,
                'roles' => $roles,
            ],
            'meta' => [
                'request_id' => $request->attributes->get('request_id'),
                'timestamp' => now()->toIso8601String(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'phone' => ['nullable', 'string', 'max:30'],
            'role' => ['required', 'string', 'exists:roles,name'],
        ]);

        $user = User::create([
            'name' => $request->input('name'),
            'email' => strtolower($request->input('email')),
            'password' => Hash::make($request->input('password')),
            'phone' => $request->input('phone'),
            'is_admin' => true,
            'is_active' => true,
            'locale' => 'en',
            'email_verified_at' => now(),
        ]);

        $role = Role::where('name', $request->input('role'))->firstOrFail();
        $user->roles()->sync([$role->id]);

        ActivityLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'staff_created',
            'entity_type' => 'User',
            'entity_id' => $user->id,
            'description' => "Admin staff {$user->name} ({$user->email}) created with role {$role->name}.",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $role->name,
            ],
            'message' => 'Staff account created successfully.',
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'is_active' => ['sometimes', 'boolean'],
            'role' => ['sometimes', 'string', 'exists:roles,name'],
        ]);

        if ($request->has('name')) $user->name = $request->input('name');
        if ($request->has('phone')) $user->phone = $request->input('phone');
        if ($request->has('is_active')) $user->is_active = $request->boolean('is_active');
        $user->save();

        if ($request->has('role')) {
            $role = Role::where('name', $request->input('role'))->first();
            if ($role) {
                $user->roles()->sync([$role->id]);
            }
        }

        ActivityLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'staff_updated',
            'entity_type' => 'User',
            'entity_id' => $user->id,
            'description' => "Admin staff {$user->email} updated.",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'is_active' => $user->is_active,
            ],
            'message' => 'Staff updated successfully.',
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        // Security check: cannot delete self or superadmin@gounow.com
        if ($user->id === $request->user()?->id || $user->email === 'superadmin@gounow.com') {
            return response()->json([
                'error' => [
                    'code' => 'FORBIDDEN_OPERATION',
                    'message' => 'Cannot delete the primary super administrator account or your own active account.',
                ],
            ], 403);
        }

        $user->tokens()->delete();
        $user->delete();

        ActivityLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'staff_deleted',
            'entity_type' => 'User',
            'entity_id' => $id,
            'description' => "Admin staff {$user->email} deleted.",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Staff member deleted successfully.',
        ]);
    }
}
