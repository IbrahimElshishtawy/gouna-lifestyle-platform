<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;

class PropertyResource extends BaseJsonResource
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
            'type' => 'properties',
            'attributes' => [
                'reference_number' => $this->reference_number,
                'slug' => $this->slug,
                'title' => $locale === 'ar' && ! empty($this->title_ar) ? $this->title_ar : $this->title_en,
                'title_en' => $this->title_en,
                'title_ar' => $this->title_ar,
                'short_description' => $locale === 'ar' && ! empty($this->short_description_ar) ? $this->short_description_ar : $this->short_description_en,
                'description' => $locale === 'ar' && ! empty($this->description_ar) ? $this->description_ar : $this->description_en,
                'listing_type' => $this->listing_type,
                'bedrooms' => (int) $this->bedrooms,
                'bathrooms' => (int) $this->bathrooms,
                'max_guests' => (int) $this->max_guests,
                'area_sqm' => $this->area_sqm ? (float) $this->area_sqm : null,
                'compound' => $this->compound,
                'address' => $this->address,
                'latitude' => $this->latitude ? (float) $this->latitude : null,
                'longitude' => $this->longitude ? (float) $this->longitude : null,
                'min_stay_nights' => (int) ($this->min_stay_nights ?: 1),
                'max_stay_nights' => (int) ($this->max_stay_nights ?: 30),
                'check_in_time' => $this->check_in_time,
                'check_out_time' => $this->check_out_time,
                'pricing' => [
                    'base_price_cents' => (int) $this->base_price_cents,
                    'cleaning_fee_cents' => (int) $this->cleaning_fee_cents,
                    'service_fee_cents' => (int) $this->service_fee_cents,
                    'tax_percentage' => (float) $this->tax_percentage,
                    'currency' => $this->currency ?: 'EGP',
                    'formatted_base_price' => number_format($this->base_price_cents / 100, 2).' '.($this->currency ?: 'EGP'),
                ],
                'cancellation_policy' => $this->cancellation_policy,
                'is_featured' => (bool) $this->is_featured,
                'is_available' => (bool) $this->is_available,
            ],
            'relationships' => [
                'category' => $this->whenLoaded('category', fn () => [
                    'id' => $this->category->id,
                    'name' => $locale === 'ar' ? $this->category->name_ar : $this->category->name_en,
                    'slug' => $this->category->slug,
                ]),
                'location' => $this->whenLoaded('location', fn () => [
                    'id' => $this->location->id,
                    'name' => $locale === 'ar' ? $this->location->name_ar : $this->location->name_en,
                    'slug' => $this->location->slug,
                ]),
                'amenities' => $this->whenLoaded('amenities', fn () => $this->amenities->map(fn ($amenity) => [
                    'id' => $amenity->id,
                    'name' => $locale === 'ar' ? $amenity->name_ar : $amenity->name_en,
                    'icon' => $amenity->icon,
                ])),
                'media' => $this->whenLoaded('media', fn () => $this->media->map(fn ($item) => [
                    'id' => $item->id,
                    'url' => asset('storage/'.$item->file_path),
                    'is_primary' => (bool) $item->is_primary,
                    'order' => (int) $item->order,
                ])),
            ],
        ];
    }
}
