<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seo_metadata', function (Blueprint $table) {
            $table->id();
            $table->nullableMorphs('seoable'); // property, experience, event, page, etc.
            $table->string('locale', 5)->default('en');
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->string('canonical_url')->nullable();
            $table->string('og_title')->nullable();
            $table->text('og_description')->nullable();
            $table->string('og_image')->nullable();
            $table->string('twitter_title')->nullable();
            $table->text('twitter_description')->nullable();
            $table->string('twitter_image')->nullable();
            $table->boolean('no_index')->default(false);
            $table->boolean('no_follow')->default(false);
            $table->json('schema_markup')->nullable(); // custom JSON-LD override
            $table->timestamps();

            $table->index(['seoable_type', 'seoable_id', 'locale']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seo_metadata');
    }
};
