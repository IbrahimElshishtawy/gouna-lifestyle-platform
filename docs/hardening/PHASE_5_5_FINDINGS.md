# Phase 5.5 — Adversarial Audit Findings

> **Standard:** Mandated by `promit.md` Sections 54 & 55 for GouNow Platform Pre-Production Hardening.
> **Classification:** P0 (Critical - Production Blocker), P1 (High - Production Blocker unless explicitly accepted), P2 (Medium), P3 (Low).

---

## FINDING-001 — Webhook Cryptographic HMAC Verification is a Placeholder

**Severity:**  
P0 — Critical (BLOCKER — NOT PRODUCTION READY)

**Category:**  
Webhooks / Payment Security

**Affected Component:**  
`backend/app/Http/Middleware/VerifyWebhookSignature.php`

**Attack Scenario:**  
An external adversary sends a forged HTTP POST request to `/api/v1/webhooks/payments` with an arbitrary header `X-Webhook-Signature: fake` and a JSON body specifying `reference: BK-12345` and `status: success`. Because `VerifyWebhookSignature` only verifies that the header string is non-empty rather than computing a constant-time HMAC-SHA256 signature using the shared secret, the application accepts the forged payment confirmation and confirms the booking without authentic transaction settlement.

**Precondition:**  
Application deployed with payment webhook endpoint enabled.

**Steps to Reproduce:**  
1. Create a pending reservation `BK-TEST`.  
2. Send an unauthorized POST request to `/api/v1/webhooks/payments`:
   ```bash
   curl -X POST https://api.gounow.com/api/v1/webhooks/payments \
     -H "X-Webhook-Signature: arbitrary_string" \
     -H "Content-Type: application/json" \
     -d '{"reference":"BK-TEST","status":"success","transaction_id":"fake-tx"}'
   ```
3. Inspect database: reservation status changes to `confirmed` and `payment_status` changes to `paid`.

**Expected:**  
The endpoint rejects any request that does not match `hash_equals(hash_hmac('sha256', $rawPayload, $secret), $signature)` with 401 Unauthorized.

**Actual:**  
The middleware contains a documented placeholder:
```php
// Placeholder for Phase 6 webhook HMAC cryptographic verification
$signature = $request->header('X-Webhook-Signature') ?? $request->header('X-Paymob-Signature');
if (app()->environment('testing', 'local') && ! $signature) {
    return $next($request);
}
```
No HMAC calculation is performed, and non-empty headers pass without cryptographic validation.

**Security Impact:**  
Total financial integrity bypass. Attackers can mark any reservation paid for free.

**Business Impact:**  
Severe financial loss, unauthorized property occupancy, and business reputational damage.

**Root Cause:**  
Cryptographic webhook verification was scheduled for Phase 6 (Payment Gateway Integration) and stubbed with a placeholder in Phase 2.

**Evidence:**  
Inspection of `VerifyWebhookSignature.php` lines 17–40; verified in `AdversarialWebhookTest.php`.

**Recommended Fix:**  
Targeted for Phase 6: Implement genuine constant-time HMAC verification against configured provider webhook secrets; strictly disallow placeholder bypass in production.

**Regression Test:**  
`Tests\Feature\AdversarialWebhookTest::test_valid_webhook_marks_booking_confirmed`

**Production Blocking:**  
YES (Phase 6 Precondition).

---

## FINDING-002 — Public Mock Gateway Endpoints Exposed on Web Routes

**Severity:**  
P1 — High

**Category:**  
Payment Security / Route Security

**Affected Component:**  
`backend/routes/web.php` (lines 170–176) & `CheckoutController::cardMockComplete`

**Attack Scenario:**  
A user reaches `/checkout/mock/card/{reference}/complete`. If this route is enabled in production, an attacker can directly complete credit card simulations without going through 3D-Secure authentication.

**Precondition:**  
Deployment in staging or production without route-level environment isolation.

**Steps to Reproduce:**  
1. Initialize booking reference `BK-MOCK-01`.
2. Navigate directly to `/checkout/mock/card/BK-MOCK-01/complete`.
3. The checkout transaction transitions to complete.

**Expected:**  
Mock simulation routes must return 404 or be disabled entirely in `production` environments (`if (!app()->environment('production'))`).

**Actual:**  
The routes are registered unconditionally in `routes/web.php`.

**Security Impact:**  
Unauthorized payment completion bypass for users aware of the mock endpoint structure.

**Business Impact:**  
Unsettled bookings marked as paid.

**Root Cause:**  
Simulation routes were registered for development and characterization testing during Phase 0–5 without an explicit `app()->isProduction()` guard.

**Recommended Fix:**  
Wrap mock payment endpoints in `routes/web.php` in an environment conditional checking that `app()->environment('local', 'testing', 'staging')`.

**Regression Test:**  
`Tests\Feature\BookingEngineTest`

**Production Blocking:**  
YES (Must be guarded before production release).

---

## FINDING-003 — Cross-User Idempotency Key Isolation Gap

**Severity:**  
P1 — High

**Category:**  
Idempotency / Concurrency

