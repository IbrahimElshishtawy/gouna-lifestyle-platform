<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('discounts', function (Blueprint $table) {
            $table->id();
            $table->string('name_en');
            $table->string('name_ar')->nullable();
            $table->string('code')->nullable()->unique(); // promo code
            $table->enum('type', ['percentage', 'fixed'])->default('percentage');
            $table->decimal('value', 10, 2); // percentage or fixed amount
            $table->string('currency', 3)->nullable(); // for fixed type
            $table->boolean('applies_to_all')->default(true);
            $table->json('applicable_ids')->nullable(); // property/experience IDs
            $table->string('applicable_type')->nullable(); // property, experience, event
            $table->unsignedSmallInteger('min_stay_nights')->nullable();
            $table->unsignedBigInteger('min_booking_amount_cents')->nullable();
            $table->unsignedInteger('max_uses')->nullable();
            $table->unsignedInteger('used_count')->default(0);
            $table->date('valid_from')->nullable();
            $table->date('valid_until')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('discounts');
    }
};
