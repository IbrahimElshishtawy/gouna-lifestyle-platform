<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" dir="{{ app()->getLocale() === 'ar' ? 'rtl' : 'ltr' }}" class="h-full bg-[#FAF8F5]">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Sign In - GOUNOW Management Platform</title>

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;1,400&family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet">

    <!-- Tailwind CSS with Custom Brand Palette -->
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

    <!-- Language Selector Header -->
    <div class="absolute top-6 {{ app()->getLocale() === 'ar' ? 'left-6' : 'right-6' }}">
        <div class="flex items-center bg-white/80 backdrop-blur-xs p-1 rounded-xl border border-brand-border text-xs font-bold shadow-xs">
            <a href="{{ route('locale.switch', 'en') }}" class="px-3 py-1 rounded-lg transition-all {{ app()->getLocale() === 'en' ? 'bg-brand-terracotta text-white' : 'text-brand-brown-muted hover:text-brand-brown' }}">
                English
            </a>
            <a href="{{ route('locale.switch', 'ar') }}" class="px-3 py-1 rounded-lg transition-all {{ app()->getLocale() === 'ar' ? 'bg-brand-terracotta text-white' : 'text-brand-brown-muted hover:text-brand-brown' }}">
                العربية
            </a>
        </div>
    </div>

    <div class="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <!-- Official Brand Logo -->
        <div class="inline-block p-1 bg-white rounded-2xl shadow-sm border border-brand-border mb-4">
            <img src="{{ asset('assets/images/logo.jpg') }}" alt="GOUNOW" class="h-16 w-16 rounded-xl object-cover">
        </div>
        <h2 class="text-2xl sm:text-3xl font-serif font-bold text-brand-brown tracking-tight">
            {{ app()->getLocale() === 'ar' ? 'منصة إدارة جونو' : 'GOUNOW Management' }}
        </h2>
        <p class="mt-2 text-xs sm:text-sm text-brand-brown-muted">
            {{ app()->getLocale() === 'ar' ? 'سجل دخولك للوصول إلى لوحة التحكم والإدارة' : 'Sign in to access your administrative workspace' }}
        </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-6 shadow-md shadow-brand-brown/5 rounded-3xl border border-brand-border sm:px-10">

            @if(session('status'))
                <div class="mb-5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
                    {{ session('status') }}
                </div>
            @endif

            @if($errors->any())
                <div class="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                    <ul class="space-y-1">
                        @foreach($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif

            <form class="space-y-5" action="{{ route('admin.login.submit') }}" method="POST">
                @csrf

                <!-- Email Input -->
                <div>
                    <label for="email" class="block text-xs font-bold text-brand-brown uppercase tracking-wider mb-1.5">
                        {{ app()->getLocale() === 'ar' ? 'البريد الإلكتروني' : 'Email Address' }}
                    </label>
                    <div class="relative">
                        <input id="email" 
                               name="email" 
                               type="email" 
                               autocomplete="email" 
                               required 
                               value="{{ old('email', 'admin@gounow.com') }}"
                               placeholder="admin@gounow.com"
                               class="w-full px-4 py-3 rounded-xl border border-brand-border bg-brand-sand-light/40 text-brand-brown placeholder-brand-brown-muted/50 focus:outline-none focus:ring-2 focus:ring-brand-terracotta focus:border-transparent text-sm transition-all">
                    </div>
                </div>

                <!-- Password Input -->
                <div>
                    <label for="password" class="block text-xs font-bold text-brand-brown uppercase tracking-wider mb-1.5">
                        {{ app()->getLocale() === 'ar' ? 'كلمة المرور' : 'Password' }}
                    </label>
                    <div class="relative">
                        <input id="password" 
                               name="password" 
                               type="password" 
                               autocomplete="current-password" 
                               required 
                               value="GouNow@2026!Secure"
                               placeholder="••••••••••••"
                               class="w-full px-4 py-3 rounded-xl border border-brand-border bg-brand-sand-light/40 text-brand-brown placeholder-brand-brown-muted/50 focus:outline-none focus:ring-2 focus:ring-brand-terracotta focus:border-transparent text-sm transition-all">
                    </div>
                </div>

                <!-- Remember Me & Forgot Password -->
                <div class="flex items-center justify-between text-xs">
                    <label class="flex items-center text-brand-brown cursor-pointer">
                        <input type="checkbox" name="remember" class="w-4 h-4 rounded text-brand-terracotta border-brand-border focus:ring-brand-terracotta">
                        <span class="{{ app()->getLocale() === 'ar' ? 'mr-2' : 'ml-2' }} font-medium">
                            {{ app()->getLocale() === 'ar' ? 'تذكرني على هذا الجهاز' : 'Remember me' }}
                        </span>
                    </label>

                    <span class="text-brand-brown-muted hover:text-brand-terracotta cursor-pointer transition-colors">
                        {{ app()->getLocale() === 'ar' ? 'مساعدة؟' : 'Need help?' }}
                    </span>
                </div>

                <!-- Submit Button -->
                <div>
                    <button type="submit" 
                            class="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-xs text-sm font-bold text-white bg-brand-terracotta hover:bg-brand-terracotta-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-terracotta transition-all">
                        {{ app()->getLocale() === 'ar' ? 'تسجيل الدخول للمنصة' : 'Sign in to Platform' }}
                    </button>
                </div>
            </form>

            <!-- Quick Demo Credentials Box -->
            <div class="mt-8 pt-6 border-t border-brand-border">
                <span class="block text-[11px] font-bold text-brand-brown uppercase tracking-wider text-center mb-3">
                    {{ app()->getLocale() === 'ar' ? 'بيانات الحسابات التجريبية' : 'Demo Test Accounts' }}
                </span>
                <div class="space-y-2 text-xs">
                    <div class="p-2.5 rounded-xl bg-brand-sand-light/70 border border-brand-border flex items-center justify-between">
                        <div>
                            <span class="font-bold text-brand-brown block">Super Admin</span>
                            <span class="text-[11px] text-brand-brown-muted">admin@gounow.com</span>
                        </div>
                        <span class="font-mono text-[10px] bg-white px-2 py-1 rounded border border-brand-border text-brand-terracotta font-semibold">GouNow@2026!Secure</span>
                    </div>

                    <div class="p-2.5 rounded-xl bg-brand-sand-light/70 border border-brand-border flex items-center justify-between">
                        <div>
                            <span class="font-bold text-brand-brown block">Property Manager</span>
                            <span class="text-[11px] text-brand-brown-muted">stays@gounow.com</span>
                        </div>
                        <span class="font-mono text-[10px] bg-white px-2 py-1 rounded border border-brand-border text-brand-terracotta font-semibold">GouNow@Stays2026</span>
                    </div>
                </div>
            </div>

        </div>

        <p class="mt-6 text-center text-xs text-brand-brown-muted">
            &copy; {{ date('Y') }} GOUNOW Lifestyle & Properties. El Gouna, Red Sea, Egypt.
        </p>
    </div>

</body>
</html>
