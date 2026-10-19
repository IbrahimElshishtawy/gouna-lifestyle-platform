<?php

declare(strict_types=1);

/**
 * Concurrent Booking Worker Sub-process
 * 
 * Executed as an independent OS process to simulate true concurrent contenders
 * with independent database connections, independent transaction boundaries,
 * and independent row lock acquisition against PostgreSQL.
 */

require_once __DIR__ . '/../../../vendor/autoload.php';

$app = require_once __DIR__ . '/../../../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Customer;
use App\Models\PaymentMethod;
use App\Models\Property;
use App\Modules\Booking\Application\Actions\CreateBookingAction;
use App\Modules\Booking\Application\DTOs\CreateBookingDTO;
use App\Shared\Domain\Exceptions\BookingUnavailableException;
use Carbon\Carbon;
use Illuminate\Database\QueryException;

if ($argc < 6) {
    fwrite(STDERR, "Usage: php concurrent_booking_runner.php <property_id> <customer_id> <check_in> <check_out> <payment_method_id>\n");
    exit(2);
}

$propertyId = (int) $argv[1];
$customerId = (int) $argv[2];
$checkInStr = $argv[3];
$checkOutStr = $argv[4];
$paymentMethodId = (int) $argv[5];

try {
    $property = Property::findOrFail($propertyId);
    $customer = Customer::findOrFail($customerId);
    $paymentMethod = PaymentMethod::findOrFail($paymentMethodId);

    $dto = new CreateBookingDTO(
        property: $property,
        customer: $customer,
        checkIn: Carbon::parse($checkInStr),
        checkOut: Carbon::parse($checkOutStr),
        guests: 2,
        paymentType: 'full',
        paymentMethod: $paymentMethod,
    );

    /** @var CreateBookingAction $action */
    $action = app(CreateBookingAction::class);
    $booking = $action->execute($dto);

    echo "SUCCESS: " . $booking->reference . "\n";
    exit(0);

} catch (BookingUnavailableException $e) {
    echo "UNAVAILABLE: " . $e->getMessage() . "\n";
    exit(1);
} catch (QueryException $e) {
    if (str_contains($e->getMessage(), 'bookings_no_double_booking') || str_contains($e->getMessage(), 'exclusion constraint')) {
        echo "EXCLUSION_VIOLATION: " . $e->getMessage() . "\n";
        exit(1);
    }
    fwrite(STDERR, "QUERY_ERROR: " . $e->getMessage() . "\n");
    exit(2);
} catch (\Throwable $e) {
    fwrite(STDERR, "EXCEPTION: " . get_class($e) . " - " . $e->getMessage() . "\n");
    exit(2);
}
