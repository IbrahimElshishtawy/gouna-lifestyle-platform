<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use App\Services\Auth\TotpService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\View\View;

class TwoFactorController extends Controller
{
    public function __construct(
        protected TotpService $totpService
    ) {}

    /**
     * Show the 2FA TOTP challenge screen during login.
     */
    public function showChallenge(Request $request): View|RedirectResponse
    {
        if (Auth::check() && session()->get('2fa_verified', false)) {
            return redirect()->route('admin.dashboard');
        }

        $userId = session('auth.2fa.user_id');
        $expiresAt = session('auth.2fa.expires_at');

        if (! $userId || ! $expiresAt || now()->timestamp > $expiresAt) {
            session()->forget(['auth.2fa.user_id', 'auth.2fa.expires_at', 'auth.2fa.remember', 'auth.2fa.attempts']);

            return redirect()->route('admin.login')->withErrors([
                'email' => 'Your two-factor verification session has expired. Please log in again.',
            ]);
        }

        return view('auth.2fa-challenge');
    }

    /**
     * Process a submitted 6-digit TOTP code during login challenge.
     */
    public function verifyChallenge(Request $request): RedirectResponse
    {
        $request->validate([
            'code' => ['required', 'string', 'size:6'],
        ]);

        $userId = session('auth.2fa.user_id');
        $expiresAt = session('auth.2fa.expires_at');
        $remember = session('auth.2fa.remember', false);
        $attempts = session('auth.2fa.attempts', 0);

        if (! $userId || ! $expiresAt || now()->timestamp > $expiresAt) {
            session()->forget(['auth.2fa.user_id', 'auth.2fa.expires_at', 'auth.2fa.remember', 'auth.2fa.attempts']);

            return redirect()->route('admin.login')->withErrors([
                'email' => 'Your two-factor verification session has expired. Please log in again.',
            ]);
        }

        if ($attempts >= 5) {
            session()->forget(['auth.2fa.user_id', 'auth.2fa.expires_at', 'auth.2fa.remember', 'auth.2fa.attempts']);

            return redirect()->route('admin.login')->withErrors([
                'email' => 'Too many failed two-factor attempts. Please log in again.',
            ]);
        }

        /** @var User|null $user */
        $user = User::find($userId);
        if (! $user || ! $user->two_factor_secret) {
            session()->forget(['auth.2fa.user_id', 'auth.2fa.expires_at', 'auth.2fa.remember', 'auth.2fa.attempts']);

            return redirect()->route('admin.login')->withErrors([
                'email' => 'Invalid two-factor configuration.',
            ]);
        }

        $usedStep = null;
        $isValid = $this->totpService->verifyCode(
            secret: $user->two_factor_secret,
            code: $request->input('code'),
            window: 1,
            lastUsedStep: $user->two_factor_last_step,
            usedStep: $usedStep
        );

        if (! $isValid) {
            session()->put('auth.2fa.attempts', $attempts + 1);

            throw ValidationException::withMessages([
                'code' => 'The provided two-factor authentication code was invalid.',
            ]);
        }

        // Save last used step to prevent replay attacks (P4-T03)
        $user->forceFill([
            'two_factor_last_step' => $usedStep,
        ])->save();

        // Complete authentication
        Auth::loginUsingId($user->id, $remember);
        $request->session()->put('2fa_verified', true);
        $request->session()->forget(['auth.2fa.user_id', 'auth.2fa.expires_at', 'auth.2fa.remember', 'auth.2fa.attempts']);
        $request->session()->regenerate();

        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'admin_2fa_verified',
            'entity_type' => 'User',
            'entity_id' => $user->id,
            'description' => "Administrator {$user->name} completed TOTP verification.",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return redirect()->intended(route('admin.dashboard'));
    }

