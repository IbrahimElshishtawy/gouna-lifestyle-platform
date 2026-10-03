<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class RouteInventorySecurityTest extends TestCase
{
    /**
     * Justified exceptions that do not require fine-grained 'can:...' permissions.
     */
    private const ALLOWED_EXCEPTIONS = [
        'admin/login',
        'admin/logout',
        'admin/2fa/challenge',
        'admin/2fa/recovery',
        'admin/2fa/setup',
        'admin/2fa/confirm',
        'admin/2fa/disable',
    ];

    /**
     * Test that every administrative route has explicit authorization middleware.
     */
    public function test_all_admin_routes_possess_explicit_authorization_middleware(): void
    {
        $routes = Route::getRoutes();
        $unprotectedRoutes = [];

        foreach ($routes as $route) {
            $uri = $route->uri();
            $name = $route->getName() ?? '';

            // Check if route is in admin scope
            if (! str_starts_with($uri, 'admin') && ! str_starts_with($name, 'admin.')) {
                continue;
            }

            // Exclude public admin authentication routes
            if (in_array($uri, self::ALLOWED_EXCEPTIONS, true)) {
                continue;
            }

            $middleware = $route->gatherMiddleware();

            // Check for explicit 'can:...' permission middleware
            $hasPermissionMiddleware = false;
            foreach ($middleware as $m) {
                if (is_string($m) && str_starts_with($m, 'can:')) {
                    $hasPermissionMiddleware = true;
                    break;
                }
            }

            if (! $hasPermissionMiddleware) {
                $unprotectedRoutes[] = [
                    'uri' => $uri,
                    'name' => $name,
                    'action' => $route->getActionName(),
                    'middleware' => $middleware,
                ];
            }
        }

        $this->assertEmpty(
            $unprotectedRoutes,
            "Found admin routes lacking explicit 'can:...' authorization middleware:\n".
            json_encode($unprotectedRoutes, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)
        );
    }
}
