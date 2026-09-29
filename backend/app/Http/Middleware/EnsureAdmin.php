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
            return redirect()->guest(route('admin.login'));
        }

        $user = auth()->user();

        // Check if user is marked as admin or has any assigned role
        if (! $user->is_admin && ! $user->roles()->exists()) {
            auth()->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            abort(403, 'Unauthorized access. Admin privileges required.');
        }

        if (! $user->is_active) {
            auth()->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('admin.login')->withErrors([
                'email' => 'Your administrator account has been deactivated. Please contact the super admin.',
            ]);
        }

        return $next($request);
    }
}
