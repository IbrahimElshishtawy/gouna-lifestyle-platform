<?php

use App\Http\Controllers\Api\V1\Public\AuthController;
use Illuminate\Support\Facades\Route;

// Headless Admin API base (Protected by auth:sanctum and admin gate)
Route::middleware(['admin'])->group(function () {
    Route::get('/ping', function () {
        return response()->json(['status' => 'admin_authenticated']);
    })->name('ping');
});
