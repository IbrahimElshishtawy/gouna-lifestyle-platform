<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdmin
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! auth()->check()) {
            if ($request->expectsJson() || $request->is('api/*')) {
                abort(401, 'Unauthenticated.');
            }

            return redirect()->guest(route('admin.login'));
        }

        $user = auth()->user();

        // Check if user is marked as admin or has any assigned role
        if (! $user->is_admin && ! $user->roles()->exists()) {
            if ($request->hasSession()) {
                if (method_exists(auth()->guard(), 'logout')) {
                    auth()->logout();
                }
                $request->session()->invalidate();
                $request->session()->regenerateToken();
            }

            abort(403, 'Unauthorized access. Admin privileges required.');
        }

        if (! $user->is_active) {
            if ($request->hasSession()) {
                if (method_exists(auth()->guard(), 'logout')) {
                    auth()->logout();
                }
                $request->session()->invalidate();
                $request->session()->regenerateToken();
            }

            if ($request->expectsJson() || $request->is('api/*')) {
                abort(403, 'Your administrator account has been deactivated.');
            }

            return redirect()->route('admin.login')->withErrors([
                'email' => 'Your administrator account has been deactivated. Please contact the super admin.',
            ]);
        }

        return $next($request);
    }
}
