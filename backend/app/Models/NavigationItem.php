<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class NavigationItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'menu_location', 'parent_id', 'label_en', 'label_ar',
        'url', 'route_name', 'target', 'is_visible', 'sort_order',
    ];

    protected function casts(): array
    {
        return ['is_visible' => 'boolean'];
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(NavigationItem::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(NavigationItem::class, 'parent_id')->orderBy('sort_order');
    }

    public function getLabelAttribute(): string
    {
        return app()->getLocale() === 'ar' && $this->label_ar ? $this->label_ar : $this->label_en;
    }

    public function scopeVisible($query)
    {
        return $query->where('is_visible', true)->orderBy('sort_order');
    }

    public function scopeForMenu($query, string $location)
    {
        return $query->where('menu_location', $location)->whereNull('parent_id');
    }
}
