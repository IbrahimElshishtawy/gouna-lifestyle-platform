<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique(); // GON-2026-000123
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();

            // Polymorphic bookable: property, experience, vehicle
            $table->nullableMorphs('bookable');

            // Dates
            $table->date('check_in');
            $table->date('check_out');
            $table->unsignedSmallInteger('nights'); // computed: check_out - check_in
            $table->unsignedSmallInteger('guests')->default(1);

            // Financial snapshot (all in cents, immutable after confirmation)
            $table->unsignedBigInteger('subtotal_cents')->default(0);     // nightly total
            $table->unsignedBigInteger('cleaning_fee_cents')->default(0);
            $table->unsignedBigInteger('service_fee_cents')->default(0);
            $table->unsignedBigInteger('tax_cents')->default(0);
            $table->unsignedBigInteger('discount_cents')->default(0);
            $table->unsignedBigInteger('total_cents')->default(0);        // final total
            $table->unsignedBigInteger('deposit_cents')->default(0);      // required deposit
            $table->unsignedBigInteger('amount_paid_cents')->default(0);  // running total paid
            $table->unsignedBigInteger('amount_remaining_cents')->default(0);
            $table->string('currency', 3)->default('EGP');

            // Payment config at time of booking
            $table->enum('payment_type', ['full', 'deposit'])->default('full');
            $table->foreignId('payment_method_id')->nullable()->constrained('payment_methods')->nullOnDelete();

            // Status
            $table->enum('status', [
                'draft', 'pending', 'awaiting_payment', 'payment_processing',
                'partially_paid', 'paid', 'confirmed', 'cancelled', 'rejected',
                'expired', 'completed', 'refund_requested', 'refunded'
            ])->default('draft')->index();

            $table->enum('payment_status', [
                'unpaid', 'pending', 'partially_paid', 'paid', 'failed', 'refunded', 'partially_refunded'
            ])->default('unpaid')->index();

            // Discount
            $table->foreignId('discount_id')->nullable()->constrained('discounts')->nullOnDelete();
            $table->string('promo_code')->nullable();

            // Remaining balance
            $table->date('balance_due_date')->nullable();

            // Admin
            $table->text('internal_notes')->nullable();
            $table->string('source')->nullable(); // website, whatsapp, phone, direct
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();

            // Cancellation
            $table->timestamp('cancelled_at')->nullable();
            $table->string('cancellation_reason')->nullable();
            $table->unsignedBigInteger('refund_amount_cents')->default(0);

            $table->timestamps();
            $table->softDeletes();

            $table->index(['customer_id', 'status']);
            $table->index(['check_in', 'check_out']);
            $table->index(['status', 'payment_status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
