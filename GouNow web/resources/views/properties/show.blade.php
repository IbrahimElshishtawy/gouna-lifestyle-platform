@extends('layouts.app')

@section('title', $property->title . ' - El Gouna Luxury Stay | GouNow')
@section('meta_description', Str::limit(strip_tags($property->short_description_en ?? $property->description_en), 160))

@section('content')

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 lg:py-12"
     x-data="bookingWidget({
        propertyId: {{ $property->id }},
        propertySlug: '{{ $property->slug }}',
        basePriceCents: {{ $property->base_price_cents }},
        minNights: {{ $property->min_stay_nights }},
        maxGuests: {{ $property->max_guests }},
        initialCheckIn: '{{ $defaultCheckIn }}',
        initialCheckOut: '{{ $defaultCheckOut }}',
        initialGuests: {{ $defaultGuests }},
        currency: '{{ $property->currency }}'
     })">

    <!-- Breadcrumb & Header -->
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <nav class="flex items-center gap-2 text-xs text-brand-brown-muted mb-2">
                <a href="{{ route('home') }}" class="hover:text-brand-brown">Home</a>
                <span>/</span>
                <a href="{{ route('properties.index', ['listing_type' => $property->listing_type]) }}" class="hover:text-brand-brown">
                    {{ $property->listing_type === 'sale' ? 'Real Estate' : 'Stays' }}
                </a>
                <span>/</span>
                <span class="text-brand-brown font-medium">{{ $property->location?->name ?? 'El Gouna' }}</span>
            </nav>
            <h1 class="font-serif text-2xl sm:text-4xl font-semibold text-brand-brown">{{ $property->title }}</h1>
            <div class="flex items-center gap-3 text-xs text-brand-brown-muted mt-2">
                <span>📍 {{ $property->address ?? ($property->location?->name . ', El Gouna, Egypt') }}</span>
                <span>•</span>
                <span class="font-mono text-brand-terracotta font-semibold">Ref: {{ $property->reference_number }}</span>
            </div>
        </div>

        <!-- Share / Wishlist / Inquire -->
        <div class="flex items-center gap-3 text-xs">
            <a href="{{ \App\Helpers\WhatsAppHelper::forProperty($property) }}" 
               target="_blank"
               data-ga-event="contact_whatsapp"
               data-ga-item="{{ $property->title }}"
               data-ga-category="property_inquiry"
               class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition flex items-center gap-1.5 shadow-xs">
                <span>💬</span>
                <span>WhatsApp Concierge</span>
            </a>
        </div>
    </div>

    <!-- Editorial Gallery (Section 127) -->
    <div class="mb-10 grid grid-cols-1 md:grid-cols-4 gap-3 rounded-3xl overflow-hidden shadow-xs border border-brand-border bg-brand-sand">
        <!-- Main Hero Image -->
        <div class="md:col-span-2 md:row-span-2 h-[380px] md:h-[480px] overflow-hidden group cursor-pointer relative">
            <img src="{{ $property->gallery_urls[0] ?? $property->cover_url }}" 
                 alt="{{ $property->title }}" 
                 class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
            <div class="absolute bottom-4 left-4">
                <span class="px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[11px] rounded-full uppercase tracking-wider">
                    {{ $property->compound ?? 'Waterfront Residence' }}
                </span>
            </div>
        </div>

        <!-- Supporting Images Grid -->
        @foreach(array_slice($property->gallery_urls, 1, 4) as $index => $imgUrl)
            <div class="h-[185px] md:h-[235px] overflow-hidden group cursor-pointer relative">
                <img src="{{ $imgUrl }}" 
                     alt="{{ $property->title }} photo {{ $index + 2 }}" 
                     class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
            </div>
        @endforeach
    </div>

    <!-- Quick Facts Strip -->
    <div class="grid grid-cols-2 sm:grid-cols-5 gap-4 p-5 bg-white rounded-2xl border border-brand-border mb-12 text-xs">
        <div class="border-r border-brand-border/60 pr-3">
            <span class="block text-brand-brown-muted text-[10px] uppercase font-bold tracking-wider">Bedrooms</span>
            <span class="text-sm font-bold text-brand-brown">{{ $property->bedrooms }} Beds</span>
        </div>
        <div class="border-r border-brand-border/60 pr-3">
            <span class="block text-brand-brown-muted text-[10px] uppercase font-bold tracking-wider">Bathrooms</span>
            <span class="text-sm font-bold text-brand-brown">{{ $property->bathrooms }} Baths</span>
        </div>
        <div class="border-r border-brand-border/60 pr-3">
            <span class="block text-brand-brown-muted text-[10px] uppercase font-bold tracking-wider">Capacity</span>
            <span class="text-sm font-bold text-brand-brown">Up to {{ $property->max_guests }} Guests</span>
        </div>
        <div class="border-r border-brand-border/60 pr-3">
            <span class="block text-brand-brown-muted text-[10px] uppercase font-bold tracking-wider">Area</span>
            <span class="text-sm font-bold text-brand-brown">{{ $property->area_sqm ? number_format($property->area_sqm) . ' m²' : 'Exclusive' }}</span>
        </div>
        <div>
            <span class="block text-brand-brown-muted text-[10px] uppercase font-bold tracking-wider">Times</span>
            <span class="text-xs font-semibold text-brand-brown">In {{ $property->check_in_time }} / Out {{ $property->check_out_time }}</span>
        </div>
    </div>

    <!-- Main Content Layout (2 Columns: Description & Booking Widget) -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        
        <!-- Left Column: Editorial Content (2 Cols) -->
        <div class="lg:col-span-2 space-y-10">
            
            <!-- Description -->
            <div class="bg-white p-8 rounded-3xl border border-brand-border shadow-xs space-y-4">
                <h2 class="font-serif text-xl font-bold text-brand-brown">
                    {{ app()->getLocale() === 'ar' ? 'عن هذا المسكن' : 'About This Sanctuary' }}
                </h2>
                <div class="text-xs sm:text-sm text-brand-brown/90 leading-relaxed space-y-4 font-light">
                    <p class="font-medium text-brand-brown leading-relaxed">
                        {{ $property->short_description_en }}
                    </p>
                    <div class="whitespace-pre-line text-brand-brown-muted">
                        {{ $property->description_en }}
                    </div>
                </div>
            </div>

            <!-- Amenities Grid -->
            <div class="bg-white p-8 rounded-3xl border border-brand-border shadow-xs space-y-6">
                <h2 class="font-serif text-xl font-bold text-brand-brown">
                    {{ app()->getLocale() === 'ar' ? 'المرافق والمميزات' : 'Curated Amenities' }}
                </h2>
                
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                    @forelse($property->amenities as $amenity)
                        <div class="flex items-center gap-2.5 p-3 rounded-xl bg-brand-sand-light/50 border border-brand-border/60">
                            <span class="text-base">{{ $amenity->icon ?? '✦' }}</span>
                            <span class="font-medium text-brand-brown">{{ $amenity->name }}</span>
                        </div>
                    @empty
                        <div class="flex items-center gap-2 p-3 bg-brand-sand-light/50 rounded-xl">
                            <span>🌊</span><span class="font-medium">Direct Lagoon Beach</span>
                        </div>
                        <div class="flex items-center gap-2 p-3 bg-brand-sand-light/50 rounded-xl">
                            <span>🏊</span><span class="font-medium">Private Heated Pool</span>
                        </div>
                        <div class="flex items-center gap-2 p-3 bg-brand-sand-light/50 rounded-xl">
                            <span>📶</span><span class="font-medium">High-Speed Wi-Fi</span>
                        </div>
                        <div class="flex items-center gap-2 p-3 bg-brand-sand-light/50 rounded-xl">
                            <span>❄️</span><span class="font-medium">Climate AC Control</span>
                        </div>
                        <div class="flex items-center gap-2 p-3 bg-brand-sand-light/50 rounded-xl">
                            <span>🍳</span><span class="font-medium">Fully Equipped Kitchen</span>
                        </div>
                        <div class="flex items-center gap-2 p-3 bg-brand-sand-light/50 rounded-xl">
                            <span>🚗</span><span class="font-medium">Private Parking</span>
                        </div>
                    @endforelse
                </div>
            </div>

            <!-- House Policies & Rules -->
            <div class="bg-white p-8 rounded-3xl border border-brand-border shadow-xs space-y-6">
                <h2 class="font-serif text-xl font-bold text-brand-brown">
                    {{ app()->getLocale() === 'ar' ? 'سياسات الإقامة' : 'Stay Policies & Information' }}
                </h2>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                    <div class="space-y-2">
                        <span class="font-bold text-brand-brown block">Cancellation Policy: <span class="capitalize text-brand-terracotta">{{ $property->cancellation_policy }}</span></span>
                        <p class="text-brand-brown-muted leading-relaxed">
                            {{ $property->cancellation_policy_text_en ?? 'Full refund up to 14 days before check-in. Partial refund applies thereafter.' }}
                        </p>
                    </div>

                    <div class="space-y-2">
                        <span class="font-bold text-brand-brown block">Payment Rules:</span>
                        <p class="text-brand-brown-muted leading-relaxed">
                            @if($property->payment_requirement === 'full')
                                Requires 100% full payment upon online reservation.
                            @elseif($property->payment_requirement === 'deposit')
                                Requires {{ $property->deposit_percentage ?? 30 }}% deposit upfront with remaining balance due prior to arrival.
                            @else
                                Flexible: Choose between full upfront payment or {{ $property->deposit_percentage ?? 30 }}% deposit at checkout.
                            @endif
                        </p>
                    </div>
                </div>

                @if($property->house_rules_en)
                    <div class="pt-4 border-t border-brand-border space-y-2 text-xs">
                        <span class="font-bold text-brand-brown block">House Rules:</span>
                        <p class="text-brand-brown-muted leading-relaxed whitespace-pre-line">{{ $property->house_rules_en }}</p>
                    </div>
                @endif
            </div>

        </div>

        <!-- Right Column: Sticky Booking Widget (Section 128) -->
        <div class="lg:col-span-1 lg:sticky lg:top-28">
            <div class="bg-white p-6 sm:p-7 rounded-3xl border border-brand-border shadow-lg space-y-6">
                
                @if($property->listing_type === 'sale')
                    <!-- For Sale Inquiry Card -->
                    <div class="space-y-4">
                        <div>
                            <span class="text-xs text-brand-brown-muted block">Asking Price</span>
                            <span class="text-2xl font-bold text-brand-brown font-serif">
                                {{ $property->sale_price_cents ? number_format($property->sale_price_cents / 100) . ' ' . $property->currency : 'Price on Request' }}
                            </span>
                        </div>

                        <div class="p-4 bg-brand-sand-light/50 rounded-2xl border border-brand-border text-xs space-y-1.5">
                            <div class="flex justify-between">
                                <span class="text-brand-brown-muted">Status:</span>
                                <span class="font-semibold capitalize text-brand-brown">{{ str_replace('_', ' ', $property->completion_status ?? 'Ready') }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-brand-brown-muted">Furnished:</span>
                                <span class="font-semibold capitalize text-brand-brown">{{ str_replace('_', ' ', $property->furnished_status ?? 'Furnished') }}</span>
                            </div>
                            @if($property->developer)
                                <div class="flex justify-between">
                                    <span class="text-brand-brown-muted">Developer:</span>
                                    <span class="font-semibold text-brand-brown">{{ $property->developer }}</span>
                                </div>
                            @endif
                        </div>

                        <!-- Inquiry Form -->
                        <form method="POST" action="{{ route('properties.inquire', $property->slug) }}" class="space-y-3">
                            @csrf
                            <input type="hidden" name="type" value="property_sale">
                            <div>
                                <label class="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">Your Name</label>
                                <input type="text" name="name" required class="w-full text-xs bg-brand-sand-light/40 border border-brand-border rounded-xl p-2.5">
                            </div>
                            <div>
                                <label class="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">Email</label>
                                <input type="email" name="email" required class="w-full text-xs bg-brand-sand-light/40 border border-brand-border rounded-xl p-2.5">
                            </div>
                            <div>
                                <label class="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">Phone / WhatsApp</label>
                                <input type="text" name="phone" required class="w-full text-xs bg-brand-sand-light/40 border border-brand-border rounded-xl p-2.5">
                            </div>
                            <div>
                                <label class="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">Message</label>
                                <textarea name="message" rows="2" class="w-full text-xs bg-brand-sand-light/40 border border-brand-border rounded-xl p-2.5" placeholder="I would like to arrange a private viewing..."></textarea>
                            </div>
                            <button type="submit" class="w-full py-3 bg-brand-brown hover:bg-brand-brown-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-sm cursor-pointer">
                                Request Private Viewing
                            </button>
                        </form>
                    </div>

                @else
                    <!-- Vacation Rental Booking Widget (Sections 128 & 18) -->
                    <div class="space-y-5">
                        
                        <!-- Nightly Price Header -->
                        <div class="flex items-baseline justify-between border-b border-brand-border pb-4">
                            <div>
                                <span class="text-2xl font-serif font-bold text-brand-brown">
                                    {{ number_format($property->base_price) }}
                                </span>
                                <span class="text-xs text-brand-brown-muted font-normal">
                                    {{ $property->currency }} / {{ app()->getLocale() === 'ar' ? 'ليلة' : 'night' }}
                                </span>
                            </div>
                            <span class="text-[11px] px-2.5 py-1 bg-emerald-50 text-emerald-700 font-semibold rounded-full border border-emerald-200">
                                Instant Booking
                            </span>
                        </div>

                        <!-- Date Inputs -->
                        <div class="grid grid-cols-2 gap-2 text-xs">
                            <div class="p-2.5 bg-brand-sand-light/50 border border-brand-border rounded-xl">
                                <label class="block text-[10px] font-bold uppercase tracking-wider text-brand-brown-muted">Check-In</label>
                                <input type="date" x-model="checkIn" @change="recalculateQuote()" 
                                       class="w-full text-xs font-semibold bg-transparent focus:outline-none text-brand-brown mt-1">
                            </div>
                            <div class="p-2.5 bg-brand-sand-light/50 border border-brand-border rounded-xl">
                                <label class="block text-[10px] font-bold uppercase tracking-wider text-brand-brown-muted">Check-Out</label>
                                <input type="date" x-model="checkOut" @change="recalculateQuote()" 
                                       class="w-full text-xs font-semibold bg-transparent focus:outline-none text-brand-brown mt-1">
                            </div>
                        </div>

                        <!-- Guests Selector -->
                        <div class="p-2.5 bg-brand-sand-light/50 border border-brand-border rounded-xl text-xs">
                            <label class="block text-[10px] font-bold uppercase tracking-wider text-brand-brown-muted">Guests</label>
                            <select x-model="guests" @change="recalculateQuote()" class="w-full text-xs font-semibold bg-transparent focus:outline-none text-brand-brown mt-1">
                                @for($g = 1; $g <= $property->max_guests; $g++)
                                    <option value="{{ $g }}">{{ $g }} {{ $g === 1 ? 'Guest' : 'Guests' }}</option>
                                @endfor
                            </select>
                        </div>

                        <!-- Error State -->
                        <div x-show="errorMessage" x-cloak class="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                            <span x-text="errorMessage"></span>
                        </div>

                        <!-- Live Calculation Breakdown -->
                        <div x-show="quote && !errorMessage" class="space-y-2.5 text-xs border-t border-brand-border pt-4">
                            <div class="flex justify-between text-brand-brown">
                                <span>{{ $property->currency }} <span x-text="(quote.subtotal_cents / 100 / quote.nights).toFixed(0)"></span> × <span x-text="quote.nights"></span> nights</span>
                                <span class="font-semibold">{{ $property->currency }} <span x-text="(quote.subtotal_cents / 100).toLocaleString()"></span></span>
                            </div>

                            <template x-if="quote.cleaning_fee_cents > 0">
                                <div class="flex justify-between text-brand-brown-muted">
                                    <span>Cleaning Fee</span>
                                    <span>{{ $property->currency }} <span x-text="(quote.cleaning_fee_cents / 100).toLocaleString()"></span></span>
                                </div>
                            </template>

                            <template x-if="quote.service_fee_cents > 0">
                                <div class="flex justify-between text-brand-brown-muted">
                                    <span>Service Fee</span>
                                    <span>{{ $property->currency }} <span x-text="(quote.service_fee_cents / 100).toLocaleString()"></span></span>
                                </div>
                            </template>

                            <template x-if="quote.tax_cents > 0">
                                <div class="flex justify-between text-brand-brown-muted">
                                    <span>Taxes (14% VAT)</span>
                                    <span>{{ $property->currency }} <span x-text="(quote.tax_cents / 100).toLocaleString()"></span></span>
                                </div>
                            </template>

                            <div class="flex justify-between font-bold text-sm text-brand-brown pt-3 border-t border-brand-border">
                                <span>Estimated Total</span>
                                <span class="text-brand-terracotta text-base">{{ $property->currency }} <span x-text="(quote.total_cents / 100).toLocaleString()"></span></span>
                            </div>

                            <template x-if="quote.deposit_cents > 0">
                                <div class="p-2.5 bg-amber-50/60 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex justify-between">
                                    <span>Required Deposit to Reserve:</span>
                                    <span class="font-bold">{{ $property->currency }} <span x-text="(quote.deposit_cents / 100).toLocaleString()"></span></span>
                                </div>
                            </template>
                        </div>

                        <!-- Reserve CTA Button -->
                        <div class="pt-2">
                            <a :href="checkoutUrl" 
                               :class="errorMessage ? 'opacity-50 pointer-events-none' : ''"
                               data-ga-event="begin_checkout"
                               data-ga-item="{{ $property->title }}"
                               data-ga-category="booking"
                               class="w-full block text-center py-3.5 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-md hover:shadow-lg cursor-pointer">
                                {{ app()->getLocale() === 'ar' ? 'المتابعة إلى الحجز الآمن' : 'Reserve Villa Now' }}
                            </a>
                            <p class="text-[10px] text-center text-brand-brown-muted mt-2">
                                🔒 You won't be charged yet &bull; 256-Bit SSL Secured
                            </p>
                        </div>

                    </div>
                @endif

            </div>
        </div>

    </div>

    <!-- Similar Stays Recommendation Grid (Section 127) -->
    @if($similarProperties->isNotEmpty())
        <div class="mt-20 pt-16 border-t border-brand-border">
            <h2 class="font-serif text-2xl font-bold text-brand-brown mb-8">
                {{ app()->getLocale() === 'ar' ? 'إقامات مشابهة في نفس المنطقة' : 'Similar Escapes in ' . ($property->location?->name ?? 'El Gouna') }}
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                @foreach($similarProperties as $similar)
                    <div class="bg-white rounded-3xl overflow-hidden border border-brand-border shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col">
                        <div class="relative h-52 overflow-hidden bg-brand-sand">
                            <img src="{{ $similar->cover_url }}" alt="{{ $similar->title }}" class="w-full h-full object-cover">
                        </div>
                        <div class="p-5 flex-1 flex flex-col justify-between space-y-3">
                            <div>
                                <span class="text-[11px] text-brand-brown-muted">📍 {{ $similar->location?->name }}</span>
                                <h3 class="font-serif text-base font-bold text-brand-brown mt-1">
                                    <a href="{{ route('properties.show', $similar->slug) }}">{{ $similar->title }}</a>
                                </h3>
                            </div>
                            <div class="pt-3 border-t border-brand-border flex items-center justify-between text-xs">
                                <span class="font-bold text-brand-brown">{{ number_format($similar->base_price) }} {{ $similar->currency }} / night</span>
                                <a href="{{ route('properties.show', $similar->slug) }}" class="text-brand-terracotta font-semibold hover:underline">View &rarr;</a>
                            </div>
                        </div>
                    </div>
                @endforeach
            </div>
        </div>
    @endif

</div>

@push('scripts')
<script>
    document.addEventListener('DOMContentLoaded', function() {
        if (typeof trackGaEvent === 'function') {
            trackGaEvent('view_item', {
                ecommerce: {
                    currency: '{{ $property->currency }}',
                    value: {{ $property->base_price }},
                    items: [{
                        item_id: '{{ $property->reference_number }}',
                        item_name: '{{ addslashes($property->title) }}',
                        item_category: '{{ $property->category?->name ?? "Villa" }}',
                        price: {{ $property->base_price }},
                        quantity: 1
                    }]
                }
            });
        }
    });

    function bookingWidget(config) {
        return {
            propertyId: config.propertyId,
            propertySlug: config.propertySlug,
            checkIn: config.initialCheckIn,
            checkOut: config.initialCheckOut,
            guests: config.initialGuests,
            quote: @json($initialQuote),
            errorMessage: null,
            isLoading: false,

            get checkoutUrl() {
                const params = new URLSearchParams({
                    check_in: this.checkIn,
                    check_out: this.checkOut,
                    guests: this.guests
                });
                return `/checkout/${this.propertySlug}?` + params.toString();
            },

            async recalculateQuote() {
                if (!this.checkIn || !this.checkOut || this.checkIn >= this.checkOut) {
                    this.errorMessage = 'Check-out date must be after check-in date.';
                    return;
                }

                this.isLoading = true;
                this.errorMessage = null;

                try {
                    const response = await fetch('/checkout/calculate', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                        },
                        body: JSON.stringify({
                            property_id: this.propertyId,
                            check_in: this.checkIn,
                            check_out: this.checkOut,
                            guests: this.guests
                        })
                    });

                    const data = await response.json();

                    if (response.ok && data.success) {
                        this.quote = data.quote;
                        this.errorMessage = null;
                    } else {
                        this.errorMessage = data.message || 'The selected dates are unavailable or violate stay restrictions.';
                    }
                } catch (err) {
                    this.errorMessage = 'Unable to calculate quote. Please try again.';
                } finally {
                    this.isLoading = false;
                }
            }
        };
    }
</script>
@endpush

@endsection
