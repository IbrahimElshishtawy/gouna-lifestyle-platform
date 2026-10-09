<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Yacht extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'location_id',
        'name_en',
        'name_ar',
        'slug',
        'short_description_en',
        'short_description_ar',
        'description_en',
        'description_ar',
        'yacht_type',
        'category',
        'brand',
        'model',
        'year',
        'length_ft',
        'capacity',
        'crew_capacity',
        'cabins',
        'bathrooms',
        'owner_partner_name',
        'owner_partner_contact',
        'pricing_model',
        'base_price_cents',
        'currency',
        'weekend_price_cents',
        'extra_hour_price_cents',
        'security_deposit_cents',
        'min_duration_hours',
        'marina_berth',
        'address',
        'latitude',
        'longitude',
        'map_url',
        'rules_en',
        'rules_ar',
        'cancellation_policy_en',
        'cancellation_policy_ar',
        'child_policy',
        'pet_policy',
        'cover_image',
        'gallery',
        'is_featured',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'year' => 'integer',
            'length_ft' => 'integer',
            'capacity' => 'integer',
            'crew_capacity' => 'integer',
            'cabins' => 'integer',
            'bathrooms' => 'integer',
            'base_price_cents' => 'integer',
            'weekend_price_cents' => 'integer',
            'extra_hour_price_cents' => 'integer',
            'security_deposit_cents' => 'integer',
            'min_duration_hours' => 'integer',
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
            'gallery' => 'array',
            'is_featured' => 'boolean',
        ];
    }

    protected $appends = ['cover_url', 'base_price', 'weekend_price', 'extra_hour_price'];

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function packages(): HasMany
    {
        return $this->hasMany(YachtPackage::class)->orderBy('sort_order');
    }

    public function availabilityBlocks(): HasMany
    {
        return $this->hasMany(YachtAvailabilityBlock::class)->orderBy('start_date');
    }

    public function addons(): MorphMany
    {
        return $this->morphMany(Addon::class, 'addonable');
    }

    public function bookings(): MorphMany
    {
        return $this->morphMany(Booking::class, 'bookable');
    }

    public function media(): MorphMany
    {
        return $this->morphMany(Media::class, 'mediable')->orderBy('sort_order');
    }

    public function images(): MorphMany
    {
        return $this->morphMany(Media::class, 'mediable')
            ->where('file_type', 'image')->orderBy('sort_order');
    }

    public function leads(): MorphMany
    {
        return $this->morphMany(Lead::class, 'leadable');
    }

    public function getNameAttribute(): string
    {
        return app()->getLocale() === 'ar' && $this->name_ar ? $this->name_ar : $this->name_en;
    }

    public function getBasePriceAttribute(): float
    {
        return $this->base_price_cents / 100;
    }

    public function getWeekendPriceAttribute(): ?float
    {
        return $this->weekend_price_cents ? $this->weekend_price_cents / 100 : null;
    }

    public function getExtraHourPriceAttribute(): ?float
    {
        return $this->extra_hour_price_cents ? $this->extra_hour_price_cents / 100 : null;
    }

    public function getCoverUrlAttribute(): string
    {
        if (! empty($this->cover_image)) {
            if (str_starts_with($this->cover_image, 'http') || str_starts_with($this->cover_image, '/assets/')) {
                return $this->cover_image;
            }
            if (Storage::disk('public')->exists($this->cover_image)) {
                return Storage::disk('public')->url($this->cover_image);
            }
        }

        $first = $this->images->first();
        if ($first && ! empty($first->file_path)) {
            return $first->url;
        }

        return 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=1200&q=80';
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }
}
