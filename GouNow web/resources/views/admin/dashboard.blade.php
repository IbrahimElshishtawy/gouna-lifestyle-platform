@extends('layouts.admin')

@section('title', app()->getLocale() === 'ar' ? 'لوحة التحكم الرئيسية' : 'Operations Dashboard')
@section('page-title', app()->getLocale() === 'ar' ? 'نظرة عامة على العمليات' : 'Executive Overview')
@section('breadcrumb', app()->getLocale() === 'ar' ? 'الرئيسية' : 'Dashboard')

@section('content')
<div class="space-y-6 sm:space-y-8">

    <!-- WELCOME & QUICK ACTIONS BANNER -->
    <div class="bg-gradient-to-r from-brand-sand-light via-white to-brand-sand-card p-6 sm:p-8 rounded-3xl border border-brand-border shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
            <div class="inline-flex items-center space-x-2 {{ app()->getLocale() === 'ar' ? 'space-x-reverse' : '' }} mb-2">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span class="text-xs font-bold uppercase tracking-wider text-brand-terracotta">El Gouna Live System</span>
            </div>
            <h2 class="text-2xl sm:text-3xl font-serif font-bold text-brand-brown">
                {{ app()->getLocale() === 'ar' ? 'مرحباً بك، ' . auth()->user()->name : 'Welcome back, ' . auth()->user()->name }}
            </h2>
            <p class="text-xs sm:text-sm text-brand-brown-muted mt-1 max-w-xl">
                {{ app()->getLocale() === 'ar' 
                    ? 'منصة إدارة وتنسيق حجوزات الفلل الشاطئية، رحلات اليخوت البحرية، وعقارات الجونة الفاخرة.' 
                    : 'Manage your luxury rental properties, private yacht excursions, ticketed nightlife events, and client leads.' }}
            </p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
            <a href="{{ route('admin.properties.create') }}" class="inline-flex items-center px-4 py-2.5 rounded-xl bg-brand-terracotta hover:bg-brand-terracotta-dark text-white text-xs font-bold shadow-xs transition-all">
                <svg class="w-4 h-4 {{ app()->getLocale() === 'ar' ? 'ml-2' : 'mr-2' }}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                <span>{{ app()->getLocale() === 'ar' ? 'إضافة عقار جديد' : '+ New Property' }}</span>
            </a>
            <a href="{{ route('admin.pricing.calendar') }}" class="inline-flex items-center px-4 py-2.5 rounded-xl bg-white hover:bg-brand-sand/50 text-brand-brown border border-brand-border text-xs font-bold transition-all shadow-xs">
                <svg class="w-4 h-4 {{ app()->getLocale() === 'ar' ? 'ml-2' : 'mr-2' }} text-brand-brown-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                <span>{{ app()->getLocale() === 'ar' ? 'تقويم الأسعار' : 'Pricing Calendar' }}</span>
            </a>
            <a href="{{ route('admin.events.checkin') }}" class="inline-flex items-center px-4 py-2.5 rounded-xl bg-white hover:bg-brand-sand/50 text-brand-brown border border-brand-border text-xs font-bold transition-all shadow-xs">
                <svg class="w-4 h-4 {{ app()->getLocale() === 'ar' ? 'ml-2' : 'mr-2' }} text-brand-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
                <span>{{ app()->getLocale() === 'ar' ? 'قارئ QR للدخول' : 'QR Check-in' }}</span>
            </a>
        </div>
    </div>

    <!-- 4 PRIMARY KPI METRIC CARDS -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        <!-- Metric 1: Total Revenue -->
        <div class="bg-white p-6 rounded-3xl border border-brand-border shadow-xs hover:border-brand-terracotta/40 transition-all">
            <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-bold text-brand-brown-muted uppercase tracking-wider">
                    {{ app()->getLocale() === 'ar' ? 'إجمالي الإيرادات المحصلة' : 'Collected Revenue' }}
                </span>
                <div class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
            </div>
            <div class="text-2xl sm:text-3xl font-serif font-bold text-brand-brown">
                {{ number_format($totalRevenueCents / 100) }} <span class="text-xs font-sans font-normal text-brand-brown-muted">EGP</span>
            </div>
            <div class="mt-2 text-xs text-brand-brown-muted flex items-center">
                <span class="text-emerald-600 font-semibold {{ app()->getLocale() === 'ar' ? 'ml-1' : 'mr-1' }}">● Active</span>
                <span>{{ number_format($outstandingBalancesCents / 100) }} EGP pending balance</span>
            </div>
        </div>

        <!-- Metric 2: Bookings -->
        <div class="bg-white p-6 rounded-3xl border border-brand-border shadow-xs hover:border-brand-terracotta/40 transition-all">
            <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-bold text-brand-brown-muted uppercase tracking-wider">
                    {{ app()->getLocale() === 'ar' ? 'الحجوزات هذا الشهر' : 'Monthly Bookings' }}
                </span>
                <div class="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                </div>
            </div>
            <div class="text-2xl sm:text-3xl font-serif font-bold text-brand-brown">
                {{ $bookingsThisMonth }} <span class="text-xs font-sans font-normal text-brand-brown-muted">Bookings</span>
            </div>
            <div class="mt-2 text-xs text-brand-brown-muted flex items-center">
                <span class="text-amber-600 font-semibold {{ app()->getLocale() === 'ar' ? 'ml-1' : 'mr-1' }}">{{ $pendingBookingsCount }}</span>
                <span>pending confirmation</span>
            </div>
        </div>

        <!-- Metric 3: Properties Under Management -->
        <div class="bg-white p-6 rounded-3xl border border-brand-border shadow-xs hover:border-brand-terracotta/40 transition-all">
            <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-bold text-brand-brown-muted uppercase tracking-wider">
                    {{ app()->getLocale() === 'ar' ? 'عقارات الجونة' : 'Properties Listed' }}
                </span>
                <div class="w-9 h-9 rounded-xl bg-amber-50 text-brand-terracotta flex items-center justify-center">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                </div>
            </div>
            <div class="text-2xl sm:text-3xl font-serif font-bold text-brand-brown">
                {{ $totalProperties }} <span class="text-xs font-sans font-normal text-brand-brown-muted">Units</span>
            </div>
            <div class="mt-2 text-xs text-brand-brown-muted">
                <span>{{ $rentalProperties }} Stays &bull; {{ $saleProperties }} For Sale</span>
            </div>
        </div>

        <!-- Metric 4: New Client Leads -->
        <div class="bg-white p-6 rounded-3xl border border-brand-border shadow-xs hover:border-brand-terracotta/40 transition-all">
            <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-bold text-brand-brown-muted uppercase tracking-wider">
                    {{ app()->getLocale() === 'ar' ? 'طلبات واستفسارات جديدة' : 'Active Leads' }}
                </span>
                <div class="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>
                </div>
            </div>
            <div class="text-2xl sm:text-3xl font-serif font-bold text-brand-brown">
                {{ $newLeadsCount }} <span class="text-xs font-sans font-normal text-brand-brown-muted">New Inquiries</span>
            </div>
            <div class="mt-2 text-xs text-brand-brown-muted">
                <span>{{ $totalTicketsSold }} event tickets sold</span>
            </div>
        </div>

    </div>

    <!-- MAIN TWO-COLUMN SECTION -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">

        <!-- LEFT COLUMN (2 COLS): Recent Bookings & Inquiries -->
        <div class="lg:col-span-2 space-y-6 sm:space-y-8">

            <!-- RECENT BOOKINGS TABLE -->
            <div class="bg-white rounded-3xl border border-brand-border shadow-xs overflow-hidden">
                <div class="p-6 border-b border-brand-border flex items-center justify-between">
                    <div>
                        <h3 class="text-base font-bold text-brand-brown">
                            {{ app()->getLocale() === 'ar' ? 'أحدث الحجوزات' : 'Recent Bookings & Reservations' }}
                        </h3>
                        <p class="text-xs text-brand-brown-muted">
                            {{ app()->getLocale() === 'ar' ? 'سجل الحجوزات الأخيرة وعمليات الدفع' : 'Live reservations recorded in the booking engine' }}
                        </p>
                    </div>
                    <a href="{{ route('admin.bookings.index') }}" class="text-xs font-bold text-brand-terracotta hover:underline">
                        {{ app()->getLocale() === 'ar' ? 'عرض الكل' : 'View All' }} &rarr;
                    </a>
                </div>

                <div class="overflow-x-auto gounow-scrollbar">
                    <table class="w-full text-left {{ app()->getLocale() === 'ar' ? 'text-right' : '' }} text-xs">
                        <thead class="bg-brand-sand-light/60 text-brand-brown-muted uppercase tracking-wider font-semibold border-b border-brand-border">
                            <tr>
                                <th class="py-3 px-4">Reference</th>
                                <th class="py-3 px-4">Customer</th>
                                <th class="py-3 px-4">Property</th>
                                <th class="py-3 px-4">Dates</th>
                                <th class="py-3 px-4">Total</th>
                                <th class="py-3 px-4">Status</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-brand-border/60">
                            @forelse($recentBookings as $booking)
                                <tr class="hover:bg-brand-sand-light/30 transition-colors">
                                    <td class="py-3.5 px-4 font-mono font-bold text-brand-brown">
                                        {{ $booking->reference }}
                                    </td>
                                    <td class="py-3.5 px-4">
                                        <div class="font-bold text-brand-brown">{{ $booking->customer?->full_name ?? 'Guest User' }}</div>
                                        <div class="text-[11px] text-brand-brown-muted">{{ $booking->customer?->phone ?? '—' }}</div>
                                    </td>
                                    <td class="py-3.5 px-4">
                                        <div class="font-medium text-brand-brown truncate max-w-[180px]">
                                            {{ $booking->bookable?->title ?? 'El Gouna Property' }}
                                        </div>
                                        <div class="text-[10px] text-brand-brown-muted">{{ $booking->nights }} nights &bull; {{ $booking->guests }} guests</div>
                                    </td>
                                    <td class="py-3.5 px-4 text-brand-brown-muted whitespace-nowrap">
                                        {{ \Carbon\Carbon::parse($booking->check_in)->format('M d') }} - {{ \Carbon\Carbon::parse($booking->check_out)->format('M d, Y') }}
                                    </td>
                                    <td class="py-3.5 px-4 font-bold text-brand-brown whitespace-nowrap">
                                        {{ number_format($booking->total) }} <span class="text-[10px] font-normal text-brand-brown-muted">{{ $booking->currency }}</span>
                                    </td>
                                    <td class="py-3.5 px-4 whitespace-nowrap">
                                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold 
                                            @if($booking->status === 'confirmed') bg-emerald-100 text-emerald-800
                                            @elseif($booking->status === 'partially_paid') bg-indigo-100 text-indigo-800
                                            @elseif($booking->status === 'pending') bg-amber-100 text-amber-800
                                            @else bg-gray-100 text-gray-800 @endif">
                                            {{ ucfirst(str_replace('_', ' ', $booking->status)) }}
                                        </span>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="6" class="py-8 text-center text-brand-brown-muted">
                                        No bookings recorded yet.
                                    </td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- RECENT BUYER LEADS & INQUIRIES -->
            <div class="bg-white rounded-3xl border border-brand-border shadow-xs overflow-hidden">
                <div class="p-6 border-b border-brand-border flex items-center justify-between">
                    <div>
                        <h3 class="text-base font-bold text-brand-brown">
                            {{ app()->getLocale() === 'ar' ? 'أحدث استفسارات العملاء وطلبات الشراء' : 'Recent Inquiries & Property Leads' }}
                        </h3>
                        <p class="text-xs text-brand-brown-muted">
                            {{ app()->getLocale() === 'ar' ? 'وارد الموقع، إعلانات جوجل، ورسائل الواتساب' : 'Direct leads from website, Google Ads, and WhatsApp' }}
                        </p>
                    </div>
                    <a href="{{ route('admin.customers.leads') }}" class="text-xs font-bold text-brand-terracotta hover:underline">
                        {{ app()->getLocale() === 'ar' ? 'عرض الكل' : 'View All' }} &rarr;
                    </a>
                </div>

                <div class="divide-y divide-brand-border/60">
                    @forelse($recentLeads as $lead)
                        <div class="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-brand-sand-light/30 transition-colors">
                            <div class="flex items-start space-x-3 {{ app()->getLocale() === 'ar' ? 'space-x-reverse' : '' }}">
                                <div class="w-10 h-10 rounded-full bg-brand-sand text-brand-terracotta flex items-center justify-center font-bold text-sm shrink-0">
                                    {{ strtoupper(substr($lead->name, 0, 1)) }}
                                </div>
                                <div>
                                    <div class="flex items-center space-x-2 {{ app()->getLocale() === 'ar' ? 'space-x-reverse' : '' }}">
                                        <span class="font-bold text-brand-brown text-sm">{{ $lead->name }}</span>
                                        <span class="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-brand-sand text-brand-brown-muted">
                                            {{ $lead->source ?? 'Website' }}
                                        </span>
                                    </div>
                                    <p class="text-xs text-brand-brown-muted mt-1 max-w-lg line-clamp-1">{{ $lead->message }}</p>
                                    @if($lead->expected_price_cents)
                                        <span class="text-[11px] font-semibold text-brand-terracotta">
                                            Budget: {{ number_format($lead->expected_price_cents / 100) }} EGP ({{ $lead->property_type ?? 'Villa' }})
                                        </span>
                                    @endif
                                </div>
                            </div>
                            <div class="flex items-center space-x-2 {{ app()->getLocale() === 'ar' ? 'space-x-reverse' : '' }} self-end sm:self-center">
                                <span class="text-[10px] font-bold px-2.5 py-1 rounded-full 
                                    @if($lead->status === 'new') bg-blue-100 text-blue-800
                                    @elseif($lead->status === 'qualified') bg-emerald-100 text-emerald-800
                                    @else bg-gray-100 text-gray-800 @endif">
                                    {{ ucfirst($lead->status) }}
                                </span>
                                @if($lead->phone)
                                    <a href="https://wa.me/{{ preg_replace('/[^0-9]/', '', $lead->phone) }}" target="_blank" class="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg" title="WhatsApp Client">
                                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
                                    </a>
                                @endif
                            </div>
                        </div>
                    @empty
                        <div class="p-8 text-center text-xs text-brand-brown-muted">No inquiries received yet.</div>
                    @endforelse
                </div>
            </div>

        </div>

        <!-- RIGHT COLUMN (1 COL): Upcoming Stays, Events & Audit Activity -->
        <div class="space-y-6 sm:space-y-8">

            <!-- UPCOMING CHECK-INS (GUEST ARRIVALS) -->
            <div class="bg-white p-6 rounded-3xl border border-brand-border shadow-xs">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-sm font-bold text-brand-brown uppercase tracking-wider">
                        {{ app()->getLocale() === 'ar' ? 'وصول الضيوف القادم' : 'Upcoming Arrivals' }}
                    </h3>
                    <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                </div>

                <div class="space-y-3">
                    @forelse($upcomingCheckIns as $checkInBooking)
                        <div class="p-3.5 rounded-2xl bg-brand-sand-light/60 border border-brand-border flex items-center justify-between">
                            <div>
                                <span class="block text-xs font-bold text-brand-brown">
                                    {{ $checkInBooking->customer?->full_name ?? 'Guest' }}
                                </span>
                                <span class="block text-[11px] text-brand-brown-muted truncate max-w-[150px]">
                                    {{ $checkInBooking->bookable?->title ?? 'Villa Stay' }}
                                </span>
                            </div>
                            <div class="text-right {{ app()->getLocale() === 'ar' ? 'text-left' : '' }}">
                                <span class="block text-xs font-bold text-brand-terracotta">
                                    {{ \Carbon\Carbon::parse($checkInBooking->check_in)->format('M d') }}
                                </span>
                                <span class="block text-[10px] text-brand-brown-muted">
                                    {{ $checkInBooking->guests }} guests
                                </span>
                            </div>
                        </div>
                    @empty
                        <p class="text-xs text-brand-brown-muted py-2">No arrivals scheduled for the next 7 days.</p>
                    @endforelse
                </div>
            </div>

            <!-- UPCOMING EVENTS MINI SUMMARY -->
            <div class="bg-white p-6 rounded-3xl border border-brand-border shadow-xs">
                <div class="flex items-center justify-between mb-3">
                    <h3 class="text-sm font-bold text-brand-brown uppercase tracking-wider">
                        {{ app()->getLocale() === 'ar' ? 'فعاليات الجونة القادمة' : 'Upcoming Events' }}
                    </h3>
                    <a href="{{ route('admin.events.index') }}" class="text-[11px] font-bold text-brand-terracotta hover:underline">Manage</a>
                </div>
                <p class="text-xs text-brand-brown-muted mb-4">
                    {{ $upcomingEventsCount }} active ticketed events listed on Gounow.
                </p>
                <div class="p-4 rounded-2xl bg-gradient-to-r from-brand-terracotta to-brand-terracotta-dark text-white shadow-xs">
                    <span class="block text-[10px] uppercase font-bold tracking-wider opacity-80">Next Major Session</span>
                    <span class="block text-sm font-bold mt-1">Gounow Sunset Sessions @ Mangroovy</span>
                    <div class="mt-3 flex items-center justify-between text-xs opacity-90 border-t border-white/20 pt-2">
                        <span>Beach Club & Lounge</span>
                        <span class="font-bold">85 Tickets Sold</span>
                    </div>
                </div>
            </div>

            <!-- RECENT SYSTEM ACTIVITY (AUDIT TRAIL per Section 58) -->
            <div class="bg-white p-6 rounded-3xl border border-brand-border shadow-xs">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-sm font-bold text-brand-brown uppercase tracking-wider">
                        {{ app()->getLocale() === 'ar' ? 'سجل العمليات Audit Logs' : 'Audit Activity Trail' }}
                    </h3>
                    <a href="{{ route('admin.system.logs') }}" class="text-[11px] font-bold text-brand-terracotta hover:underline">All</a>
                </div>

                <div class="space-y-3.5">
                    @forelse($recentActivities as $log)
                        <div class="flex items-start space-x-2.5 {{ app()->getLocale() === 'ar' ? 'space-x-reverse' : '' }} text-xs">
                            <span class="w-1.5 h-1.5 rounded-full bg-brand-terracotta mt-1.5 shrink-0"></span>
                            <div class="flex-1">
                                <span class="font-semibold text-brand-brown block">{{ $log->description ?? $log->action }}</span>
                                <span class="text-[10px] text-brand-brown-muted">
                                    {{ $log->user?->name ?? 'System' }} &bull; {{ $log->created_at->diffForHumans() }}
                                </span>
                            </div>
                        </div>
                    @empty
                        <p class="text-xs text-brand-brown-muted">No activity logs recorded yet.</p>
                    @endforelse
                </div>
            </div>

        </div>

    </div>

</div>
@endsection
