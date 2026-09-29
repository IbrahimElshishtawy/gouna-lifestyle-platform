@extends('layouts.admin')

@section('title', app()->getLocale() === 'ar' ? 'إدارة العقارات والإقامات' : 'Properties Management')
@section('page-title', app()->getLocale() === 'ar' ? 'العقارات والإقامات' : 'Properties & Stays')
@section('breadcrumb', app()->getLocale() === 'ar' ? 'قائمة العقارات' : 'Properties List')

@section('content')
<div class="space-y-6">

    <!-- Top Action Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-brand-border shadow-xs">
        <div>
            <h2 class="text-xl font-bold text-brand-brown tracking-tight">
                {{ app()->getLocale() === 'ar' ? 'سجل العقارات والوحدات السكنية' : 'Property Inventory & Stays' }}
            </h2>
            <p class="text-xs text-brand-brown-muted mt-1">
                {{ app()->getLocale() === 'ar' ? 'إدارة وتخصيص الفلل والشقق المتاحة للإيجار والبيع في الجونة' : 'Manage luxury villas, chalets, and apartments available for rent and sale in El Gouna' }}
            </p>
        </div>
        <div class="flex items-center space-x-3 {{ app()->getLocale() === 'ar' ? 'space-x-reverse' : '' }}">
            <a href="{{ route('admin.properties.create') }}" 
               class="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-brand-terracotta text-white font-semibold text-xs hover:bg-brand-terracotta-dark shadow-sm transition-all">
                <svg class="w-4 h-4 {{ app()->getLocale() === 'ar' ? 'ml-1.5' : 'mr-1.5' }}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                <span>{{ app()->getLocale() === 'ar' ? 'إضافة عقار جديد' : 'Add New Property' }}</span>
            </a>
        </div>
    </div>

    <!-- Filters & Search Bar -->
    <div class="bg-white p-5 rounded-2xl border border-brand-border shadow-xs">
        <form method="GET" action="{{ route('admin.properties.index') }}" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            <!-- Search Keyword -->
            <div class="lg:col-span-2">
                <label class="block text-[11px] font-semibold text-brand-brown-muted uppercase mb-1">{{ app()->getLocale() === 'ar' ? 'بحث بالاسم أو الكود' : 'Search Reference / Name' }}</label>
                <div class="relative">
                    <input type="text" name="search" value="{{ request('search') }}" 
                           placeholder="{{ app()->getLocale() === 'ar' ? 'ابحث بالاسم، المجمع، أو الكود...' : 'Search by title, compound, or ref...' }}"
                           class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta focus:ring focus:ring-brand-terracotta/20 py-2.5 px-3">
                </div>
            </div>

            <!-- Listing Type -->
            <div>
                <label class="block text-[11px] font-semibold text-brand-brown-muted uppercase mb-1">{{ app()->getLocale() === 'ar' ? 'نوع العرض' : 'Listing Type' }}</label>
                <select name="type" class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta focus:ring focus:ring-brand-terracotta/20 py-2.5 px-3 bg-white">
                    <option value="">{{ app()->getLocale() === 'ar' ? 'الكل (إيجار وبيع)' : 'All Types' }}</option>
                    <option value="rent" {{ request('type') === 'rent' ? 'selected' : '' }}>{{ app()->getLocale() === 'ar' ? 'للإيجار فقط' : 'For Rent' }}</option>
                    <option value="sale" {{ request('type') === 'sale' ? 'selected' : '' }}>{{ app()->getLocale() === 'ar' ? 'للبيع فقط' : 'For Sale' }}</option>
                </select>
            </div>

            <!-- Category -->
            <div>
                <label class="block text-[11px] font-semibold text-brand-brown-muted uppercase mb-1">{{ app()->getLocale() === 'ar' ? 'التصنيف' : 'Category' }}</label>
                <select name="category_id" class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta focus:ring focus:ring-brand-terracotta/20 py-2.5 px-3 bg-white">
                    <option value="">{{ app()->getLocale() === 'ar' ? 'جميع التصنيفات' : 'All Categories' }}</option>
                    @foreach($categories as $category)
                        <option value="{{ $category->id }}" {{ request('category_id') == $category->id ? 'selected' : '' }}>
                            {{ $category->name }}
                        </option>
                    @endforeach
                </select>
            </div>

            <!-- Location -->
            <div>
                <label class="block text-[11px] font-semibold text-brand-brown-muted uppercase mb-1">{{ app()->getLocale() === 'ar' ? 'المنطقة' : 'Location' }}</label>
                <select name="location_id" class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta focus:ring focus:ring-brand-terracotta/20 py-2.5 px-3 bg-white">
                    <option value="">{{ app()->getLocale() === 'ar' ? 'جميع المناطق' : 'All Locations' }}</option>
                    @foreach($locations as $loc)
                        <option value="{{ $loc->id }}" {{ request('location_id') == $loc->id ? 'selected' : '' }}>
                            {{ $loc->name }}
                        </option>
                    @endforeach
                </select>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-end space-x-2 {{ app()->getLocale() === 'ar' ? 'space-x-reverse' : '' }}">
                <button type="submit" class="flex-1 py-2.5 px-4 bg-brand-brown text-white text-xs font-semibold rounded-xl hover:bg-brand-brown-dark transition-colors text-center">
                    {{ app()->getLocale() === 'ar' ? 'تصفية' : 'Filter' }}
                </button>
                @if(request()->anyFilled(['search', 'type', 'category_id', 'location_id', 'status']))
                    <a href="{{ route('admin.properties.index') }}" class="py-2.5 px-3 bg-brand-sand-light text-brand-brown-muted hover:text-brand-brown text-xs font-medium rounded-xl border border-brand-border transition-colors">
                        {{ app()->getLocale() === 'ar' ? 'إعادة ضبط' : 'Reset' }}
                    </a>
                @endif
            </div>
        </form>
    </div>

    <!-- Properties Table -->
    <div class="bg-white rounded-2xl border border-brand-border shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-brand-brown {{ app()->getLocale() === 'ar' ? 'text-right' : '' }}">
                <thead class="bg-brand-sand-light/60 border-b border-brand-border text-[11px] font-bold uppercase tracking-wider text-brand-brown-muted">
                    <tr>
                        <th class="py-3.5 px-4">{{ app()->getLocale() === 'ar' ? 'العقار' : 'Property' }}</th>
                        <th class="py-3.5 px-4">{{ app()->getLocale() === 'ar' ? 'النوع والموقع' : 'Type & Area' }}</th>
                        <th class="py-3.5 px-4">{{ app()->getLocale() === 'ar' ? 'المواصفات' : 'Specs' }}</th>
                        <th class="py-3.5 px-4">{{ app()->getLocale() === 'ar' ? 'التسعير' : 'Pricing' }}</th>
                        <th class="py-3.5 px-4">{{ app()->getLocale() === 'ar' ? 'الحجز والدفع' : 'Booking & Pay' }}</th>
                        <th class="py-3.5 px-4">{{ app()->getLocale() === 'ar' ? 'الحالة' : 'Status' }}</th>
                        <th class="py-3.5 px-4 text-center">{{ app()->getLocale() === 'ar' ? 'إجراءات' : 'Actions' }}</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-brand-border/60">
                    @forelse($properties as $property)
                        <tr class="hover:bg-brand-sand-light/30 transition-colors">
                            <!-- Thumbnail & Title -->
                            <td class="py-4 px-4">
                                <div class="flex items-center space-x-3 {{ app()->getLocale() === 'ar' ? 'space-x-reverse' : '' }}">
                                    <div class="w-14 h-14 rounded-xl overflow-hidden bg-brand-sand shrink-0 border border-brand-border relative">
                                        @if($property->featuredImage->first())
                                            <img src="{{ $property->featuredImage->first()->thumb_url }}" alt="{{ $property->title }}" class="w-full h-full object-cover">
                                        @elseif($property->images->first())
                                            <img src="{{ $property->images->first()->thumb_url }}" alt="{{ $property->title }}" class="w-full h-full object-cover">
                                        @else
                                            <div class="w-full h-full flex items-center justify-center text-[10px] text-brand-brown-muted font-bold">
                                                NO IMG
                                            </div>
                                        @endif
                                        @if($property->is_featured)
                                            <span class="absolute top-1 left-1 bg-amber-500 text-white text-[9px] px-1 rounded font-bold" title="Featured">★</span>
                                        @endif
                                    </div>
                                    <div class="min-w-0">
                                        <span class="text-[10px] font-mono font-bold text-brand-terracotta bg-brand-terracotta/10 px-1.5 py-0.5 rounded">
                                            {{ $property->reference_number }}
                                        </span>
                                        <p class="font-bold text-brand-brown text-sm mt-0.5 truncate max-w-xs">
                                            {{ $property->title }}
                                        </p>
                                        @if($property->compound)
                                            <span class="text-[11px] text-brand-brown-muted truncate block">{{ $property->compound }}</span>
                                        @endif
                                    </div>
                                </div>
                            </td>

                            <!-- Type & Location -->
                            <td class="py-4 px-4 whitespace-nowrap">
                                <div class="space-y-1">
                                    <span class="inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full {{ $property->listing_type === 'rent' ? 'bg-blue-50 text-blue-700' : ($property->listing_type === 'sale' ? 'bg-purple-50 text-purple-700' : 'bg-emerald-50 text-emerald-700') }}">
                                        {{ $property->listing_type === 'rent' ? 'For Rent' : ($property->listing_type === 'sale' ? 'For Sale' : 'Rent & Sale') }}
                                    </span>
                                    <p class="text-xs font-medium text-brand-brown">
                                        {{ $property->category?->name ?? 'General' }}
                                    </p>
                                    <p class="text-[11px] text-brand-brown-muted">
                                        📍 {{ $property->location?->name ?? 'El Gouna' }}
                                    </p>
                                </div>
                            </td>

                            <!-- Specs -->
                            <td class="py-4 px-4 whitespace-nowrap text-xs">
                                <div class="space-y-1 text-brand-brown-muted">
                                    <div><span class="font-semibold text-brand-brown">{{ $property->bedrooms }}</span> Beds • <span class="font-semibold text-brand-brown">{{ $property->bathrooms }}</span> Baths</div>
                                    <div><span class="font-semibold text-brand-brown">{{ $property->max_guests }}</span> Guests max</div>
                                    @if($property->area_sqm)
                                        <div><span class="font-semibold text-brand-brown">{{ number_format($property->area_sqm) }}</span> m²</div>
                                    @endif
                                </div>
                            </td>

                            <!-- Pricing -->
                            <td class="py-4 px-4 whitespace-nowrap">
                                @if(in_array($property->listing_type, ['rent', 'both']))
                                    <div class="font-bold text-brand-terracotta text-sm">
                                        {{ number_format($property->base_price) }} <span class="text-[10px] font-normal text-brand-brown-muted">EGP / night</span>
                                    </div>
                                @endif
                                @if(in_array($property->listing_type, ['sale', 'both']) && $property->sale_price_cents)
                                    <div class="font-bold text-emerald-700 text-xs mt-0.5">
                                        {{ number_format($property->sale_price_cents / 100) }} <span class="text-[10px] font-normal text-brand-brown-muted">EGP (Sale)</span>
                                    </div>
                                @endif
                            </td>

                            <!-- Booking Mode & Payment -->
                            <td class="py-4 px-4 whitespace-nowrap text-xs">
                                <div class="space-y-1">
                                    <span class="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full {{ $property->booking_mode === 'instant' ? 'bg-emerald-50 text-emerald-700' : ($property->booking_mode === 'whatsapp' ? 'bg-teal-50 text-teal-700' : 'bg-amber-50 text-amber-700') }}">
                                        ⚡ {{ ucfirst($property->booking_mode) }}
                                    </span>
                                    <p class="text-[11px] text-brand-brown-muted">
                                        Pay: {{ ucfirst($property->payment_requirement) }}
                                        @if($property->payment_requirement !== 'full' && $property->deposit_percentage)
                                            ({{ $property->deposit_percentage }}%)
                                        @endif
                                    </p>
                                </div>
                            </td>

                            <!-- Status -->
                            <td class="py-4 px-4 whitespace-nowrap">
                                <div class="space-y-1">
                                    @if($property->is_published)
                                        <span class="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                            Published
                                        </span>
                                    @else
                                        <span class="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                                            Draft
                                        </span>
                                    @endif
                                    @if($property->is_available)
                                        <p class="text-[10px] text-emerald-600 font-semibold">● Available</p>
                                    @else
                                        <p class="text-[10px] text-rose-500 font-semibold">● Blocked</p>
                                    @endif
                                </div>
                            </td>

                            <!-- Actions -->
                            <td class="py-4 px-4 whitespace-nowrap text-center">
                                <div class="inline-flex items-center space-x-1.5 {{ app()->getLocale() === 'ar' ? 'space-x-reverse' : '' }}">
                                    <!-- Edit -->
                                    <a href="{{ route('admin.properties.edit', $property) }}" 
                                       title="Edit Property"
                                       class="p-2 text-brand-brown hover:text-brand-terracotta bg-brand-sand-light hover:bg-brand-sand rounded-lg transition-colors">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                    </a>

                                    <!-- Delete -->
                                    <form method="POST" action="{{ route('admin.properties.destroy', $property) }}" 
                                          onsubmit="return confirm('{{ app()->getLocale() === 'ar' ? 'هل أنت متأكد من أرشفة هذا العقار؟' : 'Are you sure you want to archive this property?' }}')">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" 
                                                title="Archive Property"
                                                class="p-2 text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        </button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7" class="py-12 px-4 text-center">
                                <div class="max-w-xs mx-auto text-brand-brown-muted space-y-3">
                                    <div class="w-12 h-12 mx-auto rounded-full bg-brand-sand-light flex items-center justify-center text-brand-terracotta">
                                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                                    </div>
                                    <p class="font-bold text-sm text-brand-brown">{{ app()->getLocale() === 'ar' ? 'لا توجد عقارات مطابقة' : 'No properties found' }}</p>
                                    <p class="text-xs">{{ app()->getLocale() === 'ar' ? 'جرب تغيير معايير البحث أو أضف عقاراً جديداً الآن.' : 'Try adjusting your search filters or create a new property listing.' }}</p>
                                    <a href="{{ route('admin.properties.create') }}" class="inline-block mt-2 px-4 py-2 bg-brand-terracotta text-white rounded-xl text-xs font-semibold hover:bg-brand-terracotta-dark">
                                        + {{ app()->getLocale() === 'ar' ? 'إضافة عقار جديد' : 'Add New Property' }}
                                    </a>
                                </div>
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        @if($properties->hasPages())
            <div class="p-4 border-t border-brand-border bg-brand-sand-light/40">
                {{ $properties->links() }}
            </div>
        @endif
    </div>

</div>
@endsection
