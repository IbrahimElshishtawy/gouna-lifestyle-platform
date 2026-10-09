<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;

class EventResource extends BaseJsonResource
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
            'type' => 'events',
            'attributes' => [
                'slug' => $this->slug,
                'title' => $locale === 'ar' && ! empty($this->title_ar) ? $this->title_ar : $this->title_en,
                'title_en' => $this->title_en,
                'title_ar' => $this->title_ar,
                'short_description' => $locale === 'ar' && ! empty($this->short_description_ar) ? $this->short_description_ar : $this->short_description_en,
                'description' => $locale === 'ar' && ! empty($this->description_ar) ? $this->description_ar : $this->description_en,
                'event_date' => $this->event_date?->format('Y-m-d'),
                'venue_name' => $this->venue_name,
                'venue_address' => $this->venue_address,
                'organizer' => $this->organizer,
                'category' => $this->category,
                'is_ticketed' => (bool) $this->is_ticketed,
                'is_featured' => (bool) $this->is_featured,
                'is_published' => (bool) $this->is_published,
                'cover_url' => $this->cover_url,
            ],
            'relationships' => [
                'location' => $this->whenLoaded('location', fn () => [
                    'id' => $this->location->id,
                    'name' => $locale === 'ar' ? $this->location->name_ar : $this->location->name_en,
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
