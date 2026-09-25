<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Super admins implicitly have all abilities
        Gate::before(function (User $user, string $ability) {
            if ($user->is_admin || $user->hasRole('super_admin')) {
                return true;
            }
            return null; // fallback to standard check
        });

        // Dynamic Gate check against role permissions
        Gate::after(function (User $user, string $ability, ?bool $result) {
            if ($result === true) {
                return true;
            }
            return $user->hasPermission($ability);
        });
    }
}
