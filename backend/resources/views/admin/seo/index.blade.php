@extends('layouts.admin')

@section('title', app()->getLocale() === 'ar' ? 'تهيئة محركات البحث SEO' : 'SEO & Redirects Engine')
@section('page-title', app()->getLocale() === 'ar' ? 'تهيئة محركات البحث وروابط التوجيه' : 'Search Engine Optimization & Meta Control')
@section('breadcrumb', $tabTitle ?? (app()->getLocale() === 'ar' ? 'SEO' : 'SEO Management'))

@section('content')
<div class="space-y-6">

    <!-- Header Actions -->
    <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h2 class="text-xl font-bold text-brand-brown tracking-tight">
                {{ $tabTitle ?? (app()->getLocale() === 'ar' ? 'إعدادات محركات البحث وروابط المشاركة' : 'Search Engine Optimization (SEO)') }}
            </h2>
            <p class="text-xs text-brand-brown-muted mt-1">
                {{ app()->getLocale() === 'ar' ? 'تخصيص العناوين، بطاقات OpenGraph للواتساب ومواقع التواصل، خريطة الموقع XML وقواعد إعادة التوجيه 301' : 'Configure meta titles, social preview cards, auto-generated XML sitemaps, and 301 URL redirect rules' }}
            </p>
        </div>
        <button onclick="alert('SEO Settings Saved')" class="px-4 py-2.5 rounded-xl bg-brand-terracotta text-white text-xs font-semibold hover:bg-brand-terracotta-dark transition flex items-center gap-2 shadow-xs">
            <span>{{ app()->getLocale() === 'ar' ? 'حفظ إعدادات SEO' : 'Save Meta Configuration' }}</span>
        </button>
    </div>

    <!-- Tabs -->
    <div class="flex border-b border-brand-border/60 overflow-x-auto gap-2 text-xs font-semibold text-brand-brown-muted pb-1">
        <a href="{{ route('admin.seo.global') }}" class="px-4 py-2.5 rounded-xl transition {{ request()->routeIs('admin.seo.global') ? 'bg-brand-terracotta text-white font-bold' : 'hover:bg-brand-sand/40 text-brand-brown' }}">
            {{ app()->getLocale() === 'ar' ? 'إعدادات SEO العامة والـ OG' : 'Global Meta & Social Cards' }}
        </a>
        <a href="{{ route('admin.seo.sitemap') }}" class="px-4 py-2.5 rounded-xl transition {{ request()->routeIs('admin.seo.sitemap') ? 'bg-brand-terracotta text-white font-bold' : 'hover:bg-brand-sand/40 text-brand-brown' }}">
            {{ app()->getLocale() === 'ar' ? 'خريطة الموقع (Sitemap XML)' : 'XML Sitemap' }}
        </a>
        <a href="{{ route('admin.seo.redirects') }}" class="px-4 py-2.5 rounded-xl transition {{ request()->routeIs('admin.seo.redirects') ? 'bg-brand-terracotta text-white font-bold' : 'hover:bg-brand-sand/40 text-brand-brown' }}">
            {{ app()->getLocale() === 'ar' ? 'إعادة التوجيه (301 Redirects)' : '301 Redirects Manager' }}
        </a>
    </div>

    @if(request()->routeIs('admin.seo.sitemap'))
        <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs space-y-4">
            <div class="flex items-center justify-between">
                <h3 class="font-bold text-sm text-brand-brown">Dynamic XML Sitemap Status</h3>
                <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Generated &amp; Indexed</span>
            </div>
            <p class="text-xs text-brand-brown-muted">All 105 static and dynamic URLs are submitted to Google Search Console and Bing Webmaster.</p>
            <div class="p-3 bg-brand-sand-light rounded-xl font-mono text-xs flex justify-between items-center text-brand-brown">
                <span>https://ibrahimelshishtawy.github.io/gouna-lifestyle-platform/sitemap.xml</span>
                <button onclick="alert('Pinged Googlebot')" class="text-brand-terracotta font-bold text-xs hover:underline">Ping Crawlers</button>
            </div>
        </div>
    @elseif(request()->routeIs('admin.seo.redirects'))
        <div class="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-xs">
            <table class="w-full text-left text-xs">
                <thead class="bg-brand-sand-light/60 uppercase text-[10px] font-bold text-brand-brown-muted border-b border-brand-border">
                    <tr>
                        <th class="py-3 px-4">Old Source URL</th>
                        <th class="py-3 px-4">Destination URL</th>
                        <th class="py-3 px-4">Status</th>
                        <th class="py-3 px-4">Hits</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-brand-border/60">
                    <tr>
                        <td class="py-3 px-4 font-mono text-rose-700">/villas/abu-tig</td>
                        <td class="py-3 px-4 font-mono text-emerald-700">/stays/abu-tig-marina-penthouse</td>
                        <td class="py-3 px-4"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">301 Permanent</span></td>
                        <td class="py-3 px-4 font-bold">412</td>
                    </tr>
                </tbody>
            </table>
        </div>
    @else
        <!-- Global Meta Form -->
        <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs space-y-4">
            <div>
                <label class="block text-xs font-semibold text-brand-brown-muted mb-1">Global Meta Title</label>
                <input type="text" value="GouNow | Luxury Stays, Real Estate &amp; Bespoke Experiences in El Gouna" class="w-full text-xs rounded-xl border-brand-border p-3">
            </div>
            <div>
                <label class="block text-xs font-semibold text-brand-brown-muted mb-1">Global Meta Description</label>
                <textarea rows="3" class="w-full text-xs rounded-xl border-brand-border p-3">Discover curated luxury vacation rentals, waterfront lagoon chalets, yacht charters, and desert adventures in El Gouna, Red Sea, Egypt.</textarea>
            </div>
            <div>
                <label class="block text-xs font-semibold text-brand-brown-muted mb-1">OpenGraph Preview Image URL</label>
                <input type="text" value="https://ibrahimelshishtawy.github.io/gouna-lifestyle-platform/assets/images/logo.jpg" class="w-full text-xs rounded-xl border-brand-border p-3 font-mono">
            </div>
        </div>
    @endif

</div>
@endsection
