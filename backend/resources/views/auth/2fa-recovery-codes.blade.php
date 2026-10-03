<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" dir="{{ app()->getLocale() === 'ar' ? 'rtl' : 'ltr' }}" class="h-full bg-[#FAF8F5]">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Two-Factor Recovery Codes - GOUNOW Management Platform</title>

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

    <div class="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div class="inline-block p-1 bg-white rounded-2xl shadow-sm border border-brand-border mb-4">
            <img src="{{ asset('assets/images/logo.jpg') }}" alt="GOUNOW" class="h-16 w-16 rounded-xl object-cover">
        </div>
        <h2 class="text-2xl sm:text-3xl font-serif font-bold text-brand-brown tracking-tight">
            {{ app()->getLocale() === 'ar' ? 'رموز الاسترداد للطوارئ' : 'Emergency Recovery Codes' }}
        </h2>
        <p class="mt-2 text-xs sm:text-sm text-brand-brown-muted max-w">
            {{ app()->getLocale() === 'ar' 
                ? 'احتفظ بهذه الرموز في مكان آمن. كل رمز يمكن استخدامه مرة واحدة فقط في حال فقدان تطبيق المصادقة.' 
                : 'Store these recovery codes in a secure password manager. Each code is single-use and will not be displayed again.' }}
        </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div class="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-3xl border border-brand-border space-y-6">

            <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-3">
                <span class="text-base">⚠️</span>
                <span>
                    {{ app()->getLocale() === 'ar' 
                        ? 'تنبيه أمني: هذه الرموز لن تظهر لك مرة أخرى بعد مغادرة هذه الصفحة. يرجى نسخها أو تنزيلها الآن.' 
                        : 'Security Warning: These codes are shown only once and will not be displayed again after you leave this page.' }}
                </span>
            </div>

            <!-- Recovery Codes Grid -->
            <div class="grid grid-cols-2 gap-3 p-4 bg-brand-sand-light/60 rounded-2xl border border-brand-border/80 font-mono text-sm text-center font-bold text-brand-brown select-all">
                @foreach ($recoveryCodes as $code)
                    <div class="bg-white p-2.5 rounded-xl border border-brand-border shadow-xs">
                        {{ $code }}
                    </div>
                @endforeach
            </div>

            <div>
                <a href="{{ route('admin.dashboard') }}"
                   class="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-2xl shadow-sm text-xs font-bold uppercase tracking-wider text-white bg-brand-terracotta hover:bg-brand-terracotta-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-terracotta transition-all">
                    {{ app()->getLocale() === 'ar' ? 'حفظت الرموز، الانتقال إلى لوحة التحكم' : 'I have saved these codes &rarr; Continue to Dashboard' }}
                </a>
            </div>

        </div>
    </div>
</body>
</html>
