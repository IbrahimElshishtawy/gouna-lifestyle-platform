<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAccountActive
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && ! $user->is_active) {
            $requestId = $request->attributes->get('request_id');

            if ($request->expectsJson() || $request->is('api/*')) {
                return new JsonResponse([
                    'error' => [
                        'code' => 'ACCOUNT_DEACTIVATED',
                        'message' => 'Your account has been deactivated. Please contact support.',
                        'details' => null,
                        'request_id' => $requestId,
                        'timestamp' => now()->toIso8601String(),
                    ],
                ], 403);
            }

            auth()->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('admin.login')->withErrors([
                'email' => 'Your account has been deactivated.',
            ]);
        }

        return $next($request);
    }
}
