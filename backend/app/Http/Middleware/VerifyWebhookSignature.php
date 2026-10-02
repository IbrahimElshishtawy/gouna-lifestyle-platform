<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyWebhookSignature
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Placeholder for Phase 6 webhook HMAC cryptographic verification
        $signature = $request->header('X-Webhook-Signature') ?? $request->header('X-Paymob-Signature');

        // Allow simulated or sandbox testing in development
        if (app()->environment('testing', 'local') && ! $signature) {
            return $next($request);
        }

        if (! $signature && ! app()->environment('testing', 'local')) {
            $requestId = $request->attributes->get('request_id');

            return new JsonResponse([
                'error' => [
                    'code' => 'INVALID_WEBHOOK_SIGNATURE',
                    'message' => 'Missing cryptographic webhook signature.',
                    'details' => null,
                    'request_id' => $requestId,
                    'timestamp' => now()->toIso8601String(),
                ],
            ], 401);
        }

        return $next($request);
    }
}
