<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seasonal_prices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('name_en');
            $table->string('name_ar')->nullable();
            $table->string('rule_type', 50)->default('season');
            $table->string('adjustment_type', 30)->default('fixed');
            $table->date('start_date');
            $table->date('end_date');
            $table->json('days_of_week')->nullable();
            $table->unsignedBigInteger('price_cents'); // nightly price in smallest unit
            $table->decimal('adjustment_percent', 5, 2)->nullable();
            $table->unsignedSmallInteger('priority')->default(1); // higher = wins overlap
            $table->unsignedSmallInteger('min_stay_nights')->nullable(); // overrides property default
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['property_id', 'start_date', 'end_date']);
            $table->index(['property_id', 'priority', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seasonal_prices');
    }
};
