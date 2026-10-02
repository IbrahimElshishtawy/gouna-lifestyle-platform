<?php

use App\Http\Controllers\Api\V1\Webhooks\PaymentWebhookController;
use Illuminate\Support\Facades\Route;

// Webhook endpoints with signature verification and rate limiting
Route::post('/payments', [PaymentWebhookController::class, 'handle'])
    ->middleware(['throttle:webhooks', 'webhook.signature'])
    ->name('payments');
