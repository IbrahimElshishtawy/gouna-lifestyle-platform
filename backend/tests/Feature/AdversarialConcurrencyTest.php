<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Customer;
use App\Models\Location;
use App\Models\PaymentMethod;
use App\Models\Property;
use App\Models\PropertyCategory;
use App\Models\User;
use App\Modules\Booking\Application\Actions\CreateBookingAction;
use App\Modules\Booking\Application\DTOs\CreateBookingDTO;
use App\Shared\Domain\Exceptions\BookingUnavailableException;
use Carbon\Carbon;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdversarialConcurrencyTest extends TestCase
{
    use RefreshDatabase;

    private PaymentMethod $cardMethod;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);

        $this->cardMethod = PaymentMethod::firstOrCreate(
            ['code' => 'card'],
            ['name' => 'Card', 'is_enabled' => true, 'is_online' => true]
        );
    }

    private function createCustomer(): Customer
    {
        $user = User::factory()->create();

        return Customer::create([
            'user_id' => $user->id,
            'first_name' => 'Concurrency',
            'last_name' => 'Tester',
            'email' => $user->email,
            'phone' => '+2010'.rand(10000000, 99999999),
        ]);
    }

    private function createProperty(): Property
    {
        $category = PropertyCategory::firstOrCreate(['slug' => 'concur-cat'], ['name_en' => 'Concur Cat', 'is_active' => true]);
        $location = Location::firstOrCreate(['slug' => 'concur-loc'], ['name_en' => 'Concur Loc', 'city' => 'El Gouna', 'country' => 'Egypt', 'is_active' => true]);

        $property = Property::create([
            'reference_number' => 'PROP-CONCUR-'.uniqid(),
            'slug' => 'concurrency-villa-'.uniqid(),
            'property_category_id' => $category->id,
            'location_id' => $location->id,
            'title_en' => 'Concurrency Test Villa',
            'title_ar' => 'فيلا اختبار التزامن',
            'listing_type' => 'rent',
            'bedrooms' => 2,
            'bathrooms' => 2,
            'max_guests' => 4,
            'min_stay_nights' => 1,
            'max_stay_nights' => 30,
            'base_price_cents' => 250000,
            'currency' => 'EGP',
            'is_published' => true,
            'is_available' => true,
            'status' => 'published',
        ]);

        $property->paymentMethods()->sync([$this->cardMethod->id => ['is_enabled' => true]]);

        return $property;
    }

    /**
     * Test: Simulated concurrent attempts on same property and overlapping dates.
     * Exactly one must succeed, all other overlapping attempts must fail with BookingUnavailableException.
     */
    public function test_concurrent_booking_attempts_prevent_double_booking(): void
    {
        $property = $this->createProperty();
        $action = app(CreateBookingAction::class);
        $customer1 = $this->createCustomer();
        $customer2 = $this->createCustomer();

        $dto1 = new CreateBookingDTO(
            property: $property,
            customer: $customer1,
            checkIn: Carbon::parse(now()->addDays(10)->toDateString()),
            checkOut: Carbon::parse(now()->addDays(15)->toDateString()),
            guests: 2,
            paymentType: 'full',
            paymentMethod: $this->cardMethod,
        );

        $dto2 = new CreateBookingDTO(
            property: $property,
            customer: $customer2,
            checkIn: Carbon::parse(now()->addDays(12)->toDateString()), // Overlaps with dto1
            checkOut: Carbon::parse(now()->addDays(17)->toDateString()),
            guests: 2,
            paymentType: 'full',
            paymentMethod: $this->cardMethod,
        );

        // First contender booking succeeds
        $booking1 = $action->execute($dto1);
        $this->assertNotNull($booking1);
        $this->assertEquals('pending', $booking1->status);

        // Second contender booking MUST be rejected with BookingUnavailableException
        $this->expectException(BookingUnavailableException::class);
        $action->execute($dto2);
    }

    /**
     * Test: Turnaround on same day (half-open range [check_in, check_out)) is allowed.
     */
    public function test_turnaround_booking_on_same_checkout_day_succeeds(): void
    {
        $property = $this->createProperty();
        $action = app(CreateBookingAction::class);
        $customer1 = $this->createCustomer();
        $customer2 = $this->createCustomer();

        $dto1 = new CreateBookingDTO(
            property: $property,
            customer: $customer1,
            checkIn: Carbon::parse(now()->addDays(20)->toDateString()),
            checkOut: Carbon::parse(now()->addDays(25)->toDateString()),
            guests: 2,
            paymentType: 'full',
            paymentMethod: $this->cardMethod,
        );

        $dto2 = new CreateBookingDTO(
            property: $property,
            customer: $customer2,
            checkIn: Carbon::parse(now()->addDays(25)->toDateString()), // Same day checkout turnaround
            checkOut: Carbon::parse(now()->addDays(30)->toDateString()),
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
}
