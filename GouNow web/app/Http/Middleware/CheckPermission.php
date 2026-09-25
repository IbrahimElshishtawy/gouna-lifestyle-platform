<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request with permission requirement.
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = auth()->user();

        if (! $user) {
            return redirect()->guest(route('admin.login'));
        }

        // Super admins have all permissions
        if ($user->is_admin || $user->hasRole('super_admin')) {
            return $next($request);
        }

        if (! $user->hasPermission($permission)) {
            abort(403, "You do not have the required permission [{$permission}] to perform this action.");
        }

        return $next($request);
    }
}
