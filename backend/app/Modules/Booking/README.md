# Booking Module

## 1. Purpose
The **Booking Module** coordinates the lifecycle of reservations across vacation rentals, long-term stays, yacht charters, and private experiences. It guarantees atomic reservation creation, prevents double bookings via pessimistic locking, manages booking status transitions, and creates immutable financial audit snapshots.

---

## 2. Directory Structure
```
app/Modules/Booking/
├── Application/
│   ├── Actions/
│   │   ├── CreateBookingAction.php          # Executes reservation creation under DB transaction
│   │   ├── CancelBookingAction.php          # Handles cancellations and quota releases
│   │   └── RecordBookingPaymentAction.php   # Updates paid balances and triggers confirmation
│   ├── DTOs/
│   │   └── CreateBookingDTO.php             # Type-safe payload for new reservations
│   └── Events/
│       ├── BookingCreated.php
│       ├── BookingConfirmed.php
│       └── BookingCancelled.php
├── Domain/
│   └── ValueObjects/
│       └── BookingReference.php             # Formats unguessable references (GN-XXXX)
└── Presentation/
    └── Requests/
        ├── CalculateQuoteRequest.php        # Input validation for quote requests
        └── ProcessCheckoutRequest.php       # Input validation for checkout submission
```

---

## 3. Public API (Actions & Queries)
- **`CreateBookingAction::execute(CreateBookingDTO $dto): Booking`**
  Locks the bookable entity, verifies date availability, applies promo codes, and writes the booking record with a serialized `price_breakdown` JSON snapshot.
- **`CancelBookingAction::execute(Booking $booking, string $reason): Booking`**
  Transitions booking status to `cancelled`, releasing the dates for other customers.
- **`RecordBookingPaymentAction::execute(Booking $booking, Money $amount): Booking`**
  Updates `deposit_paid_cents` and transitions status to `confirmed` once payment conditions are satisfied.
