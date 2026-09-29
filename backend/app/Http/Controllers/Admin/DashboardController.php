<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Booking;
use App\Models\Customer;
use App\Models\Event;
use App\Models\EventTicket;
use App\Models\Experience;
use App\Models\Lead;
use App\Models\Property;
use Illuminate\View\View;

class DashboardController extends Controller
{
    /**
     * Display the Admin Dashboard with operational statistics and recent activity.
     */
    public function index(): View
    {
        // 1. Booking KPIs
        $bookingsToday = Booking::whereDate('created_at', today())->count();
        $bookingsThisMonth = Booking::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        $totalRevenueCents = Booking::whereIn('payment_status', ['paid', 'partially_paid'])->sum('amount_paid_cents');
        $outstandingBalancesCents = Booking::where('status', 'confirmed')
            ->where('amount_remaining_cents', '>', 0)
            ->sum('amount_remaining_cents');

        $pendingBookingsCount = Booking::whereIn('status', ['pending', 'awaiting_payment', 'payment_processing'])->count();
        $confirmedBookingsCount = Booking::whereIn('status', ['confirmed', 'paid'])->count();

        // 2. Upcoming Stays & Operations
        $upcomingCheckIns = Booking::with(['customer', 'bookable'])
            ->where('bookable_type', Property::class)
            ->whereIn('status', ['confirmed', 'partially_paid', 'paid'])
            ->where('check_in', '>=', today()->toDateString())
            ->orderBy('check_in', 'asc')
            ->limit(5)
            ->get();

        $upcomingCheckOuts = Booking::with(['customer', 'bookable'])
            ->where('bookable_type', Property::class)
            ->whereIn('status', ['confirmed', 'partially_paid', 'paid'])
            ->where('check_out', '>=', today()->toDateString())
            ->orderBy('check_out', 'asc')
            ->limit(5)
            ->get();

        // 3. Inventory & Experiences Counts
        $totalProperties = Property::count();
        $rentalProperties = Property::whereIn('listing_type', ['rent', 'both'])->count();
        $saleProperties = Property::whereIn('listing_type', ['sale', 'both'])->count();
        $totalExperiences = Experience::count();

        // 4. Events & Tickets
        $upcomingEventsCount = Event::where('event_date', '>=', today()->toDateString())->count();
        $totalTicketsSold = EventTicket::whereIn('status', ['valid', 'used'])->count();

        // 5. Leads & Inquiries
        $newLeadsCount = Lead::where('status', 'new')->count();
        $recentLeads = Lead::with('customer')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        // 6. Recent Bookings Table
        $recentBookings = Booking::with(['customer', 'bookable', 'paymentMethod'])
            ->orderByDesc('created_at')
            ->limit(8)
            ->get();

        // 7. Recent Activity Audit Logs
        $recentActivities = ActivityLog::with('user')
            ->orderByDesc('created_at')
            ->limit(8)
            ->get();

        return view('admin.dashboard', compact(
            'bookingsToday',
            'bookingsThisMonth',
            'totalRevenueCents',
            'outstandingBalancesCents',
            'pendingBookingsCount',
            'confirmedBookingsCount',
            'upcomingCheckIns',
            'upcomingCheckOuts',
            'totalProperties',
            'rentalProperties',
            'saleProperties',
            'totalExperiences',
            'upcomingEventsCount',
            'totalTicketsSold',
            'newLeadsCount',
            'recentLeads',
            'recentBookings',
            'recentActivities'
        ));
    }

    /* -------------------------------------------------------------
     * Bookings Section
     * ------------------------------------------------------------- */
    public function bookingsIndex(): View
    {
        $bookings = Booking::with(['customer', 'bookable'])->orderByDesc('created_at')->get();
        $totalCount = $bookings->count();
        $revenue = $bookings->whereIn('payment_status', ['paid', 'partially_paid'])->sum('amount_paid_cents') / 100;
        $pendingCount = $bookings->where('status', 'pending')->count();
        $tabTitle = app()->getLocale() === 'ar' ? 'جميع الحجوزات' : 'All Bookings';

        return view('admin.bookings.index', compact('bookings', 'totalCount', 'revenue', 'pendingCount', 'tabTitle'));
    }

