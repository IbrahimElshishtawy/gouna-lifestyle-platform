@extends('layouts.admin')

@section('title', app()->getLocale() === 'ar' ? 'محرك الأسعار والمواسم' : 'Dynamic Pricing Engine')
@section('page-title', app()->getLocale() === 'ar' ? 'محرك الأسعار وقواعد المواسم' : 'Pricing Matrix, Seasons & Fees')
@section('breadcrumb', $tabTitle ?? (app()->getLocale() === 'ar' ? 'الأسعار' : 'Pricing'))

@section('content')
<div class="space-y-6">

    <!-- Header Actions -->
    <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h2 class="text-xl font-bold text-brand-brown tracking-tight">
                {{ $tabTitle ?? (app()->getLocale() === 'ar' ? 'محرك التسعير والمواسم الذكي' : 'Smart Pricing & Yield Management') }}
            </h2>
            <p class="text-xs text-brand-brown-muted mt-1">
                {{ app()->getLocale() === 'ar' ? 'ضبط الأسعار الأساسية لليلة، مضاعفات مواسم الأعياد ورأس السنة، وأكواد الخصم والرسوم الإضافية' : 'Configure base nightly rates, holiday season multipliers, promotional codes, and hospitality fees' }}
            </p>
        </div>
        <div class="flex items-center gap-3">
            <a href="{{ route('admin.pricing.calendar') }}" class="px-4 py-2.5 rounded-xl border border-brand-border bg-brand-sand-light text-brand-brown hover:border-brand-terracotta text-xs font-semibold flex items-center gap-2 transition">
                <svg class="w-4 h-4 text-brand-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                <span>{{ app()->getLocale() === 'ar' ? 'تقويم الأسعار' : 'Price Calendar' }}</span>
            </a>
            <button onclick="alert('Pricing adjustments saved successfully')" class="px-4 py-2.5 rounded-xl bg-brand-terracotta text-white text-xs font-semibold hover:bg-brand-terracotta-dark transition flex items-center gap-2 shadow-xs">
                <span>{{ app()->getLocale() === 'ar' ? 'حفظ التعديلات' : 'Save Changes' }}</span>
            </button>
        </div>
    </div>

    <!-- Pricing Tabs -->
    <div class="flex border-b border-brand-border/60 overflow-x-auto gap-2 text-xs font-semibold text-brand-brown-muted pb-1">
        <a href="{{ route('admin.pricing.base') }}" class="px-4 py-2.5 rounded-xl transition {{ request()->routeIs('admin.pricing.base') ? 'bg-brand-terracotta text-white font-bold' : 'hover:bg-brand-sand/40 text-brand-brown' }}">
            {{ app()->getLocale() === 'ar' ? 'الأسعار الأساسية للوحدات' : 'Base Rates Matrix' }}
        </a>
        <a href="{{ route('admin.pricing.seasons') }}" class="px-4 py-2.5 rounded-xl transition {{ request()->routeIs('admin.pricing.seasons') ? 'bg-brand-terracotta text-white font-bold' : 'hover:bg-brand-sand/40 text-brand-brown' }}">
            {{ app()->getLocale() === 'ar' ? 'المواسم والأولويات (Seasons)' : 'Seasonal Rules' }}
        </a>
        <a href="{{ route('admin.pricing.discounts') }}" class="px-4 py-2.5 rounded-xl transition {{ request()->routeIs('admin.pricing.discounts') ? 'bg-brand-terracotta text-white font-bold' : 'hover:bg-brand-sand/40 text-brand-brown' }}">
            {{ app()->getLocale() === 'ar' ? 'أكواد الخصم والترويج' : 'Promo Codes & Discounts' }}
        </a>
        <a href="{{ route('admin.pricing.fees') }}" class="px-4 py-2.5 rounded-xl transition {{ request()->routeIs('admin.pricing.fees') ? 'bg-brand-terracotta text-white font-bold' : 'hover:bg-brand-sand/40 text-brand-brown' }}">
            {{ app()->getLocale() === 'ar' ? 'رسوم النظافة والخدمات والضرائب' : 'Fees & Taxes' }}
        </a>
    </div>

    <!-- Active Tab Content -->
    @if(request()->routeIs('admin.pricing.seasons'))
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs">
                <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">Peak Season</span>
                <h3 class="font-bold text-base text-brand-brown mt-2">New Year &amp; Christmas</h3>
                <p class="text-xs text-brand-brown-muted mt-1">Dec 20 - Jan 10</p>
                <div class="mt-4 pt-4 border-t border-brand-border text-xs flex justify-between items-center">
                    <span class="font-bold text-brand-terracotta">+50% Multiplier (1.5x)</span>
                    <span class="text-brand-brown-muted">Min: 5 Nights</span>
                </div>
            </div>
            <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs">
                <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">High Season</span>
                <h3 class="font-bold text-base text-brand-brown mt-2">GFF &amp; Eid Holidays</h3>
                <p class="text-xs text-brand-brown-muted mt-1">Apr 15 - May 05</p>
                <div class="mt-4 pt-4 border-t border-brand-border text-xs flex justify-between items-center">
                    <span class="font-bold text-brand-terracotta">+35% Multiplier (1.35x)</span>
                    <span class="text-brand-brown-muted">Min: 4 Nights</span>
                </div>
            </div>
            <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs">
                <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Regular Season</span>
                <h3 class="font-bold text-base text-brand-brown mt-2">Autumn &amp; Spring Warmth</h3>
                <p class="text-xs text-brand-brown-muted mt-1">Oct 01 - Nov 30</p>
                <div class="mt-4 pt-4 border-t border-brand-border text-xs flex justify-between items-center">
                    <span class="font-bold text-emerald-700">Standard Rate (1.0x)</span>
                    <span class="text-brand-brown-muted">Min: 3 Nights</span>
                </div>
            </div>
        </div>
    @elseif(request()->routeIs('admin.pricing.discounts'))
        <div class="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-xs">
            <div class="p-4 border-b border-brand-border flex justify-between items-center bg-brand-sand-light/50">
                <h3 class="font-bold text-sm text-brand-brown">Active Promo Codes &amp; Campaign Vouchers</h3>
                <button class="text-xs font-bold text-brand-terracotta hover:underline">+ New Promo Code</button>
            </div>
            <table class="w-full text-left text-xs">
                <thead class="bg-brand-sand-light/40 uppercase text-[10px] font-bold text-brand-brown-muted border-b border-brand-border">
                    <tr>
                        <th class="py-3 px-4">Code</th>
                        <th class="py-3 px-4">Discount</th>
                        <th class="py-3 px-4">Min Spend</th>
                        <th class="py-3 px-4">Expiry</th>
                        <th class="py-3 px-4">Status</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-brand-border/60">
                    <tr>
                        <td class="py-3 px-4 font-mono font-bold text-brand-terracotta">GOUNA10</td>
                        <td class="py-3 px-4 font-bold text-emerald-700">10% OFF</td>
                        <td class="py-3 px-4">25,000 EGP</td>
                        <td class="py-3 px-4">Dec 31, 2026</td>
                        <td class="py-3 px-4"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Active</span></td>
                    </tr>
                    <tr>
                        <td class="py-3 px-4 font-mono font-bold text-brand-terracotta">VIPGUEST15</td>
                        <td class="py-3 px-4 font-bold text-emerald-700">15% OFF</td>
                        <td class="py-3 px-4">60,000 EGP</td>
                        <td class="py-3 px-4">Nov 30, 2026</td>
                        <td class="py-3 px-4"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Active</span></td>
                    </tr>
                </tbody>
            </table>
        </div>
    @elseif(request()->routeIs('admin.pricing.fees'))
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs space-y-4">
                <h3 class="font-bold text-sm text-brand-brown">Hospitality &amp; Cleaning Fees</h3>
                <div class="flex items-center justify-between text-xs py-2 border-b border-brand-border/60">
                    <span>Villa Deep Cleaning &amp; Sanitization</span>
                    <span class="font-bold text-brand-brown">1,500 EGP / stay</span>
                </div>
                <div class="flex items-center justify-between text-xs py-2 border-b border-brand-border/60">
                    <span>Chalet Turnover Fee</span>
                    <span class="font-bold text-brand-brown">800 EGP / stay</span>
                </div>
                <div class="flex items-center justify-between text-xs py-2">
                    <span>VIP Concierge Welcome Service</span>
                    <span class="font-bold text-emerald-700">Complimentary (0 EGP)</span>
                </div>
            </div>
            <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs space-y-4">
                <h3 class="font-bold text-sm text-brand-brown">Security Deposits &amp; Taxes</h3>
                <div class="flex items-center justify-between text-xs py-2 border-b border-brand-border/60">
                    <span>Refundable Villa Damage Deposit</span>
                    <span class="font-bold text-brand-brown">10,000 EGP (Held on Card)</span>
                </div>
                <div class="flex items-center justify-between text-xs py-2 border-b border-brand-border/60">
                    <span>Value Added Tax (VAT)</span>
                    <span class="font-bold text-brand-brown">14.0% Included</span>
                </div>
                <div class="flex items-center justify-between text-xs py-2">
                    <span>City Tourism Development Fee</span>
                    <span class="font-bold text-brand-brown">1.0% Included</span>
                </div>
            </div>
        </div>
    @else
        <!-- Base Rates Table -->
        <div class="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-xs">
            <table class="w-full text-left text-xs text-brand-brown">
                <thead class="bg-brand-sand-light/60 border-b border-brand-border uppercase text-[10px] font-bold tracking-wider text-brand-brown-muted">
                    <tr>
                        <th class="py-3.5 px-4">{{ app()->getLocale() === 'ar' ? 'الوحدة' : 'Property Unit' }}</th>
                        <th class="py-3.5 px-4">{{ app()->getLocale() === 'ar' ? 'الموقع' : 'Location' }}</th>
                        <th class="py-3.5 px-4">{{ app()->getLocale() === 'ar' ? 'السعر الأساسي / ليلة' : 'Base Nightly Rate' }}</th>
                        <th class="py-3.5 px-4">{{ app()->getLocale() === 'ar' ? 'نهاية الأسبوع (الخميس/الجمعة)' : 'Weekend Surcharge' }}</th>
                        <th class="py-3.5 px-4">{{ app()->getLocale() === 'ar' ? 'الحد الأدنى لليالي' : 'Min Nights' }}</th>
                        <th class="py-3.5 px-4 text-center">{{ app()->getLocale() === 'ar' ? 'إجراءات' : 'Actions' }}</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-brand-border/60">
                    @foreach($properties as $prop)
                        <tr class="hover:bg-brand-sand-light/30">
                            <td class="py-3.5 px-4 font-bold text-brand-brown">{{ $prop->title }}</td>
                            <td class="py-3.5 px-4 text-brand-brown-muted">{{ $prop->location->name ?? 'El Gouna' }}</td>
                            <td class="py-3.5 px-4 font-bold text-brand-terracotta">
                                {{ number_format($prop->base_nightly_rate_cents / 100) }} {{ $prop->currency }}
                            </td>
                            <td class="py-3.5 px-4 text-brand-brown font-semibold">+15%</td>
                            <td class="py-3.5 px-4 text-brand-brown-muted">{{ $prop->min_nights ?? 3 }} nights</td>
                            <td class="py-3.5 px-4 text-center">
                                <a href="{{ route('admin.properties.edit', $prop->id) }}" class="text-xs font-semibold text-brand-terracotta hover:underline">
                                    Edit Rates
                                </a>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    @endif

</div>
@endsection
