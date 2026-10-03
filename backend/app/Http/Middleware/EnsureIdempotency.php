<?php

namespace App\Http\Middleware;

use App\Exceptions\IdempotencyConflictException;
use App\Exceptions\MissingIdempotencyKeyException;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class EnsureIdempotency
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Only enforce on mutation methods
        if (! in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'])) {
            return $next($request);
        }

        $idempotencyKey = $request->header('Idempotency-Key')
            ?? $request->header('idempotency-key')
            ?? $request->header('IDEMPOTENCY_KEY')
            ?? $request->server('HTTP_IDEMPOTENCY_KEY');

        if (! $idempotencyKey) {
            throw new MissingIdempotencyKeyException;
        }

        // Format validation (alphanumeric with hyphens/underscores, 16 to 64 chars)
        if (! preg_match('/^[a-zA-Z0-9\-_]{16,64}$/', $idempotencyKey)) {
            $requestId = $request->attributes->get('request_id');

            return new JsonResponse([
                'error' => [
                    'code' => 'INVALID_IDEMPOTENCY_KEY',
                    'message' => 'Idempotency-Key header must be between 16 and 64 alphanumeric characters, hyphens, or underscores.',
                    'details' => null,
                    'request_id' => $requestId,
                    'timestamp' => now()->toIso8601String(),
                ],
            ], 400);
        }

        $routePath = $request->path();
        $requestHash = hash('sha256', $request->method().'|'.$routePath.'|'.json_encode($request->all()));

        // Lookup existing key
        $existing = DB::table('idempotency_keys')
            ->where('key', $idempotencyKey)
            ->first();

        if ($existing) {
            // Check for payload conflict
            if ($existing->request_hash !== $requestHash) {
                throw new IdempotencyConflictException;
            }

            if ($existing->status === 'completed') {
                $cachedBody = json_decode($existing->response_body, true);
                $cachedHeaders = json_decode($existing->response_headers, true) ?: [];

                return new JsonResponse($cachedBody, $existing->response_code, array_merge($cachedHeaders, [
                    'X-Cache-Lookup' => 'HIT-IDEMPOTENT',
                ]));
            }

            if ($existing->status === 'pending') {
                $requestId = $request->attributes->get('request_id');

                return new JsonResponse([
                    'error' => [
                        'code' => 'REQUEST_IN_FLIGHT',
                        'message' => 'A request with this idempotency key is currently being processed.',
                        'details' => null,
                        'request_id' => $requestId,
                        'timestamp' => now()->toIso8601String(),
                    ],
                ], 409, ['Retry-After' => '2']);
            }
        }

        // Register pending record
        $recordId = DB::table('idempotency_keys')->insertGetId([
            'key' => $idempotencyKey,
            'user_id' => $request->user()?->id,
            'route' => $routePath,
            'request_hash' => $requestHash,
            'status' => 'pending',
            'expires_at' => now()->addHours(24),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        try {
            $response = $next($request);

            if ($response instanceof JsonResponse && $response->getStatusCode() < 500) {
                DB::table('idempotency_keys')->where('id', $recordId)->update([
                    'status' => 'completed',
                    'response_code' => $response->getStatusCode(),
                    'response_body' => $response->getContent(),
                    'response_headers' => json_encode(['X-Idempotent' => 'true']),
                    'updated_at' => now(),
                ]);
            } else {
                DB::table('idempotency_keys')->where('id', $recordId)->delete();
            }

            return $response;
        } catch (\Throwable $e) {
            DB::table('idempotency_keys')->where('id', $recordId)->delete();
            throw $e;
        }
    }
}
