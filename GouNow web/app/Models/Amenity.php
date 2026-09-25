<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Amenity extends Model
{
    use HasFactory;

    protected $fillable = ['name_en', 'name_ar', 'icon', 'group', 'is_active', 'sort_order'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function properties(): BelongsToMany
    {
        return $this->belongsToMany(Property::class, 'amenity_property');
    }

    public function getNameAttribute(): string
    {
        return app()->getLocale() === 'ar' && $this->name_ar
            ? $this->name_ar
            : $this->name_en;
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true)->orderBy('sort_order');
    }
}
