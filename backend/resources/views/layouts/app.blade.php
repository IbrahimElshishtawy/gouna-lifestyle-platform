<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}" dir="{{ app()->getLocale() === 'ar' ? 'rtl' : 'ltr' }}" class="h-full bg-[#FAF8F5] scroll-smooth">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <x-seo-head :property="$property ?? null" :experience="$experience ?? null" />

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Tajawal:wght@300;400;500;700&display=swap" rel="stylesheet">

    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        brand: {
                            terracotta: '#B85D3B',
                            'terracotta-dark': '#9A4A2B',
                            sand: '#E5DCD3',
                            'sand-light': '#F6F3EE',
                            'sand-card': '#FAF8F5',
                            brown: '#3D2E26',
                            'brown-dark': '#291F1A',
                            'brown-muted': '#786B63',
                            border: '#E8E2D9',
                        }
                    },
                    fontFamily: {
                        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
                        serif: ['"Playfair Display"', 'serif'],
                        arabic: ['"Tajawal"', 'sans-serif'],
                    }
                }
            }
        }
    </script>

    <!-- Alpine.js -->
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.8/dist/cdn.min.js"></script>
    <style>
        [x-cloak] { display: none !important; }
        body { font-family: {{ app()->getLocale() === 'ar' ? '"Tajawal", "Plus Jakarta Sans", sans-serif' : '"Plus Jakarta Sans", sans-serif' }}; }
    </style>
    @stack('styles')
