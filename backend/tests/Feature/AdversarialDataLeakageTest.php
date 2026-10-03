<?php

namespace Tests\Feature;

use App\Logging\SensitiveDataRedactionProcessor;
use App\Models\Property;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Log;
use Monolog\Level;
use Monolog\LogRecord;
use Tests\TestCase;

class AdversarialDataLeakageTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);
    }

    /**
     * Test 1: Property API responses never leak internal admin notes.
     */
    public function test_property_api_does_not_leak_internal_notes(): void
    {
        $property = Property::create([
            'reference_number' => 'PROP-LEAK-'.uniqid(),
            'slug' => 'secret-notes-villa-'.uniqid(),
            'title_en' => 'Leak Check Villa',
            'title_ar' => 'فيلا تدقيق التسريب',
            'listing_type' => 'rent',
            'base_price_cents' => 150000,
            'currency' => 'EGP',
            'internal_notes' => 'SUPER_SECRET_ADMIN_COMMISSION_NOTE',
            'is_published' => true,
            'status' => 'published',
        ]);

        $resIndex = $this->getJson('/api/v1/stays');
        $resIndex->assertStatus(200);
        $resIndex->assertJsonMissing(['internal_notes' => 'SUPER_SECRET_ADMIN_COMMISSION_NOTE']);
        $this->assertStringNotContainsString('SUPER_SECRET_ADMIN_COMMISSION_NOTE', $resIndex->content());

        $resShow = $this->getJson("/api/v1/stays/{$property->slug}");
        $resShow->assertStatus(200);
        $resShow->assertJsonMissing(['internal_notes' => 'SUPER_SECRET_ADMIN_COMMISSION_NOTE']);
        $this->assertStringNotContainsString('SUPER_SECRET_ADMIN_COMMISSION_NOTE', $resShow->content());
    }

    /**
     * Test 2: User profile API never leaks 2FA secret, recovery codes, or password hash.
     */
    public function test_user_profile_api_does_not_leak_secrets(): void
    {
        $user = User::factory()->create([
            'two_factor_secret' => 'SECRET_TOTP_KEY_BASE32',
            'two_factor_recovery_codes' => json_encode(['hash1', 'hash2']),
            'password' => 'HashedPasswordValue',
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/customer/me');

        $response->assertStatus(200);
        $response->assertJsonMissing([
            'two_factor_secret' => 'SECRET_TOTP_KEY_BASE32',
            'password' => 'HashedPasswordValue',
        ]);
        $this->assertStringNotContainsString('SECRET_TOTP_KEY_BASE32', $response->content());
        $this->assertStringNotContainsString('HashedPasswordValue', $response->content());
    }

    /**
     * Test 3: Log Redaction Processor masks passwords and tokens.
     */
    public function test_sensitive_keys_are_redacted_in_logger_context(): void
    {
        $context = [
            'password' => 'PlainSecret123',
            'token' => 'Bearer eyJhbGciOi...',
            'card_number' => '4111111111111111',
            'safe_param' => 'PublicValue',
        ];

        $processor = new SensitiveDataRedactionProcessor;
        $record = new LogRecord(
            new \DateTimeImmutable,
            'testing',
            Level::Info,
            'Test message',
            $context
        );

        $processed = $processor($record);

        $this->assertEquals('[REDACTED]', $processed->context['password']);
        $this->assertEquals('[REDACTED]', $processed->context['token']);
        $this->assertEquals('[REDACTED]', $processed->context['card_number']);
        $this->assertEquals('PublicValue', $processed->context['safe_param']);
    }
}
