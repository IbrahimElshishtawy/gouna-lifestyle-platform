<?php

use App\Exceptions\DomainException;
use App\Http\Middleware\AssignRequestId;
use App\Http\Middleware\CheckPermission;
use App\Http\Middleware\EnsureAccountActive;
use App\Http\Middleware\EnsureAdmin;
use App\Http\Middleware\EnsureIdempotency;
use App\Http\Middleware\EnsureTwoFactorVerified;
use App\Http\Middleware\ForceJsonResponse;
use App\Http\Middleware\SetLocale;
use App\Http\Middleware\VerifyWebhookSignature;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\Middleware\HandleCors;
use Illuminate\Http\Middleware\TrustProxies;
use Illuminate\Http\Request;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            SetLocale::class,
        ]);

        $middleware->api(prepend: [
            AssignRequestId::class,
            ForceJsonResponse::class,
        ]);

        $middleware->api(append: [
            EnsureAccountActive::class,
        ]);

        $middleware->alias([
            'request.id' => AssignRequestId::class,
            'force.json' => ForceJsonResponse::class,
            'account.active' => EnsureAccountActive::class,
            'idempotent' => EnsureIdempotency::class,
            '2fa' => EnsureTwoFactorVerified::class,
            'webhook.signature' => VerifyWebhookSignature::class,
            'admin' => EnsureAdmin::class,
            'permission' => CheckPermission::class,
            'locale' => SetLocale::class,
        ]);

        $middleware->priority([
            AssignRequestId::class,
            TrustProxies::class,
            HandleCors::class,
            ForceJsonResponse::class,
            ThrottleRequests::class,
            StartSession::class,
            EnsureFrontendRequestsAreStateful::class,
            SubstituteBindings::class,
            EnsureAccountActive::class,
            EnsureTwoFactorVerified::class,
            EnsureAdmin::class,
            CheckPermission::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (Throwable $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                $requestId = $request->attributes->get('request_id')
                    ?? $request->header('X-Request-ID')
                    ?? (string) Str::uuid();

                $code = 'INTERNAL_SERVER_ERROR';
                $message = 'An unexpected server error occurred.';
                $details = null;
                $status = 500;
                $headers = [];

                if ($e instanceof ValidationException) {
                    $status = 422;
                    $code = 'VALIDATION_ERROR';
                    $message = 'The given data was invalid.';
                    $details = $e->errors();
                } elseif ($e instanceof AuthenticationException) {
                    $status = 401;
                    $code = 'UNAUTHENTICATED';
                    $message = 'Unauthenticated.';
                } elseif ($e instanceof AuthorizationException || $e instanceof AccessDeniedHttpException) {
                    $status = 403;
                    $code = 'FORBIDDEN';
                    $message = $e->getMessage() ?: 'This action is unauthorized.';
                } elseif ($e instanceof ModelNotFoundException || $e instanceof NotFoundHttpException) {
                    $status = 404;
                    $code = 'RESOURCE_NOT_FOUND';
                    $message = 'Resource not found.';
                } elseif ($e instanceof ThrottleRequestsException || $e instanceof TooManyRequestsHttpException) {
                    $status = 429;
                    $code = 'RATE_LIMIT_EXCEEDED';
                    $message = 'Too many requests. Please slow down.';
                    $retryAfter = method_exists($e, 'getHeaders') ? ($e->getHeaders()['Retry-After'] ?? 60) : 60;
                    $details = ['retry_after' => (int) $retryAfter];
                    $headers['Retry-After'] = (string) $retryAfter;
                } elseif ($e instanceof MethodNotAllowedHttpException) {
                    $status = 405;
                    $code = 'METHOD_NOT_ALLOWED';
                    $message = 'The requested HTTP method is not allowed.';
                } elseif ($e instanceof DomainException) {
                    $status = $e->getStatusCode();
                    $code = $e->getErrorCode();
                    $message = $e->getMessage();
                    $details = $e->getDetails();
                } elseif ($e instanceof HttpExceptionInterface) {
                    $status = $e->getStatusCode();
                    $code = 'HTTP_ERROR_'.$status;
                    $message = $e->getMessage() ?: 'HTTP error occurred.';
                    $headers = $e->getHeaders();
                } else {
                    Log::error('API Unhandled Exception: '.$e->getMessage(), [
                        'request_id' => $requestId,
                        'exception' => get_class($e),
                        'file' => $e->getFile().':'.$e->getLine(),
                    ]);

                    $status = 500;
                    $code = 'INTERNAL_SERVER_ERROR';
                    $message = app()->isProduction() ? 'An unexpected server error occurred.' : $e->getMessage();
                }

                $payload = [
                    'error' => [
                        'code' => $code,
                        'message' => $message,
                        'details' => $details,
                        'request_id' => $requestId,
                        'timestamp' => now()->toIso8601String(),
                    ],
                ];

                return response()->json(
                    $payload,
                    $status,
                    array_merge(['X-Request-ID' => $requestId], $headers)
                );
            }
        });
    })->create();
