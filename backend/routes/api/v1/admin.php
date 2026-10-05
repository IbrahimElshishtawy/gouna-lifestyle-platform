<?php

use App\Http\Controllers\Api\V1\Admin\BookingApiController;
use App\Http\Controllers\Api\V1\Admin\ConciergeApiController;
use App\Http\Controllers\Api\V1\Admin\CustomerApiController;
use App\Http\Controllers\Api\V1\Admin\DashboardApiController;
use App\Http\Controllers\Api\V1\Admin\FinanceApiController;
use App\Http\Controllers\Api\V1\Admin\MediaDesignApiController;
use App\Http\Controllers\Api\V1\Admin\PropertyApiController;
use App\Http\Controllers\Api\V1\Admin\SettingsApiController;
use App\Http\Controllers\Api\V1\Admin\StaffApiController;
use Illuminate\Support\Facades\Route;

// Headless Admin API base (Protected by auth:sanctum, account.active, admin gate, and 2FA verification)
Route::middleware(['admin', '2fa'])->group(function () {
    Route::get('/ping', function () {
        return response()->json(['status' => 'admin_authenticated']);
    })->name('ping');

    // 1. Dashboard Command Center
    Route::get('/dashboard', [DashboardApiController::class, 'index'])->name('dashboard');

    // 2. Bookings Management
    Route::prefix('bookings')->as('bookings.')->group(function () {
        Route::get('/', [BookingApiController::class, 'index'])->name('index');
        Route::put('/{id}/status', [BookingApiController::class, 'updateStatus'])->name('status');
        Route::post('/{id}/refund', [BookingApiController::class, 'refund'])->name('refund');
    });

    // 3. Properties & Units Management (Pause / Resume Display & CRUD)
    Route::prefix('properties')->as('properties.')->group(function () {
        Route::get('/', [PropertyApiController::class, 'index'])->name('index');
        Route::get('/{id}', [PropertyApiController::class, 'show'])->name('show');
        Route::put('/{id}', [PropertyApiController::class, 'update'])->name('update');
        Route::match(['put', 'patch'], '/{id}/toggle-status', [PropertyApiController::class, 'toggleStatus'])->name('toggle-status');
    });

    // 4. Media Design & Homepage CMS Control
    Route::prefix('media-design')->as('media-design.')->group(function () {
        Route::get('/', [MediaDesignApiController::class, 'index'])->name('index');
        Route::put('/', [MediaDesignApiController::class, 'update'])->name('update');
    });

    // 5. Staff & Administrative Users
    Route::prefix('users')->as('users.')->group(function () {
        Route::get('/', [StaffApiController::class, 'index'])->name('index');
        Route::post('/', [StaffApiController::class, 'store'])->name('store');
        Route::put('/{id}', [StaffApiController::class, 'update'])->name('update');
        Route::delete('/{id}', [StaffApiController::class, 'destroy'])->name('destroy');
    });

    // 6. VIP Concierge & Leads
    Route::prefix('concierge')->as('concierge.')->group(function () {
        Route::get('/', [ConciergeApiController::class, 'index'])->name('index');
        Route::put('/{id}', [ConciergeApiController::class, 'update'])->name('update');
        Route::post('/{id}/assign', [ConciergeApiController::class, 'assign'])->name('assign');
    });

    // 7. Finances & Payment Transactions
    Route::prefix('finances')->as('finances.')->group(function () {
        Route::get('/', [FinanceApiController::class, 'index'])->name('index');
        Route::get('/summary', [FinanceApiController::class, 'summary'])->name('summary');
    });

    // 8. Customers / CRM
    Route::prefix('customers')->as('customers.')->group(function () {
        Route::get('/', [CustomerApiController::class, 'index'])->name('index');
        Route::get('/{id}', [CustomerApiController::class, 'show'])->name('show');
    });

    // 9. Settings & Audit Logs
    Route::prefix('settings')->as('settings.')->group(function () {
        Route::get('/', [SettingsApiController::class, 'index'])->name('index');
        Route::put('/', [SettingsApiController::class, 'update'])->name('update');
    });
    Route::get('/audit-logs', [SettingsApiController::class, 'auditLogs'])->name('audit-logs');
});
