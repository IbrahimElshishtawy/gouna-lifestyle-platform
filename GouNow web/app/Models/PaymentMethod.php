<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PaymentMethod extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'code', 'description', 'logo', 'is_enabled', 'is_online',
        'gateway_driver', 'test_mode', 'configuration', 'instructions_en', 'instructions_ar',
        'transaction_fee_percentage', 'transaction_fee_fixed_cents',
        'supported_currencies', 'sort_order',
    ];

    protected $hidden = ['configuration'];

    protected function casts(): array
    {
        return [
            'is_enabled' => 'boolean',
            'is_online' => 'boolean',
            'test_mode' => 'boolean',
            'configuration' => 'encrypted:array',
            'supported_currencies' => 'array',
            'transaction_fee_percentage' => 'decimal:2',
            'transaction_fee_fixed_cents' => 'integer',
        ];
    }

    public function properties(): BelongsToMany
    {
        return $this->belongsToMany(Property::class, 'payment_method_property')
            ->withPivot('is_enabled');
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(PaymentTransaction::class);
    }

    public function scopeEnabled($query)
    {
        return $query->where('is_enabled', true)->orderBy('sort_order');
    }

    public function getInstructionsAttribute(): ?string
    {
        return app()->getLocale() === 'ar' && $this->instructions_ar
            ? $this->instructions_ar
            : $this->instructions_en;
    }
}
