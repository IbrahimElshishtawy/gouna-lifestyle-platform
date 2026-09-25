@extends('layouts.admin')

@section('title', app()->getLocale() === 'ar' ? 'إضافة عقار جديد' : 'Add New Property')
@section('page-title', app()->getLocale() === 'ar' ? 'إضافة عقار جديد' : 'Add New Property')
@section('breadcrumb', app()->getLocale() === 'ar' ? 'إنشاء عقار' : 'New Property')

@section('content')
<div class="max-w-6xl mx-auto space-y-6">

    <!-- Header -->
    <div class="flex items-center justify-between bg-white p-6 rounded-2xl border border-brand-border shadow-xs">
        <div>
            <h2 class="text-xl font-bold text-brand-brown tracking-tight">
                {{ app()->getLocale() === 'ar' ? 'إضافة وحدة سكنية أو فيلا جديدة' : 'Add New Property Listing' }}
            </h2>
            <p class="text-xs text-brand-brown-muted mt-1">
                {{ app()->getLocale() === 'ar' ? 'قم بملء تفاصيل العقار، التسعير، شروط الدفع والحجز، والصور الترويجية' : 'Configure property specs, pricing engine, payment rules (Section 20), booking modes (Section 21), and media gallery' }}
            </p>
        </div>
        <a href="{{ route('admin.properties.index') }}" 
           class="px-4 py-2 bg-brand-sand-light hover:bg-brand-sand text-brand-brown font-semibold text-xs rounded-xl border border-brand-border transition-colors">
            ← {{ app()->getLocale() === 'ar' ? 'العودة للقائمة' : 'Back to Inventory' }}
        </a>
    </div>

    <!-- Main Form -->
    <form method="POST" action="{{ route('admin.properties.store') }}" enctype="multipart/form-data" class="space-y-6">
        @csrf

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
                    <input type="text" name="title_en" value="{{ old('title_en') }}" required
                           placeholder="e.g., Luxury Lagoon Villa with Private Heated Pool"
                           class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta focus:ring focus:ring-brand-terracotta/20 py-2.5 px-3">
                </div>

                <!-- Title AR -->
                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">
                        {{ app()->getLocale() === 'ar' ? 'اسم العقار (بالعربية)' : 'Property Title (Arabic)' }}
                    </label>
                    <input type="text" name="title_ar" value="{{ old('title_ar') }}" dir="rtl"
                           placeholder="مثال: فيلا فاخرة على اللاجون بحمام سباحة دافئ خاص"
                           class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta focus:ring focus:ring-brand-terracotta/20 py-2.5 px-3">
                </div>

                <!-- Category -->
                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">
                        {{ app()->getLocale() === 'ar' ? 'تصنيف العقار *' : 'Property Category *' }}
                    </label>
                    <select name="property_category_id" required class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta focus:ring focus:ring-brand-terracotta/20 py-2.5 px-3 bg-white">
                        <option value="">{{ app()->getLocale() === 'ar' ? '-- اختر التصنيف --' : '-- Select Category --' }}</option>
                        @foreach($categories as $category)
                            <option value="{{ $category->id }}" {{ old('property_category_id') == $category->id ? 'selected' : '' }}>
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
                        <option value="">{{ app()->getLocale() === 'ar' ? '-- اختر المنطقة --' : '-- Select Location --' }}</option>
                        @foreach($locations as $loc)
                            <option value="{{ $loc->id }}" {{ old('location_id') == $loc->id ? 'selected' : '' }}>
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
                            <input type="radio" name="listing_type" value="rent" {{ old('listing_type', 'rent') === 'rent' ? 'checked' : '' }} class="text-brand-terracotta focus:ring-brand-terracotta">
                            <span class="ml-2.5 {{ app()->getLocale() === 'ar' ? 'mr-2.5 ml-0' : '' }} text-xs font-bold text-brand-brown">
                                {{ app()->getLocale() === 'ar' ? 'إيجار قصير المدى (إقامة)' : 'Vacation Rental Only' }}
                            </span>
                        </label>
                        <label class="flex items-center p-3 rounded-xl border border-brand-border cursor-pointer hover:bg-brand-sand-light/40 transition-colors">
                            <input type="radio" name="listing_type" value="sale" {{ old('listing_type') === 'sale' ? 'checked' : '' }} class="text-brand-terracotta focus:ring-brand-terracotta">
                            <span class="ml-2.5 {{ app()->getLocale() === 'ar' ? 'mr-2.5 ml-0' : '' }} text-xs font-bold text-brand-brown">
                                {{ app()->getLocale() === 'ar' ? 'للبيع (عقارات)' : 'For Sale Only' }}
                            </span>
                        </label>
                        <label class="flex items-center p-3 rounded-xl border border-brand-border cursor-pointer hover:bg-brand-sand-light/40 transition-colors">
                            <input type="radio" name="listing_type" value="both" {{ old('listing_type') === 'both' ? 'checked' : '' }} class="text-brand-terracotta focus:ring-brand-terracotta">
                            <span class="ml-2.5 {{ app()->getLocale() === 'ar' ? 'mr-2.5 ml-0' : '' }} text-xs font-bold text-brand-brown">
                                {{ app()->getLocale() === 'ar' ? 'متاح للإيجار والبيع معاً' : 'Both (Rent & Sale)' }}
                            </span>
                        </label>
                    </div>
                </div>

                <!-- Short Description EN -->
                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">
                        {{ app()->getLocale() === 'ar' ? 'نبذة مختصرة (EN)' : 'Short Summary (EN)' }}
                    </label>
                    <textarea name="short_description_en" rows="2" 
                              class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta focus:ring focus:ring-brand-terracotta/20 py-2.5 px-3"
                              placeholder="Key highlights in 1-2 sentences...">{{ old('short_description_en') }}</textarea>
                </div>

                <!-- Short Description AR -->
                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">
                        {{ app()->getLocale() === 'ar' ? 'نبذة مختصرة (AR)' : 'Short Summary (AR)' }}
                    </label>
                    <textarea name="short_description_ar" rows="2" dir="rtl"
                              class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta focus:ring focus:ring-brand-terracotta/20 py-2.5 px-3"
                              placeholder="أهم مميزات العقار في جملتين...">{{ old('short_description_ar') }}</textarea>
                </div>

                <!-- Description EN -->
                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">
                        {{ app()->getLocale() === 'ar' ? 'الوصف الكامل (EN)' : 'Detailed Description (EN)' }}
                    </label>
                    <textarea name="description_en" rows="4" 
                              class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta focus:ring focus:ring-brand-terracotta/20 py-2.5 px-3">{{ old('description_en') }}</textarea>
                </div>

                <!-- Description AR -->
                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">
                        {{ app()->getLocale() === 'ar' ? 'الوصف الكامل (AR)' : 'Detailed Description (AR)' }}
                    </label>
                    <textarea name="description_ar" rows="4" dir="rtl"
                              class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta focus:ring focus:ring-brand-terracotta/20 py-2.5 px-3">{{ old('description_ar') }}</textarea>
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
                    <input type="number" name="bedrooms" value="{{ old('bedrooms', 2) }}" min="0" required
                           class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2 px-3">
                </div>
                <div>
                    <label class="block text-[11px] font-bold text-brand-brown mb-1">Bathrooms *</label>
                    <input type="number" name="bathrooms" value="{{ old('bathrooms', 2) }}" min="0" required
                           class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2 px-3">
                </div>
                <div>
                    <label class="block text-[11px] font-bold text-brand-brown mb-1">Max Guests *</label>
                    <input type="number" name="max_guests" value="{{ old('max_guests', 4) }}" min="1" required
                           class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2 px-3">
                </div>
                <div>
                    <label class="block text-[11px] font-bold text-brand-brown mb-1">Area (m²)</label>
                    <input type="number" step="0.01" name="area_sqm" value="{{ old('area_sqm') }}"
                           class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2 px-3">
                </div>
                <div>
                    <label class="block text-[11px] font-bold text-brand-brown mb-1">Floor</label>
                    <input type="number" name="floor" value="{{ old('floor') }}"
                           class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2 px-3">
                </div>
                <div>
                    <label class="block text-[11px] font-bold text-brand-brown mb-1">Compound</label>
                    <input type="text" name="compound" value="{{ old('compound') }}" placeholder="e.g. Ancient Sands"
                           class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2 px-3">
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div class="sm:col-span-2">
                    <label class="block text-[11px] font-bold text-brand-brown mb-1">Street Address</label>
                    <input type="text" name="address" value="{{ old('address') }}" placeholder="Detailed address or building number"
                           class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2 px-3">
                </div>
                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="block text-[11px] font-bold text-brand-brown mb-1">Latitude</label>
                        <input type="number" step="any" name="latitude" value="{{ old('latitude', '27.3949') }}"
                               class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2 px-3">
                    </div>
                    <div>
                        <label class="block text-[11px] font-bold text-brand-brown mb-1">Longitude</label>
                        <input type="number" step="any" name="longitude" value="{{ old('longitude', '33.6766') }}"
                               class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2 px-3">
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
                    <input type="number" step="0.01" name="base_price" value="{{ old('base_price', '5000') }}"
                           class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2.5 px-3 font-semibold text-brand-terracotta">
                </div>
                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">Cleaning Fee (EGP)</label>
                    <input type="number" step="0.01" name="cleaning_fee" value="{{ old('cleaning_fee', '800') }}"
                           class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2.5 px-3">
                </div>
                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">Service Fee (EGP)</label>
                    <input type="number" step="0.01" name="service_fee" value="{{ old('service_fee', '500') }}"
                           class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2.5 px-3">
                </div>
                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">Tax Percentage (%)</label>
                    <input type="number" step="0.01" name="tax_percentage" value="{{ old('tax_percentage', '14.00') }}"
                           class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2.5 px-3">
                </div>
                <div>
                    <label class="block text-xs font-bold text-emerald-800 mb-1">Sale Price (EGP, if for sale)</label>
                    <input type="number" step="0.01" name="sale_price" value="{{ old('sale_price') }}"
                           placeholder="e.g. 18500000"
                           class="w-full text-xs rounded-xl border-emerald-300 focus:border-emerald-500 py-2.5 px-3 bg-emerald-50/20">
                </div>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div>
                    <label class="block text-[11px] font-bold text-brand-brown mb-1">Min Stay Nights</label>
                    <input type="number" name="min_stay_nights" value="{{ old('min_stay_nights', 2) }}" min="1"
                           class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2 px-3">
                </div>
                <div>
                    <label class="block text-[11px] font-bold text-brand-brown mb-1">Max Stay Nights</label>
                    <input type="number" name="max_stay_nights" value="{{ old('max_stay_nights') }}" min="1" placeholder="Optional"
                           class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2 px-3">
                </div>
                <div>
                    <label class="block text-[11px] font-bold text-brand-brown mb-1">Check-in Time</label>
                    <input type="time" name="check_in_time" value="{{ old('check_in_time', '15:00') }}"
                           class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2 px-3">
                </div>
                <div>
                    <label class="block text-[11px] font-bold text-brand-brown mb-1">Check-out Time</label>
                    <input type="time" name="check_out_time" value="{{ old('check_out_time', '11:00') }}"
                           class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2 px-3">
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
                        {{ app()->getLocale() === 'ar' ? 'حدد ما إذا كان العقار يتطلب دفع المبلغ كاملاً، عربون تأكيد، أو يمنح العميل حرية الاختيار' : 'Define payment requirement (full, deposit %, both), and restrict enabled gateways per property' }}
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
                        <option value="both" {{ old('payment_requirement', 'both') === 'both' ? 'selected' : '' }}>
                            Both (Customer Chooses Full or Deposit)
                        </option>
                        <option value="deposit" {{ old('payment_requirement') === 'deposit' ? 'selected' : '' }}>
                            Deposit Only Required
                        </option>
                        <option value="full" {{ old('payment_requirement') === 'full' ? 'selected' : '' }}>
                            Full Payment Upfront Only
                        </option>
                    </select>
                </div>

                <!-- Deposit Percentage -->
                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">
                        {{ app()->getLocale() === 'ar' ? 'نسبة العربون المطلوب (%)' : 'Required Deposit Percentage (%)' }}
                    </label>
                    <input type="number" step="0.01" name="deposit_percentage" value="{{ old('deposit_percentage', '50.00') }}" min="0" max="100"
                           class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2.5 px-3 bg-white">
                </div>

                <!-- Deposit Fixed Amount -->
                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">
                        {{ app()->getLocale() === 'ar' ? 'أو مبلغ عربون ثابت (EGP)' : 'Or Fixed Deposit Amount (EGP)' }}
                    </label>
                    <input type="number" step="0.01" name="deposit_fixed" value="{{ old('deposit_fixed') }}" min="0" placeholder="Optional"
                           class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2.5 px-3 bg-white">
                </div>
            </div>

            <!-- Allowed Payment Methods -->
            <div class="pt-2">
                <label class="block text-xs font-bold text-brand-brown mb-2">
                    {{ app()->getLocale() === 'ar' ? 'طرق الدفع المسموح بها لهذا العقار' : 'Allowed Payment Gateways & Methods' }}
                </label>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    @foreach($paymentMethods as $pm)
                        <label class="flex items-center p-3 rounded-xl border border-brand-border bg-white cursor-pointer hover:border-brand-terracotta transition-colors">
                            <input type="checkbox" name="payment_methods[]" value="{{ $pm->id }}" 
                                   {{ is_array(old('payment_methods')) ? (in_array($pm->id, old('payment_methods')) ? 'checked' : '') : 'checked' }}
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
                    <p class="text-[11px] text-brand-brown-muted">
                        {{ app()->getLocale() === 'ar' ? 'اختر نمط تدفق الحجز: فوري، بالطلب، عبر واتساب، أو إدخال يدوي' : 'Configure instant booking, request-to-book, direct WhatsApp conversion, or manual admin booking' }}
                    </p>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Booking Mode -->
                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">
                        {{ app()->getLocale() === 'ar' ? 'نمط الحجز *' : 'Booking Mode *' }}
                    </label>
                    <select name="booking_mode" required class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2.5 px-3 bg-white font-semibold">
                        <option value="instant" {{ old('booking_mode', 'instant') === 'instant' ? 'selected' : '' }}>
                            ⚡ Instant Booking (Auto-confirm upon payment)
                        </option>
                        <option value="request" {{ old('booking_mode') === 'request' ? 'selected' : '' }}>
                            📩 Request to Book (Owner/Admin approval required within 24h)
                        </option>
                        <option value="whatsapp" {{ old('booking_mode') === 'whatsapp' ? 'selected' : '' }}>
                            💬 Direct WhatsApp Booking (High-touch VIP concierge flow)
                        </option>
                        <option value="manual" {{ old('booking_mode') === 'manual' ? 'selected' : '' }}>
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
                        <option value="flexible" {{ old('cancellation_policy') === 'flexible' ? 'selected' : '' }}>Flexible (Full refund up to 7 days before check-in)</option>
                        <option value="moderate" {{ old('cancellation_policy', 'moderate') === 'moderate' ? 'selected' : '' }}>Moderate (Full refund up to 14 days before check-in)</option>
                        <option value="strict" {{ old('cancellation_policy') === 'strict' ? 'selected' : '' }}>Strict (50% refund up to 30 days before check-in)</option>
                        <option value="non_refundable" {{ old('cancellation_policy') === 'non_refundable' ? 'selected' : '' }}>Non-Refundable (No refunds permitted)</option>
                        <option value="custom" {{ old('cancellation_policy') === 'custom' ? 'selected' : '' }}>Custom Policy (Specify terms below)</option>
                    </select>
                </div>

                <!-- Custom Cancellation Text EN -->
                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">Custom Cancellation Policy (EN)</label>
                    <textarea name="cancellation_policy_text_en" rows="2" class="w-full text-xs rounded-xl border-brand-border py-2 px-3">{{ old('cancellation_policy_text_en') }}</textarea>
                </div>

                <!-- Custom Cancellation Text AR -->
                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">شروط الإلغاء المخصصة (AR)</label>
                    <textarea name="cancellation_policy_text_ar" rows="2" dir="rtl" class="w-full text-xs rounded-xl border-brand-border py-2 px-3">{{ old('cancellation_policy_text_ar') }}</textarea>
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

            <div class="space-y-4">
                @foreach($amenities as $group => $items)
                    <div>
                        <h4 class="text-xs font-bold uppercase tracking-wider text-brand-terracotta mb-2">{{ ucfirst($group) }}</h4>
                        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                            @foreach($items as $amenity)
                                <label class="flex items-center p-2 rounded-lg border border-brand-border/60 hover:bg-brand-sand-light/40 cursor-pointer">
                                    <input type="checkbox" name="amenities[]" value="{{ $amenity->id }}"
                                           {{ is_array(old('amenities')) && in_array($amenity->id, old('amenities')) ? 'checked' : '' }}
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

        <!-- 7. SECTION 44: MEDIA MANAGEMENT (IMAGES & VIDEOS) -->
        <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs space-y-4">
            <div class="flex items-center space-x-2 border-b border-brand-border pb-3 {{ app()->getLocale() === 'ar' ? 'space-x-reverse' : '' }}">
                <span class="w-6 h-6 rounded-full bg-brand-terracotta text-white flex items-center justify-center font-bold text-xs">44</span>
                <div>
                    <h3 class="font-bold text-brand-brown text-sm uppercase tracking-wider">
                        {{ app()->getLocale() === 'ar' ? 'إدارة الوسائط والصور (Section 44 Master Plan)' : 'Section 44 Media Management & Upload' }}
                    </h3>
                    <p class="text-[11px] text-brand-brown-muted">
                        {{ app()->getLocale() === 'ar' ? 'ارفع صور عالية الدقة وفيديوهات للعقار (أول صورة سيتم تعيينها كصورة رئيسية تلقائياً)' : 'Upload high-resolution photography and video walk-throughs (first uploaded image becomes featured cover)' }}
                    </p>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Images Upload -->
                <div class="border-2 border-dashed border-brand-border hover:border-brand-terracotta rounded-2xl p-6 text-center transition-colors bg-brand-sand-light/20">
                    <svg class="w-10 h-10 mx-auto text-brand-brown-muted mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    <label class="block text-xs font-bold text-brand-brown mb-1 cursor-pointer">
                        {{ app()->getLocale() === 'ar' ? 'اختر صور العقار (يمكن اختيار عدة صور)' : 'Upload Property Photos (Multiple)' }}
                        <input type="file" name="images[]" multiple accept="image/*" class="mt-2 block w-full text-xs text-brand-brown file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-terracotta file:text-white hover:file:bg-brand-terracotta-dark">
                    </label>
                    <span class="text-[10px] text-brand-brown-muted block mt-1">PNG, JPG, WEBP up to 10MB each</span>
                </div>

                <!-- Video Upload -->
                <div class="border-2 border-dashed border-brand-border hover:border-brand-terracotta rounded-2xl p-6 text-center transition-colors bg-brand-sand-light/20">
                    <svg class="w-10 h-10 mx-auto text-brand-brown-muted mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                    <label class="block text-xs font-bold text-brand-brown mb-1 cursor-pointer">
                        {{ app()->getLocale() === 'ar' ? 'فيديو الجولة الترويجية (اختياري)' : 'Video Walkthrough (Optional)' }}
                        <input type="file" name="videos[]" multiple accept="video/mp4,video/mov" class="mt-2 block w-full text-xs text-brand-brown file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-brown file:text-white hover:file:bg-brand-brown-dark">
                    </label>
                    <span class="text-[10px] text-brand-brown-muted block mt-1">MP4, MOV up to 50MB</span>
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

                <div class="flex items-center pt-5">
                    <label class="flex items-center cursor-pointer">
                        <input type="checkbox" name="is_available" value="1" {{ old('is_available', '1') ? 'checked' : '' }}
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
                {{ app()->getLocale() === 'ar' ? 'حفظ ونشر العقار' : 'Save & Publish Property' }}
            </button>
        </div>

    </form>
</div>
@endsection
