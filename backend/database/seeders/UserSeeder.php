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

        // Super Admin
        $admin = User::firstOrCreate(
            ['email' => env('ADMIN_EMAIL', 'admin@gounow.com')],
            [
                'name' => 'Gounow Super Admin',
                'password' => Hash::make(env('ADMIN_PASSWORD', 'GouNow@2026!Secure')),
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

        // Property Manager Demo User
        $pm = User::firstOrCreate(
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

        // Events & Experiences Demo User
        $eventsUser = User::firstOrCreate(
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
