<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConciergeNote extends Model
{
    use HasFactory;

    protected $fillable = [
        'concierge_request_id',
        'user_id',
        'author_name',
        'content',
        'is_customer_visible',
    ];

    protected function casts(): array
    {
        return [
            'is_customer_visible' => 'boolean',
        ];
    }

    public function request(): BelongsTo
    {
        return $this->belongsTo(ConciergeRequest::class, 'concierge_request_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
