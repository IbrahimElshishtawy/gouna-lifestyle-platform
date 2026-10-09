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
                'short_description_en' => $this->short_description_en,
                'short_description_ar' => $this->short_description_ar,
                'description' => $locale === 'ar' && ! empty($this->description_ar) ? $this->description_ar : $this->description_en,
                'description_en' => $this->description_en,
                'description_ar' => $this->description_ar,
                'event_date' => $this->event_date?->format('Y-m-d'),
                'start_time' => $this->start_time ? \Carbon\Carbon::parse($this->start_time)->format('H:i') : null,
                'end_time' => $this->end_time ? \Carbon\Carbon::parse($this->end_time)->format('H:i') : null,
                'doors_open_time' => $this->doors_open_time ? \Carbon\Carbon::parse($this->doors_open_time)->format('H:i') : null,
                'age_restriction' => $this->age_restriction,
                'dress_code' => $this->dress_code,
                'rules' => $locale === 'ar' && ! empty($this->rules_ar) ? $this->rules_ar : $this->rules_en,
                'venue_name' => $this->venue_name,
                'venue_address' => $this->venue_address,
                'organizer' => $this->organizer,
                'category' => $this->category,
                'is_ticketed' => (bool) $this->is_ticketed,
                'is_featured' => (bool) $this->is_featured,
                'is_published' => (bool) $this->is_published,
                'cover_url' => $this->cover_url,
                'min_price' => $this->relationLoaded('ticketTypes') && $this->ticketTypes->isNotEmpty()
                    ? $this->ticketTypes->where('is_active', true)->min(fn ($t) => $t->price_cents ? $t->price_cents / 100 : ($t->price ?? 0))
                    : null,
            ],
            'relationships' => [
                'venue' => $this->whenLoaded('venue', fn () => [
                    'id' => $this->venue->id,
                    'name' => $locale === 'ar' && ! empty($this->venue->name_ar) ? $this->venue->name_ar : $this->venue->name_en,
                    'address' => $this->venue->address,
                    'capacity' => $this->venue->capacity,
                ]),
                'location' => $this->whenLoaded('location', fn () => [
                    'id' => $this->location->id,
                    'name' => $locale === 'ar' ? $this->location->name_ar : $this->location->name_en,
                    'slug' => $this->location->slug,
                ]),
                'ticket_types' => $this->whenLoaded('ticketTypes', fn () => $this->ticketTypes->where('is_active', true)->map(fn ($t) => [
                    'id' => $t->id,
                    'name' => $locale === 'ar' && ! empty($t->name_ar) ? $t->name_ar : $t->name_en,
                    'name_en' => $t->name_en,
                    'name_ar' => $t->name_ar,
                    'description' => $locale === 'ar' && ! empty($t->description_ar) ? $t->description_ar : $t->description_en,
                    'price' => $t->price_cents ? $t->price_cents / 100 : ($t->price ?? 0),
                    'currency' => $t->currency ?? 'EGP',
                    'available' => $t->available ?? max(0, ($t->capacity ?? 0) - ($t->sold_count ?? 0)),
                    'max_per_order' => $t->max_per_order ?? 10,
                ])),
                'schedules' => $this->whenLoaded('schedules', fn () => $this->schedules->map(fn ($s) => [
                    'id' => $s->id,
                    'title' => $locale === 'ar' && ! empty($s->title_ar) ? $s->title_ar : $s->title_en,
                    'start_time' => $s->start_time,
                    'end_time' => $s->end_time,
                    'performer_name' => $s->performer_name,
                ])),
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
