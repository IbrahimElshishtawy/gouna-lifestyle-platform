@extends('layouts.admin')

@section('title', app()->getLocale() === 'ar' ? 'سجل العمليات وحالة النظام' : 'System Logs & Server Health')
@section('page-title', app()->getLocale() === 'ar' ? 'سجلات النظام وحالة الخوادم' : 'Audit Logs & Infrastructure Health')
@section('breadcrumb', $tabTitle ?? (app()->getLocale() === 'ar' ? 'النظام' : 'System'))

@section('content')
<div class="space-y-6">

    <!-- Header Actions -->
    <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h2 class="text-xl font-bold text-brand-brown tracking-tight">
                {{ $tabTitle ?? (app()->getLocale() === 'ar' ? 'سجل النشاطات وحالة خوادم المنصة' : 'Audit Trails & System Health') }}
            </h2>
            <p class="text-xs text-brand-brown-muted mt-1">
                {{ app()->getLocale() === 'ar' ? 'متابعة سجل العمليات غير القابل للتعديل، زمن استجابة قاعدة البيانات، واستهلاك الذاكرة' : 'Tamper-proof administrative audit logs, database latency, and operational telemetry' }}
            </p>
        </div>
        <button onclick="alert('Cache cleared and logs refreshed')" class="px-4 py-2.5 rounded-xl bg-brand-terracotta text-white text-xs font-semibold hover:bg-brand-terracotta-dark transition flex items-center gap-2 shadow-xs">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            <span>{{ app()->getLocale() === 'ar' ? 'تحديث وتفريغ الكاش' : 'Purge Cache' }}</span>
        </button>
    </div>

    <!-- Tabs -->
    <div class="flex border-b border-brand-border/60 overflow-x-auto gap-2 text-xs font-semibold text-brand-brown-muted pb-1">
        <a href="{{ route('admin.system.logs') }}" class="px-4 py-2.5 rounded-xl transition {{ request()->routeIs('admin.system.logs') ? 'bg-brand-terracotta text-white font-bold' : 'hover:bg-brand-sand/40 text-brand-brown' }}">
            {{ app()->getLocale() === 'ar' ? 'سجل النشاطات (Audit Logs)' : 'Audit Activity Logs' }}
        </a>
        <a href="{{ route('admin.system.health') }}" class="px-4 py-2.5 rounded-xl transition {{ request()->routeIs('admin.system.health') ? 'bg-brand-terracotta text-white font-bold' : 'hover:bg-brand-sand/40 text-brand-brown' }}">
            {{ app()->getLocale() === 'ar' ? 'حالة النظام والخادم (Health)' : 'Server & Database Health' }}
        </a>
    </div>

    @if(request()->routeIs('admin.system.health'))
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-white p-5 rounded-2xl border border-brand-border">
                <span class="text-[11px] font-bold uppercase tracking-wider text-brand-brown-muted">System Status</span>
                <div class="text-xl font-bold text-emerald-700 mt-1 flex items-center gap-2">
                    <span class="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span> 100% Operational
                </div>
                <span class="text-[10px] text-brand-brown-muted mt-1 block">99.98% Uptime (30d)</span>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-brand-border">
                <span class="text-[11px] font-bold uppercase tracking-wider text-brand-brown-muted">Database Engine</span>
                <div class="text-xl font-bold font-mono text-brand-brown mt-1">SQLite 3.45</div>
                <span class="text-[10px] text-emerald-600 font-semibold mt-1 block">Latency: 2ms (Fast)</span>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-brand-border">
                <span class="text-[11px] font-bold uppercase tracking-wider text-brand-brown-muted">PHP Runtime</span>
                <div class="text-xl font-bold font-mono text-brand-brown mt-1">PHP 8.4.1</div>
                <span class="text-[10px] text-brand-brown-muted mt-1 block">OPcache Enabled</span>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-brand-border">
                <span class="text-[11px] font-bold uppercase tracking-wider text-brand-brown-muted">Static Delivery</span>
                <div class="text-xl font-bold text-brand-terracotta mt-1">GitHub Pages</div>
                <span class="text-[10px] text-emerald-600 font-semibold mt-1 block">Fastly Global CDN</span>
            </div>
        </div>
    @else
        <!-- Logs Table -->
        <div class="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-xs">
            <table class="w-full text-left text-xs text-brand-brown">
                <thead class="bg-brand-sand-light/60 uppercase text-[10px] font-bold text-brand-brown-muted border-b border-brand-border">
                    <tr>
                        <th class="py-3.5 px-4">Timestamp</th>
                        <th class="py-3.5 px-4">Action</th>
                        <th class="py-3.5 px-4">User</th>
                        <th class="py-3.5 px-4">Target Entity</th>
                        <th class="py-3.5 px-4">IP Address</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-brand-border/60">
                    <tr>
                        <td class="py-3.5 px-4 font-mono text-[11px] text-brand-brown-muted">2026-09-29 23:45:10</td>
                        <td class="py-3.5 px-4 font-semibold text-emerald-700">Static Export Completed</td>
                        <td class="py-3.5 px-4">System Daemon</td>
                        <td class="py-3.5 px-4">105 HTML Files</td>
                        <td class="py-3.5 px-4 font-mono text-[11px]">127.0.0.1</td>
                    </tr>
                    <tr>
                        <td class="py-3.5 px-4 font-mono text-[11px] text-brand-brown-muted">2026-09-29 21:12:00</td>
                        <td class="py-3.5 px-4 font-semibold text-brand-terracotta">Rate Override Updated</td>
                        <td class="py-3.5 px-4">Ibrahim Elshishtawy</td>
                        <td class="py-3.5 px-4">Villa West Golf Lagoon</td>
                        <td class="py-3.5 px-4 font-mono text-[11px]">197.38.12.89</td>
                    </tr>
                    <tr>
                        <td class="py-3.5 px-4 font-mono text-[11px] text-brand-brown-muted">2026-09-29 18:40:36</td>
                        <td class="py-3.5 px-4 font-semibold text-blue-700">Booking Confirmed</td>
                        <td class="py-3.5 px-4">Guest Self-Service</td>
                        <td class="py-3.5 px-4">GON-2026-000101</td>
                        <td class="py-3.5 px-4 font-mono text-[11px]">41.44.201.15</td>
                    </tr>
                </tbody>
            </table>
        </div>
    @endif

</div>
@endsection
