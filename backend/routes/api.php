<?php

use App\Http\Controllers\Api\V1\Public\AuthController;
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
    Route::prefix('customer')->as('customer.')->middleware(['auth:sanctum', 'account.active'])->group(base_path('routes/api/v1/customer.php'));

    // Authenticated Admin routes
    Route::prefix('admin')->as('admin.')->middleware(['auth:sanctum', 'account.active'])->group(base_path('routes/api/v1/admin.php'));

    // Authenticated Profile, Abilities & Session Management (P3-T11, P4-T08)
    Route::middleware(['auth:sanctum', 'account.active'])->group(function () {
        Route::get('/me', [AuthController::class, 'me'])->name('me');
        Route::get('/me/abilities', [AuthController::class, 'abilities'])->name('me.abilities');
        Route::get('/me/sessions', [AuthController::class, 'sessions'])->name('me.sessions');
        Route::post('/me/logout-all', [AuthController::class, 'logoutAll'])->name('me.logout-all');
        Route::post('/me/change-password', [AuthController::class, 'changePassword'])->name('me.change-password');
    });

    // External Webhooks
    Route::prefix('webhooks')->as('webhooks.')->group(base_path('routes/api/v1/webhooks.php'));
});
