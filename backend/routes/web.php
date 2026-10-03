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
    Route::post('/login', [LoginController::class, 'login'])->middleware('throttle:admin_login')->name('admin.login.submit');
    Route::match(['get', 'post'], '/logout', [LoginController::class, 'logout'])->name('admin.logout');
});

// Protected Admin Dashboard & Management Shell
Route::middleware(['web', 'admin', 'locale'])->prefix('admin')->name('admin.')->group(function () {
    // Dashboard Home
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard')->middleware('can:dashboard.view');

    // Section 41 Navigation Routes
    // Bookings
    Route::prefix('bookings')->name('bookings.')->middleware('can:bookings.view')->group(function () {
        Route::get('/', [DashboardController::class, 'bookingsIndex'])->name('index');
        Route::get('/pending', [DashboardController::class, 'bookingsPending'])->name('pending');
        Route::get('/confirmed', [DashboardController::class, 'bookingsConfirmed'])->name('confirmed');
        Route::get('/cancelled', [DashboardController::class, 'bookingsIndex'])->name('cancelled');
        Route::get('/calendar', [DashboardController::class, 'bookingsCalendar'])->name('calendar');
        Route::get('/payments', [DashboardController::class, 'bookingsPayments'])->name('payments')->middleware('can:payments.view');
        Route::post('/{booking}/refund', [DashboardController::class, 'bookingsRefund'])->name('refund')->middleware('can:payments.refund');
    });

    // Properties (Sections 20, 21, 41, 44)
    Route::prefix('properties')->name('properties.')->group(function () {
        Route::get('/', [PropertyController::class, 'index'])->name('index')->middleware('can:properties.view');
        Route::get('/rent', fn () => redirect()->route('admin.properties.index', ['type' => 'rent']))->name('rent')->middleware('can:properties.view');
        Route::get('/sale', fn () => redirect()->route('admin.properties.index', ['type' => 'sale']))->name('sale')->middleware('can:properties.view');
        Route::get('/create', [PropertyController::class, 'create'])->name('create')->middleware('can:properties.create');
        Route::post('/', [PropertyController::class, 'store'])->name('store')->middleware('can:properties.create');
        Route::get('/{property}/edit', [PropertyController::class, 'edit'])->name('edit')->middleware('can:properties.update');
        Route::match(['put', 'patch'], '/{property}', [PropertyController::class, 'update'])->name('update')->middleware('can:properties.update');
        Route::delete('/{property}', [PropertyController::class, 'destroy'])->name('destroy')->middleware('can:properties.delete');
        Route::delete('/{property}/media/{media}', [PropertyController::class, 'deleteMedia'])->name('media.destroy')->middleware('can:media.manage')->scopeBindings();
        Route::get('/categories', [DashboardController::class, 'propertyCategories'])->name('categories')->middleware('can:properties.view');
        Route::get('/locations', [DashboardController::class, 'propertyLocations'])->name('locations')->middleware('can:properties.view');
        Route::get('/amenities', [DashboardController::class, 'propertyAmenities'])->name('amenities')->middleware('can:properties.view');
    });

    // Pricing & Availability
    Route::prefix('pricing')->name('pricing.')->middleware('can:pricing.manage')->group(function () {
        Route::get('/base', [DashboardController::class, 'pricingBase'])->name('base');
        Route::get('/seasons', [DashboardController::class, 'pricingSeasons'])->name('seasons');
        Route::get('/calendar', [DashboardController::class, 'pricingCalendar'])->name('calendar');
        Route::get('/discounts', [DashboardController::class, 'pricingDiscounts'])->name('discounts');
        Route::get('/fees', [DashboardController::class, 'pricingFees'])->name('fees');
    });

    // Experiences & Vehicles (Sections 20, 21, 41, 44)
    Route::prefix('experiences')->name('experiences.')->group(function () {
        Route::get('/', [ExperienceController::class, 'index'])->name('index')->middleware('can:experiences.view');
        Route::get('/create', [ExperienceController::class, 'create'])->name('create')->middleware('can:experiences.create');
        Route::post('/', [ExperienceController::class, 'store'])->name('store')->middleware('can:experiences.create');
        Route::get('/{experience}/edit', [ExperienceController::class, 'edit'])->name('edit')->middleware('can:experiences.update');
        Route::match(['put', 'patch'], '/{experience}', [ExperienceController::class, 'update'])->name('update')->middleware('can:experiences.update');
        Route::delete('/{experience}', [ExperienceController::class, 'destroy'])->name('destroy')->middleware('can:experiences.delete');
        Route::delete('/{experience}/media/{media}', [ExperienceController::class, 'deleteMedia'])->name('media.destroy')->middleware('can:media.manage')->scopeBindings();
        Route::get('/boats', [DashboardController::class, 'experiencesBoats'])->name('boats')->middleware('can:experiences.view');
        Route::get('/safari', [DashboardController::class, 'experiencesSafari'])->name('safari')->middleware('can:experiences.view');
        Route::get('/vehicles', [DashboardController::class, 'experiencesVehicles'])->name('vehicles')->middleware('can:vehicles.manage');
        Route::get('/categories', [DashboardController::class, 'experiencesCategories'])->name('categories')->middleware('can:experiences.view');
    });

    // Events & Tickets (Sections 20, 21, 41, 44)
    Route::prefix('events')->name('events.')->group(function () {
        Route::get('/', [EventController::class, 'index'])->name('index')->middleware('can:events.view');
        Route::get('/create', [EventController::class, 'create'])->name('create')->middleware('can:events.create');
        Route::post('/', [EventController::class, 'store'])->name('store')->middleware('can:events.create');
        Route::get('/{event}/edit', [EventController::class, 'edit'])->name('edit')->middleware('can:events.update');
        Route::match(['put', 'patch'], '/{event}', [EventController::class, 'update'])->name('update')->middleware('can:events.update');
        Route::delete('/{event}', [EventController::class, 'destroy'])->name('destroy')->middleware('can:events.delete');
        Route::delete('/{event}/media/{media}', [EventController::class, 'deleteMedia'])->name('media.destroy')->middleware('can:media.manage')->scopeBindings();
        Route::get('/tickets', [DashboardController::class, 'eventsTickets'])->name('tickets')->middleware('can:events.view');
        Route::get('/orders', [DashboardController::class, 'eventsOrders'])->name('orders')->middleware('can:events.view');
        Route::get('/checkin', [DashboardController::class, 'eventsCheckin'])->name('checkin')->middleware('can:tickets.scan');
    });

    // Customers & Leads
    Route::prefix('customers')->name('customers.')->group(function () {
        Route::get('/', [DashboardController::class, 'customersIndex'])->name('index')->middleware('can:customers.view');
        Route::get('/leads', [DashboardController::class, 'customersLeads'])->name('leads')->middleware('can:leads.view');
        Route::get('/inquiries', [DashboardController::class, 'customersInquiries'])->name('inquiries')->middleware('can:leads.view');
    });

    // Media
    Route::prefix('media')->name('media.')->middleware('can:media.manage')->group(function () {
        Route::get('/', [DashboardController::class, 'mediaIndex'])->name('index');
    });

    // CMS Content
    Route::prefix('cms')->name('cms.')->middleware('can:cms.manage')->group(function () {
        Route::get('/homepage', [DashboardController::class, 'cmsHomepage'])->name('homepage');
        Route::get('/pages', [DashboardController::class, 'cmsPages'])->name('pages');
        Route::get('/faqs', [DashboardController::class, 'cmsFaqs'])->name('faqs');
        Route::get('/blog', [DashboardController::class, 'cmsBlog'])->name('blog');
        Route::get('/navigation', [DashboardController::class, 'cmsNavigation'])->name('navigation');
    });

    // SEO
    Route::prefix('seo')->name('seo.')->middleware('can:seo.manage')->group(function () {
        Route::get('/global', [DashboardController::class, 'seoGlobal'])->name('global');
        Route::get('/sitemap', [DashboardController::class, 'seoSitemap'])->name('sitemap');
        Route::get('/redirects', [DashboardController::class, 'seoRedirects'])->name('redirects');
    });

    // Analytics
    Route::prefix('analytics')->name('analytics.')->group(function () {
        Route::get('/tracking', [DashboardController::class, 'analyticsTracking'])->name('tracking')->middleware('can:seo.manage');
        Route::get('/reports', [DashboardController::class, 'analyticsReports'])->name('reports')->middleware('can:reports.view');
    });

    // Settings
    Route::prefix('settings')->name('settings.')->middleware('can:settings.manage')->group(function () {
        Route::get('/general', [DashboardController::class, 'settingsGeneral'])->name('general');
        Route::get('/payments', [DashboardController::class, 'settingsPayments'])->name('payments');
        Route::get('/booking', [DashboardController::class, 'settingsBooking'])->name('booking');
        Route::get('/notifications', [DashboardController::class, 'settingsNotifications'])->name('notifications');
    });

    // Users & Roles
    Route::prefix('users')->name('users.')->middleware('can:users.manage')->group(function () {
        Route::get('/', [DashboardController::class, 'usersIndex'])->name('index');
        Route::get('/roles', [DashboardController::class, 'usersRoles'])->name('roles');
    });

    // System
    Route::prefix('system')->name('system.')->middleware('can:settings.manage')->group(function () {
        Route::get('/logs', [DashboardController::class, 'systemLogs'])->name('logs');
        Route::get('/health', [DashboardController::class, 'systemHealth'])->name('health');
    });
});

