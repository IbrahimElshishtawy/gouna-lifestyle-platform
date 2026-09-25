<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Immutable snapshot of nightly pricing per booking
        Schema::create('booking_nightly_prices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->date('night_date');
            $table->unsignedBigInteger('price_cents');
            $table->string('currency', 3)->default('EGP');
            $table->foreignId('seasonal_price_id')->nullable()->constrained('seasonal_prices')->nullOnDelete();
            $table->string('season_name')->nullable(); // snapshot
            $table->boolean('is_base_price')->default(false);
            $table->timestamps();

            $table->index(['booking_id', 'night_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_nightly_prices');
    }
};
