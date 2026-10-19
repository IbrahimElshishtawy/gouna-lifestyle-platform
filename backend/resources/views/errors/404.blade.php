<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}" dir="{{ app()->getLocale() === 'ar' ? 'rtl' : 'ltr' }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>404 Page Not Found &middot; GouNow</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-dark: #140E0C;
            --brand-terracotta: #B35438;
            --brand-gold: #E5C39C;
            --text-light: #FAF8F5;
            --text-muted: #D1C4B9;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Tajawal', sans-serif;
            background-color: var(--bg-dark);
            color: var(--text-light);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 24px;
        }
        .container { max-width: 500px; }
        h1 { font-size: 5rem; color: var(--brand-terracotta); margin-bottom: 8px; }
        h2 { font-size: 1.8rem; color: var(--brand-gold); margin-bottom: 16px; }
        p { color: var(--text-muted); margin-bottom: 24px; line-height: 1.6; }
        a {
            display: inline-block;
            padding: 12px 28px;
            background: var(--brand-terracotta);
            color: #fff;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 700;
        }
    </style>
</head>
<body>
<div class="container">
    <h1>404</h1>
    <h2>{{ __('Page Not Found') }}</h2>
    <p>{{ __('The page you are looking for does not exist on GouNow platform.') }}</p>
    <a href="{{ route('home') }}">{{ __('Return to GouNow Home') }}</a>
</div>
</body>
</html>
