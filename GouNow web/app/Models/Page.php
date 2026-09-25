<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Page extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'slug', 'template', 'title_en', 'title_ar',
        'content_en', 'content_ar', 'featured_image',
        'is_published', 'show_in_nav', 'sort_order',
    ];

    protected function casts(): array
    {
        return ['is_published' => 'boolean', 'show_in_nav' => 'boolean'];
    }

    public function seoMetadata(): MorphMany
    {
        return $this->morphMany(SeoMetadata::class, 'seoable');
    }

    public function getTitleAttribute(): string
    {
        return app()->getLocale() === 'ar' && $this->title_ar ? $this->title_ar : $this->title_en;
    }

    public function getContentAttribute(): ?string
    {
        return app()->getLocale() === 'ar' && $this->content_ar ? $this->content_ar : $this->content_en;
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }
}
