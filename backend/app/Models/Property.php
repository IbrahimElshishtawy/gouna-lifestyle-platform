<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Property extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'reference_number', 'slug', 'property_category_id', 'location_id',
        'title_en', 'title_ar', 'short_description_en', 'short_description_ar',
        'description_en', 'description_ar', 'listing_type',
        'bedrooms', 'bathrooms', 'max_guests', 'area_sqm', 'floor',
        'building', 'compound', 'address', 'latitude', 'longitude', 'map_url',
        'min_stay_nights', 'max_stay_nights', 'check_in_time', 'check_out_time',
        'base_price_cents', 'currency', 'cleaning_fee_cents', 'service_fee_cents',
        'tax_percentage', 'sale_price_cents',
        'payment_requirement', 'deposit_percentage', 'deposit_fixed_cents',
        'booking_mode', 'cancellation_policy', 'cancellation_policy_text_en', 'cancellation_policy_text_ar',
        'house_rules_en', 'house_rules_ar',
        'is_featured', 'is_published', 'is_available', 'status',
        'developer', 'completion_status', 'furnished_status',
    ];

    protected function casts(): array
    {
        return [
            'bedrooms' => 'integer',
            'bathrooms' => 'integer',
            'max_guests' => 'integer',
            'area_sqm' => 'decimal:2',
            'floor' => 'integer',
            'min_stay_nights' => 'integer',
            'max_stay_nights' => 'integer',
            'base_price_cents' => 'integer',
            'cleaning_fee_cents' => 'integer',
            'service_fee_cents' => 'integer',
            'tax_percentage' => 'decimal:2',
            'sale_price_cents' => 'integer',
            'deposit_percentage' => 'decimal:2',
            'deposit_fixed_cents' => 'integer',
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
            'is_featured' => 'boolean',
            'is_published' => 'boolean',
            'is_available' => 'boolean',
        ];
    }

    // Relationships

    public function category(): BelongsTo
    {
        return $this->belongsTo(PropertyCategory::class, 'property_category_id');
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function amenities(): BelongsToMany
    {
        return $this->belongsToMany(Amenity::class, 'amenity_property');
    }

    public function seasonalPrices(): HasMany
    {
        return $this->hasMany(SeasonalPrice::class)->orderBy('priority', 'desc');
    }

    public function availabilityBlocks(): HasMany
    {
        return $this->hasMany(AvailabilityBlock::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'bookable_id')
            ->where('bookable_type', self::class);
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

    public function featuredImage(): MorphMany
    {
        return $this->morphMany(Media::class, 'mediable')
            ->where('file_type', 'image')
            ->where('is_featured', true)
            ->limit(1);
    }

    public function paymentMethods(): BelongsToMany
    {
        return $this->belongsToMany(PaymentMethod::class, 'payment_method_property')
            ->withPivot('is_enabled');
    }

    public function seoMetadata(): MorphMany
    {
        return $this->morphMany(SeoMetadata::class, 'seoable');
    }

    public function favorites(): MorphMany
    {
        return $this->morphMany(Favorite::class, 'favoriteable');
    }

    public function leads(): MorphMany
    {
        return $this->morphMany(Lead::class, 'leadable');
    }

    // Accessors

    public function getTitleAttribute(): string
    {
        return app()->getLocale() === 'ar' && $this->title_ar ? $this->title_ar : $this->title_en;
    }

    public function getBasePriceAttribute(): float
    {
        return $this->base_price_cents / 100;
    }

    public function getCleaningFeeAttribute(): float
    {
        return $this->cleaning_fee_cents / 100;
    }

    public function getServiceFeeAttribute(): float
    {
        return $this->service_fee_cents / 100;
    }

    public function getCoverUrlAttribute(): string
    {
        $featured = $this->images->firstWhere('is_featured', true) ?? $this->images->first();
        if ($featured && ! empty($featured->file_path)) {
            return $featured->url;
        }

        $fallbacks = [
            'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
        ];

        return $fallbacks[abs($this->id) % count($fallbacks)];
    }

    public function getGalleryUrlsAttribute(): array
    {
        if ($this->images->isNotEmpty()) {
            return $this->images->pluck('url')->toArray();
        }

        $allFallbacks = [
            'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
        ];

        return $allFallbacks;
    }

    // Scopes

    public function scopePublished($query)
    {
        return $query->where('is_published', true)->where('status', 'published');
    }

    public function scopeForRent($query)
    {
        return $query->whereIn('listing_type', ['rent', 'both']);
    }

    public function scopeForSale($query)
    {
        return $query->whereIn('listing_type', ['sale', 'both']);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }
}
