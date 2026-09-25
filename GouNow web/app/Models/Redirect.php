<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Redirect extends Model
{
    protected $fillable = ['from_url', 'to_url', 'status_code', 'is_active', 'hit_count'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean', 'hit_count' => 'integer'];
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
