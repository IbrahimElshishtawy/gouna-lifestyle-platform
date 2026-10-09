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

    protected $appends = ['url', 'thumb_url', 'alt_text'];

    public function mediable(): MorphTo
    {
        return $this->morphTo();
    }

    public function getUrlAttribute(): string
    {
        if (empty($this->file_path)) {
            return $this->getDefaultFallbackUrl();
        }

        $path = $this->file_path;

        // If it starts with http:// or https:// directly
        if (preg_match('/^https?:\/\//i', $path)) {
            return $path;
        }

        // If it was inadvertently saved as storage/https://... or similar
        if (preg_match('/storage\/(https?:\/\/.*)/i', $path, $matches)) {
            return $matches[1];
        }

        // Static frontend assets
        if (str_starts_with($path, '/assets/') || str_starts_with($path, '/images/')) {
            return $path;
        }

        // Storage relative or absolute path
        if (str_starts_with($path, '/storage/')) {
            $storageRel = ltrim(substr($path, strlen('/storage/')), '/');
            if (Storage::disk('public')->exists($storageRel)) {
                return asset(ltrim($path, '/'));
            }
            return $this->getDefaultFallbackUrl();
        }

        $disk = $this->disk ?? 'public';
        if ($disk === 'public') {
            if (! Storage::disk('public')->exists($path)) {
                return $this->getDefaultFallbackUrl();
            }
            return Storage::disk('public')->url($path);
        }

        return Storage::disk($disk)->url($path);
    }

    public function getThumbUrlAttribute(): ?string
    {
        if ($this->thumb_path) {
            if (preg_match('/^https?:\/\//i', $this->thumb_path)) {
                return $this->thumb_path;
            }
            if (preg_match('/storage\/(https?:\/\/.*)/i', $this->thumb_path, $matches)) {
                return $matches[1];
            }
            if (Storage::disk($this->disk ?? 'public')->exists($this->thumb_path)) {
                return Storage::disk($this->disk ?? 'public')->url($this->thumb_path);
            }
        }

        return $this->url;
    }

    public function getDefaultFallbackUrl(): string
    {
        $pool = [
            'App\Models\Property' => [
                'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1400&q=80',
                'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=80',
                'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1400&q=80',
            ],
            'App\Models\Yacht' => [
                'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
            ],
            'App\Models\Experience' => [
                'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
            ],
            'App\Models\Event' => [
                'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
            ],
        ];

        $list = $pool[$this->mediable_type] ?? [
            'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1400&q=80',
        ];

        $index = abs((int) ($this->id ?: 1)) % count($list);
        return $list[$index];
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
