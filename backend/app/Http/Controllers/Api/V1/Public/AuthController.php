<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Auth\PermissionResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Authenticate user via SPA session cookie or personal access token (ADR-003).
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'remember' => ['nullable', 'boolean'],
            'device_name' => ['nullable', 'string', 'max:100'],
        ]);

        $throttleKey = $request->ip().'|'.strtolower((string) $request->input('email'));

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);

            return response()->json([
                'error' => [
                    'code' => 'RATE_LIMIT_EXCEEDED',
                    'message' => 'Too many login attempts. Please try again later.',
                    'details' => ['retry_after' => $seconds],
                    'request_id' => $request->attributes->get('request_id'),
                    'timestamp' => now()->toIso8601String(),
                ],
            ], 429, ['Retry-After' => (string) $seconds]);
        }

        $credentials = $request->only('email', 'password');
        $remember = (bool) $request->input('remember', false);

        if (! Auth::attempt($credentials, $remember)) {
            RateLimiter::hit($throttleKey, 60);

            throw ValidationException::withMessages([
                'email' => ['Invalid email or password.'],
            ]);
        }

        RateLimiter::clear($throttleKey);

        /** @var User $user */
        $user = Auth::user();

        if (! $user->is_active) {
            Auth::logout();

            return response()->json([
                'error' => [
                    'code' => 'ACCOUNT_DEACTIVATED',
                    'message' => 'Your account has been deactivated.',
                    'details' => null,
                    'request_id' => $request->attributes->get('request_id'),
                    'timestamp' => now()->toIso8601String(),
                ],
            ], 403);
        }

        // Determine if token issuance is requested or SPA cookie session
        $wantsToken = $request->boolean('token') || $request->header('X-Auth-Mode') === 'token';
        $token = null;

        if ($wantsToken) {
            $deviceName = $request->input('device_name', 'NextJs-Client');
            $token = $user->createToken($deviceName)->plainTextToken;
        } else {
            $request->session()->regenerate();
        }

        $requestId = $request->attributes->get('request_id');

        return response()->json([
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'is_admin' => (bool) $user->is_admin,
                    'roles' => $user->roles->pluck('name'),
                ],
                'token' => $token,
                'token_type' => $token ? 'Bearer' : null,
            ],
            'meta' => [
                'request_id' => $requestId,
                'timestamp' => now()->toIso8601String(),
            ],
        ]);
    }

    /**
     * Terminate the authenticated session or revoke current token.
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user) {
            if ($user->currentAccessToken()) {
                $user->currentAccessToken()->delete();
            }

            if ($request->hasSession()) {
                Auth::guard('web')->logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();
            }
        }

        $requestId = $request->attributes->get('request_id');

        return response()->json([
            'data' => [
                'message' => 'Successfully logged out.',
            ],
            'meta' => [
                'request_id' => $requestId,
                'timestamp' => now()->toIso8601String(),
            ],
        ]);
    }

    /**
     * Retrieve the authenticated user's profile and UI permission abilities.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'error' => [
                    'code' => 'UNAUTHENTICATED',
                    'message' => 'Unauthenticated.',
                    'details' => null,
                    'request_id' => $request->attributes->get('request_id'),
                    'timestamp' => now()->toIso8601String(),
                ],
            ], 401);
        }

        $resolver = app(PermissionResolver::class);
        $resolved = $resolver->resolvePermissions($user);
        $abilities = isset($resolved['*']) && $resolved['*'] === true
            ? ['*']
            : array_values(array_keys(array_filter($resolved)));

        $requestId = $request->attributes->get('request_id');

        return response()->json([
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'avatar' => $user->avatar,
                'locale' => $user->locale ?: 'en',
                'is_admin' => (bool) $user->is_admin,
                'roles' => $user->roles->pluck('name'),
                'abilities' => $abilities,
            ],
            'meta' => [
                'request_id' => $requestId,
                'timestamp' => now()->toIso8601String(),
            ],
        ]);
    }

    /**
     * Retrieve permission abilities and query scopes for frontend UI (P3-T11).
     */
    public function abilities(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'error' => [
                    'code' => 'UNAUTHENTICATED',
                    'message' => 'Unauthenticated.',
                    'details' => null,
                    'request_id' => $request->attributes->get('request_id'),
                    'timestamp' => now()->toIso8601String(),
                ],
            ], 401);
        }

        $roles = $user->roles->pluck('name')->toArray();
        $isSuperAdmin = (bool) ($user->is_admin || in_array('super_admin', $roles, true));

        if ($isSuperAdmin) {
            $permissions = ['*'];
            $scopes = [
                'properties' => 'all',
                'bookings' => 'all',
                'payments' => 'all',
                'customers' => 'all',
                'events' => 'all',
                'experiences' => 'all',
                'reports' => 'all',
            ];
        } else {
            $resolver = app(PermissionResolver::class);
            $resolved = $resolver->resolvePermissions($user);
            $permissions = array_values(array_keys(array_filter($resolved)));

            $scopes = [
                'properties' => in_array('property_manager', $roles, true) ? 'all' : (in_array('sales', $roles, true) ? 'assigned' : 'none'),
                'bookings' => in_array('finance', $roles, true) || in_array('property_manager', $roles, true) ? 'all' : (in_array('staff', $roles, true) ? 'assigned' : 'none'),
                'payments' => in_array('finance', $roles, true) ? 'all' : 'none',
                'customers' => in_array('property_manager', $roles, true) ? 'all' : (in_array('sales', $roles, true) ? 'assigned' : 'none'),
                'events' => in_array('events_manager', $roles, true) ? 'all' : 'none',
                'experiences' => in_array('events_manager', $roles, true) ? 'all' : 'none',
                'reports' => in_array('finance', $roles, true) ? 'all' : 'none',
            ];
        }

        return response()->json([
            'data' => [
                'roles' => $roles,
                'permissions' => $permissions,
                'scopes' => $scopes,
                'is_admin' => $isSuperAdmin,
            ],
            'meta' => [
                'request_id' => $request->attributes->get('request_id'),
                'timestamp' => now()->toIso8601String(),
            ],
        ]);
    }
}
