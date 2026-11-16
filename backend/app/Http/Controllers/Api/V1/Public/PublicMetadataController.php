<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Experience;
use App\Models\ExperienceCategory;
use App\Models\Faq;
use App\Models\Location;
use App\Models\Property;
use App\Models\PropertyCategory;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;

class PublicMetadataController extends Controller
{
    /**
     * Return published FAQs from the database.
     */
    public function faqs(): JsonResponse
    {
        $faqs = Faq::published()->get()->map(fn (Faq $faq) => [
            'id' => $faq->id,
            'group' => $faq->group,
            'question_en' => $faq->question_en,
            'question_ar' => $faq->question_ar,
            'answer_en' => $faq->answer_en,
            'answer_ar' => $faq->answer_ar,
            'sort_order' => $faq->sort_order,
        ]);

        return response()->json(['data' => $faqs]);
    }

    /**
     * Return active locations, categories, and public site/contact settings from the database.
     */
    public function taxonomies(): JsonResponse
    {
        $locations = Location::active()
            ->orderBy('sort_order')
            ->get(['id', 'name_en', 'name_ar', 'slug']);

        $propertyCategories = PropertyCategory::active()
            ->orderBy('sort_order')
            ->get(['id', 'name_en', 'name_ar', 'slug']);

        $experienceCategories = ExperienceCategory::active()
            ->orderBy('sort_order')
            ->get(['id', 'name_en', 'name_ar', 'slug']);

        $eventCategories = Event::query()
            ->where(function ($q) {
                $q->where('is_published', true)->orWhere('status', 'published');
            })
            ->whereNotNull('category')
            ->distinct()
            ->pluck('category')
            ->values();

        $publicSettings = Setting::whereIn('group', ['general', 'contact', 'social', 'booking'])
            ->get()
            ->mapWithKeys(fn (Setting $s) => [$s->key => $s->value]);

        return response()->json([
            'data' => [
                'locations' => $locations,
                'property_categories' => $propertyCategories,
                'experience_categories' => $experienceCategories,
                'event_categories' => $eventCategories,
                'settings' => [
                    'site_name' => $publicSettings['site_name'] ?? 'Gounow',
                    'phone' => $publicSettings['phone'] ?? '',
                    'whatsapp_number' => $publicSettings['whatsapp_number'] ?? '',
                    'email' => $publicSettings['email'] ?? '',
                    'address' => $publicSettings['address'] ?? '',
                    'google_maps_url' => $publicSettings['google_maps_url'] ?? '',
                    'instagram_url' => $publicSettings['instagram_url'] ?? '',
                    'facebook_url' => $publicSettings['facebook_url'] ?? '',
                    'tiktok_url' => $publicSettings['tiktok_url'] ?? '',
                    'linkedin_url' => $publicSettings['linkedin_url'] ?? '',
                    'default_checkin_time' => $publicSettings['default_checkin_time'] ?? '15:00',
                    'default_checkout_time' => $publicSettings['default_checkout_time'] ?? '11:00',
                    'default_deposit_percentage' => (int) ($publicSettings['default_deposit_percentage'] ?? 30),
                ],
                'counts' => [
                    'properties' => Property::where('is_published', true)->where('is_available', true)->count(),
                    'experiences' => Experience::where('is_published', true)->count(),
                    'events' => Event::where(function ($q) {
                        $q->where('is_published', true)->orWhere('status', 'published');
                    })->count(),
                ],
            ],
        ]);
    }
}
