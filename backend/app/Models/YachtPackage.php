<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class YachtPackage extends Model
{
    use HasFactory;

    protected $fillable = [
        'yacht_id',
        'name_en',
        'name_ar',
        'description_en',
        'description_ar',
        'duration_hours',
        'capacity',
        'price_cents',
        'currency',
        'inclusions_en',
        'inclusions_ar',
        'exclusions_en',
        'exclusions_ar',
        'status',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'duration_hours' => 'decimal:1',
            'capacity' => 'integer',
            'price_cents' => 'integer',
            'inclusions_en' => 'array',
            'inclusions_ar' => 'array',
            'exclusions_en' => 'array',
            'exclusions_ar' => 'array',
            'sort_order' => 'integer',
        ];
    }

    public function yacht(): BelongsTo
    {
        return $this->belongsTo(Yacht::class);
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
