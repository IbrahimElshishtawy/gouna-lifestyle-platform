<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('homepage_sections', function (Blueprint $table) {
            $table->id();
            $table->string('section_key')->unique(); // hero, intro, featured_stays, experiences, etc.
            $table->string('title_en')->nullable();
            $table->string('title_ar')->nullable();
            $table->text('subtitle_en')->nullable();
            $table->text('subtitle_ar')->nullable();
            $table->longText('content_en')->nullable();
            $table->longText('content_ar')->nullable();
            $table->string('cta_text_en')->nullable();
            $table->string('cta_text_ar')->nullable();
            $table->string('cta_url')->nullable();
            $table->string('background_image')->nullable();
            $table->string('background_video')->nullable();
            $table->json('extra_data')->nullable(); // section-specific config
            $table->boolean('is_visible')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('homepage_sections');
    }
};
