@extends('layouts.admin')

@section('title', (app()->getLocale() === 'ar' ? 'تعديل الفعالية: ' : 'Edit Event: ') . $event->title)
@section('page-title', app()->getLocale() === 'ar' ? 'تعديل الفعالية والتذاكر' : 'Edit Event & Tickets')
@section('breadcrumb', $event->title)

@section('content')
<div class="max-w-5xl mx-auto space-y-6">

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-brand-border shadow-xs">
        <div>
            <span class="text-xs font-semibold text-brand-terracotta bg-brand-terracotta/10 px-2 py-0.5 rounded">
                {{ ucfirst($event->category ?? 'Nightlife') }} • {{ $event->event_date?->format('M d, Y') }}
            </span>
            <h2 class="text-xl font-bold text-brand-brown tracking-tight mt-1">
                {{ $event->title }}
            </h2>
        </div>
        <a href="{{ route('admin.events.index') }}" 
           class="px-4 py-2 bg-brand-sand-light hover:bg-brand-sand text-brand-brown font-semibold text-xs rounded-xl border border-brand-border transition-colors">
            ← {{ app()->getLocale() === 'ar' ? 'العودة للفعاليات' : 'Back to Events' }}
        </a>
    </div>

    <form method="POST" action="{{ route('admin.events.update', $event) }}" enctype="multipart/form-data" class="space-y-6">
        @csrf
        @method('PUT')

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
                    <input type="text" name="title_en" value="{{ old('title_en', $event->title_en) }}" required
                           class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2.5 px-3">
                </div>

                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">عنوان الفعالية (AR)</label>
                    <input type="text" name="title_ar" value="{{ old('title_ar', $event->title_ar) }}" dir="rtl"
                           class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2.5 px-3">
                </div>

                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">Category *</label>
                    <select name="category" required class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2.5 px-3 bg-white font-semibold">
                        <option value="nightlife" {{ old('category', $event->category) === 'nightlife' ? 'selected' : '' }}>Nightlife & Clubbing</option>
                        <option value="beach_party" {{ old('category', $event->category) === 'beach_party' ? 'selected' : '' }}>Beach Club Party</option>
                        <option value="concert" {{ old('category', $event->category) === 'concert' ? 'selected' : '' }}>Live Concert</option>
                        <option value="sports" {{ old('category', $event->category) === 'sports' ? 'selected' : '' }}>Sports & Watersports</option>
                        <option value="cultural" {{ old('category', $event->category) === 'cultural' ? 'selected' : '' }}>Cultural & Arts</option>
                    </select>
                </div>

                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">Organizer / Promoter</label>
                    <input type="text" name="organizer" value="{{ old('organizer', $event->organizer) }}"
                           class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2.5 px-3">
                </div>

                <div class="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                        <label class="block text-xs font-bold text-brand-brown mb-1">Event Date *</label>
                        <input type="date" name="event_date" value="{{ old('event_date', $event->event_date?->format('Y-m-d')) }}" required
                               class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2.5 px-3">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-brand-brown mb-1">Start Time</label>
                        <input type="time" name="start_time" value="{{ old('start_time', $event->start_time ? substr($event->start_time, 0, 5) : '21:00') }}"
                               class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2.5 px-3">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-brand-brown mb-1">End Time</label>
                        <input type="time" name="end_time" value="{{ old('end_time', $event->end_time ? substr($event->end_time, 0, 5) : '04:00') }}"
                               class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2.5 px-3">
                    </div>
                </div>

                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">Short Summary (EN)</label>
                    <textarea name="short_description_en" rows="2" class="w-full text-xs rounded-xl border-brand-border py-2 px-3">{{ old('short_description_en', $event->short_description_en) }}</textarea>
                </div>

                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">ملخص الفعالية (AR)</label>
                    <textarea name="short_description_ar" rows="2" dir="rtl" class="w-full text-xs rounded-xl border-brand-border py-2 px-3">{{ old('short_description_ar', $event->short_description_ar) }}</textarea>
                </div>

                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">Full Description (EN)</label>
                    <textarea name="description_en" rows="3" class="w-full text-xs rounded-xl border-brand-border py-2 px-3">{{ old('description_en', $event->description_en) }}</textarea>
                </div>

                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">الوصف الكامل (AR)</label>
                    <textarea name="description_ar" rows="3" dir="rtl" class="w-full text-xs rounded-xl border-brand-border py-2 px-3">{{ old('description_ar', $event->description_ar) }}</textarea>
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
                            <option value="{{ $loc->id }}" {{ old('location_id', $event->location_id) == $loc->id ? 'selected' : '' }}>{{ $loc->name }}</option>
                        @endforeach
                    </select>
                </div>

                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">Venue Name</label>
                    <input type="text" name="venue_name" value="{{ old('venue_name', $event->venue_name) }}"
                           class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2.5 px-3">
                </div>

                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">Address / Landmark</label>
                    <input type="text" name="venue_address" value="{{ old('venue_address', $event->venue_address) }}"
                           class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2.5 px-3">
                </div>
            </div>
        </div>

        <!-- 3. TICKET TIERS REPEATER -->
        @php
            $initialTiers = $event->ticketTypes->map(function ($tier) {
                return [
                    'id' => $tier->id,
                    'name_en' => $tier->name_en,
                    'name_ar' => $tier->name_ar ?? '',
                    'price' => $tier->price_cents / 100,
                    'capacity' => $tier->capacity ?? '',
                    'max_per_order' => $tier->max_per_order ?? 6,
                    'description_en' => $tier->description_en ?? '',
                    'sold_count' => $tier->sold_count ?? 0,
                ];
            })->values();

            if ($initialTiers->isEmpty()) {
                $initialTiers = collect([
                    ['id' => null, 'name_en' => 'General Admission', 'name_ar' => 'دخول عام', 'price' => 1200, 'capacity' => 200, 'max_per_order' => 6, 'description_en' => '', 'sold_count' => 0]
                ]);
            }
        @endphp

        <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs space-y-4"
             x-data="{
                tiers: {{ json_encode($initialTiers) }},
                addTier() {
                    this.tiers.push({ id: null, name_en: '', name_ar: '', price: 1000, capacity: 50, max_per_order: 6, description_en: '', sold_count: 0 });
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
                    <!-- Hidden Tier ID if existing -->
                    <input type="hidden" :name="'tickets[' + index + '][id]'" :value="tier.id">

                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-2 {{ app()->getLocale() === 'ar' ? 'space-x-reverse' : '' }}">
                            <span class="text-xs font-bold text-brand-terracotta uppercase tracking-wider" x-text="'Tier #' + (index + 1)"></span>
                            <span x-show="tier.sold_count > 0" class="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded" x-text="tier.sold_count + ' sold'"></span>
                        </div>
                        <button type="button" @click="removeTier(index)" x-show="tiers.length > 1 && tier.sold_count == 0" class="text-xs text-rose-600 hover:text-rose-800 font-semibold">
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
                            <input type="text" :name="'tickets[' + index + '][description_en]'" x-model="tier.description_en"
                                   class="w-full text-xs rounded-xl border-brand-border py-2 px-3">
                        </div>
                    </div>
                </div>
            </template>
        </div>

        <!-- 4. SECTION 44: BANNER IMAGE -->
        <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs space-y-4">
            <div class="flex items-center space-x-2 border-b border-brand-border pb-3 {{ app()->getLocale() === 'ar' ? 'space-x-reverse' : '' }}">
                <span class="w-6 h-6 rounded-full bg-brand-terracotta text-white flex items-center justify-center font-bold text-xs">44</span>
                <h3 class="font-bold text-brand-brown text-sm uppercase tracking-wider">
                    {{ app()->getLocale() === 'ar' ? 'صورة البانر والبوستر (Section 44 Master Plan)' : 'Section 44 Promotional Poster / Banner' }}
                </h3>
            </div>

            @if($event->media->count() > 0)
                <div class="flex items-center space-x-4 {{ app()->getLocale() === 'ar' ? 'space-x-reverse' : '' }}">
                    @foreach($event->media as $mediaItem)
                        <div class="relative group rounded-xl overflow-hidden border border-brand-border w-48 h-32 bg-brand-sand">
                            <img src="{{ $mediaItem->thumb_url }}" alt="Event Banner" class="w-full h-full object-cover">
                            <div class="absolute inset-0 bg-brand-brown/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <button type="button" 
                                        onclick="if(confirm('Delete banner image?')) { document.getElementById('delete-event-media-{{ $mediaItem->id }}').submit(); }"
                                        class="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                </button>
                            </div>
                        </div>
                    @endforeach
                </div>
            @endif

            <div class="border-2 border-dashed border-brand-border hover:border-brand-terracotta rounded-xl p-4 text-center bg-brand-sand-light/20">
                <label class="block text-xs font-bold text-brand-brown mb-1 cursor-pointer">
                    {{ $event->media->count() > 0 ? '+ Replace Banner Image' : '+ Upload Event Banner Image' }}
                    <input type="file" name="banner_image" accept="image/*" class="mt-2 block w-full text-xs text-brand-brown file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-terracotta file:text-white hover:file:bg-brand-terracotta-dark">
                </label>
            </div>
        </div>

        <!-- 5. PUBLISHING CONTROLS -->
        <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                <div>
                    <label class="block text-xs font-bold text-brand-brown mb-1">Status</label>
                    <select name="status" class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2 px-3 bg-white font-semibold">
                        <option value="draft" {{ old('status', $event->status) === 'draft' ? 'selected' : '' }}>Draft</option>
                        <option value="published" {{ old('status', $event->status) === 'published' ? 'selected' : '' }}>Published</option>
                        <option value="completed" {{ old('status', $event->status) === 'completed' ? 'selected' : '' }}>Completed</option>
                        <option value="cancelled" {{ old('status', $event->status) === 'cancelled' ? 'selected' : '' }}>Cancelled</option>
                    </select>
                </div>

                <div class="flex items-center pt-5">
                    <label class="flex items-center cursor-pointer">
                        <input type="checkbox" name="is_ticketed" value="1" {{ old('is_ticketed', $event->is_ticketed) ? 'checked' : '' }}
                               class="text-brand-terracotta rounded focus:ring-brand-terracotta">
                        <span class="ml-2.5 {{ app()->getLocale() === 'ar' ? 'mr-2.5 ml-0' : '' }} text-xs font-bold text-brand-brown">
                            Ticketed Event
                        </span>
                    </label>
                </div>

                <div class="flex items-center pt-5">
                    <label class="flex items-center cursor-pointer">
                        <input type="checkbox" name="is_published" value="1" {{ old('is_published', $event->is_published) ? 'checked' : '' }}
                               class="text-brand-terracotta rounded focus:ring-brand-terracotta">
                        <span class="ml-2.5 {{ app()->getLocale() === 'ar' ? 'mr-2.5 ml-0' : '' }} text-xs font-bold text-brand-brown">
                            Visible on Website
                        </span>
                    </label>
                </div>

                <div class="flex items-center pt-5">
                    <label class="flex items-center cursor-pointer">
                        <input type="checkbox" name="is_featured" value="1" {{ old('is_featured', $event->is_featured) ? 'checked' : '' }}
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
                Update Event & Tickets
            </button>
        </div>

    </form>

    <!-- Hidden Individual Media Deletion Form -->
    @foreach($event->media as $m)
        <form id="delete-event-media-{{ $m->id }}" 
              action="{{ route('admin.events.media.destroy', ['event' => $event, 'media' => $m]) }}" 
              method="POST" class="hidden">
            @csrf
            @method('DELETE')
        </form>
    @endforeach

</div>
@endsection
