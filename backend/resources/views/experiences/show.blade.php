<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}" dir="{{ app()->getLocale() === 'ar' ? 'rtl' : 'ltr' }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $experience->title }} &middot; GouNow</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&family=Playfair+Display:ital,wght@0,600;0,800;1,600&display=swap" rel="stylesheet">
    <script type="application/ld+json">
    {!! json_encode([
        '@context' => 'https://schema.org',
        '@type' => 'TouristTrip',
        'name' => $experience->title,
        'url' => route('experiences.show', $experience->slug),
    ], JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) !!}
    </script>
    <script>
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: 'view_item', item_id: '{{ $experience->id }}' });
    </script>
    <style>
        :root {
            --bg-dark: #140E0C;
            --surface-dark: #1E1715;
            --surface-card: #281F1C;
            --brand-terracotta: #B35438;
            --brand-gold: #E5C39C;
            --text-light: #FAF8F5;
            --text-muted: #D1C4B9;
            --border-glass: rgba(255, 255, 255, 0.12);
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Tajawal', sans-serif;
            background-color: var(--bg-dark);
            color: var(--text-light);
            min-height: 100vh;
            padding: 32px 20px;
        }
        .container { max-width: 900px; margin: 0 auto; }
        .hero {
            background: var(--surface-dark);
            border: 1px solid var(--border-glass);
            border-radius: 24px;
            padding: 40px;
        }
        .badge {
            display: inline-block;
            padding: 6px 14px;
            border-radius: 9999px;
            background: rgba(179, 84, 56, 0.2);
            color: var(--brand-gold);
            font-size: 0.9rem;
            margin-bottom: 16px;
        }
        h1 { font-size: 2.5rem; color: var(--brand-gold); margin-bottom: 12px; }
        .duration { color: var(--text-muted); font-size: 1.1rem; margin-bottom: 24px; }
        .btn {
            display: inline-block;
            padding: 12px 24px;
            border-radius: 12px;
            font-weight: 700;
            background: var(--brand-terracotta);
            color: #fff;
            text-decoration: none;
            cursor: pointer;
            border: none;
        }
    </style>
</head>
<body>
<div class="container">
    <div class="hero">
        <span class="badge">{{ $experience->category->name ?? 'Experience' }}</span>
        <h1>{{ $experience->title }}</h1>
        <div class="duration">{{ $experience->duration ?? ($experience->duration_hours ? $experience->duration_hours.' Hours' : '8 Hours') }} &bull; {{ $experience->location->name ?? 'El Gouna' }}</div>
        
        <p style="color: var(--text-muted); line-height: 1.6; margin-bottom: 24px;">{{ $experience->description ?? '' }}</p>

        <div style="font-size: 1.5rem; font-weight: bold; color: var(--brand-gold); margin-bottom: 24px;">
            EGP {{ number_format($experience->price_cents / 100) }}
        </div>

        <div style="background: var(--surface-card); padding: 24px; border-radius: 16px; border: 1px solid var(--border-glass);">
            <h3 style="margin-bottom: 12px;">Request Experience Booking</h3>
            <p style="color: var(--text-muted); margin-bottom: 16px;">Reserve this curated experience directly with our concierge team.</p>
            <form action="{{ route('experiences.inquire', $experience->slug) }}" method="POST">
                @csrf
                <button type="submit" class="btn">Request Experience Booking</button>
            </form>
        </div>
    </div>
</div>
</body>
</html>
