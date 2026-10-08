<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ConciergeRequest extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'request_number',
        'customer_id',
        'customer_name',
        'customer_email',
        'customer_phone',
        'request_type',
        'priority',
        'status',
        'description',
        'preferred_date',
        'preferred_time',
        'location',
        'guests_count',
        'budget_cents',
        'currency',
        'assigned_to',
        'assigned_at',
        'booking_id',
        'order_id',
        'internal_notes',
        'cancellation_reason',
        'resolved_at',
    ];

    protected $hidden = [
        'internal_notes',
    ];

    protected static function booted(): void
    {
        static::creating(function (ConciergeRequest $model) {
            if (empty($model->request_number)) {
                $countToday = static::whereDate('created_at', today())->count() + 1;
                $model->request_number = sprintf('CR-%s-%04d', date('Ymd'), $countToday);
            }
        });
    }

    protected function casts(): array
    {
        return [
            'preferred_date' => 'date',
            'guests_count' => 'integer',
            'budget_cents' => 'integer',
            'assigned_at' => 'datetime',
            'resolved_at' => 'datetime',
        ];
    }

    public function customerVisibleNotes(): HasMany
    {
        return $this->hasMany(ConciergeNote::class)
            ->where('is_customer_visible', true)
            ->orderBy('created_at', 'asc');
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function notes(): HasMany
    {
        return $this->hasMany(ConciergeNote::class)->orderBy('created_at', 'asc');
    }

    public function quotes(): HasMany
    {
        return $this->hasMany(ConciergeQuote::class)->orderByDesc('created_at');
    }

    public function activeQuote()
    {
        return $this->hasOne(ConciergeQuote::class)->latestOfMany();
    }
}
