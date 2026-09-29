<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_methods', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique(); // card, paypal, cash, bank_transfer
            $table->text('description')->nullable();
            $table->string('logo')->nullable();
            $table->boolean('is_enabled')->default(true);
            $table->boolean('is_online')->default(true); // online vs manual
            $table->string('gateway_driver')->nullable(); // driver class name
            $table->boolean('test_mode')->default(true);
            $table->json('configuration')->nullable(); // encrypted gateway config
            $table->text('instructions_en')->nullable();
            $table->text('instructions_ar')->nullable();
            $table->decimal('transaction_fee_percentage', 5, 2)->default(0);
            $table->unsignedBigInteger('transaction_fee_fixed_cents')->default(0);
            $table->json('supported_currencies')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // Pivot: which payment methods are allowed per property
        Schema::create('payment_method_property', function (Blueprint $table) {
            $table->foreignId('property_id')->constrained()->cascadeOnDelete();
            $table->foreignId('payment_method_id')->constrained('payment_methods')->cascadeOnDelete();
            $table->boolean('is_enabled')->default(true);
            $table->primary(['property_id', 'payment_method_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_method_property');
        Schema::dropIfExists('payment_methods');
    }
};
