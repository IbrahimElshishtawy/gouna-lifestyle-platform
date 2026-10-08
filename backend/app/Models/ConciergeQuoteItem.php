<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConciergeQuoteItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'concierge_quote_id',
        'item_type',
        'reference_id',
        'title',
        'description',
        'quantity',
        'unit_price_cents',
        'total_price_cents',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'unit_price_cents' => 'integer',
            'total_price_cents' => 'integer',
            'metadata' => 'array',
        ];
    }

    public function quote(): BelongsTo
    {
        return $this->belongsTo(ConciergeQuote::class, 'concierge_quote_id');
    }
}
