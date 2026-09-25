<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Event extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'location_id', 'slug', 'title_en', 'title_ar',
        'short_description_en', 'short_description_ar',
        'description_en', 'description_ar',
        'organizer', 'event_date', 'start_time', 'end_time',
        'venue_name', 'venue_address', 'latitude', 'longitude',
        'category', 'is_ticketed', 'is_featured', 'is_published', 'status',
    ];

    protected function casts(): array
    {
        return [
            'event_date' => 'date',
            'start_time' => 'datetime:H:i',
            'end_time' => 'datetime:H:i',
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
            'is_ticketed' => 'boolean',
            'is_featured' => 'boolean',
            'is_published' => 'boolean',
        ];
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function ticketTypes(): HasMany
    {
        return $this->hasMany(EventTicketType::class)->orderBy('sort_order');
    }

    public function orders(): HasMany
    {
        return $this->hasMany(EventOrder::class);
    }

    public function tickets(): HasMany
    {
        return $this->hasMany(EventTicket::class);
    }

    public function media(): MorphMany
    {
        return $this->morphMany(Media::class, 'mediable')->orderBy('sort_order');
    }

    public function images(): MorphMany
    {
        return $this->morphMany(Media::class, 'mediable')
            ->where('file_type', 'image')->orderBy('sort_order');
    }

    public function featuredImage(): MorphMany
    {
        return $this->morphMany(Media::class, 'mediable')
            ->where('file_type', 'image')
            ->where('is_featured', true)
            ->limit(1);
    }

    public function seoMetadata(): MorphMany
    {
        return $this->morphMany(SeoMetadata::class, 'seoable');
    }

    public function leads(): MorphMany
    {
        return $this->morphMany(Lead::class, 'leadable');
    }

    public function getTitleAttribute(): string
    {
        return app()->getLocale() === 'ar' && $this->title_ar ? $this->title_ar : $this->title_en;
    }

    public function getTotalCapacityAttribute(): int
    {
        return $this->ticketTypes()->sum('capacity') ?? 0;
    }

    public function getTotalSoldAttribute(): int
    {
        return $this->ticketTypes()->sum('sold_count');
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true)->whereIn('status', ['published']);
    }

    public function scopeUpcoming($query)
    {
        return $query->where('event_date', '>=', now()->toDateString());
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }
}
