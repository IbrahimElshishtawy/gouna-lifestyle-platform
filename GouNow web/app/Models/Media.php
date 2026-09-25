<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Facades\Storage;

class Media extends Model
{
    use HasFactory;

    protected $fillable = [
        'file_path', 'file_name', 'file_type', 'mime_type', 'file_size',
        'disk', 'alt_text_en', 'alt_text_ar', 'caption_en', 'caption_ar',
        'title', 'thumb_path', 'medium_path', 'width', 'height',
        'sort_order', 'is_featured',
    ];

    protected function casts(): array
    {
        return [
            'file_size' => 'integer',
            'width' => 'integer',
            'height' => 'integer',
            'sort_order' => 'integer',
            'is_featured' => 'boolean',
        ];
    }

    public function mediable(): MorphTo
    {
        return $this->morphTo();
    }

    public function getUrlAttribute(): string
    {
        return Storage::disk($this->disk)->url($this->file_path);
    }

    public function getThumbUrlAttribute(): ?string
    {
        if ($this->thumb_path) {
            return Storage::disk($this->disk)->url($this->thumb_path);
        }
        return $this->url;
    }

    public function getAltTextAttribute(): string
    {
        return app()->getLocale() === 'ar' && $this->alt_text_ar
            ? $this->alt_text_ar
            : ($this->alt_text_en ?? '');
    }

    public function scopeImages($query)
    {
        return $query->where('file_type', 'image')->orderBy('sort_order');
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }
}
