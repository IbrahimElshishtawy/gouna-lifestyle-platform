<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HomepageSection extends Model
{
    protected $fillable = [
        'section_key', 'title_en', 'title_ar', 'subtitle_en', 'subtitle_ar',
        'content_en', 'content_ar', 'cta_text_en', 'cta_text_ar', 'cta_url',
        'background_image', 'background_video', 'extra_data', 'is_visible', 'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'extra_data' => 'array',
            'is_visible' => 'boolean',
        ];
    }

    public function getTitleAttribute(): string
    {
        return app()->getLocale() === 'ar' && $this->title_ar ? $this->title_ar : ($this->title_en ?? '');
    }

    public function getSubtitleAttribute(): string
    {
        return app()->getLocale() === 'ar' && $this->subtitle_ar ? $this->subtitle_ar : ($this->subtitle_en ?? '');
    }

    public function getCtaTextAttribute(): string
    {
        return app()->getLocale() === 'ar' && $this->cta_text_ar ? $this->cta_text_ar : ($this->cta_text_en ?? '');
    }

    public function scopeVisible($query)
    {
        return $query->where('is_visible', true)->orderBy('sort_order');
    }
}
