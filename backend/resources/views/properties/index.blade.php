@extends('layouts.app')

@section('title', ($listingType === 'sale' ? 'Properties For Sale' : 'Luxury Vacation Rentals') . ' in El Gouna | GouNow')

@section('content')

<!-- Header Banner -->
<div class="bg-gradient-to-b from-brand-sand-light/60 to-[#FAF8F5] border-b border-brand-border py-12 lg:py-16">
    <div class="max-w-7xl mx-auto px-6 lg:px-12">
        <div class="max-w-2xl space-y-3">
            <span class="text-xs font-bold uppercase tracking-[0.25em] text-brand-terracotta">
                {{ app()->getLocale() === 'ar' ? 'إقامات وعقارات الجونة' : 'Curated Portfolio' }}
            </span>
            <h1 class="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-brand-brown">
                {{ $listingType === 'sale' 
                    ? (app()->getLocale() === 'ar' ? 'عقارات للبيع في الجونة' : 'Prime Real Estate For Sale')
                    : (app()->getLocale() === 'ar' ? 'فلل وشاليهات للإيجار' : 'Curated Vacation Rentals') }}
            </h1>
            <p class="text-xs sm:text-sm text-brand-brown-muted leading-relaxed font-light">
                {{ $listingType === 'sale'
                    ? 'Explore exclusive ready-to-move and off-plan properties with private lagoon access, marina berths, and premium rental yield potential.'
                    : 'Discover private lagoon waterfront villas, heated swimming pools, and signature marina residences.' }}
            </p>
        </div>

        <!-- Filter Bar -->
        <div class="mt-8 bg-white p-5 rounded-3xl border border-brand-border shadow-xs">
            <form method="GET" action="{{ route('properties.index') }}" class="space-y-4">
                
                <!-- Listing Type Toggle & Sort -->
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-4">
                    <!-- Type Tabs -->
                    <div class="flex items-center gap-2">
                        <a href="{{ route('properties.index', array_merge(request()->query(), ['listing_type' => 'rent'])) }}" 
                           class="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition
                                  {{ $listingType === 'rent' ? 'bg-brand-terracotta text-white shadow-xs' : 'bg-brand-sand-light text-brand-brown hover:bg-brand-sand/50' }}">
                            {{ app()->getLocale() === 'ar' ? 'إيجار سياحي' : 'Vacation Rentals' }}
                        </a>
                        <a href="{{ route('properties.index', array_merge(request()->query(), ['listing_type' => 'sale'])) }}" 
                           class="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition
                                  {{ $listingType === 'sale' ? 'bg-brand-terracotta text-white shadow-xs' : 'bg-brand-sand-light text-brand-brown hover:bg-brand-sand/50' }}">
                            {{ app()->getLocale() === 'ar' ? 'عقارات للبيع' : 'Properties For Sale' }}
                        </a>
                    </div>

                    <!-- Sort -->
                    <div class="flex items-center gap-2 text-xs">
                        <span class="text-brand-brown-muted">{{ app()->getLocale() === 'ar' ? 'الترتيب' : 'Sort by' }}:</span>
                        <select name="sort" onchange="this.form.submit()" class="bg-brand-sand-light/60 border border-brand-border rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none">
                            <option value="featured" {{ $sort === 'featured' ? 'selected' : '' }}>Featured First</option>
                            <option value="price_asc" {{ $sort === 'price_asc' ? 'selected' : '' }}>Price: Low to High</option>
                            <option value="price_desc" {{ $sort === 'price_desc' ? 'selected' : '' }}>Price: High to Low</option>
                            <option value="newest" {{ $sort === 'newest' ? 'selected' : '' }}>Newest</option>
                        </select>
                    </div>
                </div>

                <!-- Input Fields Grid -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    <input type="hidden" name="listing_type" value="{{ $listingType }}">

                    <!-- Location Dropdown -->
                    <div>
                        <label class="block text-[10px] font-bold uppercase tracking-wider text-brand-brown-muted mb-1">
                            {{ app()->getLocale() === 'ar' ? 'المنطقة' : 'Location' }}
                        </label>
                        <select name="location" class="w-full text-xs bg-brand-sand-light/60 border border-brand-border rounded-xl px-3 py-2 focus:outline-none">
                            <option value="all">{{ app()->getLocale() === 'ar' ? 'كل مناطق الجونة' : 'All Locations' }}</option>
                            @foreach($locations as $loc)
                                <option value="{{ $loc->slug }}" {{ $locationSlug === $loc->slug ? 'selected' : '' }}>{{ $loc->name }}</option>
                            @endforeach
                        </select>
                    </div>

                    <!-- Category Dropdown -->
                    <div>
                        <label class="block text-[10px] font-bold uppercase tracking-wider text-brand-brown-muted mb-1">
                            {{ app()->getLocale() === 'ar' ? 'نوع العقار' : 'Category' }}
                        </label>
                        <select name="category" class="w-full text-xs bg-brand-sand-light/60 border border-brand-border rounded-xl px-3 py-2 focus:outline-none">
                            <option value="all">{{ app()->getLocale() === 'ar' ? 'جميع الأنواع' : 'All Categories' }}</option>
                            @foreach($categories as $cat)
                                <option value="{{ $cat->slug }}" {{ $categorySlug === $cat->slug ? 'selected' : '' }}>{{ $cat->name }}</option>
                            @endforeach
                        </select>
                    </div>

                    <!-- Bedrooms -->
                    <div>
                        <label class="block text-[10px] font-bold uppercase tracking-wider text-brand-brown-muted mb-1">
                            {{ app()->getLocale() === 'ar' ? 'الغرف' : 'Bedrooms' }}
                        </label>
                        <select name="bedrooms" class="w-full text-xs bg-brand-sand-light/60 border border-brand-border rounded-xl px-3 py-2 focus:outline-none">
                            <option value="">{{ app()->getLocale() === 'ar' ? 'الكل' : 'Any' }}</option>
                            <option value="1" {{ $bedrooms == 1 ? 'selected' : '' }}>1+ Bed</option>
                            <option value="2" {{ $bedrooms == 2 ? 'selected' : '' }}>2+ Beds</option>
                            <option value="3" {{ $bedrooms == 3 ? 'selected' : '' }}>3+ Beds</option>
                            <option value="4" {{ $bedrooms == 4 ? 'selected' : '' }}>4+ Beds</option>
                        </select>
                    </div>

                    <!-- Guests or Price -->
                    @if($listingType === 'rent')
                        <div>
                            <label class="block text-[10px] font-bold uppercase tracking-wider text-brand-brown-muted mb-1">
                                {{ app()->getLocale() === 'ar' ? 'عدد النزلاء' : 'Min Guests' }}
                            </label>
                            <select name="guests" class="w-full text-xs bg-brand-sand-light/60 border border-brand-border rounded-xl px-3 py-2 focus:outline-none">
                                <option value="">{{ app()->getLocale() === 'ar' ? 'الكل' : 'Any' }}</option>
                                <option value="2" {{ $guests == 2 ? 'selected' : '' }}>2+ Guests</option>
                                <option value="4" {{ $guests == 4 ? 'selected' : '' }}>4+ Guests</option>
                                <option value="6" {{ $guests == 6 ? 'selected' : '' }}>6+ Guests</option>
                                <option value="8" {{ $guests == 8 ? 'selected' : '' }}>8+ Guests</option>
                            </select>
                        </div>
                    @else
                        <div>
                            <label class="block text-[10px] font-bold uppercase tracking-wider text-brand-brown-muted mb-1">
                                {{ app()->getLocale() === 'ar' ? 'الحد الأقصى للسعر' : 'Max Price (EGP)' }}
                            </label>
                            <input type="number" name="max_price" value="{{ $maxPrice }}" placeholder="e.g. 25000000"
                                   class="w-full text-xs bg-brand-sand-light/60 border border-brand-border rounded-xl px-3 py-2 focus:outline-none">
                        </div>
                    @endif

                    <!-- Submit & Clear -->
                    <div class="flex items-center gap-2">
                        <button type="submit" 
                                class="flex-1 py-2 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer">
                            {{ app()->getLocale() === 'ar' ? 'تطبيق الفلتر' : 'Filter' }}
                        </button>
                        <a href="{{ route('properties.index', ['listing_type' => $listingType]) }}" 
                           class="p-2 text-brand-brown-muted hover:text-brand-brown rounded-xl border border-brand-border text-xs text-center" title="Reset Filters">
                            ✕
                        </a>
                    </div>

                </div>

            </form>
        </div>
    </div>
