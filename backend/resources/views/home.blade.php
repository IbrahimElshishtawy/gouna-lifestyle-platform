@extends('layouts.app')

@section('title', app()->getLocale() === 'ar' ? 'جو ناو | فلل فاخرة وتجارب استثنائية في الجونة' : 'Live the Unrivaled El Gouna Lifestyle | GouNow')

@section('content')

<!-- 1. Hero Section with Floating Luxury Booking Bar (Matching Screenshot) -->
<section class="relative min-h-[680px] lg:min-h-[780px] flex items-center justify-center bg-brand-brown-dark text-white overflow-hidden">
    <!-- Background Hero Image with Warm Luxury Dusk Vignette -->
    <div class="absolute inset-0 z-0">
        <img src="https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=2200&q=85" 
             alt="Live the Unrivaled El Gouna Lifestyle" 
             class="w-full h-full object-cover object-center scale-[1.02] transform transition-transform duration-1000 ease-out">
        <div class="absolute inset-0 bg-gradient-to-t from-brand-brown-dark/95 via-brand-brown-dark/45 to-black/50"></div>
    </div>

    <div class="relative z-10 max-w-6xl mx-auto px-6 py-20 lg:py-28 text-center flex flex-col items-center">
        <!-- Curated Luxury Badge -->
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold uppercase tracking-[0.25em] mb-6 shadow-sm">
            <span class="w-1.5 h-1.5 rounded-full bg-brand-terracotta animate-pulse"></span>
            <span>{{ app()->getLocale() === 'ar' ? 'تجارب فاخرة ومختارة بعناية • إقامات خاصة' : 'Curated Luxury Experiences • Private Escapes' }}</span>
        </div>

        <!-- Hero Title -->
        <h1 class="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#FAF8F5] max-w-4xl leading-[1.1] mb-6 drop-shadow-md">
            {{ app()->getLocale() === 'ar' ? 'عيش الفخامة الاستثنائية' : 'Live the Unrivaled' }} <br class="hidden sm:inline">
            <span class="italic font-normal">{{ app()->getLocale() === 'ar' ? 'في قلب الجونة' : 'El Gouna Lifestyle' }}</span>
        </h1>

        <!-- Hero Subtitle -->
        <p class="text-sm sm:text-base lg:text-lg text-[#E5DCD3] max-w-3xl font-light leading-relaxed mb-10 text-center">
            {{ app()->getLocale() === 'ar'
                ? 'حيث يلتقي سحر البحر الأحمر بالفخامة الهادئة: فلل بحيرات خاصة، يخوت حصرية، وخدمات كونسيرج VIP مخصصة لك على مدار الساعة.'
                : 'Where the Red Sea meets understated luxury: bespoke private villas, yacht charters, and 24/7 VIP concierge experiences crafted exclusively for you.' }}
        </p>

        <!-- Floating Search Bar (Card Widget) -->
        <div class="w-full max-w-4xl bg-white/95 backdrop-blur-md p-4 sm:p-6 rounded-3xl shadow-2xl border border-white/60 text-brand-brown text-left {{ app()->getLocale() === 'ar' ? 'text-right' : '' }}"
             x-data="{ activeTab: 'rent' }">
            
            <!-- Tab Selector -->
            <div class="flex items-center justify-start gap-2 mb-4 border-b border-brand-border/60 pb-3">
                <button type="button" @click="activeTab = 'rent'"
                        :class="activeTab === 'rent' ? 'bg-brand-terracotta text-white shadow-xs' : 'bg-brand-sand-light text-brand-brown hover:bg-brand-sand/60'"
                        class="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 cursor-pointer">
                    <span>🏡</span>
                    <span>{{ app()->getLocale() === 'ar' ? 'إيجار إقامة' : 'Rent a Stay' }}</span>
                </button>
                <button type="button" @click="activeTab = 'sale'"
                        :class="activeTab === 'sale' ? 'bg-brand-terracotta text-white shadow-xs' : 'bg-brand-sand-light text-brand-brown hover:bg-brand-sand/60'"
                        class="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 cursor-pointer">
                    <span>🏛️</span>
                    <span>{{ app()->getLocale() === 'ar' ? 'شراء عقار' : 'Buy a Property' }}</span>
                </button>
                <button type="button" @click="activeTab = 'experiences'"
                        :class="activeTab === 'experiences' ? 'bg-brand-terracotta text-white shadow-xs' : 'bg-brand-sand-light text-brand-brown hover:bg-brand-sand/60'"
                        class="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 cursor-pointer">
                    <span>⛵</span>
                    <span>{{ app()->getLocale() === 'ar' ? 'تجارب ويخوت' : 'Experiences' }}</span>
                </button>
            </div>

            <!-- Form Container -->
            <form method="GET" :action="activeTab === 'experiences' ? '{{ route('experiences.index') }}' : '{{ route('properties.index') }}'">
                <input type="hidden" name="listing_type" :value="activeTab">

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <!-- Location -->
                    <div class="p-3 bg-brand-sand-light/60 hover:bg-brand-sand-light rounded-2xl border border-brand-border/80 transition-colors">
                        <label class="block text-[10px] font-bold uppercase tracking-wider text-brand-brown-muted mb-1">
                            {{ app()->getLocale() === 'ar' ? 'المنطقة' : 'Location' }}
                        </label>
                        <div class="flex items-center gap-1.5">
                            <span class="text-sm">📍</span>
                            <select name="location" class="w-full text-xs font-semibold bg-transparent focus:outline-none text-brand-brown cursor-pointer">
                                <option value="all">{{ app()->getLocale() === 'ar' ? 'كل مناطق الجونة' : 'All of El Gouna' }}</option>
                                <option value="fanadir-bay">Fanadir Bay</option>
                                <option value="abu-tig-marina">Abu Tig Marina</option>
                                <option value="tawila-island">Tawila Island &amp; Lagoons</option>
                                <option value="ancient-sands">Ancient Sands</option>
                                <option value="west-golf">West Golf Lagoons</option>
                                <option value="mangroovy-beach">Mangroovy Beach</option>
                            </select>
                        </div>
                    </div>

                    <!-- Check-in / Date -->
                    <div class="p-3 bg-brand-sand-light/60 hover:bg-brand-sand-light rounded-2xl border border-brand-border/80 transition-colors">
                        <label class="block text-[10px] font-bold uppercase tracking-wider text-brand-brown-muted mb-1">
                            {{ app()->getLocale() === 'ar' ? 'تاريخ الوصول' : 'Check-in' }}
                        </label>
                        <div class="flex items-center gap-1.5">
                            <span class="text-sm">📅</span>
                            <input type="date" name="check_in" value="{{ now()->addDays(2)->toDateString() }}"
                                   class="w-full text-xs font-semibold bg-transparent focus:outline-none text-brand-brown cursor-pointer">
                        </div>
                    </div>

                    <!-- Check-out / Type -->
                    <div class="p-3 bg-brand-sand-light/60 hover:bg-brand-sand-light rounded-2xl border border-brand-border/80 transition-colors">
                        <label class="block text-[10px] font-bold uppercase tracking-wider text-brand-brown-muted mb-1">
                            <span x-show="activeTab === 'rent'">{{ app()->getLocale() === 'ar' ? 'المغادرة' : 'Check-out' }}</span>
                            <span x-show="activeTab !== 'rent'" x-cloak>{{ app()->getLocale() === 'ar' ? 'نوع النشاط' : 'Category' }}</span>
                        </label>
                        <div class="flex items-center gap-1.5">
                            <span class="text-sm">✨</span>
                            <input x-show="activeTab === 'rent'" type="date" name="check_out" value="{{ now()->addDays(7)->toDateString() }}"
                                   class="w-full text-xs font-semibold bg-transparent focus:outline-none text-brand-brown cursor-pointer">
                            <select x-show="activeTab !== 'rent'" x-cloak name="category" class="w-full text-xs font-semibold bg-transparent focus:outline-none text-brand-brown cursor-pointer">
                                <option value="all">{{ app()->getLocale() === 'ar' ? 'جميع الفئات' : 'All Types' }}</option>
                                <option value="villas">Lagoon Waterfront Villas</option>
                                <option value="boat-trips">Private Yacht Charters</option>
                            </select>
                        </div>
                    </div>

                    <!-- Guests & Submit CTA -->
                    <div class="flex gap-2 items-center">
                        <div class="flex-1 p-3 bg-brand-sand-light/60 hover:bg-brand-sand-light rounded-2xl border border-brand-border/80 transition-colors">
                            <label class="block text-[10px] font-bold uppercase tracking-wider text-brand-brown-muted mb-1">
                                {{ app()->getLocale() === 'ar' ? 'النزلاء' : 'Guests' }}
                            </label>
                            <div class="flex items-center gap-1.5">
                                <span class="text-sm">👥</span>
                                <select name="guests" class="w-full text-xs font-semibold bg-transparent focus:outline-none text-brand-brown cursor-pointer">
                                    <option value="1">1 Guest</option>
                                    <option value="2" selected>2 Guests</option>
                                    <option value="4">4 Guests</option>
                                    <option value="6">6 Guests</option>
                                    <option value="8">8+ Guests</option>
                                </select>
                            </div>
                        </div>

                        <button type="submit" class="h-full px-5 py-3.5 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                            <span class="hidden sm:inline">{{ app()->getLocale() === 'ar' ? 'بحث' : 'Search' }}</span>
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </div>
</section>

