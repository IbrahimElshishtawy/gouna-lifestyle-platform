<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTwoFactorVerified
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user() ?: auth('sanctum')->user() ?: auth()->user();

        if (! $user) {
            return $next($request);
        }

        // Whitelisted 2FA routes and session termination
        if ($request->is('admin/2fa*') || $request->is('api/v1/auth/2fa*') || $request->is('admin/logout') || $request->is('api/v1/auth/logout')) {
            return $next($request);
        }

        // 1. User has 2FA confirmed: must have verified 2FA for the current session/token
        if ($user->hasTwoFactorEnabled()) {
            $isVerified = false;

            if ($request->hasSession()) {
                $isVerified = (bool) $request->session()->get('2fa_verified', false);
            }

            $token = $user->currentAccessToken();
            if ($token) {
                $isVerified = $token->can('2fa:verified') || (bool) $request->attributes->get('2fa_token_verified', false);
            }

            if (! $isVerified) {
                if ($request->expectsJson() || $request->is('api/*')) {
                    $requestId = $request->attributes->get('request_id');

                    return new JsonResponse([
                        'error' => [
                            'code' => 'TWO_FACTOR_REQUIRED',
                            'message' => 'Two-factor authentication verification required.',
                            'details' => null,
                            'request_id' => $requestId,
                            'timestamp' => now()->toIso8601String(),
                        ],
                    ], 403);
                }

                return redirect()->route('admin.2fa.challenge');
            }
        }

        // 2. User role requires 2FA setup (Grace setup flow)
        if (config('auth.enforce_2fa_setup', false) && $user->requiresTwoFactor() && ! $user->hasTwoFactorEnabled()) {
            if ($request->expectsJson() || $request->is('api/*')) {
                $requestId = $request->attributes->get('request_id');

                return new JsonResponse([
                    'error' => [
                        'code' => 'TWO_FACTOR_SETUP_REQUIRED',
                        'message' => 'Two-factor authentication setup is mandatory for your role.',
                        'details' => null,
                        'request_id' => $requestId,
                        'timestamp' => now()->toIso8601String(),
                    ],
                ], 403);
            }

            return redirect()->route('admin.2fa.setup');
        }

        return $next($request);
    }
}
