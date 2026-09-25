<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\EventController;
use App\Http\Controllers\Admin\ExperienceController;
use App\Http\Controllers\Admin\LocaleController;
use App\Http\Controllers\Admin\PropertyController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\ExperienceListingController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\PropertyListingController;
use App\Http\Controllers\SeoController;
use Illuminate\Support\Facades\Route;

// Public Locale Switcher
Route::get('/locale/{locale}', [LocaleController::class, 'switch'])->name('locale.switch');

// Admin Authentication Routes
Route::prefix('admin')->group(function () {
    Route::get('/login', [LoginController::class, 'showLoginForm'])->name('admin.login');
    Route::post('/login', [LoginController::class, 'login'])->name('admin.login.submit');
    Route::match(['get', 'post'], '/logout', [LoginController::class, 'logout'])->name('admin.logout');
});

// Protected Admin Dashboard & Management Shell
Route::middleware(['web', 'admin', 'locale'])->prefix('admin')->name('admin.')->group(function () {
    // Dashboard Home
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    // Section 41 Navigation Routes
    // Bookings
    Route::prefix('bookings')->name('bookings.')->group(function () {
        Route::get('/', [DashboardController::class, 'index'])->name('index');
        Route::get('/pending', [DashboardController::class, 'index'])->name('pending');
        Route::get('/confirmed', [DashboardController::class, 'index'])->name('confirmed');
        Route::get('/cancelled', [DashboardController::class, 'index'])->name('cancelled');
        Route::get('/calendar', [DashboardController::class, 'index'])->name('calendar');
        Route::get('/payments', [DashboardController::class, 'index'])->name('payments');
    });

    // Properties (Sections 20, 21, 41, 44)
    Route::prefix('properties')->name('properties.')->group(function () {
        Route::get('/', [PropertyController::class, 'index'])->name('index');
        Route::get('/rent', fn() => redirect()->route('admin.properties.index', ['type' => 'rent']))->name('rent');
        Route::get('/sale', fn() => redirect()->route('admin.properties.index', ['type' => 'sale']))->name('sale');
        Route::get('/create', [PropertyController::class, 'create'])->name('create');
        Route::post('/', [PropertyController::class, 'store'])->name('store');
        Route::get('/{property}/edit', [PropertyController::class, 'edit'])->name('edit');
        Route::match(['put', 'patch'], '/{property}', [PropertyController::class, 'update'])->name('update');
        Route::delete('/{property}', [PropertyController::class, 'destroy'])->name('destroy');
        Route::delete('/{property}/media/{media}', [PropertyController::class, 'deleteMedia'])->name('media.destroy');
        Route::get('/categories', [DashboardController::class, 'index'])->name('categories');
        Route::get('/locations', [DashboardController::class, 'index'])->name('locations');
        Route::get('/amenities', [DashboardController::class, 'index'])->name('amenities');
    });

    // Pricing & Availability
    Route::prefix('pricing')->name('pricing.')->group(function () {
        Route::get('/base', [DashboardController::class, 'index'])->name('base');
        Route::get('/seasons', [DashboardController::class, 'index'])->name('seasons');
        Route::get('/calendar', [DashboardController::class, 'index'])->name('calendar');
        Route::get('/discounts', [DashboardController::class, 'index'])->name('discounts');
        Route::get('/fees', [DashboardController::class, 'index'])->name('fees');
    });

    // Experiences & Vehicles (Sections 20, 21, 41, 44)
    Route::prefix('experiences')->name('experiences.')->group(function () {
        Route::get('/', [ExperienceController::class, 'index'])->name('index');
        Route::get('/create', [ExperienceController::class, 'create'])->name('create');
        Route::post('/', [ExperienceController::class, 'store'])->name('store');
        Route::get('/{experience}/edit', [ExperienceController::class, 'edit'])->name('edit');
        Route::match(['put', 'patch'], '/{experience}', [ExperienceController::class, 'update'])->name('update');
        Route::delete('/{experience}', [ExperienceController::class, 'destroy'])->name('destroy');
        Route::delete('/{experience}/media/{media}', [ExperienceController::class, 'deleteMedia'])->name('media.destroy');
        Route::get('/boats', [DashboardController::class, 'index'])->name('boats');
        Route::get('/safari', [DashboardController::class, 'index'])->name('safari');
        Route::get('/vehicles', [DashboardController::class, 'index'])->name('vehicles');
        Route::get('/categories', [DashboardController::class, 'index'])->name('categories');
    });

    // Events & Tickets (Sections 20, 21, 41, 44)
    Route::prefix('events')->name('events.')->group(function () {
        Route::get('/', [EventController::class, 'index'])->name('index');
        Route::get('/create', [EventController::class, 'create'])->name('create');
        Route::post('/', [EventController::class, 'store'])->name('store');
        Route::get('/{event}/edit', [EventController::class, 'edit'])->name('edit');
        Route::match(['put', 'patch'], '/{event}', [EventController::class, 'update'])->name('update');
        Route::delete('/{event}', [EventController::class, 'destroy'])->name('destroy');
        Route::delete('/{event}/media/{media}', [EventController::class, 'deleteMedia'])->name('media.destroy');
        Route::get('/tickets', [DashboardController::class, 'index'])->name('tickets');
        Route::get('/orders', [DashboardController::class, 'index'])->name('orders');
        Route::get('/checkin', [DashboardController::class, 'index'])->name('checkin');
    });

    // Customers & Leads
    Route::prefix('customers')->name('customers.')->group(function () {
        Route::get('/', [DashboardController::class, 'index'])->name('index');
        Route::get('/leads', [DashboardController::class, 'index'])->name('leads');
        Route::get('/inquiries', [DashboardController::class, 'index'])->name('inquiries');
    });

    // Media
    Route::prefix('media')->name('media.')->group(function () {
        Route::get('/', [DashboardController::class, 'index'])->name('index');
    });

    // CMS Content
    Route::prefix('cms')->name('cms.')->group(function () {
        Route::get('/homepage', [DashboardController::class, 'index'])->name('homepage');
        Route::get('/pages', [DashboardController::class, 'index'])->name('pages');
        Route::get('/faqs', [DashboardController::class, 'index'])->name('faqs');
        Route::get('/blog', [DashboardController::class, 'index'])->name('blog');
        Route::get('/navigation', [DashboardController::class, 'index'])->name('navigation');
    });

    // SEO
    Route::prefix('seo')->name('seo.')->group(function () {
        Route::get('/global', [DashboardController::class, 'index'])->name('global');
        Route::get('/sitemap', [DashboardController::class, 'index'])->name('sitemap');
        Route::get('/redirects', [DashboardController::class, 'index'])->name('redirects');
    });

    // Analytics
    Route::prefix('analytics')->name('analytics.')->group(function () {
        Route::get('/tracking', [DashboardController::class, 'index'])->name('tracking');
        Route::get('/reports', [DashboardController::class, 'index'])->name('reports');
    });

    // Settings
    Route::prefix('settings')->name('settings.')->group(function () {
        Route::get('/general', [DashboardController::class, 'index'])->name('general');
        Route::get('/payments', [DashboardController::class, 'index'])->name('payments');
        Route::get('/booking', [DashboardController::class, 'index'])->name('booking');
        Route::get('/notifications', [DashboardController::class, 'index'])->name('notifications');
    });

    // Users & Roles
    Route::prefix('users')->name('users.')->group(function () {
        Route::get('/', [DashboardController::class, 'index'])->name('index');
        Route::get('/roles', [DashboardController::class, 'index'])->name('roles');
    });

    // System
    Route::prefix('system')->name('system.')->group(function () {
        Route::get('/logs', [DashboardController::class, 'index'])->name('logs');
        Route::get('/health', [DashboardController::class, 'index'])->name('health');
    });
});

