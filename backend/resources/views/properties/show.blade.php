<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}" dir="{{ app()->getLocale() === 'ar' ? 'rtl' : 'ltr' }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $property->title }} &middot; GouNow</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&family=Playfair+Display:ital,wght@0,600;0,800;1,600&display=swap" rel="stylesheet">
    <script type="application/ld+json">
    {!! json_encode([
        '@context' => 'https://schema.org',
        '@type' => 'LodgingBusiness',
        'name' => $property->title,
        'url' => route('properties.show', $property->slug),
        'numberOfRooms' => (int) ($property->bedrooms ?? 1),
    ], JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) !!}
    </script>
    <script>
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: 'view_item', item_id: '{{ $property->id }}' });
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
        .container { max-width: 1000px; margin: 0 auto; }
        .hero {
            background: var(--surface-dark);
            border: 1px solid var(--border-glass);
            border-radius: 24px;
            padding: 40px;
            margin-bottom: 32px;
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
        .ref { font-family: monospace; color: var(--brand-terracotta); margin-bottom: 20px; }
        .specs { display: flex; gap: 24px; margin-bottom: 24px; color: var(--text-muted); font-size: 1.1rem; }
        .booking-box {
            background: var(--surface-card);
            border: 1px solid var(--border-glass);
            border-radius: 16px;
            padding: 24px;
            margin-top: 24px;
        }
        .btn {
            display: inline-block;
            padding: 12px 24px;
            border-radius: 12px;
            font-weight: 700;
            text-decoration: none;
            cursor: pointer;
            border: none;
            margin-right: 12px;
        }
        .btn-primary { background: var(--brand-terracotta); color: #fff; }
        .btn-outline { background: transparent; border: 1px solid var(--brand-gold); color: var(--brand-gold); }
    </style>
</head>
<body>
<div class="container">
    <div class="hero">
        <span class="badge">{{ ucfirst($property->listing_type ?? 'Stay') }}</span>
        <h1>{{ $property->title }}</h1>
        <div class="ref">{{ $property->reference_number }}</div>
        
        <div class="specs">
            <span>{{ $property->bedrooms }} Beds</span>
            <span>&bull;</span>
            <span>{{ $property->bathrooms }} Baths</span>
            <span>&bull;</span>
            <span>Max {{ $property->max_guests }} Guests</span>
        </div>

        <div style="font-size: 1.5rem; font-weight: bold; color: var(--brand-gold); margin-bottom: 24px;">
            @if($property->listing_type === 'sale')
                EGP {{ number_format(($property->sale_price_cents ?? $property->base_price_cents) / 100) }}
            @else
                EGP {{ number_format($property->base_price_cents / 100) }}
                <span style="font-size: 1rem; color: var(--text-muted);">/ night</span>
            @endif
        </div>

        <div class="booking-box">
            @if($property->listing_type === 'sale')
                <h3>Request Private Viewing</h3>
                <p style="color: var(--text-muted); margin-bottom: 16px;">Schedule an exclusive on-site property walkthrough with our Gouna real estate advisors.</p>
                <form action="{{ route('properties.inquire', $property->slug) }}" method="POST">
                    @csrf
                    <input type="hidden" name="type" value="property_sale">
                    <button type="submit" class="btn btn-primary">Request Private Viewing</button>
                </form>
            @else
                <h3>{{ __('Reservation Options') }}</h3>
                <p style="color: var(--text-muted); margin-bottom: 16px;">Instant Booking available or contact our VIP concierge team.</p>
                <div style="display: flex; gap: 16px; flex-wrap: wrap;">
                    <a href="#" class="btn btn-primary">Reserve Villa Now</a>
                    <span class="badge" style="margin: 0; align-self: center;">Instant Booking</span>
                    <a href="https://wa.me/201000000000" class="btn btn-outline">WhatsApp Concierge</a>
                </div>
            @endif
        </div>
    </div>
</div>
</body>
</html>
