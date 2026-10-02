<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Context;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class AssignRequestId
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $incomingId = $request->header('X-Request-ID');

        // Accept client-provided ID if it matches UUID format, otherwise generate a secure UUID v4
        $requestId = ($incomingId && Str::isUuid($incomingId))
            ? $incomingId
            : Str::uuid()->toString();

        $request->attributes->set('request_id', $requestId);

        if (class_exists(Context::class)) {
            Context::add('request_id', $requestId);
        }

        $response = $next($request);

        $response->headers->set('X-Request-ID', $requestId);

        return $response;
    }
}