// Public Checkout Routes (Sections 15, 18, 19, 22, 23)
Route::prefix('checkout')->name('checkout.')->group(function () {
    Route::post('/calculate', [CheckoutController::class, 'calculate'])->name('calculate');
    Route::get('/{property:slug}', [CheckoutController::class, 'show'])->name('show');
    Route::post('/process', [CheckoutController::class, 'process'])->name('process');
    Route::get('/confirmation/{reference}', [CheckoutController::class, 'confirmation'])->name('confirmation');

    // Gateway Simulation & 3DS Mock Endpoints
    Route::get('/mock/card/{reference}', [CheckoutController::class, 'cardMock'])->name('card-mock');
    Route::post('/mock/card/{reference}/complete', [CheckoutController::class, 'cardMockComplete'])->name('card-mock.complete');
    Route::post('/mock/card/{reference}/decline', [CheckoutController::class, 'cardMockDecline'])->name('card-mock.decline');

    Route::get('/mock/paypal/{reference}', [CheckoutController::class, 'paypalMock'])->name('paypal-mock');
    Route::post('/mock/paypal/{reference}/complete', [CheckoutController::class, 'paypalMockComplete'])->name('paypal-mock.complete');
});

// Public Frontend Routes (Phase 6: Sections 7, 26, 29, 126, 127)
Route::middleware(['web', 'locale'])->group(function () {
    // Homepage (Sections 7 & 126)
    Route::get('/', [HomeController::class, 'index'])->name('home');
    Route::post('/inquire', [HomeController::class, 'inquire'])->name('home.inquire');

    // Stays & Real Estate Listing (Section 26 & 27)
    Route::get('/stays', [PropertyListingController::class, 'index'])->name('properties.index');
    Route::get('/properties', [PropertyListingController::class, 'index']);
    Route::get('/stays/{property:slug}', [PropertyListingController::class, 'show'])->name('properties.show');
    Route::get('/properties/{property:slug}', [PropertyListingController::class, 'show']);
    Route::post('/stays/{property:slug}/inquire', [PropertyListingController::class, 'inquire'])->name('properties.inquire');

    // Curated Experiences (Section 29 & 30)
    Route::get('/experiences', [ExperienceListingController::class, 'index'])->name('experiences.index');
    Route::get('/experiences/{experience:slug}', [ExperienceListingController::class, 'show'])->name('experiences.show');
    Route::post('/experiences/{experience:slug}/inquire', [ExperienceListingController::class, 'inquire'])->name('experiences.inquire');

    // SEO Infrastructure Routes (Section 48)
    Route::get('/sitemap.xml', [SeoController::class, 'sitemap'])->name('seo.sitemap');
    Route::get('/robots.txt', [SeoController::class, 'robots'])->name('seo.robots');
});
