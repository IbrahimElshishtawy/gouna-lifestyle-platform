<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Bookings concurrency & lookup optimization
        Schema::table('bookings', function (Blueprint $table) {
            $table->index(
                ['bookable_type', 'bookable_id', 'status', 'check_in', 'check_out'],
                'idx_bookings_concurrency_conflict'
            );
            $table->index(['status', 'created_at'], 'idx_bookings_status_created');
        });

        // 2. Payment Transactions idempotency & unique webhook replay protection
        Schema::table('payment_transactions', function (Blueprint $table) {
            $table->string('idempotency_key', 64)->nullable()->unique()->after('transaction_id');
            // Drop non-unique index and replace with unique constraint if supported
            $table->dropIndex(['webhook_event_id']);
            $table->unique('webhook_event_id', 'uq_payment_transactions_webhook_event');
        });

        // 3. Properties catalog filtering indexes
        Schema::table('properties', function (Blueprint $table) {
            $table->index(
                ['status', 'is_published', 'listing_type', 'is_featured'],
                'idx_properties_catalog_filter'
            );
            $table->index('base_price_cents', 'idx_properties_base_price');
            $table->index('sale_price_cents', 'idx_properties_sale_price');
        });

        // 4. Seasonal prices covered lookup index
        Schema::table('seasonal_prices', function (Blueprint $table) {
            $table->index(
                ['property_id', 'is_active', 'start_date', 'end_date', 'priority'],
                'idx_seasonal_prices_lookup'
            );
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropIndex('idx_bookings_concurrency_conflict');
            $table->dropIndex('idx_bookings_status_created');
        });

        Schema::table('payment_transactions', function (Blueprint $table) {
            $table->dropUnique('uq_payment_transactions_webhook_event');
            $table->dropColumn('idempotency_key');
            $table->index(['webhook_event_id']);
        });

        Schema::table('properties', function (Blueprint $table) {
            $table->dropIndex('idx_properties_catalog_filter');
            $table->dropIndex('idx_properties_base_price');
            $table->dropIndex('idx_properties_sale_price');
        });

        Schema::table('seasonal_prices', function (Blueprint $table) {
            $table->dropIndex('idx_seasonal_prices_lookup');
        });
    }
};
