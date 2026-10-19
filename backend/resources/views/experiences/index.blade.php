<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}" dir="{{ app()->getLocale() === 'ar' ? 'rtl' : 'ltr' }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Curated Experiences &middot; GouNow</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&family=Playfair+Display:ital,wght@0,600;0,800;1,600&display=swap" rel="stylesheet">
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
        .container { max-width: 1200px; margin: 0 auto; }
        header { text-align: center; margin-bottom: 40px; }
        h1 { font-size: 2.4rem; color: var(--brand-gold); margin-bottom: 12px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
        .card {
            background: var(--surface-dark);
            border: 1px solid var(--border-glass);
            border-radius: 20px;
            padding: 24px;
        }
        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 9999px;
            background: rgba(179, 84, 56, 0.2);
            color: var(--brand-gold);
            font-size: 0.85rem;
            margin-bottom: 12px;
        }
        a { color: var(--brand-gold); text-decoration: none; font-weight: 600; }
    </style>
</head>
<body>
<div class="container">
    <header>
        <span class="badge">Unforgettable Adventures</span>
        <h1>Curated Experiences</h1>
        <p style="color: var(--text-muted)">Private yacht cruises, desert safaris, and kite surfing adventures across the Red Sea.</p>
    </header>

    <div class="grid">
        @forelse($experiences as $experience)
            <div class="card">
                <span class="badge">{{ $experience->category->name ?? 'Boat Trips' }}</span>
                <h2><a href="{{ route('experiences.show', $experience->slug) }}">{{ $experience->title }}</a></h2>
                <p style="color: var(--text-muted); margin: 8px 0 16px 0;">{{ $experience->short_description ?? '' }}</p>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: var(--brand-gold); font-weight: 700;">
                        EGP {{ number_format($experience->price_cents / 100) }}
                    </span>
                    <a href="{{ route('experiences.show', $experience->slug) }}">Explore &rarr;</a>
                </div>
            </div>
        @empty
            <div style="grid-column: 1 / -1; text-align: center; padding: 48px; color: var(--text-muted);">
                <p>No experiences currently listed.</p>
            </div>
        @endforelse
    </div>
</div>
</body>
</html>
