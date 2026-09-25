@extends('layouts.admin')

@section('title', app()->getLocale() === 'ar' ? 'إضافة فعالية جديدة' : 'Add New Event')
@section('page-title', app()->getLocale() === 'ar' ? 'إضافة فعالية جديدة' : 'Add New Event')
@section('breadcrumb', app()->getLocale() === 'ar' ? 'إنشاء فعالية' : 'New Event')

@section('content')
<div class="max-w-5xl mx-auto space-y-6">

    <!-- Header -->
    <div class="flex items-center justify-between bg-white p-6 rounded-2xl border border-brand-border shadow-xs">
        <div>
            <h2 class="text-xl font-bold text-brand-brown tracking-tight">
                {{ app()->getLocale() === 'ar' ? 'إنشاء فعالية جديدة وتخصيص التذاكر' : 'Create New Event & Ticket Categories' }}
            </h2>
            <p class="text-xs text-brand-brown-muted mt-1">
                {{ app()->getLocale() === 'ar' ? 'أدخل مواعيد الفعالية، المكان، فئات التذاكر المتعددة، وصورة البانر الترويجية' : 'Configure event schedule, venue, multi-tier tickets (General/VIP/Tables), and banner media' }}
            </p>
        </div>
        <a href="{{ route('admin.events.index') }}" 
           class="px-4 py-2 bg-brand-sand-light hover:bg-brand-sand text-brand-brown font-semibold text-xs rounded-xl border border-brand-border transition-colors">
            ← {{ app()->getLocale() === 'ar' ? 'العودة للفعاليات' : 'Back to Events' }}
        </a>
    </div>

    <form method="POST" action="{{ route('admin.events.store') }}" enctype="multipart/form-data" class="space-y-6">
        @csrf

        <!-- 1. EVENT BASIC INFO -->
        <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs space-y-4">
            <div class="flex items-center space-x-2 border-b border-brand-border pb-3 {{ app()->getLocale() === 'ar' ? 'space-x-reverse' : '' }}">
                <span class="w-6 h-6 rounded-full bg-brand-terracotta/10 text-brand-terracotta flex items-center justify-center font-bold text-xs">1</span>
                <h3 class="font-bold text-brand-brown text-sm uppercase tracking-wider">
                    {{ app()->getLocale() === 'ar' ? 'تفاصيل الفعالية' : 'Event Core Details' }}
                </h3>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">Event Title (EN) *</label>
                    <input type="text" name="title_en" value="{{ old('title_en') }}" required
                           placeholder="e.g. Red Sea Sunset Sessions with International DJ"
                           class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2.5 px-3">
                </div>

                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">عنوان الفعالية (AR)</label>
                    <input type="text" name="title_ar" value="{{ old('title_ar') }}" dir="rtl"
                           placeholder="مثال: حفلات غروب البحر الأحمر مع دي جي عالمي"
                           class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2.5 px-3">
                </div>

                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">Category *</label>
                    <select name="category" required class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2.5 px-3 bg-white font-semibold">
                        <option value="nightlife" {{ old('category', 'nightlife') === 'nightlife' ? 'selected' : '' }}>Nightlife & Clubbing</option>
                        <option value="beach_party" {{ old('category') === 'beach_party' ? 'selected' : '' }}>Beach Club Party</option>
                        <option value="concert" {{ old('category') === 'concert' ? 'selected' : '' }}>Live Concert</option>
                        <option value="sports" {{ old('category') === 'sports' ? 'selected' : '' }}>Sports & Watersports</option>
                        <option value="cultural" {{ old('category') === 'cultural' ? 'selected' : '' }}>Cultural & Arts</option>
                    </select>
                </div>

                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">Organizer / Promoter</label>
                    <input type="text" name="organizer" value="{{ old('organizer', 'Gounow Lifestyle') }}"
                           class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2.5 px-3">
                </div>

                <div class="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                        <label class="block text-xs font-bold text-brand-brown mb-1">Event Date *</label>
                        <input type="date" name="event_date" value="{{ old('event_date', now()->addDays(7)->toDateString()) }}" required
                               class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2.5 px-3">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-brand-brown mb-1">Start Time</label>
                        <input type="time" name="start_time" value="{{ old('start_time', '21:00') }}"
                               class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2.5 px-3">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-brand-brown mb-1">End Time</label>
                        <input type="time" name="end_time" value="{{ old('end_time', '04:00') }}"
                               class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2.5 px-3">
                    </div>
                </div>

                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">Short Summary (EN)</label>
                    <textarea name="short_description_en" rows="2" class="w-full text-xs rounded-xl border-brand-border py-2 px-3">{{ old('short_description_en') }}</textarea>
                </div>

                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">ملخص الفعالية (AR)</label>
                    <textarea name="short_description_ar" rows="2" dir="rtl" class="w-full text-xs rounded-xl border-brand-border py-2 px-3">{{ old('short_description_ar') }}</textarea>
                </div>

                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">Full Description (EN)</label>
                    <textarea name="description_en" rows="3" class="w-full text-xs rounded-xl border-brand-border py-2 px-3">{{ old('description_en') }}</textarea>
                </div>

                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">الوصف الكامل (AR)</label>
                    <textarea name="description_ar" rows="3" dir="rtl" class="w-full text-xs rounded-xl border-brand-border py-2 px-3">{{ old('description_ar') }}</textarea>
                </div>
            </div>
        </div>

        <!-- 2. VENUE & LOCATION -->
        <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs space-y-4">
            <div class="flex items-center space-x-2 border-b border-brand-border pb-3 {{ app()->getLocale() === 'ar' ? 'space-x-reverse' : '' }}">
                <span class="w-6 h-6 rounded-full bg-brand-terracotta/10 text-brand-terracotta flex items-center justify-center font-bold text-xs">2</span>
                <h3 class="font-bold text-brand-brown text-sm uppercase tracking-wider">
                    {{ app()->getLocale() === 'ar' ? 'مكان الفعالية والخريطة' : 'Venue & Location' }}
                </h3>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">District / Location</label>
                    <select name="location_id" class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2.5 px-3 bg-white">
                        <option value="">-- Select Location --</option>
                        @foreach($locations as $loc)
                            <option value="{{ $loc->id }}" {{ old('location_id') == $loc->id ? 'selected' : '' }}>{{ $loc->name }}</option>
                        @endforeach
                    </select>
                </div>

                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">Venue Name</label>
                    <input type="text" name="venue_name" value="{{ old('venue_name', 'The Smokery Beach Club') }}"
                           class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2.5 px-3">
                </div>

                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">Address / Landmark</label>
                    <input type="text" name="venue_address" value="{{ old('venue_address', 'New Marina, El Gouna') }}"
                           class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2.5 px-3">
                </div>
            </div>
        </div>

        <!-- 3. TICKET TIERS REPEATER (Section 44 Master Plan) -->
        <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs space-y-4"
             x-data="{
                tiers: [
                    { name_en: 'General Admission', name_ar: 'تذكرة دخول عام', price: 1200, capacity: 300, max_per_order: 6, description_en: 'Access to main dance floor and open bar area' },
                    { name_en: 'VIP Lounge', name_ar: 'صالة كبار الزوار VIP', price: 2500, capacity: 80, max_per_order: 4, description_en: 'Elevated VIP deck, private bar, fast track entry' }
                ],
                addTier() {
                    this.tiers.push({ name_en: '', name_ar: '', price: 1000, capacity: 50, max_per_order: 6, description_en: '' });
                },
                removeTier(index) {
                    if (this.tiers.length > 1) {
                        this.tiers.splice(index, 1);
                    }
                }
             }">
            <div class="flex items-center justify-between border-b border-brand-border pb-3">
                <div class="flex items-center space-x-2 {{ app()->getLocale() === 'ar' ? 'space-x-reverse' : '' }}">
                    <span class="w-6 h-6 rounded-full bg-brand-terracotta text-white flex items-center justify-center font-bold text-xs">3</span>
                    <h3 class="font-bold text-brand-brown text-sm uppercase tracking-wider">
                        {{ app()->getLocale() === 'ar' ? 'فئات التذاكر والأسعار (Ticket Tiers)' : 'Multi-Tier Ticket Categories & Pricing' }}
                    </h3>
                </div>
                <button type="button" @click="addTier()" class="px-3 py-1.5 bg-brand-sand hover:bg-brand-sand-light text-brand-brown text-xs font-bold rounded-xl border border-brand-border transition-colors">
                    + Add Ticket Tier
                </button>
            </div>

            <template x-for="(tier, index) in tiers" :key="index">
                <div class="p-4 rounded-xl border border-brand-border bg-brand-sand-light/30 space-y-3 relative">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-brand-terracotta uppercase tracking-wider" x-text="'Tier #' + (index + 1)"></span>
                        <button type="button" @click="removeTier(index)" x-show="tiers.length > 1" class="text-xs text-rose-600 hover:text-rose-800 font-semibold">
                            ✕ Remove Tier
                        </button>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        <div class="lg:col-span-2">
                            <label class="block text-[11px] font-bold text-brand-brown mb-1">Tier Name (EN) *</label>
                            <input type="text" :name="'tickets[' + index + '][name_en]'" x-model="tier.name_en" required
                                   class="w-full text-xs rounded-xl border-brand-border py-2 px-3">
                        </div>

                        <div>
                            <label class="block text-[11px] font-bold text-brand-brown mb-1">Price (EGP) *</label>
                            <input type="number" step="0.01" :name="'tickets[' + index + '][price]'" x-model="tier.price" required
                                   class="w-full text-xs rounded-xl border-brand-border py-2 px-3 font-semibold text-brand-terracotta">
                        </div>

                        <div>
                            <label class="block text-[11px] font-bold text-brand-brown mb-1">Capacity</label>
                            <input type="number" :name="'tickets[' + index + '][capacity]'" x-model="tier.capacity" min="1"
                                   class="w-full text-xs rounded-xl border-brand-border py-2 px-3">
                        </div>

                        <div>
                            <label class="block text-[11px] font-bold text-brand-brown mb-1">Max Per Order</label>
                            <input type="number" :name="'tickets[' + index + '][max_per_order]'" x-model="tier.max_per_order" min="1"
                                   class="w-full text-xs rounded-xl border-brand-border py-2 px-3">
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                            <label class="block text-[11px] font-bold text-brand-brown mb-1">Tier Name (AR)</label>
                            <input type="text" :name="'tickets[' + index + '][name_ar]'" x-model="tier.name_ar" dir="rtl"
                                   class="w-full text-xs rounded-xl border-brand-border py-2 px-3">
                        </div>
                        <div>
                            <label class="block text-[11px] font-bold text-brand-brown mb-1">Perks / Description</label>
                            <input type="text" :name="'tickets[' + index + '][description_en]'" x-model="tier.description_en" placeholder="e.g. 2 drink coupons included"
                                   class="w-full text-xs rounded-xl border-brand-border py-2 px-3">
                        </div>
                    </div>
                </div>
            </template>
        </div>

        <!-- 4. SECTION 44: BANNER IMAGE UPLOAD -->
        <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs space-y-4">
            <div class="flex items-center space-x-2 border-b border-brand-border pb-3 {{ app()->getLocale() === 'ar' ? 'space-x-reverse' : '' }}">
                <span class="w-6 h-6 rounded-full bg-brand-terracotta text-white flex items-center justify-center font-bold text-xs">44</span>
                <h3 class="font-bold text-brand-brown text-sm uppercase tracking-wider">
                    {{ app()->getLocale() === 'ar' ? 'صورة البانر والبوستر (Section 44 Master Plan)' : 'Section 44 Promotional Poster / Banner' }}
                </h3>
            </div>

            <div class="border-2 border-dashed border-brand-border hover:border-brand-terracotta rounded-2xl p-6 text-center transition-colors bg-brand-sand-light/20">
                <svg class="w-10 h-10 mx-auto text-brand-brown-muted mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                <label class="block text-xs font-bold text-brand-brown mb-1 cursor-pointer">
                    {{ app()->getLocale() === 'ar' ? 'اختر صورة بوستر الفعالية عالية الجودة' : 'Upload Event Poster / Banner Artwork' }}
                    <input type="file" name="banner_image" accept="image/*" class="mt-2 block w-full text-xs text-brand-brown file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-terracotta file:text-white hover:file:bg-brand-terracotta-dark">
                </label>
                <span class="text-[10px] text-brand-brown-muted block mt-1">PNG, JPG, WEBP up to 10MB</span>
            </div>
        </div>

        <!-- 5. PUBLISHING CONTROLS -->
        <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">Status</label>
                    <select name="status" class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2 px-3 bg-white font-semibold">
                        <option value="draft" {{ old('status') === 'draft' ? 'selected' : '' }}>Draft</option>
                        <option value="published" {{ old('status', 'published') === 'published' ? 'selected' : '' }}>Published</option>
                        <option value="completed" {{ old('status') === 'completed' ? 'selected' : '' }}>Completed</option>
                        <option value="cancelled" {{ old('status') === 'cancelled' ? 'selected' : '' }}>Cancelled</option>
                    </select>
                </div>

                <div class="flex items-center pt-5">
                    <label class="flex items-center cursor-pointer">
                        <input type="checkbox" name="is_ticketed" value="1" {{ old('is_ticketed', '1') ? 'checked' : '' }}
                               class="text-brand-terracotta rounded focus:ring-brand-terracotta">
                        <span class="ml-2.5 {{ app()->getLocale() === 'ar' ? 'mr-2.5 ml-0' : '' }} text-xs font-bold text-brand-brown">
                            Ticketed Event
                        </span>
                    </label>
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
            <a href="{{ route('admin.events.index') }}" 
               class="px-5 py-2.5 bg-brand-sand-light hover:bg-brand-sand text-brand-brown font-semibold text-xs rounded-xl border border-brand-border transition-colors">
                Cancel
            </a>
            <button type="submit" 
                    class="px-6 py-2.5 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white font-bold text-xs rounded-xl shadow-sm transition-colors">
                Save & Publish Event
            </button>
        </div>

    </form>
</div>
@endsection
