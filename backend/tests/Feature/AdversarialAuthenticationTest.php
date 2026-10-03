<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class AdversarialAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);
    }

    /**
     * Attack 1: User enumeration via login error messages.
     * Both non-existent email and wrong password MUST return identical generic 422 validation response.
     */
    public function test_login_returns_identical_generic_error_preventing_user_enumeration(): void
    {
        $existingUser = User::factory()->create([
            'email' => 'victim@example.com',
            'password' => 'SecurePass123!@#',
        ]);

        // Case A: Existing email, wrong password
        $resWrongPass = $this->postJson('/api/v1/auth/login', [
            'email' => 'victim@example.com',
            'password' => 'WrongPassword999!',
        ]);

        // Case B: Non-existent email
        $resNonExistent = $this->postJson('/api/v1/auth/login', [
            'email' => 'ghost@example.com',
            'password' => 'AnyPassword123!',
        ]);

        $resWrongPass->assertStatus(422);
        $resNonExistent->assertStatus(422);

        $msg1 = $resWrongPass->json('error.details.email.0') ?? $resWrongPass->json('errors.email.0');
        $msg2 = $resNonExistent->json('error.details.email.0') ?? $resNonExistent->json('errors.email.0');

        $this->assertEquals($msg1, $msg2);
        $this->assertEquals('Invalid email or password.', $msg1);
    }

    /**
     * Attack 2: Disabled user cannot authenticate or use existing token.
     */
    public function test_deactivated_account_instantly_denied_access(): void
    {
        $user = User::factory()->create([
            'is_active' => false,
            'password' => 'SecurePass123!@#',
        ]);

        $token = $user->createToken('test-token')->plainTextToken;

        // Try authenticated endpoint with token
        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/customer/me');

        $response->assertStatus(403);
    }

    /**
     * Attack 3: Password reset token cannot be used twice.
     */
    public function test_password_reset_token_cannot_be_replayed(): void
    {
        $user = User::factory()->create(['email' => 'resetme@example.com']);
        $rawToken = bin2hex(random_bytes(32));

        DB::table('password_reset_tokens')->insert([
            'email' => 'resetme@example.com',
            'token' => hash('sha256', $rawToken),
            'created_at' => now(),
        ]);

        // First reset succeeds
        $res1 = $this->postJson('/api/v1/auth/reset-password', [
            'token' => $rawToken,
            'email' => 'resetme@example.com',
            'password' => 'NewStrongPassword123!@#',
            'password_confirmation' => 'NewStrongPassword123!@#',
        ]);
        $res1->assertStatus(200);

        // Replay attempt with same token MUST be rejected
        $res2 = $this->postJson('/api/v1/auth/reset-password', [
            'token' => $rawToken,
            'email' => 'resetme@example.com',
            'password' => 'AnotherPassword123!@#',
            'password_confirmation' => 'AnotherPassword123!@#',
        ]);
        $res2->assertStatus(422);
    }
}
