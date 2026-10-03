# Booking Security Audit (Phase 5)

## Executive Summary
This document records the security audit, threat analysis, and defensive implementations for the GouNow booking pipeline, addressing concurrency race conditions, Insecure Direct Object References (IDOR), client-side price tampering, hold exhaustion, and state integrity.

---

## 1. Threat Model & Vector Analysis

| Threat ID | Vulnerability / Attack Vector | Impact | Mitigation Strategy | Status |
|---|---|---|---|---|
| **TH-B01** | **Client-Side Price Tampering**: Client injects `price`, `total`, `total_cents`, `discount` in checkout payloads. | Financial loss / fraud | Strict `prohibited` validation rules in FormRequests + 100% server-side authoritative pricing recalculation. | `VERIFIED` |
| **TH-B02** | **Double Booking / Race Condition**: Concurrent checkout requests for same property and overlapping dates. | Double booking, guest collision | PostgreSQL Exclusion Constraint with `btree_gist` (`daterange` &&) + pessimistic `Property::lockForUpdate()` within transaction. | `VERIFIED` |
| **TH-B03** | **Inventory Denial of Service (Hold Hoarding)**: Bot creates dozens of pending bookings without paying, locking inventory. | Legitimate guests blocked | 15-minute hold TTL (`expires_at`), ignored in availability queries after expiry, automatically reaped by scheduled command `bookings:expire-pending`. | `VERIFIED` |
| **TH-B04** | **IDOR on Confirmation Page**: Attacker enumerates sequential or random booking references to read guest PII. | Data breach / PII exposure | Cryptographic 64-char CSPRNG access tokens (SHA-256 stored), session check, signed URLs, and generic 404 response on any unauthorized access. | `VERIFIED` |
| **TH-B05** | **Voucher Scraping / Brute Force**: Attacker floods confirmation endpoint attempting to guess references. | Denial of service / enumeration | Named rate limiter `booking_confirmation` enforcing strict 15 req/min per IP. | `VERIFIED` |
| **TH-B06** | **State Confusion / Illegal Resurrection**: User or system transitions cancelled or completed booking back to confirmed. | Financial & operational disorder | Strict `BookingStateMachine` with explicit transition matrix; throws S2 `InvalidBookingTransitionException` (422). | `VERIFIED` |
| **TH-B07** | **Network Retry Duplicate Bookings**: Client retries POST checkout on slow connection, creating double bookings. | Double charging | Strict `Idempotency-Key` requirement; identical key returns original booking without creating new records. | `VERIFIED` |

---

## 2. Insecure Direct Object Reference (IDOR) Defense Model

### The Vulnerability
Public booking references (e.g. `GON-2026-AB12CD`) have high entropy, but cannot rely on security through obscurity alone. Exposing guest names, phone numbers, email addresses, and total prices on `/checkout/confirmation/{reference}` presents an IDOR threat if accessed without authorization.

### Multi-Tier Authorization Logic
Access to `/checkout/confirmation/{reference}` is granted if and only if one of the following conditions is met:
1. **Authenticated Owner**: Current user's email matches customer email or `customer.user_id === user.id`.
2. **Administrative Role**: User possesses `super_admin`, `property_manager`, or `finance` roles.
3. **Assigned Staff**: User possesses `staff` role and is explicitly assigned to this booking (`booking.assigned_to === user.id`).
4. **Active Session Creator**: User just completed checkout in their current browser session (`session('recent_booking_id') === booking.id`).
5. **Cryptographic Signed URL**: Request contains valid HMAC signature (`hasValidSignature()`).
6. **Guest Access Token**: Request includes `?token={plain_token}` whose SHA-256 hash matches `booking.booking_access_token`.

### Defensive Response
- Any unauthorized access returns HTTP **404 Not Found** (identical to a non-existent reservation) to prevent reference enumeration.
- Guest view masks customer PII (`$isGuestAccess` hides sensitive fields).

---

## 3. Server-Side Pricing & Mass Assignment Protection

### Prohibited Fields
The following fields are strictly prohibited from all client-submitted checkout and booking requests:
- `id`, `reference`, `status`, `payment_status`
- `price`, `price_cents`, `total`, `total_cents`, `amount`
- `deposit`, `deposit_cents`, `subtotal_cents`, `cleaning_fee_cents`, `service_fee_cents`, `tax_cents`, `discount_cents`
- `amount_paid_cents`, `amount_remaining_cents`, `internal_notes`, `assigned_to`, `is_admin`

Any presence of these fields triggers an immediate `422 Unprocessable Entity` response formatted according to Standard S2.

### Immutable Snapshots
Upon creation, bookings store:
- `pricing_snapshot`: Complete breakdown of base nightly prices, fees, tax percentage, discounts, and currency at time of booking.
- `cancellation_policy_snapshot`: Complete multilingual text and policy rules governing cancellations, shielding the reservation from post-booking property policy edits.

---

## 4. Test Verification Summary
All 13 hardening tests in `BookingHardeningTest` passed with 0 failures:
- State Machine Transitions (Valid, Invalid, Idempotent)
- Price Tampering Rejection
- Half-Open Range Semantics `[check_in, check_out)`
- Expired Hold Purging
- Idempotent Booking Creation
- All-or-Nothing Transaction Rollback
- Confirmation IDOR Defense & PII Masking
- Customer Self-Service Cancellation
- Anti-Enumeration Rate Limiting
- Concurrency Conflict Handling
