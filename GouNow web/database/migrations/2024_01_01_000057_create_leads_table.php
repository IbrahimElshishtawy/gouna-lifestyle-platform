<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('type')->default('inquiry'); // inquiry, property_sale, contact, whatsapp
            $table->string('source')->nullable(); // website, google, organic, facebook, instagram, whatsapp, direct
            $table->text('message')->nullable();
            $table->nullableMorphs('leadable'); // property, experience, event
            $table->enum('status', ['new', 'contacted', 'qualified', 'closed', 'rejected'])->default('new')->index();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->text('admin_notes')->nullable();
            // Property sale specific
            $table->string('property_location')->nullable();
            $table->string('property_type')->nullable();
            $table->unsignedSmallInteger('property_bedrooms')->nullable();
            $table->decimal('property_area_sqm', 8, 2)->nullable();
            $table->unsignedBigInteger('expected_price_cents')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['email', 'status']);
            $table->index(['source']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leads');
    }
};
