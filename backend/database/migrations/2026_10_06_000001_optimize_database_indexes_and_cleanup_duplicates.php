<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Clean up duplicate index in properties table
        Schema::table('properties', function (Blueprint $table) {
            $table->dropIndex('idx_properties_base_price');
        });

        // 2. Clean up duplicate index in bookings table and add staff assignment index
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropIndex('bookings_availability_search_idx');
            $table->index('assigned_to', 'idx_bookings_assigned_to');
        });

        // 3. Add authenticated user lookup index on customers
        Schema::table('customers', function (Blueprint $table) {
            $table->index('user_id', 'idx_customers_user_id');
        });

        // 4. Add staff assignment lookup index on leads
        Schema::table('leads', function (Blueprint $table) {
            $table->index('assigned_to', 'idx_leads_assigned_to');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->dropIndex('idx_leads_assigned_to');
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->dropIndex('idx_customers_user_id');
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->dropIndex('idx_bookings_assigned_to');
            $table->index(
                ['bookable_type', 'bookable_id', 'status', 'check_in', 'check_out'],
                'bookings_availability_search_idx'
            );
        });

        Schema::table('properties', function (Blueprint $table) {
            $table->index('base_price_cents', 'idx_properties_base_price');
        });
    }
};
