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
        $this->app->singleton(
            \App\Shared\Application\Contracts\LockManagerInterface::class,
            \App\Shared\Infrastructure\Locking\DatabaseLockManager::class
        );

        $this->app->singleton(
            \App\Shared\Application\Contracts\IdempotencyServiceInterface::class,
            \App\Shared\Infrastructure\Idempotency\IdempotencyService::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Rate limiting definitions
        \Illuminate\Support\Facades\RateLimiter::for('checkout', function (\Illuminate\Http\Request $request) {
            return \Illuminate\Cache\RateLimiting\Limit::perMinute(30)->by($request->ip());
        });

        \Illuminate\Support\Facades\RateLimiter::for('inquiries', function (\Illuminate\Http\Request $request) {
            return \Illuminate\Cache\RateLimiting\Limit::perMinute(20)->by($request->ip());
        });

        \Illuminate\Support\Facades\RateLimiter::for('quote', function (\Illuminate\Http\Request $request) {
            return \Illuminate\Cache\RateLimiting\Limit::perMinute(60)->by($request->ip());
        });

        \Illuminate\Support\Facades\RateLimiter::for('admin_login', function (\Illuminate\Http\Request $request) {
            return \Illuminate\Cache\RateLimiting\Limit::perMinute(10)->by($request->ip());
        });

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
