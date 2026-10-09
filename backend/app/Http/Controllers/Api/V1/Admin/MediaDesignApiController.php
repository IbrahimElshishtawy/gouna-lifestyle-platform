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
                'media_mode' => 'scenes',
                'scenes' => [
                    [
                        'id' => 'scene-1',
                        'name_ar' => 'غروب الفلل الذهبي',
                        'name_en' => 'Lagoon Sunset',
                        'media_type' => 'image',
                        'image_url' => '/assets/images/hero-villa-dusk.jpg',
                        'video_url' => '',
                        'title_line1_ar' => 'عيشة الرفاهية والجمال',
                        'title_line2_ar' => 'في الجونة',
                        'title_line1_en' => 'Live The Unrivaled',
                        'title_line2_en' => 'El Gouna Lifestyle',
                        'subtitle_ar' => 'أفخم الفلل والقصور الشاطئية الخاصة، رحلات يخوت حصرية لجزيرة طوّيلة، وخدمات كونسيرج مفصلة.',
                        'subtitle_en' => 'Exclusive private lagoon villas, luxury yacht charters to Tawila Island, and bespoke concierge arrangements.',
                    ],
                    [
                        'id' => 'scene-2',
                        'name_ar' => 'مياه الفنار الفيروزية',
                        'name_en' => 'Turquoise Lagoon',
                        'media_type' => 'image',
                        'image_url' => '/assets/images/fanadir-villa.jpg',
                        'video_url' => '',
                        'title_line1_ar' => 'إطلالات لا متناهية',
                        'title_line2_ar' => 'على شواطئ البحر الأحمر',
                        'title_line1_en' => 'Endless Horizons',
                        'title_line2_en' => 'On The Red Sea',
                        'subtitle_ar' => 'مياه فيروزية هادئة وتجارب إقامة مصممة لتناسب أدق تفاصيل راحتك وخصوصيتك.',
                        'subtitle_en' => 'Calm turquoise waters and curated stays crafted for ultimate peace and privacy.',
                    ],
                    [
                        'id' => 'scene-3',
                        'name_ar' => 'يخوت مارينا الجونة',
                        'name_en' => 'Marina Yacht Life',
                        'media_type' => 'image',
                        'image_url' => 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=2000&q=85',
                        'video_url' => '',
                        'title_line1_ar' => 'إبحار خاص واستكشاف',
                        'title_line2_ar' => 'إلى جزر الجونة البكر',
                        'title_line1_en' => 'Private Sailing',
                        'title_line2_en' => 'To Untouched Islands',
                        'subtitle_ar' => 'أساطيل يخوت خاصة وعشاء فاخر على متن اليخت وقت الغروب في مياه البحر الأحمر.',
                        'subtitle_en' => 'Private luxury yacht charters and bespoke sunset dining at sea in the Red Sea.',
                    ],
                ],
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

        // Explicitly set scenes if provided in hero payload so deletions/reordering are not merged
        if (isset($validated['hero']['scenes'])) {
            $mergedConfig['hero']['scenes'] = $validated['hero']['scenes'];
        }

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
     * Upload an image or video asset for Media Design.
     */
    public function uploadMedia(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'max:102400', 'mimes:jpeg,jpg,png,webp,gif,mp4,webm,mov,ogg,quicktime'],
        ]);

        $file = $request->file('file');
        $extension = $file->getClientOriginalExtension();
        $fileName = 'hero_' . time() . '_' . uniqid() . '.' . $extension;
        
        $path = $file->storeAs('media_design', $fileName, 'public');
        $url = asset('storage/' . $path);

        $mimeType = $file->getMimeType();
        $isVideo = str_starts_with($mimeType, 'video/');

        return response()->json([
            'success' => true,
            'url' => $url,
            'file_name' => $fileName,
            'file_type' => $isVideo ? 'video' : 'image',
            'mime_type' => $mimeType,
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
