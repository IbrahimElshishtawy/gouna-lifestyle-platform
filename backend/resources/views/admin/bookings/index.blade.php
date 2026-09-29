@extends('layouts.admin')

@section('title', app()->getLocale() === 'ar' ? 'إدارة الحجوزات والمدفوعات' : 'Bookings & Payments')
@section('page-title', app()->getLocale() === 'ar' ? 'الحجوزات والعمليات المالية' : 'Bookings & Financial Transactions')
@section('breadcrumb', $tabTitle ?? (app()->getLocale() === 'ar' ? 'سجل الحجوزات' : 'Bookings Registry'))

@section('content')
<div class="space-y-6">

    <!-- Header Actions & Tabs -->
    <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h2 class="text-xl font-bold text-brand-brown tracking-tight">
                {{ $tabTitle ?? (app()->getLocale() === 'ar' ? 'سجل الحجوزات والإقامات' : 'Guest Bookings & Reservations') }}
            </h2>
            <p class="text-xs text-brand-brown-muted mt-1">
                {{ app()->getLocale() === 'ar' ? 'متابعة حجوزات الفلل واليخوت، تأكيد المدفوعات، وإصدار الفواتير' : 'Monitor luxury stays & yacht charter bookings, payment confirmations and audit trails' }}
            </p>
        </div>
        <div class="flex items-center gap-3">
            <a href="{{ route('admin.bookings.calendar') }}" class="px-4 py-2.5 rounded-xl border border-brand-border bg-brand-sand-light text-brand-brown hover:border-brand-terracotta text-xs font-semibold flex items-center gap-2 transition">
                <svg class="w-4 h-4 text-brand-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                <span>{{ app()->getLocale() === 'ar' ? 'تقويم الحجوزات' : 'Calendar View' }}</span>
            </a>
            <button onclick="window.print()" class="px-4 py-2.5 rounded-xl bg-brand-terracotta text-white text-xs font-semibold hover:bg-brand-terracotta-dark transition flex items-center gap-2 shadow-xs">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                <span>{{ app()->getLocale() === 'ar' ? 'تصدير تقرير PDF' : 'Export Report' }}</span>
            </button>
        </div>
    </div>

    <!-- Sub-navigation Tabs -->
    <div class="flex border-b border-brand-border/60 overflow-x-auto gap-2 text-xs font-semibold text-brand-brown-muted pb-1">
        <a href="{{ route('admin.bookings.index') }}" class="px-4 py-2.5 rounded-xl transition {{ request()->routeIs('admin.bookings.index') && !request('status') ? 'bg-brand-terracotta text-white font-bold' : 'hover:bg-brand-sand/40 text-brand-brown' }}">
            {{ app()->getLocale() === 'ar' ? 'جميع الحجوزات' : 'All Bookings' }} ({{ $totalCount ?? 19 }})
        </a>
        <a href="{{ route('admin.bookings.pending') }}" class="px-4 py-2.5 rounded-xl transition {{ request()->routeIs('admin.bookings.pending') ? 'bg-brand-terracotta text-white font-bold' : 'hover:bg-brand-sand/40 text-brand-brown' }}">
            {{ app()->getLocale() === 'ar' ? 'قيد المراجعة' : 'Pending' }}
        </a>
        <a href="{{ route('admin.bookings.confirmed') }}" class="px-4 py-2.5 rounded-xl transition {{ request()->routeIs('admin.bookings.confirmed') ? 'bg-brand-terracotta text-white font-bold' : 'hover:bg-brand-sand/40 text-brand-brown' }}">
            {{ app()->getLocale() === 'ar' ? 'المؤكدة' : 'Confirmed' }}
        </a>
        <a href="{{ route('admin.bookings.payments') }}" class="px-4 py-2.5 rounded-xl transition {{ request()->routeIs('admin.bookings.payments') ? 'bg-brand-terracotta text-white font-bold' : 'hover:bg-brand-sand/40 text-brand-brown' }}">
            {{ app()->getLocale() === 'ar' ? 'العمليات المالية والفواتير' : 'Payments & Audit' }}
        </a>
    </div>

    <!-- Summary KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white p-5 rounded-2xl border border-brand-border">
            <span class="text-[11px] font-bold uppercase tracking-wider text-brand-brown-muted">{{ app()->getLocale() === 'ar' ? 'إجمالي الحجوزات' : 'Total Bookings' }}</span>
            <div class="text-2xl font-bold font-serif text-brand-brown mt-1">{{ $totalCount ?? count($bookings) }}</div>
            <span class="text-[10px] text-emerald-600 font-semibold mt-1 inline-block">↑ 12% {{ app()->getLocale() === 'ar' ? 'عن الشهر الماضي' : 'vs last month' }}</span>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-brand-border">
            <span class="text-[11px] font-bold uppercase tracking-wider text-brand-brown-muted">{{ app()->getLocale() === 'ar' ? 'إيرادات الإقامات' : 'Total Revenue' }}</span>
            <div class="text-2xl font-bold font-serif text-brand-terracotta mt-1">{{ number_format($revenue ?? 3450000) }} <span class="text-xs font-sans">EGP</span></div>
            <span class="text-[10px] text-brand-brown-muted mt-1 inline-block">{{ app()->getLocale() === 'ar' ? 'مدفوع ومؤكد' : 'Settled & confirmed' }}</span>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-brand-border">
            <span class="text-[11px] font-bold uppercase tracking-wider text-brand-brown-muted">{{ app()->getLocale() === 'ar' ? 'قيد الانتظار' : 'Pending Action' }}</span>
            <div class="text-2xl font-bold font-serif text-amber-600 mt-1">{{ $pendingCount ?? 3 }}</div>
            <span class="text-[10px] text-amber-600 font-semibold mt-1 inline-block">{{ app()->getLocale() === 'ar' ? 'يتطلب تأكيد المشرف' : 'Requires admin action' }}</span>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-brand-border">
            <span class="text-[11px] font-bold uppercase tracking-wider text-brand-brown-muted">{{ app()->getLocale() === 'ar' ? 'متوسط سعر الليلة' : 'Average Daily Rate' }}</span>
            <div class="text-2xl font-bold font-serif text-brand-brown mt-1">28,500 <span class="text-xs font-sans">EGP</span></div>
            <span class="text-[10px] text-emerald-600 font-semibold mt-1 inline-block">{{ app()->getLocale() === 'ar' ? 'نسبة الإشغال 84%' : '84% Occupancy' }}</span>
        </div>
    </div>

    <!-- Bookings Table -->
    <div class="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-brand-brown">
                <thead class="bg-brand-sand-light/60 border-b border-brand-border uppercase text-[10px] font-bold tracking-wider text-brand-brown-muted">
                    <tr>
                        <th class="py-3.5 px-4">{{ app()->getLocale() === 'ar' ? 'كود الحجز' : 'Ref Code' }}</th>
                        <th class="py-3.5 px-4">{{ app()->getLocale() === 'ar' ? 'الضيف' : 'Guest' }}</th>
                        <th class="py-3.5 px-4">{{ app()->getLocale() === 'ar' ? 'الوحدة / التجربة' : 'Sanctuary / Unit' }}</th>
                        <th class="py-3.5 px-4">{{ app()->getLocale() === 'ar' ? 'تاريخ الوصول والمغادرة' : 'Dates' }}</th>
                        <th class="py-3.5 px-4">{{ app()->getLocale() === 'ar' ? 'المبلغ الإجمالي' : 'Total' }}</th>
                        <th class="py-3.5 px-4">{{ app()->getLocale() === 'ar' ? 'حالة الدفع' : 'Payment' }}</th>
                        <th class="py-3.5 px-4">{{ app()->getLocale() === 'ar' ? 'حالة الحجز' : 'Status' }}</th>
                        <th class="py-3.5 px-4 text-center">{{ app()->getLocale() === 'ar' ? 'إجراءات' : 'Actions' }}</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-brand-border/60">
                    @forelse($bookings as $booking)
                        <tr class="hover:bg-brand-sand-light/30 transition-colors">
                            <td class="py-3.5 px-4 font-mono font-bold text-brand-terracotta">
                                {{ $booking->reference }}
                            </td>
                            <td class="py-3.5 px-4">
                                <div class="font-bold text-brand-brown">{{ $booking->customer->name ?? 'VIP Guest' }}</div>
                                <div class="text-[11px] text-brand-brown-muted">{{ $booking->customer->phone ?? '+20 100 000 0000' }}</div>
                            </td>
                            <td class="py-3.5 px-4 font-medium">
                                {{ $booking->bookable->title ?? 'Luxury Lagoon Villa' }}
                            </td>
                            <td class="py-3.5 px-4 text-brand-brown-muted">
                                {{ \Carbon\Carbon::parse($booking->check_in)->format('M d') }} - {{ \Carbon\Carbon::parse($booking->check_out)->format('M d, Y') }}
                                <span class="block text-[10px] text-brand-brown font-semibold">({{ $booking->nights }} {{ app()->getLocale() === 'ar' ? 'ليالٍ' : 'nights' }})</span>
                            </td>
                            <td class="py-3.5 px-4 font-semibold text-brand-brown">
                                {{ number_format($booking->total_cents / 100) }} {{ $booking->currency }}
                            </td>
                            <td class="py-3.5 px-4">
                                @if($booking->payment_status === 'paid')
                                    <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                        {{ app()->getLocale() === 'ar' ? 'مدفوع بالكامل' : 'Paid in Full' }}
                                    </span>
                                @elseif($booking->payment_status === 'partially_paid')
                                    <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                        {{ app()->getLocale() === 'ar' ? 'عربون مدفوع' : 'Deposit Paid' }}
                                    </span>
                                @else
                                    <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                                        {{ app()->getLocale() === 'ar' ? 'معلق الدفع' : 'Unpaid' }}
                                    </span>
                                @endif
                            </td>
                            <td class="py-3.5 px-4">
                                @if($booking->status === 'confirmed' || $booking->status === 'paid')
                                    <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        {{ app()->getLocale() === 'ar' ? 'مؤكد' : 'Confirmed' }}
                                    </span>
                                @elseif($booking->status === 'pending')
                                    <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                        {{ app()->getLocale() === 'ar' ? 'قيد المراجعة' : 'Pending' }}
                                    </span>
                                @else
                                    <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-50 text-gray-700 border border-gray-200">
                                        {{ $booking->status }}
                                    </span>
                                @endif
                            </td>
                            <td class="py-3.5 px-4 text-center">
                                <a href="https://wa.me/201000000000?text=Booking%20Inquiry%20{{ $booking->reference }}" target="_blank" class="p-1.5 inline-block text-emerald-600 hover:text-emerald-700 bg-emerald-50 rounded-lg mr-1" title="WhatsApp Concierge">
                                    💬
                                </a>
                                <button onclick="alert('Booking Reference: {{ $booking->reference }}\nGuest: {{ $booking->customer->name ?? 'Guest' }}\nStatus: {{ $booking->status }}')" class="p-1.5 inline-block text-brand-brown hover:text-brand-terracotta bg-brand-sand-light rounded-lg text-xs font-semibold px-2">
                                    {{ app()->getLocale() === 'ar' ? 'تفاصيل' : 'View' }}
                                </button>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="8" class="text-center py-10 text-brand-brown-muted">
                                {{ app()->getLocale() === 'ar' ? 'لا توجد حجوزات مسجلة في هذا القسم.' : 'No reservations found in this section.' }}
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>

</div>
@endsection
