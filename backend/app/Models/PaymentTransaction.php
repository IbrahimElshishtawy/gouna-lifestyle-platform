<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_id', 'booking_id', 'customer_id', 'payment_method_id',
        'amount_cents', 'currency', 'type', 'status',
        'gateway_provider', 'gateway_reference', 'gateway_response',
        'manual_reference', 'manual_payment_date', 'manual_notes', 'recorded_by',
        'refund_amount_cents', 'refund_reason', 'refunded_at',
        'webhook_event_id', 'webhook_processed',
        'failure_reason', 'completed_at',
    ];

    protected $hidden = [
        'gateway_response',
        'manual_notes',
    ];

    protected function casts(): array
    {
        return [
            'amount_cents' => 'integer',
            'refund_amount_cents' => 'integer',
            'manual_payment_date' => 'date',
            'refunded_at' => 'datetime',
            'completed_at' => 'datetime',
            'gateway_response' => 'array',
            'webhook_processed' => 'boolean',
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

    public function recordedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    public function getAmountAttribute(): float
    {
        return $this->amount_cents / 100;
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope query to payment transactions visible to the user. Strictly restricted to Finance and Super Admin.
     */
    public function scopeVisibleTo($query, ?User $user)
    {
        if (! $user) {
            return $query->whereRaw('1 = 0');
        }

        if ($user->is_admin || $user->hasRole('super_admin') || $user->hasRole('finance')) {
            return $query;
        }

        // Sales, Property Manager, Content Manager, and Staff have ZERO financial visibility
        if ($user->hasRole('sales') || $user->hasRole('property_manager') || $user->hasRole('content_manager') || $user->hasRole('staff')) {
            return $query->whereRaw('1 = 0');
        }

        // Normal customer can view only transactions for their customer record
        return $query->whereHas('customer', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        });
    }
}
