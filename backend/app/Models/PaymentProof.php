<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentProof extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'customer_id',
        'payment_method_id',
        'payment_method_code',
        'amount_cents',
        'currency',
        'transfer_date',
        'reference_number',
        'sender_name',
        'sender_account',
        'receipt_disk',
        'receipt_path',
        'receipt_original_name',
        'receipt_mime_type',
        'receipt_size_bytes',
        'customer_notes',
        'status',
        'reviewed_by',
        'reviewed_at',
        'rejection_reason',
        'payment_transaction_id',
        'ip_address',
        'user_agent',
    ];

    protected $hidden = [
        'ip_address',
        'user_agent',
    ];

    protected function casts(): array
    {
        return [
            'amount_cents' => 'integer',
            'transfer_date' => 'date',
            'reviewed_at' => 'datetime',
            'receipt_size_bytes' => 'integer',
        ];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function paymentMethod(): BelongsTo
    {
        return $this->belongsTo(PaymentMethod::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function paymentTransaction(): BelongsTo
    {
        return $this->belongsTo(PaymentTransaction::class);
    }

    public function getAmountAttribute(): float
    {
        return $this->amount_cents / 100;
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending_verification');
    }

    public function scopeVerified($query)
    {
        return $query->where('status', 'verified');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }
}
