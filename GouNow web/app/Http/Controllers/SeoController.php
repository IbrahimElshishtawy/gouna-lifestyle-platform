<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Experience;
use App\Models\Property;
use Illuminate\Http\Response;

class SeoController extends Controller
{
    /**
     * Generate dynamic XML Sitemap (Section 48).
     */
    public function sitemap(): Response
    {
        $properties = Property::published()
            ->select('id', 'slug', 'updated_at')
            ->orderBy('updated_at', 'desc')
            ->get();

        $experiences = Experience::published()
            ->select('id', 'slug', 'updated_at')
            ->orderBy('updated_at', 'desc')
            ->get();

        $events = Event::published()
            ->select('id', 'slug', 'updated_at')
            ->where('event_date', '>=', now()->toDateString())
            ->orderBy('event_date', 'asc')
            ->get();

        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">' . "\n";

        // Homepage
        $xml .= "  <url>\n";
        $xml .= "    <loc>" . url('/') . "</loc>\n";
        $xml .= "    <lastmod>" . now()->toDateString() . "</lastmod>\n";
        $xml .= "    <changefreq>daily</changefreq>\n";
        $xml .= "    <priority>1.0</priority>\n";
        $xml .= "    <xhtml:link rel=\"alternate\" hreflang=\"en\" href=\"" . url('/') . "\" />\n";
        $xml .= "    <xhtml:link rel=\"alternate\" hreflang=\"ar\" href=\"" . url('/locale/ar') . "\" />\n";
        $xml .= "  </url>\n";

        // Stays Catalog (Rent)
        $xml .= "  <url>\n";
        $xml .= "    <loc>" . url('/stays') . "</loc>\n";
        $xml .= "    <lastmod>" . now()->toDateString() . "</lastmod>\n";
        $xml .= "    <changefreq>daily</changefreq>\n";
        $xml .= "    <priority>0.9</priority>\n";
        $xml .= "  </url>\n";

        // Real Estate Catalog (Sale)
        $xml .= "  <url>\n";
        $xml .= "    <loc>" . url('/stays?listing_type=sale') . "</loc>\n";
        $xml .= "    <lastmod>" . now()->toDateString() . "</lastmod>\n";
        $xml .= "    <changefreq>daily</changefreq>\n";
        $xml .= "    <priority>0.9</priority>\n";
        $xml .= "  </url>\n";

        // Experiences Catalog
        $xml .= "  <url>\n";
        $xml .= "    <loc>" . url('/experiences') . "</loc>\n";
        $xml .= "    <lastmod>" . now()->toDateString() . "</lastmod>\n";
        $xml .= "    <changefreq>daily</changefreq>\n";
        $xml .= "    <priority>0.8</priority>\n";
        $xml .= "  </url>\n";

        // Published Properties
        foreach ($properties as $property) {
            $xml .= "  <url>\n";
            $xml .= "    <loc>" . route('properties.show', $property->slug) . "</loc>\n";
            $xml .= "    <lastmod>" . $property->updated_at->toDateString() . "</lastmod>\n";
            $xml .= "    <changefreq>weekly</changefreq>\n";
            $xml .= "    <priority>0.8</priority>\n";
            $xml .= "  </url>\n";
        }

        // Published Experiences
        foreach ($experiences as $experience) {
            $xml .= "  <url>\n";
            $xml .= "    <loc>" . route('experiences.show', $experience->slug) . "</loc>\n";
            $xml .= "    <lastmod>" . $experience->updated_at->toDateString() . "</lastmod>\n";
            $xml .= "    <changefreq>weekly</changefreq>\n";
            $xml .= "    <priority>0.7</priority>\n";
            $xml .= "  </url>\n";
        }

        $xml .= '</urlset>';

        return response($xml, 200)
            ->header('Content-Type', 'application/xml');
    }

    /**
     * Generate dynamic robots.txt (Section 48).
     */
    public function robots(): Response
    {
        $content = "User-agent: *\n";
        $content .= "Allow: /\n";
        $content .= "Disallow: /admin/\n";
        $content .= "Disallow: /checkout/mock/\n";
        $content .= "Disallow: /locale/\n\n";
        $content .= "Sitemap: " . url('/sitemap.xml') . "\n";

        return response($content, 200)
            ->header('Content-Type', 'text/plain');
    }
}