<!-- 2. Brand Narrative & 3 Core Ecosystem Pillars (Matching Screenshot) -->
<section class="py-20 lg:py-24 px-6 lg:px-12 bg-[#FAF8F5] relative overflow-hidden">
    <div class="max-w-7xl mx-auto">
        <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
            <div class="max-w-3xl">
                <span class="text-xs uppercase font-bold tracking-[0.25em] text-brand-terracotta block mb-3">
                    {{ app()->getLocale() === 'ar' ? 'منظومة أسلوب حياة استثنائية' : 'A Curated Lifestyle Ecosystem' }}
                </span>
                <h2 class="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-brand-brown leading-[1.2]">
                    {{ app()->getLocale() === 'ar' ? 'حيث تلتقي راحة البال الساحلية بالفخامة العفوية' : 'Where Bohemian Serenity Meets Effortless Coastal Luxury' }}
                </h2>
                <p class="text-xs sm:text-sm text-brand-brown-muted mt-4 font-light leading-relaxed max-w-2xl">
                    {{ app()->getLocale() === 'ar'
                        ? 'جو ناو هي منصة متخصصة ومستقلة للإقامات الفندقية والعقارات الحصرية في الجونة. كل فيلا خاضعة لمعايير تفتيش صارمة، كل قبطان يخت مرخص بأعلى الشهادات، وفريق الكونسيرج لدينا متواجد على أرض الجونة 24 ساعة لضمان راحتك المطلقة.'
                        : 'GouNow is an independent hospitality and real estate platform dedicated exclusively to the elite life in El Gouna. Every villa is privately inspected and vetted, every yacht captain is rigorously licensed, and our concierge team is on the ground in town 24/7 to ensure flawless execution.' }}
                </p>
            </div>

            <!-- 100% Vetted Verification Badge -->
            <div class="shrink-0 flex items-center gap-3.5 px-5 py-3 rounded-2xl bg-white border border-brand-border/80 shadow-xs">
                <div class="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600 font-bold">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                </div>
                <div>
                    <span class="block text-xs font-bold text-brand-brown tracking-tight">100% Vetted &amp; Verified</span>
                    <span class="block text-[11px] text-brand-brown-muted font-light">Direct Owners &amp; Licensed Skippers</span>
                </div>
            </div>
        </div>

        <!-- 3 Feature Pillars -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <a href="{{ route('properties.index', ['listing_type' => 'rent']) }}" class="group bg-white p-8 rounded-3xl border border-brand-border/70 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative flex flex-col justify-between">
                <div>
                    <div class="w-14 h-14 rounded-2xl bg-brand-sand-light/80 border border-brand-border flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-terracotta/10 transition-transform duration-300">
                        <svg class="w-6 h-6 text-brand-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                    </div>
                    <h3 class="font-serif text-xl font-bold text-brand-brown mb-3 group-hover:text-brand-terracotta transition-colors">
                        {{ app()->getLocale() === 'ar' ? 'فلل وإقامات بحيرات خاصة' : 'Curated Private Stays' }}
                    </h3>
                    <p class="text-xs sm:text-sm text-brand-brown-muted font-light leading-relaxed">
                        {{ app()->getLocale() === 'ar' ? 'فلل بإطلالة شاطئية مباشرة على البحيرة، مسابح خاصة مدفأة، وتصميمات معمارية نوبية وعصرية فاخرة مع طهاة حسب الطلب.' : 'Direct lagoon access villas, ultra-luxury townhomes, private pools & panoramic sunset views with daily housekeeping and private chef on demand.' }}
                    </p>
                </div>
                <div class="pt-6 mt-6 border-t border-brand-border/50 flex items-center justify-between text-xs font-semibold text-brand-terracotta">
                    <span>{{ app()->getLocale() === 'ar' ? 'استكشف الفلل' : 'Discover More' }}</span>
                    <span class="transform group-hover:translate-x-1.5 transition-transform duration-300">&rarr;</span>
                </div>
            </a>

            <a href="{{ route('experiences.index') }}" class="group bg-white p-8 rounded-3xl border border-brand-border/70 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative flex flex-col justify-between">
                <div>
                    <div class="w-14 h-14 rounded-2xl bg-brand-sand-light/80 border border-brand-border flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-terracotta/10 transition-transform duration-300">
                        <svg class="w-6 h-6 text-brand-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                    </div>
                    <h3 class="font-serif text-xl font-bold text-brand-brown mb-3 group-hover:text-brand-terracotta transition-colors">
                        {{ app()->getLocale() === 'ar' ? 'يخوت ورحلات بحرية خاصة' : 'Tailored Yacht Charters' }}
                    </h3>
                    <p class="text-xs sm:text-sm text-brand-brown-muted font-light leading-relaxed">
                        {{ app()->getLocale() === 'ar' ? 'رحلات نهارية ويخوت غروب إلى جزر البحر الأحمر البكر وجزيرة طويلة مع وجبات بحرية طازجة ومعدات سنوركلينج فاخرة.' : 'Bespoke full-day or sunset cruises. Catered dining, professional skippers & deep-sea exploration around pristine Red Sea islands.' }}
                    </p>
                </div>
                <div class="pt-6 mt-6 border-t border-brand-border/50 flex items-center justify-between text-xs font-semibold text-brand-terracotta">
                    <span>{{ app()->getLocale() === 'ar' ? 'استكشف اليخوت' : 'Discover More' }}</span>
                    <span class="transform group-hover:translate-x-1.5 transition-transform duration-300">&rarr;</span>
                </div>
            </a>

            <a href="#concierge" class="group bg-white p-8 rounded-3xl border border-brand-border/70 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative flex flex-col justify-between">
                <div>
                    <div class="w-14 h-14 rounded-2xl bg-brand-sand-light/80 border border-brand-border flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-terracotta/10 transition-transform duration-300">
                        <svg class="w-6 h-6 text-brand-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
                    </div>
                    <h3 class="font-serif text-xl font-bold text-brand-brown mb-3 group-hover:text-brand-terracotta transition-colors">
                        {{ app()->getLocale() === 'ar' ? 'كونسيرج شخصي 24/7' : '24/7 Concierge on Demand' }}
                    </h3>
                    <p class="text-xs sm:text-sm text-brand-brown-muted font-light leading-relaxed">
                        {{ app()->getLocale() === 'ar' ? 'حجوزات أرقى المطاعم، تنقلات المطار السريعة، جلسات سبا في الفيلا، وإدارة شاملة ومريحة لجدول عطلتك.' : 'Reservations at coveted dining spots, private airport transfers, in-villa spa treatments, and seamless VIP itinerary management.' }}
                    </p>
                </div>
                <div class="pt-6 mt-6 border-t border-brand-border/50 flex items-center justify-between text-xs font-semibold text-brand-terracotta">
                    <span>{{ app()->getLocale() === 'ar' ? 'تواصل مع الكونسيرج' : 'Discover More' }}</span>
                    <span class="transform group-hover:translate-x-1.5 transition-transform duration-300">&rarr;</span>
                </div>
            </a>
        </div>
    </div>
