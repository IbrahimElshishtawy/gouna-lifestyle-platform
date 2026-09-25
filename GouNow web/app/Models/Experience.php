<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Experience extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'experience_category_id', 'location_id', 'slug',
        'title_en', 'title_ar', 'short_description_en', 'short_description_ar',
        'description_en', 'description_ar',
        'pricing_model', 'base_price_cents', 'currency', 'max_capacity', 'duration',
        'payment_requirement', 'deposit_percentage', 'booking_mode',
        'cancellation_policy_en', 'cancellation_policy_ar',
        'what_to_bring_en', 'what_to_bring_ar',
        'meeting_point_en', 'meeting_point_ar',
        'is_featured', 'is_published', 'status',
    ];

    protected function casts(): array
    {
        return [
            'base_price_cents' => 'integer',
            'max_capacity' => 'integer',
            'deposit_percentage' => 'decimal:2',
            'is_featured' => 'boolean',
            'is_published' => 'boolean',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ExperienceCategory::class, 'experience_category_id');
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
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

    public function seoMetadata(): MorphMany
    {
        return $this->morphMany(SeoMetadata::class, 'seoable');
    }

    public function leads(): MorphMany
    {
        return $this->morphMany(Lead::class, 'leadable');
    }

    public function getTitleAttribute(): string
    {
        return app()->getLocale() === 'ar' && $this->title_ar ? $this->title_ar : $this->title_en;
    }

    public function getBasePriceAttribute(): float
    {
        return $this->base_price_cents / 100;
    }

    public function getCoverUrlAttribute(): string
    {
        $first = $this->images->first();
        if ($first && ! empty($first->file_path)) {
            return $first->url;
        }

        $fallbacks = [
            'https://images.unsplash.com/photo-1569263979104-865ab7cd8d17?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
        ];

        return $fallbacks[abs($this->id) % count($fallbacks)];
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true)->where('status', 'published');
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }
}
