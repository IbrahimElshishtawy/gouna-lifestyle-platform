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
    /**
     * List all staff members with filtering, search, and roles metadata.
     */
    public function index(Request $request): JsonResponse
    {
        $actor = $request->user();
        if (! $actor?->hasRole('super_admin') && ! $actor?->hasPermission('manage_users')) {
            return response()->json([
                'error' => [
                    'code' => 'UNAUTHORIZED_ACCESS',
                    'message' => 'You do not have permission to view staff members.',
                ],
            ], 403);
        }

        $query = User::where('is_admin', true)->with(['roles.permissions'])->orderBy('id', 'asc');

        if ($search = $request->query('q')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($roleName = $request->query('role')) {
            if ($roleName !== 'all') {
                $query->whereHas('roles', function ($rq) use ($roleName) {
                    $rq->where('name', $roleName);
                });
            }
        }

        if ($status = $request->query('status')) {
            if ($status === 'active') {
                $query->where('is_active', true);
            } elseif ($status === 'suspended') {
                $query->where('is_active', false);
            }
        }

        if ($scope = $request->query('scope')) {
            if ($scope !== 'all') {
                $query->where('scope', $scope);
            }
        }

        $staff = $query->with(['roles', 'latestAdminSession'])->get()->map(function ($u) {
            $latest = $u->latestAdminSession;
            $sessionInfo = null;

            if ($latest) {
                $sessionInfo = [
                    'id' => $latest->id,
                    'status' => $latest->status,
                    'is_active' => $latest->status === 'active',
                    'device' => $latest->device ?: \App\Models\AdminSession::detectDevice($latest->user_agent),
                    'ip_address' => $latest->ip_address,
                    'started_at' => $latest->started_at?->toIso8601String(),
                    'last_activity_at' => $latest->last_activity_at?->toIso8601String(),
                    'ended_at' => $latest->ended_at?->toIso8601String(),
                    'duration_seconds' => $latest->calculated_duration_seconds,
                    'duration_formatted_ar' => $latest->duration_formatted_ar,
                    'duration_formatted_en' => $latest->duration_formatted_en,
                ];
            }

            return [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'phone' => $u->phone,
                'avatar' => $u->avatar,
                'locale' => $u->locale ?? 'en',
                'is_admin' => (bool) $u->is_admin,
                'scope' => $u->scope ?? 'all',
                'is_active' => (bool) $u->is_active,
                'status' => $u->is_active ? 'active' : 'suspended',
                'roles' => $u->roles->pluck('name')->values()->all(),
                'role_objects' => $u->roles->map(function ($r) {
                    return [
                        'id' => $r->id,
                        'name' => $r->name,
                        'display_name' => $r->display_name ?? $r->name,
                    ];
                }),
                'two_factor_enabled' => !empty($u->two_factor_confirmed_at),
                'last_login_at' => $u->last_login_at ? $u->last_login_at->toIso8601String() : null,
                'last_login_ip' => $u->last_login_ip,
                'created_at' => $u->created_at ? $u->created_at->toIso8601String() : '',
                'latest_session' => $sessionInfo,
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

    /**
     * Show detailed profile of a single staff member.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $actor = $request->user();
        if ($actor?->id !== $id && ! $actor?->hasRole('super_admin') && ! $actor?->hasPermission('manage_users')) {
            return response()->json([
                'error' => [
                    'code' => 'UNAUTHORIZED_ACCESS',
                    'message' => 'You do not have permission to view this staff member record.',
                ],
            ], 403);
        }

        $user = User::where('is_admin', true)->with(['roles.permissions'])->findOrFail($id);

        $activityLogs = ActivityLog::where('user_id', $user->id)
            ->latest()
            ->take(15)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'action' => $log->action,
                    'entity_type' => $log->entity_type,
                    'description' => $log->description,
                    'ip_address' => $log->ip_address,
                    'created_at' => $log->created_at ? $log->created_at->toIso8601String() : '',
                ];
            });

        return response()->json([
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'avatar' => $user->avatar,
                'is_admin' => (bool) $user->is_admin,
                'scope' => $user->scope ?? 'all',
                'is_active' => (bool) $user->is_active,
                'status' => $user->is_active ? 'active' : 'suspended',
                'roles' => $user->roles->pluck('name')->values()->all(),
                'role_objects' => $user->roles->map(function ($r) {
                    return [
                        'id' => $r->id,
                        'name' => $r->name,
                        'display_name' => $r->display_name ?? $r->name,
                        'permissions' => $r->permissions->pluck('name'),
                    ];
                }),
                'two_factor_enabled' => !empty($user->two_factor_confirmed_at),
                'last_login_at' => $user->last_login_at ? $user->last_login_at->toIso8601String() : null,
                'last_login_ip' => $user->last_login_ip,
                'created_at' => $user->created_at ? $user->created_at->toIso8601String() : '',
                'recent_activity' => $activityLogs,
            ],
            'meta' => [
                'request_id' => $request->attributes->get('request_id'),
                'timestamp' => now()->toIso8601String(),
            ],
        ]);
    }

    /**
     * Create new staff member.
     */
    public function store(Request $request): JsonResponse
    {
        $actor = $request->user();
        if (! $actor?->hasRole('super_admin') && ! $actor?->hasPermission('manage_users')) {
            return response()->json([
                'error' => [
                    'code' => 'UNAUTHORIZED_ACCESS',
                    'message' => 'You do not have permission to create staff accounts.',
                ],
            ], 403);
        }

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'phone' => ['nullable', 'string', 'max:30'],
            'role' => ['required', 'string', 'exists:roles,name'],
            'scope' => ['nullable', 'string', 'in:all,properties,yachts,experiences,events,concierge,finance'],
        ]);

        $requestedRole = $request->input('role');

        // Privilege Escalation Check: only Super Admin can assign super_admin
        if ($requestedRole === 'super_admin' && ! $actor?->hasRole('super_admin')) {
            return response()->json([
                'error' => [
                    'code' => 'PRIVILEGE_ESCALATION_FORBIDDEN',
                    'message' => 'Only Super Administrators can create other Super Administrators.',
                ],
            ], 403);
        }

        // Non-super-admins cannot assign roles they do not possess
        if (! $actor?->hasRole('super_admin') && ! $actor?->hasRole($requestedRole)) {
            return response()->json([
                'error' => [
                    'code' => 'PRIVILEGE_ESCALATION_FORBIDDEN',
                    'message' => 'You cannot assign a role that you do not possess.',
                ],
            ], 403);
        }

        $user = User::create([
            'name' => $request->input('name'),
            'email' => strtolower($request->input('email')),
            'password' => Hash::make($request->input('password')),
            'phone' => $request->input('phone'),
            'is_admin' => true,
            'scope' => $request->input('scope', 'all'),
            'is_active' => true,
            'locale' => 'en',
            'email_verified_at' => now(),
        ]);

        $role = Role::where('name', $requestedRole)->firstOrFail();
        $user->roles()->sync([$role->id]);

        ActivityLog::create([
            'user_id' => $actor?->id,
            'action' => 'staff_created',
            'entity_type' => 'User',
            'entity_id' => $user->id,
            'description' => "Admin staff {$user->name} ({$user->email}) created with role {$role->name} (Scope: {$user->scope}).",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $role->name,
                'scope' => $user->scope,
            ],
            'message' => 'Staff account created successfully.',
        ], 201);
    }

    /**
     * Update existing staff profile.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $actor = $request->user();
        if ($actor?->id !== $id && ! $actor?->hasRole('super_admin') && ! $actor?->hasPermission('manage_users')) {
            return response()->json([
                'error' => [
                    'code' => 'UNAUTHORIZED_ACCESS',
                    'message' => 'You do not have permission to update this staff member.',
                ],
            ], 403);
        }

        $user = User::findOrFail($id);

        if ($actor?->id === $id && ! $actor?->hasRole('super_admin')) {
            if ($request->has('role') || $request->has('scope') || $request->has('is_active')) {
                return response()->json([
                    'error' => [
                        'code' => 'SELF_ESCALATION_FORBIDDEN',
                        'message' => 'You cannot modify your own administrative role, scope, or activation status.',
                    ],
                ], 403);
            }
        }

        $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'is_active' => ['sometimes', 'boolean'],
            'role' => ['sometimes', 'string', 'exists:roles,name'],
            'scope' => ['nullable', 'string', 'in:all,properties,yachts,experiences,events,concierge,finance'],
        ]);

        if ($request->has('role')) {
            $newRole = $request->input('role');
            // Protect Super Admin assignment
            if ($newRole === 'super_admin' && ! $actor?->hasRole('super_admin')) {
                return response()->json([
                    'error' => [
                        'code' => 'PRIVILEGE_ESCALATION_FORBIDDEN',
                        'message' => 'Only Super Administrators can assign the Super Administrator role.',
                    ],
                ], 403);
            }

            // Non-super-admins cannot assign roles they do not possess
            if (! $actor?->hasRole('super_admin') && ! $actor?->hasRole($newRole)) {
                return response()->json([
                    'error' => [
                        'code' => 'PRIVILEGE_ESCALATION_FORBIDDEN',
                        'message' => 'You cannot assign a role that you do not possess.',
                    ],
                ], 403);
            }

            // Protect last Super Admin demotion
            if ($user->hasRole('super_admin') && $newRole !== 'super_admin') {
                $superAdminCount = User::whereHas('roles', fn($rq) => $rq->where('name', 'super_admin'))->count();
                if ($superAdminCount <= 1) {
                    return response()->json([
                        'error' => [
                            'code' => 'LAST_SUPER_ADMIN_PROTECTED',
                            'message' => 'Cannot remove the last active Super Administrator role.',
                        ],
                    ], 403);
                }
            }

            $role = Role::where('name', $newRole)->first();
            if ($role) {
                $user->roles()->sync([$role->id]);
            }
        }

        if ($request->has('name')) $user->name = $request->input('name');
        if ($request->has('phone')) $user->phone = $request->input('phone');
        if ($request->has('scope')) $user->scope = $request->input('scope');
        if ($request->has('is_active')) $user->is_active = $request->boolean('is_active');
        $user->save();

        ActivityLog::create([
            'user_id' => $actor?->id,
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
                'scope' => $user->scope,
                'is_active' => $user->is_active,
            ],
            'message' => 'Staff updated successfully.',
        ]);
    }

    /**
     * Suspend staff account and revoke active tokens.
     */
    public function suspend(Request $request, int $id): JsonResponse
    {
        $actor = $request->user();
        if (! $actor?->hasRole('super_admin') && ! $actor?->hasPermission('manage_users')) {
            return response()->json([
                'error' => [
                    'code' => 'UNAUTHORIZED_ACCESS',
                    'message' => 'You do not have permission to suspend staff accounts.',
                ],
            ], 403);
        }

        $user = User::findOrFail($id);

        if ($user->id === $actor?->id) {
            return response()->json([
                'error' => [
                    'code' => 'SELF_SUSPENSION_FORBIDDEN',
                    'message' => 'You cannot suspend your own administrative account.',
                ],
            ], 403);
        }

        if ($user->hasRole('super_admin') && ! $actor?->hasRole('super_admin')) {
            return response()->json([
                'error' => [
                    'code' => 'PRIVILEGE_ESCALATION_FORBIDDEN',
                    'message' => 'Only Super Administrators can suspend another Super Administrator.',
                ],
            ], 403);
        }

        if ($user->hasRole('super_admin')) {
            $activeSuperAdmins = User::where('is_active', true)
                ->whereHas('roles', fn($q) => $q->where('name', 'super_admin'))
                ->count();
            if ($activeSuperAdmins <= 1) {
                return response()->json([
                    'error' => [
                        'code' => 'LAST_SUPER_ADMIN_PROTECTED',
                        'message' => 'Cannot suspend the last active Super Administrator account.',
                    ],
                ], 403);
            }
        }

        $user->is_active = false;
        $user->save();
        $user->tokens()->delete();

        ActivityLog::create([
            'user_id' => $actor?->id,
            'action' => 'staff_suspended',
            'entity_type' => 'User',
            'entity_id' => $user->id,
            'description' => "Staff {$user->name} ({$user->email}) suspended and active sessions invalidated.",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'data' => ['id' => $user->id, 'is_active' => false, 'status' => 'suspended'],
            'message' => "Staff member {$user->name} suspended.",
        ]);
    }

    /**
     * Reactivate a suspended staff account.
     */
    public function reactivate(Request $request, int $id): JsonResponse
    {
        $actor = $request->user();
        if (! $actor?->hasRole('super_admin') && ! $actor?->hasPermission('manage_users')) {
            return response()->json([
                'error' => [
                    'code' => 'UNAUTHORIZED_ACCESS',
                    'message' => 'You do not have permission to reactivate staff accounts.',
                ],
            ], 403);
        }

        $user = User::findOrFail($id);

        $user->is_active = true;
        $user->save();

        ActivityLog::create([
            'user_id' => $actor?->id,
            'action' => 'staff_reactivated',
            'entity_type' => 'User',
            'entity_id' => $user->id,
            'description' => "Staff {$user->name} ({$user->email}) reactivated.",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'data' => ['id' => $user->id, 'is_active' => true, 'status' => 'active'],
            'message' => "Staff member {$user->name} reactivated successfully.",
        ]);
    }

    /**
     * Invalidate all session tokens (Force Logout).
     */
    public function forceLogout(Request $request, int $id): JsonResponse
    {
        $actor = $request->user();
        if (! $actor?->hasRole('super_admin') && ! $actor?->hasPermission('manage_users')) {
            return response()->json([
                'error' => [
                    'code' => 'UNAUTHORIZED_ACCESS',
                    'message' => 'You do not have permission to force logout staff members.',
                ],
            ], 403);
        }

        $user = User::findOrFail($id);

        $activeSessions = \App\Models\AdminSession::where('user_id', $user->id)
            ->where('status', 'active')
            ->get();

        foreach ($activeSessions as $s) {
            $s->terminate('force_logout_by_superadmin', $actor?->id);
        }

        $user->tokens()->delete();

        ActivityLog::create([
            'user_id' => $actor?->id,
            'action' => 'staff_force_logout',
            'entity_type' => 'User',
            'entity_id' => $user->id,
            'description' => "Active tokens and sessions revoked for {$user->name}.",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "All active sessions revoked for {$user->name}.",
        ]);
    }

    /**
     * Soft-delete staff member.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $actor = $request->user();
        if (! $actor?->hasRole('super_admin') && ! $actor?->hasPermission('manage_users')) {
            return response()->json([
                'error' => [
                    'code' => 'UNAUTHORIZED_ACCESS',
                    'message' => 'You do not have permission to delete staff members.',
                ],
            ], 403);
        }

        $user = User::findOrFail($id);

        if ($user->id === $actor?->id || $user->email === 'superadmin@gounow.com') {
            return response()->json([
                'error' => [
                    'code' => 'FORBIDDEN_OPERATION',
                    'message' => 'Cannot delete the primary super administrator account or your own active account.',
                ],
            ], 403);
        }

        if ($user->hasRole('super_admin')) {
            $superAdminCount = User::whereHas('roles', fn($rq) => $rq->where('name', 'super_admin'))->count();
            if ($superAdminCount <= 1) {
                return response()->json([
                    'error' => [
                        'code' => 'LAST_SUPER_ADMIN_PROTECTED',
                        'message' => 'Cannot delete the last Super Administrator.',
                    ],
                ], 403);
            }
        }

        $user->tokens()->delete();
        $user->delete();

        ActivityLog::create([
            'user_id' => $actor?->id,
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

    /**
     * List all admin staff sessions with calculated duration (Super Admin).
     */
    public function sessions(Request $request): JsonResponse
    {
        $actor = $request->user();
        if (! $actor?->hasRole('super_admin') && ! $actor?->hasPermission('manage_users') && ! $actor?->is_admin) {
            return response()->json([
                'error' => [
                    'code' => 'UNAUTHORIZED_ACCESS',
                    'message' => 'You do not have permission to view staff sessions.',
                ],
            ], 403);
        }

        $query = \App\Models\AdminSession::with('user');

        if ($userId = $request->query('user_id')) {
            $query->where('user_id', $userId);
        }

        if ($status = $request->query('status')) {
            if ($status !== 'all') {
                $query->where('status', $status);
            }
        }

        if ($search = $request->query('search')) {
            $query->where(function ($sub) use ($search) {
                $sub->whereHas('user', function ($uq) use ($search) {
                    $uq->where('name', 'like', "%{$search}%")
                       ->orWhere('email', 'like', "%{$search}%");
                })->orWhere('ip_address', 'like', "%{$search}%")
                  ->orWhere('device', 'like', "%{$search}%");
            });
        }

        $sessions = $query->orderByDesc('id')->paginate(30);

        $mapped = $sessions->getCollection()->map(function ($s) use ($actor) {
            return [
                'id' => $s->id,
                'user_id' => $s->user_id,
                'user_name' => $s->user?->name ?? 'Unknown Staff',
                'user_email' => $s->user?->email ?? '',
                'user_avatar' => $s->user?->avatar,
                'user_scope' => $s->user?->scope ?? 'all',
                'token_id' => $s->token_id,
                'ip_address' => $s->ip_address,
                'device' => $s->device ?: \App\Models\AdminSession::detectDevice($s->user_agent),
                'started_at' => $s->started_at?->toIso8601String(),
                'last_activity_at' => $s->last_activity_at?->toIso8601String(),
                'ended_at' => $s->ended_at?->toIso8601String(),
                'duration_seconds' => $s->calculated_duration_seconds,
                'duration_formatted_ar' => $s->duration_formatted_ar,
                'duration_formatted_en' => $s->duration_formatted_en,
                'status' => $s->status,
                'is_active' => $s->status === 'active',
                'is_current' => $s->user_id === $actor?->id && $s->status === 'active',
                'termination_reason' => $s->termination_reason,
            ];
        });

        $activeCount = \App\Models\AdminSession::where('status', 'active')->count();
        $todayTotalSeconds = (int) \App\Models\AdminSession::whereDate('started_at', today())->sum('duration_seconds');

        return response()->json([
            'data' => $mapped,
            'summary' => [
                'active_sessions_count' => $activeCount,
                'total_sessions_count' => \App\Models\AdminSession::count(),
                'today_total_seconds' => $todayTotalSeconds,
                'today_total_formatted_ar' => \App\Models\AdminSession::formatSeconds($todayTotalSeconds, 'ar'),
                'today_total_formatted_en' => \App\Models\AdminSession::formatSeconds($todayTotalSeconds, 'en'),
            ],
            'meta' => [
                'current_page' => $sessions->currentPage(),
                'last_page' => $sessions->lastPage(),
                'total' => $sessions->total(),
            ],
        ]);
    }

    /**
     * Terminate a specific live admin session (Super Admin action).
     */
    public function terminateSession(Request $request, int $sessionId): JsonResponse
    {
        $actor = $request->user();
        if (! $actor?->hasRole('super_admin') && ! $actor?->hasPermission('manage_users') && ! $actor?->is_admin) {
            return response()->json([
                'error' => [
                    'code' => 'UNAUTHORIZED_ACCESS',
                    'message' => 'You do not have permission to terminate staff sessions.',
                ],
            ], 403);
        }

        $session = \App\Models\AdminSession::with('user')->findOrFail($sessionId);

        $session->terminate('force_logout_by_superadmin', $actor?->id);

        if ($session->token_id && $session->user) {
            $session->user->tokens()->where('id', $session->token_id)->delete();
        }

        ActivityLog::create([
            'user_id' => $actor?->id,
            'action' => 'staff_session_terminated',
            'entity_type' => 'AdminSession',
            'entity_id' => $session->id,
            'description' => "Super Admin {$actor?->name} terminated session #{$session->id} for {$session->user?->name}. Session lasted {$session->duration_formatted_en}.",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "تم إنهاء الجلسة بنجاح. مدة الجلسة المسجلة: {$session->duration_formatted_ar}.",
            'data' => [
                'session_id' => $session->id,
                'duration_seconds' => $session->duration_seconds,
                'duration_formatted_ar' => $session->duration_formatted_ar,
                'duration_formatted_en' => $session->duration_formatted_en,
            ],
        ]);
    }
}
