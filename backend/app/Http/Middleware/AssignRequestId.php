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

        // Accept client-provided ID if safe (alphanumeric/hyphen/underscore up to 64 chars), otherwise generate UUID v4
        $requestId = ($incomingId && preg_match('/^[a-zA-Z0-9\-_]{8,64}$/', $incomingId))
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
