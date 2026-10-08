<?php

use App\Http\Controllers\Api\V1\Admin\BookingApiController;
use App\Http\Controllers\Api\V1\Admin\ConciergeApiController;
use App\Http\Controllers\Api\V1\Admin\CustomerApiController;
use App\Http\Controllers\Api\V1\Admin\DashboardApiController;
use App\Http\Controllers\Api\V1\Admin\EventApiController;
use App\Http\Controllers\Api\V1\Admin\ExperienceApiController;
use App\Http\Controllers\Api\V1\Admin\FinanceApiController;
use App\Http\Controllers\Api\V1\Admin\MediaDesignApiController;
use App\Http\Controllers\Api\V1\Admin\PricingApiController;
use App\Http\Controllers\Api\V1\Admin\PropertyApiController;
use App\Http\Controllers\Api\V1\Admin\SettingsApiController;
use App\Http\Controllers\Api\V1\Admin\StaffApiController;
use App\Http\Controllers\Api\V1\Admin\VenueApiController;
use App\Http\Controllers\Api\V1\Admin\YachtApiController;
use Illuminate\Support\Facades\Route;

// Headless Admin API base (Protected by auth:sanctum, account.active, admin gate, and 2FA verification)
Route::middleware(['admin', '2fa'])->group(function () {
    Route::get('/ping', function () {
        return response()->json(['status' => 'admin_authenticated']);
    })->name('ping');

    // 1. Dashboard Command Center
    Route::get('/dashboard', [DashboardApiController::class, 'index'])->name('dashboard');

    // 2. Bookings Management & Operational Stays
    Route::prefix('bookings')->as('bookings.')->group(function () {
        Route::get('/', [BookingApiController::class, 'index'])->name('index');
        Route::get('/stays', [BookingApiController::class, 'stays'])->name('stays');
        Route::get('/{id}', [BookingApiController::class, 'show'])->name('show');
        Route::put('/{id}/status', [BookingApiController::class, 'updateStatus'])->name('status');
        Route::post('/{id}/refund', [BookingApiController::class, 'refund'])->name('refund');
        Route::post('/{id}/checkin', [BookingApiController::class, 'checkin'])->name('checkin');
        Route::post('/{id}/checkout', [BookingApiController::class, 'checkout'])->name('checkout');
        Route::post('/{id}/extend', [BookingApiController::class, 'extendStay'])->name('extend');
    });

    // 3. Properties & Units Management, Location & Availability
    Route::prefix('properties')->as('properties.')->group(function () {
        Route::get('/', [PropertyApiController::class, 'index'])->name('index');
        Route::post('/', [PropertyApiController::class, 'store'])->name('store');
        Route::get('/taxonomies', [PropertyApiController::class, 'taxonomies'])->name('taxonomies');
        Route::post('/parse-location', [PropertyApiController::class, 'parseLocation'])->name('parse-location');
        Route::get('/{id}', [PropertyApiController::class, 'show'])->name('show');
        Route::put('/{id}', [PropertyApiController::class, 'update'])->name('update');
        Route::delete('/{id}', [PropertyApiController::class, 'destroy'])->name('destroy');
        Route::match(['put', 'patch'], '/{id}/toggle-status', [PropertyApiController::class, 'toggleStatus'])->name('toggle-status');
        Route::get('/{id}/calendar', [PropertyApiController::class, 'availabilityCalendar'])->name('calendar');
        Route::post('/{id}/availability-blocks', [PropertyApiController::class, 'addAvailabilityBlock'])->name('add-block');
        Route::delete('/{id}/availability-blocks/{blockId}', [PropertyApiController::class, 'removeAvailabilityBlock'])->name('remove-block');
        Route::post('/{id}/seasonal-prices', [PropertyApiController::class, 'addSeasonalPrice'])->name('add-seasonal-price');
        Route::delete('/{id}/seasonal-prices/{seasonId}', [PropertyApiController::class, 'removeSeasonalPrice'])->name('remove-seasonal-price');

        // Sub-Units Management
        Route::get('/{id}/units', [PropertyApiController::class, 'listUnits'])->name('units.index');
        Route::post('/{id}/units', [PropertyApiController::class, 'storeUnit'])->name('units.store');
        Route::get('/{id}/units/{unitId}', [PropertyApiController::class, 'showUnit'])->name('units.show');
        Route::put('/{id}/units/{unitId}', [PropertyApiController::class, 'updateUnit'])->name('units.update');
        Route::delete('/{id}/units/{unitId}', [PropertyApiController::class, 'deleteUnit'])->name('units.destroy');
    });

    // 3.05 Experiences Management
    Route::prefix('experiences')->as('experiences.')->group(function () {
        Route::get('/', [ExperienceApiController::class, 'index'])->name('index');
        Route::get('/taxonomies', [ExperienceApiController::class, 'taxonomies'])->name('taxonomies');
        Route::post('/', [ExperienceApiController::class, 'store'])->name('store');
        Route::get('/{id}', [ExperienceApiController::class, 'show'])->name('show');
        Route::put('/{id}', [ExperienceApiController::class, 'update'])->name('update');
        Route::delete('/{id}', [ExperienceApiController::class, 'destroy'])->name('destroy');
        Route::match(['put', 'patch'], '/{id}/toggle-status', [ExperienceApiController::class, 'toggleStatus'])->name('toggle-status');
    });

    // 3.06 Dedicated Yachts Fleet & Charter Management
    Route::prefix('yachts')->as('yachts.')->group(function () {
        Route::get('/', [YachtApiController::class, 'index'])->name('index');
        Route::get('/dashboard', [YachtApiController::class, 'dashboard'])->name('dashboard');
        Route::get('/taxonomies', [YachtApiController::class, 'taxonomies'])->name('taxonomies');
        Route::post('/', [YachtApiController::class, 'store'])->name('store');
        Route::get('/{id}', [YachtApiController::class, 'show'])->name('show');
        Route::put('/{id}', [YachtApiController::class, 'update'])->name('update');
        Route::delete('/{id}', [YachtApiController::class, 'destroy'])->name('destroy');
        Route::match(['put', 'patch'], '/{id}/toggle-status', [YachtApiController::class, 'toggleStatus'])->name('toggle-status');
        Route::get('/{id}/availability', [YachtApiController::class, 'availability'])->name('availability');
        Route::post('/{id}/availability-blocks', [YachtApiController::class, 'addAvailabilityBlock'])->name('add-block');
        Route::delete('/{id}/availability-blocks/{blockId}', [YachtApiController::class, 'removeAvailabilityBlock'])->name('remove-block');
        Route::post('/{id}/packages', [YachtApiController::class, 'storePackage'])->name('packages.store');
        Route::delete('/{id}/packages/{packageId}', [YachtApiController::class, 'deletePackage'])->name('packages.destroy');
        Route::post('/{id}/addons', [YachtApiController::class, 'storeAddon'])->name('addons.store');
        Route::delete('/{id}/addons/{addonId}', [YachtApiController::class, 'deleteAddon'])->name('addons.destroy');
        Route::get('/{id}/bookings', [YachtApiController::class, 'bookings'])->name('bookings');
        Route::post('/{id}/calculate-price', [YachtApiController::class, 'calculatePrice'])->name('calculate-price');
    });

    // 3.07 Events, Ticketing & Check-In Station
    Route::prefix('events')->as('events.')->group(function () {
        Route::get('/', [EventApiController::class, 'index'])->name('index');
        Route::get('/dashboard', [EventApiController::class, 'dashboard'])->name('dashboard');
        Route::get('/taxonomies', [EventApiController::class, 'taxonomies'])->name('taxonomies');
        Route::post('/', [EventApiController::class, 'store'])->name('store');
        Route::get('/{id}', [EventApiController::class, 'show'])->name('show');
        Route::put('/{id}', [EventApiController::class, 'update'])->name('update');
        Route::delete('/{id}', [EventApiController::class, 'destroy'])->name('destroy');
        Route::match(['put', 'patch'], '/{id}/toggle-status', [EventApiController::class, 'toggleStatus'])->name('toggle-status');
        Route::get('/{id}/tickets', [EventApiController::class, 'tickets'])->name('tickets');
        Route::post('/{id}/tickets', [EventApiController::class, 'storeTicketType'])->name('tickets.store');
        Route::delete('/{id}/tickets/{ticketTypeId}', [EventApiController::class, 'deleteTicketType'])->name('tickets.destroy');
        Route::get('/{id}/orders', [EventApiController::class, 'orders'])->name('orders');
        Route::post('/{id}/orders/{orderId}/cancel', [EventApiController::class, 'cancelOrder'])->name('orders.cancel');
        Route::post('/{id}/orders/{orderId}/refund', [EventApiController::class, 'refundOrder'])->name('orders.refund');
        Route::post('/{id}/check-in', [EventApiController::class, 'checkIn'])->name('check-in');
        Route::get('/{id}/check-in/search', [EventApiController::class, 'searchTickets'])->name('check-in.search');
    });

    // 3.08 Event Venues
    Route::prefix('venues')->as('venues.')->group(function () {
        Route::get('/', [VenueApiController::class, 'index'])->name('index');
        Route::post('/', [VenueApiController::class, 'store'])->name('store');
        Route::get('/{id}', [VenueApiController::class, 'show'])->name('show');
        Route::put('/{id}', [VenueApiController::class, 'update'])->name('update');
        Route::delete('/{id}', [VenueApiController::class, 'destroy'])->name('destroy');
    });

    // 3.1 Dedicated Pricing Engine Module
    Route::prefix('pricing')->as('pricing.')->group(function () {
        Route::get('/', [PricingApiController::class, 'overview'])->name('overview');
        Route::get('/overview', [PricingApiController::class, 'overview'])->name('overview.alias');
        Route::get('/calendar', [PricingApiController::class, 'calendar'])->name('calendar');
        Route::post('/preview', [PricingApiController::class, 'previewQuote'])->name('preview');
        Route::post('/analyze-overlap', [PricingApiController::class, 'analyzeOverlap'])->name('analyze-overlap');
        Route::get('/rules', [PricingApiController::class, 'rules'])->name('rules');
        Route::post('/rules', [PricingApiController::class, 'storeRule'])->name('rules.store');
        Route::put('/rules/{id}', [PricingApiController::class, 'updateRule'])->name('rules.update');
        Route::delete('/rules/{id}', [PricingApiController::class, 'deleteRule'])->name('rules.destroy');
        Route::post('/override', [PricingApiController::class, 'overrideDateRange'])->name('override');
        Route::get('/discounts', [PricingApiController::class, 'discounts'])->name('discounts');
        Route::post('/discounts', [PricingApiController::class, 'storeDiscount'])->name('discounts.store');
        Route::put('/discounts/{id}/toggle', [PricingApiController::class, 'toggleDiscount'])->name('discounts.toggle');
        Route::delete('/discounts/{id}', [PricingApiController::class, 'deleteDiscount'])->name('discounts.destroy');
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
