<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Illuminate\View\View;

class LoginController extends Controller
{
    private const DUMMY_HASH = '$2y$12$e80e1yW38eC3sUa8kS.kSeWJc6/p1k.3uF1gO5M0z1q9N2v4j6y6.';

    /**
     * Show the admin login form.
     */
    public function showLoginForm(): View|RedirectResponse
    {
        if (Auth::check()) {
            return redirect()->route('admin.dashboard');
        }

        return view('auth.login');
    }

    /**
     * Process an admin login attempt.
     */
    public function login(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        $email = Str::lower($request->input('email'));
        $ip = $request->ip();
        $emailIpKey = 'login_email_ip:'.Str::transliterate($email.'|'.$ip);
        $ipKey = 'login_ip:'.$ip;

        if (RateLimiter::tooManyAttempts($emailIpKey, 5)) {
            $seconds = RateLimiter::availableIn($emailIpKey);
            throw ValidationException::withMessages([
                'email' => trans('auth.throttle', [
                    'seconds' => $seconds,
                    'minutes' => ceil($seconds / 60),
                ]),
            ]);
        }

        if (RateLimiter::tooManyAttempts($ipKey, 20)) {
            $seconds = RateLimiter::availableIn($ipKey);
            throw ValidationException::withMessages([
                'email' => trans('auth.throttle', [
                    'seconds' => $seconds,
                    'minutes' => ceil($seconds / 60),
                ]),
            ]);
        }

        $user = User::whereRaw('LOWER(email) = ?', [$email])->first();

        // Timing equalization: always run Hash::check even if user does not exist (P4-T02)
        if (! $user) {
            Hash::check($request->input('password'), self::DUMMY_HASH);
            RateLimiter::hit($emailIpKey, 60);
            RateLimiter::hit($ipKey, 60);

            ActivityLog::create([
                'action' => 'admin_login_failed',
                'entity_type' => 'User',
                'description' => "Failed login attempt for non-existent email: {$email}",
                'ip_address' => $ip,
                'user_agent' => $request->userAgent(),
            ]);

            throw ValidationException::withMessages([
                'email' => trans('auth.failed'),
            ]);
        }

        // Validate password
        if (! Hash::check($request->input('password'), $user->password)) {
            RateLimiter::hit($emailIpKey, 60);
            RateLimiter::hit($ipKey, 60);

            ActivityLog::create([
                'user_id' => $user->id,
                'action' => 'admin_login_failed',
                'entity_type' => 'User',
                'entity_id' => $user->id,
                'description' => "Failed login attempt for user {$email}: invalid password.",
                'ip_address' => $ip,
                'user_agent' => $request->userAgent(),
            ]);

            throw ValidationException::withMessages([
                'email' => trans('auth.failed'),
            ]);
        }

        // Check if account is active (P4-T02: generic message, log internal reason)
        if (! $user->is_active) {
            RateLimiter::hit($emailIpKey, 60);
            RateLimiter::hit($ipKey, 60);

            ActivityLog::create([
                'user_id' => $user->id,
                'action' => 'admin_login_failed',
                'entity_type' => 'User',
                'entity_id' => $user->id,
                'description' => "Failed login attempt for deactivated user {$email}.",
                'ip_address' => $ip,
                'user_agent' => $request->userAgent(),
            ]);

            throw ValidationException::withMessages([
                'email' => trans('auth.failed'),
            ]);
        }

        // Verify that the user has admin or staff privileges
        if (! $user->is_admin && ! $user->roles()->exists()) {
            RateLimiter::hit($emailIpKey, 60);
            RateLimiter::hit($ipKey, 60);

            ActivityLog::create([
                'user_id' => $user->id,
                'action' => 'admin_login_failed',
                'entity_type' => 'User',
                'entity_id' => $user->id,
                'description' => "Failed login attempt for user {$email}: lacking administrative roles.",
                'ip_address' => $ip,
                'user_agent' => $request->userAgent(),
            ]);

            throw ValidationException::withMessages([
                'email' => trans('auth.failed'),
            ]);
        }

        // Password rehash check (P4-T02)
        if (Hash::needsRehash($user->password)) {
            $user->update(['password' => Hash::make($request->input('password'))]);
        }

        RateLimiter::clear($emailIpKey);
        RateLimiter::clear($ipKey);

        $remember = $request->boolean('remember');

        // 2FA State Machine (P4-T03)
        if ($user->hasTwoFactorEnabled()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            $request->session()->regenerate();

            $request->session()->put('auth.2fa.user_id', $user->id);
            $request->session()->put('auth.2fa.expires_at', now()->addMinutes(5)->timestamp);
            $request->session()->put('auth.2fa.remember', $remember);
            $request->session()->put('auth.2fa.attempts', 0);

            return redirect()->route('admin.2fa.challenge');
        }

        // Complete direct authentication
        Auth::login($user, $remember);
        $request->session()->regenerate();
        $request->session()->put('2fa_verified', false);

        // Update login audit details
        $user->update([
            'last_login_at' => now(),
            'last_login_ip' => $ip,
        ]);

        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'admin_login',
            'entity_type' => 'User',
            'entity_id' => $user->id,
            'description' => "Administrator {$user->name} logged into the management console.",
            'ip_address' => $ip,
            'user_agent' => $request->userAgent(),
        ]);

        return redirect()->intended(route('admin.dashboard'));
    }

    /**
     * Log the user out of the administration platform.
     */
    public function logout(Request $request): RedirectResponse
    {
        $user = Auth::user();

        if ($user) {
            ActivityLog::create([
                'user_id' => $user->id,
                'action' => 'admin_logout',
                'entity_type' => 'User',
                'entity_id' => $user->id,
                'description' => "Administrator {$user->name} logged out.",
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        }

        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('admin.login')->with('status', 'You have been safely signed out.');
    }
}
