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
}
