<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
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
        // Named Rate Limiters (Standard S1)
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('auth', function (Request $request) {
            $key = $request->ip().'|'.strtolower((string) $request->input('email', ''));
            return Limit::perMinute(5)->by($key);
        });

        RateLimiter::for('booking', function (Request $request) {
            return Limit::perMinute(10)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('payment', function (Request $request) {
            return Limit::perMinute(5)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('webhooks', function (Request $request) {
            return Limit::perMinute(120)->by($request->ip());
        });

        // Backward compatibility rate limiters for existing characterization tests
        RateLimiter::for('checkout', function (Request $request) {
            return Limit::perMinute(30)->by($request->ip());
        });

        RateLimiter::for('inquiries', function (Request $request) {
            return Limit::perMinute(20)->by($request->ip());
        });

        RateLimiter::for('quote', function (Request $request) {
            return Limit::perMinute(60)->by($request->ip());
        });

        RateLimiter::for('admin_login', function (Request $request) {
            return Limit::perMinute(10)->by($request->ip());
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
