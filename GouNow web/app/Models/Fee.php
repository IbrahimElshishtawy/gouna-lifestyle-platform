<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Fee extends Model
{
    protected $fillable = [
        'name_en', 'name_ar', 'code', 'type', 'value', 'currency',
        'applies_globally', 'is_active', 'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'applies_globally' => 'boolean',
            'is_active' => 'boolean',
            'value' => 'decimal:2',
        ];
    }

    public function getNameAttribute(): string
    {
        return app()->getLocale() === 'ar' && $this->name_ar ? $this->name_ar : $this->name_en;
    }

    public function calculate(int $amountCents): int
    {
        if ($this->type === 'percentage') {
            return (int) round($amountCents * ($this->value / 100));
        }
        return (int) ($this->value * 100);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true)->orderBy('sort_order');
    }
}
