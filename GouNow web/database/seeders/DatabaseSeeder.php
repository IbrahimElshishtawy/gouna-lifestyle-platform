<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleAndPermissionSeeder::class,
            UserSeeder::class,
            SettingSeeder::class,
            LocationSeeder::class,
            AmenitySeeder::class,
            PaymentMethodSeeder::class,
            PropertyCategorySeeder::class,
            PropertySeeder::class,
            SeasonalPriceSeeder::class,
            ExperienceCategorySeeder::class,
            ExperienceSeeder::class,
            VehicleSeeder::class,
            EventSeeder::class,
            FeeAndDiscountSeeder::class,
            CmsSeeder::class,
            CustomerAndBookingSeeder::class,
        ]);
    }
}