</head>
<body class="min-h-full flex flex-col text-brand-brown bg-[#FAF8F5] antialiased selection:bg-brand-terracotta/20 selection:text-brand-terracotta" x-data="{ mobileMenuOpen: false }">

    <!-- Top Announcement / Concierge Bar -->
    <div class="bg-brand-brown-dark text-[#E5DCD3] text-xs py-2 px-6 lg:px-12 flex items-center justify-between border-b border-brand-brown/40">
        <div class="flex items-center gap-2">
            <span class="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span class="font-medium tracking-wide">
                {{ app()->getLocale() === 'ar' ? 'كونسيرج الجونة متاح 24/7' : 'El Gouna Concierge 24/7 Service' }}
            </span>
        </div>
        <div class="flex items-center gap-5 text-[11px]">
            <a href="https://wa.me/201000000000?text=Hello%20GouNow,%20I%20need%20assistance" target="_blank" class="hover:text-white transition flex items-center gap-1 font-medium">
                <span>💬 WhatsApp Concierge</span>
            </a>
            <span class="text-brand-brown-muted/60">|</span>
            <!-- Language Switcher -->
            @if(app()->getLocale() === 'ar')
                <a href="{{ route('locale.switch', 'en') }}" class="hover:text-white font-semibold transition">English</a>
            @else
                <a href="{{ route('locale.switch', 'ar') }}" class="hover:text-white font-semibold transition">العربية</a>
            @endif
        </div>
    </div>

    <!-- Main Navigation Bar -->
    <header class="bg-white/95 backdrop-blur-md sticky top-0 z-40 border-b border-brand-border/80 transition-all duration-300">
        <div class="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
            
            <!-- Brand Logo -->
            <a href="{{ route('home') }}" class="flex items-center gap-3 group">
                <img src="{{ asset('assets/images/logo.jpg') }}" alt="GOUNOW" class="h-10 w-auto rounded-lg object-cover shadow-xs group-hover:scale-105 transition-transform duration-300">
                <div class="text-left {{ app()->getLocale() === 'ar' ? 'text-right' : '' }}">
                    <span class="block text-[10px] uppercase font-bold tracking-[0.25em] text-brand-terracotta">El Gouna</span>
                    <span class="block text-base font-serif font-bold text-brand-brown tracking-wider">GOUNOW</span>
                </div>
            </a>

            <!-- Desktop Nav Links -->
            <nav class="hidden md:flex items-center gap-8 text-sm font-medium text-brand-brown">
                <a href="{{ route('properties.index', ['listing_type' => 'rent']) }}" 
                   class="hover:text-brand-terracotta transition {{ request()->is('stays*') && request('listing_type') !== 'sale' ? 'text-brand-terracotta font-semibold' : '' }}">
                    {{ app()->getLocale() === 'ar' ? 'الإقامات والفلل' : 'Stays' }}
                </a>
                <a href="{{ route('properties.index', ['listing_type' => 'sale']) }}" 
                   class="hover:text-brand-terracotta transition {{ request('listing_type') === 'sale' ? 'text-brand-terracotta font-semibold' : '' }}">
                    {{ app()->getLocale() === 'ar' ? 'عقارات للبيع' : 'Real Estate' }}
                </a>
                <a href="{{ route('experiences.index') }}" 
                   class="hover:text-brand-terracotta transition {{ request()->is('experiences*') ? 'text-brand-terracotta font-semibold' : '' }}">
                    {{ app()->getLocale() === 'ar' ? 'تجارب وأنشطة' : 'Experiences' }}
                </a>
                <a href="{{ route('home') }}#events" 
                   class="hover:text-brand-terracotta transition">
                    {{ app()->getLocale() === 'ar' ? 'فعاليات الجونة' : 'What\'s On' }}
                </a>
                <a href="{{ route('home') }}#concierge" 
                   class="hover:text-brand-terracotta transition">
                    {{ app()->getLocale() === 'ar' ? 'تواصل معنا' : 'Concierge' }}
                </a>
            </nav>

            <!-- Actions -->
            <div class="hidden md:flex items-center gap-4">
                <a href="{{ route('properties.index', ['listing_type' => 'rent']) }}" 
                   class="px-5 py-2.5 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition shadow-sm hover:shadow-md">
                    {{ app()->getLocale() === 'ar' ? 'احجز إقامتك' : 'Book a Stay' }}
                </a>
            </div>

            <!-- Mobile Hamburger Button -->
            <div class="flex items-center gap-3 md:hidden">
                <button @click="mobileMenuOpen = !mobileMenuOpen" 
                        class="p-2 text-brand-brown hover:text-brand-terracotta rounded-lg focus:outline-none cursor-pointer"
                        aria-label="Toggle Menu">
                    <svg x-show="!mobileMenuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"/></svg>
                    <svg x-show="mobileMenuOpen" x-cloak class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
            </div>
        </div>

        <!-- Mobile Drawer Menu -->
        <div x-show="mobileMenuOpen" 
             x-cloak 
             x-transition:enter="transition ease-out duration-200"
             x-transition:enter-start="opacity-0 -translate-y-2"
             x-transition:enter-end="opacity-100 translate-y-0"
             x-transition:leave="transition ease-in duration-150"
             x-transition:leave-start="opacity-100 translate-y-0"
             x-transition:leave-end="opacity-0 -translate-y-2"
             class="md:hidden bg-white border-b border-brand-border px-6 py-6 space-y-4 shadow-xl">
            <a href="{{ route('properties.index', ['listing_type' => 'rent']) }}" class="block text-sm font-semibold text-brand-brown hover:text-brand-terracotta py-2">
                {{ app()->getLocale() === 'ar' ? 'الإقامات والفلل' : 'Stays & Luxury Villas' }}
            </a>
            <a href="{{ route('properties.index', ['listing_type' => 'sale']) }}" class="block text-sm font-semibold text-brand-brown hover:text-brand-terracotta py-2">
                {{ app()->getLocale() === 'ar' ? 'عقارات للبيع' : 'Properties For Sale' }}
            </a>
            <a href="{{ route('experiences.index') }}" class="block text-sm font-semibold text-brand-brown hover:text-brand-terracotta py-2">
                {{ app()->getLocale() === 'ar' ? 'تجارب وأنشطة' : 'Experiences & Adventures' }}
            </a>
            <a href="{{ route('home') }}#events" class="block text-sm font-semibold text-brand-brown hover:text-brand-terracotta py-2">
                {{ app()->getLocale() === 'ar' ? 'فعاليات الجونة' : 'What\'s On / Events' }}
            </a>
            <a href="{{ route('home') }}#concierge" class="block text-sm font-semibold text-brand-brown hover:text-brand-terracotta py-2">
                {{ app()->getLocale() === 'ar' ? 'تواصل مع الكونسيرج' : 'Contact Concierge' }}
            </a>
            <div class="pt-4 border-t border-brand-border flex items-center justify-between">
                <a href="{{ route('properties.index', ['listing_type' => 'rent']) }}" class="w-full text-center py-3 bg-brand-terracotta text-white rounded-xl text-xs font-bold uppercase tracking-wider">
                    {{ app()->getLocale() === 'ar' ? 'احجز إقامتك الآن' : 'Book a Stay Now' }}
                </a>
            </div>
        </div>
    </header>

    <!-- Global Flash Notifications -->
    @if(session('success'))
        <div class="max-w-7xl mx-auto px-6 lg:px-12 mt-4 w-full">
            <div class="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <span>✨</span>
                    <span>{{ session('success') }}</span>
                </div>
            </div>
        </div>
    @endif
    @if(session('error'))
        <div class="max-w-7xl mx-auto px-6 lg:px-12 mt-4 w-full">
            <div class="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-2xl flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{{ session('error') }}</span>
                </div>
            </div>
        </div>
    @endif

    <!-- Main Page Content Slot -->
    <main class="flex-1">
        @yield('content')
    </main>

    <!-- Master Editorial Footer -->
    <footer class="bg-brand-sand-card border-t border-brand-border mt-20 pt-16 pb-12">
        <div class="max-w-7xl mx-auto px-6 lg:px-12">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12 pb-14 border-b border-brand-border">
                
                <!-- Brand Column -->
                <div class="lg:col-span-2 space-y-4">
                    <a href="{{ route('home') }}" class="flex items-center gap-3">
                        <img src="{{ asset('assets/images/logo.jpg') }}" alt="GOUNOW" class="h-10 w-auto rounded-lg object-cover">
                        <div>
                            <span class="block text-[10px] uppercase font-bold tracking-[0.25em] text-brand-terracotta">El Gouna</span>
                            <span class="block text-base font-serif font-bold text-brand-brown tracking-wider">GOUNOW LIFESTYLE</span>
                        </div>
                    </a>
                    <p class="text-xs text-brand-brown-muted leading-relaxed max-w-sm">
                        {{ app()->getLocale() === 'ar'
                            ? 'وجهتكم الرائدة لتأجير الفلل الفاخرة وشراء العقارات الحصرية والأنشطة البحرية والصحراوية الراقية في الجونة على البحر الأحمر.'
                            : 'The premier destination for bespoke luxury vacation rentals, exclusive real estate investments, yacht charters, and curated desert adventures in El Gouna, Red Sea.' }}
                    </p>
                    <div class="pt-2 flex items-center gap-3 text-xs text-brand-brown font-medium">
                        <span>📍 Abu Tig Marina & Downtown, El Gouna</span>
                    </div>
                </div>

                <!-- Stays & Properties -->
                <div class="space-y-3">
                    <h4 class="text-xs font-bold uppercase tracking-widest text-brand-brown">
                        {{ app()->getLocale() === 'ar' ? 'الإقامات' : 'Explore Stays' }}
                    </h4>
                    <ul class="space-y-2 text-xs text-brand-brown-muted">
                        <li><a href="{{ route('properties.index', ['listing_type' => 'rent']) }}" class="hover:text-brand-terracotta transition">{{ app()->getLocale() === 'ar' ? 'كل الفلل والشاليهات' : 'All Vacation Rentals' }}</a></li>
                        <li><a href="{{ route('properties.index', ['listing_type' => 'rent', 'category' => 'luxury-villas']) }}" class="hover:text-brand-terracotta transition">{{ app()->getLocale() === 'ar' ? 'فلل خاصة بحمام سباحة' : 'Private Pool Villas' }}</a></li>
                        <li><a href="{{ route('properties.index', ['listing_type' => 'rent', 'location' => 'abu-tig-marina']) }}" class="hover:text-brand-terracotta transition">{{ app()->getLocale() === 'ar' ? 'شقق المارينا' : 'Marina Waterfront' }}</a></li>
                        <li><a href="{{ route('properties.index', ['listing_type' => 'sale']) }}" class="hover:text-brand-terracotta transition font-semibold text-brand-terracotta">{{ app()->getLocale() === 'ar' ? 'عقارات للبيع' : 'Properties For Sale' }}</a></li>
                    </ul>
                </div>

                <!-- Experiences -->
                <div class="space-y-3">
                    <h4 class="text-xs font-bold uppercase tracking-widest text-brand-brown">
                        {{ app()->getLocale() === 'ar' ? 'التجارب' : 'Experiences' }}
                    </h4>
                    <ul class="space-y-2 text-xs text-brand-brown-muted">
                        <li><a href="{{ route('experiences.index', ['category' => 'boat-trips']) }}" class="hover:text-brand-terracotta transition">{{ app()->getLocale() === 'ar' ? 'رحلات اليخوت البحرية' : 'Private Yacht Charters' }}</a></li>
                        <li><a href="{{ route('experiences.index', ['category' => 'safari']) }}" class="hover:text-brand-terracotta transition">{{ app()->getLocale() === 'ar' ? 'رحلات السفاري الصحراوية' : 'Desert Quad Safari' }}</a></li>
                        <li><a href="{{ route('experiences.index') }}" class="hover:text-brand-terracotta transition">{{ app()->getLocale() === 'ar' ? 'رياضات الكايت سيرف' : 'Kite & Water Sports' }}</a></li>
                        <li><a href="{{ route('experiences.index') }}" class="hover:text-brand-terracotta transition">{{ app()->getLocale() === 'ar' ? 'تجارب عشاء خاصة' : 'Lagoon Private Dining' }}</a></li>
                    </ul>
                </div>

                <!-- Concierge & Inquiry -->
                <div class="space-y-3">
                    <h4 class="text-xs font-bold uppercase tracking-widest text-brand-brown">
                        {{ app()->getLocale() === 'ar' ? 'تواصل معنا' : 'Concierge Desk' }}
                    </h4>
                    <p class="text-xs text-brand-brown-muted">
                        {{ app()->getLocale() === 'ar' ? 'هل تخطط لإقامة مميزة أو تبحث عن استثمار عقاري في الجونة؟' : 'Planning a bespoke stay or looking to invest in El Gouna?' }}
                    </p>
                    <a href="https://wa.me/201000000000?text=Hello%20GouNow,%20I%20would%20like%20to%20inquire" 
                       target="_blank"
                       class="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-medium transition shadow-xs">
                        <span>💬</span>
                        <span>WhatsApp VIP Desk</span>
                    </a>
                </div>

            </div>

            <!-- Bottom Copyright & Legal -->
            <div class="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-brown-muted">
                <p>&copy; {{ date('Y') }} GouNow Lifestyle. All rights reserved. El Gouna, Egypt.</p>
                <div class="flex items-center gap-6">
                    <a href="{{ route('admin.dashboard') }}" class="hover:text-brand-brown transition">Admin Portal</a>
                    <span>&bull;</span>
                    <span>256-Bit SSL Encrypted</span>
                </div>
            </div>
        </div>
    </footer>

    <!-- Floating WhatsApp Concierge Widget -->
    <x-whatsapp-widget />

    @stack('scripts')
</body>
</html>
