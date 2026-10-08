<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Addon extends Model
{
    use HasFactory;

    protected $fillable = [
        'addonable_type',
        'addonable_id',
        'name_en',
        'name_ar',
        'description_en',
        'description_ar',
        'price_cents',
        'currency',
        'pricing_model',
        'max_quantity',
        'is_available',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'price_cents' => 'integer',
            'max_quantity' => 'integer',
            'is_available' => 'boolean',
        ];
    }

    public function addonable(): MorphTo
    {
        return $this->morphTo();
    }

    public function getNameAttribute(): string
    {
        return app()->getLocale() === 'ar' && $this->name_ar ? $this->name_ar : $this->name_en;
    }

    public function getPriceAttribute(): float
    {
        return $this->price_cents / 100;
    }
}
