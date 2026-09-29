<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vehicle extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'slug', 'name_en', 'name_ar', 'brand', 'model', 'year',
        'transmission', 'fuel_type', 'seats',
        'daily_price_cents', 'weekly_price_cents', 'monthly_price_cents', 'deposit_cents', 'currency',
        'delivery_available', 'pickup_location', 'dropoff_location',
        'insurance_info_en', 'insurance_info_ar', 'terms_en', 'terms_ar', 'features_en', 'features_ar',
        'is_available', 'is_published', 'status',
    ];

    protected function casts(): array
    {
        return [
            'year' => 'integer',
            'seats' => 'integer',
            'daily_price_cents' => 'integer',
            'weekly_price_cents' => 'integer',
            'monthly_price_cents' => 'integer',
            'deposit_cents' => 'integer',
            'delivery_available' => 'boolean',
            'is_available' => 'boolean',
            'is_published' => 'boolean',
        ];
    }

    public function media(): MorphMany
    {
        return $this->morphMany(Media::class, 'mediable')->orderBy('sort_order');
    }

    public function getNameAttribute(): string
    {
        return app()->getLocale() === 'ar' && $this->name_ar ? $this->name_ar : $this->name_en;
    }

    public function getDailyPriceAttribute(): float
    {
        return $this->daily_price_cents / 100;
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true)->where('status', 'published');
    }
}
