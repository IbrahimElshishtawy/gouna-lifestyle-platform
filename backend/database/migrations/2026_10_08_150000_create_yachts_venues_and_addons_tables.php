<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Venues
        Schema::create('venues', function (Blueprint $table) {
            $table->id();
            $table->foreignId('location_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->string('name_en');
            $table->string('name_ar')->nullable();
            $table->string('slug')->unique();
            $table->text('description_en')->nullable();
            $table->text('description_ar')->nullable();
            $table->string('venue_type', 50)->default('beach_club'); // beach_club, hotel, marina, plaza, villa, club, restaurant, other
            $table->unsignedInteger('capacity')->nullable();
            $table->string('address')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->string('map_url', 500)->nullable();
            $table->json('facilities')->nullable();
            $table->string('cover_image')->nullable();
            $table->enum('status', ['active', 'inactive', 'maintenance'])->default('active');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['venue_type', 'status']);
        });

        // 2. Extend Events with Venue and extra metadata
        Schema::table('events', function (Blueprint $table) {
            if (!Schema::hasColumn('events', 'venue_id')) {
                $table->foreignId('venue_id')->nullable()->constrained('venues')->nullOnDelete();
            }
            if (!Schema::hasColumn('events', 'doors_open_time')) {
                $table->time('doors_open_time')->nullable();
            }
            if (!Schema::hasColumn('events', 'age_restriction')) {
                $table->string('age_restriction', 50)->nullable();
            }
            if (!Schema::hasColumn('events', 'dress_code')) {
                $table->string('dress_code', 100)->nullable();
            }
            if (!Schema::hasColumn('events', 'rules_en')) {
                $table->text('rules_en')->nullable();
            }
            if (!Schema::hasColumn('events', 'rules_ar')) {
                $table->text('rules_ar')->nullable();
            }
        });

        // 3. Event Schedules (Timeline)
        Schema::create('event_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
            $table->string('title_en');
            $table->string('title_ar')->nullable();
            $table->text('description_en')->nullable();
            $table->text('description_ar')->nullable();
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->string('performer_name')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index(['event_id', 'sort_order']);
        });

        // 4. Performers / Artists
        Schema::create('event_performers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type', 50)->default('DJ'); // DJ, Singer, Band, Live Act, Host
            $table->text('description')->nullable();
            $table->string('image_url')->nullable();
            $table->json('social_links')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });

        Schema::create('event_performer', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
            $table->foreignId('event_performer_id')->constrained('event_performers')->cascadeOnDelete();
            $table->string('performance_time')->nullable();
            $table->string('role')->nullable();
            $table->timestamps();
        });

        // 5. Yachts Table
        Schema::create('yachts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('location_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->string('name_en');
            $table->string('name_ar')->nullable();
            $table->string('slug')->unique();
            $table->text('short_description_en')->nullable();
            $table->text('short_description_ar')->nullable();
            $table->longText('description_en')->nullable();
            $table->longText('description_ar')->nullable();
            $table->string('yacht_type', 50)->default('motor_yacht'); // motor_yacht, sailing_yacht, catamaran, superyacht, speedboat
            $table->string('category', 50)->default('luxury'); // luxury, sport, sunset, safari, island_hopping, party
            $table->string('brand')->nullable();
            $table->string('model')->nullable();
            $table->unsignedSmallInteger('year')->nullable();
            $table->unsignedSmallInteger('length_ft')->nullable();
            $table->unsignedSmallInteger('capacity')->default(10);
            $table->unsignedSmallInteger('crew_capacity')->default(2);
            $table->unsignedSmallInteger('cabins')->default(1);
            $table->unsignedSmallInteger('bathrooms')->default(1);
            $table->string('owner_partner_name')->nullable();
            $table->string('owner_partner_contact')->nullable();
            $table->enum('pricing_model', ['hourly', 'half_day', 'full_day', 'per_trip'])->default('hourly');
            $table->unsignedBigInteger('base_price_cents')->default(0);
            $table->string('currency', 3)->default('EGP');
            $table->unsignedBigInteger('weekend_price_cents')->nullable();
            $table->unsignedBigInteger('extra_hour_price_cents')->nullable();
            $table->unsignedBigInteger('security_deposit_cents')->nullable();
            $table->unsignedSmallInteger('min_duration_hours')->default(2);
            $table->string('marina_berth')->nullable();
            $table->string('address')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->string('map_url', 500)->nullable();
            $table->text('rules_en')->nullable();
            $table->text('rules_ar')->nullable();
            $table->text('cancellation_policy_en')->nullable();
            $table->text('cancellation_policy_ar')->nullable();
            $table->string('child_policy')->nullable();
            $table->string('pet_policy')->nullable();
            $table->string('cover_image')->nullable();
            $table->json('gallery')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->enum('status', ['draft', 'pending_approval', 'active', 'suspended', 'maintenance', 'inactive', 'archived'])->default('active');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'is_featured']);
            $table->index(['yacht_type', 'category']);
        });

        // 6. Yacht Packages
        Schema::create('yacht_packages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('yacht_id')->constrained('yachts')->cascadeOnDelete();
            $table->string('name_en');
            $table->string('name_ar')->nullable();
            $table->text('description_en')->nullable();
            $table->text('description_ar')->nullable();
            $table->decimal('duration_hours', 4, 1)->default(2.0);
            $table->unsignedSmallInteger('capacity')->nullable();
            $table->unsignedBigInteger('price_cents')->default(0);
            $table->string('currency', 3)->default('EGP');
            $table->json('inclusions_en')->nullable();
            $table->json('inclusions_ar')->nullable();
            $table->json('exclusions_en')->nullable();
            $table->json('exclusions_ar')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index(['yacht_id', 'status']);
        });

        // 7. Add-ons Table (Polymorphic: Yachts, Experiences, Events)
        Schema::create('addons', function (Blueprint $table) {
            $table->id();
            $table->nullableMorphs('addonable');
            $table->string('name_en');
            $table->string('name_ar')->nullable();
            $table->text('description_en')->nullable();
            $table->text('description_ar')->nullable();
            $table->unsignedBigInteger('price_cents')->default(0);
            $table->string('currency', 3)->default('EGP');
            $table->enum('pricing_model', ['per_booking', 'per_person', 'per_hour', 'per_item'])->default('per_booking');
            $table->unsignedSmallInteger('max_quantity')->nullable();
            $table->boolean('is_available')->default(true);
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();

            $table->index(['status', 'is_available']);
        });

        // 8. Yacht Availability Blocks
        Schema::create('yacht_availability_blocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('yacht_id')->constrained('yachts')->cascadeOnDelete();
            $table->date('start_date');
            $table->date('end_date');
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->enum('status', ['blocked', 'maintenance', 'booked', 'unavailable'])->default('blocked');
            $table->string('reason')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['yacht_id', 'start_date', 'end_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('yacht_availability_blocks');
        Schema::dropIfExists('addons');
        Schema::dropIfExists('yacht_packages');
        Schema::dropIfExists('yachts');
        Schema::dropIfExists('event_performer');
        Schema::dropIfExists('event_performers');
        Schema::dropIfExists('event_schedules');
        
        Schema::table('events', function (Blueprint $table) {
            if (Schema::hasColumn('events', 'venue_id')) {
                $table->dropForeign(['venue_id']);
                $table->dropColumn('venue_id');
            }
            if (Schema::hasColumn('events', 'doors_open_time')) {
                $table->dropColumn('doors_open_time');
            }
            if (Schema::hasColumn('events', 'age_restriction')) {
                $table->dropColumn('age_restriction');
            }
            if (Schema::hasColumn('events', 'dress_code')) {
                $table->dropColumn('dress_code');
            }
            if (Schema::hasColumn('events', 'rules_en')) {
                $table->dropColumn('rules_en');
            }
            if (Schema::hasColumn('events', 'rules_ar')) {
                $table->dropColumn('rules_ar');
            }
        });

        Schema::dropIfExists('venues');
    }
};
