<?php

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
        Schema::create('admin_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedBigInteger('token_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->string('device', 120)->nullable();
            $table->timestamp('started_at')->useCurrent()->index();
            $table->timestamp('last_activity_at')->useCurrent()->index();
            $table->timestamp('ended_at')->nullable()->index();
            $table->unsignedInteger('duration_seconds')->default(0)->index();
            $table->string('status', 30)->default('active')->index(); // 'active', 'completed', 'terminated', 'expired'
            $table->string('termination_reason', 100)->nullable(); // 'logout', 'force_logout_by_superadmin', 'timeout', 'suspended'
            $table->foreignId('terminated_by_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admin_sessions');
    }
};
