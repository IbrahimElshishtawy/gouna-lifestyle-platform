<?php

use App\Http\Controllers\Api\V1\Customer\BookingController;
use App\Http\Controllers\Api\V1\Public\AuthController;
use Illuminate\Support\Facades\Route;

// Authenticated Customer Profile & Abilities
Route::get('/me', [AuthController::class, 'me'])->name('me');

// Customer Bookings
Route::prefix('bookings')->as('bookings.')->group(function () {
    Route::get('/', [BookingController::class, 'index'])->name('index');
    Route::get('/{reference}', [BookingController::class, 'show'])->name('show');
});
