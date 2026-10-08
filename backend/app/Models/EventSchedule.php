<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'title_en',
        'title_ar',
        'description_en',
        'description_ar',
        'start_time',
        'end_time',
        'performer_name',
        'sort_order',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function getTitleAttribute(): string
    {
        return app()->getLocale() === 'ar' && $this->title_ar ? $this->title_ar : $this->title_en;
    }
}
