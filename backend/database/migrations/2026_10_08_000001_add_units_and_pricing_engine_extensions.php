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
        // 1. Add parent_id and unit attributes to properties table
        Schema::table('properties', function (Blueprint $table) {
            if (!Schema::hasColumn('properties', 'parent_id')) {
                $table->foreignId('parent_id')
                    ->nullable()
                    ->after('id')
                    ->constrained('properties')
                    ->onDelete('cascade');
            }
            if (!Schema::hasColumn('properties', 'unit_number')) {
                $table->string('unit_number', 100)->nullable()->after('reference_number');
            }
            if (!Schema::hasColumn('properties', 'view')) {
                $table->string('view', 150)->nullable()->after('compound');
            }
        });

        // 2. Extend seasonal_prices for global rules, weekend rules, and holiday rules
        Schema::table('seasonal_prices', function (Blueprint $table) {
            if (Schema::hasColumn('seasonal_prices', 'property_id')) {
                $table->unsignedBigInteger('property_id')->nullable()->change();
            }
            if (!Schema::hasColumn('seasonal_prices', 'rule_type')) {
                $table->string('rule_type', 50)->default('season')->after('property_id');
            }
            if (!Schema::hasColumn('seasonal_prices', 'adjustment_type')) {
                $table->string('adjustment_type', 30)->default('fixed')->after('rule_type');
            }
            if (!Schema::hasColumn('seasonal_prices', 'adjustment_percent')) {
                $table->decimal('adjustment_percent', 5, 2)->nullable()->after('price_cents');
            }
            if (!Schema::hasColumn('seasonal_prices', 'days_of_week')) {
                $table->json('days_of_week')->nullable()->after('end_date');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            if (Schema::hasColumn('properties', 'parent_id')) {
                $table->dropForeign(['parent_id']);
                $table->dropColumn('parent_id');
            }
            if (Schema::hasColumn('properties', 'unit_number')) {
                $table->dropColumn('unit_number');
            }
            if (Schema::hasColumn('properties', 'view')) {
                $table->dropColumn('view');
            }
        });

        Schema::table('seasonal_prices', function (Blueprint $table) {
            if (Schema::hasColumn('seasonal_prices', 'rule_type')) {
                $table->dropColumn('rule_type');
            }
            if (Schema::hasColumn('seasonal_prices', 'adjustment_type')) {
                $table->dropColumn('adjustment_type');
            }
            if (Schema::hasColumn('seasonal_prices', 'adjustment_percent')) {
                $table->dropColumn('adjustment_percent');
            }
            if (Schema::hasColumn('seasonal_prices', 'days_of_week')) {
                $table->dropColumn('days_of_week');
            }
        });
    }
};