// Public Checkout Routes (Sections 15, 18, 19, 22, 23)
Route::prefix('checkout')->middleware('throttle:checkout')->name('checkout.')->group(function () {
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
    Route::post('/inquire', [HomeController::class, 'inquire'])->middleware('throttle:inquiries')->name('home.inquire');

    // Stays & Real Estate Listing (Section 26 & 27)
    Route::get('/stays', [PropertyListingController::class, 'index'])->name('properties.index');
    Route::get('/properties', [PropertyListingController::class, 'index']);
    Route::get('/stays/{property:slug}', [PropertyListingController::class, 'show'])->name('properties.show');
    Route::get('/properties/{property:slug}', [PropertyListingController::class, 'show']);
    Route::post('/stays/{property:slug}/inquire', [PropertyListingController::class, 'inquire'])->middleware('throttle:inquiries')->name('properties.inquire');

    // Curated Experiences (Section 29 & 30)
    Route::get('/experiences', [ExperienceListingController::class, 'index'])->name('experiences.index');
    Route::get('/experiences/{experience:slug}', [ExperienceListingController::class, 'show'])->name('experiences.show');
    Route::post('/experiences/{experience:slug}/inquire', [ExperienceListingController::class, 'inquire'])->middleware('throttle:inquiries')->name('experiences.inquire');

    // SEO Infrastructure Routes (Section 48)
    Route::get('/sitemap.xml', [SeoController::class, 'sitemap'])->name('seo.sitemap');
    Route::get('/robots.txt', [SeoController::class, 'robots'])->name('seo.robots');
});
