<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media', function (Blueprint $table) {
            $table->id();
            $table->morphs('mediable'); // polymorphic: property, experience, event, etc.
            $table->string('file_path');
            $table->string('file_name');
            $table->string('file_type'); // image, video
            $table->string('mime_type');
            $table->unsignedBigInteger('file_size')->default(0); // bytes
            $table->string('disk')->default('public');
            $table->string('alt_text_en')->nullable();
            $table->string('alt_text_ar')->nullable();
            $table->string('caption_en')->nullable();
            $table->string('caption_ar')->nullable();
            $table->string('title')->nullable();
            $table->string('thumb_path')->nullable();
            $table->string('medium_path')->nullable();
            $table->integer('width')->nullable();
            $table->integer('height')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->timestamps();
            $table->index(['mediable_type', 'mediable_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media');
    }
};
