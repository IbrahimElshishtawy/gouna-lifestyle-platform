<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use App\Services\Auth\PermissionResolver;
use App\Services\Auth\TotpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    private const DUMMY_HASH = '$2y$12$e80e1yW38eC3sUa8kS.kSeWJc6/p1k.3uF1gO5M0z1q9N2v4j6y6.';

    public function __construct(
        protected TotpService $totpService
    ) {}

    /**
     * Authenticate user via SPA session cookie or personal access token (ADR-003, P4-T02, P4-T03).
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'remember' => ['nullable', 'boolean'],
            'device_name' => ['nullable', 'string', 'max:100'],
        ]);

        $email = Str::lower((string) $request->input('email'));
        $ip = (string) $request->ip();

        $emailIpKey = 'login_email_ip:'.$email.'|'.$ip;
        $ipKey = 'login_ip:'.$ip;

        if (RateLimiter::tooManyAttempts($emailIpKey, 5)) {
            $seconds = RateLimiter::availableIn($emailIpKey);

            return response()->json([
                'error' => [
                    'code' => 'RATE_LIMIT_EXCEEDED',
                    'message' => 'Too many login attempts. Please try again later.',
                    'details' => ['retry_after' => $seconds],
                    'request_id' => $request->attributes->get('request_id'),
                    'timestamp' => now()->toIso8601String(),
                ],
            ], 429, ['Retry-After' => (string) $seconds]);
        }

        if (RateLimiter::tooManyAttempts($ipKey, 20)) {
            $seconds = RateLimiter::availableIn($ipKey);

            return response()->json([
                'error' => [
                    'code' => 'RATE_LIMIT_EXCEEDED',
                    'message' => 'Too many login attempts. Please try again later.',
                    'details' => ['retry_after' => $seconds],
                    'request_id' => $request->attributes->get('request_id'),
                    'timestamp' => now()->toIso8601String(),
                ],
            ], 429, ['Retry-After' => (string) $seconds]);
        }

        $user = User::where('email', $email)->first();

        // Timing equalization: always run Hash::check even if user does not exist (P4-T02)
        if (! $user) {
            Hash::check($request->input('password'), self::DUMMY_HASH);
            RateLimiter::hit($emailIpKey, 60);
            RateLimiter::hit($ipKey, 60);

            ActivityLog::create([
                'action' => 'api_login_failed',
                'entity_type' => 'User',
                'description' => "Failed API login attempt for non-existent email: {$email}",
                'ip_address' => $ip,
                'user_agent' => $request->userAgent(),
            ]);

            throw ValidationException::withMessages([
                'email' => ['Invalid email or password.'],
            ]);
        }

        // Validate password
        if (! Hash::check($request->input('password'), $user->password)) {
            RateLimiter::hit($emailIpKey, 60);
            RateLimiter::hit($ipKey, 60);

            ActivityLog::create([
                'user_id' => $user->id,
                'action' => 'api_login_failed',
                'entity_type' => 'User',
                'entity_id' => $user->id,
                'description' => "Failed API login attempt for user {$email}: invalid password.",
                'ip_address' => $ip,
                'user_agent' => $request->userAgent(),
            ]);

            throw ValidationException::withMessages([
                'email' => ['Invalid email or password.'],
            ]);
        }

        // Check if account is active (P4-T02: generic error message, log internal reason)
        if (! $user->is_active) {
            RateLimiter::hit($emailIpKey, 60);
            RateLimiter::hit($ipKey, 60);

            ActivityLog::create([
                'user_id' => $user->id,
                'action' => 'api_login_failed',
                'entity_type' => 'User',
                'entity_id' => $user->id,
                'description' => "Failed API login attempt for deactivated user {$email}.",
                'ip_address' => $ip,
                'user_agent' => $request->userAgent(),
            ]);

            throw ValidationException::withMessages([
                'email' => ['Invalid email or password.'],
            ]);
        }

        // Password rehash check (P4-T02)
        if (Hash::needsRehash($user->password)) {
            $user->update(['password' => Hash::make($request->input('password'))]);
        }

        RateLimiter::clear($emailIpKey);
        RateLimiter::clear($ipKey);

        $requestId = $request->attributes->get('request_id');

        // 2FA State Machine for API (P4-T03)
        if ($user->hasTwoFactorEnabled()) {
            $payload = [
                'user_id' => $user->id,
                'expires_at' => now()->addMinutes(5)->timestamp,
                'purpose' => '2fa_challenge',
                'nonce' => Str::random(16),
            ];

            $twoFactorToken = Crypt::encryptString(json_encode($payload));

            return response()->json([
                'data' => [
                    'two_factor_required' => true,
                    'two_factor_token' => $twoFactorToken,
                    'expires_in' => 300,
                ],
                'meta' => [
                    'request_id' => $requestId,
                    'timestamp' => now()->toIso8601String(),
                ],
            ]);
        }

        // Determine if token issuance is requested or SPA cookie session
        $wantsToken = $request->boolean('token') || $request->header('X-Auth-Mode') === 'token';
        $token = null;

        if ($wantsToken) {
            $deviceName = $request->input('device_name', 'NextJs-Client');
            $token = $user->createToken($deviceName)->plainTextToken;
        } else {
            Auth::login($user, (bool) $request->input('remember', false));
            $request->session()->regenerate();
            $request->session()->put('2fa_verified', false);
        }

        $user->update([
            'last_login_at' => now(),
            'last_login_ip' => $ip,
        ]);

        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'api_login',
            'entity_type' => 'User',
            'entity_id' => $user->id,
            'description' => "User {$user->name} authenticated via API.",
            'ip_address' => $ip,
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'is_admin' => (bool) $user->is_admin,
                    'roles' => $user->roles->pluck('name'),
                ],
                'token' => $token,
                'token_type' => $token ? 'Bearer' : null,
            ],
            'meta' => [
                'request_id' => $requestId,
                'timestamp' => now()->toIso8601String(),
            ],
        ]);
    }

    /**
     * Complete TOTP 2FA challenge via temporary two_factor_token (P4-T03).
     */
    public function challenge2fa(Request $request): JsonResponse
    {
        $request->validate([
            'two_factor_token' => ['required', 'string'],
            'code' => ['required', 'string', 'size:6'],
            'device_name' => ['nullable', 'string', 'max:100'],
        ]);

        $payload = $this->decrypt2faToken($request->input('two_factor_token'));
        if (! $payload) {
            return response()->json([
                'error' => [
                    'code' => 'INVALID_TWO_FACTOR_TOKEN',
                    'message' => 'The two-factor token is invalid or expired. Please log in again.',
                    'details' => null,
                    'request_id' => $request->attributes->get('request_id'),
                    'timestamp' => now()->toIso8601String(),
                ],
            ], 422);
        }

        /** @var User|null $user */
        $user = User::find($payload['user_id']);
        if (! $user || ! $user->two_factor_secret) {
            return response()->json([
                'error' => [
                    'code' => 'USER_NOT_FOUND',
                    'message' => 'User account not found or 2FA not configured.',
                    'details' => null,
                    'request_id' => $request->attributes->get('request_id'),
                    'timestamp' => now()->toIso8601String(),
                ],
            ], 404);
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
            throw ValidationException::withMessages([
                'code' => ['The provided two-factor authentication code is invalid.'],
            ]);
        }

        // Prevent replay attacks by persisting used step
        $user->forceFill([
            'two_factor_last_step' => $usedStep,
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
        ])->save();

        $deviceName = $request->input('device_name', 'NextJs-Client-2FA');
        $token = $user->createToken($deviceName, ['*'])->plainTextToken;

        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'api_2fa_verified',
            'entity_type' => 'User',
            'entity_id' => $user->id,
            'description' => "User {$user->name} completed API TOTP verification.",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'is_admin' => (bool) $user->is_admin,
                    'roles' => $user->roles->pluck('name'),
                ],
                'token' => $token,
                'token_type' => 'Bearer',
            ],
            'meta' => [
                'request_id' => $request->attributes->get('request_id'),
                'timestamp' => now()->toIso8601String(),
            ],
        ]);
    }

    /**
     * Consume a single-use 2FA recovery code via temporary two_factor_token (P4-T04).
     */
    public function recovery2fa(Request $request): JsonResponse
    {
        $request->validate([
            'two_factor_token' => ['required', 'string'],
            'recovery_code' => ['required', 'string'],
            'device_name' => ['nullable', 'string', 'max:100'],
        ]);

        $payload = $this->decrypt2faToken($request->input('two_factor_token'));
        if (! $payload) {
            return response()->json([
                'error' => [
                    'code' => 'INVALID_TWO_FACTOR_TOKEN',
                    'message' => 'The two-factor token is invalid or expired. Please log in again.',
                    'details' => null,
                    'request_id' => $request->attributes->get('request_id'),
                    'timestamp' => now()->toIso8601String(),
                ],
            ], 422);
        }

        /** @var User|null $user */
        $user = User::find($payload['user_id']);
        if (! $user) {
            return response()->json([
                'error' => [
                    'code' => 'USER_NOT_FOUND',
                    'message' => 'User not found.',
                    'details' => null,
                    'request_id' => $request->attributes->get('request_id'),
                    'timestamp' => now()->toIso8601String(),
                ],
            ], 404);
        }

        $consumed = $user->consumeRecoveryCode($request->input('recovery_code'));
        if (! $consumed) {
            throw ValidationException::withMessages([
                'recovery_code' => ['The provided recovery code was invalid or has already been used.'],
            ]);
        }

        $user->update([
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
        ]);

        $deviceName = $request->input('device_name', 'NextJs-Client-Recovery');
        $token = $user->createToken($deviceName, ['*'])->plainTextToken;

        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'api_2fa_recovery_used',
            'entity_type' => 'User',
            'entity_id' => $user->id,
            'description' => "User {$user->name} authenticated via single-use 2FA recovery code.",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'is_admin' => (bool) $user->is_admin,
                    'roles' => $user->roles->pluck('name'),
                ],
                'token' => $token,
                'token_type' => 'Bearer',
            ],
            'meta' => [
                'request_id' => $request->attributes->get('request_id'),
                'timestamp' => now()->toIso8601String(),
            ],
        ]);
    }

    /**
     * Generate 2FA secret and setup URI for authenticated user (P4-T03).
     */
    public function setup2fa(Request $request): JsonResponse
    {
        $user = $request->user();
        $secret = $this->totpService->generateSecret(32);
        $otpAuthUri = $this->totpService->getOtpAuthUri('GouNow', $user->email, $secret);

        return response()->json([
            'data' => [
                'secret' => $secret,
                'otpauth_url' => $otpAuthUri,
            ],
            'meta' => [
                'request_id' => $request->attributes->get('request_id'),
                'timestamp' => now()->toIso8601String(),
            ],
        ]);
    }

    /**
     * Confirm 2FA setup with a code and issue recovery codes (P4-T03, P4-T04).
     */
    public function confirm2fa(Request $request): JsonResponse
    {
        $request->validate([
            'secret' => ['required', 'string'],
            'code' => ['required', 'string', 'size:6'],
        ]);

        $user = $request->user();
        $usedStep = null;

        $isValid = $this->totpService->verifyCode(
            secret: $request->input('secret'),
            code: $request->input('code'),
            window: 1,
            usedStep: $usedStep
        );

        if (! $isValid) {
            throw ValidationException::withMessages([
                'code' => ['The confirmation code was invalid. Please check your authenticator app.'],
            ]);
        }

        $user->two_factor_secret = $request->input('secret');
        $user->two_factor_confirmed_at = now();
        $user->two_factor_last_step = $usedStep;
        $user->save();

        $recoveryCodes = $user->generateRecoveryCodes(8);

        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'api_2fa_enabled',
            'entity_type' => 'User',
            'entity_id' => $user->id,
            'description' => "User {$user->name} enabled TOTP two-factor authentication via API.",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'data' => [
                'message' => 'Two-factor authentication successfully enabled.',
                'recovery_codes' => $recoveryCodes,
            ],
            'meta' => [
                'request_id' => $request->attributes->get('request_id'),
                'timestamp' => now()->toIso8601String(),
            ],
        ]);
    }

    /**
     * Disable 2FA with password confirmation (P4-T03, P4-T09).
     */
    public function disable2fa(Request $request): JsonResponse
    {
        $request->validate([
            'password' => ['required', 'string'],
        ]);

        $user = $request->user();

        if (! Hash::check($request->input('password'), $user->password)) {
            throw ValidationException::withMessages([
                'password' => ['The provided password was incorrect.'],
            ]);
        }

        $user->two_factor_secret = null;
        $user->two_factor_confirmed_at = null;
        $user->two_factor_recovery_codes = null;
        $user->two_factor_last_step = null;
        $user->save();

        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'api_2fa_disabled',
            'entity_type' => 'User',
            'entity_id' => $user->id,
            'description' => "User {$user->name} disabled TOTP two-factor authentication.",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'data' => [
                'message' => 'Two-factor authentication has been disabled.',
            ],
            'meta' => [
                'request_id' => $request->attributes->get('request_id'),
                'timestamp' => now()->toIso8601String(),
            ],
        ]);
    }

    /**
     * Request a password reset link (P4-T05: generic response, no email enumeration).
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $email = Str::lower((string) $request->input('email'));
        $user = User::where('email', $email)->first();

        if ($user) {
            $plainToken = Str::random(64);
            $hashedToken = hash('sha256', $plainToken);

            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $email],
                [
                    'token' => $hashedToken,
                    'created_at' => now(),
                ]
            );

            // Log event without storing the token in logs (P4-T11)
            ActivityLog::create([
                'user_id' => $user->id,
                'action' => 'password_reset_requested',
                'entity_type' => 'User',
                'entity_id' => $user->id,
                'description' => "Password reset requested for {$email}.",
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        }

        return response()->json([
            'data' => [
                'message' => 'If your email address exists in our database, you will receive a password recovery link at your email address in a few minutes.',
            ],
            'meta' => [
                'request_id' => $request->attributes->get('request_id'),
                'timestamp' => now()->toIso8601String(),
            ],
        ]);
    }

    /**
     * Reset password with valid token (P4-T05, P4-T06).
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
            'token' => ['required', 'string'],
            'password' => [
                'required',
                'confirmed',
                Password::min(12)->mixedCase()->numbers()->symbols(),
            ],
        ]);

        $email = Str::lower((string) $request->input('email'));
        $token = $request->input('token');

        $record = DB::table('password_reset_tokens')
            ->whereRaw('LOWER(email) = ?', [$email])
            ->first();

        if (! $record) {
            throw ValidationException::withMessages([
                'email' => ['The password reset token is invalid or expired.'],
            ]);
        }

        // Expiry check <= 60 minutes
        $createdAt = Carbon::parse($record->created_at);
        if ($createdAt->addMinutes(60)->isPast()) {
            DB::table('password_reset_tokens')->whereRaw('LOWER(email) = ?', [$email])->delete();

            throw ValidationException::withMessages([
                'email' => ['The password reset token is invalid or expired.'],
            ]);
        }

        // Verify token hash
        if (! hash_equals($record->token, hash('sha256', $token))) {
            throw ValidationException::withMessages([
                'token' => ['The password reset token is invalid or expired.'],
            ]);
        }

        /** @var User|null $user */
        $user = User::whereRaw('LOWER(email) = ?', [$email])->first();
        if (! $user) {
            throw ValidationException::withMessages([
                'email' => ['The password reset token is invalid or expired.'],
            ]);
        }

        $user->forceFill([
            'password' => Hash::make($request->input('password')),
            'force_password_change' => false,
        ])->save();

        // One-time use: delete token immediately
        DB::table('password_reset_tokens')->whereRaw('LOWER(email) = ?', [$email])->delete();

        // Revoke all existing sessions and tokens (P4-T05, P4-T08)
        $user->tokens()->delete();

        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'password_reset_completed',
            'entity_type' => 'User',
            'entity_id' => $user->id,
            'description' => "Password reset completed for {$email}. All previous tokens revoked.",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'data' => [
                'message' => 'Your password has been successfully reset. Please log in with your new credentials.',
            ],
            'meta' => [
                'request_id' => $request->attributes->get('request_id'),
                'timestamp' => now()->toIso8601String(),
            ],
        ]);
    }

    /**
     * List active sessions/tokens for the authenticated user (P4-T08).
     */
    public function sessions(Request $request): JsonResponse
    {
        $user = $request->user();
        $tokens = $user->tokens()->get(['id', 'name', 'last_used_at', 'created_at']);

        return response()->json([
            'data' => [
                'tokens' => $tokens,
            ],
            'meta' => [
                'request_id' => $request->attributes->get('request_id'),
                'timestamp' => now()->toIso8601String(),
            ],
        ]);
    }

    /**
     * Terminate all sessions and revoke all tokens for the user (P4-T08).
     */
    public function logoutAll(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->tokens()->delete();

        if ($request->hasSession()) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'api_logout_all',
            'entity_type' => 'User',
            'entity_id' => $user->id,
            'description' => "User {$user->name} revoked all active sessions and tokens.",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'data' => [
                'message' => 'All active sessions and tokens have been revoked.',
            ],
            'meta' => [
                'request_id' => $request->attributes->get('request_id'),
                'timestamp' => now()->toIso8601String(),
            ],
        ]);
    }

    /**
     * Change password for authenticated user (P4-T06, P4-T08).
     */
    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => ['required', 'string'],
            'password' => [
                'required',
                'confirmed',
                Password::min(12)->mixedCase()->numbers()->symbols(),
            ],
        ]);

        $user = $request->user();

        if (! Hash::check($request->input('current_password'), $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password does not match.'],
            ]);
        }

        $user->forceFill([
            'password' => Hash::make($request->input('password')),
            'force_password_change' => false,
        ])->save();

        // Revoke all tokens except current (or all tokens)
        $currentTokenId = $user->currentAccessToken()?->id;
        $user->tokens()->where('id', '!=', $currentTokenId)->delete();

        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'password_changed',
            'entity_type' => 'User',
            'entity_id' => $user->id,
            'description' => "User {$user->name} updated their password. Other sessions revoked.",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'data' => [
                'message' => 'Password successfully updated.',
            ],
            'meta' => [
                'request_id' => $request->attributes->get('request_id'),
                'timestamp' => now()->toIso8601String(),
            ],
        ]);
    }

    /**
     * Confirm password for sensitive-action re-auth (P4-T09).
     */
    public function confirmPassword(Request $request): JsonResponse
    {
        $request->validate([
            'password' => ['required', 'string'],
        ]);

        $user = $request->user();

        if (! Hash::check($request->input('password'), $user->password)) {
            throw ValidationException::withMessages([
                'password' => ['The provided password was incorrect.'],
            ]);
        }

        if ($request->hasSession()) {
            $request->session()->put('auth.password_confirmed_at', time());
        }

        return response()->json([
            'data' => [
                'confirmed' => true,
                'confirmed_at' => now()->toIso8601String(),
            ],
            'meta' => [
                'request_id' => $request->attributes->get('request_id'),
                'timestamp' => now()->toIso8601String(),
            ],
        ]);
    }

    /**
     * Terminate the authenticated session or revoke current token.
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user) {
            if ($user->currentAccessToken()) {
                $user->currentAccessToken()->delete();
            }

            if ($request->hasSession()) {
                Auth::guard('web')->logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();
            }
        }

        $requestId = $request->attributes->get('request_id');

        return response()->json([
            'data' => [
                'message' => 'Successfully logged out.',
            ],
            'meta' => [
                'request_id' => $requestId,
                'timestamp' => now()->toIso8601String(),
            ],
        ]);
    }

    /**
     * Retrieve the authenticated user's profile and UI permission abilities.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'error' => [
                    'code' => 'UNAUTHENTICATED',
                    'message' => 'Unauthenticated.',
                    'details' => null,
                    'request_id' => $request->attributes->get('request_id'),
                    'timestamp' => now()->toIso8601String(),
                ],
            ], 401);
        }

        $resolver = app(PermissionResolver::class);
        $resolved = $resolver->resolvePermissions($user);
        $abilities = isset($resolved['*']) && $resolved['*'] === true
            ? ['*']
            : array_values(array_keys(array_filter($resolved)));

        $requestId = $request->attributes->get('request_id');

        return response()->json([
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'avatar' => $user->avatar,
                'locale' => $user->locale ?: 'en',
                'is_admin' => (bool) $user->is_admin,
                'two_factor_enabled' => $user->hasTwoFactorEnabled(),
                'roles' => $user->roles->pluck('name'),
                'abilities' => $abilities,
            ],
            'meta' => [
                'request_id' => $requestId,
                'timestamp' => now()->toIso8601String(),
            ],
        ]);
    }

    /**
     * Retrieve permission abilities and query scopes for frontend UI (P3-T11).
     */
    public function abilities(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'error' => [
                    'code' => 'UNAUTHENTICATED',
                    'message' => 'Unauthenticated.',
                    'details' => null,
                    'request_id' => $request->attributes->get('request_id'),
                    'timestamp' => now()->toIso8601String(),
                ],
            ], 401);
        }

        $roles = $user->roles->pluck('name')->toArray();
        $isSuperAdmin = (bool) ($user->is_admin || in_array('super_admin', $roles, true));

        if ($isSuperAdmin) {
            $permissions = ['*'];
            $scopes = [
                'properties' => 'all',
                'bookings' => 'all',
                'payments' => 'all',
                'customers' => 'all',
                'events' => 'all',
                'experiences' => 'all',
                'reports' => 'all',
            ];
        } else {
            $resolver = app(PermissionResolver::class);
            $resolved = $resolver->resolvePermissions($user);
            $permissions = array_values(array_keys(array_filter($resolved)));

            $scopes = [
                'properties' => in_array('property_manager', $roles, true) ? 'all' : (in_array('sales', $roles, true) ? 'assigned' : 'none'),
                'bookings' => in_array('finance', $roles, true) || in_array('property_manager', $roles, true) ? 'all' : (in_array('staff', $roles, true) ? 'assigned' : 'none'),
                'payments' => in_array('finance', $roles, true) ? 'all' : 'none',
                'customers' => in_array('property_manager', $roles, true) ? 'all' : (in_array('sales', $roles, true) ? 'assigned' : 'none'),
                'events' => in_array('events_manager', $roles, true) ? 'all' : 'none',
                'experiences' => in_array('events_manager', $roles, true) ? 'all' : 'none',
                'reports' => in_array('finance', $roles, true) ? 'all' : 'none',
            ];
        }

        return response()->json([
            'data' => [
                'roles' => $roles,
                'permissions' => $permissions,
                'scopes' => $scopes,
                'is_admin' => $isSuperAdmin,
            ],
            'meta' => [
                'request_id' => $request->attributes->get('request_id'),
                'timestamp' => now()->toIso8601String(),
            ],
        ]);
    }

    /**
     * Decrypt and validate temporary 2FA token.
     *
     * @return array{user_id: int, expires_at: int, purpose: string}|null
     */
    private function decrypt2faToken(string $token): ?array
    {
        try {
            $decrypted = Crypt::decryptString($token);
            $data = json_decode($decrypted, true);

            if (! is_array($data) || empty($data['user_id']) || empty($data['expires_at']) || empty($data['purpose'])) {
                return null;
            }

            if ($data['purpose'] !== '2fa_challenge' || now()->timestamp > $data['expires_at']) {
                return null;
            }

            return $data;
        } catch (\Throwable) {
            return null;
        }
    }
}
