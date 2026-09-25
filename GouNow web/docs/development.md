# Developer Guide & Code Contribution Standards

## 1. Welcome to GouNow Engineering
This guide defines the standards and workflows for building new features, modifying domain rules, and maintaining code quality across the GouNow platform.

---

## 2. Where Does Logic Live? (Architecture Decision Matrix)

When tasked with implementing a new requirement, use this decision matrix:

| Requirement | Correct Location | Example Class |
| :--- | :--- | :--- |
| **Validate HTTP input** | `Presentation/Requests` | `ProcessCheckoutRequest` |
| **Render a view or return JSON** | `Presentation/Controllers` | `CheckoutController` |
| **Read/Filter/Calculate data without DB mutations** | `Application/Queries` | `CalculateBookingQuoteQuery`, `FilterAvailablePropertiesQuery` |
| **Perform a state mutation or DB write** | `Application/Actions` | `CreateBookingAction`, `CancelBookingAction` |
| **Pass structured parameters between layers** | `Application/DTOs` | `CreateBookingDTO`, `PricingQuoteDTO` |
| **Self-validating business primitives (Money, dates)** | `Shared/Domain/ValueObjects` | `Money`, `DateRange`, `GuestCount` |
| **Database schema, relations, casts** | `Domain/Entities` (Models) | `Property`, `Booking`, `PaymentTransaction` |
| **Asynchronous side effects (Email, WhatsApp)** | `Application/Jobs` or `Listeners` | `SendBookingConfirmationEmailJob` |
| **Low-level integrations (Redis, Gateways)** | `Infrastructure/` | `DatabaseLockManager`, `StripePaymentGateway` |

---

## 3. How to Implement a New Feature: Step-by-Step

Suppose you need to implement **"Apply Guest Early Check-in Fee"**:

### Step 1: Define or Re-use Value Objects & DTO
If new structured data is required, define a DTO:
```php
// app/Modules/Booking/Application/DTOs/EarlyCheckInDTO.php
namespace App\Modules\Booking\Application\DTOs;

use App\Shared\Domain\ValueObjects\Money;

readonly class EarlyCheckInDTO
{
    public function __construct(
        public int $bookingId,
        public int $requestedHoursEarly,
        public Money $fee,
    ) {}
}
```

### Step 2: Implement the Action
Encapsulate the state change and financial calculation inside an Action within a database transaction:
```php
// app/Modules/Booking/Application/Actions/ApplyEarlyCheckInAction.php
namespace App\Modules\Booking\Application\Actions;

use App\Modules\Booking\Application\DTOs\EarlyCheckInDTO;
use App\Models\Booking;
use Illuminate\Support\Facades\DB;

class ApplyEarlyCheckInAction
{
    public function execute(EarlyCheckInDTO $dto): Booking
    {
        return DB::transaction(function () use ($dto) {
            $booking = Booking::where('id', $dto->bookingId)->lockForUpdate()->firstOrFail();
            
            // Validate availability and add fee
            $booking->total_price_cents += $dto->fee->cents;
            $booking->save();
            
            return $booking;
        });
    }
}
```

### Step 3: Create FormRequest & Thin Controller
Validate the HTTP request and call the Action:
```php
public function applyEarlyCheckin(EarlyCheckInRequest $request, ApplyEarlyCheckInAction $action): RedirectResponse
{
    $dto = $request->toDTO();
    $action->execute($dto);

    return back()->with('success', 'Early check-in fee applied.');
}
```

### Step 4: Write Unit and Feature Tests
Write unit tests covering edge cases (e.g., negative fees, already-cancelled bookings) and feature tests ensuring the route succeeds:
```bash
php artisan test --filter=EarlyCheckInTest
```

---

## 4. Coding Rules & Best Practices

1. **Strict Types:** Always place `declare(strict_types=1);` at the top of domain, action, and query files.
2. **No Float for Money:** Never use `float` or `double` for currency. Always use integer cents via the `Money` value object (`Money::cents(5000)` = $50.00).
3. **No Direct Model Mutation in Controllers:** Controllers must not call `$model->save()` or `Model::create()` directly. Use an Action.
4. **Read vs Write Segregation:** Keep Queries strictly read-only; keep mutations strictly in Actions.
5. **Pessimistic Locking for Finite Resources:** Any reservation of a finite physical resource (rooms, yachts, event seats) must use `lockForUpdate()`.
