<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_proofs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->cascadeOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->foreignId('payment_method_id')->nullable()->constrained('payment_methods')->nullOnDelete();
            $table->string('payment_method_code', 50)->default('manual');
            $table->unsignedBigInteger('amount_cents');
            $table->string('currency', 3)->default('EGP');
            $table->date('transfer_date')->nullable();
            $table->string('reference_number')->nullable()->index();
            $table->string('sender_name')->nullable();
            $table->string('sender_account')->nullable();
            $table->string('receipt_disk', 50)->default('receipts');
            $table->string('receipt_path');
            $table->string('receipt_original_name')->nullable();
            $table->string('receipt_mime_type', 100)->nullable();
            $table->unsignedBigInteger('receipt_size_bytes')->nullable();
            $table->text('customer_notes')->nullable();
            $table->enum('status', ['pending_verification', 'verified', 'rejected', 'cancelled'])
                ->default('pending_verification')
                ->index();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->foreignId('payment_transaction_id')->nullable()->constrained('payment_transactions')->nullOnDelete();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();

            $table->index(['booking_id', 'status']);
            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_proofs');
    }
};
