<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id', 'first_name', 'last_name', 'email', 'phone',
        'phone_country_code', 'nationality', 'country_of_residence',
        'notes', 'source', 'is_active',
    ];

    protected $hidden = [
        'notes',
    ];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function eventOrders(): HasMany
    {
        return $this->hasMany(EventOrder::class);
    }

    public function leads(): HasMany
    {
        return $this->hasMany(Lead::class);
    }

    public function paymentTransactions(): HasMany
    {
        return $this->hasMany(PaymentTransaction::class);
    }

    public function getFullNameAttribute(): string
    {
        return trim($this->first_name.' '.$this->last_name);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope query to customers visible to the user. Staff and unauthenticated are blocked.
     */
    public function scopeVisibleTo($query, ?User $user)
    {
        if (! $user) {
            return $query->whereRaw('1 = 0');
        }

        if ($user->is_admin || $user->hasRole('super_admin') || $user->hasRole('property_manager') || $user->hasRole('finance')) {
            return $query;
        }

        // Staff and Content Manager cannot list or export customers
        if ($user->hasRole('staff') || $user->hasRole('content_manager')) {
            return $query->whereRaw('1 = 0');
        }

        // Sales can only view customers with assigned leads
        if ($user->hasRole('sales')) {
            return $query->whereHas('leads', function ($q) use ($user) {
                $q->where('assigned_to', $user->id);
            });
        }

        // Normal customer can only see their own profile
        return $query->where('user_id', $user->id);
    }
}
