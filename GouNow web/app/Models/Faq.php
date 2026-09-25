<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Faq extends Model
{
    use HasFactory;

    protected $fillable = ['group', 'question_en', 'question_ar', 'answer_en', 'answer_ar', 'is_published', 'sort_order'];

    protected function casts(): array
    {
        return ['is_published' => 'boolean'];
    }

    public function getQuestionAttribute(): string
    {
        return app()->getLocale() === 'ar' && $this->question_ar ? $this->question_ar : $this->question_en;
    }

    public function getAnswerAttribute(): string
    {
        return app()->getLocale() === 'ar' && $this->answer_ar ? $this->answer_ar : $this->answer_en;
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true)->orderBy('sort_order');
    }
}
