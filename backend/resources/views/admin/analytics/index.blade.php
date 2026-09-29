@extends('layouts.admin')

@section('title', app()->getLocale() === 'ar' ? 'الإحصائيات والتحليلات' : 'Analytics & Conversion Tracking')
@section('page-title', app()->getLocale() === 'ar' ? 'تحليلات الأداء ومصادر التحويل' : 'Analytics, GA4 Tracking & Conversion Funnels')
@section('breadcrumb', $tabTitle ?? (app()->getLocale() === 'ar' ? 'التحليلات' : 'Analytics'))

@section('content')
<div class="space-y-6">

    <!-- Header Actions -->
    <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h2 class="text-xl font-bold text-brand-brown tracking-tight">
                {{ $tabTitle ?? (app()->getLocale() === 'ar' ? 'إحصائيات الأداء والحجوزات ومصادر الزيارات' : 'Performance Analytics & Tracking') }}
            </h2>
            <p class="text-xs text-brand-brown-muted mt-1">
                {{ app()->getLocale() === 'ar' ? 'ربط Google Analytics 4 و Google Tag Manager وتتبع نقرات الحجز ومحادثات واتساب' : 'Monitor luxury booking conversions, WhatsApp inquiries, and high-intent buyer traffic' }}
            </p>
        </div>
        <button onclick="alert('Analytics Saved')" class="px-4 py-2.5 rounded-xl bg-brand-terracotta text-white text-xs font-semibold hover:bg-brand-terracotta-dark transition flex items-center gap-2 shadow-xs">
            <span>{{ app()->getLocale() === 'ar' ? 'حفظ إعدادات التتبع' : 'Save Tracking IDs' }}</span>
        </button>
    </div>

    <!-- Tabs -->
    <div class="flex border-b border-brand-border/60 overflow-x-auto gap-2 text-xs font-semibold text-brand-brown-muted pb-1">
        <a href="{{ route('admin.analytics.tracking') }}" class="px-4 py-2.5 rounded-xl transition {{ request()->routeIs('admin.analytics.tracking') ? 'bg-brand-terracotta text-white font-bold' : 'hover:bg-brand-sand/40 text-brand-brown' }}">
            {{ app()->getLocale() === 'ar' ? 'إعدادات GA4 و GTM' : 'GA4 & Pixel Tracking' }}
        </a>
        <a href="{{ route('admin.analytics.reports') }}" class="px-4 py-2.5 rounded-xl transition {{ request()->routeIs('admin.analytics.reports') ? 'bg-brand-terracotta text-white font-bold' : 'hover:bg-brand-sand/40 text-brand-brown' }}">
            {{ app()->getLocale() === 'ar' ? 'تقارير المبيعات والتحويل' : 'Reports & Conversion Funnels' }}
        </a>
    </div>

    @if(request()->routeIs('admin.analytics.reports'))
        <!-- KPI Funnel -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs text-center">
                <span class="text-xs font-bold text-brand-brown-muted uppercase">Website Visitors (30 Days)</span>
                <div class="text-3xl font-bold font-serif text-brand-brown mt-2">48,290</div>
                <span class="text-[11px] text-emerald-600 font-semibold">↑ 24% Organic Traffic</span>
            </div>
            <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs text-center">
                <span class="text-xs font-bold text-brand-brown-muted uppercase">WhatsApp Inquiries</span>
                <div class="text-3xl font-bold font-serif text-brand-terracotta mt-2">1,280</div>
                <span class="text-[11px] text-emerald-600 font-semibold">2.6% Visitor Conversion</span>
            </div>
            <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs text-center">
                <span class="text-xs font-bold text-brand-brown-muted uppercase">Confirmed Reservations</span>
                <div class="text-3xl font-bold font-serif text-emerald-700 mt-2">184</div>
                <span class="text-[11px] text-brand-brown-muted font-semibold">3.8M EGP Gross Bookings</span>
            </div>
        </div>
    @else
        <!-- Tracking IDs Form -->
        <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs space-y-4">
            <div>
                <label class="block text-xs font-semibold text-brand-brown-muted mb-1">Google Analytics 4 Measurement ID</label>
                <input type="text" value="G-GOUNOW2026" class="w-full text-xs rounded-xl border-brand-border p-3 font-mono">
            </div>
            <div>
                <label class="block text-xs font-semibold text-brand-brown-muted mb-1">Google Tag Manager Container ID</label>
                <input type="text" value="GTM-ELGOUNA" class="w-full text-xs rounded-xl border-brand-border p-3 font-mono">
            </div>
            <div>
                <label class="block text-xs font-semibold text-brand-brown-muted mb-1">Meta / Facebook Pixel ID</label>
                <input type="text" value="982347109283741" class="w-full text-xs rounded-xl border-brand-border p-3 font-mono">
            </div>
        </div>
    @endif

</div>
@endsection
