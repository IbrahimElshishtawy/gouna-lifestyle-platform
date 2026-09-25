@extends('layouts.app')

@section('title', $experience->title . ' - El Gouna Experiences | GouNow')
@section('meta_description', Str::limit(strip_tags($experience->short_description_en ?? $experience->description_en), 160))

@section('content')

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 lg:py-12">
    
    <!-- Breadcrumb & Header -->
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <nav class="flex items-center gap-2 text-xs text-brand-brown-muted mb-2">
                <a href="{{ route('home') }}" class="hover:text-brand-brown">Home</a>
                <span>/</span>
                <a href="{{ route('experiences.index') }}" class="hover:text-brand-brown">Experiences</a>
                <span>/</span>
                <span class="text-brand-brown font-medium">{{ $experience->category?->name ?? 'Adventure' }}</span>
            </nav>
            <h1 class="font-serif text-2xl sm:text-4xl font-semibold text-brand-brown">{{ $experience->title }}</h1>
            <div class="flex items-center gap-3 text-xs text-brand-brown-muted mt-2">
                <span>📍 {{ $experience->location?->name ?? 'El Gouna, Red Sea' }}</span>
                <span>•</span>
                <span>⏱️ {{ $experience->duration ?? 'Custom Duration' }}</span>
                @if($experience->max_capacity)
                    <span>•</span>
                    <span>Max {{ $experience->max_capacity }} Guests</span>
                @endif
            </div>
        </div>

        <div class="flex items-center gap-3 text-xs">
            <a href="{{ \App\Helpers\WhatsAppHelper::forExperience($experience) }}" 
               target="_blank"
               data-ga-event="contact_whatsapp"
               data-ga-item="{{ $experience->title }}"
               data-ga-category="experience_inquiry"
               class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition flex items-center gap-1.5 shadow-xs">
                <span>💬</span>
                <span>WhatsApp Desk</span>
            </a>
        </div>
    </div>

    <!-- Editorial Gallery -->
    <div class="mb-10 rounded-3xl overflow-hidden shadow-xs border border-brand-border h-[350px] sm:h-[460px] bg-brand-sand relative">
        <img src="{{ $experience->cover_url }}" 
             alt="{{ $experience->title }}" 
             class="w-full h-full object-cover">
        <div class="absolute bottom-6 left-6">
            <span class="px-4 py-1.5 bg-black/60 backdrop-blur-md text-white text-xs font-bold rounded-full uppercase tracking-wider">
                {{ $experience->category?->name ?? 'Bespoke Experience' }}
            </span>
        </div>
    </div>

    <!-- 2 Columns Grid: Details & Inquiry Widget -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        
        <!-- Left: Details -->
        <div class="lg:col-span-2 space-y-10">
            
            <div class="bg-white p-8 rounded-3xl border border-brand-border shadow-xs space-y-4">
                <h2 class="font-serif text-xl font-bold text-brand-brown">Experience Overview</h2>
                <div class="text-xs sm:text-sm text-brand-brown/90 leading-relaxed space-y-4 font-light">
                    <p class="font-medium text-brand-brown leading-relaxed">
                        {{ $experience->short_description_en }}
                    </p>
                    <div class="whitespace-pre-line text-brand-brown-muted">
                        {{ $experience->description_en }}
                    </div>
                </div>
            </div>

            <!-- Key Info Grid -->
            <div class="bg-white p-8 rounded-3xl border border-brand-border shadow-xs space-y-6">
                <h2 class="font-serif text-xl font-bold text-brand-brown">Important Details</h2>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                    @if($experience->meeting_point_en)
                        <div class="space-y-1.5 p-4 rounded-2xl bg-brand-sand-light/50 border border-brand-border">
                            <span class="font-bold text-brand-brown block">📍 Meeting & Departure Point:</span>
                            <p class="text-brand-brown-muted leading-relaxed">{{ $experience->meeting_point_en }}</p>
                        </div>
                    @endif

                    @if($experience->what_to_bring_en)
                        <div class="space-y-1.5 p-4 rounded-2xl bg-brand-sand-light/50 border border-brand-border">
                            <span class="font-bold text-brand-brown block">🎒 What to Bring:</span>
                            <p class="text-brand-brown-muted leading-relaxed">{{ $experience->what_to_bring_en }}</p>
                        </div>
                    @endif

                    @if($experience->cancellation_policy_en)
                        <div class="space-y-1.5 p-4 rounded-2xl bg-brand-sand-light/50 border border-brand-border sm:col-span-2">
                            <span class="font-bold text-brand-brown block">🛡️ Cancellation & Weather Policy:</span>
                            <p class="text-brand-brown-muted leading-relaxed">{{ $experience->cancellation_policy_en }}</p>
                        </div>
                    @endif
                </div>
            </div>

        </div>

        <!-- Right: Sticky Inquiry Form -->
        <div class="lg:col-span-1 lg:sticky lg:top-28">
            <div class="bg-white p-6 sm:p-7 rounded-3xl border border-brand-border shadow-lg space-y-5">
                
                <div>
                    <span class="text-xs text-brand-brown-muted block">Pricing</span>
                    <div class="flex items-baseline gap-1 mt-1">
                        <span class="text-2xl font-serif font-bold text-brand-brown">{{ number_format($experience->base_price) }}</span>
                        <span class="text-xs text-brand-brown-muted">{{ $experience->currency }}</span>
                        <span class="text-[11px] text-brand-terracotta font-medium ml-1 capitalize">/ {{ str_replace('_', ' ', $experience->pricing_model) }}</span>
                    </div>
                </div>

                <form method="POST" action="{{ route('experiences.inquire', $experience->slug) }}" class="space-y-3 pt-3 border-t border-brand-border text-xs">
                    @csrf
                    
                    <div>
                        <label class="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">Preferred Date</label>
                        <input type="date" name="requested_date" value="{{ now()->addDays(2)->toDateString() }}" required
                               class="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-2.5">
                    </div>

                    <div>
                        <label class="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">Guests / Party Size</label>
                        <input type="number" name="guests" min="1" max="{{ $experience->max_capacity ?? 20 }}" value="2" required
                               class="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-2.5">
                    </div>

                    <div>
                        <label class="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">Your Name</label>
                        <input type="text" name="name" required placeholder="Elena Rostova"
                               class="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-2.5">
                    </div>

                    <div>
                        <label class="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">Email</label>
                        <input type="email" name="email" required placeholder="elena@example.com"
                               class="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-2.5">
                    </div>

                    <div>
                        <label class="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">Phone / WhatsApp</label>
                        <input type="text" name="phone" required placeholder="+20 10..."
                               class="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-2.5">
                    </div>

                    <div>
                        <label class="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">Special Requests</label>
                        <textarea name="message" rows="2" placeholder="Sunset departure preferred, private catering..."
                                  class="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-2.5"></textarea>
                    </div>

                    <button type="submit" 
                            class="w-full py-3.5 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-sm hover:shadow-md cursor-pointer">
                        {{ app()->getLocale() === 'ar' ? 'طلب حجز التجربة' : 'Request Experience Booking' }}
                    </button>
                    
                    <p class="text-[10px] text-center text-brand-brown-muted">
                        No immediate payment required &bull; Concierge will confirm timing
                    </p>
                </form>

            </div>
        </div>

    </div>

    <!-- Related Experiences -->
    @if($relatedExperiences->isNotEmpty())
        <div class="mt-20 pt-16 border-t border-brand-border">
            <h2 class="font-serif text-2xl font-bold text-brand-brown mb-8">Other Curated Adventures</h2>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
                @foreach($relatedExperiences as $rel)
                    <div class="bg-white rounded-2xl overflow-hidden border border-brand-border shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col">
                        <div class="relative h-44 bg-brand-sand">
                            <img src="{{ $rel->cover_url }}" alt="{{ $rel->title }}" class="w-full h-full object-cover">
                        </div>
                        <div class="p-4 flex-1 flex flex-col justify-between space-y-2 text-xs">
                            <h3 class="font-serif text-sm font-bold text-brand-brown">
                                <a href="{{ route('experiences.show', $rel->slug) }}">{{ $rel->title }}</a>
                            </h3>
                            <div class="flex items-center justify-between pt-2 border-t border-brand-border">
                                <span class="font-bold text-brand-brown">{{ number_format($rel->base_price) }} {{ $rel->currency }}</span>
                                <a href="{{ route('experiences.show', $rel->slug) }}" class="text-brand-terracotta font-semibold">View &rarr;</a>
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
                    currency: '{{ $experience->currency }}',
                    value: {{ $experience->base_price }},
                    items: [{
                        item_id: '{{ $experience->slug }}',
                        item_name: '{{ addslashes($experience->title) }}',
                        item_category: '{{ $experience->category?->name ?? "Experience" }}',
                        price: {{ $experience->base_price }},
                        quantity: 1
                    }]
                }
            });
        }
    });
</script>
@endpush

@endsection
