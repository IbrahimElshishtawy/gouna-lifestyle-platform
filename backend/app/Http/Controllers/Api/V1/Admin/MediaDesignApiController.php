<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Property;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MediaDesignApiController extends Controller
{
    private const SETTING_KEY = 'media_design_homepage';

    /**
     * Default fallback configuration for Homepage Media Design
     */
    public static function getDefaultConfig(): array
    {
        return [
            'hero' => [
                'badge_en' => 'Curated Luxury Living · Red Sea, Egypt',
                'badge_ar' => 'ضيافة فاخرة مختارة بعناية · البحر الأحمر، مصر',
                'title_line1_en' => 'Live The Unrivaled',
                'title_line1_ar' => 'عيشة الرفاهية والجمال',
                'title_line2_en' => 'El Gouna Lifestyle',
                'title_line2_ar' => 'في الجونة',
                'subtitle_en' => 'Exclusive private lagoon villas, luxury yacht charters to Tawila Island, and bespoke concierge arrangements crafted for distinguished travelers.',
                'subtitle_ar' => 'أفخم الفلل والقصور الشاطئية الخاصة، رحلات يخوت حصرية لجزيرة طوّيلة، وخدمات كونسيرج مفصلة لكبار الشخصيات.',
                'cta1_text_en' => 'Explore Curated Stays',
                'cta1_text_ar' => 'استكشف الفلل والإقامات',
                'cta1_link' => '#stays',
                'cta2_text_en' => 'Private Charters & Diving',
                'cta2_text_ar' => 'اليخوت والأنشطة البحرية',
                'cta2_link' => '#experiences',
                'background_image' => '/assets/images/hero-villa-dusk.jpg',
                'video_url' => '',
            ],
            'sections' => [
                'hero' => true,
                'pillars' => true,
                'vacation_rentals' => true,
                'experiences' => true,
                'diving' => true,
                'sales' => true,
                'testimonials' => true,
                'events' => true,
                'concierge' => true,
                'faq' => true,
            ],
            'featured_property_ids' => [],
            'announcement' => [
                'enabled' => false,
                'text_en' => 'Welcome to GouNow — Gouna Film Festival 2026 VIP Booking Now Open',
                'text_ar' => 'مرحباً بكم في جو ناو — فتح باب الحجوزات الخاصة بمهرجان الجونة السينمائي 2026',
                'link' => '/events',
            ],
        ];
    }

    /**
     * Get the current Homepage Media Design settings.
     */
    public function index(Request $request): JsonResponse
    {
        $setting = Setting::where('key', self::SETTING_KEY)->first();
        $config = $setting && !empty($setting->value)
            ? json_decode($setting->value, true)
            : self::getDefaultConfig();

        // Also return available properties with their featured status so admin can easily check/uncheck them
        $properties = Property::select('id', 'reference_number', 'title_en', 'title_ar', 'listing_type', 'is_published', 'is_featured')
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'data' => [
                'config' => array_replace_recursive(self::getDefaultConfig(), (array) $config),
                'available_properties' => $properties,
            ],
            'meta' => [
                'request_id' => $request->attributes->get('request_id'),
                'timestamp' => now()->toIso8601String(),
            ],
        ]);
    }

    /**
     * Update the Homepage Media Design configuration.
     */
    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'hero' => ['nullable', 'array'],
            'sections' => ['nullable', 'array'],
            'featured_property_ids' => ['nullable', 'array'],
            'featured_property_ids.*' => ['integer'],
            'announcement' => ['nullable', 'array'],
        ]);

        $currentSetting = Setting::where('key', self::SETTING_KEY)->first();
        $currentConfig = $currentSetting && !empty($currentSetting->value)
            ? json_decode($currentSetting->value, true)
            : self::getDefaultConfig();

        $mergedConfig = array_replace_recursive($currentConfig, $validated);

        Setting::updateOrCreate(
            ['key' => self::SETTING_KEY],
            ['value' => json_encode($mergedConfig, JSON_UNESCAPED_UNICODE)]
        );

        // Update is_featured on properties if provided
        if (isset($validated['featured_property_ids'])) {
            $featuredIds = $validated['featured_property_ids'];
            Property::whereIn('id', $featuredIds)->update(['is_featured' => true]);
            Property::whereNotIn('id', $featuredIds)->update(['is_featured' => false]);
        }

        ActivityLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'media_design_updated',
            'entity_type' => 'Setting',
            'description' => 'Homepage media design and showcase layout updated.',
            'new_values' => $validated,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم حفظ إعدادات ميديا ديزاين وتحديث الصفحة الرئيسية بنجاح.',
            'data' => $mergedConfig,
        ]);
    }

    /**
     * Public endpoint to fetch media design for the public homepage.
     */
    public static function getPublicConfig(): array
    {
        $setting = Setting::where('key', self::SETTING_KEY)->first();
        if ($setting && !empty($setting->value)) {
            $decoded = json_decode($setting->value, true);
            if (is_array($decoded)) {
                return array_replace_recursive(self::getDefaultConfig(), $decoded);
            }
        }

        return self::getDefaultConfig();
    }
}