    public function bookingsPending(): View
    {
        $bookings = Booking::with(['customer', 'bookable'])->where('status', 'pending')->orderByDesc('created_at')->get();
        $totalCount = Booking::count();
        $revenue = Booking::whereIn('payment_status', ['paid', 'partially_paid'])->sum('amount_paid_cents') / 100;
        $pendingCount = $bookings->count();
        $tabTitle = app()->getLocale() === 'ar' ? 'الحجوزات قيد الانتظار' : 'Pending Bookings';

        return view('admin.bookings.index', compact('bookings', 'totalCount', 'revenue', 'pendingCount', 'tabTitle'));
    }

    public function bookingsConfirmed(): View
    {
        $bookings = Booking::with(['customer', 'bookable'])->whereIn('status', ['confirmed', 'paid', 'partially_paid'])->orderByDesc('created_at')->get();
        $totalCount = Booking::count();
        $revenue = Booking::whereIn('payment_status', ['paid', 'partially_paid'])->sum('amount_paid_cents') / 100;
        $pendingCount = Booking::where('status', 'pending')->count();
        $tabTitle = app()->getLocale() === 'ar' ? 'الحجوزات المؤكدة' : 'Confirmed Bookings';

        return view('admin.bookings.index', compact('bookings', 'totalCount', 'revenue', 'pendingCount', 'tabTitle'));
    }

    public function bookingsCalendar(): View
    {
        $properties = Property::with('location')->get();
        return view('admin.bookings.calendar', compact('properties'));
    }

    public function bookingsPayments(): View
    {
        $bookings = Booking::with(['customer', 'bookable'])->where('amount_paid_cents', '>', 0)->orderByDesc('created_at')->get();
        $totalCount = Booking::count();
        $revenue = Booking::sum('amount_paid_cents') / 100;
        $pendingCount = Booking::where('status', 'pending')->count();
        $tabTitle = app()->getLocale() === 'ar' ? 'العمليات المالية والفواتير' : 'Financial Audits & Payments';

        return view('admin.bookings.index', compact('bookings', 'totalCount', 'revenue', 'pendingCount', 'tabTitle'));
    }

    /* -------------------------------------------------------------
     * Properties Taxonomies
     * ------------------------------------------------------------- */
    public function propertyCategories(): View
    {
        $title = app()->getLocale() === 'ar' ? 'تصنيفات العقارات والفلل' : 'Property Categories';
        return view('admin.properties.taxonomies', compact('title'));
    }

    public function propertyLocations(): View
    {
        $title = app()->getLocale() === 'ar' ? 'المناطق ومواقع الجونة' : 'El Gouna Compounds & Locations';
        return view('admin.properties.taxonomies', compact('title'));
    }

    public function propertyAmenities(): View
    {
        $title = app()->getLocale() === 'ar' ? 'المميزات والمرافق المعتمدة' : 'Verified Amenities & Features';
        return view('admin.properties.taxonomies', compact('title'));
    }

    /* -------------------------------------------------------------
     * Pricing Engine
     * ------------------------------------------------------------- */
    public function pricingBase(): View
    {
        $properties = Property::with('location')->get();
        $tabTitle = app()->getLocale() === 'ar' ? 'الأسعار الأساسية للوحدات' : 'Base Nightly Rates';
        return view('admin.pricing.index', compact('properties', 'tabTitle'));
    }

    public function pricingSeasons(): View
    {
        $properties = Property::all();
        $tabTitle = app()->getLocale() === 'ar' ? 'المواسم والأولويات (Seasons)' : 'Seasonal Pricing Rules';
        return view('admin.pricing.index', compact('properties', 'tabTitle'));
    }

    public function pricingCalendar(): View
    {
        return view('admin.pricing.calendar');
    }

    public function pricingDiscounts(): View
    {
        $properties = Property::all();
        $tabTitle = app()->getLocale() === 'ar' ? 'أكواد الخصم والترويج' : 'Promo Codes & Discounts';
        return view('admin.pricing.index', compact('properties', 'tabTitle'));
    }

