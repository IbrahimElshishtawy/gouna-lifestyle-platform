<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ForceJsonResponse
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Enforce application/json for all API routes
        $request->headers->set('Accept', 'application/json');

        $response = $next($request);

        // Guard against inadvertent redirects (e.g. from auth or validation) on API routes
        if ($response instanceof RedirectResponse) {
            $requestId = $request->attributes->get('request_id');

            return new JsonResponse([
                'error' => [
                    'code' => 'UNAUTHENTICATED',
                    'message' => 'Unauthenticated or action redirected.',
                    'details' => [
                        'target_url' => $response->getTargetUrl(),
                    ],
                    'request_id' => $requestId,
                    'timestamp' => now()->toIso8601String(),
                ],
            ], 401);
        }

        return $response;
    }
}