</section>

<!-- 3. Featured Vacation Stays Split Showcase (Matching Screenshot) -->
<section class="py-20 lg:py-24 px-6 lg:px-12 max-w-7xl mx-auto"
         x-data="{
             selectedStay: 0,
             stays: [
                 {
                     title: 'Fanadir Bay Waterfront Villa',
                     location: 'Fanadir Bay • El Gouna',
                     rating: '4.98 (24 reviews)',
                     beds: 5, baths: 6, guests: 10, area: 480,
                     price: '12,000',
                     desc: 'A masterwork of modern lagoon architecture with infinity pool, private jetty, outdoor dining lounge, and 5 lavish ensuite master bedrooms.',
                     slug: 'fanadir-bay-waterfront-villa',
                     images: [
                         'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1400&q=85',
                         'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=85',
                         'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85',
                         'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85'
                     ],
                     imgIdx: 0
                 },
                 {
                     title: 'Abu Tig Marina Luxury Penthouse',
                     location: 'Abu Tig Marina',
                     rating: '4.95 (19 reviews)',
                     beds: 3, baths: 3, guests: 6, area: 220,
                     price: '8,500',
                     desc: 'Perched over the marina promenade with rooftop jacuzzi overlooking luxury superyachts, bistros, and international boutiques.',
                     slug: 'abu-tig-marina-luxury-penthouse',
                     images: [
                         'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
                         'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80'
                     ],
                     imgIdx: 0
                 },
                 {
                     title: 'Ancient Sands Hillcrest Sunseeker Retreat',
                     location: 'Ancient Sands',
                     rating: '4.96 (15 reviews)',
                     beds: 4, baths: 4, guests: 8, area: 350,
                     price: '10,200',
                     desc: 'Perched on the hillcrest overlooking the golf fairways and Red Sea horizon. Dual infinity swimming pools and shaded lounge.',
                     slug: 'ancient-sands-hillcrest-retreat',
                     images: [
                         'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
                     ],
                     imgIdx: 0
                 },
                 {
                     title: 'Steigenberger Lagoon View Villa',
                     location: 'Golf Lagoons',
                     rating: '4.92 (28 reviews)',
                     beds: 3, baths: 3, guests: 6, area: 260,
                     price: '7,800',
                     desc: 'Serene lagoon sanctuary with private sandy beach access, heated plunge pool, lush palm garden, and effortless relaxation.',
                     slug: 'steigenberger-lagoon-view-villa',
                     images: [
                         'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80'
                     ],
                     imgIdx: 0
                 }
             ]
         }">
    
    <div class="flex flex-col md:flex-row md:items-end justify-between mb-12">
        <div>
            <span class="text-xs uppercase font-bold tracking-[0.25em] text-brand-terracotta block mb-2">
                Handpicked Residences • 100% Exclusive Waterfronts
            </span>
            <h2 class="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-brand-brown">
                Featured Vacation Stays
            </h2>
            <p class="text-xs sm:text-sm text-brand-brown-muted mt-2 max-w-2xl font-light leading-relaxed">
                Explore the most coveted villas &amp; waterfront penthouses across El Gouna. Every reservation includes complimentary arrival transfer and dedicated villa host.
            </p>
        </div>

        <div class="mt-6 md:mt-0 flex items-center gap-4">
            <div class="flex items-center gap-2">
                <button @click="selectedStay = (selectedStay === 0 ? stays.length - 1 : selectedStay - 1)"
                        class="w-10 h-10 rounded-full border border-brand-border bg-white text-brand-brown hover:bg-brand-sand-light transition-colors flex items-center justify-center cursor-pointer shadow-xs">
                    &larr;
                </button>
                <button @click="selectedStay = (selectedStay === stays.length - 1 ? 0 : selectedStay + 1)"
                        class="w-10 h-10 rounded-full border border-brand-border bg-white text-brand-brown hover:bg-brand-sand-light transition-colors flex items-center justify-center cursor-pointer shadow-xs">
                    &rarr;
                </button>
            </div>
            <a href="{{ route('properties.index', ['listing_type' => 'rent']) }}" class="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-terracotta hover:text-brand-terracotta-dark transition-colors group">
                <span>View All</span>
                <span class="transform group-hover:translate-x-1 transition-transform">&rarr;</span>
            </a>
        </div>
    </div>

    <!-- Flagship Split Showcase Card -->
    <div class="bg-white rounded-3xl border border-brand-border/80 shadow-md overflow-hidden p-6 sm:p-8 lg:p-10 mb-12">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <!-- Left: Image Gallery -->
            <div class="lg:col-span-7 flex flex-col gap-3">
                <div class="relative h-[340px] sm:h-[440px] rounded-2xl overflow-hidden bg-brand-sand">
                    <img :src="stays[selectedStay].images[stays[selectedStay].imgIdx]" :alt="stays[selectedStay].title"
                         class="w-full h-full object-cover transition-opacity duration-300">

                    <!-- Badges -->
                    <div class="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
                        <span class="px-3 py-1 bg-white/95 backdrop-blur-md text-brand-brown text-[11px] font-bold rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1 border border-brand-border">
                            <span>★</span> Top Rated
                        </span>
                        <span class="px-3 py-1 bg-brand-terracotta text-white text-[11px] font-bold rounded-full uppercase tracking-wider shadow-xs">
                            Lagoon Access
                        </span>
                    </div>

                    <!-- Counter -->
                    <div class="absolute top-4 right-4 z-10 px-3 py-1 bg-black/60 backdrop-blur-md text-white text-xs font-semibold rounded-full">
                        <span x-text="stays[selectedStay].imgIdx + 1"></span> / <span x-text="stays[selectedStay].images.length"></span>
                    </div>

                    <!-- Next/Prev on Image -->
                    <div class="absolute inset-y-0 inset-x-3 flex items-center justify-between pointer-events-none z-10" x-show="stays[selectedStay].images.length > 1">
                        <button type="button" @click.stop="stays[selectedStay].imgIdx = (stays[selectedStay].imgIdx === 0 ? stays[selectedStay].images.length - 1 : stays[selectedStay].imgIdx - 1)"
                                class="w-9 h-9 rounded-full bg-white/90 backdrop-blur-md text-brand-brown hover:bg-white flex items-center justify-center pointer-events-auto shadow-md cursor-pointer">
                            &#10094;
                        </button>
                        <button type="button" @click.stop="stays[selectedStay].imgIdx = (stays[selectedStay].imgIdx === stays[selectedStay].images.length - 1 ? 0 : stays[selectedStay].imgIdx + 1)"
                                class="w-9 h-9 rounded-full bg-white/90 backdrop-blur-md text-brand-brown hover:bg-white flex items-center justify-center pointer-events-auto shadow-md cursor-pointer">
                            &#10095;
                        </button>
                    </div>
                </div>

                <!-- Thumbnail Strip -->
                <div class="flex items-center gap-2 overflow-x-auto no-scrollbar py-1" x-show="stays[selectedStay].images.length > 1">
                    <template x-for="(img, idx) in stays[selectedStay].images" :key="idx">
                        <button type="button" @click="stays[selectedStay].imgIdx = idx"
                                :class="stays[selectedStay].imgIdx === idx ? 'border-brand-terracotta scale-105 shadow-xs' : 'border-transparent opacity-60 hover:opacity-100'"
                                class="relative w-16 h-12 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer">
                            <img :src="img" class="w-full h-full object-cover">
                        </button>
                    </template>
                </div>
            </div>

            <!-- Right: Property Specs -->
            <div class="lg:col-span-5 flex flex-col justify-between h-full space-y-6">
                <div>
                    <div class="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-brand-terracotta mb-2">
                        <span x-text="stays[selectedStay].location"></span>
                        <span class="flex items-center gap-1 text-brand-brown">
                            <span class="text-amber-500">★</span> <span x-text="stays[selectedStay].rating"></span>
                        </span>
                    </div>

                    <h3 class="font-serif text-2xl sm:text-3xl font-bold text-brand-brown leading-tight mb-3" x-text="stays[selectedStay].title"></h3>

                    <p class="text-xs sm:text-sm text-brand-brown-muted font-light leading-relaxed mb-6" x-text="stays[selectedStay].desc"></p>

                    <!-- Specs Grid -->
                    <div class="grid grid-cols-4 gap-2 text-center py-4 px-3 bg-brand-sand-light/60 rounded-2xl border border-brand-border/70 mb-6">
                        <div>
                            <span class="block text-base sm:text-lg font-bold text-brand-brown" x-text="stays[selectedStay].beds"></span>
                            <span class="block text-[10px] uppercase font-semibold text-brand-brown-muted">Beds</span>
                        </div>
                        <div>
                            <span class="block text-base sm:text-lg font-bold text-brand-brown" x-text="stays[selectedStay].baths"></span>
                            <span class="block text-[10px] uppercase font-semibold text-brand-brown-muted">Baths</span>
                        </div>
                        <div>
                            <span class="block text-base sm:text-lg font-bold text-brand-brown" x-text="stays[selectedStay].guests"></span>
                            <span class="block text-[10px] uppercase font-semibold text-brand-brown-muted">Guests</span>
                        </div>
                        <div>
                            <span class="block text-base sm:text-lg font-bold text-brand-brown" x-text="stays[selectedStay].area"></span>
                            <span class="block text-[10px] uppercase font-semibold text-brand-brown-muted">m² BUA</span>
                        </div>
                    </div>

                    <!-- Checklist -->
                    <div class="space-y-2 mb-6 text-xs text-brand-brown">
                        <div class="flex items-center gap-2">
                            <span class="text-emerald-600 font-bold">✓</span>
                            <span>Heated Infinity Edge Pool &amp; Sunbeds</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="text-emerald-600 font-bold">✓</span>
                            <span>Private Deep-Water Jet Ski Jetty &amp; Mooring</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="text-emerald-600 font-bold">✓</span>
                            <span>Dedicated Villa Host &amp; Daily Housekeeping</span>
                        </div>
                    </div>
                </div>

                <!-- Price & CTA -->
                <div class="pt-6 border-t border-brand-border/70">
                    <div class="flex items-baseline justify-between mb-4">
                        <div>
                            <span class="text-[10px] uppercase font-bold text-brand-brown-muted tracking-wider block">From / Night</span>
                            <div class="flex items-baseline gap-1">
                                <span class="text-2xl sm:text-3xl font-bold font-serif text-brand-brown" x-text="stays[selectedStay].price"></span>
                                <span class="text-xs font-semibold text-brand-brown-muted">EGP / night</span>
                            </div>
                        </div>
                        <span class="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/50">Instant Confirmation</span>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <a :href="'/checkout/' + stays[selectedStay].slug" class="py-3 px-4 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider text-center transition-all duration-200 shadow-md hover:shadow-lg">
                            Book This Villa
                        </a>
                        <a :href="'/stays/' + stays[selectedStay].slug" class="py-3 px-4 bg-brand-sand-light hover:bg-brand-sand text-brand-brown rounded-xl text-xs font-bold uppercase tracking-wider text-center transition-colors border border-brand-border">
                            Contact Host / Details
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Secondary Interactive Cards Track -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <template x-for="(st, idx) in stays" :key="idx">
            <div @click="selectedStay = idx"
                 :class="selectedStay === idx ? 'border-brand-terracotta ring-2 ring-brand-terracotta/20 shadow-md' : 'border-brand-border'"
                 class="group bg-white rounded-2xl overflow-hidden border cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between">
                <div>
                    <div class="relative h-44 overflow-hidden bg-brand-sand">
                        <img :src="st.images[0]" :alt="st.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                        <div class="absolute top-3 left-3">
                            <span class="px-2.5 py-1 bg-white/95 backdrop-blur-md text-brand-brown text-[10px] font-bold rounded-full uppercase tracking-wider shadow-xs" x-text="st.location"></span>
                        </div>
                    </div>
                    <div class="p-4">
                        <h4 class="font-serif text-sm font-bold text-brand-brown line-clamp-1 group-hover:text-brand-terracotta transition-colors mb-1" x-text="st.title"></h4>
                        <div class="flex items-center gap-3 text-[11px] text-brand-brown-muted mb-3 font-light">
                            <span x-text="st.beds + ' Beds'"></span>
                            <span>•</span>
                            <span x-text="st.baths + ' Baths'"></span>
                            <span>•</span>
                            <span x-text="st.guests + ' Guests'"></span>
                        </div>
                    </div>
                </div>
                <div class="px-4 pb-4 pt-2 border-t border-brand-border/60 flex items-center justify-between">
                    <div>
                        <span class="text-xs font-bold text-brand-brown" x-text="st.price"></span>
                        <span class="text-[10px] text-brand-brown-muted ml-1">EGP/nt</span>
                    </div>
                    <span class="text-[11px] font-bold text-brand-terracotta group-hover:underline">View Details &rarr;</span>
                </div>
            </div>
        </template>
    </div>
