<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SeasonalPrice extends Model
{
    use HasFactory;

    protected $fillable = [
        'property_id', 'rule_type', 'adjustment_type', 'name_en', 'name_ar', 'start_date', 'end_date',
        'days_of_week', 'price_cents', 'adjustment_percent', 'priority', 'min_stay_nights', 'is_active', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'days_of_week' => 'array',
            'price_cents' => 'integer',
            'adjustment_percent' => 'decimal:2',
            'priority' => 'integer',
            'min_stay_nights' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function getPriceAttribute(): float
    {
        return $this->price_cents / 100;
    }

    public function getNameAttribute(): string
    {
        return app()->getLocale() === 'ar' && $this->name_ar ? $this->name_ar : $this->name_en;
    }

    public function coversDate(Carbon $date): bool
    {
        return $date->between($this->start_date, $this->end_date);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForProperty($query, int $propertyId)
    {
        return $query->where('property_id', $propertyId);
    }
}
