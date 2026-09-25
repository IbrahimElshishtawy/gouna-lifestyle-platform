@extends('layouts.admin')

@section('title', app()->getLocale() === 'ar' ? 'إضافة تجربة جديدة' : 'Add New Experience')
@section('page-title', app()->getLocale() === 'ar' ? 'إضافة تجربة جديدة' : 'Add New Experience')
@section('breadcrumb', app()->getLocale() === 'ar' ? 'إنشاء تجربة' : 'New Experience')

@section('content')
<div class="max-w-5xl mx-auto space-y-6">

    <!-- Header -->
    <div class="flex items-center justify-between bg-white p-6 rounded-2xl border border-brand-border shadow-xs">
        <div>
            <h2 class="text-xl font-bold text-brand-brown tracking-tight">
                {{ app()->getLocale() === 'ar' ? 'إنشاء نشاط أو تجربة ترفيهية' : 'Create New Activity or Experience' }}
            </h2>
            <p class="text-xs text-brand-brown-muted mt-1">
                {{ app()->getLocale() === 'ar' ? 'تخصيص تفاصيل التجربة، نماذج التسعير، شروط الحجز، ومعرض الصور' : 'Configure experience details, pricing model (per person/group/hour), payment settings (Section 20), and booking modes (Section 21)' }}
            </p>
        </div>
        <a href="{{ route('admin.experiences.index') }}" 
           class="px-4 py-2 bg-brand-sand-light hover:bg-brand-sand text-brand-brown font-semibold text-xs rounded-xl border border-brand-border transition-colors">
            ← {{ app()->getLocale() === 'ar' ? 'العودة للتجارب' : 'Back to Experiences' }}
        </a>
    </div>

    <form method="POST" action="{{ route('admin.experiences.store') }}" enctype="multipart/form-data" class="space-y-6">
        @csrf

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
                    <input type="text" name="title_en" value="{{ old('title_en') }}" required
                           placeholder="e.g. Private Sunset Yacht Charter to Tawila Island"
                           class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2.5 px-3">
                </div>

                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">اسم التجربة (عربي)</label>
                    <input type="text" name="title_ar" value="{{ old('title_ar') }}" dir="rtl"
                           placeholder="مثال: رحلة يخت خاصة وقت الغروب إلى جزيرة تاويلة"
                           class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2.5 px-3">
                </div>

                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">Category *</label>
                    <select name="experience_category_id" required class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2.5 px-3 bg-white">
                        <option value="">-- Select Category --</option>
                        @foreach($categories as $cat)
                            <option value="{{ $cat->id }}" {{ old('experience_category_id') == $cat->id ? 'selected' : '' }}>
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
                            <option value="{{ $loc->id }}" {{ old('location_id') == $loc->id ? 'selected' : '' }}>
                                {{ $loc->name }}
                            </option>
                        @endforeach
                    </select>
                </div>

                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">Short Summary (EN)</label>
                    <textarea name="short_description_en" rows="2" class="w-full text-xs rounded-xl border-brand-border py-2 px-3">{{ old('short_description_en') }}</textarea>
                </div>

                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">ملخص سريع (AR)</label>
                    <textarea name="short_description_ar" rows="2" dir="rtl" class="w-full text-xs rounded-xl border-brand-border py-2 px-3">{{ old('short_description_ar') }}</textarea>
                </div>

                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">Full Description (EN)</label>
                    <textarea name="description_en" rows="4" class="w-full text-xs rounded-xl border-brand-border py-2 px-3">{{ old('description_en') }}</textarea>
                </div>

                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">الوصف الكامل (AR)</label>
                    <textarea name="description_ar" rows="4" dir="rtl" class="w-full text-xs rounded-xl border-brand-border py-2 px-3">{{ old('description_ar') }}</textarea>
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
                        <option value="per_person" {{ old('pricing_model') === 'per_person' ? 'selected' : '' }}>Per Person</option>
                        <option value="per_group" {{ old('pricing_model') === 'per_group' ? 'selected' : '' }}>Per Group (Charter)</option>
                        <option value="per_vehicle" {{ old('pricing_model') === 'per_vehicle' ? 'selected' : '' }}>Per Vehicle (Buggy/Golf Car)</option>
                        <option value="per_day" {{ old('pricing_model') === 'per_day' ? 'selected' : '' }}>Per Day</option>
                        <option value="per_hour" {{ old('pricing_model') === 'per_hour' ? 'selected' : '' }}>Per Hour</option>
                        <option value="fixed" {{ old('pricing_model') === 'fixed' ? 'selected' : '' }}>Fixed Fee</option>
                    </select>
                </div>

                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">Base Price (EGP) *</label>
                    <input type="number" step="0.01" name="base_price" value="{{ old('base_price', '2500') }}" required
                           class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2.5 px-3 font-semibold text-brand-terracotta">
                </div>

                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">Duration</label>
                    <input type="text" name="duration" value="{{ old('duration', '4 Hours') }}" placeholder="e.g. 3 Hours, Half Day"
                           class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2.5 px-3">
                </div>

                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">Max Capacity (Persons)</label>
                    <input type="number" name="max_capacity" value="{{ old('max_capacity', '12') }}" min="1"
                           class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2.5 px-3">
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
                        <option value="full" {{ old('payment_requirement', 'full') === 'full' ? 'selected' : '' }}>Full Payment Upfront</option>
                        <option value="deposit" {{ old('payment_requirement') === 'deposit' ? 'selected' : '' }}>Deposit Only</option>
                        <option value="both" {{ old('payment_requirement') === 'both' ? 'selected' : '' }}>Both (Customer Chooses)</option>
                    </select>
                </div>

                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">Deposit Percentage (%)</label>
                    <input type="number" step="0.01" name="deposit_percentage" value="{{ old('deposit_percentage', '50.00') }}" min="0" max="100"
                           class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2.5 px-3 bg-white">
                </div>

                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">Booking Mode *</label>
                    <select name="booking_mode" required class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2.5 px-3 bg-white font-semibold">
                        <option value="instant" {{ old('booking_mode', 'instant') === 'instant' ? 'selected' : '' }}>⚡ Instant Booking</option>
                        <option value="request" {{ old('booking_mode') === 'request' ? 'selected' : '' }}>📩 Request to Book</option>
                        <option value="whatsapp" {{ old('booking_mode') === 'whatsapp' ? 'selected' : '' }}>💬 Direct WhatsApp Booking</option>
                        <option value="manual" {{ old('booking_mode') === 'manual' ? 'selected' : '' }}>🔒 Manual Admin Booking</option>
                    </select>
                </div>
            </div>

            <!-- Notes & Guidelines -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">What to Bring (EN)</label>
                    <input type="text" name="what_to_bring_en" value="{{ old('what_to_bring_en', 'Sunscreen, swimwear, sunglasses, passport/ID') }}"
                           class="w-full text-xs rounded-xl border-brand-border py-2 px-3">
                </div>
                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">ما يجب إحضاره (AR)</label>
                    <input type="text" name="what_to_bring_ar" value="{{ old('what_to_bring_ar', 'واقي الشمس، ملابس السباحة، النظارات الشمسية، الهوية') }}" dir="rtl"
                           class="w-full text-xs rounded-xl border-brand-border py-2 px-3">
                </div>
                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">Meeting Point (EN)</label>
                    <input type="text" name="meeting_point_en" value="{{ old('meeting_point_en', 'Abu Tig Marina, Pier 4') }}"
                           class="w-full text-xs rounded-xl border-brand-border py-2 px-3">
                </div>
                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">نقطة الالتقاء (AR)</label>
                    <input type="text" name="meeting_point_ar" value="{{ old('meeting_point_ar', 'مارينا أبو تيج، رصيف 4') }}" dir="rtl"
                           class="w-full text-xs rounded-xl border-brand-border py-2 px-3">
                </div>
            </div>
        </div>

        <!-- 4. SECTION 44: MEDIA UPLOAD -->
        <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs space-y-4">
            <div class="flex items-center space-x-2 border-b border-brand-border pb-3 {{ app()->getLocale() === 'ar' ? 'space-x-reverse' : '' }}">
                <span class="w-6 h-6 rounded-full bg-brand-terracotta text-white flex items-center justify-center font-bold text-xs">44</span>
                <h3 class="font-bold text-brand-brown text-sm uppercase tracking-wider">
                    {{ app()->getLocale() === 'ar' ? 'معرض صور التجربة (Section 44 Master Plan)' : 'Section 44 Experience Photos Upload' }}
                </h3>
            </div>

            <div class="border-2 border-dashed border-brand-border hover:border-brand-terracotta rounded-2xl p-6 text-center transition-colors bg-brand-sand-light/20">
                <svg class="w-10 h-10 mx-auto text-brand-brown-muted mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                <label class="block text-xs font-bold text-brand-brown mb-1 cursor-pointer">
                    {{ app()->getLocale() === 'ar' ? 'اختر صور التجربة (يمكن اختيار عدة صور)' : 'Upload Experience Photography (Multiple Images)' }}
                    <input type="file" name="images[]" multiple accept="image/*" class="mt-2 block w-full text-xs text-brand-brown file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-terracotta file:text-white hover:file:bg-brand-terracotta-dark">
                </label>
                <span class="text-[10px] text-brand-brown-muted block mt-1">PNG, JPG, WEBP up to 10MB each</span>
            </div>
        </div>

        <!-- 5. PUBLISHING CONTROLS -->
        <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">Status</label>
                    <select name="status" class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2 px-3 bg-white font-semibold">
                        <option value="draft" {{ old('status') === 'draft' ? 'selected' : '' }}>Draft</option>
                        <option value="published" {{ old('status', 'published') === 'published' ? 'selected' : '' }}>Published</option>
                        <option value="archived" {{ old('status') === 'archived' ? 'selected' : '' }}>Archived</option>
                    </select>
                </div>

                <div class="flex items-center pt-5">
                    <label class="flex items-center cursor-pointer">
                        <input type="checkbox" name="is_published" value="1" {{ old('is_published', '1') ? 'checked' : '' }}
                               class="text-brand-terracotta rounded focus:ring-brand-terracotta">
                        <span class="ml-2.5 {{ app()->getLocale() === 'ar' ? 'mr-2.5 ml-0' : '' }} text-xs font-bold text-brand-brown">
                            Visible on Website
                        </span>
                    </label>
                </div>

                <div class="flex items-center pt-5">
                    <label class="flex items-center cursor-pointer">
                        <input type="checkbox" name="is_featured" value="1" {{ old('is_featured') ? 'checked' : '' }}
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
                Save & Publish Experience
            </button>
        </div>

    </form>
</div>
@endsection
