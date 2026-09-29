@extends('layouts.app')

@section('title', 'Curated Experiences & Desert Adventures in El Gouna | GouNow')
@section('meta_description', 'Book private yacht charters, kite surfing lessons, desert quad safaris, and lagoon dining in El Gouna, Red Sea.')

@section('content')

<!-- Header Banner -->
<div class="bg-gradient-to-b from-brand-sand-light/60 to-[#FAF8F5] border-b border-brand-border py-12 lg:py-16">
    <div class="max-w-7xl mx-auto px-6 lg:px-12">
        <div class="max-w-2xl space-y-3">
            <span class="text-xs font-bold uppercase tracking-[0.25em] text-brand-terracotta">
                {{ app()->getLocale() === 'ar' ? 'أنشطة ومغامرات الجونة' : 'Red Sea Adventures' }}
            </span>
            <h1 class="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-brand-brown">
                {{ app()->getLocale() === 'ar' ? 'تجارب وأنشطة حصرية' : 'Curated Experiences' }}
            </h1>
            <p class="text-xs sm:text-sm text-brand-brown-muted leading-relaxed font-light">
                {{ app()->getLocale() === 'ar'
                    ? 'من رحلات اليخوت الخاصة إلى الجزر العذراء وسفاري غروب الشمس في الصحراء، صممنا لك تجارب لا تُنسى في الجونة.'
                    : 'From private sunset catamarans across untouched Red Sea islands to starlit Bedouin desert safaris, explore handpicked activities hosted by certified local guides.' }}
            </p>
        </div>

        <!-- Category Tabs -->
        <div class="mt-8 flex flex-wrap items-center gap-2">
            <a href="{{ route('experiences.index') }}" 
               class="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition
                      {{ empty($categorySlug) || $categorySlug === 'all' ? 'bg-brand-terracotta text-white shadow-xs' : 'bg-white text-brand-brown hover:bg-brand-sand-light border border-brand-border' }}">
                {{ app()->getLocale() === 'ar' ? 'الكل' : 'All Adventures' }}
            </a>
            @foreach($categories as $category)
                <a href="{{ route('experiences.index', ['category' => $category->slug]) }}" 
                   class="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition
                          {{ $categorySlug === $category->slug ? 'bg-brand-terracotta text-white shadow-xs' : 'bg-white text-brand-brown hover:bg-brand-sand-light border border-brand-border' }}">
                    {{ $category->name }}
                </a>
            @endforeach
        </div>
    </div>
</div>

<!-- Experiences Grid -->
<div class="max-w-7xl mx-auto px-6 lg:px-12 py-12">
    
    <div class="flex items-center justify-between mb-8">
        <span class="text-xs text-brand-brown-muted font-medium">
            Showing <strong class="text-brand-brown">{{ $experiences->total() }}</strong> curated experiences in El Gouna
        </span>
    </div>

    @if($experiences->isNotEmpty())
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            @foreach($experiences as $exp)
                <div class="group bg-white rounded-3xl overflow-hidden border border-brand-border shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col">
                    <div class="relative h-60 overflow-hidden bg-brand-sand">
                        <img src="{{ $exp->cover_url }}" alt="{{ $exp->title }}" 
                             class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                        <div class="absolute top-4 left-4">
                            <span class="px-3 py-1 bg-white/90 backdrop-blur-md text-brand-brown text-[11px] font-bold rounded-full uppercase tracking-wider shadow-xs">
                                {{ $exp->category?->name ?? 'Experience' }}
                            </span>
                        </div>
                        @if($exp->duration)
                            <div class="absolute bottom-4 right-4">
                                <span class="px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-medium rounded-full">
                                    ⏱️ {{ $exp->duration }}
                                </span>
                            </div>
                        @endif
                    </div>

                    <div class="p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div class="space-y-2">
                            <div class="flex items-center gap-2 text-xs text-brand-brown-muted">
                                <span>📍 {{ $exp->location?->name ?? 'El Gouna' }}</span>
                                @if($exp->max_capacity)
                                    <span>•</span>
                                    <span>Up to {{ $exp->max_capacity }} people</span>
                                @endif
                            </div>

                            <h3 class="font-serif text-lg font-bold text-brand-brown group-hover:text-brand-terracotta transition">
                                <a href="{{ route('experiences.show', $exp->slug) }}">{{ $exp->title }}</a>
                            </h3>

                            <p class="text-xs text-brand-brown-muted line-clamp-2 leading-relaxed">
                                {{ $exp->short_description_en }}
                            </p>
                        </div>

                        <div class="pt-4 border-t border-brand-border flex items-center justify-between">
                            <div>
                                <span class="text-xs text-brand-brown-muted block">{{ app()->getLocale() === 'ar' ? 'السعر' : 'Price' }}</span>
                                <span class="text-base font-bold text-brand-brown">
                                    {{ number_format($exp->base_price) }} <span class="text-xs font-normal text-brand-brown-muted">{{ $exp->currency }}</span>
                                </span>
                                <span class="text-[10px] text-brand-brown-muted block capitalize">{{ str_replace('_', ' ', $exp->pricing_model) }}</span>
                            </div>
                            <a href="{{ route('experiences.show', $exp->slug) }}" 
                               class="px-4 py-2 bg-brand-sand-light hover:bg-brand-sand text-brand-brown rounded-xl text-xs font-bold transition">
                                {{ app()->getLocale() === 'ar' ? 'عرض التجربة' : 'Explore' }}
                            </a>
                        </div>
                    </div>
                </div>
            @endforeach
        </div>

        <div class="mt-12">
            {{ $experiences->links() }}
        </div>
    @else
        <div class="bg-white rounded-3xl border border-brand-border p-12 text-center max-w-xl mx-auto space-y-4">
            <span class="text-4xl block">⛵</span>
            <h3 class="font-serif text-xl font-bold text-brand-brown">No experiences in this category yet</h3>
            <p class="text-xs text-brand-brown-muted leading-relaxed">
                Our team can tailor custom private boat charters, kite surfing lessons, or desert excursions on request.
            </p>
            <div class="pt-2">
                <a href="{{ route('experiences.index') }}" 
                   class="inline-block px-5 py-2.5 bg-brand-sand-light hover:bg-brand-sand text-brand-brown rounded-xl text-xs font-bold transition">
                    View All Experiences
                </a>
            </div>
        </div>
    @endif

</div>

@if($experiences->isNotEmpty())
@push('scripts')
<script>
    document.addEventListener('DOMContentLoaded', function() {
        if (typeof trackGaEvent === 'function') {
            trackGaEvent('view_item_list', {
                item_list_name: 'Experiences & Activities',
                items: [
                    @foreach($experiences as $index => $exp)
                    {
                        item_id: '{{ $exp->slug }}',
                        item_name: '{{ addslashes($exp->title) }}',
                        item_category: '{{ $exp->category?->name ?? "Experience" }}',
                        price: {{ $exp->base_price }},
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
