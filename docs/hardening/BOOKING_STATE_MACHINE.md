# Booking State Machine Specification (Phase 5)

## Overview
The GouNow Booking State Machine (`App\Modules\Booking\Domain\Services\BookingStateMachine`) acts as the single authoritative engine for booking lifecycle transitions. All status changes across API, Web, Webhook, and Console commands are routed through this engine inside database transactions with row-level locks.

---

## 1. Status Enum & Definitions

| Enum Case | String Value | Blocks Inventory? | Description |
|---|---|---|---|
| `DRAFT` | `draft` | No | Initial shopping cart / draft reservation before checkout submission. |
| `PENDING` | `pending` | Yes (until expiry) | Reservation created, awaiting manual host/admin confirmation (request mode). |
| `AWAITING_PAYMENT` | `awaiting_payment` | Yes (until expiry) | Instant reservation created, awaiting payment gateway confirmation (15 min hold). |
| `PAYMENT_PROCESSING`| `payment_processing`| Yes | Asynchronous payment authorization in flight with gateway. |
| `CONFIRMED` | `confirmed` | Yes | Payment secured or deposit accepted; reservation locked and confirmed. |
| `COMPLETED` | `completed` | No | Guest has completed stay and checked out. |
| `CANCELLED` | `cancelled` | No | Cancelled by guest or staff; inventory released. |
| `REFUNDED` | `refunded` | No | Fully refunded following cancellation; inventory released. |
| `EXPIRED` | `expired` | No | Unpaid hold expired after TTL; inventory automatically freed. |

---

## 2. Transition Matrix

The table below describes allowed target statuses from each source status:

| From Status | Allowed Target Statuses | Disallowed / Prohibited |
|---|---|---|
| **DRAFT** | `PENDING`, `AWAITING_PAYMENT`, `CANCELLED` | `CONFIRMED`, `COMPLETED`, `REFUNDED` |
| **PENDING** | `AWAITING_PAYMENT`, `CONFIRMED`, `CANCELLED`, `EXPIRED` | `COMPLETED`, `REFUNDED` |
| **AWAITING_PAYMENT** | `PAYMENT_PROCESSING`, `CONFIRMED`, `CANCELLED`, `EXPIRED` | `COMPLETED`, `REFUNDED` |
| **PAYMENT_PROCESSING** | `CONFIRMED`, `AWAITING_PAYMENT`, `CANCELLED`, `EXPIRED` | `COMPLETED`, `REFUNDED` |
| **CONFIRMED** | `COMPLETED`, `CANCELLED` | `PENDING`, `AWAITING_PAYMENT`, `EXPIRED` |
| **COMPLETED** | *None (Terminal)* | All transitions prohibited |
| **CANCELLED** | `REFUNDED` | `CONFIRMED`, `PENDING`, `COMPLETED` |
| **REFUNDED** | *None (Terminal)* | All transitions prohibited |
| **EXPIRED** | *None (Terminal)* | All transitions prohibited |

> **Idempotent Transitions**: Requesting a transition from status `X` to status `X` is treated as a clean no-op, returning the booking without duplicate side-effects.

---

## 3. Transition Execution Flow

```
[Incoming Transition Request]
           │
           ▼
   [DB::transaction]
           │
           ▼
[Lock Booking for Update]
           │
           ▼
[Check Target === Current?] ──(Yes)──► [Return Booking (Idempotent No-Op)]
           │
          (No)
           ▼
[Validate canTransitionTo()] ──(False)──► [Throw InvalidBookingTransitionException (422)]
           │
         (True)
           ▼
[Apply Transition Side Effects]
  ├─ Update status & timestamps (e.g. cancelled_at)
  ├─ Save cancellation reason / refund amounts
  └─ Nullify hold expiry on terminal states
           │
           ▼
[Write ActivityLog Audit Record]
           │
           ▼
[Commit DB Transaction]
           │
           ▼
[Dispatch BookingStatusChangedEvent] (After Commit)
```

---

## 4. Domain Events & Side Effects

### `BookingStatusChangedEvent`
- Implements `Illuminate\Contracts\Events\ShouldDispatchAfterCommit`.
- Guarantees event listeners (e.g. email notifications, SMS alerts, vendor calendar sync) only execute after the database transaction has committed durably.

### Automatic Hold Expiry Job
- Artisan command `bookings:expire-pending` runs every minute (`withoutOverlapping`).
- Queries all bookings with status in `[pending, awaiting_payment]` where `expires_at <= now()`.
- Transitions them to `EXPIRED` via `BookingStateMachine`.
