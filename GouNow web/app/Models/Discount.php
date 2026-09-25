<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Discount extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name_en', 'name_ar', 'code', 'type', 'value', 'currency',
        'applies_to_all', 'applicable_ids', 'applicable_type',
        'min_stay_nights', 'min_booking_amount_cents', 'max_uses',
        'used_count', 'valid_from', 'valid_until', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'applicable_ids' => 'array',
            'applies_to_all' => 'boolean',
            'is_active' => 'boolean',
            'valid_from' => 'date',
            'valid_until' => 'date',
            'min_booking_amount_cents' => 'integer',
            'used_count' => 'integer',
            'max_uses' => 'integer',
        ];
    }

    public function usages(): HasMany
    {
        return $this->hasMany(DiscountUsage::class);
    }

    public function isValid(): bool
    {
        if (! $this->is_active) return false;
        if ($this->valid_from && now()->lt($this->valid_from)) return false;
        if ($this->valid_until && now()->gt($this->valid_until)) return false;
        if ($this->max_uses && $this->used_count >= $this->max_uses) return false;
        return true;
    }

    public function calculateDiscount(int $amountCents): int
    {
        if ($this->type === 'percentage') {
            return (int) round($amountCents * ($this->value / 100));
        }
        // fixed
        return min((int) ($this->value * 100), $amountCents);
    }
}
