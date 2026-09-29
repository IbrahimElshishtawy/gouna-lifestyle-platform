@extends('layouts.admin')

@section('title', app()->getLocale() === 'ar' ? 'إدارة المحتوى والموقع CMS' : 'Content & CMS Management')
@section('page-title', app()->getLocale() === 'ar' ? 'إدارة محتوى المنصة CMS' : 'CMS & Page Content Engine')
@section('breadcrumb', $tabTitle ?? (app()->getLocale() === 'ar' ? 'المحتوى' : 'CMS'))

@section('content')
<div class="space-y-6">

    <!-- Header Actions -->
    <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h2 class="text-xl font-bold text-brand-brown tracking-tight">
                {{ $tabTitle ?? (app()->getLocale() === 'ar' ? 'إدارة محتوى المنصة والصفحات الثابتة' : 'Content Management System (CMS)') }}
            </h2>
            <p class="text-xs text-brand-brown-muted mt-1">
                {{ app()->getLocale() === 'ar' ? 'تعديل بنرات الصفحة الرئيسية، مقالات المدونة، الأسئلة الشائعة، وقوائم التصفح' : 'Edit hero headlines, articles, concierge guides, FAQs, and navigation menus' }}
            </p>
        </div>
        <button onclick="alert('CMS Content Saved')" class="px-4 py-2.5 rounded-xl bg-brand-terracotta text-white text-xs font-semibold hover:bg-brand-terracotta-dark transition flex items-center gap-2 shadow-xs">
            <span>{{ app()->getLocale() === 'ar' ? 'حفظ ونشر التعديلات' : 'Publish Changes' }}</span>
        </button>
    </div>

    <!-- Tabs -->
    <div class="flex border-b border-brand-border/60 overflow-x-auto gap-2 text-xs font-semibold text-brand-brown-muted pb-1">
        <a href="{{ route('admin.cms.homepage') }}" class="px-4 py-2.5 rounded-xl transition {{ request()->routeIs('admin.cms.homepage') ? 'bg-brand-terracotta text-white font-bold' : 'hover:bg-brand-sand/40 text-brand-brown' }}">
            {{ app()->getLocale() === 'ar' ? 'الصفحة الرئيسية' : 'Homepage Hero & Sections' }}
        </a>
        <a href="{{ route('admin.cms.pages') }}" class="px-4 py-2.5 rounded-xl transition {{ request()->routeIs('admin.cms.pages') ? 'bg-brand-terracotta text-white font-bold' : 'hover:bg-brand-sand/40 text-brand-brown' }}">
            {{ app()->getLocale() === 'ar' ? 'الصفحات الثابتة' : 'Static Pages' }}
        </a>
        <a href="{{ route('admin.cms.faqs') }}" class="px-4 py-2.5 rounded-xl transition {{ request()->routeIs('admin.cms.faqs') ? 'bg-brand-terracotta text-white font-bold' : 'hover:bg-brand-sand/40 text-brand-brown' }}">
            {{ app()->getLocale() === 'ar' ? 'الأسئلة الشائعة (FAQs)' : 'FAQs' }}
        </a>
        <a href="{{ route('admin.cms.blog') }}" class="px-4 py-2.5 rounded-xl transition {{ request()->routeIs('admin.cms.blog') ? 'bg-brand-terracotta text-white font-bold' : 'hover:bg-brand-sand/40 text-brand-brown' }}">
            {{ app()->getLocale() === 'ar' ? 'المقالات والأخبار' : 'Journal & Stories' }}
        </a>
        <a href="{{ route('admin.cms.navigation') }}" class="px-4 py-2.5 rounded-xl transition {{ request()->routeIs('admin.cms.navigation') ? 'bg-brand-terracotta text-white font-bold' : 'hover:bg-brand-sand/40 text-brand-brown' }}">
            {{ app()->getLocale() === 'ar' ? 'قوائم التصفح' : 'Navigation Menus' }}
        </a>
    </div>

    @if(request()->routeIs('admin.cms.faqs'))
        <div class="space-y-4">
            <div class="bg-white p-5 rounded-2xl border border-brand-border shadow-xs">
                <h4 class="font-bold text-sm text-brand-brown">What is the standard check-in time for luxury villas?</h4>
                <p class="text-xs text-brand-brown-muted mt-1">Check-in begins at 3:00 PM and check-out is by 12:00 PM. Early check-in can be arranged via your VIP concierge.</p>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-brand-border shadow-xs">
                <h4 class="font-bold text-sm text-brand-brown">Are private boat captains licensed and certified?</h4>
                <p class="text-xs text-brand-brown-muted mt-1">Yes, all captains hold Red Sea Marine authority maritime captain credentials and safety equipment is inspected monthly.</p>
            </div>
        </div>
    @elseif(request()->routeIs('admin.cms.blog'))
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="bg-white p-5 rounded-2xl border border-brand-border shadow-xs">
                <span class="text-[10px] font-bold text-brand-terracotta uppercase">Architecture</span>
                <h3 class="font-bold text-base text-brand-brown mt-1">Michael Graves &amp; El Gouna Nubian Masterpieces</h3>
                <p class="text-xs text-brand-brown-muted mt-1">How iconic terracotta domes and turquoise lagoon channels created Egypt's premier lifestyle town.</p>
                <div class="mt-4 pt-3 border-t border-brand-border text-xs flex justify-between items-center text-brand-brown-muted">
                    <span>Published: Sep 2026</span>
                    <button class="text-brand-terracotta font-semibold hover:underline">Edit Article</button>
                </div>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-brand-border shadow-xs">
                <span class="text-[10px] font-bold text-brand-terracotta uppercase">Lifestyle</span>
                <h3 class="font-bold text-base text-brand-brown mt-1">The Insider Guide to Tawila Island Sandbanks</h3>
                <p class="text-xs text-brand-brown-muted mt-1">Crystal lagoons, dolphins, and secluded beach picnics reachable only by private yacht charter.</p>
                <div class="mt-4 pt-3 border-t border-brand-border text-xs flex justify-between items-center text-brand-brown-muted">
                    <span>Published: Sep 2026</span>
                    <button class="text-brand-terracotta font-semibold hover:underline">Edit Article</button>
                </div>
            </div>
        </div>
    @else
        <!-- Homepage Hero Editor -->
        <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs space-y-5">
            <h3 class="font-bold text-base text-brand-brown">Hero Banner Configuration</h3>
            <div>
                <label class="block text-xs font-semibold text-brand-brown-muted mb-1">Headline (English)</label>
                <input type="text" value="Sanctuaries of Sun, Sea &amp; Red Sea Splendor" class="w-full text-xs rounded-xl border-brand-border p-3">
            </div>
            <div>
                <label class="block text-xs font-semibold text-brand-brown-muted mb-1">Headline (Arabic)</label>
                <input type="text" value="ملاذات الشمس والبحر وسحر البحر الأحمر" class="w-full text-xs rounded-xl border-brand-border p-3 text-right">
            </div>
            <div>
                <label class="block text-xs font-semibold text-brand-brown-muted mb-1">Subheadline Summary</label>
                <textarea rows="3" class="w-full text-xs rounded-xl border-brand-border p-3">The premier destination for bespoke luxury vacation rentals, exclusive real estate investments, yacht charters, and curated desert adventures in El Gouna.</textarea>
            </div>
        </div>
    @endif

</div>
@endsection