</div>

<!-- Main Results Grid -->
<div class="max-w-7xl mx-auto px-6 lg:px-12 py-12">
    
    <div class="flex items-center justify-between mb-8">
        <span class="text-xs text-brand-brown-muted font-medium">
            Showing <strong class="text-brand-brown">{{ $properties->total() }}</strong> {{ $listingType === 'sale' ? 'properties for sale' : 'stays' }} in El Gouna
        </span>
    </div>

    @if($properties->isNotEmpty())
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            @foreach($properties as $property)
                <div class="group bg-white rounded-3xl overflow-hidden border border-brand-border shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col">
                    <!-- Image Area -->
                    <div class="relative h-64 overflow-hidden bg-brand-sand">
                        <img src="{{ $property->cover_url }}" 
                             alt="{{ $property->title }}" 
                             class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                        
                        <div class="absolute top-4 left-4 flex gap-2">
                            <span class="px-3 py-1 bg-white/90 backdrop-blur-md text-brand-brown text-[11px] font-bold rounded-full uppercase tracking-wider shadow-xs">
                                📍 {{ $property->location?->name ?? 'El Gouna' }}
                            </span>
                        </div>

                        @if($property->listing_type === 'sale')
                            <div class="absolute top-4 right-4">
                                <span class="px-3 py-1 bg-amber-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wider shadow-xs">
                                    For Sale
                                </span>
                            </div>
                        @elseif($property->is_featured)
                            <div class="absolute top-4 right-4">
                                <span class="px-3 py-1 bg-brand-terracotta text-white text-[10px] font-bold rounded-full uppercase tracking-wider shadow-xs">
                                    ★ Featured
                                </span>
                            </div>
                        @endif
                    </div>

                    <!-- Details Area -->
                    <div class="p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div class="space-y-2">
                            <div class="flex items-center gap-3 text-xs text-brand-brown-muted">
                                <span>{{ $property->bedrooms }} {{ app()->getLocale() === 'ar' ? 'غرف' : 'Beds' }}</span>
                                <span>•</span>
                                <span>{{ $property->bathrooms }} {{ app()->getLocale() === 'ar' ? 'حمامات' : 'Baths' }}</span>
                                @if($property->listing_type === 'rent')
                                    <span>•</span>
                                    <span>Max {{ $property->max_guests }} Guests</span>
                                @elseif($property->area_sqm)
                                    <span>•</span>
                                    <span>{{ number_format($property->area_sqm) }} m²</span>
                                @endif
                            </div>

                            <h3 class="font-serif text-lg font-bold text-brand-brown group-hover:text-brand-terracotta transition">
                                <a href="{{ route('properties.show', $property->slug) }}">{{ $property->title }}</a>
                            </h3>

                            <p class="text-xs text-brand-brown-muted line-clamp-2 leading-relaxed">
                                {{ $property->short_description_en }}
                            </p>
                        </div>

                        <div class="pt-4 border-t border-brand-border flex items-center justify-between">
                            <div>
                                <span class="text-xs text-brand-brown-muted block">{{ $property->listing_type === 'sale' ? 'Price' : 'Starting From' }}</span>
                                <span class="text-base font-bold text-brand-brown">
                                    @if($property->listing_type === 'sale')
                                        {{ $property->sale_price_cents ? number_format($property->sale_price_cents / 100) . ' ' . $property->currency : 'On Request' }}
                                    @else
                                        {{ number_format($property->base_price) }} <span class="text-xs font-normal text-brand-brown-muted">{{ $property->currency }} / night</span>
                                    @endif
                                </span>
                            </div>
                            <a href="{{ route('properties.show', $property->slug) }}" 
                               class="px-4 py-2 bg-brand-sand-light hover:bg-brand-sand text-brand-brown rounded-xl text-xs font-bold transition">
                                {{ $property->listing_type === 'sale' ? 'Inquire' : 'View Villa' }}
                            </a>
                        </div>
                    </div>
                </div>
            @endforeach
        </div>

        <!-- Pagination -->
        <div class="mt-12">
            {{ $properties->links() }}
        </div>
    @else
        <!-- Empty State -->
        <div class="bg-white rounded-3xl border border-brand-border p-12 text-center max-w-xl mx-auto space-y-4">
            <span class="text-4xl block">🔍</span>
            <h3 class="font-serif text-xl font-bold text-brand-brown">No properties matched your criteria</h3>
            <p class="text-xs text-brand-brown-muted leading-relaxed">
                Try adjusting your filters or contact our El Gouna VIP concierge for access to exclusive off-market villas and seasonal releases.
            </p>
            <div class="pt-2">
                <a href="{{ route('properties.index', ['listing_type' => $listingType]) }}" 
                   class="inline-block px-5 py-2.5 bg-brand-sand-light hover:bg-brand-sand text-brand-brown rounded-xl text-xs font-bold transition">
                    Clear Filters
                </a>
            </div>
        </div>
    @endif

</div>

@if($properties->isNotEmpty())
@push('scripts')
<script>
    document.addEventListener('DOMContentLoaded', function() {
        if (typeof trackGaEvent === 'function') {
            trackGaEvent('view_item_list', {
                item_list_name: '{{ $listingType === "sale" ? "Properties For Sale" : "Vacation Rentals" }}',
                items: [
                    @foreach($properties as $index => $prop)
                    {
                        item_id: '{{ $prop->reference_number }}',
                        item_name: '{{ addslashes($prop->title) }}',
                        item_category: '{{ $prop->category?->name ?? "Villa" }}',
                        price: {{ $prop->base_price }},
                        index: {{ $index + 1 }}
                    }{{ !$loop->last ? ',' : '' }}
                    @endforeach
                ]
            });
        }
    });
</script>
@endpush
@endif

@endsection
