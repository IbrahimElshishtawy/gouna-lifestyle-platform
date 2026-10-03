# PHASE 6 — FINANCIAL TRUST BOUNDARIES SPECIFICATION

## 1. Overview

This document formally specifies the 8 Financial Trust Boundaries established in the GouNow Lifestyle Platform architecture. Each boundary defines the exact security controls, authentication requirements, integrity verification mechanisms, replay protection, failure modes, and logging mandates across the transaction lifecycle.

---

## 2. Specification of the 8 Trust Boundaries

### Boundary 1: Customer → Application (Browser / Mobile Client)
- **Description**: The interaction between the end-user (guest or authenticated customer) and the public application interface (web checkout, mobile application).
- **Trusted Data**: Server-generated session identifiers, CSRF tokens, signed confirmation URLs.
- **Untrusted Data**: Form inputs, dates, guest counts, requested price, currency, payment method selection, voucher access tokens.
- **Authentication Mechanism**: Session cookies (`web`), Laravel Sanctum Bearer tokens (`api`), or guest reservation tokens (`token` query param).
- **Authorization Mechanism**: IDOR validation verifying session ownership, signed URL integrity, or customer email match.
- **Integrity Verification**: Form Request validation (`StoreBookingRequest`, `CheckoutCalculateRequest`), server-side price recalculation (client-submitted prices are discarded).
- **Replay Protection**: CSRF token validation (`VerifyCsrfToken`), atomic checkout lock (`checkout_lock_{hash}`).
- **Failure Behavior**: 422 Unprocessable Entity on validation failure; 403 Forbidden / 419 Page Expired on CSRF failure.
- **Logging Requirements**: Redact all sensitive form fields (PAN, CVV, passwords) via `SensitiveParameter` and Monolog masking processors.

---

### Boundary 2: Frontend → Backend (API Gateway & Controllers)
- **Description**: HTTP requests dispatched from the frontend client to the backend REST API endpoints.
- **Trusted Data**: Validated authentication tokens, authenticated user IDs extracted from cryptographically verified tokens.
- **Untrusted Data**: HTTP headers (`Idempotency-Key`, `X-Forwarded-For`), request body, route parameters.
- **Authentication Mechanism**: Laravel Sanctum Bearer tokens or Session-based authentication.
- **Authorization Mechanism**: Laravel Gate / Policy checks (`can:bookings.create`, `can:bookings.view`).
- **Integrity Verification**: Request parameter typing and model binding scopes.
- **Replay Protection**: Actor-scoped Idempotency Middleware (`EnsureIdempotency`) with partitioned key lookups (`actor_scope: [user_id, session_id, or guest_hash]`).
- **Failure Behavior**: 401 Unauthorized for invalid tokens; 409 Conflict for in-flight concurrent idempotency requests; 422 for malformed idempotency keys.
- **Logging Requirements**: Log route, controller, response status code, execution duration; omit customer credentials and authorization tokens.

---

### Boundary 3: Backend → Payment Provider (Paymob, Stripe, PayPal)
- **Description**: Outbound server-to-server API calls from GouNow backend to payment gateway REST APIs for initiating payment intents, creating checkout sessions, and capturing orders.
- **Trusted Data**: Gateway endpoints, internal API keys, merchant identifiers configured in server environment (`.env`).
- **Untrusted Data**: Gateway API response bodies, HTTP status codes, redirection URLs returned by gateways.
- **Authentication Mechanism**: Gateway Secret API Keys (Bearer auth / HTTP Basic auth with provider secret).
- **Authorization Mechanism**: Account-level permissions granted by the payment gateway dashboard.
- **Integrity Verification**: TLS 1.3 / HTTPS certificate validation, strict JSON schema parsing of gateway responses.
- **Replay Protection**: Gateway-specific client reference IDs and idempotency tokens passed in outbound payloads (`merchant_order_id`, `idempotency_key`).
- **Failure Behavior**: Log exception, mark transaction as pending or retryable, fail transaction gracefully without corrupting booking status.
- **Logging Requirements**: Log gateway transaction references, HTTP response status, error codes; strip any cardholder PANs or CVVs.

---

### Boundary 4: Payment Provider → Webhook Endpoint (`/api/v1/webhooks/payment`)
- **Description**: Inbound asynchronous event notifications dispatched by payment gateways to notify GouNow of transaction outcomes.
- **Trusted Data**: None initially. The entire payload and headers are considered untrusted until cryptographic verification succeeds.
- **Untrusted Data**: Webhook payload, payload parameters, event type, headers (`X-Paymob-Signature`, `Stripe-Signature`).
- **Authentication Mechanism**: Cryptographic HMAC verification (`WebhookSignatureVerifier`) using shared provider secret. Fail-closed if secret is default placeholder or missing in production.
- **Authorization Mechanism**: Verified HMAC signature grants permission to process the webhook event.
- **Integrity Verification**: Timing-safe `hash_equals()` comparison against computed HMAC (Paymob SHA-512 canonical string or Stripe HMAC-SHA256).
- **Replay Protection**: Database transaction state checking. Duplicate deliveries for already `completed` transactions return `200 OK` (`replayed: true`) without executing duplicate state transitions or ledger mutations.
- **Failure Behavior**: Immediate `401 Unauthorized` with standard error envelope; request terminated prior to controller execution.
- **Logging Requirements**: Log incoming webhook provider, event type, masked transaction reference, signature validation outcome; never log raw secrets.

