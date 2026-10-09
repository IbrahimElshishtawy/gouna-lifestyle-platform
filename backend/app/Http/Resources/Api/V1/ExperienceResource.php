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
                'description' => $locale === 'ar' && ! empty($this->description_ar) ? $this->description_ar : $this->description_en,
                'pricing_model' => $this->pricing_model,
                'duration' => $this->duration,
                'max_capacity' => (int) $this->max_capacity,
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
                    'slug' => $this->category->slug,
                ]),
                'location' => $this->whenLoaded('location', fn () => [
                    'id' => $this->location->id,
                    'name' => $locale === 'ar' && !empty($this->location->name_ar) ? $this->location->name_ar : $this->location->name_en,
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
