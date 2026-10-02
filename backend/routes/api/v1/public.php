<?php

use App\Http\Controllers\Api\V1\Public\AuthController;
use App\Http\Controllers\Api\V1\Public\CheckoutController;
use App\Http\Controllers\Api\V1\Public\EventController;
use App\Http\Controllers\Api\V1\Public\ExperienceController;
use App\Http\Controllers\Api\V1\Public\LeadController;
use App\Http\Controllers\Api\V1\Public\StayController;
use Illuminate\Support\Facades\Route;

// Stays / Properties
Route::get('/stays', [StayController::class, 'index'])->name('stays.index');
Route::get('/stays/{slug}', [StayController::class, 'show'])->name('stays.show');

// Experiences
Route::get('/experiences', [ExperienceController::class, 'index'])->name('experiences.index');
Route::get('/experiences/{slug}', [ExperienceController::class, 'show'])->name('experiences.show');

// Events
Route::get('/events', [EventController::class, 'index'])->name('events.index');
Route::get('/events/{slug}', [EventController::class, 'show'])->name('events.show');

// Checkout & Booking Engine
Route::prefix('checkout')->as('checkout.')->group(function () {
    Route::post('/quote', [CheckoutController::class, 'quote'])
        ->middleware('throttle:booking')
        ->name('quote');

    Route::post('/bookings', [CheckoutController::class, 'createBooking'])
        ->middleware(['throttle:booking', 'idempotent'])
        ->name('bookings.create');

    Route::get('/bookings/{reference}', [CheckoutController::class, 'show'])
        ->name('bookings.show');
});

// Leads / Inquiries
Route::post('/leads', [LeadController::class, 'store'])
    ->middleware('throttle:inquiries')
    ->name('leads.store');

// Authentication (ADR-003)
Route::prefix('auth')->as('auth.')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])
        ->middleware('throttle:auth')
        ->name('login');

    Route::post('/logout', [AuthController::class, 'logout'])
        ->middleware('auth:sanctum')
        ->name('logout');
});
