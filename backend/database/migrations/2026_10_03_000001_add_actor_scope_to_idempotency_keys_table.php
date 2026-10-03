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
        Schema::table('idempotency_keys', function (Blueprint $table) {
            $table->string('actor_scope', 128)->default('global')->after('key');
        });

        // Populate existing rows with actor scope derived from user_id if present
        DB::table('idempotency_keys')->whereNotNull('user_id')->update([
            'actor_scope' => DB::raw("CONCAT('user:', user_id)"),
        ]);

        Schema::table('idempotency_keys', function (Blueprint $table) {
            // Drop global unique constraint on key
            $table->dropUnique(['key']);

            // Add composite unique constraint on (actor_scope, key)
            $table->unique(['actor_scope', 'key'], 'uq_idempotency_actor_key');
            $table->index(['actor_scope', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('idempotency_keys', function (Blueprint $table) {
            $table->dropUnique('uq_idempotency_actor_key');
            $table->dropIndex(['actor_scope', 'status']);
            $table->unique('key');
            $table->dropColumn('actor_scope');
        });
    }
};
