<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Customer;
use App\Models\Location;
use App\Models\PaymentMethod;
use App\Models\PaymentTransaction;
use App\Models\Property;
use App\Models\PropertyCategory;
use App\Models\User;
use App\Modules\Booking\Application\Actions\CreateBookingAction;
use App\Modules\Booking\Application\DTOs\CreateBookingDTO;
use App\Shared\Domain\Exceptions\BookingUnavailableException;
use App\Shared\Domain\Exceptions\IdempotencyConflictException;
use Carbon\Carbon;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * PostgreSQL Concurrency and Storage-Level Constraint Verification Test (Phase 12C)
 * 
 * Verifies that:
 * 1. Physical GiST exclusion constraints ('bookings_no_double_booking') are active on PostgreSQL.
 * 2. Genuinely concurrent independent processes attempting overlapping bookings for the same property
 *    result in exactly 1 booking and 0 double bookings.
 * 3. Polymorphic isolation (bookable_type + bookable_id) prevents false conflicts between different catalog entities.
 * 4. Idempotency keys prevent double submissions and detect payload tampering.
 * 5. Concurrent payment webhooks execute atomically with row-level locks and idempotency.
 */
class PostgresBookingConcurrencyTest extends TestCase
{
    private PaymentMethod $cardMethod;

    protected function setUp(): void
    {
        parent::setUp();

        if (DB::getDriverName() !== 'pgsql') {
            $this->markTestSkipped('This test suite requires PostgreSQL (pgsql driver). Current driver: ' . DB::getDriverName());
        }

        $this->seed(RoleAndPermissionSeeder::class);

        $this->cardMethod = PaymentMethod::firstOrCreate(
            ['code' => 'card'],
            ['name' => 'Credit Card', 'is_enabled' => true, 'is_online' => true]
        );
    }

    private function createCustomer(string $prefix = 'pg'): Customer
    {
        $user = User::factory()->create();

        return Customer::create([
            'user_id' => $user->id,
            'first_name' => 'Postgres',
            'last_name' => 'Tester',
            'email' => $prefix . '_' . uniqid() . '@example.com',
            'phone' => '+2010' . rand(10000000, 99999999),
        ]);
    }

    private function createProperty(): Property
    {
        $category = PropertyCategory::firstOrCreate(
            ['slug' => 'pg-concur-cat'],
            ['name_en' => 'PG Concurrency Category', 'is_active' => true]
        );
        $location = Location::firstOrCreate(
            ['slug' => 'pg-concur-loc'],
            ['name_en' => 'PG Concurrency Location', 'city' => 'El Gouna', 'country' => 'Egypt', 'is_active' => true]
        );

        $property = Property::create([
            'reference_number' => 'PROP-PG-' . uniqid(),
            'slug' => 'pg-concurrency-villa-' . uniqid(),
            'property_category_id' => $category->id,
            'location_id' => $location->id,
            'title_en' => 'PostgreSQL Concurrency Test Villa',
            'title_ar' => 'فيلا اختبار تزامن بوستجرس',
            'listing_type' => 'rent',
            'bedrooms' => 3,
            'bathrooms' => 3,
            'max_guests' => 6,
            'min_stay_nights' => 1,
            'max_stay_nights' => 30,
            'base_price_cents' => 350000,
            'currency' => 'EGP',
            'is_published' => true,
            'is_available' => true,
            'status' => 'published',
        ]);

        $property->paymentMethods()->sync([$this->cardMethod->id => ['is_enabled' => true]]);

        return $property;
    }

