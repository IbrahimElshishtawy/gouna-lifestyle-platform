# Transaction & Concurrency Strategy (Phase 5)

## Overview
This document specifies the database concurrency controls, transaction boundaries, locking strategies, and isolation guarantees implemented across the GouNow booking platform to eliminate race conditions, prevent overselling, and guarantee data consistency.

---

## 1. Concurrency Defense Layers

The platform implements a **defense-in-depth** strategy against inventory race conditions:

```
[Layer 1: Application-Level Idempotency Service (Redis / Cache)]
           │
           ▼
[Layer 2: Pessimistic Row-Level Lock (Property::lockForUpdate())]
           │
           ▼
[Layer 3: Application Query Verification (CheckPropertyAvailabilityQuery)]
           │
           ▼
[Layer 4: Database Exclusion Constraint (PostgreSQL GIST daterange overlap)]
```

### Layer 1: Idempotency Key Lock
- `IdempotencyService` intercepts requests with `Idempotency-Key` or `X-Idempotency-Key`.
- Atomically secures an execution lock (`SET key nx ex 60`).
- Prevents concurrent requests with identical idempotency keys from executing in parallel.

### Layer 2: Pessimistic Row Lock (`SELECT FOR UPDATE`)
- In `LockAndValidateAvailabilityAction`:
  ```php
  Property::where('id', $property->id)->lockForUpdate()->first();
  ```
- Any competing transaction attempting to book dates for the same property is queued until the first transaction completes.
- In `CreateBookingAction`, transactions use automatic retry (`DB::transaction($callback, 3)`) to handle transient deadlocks.

### Layer 3: Application-Level Range Verification
- Availability is checked using half-open interval semantics:
  `[check_in, check_out)` where `check_in < existing_check_out` AND `check_out > existing_check_in`.
- Same-day turnaround (checkout on day $X$, checkin on day $X$) is explicitly permitted.
- Active holds with `expires_at < now()` are excluded from blocking availability.

### Layer 4: PostgreSQL Exclusion Constraint
- For PostgreSQL environments, a hardware-enforced exclusion constraint using the `btree_gist` extension prevents double booking at the storage engine level:
  ```sql
  ALTER TABLE bookings
  ADD CONSTRAINT bookings_prevent_overlapping_ranges
  EXCLUDE USING gist (
      bookable_id WITH =,
      daterange(check_in, check_out, '[)') WITH &&
  )
  WHERE (
      status IN ('pending', 'awaiting_payment', 'payment_processing', 'confirmed')
      AND deleted_at IS NULL
  );
  ```
- If an application-level check is ever bypassed due to a software flaw, the database engine aborts the transaction immediately with error `23P01 (exclusion_violation)`.

---

## 2. Transaction Boundaries & All-or-Nothing Guarantees

### Atomic Checkout Transaction
The booking creation pipeline operates inside an atomic database transaction:
1. Lock property row.
2. Verify availability and enforce guest limits.
3. Compute authoritative server-side quote and apply promo codes.
4. Create `Booking` record with immutable snapshots.
5. Create `BookingNightlyPrice` line items.
6. Create `DiscountUsage` record and increment usage counter.
7. Initiate payment gateway transaction.

If any step fails (e.g. gateway timeout, invalid card, constraint violation), the entire database transaction rolls back, leaving **zero orphaned records**.

---

## 3. Deadlock Prevention & Retry Protocol

1. **Deterministic Lock Ordering**:
   When multiple entities are locked, locks are always acquired in deterministic order (Property first, then Booking).
2. **Transaction Deadlock Retries**:
   All core transactional actions pass a retry parameter of 3 to `DB::transaction(..., 3)`.
3. **Short Transaction Lifetime**:
   External HTTP calls to payment gateways are orchestrated to avoid keeping database transactions open during long remote network waits whenever possible.
