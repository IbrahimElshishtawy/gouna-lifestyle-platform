<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class CreateAdminAccountsSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Ensure Roles exist
        $superAdminRole = Role::firstOrCreate(
            ['name' => 'super_admin'],
            [
                'display_name' => 'Super Administrator',
                'description' => 'Full access to all system features.',
                'is_system' => true,
            ]
        );

        $adminRole = Role::firstOrCreate(
            ['name' => 'admin'],
            [
                'display_name' => 'Administrator',
                'description' => 'System Administrator with operational access.',
                'is_system' => true,
            ]
        );

        $allPermissionIds = Permission::pluck('id');
        $superAdminRole->permissions()->sync($allPermissionIds);
        $adminRole->permissions()->sync($allPermissionIds);

        // 2. Super Admin Account
        $superAdmin = User::updateOrCreate(
            ['email' => 'superadmin@gounow.com'],
            [
                'name' => 'GouNow Super Admin',
                'password' => Hash::make('SuperAdmin@2026!'),
                'phone' => '+201000000001',
                'locale' => 'en',
                'is_admin' => true,
                'is_active' => true,
                'email_verified_at' => now(),
                'two_factor_confirmed_at' => null,
                'two_factor_secret' => null,
            ]
        );
        $superAdmin->roles()->sync([$superAdminRole->id]);

        // 3. Admin Account
        $admin = User::updateOrCreate(
            ['email' => 'admin@gounow.com'],
            [
                'name' => 'GouNow Admin',
                'password' => Hash::make('Admin@2026!'),
                'phone' => '+201000000002',
                'locale' => 'en',
                'is_admin' => true,
                'is_active' => true,
                'email_verified_at' => now(),
                'two_factor_confirmed_at' => null,
                'two_factor_secret' => null,
            ]
        );
        $salesRole = Role::firstOrCreate(
            ['name' => 'sales'],
            [
                'display_name' => 'Sales Representative',
                'description' => 'Real estate & experiences sales agent.',
                'is_system' => true,
            ]
        );

        // 4. Sales Account
        $sales = User::updateOrCreate(
            ['email' => 'sales@gounow.com'],
            [
                'name' => 'GouNow Sales Agent',
                'password' => Hash::make('GouNow@2026!Secure'),
                'phone' => '+201000000003',
                'locale' => 'en',
                'is_admin' => true,
                'is_active' => true,
                'email_verified_at' => now(),
                'two_factor_confirmed_at' => null,
                'two_factor_secret' => null,
            ]
        );
        $sales->roles()->sync([$salesRole->id]);

        $this->command->info('Created accounts successfully:');
        $this->command->info('Super Admin: superadmin@gounow.com | Password: SuperAdmin@2026!');
        $this->command->info('Admin: admin@gounow.com | Password: Admin@2026!');
        $this->command->info('Sales: sales@gounow.com | Password: GouNow@2026!Secure');
    }
}
