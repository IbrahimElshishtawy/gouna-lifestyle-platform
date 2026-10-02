<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Versioned API routes for GouNow platform adhering to Standard S1 and S2.
|
*/

Route::prefix('v1')->as('api.v1.')->group(function () {
    // Public routes (Stays, Experiences, Events, Quotes, Leads, Auth)
    Route::group([], base_path('routes/api/v1/public.php'));

    // Authenticated Customer routes
    Route::prefix('customer')->as('customer.')->middleware(['auth:sanctum'])->group(base_path('routes/api/v1/customer.php'));

    // Authenticated Admin routes
    Route::prefix('admin')->as('admin.')->middleware(['auth:sanctum'])->group(base_path('routes/api/v1/admin.php'));

    // External Webhooks
    Route::prefix('webhooks')->as('webhooks.')->group(base_path('routes/api/v1/webhooks.php'));
});
