<?php

namespace Tests\Feature;

use App\Helpers\WhatsAppHelper;
use App\Models\Experience;
use App\Models\Property;
use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SeoAndAnalyticsTest extends TestCase
{
    /**
     * Test XML Sitemap generation (Section 49).
     */
    public function test_xml_sitemap_returns_valid_xml_with_published_entities(): void
    {
        $property = Property::where('is_published', true)->first();
        $this->assertNotNull($property, 'At least one published property should exist.');

        $response = $this->get(route('seo.sitemap'));

        $response->assertStatus(200);
        $this->assertStringContainsString('xml', $response->headers->get('Content-Type'));
        $response->assertSee('<urlset', false);
        $response->assertSee(route('home'), false);
        $response->assertSee(route('properties.index'), false);
        $response->assertSee(route('experiences.index'), false);
        $response->assertSee(route('properties.show', $property->slug), false);
    }

    /**
     * Test dynamic robots.txt delivery (Section 49).
     */
    public function test_robots_txt_returns_proper_directives_and_sitemap_link(): void
    {
        $response = $this->get(route('seo.robots'));

        $response->assertStatus(200);
        $this->assertStringContainsString('text/plain', $response->headers->get('Content-Type'));
        $response->assertSee('User-agent: *', false);
        $response->assertSee('Disallow: /admin/', false);
        $response->assertSee('Disallow: /checkout/mock/', false);
        $response->assertSee('Sitemap: ' . route('seo.sitemap'), false);
    }

    /**
     * Test JSON-LD LodgingBusiness structured data on Property show (Section 48).
     */
    public function test_property_page_renders_lodging_business_json_ld_schema(): void
    {
        $property = Property::where('is_published', true)->firstOrFail();

        $response = $this->get(route('properties.show', $property->slug));

        $response->assertStatus(200);
        $response->assertSee('application/ld+json', false);
        $response->assertSee('"@type": "LodgingBusiness"', false);
        $response->assertSee('"numberOfRooms": ' . $property->bedrooms, false);
        $response->assertSee(route('properties.show', $property->slug), false);
        $response->assertSee('view_item', false);
    }

    /**
     * Test JSON-LD TouristTrip structured data on Experience show (Section 48).
     */
    public function test_experience_page_renders_tourist_trip_json_ld_schema(): void
    {
        $experience = Experience::where('is_published', true)->firstOrFail();

        $response = $this->get(route('experiences.show', $experience->slug));

        $response->assertStatus(200);
        $response->assertSee('application/ld+json', false);
        $response->assertSee('"@type": "TouristTrip"', false);
        $response->assertSee('view_item', false);
    }

    /**
     * Test Bilingual switching to Arabic activates RTL and Arabic UI (Section 46).
     */
    public function test_locale_switch_to_arabic_sets_session_and_renders_rtl(): void
    {
        $response = $this->get(route('locale.switch', 'ar'));

        $response->assertRedirect();
        $response->assertSessionHas('locale', 'ar');

        $page = $this->withSession(['locale' => 'ar'])->get(route('home'));
        $page->assertStatus(200);
        $page->assertSee('dir="rtl"', false);
        $page->assertSee('lang="ar"', false);
        $page->assertSee('Tajawal', false);
        $page->assertSee('الإقامات والفلل', false);
    }

    /**
     * Test Bilingual switching back to English restores LTR (Section 46).
     */
    public function test_locale_switch_to_english_restores_ltr(): void
    {
        $response = $this->get(route('locale.switch', 'en'));

        $response->assertRedirect();
        $response->assertSessionHas('locale', 'en');

        $page = $this->withSession(['locale' => 'en'])->get(route('home'));
        $page->assertStatus(200);
        $page->assertSee('dir="ltr"', false);
        $page->assertSee('lang="en"', false);
        $page->assertSee('Stays', false);
    }

    /**
     * Test WhatsApp Helper generates valid contextual URLs (Section 37).
     */
    public function test_whatsapp_helper_generates_contextual_links(): void
    {
        $property = Property::firstOrFail();
        $link = WhatsAppHelper::forProperty($property);

        $this->assertStringStartsWith('https://wa.me/', $link);
        $this->assertStringContainsString(urlencode($property->reference_number), $link);

        $experience = Experience::firstOrFail();
        $expLink = WhatsAppHelper::forExperience($experience);

        $this->assertStringStartsWith('https://wa.me/', $expLink);
        $this->assertStringContainsString('experience', strtolower($expLink));
    }

    /**
     * Test custom 404 page renders branded view (Section 48).
     */
    public function test_404_error_page_renders_with_brand_layout(): void
    {
        $response = $this->get('/non-existent-route-for-testing-404-page');

        $response->assertStatus(404);
        $response->assertSee('404', false);
        $response->assertSee('GouNow', false);
    }
}