    public function pricingFees(): View
    {
        $properties = Property::all();
        $tabTitle = app()->getLocale() === 'ar' ? 'رسوم النظافة والخدمات والضرائب' : 'Hospitality Fees & Taxes';
        return view('admin.pricing.index', compact('properties', 'tabTitle'));
    }

    /* -------------------------------------------------------------
     * Experiences Sub-Sections
     * ------------------------------------------------------------- */
    public function experiencesBoats(): View
    {
        $experiences = Experience::all();
        $title = app()->getLocale() === 'ar' ? 'رحلات اليخوت الخاصة' : 'Private Yacht & Boat Charters';
        return view('admin.experiences.taxonomies', compact('experiences', 'title'));
    }

    public function experiencesSafari(): View
    {
        $experiences = Experience::all();
        $title = app()->getLocale() === 'ar' ? 'سفاري الصحراء والعشاء البدوي' : 'Desert Quad Safari';
        return view('admin.experiences.taxonomies', compact('experiences', 'title'));
    }

    public function experiencesVehicles(): View
    {
        $experiences = Experience::all();
        $title = app()->getLocale() === 'ar' ? 'سيارات الجولف والكابريو' : 'Golf Carts & Electric Vehicles';
        return view('admin.experiences.taxonomies', compact('experiences', 'title'));
    }

    public function experiencesCategories(): View
    {
        $experiences = Experience::all();
        $title = app()->getLocale() === 'ar' ? 'تصنيفات التجارب' : 'Experience Categories';
        return view('admin.experiences.taxonomies', compact('experiences', 'title'));
    }

    /* -------------------------------------------------------------
     * Events Sub-Sections
     * ------------------------------------------------------------- */
    public function eventsTickets(): View
    {
        $title = app()->getLocale() === 'ar' ? 'فئات التذاكر المتاحة' : 'Event Ticket Tiers';
        return view('admin.events.taxonomies', compact('title'));
    }

    public function eventsOrders(): View
    {
        $title = app()->getLocale() === 'ar' ? 'طلبات شراء التذاكر' : 'Ticket Sales Orders';
        return view('admin.events.taxonomies', compact('title'));
    }

    public function eventsCheckin(): View
    {
        $title = app()->getLocale() === 'ar' ? 'كونسول مسح رمز QR للدخول' : 'Gate QR Scanner';
        return view('admin.events.taxonomies', compact('title'));
    }

    /* -------------------------------------------------------------
     * Customers & Leads
     * ------------------------------------------------------------- */
    public function customersIndex(): View
    {
        $customers = Customer::all();
        $tabTitle = app()->getLocale() === 'ar' ? 'سجل العملاء والضيوف' : 'VIP Guest Profiles';
        return view('admin.customers.index', compact('customers', 'tabTitle'));
    }

    public function customersLeads(): View
    {
        $customers = Customer::all();
        $tabTitle = app()->getLocale() === 'ar' ? 'طلبات شراء العقارات والاستثمار' : 'Property Sales Leads';
        return view('admin.customers.index', compact('customers', 'tabTitle'));
    }

    public function customersInquiries(): View
    {
        $customers = Customer::all();
        $tabTitle = app()->getLocale() === 'ar' ? 'استفسارات واتساب والكونسيرج' : 'WhatsApp & Direct Inquiries';
        return view('admin.customers.index', compact('customers', 'tabTitle'));
    }

    /* -------------------------------------------------------------
     * Media Library
     * ------------------------------------------------------------- */
    public function mediaIndex(): View
    {
        return view('admin.media.index');
    }

    /* -------------------------------------------------------------
     * CMS Content
     * ------------------------------------------------------------- */
    public function cmsHomepage(): View
    {
        $tabTitle = app()->getLocale() === 'ar' ? 'أقسام الصفحة الرئيسية' : 'Homepage Hero & Featured';
        return view('admin.cms.index', compact('tabTitle'));
    }

    public function cmsPages(): View
    {
        $tabTitle = app()->getLocale() === 'ar' ? 'الصفحات الثابتة' : 'Static Legal & Info Pages';
        return view('admin.cms.index', compact('tabTitle'));
    }

    public function cmsFaqs(): View
    {
        $tabTitle = app()->getLocale() === 'ar' ? 'الأسئلة الشائعة (FAQs)' : 'Frequently Asked Questions';
        return view('admin.cms.index', compact('tabTitle'));
    }

