<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Services\Payment\WebhookSignatureVerifier;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyWebhookSignature
{
    public function __construct(
        private readonly WebhookSignatureVerifier $verifier
    ) {}

    /**
     * Authenticate incoming payment webhook via cryptographic HMAC signature verification.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $isValid = $this->verifier->verify($request);

        if (! $isValid) {
            $requestId = $request->attributes->get('request_id');

            return new JsonResponse([
                'error' => [
                    'code' => 'INVALID_WEBHOOK_SIGNATURE',
                    'message' => 'Invalid or missing cryptographic webhook signature.',
                    'details' => null,
                    'request_id' => $requestId,
                    'timestamp' => now()->toIso8601String(),
                ],
            ], 401);
        }

        $request->attributes->set('webhook_verified', true);

        return $next($request);
    }
}
