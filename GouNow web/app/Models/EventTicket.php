<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class EventTicket extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'event_order_id', 'event_id', 'event_ticket_type_id', 'customer_id',
        'ticket_number', 'qr_token', 'price_cents', 'currency',
        'status', 'used_at', 'scanned_by',
    ];

    protected $hidden = ['qr_token'];

    protected function casts(): array
    {
        return [
            'price_cents' => 'integer',
            'used_at' => 'datetime',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(EventOrder::class, 'event_order_id');
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function ticketType(): BelongsTo
    {
        return $this->belongsTo(EventTicketType::class, 'event_ticket_type_id');
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function scanner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'scanned_by');
    }

    public function scans(): HasMany
    {
        return $this->hasMany(TicketScan::class);
    }

    public function getPriceAttribute(): float
    {
        return $this->price_cents / 100;
    }

    public function isValid(): bool
    {
        return $this->status === 'valid';
    }
}
