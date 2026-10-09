<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Strictly configured for Next.js frontend and authenticated API clients.
    | Follows ADR-003 with credentials support and explicit origin whitelists.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    'allowed_origins' => array_filter(explode(',', (string) env('CORS_ALLOWED_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000'))),

    'allowed_origins_patterns' => [
        '#^https?://.*\.ngrok-free\.app$#',
        '#^https?://.*\.vercel\.app$#',
        '#^https?://(192\.168|10\.|172\.(1[6-9]|2[0-9]|3[0-1]))\.\d+\.\d+(:\d+)?$#',
    ],

    'allowed_headers' => [
        'Content-Type',
        'X-Requested-With',
        'Authorization',
        'X-XSRF-TOKEN',
        'X-Request-ID',
        'Idempotency-Key',
        'Accept',
        'Accept-Language',
    ],

    'exposed_headers' => [
        'X-Request-ID',
        'Retry-After',
        'X-Idempotent',
        'X-Cache-Lookup',
    ],

    'max_age' => 86400,

    'supports_credentials' => true,

];
