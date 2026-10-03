<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" dir="{{ app()->getLocale() === 'ar' ? 'rtl' : 'ltr' }}" class="h-full bg-[#FAF8F5]">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Set Up Two-Factor Authentication - GOUNOW Management Platform</title>

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
                            'brown-muted': '#786B63',
                            border: '#E8E2D9',
                        }
                    },
                    fontFamily: {
                        sans: ['"Plus Jakarta Sans"', ...(navigator.language.startsWith('ar') ? ['Tajawal'] : []), 'sans-serif'],
                        serif: ['"Playfair Display"', 'serif'],
                        arabic: ['Tajawal', 'sans-serif'],
                    }
                }
            }
        }
    </script>
</head>
<body class="h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[#FAF8F5] text-brand-brown">

    <div class="sm:mx-auto sm:w-full sm:max-w-lg text-center">
        <div class="inline-block p-1 bg-white rounded-2xl shadow-sm border border-brand-border mb-4">
            <img src="{{ asset('assets/images/logo.jpg') }}" alt="GOUNOW" class="h-16 w-16 rounded-xl object-cover">
        </div>
        <h2 class="text-2xl sm:text-3xl font-serif font-bold text-brand-brown tracking-tight">
            {{ app()->getLocale() === 'ar' ? 'إعداد التحقق بخطوتين الإلزامي' : 'Configure Two-Factor Authentication' }}
        </h2>
        <p class="mt-2 text-xs sm:text-sm text-brand-brown-muted max-w">
            {{ app()->getLocale() === 'ar' 
                ? 'لحماية المنصة وبيانات العملاء، تتطلب صلاحياتك تفعيل التحقق بخطوتين عبر تطبيق مثل Google Authenticator أو 1Password.' 
                : 'To protect platform security and financial data, your role requires two-factor authentication via Google Authenticator or compatible app.' }}
        </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        <div class="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-3xl border border-brand-border space-y-6">

            @if ($errors->any())
                <div class="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                    <ul class="list-disc list-inside space-y-1">
                        @foreach ($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif

            <!-- Step 1: Scan QR Code or Copy Secret -->
            <div class="p-5 rounded-2xl bg-brand-sand-light/60 border border-brand-border/80 text-center space-y-3">
                <span class="text-xs font-bold uppercase tracking-wider text-brand-terracotta block">
                    {{ app()->getLocale() === 'ar' ? 'الخطوة 1: مسح الرمز أو إدخال المفتاح يدوياً' : 'Step 1: Add Account to Authenticator App' }}
                </span>
                
                <div class="text-xs text-brand-brown-muted leading-relaxed">
                    {{ app()->getLocale() === 'ar' ? 'المفتاح السري للإدخال اليدوي:' : 'Secret key for manual entry:' }}
                </div>
                <div class="font-mono text-sm tracking-wider font-bold bg-white px-4 py-2 rounded-xl border border-brand-border select-all text-brand-brown inline-block">
                    {{ $secret }}
                </div>
                <div class="text-[11px] text-brand-brown-muted">
                    <a href="{{ $otpAuthUri }}" class="text-brand-terracotta hover:underline font-semibold">
                        {{ app()->getLocale() === 'ar' ? 'أو افتح مباشرة في التطبيق' : 'Or open directly in Authenticator' }} &rarr;
                    </a>
                </div>
            </div>

            <!-- Step 2: Confirm with 6-digit Code -->
            <form action="{{ route('admin.2fa.confirm') }}" method="POST" class="space-y-6">
                @csrf
                <div>
                    <label for="code" class="block text-xs font-bold uppercase tracking-wider text-brand-brown mb-2 text-center">
                        {{ app()->getLocale() === 'ar' ? 'الخطوة 2: أدخل الرمز المكون من 6 أرقام للتأكيد' : 'Step 2: Enter 6-Digit Code to Confirm' }}
                    </label>
                    <input id="code" name="code" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="6" autofocus required
                           placeholder="000000"
                           class="appearance-none block w-full px-4 py-3.5 text-center text-2xl tracking-[0.5em] font-mono border border-brand-border rounded-2xl placeholder-brand-brown-muted/40 focus:outline-none focus:ring-2 focus:ring-brand-terracotta focus:border-brand-terracotta transition-all bg-brand-sand-light/30">
                </div>

                <div>
                    <button type="submit"
                            class="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-2xl shadow-sm text-xs font-bold uppercase tracking-wider text-white bg-brand-terracotta hover:bg-brand-terracotta-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-terracotta transition-all">
                        {{ app()->getLocale() === 'ar' ? 'تفعيل 2FA والحصول على رموز الاسترداد' : 'Enable 2FA & Generate Recovery Codes' }}
                    </button>
                </div>
            </form>

        </div>
    </div>
</body>
</html>