    /**
     * Process a submitted recovery code during login challenge.
     */
    public function verifyRecovery(Request $request): RedirectResponse
    {
        $request->validate([
            'recovery_code' => ['required', 'string'],
        ]);

        $userId = session('auth.2fa.user_id');
        $expiresAt = session('auth.2fa.expires_at');
        $remember = session('auth.2fa.remember', false);

        if (! $userId || ! $expiresAt || now()->timestamp > $expiresAt) {
            session()->forget(['auth.2fa.user_id', 'auth.2fa.expires_at', 'auth.2fa.remember', 'auth.2fa.attempts']);

            return redirect()->route('admin.login')->withErrors([
                'email' => 'Your two-factor verification session has expired. Please log in again.',
            ]);
        }

        /** @var User|null $user */
        $user = User::find($userId);
        if (! $user) {
            session()->forget(['auth.2fa.user_id', 'auth.2fa.expires_at', 'auth.2fa.remember', 'auth.2fa.attempts']);

            return redirect()->route('admin.login');
        }

        $consumed = $user->consumeRecoveryCode($request->input('recovery_code'));
        if (! $consumed) {
            throw ValidationException::withMessages([
                'recovery_code' => 'The provided recovery code was invalid or has already been used.',
            ]);
        }

        Auth::loginUsingId($user->id, $remember);
        $request->session()->put('2fa_verified', true);
        $request->session()->forget(['auth.2fa.user_id', 'auth.2fa.expires_at', 'auth.2fa.remember', 'auth.2fa.attempts']);
        $request->session()->regenerate();

        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'admin_2fa_recovery_used',
            'entity_type' => 'User',
            'entity_id' => $user->id,
            'description' => "Administrator {$user->name} used a single-use 2FA recovery code.",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return redirect()->intended(route('admin.dashboard'));
    }

    /**
     * Show the 2FA setup form for an authenticated admin user.
     */
    public function showSetup(Request $request): View|RedirectResponse
    {
        $user = $request->user();

        if ($user->hasTwoFactorEnabled()) {
            return redirect()->route('admin.dashboard')->with('info', 'Two-factor authentication is already active.');
        }

        // Generate or retain secret in session
        $secret = session('auth.2fa.setup_secret');
        if (! $secret) {
            $secret = $this->totpService->generateSecret(32);
            session(['auth.2fa.setup_secret' => $secret]);
        }

        $otpAuthUri = $this->totpService->getOtpAuthUri('GouNow', $user->email, $secret);

        return view('auth.2fa-setup', compact('secret', 'otpAuthUri'));
    }

    /**
     * Confirm 2FA setup with a valid TOTP code and generate recovery codes.
     */
    public function confirmSetup(Request $request): View|RedirectResponse
    {
        $request->validate([
            'code' => ['required', 'string', 'size:6'],
        ]);

        $user = $request->user();
        $secret = session('auth.2fa.setup_secret');

        if (! $secret) {
            return redirect()->route('admin.2fa.setup')->withErrors([
                'code' => 'Two-factor setup session expired. Please try again.',
            ]);
        }

        $usedStep = null;
        $isValid = $this->totpService->verifyCode(
            secret: $secret,
            code: $request->input('code'),
            window: 1,
            usedStep: $usedStep
        );

        if (! $isValid) {
            throw ValidationException::withMessages([
                'code' => 'The confirmation code was invalid. Please check your authenticator app and try again.',
            ]);
        }

        // Save secret, confirmed_at, and last step
        $user->two_factor_secret = $secret;
        $user->two_factor_confirmed_at = now();
        $user->two_factor_last_step = $usedStep;
        $user->save();

        session()->forget('auth.2fa.setup_secret');
        session()->put('2fa_verified', true);

        // Generate 8 single-use CSPRNG recovery codes
        $recoveryCodes = $user->generateRecoveryCodes(8);

        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'admin_2fa_enabled',
            'entity_type' => 'User',
            'entity_id' => $user->id,
            'description' => "Administrator {$user->name} enabled TOTP two-factor authentication.",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return view('auth.2fa-recovery-codes', compact('recoveryCodes'));
    }

    /**
     * Disable 2FA (Requires re-authenticating password).
     */
    public function disable(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'string'],
        ]);

        $user = $request->user();

        if (! Hash::check($request->input('password'), $user->password)) {
            throw ValidationException::withMessages([
                'password' => 'The provided password was incorrect.',
            ]);
        }

        $user->two_factor_secret = null;
        $user->two_factor_confirmed_at = null;
        $user->two_factor_recovery_codes = null;
        $user->two_factor_last_step = null;
        $user->save();

        session()->forget('2fa_verified');

        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'admin_2fa_disabled',
            'entity_type' => 'User',
            'entity_id' => $user->id,
            'description' => "Administrator {$user->name} disabled TOTP two-factor authentication.",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return redirect()->route('admin.dashboard')->with('success', 'Two-factor authentication has been disabled.');
    }
}