---

### Boundary 5: Webhook → Booking Database
- **Description**: The internal data mutation pipeline where a verified webhook event is mapped to database entities (`transactions`, `bookings`, `activity_logs`).
- **Trusted Data**: Verified transaction reference, verified payment status from provider.
- **Untrusted Data**: Amounts, currencies, or booking references present in payload (must be verified against internal database records).
- **Authentication Mechanism**: Internal execution context inside `PaymentWebhookController` after middleware verification.
- **Authorization Mechanism**: Verified gateway ownership of the referenced transaction.
- **Integrity Verification**: Amount equality check (`amount_cents >= booking.total_amount_cents`), currency match (`payload.currency == booking.currency`), state machine transition legality (`BookingStateMachine`).
- **Replay Protection**: Database pessimistic row locking (`lockForUpdate()`) and state check (`if status == completed return`).
- **Failure Behavior**: 422 Unprocessable Entity for amount/currency mismatch; 409 Conflict for invalid state transitions (e.g. attempting to confirm cancelled booking); transaction rolls back atomically.
- **Logging Requirements**: Detailed audit log entry in `activity_logs` documenting state transition, gateway reference, and actor (`system:webhook`).

---

### Boundary 6: Admin → Refund System (`/admin/bookings/{id}/refund`)
- **Description**: Administrative initiation of full or partial refunds for cancelled or adjusted bookings.
- **Trusted Data**: Authenticated admin user record, authorized permissions.
- **Untrusted Data**: Refund amount requested by admin, reason string.
- **Authentication Mechanism**: Session authentication (`auth:web`), Two-Factor Authentication requirement for administrative users.
- **Authorization Mechanism**: Permission check `can:bookings.refund`, sudo-mode password reauthentication (`reauth` middleware).
- **Integrity Verification**: Server-side bounds check: `refund_amount > 0` and `refund_amount <= remaining_refundable_balance` (`paid_amount_cents - refunded_amount_cents`).
- **Replay Protection**: Synchronous atomic transaction lock; CSRF protection on POST request.
- **Failure Behavior**: 403 Forbidden on insufficient permission / missing reauth; 422 Unprocessable Entity on excessive refund amount.
- **Logging Requirements**: Full audit trail recording admin ID, booking ID, refunded amount, reason, and gateway refund identifier.

---

### Boundary 7: Background Jobs → Financial State (Reconciliation & Expiry)
- **Description**: Scheduled console commands and queued background jobs (e.g. pending hold expiration, gateway reconciliation sweeps).
- **Trusted Data**: Internal queue system, database connection parameters.
- **Untrusted Data**: Historical database rows subject to race conditions with concurrent webhooks.
- **Authentication Mechanism**: CLI execution / internal supervisor worker credentials.
- **Authorization Mechanism**: System-level cron / worker execution privileges.
- **Integrity Verification**: Pessimistic row locking (`lockForUpdate()`) on all updated records; verification that hold TTL has expired before releasing inventory.
- **Replay Protection**: Job unique IDs, database row locks preventing simultaneous expiry and webhook confirmation.
- **Failure Behavior**: Retry with exponential backoff on transient deadlock; log critical alert if gateway reconciliation encounters discrepancies.
- **Logging Requirements**: Log number of expired holds released, reconciliation discrepancies detected, execution timestamp.

---

### Boundary 8: Database → Application (Data Hydration & Casts)
- **Description**: Hydration of database records into Eloquent models within the Laravel application.
- **Trusted Data**: PostgreSQL storage engine data integrity, foreign key constraints.
- **Untrusted Data**: Legacy or corrupted column values if corrupted by raw SQL migrations.
- **Authentication Mechanism**: PostgreSQL database credentials over secure local socket or TLS connection.
- **Authorization Mechanism**: Database user role permissions (least privilege).
- **Integrity Verification**: Eloquent attribute casting (e.g., integer casts for cents, datetime casts for timestamps), composite unique constraints (`[actor_scope, key]`), foreign key cascade rules.
- **Replay Protection**: Database unique indexes and exclusion constraints.
- **Failure Behavior**: `QueryException` / PDOException caught by Laravel exception handler; atomic transaction rollback.
- **Logging Requirements**: Log database query errors to Monolog error channel; suppress sensitive parameters from stack traces.
