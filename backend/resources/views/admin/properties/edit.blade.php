@extends('layouts.admin')

@section('title', (app()->getLocale() === 'ar' ? 'تعديل العقار: ' : 'Edit Property: ') . $property->title)
@section('page-title', app()->getLocale() === 'ar' ? 'تعديل العقار' : 'Edit Property')
@section('breadcrumb', $property->reference_number)

@section('content')
<div class="max-w-6xl mx-auto space-y-6">

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-brand-border shadow-xs">
        <div>
            <div class="flex items-center space-x-2 {{ app()->getLocale() === 'ar' ? 'space-x-reverse' : '' }}">
                <span class="text-xs font-mono font-bold text-brand-terracotta bg-brand-terracotta/10 px-2 py-0.5 rounded">
                    {{ $property->reference_number }}
                </span>
                <span class="text-xs font-semibold text-brand-brown-muted">
                    {{ $property->category?->name }} • {{ $property->location?->name }}
                </span>
            </div>
            <h2 class="text-xl font-bold text-brand-brown tracking-tight mt-1">
                {{ $property->title }}
            </h2>
        </div>
        <div class="flex items-center space-x-3 {{ app()->getLocale() === 'ar' ? 'space-x-reverse' : '' }}">
            <a href="{{ route('admin.properties.index') }}" 
               class="px-4 py-2 bg-brand-sand-light hover:bg-brand-sand text-brand-brown font-semibold text-xs rounded-xl border border-brand-border transition-colors">
                ← {{ app()->getLocale() === 'ar' ? 'العودة للقائمة' : 'Back to Inventory' }}
            </a>
        </div>
    </div>

    <!-- Main Form -->
    <form method="POST" action="{{ route('admin.properties.update', $property) }}" enctype="multipart/form-data" class="space-y-6">
        @csrf
        @method('PUT')

        <!-- 1. BASIC INFORMATION (BILINGUAL) -->
        <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs space-y-4">
            <div class="flex items-center space-x-2 border-b border-brand-border pb-3 {{ app()->getLocale() === 'ar' ? 'space-x-reverse' : '' }}">
                <span class="w-6 h-6 rounded-full bg-brand-terracotta/10 text-brand-terracotta flex items-center justify-center font-bold text-xs">1</span>
                <h3 class="font-bold text-brand-brown text-sm uppercase tracking-wider">
                    {{ app()->getLocale() === 'ar' ? 'البيانات الأساسية وتصنيف العقار' : 'Basic Information & Classification' }}
                </h3>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Title EN -->
                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">
                        {{ app()->getLocale() === 'ar' ? 'اسم العقار (بالإنجليزية) *' : 'Property Title (English) *' }}
                    </label>
                    <input type="text" name="title_en" value="{{ old('title_en', $property->title_en) }}" required
                           class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta focus:ring focus:ring-brand-terracotta/20 py-2.5 px-3">
                </div>

                <!-- Title AR -->
                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">
                        {{ app()->getLocale() === 'ar' ? 'اسم العقار (بالعربية)' : 'Property Title (Arabic)' }}
                    </label>
                    <input type="text" name="title_ar" value="{{ old('title_ar', $property->title_ar) }}" dir="rtl"
                           class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta focus:ring focus:ring-brand-terracotta/20 py-2.5 px-3">
                </div>

                <!-- Category -->
                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">
                        {{ app()->getLocale() === 'ar' ? 'تصنيف العقار *' : 'Property Category *' }}
                    </label>
                    <select name="property_category_id" required class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta focus:ring focus:ring-brand-terracotta/20 py-2.5 px-3 bg-white">
                        @foreach($categories as $category)
                            <option value="{{ $category->id }}" {{ old('property_category_id', $property->property_category_id) == $category->id ? 'selected' : '' }}>
                                {{ $category->name }}
                            </option>
                        @endforeach
                    </select>
                </div>

                <!-- Location -->
                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">
                        {{ app()->getLocale() === 'ar' ? 'منطقة الجونة *' : 'El Gouna District / Location *' }}
                    </label>
                    <select name="location_id" required class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta focus:ring focus:ring-brand-terracotta/20 py-2.5 px-3 bg-white">
                        @foreach($locations as $loc)
                            <option value="{{ $loc->id }}" {{ old('location_id', $property->location_id) == $loc->id ? 'selected' : '' }}>
                                {{ $loc->name }}
                            </option>
                        @endforeach
                    </select>
                </div>

                <!-- Listing Type -->
                <div class="md:col-span-2">
                    <label class="block text-xs font-bold text-brand-brown mb-2">
                        {{ app()->getLocale() === 'ar' ? 'نوع العرض الإعلاني *' : 'Listing Purpose *' }}
                    </label>
                    <div class="grid grid-cols-3 gap-3">
                        <label class="flex items-center p-3 rounded-xl border border-brand-border cursor-pointer hover:bg-brand-sand-light/40 transition-colors">
                            <input type="radio" name="listing_type" value="rent" {{ old('listing_type', $property->listing_type) === 'rent' ? 'checked' : '' }} class="text-brand-terracotta focus:ring-brand-terracotta">
                            <span class="ml-2.5 {{ app()->getLocale() === 'ar' ? 'mr-2.5 ml-0' : '' }} text-xs font-bold text-brand-brown">
                                {{ app()->getLocale() === 'ar' ? 'إيجار قصير المدى (إقامة)' : 'Vacation Rental Only' }}
                            </span>
                        </label>
                        <label class="flex items-center p-3 rounded-xl border border-brand-border cursor-pointer hover:bg-brand-sand-light/40 transition-colors">
                            <input type="radio" name="listing_type" value="sale" {{ old('listing_type', $property->listing_type) === 'sale' ? 'checked' : '' }} class="text-brand-terracotta focus:ring-brand-terracotta">
                            <span class="ml-2.5 {{ app()->getLocale() === 'ar' ? 'mr-2.5 ml-0' : '' }} text-xs font-bold text-brand-brown">
                                {{ app()->getLocale() === 'ar' ? 'للبيع (عقارات)' : 'For Sale Only' }}
                            </span>
                        </label>
                        <label class="flex items-center p-3 rounded-xl border border-brand-border cursor-pointer hover:bg-brand-sand-light/40 transition-colors">
                            <input type="radio" name="listing_type" value="both" {{ old('listing_type', $property->listing_type) === 'both' ? 'checked' : '' }} class="text-brand-terracotta focus:ring-brand-terracotta">
                            <span class="ml-2.5 {{ app()->getLocale() === 'ar' ? 'mr-2.5 ml-0' : '' }} text-xs font-bold text-brand-brown">
                                {{ app()->getLocale() === 'ar' ? 'متاح للإيجار والبيع معاً' : 'Both (Rent & Sale)' }}
                            </span>
                        </label>
                    </div>
                </div>

                <!-- Short Description EN -->
                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">Short Summary (EN)</label>
                    <textarea name="short_description_en" rows="2" class="w-full text-xs rounded-xl border-brand-border py-2.5 px-3">{{ old('short_description_en', $property->short_description_en) }}</textarea>
                </div>

                <!-- Short Description AR -->
                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">نبذة مختصرة (AR)</label>
                    <textarea name="short_description_ar" rows="2" dir="rtl" class="w-full text-xs rounded-xl border-brand-border py-2.5 px-3">{{ old('short_description_ar', $property->short_description_ar) }}</textarea>
                </div>

                <!-- Description EN -->
                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">Detailed Description (EN)</label>
                    <textarea name="description_en" rows="4" class="w-full text-xs rounded-xl border-brand-border py-2.5 px-3">{{ old('description_en', $property->description_en) }}</textarea>
                </div>

                <!-- Description AR -->
                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">الوصف الكامل (AR)</label>
                    <textarea name="description_ar" rows="4" dir="rtl" class="w-full text-xs rounded-xl border-brand-border py-2.5 px-3">{{ old('description_ar', $property->description_ar) }}</textarea>
                </div>
            </div>
        </div>

        <!-- 2. PHYSICAL SPECS & LOCATION -->
        <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs space-y-4">
            <div class="flex items-center space-x-2 border-b border-brand-border pb-3 {{ app()->getLocale() === 'ar' ? 'space-x-reverse' : '' }}">
                <span class="w-6 h-6 rounded-full bg-brand-terracotta/10 text-brand-terracotta flex items-center justify-center font-bold text-xs">2</span>
                <h3 class="font-bold text-brand-brown text-sm uppercase tracking-wider">
                    {{ app()->getLocale() === 'ar' ? 'المواصفات الفنية والموقع الجغرافي' : 'Physical Specs & Address' }}
                </h3>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div>
                    <label class="block text-[11px] font-bold text-brand-brown mb-1">Bedrooms *</label>
                    <input type="number" name="bedrooms" value="{{ old('bedrooms', $property->bedrooms) }}" min="0" required
                           class="w-full text-xs rounded-xl border-brand-border py-2 px-3">
                </div>
                <div>
                    <label class="block text-[11px] font-bold text-brand-brown mb-1">Bathrooms *</label>
                    <input type="number" name="bathrooms" value="{{ old('bathrooms', $property->bathrooms) }}" min="0" required
                           class="w-full text-xs rounded-xl border-brand-border py-2 px-3">
                </div>
                <div>
                    <label class="block text-[11px] font-bold text-brand-brown mb-1">Max Guests *</label>
                    <input type="number" name="max_guests" value="{{ old('max_guests', $property->max_guests) }}" min="1" required
                           class="w-full text-xs rounded-xl border-brand-border py-2 px-3">
                </div>
                <div>
                    <label class="block text-[11px] font-bold text-brand-brown mb-1">Area (m²)</label>
                    <input type="number" step="0.01" name="area_sqm" value="{{ old('area_sqm', $property->area_sqm) }}"
                           class="w-full text-xs rounded-xl border-brand-border py-2 px-3">
                </div>
                <div>
                    <label class="block text-[11px] font-bold text-brand-brown mb-1">Floor</label>
                    <input type="number" name="floor" value="{{ old('floor', $property->floor) }}"
                           class="w-full text-xs rounded-xl border-brand-border py-2 px-3">
                </div>
                <div>
                    <label class="block text-[11px] font-bold text-brand-brown mb-1">Compound</label>
                    <input type="text" name="compound" value="{{ old('compound', $property->compound) }}"
                           class="w-full text-xs rounded-xl border-brand-border py-2 px-3">
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div class="sm:col-span-2">
                    <label class="block text-[11px] font-bold text-brand-brown mb-1">Street Address</label>
                    <input type="text" name="address" value="{{ old('address', $property->address) }}"
                           class="w-full text-xs rounded-xl border-brand-border py-2 px-3">
                </div>
                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="block text-[11px] font-bold text-brand-brown mb-1">Latitude</label>
                        <input type="number" step="any" name="latitude" value="{{ old('latitude', $property->latitude) }}"
                               class="w-full text-xs rounded-xl border-brand-border py-2 px-3">
                    </div>
                    <div>
                        <label class="block text-[11px] font-bold text-brand-brown mb-1">Longitude</label>
                        <input type="number" step="any" name="longitude" value="{{ old('longitude', $property->longitude) }}"
                               class="w-full text-xs rounded-xl border-brand-border py-2 px-3">
                    </div>
                </div>
            </div>
        </div>

        <!-- 3. PRICING & RENTAL FEES -->
        <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs space-y-4">
            <div class="flex items-center space-x-2 border-b border-brand-border pb-3 {{ app()->getLocale() === 'ar' ? 'space-x-reverse' : '' }}">
                <span class="w-6 h-6 rounded-full bg-brand-terracotta/10 text-brand-terracotta flex items-center justify-center font-bold text-xs">3</span>
                <h3 class="font-bold text-brand-brown text-sm uppercase tracking-wider">
                    {{ app()->getLocale() === 'ar' ? 'التسعير ورسوم الإيجار' : 'Base Pricing & Rental Rules' }}
                </h3>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">Base Price / Night (EGP)</label>
                    <input type="number" step="0.01" name="base_price" value="{{ old('base_price', $property->base_price) }}"
                           class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2.5 px-3 font-semibold text-brand-terracotta">
                </div>
                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">Cleaning Fee (EGP)</label>
                    <input type="number" step="0.01" name="cleaning_fee" value="{{ old('cleaning_fee', $property->cleaning_fee) }}"
                           class="w-full text-xs rounded-xl border-brand-border py-2.5 px-3">
                </div>
                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">Service Fee (EGP)</label>
                    <input type="number" step="0.01" name="service_fee" value="{{ old('service_fee', $property->service_fee) }}"
                           class="w-full text-xs rounded-xl border-brand-border py-2.5 px-3">
                </div>
                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">Tax Percentage (%)</label>
                    <input type="number" step="0.01" name="tax_percentage" value="{{ old('tax_percentage', $property->tax_percentage) }}"
                           class="w-full text-xs rounded-xl border-brand-border py-2.5 px-3">
                </div>
                <div>
                    <label class="block text-xs font-bold text-emerald-800 mb-1">Sale Price (EGP, if for sale)</label>
                    <input type="number" step="0.01" name="sale_price" value="{{ old('sale_price', $property->sale_price_cents ? $property->sale_price_cents / 100 : '') }}"
                           class="w-full text-xs rounded-xl border-emerald-300 focus:border-emerald-500 py-2.5 px-3 bg-emerald-50/20">
                </div>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div>
                    <label class="block text-[11px] font-bold text-brand-brown mb-1">Min Stay Nights</label>
                    <input type="number" name="min_stay_nights" value="{{ old('min_stay_nights', $property->min_stay_nights) }}" min="1"
                           class="w-full text-xs rounded-xl border-brand-border py-2 px-3">
                </div>
                <div>
                    <label class="block text-[11px] font-bold text-brand-brown mb-1">Max Stay Nights</label>
                    <input type="number" name="max_stay_nights" value="{{ old('max_stay_nights', $property->max_stay_nights) }}" min="1"
                           class="w-full text-xs rounded-xl border-brand-border py-2 px-3">
                </div>
                <div>
                    <label class="block text-[11px] font-bold text-brand-brown mb-1">Check-in Time</label>
                    <input type="time" name="check_in_time" value="{{ old('check_in_time', substr($property->check_in_time, 0, 5)) }}"
                           class="w-full text-xs rounded-xl border-brand-border py-2 px-3">
                </div>
                <div>
                    <label class="block text-[11px] font-bold text-brand-brown mb-1">Check-out Time</label>
                    <input type="time" name="check_out_time" value="{{ old('check_out_time', substr($property->check_out_time, 0, 5)) }}"
                           class="w-full text-xs rounded-xl border-brand-border py-2 px-3">
                </div>
            </div>
        </div>

        <!-- 4. SECTION 20: PAYMENT SETTINGS PER PRODUCT -->
        <div class="bg-brand-sand-light/50 p-6 rounded-2xl border border-brand-border shadow-xs space-y-4">
            <div class="flex items-center space-x-2 border-b border-brand-border pb-3 {{ app()->getLocale() === 'ar' ? 'space-x-reverse' : '' }}">
                <span class="w-6 h-6 rounded-full bg-brand-terracotta text-white flex items-center justify-center font-bold text-xs">20</span>
                <div>
                    <h3 class="font-bold text-brand-brown text-sm uppercase tracking-wider">
                        {{ app()->getLocale() === 'ar' ? 'إعدادات الدفع المخصصة للمنتج (Section 20 Master Plan)' : 'Section 20 Payment Architecture & Settings' }}
                    </h3>
                    <p class="text-[11px] text-brand-brown-muted">
                        {{ app()->getLocale() === 'ar' ? 'حدد شرط الدفع لهذا العقار ونسبة العربون المطلوب والبوابات المسموحة' : 'Define payment requirement (full, deposit %, both), and restrict enabled gateways per property' }}
                    </p>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <!-- Payment Requirement Mode -->
                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">
                        {{ app()->getLocale() === 'ar' ? 'شرط الدفع عند الحجز *' : 'Payment Requirement *' }}
                    </label>
                    <select name="payment_requirement" required class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2.5 px-3 bg-white font-semibold">
                        <option value="both" {{ old('payment_requirement', $property->payment_requirement) === 'both' ? 'selected' : '' }}>
                            Both (Customer Chooses Full or Deposit)
                        </option>
                        <option value="deposit" {{ old('payment_requirement', $property->payment_requirement) === 'deposit' ? 'selected' : '' }}>
                            Deposit Only Required
                        </option>
                        <option value="full" {{ old('payment_requirement', $property->payment_requirement) === 'full' ? 'selected' : '' }}>
                            Full Payment Upfront Only
                        </option>
                    </select>
                </div>

                <!-- Deposit Percentage -->
                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">
                        {{ app()->getLocale() === 'ar' ? 'نسبة العربون المطلوب (%)' : 'Required Deposit Percentage (%)' }}
                    </label>
                    <input type="number" step="0.01" name="deposit_percentage" value="{{ old('deposit_percentage', $property->deposit_percentage) }}" min="0" max="100"
                           class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2.5 px-3 bg-white">
                </div>

                <!-- Deposit Fixed Amount -->
                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">
                        {{ app()->getLocale() === 'ar' ? 'أو مبلغ عربون ثابت (EGP)' : 'Or Fixed Deposit Amount (EGP)' }}
                    </label>
                    <input type="number" step="0.01" name="deposit_fixed" value="{{ old('deposit_fixed', $property->deposit_fixed_cents ? $property->deposit_fixed_cents / 100 : '') }}" min="0"
                           class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2.5 px-3 bg-white">
                </div>
            </div>

            <!-- Allowed Payment Methods -->
            <div class="pt-2">
                <label class="block text-xs font-bold text-brand-brown mb-2">
                    {{ app()->getLocale() === 'ar' ? 'طرق الدفع المسموح بها لهذا العقار' : 'Allowed Payment Gateways & Methods' }}
                </label>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    @php
                        $selectedMethods = old('payment_methods', $property->paymentMethods->pluck('id')->toArray());
                    @endphp
                    @foreach($paymentMethods as $pm)
                        <label class="flex items-center p-3 rounded-xl border border-brand-border bg-white cursor-pointer hover:border-brand-terracotta transition-colors">
                            <input type="checkbox" name="payment_methods[]" value="{{ $pm->id }}" 
                                   {{ in_array($pm->id, $selectedMethods) ? 'checked' : '' }}
                                   class="text-brand-terracotta rounded focus:ring-brand-terracotta">
                            <span class="ml-2.5 {{ app()->getLocale() === 'ar' ? 'mr-2.5 ml-0' : '' }} text-xs font-semibold text-brand-brown">
                                {{ $pm->name }}
                            </span>
                        </label>
                    @endforeach
                </div>
            </div>
        </div>

        <!-- 5. SECTION 21: BOOKING MODE & POLICIES -->
        <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs space-y-4">
            <div class="flex items-center space-x-2 border-b border-brand-border pb-3 {{ app()->getLocale() === 'ar' ? 'space-x-reverse' : '' }}">
                <span class="w-6 h-6 rounded-full bg-brand-terracotta text-white flex items-center justify-center font-bold text-xs">21</span>
                <div>
                    <h3 class="font-bold text-brand-brown text-sm uppercase tracking-wider">
                        {{ app()->getLocale() === 'ar' ? 'نمط الحجز وسياسات الإلغاء (Section 21 Master Plan)' : 'Section 21 Booking Mode & Policies' }}
                    </h3>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Booking Mode -->
                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">
                        {{ app()->getLocale() === 'ar' ? 'نمط الحجز *' : 'Booking Mode *' }}
                    </label>
                    <select name="booking_mode" required class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2.5 px-3 bg-white font-semibold">
                        <option value="instant" {{ old('booking_mode', $property->booking_mode) === 'instant' ? 'selected' : '' }}>
                            ⚡ Instant Booking (Auto-confirm upon payment)
                        </option>
                        <option value="request" {{ old('booking_mode', $property->booking_mode) === 'request' ? 'selected' : '' }}>
                            📩 Request to Book (Owner/Admin approval required within 24h)
                        </option>
                        <option value="whatsapp" {{ old('booking_mode', $property->booking_mode) === 'whatsapp' ? 'selected' : '' }}>
                            💬 Direct WhatsApp Booking (High-touch VIP concierge flow)
                        </option>
                        <option value="manual" {{ old('booking_mode', $property->booking_mode) === 'manual' ? 'selected' : '' }}>
                            🔒 Manual Admin Booking Only (Hidden from public instant checkout)
                        </option>
                    </select>
                </div>

                <!-- Cancellation Policy -->
                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">
                        {{ app()->getLocale() === 'ar' ? 'سياسة الإلغاء *' : 'Cancellation Policy *' }}
                    </label>
                    <select name="cancellation_policy" required class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2.5 px-3 bg-white font-semibold">
                        <option value="flexible" {{ old('cancellation_policy', $property->cancellation_policy) === 'flexible' ? 'selected' : '' }}>Flexible</option>
                        <option value="moderate" {{ old('cancellation_policy', $property->cancellation_policy) === 'moderate' ? 'selected' : '' }}>Moderate</option>
                        <option value="strict" {{ old('cancellation_policy', $property->cancellation_policy) === 'strict' ? 'selected' : '' }}>Strict</option>
                        <option value="non_refundable" {{ old('cancellation_policy', $property->cancellation_policy) === 'non_refundable' ? 'selected' : '' }}>Non-Refundable</option>
                        <option value="custom" {{ old('cancellation_policy', $property->cancellation_policy) === 'custom' ? 'selected' : '' }}>Custom Policy</option>
                    </select>
                </div>

                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">Custom Cancellation Policy (EN)</label>
                    <textarea name="cancellation_policy_text_en" rows="2" class="w-full text-xs rounded-xl border-brand-border py-2 px-3">{{ old('cancellation_policy_text_en', $property->cancellation_policy_text_en) }}</textarea>
                </div>

                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">شروط الإلغاء المخصصة (AR)</label>
                    <textarea name="cancellation_policy_text_ar" rows="2" dir="rtl" class="w-full text-xs rounded-xl border-brand-border py-2 px-3">{{ old('cancellation_policy_text_ar', $property->cancellation_policy_text_ar) }}</textarea>
                </div>
            </div>
        </div>

        <!-- 6. AMENITIES SELECTION -->
        <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs space-y-4">
            <div class="flex items-center space-x-2 border-b border-brand-border pb-3 {{ app()->getLocale() === 'ar' ? 'space-x-reverse' : '' }}">
                <span class="w-6 h-6 rounded-full bg-brand-terracotta/10 text-brand-terracotta flex items-center justify-center font-bold text-xs">6</span>
                <h3 class="font-bold text-brand-brown text-sm uppercase tracking-wider">
                    {{ app()->getLocale() === 'ar' ? 'المرافق والمميزات (Amenities)' : 'Amenities & Features' }}
                </h3>
            </div>

            @php
                $currentAmenities = old('amenities', $property->amenities->pluck('id')->toArray());
            @endphp
            <div class="space-y-4">
                @foreach($amenities as $group => $items)
                    <div>
                        <h4 class="text-xs font-bold uppercase tracking-wider text-brand-terracotta mb-2">{{ ucfirst($group) }}</h4>
                        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                            @foreach($items as $amenity)
                                <label class="flex items-center p-2 rounded-lg border border-brand-border/60 hover:bg-brand-sand-light/40 cursor-pointer">
                                    <input type="checkbox" name="amenities[]" value="{{ $amenity->id }}"
                                           {{ in_array($amenity->id, $currentAmenities) ? 'checked' : '' }}
                                           class="text-brand-terracotta rounded focus:ring-brand-terracotta">
                                    <span class="ml-2 {{ app()->getLocale() === 'ar' ? 'mr-2 ml-0' : '' }} text-xs text-brand-brown font-medium">
                                        {{ $amenity->name }}
                                    </span>
                                </label>
                            @endforeach
                        </div>
                    </div>
                @endforeach
            </div>
        </div>

        <!-- 7. SECTION 44: MEDIA MANAGEMENT & GALLERY -->
        <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs space-y-4">
            <div class="flex items-center space-x-2 border-b border-brand-border pb-3 {{ app()->getLocale() === 'ar' ? 'space-x-reverse' : '' }}">
                <span class="w-6 h-6 rounded-full bg-brand-terracotta text-white flex items-center justify-center font-bold text-xs">44</span>
                <div>
                    <h3 class="font-bold text-brand-brown text-sm uppercase tracking-wider">
                        {{ app()->getLocale() === 'ar' ? 'معرض الوسائط والصور المرفقة (Section 44 Master Plan)' : 'Section 44 Attached Media Gallery' }}
                    </h3>
                    <p class="text-[11px] text-brand-brown-muted">
                        {{ app()->getLocale() === 'ar' ? 'يمكنك حذف الصور الفردية أو رفع المزيد من الصور والفيديوهات' : 'Preview attached photography, manage cover image, or upload additional media assets' }}
                    </p>
                </div>
            </div>

            <!-- Current Media Grid -->
            @if($property->media->count() > 0)
                <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                    @foreach($property->media as $mediaItem)
                        <div class="relative group rounded-xl overflow-hidden border border-brand-border bg-brand-sand">
                            @if($mediaItem->file_type === 'image')
                                <img src="{{ $mediaItem->thumb_url }}" alt="Media" class="w-full h-28 object-cover">
                            @else
                                <div class="w-full h-28 flex items-center justify-center bg-brand-brown text-white text-xs font-bold">
                                    🎬 VIDEO
                                </div>
                            @endif

                            @if($mediaItem->is_featured)
                                <span class="absolute top-1.5 left-1.5 bg-brand-terracotta text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                                    FEATURED
                                </span>
                            @endif

                            <!-- Delete Media Button Form -->
                            <div class="absolute inset-0 bg-brand-brown/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <button type="button" 
                                        onclick="if(confirm('{{ app()->getLocale() === 'ar' ? 'حذف هذه الصورة؟' : 'Delete this media item?' }}')) { document.getElementById('delete-media-{{ $mediaItem->id }}').submit(); }"
                                        class="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                </button>
                            </div>
                        </div>
                    @endforeach
                </div>
            @else
                <div class="p-4 bg-brand-sand-light rounded-xl text-center text-xs text-brand-brown-muted">
                    {{ app()->getLocale() === 'ar' ? 'لا توجد وسائط مرفقة بهذا العقار بعد.' : 'No media uploaded yet for this property.' }}
                </div>
            @endif

            <!-- Upload More Media -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-brand-border">
                <div class="border-2 border-dashed border-brand-border hover:border-brand-terracotta rounded-xl p-4 text-center bg-brand-sand-light/20">
                    <label class="block text-xs font-bold text-brand-brown mb-1 cursor-pointer">
                        + {{ app()->getLocale() === 'ar' ? 'رفع صور إضافية' : 'Upload More Photos' }}
                        <input type="file" name="images[]" multiple accept="image/*" class="mt-2 block w-full text-xs text-brand-brown file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-terracotta file:text-white hover:file:bg-brand-terracotta-dark">
                    </label>
                </div>
                <div class="border-2 border-dashed border-brand-border hover:border-brand-terracotta rounded-xl p-4 text-center bg-brand-sand-light/20">
                    <label class="block text-xs font-bold text-brand-brown mb-1 cursor-pointer">
                        + {{ app()->getLocale() === 'ar' ? 'رفع فيديو إضافي' : 'Upload Additional Video' }}
                        <input type="file" name="videos[]" multiple accept="video/mp4,video/mov" class="mt-2 block w-full text-xs text-brand-brown file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-brown file:text-white hover:file:bg-brand-brown-dark">
                    </label>
                </div>
            </div>
        </div>

        <!-- 8. PUBLISHING CONTROLS -->
        <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs space-y-4">
            <div class="flex items-center space-x-2 border-b border-brand-border pb-3 {{ app()->getLocale() === 'ar' ? 'space-x-reverse' : '' }}">
                <span class="w-6 h-6 rounded-full bg-brand-terracotta/10 text-brand-terracotta flex items-center justify-center font-bold text-xs">8</span>
                <h3 class="font-bold text-brand-brown text-sm uppercase tracking-wider">
                    {{ app()->getLocale() === 'ar' ? 'حالة النشر والظهور' : 'Publishing & Status' }}
                </h3>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">Status</label>
                    <select name="status" class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2 px-3 bg-white font-semibold">
                        <option value="draft" {{ old('status', $property->status) === 'draft' ? 'selected' : '' }}>Draft</option>
                        <option value="published" {{ old('status', $property->status) === 'published' ? 'selected' : '' }}>Published</option>
                        <option value="archived" {{ old('status', $property->status) === 'archived' ? 'selected' : '' }}>Archived</option>
                    </select>
                </div>

                <div class="flex items-center pt-5">
                    <label class="flex items-center cursor-pointer">
                        <input type="checkbox" name="is_published" value="1" {{ old('is_published', $property->is_published) ? 'checked' : '' }}
                               class="text-brand-terracotta rounded focus:ring-brand-terracotta">
                        <span class="ml-2.5 {{ app()->getLocale() === 'ar' ? 'mr-2.5 ml-0' : '' }} text-xs font-bold text-brand-brown">
                            Visible on Website
                        </span>
                    </label>
                </div>

                <div class="flex items-center pt-5">
                    <label class="flex items-center cursor-pointer">
                        <input type="checkbox" name="is_featured" value="1" {{ old('is_featured', $property->is_featured) ? 'checked' : '' }}
                               class="text-brand-terracotta rounded focus:ring-brand-terracotta">
                        <span class="ml-2.5 {{ app()->getLocale() === 'ar' ? 'mr-2.5 ml-0' : '' }} text-xs font-bold text-amber-700">
                            ★ Feature on Homepage
                        </span>
                    </label>
                </div>

                <div class="flex items-center pt-5">
                    <label class="flex items-center cursor-pointer">
                        <input type="checkbox" name="is_available" value="1" {{ old('is_available', $property->is_available) ? 'checked' : '' }}
                               class="text-brand-terracotta rounded focus:ring-brand-terracotta">
                        <span class="ml-2.5 {{ app()->getLocale() === 'ar' ? 'mr-2.5 ml-0' : '' }} text-xs font-bold text-emerald-700">
                            ● Available for Booking
                        </span>
                    </label>
                </div>
            </div>
        </div>

        <!-- Submit Button Bar -->
        <div class="flex items-center justify-end space-x-3 bg-white p-6 rounded-2xl border border-brand-border shadow-xs {{ app()->getLocale() === 'ar' ? 'space-x-reverse' : '' }}">
            <a href="{{ route('admin.properties.index') }}" 
               class="px-5 py-2.5 bg-brand-sand-light hover:bg-brand-sand text-brand-brown font-semibold text-xs rounded-xl border border-brand-border transition-colors">
                {{ app()->getLocale() === 'ar' ? 'إلغاء' : 'Cancel' }}
            </a>
            <button type="submit" 
                    class="px-6 py-2.5 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white font-bold text-xs rounded-xl shadow-sm transition-colors">
                {{ app()->getLocale() === 'ar' ? 'تحديث وتطبيق التغييرات' : 'Update Property' }}
            </button>
        </div>

    </form>

    <!-- Hidden Individual Media Deletion Forms -->
    @foreach($property->media as $m)
        <form id="delete-media-{{ $m->id }}" 
              action="{{ route('admin.properties.media.destroy', ['property' => $property, 'media' => $m]) }}" 
              method="POST" class="hidden">
            @csrf
            @method('DELETE')
        </form>
    @endforeach

</div>
@endsection
