@extends('layouts.admin')

@section('title', (app()->getLocale() === 'ar' ? 'تعديل التجربة: ' : 'Edit Experience: ') . $experience->title)
@section('page-title', app()->getLocale() === 'ar' ? 'تعديل التجربة' : 'Edit Experience')
@section('breadcrumb', $experience->title)

@section('content')
<div class="max-w-5xl mx-auto space-y-6">

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-brand-border shadow-xs">
        <div>
            <span class="text-xs font-semibold text-brand-terracotta bg-brand-terracotta/10 px-2 py-0.5 rounded">
                {{ $experience->category?->name ?? 'Experience' }}
            </span>
            <h2 class="text-xl font-bold text-brand-brown tracking-tight mt-1">
                {{ $experience->title }}
            </h2>
        </div>
        <a href="{{ route('admin.experiences.index') }}" 
           class="px-4 py-2 bg-brand-sand-light hover:bg-brand-sand text-brand-brown font-semibold text-xs rounded-xl border border-brand-border transition-colors">
            ← {{ app()->getLocale() === 'ar' ? 'العودة للتجارب' : 'Back to Experiences' }}
        </a>
    </div>

    <form method="POST" action="{{ route('admin.experiences.update', $experience) }}" enctype="multipart/form-data" class="space-y-6">
        @csrf
        @method('PUT')

        <!-- 1. BASIC INFORMATION -->
        <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs space-y-4">
            <div class="flex items-center space-x-2 border-b border-brand-border pb-3 {{ app()->getLocale() === 'ar' ? 'space-x-reverse' : '' }}">
                <span class="w-6 h-6 rounded-full bg-brand-terracotta/10 text-brand-terracotta flex items-center justify-center font-bold text-xs">1</span>
                <h3 class="font-bold text-brand-brown text-sm uppercase tracking-wider">
                    {{ app()->getLocale() === 'ar' ? 'بيانات التجربة والتصنيف' : 'Experience Details & Category' }}
                </h3>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">Title (English) *</label>
                    <input type="text" name="title_en" value="{{ old('title_en', $experience->title_en) }}" required
                           class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2.5 px-3">
                </div>

                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">اسم التجربة (عربي)</label>
                    <input type="text" name="title_ar" value="{{ old('title_ar', $experience->title_ar) }}" dir="rtl"
                           class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2.5 px-3">
                </div>

                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">Category *</label>
                    <select name="experience_category_id" required class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2.5 px-3 bg-white">
                        @foreach($categories as $cat)
                            <option value="{{ $cat->id }}" {{ old('experience_category_id', $experience->experience_category_id) == $cat->id ? 'selected' : '' }}>
                                {{ $cat->name }}
                            </option>
                        @endforeach
                    </select>
                </div>

                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">Location / Marina</label>
                    <select name="location_id" class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2.5 px-3 bg-white">
                        <option value="">-- Select Marina / Location --</option>
                        @foreach($locations as $loc)
                            <option value="{{ $loc->id }}" {{ old('location_id', $experience->location_id) == $loc->id ? 'selected' : '' }}>
                                {{ $loc->name }}
                            </option>
                        @endforeach
                    </select>
                </div>

                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">Short Summary (EN)</label>
                    <textarea name="short_description_en" rows="2" class="w-full text-xs rounded-xl border-brand-border py-2 px-3">{{ old('short_description_en', $experience->short_description_en) }}</textarea>
                </div>

                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">ملخص سريع (AR)</label>
                    <textarea name="short_description_ar" rows="2" dir="rtl" class="w-full text-xs rounded-xl border-brand-border py-2 px-3">{{ old('short_description_ar', $experience->short_description_ar) }}</textarea>
                </div>

                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">Full Description (EN)</label>
                    <textarea name="description_en" rows="4" class="w-full text-xs rounded-xl border-brand-border py-2 px-3">{{ old('description_en', $experience->description_en) }}</textarea>
                </div>

                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">الوصف الكامل (AR)</label>
                    <textarea name="description_ar" rows="4" dir="rtl" class="w-full text-xs rounded-xl border-brand-border py-2 px-3">{{ old('description_ar', $experience->description_ar) }}</textarea>
                </div>
            </div>
        </div>

        <!-- 2. PRICING & LOGISTICS -->
        <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs space-y-4">
            <div class="flex items-center space-x-2 border-b border-brand-border pb-3 {{ app()->getLocale() === 'ar' ? 'space-x-reverse' : '' }}">
                <span class="w-6 h-6 rounded-full bg-brand-terracotta/10 text-brand-terracotta flex items-center justify-center font-bold text-xs">2</span>
                <h3 class="font-bold text-brand-brown text-sm uppercase tracking-wider">
                    {{ app()->getLocale() === 'ar' ? 'نموذج التسعير والمدة والسعة' : 'Pricing Model, Duration & Capacity' }}
                </h3>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">Pricing Model *</label>
                    <select name="pricing_model" required class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2.5 px-3 bg-white font-semibold">
                        <option value="per_person" {{ old('pricing_model', $experience->pricing_model) === 'per_person' ? 'selected' : '' }}>Per Person</option>
                        <option value="per_group" {{ old('pricing_model', $experience->pricing_model) === 'per_group' ? 'selected' : '' }}>Per Group (Charter)</option>
                        <option value="per_vehicle" {{ old('pricing_model', $experience->pricing_model) === 'per_vehicle' ? 'selected' : '' }}>Per Vehicle</option>
                        <option value="per_day" {{ old('pricing_model', $experience->pricing_model) === 'per_day' ? 'selected' : '' }}>Per Day</option>
                        <option value="per_hour" {{ old('pricing_model', $experience->pricing_model) === 'per_hour' ? 'selected' : '' }}>Per Hour</option>
                        <option value="fixed" {{ old('pricing_model', $experience->pricing_model) === 'fixed' ? 'selected' : '' }}>Fixed Fee</option>
                    </select>
                </div>

                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">Base Price (EGP) *</label>
                    <input type="number" step="0.01" name="base_price" value="{{ old('base_price', $experience->base_price) }}" required
                           class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2.5 px-3 font-semibold text-brand-terracotta">
                </div>

                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">Duration</label>
                    <input type="text" name="duration" value="{{ old('duration', $experience->duration) }}"
                           class="w-full text-xs rounded-xl border-brand-border py-2.5 px-3">
                </div>

                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">Max Capacity (Persons)</label>
                    <input type="number" name="max_capacity" value="{{ old('max_capacity', $experience->max_capacity) }}" min="1"
                           class="w-full text-xs rounded-xl border-brand-border py-2.5 px-3">
                </div>
            </div>
        </div>

        <!-- 3. SECTION 20 & 21: PAYMENT & BOOKING POLICY -->
        <div class="bg-brand-sand-light/50 p-6 rounded-2xl border border-brand-border shadow-xs space-y-4">
            <div class="flex items-center space-x-2 border-b border-brand-border pb-3 {{ app()->getLocale() === 'ar' ? 'space-x-reverse' : '' }}">
                <span class="w-6 h-6 rounded-full bg-brand-terracotta text-white flex items-center justify-center font-bold text-xs">⚡</span>
                <h3 class="font-bold text-brand-brown text-sm uppercase tracking-wider">
                    {{ app()->getLocale() === 'ar' ? 'إعدادات الدفع ونمط الحجز (Sections 20 & 21 Master Plan)' : 'Sections 20 & 21 Payment & Booking Mode' }}
                </h3>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">Payment Requirement *</label>
                    <select name="payment_requirement" required class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2.5 px-3 bg-white font-semibold">
                        <option value="full" {{ old('payment_requirement', $experience->payment_requirement) === 'full' ? 'selected' : '' }}>Full Payment Upfront</option>
                        <option value="deposit" {{ old('payment_requirement', $experience->payment_requirement) === 'deposit' ? 'selected' : '' }}>Deposit Only</option>
                        <option value="both" {{ old('payment_requirement', $experience->payment_requirement) === 'both' ? 'selected' : '' }}>Both (Customer Chooses)</option>
                    </select>
                </div>

                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">Deposit Percentage (%)</label>
                    <input type="number" step="0.01" name="deposit_percentage" value="{{ old('deposit_percentage', $experience->deposit_percentage) }}" min="0" max="100"
                           class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2.5 px-3 bg-white">
                </div>

                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">Booking Mode *</label>
                    <select name="booking_mode" required class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2.5 px-3 bg-white font-semibold">
                        <option value="instant" {{ old('booking_mode', $experience->booking_mode) === 'instant' ? 'selected' : '' }}>⚡ Instant Booking</option>
                        <option value="request" {{ old('booking_mode', $experience->booking_mode) === 'request' ? 'selected' : '' }}>📩 Request to Book</option>
                        <option value="whatsapp" {{ old('booking_mode', $experience->booking_mode) === 'whatsapp' ? 'selected' : '' }}>💬 Direct WhatsApp Booking</option>
                        <option value="manual" {{ old('booking_mode', $experience->booking_mode) === 'manual' ? 'selected' : '' }}>🔒 Manual Admin Booking</option>
                    </select>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">What to Bring (EN)</label>
                    <input type="text" name="what_to_bring_en" value="{{ old('what_to_bring_en', $experience->what_to_bring_en) }}"
                           class="w-full text-xs rounded-xl border-brand-border py-2 px-3">
                </div>
                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">ما يجب إحضاره (AR)</label>
                    <input type="text" name="what_to_bring_ar" value="{{ old('what_to_bring_ar', $experience->what_to_bring_ar) }}" dir="rtl"
                           class="w-full text-xs rounded-xl border-brand-border py-2 px-3">
                </div>
                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">Meeting Point (EN)</label>
                    <input type="text" name="meeting_point_en" value="{{ old('meeting_point_en', $experience->meeting_point_en) }}"
                           class="w-full text-xs rounded-xl border-brand-border py-2 px-3">
                </div>
                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">نقطة الالتقاء (AR)</label>
                    <input type="text" name="meeting_point_ar" value="{{ old('meeting_point_ar', $experience->meeting_point_ar) }}" dir="rtl"
                           class="w-full text-xs rounded-xl border-brand-border py-2 px-3">
                </div>
            </div>
        </div>

        <!-- 4. SECTION 44: MEDIA GALLERY -->
        <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs space-y-4">
            <div class="flex items-center space-x-2 border-b border-brand-border pb-3 {{ app()->getLocale() === 'ar' ? 'space-x-reverse' : '' }}">
                <span class="w-6 h-6 rounded-full bg-brand-terracotta text-white flex items-center justify-center font-bold text-xs">44</span>
                <div>
                    <h3 class="font-bold text-brand-brown text-sm uppercase tracking-wider">
                        {{ app()->getLocale() === 'ar' ? 'معرض الصور المرفقة (Section 44 Master Plan)' : 'Section 44 Attached Media Gallery' }}
                    </h3>
                </div>
            </div>

            @if($experience->media->count() > 0)
                <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                    @foreach($experience->media as $mediaItem)
                        <div class="relative group rounded-xl overflow-hidden border border-brand-border bg-brand-sand">
                            <img src="{{ $mediaItem->thumb_url }}" alt="Experience photo" class="w-full h-28 object-cover">
                            @if($mediaItem->is_featured)
                                <span class="absolute top-1.5 left-1.5 bg-brand-terracotta text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                    COVER
                                </span>
                            @endif
                            <div class="absolute inset-0 bg-brand-brown/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <button type="button" 
                                        onclick="if(confirm('Delete photo?')) { document.getElementById('delete-exp-media-{{ $mediaItem->id }}').submit(); }"
                                        class="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                </button>
                            </div>
                        </div>
                    @endforeach
                </div>
            @endif

            <div class="pt-3 border-t border-brand-border">
                <div class="border-2 border-dashed border-brand-border hover:border-brand-terracotta rounded-xl p-4 text-center bg-brand-sand-light/20">
                    <label class="block text-xs font-bold text-brand-brown mb-1 cursor-pointer">
                        + Upload Additional Photos
                        <input type="file" name="images[]" multiple accept="image/*" class="mt-2 block w-full text-xs text-brand-brown file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-terracotta file:text-white hover:file:bg-brand-terracotta-dark">
                    </label>
                </div>
            </div>
        </div>

        <!-- 5. PUBLISHING CONTROLS -->
        <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">Status</label>
                    <select name="status" class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2 px-3 bg-white font-semibold">
                        <option value="draft" {{ old('status', $experience->status) === 'draft' ? 'selected' : '' }}>Draft</option>
                        <option value="published" {{ old('status', $experience->status) === 'published' ? 'selected' : '' }}>Published</option>
                        <option value="archived" {{ old('status', $experience->status) === 'archived' ? 'selected' : '' }}>Archived</option>
                    </select>
                </div>

                <div class="flex items-center pt-5">
                    <label class="flex items-center cursor-pointer">
                        <input type="checkbox" name="is_published" value="1" {{ old('is_published', $experience->is_published) ? 'checked' : '' }}
                               class="text-brand-terracotta rounded focus:ring-brand-terracotta">
                        <span class="ml-2.5 {{ app()->getLocale() === 'ar' ? 'mr-2.5 ml-0' : '' }} text-xs font-bold text-brand-brown">
                            Visible on Website
                        </span>
                    </label>
                </div>

                <div class="flex items-center pt-5">
                    <label class="flex items-center cursor-pointer">
                        <input type="checkbox" name="is_featured" value="1" {{ old('is_featured', $experience->is_featured) ? 'checked' : '' }}
                               class="text-brand-terracotta rounded focus:ring-brand-terracotta">
                        <span class="ml-2.5 {{ app()->getLocale() === 'ar' ? 'mr-2.5 ml-0' : '' }} text-xs font-bold text-amber-700">
                            ★ Feature on Homepage
                        </span>
                    </label>
                </div>
            </div>
        </div>

        <!-- Submit -->
        <div class="flex items-center justify-end space-x-3 bg-white p-6 rounded-2xl border border-brand-border shadow-xs {{ app()->getLocale() === 'ar' ? 'space-x-reverse' : '' }}">
            <a href="{{ route('admin.experiences.index') }}" 
               class="px-5 py-2.5 bg-brand-sand-light hover:bg-brand-sand text-brand-brown font-semibold text-xs rounded-xl border border-brand-border transition-colors">
                Cancel
            </a>
            <button type="submit" 
                    class="px-6 py-2.5 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white font-bold text-xs rounded-xl shadow-sm transition-colors">
                Update Experience
            </button>
        </div>

    </form>

    <!-- Hidden Individual Media Deletion Forms -->
    @foreach($experience->media as $m)
        <form id="delete-exp-media-{{ $m->id }}" 
              action="{{ route('admin.experiences.media.destroy', ['experience' => $experience, 'media' => $m]) }}" 
              method="POST" class="hidden">
            @csrf
            @method('DELETE')
        </form>
    @endforeach

</div>
@endsection
