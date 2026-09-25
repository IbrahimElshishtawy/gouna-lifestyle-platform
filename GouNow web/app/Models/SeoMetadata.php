<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class SeoMetadata extends Model
{
    protected $fillable = [
        'locale', 'meta_title', 'meta_description', 'canonical_url',
        'og_title', 'og_description', 'og_image',
        'twitter_title', 'twitter_description', 'twitter_image',
        'no_index', 'no_follow', 'schema_markup',
    ];

    protected function casts(): array
    {
        return [
            'no_index' => 'boolean',
            'no_follow' => 'boolean',
            'schema_markup' => 'array',
        ];
    }

    public function seoable(): MorphTo
    {
        return $this->morphTo();
    }
}
