<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('experiences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('experience_category_id')->nullable()->constrained('experience_categories')->nullOnDelete();
            $table->foreignId('location_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->string('slug')->unique();
            $table->string('title_en');
            $table->string('title_ar')->nullable();
            $table->text('short_description_en')->nullable();
            $table->text('short_description_ar')->nullable();
            $table->longText('description_en')->nullable();
            $table->longText('description_ar')->nullable();

            $table->enum('pricing_model', ['per_person', 'per_group', 'per_vehicle', 'per_day', 'per_hour', 'fixed'])->default('per_person');
            $table->unsignedBigInteger('base_price_cents')->default(0);
            $table->string('currency', 3)->default('EGP');
            $table->unsignedSmallInteger('max_capacity')->nullable();
            $table->string('duration')->nullable(); // e.g., '3 hours', '1 day'

            $table->enum('payment_requirement', ['full', 'deposit', 'both'])->default('full');
            $table->decimal('deposit_percentage', 5, 2)->nullable();
            $table->enum('booking_mode', ['instant', 'request', 'whatsapp', 'manual'])->default('instant');

            $table->text('cancellation_policy_en')->nullable();
            $table->text('cancellation_policy_ar')->nullable();
            $table->text('what_to_bring_en')->nullable();
            $table->text('what_to_bring_ar')->nullable();
            $table->text('meeting_point_en')->nullable();
            $table->text('meeting_point_ar')->nullable();

            $table->boolean('is_featured')->default(false);
            $table->boolean('is_published')->default(false);
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');

            $table->timestamps();
            $table->softDeletes();

            $table->index(['experience_category_id', 'is_published']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('experiences');
    }
};
