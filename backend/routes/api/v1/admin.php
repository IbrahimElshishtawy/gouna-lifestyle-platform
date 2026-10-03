<?php

use Illuminate\Support\Facades\Route;

// Headless Admin API base (Protected by auth:sanctum, admin gate, and 2FA verification)
Route::middleware(['admin', '2fa'])->group(function () {
    Route::get('/ping', function () {
        return response()->json(['status' => 'admin_authenticated']);
    })->name('ping');
});
