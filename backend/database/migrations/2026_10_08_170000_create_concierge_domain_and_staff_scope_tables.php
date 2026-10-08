<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Add scope column to users table if missing
        if (!Schema::hasColumn('users', 'scope')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('scope')->default('all')->after('is_admin');
            });
        }

        // 2. Concierge Requests table
        if (!Schema::hasTable('concierge_requests')) {
            Schema::create('concierge_requests', function (Blueprint $table) {
                $table->id();
                $table->string('request_number')->unique();
                $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
                $table->string('customer_name');
                $table->string('customer_email');
                $table->string('customer_phone')->nullable();
                $table->string('request_type')->default('custom'); // yacht, experience, event, stay, transportation, dining, celebration, custom
                $table->string('priority')->default('normal'); // low, normal, high, urgent
                $table->string('status')->default('new'); // new, assigned, in_progress, waiting_customer, waiting_partner, quoted, confirmed, completed, cancelled, rejected, escalated
                $table->text('description');
                $table->date('preferred_date')->nullable();
                $table->string('preferred_time')->nullable();
                $table->string('location')->nullable();
                $table->unsignedInteger('guests_count')->nullable();
                $table->unsignedBigInteger('budget_cents')->nullable();
                $table->string('currency', 10)->default('EGP');
                $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('assigned_at')->nullable();
                $table->foreignId('booking_id')->nullable()->constrained('bookings')->nullOnDelete();
                $table->foreignId('order_id')->nullable()->constrained('event_orders')->nullOnDelete();
                $table->text('internal_notes')->nullable();
                $table->string('cancellation_reason')->nullable();
                $table->timestamp('resolved_at')->nullable();
                $table->timestamps();
                $table->softDeletes();

                $table->index(['status', 'priority']);
                $table->index(['assigned_to', 'status']);
                $table->index(['customer_id', 'created_at']);
                $table->index('request_type');
                $table->index('created_at');
            });
        }

        // 3. Concierge Internal and Customer Notes
        if (!Schema::hasTable('concierge_notes')) {
            Schema::create('concierge_notes', function (Blueprint $table) {
                $table->id();
                $table->foreignId('concierge_request_id')->constrained('concierge_requests')->cascadeOnDelete();
                $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('author_name');
                $table->text('content');
                $table->boolean('is_customer_visible')->default(false);
                $table->timestamps();

                $table->index(['concierge_request_id', 'created_at']);
                $table->index('is_customer_visible');
            });
        }

        // 4. Concierge Quotes table
        if (!Schema::hasTable('concierge_quotes')) {
            Schema::create('concierge_quotes', function (Blueprint $table) {
                $table->id();
                $table->foreignId('concierge_request_id')->constrained('concierge_requests')->cascadeOnDelete();
                $table->string('quote_number')->unique();
                $table->string('status')->default('draft'); // draft, sent, accepted, rejected, expired, cancelled
                $table->string('currency', 10)->default('EGP');
                $table->unsignedBigInteger('subtotal_cents')->default(0);
                $table->unsignedBigInteger('discount_cents')->default(0);
                $table->unsignedBigInteger('fees_cents')->default(0);
                $table->unsignedBigInteger('total_cents')->default(0);
                $table->timestamp('valid_until')->nullable();
                $table->text('notes')->nullable();
                $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('accepted_at')->nullable();
                $table->foreignId('booking_id')->nullable()->constrained('bookings')->nullOnDelete();
                $table->timestamps();

                $table->index(['concierge_request_id', 'status']);
            });
        }

        // 5. Concierge Quote Items table
        if (!Schema::hasTable('concierge_quote_items')) {
            Schema::create('concierge_quote_items', function (Blueprint $table) {
                $table->id();
                $table->foreignId('concierge_quote_id')->constrained('concierge_quotes')->cascadeOnDelete();
                $table->string('item_type'); // yacht, yacht_package, addon, experience, event_ticket, stay, custom
                $table->unsignedBigInteger('reference_id')->nullable();
                $table->string('title');
                $table->text('description')->nullable();
                $table->unsignedInteger('quantity')->default(1);
                $table->unsignedBigInteger('unit_price_cents')->default(0);
                $table->unsignedBigInteger('total_price_cents')->default(0);
                $table->json('metadata')->nullable();
                $table->timestamps();

                $table->index(['concierge_quote_id', 'item_type']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('concierge_quote_items');
        Schema::dropIfExists('concierge_quotes');
        Schema::dropIfExists('concierge_notes');
        Schema::dropIfExists('concierge_requests');

        if (Schema::hasColumn('users', 'scope')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('scope');
            });
        }
    }
};