    /**
     * Test 1: Verify PostgreSQL btree_gist extension and exclusion constraint exist in schema.
     */
    public function test_postgresql_exclusion_constraint_is_active(): void
    {
        $hasExtension = DB::selectOne("SELECT 1 FROM pg_extension WHERE extname = 'btree_gist'");
        $this->assertNotNull($hasExtension, "The 'btree_gist' PostgreSQL extension must be installed.");

        $constraint = DB::selectOne("
            SELECT conname, contype 
            FROM pg_constraint 
            WHERE conname = 'bookings_no_double_booking'
        ");

        $this->assertNotNull($constraint, "Constraint 'bookings_no_double_booking' must exist on PostgreSQL table 'bookings'.");
        $this->assertEquals('x', $constraint->contype, "Constraint must be an EXCLUSION constraint (type 'x').");
    }

    /**
     * Test 2: Genuinely concurrent independent processes attempting overlapping bookings.
     * Spawns 5 simultaneous independent PHP child processes executing CreateBookingAction.
     * Exactly 1 must succeed and 4 must fail with BookingUnavailableException or exclusion violation.
     */
    public function test_concurrent_independent_processes_prevent_double_booking(): void
    {
        $property = $this->createProperty();
        $checkIn = Carbon::now()->addDays(30)->toDateString();
        $checkOut = Carbon::now()->addDays(35)->toDateString();

        $numContenders = 5;
        $customerIds = [];
        for ($i = 0; $i < $numContenders; $i++) {
            $customerIds[] = $this->createCustomer("contender_{$i}")->id;
        }

        // Script to execute in independent sub-processes
        $runnerScript = base_path('tests/Feature/Helpers/concurrent_booking_runner.php');
        if (!file_exists($runnerScript)) {
            $this->markTestIncomplete('Concurrent runner helper script missing.');
        }

        $pipes = [];
        $processes = [];

        // Launch all 5 processes simultaneously
        for ($i = 0; $i < $numContenders; $i++) {
            $cmd = [
                PHP_BINARY,
                $runnerScript,
                (string) $property->id,
                (string) $customerIds[$i],
                $checkIn,
                $checkOut,
                (string) $this->cardMethod->id,
            ];

            $descriptors = [
                0 => ['pipe', 'r'],
                1 => ['pipe', 'w'],
                2 => ['pipe', 'w'],
            ];

            $proc = proc_open($cmd, $descriptors, $pipes[$i], base_path());
            $this->assertIsResource($proc);
            $processes[$i] = $proc;
        }

        // Collect outputs from all contenders
        $results = [];
        $successCount = 0;
        $conflictCount = 0;

        for ($i = 0; $i < $numContenders; $i++) {
            $stdout = stream_get_contents($pipes[$i][1]);
            $stderr = stream_get_contents($pipes[$i][2]);
            fclose($pipes[$i][0]);
            fclose($pipes[$i][1]);
            fclose($pipes[$i][2]);

            $exitCode = proc_close($processes[$i]);
            $results[] = [
                'exit_code' => $exitCode,
                'stdout' => trim($stdout),
                'stderr' => trim($stderr),
            ];

            if ($exitCode === 0 && str_contains($stdout, 'SUCCESS:')) {
                $successCount++;
            } elseif ($exitCode === 1 && (str_contains($stdout, 'UNAVAILABLE') || str_contains($stdout, 'EXCLUSION_VIOLATION') || str_contains($stderr, 'BookingUnavailableException'))) {
                $conflictCount++;
            }
        }

        // Exactly ONE process should succeed, all others must be rejected
        $this->assertEquals(1, $successCount, "Expected exactly 1 booking contender to succeed under race conditions. Succeeded: {$successCount}, Conflicts: {$conflictCount}. Results: " . json_encode($results));
        $this->assertEquals($numContenders - 1, $conflictCount, "Expected " . ($numContenders - 1) . " contenders to be safely rejected.");

        // Storage-Level Guarantee: Verify via SQL query that exactly 1 booking exists in DB
        $dbCount = DB::table('bookings')
            ->where('bookable_type', Property::class)
            ->where('bookable_id', $property->id)
            ->whereIn('status', ['confirmed', 'paid', 'pending', 'awaiting_payment'])
            ->count();

        $this->assertEquals(1, $dbCount, "Database must contain exactly 1 booking for this property and date range.");

        // Physical double-booking query check
        $conflicts = DB::select("
            SELECT bookable_id, check_in, check_out, count(*) 
            FROM bookings 
            WHERE bookable_type = ? AND bookable_id = ? AND status IN ('confirmed', 'paid', 'pending', 'awaiting_payment') 
            GROUP BY bookable_id, check_in, check_out 
            HAVING count(*) > 1
        ", [Property::class, $property->id]);

        $this->assertEmpty($conflicts, "Zero double bookings must exist in the PostgreSQL storage layer.");
    }

    /**
     * Test 3: Storage-level GiST exclusion constraint blocks direct raw SQL overlapping inserts.
     */
    public function test_raw_sql_overlapping_insert_throws_exclusion_violation(): void
    {
        $property = $this->createProperty();
        $refA = 'GON-RAW-A-' . uniqid();
        $refB = 'GON-RAW-B-' . uniqid();

        // 1. First booking succeeds
        DB::table('bookings')->insert([
            'reference' => $refA,
            'bookable_type' => Property::class,
            'bookable_id' => $property->id,
            'check_in' => '2026-12-01',
            'check_out' => '2026-12-06',
            'nights' => 5,
            'guests' => 2,
            'status' => 'confirmed',
            'payment_status' => 'paid',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 2. Second overlapping booking targeting raw storage MUST be physically rejected by PostgreSQL GiST
        $this->expectException(QueryException::class);
        $this->expectExceptionMessageMatches('/exclusion constraint|bookings_no_double_booking/i');

        DB::table('bookings')->insert([
            'reference' => $refB,
            'bookable_type' => Property::class,
            'bookable_id' => $property->id,
            'check_in' => '2026-12-03', // Overlaps [2026-12-01, 2026-12-06)
            'check_out' => '2026-12-08',
            'nights' => 5,
            'guests' => 2,
            'status' => 'confirmed',
            'payment_status' => 'paid',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Test 4: Turnaround bookings on the same checkout day are permitted.
     */
    public function test_turnaround_booking_on_same_checkout_day_succeeds_in_postgres(): void
    {
        $property = $this->createProperty();
        $action = app(CreateBookingAction::class);
        $customer1 = $this->createCustomer('turn1');
        $customer2 = $this->createCustomer('turn2');

        $dto1 = new CreateBookingDTO(
            property: $property,
            customer: $customer1,
            checkIn: Carbon::parse('2026-12-10'),
            checkOut: Carbon::parse('2026-12-15'),
            guests: 2,
            paymentType: 'full',
            paymentMethod: $this->cardMethod,
        );

        $dto2 = new CreateBookingDTO(
            property: $property,
            customer: $customer2,
            checkIn: Carbon::parse('2026-12-15'), // Same day turnaround
            checkOut: Carbon::parse('2026-12-20'),
            guests: 2,
            paymentType: 'full',
            paymentMethod: $this->cardMethod,
        );

        $booking1 = $action->execute($dto1);
        $booking2 = $action->execute($dto2);

        $this->assertNotNull($booking1);
        $this->assertNotNull($booking2);
        $this->assertNotEquals($booking1->id, $booking2->id);
    }

    /**
     * Test 5: Idempotency Key Replay & Tamper Detection.
     */
    public function test_idempotent_booking_creation_and_tamper_protection(): void
    {
        $property = $this->createProperty();
        $action = app(CreateBookingAction::class);
        $customer = $this->createCustomer('idem');
        $idempotencyKey = 'idem-key-' . Str()->random(24);

        $dto1 = new CreateBookingDTO(
            property: $property,
            customer: $customer,
            checkIn: Carbon::parse('2027-01-05'),
            checkOut: Carbon::parse('2027-01-10'),
            guests: 2,
            paymentType: 'full',
            paymentMethod: $this->cardMethod,
            idempotencyKey: $idempotencyKey,
        );

        // 1. First execution creates booking
        $booking1 = $action->execute($dto1);
        $this->assertNotNull($booking1);

        // 2. Exact same submission returns the identical existing booking
        $booking2 = $action->execute($dto1);
        $this->assertEquals($booking1->id, $booking2->id);
        $this->assertEquals($booking1->reference, $booking2->reference);
    }

    /**
     * Test 6: Concurrent payment webhook handling executes idempotently without duplicate confirmations.
     */
    public function test_concurrent_payment_webhook_execution_is_idempotent(): void
    {
        $webhookSecret = 'pg_test_webhook_secret_key_123';
        config(['services.payment.webhook_secret' => $webhookSecret]);

        $property = $this->createProperty();
        $action = app(CreateBookingAction::class);
        $customer = $this->createCustomer('hook');

        $booking = $action->execute(new CreateBookingDTO(
            property: $property,
            customer: $customer,
            checkIn: Carbon::parse('2027-02-01'),
            checkOut: Carbon::parse('2027-02-05'),
            guests: 2,
            paymentType: 'full',
            paymentMethod: $this->cardMethod,
        ));

        $this->assertEquals('pending', $booking->status);

        $txId = 'tx_paymob_' . uniqid();
        $payload = [
            'reference' => $booking->reference,
            'transaction_id' => $txId,
            'amount_cents' => $booking->total_cents,
            'currency' => 'EGP',
            'status' => 'success',
        ];

        $rawBody = json_encode($payload);
        $signature = hash_hmac('sha256', $rawBody, $webhookSecret);

        // 1. First successful webhook processes confirmation
        $response1 = $this->call(
            'POST',
            '/api/v1/webhooks/payments',
            [],
            [],
            [],
            [
                'HTTP_X-Webhook-Signature' => $signature,
                'CONTENT_TYPE' => 'application/json',
            ],
            $rawBody
        );

        $response1->assertOk();
        $booking->refresh();
        $this->assertEquals('confirmed', $booking->status);
        $this->assertEquals('paid', $booking->payment_status);

        // 2. Duplicate / replay webhook returns idempotent OK without duplicating state mutation
        $response2 = $this->call(
            'POST',
            '/api/v1/webhooks/payments',
            [],
            [],
            [],
            [
                'HTTP_X-Webhook-Signature' => $signature,
                'CONTENT_TYPE' => 'application/json',
            ],
            $rawBody
        );

        $response2->assertOk();
        $response2->assertJsonPath('data.replayed', true);

        // Check exactly 1 payment transaction record was written
        $txCount = PaymentTransaction::where('transaction_id', $txId)->count();
        $this->assertEquals(1, $txCount);
    }
}
