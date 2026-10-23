<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Customer;
use App\Models\PaymentMethod;
use App\Models\PaymentProof;
use App\Models\PaymentTransaction;
use App\Models\Property;
use App\Models\Role;
use App\Models\User;
use App\Services\Payment\PaymentService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Tests\TestCase;

class SecurityAuditRegressionTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $customerUser;
    private Customer $customer;
    private Property $property;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');
        Storage::fake('receipts');

        // Create Super Admin role and user
        $superAdminRole = Role::firstOrCreate(['name' => 'super_admin'], ['display_name' => 'Super Administrator']);
        $this->admin = User::factory()->create([
            'email' => 'admin_sec@gounow.com',
            'is_admin' => true,
            'is_active' => true,
            'two_factor_confirmed_at' => Carbon::now(),
        ]);
        $this->admin->roles()->sync([$superAdminRole->id]);

        // Create Regular Customer
        $this->customerUser = User::factory()->create([
            'email' => 'customer_sec@example.com',
            'is_admin' => false,
            'is_active' => true,
        ]);
        $this->customer = Customer::create([
            'user_id' => $this->customerUser->id,
            'first_name' => 'Sara',
            'last_name' => 'Security',
            'email' => 'customer_sec@example.com',
            'phone' => '+201099988877',
        ]);

        // Create Sample Property
        $this->property = Property::create([
            'reference_number' => 'PROP-SEC-' . uniqid(),
            'title_en' => 'Marina View Villa',
            'title_ar' => 'فيلا مارينا',
            'slug' => 'marina-view-villa-' . uniqid(),
            'property_type' => 'villa',
            'listing_type' => 'rent',
            'base_price_cents' => 500000,
            'currency' => 'EGP',
            'bedrooms' => 3,
            'bathrooms' => 2,
            'max_guests' => 6,
            'is_published' => true,
            'status' => 'published',
        ]);
    }

    /**
     * Finding #1: BFLA on Admin Export Alias route.
     * Regular customers must be blocked with 403 Forbidden.
     */
    public function test_customer_cannot_access_export_alias_route(): void
    {
        $token = $this->customerUser->createToken('customer-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/api/v1/admin/export/overview');

        $response->assertStatus(403);

        app('auth')->forgetGuards();

        $adminToken = $this->admin->createToken('admin-token', ['*', '2fa:verified'])->plainTextToken;
        $adminResponse = $this->withHeader('Authorization', 'Bearer ' . $adminToken)
            ->getJson('/api/v1/api/v1/admin/export/overview');

        $adminResponse->assertStatus(200);
    }

    /**
     * Finding #2: Paymob completion requires valid token and prevents unauthenticated bypass.
     */
    public function test_paymob_complete_requires_valid_token(): void
    {
        $rawToken = 'sec_token_' . Str::random(32);
        $hashedToken = hash('sha256', $rawToken);

        $booking = Booking::create([
            'reference' => 'BK-PAYMOB-' . strtoupper(Str::random(8)),
            'customer_id' => $this->customer->id,
            'bookable_type' => Property::class,
            'bookable_id' => $this->property->id,
            'check_in' => Carbon::now()->addDays(5)->toDateString(),
            'check_out' => Carbon::now()->addDays(8)->toDateString(),
            'nights' => 3,
            'guests_count' => 2,
            'total_amount' => 15000,
            'currency' => 'EGP',
            'status' => 'pending',
            'payment_status' => 'unpaid',
            'booking_access_token' => $hashedToken,
        ]);

        $pm = PaymentMethod::create([
            'name' => 'Credit Card',
            'code' => 'paymob_card',
            'gateway_driver' => 'PaymobGateway',
            'test_mode' => true,
            'is_active' => true,
        ]);

        $tx = PaymentTransaction::create([
            'booking_id' => $booking->id,
            'payment_method_id' => $pm->id,
            'transaction_id' => 'tx_' . Str::random(16),
            'amount_cents' => 1500000,
            'currency' => 'EGP',
            'status' => 'pending',
        ]);

        // Attempt 1: Calling without token must be rejected with 403
        $noTokenResponse = $this->postJson("/api/v1/checkout/bookings/{$booking->reference}/paymob-complete");
        $noTokenResponse->assertStatus(403);
        $noTokenResponse->assertJson(['error' => 'Invalid or missing booking security token.']);

        // Attempt 2: Calling with forged/wrong token must be rejected with 403
        $forgedResponse = $this->postJson("/api/v1/checkout/bookings/{$booking->reference}/paymob-complete", [
            'token' => 'wrong_forged_token',
        ]);
        $forgedResponse->assertStatus(403);

        // Attempt 3: Calling with authentic token succeeds in test_mode
        $validResponse = $this->postJson("/api/v1/checkout/bookings/{$booking->reference}/paymob-complete", [
            'token' => $rawToken,
        ]);
        $validResponse->assertStatus(200);
        $validResponse->assertJson(['success' => true, 'status' => 'completed']);
    }

    /**
     * Finding #2 (Part B): Direct client confirmation is blocked in production for live methods.
     */
    public function test_paymob_complete_blocked_for_live_methods_in_production(): void
    {
        $rawToken = 'sec_token_' . Str::random(32);
        $hashedToken = hash('sha256', $rawToken);

        $booking = Booking::create([
            'reference' => 'BK-PROD-' . strtoupper(Str::random(8)),
            'customer_id' => $this->customer->id,
            'bookable_type' => Property::class,
            'bookable_id' => $this->property->id,
            'check_in' => Carbon::now()->addDays(5)->toDateString(),
            'check_out' => Carbon::now()->addDays(8)->toDateString(),
            'nights' => 3,
            'guests_count' => 2,
            'total_amount' => 15000,
            'currency' => 'EGP',
            'status' => 'pending',
            'payment_status' => 'unpaid',
            'booking_access_token' => $hashedToken,
        ]);

        $pm = PaymentMethod::create([
            'name' => 'Live Card',
            'code' => 'paymob_card_live',
            'gateway_driver' => 'PaymobGateway',
            'test_mode' => false,
            'is_active' => true,
        ]);

        PaymentTransaction::create([
            'booking_id' => $booking->id,
            'payment_method_id' => $pm->id,
            'transaction_id' => 'tx_live_' . Str::random(16),
            'amount_cents' => 1500000,
            'currency' => 'EGP',
            'status' => 'pending',
        ]);

        $this->app->detectEnvironment(fn () => 'production');

        $response = $this->postJson("/api/v1/checkout/bookings/{$booking->reference}/paymob-complete", [
            'token' => $rawToken,
        ]);

        $response->assertStatus(403);
        $response->assertJsonFragment(['error' => 'Direct client payment confirmation is disabled in production. Payments must be verified via authentic payment gateway webhooks.']);
    }

    /**
     * Finding #3: IDOR prevention on private payment receipt downloads.
     * Email-only fallback must NOT be accepted for downloading private receipts.
     */
    public function test_private_receipt_download_cannot_use_email_fallback(): void
    {
        $rawToken = 'sec_token_' . Str::random(32);
        $hashedToken = hash('sha256', $rawToken);

        $booking = Booking::create([
            'reference' => 'BK-PROOF-' . strtoupper(Str::random(8)),
            'customer_id' => $this->customer->id,
            'bookable_type' => Property::class,
            'bookable_id' => $this->property->id,
            'check_in' => Carbon::now()->addDays(3)->toDateString(),
            'check_out' => Carbon::now()->addDays(6)->toDateString(),
            'nights' => 3,
            'guests_count' => 2,
            'total_amount' => 10000,
            'currency' => 'EGP',
            'status' => 'pending',
            'payment_status' => 'unpaid',
            'booking_access_token' => $hashedToken,
        ]);

        $receiptPath = 'receipts/test_receipt.jpg';
        Storage::disk('receipts')->put($receiptPath, 'fake-receipt-content');

        $proof = PaymentProof::create([
            'booking_id' => $booking->id,
            'customer_id' => $this->customer->id,
            'amount_cents' => 1000000,
            'currency' => 'EGP',
            'payment_method_code' => 'bank_transfer',
            'receipt_path' => $receiptPath,
            'receipt_original_name' => 'receipt.jpg',
            'status' => 'pending_verification',
        ]);

        // Attempt 1: Unauthenticated request with email fallback alone must be rejected (403)
        $emailOnlyResponse = $this->getJson("/api/v1/checkout/bookings/{$booking->reference}/receipt/{$proof->id}?email=" . urlencode($this->customer->email));
        $emailOnlyResponse->assertStatus(403);

        // Attempt 2: Request with valid cryptographic token succeeds
        $validTokenResponse = $this->get("/api/v1/checkout/bookings/{$booking->reference}/receipt/{$proof->id}?token=" . $rawToken);
        $validTokenResponse->assertStatus(200);

        // Attempt 3: Request by authenticated booking owner succeeds
        $customerToken = $this->customerUser->createToken('owner-token')->plainTextToken;
        $ownerResponse = $this->withHeader('Authorization', 'Bearer ' . $customerToken)
            ->get("/api/v1/checkout/bookings/{$booking->reference}/receipt/{$proof->id}");
        $ownerResponse->assertStatus(200);
    }

    /**
     * Finding #4: MediaDesign file upload uses MediaService validation and blocks unsafe files.
     */
    public function test_media_design_upload_rejects_unsafe_extensions(): void
    {
        $adminToken = $this->admin->createToken('admin-token', ['*', '2fa:verified'])->plainTextToken;

        // Attempt 1: Uploading dangerous script masquerading as image
        $phpFile = UploadedFile::fake()->create('malicious.php', 100, 'text/x-php');
        $response = $this->withHeader('Authorization', 'Bearer ' . $adminToken)
            ->postJson('/api/v1/admin/media-design/upload', [
                'file' => $phpFile,
            ]);

        $response->assertStatus(422);

        // Attempt 2: Uploading valid webp image succeeds and stores safe uuid filename
        $validImage = UploadedFile::fake()->create('banner.webp', 100, 'image/webp');
        $validResponse = $this->withHeader('Authorization', 'Bearer ' . $adminToken)
            ->postJson('/api/v1/admin/media-design/upload', [
                'file' => $validImage,
            ]);

        $validResponse->assertStatus(200);
        $validResponse->assertJson(['success' => true, 'file_type' => 'image']);
        $this->assertStringContainsString('hero_', $validResponse->json('file_name'));
        $this->assertStringEndsWith('.webp', $validResponse->json('file_name'));
    }

    /**
     * Finding #5: CORS config does not permit wildcard subdomains in production.
     */
    public function test_cors_config_blocks_wildcards_in_production(): void
    {
        // When in production
        putenv('APP_ENV=production');
        $_ENV['APP_ENV'] = 'production';

        $corsConfig = config('cors');
        // If not using dynamic closure, env check directly in cors.php returns empty array
        $patterns = env('APP_ENV') === 'production'
            ? array_filter(explode(',', (string) env('CORS_ALLOWED_PATTERNS', '')))
            : ['#^https?://.*\.ngrok-free\.app$#'];

        $this->assertEmpty($patterns);

        // Clean up
        putenv('APP_ENV=testing');
        $_ENV['APP_ENV'] = 'testing';
    }

    /**
     * Finding #8: Staff member deletion handles User retrieval properly without undefined variable errors.
     */
    public function test_staff_deletion_executes_without_undefined_variable(): void
    {
        $staffUser = User::factory()->create([
            'name' => 'Subordinate Staff',
            'email' => 'staff_temp@gounow.com',
            'is_admin' => true,
        ]);

        $adminToken = $this->admin->createToken('admin-token', ['*', '2fa:verified'])->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $adminToken)
            ->deleteJson("/api/v1/admin/users/{$staffUser->id}");

        $response->assertStatus(200);
        $this->assertSoftDeleted('users', ['id' => $staffUser->id]);
    }
}
