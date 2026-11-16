<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;

class ExperienceResource extends BaseJsonResource
{
    /**
     * Transform the resource into an array adhering to Standard S2.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $locale = app()->getLocale();

        return [
            'id' => $this->id,
            'type' => 'experiences',
            'attributes' => [
                'slug' => $this->slug,
                'title' => $locale === 'ar' && ! empty($this->title_ar) ? $this->title_ar : $this->title_en,
                'title_en' => $this->title_en,
                'title_ar' => $this->title_ar,
                'short_description' => $locale === 'ar' && ! empty($this->short_description_ar) ? $this->short_description_ar : $this->short_description_en,
                'short_description_en' => $this->short_description_en,
                'short_description_ar' => $this->short_description_ar,
                'description' => $locale === 'ar' && ! empty($this->description_ar) ? $this->description_ar : $this->description_en,
                'description_en' => $this->description_en,
                'description_ar' => $this->description_ar,
                'pricing_model' => $this->pricing_model,
                'duration' => $this->duration,
                'max_capacity' => (int) $this->max_capacity,
                'meeting_point' => $locale === 'ar' && ! empty($this->meeting_point_ar) ? $this->meeting_point_ar : $this->meeting_point_en,
                'meeting_point_en' => $this->meeting_point_en,
                'meeting_point_ar' => $this->meeting_point_ar,
                'what_to_bring' => $locale === 'ar' && ! empty($this->what_to_bring_ar) ? $this->what_to_bring_ar : $this->what_to_bring_en,
                'what_to_bring_en' => $this->what_to_bring_en,
                'what_to_bring_ar' => $this->what_to_bring_ar,
                'cancellation_policy' => $locale === 'ar' && ! empty($this->cancellation_policy_ar) ? $this->cancellation_policy_ar : $this->cancellation_policy_en,
                'cancellation_policy_en' => $this->cancellation_policy_en,
                'cancellation_policy_ar' => $this->cancellation_policy_ar,
                'pricing' => [
                    'base_price_cents' => (int) $this->base_price_cents,
                    'currency' => $this->currency ?: 'EGP',
                    'formatted_base_price' => number_format($this->base_price_cents / 100, 2).' '.($this->currency ?: 'EGP'),
                ],
                'is_featured' => (bool) $this->is_featured,
                'is_published' => (bool) $this->is_published,
                'status' => $this->status ?? 'published',
                'cover_url' => $this->cover_url,
            ],
            'relationships' => [
                'category' => $this->whenLoaded('category', fn () => [
                    'id' => $this->category->id,
                    'name' => $locale === 'ar' ? $this->category->name_ar : $this->category->name_en,
                    'name_en' => $this->category->name_en,
                    'name_ar' => $this->category->name_ar,
                    'slug' => $this->category->slug,
                ]),
                'location' => $this->whenLoaded('location', fn () => [
                    'id' => $this->location->id,
                    'name' => $locale === 'ar' && !empty($this->location->name_ar) ? $this->location->name_ar : $this->location->name_en,
                    'name_en' => $this->location->name_en,
                    'name_ar' => $this->location->name_ar,
                    'slug' => $this->location->slug,
                ]),
                'media' => $this->whenLoaded('media', fn () => $this->media->map(fn ($item) => [
                    'id' => $item->id,
                    'url' => $item->url,
                    'thumb_url' => $item->thumb_url,
                    'is_primary' => (bool) ($item->is_featured || $item->is_primary),
                    'order' => (int) ($item->sort_order ?? 0),
                    'title' => $item->title,
                    'alt_text' => $item->alt_text,
                ])),
            ],
        ];
    }
}
