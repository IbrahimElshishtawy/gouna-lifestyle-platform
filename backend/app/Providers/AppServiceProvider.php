<?php

namespace App\Providers;

use App\Logging\SensitiveDataRedactionProcessor;
use App\Models\BlogPost;
use App\Models\Booking;
use App\Models\Customer;
use App\Models\Event;
use App\Models\EventTicket;
use App\Models\Experience;
use App\Models\Faq;
use App\Models\Lead;
use App\Models\Media;
use App\Models\Page;
use App\Models\PaymentTransaction;
use App\Models\Property;
use App\Models\Setting;
use App\Models\User;
use App\Policies\BookingPolicy;
use App\Policies\CmsPolicy;
use App\Policies\CustomerPolicy;
use App\Policies\EventPolicy;
use App\Policies\EventTicketPolicy;
use App\Policies\ExperiencePolicy;
use App\Policies\LeadPolicy;
use App\Policies\MediaPolicy;
use App\Policies\PaymentPolicy;
use App\Policies\PropertyPolicy;
use App\Policies\SettingPolicy;
use App\Policies\UserPolicy;
use App\Shared\Application\Contracts\IdempotencyServiceInterface;
use App\Shared\Application\Contracts\LockManagerInterface;
use App\Shared\Infrastructure\Idempotency\IdempotencyService;
use App\Shared\Infrastructure\Locking\DatabaseLockManager;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
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
            LockManagerInterface::class,
            DatabaseLockManager::class
        );

        $this->app->singleton(
            IdempotencyServiceInterface::class,
            IdempotencyService::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Central Log Redaction Processor for Log Hygiene (P4-T11)
        try {
            Log::getLogger()->pushProcessor(new SensitiveDataRedactionProcessor);
        } catch (\Throwable) {
            // Safe fallback during early boot
        }

        // Named Rate Limiters (Standard S1, P4-T02)
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('auth', function (Request $request) {
            $email = strtolower((string) $request->input('email', ''));
            $ip = (string) $request->ip();

            return [
                Limit::perMinute(5)->by('auth_email:'.$email.'|'.$ip),
                Limit::perMinute(20)->by('auth_ip:'.$ip),
            ];
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

        RateLimiter::for('booking_confirmation', function (Request $request) {
            return Limit::perMinute(15)->by($request->ip());
        });
        // Model Policy Registrations (Standard S5)
        Gate::policy(Property::class, PropertyPolicy::class);
        Gate::policy(Booking::class, BookingPolicy::class);
        Gate::policy(Customer::class, CustomerPolicy::class);
        Gate::policy(PaymentTransaction::class, PaymentPolicy::class);
        Gate::policy(Lead::class, LeadPolicy::class);
        Gate::policy(Event::class, EventPolicy::class);
        Gate::policy(Experience::class, ExperiencePolicy::class);
        Gate::policy(EventTicket::class, EventTicketPolicy::class);
        Gate::policy(Media::class, MediaPolicy::class);
        Gate::policy(User::class, UserPolicy::class);
        Gate::policy(Setting::class, SettingPolicy::class);
        Gate::policy(Page::class, CmsPolicy::class);
        Gate::policy(BlogPost::class, CmsPolicy::class);
        Gate::policy(Faq::class, CmsPolicy::class);

        // Super admins have universal access except on sensitive invariant-protected user operations
        Gate::before(function (User $user, string $ability, array $arguments = []) {
            if (isset($arguments[0]) && $arguments[0] instanceof User && in_array($ability, ['delete', 'manageRoles'], true)) {
                return null;
            }

            if ($user->is_admin || $user->hasRole('super_admin')) {
                return true;
            }

            return null;
        });

        // Dynamic Gate fallback check for unhandled string abilities against user permissions
        Gate::after(function (User $user, string $ability, ?bool $result) {
            if ($result !== null) {
                return $result;
            }

            return $user->hasPermission($ability);
        });
    }
}
