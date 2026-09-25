<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}" dir="{{ app()->getLocale() === 'ar' ? 'rtl' : 'ltr' }}" class="h-full bg-[#FAF8F5]">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ app()->getLocale() === 'ar' ? 'تأكيد الحجز' : 'Booking Confirmation' }} - {{ $booking->reference }} | GouNow</title>

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
    <style>
        @media print {
            .no-print { display: none !important; }
            body { background-color: #fff !important; color: #000 !important; }
            .print-card { border: 1px solid #ccc !important; box-shadow: none !important; }
        }
    </style>
</head>
<body class="h-full text-brand-brown antialiased selection:bg-brand-terracotta/20 selection:text-brand-terracotta">

    <!-- Top Minimal Navigation -->
    <header class="h-20 bg-white border-b border-brand-border flex items-center justify-between px-6 lg:px-12 sticky top-0 z-30 shadow-xs no-print">
        <a href="/" class="flex items-center space-x-3 {{ app()->getLocale() === 'ar' ? 'space-x-reverse' : '' }}">
            <img src="{{ asset('assets/images/logo.jpg') }}" alt="GOUNOW" class="h-10 w-auto rounded-md object-cover shadow-sm">
            <div>
                <span class="block text-xs font-semibold uppercase tracking-widest text-brand-terracotta">El Gouna</span>
                <span class="block text-sm font-bold text-brand-brown tracking-wider">GOUNOW LIFESTYLE</span>
            </div>
        </a>
        <div class="flex items-center space-x-3 text-xs text-brand-brown-muted {{ app()->getLocale() === 'ar' ? 'space-x-reverse' : '' }}">
            <button onclick="window.print()" class="flex items-center space-x-1.5 px-4 py-2 bg-brand-sand-light hover:bg-brand-sand/50 text-brand-brown rounded-xl font-medium transition border border-brand-border cursor-pointer">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                <span>{{ app()->getLocale() === 'ar' ? 'طباعة القسيمة' : 'Print Voucher' }}</span>
            </button>
            <a href="/" class="px-4 py-2 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl font-medium transition">
                {{ app()->getLocale() === 'ar' ? 'الصفحة الرئيسية' : 'Back to Home' }}
            </a>
        </div>
    </header>

    <!-- Flash Alerts -->
    @if(session('success'))
        <div class="max-w-4xl mx-auto mt-6 px-4 no-print">
            <div class="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-semibold rounded-2xl flex items-center space-x-2">
                <span>✅ {{ session('success') }}</span>
            </div>
        </div>
    @endif
    @if(session('error'))
        <div class="max-w-4xl mx-auto mt-6 px-4 no-print">
            <div class="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold rounded-2xl flex items-center space-x-2">
                <span>⚠️ {{ session('error') }}</span>
            </div>
        </div>
    @endif

    <main class="max-w-4xl mx-auto py-10 px-4 sm:px-6">
        <!-- Main Confirmation Voucher Card -->
        <div class="bg-white rounded-3xl border border-brand-border shadow-xs overflow-hidden print-card">
            
            <!-- Hero Status Header -->
            <div class="bg-gradient-to-br from-brand-sand-light via-white to-brand-sand/30 p-8 sm:p-10 border-b border-brand-border">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                            {{ in_array($booking->status, ['confirmed', 'paid', 'completed']) ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800' }}">
                            <span class="w-2 h-2 rounded-full {{ in_array($booking->status, ['confirmed', 'paid', 'completed']) ? 'bg-emerald-600' : 'bg-amber-500' }}"></span>
                            {{ strtoupper(str_replace('_', ' ', $booking->status)) }}
                        </span>
                        <h1 class="font-serif text-2xl sm:text-3xl font-semibold text-brand-brown mt-3">
                            {{ in_array($booking->status, ['confirmed', 'paid', 'completed'])
                                ? (app()->getLocale() === 'ar' ? 'تم تأكيد حجزك بنجاح!' : 'Your reservation is confirmed!')
                                : (app()->getLocale() === 'ar' ? 'تم استلام طلب الحجز الخاص بك' : 'Your reservation is received') }}
                        </h1>
                        <p class="text-xs text-brand-brown-muted mt-1">
                            {{ app()->getLocale() === 'ar' ? 'رقم التأكيد المرجعي' : 'Booking Reference' }}:
                            <span class="font-mono font-bold text-brand-terracotta text-sm">{{ $booking->reference }}</span>
                        </p>
                    </div>

                    <div class="text-right sm:text-right">
                        <div class="text-xs text-brand-brown-muted">{{ app()->getLocale() === 'ar' ? 'حالة الدفع' : 'Payment Status' }}</div>
                        <span class="inline-block mt-1 font-semibold text-xs uppercase px-3 py-1 rounded-full border
                            {{ $booking->payment_status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                               ($booking->payment_status === 'partially_paid' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200') }}">
                            {{ strtoupper(str_replace('_', ' ', $booking->payment_status)) }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Booking Details Grid -->
            <div class="p-8 sm:p-10 space-y-8">
                
                <!-- Property / Bookable Information -->
                <div>
                    <h2 class="text-xs font-bold uppercase tracking-widest text-brand-brown-muted mb-4">
                        {{ app()->getLocale() === 'ar' ? 'تفاصيل الإقامة' : 'Stay Details' }}
                    </h2>
                    <div class="flex flex-col sm:flex-row gap-6 p-5 bg-brand-sand-light/60 rounded-2xl border border-brand-border">
                        <div class="flex-1 space-y-2">
                            <h3 class="font-serif text-lg font-bold text-brand-brown">
                                {{ $booking->bookable?->title ?? 'El Gouna Luxury Stay' }}
                            </h3>
                            <p class="text-xs text-brand-brown-muted flex items-center gap-1">
                                📍 {{ $booking->bookable?->location?->name ?? 'El Gouna, Red Sea, Egypt' }}
                            </p>
                            <div class="flex items-center gap-3 pt-2 text-xs text-brand-brown">
                                <span class="font-semibold">{{ $booking->bookable?->bedrooms ?? 2 }} {{ app()->getLocale() === 'ar' ? 'غرف' : 'Bedrooms' }}</span>
                                <span>•</span>
                                <span class="font-semibold">{{ $booking->guests }} {{ app()->getLocale() === 'ar' ? 'نزلاء' : 'Guests' }}</span>
                                <span>•</span>
                                <span class="font-semibold">{{ $booking->nights }} {{ app()->getLocale() === 'ar' ? 'ليالي' : 'Nights' }}</span>
                            </div>
                        </div>

                        <!-- Date Pill -->
                        <div class="flex sm:flex-col justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-brand-border sm:pl-6 pt-4 sm:pt-0 text-xs">
                            <div class="mb-2">
                                <span class="block text-brand-brown-muted font-medium">{{ app()->getLocale() === 'ar' ? 'تسجيل الوصول' : 'Check-In' }}</span>
                                <span class="font-bold text-brand-brown text-sm">{{ $booking->check_in->format('D, M d, Y') }}</span>
                                <span class="block text-[10px] text-brand-brown-muted">From {{ $booking->bookable?->check_in_time ?? '15:00' }}</span>
                            </div>
                            <div>
                                <span class="block text-brand-brown-muted font-medium">{{ app()->getLocale() === 'ar' ? 'تسجيل المغادرة' : 'Check-Out' }}</span>
                                <span class="font-bold text-brand-brown text-sm">{{ $booking->check_out->format('D, M d, Y') }}</span>
                                <span class="block text-[10px] text-brand-brown-muted">Until {{ $booking->bookable?->check_out_time ?? '11:00' }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Guest & Contact Details -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <h2 class="text-xs font-bold uppercase tracking-widest text-brand-brown-muted mb-3">
                            {{ app()->getLocale() === 'ar' ? 'بيانات النزيل الرئيسي' : 'Guest Information' }}
                        </h2>
                        <div class="p-4 rounded-xl bg-white border border-brand-border space-y-1 text-xs">
                            <p class="font-bold text-brand-brown text-sm">{{ $booking->customer?->full_name }}</p>
                            <p class="text-brand-brown-muted">✉️ {{ $booking->customer?->email }}</p>
                            <p class="text-brand-brown-muted">📞 {{ $booking->customer?->phone }}</p>
                            @if($booking->customer?->country_of_residence)
                                <p class="text-brand-brown-muted">🌍 {{ $booking->customer->country_of_residence }}</p>
                            @endif
                        </div>
                    </div>

                    <div>
                        <h2 class="text-xs font-bold uppercase tracking-widest text-brand-brown-muted mb-3">
                            {{ app()->getLocale() === 'ar' ? 'طريقة الدفع' : 'Payment Method' }}
                        </h2>
                        <div class="p-4 rounded-xl bg-white border border-brand-border space-y-1 text-xs">
                            <p class="font-bold text-brand-brown text-sm">
                                {{ $booking->paymentMethod?->name ?? 'Standard Gateway' }}
                            </p>
                            <p class="text-brand-brown-muted">
                                {{ app()->getLocale() === 'ar' ? 'نوع الدفع المختار' : 'Selected Plan' }}:
                                <span class="font-semibold text-brand-brown uppercase">{{ $booking->payment_type }}</span>
                            </p>
                            @if($booking->transactions->isNotEmpty())
                                <p class="text-brand-brown-muted">
                                    {{ app()->getLocale() === 'ar' ? 'رقم العملية' : 'Transaction Ref' }}:
                                    <span class="font-mono">{{ $booking->transactions->last()->transaction_id }}</span>
                                </p>
                            @endif
                        </div>
                    </div>
                </div>

                <!-- Financial Statement -->
                <div>
                    <h2 class="text-xs font-bold uppercase tracking-widest text-brand-brown-muted mb-3">
                        {{ app()->getLocale() === 'ar' ? 'تفاصيل الحساب والمبالغ' : 'Financial Statement' }}
                    </h2>
                    <div class="bg-white rounded-2xl border border-brand-border overflow-hidden">
                        <table class="w-full text-xs text-left">
                            <tbody class="divide-y divide-brand-border">
                                <tr class="bg-brand-sand-light/30">
                                    <td class="p-3 font-medium text-brand-brown">{{ app()->getLocale() === 'ar' ? 'إجمالي الليالي' : 'Nightly Subtotal' }} ({{ $booking->nights }} nights)</td>
                                    <td class="p-3 text-right font-semibold">{{ number_format($booking->subtotal_cents / 100, 2) }} {{ $booking->currency }}</td>
                                </tr>
                                @if($booking->cleaning_fee_cents > 0)
                                    <tr>
                                        <td class="p-3 text-brand-brown-muted">{{ app()->getLocale() === 'ar' ? 'رسوم التنظيف' : 'Cleaning Fee' }}</td>
                                        <td class="p-3 text-right">{{ number_format($booking->cleaning_fee_cents / 100, 2) }} {{ $booking->currency }}</td>
                                    </tr>
                                @endif
                                @if($booking->service_fee_cents > 0)
                                    <tr>
                                        <td class="p-3 text-brand-brown-muted">{{ app()->getLocale() === 'ar' ? 'رسوم الخدمة' : 'Service Fee' }}</td>
                                        <td class="p-3 text-right">{{ number_format($booking->service_fee_cents / 100, 2) }} {{ $booking->currency }}</td>
                                    </tr>
                                @endif
                                @if($booking->tax_cents > 0)
                                    <tr>
                                        <td class="p-3 text-brand-brown-muted">{{ app()->getLocale() === 'ar' ? 'الضرائب الحكومية' : 'Taxes' }}</td>
                                        <td class="p-3 text-right">{{ number_format($booking->tax_cents / 100, 2) }} {{ $booking->currency }}</td>
                                    </tr>
                                @endif
                                @if($booking->discount_cents > 0)
                                    <tr class="text-emerald-700 bg-emerald-50/40">
                                        <td class="p-3 font-medium">🏷️ {{ app()->getLocale() === 'ar' ? 'خصم الكود الترويجي' : 'Promotional Discount' }} ({{ $booking->promo_code }})</td>
                                        <td class="p-3 text-right font-semibold">-{{ number_format($booking->discount_cents / 100, 2) }} {{ $booking->currency }}</td>
                                    </tr>
                                @endif
                                <tr class="bg-brand-sand-light/60 font-bold text-sm">
                                    <td class="p-4 text-brand-brown">{{ app()->getLocale() === 'ar' ? 'الإجمالي الكلي للحجز' : 'Total Booking Amount' }}</td>
                                    <td class="p-4 text-right text-brand-terracotta text-base">{{ number_format($booking->total_cents / 100, 2) }} {{ $booking->currency }}</td>
                                </tr>
                            </tbody>
                        </table>

                        <!-- Payment Breakdown summary -->
                        <div class="p-4 bg-brand-sand-light/20 border-t border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            <div>
                                <span class="text-brand-brown-muted">{{ app()->getLocale() === 'ar' ? 'المبلغ المدفوع' : 'Amount Paid' }}:</span>
                                <span class="font-bold text-emerald-700 ml-1">{{ number_format($booking->amount_paid_cents / 100, 2) }} {{ $booking->currency }}</span>
                            </div>
                            @if($booking->amount_remaining_cents > 0)
                                <div>
                                    <span class="text-brand-brown-muted">{{ app()->getLocale() === 'ar' ? 'المتبقي المستحق' : 'Remaining Balance' }}:</span>
                                    <span class="font-bold text-rose-700 ml-1">{{ number_format($booking->amount_remaining_cents / 100, 2) }} {{ $booking->currency }}</span>
                                    @if($booking->balance_due_date)
                                        <span class="text-brand-brown-muted text-[10px] block sm:inline sm:ml-2">
                                            ({{ app()->getLocale() === 'ar' ? 'يستحق في' : 'Due by' }}: {{ $booking->balance_due_date->format('M d, Y') }})
                                        </span>
                                    @endif
                                </div>
                            @endif
                        </div>
                    </div>
                </div>

                <!-- Payment Instructions for Offline / Manual methods -->
                @if($booking->paymentMethod && ! $booking->paymentMethod->is_online)
                    <div class="p-5 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs space-y-2">
                        <div class="flex items-center gap-2 font-bold text-amber-900 text-sm">
                            <span>📌</span>
                            <span>{{ app()->getLocale() === 'ar' ? 'تعليمات إتمام الدفع' : 'Payment Instructions' }} ({{ $booking->paymentMethod->name }})</span>
                        </div>
                        <p class="text-amber-800 leading-relaxed">
                            {{ $booking->paymentMethod->instructions ?? ($booking->paymentMethod->code === 'cash' 
                                ? 'Please have the required amount ready upon check-in or visit our El Gouna office. Our concierge will verify your payment receipt.' 
                                : 'Please transfer the pending amount to our bank account quoting reference: ' . $booking->reference) }}
                        </p>
                    </div>
                @endif

                <!-- Contact & Support Footer -->
                <div class="pt-4 border-t border-brand-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-brown-muted">
                    <p>{{ app()->getLocale() === 'ar' ? 'تحتاج إلى مساعدة؟ فريق كونسيرج الجونة متاح دائماً على مدار الساعة.' : 'Need assistance? GouNow El Gouna Concierge is available 24/7.' }}</p>
                    <a href="{{ \App\Helpers\WhatsAppHelper::forBooking($booking) }}" 
                       target="_blank"
                       data-ga-event="contact_whatsapp"
                       data-ga-item="{{ $booking->reference }}"
                       data-ga-category="booking_support"
                       class="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition no-print">
                        <span>💬</span>
                        <span>{{ app()->getLocale() === 'ar' ? 'تواصل عبر واتساب' : 'WhatsApp Concierge' }}</span>
                    </a>
                </div>

            </div>
        </div>
    </main>

    <!-- Google Analytics 4 Ecommerce purchase Event (Section 37 & 134) -->
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
            trackGaEvent('purchase', {
                ecommerce: {
                    transaction_id: '{{ $booking->reference }}',
                    value: {{ $booking->total_cents / 100 }},
                    tax: {{ $booking->tax_cents / 100 }},
                    currency: '{{ $booking->currency }}',
                    items: [{
                        item_id: '{{ $booking->bookable?->reference_number ?? $booking->bookable_id }}',
                        item_name: '{{ addslashes($booking->bookable?->title ?? "Luxury Stay") }}',
                        item_category: '{{ $booking->bookable?->category?->name ?? "Villa" }}',
                        price: {{ $booking->subtotal_cents / 100 }},
                        quantity: {{ $booking->nights }}
                    }]
                }
            });
        });
    </script>

</body>
</html>
