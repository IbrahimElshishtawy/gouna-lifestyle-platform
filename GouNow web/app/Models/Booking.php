<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Booking extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'reference', 'customer_id', 'bookable_type', 'bookable_id',
        'check_in', 'check_out', 'nights', 'guests',
        'subtotal_cents', 'cleaning_fee_cents', 'service_fee_cents',
        'tax_cents', 'discount_cents', 'total_cents',
        'deposit_cents', 'amount_paid_cents', 'amount_remaining_cents', 'currency',
        'payment_type', 'payment_method_id',
        'status', 'payment_status',
        'discount_id', 'promo_code', 'balance_due_date',
        'internal_notes', 'source', 'assigned_to',
        'cancelled_at', 'cancellation_reason', 'refund_amount_cents',
    ];

    protected function casts(): array
    {
        return [
            'check_in' => 'date',
            'check_out' => 'date',
            'balance_due_date' => 'date',
            'cancelled_at' => 'datetime',
            'nights' => 'integer',
            'guests' => 'integer',
            'subtotal_cents' => 'integer',
            'cleaning_fee_cents' => 'integer',
            'service_fee_cents' => 'integer',
            'tax_cents' => 'integer',
            'discount_cents' => 'integer',
            'total_cents' => 'integer',
            'deposit_cents' => 'integer',
            'amount_paid_cents' => 'integer',
            'amount_remaining_cents' => 'integer',
            'refund_amount_cents' => 'integer',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function bookable(): MorphTo
    {
        return $this->morphTo();
    }

    public function paymentMethod(): BelongsTo
    {
        return $this->belongsTo(PaymentMethod::class);
    }

    public function discount(): BelongsTo
    {
        return $this->belongsTo(Discount::class);
    }

    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function nightlyPrices(): HasMany
    {
        return $this->hasMany(BookingNightlyPrice::class)->orderBy('night_date');
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(PaymentTransaction::class);
    }

    // Accessors
    public function getTotalAttribute(): float
    {
        return $this->total_cents / 100;
    }

    public function getDepositAttribute(): float
    {
        return $this->deposit_cents / 100;
    }

    public function getAmountPaidAttribute(): float
    {
        return $this->amount_paid_cents / 100;
    }

    public function getAmountRemainingAttribute(): float
    {
        return $this->amount_remaining_cents / 100;
    }

    public function isConfirmed(): bool
    {
        return in_array($this->status, ['confirmed', 'paid', 'completed']);
    }

    public function isPaid(): bool
    {
        return $this->payment_status === 'paid';
    }

    public function scopePending($query)
    {
        return $query->whereIn('status', ['pending', 'awaiting_payment', 'payment_processing']);
    }

    public function scopeConfirmed($query)
    {
        return $query->whereIn('status', ['confirmed', 'paid', 'completed']);
    }

    public function scopeUpcomingCheckIns($query)
    {
        return $query->whereIn('status', ['confirmed', 'paid'])
            ->where('check_in', '>=', now()->toDateString());
    }
}
