<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dateTime('expires_at')->nullable()->after('status')->index();
            $table->string('booking_access_token', 64)->nullable()->after('expires_at')->index();
            $table->string('idempotency_key', 64)->nullable()->after('booking_access_token')->index();
            $table->json('pricing_snapshot')->nullable()->after('idempotency_key');
            $table->json('cancellation_policy_snapshot')->nullable()->after('pricing_snapshot');

            $table->index(['bookable_type', 'bookable_id', 'status', 'check_in', 'check_out'], 'bookings_availability_search_idx');
        });

        // PostgreSQL exclusion constraint for physical database-level double-booking prevention (P5-T04)
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('CREATE EXTENSION IF NOT EXISTS btree_gist;');
            DB::statement("
                ALTER TABLE bookings 
                ADD CONSTRAINT bookings_no_double_booking 
                EXCLUDE USING gist (
                    bookable_id WITH =, 
                    daterange(check_in, check_out, '[)') WITH &&
                ) 
                WHERE (
                    status IN ('confirmed', 'paid', 'completed', 'pending', 'awaiting_payment', 'partially_paid', 'payment_processing') 
                    AND deleted_at IS NULL
                );
            ");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_no_double_booking;');
        }

        Schema::table('bookings', function (Blueprint $table) {
            $table->dropIndex('bookings_availability_search_idx');
            $table->dropIndex(['expires_at']);
            $table->dropIndex(['booking_access_token']);
            $table->dropIndex(['idempotency_key']);

            $table->dropColumn([
                'expires_at',
                'booking_access_token',
                'idempotency_key',
                'pricing_snapshot',
                'cancellation_policy_snapshot',
            ]);
        });
    }
};
