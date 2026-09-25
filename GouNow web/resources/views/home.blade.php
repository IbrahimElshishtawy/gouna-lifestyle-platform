@extends('layouts.app')

@section('title', app()->getLocale() === 'ar' ? 'جو ناو | فلل فاخرة وتجارب استثنائية في الجونة' : 'GouNow | Curated Luxury Stays & Bespoke Experiences in El Gouna')

@section('content')

<!-- Hero Section with Floating Search Widget -->
<section class="relative min-h-[640px] lg:min-h-[720px] flex items-center justify-center bg-slate-900 text-white overflow-hidden">
    <!-- Background Image with Soft Warm Overlay -->
    <div class="absolute inset-0 z-0">
        <img src="https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=2000&q=85" 
             alt="El Gouna Luxury Waterfront" 
             class="w-full h-full object-cover object-center filter brightness-[0.7] transform scale-105 duration-1000 ease-out">
        <div class="absolute inset-0 bg-gradient-to-t from-[#291F1A]/90 via-[#291F1A]/40 to-transparent"></div>
    </div>

    <div class="relative z-10 max-w-5xl mx-auto px-6 lg:px-12 text-center py-20">
        <!-- Subheading Badge -->
        <span class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-[#E5DCD3] text-xs font-semibold uppercase tracking-[0.2em] mb-6 border border-white/20">
            <span>✨</span>
            <span>{{ app()->getLocale() === 'ar' ? 'إقامات شاطئية وتجارب حصرية' : 'Red Sea Coastal Living & Private Villas' }}</span>
        </span>

        <!-- Main Editorial Headline -->
        <h1 class="font-serif text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white leading-tight max-w-4xl mx-auto">
            {{ app()->getLocale() === 'ar' ? 'عيش تجربة الجونة بكل تفاصيلها الفاخرة' : 'Live the Unrivaled El Gouna Lifestyle' }}
        </h1>
        <p class="text-sm sm:text-base text-[#E5DCD3]/90 max-w-2xl mx-auto mt-4 font-light leading-relaxed">
            {{ app()->getLocale() === 'ar' 
                ? 'فلل حصرية على البحيرة، شاليهات فندقية راقية، يخوت خاصة ومغامرات صحراوية صُممت خصيصاً لذوقك الرفيع.' 
                : 'Handpicked private lagoon villas, marina chalets, luxury yacht charters, and tailor-made desert adventures across El Gouna.' }}
        </p>

        <!-- Floating Multi-Tab Search Box -->
        <div class="mt-10 max-w-4xl mx-auto bg-white rounded-3xl p-4 sm:p-5 shadow-2xl text-brand-brown border border-brand-border/60 text-left {{ app()->getLocale() === 'ar' ? 'text-right' : '' }}"
             x-data="{ tab: 'rent' }">
            
            <!-- Tabs -->
            <div class="flex items-center gap-2 border-b border-brand-border pb-3 mb-4">
                <button @click="tab = 'rent'" 
                        :class="tab === 'rent' ? 'bg-brand-sand-light text-brand-terracotta font-bold' : 'text-brand-brown-muted hover:text-brand-brown font-medium'"
                        class="px-4 py-1.5 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer">
                    🏠 {{ app()->getLocale() === 'ar' ? 'إيجار فلل وشاليهات' : 'Rent a Stay' }}
                </button>
                <button @click="tab = 'sale'" 
                        :class="tab === 'sale' ? 'bg-brand-sand-light text-brand-terracotta font-bold' : 'text-brand-brown-muted hover:text-brand-brown font-medium'"
                        class="px-4 py-1.5 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer">
                    🔑 {{ app()->getLocale() === 'ar' ? 'عقارات للبيع' : 'Buy Real Estate' }}
                </button>
                <button @click="tab = 'experience'" 
                        :class="tab === 'experience' ? 'bg-brand-sand-light text-brand-terracotta font-bold' : 'text-brand-brown-muted hover:text-brand-brown font-medium'"
                        class="px-4 py-1.5 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer">
                    ⛵ {{ app()->getLocale() === 'ar' ? 'تجارب وأنشطة' : 'Experiences' }}
                </button>
            </div>

            <!-- Rent Tab Form -->
            <form x-show="tab === 'rent'" method="GET" action="{{ route('properties.index') }}" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
                <input type="hidden" name="listing_type" value="rent">
                
                <div>
                    <label class="block text-[11px] font-bold uppercase tracking-wider text-brand-brown-muted mb-1">
                        {{ app()->getLocale() === 'ar' ? 'المنطقة' : 'Location' }}
                    </label>
                    <select name="location" class="w-full text-xs font-medium bg-brand-sand-light/60 border border-brand-border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-terracotta">
                        <option value="all">{{ app()->getLocale() === 'ar' ? 'كل مناطق الجونة' : 'All El Gouna' }}</option>
                        @foreach($locations as $loc)
                            <option value="{{ $loc->slug }}">{{ $loc->name }}</option>
                        @endforeach
                    </select>
                </div>

                <div>
                    <label class="block text-[11px] font-bold uppercase tracking-wider text-brand-brown-muted mb-1">
                        {{ app()->getLocale() === 'ar' ? 'الوصول' : 'Check-In' }}
                    </label>
                    <input type="date" name="check_in" value="{{ now()->addDays(2)->toDateString() }}"
                           class="w-full text-xs font-medium bg-brand-sand-light/60 border border-brand-border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-terracotta">
                </div>

                <div>
                    <label class="block text-[11px] font-bold uppercase tracking-wider text-brand-brown-muted mb-1">
                        {{ app()->getLocale() === 'ar' ? 'المغادرة' : 'Check-Out' }}
                    </label>
                    <input type="date" name="check_out" value="{{ now()->addDays(5)->toDateString() }}"
                           class="w-full text-xs font-medium bg-brand-sand-light/60 border border-brand-border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-terracotta">
                </div>

                <div>
                    <button type="submit" class="w-full py-2.5 px-4 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center gap-1.5">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                        <span>{{ app()->getLocale() === 'ar' ? 'بحث عن إقامة' : 'Search Stays' }}</span>
                    </button>
                </div>
            </form>

            <!-- Buy Tab Form -->
            <form x-show="tab === 'sale'" x-cloak method="GET" action="{{ route('properties.index') }}" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
                <input type="hidden" name="listing_type" value="sale">
                
                <div>
                    <label class="block text-[11px] font-bold uppercase tracking-wider text-brand-brown-muted mb-1">
                        {{ app()->getLocale() === 'ar' ? 'المنطقة' : 'Location' }}
                    </label>
                    <select name="location" class="w-full text-xs font-medium bg-brand-sand-light/60 border border-brand-border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-terracotta">
                        <option value="all">{{ app()->getLocale() === 'ar' ? 'كل مناطق الجونة' : 'All El Gouna' }}</option>
                        @foreach($locations as $loc)
                            <option value="{{ $loc->slug }}">{{ $loc->name }}</option>
                        @endforeach
                    </select>
                </div>

                <div>
                    <label class="block text-[11px] font-bold uppercase tracking-wider text-brand-brown-muted mb-1">
                        {{ app()->getLocale() === 'ar' ? 'نوع العقار' : 'Category' }}
                    </label>
                    <select name="category" class="w-full text-xs font-medium bg-brand-sand-light/60 border border-brand-border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-terracotta">
                        <option value="all">{{ app()->getLocale() === 'ar' ? 'جميع الأنواع' : 'All Categories' }}</option>
                        @foreach($categories as $cat)
                            <option value="{{ $cat->slug }}">{{ $cat->name }}</option>
                        @endforeach
                    </select>
                </div>

                <div>
                    <label class="block text-[11px] font-bold uppercase tracking-wider text-brand-brown-muted mb-1">
                        {{ app()->getLocale() === 'ar' ? 'عدد الغرف' : 'Bedrooms' }}
                    </label>
                    <select name="bedrooms" class="w-full text-xs font-medium bg-brand-sand-light/60 border border-brand-border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-terracotta">
                        <option value="">{{ app()->getLocale() === 'ar' ? 'أي عدد' : 'Any' }}</option>
                        <option value="1">1+ Bedrooms</option>
                        <option value="2">2+ Bedrooms</option>
                        <option value="3">3+ Bedrooms</option>
                        <option value="4">4+ Bedrooms</option>
                    </select>
                </div>

                <div>
                    <button type="submit" class="w-full py-2.5 px-4 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center gap-1.5">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                        <span>{{ app()->getLocale() === 'ar' ? 'عقارات للبيع' : 'Browse Sale' }}</span>
                    </button>
                </div>
            </form>

            <!-- Experiences Tab Form -->
            <form x-show="tab === 'experience'" x-cloak method="GET" action="{{ route('experiences.index') }}" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-end">
                <div>
                    <label class="block text-[11px] font-bold uppercase tracking-wider text-brand-brown-muted mb-1">
                        {{ app()->getLocale() === 'ar' ? 'المنطقة' : 'Location' }}
                    </label>
                    <select name="location" class="w-full text-xs font-medium bg-brand-sand-light/60 border border-brand-border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-terracotta">
                        <option value="all">{{ app()->getLocale() === 'ar' ? 'كل الجونة والبحر الأحمر' : 'All Red Sea' }}</option>
                        @foreach($locations as $loc)
                            <option value="{{ $loc->slug }}">{{ $loc->name }}</option>
                        @endforeach
                    </select>
                </div>

                <div>
                    <label class="block text-[11px] font-bold uppercase tracking-wider text-brand-brown-muted mb-1">
                        {{ app()->getLocale() === 'ar' ? 'نوع النشاط' : 'Experience Type' }}
                    </label>
                    <select name="category" class="w-full text-xs font-medium bg-brand-sand-light/60 border border-brand-border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-terracotta">
                        <option value="all">{{ app()->getLocale() === 'ar' ? 'جميع الأنشطة' : 'All Experiences' }}</option>
                        <option value="boat-trips">Boat Trips & Yacht Charters</option>
                        <option value="safari">Desert Safari & Quad</option>
                        <option value="water-sports">Kite & Water Sports</option>
                        <option value="dining">Private Lagoon Dining</option>
                    </select>
                </div>

                <div>
                    <button type="submit" class="w-full py-2.5 px-4 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center gap-1.5">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                        <span>{{ app()->getLocale() === 'ar' ? 'استكشف الأنشطة' : 'Explore Adventures' }}</span>
                    </button>
                </div>
            </form>

        </div>
    </div>
</section>

<!-- Editorial Intro Statement (Section 2 & 7) -->
<section class="py-20 lg:py-24 bg-white border-b border-brand-border">
    <div class="max-w-4xl mx-auto px-6 text-center space-y-6">
        <span class="text-xs font-bold uppercase tracking-[0.25em] text-brand-terracotta">
            {{ app()->getLocale() === 'ar' ? 'اكتشف الجونة مع جو ناو' : 'Discover El Gouna with GouNow' }}
        </span>
        <h2 class="font-serif text-3xl sm:text-4xl text-brand-brown leading-snug">
            {{ app()->getLocale() === 'ar' 
                ? 'إقامات راقية تلتقي بالطبيعة الساحرة والهدوء المتناهي' 
                : 'Where Bohemian Serenity Meets Effortless Coastal Luxury' }}
        </h2>
        <p class="text-sm sm:text-base text-brand-brown-muted leading-relaxed font-light">
            {{ app()->getLocale() === 'ar'
                ? 'نحن لا نقدم مجرد مكان للإقامة، بل نصمم لك تجربة متكاملة تشمل الفلل الشاطئية الخاصة، اليخوت الفارهة، والخدمات الشخصية التي تجعل عطلتك في الجونة ذكرى لا تُنسى.'
                : 'GouNow is an independent hospitality and real estate collective curated specifically for El Gouna. Every villa is personally inspected, every experience is uniquely hosted, and our private concierge is with you from sunrise lagoon dips to stargazing in the desert.' }}
        </p>

        <!-- 3 Feature Badges -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 text-left {{ app()->getLocale() === 'ar' ? 'text-right' : '' }}">
            <div class="p-6 bg-brand-sand-light/50 rounded-2xl border border-brand-border space-y-2">
                <span class="text-2xl">🏡</span>
                <h3 class="font-serif text-base font-bold text-brand-brown">
                    {{ app()->getLocale() === 'ar' ? 'فلل وشاليهات مختارة' : 'Curated Private Stays' }}
                </h3>
                <p class="text-xs text-brand-brown-muted leading-relaxed">
                    {{ app()->getLocale() === 'ar' ? 'شواطئ بحيرات خاصة، حمامات سباحة دافئة، وتصميمات طبيعية بأعلى معايير النظافة.' : 'Direct lagoon waterfronts, heated pools, and boho organic interiors.' }}
                </p>
            </div>

            <div class="p-6 bg-brand-sand-light/50 rounded-2xl border border-brand-border space-y-2">
                <span class="text-2xl">🔒</span>
                <h3 class="font-serif text-base font-bold text-brand-brown">
                    {{ app()->getLocale() === 'ar' ? 'حجز ودفع آمن 100%' : 'Direct & Safe Booking' }}
                </h3>
                <p class="text-xs text-brand-brown-muted leading-relaxed">
                    {{ app()->getLocale() === 'ar' ? 'دفع إلكتروني آمن عبر البطاقات البنكية وباي بال مع إمكانية دفع عربون مقدم.' : 'Instant calendar confirmation, 3DS card checkout, and flexible deposit options.' }}
                </p>
            </div>

            <div class="p-6 bg-brand-sand-light/50 rounded-2xl border border-brand-border space-y-2">
                <span class="text-2xl">✨</span>
                <h3 class="font-serif text-base font-bold text-brand-brown">
                    {{ app()->getLocale() === 'ar' ? 'كونسيرج الجونة الخاص' : 'VIP Concierge on Demand' }}
                </h3>
                <p class="text-xs text-brand-brown-muted leading-relaxed">
                    {{ app()->getLocale() === 'ar' ? 'تنظيم رحلات اليخوت، طهاة خاصين، ومساعدة فورية عبر واتساب على مدار الساعة.' : 'Airport transfers, yacht charters, private chefs, and instant WhatsApp support.' }}
                </p>
            </div>
        </div>
    </div>
</section>

<!-- Featured Vacation Rentals Grid (Section 7 & 126) -->
<section class="py-20 bg-brand-sand-card">
    <div class="max-w-7xl mx-auto px-6 lg:px-12">
        <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
                <span class="text-xs font-bold uppercase tracking-[0.25em] text-brand-terracotta">
                    {{ app()->getLocale() === 'ar' ? 'إقامات الجونة الفاخرة' : 'Bespoke Escapes' }}
                </span>
                <h2 class="font-serif text-2xl sm:text-3xl text-brand-brown font-semibold mt-1">
                    {{ app()->getLocale() === 'ar' ? 'فلل وشاليهات متاحة للحجز' : 'Featured Vacation Rentals' }}
                </h2>
            </div>
            <a href="{{ route('properties.index', ['listing_type' => 'rent']) }}" 
               class="text-xs font-bold uppercase tracking-wider text-brand-terracotta hover:text-brand-terracotta-dark transition flex items-center gap-1">
                <span>{{ app()->getLocale() === 'ar' ? 'عرض جميع الفلل' : 'View All Stays' }}</span>
                <span>&rarr;</span>
            </a>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            @forelse($featuredRentals as $rental)
                <div class="group bg-white rounded-3xl overflow-hidden border border-brand-border shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col">
                    <!-- Image Card -->
                    <div class="relative h-64 overflow-hidden bg-brand-sand">
                        <img src="{{ $rental->cover_url }}" 
                             alt="{{ $rental->title }}" 
                             class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                        <div class="absolute top-4 left-4 flex gap-2">
                            <span class="px-3 py-1 bg-white/90 backdrop-blur-md text-brand-brown text-[11px] font-bold rounded-full uppercase tracking-wider shadow-xs">
                                📍 {{ $rental->location?->name ?? 'El Gouna' }}
                            </span>
                        </div>
                        @if($rental->is_featured)
                            <div class="absolute top-4 right-4">
                                <span class="px-3 py-1 bg-brand-terracotta text-white text-[10px] font-bold rounded-full uppercase tracking-wider shadow-xs">
                                    ★ Featured
                                </span>
                            </div>
                        @endif
                    </div>

                    <!-- Details Body -->
                    <div class="p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div class="space-y-2">
                            <div class="flex items-center gap-3 text-xs text-brand-brown-muted">
                                <span>{{ $rental->bedrooms }} {{ app()->getLocale() === 'ar' ? 'غرف' : 'Beds' }}</span>
                                <span>•</span>
                                <span>{{ $rental->bathrooms }} {{ app()->getLocale() === 'ar' ? 'حمامات' : 'Baths' }}</span>
                                <span>•</span>
                                <span>Up to {{ $rental->max_guests }} Guests</span>
                            </div>
                            <h3 class="font-serif text-lg font-bold text-brand-brown group-hover:text-brand-terracotta transition">
                                <a href="{{ route('properties.show', $rental->slug) }}">{{ $rental->title }}</a>
                            </h3>
                            <p class="text-xs text-brand-brown-muted line-clamp-2 leading-relaxed">
                                {{ $rental->short_description_en }}
                            </p>
                        </div>

                        <div class="pt-4 border-t border-brand-border flex items-center justify-between">
                            <div>
                                <span class="text-xs text-brand-brown-muted block">{{ app()->getLocale() === 'ar' ? 'يبدأ من' : 'From' }}</span>
                                <span class="text-base font-bold text-brand-brown">
                                    {{ number_format($rental->base_price) }} <span class="text-xs font-normal text-brand-brown-muted">{{ $rental->currency }} / {{ app()->getLocale() === 'ar' ? 'ليلة' : 'night' }}</span>
                                </span>
                            </div>
                            <a href="{{ route('properties.show', $rental->slug) }}" 
                               class="px-4 py-2 bg-brand-sand-light hover:bg-brand-sand text-brand-brown rounded-xl text-xs font-bold transition">
                                {{ app()->getLocale() === 'ar' ? 'تفاصيل وحجز' : 'View Villa' }}
                            </a>
                        </div>
                    </div>
                </div>
            @empty
                <div class="col-span-3 text-center py-12 text-sm text-brand-brown-muted">
                    No rental properties available currently.
                </div>
            @endforelse
        </div>
    </div>
</section>

<!-- Curated Experiences Spotlight (Section 29 & 126) -->
<section class="py-20 bg-white border-y border-brand-border">
    <div class="max-w-7xl mx-auto px-6 lg:px-12">
        <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
                <span class="text-xs font-bold uppercase tracking-[0.25em] text-brand-terracotta">
                    {{ app()->getLocale() === 'ar' ? 'مغامرات وأنشطة الجونة' : 'Red Sea Adventures' }}
                </span>
                <h2 class="font-serif text-2xl sm:text-3xl text-brand-brown font-semibold mt-1">
                    {{ app()->getLocale() === 'ar' ? 'تجارب وأنشطة حصرية' : 'Curated Experiences' }}
                </h2>
            </div>
            <a href="{{ route('experiences.index') }}" 
               class="text-xs font-bold uppercase tracking-wider text-brand-terracotta hover:text-brand-terracotta-dark transition flex items-center gap-1">
                <span>{{ app()->getLocale() === 'ar' ? 'جميع التجارب' : 'Explore All Experiences' }}</span>
                <span>&rarr;</span>
            </a>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            @forelse($featuredExperiences as $exp)
                <div class="group bg-brand-sand-card rounded-2xl overflow-hidden border border-brand-border shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col">
                    <div class="relative h-48 overflow-hidden bg-brand-sand">
                        <img src="{{ $exp->cover_url }}" 
                             alt="{{ $exp->title }}" 
                             class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                        <span class="absolute top-3 left-3 px-2.5 py-0.5 bg-white/90 backdrop-blur-md text-brand-brown text-[10px] font-bold rounded-full uppercase">
                            {{ $exp->category?->name ?? 'Experience' }}
                        </span>
                    </div>
                    <div class="p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                            <span class="text-[11px] text-brand-brown-muted font-medium">⏱️ {{ $exp->duration ?? 'Half Day' }}</span>
                            <h3 class="font-serif text-base font-bold text-brand-brown mt-1 group-hover:text-brand-terracotta transition">
                                <a href="{{ route('experiences.show', $exp->slug) }}">{{ $exp->title }}</a>
                            </h3>
                        </div>
                        <div class="pt-3 border-t border-brand-border flex items-center justify-between text-xs">
                            <span class="font-bold text-brand-brown">
                                {{ number_format($exp->base_price) }} {{ $exp->currency }}
                                <span class="font-normal text-[10px] text-brand-brown-muted block">{{ str_replace('_', ' ', $exp->pricing_model) }}</span>
                            </span>
                            <a href="{{ route('experiences.show', $exp->slug) }}" class="text-brand-terracotta font-semibold hover:underline">
                                {{ app()->getLocale() === 'ar' ? 'تفاصيل' : 'Details' }} &rarr;
                            </a>
                        </div>
                    </div>
                </div>
            @empty
                <div class="col-span-4 text-center py-8 text-sm text-brand-brown-muted">
                    No experiences listed at this moment.
                </div>
            @endforelse
        </div>
    </div>
</section>

<!-- Real Estate & Properties For Sale Section (Section 26 & 28) -->
@if($featuredSales->isNotEmpty())
<section class="py-20 bg-brand-sand-light/60">
    <div class="max-w-7xl mx-auto px-6 lg:px-12">
        <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
                <span class="text-xs font-bold uppercase tracking-[0.25em] text-brand-terracotta">
                    {{ app()->getLocale() === 'ar' ? 'فرص استثمارية حصرية' : 'Prime Real Estate' }}
                </span>
                <h2 class="font-serif text-2xl sm:text-3xl text-brand-brown font-semibold mt-1">
                    {{ app()->getLocale() === 'ar' ? 'عقارات للبيع في الجونة' : 'Properties For Sale' }}
                </h2>
            </div>
            <a href="{{ route('properties.index', ['listing_type' => 'sale']) }}" 
               class="text-xs font-bold uppercase tracking-wider text-brand-terracotta hover:text-brand-terracotta-dark transition flex items-center gap-1">
                <span>{{ app()->getLocale() === 'ar' ? 'تصفح كل العقارات' : 'Browse All For Sale' }}</span>
                <span>&rarr;</span>
            </a>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            @foreach($featuredSales as $sale)
                <div class="bg-white rounded-3xl overflow-hidden border border-brand-border shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col">
                    <div class="relative h-60 overflow-hidden bg-brand-sand">
                        <img src="{{ $sale->cover_url }}" alt="{{ $sale->title }}" class="w-full h-full object-cover">
                        <div class="absolute top-4 left-4">
                            <span class="px-3 py-1 bg-amber-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wider shadow-xs">
                                For Sale
                            </span>
                        </div>
                    </div>
                    <div class="p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                            <span class="text-xs text-brand-brown-muted">📍 {{ $sale->location?->name ?? 'El Gouna' }}</span>
                            <h3 class="font-serif text-lg font-bold text-brand-brown mt-1">
                                <a href="{{ route('properties.show', $sale->slug) }}">{{ $sale->title }}</a>
                            </h3>
                            <div class="flex items-center gap-3 text-xs text-brand-brown-muted pt-2">
                                <span>{{ $sale->bedrooms }} Beds</span>
                                <span>•</span>
                                <span>{{ $sale->area_sqm ? number_format($sale->area_sqm) . ' m²' : 'Exclusive' }}</span>
                                @if($sale->completion_status)
                                    <span>•</span>
                                    <span class="capitalize">{{ str_replace('_', ' ', $sale->completion_status) }}</span>
                                @endif
                            </div>
                        </div>

                        <div class="pt-4 border-t border-brand-border flex items-center justify-between">
                            <div>
                                <span class="text-xs text-brand-brown-muted block">{{ app()->getLocale() === 'ar' ? 'السعر' : 'Asking Price' }}</span>
                                <span class="text-base font-bold text-brand-brown">
                                    {{ $sale->sale_price_cents ? number_format($sale->sale_price_cents / 100) . ' ' . $sale->currency : 'Price on Request' }}
                                </span>
                            </div>
                            <a href="{{ route('properties.show', $sale->slug) }}" 
                               class="px-4 py-2 bg-brand-brown text-white hover:bg-brand-brown-dark rounded-xl text-xs font-bold transition">
                                {{ app()->getLocale() === 'ar' ? 'طلب معاينة' : 'Inquire' }}
                            </a>
                        </div>
                    </div>
                </div>
            @endforeach
        </div>
    </div>
</section>
@endif

<!-- What's On / Events Spotlight (Section 7, 40) -->
@if($upcomingEvents->isNotEmpty())
<section id="events" class="py-20 bg-white border-b border-brand-border">
    <div class="max-w-7xl mx-auto px-6 lg:px-12">
        <div class="text-center max-w-xl mx-auto mb-12 space-y-2">
            <span class="text-xs font-bold uppercase tracking-[0.25em] text-brand-terracotta">
                {{ app()->getLocale() === 'ar' ? 'أجواء وحياة الجونة' : 'El Gouna Nightlife & Culture' }}
            </span>
            <h2 class="font-serif text-3xl font-semibold text-brand-brown">
                {{ app()->getLocale() === 'ar' ? 'فعاليات قادمة' : 'What\'s On This Season' }}
            </h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            @foreach($upcomingEvents as $event)
                <div class="p-6 bg-brand-sand-light/40 rounded-3xl border border-brand-border flex flex-col justify-between space-y-4">
                    <div class="space-y-3">
                        <div class="flex items-center justify-between text-xs">
                            <span class="px-3 py-1 bg-white font-bold text-brand-terracotta rounded-full border border-brand-border">
                                📅 {{ $event->event_date->format('M d, Y') }}
                            </span>
                            <span class="text-brand-brown-muted">{{ $event->start_time ? $event->start_time->format('H:i') : 'Sunset' }}</span>
                        </div>
                        <h3 class="font-serif text-lg font-bold text-brand-brown">{{ $event->title_en }}</h3>
                        <p class="text-xs text-brand-brown-muted leading-relaxed line-clamp-3">
                            {{ $event->short_description_en }}
                        </p>
                    </div>

                    <div class="pt-4 border-t border-brand-border flex items-center justify-between text-xs">
                        <span class="text-brand-brown-muted">📍 {{ $event->venue_name ?? 'Abu Tig Marina' }}</span>
                        <a href="https://wa.me/201000000000?text=Inquiring%20about%20event%20{{ urlencode($event->title_en) }}" 
                           target="_blank"
                           class="px-3 py-1.5 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-lg font-semibold transition">
                            Book Tickets
                        </a>
                    </div>
                </div>
            @endforeach
        </div>
    </div>
</section>
@endif

<!-- VIP Concierge Desk & Lead Form (Section 131) -->
<section id="concierge" class="py-20 bg-gradient-to-br from-[#FAF8F5] via-white to-brand-sand-light/60">
    <div class="max-w-5xl mx-auto px-6 lg:px-12">
        <div class="bg-white rounded-3xl border border-brand-border shadow-sm p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            
            <div class="space-y-5">
                <span class="text-xs font-bold uppercase tracking-[0.25em] text-brand-terracotta">
                    {{ app()->getLocale() === 'ar' ? 'خدمة شخصية متكاملة' : 'Bespoke Assistance' }}
                </span>
                <h2 class="font-serif text-2xl sm:text-3xl text-brand-brown font-semibold leading-snug">
                    {{ app()->getLocale() === 'ar' ? 'تحدث مباشرة مع كونسيرج الجونة' : 'Personal Concierge & Tailored Arrangements' }}
                </h2>
                <p class="text-xs sm:text-sm text-brand-brown-muted leading-relaxed">
                    {{ app()->getLocale() === 'ar'
                        ? 'هل تبحث عن فيلا بمواصفات معينة؟ هل ترغب في حجز يخت خاص ليوم كامل أو تنظيم مناسبة خاصة؟ فريقنا في الجونة جاهز لتحقيق رغباتك.'
                        : 'Looking for a specific waterfront villa, off-market real estate acquisition, or private yacht itinerary? Let our dedicated local team handle every detail.' }}
                </p>

                <div class="pt-2 space-y-2 text-xs">
                    <p class="flex items-center gap-2 text-brand-brown font-medium">
                        <span>💬</span>
                        <span>Direct WhatsApp: <strong>+20 100 000 0000</strong></span>
                    </p>
                    <p class="flex items-center gap-2 text-brand-brown font-medium">
                        <span>✉️</span>
                        <span>Email: <strong>concierge@gounow.com</strong></span>
                    </p>
                </div>
            </div>

            <!-- Lead Form -->
            <form method="POST" action="{{ route('home.inquire') }}" class="space-y-4 bg-brand-sand-light/30 p-6 rounded-2xl border border-brand-border">
                @csrf
                <input type="hidden" name="type" value="concierge">
                <input type="hidden" name="source" value="website_homepage_concierge">

                <div>
                    <label class="block text-[11px] font-bold uppercase tracking-wider text-brand-brown-muted mb-1">
                        {{ app()->getLocale() === 'ar' ? 'الاسم بالكامل' : 'Full Name' }}
                    </label>
                    <input type="text" name="name" required placeholder="Alexander Vance"
                           class="w-full text-xs bg-white border border-brand-border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-terracotta">
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label class="block text-[11px] font-bold uppercase tracking-wider text-brand-brown-muted mb-1">
                            {{ app()->getLocale() === 'ar' ? 'البريد الإلكتروني' : 'Email Address' }}
                        </label>
                        <input type="email" name="email" required placeholder="alex@example.com"
                               class="w-full text-xs bg-white border border-brand-border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-terracotta">
                    </div>
                    <div>
                        <label class="block text-[11px] font-bold uppercase tracking-wider text-brand-brown-muted mb-1">
                            {{ app()->getLocale() === 'ar' ? 'رقم الهاتف / واتساب' : 'Phone / WhatsApp' }}
                        </label>
                        <input type="text" name="phone" placeholder="+20 10..."
                               class="w-full text-xs bg-white border border-brand-border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-terracotta">
                    </div>
                </div>

                <div>
                    <label class="block text-[11px] font-bold uppercase tracking-wider text-brand-brown-muted mb-1">
                        {{ app()->getLocale() === 'ar' ? 'رسالتك أو طلبك' : 'How can we assist you?' }}
                    </label>
                    <textarea name="message" rows="3" required placeholder="I am looking for a 4-bedroom lagoon villa with private pool for next week..."
                              class="w-full text-xs bg-white border border-brand-border rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-brand-terracotta"></textarea>
                </div>

                <button type="submit" 
                        class="w-full py-3 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-sm hover:shadow-md cursor-pointer">
                    {{ app()->getLocale() === 'ar' ? 'إرسال طلب الكونسيرج' : 'Send Concierge Request' }}
                </button>
            </form>

        </div>
    </div>
</section>

@endsection