</section>

<!-- 4. Curated Experiences (Tawila Island Yacht Charter) -->
<section class="py-20 lg:py-24 px-6 lg:px-12 bg-white border-t border-brand-border/80"
         x-data="{
             selectedExp: 0,
             exps: [
                 {
                     title: 'Private Yacht Charter to Tawila Island',
                     location: 'Abu Tig Marina • All Day (8 Hrs)',
                     rating: '5.0 (38 reviews)',
                     guests: 12,
                     duration: 'Full Day (8h)',
                     crew: 'Skipper & Chef',
                     price: '36,000',
                     desc: 'Cruise the azure lagoons and open turquoise waters of Tawila. Enjoy freshly prepared seafood lunch on board, premium snorkeling gear, and sunset cocktails.',
                     slug: 'luxury-private-yacht-charter-tawila-island',
                     image: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=1400&q=85'
                 },
                 {
                     title: 'Sunset Desert Quad Safari & Bedouin Dinner',
                     location: 'Red Sea Mountains • 4.5 Hrs',
                     rating: '4.95 (42 reviews)',
                     guests: 16,
                     duration: '4.5 Hours',
                     crew: 'Bedouin Guides',
                     price: '2,800',
                     desc: 'Drive powerful desert buggies through the Red Sea mountains, followed by candlelit Bedouin feast and telescope stargazing under the desert sky.',
                     slug: 'sunset-desert-quad-safari-bedouin-dinner',
                     image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80'
                 },
                 {
                     title: 'Mangroovy Beach Kitesurfing & Foiling Masterclass',
                     location: 'Mangroovy Beach • 3 Hrs',
                     rating: '4.98 (29 reviews)',
                     guests: 4,
                     duration: '3 Hours',
                     crew: 'Certified IKO Coach',
                     price: '3,400',
                     desc: 'One-on-one IKO certified coaching with radio helmet communication and premium Duotone gear on El Gouna butter-flat lagoons.',
                     slug: 'private-kitesurf-coaching-mangroovy',
                     image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'
                 }
             ]
         }">
    <div class="max-w-7xl mx-auto">
        <div class="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
                <span class="text-xs uppercase font-bold tracking-[0.25em] text-brand-terracotta block mb-2">
                    Red Sea Discoveries • Unforgettable Experiences
                </span>
                <h2 class="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-brand-brown">
                    Curated Experiences
                </h2>
                <p class="text-xs sm:text-sm text-brand-brown-muted mt-2 max-w-2xl font-light leading-relaxed">
                    Embark on private yacht charters, kitesurfing adventures, desert safari banquets, and customized diving expeditions across the Red Sea.
                </p>
            </div>
            <a href="{{ route('experiences.index') }}" class="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-terracotta hover:text-brand-terracotta-dark transition-colors group">
                <span>View All Experiences</span>
                <span class="transform group-hover:translate-x-1 transition-transform">&rarr;</span>
            </a>
        </div>

        <!-- Split Yacht Showcase Card -->
        <div class="bg-[#FAF8F5] rounded-3xl border border-brand-border/80 shadow-md overflow-hidden p-6 sm:p-8 lg:p-10 mb-12">
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div class="lg:col-span-7">
                    <div class="relative h-[340px] sm:h-[440px] rounded-2xl overflow-hidden bg-brand-sand">
                        <img :src="exps[selectedExp].image" :alt="exps[selectedExp].title" class="w-full h-full object-cover">
                        <div class="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
                            <span class="px-3 py-1 bg-white/95 backdrop-blur-md text-brand-brown text-[11px] font-bold rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1 border border-brand-border">
                                <span>⚓</span> VIP Private Charter
                            </span>
                            <span class="px-3 py-1 bg-brand-terracotta text-white text-[11px] font-bold rounded-full uppercase tracking-wider shadow-xs">
                                All-Inclusive
                            </span>
                        </div>
                        <div class="absolute bottom-4 left-4 z-10 px-3 py-1.5 bg-black/60 backdrop-blur-md text-white text-xs font-medium rounded-xl flex items-center gap-2">
                            <span>📍</span>
                            <span x-text="exps[selectedExp].location"></span>
                        </div>
                    </div>
                </div>

                <div class="lg:col-span-5 flex flex-col justify-between h-full space-y-6">
                    <div>
                        <div class="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-brand-terracotta mb-2">
                            <span>Private Boat Trips</span>
                            <span class="flex items-center gap-1 text-brand-brown">
                                <span class="text-amber-500">★</span> <span x-text="exps[selectedExp].rating"></span>
                            </span>
                        </div>
                        <h3 class="font-serif text-2xl sm:text-3xl font-bold text-brand-brown leading-tight mb-3" x-text="exps[selectedExp].title"></h3>
                        <p class="text-xs sm:text-sm text-brand-brown-muted font-light leading-relaxed mb-6" x-text="exps[selectedExp].desc"></p>

                        <div class="grid grid-cols-3 gap-2 text-center py-4 px-3 bg-white rounded-2xl border border-brand-border/70 mb-6 shadow-xs">
                            <div>
                                <span class="block text-base sm:text-lg font-bold text-brand-brown" x-text="exps[selectedExp].guests"></span>
                                <span class="block text-[10px] uppercase font-semibold text-brand-brown-muted">Max Guests</span>
                            </div>
                            <div>
                                <span class="block text-base sm:text-lg font-bold text-brand-brown" x-text="exps[selectedExp].duration"></span>
                                <span class="block text-[10px] uppercase font-semibold text-brand-brown-muted">Duration</span>
                            </div>
                            <div>
                                <span class="block text-base sm:text-lg font-bold text-brand-brown" x-text="exps[selectedExp].crew"></span>
                                <span class="block text-[10px] uppercase font-semibold text-brand-brown-muted">Service</span>
                            </div>
                        </div>

                        <div class="space-y-2 mb-6 text-xs text-brand-brown">
                            <div class="flex items-center gap-2"><span class="text-emerald-600 font-bold">✓</span><span>Exclusive Tawila Island Sandbar Anchorage</span></div>
                            <div class="flex items-center gap-2"><span class="text-emerald-600 font-bold">✓</span><span>Fresh Gourmet Seafood Lunch &amp; Refreshments</span></div>
                            <div class="flex items-center gap-2"><span class="text-emerald-600 font-bold">✓</span><span>Seabob, Stand-up Paddleboards &amp; Snorkel Gear</span></div>
                        </div>
                    </div>

                    <div class="pt-6 border-t border-brand-border/70">
                        <div class="flex items-baseline justify-between mb-4">
                            <div>
                                <span class="text-[10px] uppercase font-bold text-brand-brown-muted tracking-wider block">Charter Pricing</span>
                                <div class="flex items-baseline gap-1">
                                    <span class="text-2xl sm:text-3xl font-bold font-serif text-brand-brown" x-text="exps[selectedExp].price"></span>
                                    <span class="text-xs font-semibold text-brand-brown-muted">EGP</span>
                                </div>
                            </div>
                            <span class="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/50">VIP Fast Track</span>
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <a :href="'/experiences/' + exps[selectedExp].slug" class="py-3 px-4 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider text-center transition-all duration-200 shadow-md hover:shadow-lg">
                                Reserve Experience
                            </a>
                            <a :href="'/experiences/' + exps[selectedExp].slug" class="py-3 px-4 bg-white hover:bg-brand-sand-light text-brand-brown rounded-xl text-xs font-bold uppercase tracking-wider text-center transition-colors border border-brand-border">
                                View Itinerary
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Secondary Track -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <template x-for="(exp, idx) in exps" :key="idx">
                <div @click="selectedExp = idx"
                     :class="selectedExp === idx ? 'border-brand-terracotta ring-2 ring-brand-terracotta/20 shadow-md' : 'border-brand-border'"
                     class="group bg-white rounded-2xl overflow-hidden border cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between">
                    <div>
                        <div class="relative h-44 overflow-hidden bg-brand-sand">
                            <img :src="exp.image" :alt="exp.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                        </div>
                        <div class="p-4">
                            <h4 class="font-serif text-sm font-bold text-brand-brown line-clamp-1 group-hover:text-brand-terracotta transition-colors mb-1" x-text="exp.title"></h4>
                            <div class="flex items-center gap-3 text-[11px] text-brand-brown-muted mb-3 font-light">
                                <span x-text="exp.duration"></span>
                                <span>•</span>
                                <span x-text="'Up to ' + exp.guests + ' Guests'"></span>
                            </div>
                        </div>
                    </div>
                    <div class="px-4 pb-4 pt-2 border-t border-brand-border/60 flex items-center justify-between">
                        <div>
                            <span class="text-xs font-bold text-brand-brown" x-text="exp.price"></span>
                            <span class="text-[10px] text-brand-brown-muted ml-1">EGP</span>
                        </div>
                        <span class="text-[11px] font-bold text-brand-terracotta group-hover:underline">Details &rarr;</span>
                    </div>
                </div>
            </template>
        </div>
    </div>