    public function cmsBlog(): View
    {
        $tabTitle = app()->getLocale() === 'ar' ? 'المقالات وأخبار الجونة' : 'El Gouna Journal & Stories';
        return view('admin.cms.index', compact('tabTitle'));
    }

    public function cmsNavigation(): View
    {
        $tabTitle = app()->getLocale() === 'ar' ? 'قوائم التصفح' : 'Header & Footer Navigation';
        return view('admin.cms.index', compact('tabTitle'));
    }

    /* -------------------------------------------------------------
     * SEO
     * ------------------------------------------------------------- */
    public function seoGlobal(): View
    {
        $tabTitle = app()->getLocale() === 'ar' ? 'إعدادات SEO العامة' : 'Global Meta & Social Cards';
        return view('admin.seo.index', compact('tabTitle'));
    }

    public function seoSitemap(): View
    {
        $tabTitle = app()->getLocale() === 'ar' ? 'خريطة الموقع XML Sitemap' : 'Dynamic XML Sitemap';
        return view('admin.seo.index', compact('tabTitle'));
    }

    public function seoRedirects(): View
    {
        $tabTitle = app()->getLocale() === 'ar' ? 'إعادة التوجيه (301 Redirects)' : '301 Redirects Manager';
        return view('admin.seo.index', compact('tabTitle'));
    }

    /* -------------------------------------------------------------
     * Analytics
     * ------------------------------------------------------------- */
    public function analyticsTracking(): View
    {
        $tabTitle = app()->getLocale() === 'ar' ? 'إعدادات GA4 و GTM' : 'GA4 & Ads Tracking';
        return view('admin.analytics.index', compact('tabTitle'));
    }

    public function analyticsReports(): View
    {
        $tabTitle = app()->getLocale() === 'ar' ? 'تقارير المبيعات والتحويل' : 'Reports & Conversion Funnels';
        return view('admin.analytics.index', compact('tabTitle'));
    }

    /* -------------------------------------------------------------
     * Settings
     * ------------------------------------------------------------- */
    public function settingsGeneral(): View
    {
        $tabTitle = app()->getLocale() === 'ar' ? 'معلومات الشركة والعملة' : 'General & Currency';
        return view('admin.settings.index', compact('tabTitle'));
    }

    public function settingsPayments(): View
    {
        $tabTitle = app()->getLocale() === 'ar' ? 'بوابات الدفع الإلكتروني' : 'Payment Gateways';
        return view('admin.settings.index', compact('tabTitle'));
    }

    public function settingsBooking(): View
    {
        $tabTitle = app()->getLocale() === 'ar' ? 'قواعد الحجز والإلغاء' : 'Booking & Cancellation Policies';
        return view('admin.settings.index', compact('tabTitle'));
    }

    public function settingsNotifications(): View
    {
        $tabTitle = app()->getLocale() === 'ar' ? 'الواتساب والبريد الإلكتروني' : 'Automated Notifications';
        return view('admin.settings.index', compact('tabTitle'));
    }

    /* -------------------------------------------------------------
     * Users & Roles
     * ------------------------------------------------------------- */
    public function usersIndex(): View
    {
        $tabTitle = app()->getLocale() === 'ar' ? 'مديرو النظام وفريق العمل' : 'Staff Accounts';
        return view('admin.users.index', compact('tabTitle'));
    }

    public function usersRoles(): View
    {
        $tabTitle = app()->getLocale() === 'ar' ? 'الأدوار والصلاحيات (RBAC)' : 'Roles & Access Levels';
        return view('admin.users.index', compact('tabTitle'));
    }

    /* -------------------------------------------------------------
     * System & Logs
     * ------------------------------------------------------------- */
    public function systemLogs(): View
    {
        $tabTitle = app()->getLocale() === 'ar' ? 'سجل العمليات والنشاطات' : 'Activity Audit Logs';
        return view('admin.system.index', compact('tabTitle'));
    }

    public function systemHealth(): View
    {
        $tabTitle = app()->getLocale() === 'ar' ? 'حالة النظام والخادم' : 'Server & Database Health';
        return view('admin.system.index', compact('tabTitle'));
    }
}
