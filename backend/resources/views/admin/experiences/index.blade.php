@extends('layouts.admin')

@section('title', app()->getLocale() === 'ar' ? 'إدارة التجارب والأنشطة' : 'Experiences Management')
@section('page-title', app()->getLocale() === 'ar' ? 'التجارب والأنشطة' : 'Experiences & Activities')
@section('breadcrumb', app()->getLocale() === 'ar' ? 'قائمة التجارب' : 'Experiences List')

@section('content')
<div class="space-y-6">

    <!-- Top Action Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-brand-border shadow-xs">
        <div>
            <h2 class="text-xl font-bold text-brand-brown tracking-tight">
                {{ app()->getLocale() === 'ar' ? 'سجل تجارب الجونة والأنشطة الترفيهية' : 'El Gouna Experiences & Activities' }}
            </h2>
            <p class="text-xs text-brand-brown-muted mt-1">
                {{ app()->getLocale() === 'ar' ? 'إدارة رحلات اليخوت، سفاري الصحراء، ركوب الخيل، الغوص، وتأجير سيارات الجولف' : 'Manage yacht charters, desert safaris, kitesurfing, diving excursions, and golf car rentals' }}
            </p>
        </div>
        <div class="flex items-center space-x-3 {{ app()->getLocale() === 'ar' ? 'space-x-reverse' : '' }}">
            <a href="{{ route('admin.experiences.create') }}" 
               class="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-brand-terracotta text-white font-semibold text-xs hover:bg-brand-terracotta-dark shadow-sm transition-all">
                <svg class="w-4 h-4 {{ app()->getLocale() === 'ar' ? 'ml-1.5' : 'mr-1.5' }}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                <span>{{ app()->getLocale() === 'ar' ? 'إضافة تجربة جديدة' : 'Add New Experience' }}</span>
            </a>
        </div>
    </div>

    <!-- Filters Bar -->
    <div class="bg-white p-5 rounded-2xl border border-brand-border shadow-xs">
        <form method="GET" action="{{ route('admin.experiences.index') }}" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <!-- Search -->
            <div class="lg:col-span-2">
                <label class="block text-[11px] font-semibold text-brand-brown-muted uppercase mb-1">{{ app()->getLocale() === 'ar' ? 'بحث بالاسم' : 'Search Title / Keyword' }}</label>
                <input type="text" name="search" value="{{ request('search') }}" 
                       placeholder="{{ app()->getLocale() === 'ar' ? 'ابحث باسم التجربة...' : 'Search experience title...' }}"
                       class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta focus:ring focus:ring-brand-terracotta/20 py-2.5 px-3">
            </div>

            <!-- Category -->
            <div>
                <label class="block text-[11px] font-semibold text-brand-brown-muted uppercase mb-1">{{ app()->getLocale() === 'ar' ? 'التصنيف' : 'Category' }}</label>
                <select name="category_id" class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2.5 px-3 bg-white">
                    <option value="">{{ app()->getLocale() === 'ar' ? 'جميع التصنيفات' : 'All Categories' }}</option>
                    @foreach($categories as $category)
                        <option value="{{ $category->id }}" {{ request('category_id') == $category->id ? 'selected' : '' }}>
                            {{ $category->name }}
                        </option>
                    @endforeach
                </select>
            </div>

            <!-- Status -->
            <div>
                <label class="block text-[11px] font-semibold text-brand-brown-muted uppercase mb-1">{{ app()->getLocale() === 'ar' ? 'الحالة' : 'Status' }}</label>
                <select name="status" class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2.5 px-3 bg-white">
                    <option value="">{{ app()->getLocale() === 'ar' ? 'كل الحالات' : 'All Statuses' }}</option>
                    <option value="published" {{ request('status') === 'published' ? 'selected' : '' }}>Published</option>
                    <option value="draft" {{ request('status') === 'draft' ? 'selected' : '' }}>Draft</option>
                    <option value="archived" {{ request('status') === 'archived' ? 'selected' : '' }}>Archived</option>
                </select>
            </div>

            <!-- Submit -->
            <div class="flex items-end space-x-2 {{ app()->getLocale() === 'ar' ? 'space-x-reverse' : '' }}">
                <button type="submit" class="flex-1 py-2.5 px-4 bg-brand-brown text-white text-xs font-semibold rounded-xl hover:bg-brand-brown-dark transition-colors text-center">
                    {{ app()->getLocale() === 'ar' ? 'تصفية' : 'Filter' }}
                </button>
                @if(request()->anyFilled(['search', 'category_id', 'status']))
                    <a href="{{ route('admin.experiences.index') }}" class="py-2.5 px-3 bg-brand-sand-light text-brand-brown-muted hover:text-brand-brown text-xs font-medium rounded-xl border border-brand-border transition-colors">
                        {{ app()->getLocale() === 'ar' ? 'إلغاء' : 'Reset' }}
                    </a>
                @endif
            </div>
        </form>
    </div>

    <!-- Experiences Table -->
    <div class="bg-white rounded-2xl border border-brand-border shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-brand-brown {{ app()->getLocale() === 'ar' ? 'text-right' : '' }}">
                <thead class="bg-brand-sand-light/60 border-b border-brand-border text-[11px] font-bold uppercase tracking-wider text-brand-brown-muted">
                    <tr>
                        <th class="py-3.5 px-4">{{ app()->getLocale() === 'ar' ? 'التجربة' : 'Experience' }}</th>
                        <th class="py-3.5 px-4">{{ app()->getLocale() === 'ar' ? 'التصنيف والمدة' : 'Category & Duration' }}</th>
                        <th class="py-3.5 px-4">{{ app()->getLocale() === 'ar' ? 'نموذج التسعير' : 'Pricing Model' }}</th>
                        <th class="py-3.5 px-4">{{ app()->getLocale() === 'ar' ? 'السعر' : 'Base Price' }}</th>
                        <th class="py-3.5 px-4">{{ app()->getLocale() === 'ar' ? 'الحجز والدفع' : 'Booking & Pay' }}</th>
                        <th class="py-3.5 px-4">{{ app()->getLocale() === 'ar' ? 'الحالة' : 'Status' }}</th>
                        <th class="py-3.5 px-4 text-center">{{ app()->getLocale() === 'ar' ? 'إجراءات' : 'Actions' }}</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-brand-border/60">
                    @forelse($experiences as $experience)
                        <tr class="hover:bg-brand-sand-light/30 transition-colors">
                            <td class="py-4 px-4">
                                <div class="flex items-center space-x-3 {{ app()->getLocale() === 'ar' ? 'space-x-reverse' : '' }}">
                                    <div class="w-14 h-14 rounded-xl overflow-hidden bg-brand-sand shrink-0 border border-brand-border relative">
                                        @if($experience->featuredImage->first())
                                            <img src="{{ $experience->featuredImage->first()->thumb_url }}" alt="{{ $experience->title }}" class="w-full h-full object-cover">
                                        @elseif($experience->images->first())
                                            <img src="{{ $experience->images->first()->thumb_url }}" alt="{{ $experience->title }}" class="w-full h-full object-cover">
                                        @else
                                            <div class="w-full h-full flex items-center justify-center text-[10px] text-brand-brown-muted font-bold">
                                                EXP
                                            </div>
                                        @endif
                                        @if($experience->is_featured)
                                            <span class="absolute top-1 left-1 bg-amber-500 text-white text-[9px] px-1 rounded font-bold">★</span>
                                        @endif
                                    </div>
                                    <div class="min-w-0">
                                        <p class="font-bold text-brand-brown text-sm truncate max-w-xs">
                                            {{ $experience->title }}
                                        </p>
                                        <span class="text-[11px] text-brand-brown-muted">📍 {{ $experience->location?->name ?? 'El Gouna' }}</span>
                                    </div>
                                </div>
                            </td>

                            <td class="py-4 px-4 whitespace-nowrap">
                                <div class="space-y-1">
                                    <span class="inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-brand-sand text-brand-terracotta">
                                        {{ $experience->category?->name ?? 'General' }}
                                    </span>
                                    @if($experience->duration)
                                        <p class="text-xs text-brand-brown-muted">⏱ {{ $experience->duration }}</p>
                                    @endif
                                    @if($experience->max_capacity)
                                        <p class="text-[10px] text-brand-brown-muted">Max: {{ $experience->max_capacity }} persons</p>
                                    @endif
                                </div>
                            </td>

                            <td class="py-4 px-4 whitespace-nowrap">
                                <span class="text-[11px] font-semibold text-brand-brown bg-brand-sand-light px-2 py-1 rounded-lg">
                                    {{ str_replace('_', ' ', ucfirst($experience->pricing_model)) }}
                                </span>
                            </td>

                            <td class="py-4 px-4 whitespace-nowrap font-bold text-brand-terracotta text-sm">
                                {{ number_format($experience->base_price) }} <span class="text-[10px] font-normal text-brand-brown-muted">EGP</span>
                            </td>

                            <td class="py-4 px-4 whitespace-nowrap text-xs">
                                <div class="space-y-1">
                                    <span class="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full {{ $experience->booking_mode === 'instant' ? 'bg-emerald-50 text-emerald-700' : 'bg-teal-50 text-teal-700' }}">
                                        ⚡ {{ ucfirst($experience->booking_mode) }}
                                    </span>
                                    <p class="text-[11px] text-brand-brown-muted">
                                        Pay: {{ ucfirst($experience->payment_requirement) }}
                                        @if($experience->payment_requirement !== 'full' && $experience->deposit_percentage)
                                            ({{ $experience->deposit_percentage }}%)
                                        @endif
                                    </p>
                                </div>
                            </td>

                            <td class="py-4 px-4 whitespace-nowrap">
                                @if($experience->is_published)
                                    <span class="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                        Published
                                    </span>
                                @else
                                    <span class="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                                        Draft
                                    </span>
                                @endif
                            </td>

                            <td class="py-4 px-4 whitespace-nowrap text-center">
                                <div class="inline-flex items-center space-x-1.5 {{ app()->getLocale() === 'ar' ? 'space-x-reverse' : '' }}">
                                    <!-- Edit -->
                                    <a href="{{ route('admin.experiences.edit', $experience) }}" 
                                       title="Edit Experience"
                                       class="p-2 text-brand-brown hover:text-brand-terracotta bg-brand-sand-light hover:bg-brand-sand rounded-lg transition-colors">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                    </a>

                                    <!-- Delete -->
                                    <form method="POST" action="{{ route('admin.experiences.destroy', $experience) }}" 
                                          onsubmit="return confirm('{{ app()->getLocale() === 'ar' ? 'أرشفة هذه التجربة؟' : 'Archive this experience?' }}')">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" 
                                                title="Archive Experience"
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
                                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    </div>
                                    <p class="font-bold text-sm text-brand-brown">{{ app()->getLocale() === 'ar' ? 'لا توجد تجارب مطابقة' : 'No experiences found' }}</p>
                                    <a href="{{ route('admin.experiences.create') }}" class="inline-block mt-2 px-4 py-2 bg-brand-terracotta text-white rounded-xl text-xs font-semibold hover:bg-brand-terracotta-dark">
                                        + {{ app()->getLocale() === 'ar' ? 'إضافة تجربة جديدة' : 'Add New Experience' }}
                                    </a>
                                </div>
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        @if($experiences->hasPages())
            <div class="p-4 border-t border-brand-border bg-brand-sand-light/40">
                {{ $experiences->links() }}
            </div>
        @endif
    </div>

</div>
@endsection
