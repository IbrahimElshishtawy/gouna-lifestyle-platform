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
Route::get('/properties', [StayController::class, 'index'])->name('properties.index');
Route::get('/properties/{slug}', [StayController::class, 'show'])->name('properties.show');

// Experiences
Route::get('/experiences', [ExperienceController::class, 'index'])->name('experiences.index');
Route::get('/experiences/{slug}', [ExperienceController::class, 'show'])->name('experiences.show');

// Yachts
Route::get('/yachts', [\App\Http\Controllers\Api\V1\Public\YachtController::class, 'index'])->name('yachts.index');
Route::get('/yachts/{slug}', [\App\Http\Controllers\Api\V1\Public\YachtController::class, 'show'])->name('yachts.show');

// Events
Route::get('/events', [EventController::class, 'index'])->name('events.index');
Route::get('/events/{slug}', [EventController::class, 'show'])->name('events.show');
Route::post('/events/{slug}/book', [EventController::class, 'book'])->middleware('throttle:booking')->name('events.book');
Route::post('/events/{slug}/inquire', [EventController::class, 'inquire'])->middleware('throttle:inquiries')->name('events.inquire');

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

// Public VIP Concierge Request Intake
Route::post('/concierge', [\App\Http\Controllers\Api\V1\Public\PublicConciergeController::class, 'store'])
    ->middleware('throttle:inquiries')
    ->name('concierge.store');

// Homepage Media Design Config
Route::get('/settings/media-design', function () {
    return response()->json([
        'data' => \App\Http\Controllers\Api\V1\Admin\MediaDesignApiController::getPublicConfig(),
    ]);
})->name('settings.media-design');

// Authentication (ADR-003, P4-T02, P4-T03, P4-T05, P4-T09)
Route::prefix('auth')->as('auth.')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])
        ->middleware('throttle:auth')
        ->name('login');

    Route::post('/logout', [AuthController::class, 'logout'])
        ->middleware('auth:sanctum')
        ->name('logout');

    Route::post('/2fa/challenge', [AuthController::class, 'challenge2fa'])
        ->middleware('throttle:auth')
        ->name('2fa.challenge');

    Route::post('/2fa/recovery', [AuthController::class, 'recovery2fa'])
        ->middleware('throttle:auth')
        ->name('2fa.recovery');

    Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])
        ->middleware('throttle:auth')
        ->name('password.forgot');

    Route::post('/reset-password', [AuthController::class, 'resetPassword'])
        ->middleware('throttle:auth')
        ->name('password.reset');

    Route::middleware(['auth:sanctum'])->group(function () {
        Route::post('/2fa/setup', [AuthController::class, 'setup2fa'])->name('2fa.setup');
        Route::post('/2fa/confirm', [AuthController::class, 'confirm2fa'])->name('2fa.confirm');
        Route::post('/2fa/disable', [AuthController::class, 'disable2fa'])->name('2fa.disable');
        Route::post('/confirm-password', [AuthController::class, 'confirmPassword'])->name('password.confirm');
    });
});
