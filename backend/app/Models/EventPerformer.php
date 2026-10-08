<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class EventPerformer extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'description',
        'image_url',
        'social_links',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'social_links' => 'array',
        ];
    }

    public function events(): BelongsToMany
    {
        return $this->belongsToMany(Event::class, 'event_performer')
            ->withPivot(['performance_time', 'role'])
            ->withTimestamps();
    }
}
