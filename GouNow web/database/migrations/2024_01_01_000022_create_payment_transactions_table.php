<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_id')->unique(); // internal UUID
            $table->foreignId('booking_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->foreignId('payment_method_id')->nullable()->constrained('payment_methods')->nullOnDelete();

            $table->unsignedBigInteger('amount_cents');
            $table->string('currency', 3)->default('EGP');

            $table->enum('type', ['payment', 'deposit', 'refund', 'adjustment'])->default('payment');
            $table->enum('status', ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'])->default('pending');

            // Gateway data
            $table->string('gateway_provider')->nullable(); // card, paypal, manual_cash, manual_bank
            $table->string('gateway_reference')->nullable(); // provider transaction ID
            $table->json('gateway_response')->nullable(); // raw response (no card data)

            // Manual payment
            $table->string('manual_reference')->nullable();
            $table->date('manual_payment_date')->nullable();
            $table->text('manual_notes')->nullable();
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();

            // Refund
            $table->unsignedBigInteger('refund_amount_cents')->default(0);
            $table->string('refund_reason')->nullable();
            $table->timestamp('refunded_at')->nullable();

            // Webhook
            $table->string('webhook_event_id')->nullable();
            $table->boolean('webhook_processed')->default(false);

            $table->string('failure_reason')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['booking_id', 'status']);
            $table->index(['gateway_reference']);
            $table->index(['webhook_event_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_transactions');
    }
};
