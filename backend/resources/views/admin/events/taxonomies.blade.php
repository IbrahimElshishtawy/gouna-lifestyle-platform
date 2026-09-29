@extends('layouts.admin')

@section('title', $title ?? (app()->getLocale() === 'ar' ? 'إدارة تذاكر ودخول الفعاليات' : 'Event Tickets & Check-in'))
@section('page-title', $title ?? (app()->getLocale() === 'ar' ? 'تذاكر الفعاليات ودخول الحفلات' : 'Event Ticketing & Access Control'))
@section('breadcrumb', $title ?? (app()->getLocale() === 'ar' ? 'التذاكر والدخول' : 'Tickets & Entry'))

@section('content')
<div class="space-y-6">

    <!-- Header Actions -->
    <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h2 class="text-xl font-bold text-brand-brown tracking-tight">
                {{ $title ?? (app()->getLocale() === 'ar' ? 'التذاكر وكونسول الدخول السريع' : 'Ticketing & Gate Control') }}
            </h2>
            <p class="text-xs text-brand-brown-muted mt-1">
                {{ app()->getLocale() === 'ar' ? 'متابعة فئات التذاكر، طلبات الشراء، ومسح رمز الاستجابة السريع QR عند بوابات الحفلات والمهرجانات' : 'Manage ticket categories, monitor sales orders, and scan entrance QR codes for El Gouna nightlife and cultural events' }}
            </p>
        </div>
        <a href="{{ route('admin.events.create') }}" class="px-4 py-2.5 rounded-xl bg-brand-terracotta text-white text-xs font-semibold hover:bg-brand-terracotta-dark transition flex items-center gap-2 shadow-xs">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            <span>{{ app()->getLocale() === 'ar' ? 'إضافة فعالية جديدة' : 'Add Event' }}</span>
        </a>
    </div>

    <!-- Tabs -->
    <div class="flex border-b border-brand-border/60 overflow-x-auto gap-2 text-xs font-semibold text-brand-brown-muted pb-1">
        <a href="{{ route('admin.events.index') }}" class="px-4 py-2.5 rounded-xl transition {{ request()->routeIs('admin.events.index') ? 'bg-brand-terracotta text-white font-bold' : 'hover:bg-brand-sand/40 text-brand-brown' }}">
            {{ app()->getLocale() === 'ar' ? 'كل الفعاليات' : 'All Events' }}
        </a>
        <a href="{{ route('admin.events.tickets') }}" class="px-4 py-2.5 rounded-xl transition {{ request()->routeIs('admin.events.tickets') ? 'bg-brand-terracotta text-white font-bold' : 'hover:bg-brand-sand/40 text-brand-brown' }}">
            {{ app()->getLocale() === 'ar' ? 'فئات التذاكر' : 'Ticket Tiers' }}
        </a>
        <a href="{{ route('admin.events.orders') }}" class="px-4 py-2.5 rounded-xl transition {{ request()->routeIs('admin.events.orders') ? 'bg-brand-terracotta text-white font-bold' : 'hover:bg-brand-sand/40 text-brand-brown' }}">
            {{ app()->getLocale() === 'ar' ? 'طلبات التذاكر' : 'Ticket Orders' }}
        </a>
        <a href="{{ route('admin.events.checkin') }}" class="px-4 py-2.5 rounded-xl transition {{ request()->routeIs('admin.events.checkin') ? 'bg-brand-terracotta text-white font-bold' : 'hover:bg-brand-sand/40 text-brand-brown' }}">
            {{ app()->getLocale() === 'ar' ? 'مسح رمز QR للدخول' : 'QR Check-in Console' }}
        </a>
    </div>

    @if(request()->routeIs('admin.events.checkin'))
        <!-- QR Check-in Console UI -->
        <div class="bg-white p-8 rounded-2xl border border-brand-border shadow-xs max-w-xl mx-auto text-center space-y-4">
            <div class="w-16 h-16 rounded-full bg-brand-sand-light text-brand-terracotta flex items-center justify-center mx-auto text-2xl">
                📷
            </div>
            <h3 class="font-bold text-lg text-brand-brown">Gate Entrance QR Scanner</h3>
            <p class="text-xs text-brand-brown-muted">Scan the guest ticket QR code from their mobile screen or enter ticket reference manually.</p>
            <div class="flex gap-2">
                <input type="text" placeholder="Enter Reference (e.g. TKT-2026-9901)..." class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta p-3">
                <button onclick="alert('Ticket Verified: VIP Access Approved ✅')" class="px-5 py-3 rounded-xl bg-brand-terracotta text-white text-xs font-bold whitespace-nowrap">Verify</button>
            </div>
            <div class="text-[11px] text-emerald-700 bg-emerald-50 p-3 rounded-xl font-medium">
                Camera active • Auto-verification enabled for El Gouna Beach Festival 2026
            </div>
        </div>
    @elseif(request()->routeIs('admin.events.orders'))
        <div class="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-xs">
            <table class="w-full text-left text-xs">
                <thead class="bg-brand-sand-light/60 uppercase text-[10px] font-bold text-brand-brown-muted border-b border-brand-border">
                    <tr>
                        <th class="py-3 px-4">Order ID</th>
                        <th class="py-3 px-4">Attendee</th>
                        <th class="py-3 px-4">Event</th>
                        <th class="py-3 px-4">Tier</th>
                        <th class="py-3 px-4">Total</th>
                        <th class="py-3 px-4">Entry Status</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-brand-border/60">
                    <tr>
                        <td class="py-3 px-4 font-mono font-bold text-brand-terracotta">ORD-TK-1092</td>
                        <td class="py-3 px-4 font-semibold text-brand-brown">Karim Mansour</td>
                        <td class="py-3 px-4">El Gouna Beach Festival</td>
                        <td class="py-3 px-4"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">VIP Lounge</span></td>
                        <td class="py-3 px-4 font-bold">12,000 EGP</td>
                        <td class="py-3 px-4"><span class="text-emerald-700 font-semibold">Checked In (Gate 2)</span></td>
                    </tr>
                    <tr>
                        <td class="py-3 px-4 font-mono font-bold text-brand-terracotta">ORD-TK-1093</td>
                        <td class="py-3 px-4 font-semibold text-brand-brown">Nadine El-Sayed</td>
                        <td class="py-3 px-4">Smokery Lagoon Live Session</td>
                        <td class="py-3 px-4"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">General Admission</span></td>
                        <td class="py-3 px-4 font-bold">4,000 EGP</td>
                        <td class="py-3 px-4"><span class="text-brand-brown-muted">Pending Entry</span></td>
                    </tr>
                </tbody>
            </table>
        </div>
    @else
        <!-- Ticket Tiers -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">Ultra VIP Table</span>
                <h3 class="font-bold text-base text-brand-brown mt-2">Lagoon Stage VIP Table</h3>
                <p class="text-xs text-brand-brown-muted mt-1">Includes 8 passes, bottle service, and private valet.</p>
                <div class="mt-4 pt-3 border-t border-brand-border flex items-center justify-between text-xs">
                    <span class="font-bold text-brand-terracotta">40,000 EGP</span>
                    <span class="text-brand-brown font-semibold">12 Available</span>
                </div>
            </div>
            <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">General Access</span>
                <h3 class="font-bold text-base text-brand-brown mt-2">Standing Golden Circle</h3>
                <p class="text-xs text-brand-brown-muted mt-1">Full festival grounds entry with 1 welcome cocktail.</p>
                <div class="mt-4 pt-3 border-t border-brand-border flex items-center justify-between text-xs">
                    <span class="font-bold text-brand-terracotta">2,500 EGP</span>
                    <span class="text-brand-brown font-semibold">180 Available</span>
                </div>
            </div>
        </div>
    @endif

</div>
@endsection
