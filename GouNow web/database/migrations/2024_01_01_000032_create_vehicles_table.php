<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name_en');
            $table->string('name_ar')->nullable();
            $table->string('brand');
            $table->string('model');
            $table->unsignedSmallInteger('year');
            $table->enum('transmission', ['automatic', 'manual'])->default('automatic');
            $table->enum('fuel_type', ['petrol', 'diesel', 'electric', 'hybrid'])->default('petrol');
            $table->unsignedSmallInteger('seats');
            $table->unsignedBigInteger('daily_price_cents');
            $table->unsignedBigInteger('weekly_price_cents')->nullable();
            $table->unsignedBigInteger('monthly_price_cents')->nullable();
            $table->unsignedBigInteger('deposit_cents')->nullable();
            $table->string('currency', 3)->default('EGP');
            $table->boolean('delivery_available')->default(false);
            $table->string('pickup_location')->nullable();
            $table->string('dropoff_location')->nullable();
            $table->text('insurance_info_en')->nullable();
            $table->text('insurance_info_ar')->nullable();
            $table->text('terms_en')->nullable();
            $table->text('terms_ar')->nullable();
            $table->text('features_en')->nullable();
            $table->text('features_ar')->nullable();
            $table->boolean('is_available')->default(true);
            $table->boolean('is_published')->default(false);
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
