<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookingNightlyPrice extends Model
{
    protected $fillable = [
        'booking_id', 'night_date', 'price_cents', 'currency',
        'seasonal_price_id', 'season_name', 'is_base_price',
    ];

    protected function casts(): array
    {
        return [
            'night_date' => 'date',
            'price_cents' => 'integer',
            'is_base_price' => 'boolean',
        ];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function seasonalPrice(): BelongsTo
    {
        return $this->belongsTo(SeasonalPrice::class);
    }

    public function getPriceAttribute(): float
    {
        return $this->price_cents / 100;
    }
}