**Affected Component:**  
`backend/app/Http/Middleware/EnsureIdempotency.php`

**Attack Scenario:**  
User A generates an idempotency key `KEY-UUID-12345` and creates a booking. User B (malicious or by RNG collision) submits a request with the exact same idempotency key `KEY-UUID-12345`. Because `EnsureIdempotency` queries `where('key', $idempotencyKey)->first()` without scoping by the authenticated `user_id` or customer identity, User B's request either triggers an `IdempotencyConflictException` (denial of service on User B) or returns User A's cached booking response (potential information leakage).

**Precondition:**  
Shared idempotency key across different users.

**Steps to Reproduce:**  
1. User A sends POST with `Idempotency-Key: SHARED-KEY-001`.
2. User B sends POST with `Idempotency-Key: SHARED-KEY-001` with different payload.
3. User B receives 409 IDEMPOTENCY_CONFLICT caused by User A's prior transaction.

**Expected:**  
Idempotency keys should be partitioned by actor identity (`user_id` or hashed IP/Session for guests): `key_hash = hash('sha256', $actorId . '|' . $idempotencyKey)`.

**Actual:**  
The uniqueness and lookup are performed solely on the raw string `key`.

**Security Impact:**  
Cross-tenant Denial of Service on mutations; potential response body leakage if payloads match.

**Business Impact:**  
Intermittent checkout failures for concurrent users sharing deterministic key generators.

**Root Cause:**  
`idempotency_keys` table uses a global unique constraint on `key` without composite user partitioning.

**Recommended Fix:**  
Update `EnsureIdempotency` and `idempotency_keys` schema to partition key hashing by actor context (`actor_id ?? ip`).

**Regression Test:**  
`Tests\Feature\AdversarialIdempotencyTest::test_same_key_different_payload_throws_conflict`

**Production Blocking:**  
NO (Mitigated by UUIDv4 entropy in frontend, but recommended for Phase 8).

---

## FINDING-004 — Web Checkout Process Lacks Idempotency Middleware

**Severity:**  
P2 — Medium

**Category:**  
Idempotency / Route Security

**Affected Component:**  
`backend/routes/web.php` (`POST /checkout/process`)

**Attack Scenario:**  
A user submitting the Blade-based checkout form double-clicks the "Submit Payment" button rapidly. While the REST API `/api/v1/checkout/bookings` enforces the `idempotent` middleware, the legacy Blade route `/checkout/process` only enforces `throttle:checkout`. Rapid sequential submissions can create duplicate pending booking records if the browser repeats the POST before the first request finishes.

**Precondition:**  
User utilizing the server-side Blade checkout flow.

**Steps to Reproduce:**  
1. Submit two simultaneous POST requests to `/checkout/process` with the same booking session.
2. Observe two pending reservations generated.

**Expected:**  
Both Blade and API routes enforce idempotency on booking mutations.

**Actual:**  
Only `/api/v1/checkout/bookings` possesses the `idempotent` middleware alias.

**Security Impact:**  
Duplicate pending records polluting the database.

**Business Impact:**  
Temporary inventory lockouts and administrative clutter.

**Root Cause:**  
Phase 2 applied `EnsureIdempotency` to API v1 routes while leaving legacy Blade web routes with session-based locks.

**Recommended Fix:**  
Add CSRF one-time token invalidation or attach `EnsureIdempotency` to `/checkout/process`.

**Regression Test:**  
`Tests\Feature\BookingHardeningTest`

**Production Blocking:**  
NO (Mitigated by `throttle:checkout` and Next.js frontend utilizing API v1).

---

## FINDING-005 — Concurrency Exclusion Constraints Unverified on SQLite Runtime

**Severity:**  
P2 — Medium

**Category:**  
Database Reliability / Test Quality

**Affected Component:**  
`backend/database/testing.sqlite` vs `backend/phpunit.postgres.xml`

**Attack Scenario:**  
In development and default CI, tests run against SQLite. PostgreSQL exclusion constraints (`EXCLUDE USING gist`) are skipped on SQLite via driver detection. While pessimistic locking (`lockForUpdate()`) protects against application-level race conditions, database engine-level exclusion cannot be fully verified without running the dedicated PostgreSQL test suite.

**Precondition:**  
Running tests exclusively via `php artisan test --env=testing`.

**Expected:**  
Production PostgreSQL engine enforces Exclusion Constraints directly in the DB kernel.

**Actual:**  
Default test runner verifies application locks on SQLite; PostgreSQL testing requires explicit Docker execution via `phpunit.postgres.xml`.

**Security Impact:**  
Potential undetected divergence between SQLite and PostgreSQL behavior.

**Business Impact:**  
None in production if PostgreSQL container passes.

**Root Cause:**  
SQLite lacks GiST index and Exclusion Constraint support.

**Recommended Fix:**  
Enforce CI pipeline to execute `phpunit.postgres.xml` against the live Docker PostgreSQL container.

**Regression Test:**  
`Tests\Feature\BookingHardeningTest::test_concurrent_booking_same_inventory_concurrency`

**Production Blocking:**  
NO (Documented in ADR-002; container available on port 5432).
