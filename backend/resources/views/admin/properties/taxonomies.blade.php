@extends('layouts.admin')

@section('title', $title ?? (app()->getLocale() === 'ar' ? 'إدارة تصنيفات ومواقع العقارات' : 'Property Taxonomies'))
@section('page-title', $title ?? (app()->getLocale() === 'ar' ? 'تصنيفات ومواقع العقارات' : 'Property Categories, Locations & Amenities'))
@section('breadcrumb', $title ?? (app()->getLocale() === 'ar' ? 'المعايير والتصنيفات' : 'Taxonomies'))

@section('content')
<div class="space-y-6">

    <!-- Header Actions -->
    <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h2 class="text-xl font-bold text-brand-brown tracking-tight">
                {{ $title ?? (app()->getLocale() === 'ar' ? 'معايير وتصنيفات الوحدات' : 'Property Classifications') }}
            </h2>
            <p class="text-xs text-brand-brown-muted mt-1">
                {{ app()->getLocale() === 'ar' ? 'إدارة مجمعات الجونة، التصنيفات الفاخرة، والمرافق المتوفرة في كل فيلا وشاليه' : 'Configure El Gouna compounds, luxury villa categories, and verified amenities' }}
            </p>
        </div>
        <button onclick="alert('Taxonomy addition saved successfully')" class="px-4 py-2.5 rounded-xl bg-brand-terracotta text-white text-xs font-semibold hover:bg-brand-terracotta-dark transition flex items-center gap-2 shadow-xs">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            <span>{{ app()->getLocale() === 'ar' ? 'إضافة بند جديد' : 'Add New Item' }}</span>
        </button>
    </div>

    <!-- Tabs -->
    <div class="flex border-b border-brand-border/60 overflow-x-auto gap-2 text-xs font-semibold text-brand-brown-muted pb-1">
        <a href="{{ route('admin.properties.categories') }}" class="px-4 py-2.5 rounded-xl transition {{ request()->routeIs('admin.properties.categories') ? 'bg-brand-terracotta text-white font-bold' : 'hover:bg-brand-sand/40 text-brand-brown' }}">
            {{ app()->getLocale() === 'ar' ? 'التصنيفات' : 'Categories' }}
        </a>
        <a href="{{ route('admin.properties.locations') }}" class="px-4 py-2.5 rounded-xl transition {{ request()->routeIs('admin.properties.locations') ? 'bg-brand-terracotta text-white font-bold' : 'hover:bg-brand-sand/40 text-brand-brown' }}">
            {{ app()->getLocale() === 'ar' ? 'المواقع ومجمعات الجونة' : 'Compounds & Locations' }}
        </a>
        <a href="{{ route('admin.properties.amenities') }}" class="px-4 py-2.5 rounded-xl transition {{ request()->routeIs('admin.properties.amenities') ? 'bg-brand-terracotta text-white font-bold' : 'hover:bg-brand-sand/40 text-brand-brown' }}">
            {{ app()->getLocale() === 'ar' ? 'المرافق والمميزات' : 'Amenities & Features' }}
        </a>
    </div>

    <!-- Content Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        @if(request()->routeIs('admin.properties.locations'))
            @php
                $locationsList = [
                    ['name' => 'Abu Tig Marina', 'ar' => 'مارينا أبو تيج', 'count' => 3, 'desc' => 'Waterfront yachts, promenades & dining.'],
                    ['name' => 'Fanadir Bay', 'ar' => 'خليج فنادير', 'count' => 2, 'desc' => 'Ultra-exclusive private beachfront estates.'],
                    ['name' => 'West Golf', 'ar' => 'الجولف الغربي', 'count' => 2, 'desc' => 'Scenic lagoons directly facing PGA championship golf.'],
                    ['name' => 'Mangroovy', 'ar' => 'مانجروفي', 'count' => 1, 'desc' => 'Beachfront kitesurf sanctuary with club facilities.'],
                    ['name' => 'Tawila Island', 'ar' => 'جزيرة طويلة', 'count' => 1, 'desc' => 'Pristine turquoise lagoon islands.'],
                ];
            @endphp
            @foreach($locationsList as $loc)
                <div class="bg-white p-5 rounded-2xl border border-brand-border shadow-xs hover:border-brand-terracotta/40 transition">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-xs font-bold text-brand-terracotta uppercase tracking-wider">Location</span>
                        <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-sand-light text-brand-brown">{{ $loc['count'] }} Villas</span>
                    </div>
                    <h3 class="font-bold text-base text-brand-brown">{{ $loc['name'] }}</h3>
                    <p class="text-xs text-brand-brown-muted mt-1">{{ $loc['desc'] }}</p>
                    <div class="mt-4 pt-3 border-t border-brand-border/60 flex items-center justify-between text-xs">
                        <span class="text-brand-brown-muted font-medium">{{ $loc['ar'] }}</span>
                        <button class="text-brand-terracotta font-semibold hover:underline">Edit</button>
                    </div>
                </div>
            @endforeach
        @elseif(request()->routeIs('admin.properties.amenities'))
            @php
                $amenitiesList = [
                    ['icon' => '🏊‍♂️', 'name' => 'Private Heated Pool', 'ar' => 'حمام سباحة خاص ومدفأ', 'units' => 8],
                    ['icon' => '🏖️', 'name' => 'Direct Beach Access', 'ar' => 'شاطئ رملي مباشر', 'units' => 6],
                    ['icon' => '📶', 'name' => 'High-Speed Fiber WiFi', 'ar' => 'إنترنت فائق السرعة', 'units' => 9],
                    ['icon' => '🚤', 'name' => 'Private Boat Jetty', 'ar' => 'مرسى يخوت خاص', 'units' => 4],
                    ['icon' => '⛳', 'name' => 'Golf Course Panorama', 'ar' => 'إطلالة مباشرة على الجولف', 'units' => 5],
                    ['icon' => '❄️', 'name' => 'Central Climatization', 'ar' => 'تكييف مركزي متكامل', 'units' => 9],
                ];
            @endphp
            @foreach($amenitiesList as $amenity)
                <div class="bg-white p-5 rounded-2xl border border-brand-border shadow-xs hover:border-brand-terracotta/40 transition">
                    <div class="text-2xl mb-2">{{ $amenity['icon'] }}</div>
                    <h3 class="font-bold text-sm text-brand-brown">{{ $amenity['name'] }}</h3>
                    <p class="text-xs text-brand-brown-muted mt-0.5">{{ $amenity['ar'] }}</p>
                    <div class="mt-3 pt-3 border-t border-brand-border/60 flex items-center justify-between text-[11px]">
                        <span class="text-brand-brown-muted font-medium">Verified in {{ $amenity['units'] }} properties</span>
                        <button class="text-brand-terracotta font-semibold hover:underline">Edit</button>
                    </div>
                </div>
            @endforeach
        @else
            @php
                $categoriesList = [
                    ['name' => 'Luxury Villas', 'ar' => 'فلل فاخرة', 'count' => 5, 'badge' => 'Prime'],
                    ['name' => 'Lagoon Chalets', 'ar' => 'شاليهات لاجون', 'count' => 2, 'badge' => 'Waterfront'],
                    ['name' => 'Marina Penthouses', 'ar' => 'بنتهاوس المارينا', 'count' => 1, 'badge' => 'Panoramic'],
                    ['name' => 'Golf Residences', 'ar' => 'منازل الجولف', 'count' => 1, 'badge' => 'Sport & Nature'],
                ];
            @endphp
            @foreach($categoriesList as $cat)
                <div class="bg-white p-5 rounded-2xl border border-brand-border shadow-xs hover:border-brand-terracotta/40 transition">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-xs font-bold text-brand-terracotta uppercase tracking-wider">{{ $cat['badge'] }}</span>
                        <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-sand-light text-brand-brown">{{ $cat['count'] }} Units</span>
                    </div>
                    <h3 class="font-bold text-base text-brand-brown">{{ $cat['name'] }}</h3>
                    <p class="text-xs text-brand-brown-muted mt-1">{{ $cat['ar'] }}</p>
                    <div class="mt-4 pt-3 border-t border-brand-border/60 flex items-center justify-between text-xs">
                        <span class="text-brand-brown-muted font-medium">Status: Active</span>
                        <button class="text-brand-terracotta font-semibold hover:underline">Edit</button>
                    </div>
                </div>
            @endforeach
        @endif
    </div>

</div>
@endsection
