<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" dir="{{ app()->getLocale() === 'ar' ? 'rtl' : 'ltr' }}" class="h-full bg-[#FAF8F5]">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Admin Console') - GOUNOW Management</title>

    <!-- Google Fonts: Editorial Serif + Clean Sans -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;1,400&family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet">

    <!-- Tailwind CSS with Custom Brand Palette Configuration -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        brand: {
                            terracotta: '#B85D3B',
                            'terracotta-dark': '#9A4A2B',
                            'terracotta-light': '#D48162',
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
                        sans: ['"Plus Jakarta Sans"', ...(navigator.language.startsWith('ar') ? ['Tajawal'] : []), 'sans-serif'],
                        serif: ['"Playfair Display"', 'serif'],
                        arabic: ['Tajawal', 'sans-serif'],
                    }
                }
            }
        }
    </script>

    <!-- Alpine.js for lightweight UI interactivity -->
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.8/dist/cdn.min.js"></script>

    <style>
        [x-cloak] { display: none !important; }
        body { font-family: 'Plus Jakarta Sans', {{ app()->getLocale() === 'ar' ? "'Tajawal'," : "" }} sans-serif; }
        .gounow-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .gounow-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .gounow-scrollbar::-webkit-scrollbar-thumb { background: #D6CBC2; border-radius: 9999px; }
        .gounow-scrollbar::-webkit-scrollbar-thumb:hover { background: #B85D3B; }
    </style>
    @stack('styles')
</head>
<body class="h-full text-brand-brown antialiased selection:bg-brand-terracotta/20 selection:text-brand-terracotta" x-data="{ sidebarOpen: false }">

    <div class="min-h-full flex flex-col lg:flex-row">

        <!-- Mobile Sidebar Backdrop -->
        <div x-show="sidebarOpen" 
             x-cloak
             x-transition:enter="transition-opacity ease-linear duration-300"
             x-transition:enter-start="opacity-0"
             x-transition:enter-end="opacity-100"
             x-transition:leave="transition-opacity ease-linear duration-300"
             x-transition:leave-start="opacity-100"
             x-transition:leave-end="opacity-0"
             @click="sidebarOpen = false" 
             class="fixed inset-0 z-40 bg-brand-brown/50 backdrop-blur-sm lg:hidden"></div>

        <!-- SIDEBAR (Master Plan Section 41) -->
        <aside :class="sidebarOpen ? 'translate-x-0' : '{{ app()->getLocale() === 'ar' ? 'translate-x-full' : '-translate-x-full' }}'" 
               class="fixed inset-y-0 {{ app()->getLocale() === 'ar' ? 'right-0' : 'left-0' }} z-50 w-72 bg-brand-sand-light border-{{ app()->getLocale() === 'ar' ? 'l' : 'r' }} border-brand-border flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:z-auto">
            
            <!-- Brand Logo Header -->
            <div class="h-20 flex items-center justify-between px-6 border-b border-brand-border bg-white/60">
                <a href="{{ route('admin.dashboard') }}" class="flex items-center space-x-3 {{ app()->getLocale() === 'ar' ? 'space-x-reverse' : '' }}">
                    <img src="{{ asset('assets/images/logo.jpg') }}" alt="GOUNOW" class="h-10 w-auto rounded-md object-cover shadow-sm">
                    <div>
                        <span class="block text-xs font-semibold uppercase tracking-widest text-brand-terracotta">El Gouna</span>
                        <span class="block text-sm font-bold text-brand-brown tracking-wider">MANAGEMENT</span>
                    </div>
                </a>
                <button @click="sidebarOpen = false" class="lg:hidden text-brand-brown-muted hover:text-brand-brown">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>

            <!-- Navigation Links (Section 41) -->
            <nav class="flex-1 overflow-y-auto px-4 py-5 space-y-1 gounow-scrollbar text-sm font-medium">

                <!-- 1. DASHBOARD -->
                <a href="{{ route('admin.dashboard') }}" 
                   class="flex items-center px-3 py-2.5 rounded-xl transition-all {{ request()->routeIs('admin.dashboard') ? 'bg-brand-terracotta text-white font-semibold shadow-sm' : 'text-brand-brown hover:bg-brand-sand/50' }}">
                    <svg class="w-5 h-5 {{ app()->getLocale() === 'ar' ? 'ml-3' : 'mr-3' }} shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                    <span>{{ app()->getLocale() === 'ar' ? 'لوحة التحكم' : 'Dashboard' }}</span>
                </a>

                <!-- 2. BOOKINGS -->
                <div x-data="{ open: {{ request()->routeIs('admin.bookings.*') ? 'true' : 'false' }} }" class="pt-2">
                    <button @click="open = !open" 
                            class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-brand-brown hover:bg-brand-sand/50 transition-all">
                        <div class="flex items-center">
                            <svg class="w-5 h-5 {{ app()->getLocale() === 'ar' ? 'ml-3' : 'mr-3' }} text-brand-brown-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            <span>{{ app()->getLocale() === 'ar' ? 'الحجوزات والمدفوعات' : 'Bookings' }}</span>
                        </div>
                        <svg :class="open ? 'rotate-90' : ''" class="w-4 h-4 text-brand-brown-muted transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                    <div x-show="open" x-cloak class="{{ app()->getLocale() === 'ar' ? 'pr-8 border-r-2' : 'pl-8 border-l-2' }} border-brand-sand mt-1 space-y-1">
                        <a href="{{ route('admin.bookings.index') }}" class="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta">{{ app()->getLocale() === 'ar' ? 'جميع الحجوزات' : 'All Bookings' }}</a>
                        <a href="{{ route('admin.bookings.pending') }}" class="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta">{{ app()->getLocale() === 'ar' ? 'قيد الانتظار' : 'Pending Bookings' }}</a>
                        <a href="{{ route('admin.bookings.confirmed') }}" class="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta">{{ app()->getLocale() === 'ar' ? 'المؤكدة' : 'Confirmed' }}</a>
                        <a href="{{ route('admin.bookings.calendar') }}" class="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta">{{ app()->getLocale() === 'ar' ? 'تقويم الحجوزات' : 'Booking Calendar' }}</a>
                        <a href="{{ route('admin.bookings.payments') }}" class="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta">{{ app()->getLocale() === 'ar' ? 'العمليات المالية' : 'Payments & Audit' }}</a>
                    </div>
                </div>

                <!-- 3. PROPERTIES (STAYS & SALES) -->
                <div x-data="{ open: {{ request()->routeIs('admin.properties.*') ? 'true' : 'false' }} }">
                    <button @click="open = !open" 
                            class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-brand-brown hover:bg-brand-sand/50 transition-all">
                        <div class="flex items-center">
                            <svg class="w-5 h-5 {{ app()->getLocale() === 'ar' ? 'ml-3' : 'mr-3' }} text-brand-brown-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                            <span>{{ app()->getLocale() === 'ar' ? 'العقارات والإقامات' : 'Properties' }}</span>
                        </div>
                        <svg :class="open ? 'rotate-90' : ''" class="w-4 h-4 text-brand-brown-muted transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                    <div x-show="open" x-cloak class="{{ app()->getLocale() === 'ar' ? 'pr-8 border-r-2' : 'pl-8 border-l-2' }} border-brand-sand mt-1 space-y-1">
                        <a href="{{ route('admin.properties.index') }}" class="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta">{{ app()->getLocale() === 'ar' ? 'كل العقارات' : 'All Properties' }}</a>
                        <a href="{{ route('admin.properties.rent') }}" class="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta">{{ app()->getLocale() === 'ar' ? 'إيجار قصير المدى' : 'For Rent (Stays)' }}</a>
                        <a href="{{ route('admin.properties.sale') }}" class="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta">{{ app()->getLocale() === 'ar' ? 'عقارات للبيع' : 'For Sale' }}</a>
                        <a href="{{ route('admin.properties.create') }}" class="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta">{{ app()->getLocale() === 'ar' ? '+ إضافة عقار جديد' : '+ Add Property' }}</a>
                        <a href="{{ route('admin.properties.categories') }}" class="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta">{{ app()->getLocale() === 'ar' ? 'التصنيفات' : 'Categories' }}</a>
                        <a href="{{ route('admin.properties.locations') }}" class="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta">{{ app()->getLocale() === 'ar' ? 'المناطق ومواقع الجونة' : 'Locations' }}</a>
                        <a href="{{ route('admin.properties.amenities') }}" class="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta">{{ app()->getLocale() === 'ar' ? 'المميزات والمرافق' : 'Amenities' }}</a>
                    </div>
                </div>

                <!-- 4. PRICING ENGINE -->
                <div x-data="{ open: {{ request()->routeIs('admin.pricing.*') ? 'true' : 'false' }} }">
                    <button @click="open = !open" 
                            class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-brand-brown hover:bg-brand-sand/50 transition-all">
                        <div class="flex items-center">
                            <svg class="w-5 h-5 {{ app()->getLocale() === 'ar' ? 'ml-3' : 'mr-3' }} text-brand-brown-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            <span>{{ app()->getLocale() === 'ar' ? 'محرك الأسعار والمواسم' : 'Pricing Engine' }}</span>
                        </div>
                        <svg :class="open ? 'rotate-90' : ''" class="w-4 h-4 text-brand-brown-muted transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                    <div x-show="open" x-cloak class="{{ app()->getLocale() === 'ar' ? 'pr-8 border-r-2' : 'pl-8 border-l-2' }} border-brand-sand mt-1 space-y-1">
                        <a href="{{ route('admin.pricing.base') }}" class="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta">{{ app()->getLocale() === 'ar' ? 'الأسعار الأساسية' : 'Base Prices' }}</a>
                        <a href="{{ route('admin.pricing.seasons') }}" class="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta">{{ app()->getLocale() === 'ar' ? 'المواسم والأولويات' : 'Seasonal Rules' }}</a>
                        <a href="{{ route('admin.pricing.calendar') }}" class="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta">{{ app()->getLocale() === 'ar' ? 'تقويم الأسعار والإتاحة' : 'Price Calendar' }}</a>
                        <a href="{{ route('admin.pricing.discounts') }}" class="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta">{{ app()->getLocale() === 'ar' ? 'أكواد الخصم' : 'Discounts & Codes' }}</a>
                        <a href="{{ route('admin.pricing.fees') }}" class="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta">{{ app()->getLocale() === 'ar' ? 'رسوم النظافة والخدمات' : 'Fees & Taxes' }}</a>
                    </div>
                </div>

                <!-- 5. EXPERIENCES & CAR RENTALS -->
                <div x-data="{ open: {{ request()->routeIs('admin.experiences.*') ? 'true' : 'false' }} }">
                    <button @click="open = !open" 
                            class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-brand-brown hover:bg-brand-sand/50 transition-all">
                        <div class="flex items-center">
                            <svg class="w-5 h-5 {{ app()->getLocale() === 'ar' ? 'ml-3' : 'mr-3' }} text-brand-brown-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            <span>{{ app()->getLocale() === 'ar' ? 'التجارب وسيارات الجولف' : 'Experiences' }}</span>
                        </div>
                        <svg :class="open ? 'rotate-90' : ''" class="w-4 h-4 text-brand-brown-muted transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                    <div x-show="open" x-cloak class="{{ app()->getLocale() === 'ar' ? 'pr-8 border-r-2' : 'pl-8 border-l-2' }} border-brand-sand mt-1 space-y-1">
                        <a href="{{ route('admin.experiences.index') }}" class="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta">{{ app()->getLocale() === 'ar' ? 'جميع التجارب' : 'All Experiences' }}</a>
                        <a href="{{ route('admin.experiences.boats') }}" class="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta">{{ app()->getLocale() === 'ar' ? 'رحلات اليخوت' : 'Boat Trips' }}</a>
                        <a href="{{ route('admin.experiences.safari') }}" class="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta">{{ app()->getLocale() === 'ar' ? 'سفاري الصحراء' : 'Safari' }}</a>
                        <a href="{{ route('admin.experiences.vehicles') }}" class="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta">{{ app()->getLocale() === 'ar' ? 'سيارات الجولف والكابريو' : 'Car Rentals' }}</a>
                        <a href="{{ route('admin.experiences.categories') }}" class="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta">{{ app()->getLocale() === 'ar' ? 'تصنيفات التجارب' : 'Categories' }}</a>
                    </div>
                </div>

                <!-- 6. EVENTS & TICKETS -->
                <div x-data="{ open: {{ request()->routeIs('admin.events.*') ? 'true' : 'false' }} }">
                    <button @click="open = !open" 
                            class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-brand-brown hover:bg-brand-sand/50 transition-all">
                        <div class="flex items-center">
                            <svg class="w-5 h-5 {{ app()->getLocale() === 'ar' ? 'ml-3' : 'mr-3' }} text-brand-brown-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path></svg>
                            <span>{{ app()->getLocale() === 'ar' ? 'الفعاليات والتذاكر' : "What's On & Events" }}</span>
                        </div>
                        <svg :class="open ? 'rotate-90' : ''" class="w-4 h-4 text-brand-brown-muted transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                    <div x-show="open" x-cloak class="{{ app()->getLocale() === 'ar' ? 'pr-8 border-r-2' : 'pl-8 border-l-2' }} border-brand-sand mt-1 space-y-1">
                        <a href="{{ route('admin.events.index') }}" class="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta">{{ app()->getLocale() === 'ar' ? 'كل الفعاليات' : 'All Events' }}</a>
                        <a href="{{ route('admin.events.tickets') }}" class="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta">{{ app()->getLocale() === 'ar' ? 'فئات التذاكر' : 'Ticket Types' }}</a>
                        <a href="{{ route('admin.events.orders') }}" class="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta">{{ app()->getLocale() === 'ar' ? 'طلبات التذاكر' : 'Ticket Orders' }}</a>
                        <a href="{{ route('admin.events.checkin') }}" class="block py-1.5 px-2 text-xs rounded-lg text-brand-terracotta font-semibold hover:underline">{{ app()->getLocale() === 'ar' ? 'مسح رمز QR للدخول' : 'QR Check-in Console' }}</a>
                    </div>
                </div>

                <!-- 7. CUSTOMERS & LEADS -->
                <div x-data="{ open: {{ request()->routeIs('admin.customers.*') ? 'true' : 'false' }} }">
                    <button @click="open = !open" 
                            class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-brand-brown hover:bg-brand-sand/50 transition-all">
                        <div class="flex items-center">
                            <svg class="w-5 h-5 {{ app()->getLocale() === 'ar' ? 'ml-3' : 'mr-3' }} text-brand-brown-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                            <span>{{ app()->getLocale() === 'ar' ? 'العملاء والطلبات' : 'Customers & Leads' }}</span>
                        </div>
                        <svg :class="open ? 'rotate-90' : ''" class="w-4 h-4 text-brand-brown-muted transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                    <div x-show="open" x-cloak class="{{ app()->getLocale() === 'ar' ? 'pr-8 border-r-2' : 'pl-8 border-l-2' }} border-brand-sand mt-1 space-y-1">
                        <a href="{{ route('admin.customers.index') }}" class="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta">{{ app()->getLocale() === 'ar' ? 'سجل العملاء' : 'Customer Profiles' }}</a>
                        <a href="{{ route('admin.customers.leads') }}" class="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta">{{ app()->getLocale() === 'ar' ? 'طلبات شراء العقارات' : 'Property Sale Leads' }}</a>
                        <a href="{{ route('admin.customers.inquiries') }}" class="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta">{{ app()->getLocale() === 'ar' ? 'استفسارات واتساب والموقع' : 'Inquiries & Contact' }}</a>
                    </div>
                </div>

                <!-- 8. MEDIA LIBRARY -->
                <a href="{{ route('admin.media.index') }}" 
                   class="flex items-center px-3 py-2.5 rounded-xl transition-all {{ request()->routeIs('admin.media.*') ? 'bg-brand-sand text-brand-terracotta font-semibold' : 'text-brand-brown hover:bg-brand-sand/50' }}">
                    <svg class="w-5 h-5 {{ app()->getLocale() === 'ar' ? 'ml-3' : 'mr-3' }} text-brand-brown-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    <span>{{ app()->getLocale() === 'ar' ? 'مكتبة الوسائط' : 'Media Library' }}</span>
                </a>

                <!-- 9. CONTENT & CMS -->
                <div x-data="{ open: {{ request()->routeIs('admin.cms.*') ? 'true' : 'false' }} }">
                    <button @click="open = !open" 
                            class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-brand-brown hover:bg-brand-sand/50 transition-all">
                        <div class="flex items-center">
                            <svg class="w-5 h-5 {{ app()->getLocale() === 'ar' ? 'ml-3' : 'mr-3' }} text-brand-brown-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
                            <span>{{ app()->getLocale() === 'ar' ? 'إدارة المحتوى CMS' : 'Content & CMS' }}</span>
                        </div>
                        <svg :class="open ? 'rotate-90' : ''" class="w-4 h-4 text-brand-brown-muted transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                    <div x-show="open" x-cloak class="{{ app()->getLocale() === 'ar' ? 'pr-8 border-r-2' : 'pl-8 border-l-2' }} border-brand-sand mt-1 space-y-1">
                        <a href="{{ route('admin.cms.homepage') }}" class="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta">{{ app()->getLocale() === 'ar' ? 'أقسام الصفحة الرئيسية' : 'Homepage Sections' }}</a>
                        <a href="{{ route('admin.cms.pages') }}" class="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta">{{ app()->getLocale() === 'ar' ? 'الصفحات الثابتة' : 'Static Pages' }}</a>
                        <a href="{{ route('admin.cms.faqs') }}" class="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta">{{ app()->getLocale() === 'ar' ? 'الأسئلة الشائعة' : 'FAQs' }}</a>
                        <a href="{{ route('admin.cms.blog') }}" class="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta">{{ app()->getLocale() === 'ar' ? 'المقالات والأخبار' : 'Blog Posts' }}</a>
                        <a href="{{ route('admin.cms.navigation') }}" class="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta">{{ app()->getLocale() === 'ar' ? 'قوائم التصفح' : 'Navigation Menus' }}</a>
                    </div>
                </div>

                <!-- 10. SEO & REDIRECTS -->
                <div x-data="{ open: {{ request()->routeIs('admin.seo.*') ? 'true' : 'false' }} }">
                    <button @click="open = !open" 
                            class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-brand-brown hover:bg-brand-sand/50 transition-all">
                        <div class="flex items-center">
                            <svg class="w-5 h-5 {{ app()->getLocale() === 'ar' ? 'ml-3' : 'mr-3' }} text-brand-brown-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            <span>{{ app()->getLocale() === 'ar' ? 'تهيئة محركات البحث SEO' : 'SEO Management' }}</span>
                        </div>
                        <svg :class="open ? 'rotate-90' : ''" class="w-4 h-4 text-brand-brown-muted transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                    <div x-show="open" x-cloak class="{{ app()->getLocale() === 'ar' ? 'pr-8 border-r-2' : 'pl-8 border-l-2' }} border-brand-sand mt-1 space-y-1">
                        <a href="{{ route('admin.seo.global') }}" class="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta">{{ app()->getLocale() === 'ar' ? 'إعدادات SEO العامة' : 'Global Meta & OG' }}</a>
                        <a href="{{ route('admin.seo.sitemap') }}" class="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta">{{ app()->getLocale() === 'ar' ? 'خريطة الموقع Sitemap' : 'XML Sitemap' }}</a>
                        <a href="{{ route('admin.seo.redirects') }}" class="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta">{{ app()->getLocale() === 'ar' ? 'إعادة التوجيه 301' : '301 Redirects' }}</a>
                    </div>
                </div>

                <!-- 11. ANALYTICS & CONVERSIONS -->
                <div x-data="{ open: {{ request()->routeIs('admin.analytics.*') ? 'true' : 'false' }} }">
                    <button @click="open = !open" 
                            class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-brand-brown hover:bg-brand-sand/50 transition-all">
                        <div class="flex items-center">
                            <svg class="w-5 h-5 {{ app()->getLocale() === 'ar' ? 'ml-3' : 'mr-3' }} text-brand-brown-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                            <span>{{ app()->getLocale() === 'ar' ? 'الإحصائيات والتحويلات' : 'Analytics & Tracking' }}</span>
                        </div>
                        <svg :class="open ? 'rotate-90' : ''" class="w-4 h-4 text-brand-brown-muted transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                    <div x-show="open" x-cloak class="{{ app()->getLocale() === 'ar' ? 'pr-8 border-r-2' : 'pl-8 border-l-2' }} border-brand-sand mt-1 space-y-1">
                        <a href="{{ route('admin.analytics.tracking') }}" class="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta">{{ app()->getLocale() === 'ar' ? 'إعدادات GA4 و GTM' : 'GA4 & Ads Tracking' }}</a>
                        <a href="{{ route('admin.analytics.reports') }}" class="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta">{{ app()->getLocale() === 'ar' ? 'تقارير الأداء والمبيعات' : 'Reports & Insights' }}</a>
                    </div>
                </div>

                <!-- 12. SETTINGS -->
                <div x-data="{ open: {{ request()->routeIs('admin.settings.*') ? 'true' : 'false' }} }">
                    <button @click="open = !open" 
                            class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-brand-brown hover:bg-brand-sand/50 transition-all">
                        <div class="flex items-center">
                            <svg class="w-5 h-5 {{ app()->getLocale() === 'ar' ? 'ml-3' : 'mr-3' }} text-brand-brown-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            <span>{{ app()->getLocale() === 'ar' ? 'إعدادات النظام' : 'System Settings' }}</span>
                        </div>
                        <svg :class="open ? 'rotate-90' : ''" class="w-4 h-4 text-brand-brown-muted transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                    <div x-show="open" x-cloak class="{{ app()->getLocale() === 'ar' ? 'pr-8 border-r-2' : 'pl-8 border-l-2' }} border-brand-sand mt-1 space-y-1">
                        <a href="{{ route('admin.settings.general') }}" class="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta">{{ app()->getLocale() === 'ar' ? 'معلومات الشركة والعملة' : 'General & Currency' }}</a>
                        <a href="{{ route('admin.settings.payments') }}" class="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta">{{ app()->getLocale() === 'ar' ? 'بوابات الدفع الإلكتروني' : 'Payment Gateways' }}</a>
                        <a href="{{ route('admin.settings.booking') }}" class="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta">{{ app()->getLocale() === 'ar' ? 'قواعد الحجز والكونسيرج' : 'Booking Policies' }}</a>
                        <a href="{{ route('admin.settings.notifications') }}" class="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta">{{ app()->getLocale() === 'ar' ? 'الواتساب والبريد الإلكتروني' : 'WhatsApp & Email' }}</a>
                    </div>
                </div>

                <!-- 13. USERS & ROLES -->
                <div x-data="{ open: {{ request()->routeIs('admin.users.*') ? 'true' : 'false' }} }">
                    <button @click="open = !open" 
                            class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-brand-brown hover:bg-brand-sand/50 transition-all">
                        <div class="flex items-center">
                            <svg class="w-5 h-5 {{ app()->getLocale() === 'ar' ? 'ml-3' : 'mr-3' }} text-brand-brown-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                            <span>{{ app()->getLocale() === 'ar' ? 'المستخدمون والأدوار' : 'Users & Access' }}</span>
                        </div>
                        <svg :class="open ? 'rotate-90' : ''" class="w-4 h-4 text-brand-brown-muted transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                    <div x-show="open" x-cloak class="{{ app()->getLocale() === 'ar' ? 'pr-8 border-r-2' : 'pl-8 border-l-2' }} border-brand-sand mt-1 space-y-1">
                        <a href="{{ route('admin.users.index') }}" class="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta">{{ app()->getLocale() === 'ar' ? 'مديرو النظام' : 'Admin Accounts' }}</a>
                        <a href="{{ route('admin.users.roles') }}" class="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta">{{ app()->getLocale() === 'ar' ? 'الأدوار والصلاحيات (RBAC)' : 'Roles & Permissions' }}</a>
                    </div>
                </div>

                <!-- 14. SYSTEM & LOGS -->
                <div x-data="{ open: {{ request()->routeIs('admin.system.*') ? 'true' : 'false' }} }">
                    <button @click="open = !open" 
                            class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-brand-brown hover:bg-brand-sand/50 transition-all">
                        <div class="flex items-center">
                            <svg class="w-5 h-5 {{ app()->getLocale() === 'ar' ? 'ml-3' : 'mr-3' }} text-brand-brown-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            <span>{{ app()->getLocale() === 'ar' ? 'سجل العمليات والنظام' : 'System & Logs' }}</span>
                        </div>
                        <svg :class="open ? 'rotate-90' : ''" class="w-4 h-4 text-brand-brown-muted transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                    <div x-show="open" x-cloak class="{{ app()->getLocale() === 'ar' ? 'pr-8 border-r-2' : 'pl-8 border-l-2' }} border-brand-sand mt-1 space-y-1">
                        <a href="{{ route('admin.system.logs') }}" class="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta">{{ app()->getLocale() === 'ar' ? 'سجل النشاطات Audit Logs' : 'Activity Logs' }}</a>
                        <a href="{{ route('admin.system.health') }}" class="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta">{{ app()->getLocale() === 'ar' ? 'حالة النظام والخادم' : 'System Health' }}</a>
                    </div>
                </div>
            </nav>

            <!-- User Footer Card in Sidebar -->
            <div class="p-4 border-t border-brand-border bg-white/40">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3 {{ app()->getLocale() === 'ar' ? 'space-x-reverse' : '' }}">
                        <div class="w-9 h-9 rounded-full bg-brand-terracotta text-white flex items-center justify-center font-bold text-sm shadow-sm">
                            {{ strtoupper(substr(auth()->user()->name ?? 'Admin', 0, 1)) }}
                        </div>
                        <div class="overflow-hidden">
                            <span class="block text-xs font-bold text-brand-brown truncate">{{ auth()->user()->name ?? 'Administrator' }}</span>
                            <span class="inline-block text-[10px] font-semibold text-brand-terracotta bg-brand-terracotta/10 px-1.5 py-0.5 rounded uppercase">
                                {{ auth()->user()->roles->first()?->display_name ?? 'Super Admin' }}
                            </span>
                        </div>
                    </div>
                    <form method="POST" action="{{ route('admin.logout') }}">
                        @csrf
                        <button type="submit" title="Sign Out" class="p-2 text-brand-brown-muted hover:text-brand-terracotta rounded-lg hover:bg-brand-sand/40 transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                        </button>
                    </form>
                </div>
            </div>
        </aside>

        <!-- MAIN CONTENT WRAPPER -->
        <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
            
            <!-- HEADER (Top Navigation) -->
            <header class="h-20 bg-white border-b border-brand-border flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-30 shadow-xs">
                
                <!-- Left Header: Mobile Toggle & Page Context -->
                <div class="flex items-center space-x-4 {{ app()->getLocale() === 'ar' ? 'space-x-reverse' : '' }}">
                    <button @click="sidebarOpen = true" class="lg:hidden p-2 text-brand-brown rounded-lg hover:bg-brand-sand/50">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    </button>
                    
                    <div class="hidden sm:block">
                        <h1 class="text-lg font-bold text-brand-brown tracking-tight">@yield('page-title', 'Overview')</h1>
                        <nav class="flex text-xs text-brand-brown-muted space-x-2 {{ app()->getLocale() === 'ar' ? 'space-x-reverse' : '' }}">
                            <a href="{{ route('admin.dashboard') }}" class="hover:text-brand-terracotta">Gounow Admin</a>
                            <span>/</span>
                            <span class="text-brand-brown font-medium">@yield('breadcrumb', 'Dashboard')</span>
                        </nav>
                    </div>
                </div>

                <!-- Right Header: Actions, Locale, Notifications & User -->
                <div class="flex items-center space-x-3 sm:space-x-4 {{ app()->getLocale() === 'ar' ? 'space-x-reverse' : '' }}">

                    <!-- Quick Link: Visit Public Website -->
                    <a href="/" target="_blank" class="hidden md:inline-flex items-center text-xs font-semibold text-brand-brown-muted hover:text-brand-terracotta transition-colors px-2.5 py-1.5 rounded-lg border border-brand-border hover:border-brand-terracotta/40">
                        <svg class="w-3.5 h-3.5 {{ app()->getLocale() === 'ar' ? 'ml-1.5' : 'mr-1.5' }}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                        <span>{{ app()->getLocale() === 'ar' ? 'زيارة الموقع' : 'View Website' }}</span>
                    </a>

                    <!-- Bilingual Switcher (Section 46 & 76) -->
                    <div class="flex items-center bg-brand-sand-light p-1 rounded-xl border border-brand-border text-xs font-bold">
                        <a href="{{ route('locale.switch', 'en') }}" 
                           class="px-2.5 py-1 rounded-lg transition-all {{ app()->getLocale() === 'en' ? 'bg-brand-terracotta text-white shadow-xs' : 'text-brand-brown-muted hover:text-brand-brown' }}">
                            EN
                        </a>
                        <a href="{{ route('locale.switch', 'ar') }}" 
                           class="px-2.5 py-1 rounded-lg transition-all {{ app()->getLocale() === 'ar' ? 'bg-brand-terracotta text-white shadow-xs' : 'text-brand-brown-muted hover:text-brand-brown' }}">
                            عربي
                        </a>
                    </div>

                    <!-- Notification Bell (Section 176) -->
                    <div class="relative" x-data="{ notifyOpen: false }">
                        <button @click="notifyOpen = !notifyOpen" class="p-2 text-brand-brown-muted hover:text-brand-terracotta rounded-xl hover:bg-brand-sand/40 relative">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                            <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-terracotta rounded-full ring-2 ring-white"></span>
                        </button>

                        <div x-show="notifyOpen" 
                             x-cloak 
                             @click.outside="notifyOpen = false"
                             class="absolute {{ app()->getLocale() === 'ar' ? 'left-0' : 'right-0' }} mt-2 w-80 bg-white rounded-2xl shadow-xl border border-brand-border py-2 z-50">
                            <div class="px-4 py-2 border-b border-brand-border flex items-center justify-between">
                                <span class="text-xs font-bold text-brand-brown uppercase tracking-wider">{{ app()->getLocale() === 'ar' ? 'الإشعارات' : 'Notifications' }}</span>
                                <span class="text-[10px] text-brand-terracotta font-semibold">2 New</span>
                            </div>
                            <div class="divide-y divide-brand-border/60 max-h-64 overflow-y-auto gounow-scrollbar text-xs">
                                <a href="{{ route('admin.bookings.index') }}" class="block p-3 hover:bg-brand-sand-light transition-colors">
                                    <p class="font-semibold text-brand-brown">New Villa Reservation: GON-2026-000101</p>
                                    <span class="text-[10px] text-brand-brown-muted">10 mins ago • Fanadir Bay Villa</span>
                                </a>
                                <a href="{{ route('admin.customers.leads') }}" class="block p-3 hover:bg-brand-sand-light transition-colors">
                                    <p class="font-semibold text-brand-brown">New Buyer Lead: Tarek Khalil</p>
                                    <span class="text-[10px] text-brand-brown-muted">1 hour ago • WhatsApp Inquiry</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    <!-- User Profile Dropdown -->
                    <div class="relative" x-data="{ userMenuOpen: false }">
                        <button @click="userMenuOpen = !userMenuOpen" class="flex items-center space-x-2 {{ app()->getLocale() === 'ar' ? 'space-x-reverse' : '' }} p-1 rounded-xl hover:bg-brand-sand/40 transition-colors">
                            <div class="w-8 h-8 rounded-full bg-brand-terracotta text-white flex items-center justify-center font-bold text-xs shadow-xs">
                                {{ strtoupper(substr(auth()->user()->name ?? 'A', 0, 1)) }}
                            </div>
                            <span class="hidden sm:block text-xs font-bold text-brand-brown max-w-[120px] truncate">{{ auth()->user()->name ?? 'Admin' }}</span>
                            <svg class="w-3.5 h-3.5 text-brand-brown-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7 7"></path></svg>
                        </button>

                        <div x-show="userMenuOpen" 
                             x-cloak 
                             @click.outside="userMenuOpen = false"
                             class="absolute {{ app()->getLocale() === 'ar' ? 'left-0' : 'right-0' }} mt-2 w-52 bg-white rounded-2xl shadow-xl border border-brand-border py-2 z-50 text-xs">
                            <div class="px-4 py-2 border-b border-brand-border">
                                <span class="block font-bold text-brand-brown">{{ auth()->user()->name ?? 'Admin' }}</span>
                                <span class="block text-[10px] text-brand-brown-muted truncate">{{ auth()->user()->email ?? 'admin@gounow.com' }}</span>
                            </div>
                            <a href="{{ route('admin.settings.general') }}" class="block px-4 py-2 text-brand-brown hover:bg-brand-sand-light">{{ app()->getLocale() === 'ar' ? 'إعدادات المنصة' : 'Platform Settings' }}</a>
                            <a href="{{ route('admin.system.logs') }}" class="block px-4 py-2 text-brand-brown hover:bg-brand-sand-light">{{ app()->getLocale() === 'ar' ? 'سجل النشاط الشخصي' : 'My Audit History' }}</a>
                            <div class="border-t border-brand-border my-1"></div>
                            <form method="POST" action="{{ route('admin.logout') }}">
                                @csrf
                                <button type="submit" class="w-full text-left {{ app()->getLocale() === 'ar' ? 'text-right' : '' }} px-4 py-2 text-red-600 hover:bg-red-50 font-semibold">
                                    {{ app()->getLocale() === 'ar' ? 'تسجيل الخروج' : 'Sign Out' }}
                                </button>
                            </form>
                        </div>
                    </div>

                </div>
            </header>

            <!-- FLASH ALERTS NOTIFICATION BAR -->
            @if(session('success'))
                <div class="bg-emerald-50 border-b border-emerald-200 px-6 py-3 flex items-center justify-between text-emerald-800 text-xs font-semibold">
                    <div class="flex items-center space-x-2 {{ app()->getLocale() === 'ar' ? 'space-x-reverse' : '' }}">
                        <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                        <span>{{ session('success') }}</span>
                    </div>
                </div>
            @endif

            @if(session('status'))
                <div class="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center justify-between text-amber-800 text-xs font-semibold">
                    <div class="flex items-center space-x-2 {{ app()->getLocale() === 'ar' ? 'space-x-reverse' : '' }}">
                        <svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span>{{ session('status') }}</span>
                    </div>
                </div>
            @endif

            @if($errors->any())
                <div class="bg-rose-50 border-b border-rose-200 px-6 py-3 text-rose-800 text-xs font-semibold">
                    <ul class="list-disc list-inside">
                        @foreach($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif

            <!-- MAIN BODY CONTENT -->
            <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 gounow-scrollbar">
                @yield('content')
            </main>

            <!-- FOOTER -->
            <footer class="h-12 bg-white/80 border-t border-brand-border px-6 flex items-center justify-between text-[11px] text-brand-brown-muted">
                <span>&copy; {{ date('Y') }} GOUNOW Lifestyle & Properties. El Gouna, Egypt.</span>
                <span class="hidden sm:inline">Laravel {{ Illuminate\Foundation\Application::VERSION }} (PHP v{{ PHP_VERSION }})</span>
            </footer>

        </div>
    </div>

    @stack('scripts')
</body>
</html>
