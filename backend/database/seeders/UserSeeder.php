<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $superAdminRole = Role::where('name', 'super_admin')->first();
        $propertyManagerRole = Role::where('name', 'property_manager')->first();
        $eventsManagerRole = Role::where('name', 'events_manager')->first();
        $salesRole = Role::where('name', 'sales')->first();

        // 1. Super Admin (matches quick-fill: superadmin@gounow.com / SuperAdmin@2026!)
        $superAdmin = User::updateOrCreate(
            ['email' => 'superadmin@gounow.com'],
            [
                'name' => 'Gounow Super Admin',
                'password' => Hash::make('SuperAdmin@2026!'),
                'phone' => '+201000000000',
                'locale' => 'ar',
                'is_admin' => true,
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        if ($superAdminRole) {
            $superAdmin->roles()->syncWithoutDetaching([$superAdminRole->id]);
        }

        // 2. Administrator (matches quick-fill: admin@gounow.com / Admin@2026!)
        $admin = User::updateOrCreate(
            ['email' => 'admin@gounow.com'],
            [
                'name' => 'Gounow Administrator',
                'password' => Hash::make('Admin@2026!'),
                'phone' => '+201000000001',
                'locale' => 'en',
                'is_admin' => true,
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        if ($superAdminRole) {
            $admin->roles()->syncWithoutDetaching([$superAdminRole->id]);
        }

        // 3. Sales Demo User (matches quick-fill: sales@gounow.com / GouNow@2026!Secure)
        $sales = User::updateOrCreate(
            ['email' => 'sales@gounow.com'],
            [
                'name' => 'El Gouna Sales Agent',
                'password' => Hash::make('GouNow@2026!Secure'),
                'phone' => '+201000000004',
                'locale' => 'ar',
                'is_admin' => false,
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        if ($salesRole) {
            $sales->roles()->syncWithoutDetaching([$salesRole->id]);
        }

        // 4. Property Manager Demo User
        $pm = User::updateOrCreate(
            ['email' => 'stays@gounow.com'],
            [
                'name' => 'El Gouna Stays Team',
                'password' => Hash::make('GouNow@Stays2026'),
                'phone' => '+201000000002',
                'locale' => 'en',
                'is_admin' => false,
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        if ($propertyManagerRole) {
            $pm->roles()->syncWithoutDetaching([$propertyManagerRole->id]);
        }

        // 5. Events & Experiences Demo User
        $eventsUser = User::updateOrCreate(
            ['email' => 'events@gounow.com'],
            [
                'name' => 'El Gouna Events Team',
                'password' => Hash::make('GouNow@Events2026'),
                'phone' => '+201000000003',
                'locale' => 'en',
                'is_admin' => false,
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        if ($eventsManagerRole) {
            $eventsUser->roles()->syncWithoutDetaching([$eventsManagerRole->id]);
        }
    }
}
