# PHASE 8 — DATABASE PRODUCTION HARDENING

## 1. Executive Summary

Phase 8 certifies that the GouNow database subsystem operates reliably, deterministically, and securely under real production conditions targeting **PostgreSQL 16**. All 41 database migrations were executed, verified, and audited against an active PostgreSQL 16 container, validating schemas, relational integrity, numeric precision, and database engine-level concurrency constraints.

---

## 2. PostgreSQL 16 Production Compatibility & Engine Certification

### 2.1 Database Drivers & Extensions
- **Production Target**: PostgreSQL 16 (`driver: pgsql`).
- **Required Extension**: `btree_gist` (installed automatically during migration for exclusion constraint indexing).
- **SSL Mode**: Enabled (`prefer` / `require` / `verify-full`).
- **Connection Collation & Encoding**: UTF-8 (`client_encoding='utf8'`).

### 2.2 Relational Integrity & Schema Audits
- **Table Count**: 53 application, session, job, and metadata tables in production schema.
- **Foreign Key Constraints**: 47 active foreign key constraints verified with explicit cascading strategies (`ON DELETE CASCADE` or `ON DELETE SET NULL`).
- **Resolved Foreign Key Dependency**: Uncovered and resolved an ordering conflict between `discounts` and `bookings` where `discount_usages` depended on `bookings` before `bookings` was created. Moved `discount_usages` table creation directly after `bookings`, ensuring clean sequential execution on strict relational engines.

---

## 3. Financial Data Types & Precision Audit

Authoritative monetary balances are strictly modeled in integer minor units (cents) using `unsignedBigInteger` / `bigint`:
- `bookings`: `subtotal_cents`, `cleaning_fee_cents`, `service_fee_cents`, `tax_cents`, `discount_cents`, `total_cents`, `deposit_cents`, `amount_paid_cents`, `amount_remaining_cents`, `refund_amount_cents` (`bigint`).
- `payment_transactions`: `amount_cents`, `refund_amount_cents` (`bigint`).
- `booking_nightly_prices`: `price_cents` (`bigint`).
- `discount_usages`: `amount_discounted_cents` (`bigint`).
- **Floating point types**: Zero floating point columns exist in authoritative financial tables. Percentage rates (e.g. `tax_percentage`, `deposit_percentage`) utilize fixed-point `decimal(5, 2)`.

---

## 4. PostgreSQL Concurrency & Exclusion Constraints

Double-booking prevention is enforced natively at the PostgreSQL kernel level using GiST exclusion constraints:
```sql
ALTER TABLE bookings 
ADD CONSTRAINT bookings_no_double_booking 
EXCLUDE USING gist (
    bookable_id WITH =, 
    daterange(check_in, check_out, '[)') WITH &&
) 
WHERE (
    status IN ('confirmed', 'paid', 'completed', 'pending', 'awaiting_payment', 'partially_paid', 'payment_processing') 
    AND deleted_at IS NULL
);
```
- **Interval Semantics**: Half-open range `[check_in, check_out)` permits guest check-out on the same day a subsequent guest checks in (same-day turnaround without false overlap).
- **Physical Exclusion**: Any concurrent transaction attempting to insert an overlapping date range on the same bookable resource is rejected with error code `23P01`.
