@extends('layouts.admin')

@section('title', $title ?? (app()->getLocale() === 'ar' ? 'إدارة تصنيفات وأسطول التجارب' : 'Experiences & Fleet'))
@section('page-title', $title ?? (app()->getLocale() === 'ar' ? 'أسطول وتجارب الجونة' : 'Yachts, Safaris & Fleet'))
@section('breadcrumb', $title ?? (app()->getLocale() === 'ar' ? 'التجارب' : 'Experiences'))

@section('content')
<div class="space-y-6">

    <!-- Header Actions -->
    <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h2 class="text-xl font-bold text-brand-brown tracking-tight">
                {{ $title ?? (app()->getLocale() === 'ar' ? 'الأسطول والأنشطة الترفيهية' : 'Curated Experiences & Fleet Management') }}
            </h2>
            <p class="text-xs text-brand-brown-muted mt-1">
                {{ app()->getLocale() === 'ar' ? 'إدارة رحلات اليخوت الخاصة، سفاري الصحراء، وسيارات الجولف المتاحة لضيوف الجونة' : 'Manage private yacht charters, desert buggy safaris, and electric golf cart rentals' }}
            </p>
        </div>
        <a href="{{ route('admin.experiences.create') }}" class="px-4 py-2.5 rounded-xl bg-brand-terracotta text-white text-xs font-semibold hover:bg-brand-terracotta-dark transition flex items-center gap-2 shadow-xs">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            <span>{{ app()->getLocale() === 'ar' ? 'إضافة تجربة جديدة' : 'Add Experience' }}</span>
        </a>
    </div>

    <!-- Tabs -->
    <div class="flex border-b border-brand-border/60 overflow-x-auto gap-2 text-xs font-semibold text-brand-brown-muted pb-1">
        <a href="{{ route('admin.experiences.index') }}" class="px-4 py-2.5 rounded-xl transition {{ request()->routeIs('admin.experiences.index') ? 'bg-brand-terracotta text-white font-bold' : 'hover:bg-brand-sand/40 text-brand-brown' }}">
            {{ app()->getLocale() === 'ar' ? 'جميع التجارب' : 'All Experiences' }}
        </a>
        <a href="{{ route('admin.experiences.boats') }}" class="px-4 py-2.5 rounded-xl transition {{ request()->routeIs('admin.experiences.boats') ? 'bg-brand-terracotta text-white font-bold' : 'hover:bg-brand-sand/40 text-brand-brown' }}">
            {{ app()->getLocale() === 'ar' ? 'رحلات اليخوت الخاصة' : 'Yacht & Boat Charters' }}
        </a>
        <a href="{{ route('admin.experiences.safari') }}" class="px-4 py-2.5 rounded-xl transition {{ request()->routeIs('admin.experiences.safari') ? 'bg-brand-terracotta text-white font-bold' : 'hover:bg-brand-sand/40 text-brand-brown' }}">
            {{ app()->getLocale() === 'ar' ? 'سفاري الصحراء والعشاء البدوي' : 'Desert Safari' }}
        </a>
        <a href="{{ route('admin.experiences.vehicles') }}" class="px-4 py-2.5 rounded-xl transition {{ request()->routeIs('admin.experiences.vehicles') ? 'bg-brand-terracotta text-white font-bold' : 'hover:bg-brand-sand/40 text-brand-brown' }}">
            {{ app()->getLocale() === 'ar' ? 'سيارات الجولف والكابريو' : 'Golf Carts & Vehicles' }}
        </a>
        <a href="{{ route('admin.experiences.categories') }}" class="px-4 py-2.5 rounded-xl transition {{ request()->routeIs('admin.experiences.categories') ? 'bg-brand-terracotta text-white font-bold' : 'hover:bg-brand-sand/40 text-brand-brown' }}">
            {{ app()->getLocale() === 'ar' ? 'التصنيفات' : 'Categories' }}
        </a>
    </div>

    <!-- Grid Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        @if(request()->routeIs('admin.experiences.boats'))
            <div class="bg-white p-5 rounded-2xl border border-brand-border shadow-xs">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">Marina Berth 14</span>
                <h3 class="font-bold text-base text-brand-brown mt-2">Azimut 68 Luxury Yacht Charter</h3>
                <p class="text-xs text-brand-brown-muted mt-1">Captain &amp; 2 crew included. Capacity: 12 Guests.</p>
                <div class="mt-4 pt-3 border-t border-brand-border flex items-center justify-between text-xs">
                    <span class="font-bold text-brand-terracotta">45,000 EGP / 4 Hours</span>
                    <span class="text-emerald-700 font-semibold">Available</span>
                </div>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-brand-border shadow-xs">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">Marina Berth 22</span>
                <h3 class="font-bold text-base text-brand-brown mt-2">Tawila Island Speedboat Shuttle</h3>
                <p class="text-xs text-brand-brown-muted mt-1">Twin Yamaha 300HP. Fast transfers &amp; snorkeling gear.</p>
                <div class="mt-4 pt-3 border-t border-brand-border flex items-center justify-between text-xs">
                    <span class="font-bold text-brand-terracotta">18,000 EGP / Day</span>
                    <span class="text-emerald-700 font-semibold">Available</span>
                </div>
            </div>
        @elseif(request()->routeIs('admin.experiences.safari'))
            <div class="bg-white p-5 rounded-2xl border border-brand-border shadow-xs">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">Eastern Desert Base</span>
                <h3 class="font-bold text-base text-brand-brown mt-2">Sunset Desert Quad Safari &amp; Bedouin Dinner</h3>
                <p class="text-xs text-brand-brown-muted mt-1">Can-Am Maverick 1000cc with stargazing and authentic feast.</p>
                <div class="mt-4 pt-3 border-t border-brand-border flex items-center justify-between text-xs">
                    <span class="font-bold text-brand-terracotta">8,500 EGP / Person</span>
                    <span class="text-emerald-700 font-semibold">Daily at 4:30 PM</span>
                </div>
            </div>
        @elseif(request()->routeIs('admin.experiences.vehicles'))
            <div class="bg-white p-5 rounded-2xl border border-brand-border shadow-xs">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Fleet: 12 Units</span>
                <h3 class="font-bold text-base text-brand-brown mt-2">Yamaha 4-Seater Electric Golf Cart</h3>
                <p class="text-xs text-brand-brown-muted mt-1">Lithium battery, Bluetooth sound system &amp; full charge delivery.</p>
                <div class="mt-4 pt-3 border-t border-brand-border flex items-center justify-between text-xs">
                    <span class="font-bold text-brand-terracotta">2,200 EGP / Day</span>
                    <span class="text-emerald-700 font-semibold">8 Available</span>
                </div>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-brand-border shadow-xs">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">Fleet: 4 Units</span>
                <h3 class="font-bold text-base text-brand-brown mt-2">Club Car 6-Seater Limo Golf Cart</h3>
                <p class="text-xs text-brand-brown-muted mt-1">Spacious luxury shuttle for large families and groups.</p>
                <div class="mt-4 pt-3 border-t border-brand-border flex items-center justify-between text-xs">
                    <span class="font-bold text-brand-terracotta">3,500 EGP / Day</span>
                    <span class="text-emerald-700 font-semibold">3 Available</span>
                </div>
            </div>
        @else
            @foreach($experiences as $exp)
                <div class="bg-white p-5 rounded-2xl border border-brand-border shadow-xs">
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-sand-light text-brand-brown uppercase">Experience</span>
                    <h3 class="font-bold text-base text-brand-brown mt-2">{{ $exp->title }}</h3>
                    <p class="text-xs text-brand-brown-muted mt-1">{{ Str::limit($exp->summary, 80) }}</p>
                    <div class="mt-4 pt-3 border-t border-brand-border flex items-center justify-between text-xs">
                        <span class="font-bold text-brand-terracotta">{{ number_format($exp->price_cents / 100) }} {{ $exp->currency }}</span>
                        <a href="{{ route('admin.experiences.edit', $exp->id) }}" class="text-brand-terracotta font-semibold hover:underline">Edit</a>
                    </div>
                </div>
            @endforeach
        @endif
    </div>

</div>
@endsection