</section>

<!-- 5. Properties For Sale (Tawila Lagoon Modern Designer Villa) -->
<section class="py-20 lg:py-24 px-6 lg:px-12 bg-white border-t border-brand-border/80">
    <div class="max-w-7xl mx-auto">
        <div class="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
                <span class="text-xs uppercase font-bold tracking-[0.25em] text-brand-terracotta block mb-2">
                    Exclusive Real Estate • Waterfront Investments
                </span>
                <h2 class="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-brand-brown">
                    Properties For Sale
                </h2>
                <p class="text-xs sm:text-sm text-brand-brown-muted mt-2 max-w-2xl font-light leading-relaxed">
                    Exceptional freehold and leasehold properties in prime El Gouna locations. Fully vetted legal status and high projected rental yields.
                </p>
            </div>
            <a href="{{ route('properties.index', ['listing_type' => 'sale']) }}" class="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-terracotta hover:text-brand-terracotta-dark transition-colors group">
                <span>View All Properties</span>
                <span class="transform group-hover:translate-x-1 transition-transform">&rarr;</span>
            </a>
        </div>

        <!-- Split Villa For Sale Showcase Card -->
        <div class="bg-[#FAF8F5] rounded-3xl border border-brand-border/80 shadow-md overflow-hidden p-6 sm:p-8 lg:p-10 mb-12">
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div class="lg:col-span-7">
                    <div class="relative h-[340px] sm:h-[440px] rounded-2xl overflow-hidden bg-brand-sand">
                        <img src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1400&q=85" 
                             alt="Tawila Lagoon Modern Designer Villa" class="w-full h-full object-cover">
                        <div class="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
                            <span class="px-3 py-1 bg-white/95 backdrop-blur-md text-brand-brown text-[11px] font-bold rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1 border border-brand-border">
                                <span>🏛️</span> Exclusive Listing
                            </span>
                            <span class="px-3 py-1 bg-brand-terracotta text-white text-[11px] font-bold rounded-full uppercase tracking-wider shadow-xs">
                                Lagoon Frontage
                            </span>
                        </div>
                        <div class="absolute bottom-4 left-4 z-10 px-3 py-1.5 bg-black/60 backdrop-blur-md text-white text-xs font-medium rounded-xl flex items-center gap-2">
                            <span>📍</span>
                            <span>Tawila Lagoons • El Gouna</span>
                        </div>
                    </div>
                </div>

                <div class="lg:col-span-5 flex flex-col justify-between h-full space-y-6">
                    <div>
                        <div class="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-brand-terracotta mb-2">
                            <span>Signature Real Estate</span>
                            <span class="flex items-center gap-1 text-brand-brown"><span class="text-amber-500">★</span> 4.95 Rating</span>
                        </div>
                        <h3 class="font-serif text-2xl sm:text-3xl font-bold text-brand-brown leading-tight mb-3">
                            Tawila Lagoon Modern Designer Villa
                        </h3>
                        <p class="text-xs sm:text-sm text-brand-brown-muted font-light leading-relaxed mb-6">
                            Architectural masterpiece designed by European studio with panoramic infinity lagoon views, double-height living areas, private pontoon, and smart-home automation.
                        </p>

                        <div class="grid grid-cols-4 gap-2 text-center py-4 px-3 bg-white rounded-2xl border border-brand-border/70 mb-6 shadow-xs">
                            <div><span class="block text-base sm:text-lg font-bold text-brand-brown">5</span><span class="block text-[10px] uppercase font-semibold text-brand-brown-muted">Beds</span></div>
                            <div><span class="block text-base sm:text-lg font-bold text-brand-brown">6</span><span class="block text-[10px] uppercase font-semibold text-brand-brown-muted">Baths</span></div>
                            <div><span class="block text-base sm:text-lg font-bold text-brand-brown">450</span><span class="block text-[10px] uppercase font-semibold text-brand-brown-muted">m² BUA</span></div>
                            <div><span class="block text-base sm:text-lg font-bold text-brand-brown">750</span><span class="block text-[10px] uppercase font-semibold text-brand-brown-muted">m² Plot</span></div>
                        </div>

                        <div class="space-y-2 mb-6 text-xs text-brand-brown">
                            <div class="flex items-center gap-2"><span class="text-emerald-600 font-bold">✓</span><span>Direct Lagoon Frontage with Private Beach &amp; Pontoon</span></div>
                            <div class="flex items-center gap-2"><span class="text-emerald-600 font-bold">✓</span><span>Fully Furnished by Award-Winning European Interior Designer</span></div>
                            <div class="flex items-center gap-2"><span class="text-emerald-600 font-bold">✓</span><span>High Rental Yield Potential (11.4% Projected ROI)</span></div>
                        </div>
                    </div>

                    <div class="pt-6 border-t border-brand-border/70">
                        <div class="flex items-baseline justify-between mb-4">
                            <div>
                                <span class="text-[10px] uppercase font-bold text-brand-brown-muted tracking-wider block">Asking Price</span>
                                <div class="flex items-baseline gap-1">
                                    <span class="text-2xl sm:text-3xl font-bold font-serif text-brand-brown">34,000,000</span>
                                    <span class="text-xs font-semibold text-brand-brown-muted">EGP</span>
                                </div>
                            </div>
                            <span class="text-[11px] font-semibold text-brand-terracotta bg-brand-terracotta/10 px-2.5 py-1 rounded-full border border-brand-terracotta/20">Payment Plans Available</span>
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <a href="https://wa.me/201000000000?text=Hello%20GouNow,%20I%20would%20like%20to%20schedule%20a%20private%20viewing%20for%20Tawila%20Lagoon%20Villa" target="_blank" class="py-3 px-4 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider text-center transition-all duration-200 shadow-md hover:shadow-lg">
                                Request Viewing
                            </a>
                            <a href="{{ route('properties.index', ['listing_type' => 'sale']) }}" class="py-3 px-4 bg-white hover:bg-brand-sand-light text-brand-brown rounded-xl text-xs font-bold uppercase tracking-wider text-center transition-colors border border-brand-border">
                                Download Brochure
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- 6. Praised by Discerning Travelers (Matching Screenshot) -->
<section class="py-20 lg:py-24 px-6 lg:px-12 bg-[#FAF8F5] border-t border-brand-border/80">
    <div class="max-w-7xl mx-auto">
        <div class="text-center max-w-2xl mx-auto mb-16">
            <span class="text-xs uppercase font-bold tracking-[0.25em] text-brand-terracotta block mb-2">Guest Reviews &amp; Reputation</span>
            <h2 class="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-brand-brown">
                Praised by Discerning Travelers
            </h2>
            <p class="text-xs sm:text-sm text-brand-brown-muted mt-2 font-light leading-relaxed">
                Direct reviews from high-net-worth travelers, property owners, and repeat guests who trust us with their Red Sea stays.
            </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="bg-white p-8 rounded-3xl border border-brand-border/80 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
                <div>
                    <div class="flex gap-1 text-amber-500 mb-4 text-sm">★★★★★</div>
                    <p class="text-xs sm:text-sm text-brand-brown leading-relaxed font-light italic mb-6">
                        &ldquo;The most seamless luxury rental experience in El Gouna. The villa was immaculate with breathtaking lagoon views and a heated infinity pool our children adored. The VIP concierge handled our arrival and dinner bookings effortlessly.&rdquo;
                    </p>
                </div>
                <div class="pt-5 border-t border-brand-border/60">
                    <span class="block font-bold text-xs text-brand-brown">Marcus &amp; Sophia V.</span>
                    <span class="block text-[11px] text-brand-brown-muted mt-0.5">Zurich, Switzerland • Fanadir Bay Waterfront Villa</span>
                </div>
            </div>

            <div class="bg-white p-8 rounded-3xl border border-brand-border/80 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
                <div>
                    <div class="flex gap-1 text-amber-500 mb-4 text-sm">★★★★★</div>
                    <p class="text-xs sm:text-sm text-brand-brown leading-relaxed font-light italic mb-6">
                        &ldquo;Our private yacht charter to Tawila Island was undeniably the highlight of our holiday. Professional skipper, gourmet seafood lunch prepared on board, and swimming with wild dolphins in crystal waters. Truly world-class.&rdquo;
                    </p>
                </div>
                <div class="pt-5 border-t border-brand-border/60">
                    <span class="block font-bold text-xs text-brand-brown">Alexander &amp; Claire K.</span>
                    <span class="block text-[11px] text-brand-brown-muted mt-0.5">London, UK • Private Tawila Yacht Expedition</span>
                </div>
            </div>

            <div class="bg-white p-8 rounded-3xl border border-brand-border/80 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
                <div>
                    <div class="flex gap-1 text-amber-500 mb-4 text-sm">★★★★★</div>
                    <p class="text-xs sm:text-sm text-brand-brown leading-relaxed font-light italic mb-6">
                        &ldquo;GouNow sets a brand-new standard for hospitality and real estate advisory on the Red Sea. Transparent transaction, instant communication, and genuine attention to detail. We couldn't be happier with our new home.&rdquo;
                    </p>
                </div>
                <div class="pt-5 border-t border-brand-border/60">
                    <span class="block font-bold text-xs text-brand-brown">Laila &amp; Tarek M.</span>
                    <span class="block text-[11px] text-brand-brown-muted mt-0.5">Cairo, Egypt • Tawila Lagoon Modern Villa Buyer</span>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- 7. What's On This Season (Matching Screenshot) -->
