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
        $user = $request->user();

        // Placeholder for Phase 4 TOTP state machine
        if ($user && $user->two_factor_confirmed_at) {
            $isVerified = $request->session()->get('2fa_verified', false)
                || $request->attributes->get('2fa_token_verified', false);

            if (! $isVerified && $request->is('admin/*') && ! $request->is('admin/2fa*')) {
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

                // Will be activated when 2FA routes exist in Phase 4
            }
        }

        return $next($request);
    }
}
