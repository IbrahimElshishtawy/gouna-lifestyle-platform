<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Lead extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'customer_id', 'name', 'email', 'phone', 'type', 'source',
        'message', 'leadable_type', 'leadable_id', 'status',
        'assigned_to', 'admin_notes',
        'property_location', 'property_type', 'property_bedrooms',
        'property_area_sqm', 'expected_price_cents',
    ];

    protected function casts(): array
    {
        return [
            'property_bedrooms' => 'integer',
            'property_area_sqm' => 'decimal:2',
            'expected_price_cents' => 'integer',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function leadable(): MorphTo
    {
        return $this->morphTo();
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function scopeNew($query)
    {
        return $query->where('status', 'new');
    }
}
