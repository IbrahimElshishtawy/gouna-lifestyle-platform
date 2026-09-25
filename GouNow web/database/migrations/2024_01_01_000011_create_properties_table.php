<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->string('reference_number')->unique();
            $table->string('slug')->unique();
            $table->foreignId('property_category_id')->nullable()->constrained('property_categories')->nullOnDelete();
            $table->foreignId('location_id')->nullable()->constrained('locations')->nullOnDelete();

            // Bilingual content
            $table->string('title_en');
            $table->string('title_ar')->nullable();
            $table->text('short_description_en')->nullable();
            $table->text('short_description_ar')->nullable();
            $table->longText('description_en')->nullable();
            $table->longText('description_ar')->nullable();

            // Property type & listing type
            $table->enum('listing_type', ['rent', 'sale', 'both'])->default('rent');

            // Physical details
            $table->unsignedSmallInteger('bedrooms')->default(1);
            $table->unsignedSmallInteger('bathrooms')->default(1);
            $table->unsignedSmallInteger('max_guests')->default(2);
            $table->decimal('area_sqm', 8, 2)->nullable();
            $table->unsignedSmallInteger('floor')->nullable();
            $table->string('building')->nullable();
            $table->string('compound')->nullable();
            $table->text('address')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->string('map_url')->nullable();

            // Rental config
            $table->unsignedSmallInteger('min_stay_nights')->default(1);
            $table->unsignedSmallInteger('max_stay_nights')->nullable();
            $table->time('check_in_time')->default('15:00:00');
            $table->time('check_out_time')->default('11:00:00');

            // Pricing
            $table->unsignedBigInteger('base_price_cents')->default(0); // stored as smallest unit (piastres for EGP)
            $table->string('currency', 3)->default('EGP');
            $table->unsignedBigInteger('cleaning_fee_cents')->default(0);
            $table->unsignedBigInteger('service_fee_cents')->default(0);
            $table->decimal('tax_percentage', 5, 2)->default(0);
            $table->unsignedBigInteger('sale_price_cents')->nullable(); // for sale listings

            // Deposit / payment config
            $table->enum('payment_requirement', ['full', 'deposit', 'both'])->default('both');
            $table->decimal('deposit_percentage', 5, 2)->nullable();
            $table->unsignedBigInteger('deposit_fixed_cents')->nullable();

            // Booking mode
            $table->enum('booking_mode', ['instant', 'request', 'whatsapp', 'manual'])->default('instant');

            // Cancellation
            $table->enum('cancellation_policy', ['flexible', 'moderate', 'strict', 'non_refundable', 'custom'])->default('moderate');
            $table->text('cancellation_policy_text_en')->nullable();
            $table->text('cancellation_policy_text_ar')->nullable();

            // Rules / policies
            $table->text('house_rules_en')->nullable();
            $table->text('house_rules_ar')->nullable();

            // Status flags
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_published')->default(false);
            $table->boolean('is_available')->default(true);
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');

            // Developer info (for sale listings)
            $table->string('developer')->nullable();
            $table->enum('completion_status', ['ready', 'off_plan', 'under_construction'])->nullable();
            $table->enum('furnished_status', ['furnished', 'unfurnished', 'semi_furnished'])->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['listing_type', 'is_published', 'is_featured']);
            $table->index(['property_category_id', 'is_published']);
            $table->index(['location_id']);
            $table->index(['bedrooms', 'bathrooms']);
            $table->index(['base_price_cents']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
