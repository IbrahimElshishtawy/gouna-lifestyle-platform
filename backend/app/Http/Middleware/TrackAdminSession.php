<?php

namespace App\Http\Middleware;

use App\Models\AdminSession;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TrackAdminSession
{
    /**
     * Handle an incoming request and track the active admin session duration.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && ($user->is_admin || $user->roles()->exists())) {
            $tokenId = null;
            if (method_exists($user, 'currentAccessToken') && $user->currentAccessToken()) {
                $tokenId = $user->currentAccessToken()->id;
            }

            $session = AdminSession::where('user_id', $user->id)
                ->where('status', 'active')
                ->latest('id')
                ->first();

            $now = now();

            if (! $session) {
                AdminSession::create([
                    'user_id' => $user->id,
                    'token_id' => $tokenId,
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'device' => AdminSession::detectDevice($request->userAgent()),
                    'started_at' => $now,
                    'last_activity_at' => $now,
                    'duration_seconds' => 1,
                    'status' => 'active',
                ]);
            } else {
                // Refresh activity and calculate duration if more than 20 seconds elapsed
                if (! $session->last_activity_at || $now->diffInSeconds($session->last_activity_at) >= 20) {
                    $start = $session->started_at ?? $now;
                    $duration = max(1, (int) $now->diffInSeconds($start));
                    $session->update([
                        'last_activity_at' => $now,
                        'duration_seconds' => $duration,
                        'ip_address' => $request->ip() ?: $session->ip_address,
                    ]);
                }
            }
        }

        return $next($request);
    }
}
