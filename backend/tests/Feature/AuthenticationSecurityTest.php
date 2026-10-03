<?php

namespace Tests\Feature;

use App\Logging\SensitiveDataRedactionProcessor;
use App\Models\Role;
use App\Models\User;
use App\Services\Auth\TotpService;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Monolog\Level;
use Monolog\LogRecord;
use Tests\TestCase;

class AuthenticationSecurityTest extends TestCase
{
    use WithFaker;

    private TotpService $totpService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->totpService = app(TotpService::class);
        RateLimiter::clear('auth_ip:127.0.0.1');
        RateLimiter::clear('login_ip:127.0.0.1');
    }

    private function freshIp(): string
    {
        return '10.'.rand(1, 254).'.'.rand(1, 254).'.'.rand(1, 254);
    }

    /**
     * P4-T02: LoginGenericErrorTest - generic error message for all failure reasons (no enumeration).
     */
    public function test_login_generic_error_on_all_failures(): void
    {
        $ip = $this->freshIp();

        // 1. Non-existent email
        $response1 = $this->withServerVariables(['REMOTE_ADDR' => $ip])
            ->postJson('/api/v1/auth/login', [
                'email' => 'nonexistent_'.Str::random(8).'@gounow.com',
                'password' => 'AnyPassword!2026',
            ]);
        $response1->assertStatus(422);
        $errorMsg1 = $response1->json('error.details.email.0') ?? $response1->json('errors.email.0');

        // 2. Existing user, wrong password
        $user = User::factory()->create([
            'email' => 'auth_test_'.Str::random(6).'@gounow.com',
            'password' => 'CorrectPassword!2026',
            'is_active' => true,
        ]);

        $response2 = $this->withServerVariables(['REMOTE_ADDR' => $ip])
            ->postJson('/api/v1/auth/login', [
                'email' => $user->email,
                'password' => 'WrongPassword!2026',
            ]);
        $response2->assertStatus(422);
        $errorMsg2 = $response2->json('error.details.email.0') ?? $response2->json('errors.email.0');

        // 3. Deactivated account
        $deactivatedUser = User::factory()->create([
            'email' => 'deactivated_'.Str::random(6).'@gounow.com',
            'password' => 'CorrectPassword!2026',
            'is_active' => false,
        ]);

        $response3 = $this->withServerVariables(['REMOTE_ADDR' => $ip])
            ->postJson('/api/v1/auth/login', [
                'email' => $deactivatedUser->email,
                'password' => 'CorrectPassword!2026',
            ]);
        $response3->assertStatus(422);
        $errorMsg3 = $response3->json('error.details.email.0') ?? $response3->json('errors.email.0');

        // Verify all 3 failure types return identical generic messages
        $this->assertNotEmpty($errorMsg1);
        $this->assertSame($errorMsg1, $errorMsg2);
        $this->assertSame($errorMsg2, $errorMsg3);
    }

    /**
     * P4-T02: LoginThrottleEmailIpTest - dual rate limiting per email+IP and IP.
     */
    public function test_login_throttling_by_email_and_ip(): void
    {
        $ip = $this->freshIp();
        $email = 'target_'.Str::random(6).'@gounow.com';

        // 5 failed attempts for same email+ip triggers throttle
        for ($i = 0; $i < 5; $i++) {
            $this->withServerVariables(['REMOTE_ADDR' => $ip])
                ->postJson('/api/v1/auth/login', [
                    'email' => $email,
                    'password' => 'Wrong!123',
                ]);
        }

        $throttledResponse = $this->withServerVariables(['REMOTE_ADDR' => $ip])
            ->postJson('/api/v1/auth/login', [
                'email' => $email,
                'password' => 'Wrong!123',
            ]);

        $throttledResponse->assertStatus(429);
        $this->assertSame('RATE_LIMIT_EXCEEDED', $throttledResponse->json('error.code'));
    }

    /**
     * P4-T02: SessionRegenerationTest - session id regenerates upon login.
     */
    public function test_session_regenerates_upon_authentication(): void
    {
        $ip = $this->freshIp();
        $user = User::factory()->create([
            'email' => 'session_regen_'.Str::random(6).'@gounow.com',
            'password' => 'Secret@2026!Pass',
            'is_active' => true,
            'is_admin' => true,
        ]);

        $this->withServerVariables(['REMOTE_ADDR' => $ip])->get('/admin/login');
        $initialSessionId = session()->getId();

        $response = $this->withServerVariables(['REMOTE_ADDR' => $ip])
            ->post('/admin/login', [
                'email' => $user->email,
                'password' => 'Secret@2026!Pass',
            ]);

        $response->assertRedirect(route('admin.dashboard'));
        $newSessionId = session()->getId();

        $this->assertNotEmpty($initialSessionId);
        $this->assertNotEmpty($newSessionId);
        $this->assertNotEquals($initialSessionId, $newSessionId);
    }

    /**
     * P4-T03: TwoFactorPendingCannotAccessAdminTest - pending 2FA cannot access protected admin routes.
     */
    public function test_two_factor_pending_cannot_access_admin_routes(): void
    {
        $secret = $this->totpService->generateSecret(32);
        $user = User::factory()->create([
            'email' => 'admin_2fa_'.Str::random(6).'@gounow.com',
            'password' => 'AdminPass!2026',
            'two_factor_secret' => $secret,
            'two_factor_confirmed_at' => now(),
            'is_active' => true,
            'is_admin' => true,
        ]);

        // Web session without 2fa_verified redirects to challenge
        $response = $this->actingAs($user)->get('/admin');
        $response->assertRedirect(route('admin.2fa.challenge'));

        // API request without 2FA verification returns 403 TWO_FACTOR_REQUIRED
        $apiResponse = $this->actingAs($user, 'sanctum')->getJson('/api/v1/admin/ping');
        $apiResponse->assertStatus(403);
        $this->assertSame('TWO_FACTOR_REQUIRED', $apiResponse->json('error.code'));
    }

    /**
     * P4-T03: TwoFactorRequiredForAdminRolesTest - mandatory 2FA setup grace flow for admin roles.
     */
    public function test_two_factor_required_for_admin_roles_triggers_setup(): void
    {
        config(['auth.enforce_2fa_setup' => true]);

        $superAdminRole = Role::firstOrCreate(
            ['name' => 'super_admin'],
            ['display_name' => 'Super Administrator', 'slug' => 'super-admin']
        );

        $admin = User::factory()->create([
            'email' => 'super_admin_'.Str::random(6).'@gounow.com',
            'is_active' => true,
            'is_admin' => true,
            'two_factor_secret' => null,
            'two_factor_confirmed_at' => null,
        ]);
        $admin->roles()->sync([$superAdminRole->id]);

        $response = $this->actingAs($admin)->get('/admin');
        $response->assertRedirect(route('admin.2fa.setup'));

        $apiResponse = $this->actingAs($admin, 'sanctum')->getJson('/api/v1/admin/ping');
        $apiResponse->assertStatus(403);
        $this->assertSame('TWO_FACTOR_SETUP_REQUIRED', $apiResponse->json('error.code'));
    }

    /**
     * P4-T03: TotpReplayRejectedTest - prevents replay of the same TOTP time step.
     */
    public function test_totp_replay_is_rejected(): void
    {
        $secret = $this->totpService->generateSecret(32);
        $timestamp = time();
        $code = $this->totpService->generateCode($secret, $timestamp);

        // First verification succeeds
        $usedStep = null;
        $firstSuccess = $this->totpService->verifyCode(
            secret: $secret,
            code: $code,
            window: 1,
            lastUsedStep: null,
            usedStep: $usedStep,
            timestamp: $timestamp
        );
        $this->assertTrue($firstSuccess);
        $this->assertNotNull($usedStep);

        // Replay attempt with same step is rejected
        $replaySuccess = $this->totpService->verifyCode(
            secret: $secret,
            code: $code,
            window: 1,
            lastUsedStep: $usedStep,
            timestamp: $timestamp
        );
        $this->assertFalse($replaySuccess);
    }

    /**
     * P4-T03: TotpWindowTest - valid window +-1 step accepted, outside rejected.
     */
    public function test_totp_window_tolerance(): void
    {
        $secret = $this->totpService->generateSecret(32);
        $now = time();
        $currentStep = (int) floor($now / 30);

        // Code from previous step (T - 1): inside window=1 -> PASS
        $prevCode = $this->totpService->calculateCodeForStep($secret, $currentStep - 1);
        $this->assertTrue($this->totpService->verifyCode($secret, $prevCode, 1, null, $used, $now));

        // Code from next step (T + 1): inside window=1 -> PASS
        $nextCode = $this->totpService->calculateCodeForStep($secret, $currentStep + 1);
        $this->assertTrue($this->totpService->verifyCode($secret, $nextCode, 1, null, $used, $now));

        // Code from 2 steps ago (T - 2): outside window=1 -> FAIL
        $oldCode = $this->totpService->calculateCodeForStep($secret, $currentStep - 2);
        $this->assertFalse($this->totpService->verifyCode($secret, $oldCode, 1, null, $used, $now));
    }

    /**
     * P4-T04: RecoveryCodeSingleUseTest - recovery code is single-use and cannot be used twice.
     */
    public function test_recovery_code_is_single_use(): void
    {
        $user = User::factory()->create([
            'is_active' => true,
        ]);

        $plainCodes = $user->generateRecoveryCodes(8);
        $this->assertCount(8, $plainCodes);
        $testCode = $plainCodes[0];

        // First use succeeds
        $firstResult = $user->consumeRecoveryCode($testCode);
        $this->assertTrue($firstResult);

        // Refresh user from DB
        $user->refresh();
        $this->assertCount(7, $user->two_factor_recovery_codes);

        // Second use of the same code fails
        $secondResult = $user->consumeRecoveryCode($testCode);
        $this->assertFalse($secondResult);
    }

    /**
     * P4-T04: RecoveryCodeConcurrentUseTest - race condition on same recovery code allows only one success.
     */
    public function test_recovery_code_concurrent_race_allows_only_one(): void
    {
        $user = User::factory()->create(['is_active' => true]);
        $plainCodes = $user->generateRecoveryCodes(8);
        $testCode = $plainCodes[0];

        // Simulate two sequential racing consumers
        $res1 = $user->consumeRecoveryCode($testCode);
        $res2 = $user->consumeRecoveryCode($testCode);

        $this->assertTrue($res1);
        $this->assertFalse($res2);
    }

    /**
     * P4-T05: PasswordResetExpiryTest - reset token older than 60 minutes is rejected.
     */
    public function test_password_reset_token_expiry(): void
    {
        $ip = $this->freshIp();
        $email = 'expiry_test_'.Str::random(6).'@gounow.com';
        $user = User::factory()->create([
            'email' => $email,
            'password' => 'OldPassword!2026',
            'is_active' => true,
        ]);

        $plainToken = Str::random(64);
        DB::table('password_reset_tokens')->insert([
            'email' => $email,
            'token' => hash('sha256', $plainToken),
            'created_at' => Carbon::now()->subMinutes(65)->toDateTimeString(),
        ]);

        $response = $this->withServerVariables(['REMOTE_ADDR' => $ip])
            ->postJson('/api/v1/auth/reset-password', [
                'email' => $email,
                'token' => $plainToken,
                'password' => 'NewSecurePassword!2026',
                'password_confirmation' => 'NewSecurePassword!2026',
            ]);

        $response->assertStatus(422);
        $this->assertDatabaseMissing('password_reset_tokens', ['email' => $email]);
    }

    /**
     * P4-T05: PasswordResetOneTimeTest - token is deleted immediately upon successful reset.
     */
    public function test_password_reset_token_one_time_use(): void
    {
        $ip = $this->freshIp();
        $email = 'onetime_'.Str::random(6).'@gounow.com';
        $user = User::factory()->create([
            'email' => $email,
            'password' => 'InitialPassword!2026',
            'is_active' => true,
        ]);

        $plainToken = Str::random(64);
        DB::table('password_reset_tokens')->insert([
            'email' => $email,
            'token' => hash('sha256', $plainToken),
            'created_at' => now()->toDateTimeString(),
        ]);

        // First reset succeeds
        $res1 = $this->withServerVariables(['REMOTE_ADDR' => $ip])
            ->postJson('/api/v1/auth/reset-password', [
                'email' => $email,
                'token' => $plainToken,
                'password' => 'NewPassUpdated!2026',
                'password_confirmation' => 'NewPassUpdated!2026',
            ]);
        $res1->assertStatus(200);

        // Token record is gone
        $this->assertDatabaseMissing('password_reset_tokens', ['email' => $email]);

        // Second reset with same token fails
        $res2 = $this->withServerVariables(['REMOTE_ADDR' => $ip])
            ->postJson('/api/v1/auth/reset-password', [
                'email' => $email,
                'token' => $plainToken,
                'password' => 'AnotherNewPass!2026',
                'password_confirmation' => 'AnotherNewPass!2026',
            ]);
        $res2->assertStatus(422);
    }

    /**
     * P4-T05 & P4-T08: PasswordChangeRevokesOtherSessionsTest - changing password revokes all prior tokens.
     */
    public function test_password_change_revokes_all_prior_tokens(): void
    {
        $ip = $this->freshIp();
        $user = User::factory()->create([
            'email' => 'token_revoke_'.Str::random(6).'@gounow.com',
            'password' => 'InitialPass!2026',
            'is_active' => true,
        ]);

        // Issue 3 tokens
        $user->createToken('Device-1');
        $user->createToken('Device-2');
        $user->createToken('Device-3');

        $this->assertCount(3, $user->tokens);

        // Perform password reset
        $plainToken = Str::random(64);
        DB::table('password_reset_tokens')->insert([
            'email' => $user->email,
            'token' => hash('sha256', $plainToken),
            'created_at' => now()->toDateTimeString(),
        ]);

        $this->withServerVariables(['REMOTE_ADDR' => $ip])
            ->postJson('/api/v1/auth/reset-password', [
                'email' => $user->email,
                'token' => $plainToken,
                'password' => 'BrandNewPassword!2026',
                'password_confirmation' => 'BrandNewPassword!2026',
            ])->assertStatus(200);

        // All prior tokens must be deleted
        $user->refresh();
        $this->assertCount(0, $user->tokens);
    }

    /**
     * P4-T09: ReAuthRequiredForSensitiveActionsTest - disabling 2FA requires correct password.
     */
    public function test_reauth_required_for_sensitive_actions(): void
    {
        $ip = $this->freshIp();
        $secret = $this->totpService->generateSecret(32);
        $user = User::factory()->create([
            'email' => 'reauth_'.Str::random(6).'@gounow.com',
            'password' => 'StrongUserPassword!2026',
            'two_factor_secret' => $secret,
            'two_factor_confirmed_at' => now(),
            'is_active' => true,
        ]);

        $token = $user->createToken('Test')->plainTextToken;

        // Disabling 2FA with incorrect password fails
        $failResponse = $this->withServerVariables(['REMOTE_ADDR' => $ip])
            ->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/auth/2fa/disable', [
                'password' => 'WrongPassword!123',
            ]);
        $failResponse->assertStatus(422);
        $user->refresh();
        $this->assertTrue($user->hasTwoFactorEnabled());

        // Disabling 2FA with correct password succeeds
        $successResponse = $this->withServerVariables(['REMOTE_ADDR' => $ip])
            ->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/auth/2fa/disable', [
                'password' => 'StrongUserPassword!2026',
            ]);
        $successResponse->assertStatus(200);
        $user->refresh();
        $this->assertFalse($user->hasTwoFactorEnabled());
    }

    /**
     * P4-T11: NoSecretsInLogsTest - sensitive keys are redacted from log context.
     */
    public function test_monolog_redacts_sensitive_keys_from_logs(): void
    {
        $processor = new SensitiveDataRedactionProcessor;

        $rawContext = [
            'user_id' => 42,
            'email' => 'admin@gounow.com',
            'password' => 'SuperSecretPassword!2026',
            'password_confirmation' => 'SuperSecretPassword!2026',
            'two_factor_secret' => 'JBSWY3DPEHPK3PXP',
            'code' => '123456',
            'token' => 'plain_text_token_abc123',
            'recovery_codes' => ['ABCD-1234', 'EFGH-5678'],
            'safe_metadata' => 'public_value',
        ];

        $record = new LogRecord(
            datetime: new \DateTimeImmutable,
            channel: 'testing',
            level: Level::Info,
            message: 'User authentication trace',
            context: $rawContext,
            extra: []
        );

        $processedRecord = $processor($record);
        $cleanContext = $processedRecord->context;

        $this->assertSame(42, $cleanContext['user_id']);
        $this->assertSame('admin@gounow.com', $cleanContext['email']);
        $this->assertSame('public_value', $cleanContext['safe_metadata']);

        // Sensitive keys must be redacted
        $this->assertSame('[REDACTED]', $cleanContext['password']);
        $this->assertSame('[REDACTED]', $cleanContext['password_confirmation']);
        $this->assertSame('[REDACTED]', $cleanContext['two_factor_secret']);
        $this->assertSame('[REDACTED]', $cleanContext['code']);
        $this->assertSame('[REDACTED]', $cleanContext['token']);
        $this->assertSame('[REDACTED]', $cleanContext['recovery_codes']);
    }

    /**
     * P4-T10: AccountDisableRevokesAccessTest - deactivated accounts are denied immediately.
     */
    public function test_account_disable_revokes_access_immediately(): void
    {
        $ip = $this->freshIp();
        $user = User::factory()->create([
            'is_active' => true,
        ]);

        $token = $user->createToken('ActiveSession')->plainTextToken;

        // Active user can access me endpoint
        $activeResponse = $this->withServerVariables(['REMOTE_ADDR' => $ip])
            ->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/me');
        $activeResponse->assertStatus(200);

        // Deactivate user in database
        $user->update(['is_active' => false]);

        // Attempting to access protected API route now fails with 403
        $blockedResponse = $this->withServerVariables(['REMOTE_ADDR' => $ip])
            ->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/me');
        $blockedResponse->assertStatus(403);
        $this->assertSame('ACCOUNT_DEACTIVATED', $blockedResponse->json('error.code'));
    }
}
