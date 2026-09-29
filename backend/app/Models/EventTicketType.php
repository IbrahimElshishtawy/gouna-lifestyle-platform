<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EventTicketType extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id', 'name_en', 'name_ar', 'description_en', 'description_ar',
        'price_cents', 'currency', 'capacity', 'sold_count',
        'sales_start_at', 'sales_end_at', 'max_per_order',
        'payment_requirement', 'is_active', 'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'price_cents' => 'integer',
            'capacity' => 'integer',
            'sold_count' => 'integer',
            'max_per_order' => 'integer',
            'sales_start_at' => 'datetime',
            'sales_end_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function tickets(): HasMany
    {
        return $this->hasMany(EventTicket::class);
    }

    public function getNameAttribute(): string
    {
        return app()->getLocale() === 'ar' && $this->name_ar ? $this->name_ar : $this->name_en;
    }

    public function getPriceAttribute(): float
    {
        return $this->price_cents / 100;
    }

    public function getAvailableAttribute(): int
    {
        return max(0, ($this->capacity ?? PHP_INT_MAX) - $this->sold_count);
    }

    public function isOnSale(): bool
    {
        if (! $this->is_active) return false;
        $now = now();
        if ($this->sales_start_at && $now->lt($this->sales_start_at)) return false;
        if ($this->sales_end_at && $now->gt($this->sales_end_at)) return false;
        return true;
    }
}
