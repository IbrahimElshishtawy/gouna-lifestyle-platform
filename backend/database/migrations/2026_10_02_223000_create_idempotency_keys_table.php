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
        Schema::create('idempotency_keys', function (Blueprint $table) {
            $table->id();
            $table->string('key', 64)->unique();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('route', 255);
            $table->string('request_hash', 64);
            $table->enum('status', ['pending', 'completed', 'failed'])->default('pending');
            $table->integer('response_code')->nullable();
            $table->json('response_body')->nullable();
            $table->json('response_headers')->nullable();
            $table->timestamp('expires_at')->index();
            $table->timestamps();

            $table->index(['key', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('idempotency_keys');
    }
};