<section id="events" class="py-20 lg:py-24 px-6 lg:px-12 bg-white border-t border-brand-border/80">
    <div class="max-w-7xl mx-auto">
        <div class="text-center max-w-2xl mx-auto mb-16">
            <span class="text-xs uppercase font-bold tracking-[0.25em] text-brand-terracotta block mb-2">El Gouna Happenings &amp; Festivities</span>
            <h2 class="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-brand-brown">
                What&apos;s On This Season
            </h2>
            <p class="text-xs sm:text-sm text-brand-brown-muted mt-2 font-light leading-relaxed">
                Curated cultural gatherings, sunset parties, and private dinners happening in town.
            </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="bg-[#FAF8F5] rounded-3xl overflow-hidden border border-brand-border/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group hover:-translate-y-1">
                <div class="relative h-56 overflow-hidden bg-brand-sand">
                    <img src="https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80" alt="Sunset Lagoon" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    <div class="absolute top-4 left-4">
                        <span class="px-3 py-1 bg-brand-terracotta text-white text-[10px] font-bold rounded-full uppercase tracking-wider shadow-xs">EVERY FRIDAY</span>
                    </div>
                </div>
                <div class="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                    <div>
                        <div class="flex items-center gap-2 text-[11px] text-brand-terracotta font-semibold uppercase tracking-wider mb-2">
                            <span>Live Music &amp; Sunset</span>
                            <span>•</span>
                            <span class="text-brand-brown-muted normal-case font-normal">The Clubhouse Lagoon</span>
                        </div>
                        <h3 class="font-serif text-lg sm:text-xl font-bold text-brand-brown mb-2 group-hover:text-brand-terracotta transition-colors">
                            Sunset Lagoon Acoustic Sessions
                        </h3>
                        <p class="text-xs text-brand-brown-muted line-clamp-3 font-light leading-relaxed mb-6">
                            Acoustic indie sets, artisanal cocktails, and chilled bohemian vibes as the golden twilight reflects over the lagoon.
                        </p>
                    </div>
                    <div class="pt-4 border-t border-brand-border/60 flex items-center justify-between">
                        <span class="text-xs font-semibold text-brand-brown-muted">17:30 - 21:00</span>
                        <a href="https://wa.me/201000000000?text=Hello%20GouNow,%20I%20would%20like%20to%20reserve%20a%20spot%20for%20Sunset%20Acoustic%20Sessions" target="_blank" class="py-2 px-4 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-xs">
                            Reserve Spot
                        </a>
                    </div>
                </div>
            </div>

            <div class="bg-[#FAF8F5] rounded-3xl overflow-hidden border border-brand-border/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group hover:-translate-y-1">
                <div class="relative h-56 overflow-hidden bg-brand-sand">
                    <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80" alt="Gouna Street Food" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    <div class="absolute top-4 left-4">
                        <span class="px-3 py-1 bg-brand-terracotta text-white text-[10px] font-bold rounded-full uppercase tracking-wider shadow-xs">OCT 28, 2026</span>
                    </div>
                </div>
                <div class="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                    <div>
                        <div class="flex items-center gap-2 text-[11px] text-brand-terracotta font-semibold uppercase tracking-wider mb-2">
                            <span>Culinary &amp; Lifestyle</span>
                            <span>•</span>
                            <span class="text-brand-brown-muted normal-case font-normal">Abu Tig Marina Promenade</span>
                        </div>
                        <h3 class="font-serif text-lg sm:text-xl font-bold text-brand-brown mb-2 group-hover:text-brand-terracotta transition-colors">
                            Gouna Street Food &amp; Wine Gathering
                        </h3>
                        <p class="text-xs text-brand-brown-muted line-clamp-3 font-light leading-relaxed mb-6">
                            Curated tasting stations by Red Sea master chefs, boutique Mediterranean wines, and live jazz along the superyacht harbor.
                        </p>
                    </div>
                    <div class="pt-4 border-t border-brand-border/60 flex items-center justify-between">
                        <span class="text-xs font-semibold text-brand-brown-muted">19:00 - LATE</span>
                        <a href="https://wa.me/201000000000?text=Hello%20GouNow,%20I%20would%20like%20to%20attend%20Gouna%20Food%20and%20Wine" target="_blank" class="py-2 px-4 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-xs">
                            Reserve Spot
                        </a>
                    </div>
                </div>
            </div>

            <div class="bg-[#FAF8F5] rounded-3xl overflow-hidden border border-brand-border/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group hover:-translate-y-1">
                <div class="relative h-56 overflow-hidden bg-brand-sand">
                    <img src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80" alt="Full Moon Regatta" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    <div class="absolute top-4 left-4">
                        <span class="px-3 py-1 bg-brand-terracotta text-white text-[10px] font-bold rounded-full uppercase tracking-wider shadow-xs">NOV 04, 2026</span>
                    </div>
                </div>
                <div class="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                    <div>
                        <div class="flex items-center gap-2 text-[11px] text-brand-terracotta font-semibold uppercase tracking-wider mb-2">
                            <span>Yacht Gathering</span>
                            <span>•</span>
                            <span class="text-brand-brown-muted normal-case font-normal">Tawila Anchorage</span>
                        </div>
                        <h3 class="font-serif text-lg sm:text-xl font-bold text-brand-brown mb-2 group-hover:text-brand-terracotta transition-colors">
                            Full Moon Yacht Regatta &amp; Party
                        </h3>
                        <p class="text-xs text-brand-brown-muted line-clamp-3 font-light leading-relaxed mb-6">
                            Flotilla of illuminated luxury yachts sailing out for night swimming, deep house DJ sets under the desert moon, and champagne bar.
                        </p>
                    </div>
                    <div class="pt-4 border-t border-brand-border/60 flex items-center justify-between">
                        <span class="text-xs font-semibold text-brand-brown-muted">20:00 - 02:00</span>
                        <a href="https://wa.me/201000000000?text=Hello%20GouNow,%20I%20would%20like%20to%20join%20Full%20Moon%20Yacht%20Regatta" target="_blank" class="py-2 px-4 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-xs">
                            Reserve Spot
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- 8. Personal Concierge & Tailored Arrangements (Matching Screenshot) -->
<section id="concierge" class="py-20 lg:py-24 px-6 lg:px-12 bg-[#FAF8F5] border-t border-brand-border/80">
    <div class="max-w-7xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <!-- Left Info -->
            <div class="lg:col-span-6">
                <span class="text-xs uppercase font-bold tracking-[0.25em] text-brand-terracotta block mb-2">Bespoke 24/7 Concierge</span>
                <h2 class="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-brand-brown leading-[1.15]">
                    Personal Concierge &amp; Tailored Arrangements
                </h2>
                <p class="text-xs sm:text-sm text-brand-brown-muted mt-4 font-light leading-relaxed max-w-lg">
                    Looking for a tailored yacht charter, VIP airport fast-track, private chef in your villa, or custom event setup? Tell us what you need and our local team will arrange it within 30 minutes.
                </p>

                <div class="mt-8 space-y-4">
                    <div class="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-brand-border/70 shadow-xs">
                        <div class="w-10 h-10 rounded-xl bg-brand-sand-light flex items-center justify-center text-brand-terracotta text-lg">📞</div>
                        <div>
                            <span class="block text-[11px] uppercase font-bold text-brand-brown-muted tracking-wider">Direct VIP Telephone</span>
                            <a href="tel:+201000000000" class="text-sm font-bold text-brand-brown hover:text-brand-terracotta transition-colors">+20 100 000 0000</a>
                        </div>
                    </div>

                    <div class="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-brand-border/70 shadow-xs">
                        <div class="w-10 h-10 rounded-xl bg-brand-sand-light flex items-center justify-center text-brand-terracotta text-lg">✉️</div>
                        <div>
                            <span class="block text-[11px] uppercase font-bold text-brand-brown-muted tracking-wider">Private Client Email</span>
                            <a href="mailto:concierge@gounow.com" class="text-sm font-bold text-brand-brown hover:text-brand-terracotta transition-colors">concierge@gounow.com</a>
                        </div>
                    </div>

                    <div class="flex items-center gap-3.5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200/70 shadow-xs">
                        <div class="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-lg">💬</div>
                        <div class="flex-1">
                            <span class="block text-[11px] uppercase font-bold text-emerald-800 tracking-wider">Instant WhatsApp Concierge</span>
                            <span class="block text-xs text-emerald-700 font-light">On the ground in El Gouna 24 hours a day</span>
                        </div>
                        <a href="https://wa.me/201000000000?text=Hello%20GouNow,%20I%20would%20like%20VIP%20concierge%20assistance" target="_blank" class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors">Chat Now</a>
                    </div>
                </div>
            </div>

            <!-- Right Form -->
            <div class="lg:col-span-6">
                <div class="bg-white p-8 sm:p-10 rounded-3xl border border-brand-border/80 shadow-xl relative overflow-hidden">
                    <div class="mb-6">
                        <h3 class="font-serif text-2xl font-bold text-brand-brown mb-1">Submit Concierge Inquiry</h3>
                        <p class="text-xs text-brand-brown-muted font-light">Our dedicated host will reply with options and tailored pricing within 30 minutes.</p>
                    </div>

                    <form action="{{ route('home.inquire') }}" method="POST" class="space-y-4">
                        @csrf
                        <div>
                            <label class="block text-[11px] font-bold uppercase tracking-wider text-brand-brown mb-1.5">Full Name *</label>
                            <input type="text" name="name" required placeholder="e.g. Lord Alexander Wright" class="w-full px-4 py-3 bg-brand-sand-light/50 border border-brand-border rounded-xl text-xs text-brand-brown focus:outline-none focus:border-brand-terracotta focus:bg-white transition-colors">
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-[11px] font-bold uppercase tracking-wider text-brand-brown mb-1.5">WhatsApp / Phone *</label>
                                <input type="tel" name="phone" required placeholder="+20 100 000 0000" class="w-full px-4 py-3 bg-brand-sand-light/50 border border-brand-border rounded-xl text-xs text-brand-brown focus:outline-none focus:border-brand-terracotta focus:bg-white transition-colors">
                            </div>
                            <div>
                                <label class="block text-[11px] font-bold uppercase tracking-wider text-brand-brown mb-1.5">Email Address *</label>
                                <input type="email" name="email" required placeholder="alexander@domain.com" class="w-full px-4 py-3 bg-brand-sand-light/50 border border-brand-border rounded-xl text-xs text-brand-brown focus:outline-none focus:border-brand-terracotta focus:bg-white transition-colors">
                            </div>
                        </div>

                        <div>
                            <label class="block text-[11px] font-bold uppercase tracking-wider text-brand-brown mb-1.5">Service of Interest</label>
                            <select name="subject" class="w-full px-4 py-3 bg-brand-sand-light/50 border border-brand-border rounded-xl text-xs text-brand-brown focus:outline-none focus:border-brand-terracotta focus:bg-white transition-colors cursor-pointer">
                                <option value="Bespoke Villa Booking">Bespoke Villa Booking</option>
                                <option value="Private Yacht Charter">Private Yacht Charter</option>
                                <option value="Real Estate Acquisition">Real Estate Acquisition &amp; Viewing</option>
                                <option value="In-Villa Private Chef">In-Villa Private Chef Dining</option>
                                <option value="Airport Fast Track">Hurghada Airport VIP Fast-Track Transfer</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-[11px] font-bold uppercase tracking-wider text-brand-brown mb-1.5">Request Details &amp; Preferred Dates</label>
                            <textarea name="message" rows="3" placeholder="Please specify dates, guest party size, or specific requirements..." class="w-full px-4 py-3 bg-brand-sand-light/50 border border-brand-border rounded-xl text-xs text-brand-brown focus:outline-none focus:border-brand-terracotta focus:bg-white transition-colors"></textarea>
                        </div>

                        <button type="submit" class="w-full py-4 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 cursor-pointer">
                            Send Concierge Request
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</section>

@endsection
