<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Customer;
use App\Models\PaymentMethod;
use App\Models\PaymentProof;
use App\Models\PaymentTransaction;
use App\Models\Property;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ManualPaymentWorkflowTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $financeUser;
    private User $customerUser;
    private User $otherCustomerUser;
    private Customer $customer;
    private Property $property;
    private PaymentMethod $bankTransferMethod;
    private Booking $booking;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);

        Storage::fake('receipts');
        Storage::fake('public');

        // 1. Roles & Users
        $this->admin = User::factory()->create([
            'is_admin' => true,
            'is_active' => true,
        ]);

        $financeRole = \App\Models\Role::firstOrCreate(['name' => 'finance'], ['display_name' => 'Finance Manager']);
        $this->financeUser = User::factory()->create([
            'is_admin' => true,
            'is_active' => true,
        ]);
        $this->financeUser->roles()->sync([$financeRole->id]);

        $this->customerUser = User::factory()->create([
            'email' => 'vip.guest@example.com',
            'is_admin' => false,
            'is_active' => true,
        ]);

        $this->otherCustomerUser = User::factory()->create([
            'email' => 'other.guest@example.com',
            'is_admin' => false,
            'is_active' => true,
        ]);

        // 2. Customer Profile
        $this->customer = Customer::create([
            'user_id' => $this->customerUser->id,
            'first_name' => 'Kareem',
            'last_name' => 'El-Sayed',
            'email' => 'vip.guest@example.com',
            'phone' => '+201001234567',
        ]);

        // 3. Property & Payment Methods
        $this->property = Property::create([
            'reference_number' => 'PROP-MANUAL-001',
            'slug' => 'marina-view-suite',
            'title_en' => 'Marina View Luxury Suite',
            'title_ar' => 'جناح مارينا الفاخر',
            'listing_type' => 'rent',
            'base_price_cents' => 500000, // 5000 EGP / night
            'currency' => 'EGP',
            'is_published' => true,
            'status' => 'published',
        ]);

        $this->bankTransferMethod = PaymentMethod::updateOrCreate(
            ['code' => 'bank_transfer'],
            [
                'name' => 'Bank Wire & Instapay Transfer',
                'description' => 'Transfer to our CIB bank account or Instapay handle.',
                'is_enabled' => true,
                'is_online' => false,
                'instructions_en' => 'Transfer to CIB account 1000-4829-9182-01 (IBAN: EG45...) and submit proof.',
                'instructions_ar' => 'قم بالتحويل لحساب البنك التجاري الدولي ثم أرفق صورة الإيصال.',
                'configuration' => [
                    'bank_name' => 'CIB Bank',
                    'account_number' => '1000-4829-9182-01',
                    'instapay_handle' => 'gounow@cib',
                ],
                'supported_currencies' => ['EGP'],
                'sort_order' => 1,
            ]
        );

        // 4. Create Baseline Pending Booking
        $plainToken = 'test-secret-token-xyz';
        $this->booking = Booking::create([
            'reference' => 'GON-2026-TEST01',
            'customer_id' => $this->customer->id,
            'bookable_type' => Property::class,
            'bookable_id' => $this->property->id,
            'check_in' => now()->addDays(2)->toDateString(),
            'check_out' => now()->addDays(5)->toDateString(),
            'nights' => 3,
            'guests' => 2,
            'subtotal_cents' => 1500000,
            'cleaning_fee_cents' => 150000,
            'service_fee_cents' => 0,
            'tax_cents' => 0,
            'total_cents' => 1650000, // 16,500 EGP
            'deposit_cents' => 1650000,
            'amount_paid_cents' => 0,
            'amount_remaining_cents' => 1650000,
            'currency' => 'EGP',
            'payment_type' => 'full',
            'payment_method_id' => $this->bankTransferMethod->id,
            'status' => 'awaiting_payment',
            'payment_status' => 'unpaid',
            'booking_access_token' => hash('sha256', $plainToken),
        ]);
        $this->booking->plain_access_token = $plainToken;
    }

    /**
     * 1. Unauthorized customer cannot submit payment proof for another customer's booking (IDOR Defense).
     */
    public function test_unauthorized_user_cannot_submit_proof_for_another_booking(): void
    {
        $file = UploadedFile::fake()->create('receipt.jpg', 200, 'image/jpeg');

        $response = $this->actingAs($this->otherCustomerUser, 'sanctum')
            ->postJson("/api/v1/checkout/bookings/{$this->booking->reference}/payment-proof", [
                'amount_cents' => 1650000,
                'payment_method_code' => 'bank_transfer',
                'receipt' => $file,
            ]);

        $response->assertStatus(403);
        $this->assertDatabaseCount('payment_proofs', 0);
    }

    /**
     * 2. Legitimate booking owner can submit valid receipt and details.
     */
    public function test_booking_owner_can_submit_valid_payment_proof(): void
    {
        $file = UploadedFile::fake()->create('cib_receipt.png', 400, 'image/png');

        $response = $this->actingAs($this->customerUser, 'sanctum')
            ->postJson("/api/v1/checkout/bookings/{$this->booking->reference}/payment-proof", [
                'amount_cents' => 1650000,
                'payment_method_code' => 'bank_transfer',
                'reference_number' => 'CIB-TX-998877',
                'sender_name' => 'Kareem El-Sayed',
                'sender_account' => '...4421',
                'transfer_date' => now()->toDateString(),
                'customer_notes' => 'Transferred via Instapay at 10:30 AM',
                'receipt' => $file,
            ]);

        $response->assertStatus(201);
        $response->assertJsonPath('data.status', 'pending_verification');
        $response->assertJsonPath('data.amount_cents', 1650000);
        $response->assertJsonPath('data.reference_number', 'CIB-TX-998877');

        $this->assertDatabaseHas('payment_proofs', [
            'booking_id' => $this->booking->id,
            'status' => 'pending_verification',
            'reference_number' => 'CIB-TX-998877',
            'amount_cents' => 1650000,
        ]);

        // Booking status remains awaiting_payment and payment_status is pending
        $this->assertEquals('awaiting_payment', $this->booking->fresh()->status);
        $this->assertEquals('pending', $this->booking->fresh()->payment_status);

        // Verify file stored on private disk
        $proof = PaymentProof::first();
        Storage::disk('receipts')->assertExists($proof->receipt_path);
    }

    /**
     * 3. Guest with valid token can submit proof without account login.
     */
    public function test_guest_with_valid_token_can_submit_proof(): void
    {
        $file = UploadedFile::fake()->create('instapay.jpg', 300, 'image/jpeg');

        $response = $this->postJson(
            "/api/v1/checkout/bookings/{$this->booking->reference}/payment-proof?token=test-secret-token-xyz",
            [
                'amount_cents' => 1650000,
                'payment_method_code' => 'bank_transfer',
                'reference_number' => 'IP-123456',
                'receipt' => $file,
            ]
        );

        $response->assertStatus(201);
        $this->assertDatabaseHas('payment_proofs', [
            'booking_id' => $this->booking->id,
            'status' => 'pending_verification',
            'reference_number' => 'IP-123456',
        ]);
    }

    /**
     * 4. Disallowed extensions (e.g. .php, .exe, .svg) and oversized files are rejected.
     */
    public function test_dangerous_or_oversized_file_is_rejected(): void
    {
        // Dangerous extension .php
        $phpFile = UploadedFile::fake()->create('malicious.php', 100, 'image/jpeg');
        $res1 = $this->actingAs($this->customerUser, 'sanctum')
            ->postJson("/api/v1/checkout/bookings/{$this->booking->reference}/payment-proof", [
                'amount_cents' => 1650000,
                'payment_method_code' => 'bank_transfer',
                'receipt' => $phpFile,
            ]);
        $res1->assertStatus(422);

        // Oversized > 5MB
        $hugeFile = UploadedFile::fake()->create('huge.jpg', 6000, 'image/jpeg'); // 6 MB
        $res2 = $this->actingAs($this->customerUser, 'sanctum')
            ->postJson("/api/v1/checkout/bookings/{$this->booking->reference}/payment-proof", [
                'amount_cents' => 1650000,
                'payment_method_code' => 'bank_transfer',
                'receipt' => $hugeFile,
            ]);
        $res2->assertStatus(422);
    }

    /**
     * 5. Duplicate submission while one is pending verification is prevented.
     */
    public function test_duplicate_pending_proof_submission_is_prevented(): void
    {
        $file1 = UploadedFile::fake()->create('receipt1.jpg', 200, 'image/jpeg');
        $this->actingAs($this->customerUser, 'sanctum')
            ->postJson("/api/v1/checkout/bookings/{$this->booking->reference}/payment-proof", [
                'amount_cents' => 1650000,
                'payment_method_code' => 'bank_transfer',
                'receipt' => $file1,
            ])
            ->assertStatus(201);

        // Second submission attempt
        $file2 = UploadedFile::fake()->create('receipt2.jpg', 200, 'image/jpeg');
        $res = $this->actingAs($this->customerUser, 'sanctum')
            ->postJson("/api/v1/checkout/bookings/{$this->booking->reference}/payment-proof", [
                'amount_cents' => 1650000,
                'payment_method_code' => 'bank_transfer',
                'receipt' => $file2,
            ]);

        $res->assertStatus(422);
        $res->assertJsonPath('error', 'A payment proof is already pending review for this reservation.');
        $this->assertDatabaseCount('payment_proofs', 1);
    }

    /**
     * 6. Receipt cannot be accessed via public web url or unauthorized guest.
     */
    public function test_receipt_cannot_be_accessed_without_authorization(): void
    {
        $file = UploadedFile::fake()->create('receipt.jpg', 200, 'image/jpeg');
        $this->actingAs($this->customerUser, 'sanctum')
            ->postJson("/api/v1/checkout/bookings/{$this->booking->reference}/payment-proof", [
                'amount_cents' => 1650000,
                'payment_method_code' => 'bank_transfer',
                'receipt' => $file,
            ]);

        $proof = PaymentProof::first();

        // Flush authentication to simulate unauthenticated guest without token
        auth('sanctum')->forgetUser();
        auth()->forgetGuards();

        // Unauthorized visitor cannot download receipt
        $resUnauth = $this->get("/api/v1/checkout/bookings/{$this->booking->reference}/receipt/{$proof->id}");
        $resUnauth->assertStatus(403);

        // Other customer cannot download receipt
        $resOther = $this->actingAs($this->otherCustomerUser, 'sanctum')
            ->get("/api/v1/checkout/bookings/{$this->booking->reference}/receipt/{$proof->id}");
        $resOther->assertStatus(403);

        // Owner can download receipt
        $resOwner = $this->actingAs($this->customerUser, 'sanctum')
            ->get("/api/v1/checkout/bookings/{$this->booking->reference}/receipt/{$proof->id}");
        $resOwner->assertStatus(200);

        // Admin can download receipt
        $resAdmin = $this->actingAs($this->admin, 'sanctum')
            ->get("/api/v1/admin/finances/payment-proofs/{$proof->id}/receipt");
        $resAdmin->assertStatus(200);
    }

    /**
     * 7. Regular customer cannot verify or reject payment proof directly.
     */
    public function test_regular_customer_cannot_verify_payment_proof(): void
    {
        $file = UploadedFile::fake()->create('receipt.jpg', 200, 'image/jpeg');
        $this->actingAs($this->customerUser, 'sanctum')
            ->postJson("/api/v1/checkout/bookings/{$this->booking->reference}/payment-proof", [
                'amount_cents' => 1650000,
                'payment_method_code' => 'bank_transfer',
                'receipt' => $file,
            ]);

        $proof = PaymentProof::first();

        $resVerify = $this->actingAs($this->customerUser, 'sanctum')
            ->postJson("/api/v1/admin/finances/payment-proofs/{$proof->id}/verify");
        $resVerify->assertStatus(403);

        $this->assertEquals('pending_verification', $proof->fresh()->status);
    }

    /**
     * 8. Authorized Finance / Super Admin verifies proof: confirms booking, records ledger transaction, audit log.
     */
    public function test_authorized_admin_can_verify_payment_proof(): void
    {
        $file = UploadedFile::fake()->create('bank_receipt.jpg', 200, 'image/jpeg');
        $this->actingAs($this->customerUser, 'sanctum')
            ->postJson("/api/v1/checkout/bookings/{$this->booking->reference}/payment-proof", [
                'amount_cents' => 1650000,
                'payment_method_code' => 'bank_transfer',
                'reference_number' => 'REF-VERIFY-001',
                'receipt' => $file,
            ]);

        $proof = PaymentProof::first();

        // Finance user approves
        $response = $this->actingAs($this->financeUser, 'sanctum')
            ->postJson("/api/v1/admin/finances/payment-proofs/{$proof->id}/verify", [
                'admin_notes' => 'Verified on CIB corporate banking portal',
            ]);

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('data.booking_status', 'confirmed');
        $response->assertJsonPath('data.payment_status', 'paid');

        // Check database updates
        $this->assertEquals('verified', $proof->fresh()->status);
        $this->assertEquals($this->financeUser->id, $proof->fresh()->reviewed_by);
        $this->assertNotNull($proof->fresh()->reviewed_at);

        // Check PaymentTransaction created
        $this->assertDatabaseHas('payment_transactions', [
            'booking_id' => $this->booking->id,
            'amount_cents' => 1650000,
            'status' => 'completed',
            'recorded_by' => $this->financeUser->id,
        ]);

        // Check Booking confirmed and paid
        $freshBooking = $this->booking->fresh();
        $this->assertEquals('confirmed', $freshBooking->status);
        $this->assertEquals('paid', $freshBooking->payment_status);
        $this->assertEquals(1650000, $freshBooking->amount_paid_cents);
        $this->assertEquals(0, $freshBooking->amount_remaining_cents);

        // Check Audit Trail
        $this->assertDatabaseHas('activity_logs', [
            'action' => 'payment_proof_verified',
            'user_id' => $this->financeUser->id,
            'entity_id' => $proof->id,
        ]);
    }

    /**
     * 9. Admin rejects proof with mandatory reason: logs reason, keeps booking editable for re-submission.
     */
    public function test_admin_can_reject_proof_with_reason(): void
    {
        $file = UploadedFile::fake()->create('blurry_receipt.jpg', 200, 'image/jpeg');
        $this->actingAs($this->customerUser, 'sanctum')
            ->postJson("/api/v1/checkout/bookings/{$this->booking->reference}/payment-proof", [
                'amount_cents' => 1650000,
                'payment_method_code' => 'bank_transfer',
                'receipt' => $file,
            ]);

        $proof = PaymentProof::first();

        // Reject without reason fails validation
        $resFail = $this->actingAs($this->financeUser, 'sanctum')
            ->postJson("/api/v1/admin/finances/payment-proofs/{$proof->id}/reject", []);
        $resFail->assertStatus(422);

        // Reject with reason succeeds
        $resSuccess = $this->actingAs($this->financeUser, 'sanctum')
            ->postJson("/api/v1/admin/finances/payment-proofs/{$proof->id}/reject", [
                'reason' => 'Receipt image is blurry and reference number does not match bank records.',
            ]);

        $resSuccess->assertStatus(200);
        $this->assertEquals('rejected', $proof->fresh()->status);
        $this->assertEquals('Receipt image is blurry and reference number does not match bank records.', $proof->fresh()->rejection_reason);

        // Customer can now view rejection and submit new proof
        $statusRes = $this->actingAs($this->customerUser, 'sanctum')
            ->getJson("/api/v1/checkout/bookings/{$this->booking->reference}/payment-proof");

        $statusRes->assertStatus(200);
        $statusRes->assertJsonPath('proofs.0.status', 'rejected');
        $statusRes->assertJsonPath('proofs.0.rejection_reason', 'Receipt image is blurry and reference number does not match bank records.');

        // Re-submission is now unblocked
        $newFile = UploadedFile::fake()->create('clear_receipt.jpg', 200, 'image/jpeg');
        $reSubmitRes = $this->actingAs($this->customerUser, 'sanctum')
            ->postJson("/api/v1/checkout/bookings/{$this->booking->reference}/payment-proof", [
                'amount_cents' => 1650000,
                'payment_method_code' => 'bank_transfer',
                'reference_number' => 'REF-CORRECTED-99',
                'receipt' => $newFile,
            ]);

        $reSubmitRes->assertStatus(201);
        $this->assertEquals('pending_verification', $reSubmitRes->json('data.status'));
    }

    /**
     * 10. Deep Health Check endpoint returns 200 with DB, cache, and storage status.
     */
    public function test_deep_health_check_endpoint(): void
    {
        $response = $this->getJson('/api/v1/health');

        $response->assertStatus(200);
        $response->assertJsonPath('status', 'healthy');
        $response->assertJsonPath('checks.database.status', 'ok');
        $response->assertJsonPath('checks.cache.status', 'ok');
        $response->assertJsonPath('checks.storage.status', 'ok');
    }

    /**
     * 11. Public payment methods endpoint exposes enabled manual methods and transfer instructions.
     */
    public function test_public_payment_methods_endpoint_exposes_transfer_instructions(): void
    {
        $response = $this->getJson('/api/v1/payment-methods');

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'code' => 'bank_transfer',
            'is_online' => false,
        ]);
    }

    /**
     * 12. Concurrency test: Two admins attempting to verify the same proof simultaneously.
     * Second attempt fails cleanly because first transaction transitions status away from pending_verification.
     */
    public function test_concurrent_verification_prevents_double_approval(): void
    {
        $file = UploadedFile::fake()->create('concurrent_receipt.jpg', 200, 'image/jpeg');
        $this->actingAs($this->customerUser, 'sanctum')
            ->postJson("/api/v1/checkout/bookings/{$this->booking->reference}/payment-proof", [
                'amount_cents' => 1650000,
                'payment_method_code' => 'bank_transfer',
                'receipt' => $file,
            ]);

        $proof = PaymentProof::first();

        $admin2 = User::factory()->create([
            'is_admin' => true,
            'is_active' => true,
        ]);

        // First admin verifies successfully
        $res1 = $this->actingAs($this->admin, 'sanctum')
            ->postJson("/api/v1/admin/finances/payment-proofs/{$proof->id}/verify", [
                'admin_notes' => 'Admin 1 approved first',
            ]);
        $res1->assertStatus(200);

        // Second admin tries to verify the same proof concurrently
        $res2 = $this->actingAs($admin2, 'sanctum')
            ->postJson("/api/v1/admin/finances/payment-proofs/{$proof->id}/verify", [
                'admin_notes' => 'Admin 2 race condition attempt',
            ]);
        $res2->assertStatus(422);
        $res2->assertJsonPath('error', "Cannot verify payment proof #{$proof->id} with current status 'verified'.");

        // Verify only 1 payment transaction was ever recorded for this booking
        $this->assertEquals(1, PaymentTransaction::where('booking_id', $this->booking->id)->count());
        $this->assertEquals(1650000, $this->booking->fresh()->amount_paid_cents);
    }
}

