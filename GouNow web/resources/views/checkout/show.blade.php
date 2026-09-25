<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}" dir="{{ app()->getLocale() === 'ar' ? 'rtl' : 'ltr' }}" class="h-full bg-[#FAF8F5]">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ app()->getLocale() === 'ar' ? 'إتمام الحجز والدفع' : 'Secure Checkout' }} - {{ $property->title }}</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;1,400&family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet">

    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        brand: {
                            terracotta: '#B85D3B',
                            'terracotta-dark': '#9A4A2B',
                            sand: '#E5DCD3',
                            'sand-light': '#F6F3EE',
                            'sand-card': '#FAF8F5',
                            brown: '#3D2E26',
                            'brown-dark': '#291F1A',
                            'brown-muted': '#786B63',
                            border: '#E8E2D9',
                        }
                    },
                    fontFamily: {
                        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
                        serif: ['"Playfair Display"', 'serif'],
                    }
                }
            }
        }
    </script>
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.8/dist/cdn.min.js"></script>
    <style>[x-cloak] { display: none !important; }</style>
</head>
<body class="h-full text-brand-brown antialiased selection:bg-brand-terracotta/20 selection:text-brand-terracotta">

    <!-- Top Minimal Navigation -->
    <header class="h-20 bg-white border-b border-brand-border flex items-center justify-between px-6 lg:px-12 sticky top-0 z-30 shadow-xs">
        <a href="/" class="flex items-center space-x-3 {{ app()->getLocale() === 'ar' ? 'space-x-reverse' : '' }}">
            <img src="{{ asset('assets/images/logo.jpg') }}" alt="GOUNOW" class="h-10 w-auto rounded-md object-cover shadow-sm">
            <div>
                <span class="block text-xs font-semibold uppercase tracking-widest text-brand-terracotta">El Gouna</span>
                <span class="block text-sm font-bold text-brand-brown tracking-wider">GOUNOW LIFESTYLE</span>
            </div>
        </a>
        <div class="flex items-center space-x-3 text-xs text-brand-brown-muted {{ app()->getLocale() === 'ar' ? 'space-x-reverse' : '' }}">
            <span class="flex items-center text-emerald-700 font-semibold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                🔒 256-Bit SSL Encrypted
            </span>
        </div>
    </header>

    <!-- Error / Flash Notices -->
    @if(session('error'))
        <div class="max-w-6xl mx-auto mt-6 px-4">
            <div class="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-2xl flex items-center space-x-2">
                <span>⚠️ {{ session('error') }}</span>
            </div>
        </div>
    @endif

    @if($errors->any())
        <div class="max-w-6xl mx-auto mt-6 px-4">
            <div class="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-2xl">
                <p class="font-bold mb-1">Please fix the following validation errors:</p>
                <ul class="list-disc list-inside space-y-0.5">
                    @foreach($errors->all() as $err)
                        <li>{{ $err }}</li>
                    @endforeach
                </ul>
            </div>
        </div>
    @endif

    <!-- Main Checkout Container -->
    <main class="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8"
          x-data="{
              paymentType: '{{ old('payment_type', $property->payment_requirement === 'deposit' ? 'deposit' : 'full') }}',
              paymentMethodId: '{{ old('payment_method_id', $paymentMethods->first()?->id) }}',
              totalCents: {{ $quote['total_cents'] }},
              depositCents: {{ $quote['deposit_cents'] }},
              get payableAmount() {
                  return this.paymentType === 'deposit' ? (this.depositCents / 100) : (this.totalCents / 100);
              }
          }">
        
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            <!-- LEFT COLUMN: Guest Info, Payment Options, & Policies (7 Cols) -->
            <div class="lg:col-span-7 space-y-6">

                <form method="POST" action="{{ route('checkout.process') }}" class="space-y-6" id="checkout-form">
                    @csrf
                    <input type="hidden" name="property_id" value="{{ $property->id }}">
                    <input type="hidden" name="check_in" value="{{ $checkIn->toDateString() }}">
                    <input type="hidden" name="check_out" value="{{ $checkOut->toDateString() }}">
                    <input type="hidden" name="guests" value="{{ $guests }}">
                    <input type="hidden" name="promo_code" value="{{ $promoCode }}">

                    <!-- 1. Guest Contact Details -->
                    <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs space-y-4">
                        <div class="flex items-center space-x-2 border-b border-brand-border pb-3 {{ app()->getLocale() === 'ar' ? 'space-x-reverse' : '' }}">
                            <span class="w-6 h-6 rounded-full bg-brand-terracotta text-white flex items-center justify-center font-bold text-xs">1</span>
                            <h2 class="font-bold text-brand-brown text-sm uppercase tracking-wider">
                                {{ app()->getLocale() === 'ar' ? 'بيانات الضيف الأساسية' : 'Primary Guest Details' }}
                            </h2>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-bold text-brand-brown mb-1">First Name *</label>
                                <input type="text" name="first_name" value="{{ old('first_name', auth()->user()?->name ? explode(' ', auth()->user()->name)[0] : '') }}" required
                                       class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2.5 px-3">
                            </div>

                            <div>
                                <label class="block text-xs font-bold text-brand-brown mb-1">Last Name *</label>
                                <input type="text" name="last_name" value="{{ old('last_name', auth()->user()?->name ? (explode(' ', auth()->user()->name)[1] ?? '') : '') }}" required
                                       class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2.5 px-3">
                            </div>

                            <div>
                                <label class="block text-xs font-bold text-brand-brown mb-1">Email Address *</label>
                                <input type="email" name="email" value="{{ old('email', auth()->user()?->email) }}" required
                                       placeholder="For booking confirmation & digital key"
                                       class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2.5 px-3">
                            </div>

                            <div>
                                <label class="block text-xs font-bold text-brand-brown mb-1">Phone / WhatsApp *</label>
                                <input type="text" name="phone" value="{{ old('phone', auth()->user()?->phone) }}" required
                                       placeholder="+20 100 000 0000"
                                       class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2.5 px-3">
                            </div>

                            <div class="sm:col-span-2">
                                <label class="block text-xs font-bold text-brand-brown mb-1">Country of Residence</label>
                                <input type="text" name="country" value="{{ old('country', 'Egypt') }}"
                                       class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2.5 px-3">
                            </div>

                            <div class="sm:col-span-2">
                                <label class="block text-xs font-bold text-brand-brown mb-1">Special Requests / Arrival Notes</label>
                                <textarea name="special_requests" rows="2" placeholder="e.g. Late arrival, airport transfer needed, baby crib"
                                          class="w-full text-xs rounded-xl border-brand-border py-2 px-3">{{ old('special_requests') }}</textarea>
                            </div>
                        </div>
                    </div>

                    <!-- 2. Section 20 Payment Option: Full vs Deposit -->
                    @if($property->payment_requirement === 'both')
                        <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs space-y-4">
                            <div class="flex items-center space-x-2 border-b border-brand-border pb-3 {{ app()->getLocale() === 'ar' ? 'space-x-reverse' : '' }}">
                                <span class="w-6 h-6 rounded-full bg-brand-terracotta text-white flex items-center justify-center font-bold text-xs">2</span>
                                <div>
                                    <h2 class="font-bold text-brand-brown text-sm uppercase tracking-wider">
                                        {{ app()->getLocale() === 'ar' ? 'خطة الدفع' : 'Payment Schedule' }}
                                    </h2>
                                    <p class="text-[11px] text-brand-brown-muted">Choose to pay in full today or secure with a refundable deposit</p>
                                </div>
                            </div>

                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <!-- Deposit Option -->
                                <label class="flex items-start p-4 rounded-xl border cursor-pointer transition-all"
                                       :class="paymentType === 'deposit' ? 'border-brand-terracotta bg-brand-sand-light/50 ring-1 ring-brand-terracotta' : 'border-brand-border bg-white hover:bg-brand-sand-light/20'">
                                    <input type="radio" name="payment_type" value="deposit" x-model="paymentType" class="mt-1 text-brand-terracotta focus:ring-brand-terracotta">
                                    <div class="ml-3 {{ app()->getLocale() === 'ar' ? 'mr-3 ml-0' : '' }}">
                                        <div class="flex items-center justify-between">
                                            <span class="text-xs font-bold text-brand-brown">Pay Deposit Now</span>
                                            <span class="text-xs font-bold text-brand-terracotta">{{ number_format($quote['deposit_cents'] / 100) }} EGP</span>
                                        </div>
                                        <p class="text-[11px] text-brand-brown-muted mt-1">
                                            Pay {{ $property->deposit_percentage ?? 50 }}% today. Remaining balance of {{ number_format($quote['amount_remaining_cents'] / 100) }} EGP due 14 days before arrival.
                                        </p>
                                    </div>
                                </label>

                                <!-- Full Payment Option -->
                                <label class="flex items-start p-4 rounded-xl border cursor-pointer transition-all"
                                       :class="paymentType === 'full' ? 'border-brand-terracotta bg-brand-sand-light/50 ring-1 ring-brand-terracotta' : 'border-brand-border bg-white hover:bg-brand-sand-light/20'">
                                    <input type="radio" name="payment_type" value="full" x-model="paymentType" class="mt-1 text-brand-terracotta focus:ring-brand-terracotta">
                                    <div class="ml-3 {{ app()->getLocale() === 'ar' ? 'mr-3 ml-0' : '' }}">
                                        <div class="flex items-center justify-between">
                                            <span class="text-xs font-bold text-brand-brown">Pay In Full</span>
                                            <span class="text-xs font-bold text-brand-terracotta">{{ number_format($quote['total_cents'] / 100) }} EGP</span>
                                        </div>
                                        <p class="text-[11px] text-brand-brown-muted mt-1">
                                            Complete 100% of payment today for hassle-free instant express check-in upon arrival.
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    @else
                        <input type="hidden" name="payment_type" value="{{ $property->payment_requirement }}">
                    @endif

                    <!-- 3. Payment Gateway Selector -->
                    <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs space-y-4">
                        <div class="flex items-center space-x-2 border-b border-brand-border pb-3 {{ app()->getLocale() === 'ar' ? 'space-x-reverse' : '' }}">
                            <span class="w-6 h-6 rounded-full bg-brand-terracotta text-white flex items-center justify-center font-bold text-xs">3</span>
                            <h2 class="font-bold text-brand-brown text-sm uppercase tracking-wider">
                                {{ app()->getLocale() === 'ar' ? 'طريقة الدفع' : 'Payment Method' }}
                            </h2>
                        </div>

                        <div class="space-y-3">
                            @foreach($paymentMethods as $pm)
                                <label class="flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all"
                                       :class="paymentMethodId == '{{ $pm->id }}' ? 'border-brand-terracotta bg-brand-sand-light/50 ring-1 ring-brand-terracotta' : 'border-brand-border bg-white hover:bg-brand-sand-light/20'">
                                    <div class="flex items-center space-x-3 {{ app()->getLocale() === 'ar' ? 'space-x-reverse' : '' }}">
                                        <input type="radio" name="payment_method_id" value="{{ $pm->id }}" x-model="paymentMethodId" class="text-brand-terracotta focus:ring-brand-terracotta">
                                        <div>
                                            <span class="block text-xs font-bold text-brand-brown">{{ $pm->name }}</span>
                                            <span class="block text-[11px] text-brand-brown-muted">{{ $pm->description }}</span>
                                        </div>
                                    </div>
                                    <span class="text-xs font-mono font-bold text-brand-brown-muted uppercase bg-brand-sand-light px-2 py-0.5 rounded">
                                        {{ $pm->code }}
                                    </span>
                                </label>
                            @endforeach
                        </div>
                    </div>

                    <!-- 4. Cancellation & House Rules -->
                    <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs text-xs text-brand-brown space-y-2">
                        <h3 class="font-bold text-sm text-brand-brown mb-1">
                            {{ ucfirst($property->cancellation_policy) }} Cancellation Policy
                        </h3>
                        <p class="text-brand-brown-muted leading-relaxed">
                            {{ $property->cancellation_policy_text_en ?? 'Full refund up to 14 days before check-in. Within 14 days, cancellation fees may apply as stated in the rental agreement.' }}
                        </p>
                        <p class="text-[11px] text-brand-brown-muted pt-2 border-t border-brand-border">
                            By selecting 'Complete Reservation', you agree to the Gounow Villa Rental Terms, House Rules, and Privacy Policy.
                        </p>
                    </div>

                    <!-- Submit Button -->
                    <button type="submit" 
                            class="w-full py-4 px-6 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2">
                        <span>Complete Reservation & Pay</span>
                        <span x-text="'(' + new Intl.NumberFormat().format(payableAmount) + ' EGP)'"></span>
                    </button>

                </form>

            </div>

            <!-- RIGHT COLUMN: Booking Financial Summary Card (5 Cols) -->
            <div class="lg:col-span-5 space-y-6 sticky top-28">

                <div class="bg-white rounded-2xl border border-brand-border shadow-xs overflow-hidden">
                    
                    <!-- Property Header in Summary -->
                    <div class="p-6 border-b border-brand-border flex items-center space-x-4 {{ app()->getLocale() === 'ar' ? 'space-x-reverse' : '' }}">
                        <div class="w-20 h-20 rounded-xl overflow-hidden bg-brand-sand shrink-0 border border-brand-border">
                            @if($property->featuredImage->first())
                                <img src="{{ $property->featuredImage->first()->thumb_url }}" alt="{{ $property->title }}" class="w-full h-full object-cover">
                            @elseif($property->images->first())
                                <img src="{{ $property->images->first()->thumb_url }}" alt="{{ $property->title }}" class="w-full h-full object-cover">
                            @else
                                <div class="w-full h-full flex items-center justify-center text-[10px] text-brand-brown-muted font-bold">VILLA</div>
                            @endif
                        </div>
                        <div>
                            <span class="text-[10px] font-bold text-brand-terracotta uppercase tracking-wider bg-brand-terracotta/10 px-2 py-0.5 rounded">
                                {{ $property->category?->name ?? 'Villa' }}
                            </span>
                            <h3 class="font-bold text-brand-brown text-sm mt-1 leading-snug">
                                {{ $property->title }}
                            </h3>
                            <p class="text-[11px] text-brand-brown-muted mt-0.5">📍 {{ $property->location?->name ?? 'El Gouna' }}</p>
                        </div>
                    </div>

                    <!-- Dates & Guests Box -->
                    <div class="p-6 border-b border-brand-border bg-brand-sand-light/30 grid grid-cols-3 gap-2 text-center text-xs">
                        <div class="border-r border-brand-border/80 {{ app()->getLocale() === 'ar' ? 'border-r-0 border-l' : '' }}">
                            <span class="block text-[10px] font-bold text-brand-brown-muted uppercase">Check-in</span>
                            <span class="font-bold text-brand-brown">{{ $checkIn->format('M d, Y') }}</span>
                        </div>
                        <div class="border-r border-brand-border/80 {{ app()->getLocale() === 'ar' ? 'border-r-0 border-l' : '' }}">
                            <span class="block text-[10px] font-bold text-brand-brown-muted uppercase">Check-out</span>
                            <span class="font-bold text-brand-brown">{{ $checkOut->format('M d, Y') }}</span>
                        </div>
                        <div>
                            <span class="block text-[10px] font-bold text-brand-brown-muted uppercase">Duration</span>
                            <span class="font-bold text-brand-brown">{{ $quote['nights'] }} Nights • {{ $guests }} Guests</span>
                        </div>
                    </div>

                    <!-- Price Breakdown Snapshot (Section 18) -->
                    <div class="p-6 space-y-3 text-xs text-brand-brown">
                        <div class="flex items-center justify-between">
                            <span>Base Stay ({{ $quote['nights'] }} Nights)</span>
                            <span class="font-semibold">{{ number_format($quote['subtotal_cents'] / 100) }} EGP</span>
                        </div>

                        <!-- Nightly Accordion -->
                        <div x-data="{ openNights: false }" class="border-y border-brand-border/60 py-2">
                            <button type="button" @click="openNights = !openNights" class="w-full flex items-center justify-between text-[11px] text-brand-terracotta font-semibold hover:underline">
                                <span>Nightly Rate Details</span>
                                <span x-text="openNights ? '▲ Hide' : '▼ View'"></span>
                            </button>
                            <div x-show="openNights" x-cloak class="mt-2 space-y-1.5 pl-2 text-[11px] text-brand-brown-muted">
                                @foreach($quote['nightly_prices'] as $night)
                                    <div class="flex items-center justify-between">
                                        <span>{{ \Carbon\Carbon::parse($night['night_date'])->format('D, M d') }} ({{ $night['season_name'] ?? 'Standard' }})</span>
                                        <span class="font-medium text-brand-brown">{{ number_format($night['price_cents'] / 100) }} EGP</span>
                                    </div>
                                @endforeach
                            </div>
                        </div>

                        @if($quote['cleaning_fee_cents'] > 0)
                            <div class="flex items-center justify-between">
                                <span>Departure Cleaning Fee</span>
                                <span class="font-semibold">{{ number_format($quote['cleaning_fee_cents'] / 100) }} EGP</span>
                            </div>
                        @endif

                        @if($quote['service_fee_cents'] > 0)
                            <div class="flex items-center justify-between">
                                <span>Concierge & Guest Service Fee</span>
                                <span class="font-semibold">{{ number_format($quote['service_fee_cents'] / 100) }} EGP</span>
                            </div>
                        @endif

                        @if($quote['discount_cents'] > 0)
                            <div class="flex items-center justify-between text-emerald-700 font-semibold">
                                <span>Promo Discount ({{ $quote['promo_code'] }})</span>
                                <span>-{{ number_format($quote['discount_cents'] / 100) }} EGP</span>
                            </div>
                        @endif

                        @if($quote['tax_cents'] > 0)
                            <div class="flex items-center justify-between text-brand-brown-muted">
                                <span>Applicable Taxes ({{ $quote['tax_percentage'] }}%)</span>
                                <span>{{ number_format($quote['tax_cents'] / 100) }} EGP</span>
                            </div>
                        @endif

                        <div class="border-t border-brand-border pt-3 flex items-center justify-between text-sm font-bold">
                            <span>Total Stay Amount</span>
                            <span class="text-brand-terracotta text-base">{{ number_format($quote['total_cents'] / 100) }} EGP</span>
                        </div>

                        <!-- Due Today Highlight -->
                        <div class="bg-brand-sand-light p-3.5 rounded-xl border border-brand-border mt-3">
                            <div class="flex items-center justify-between font-bold text-xs">
                                <span>Amount Due Today</span>
                                <span class="text-brand-terracotta text-sm" x-text="new Intl.NumberFormat().format(payableAmount) + ' EGP'"></span>
                            </div>
                            <template x-if="paymentType === 'deposit'">
                                <p class="text-[10px] text-brand-brown-muted mt-1">
                                    Remaining {{ number_format($quote['amount_remaining_cents'] / 100) }} EGP payable prior to arrival.
                                </p>
                            </template>
                        </div>

                    </div>

                    <!-- Promo Code Box -->
                    <div class="p-6 bg-brand-sand-light/40 border-t border-brand-border">
                        <form method="GET" action="{{ route('checkout.show', $property) }}" class="flex gap-2">
                            <input type="hidden" name="check_in" value="{{ $checkIn->toDateString() }}">
                            <input type="hidden" name="check_out" value="{{ $checkOut->toDateString() }}">
                            <input type="hidden" name="guests" value="{{ $guests }}">
                            <input type="text" name="promo_code" value="{{ $promoCode }}" placeholder="Promo / Voucher Code"
                                   class="flex-1 text-xs rounded-xl border-brand-border py-2 px-3 uppercase font-mono">
                            <button type="submit" class="py-2 px-4 bg-brand-brown text-white text-xs font-semibold rounded-xl hover:bg-brand-brown-dark transition-colors">
                                Apply
                            </button>
                        </form>
                    </div>

                </div>

            </div>

        </div>

    </main>

    <!-- Footer -->
    <footer class="h-16 bg-white border-t border-brand-border px-6 flex items-center justify-between text-xs text-brand-brown-muted mt-12">
        <span>&copy; {{ date('Y') }} GOUNOW Luxury Stays & Lifestyle. El Gouna, Red Sea.</span>
        <span>Secure Payment Infrastructure Section 22</span>
    </footer>

    <!-- Google Analytics 4 Ecommerce begin_checkout Event -->
    <script>
        window.dataLayer = window.dataLayer || [];
        function trackGaEvent(eventName, eventParams = {}) {
            const payload = Object.assign({ event: eventName, timestamp: new Date().toISOString() }, eventParams);
            window.dataLayer.push(payload);
            if (window.console && console.log) {
                console.log('[GA4 DataLayer]', eventName, payload);
            }
        }

        document.addEventListener('DOMContentLoaded', function() {
            trackGaEvent('begin_checkout', {
                ecommerce: {
                    currency: '{{ $property->currency }}',
                    value: {{ $quote['total_cents'] / 100 }},
                    items: [{
                        item_id: '{{ $property->reference_number }}',
                        item_name: '{{ addslashes($property->title) }}',
                        item_category: '{{ $property->category?->name ?? "Villa" }}',
                        price: {{ ($quote['subtotal_cents'] / max(1, $quote['nights'])) / 100 }},
                        quantity: {{ $quote['nights'] }}
                    }]
                }
            });
        });
    </script>

</body>
</html>
