<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->foreignId('payment_method_id')->nullable()->constrained('payment_methods')->nullOnDelete();
            $table->unsignedBigInteger('total_cents');
            $table->string('currency', 3)->default('EGP');
            $table->enum('status', ['pending', 'paid', 'cancelled', 'refunded'])->default('pending')->index();
            $table->enum('payment_status', ['unpaid', 'paid', 'refunded'])->default('unpaid');
            $table->string('gateway_reference')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('event_tickets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('event_ticket_type_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->string('ticket_number')->unique();
            $table->string('qr_token', 64)->unique(); // signed random token
            $table->unsignedBigInteger('price_cents');
            $table->string('currency', 3)->default('EGP');
            $table->enum('status', ['valid', 'used', 'cancelled', 'refunded', 'expired'])->default('valid')->index();
            $table->timestamp('used_at')->nullable();
            $table->foreignId('scanned_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['event_id', 'status']);
        });

        Schema::create('ticket_scans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_ticket_id')->constrained()->cascadeOnDelete();
            $table->foreignId('scanned_by')->constrained('users')->cascadeOnDelete();
            $table->string('result'); // success, already_used, invalid, expired
            $table->string('device_info')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ticket_scans');
        Schema::dropIfExists('event_tickets');
        Schema::dropIfExists('event_orders');
    }
};
