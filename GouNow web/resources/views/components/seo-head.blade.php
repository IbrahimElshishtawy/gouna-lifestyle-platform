@props([
    'title' => null,
    'description' => null,
    'image' => null,
    'canonical' => null,
    'type' => 'website',
    'property' => null,
    'experience' => null,
    'event' => null,
    'breadcrumbs' => []
])

@php
    $siteName = 'GouNow Lifestyle - El Gouna';
    $metaTitle = $title ? $title . ' | GouNow' : 'GouNow | Luxury Stays, Real Estate & Bespoke Experiences in El Gouna';
    $metaDescription = $description ?? 'Discover curated luxury vacation rentals, waterfront lagoon chalets, yacht charters, and desert adventures in El Gouna, Red Sea, Egypt.';
    $canonicalUrl = $canonical ?? url()->current();
    $metaImage = $image ?? asset('assets/images/logo.jpg');
    if (! str_starts_with($metaImage, 'http')) {
        $metaImage = url($metaImage);
    }

    // Build Schema.org JSON-LD Structured Data cleanly in PHP to avoid Blade @ directive collisions
    if ($property) {
        $mainSchema = [
            '@context' => 'https://schema.org',
            '@type' => 'LodgingBusiness',
            'name' => $property->title,
            'description' => Str::limit(strip_tags($property->short_description_en ?? $property->description_en ?? ''), 250),
            'url' => route('properties.show', $property->slug),
            'image' => $property->cover_url,
            'address' => [
                '@type' => 'PostalAddress',
                'streetAddress' => $property->address ?? 'El Gouna',
                'addressLocality' => 'El Gouna',
                'addressRegion' => 'Red Sea',
                'addressCountry' => 'EG',
            ],
            'numberOfRooms' => (int) $property->bedrooms,
            'priceRange' => $property->currency . ' ' . number_format($property->base_price),
            'checkinTime' => (string) $property->check_in_time,
            'checkoutTime' => (string) $property->check_out_time,
        ];
        if ($property->latitude && $property->longitude) {
            $mainSchema['geo'] = [
                '@type' => 'GeoCoordinates',
                'latitude' => (float) $property->latitude,
                'longitude' => (float) $property->longitude,
            ];
        }
    } elseif ($experience) {
        $mainSchema = [
            '@context' => 'https://schema.org',
            '@type' => 'TouristTrip',
            'name' => $experience->title,
            'description' => Str::limit(strip_tags($experience->short_description_en ?? $experience->description_en ?? ''), 250),
            'touristType' => 'Luxury Travelers',
            'offers' => [
                '@type' => 'Offer',
                'price' => (string) $experience->base_price,
                'priceCurrency' => $experience->currency,
            ],
            'provider' => [
                '@type' => 'Organization',
                'name' => 'GouNow Lifestyle',
                'url' => url('/'),
            ],
        ];
    } else {
        $mainSchema = [
            '@context' => 'https://schema.org',
            '@type' => 'Organization',
            'name' => 'GouNow Lifestyle',
            'url' => url('/'),
            'logo' => asset('assets/images/logo.jpg'),
            'description' => 'Bespoke vacation villa rentals, real estate sales, and yacht charters in El Gouna, Red Sea.',
            'address' => [
                '@type' => 'PostalAddress',
                'addressLocality' => 'El Gouna',
                'addressRegion' => 'Red Sea',
                'addressCountry' => 'EG',
            ],
            'contactPoint' => [
                '@type' => 'ContactPoint',
                'telephone' => '+201000000000',
                'contactType' => 'customer service',
                'areaServed' => 'EG',
                'availableLanguage' => ['English', 'Arabic'],
            ],
        ];
    }

    $breadcrumbSchema = null;
    if (!empty($breadcrumbs)) {
        $breadcrumbItems = [];
        foreach ($breadcrumbs as $index => $crumb) {
            $breadcrumbItems[] = [
                '@type' => 'ListItem',
                'position' => $index + 1,
                'name' => $crumb['name'],
                'item' => $crumb['url'],
            ];
        }
        $breadcrumbSchema = [
            '@context' => 'https://schema.org',
            '@type' => 'BreadcrumbList',
            'itemListElement' => $breadcrumbItems,
        ];
    }
@endphp

<!-- Primary SEO Meta Tags -->
<title>{{ $metaTitle }}</title>
<meta name="description" content="{{ Str::limit(strip_tags($metaDescription), 165) }}">
<link rel="canonical" href="{{ $canonicalUrl }}">
<meta name="robots" content="index, follow">

<!-- OpenGraph / Facebook / WhatsApp Preview -->
<meta property="og:type" content="{{ $type }}">
<meta property="og:site_name" content="{{ $siteName }}">
<meta property="og:title" content="{{ $metaTitle }}">
<meta property="og:description" content="{{ Str::limit(strip_tags($metaDescription), 165) }}">
<meta property="og:url" content="{{ $canonicalUrl }}">
<meta property="og:image" content="{{ $metaImage }}">
<meta property="og:locale" content="{{ app()->getLocale() === 'ar' ? 'ar_EG' : 'en_US' }}">

<!-- Twitter / X Cards -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{{ $metaTitle }}">
<meta name="twitter:description" content="{{ Str::limit(strip_tags($metaDescription), 165) }}">
<meta name="twitter:image" content="{{ $metaImage }}">

<!-- Schema.org JSON-LD Structured Data (Section 48) -->
<script type="application/ld+json">
{!! json_encode($mainSchema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) !!}
</script>

@if($breadcrumbSchema)
<script type="application/ld+json">
{!! json_encode($breadcrumbSchema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) !!}
</script>
@endif

<!-- Google Tag Manager / GA4 DataLayer Infrastructure (Section 37 & 134) -->
<script>
    window.dataLayer = window.dataLayer || [];
    function trackGaEvent(eventName, eventParams = {}) {
        const payload = Object.assign({ event: eventName, timestamp: new Date().toISOString() }, eventParams);
        window.dataLayer.push(payload);
        if (window.console && console.log) {
            console.log('[GA4 DataLayer]', eventName, payload);
        }
    }

    // Auto-listen to elements with data-ga-event attributes (WhatsApp, CTAs, Bookings)
    document.addEventListener('DOMContentLoaded', function() {
        document.querySelectorAll('[data-ga-event]').forEach(function(el) {
            el.addEventListener('click', function() {
                const eventName = el.getAttribute('data-ga-event');
                const item = el.getAttribute('data-ga-item') || '';
                const category = el.getAttribute('data-ga-category') || 'interaction';
                trackGaEvent(eventName, {
                    item_name: item,
                    category: category,
                    href: el.getAttribute('href') || ''
                });
            });
        });
    });
</script>
