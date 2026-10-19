<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}" dir="{{ app()->getLocale() === 'ar' ? 'rtl' : 'ltr' }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Stays & Properties &middot; GouNow</title>
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
            transition: transform 0.2s ease;
        }
        .card:hover { transform: translateY(-4px); }
        .card h2 { font-size: 1.3rem; margin-bottom: 8px; color: var(--text-light); }
        .meta { color: var(--text-muted); font-size: 0.95rem; margin-bottom: 16px; }
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
        <span class="badge">Exclusive Portfolio</span>
        <h1>{{ __('Stays & Signature Properties') }}</h1>
        <p style="color: var(--text-muted)">Discover luxury vacation rentals and premier real estate in El Gouna.</p>
    </header>

    <div class="grid">
        @forelse($properties as $property)
            <div class="card">
                <span class="badge">{{ ucfirst($property->listing_type ?? 'Stay') }}</span>
                <h2><a href="{{ route('properties.show', $property->slug) }}">{{ $property->title }}</a></h2>
                <div class="meta">
                    <span>{{ $property->location->name ?? 'El Gouna' }}</span> &bull;
                    <span>{{ $property->bedrooms }} Beds</span> &bull;
                    <span>{{ $property->bathrooms }} Baths</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 16px;">
                    <span style="font-size: 1.15rem; font-weight: bold; color: var(--brand-gold);">
                        @if($property->listing_type === 'sale')
                            EGP {{ number_format($property->base_price_cents / 100) }}
                        @else
                            EGP {{ number_format($property->base_price_cents / 100) }} / night
                        @endif
                    </span>
                    <a href="{{ route('properties.show', $property->slug) }}">View Details &rarr;</a>
                </div>
            </div>
        @empty
            <div style="grid-column: 1 / -1; text-align: center; padding: 48px; color: var(--text-muted);">
                <p>No properties found matching your criteria.</p>
            </div>
        @endforelse
    </div>
</div>
</body>
</html>
