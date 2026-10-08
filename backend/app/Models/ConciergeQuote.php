<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ConciergeQuote extends Model
{
    use HasFactory;

    protected $fillable = [
        'concierge_request_id',
        'quote_number',
        'status',
        'currency',
        'subtotal_cents',
        'discount_cents',
        'fees_cents',
        'total_cents',
        'valid_until',
        'notes',
        'created_by',
        'accepted_at',
        'booking_id',
    ];

    protected function casts(): array
    {
        return [
            'subtotal_cents' => 'integer',
            'discount_cents' => 'integer',
            'fees_cents' => 'integer',
            'total_cents' => 'integer',
            'valid_until' => 'datetime',
            'accepted_at' => 'datetime',
        ];
    }

    public function request(): BelongsTo
    {
        return $this->belongsTo(ConciergeRequest::class, 'concierge_request_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(ConciergeQuoteItem::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }
}
