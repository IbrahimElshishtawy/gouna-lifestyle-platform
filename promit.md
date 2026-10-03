# PHASE 6 — PAYMENT & FINANCIAL INTEGRITY HARDENING

## GouNow Lifestyle Platform — Laravel Backend

You are now entering **PHASE 6 — PAYMENT & FINANCIAL INTEGRITY HARDENING**.

This phase follows the completed **Phase 5.5 Adversarial Production Audit**.

You are NOT allowed to treat Phase 6 as a simple feature implementation.

This is a combined:

* Payment Security Audit
* Webhook Security Implementation
* Financial State-Machine Hardening
* Idempotency Hardening
* Payment/Booking Consistency Audit
* Refund Integrity Audit
* Reconciliation Design
* Concurrency Audit
* Database Integrity Audit
* Adversarial Testing Phase
* Production Readiness Gate

The goal is to make the payment and financial parts of the backend resistant to:

* forged webhooks
* replay attacks
* duplicate callbacks
* manipulated payment amounts
* manipulated booking references
* fake payment success
* duplicate payments
* duplicate bookings
* refund abuse
* authorization bypass
* race conditions
* inconsistent payment/booking states
* idempotency collisions
* transaction failures
* partial database updates
* provider/API failures
* malicious request manipulation
* incorrect callback assumptions
* inconsistent SQLite/PostgreSQL behavior

---

# 0. ABSOLUTE RULES

These rules apply to the entire phase.

## 0.1 Do NOT blindly modify the code

Before changing anything:

1. Inspect the repository.
2. Inspect the current architecture.
3. Inspect all payment-related routes.
4. Inspect all payment-related controllers.
5. Inspect all payment-related services/actions.
6. Inspect payment models.
7. Inspect booking models.
8. Inspect migrations.
9. Inspect middleware.
10. Inspect policies.
11. Inspect Form Requests.
12. Inspect resources/DTOs.
13. Inspect events/listeners/jobs.
14. Inspect database transactions.
15. Inspect tests.
16. Inspect configuration.
17. Inspect environment variables.
18. Inspect existing Phase 0–5 hardening.
19. Inspect Phase 5.5 findings.
20. Trace the real request/data flow.

Do not start coding before understanding the existing implementation.

---

# 0.2 Existing architecture is authoritative

The existing system already contains hardening from Phases 0–5.

Do NOT replace the architecture simply because you prefer another pattern.

Do NOT introduce:

* unnecessary repositories
* unnecessary interfaces
* CQRS
* event sourcing
* microservices
* Kafka
* RabbitMQ
* Kubernetes
* Elasticsearch
* unnecessary Redis
* unnecessary distributed locks
* unnecessary abstractions

unless the existing architecture demonstrates a real requirement.

Prefer:

> simple + explicit + testable + secure + scalable

over:

> complex + abstract + theoretically scalable

---

# 0.3 Do NOT weaken existing security

You must preserve all existing security properties.

Do not remove or bypass:

* authentication
* authorization
* policies
* scopes
* rate limits
* validation
* CSRF protection
* idempotency
* request IDs
* logging redaction
* transaction boundaries
* booking concurrency protections
* encrypted secrets
* session security
* 2FA
* existing security middleware

If a change requires modifying an existing security control, document:

1. Why
2. Current behavior
3. New behavior
4. Security impact
5. Tests
6. Migration impact

---

# 0.4 Production safety

Never implement a fake security mechanism.

Never do:

```php
if (app()->environment('local', 'testing')) {
    return $next($request);
}
```

to bypass security logic that must exist in production unless the bypass is explicitly part of a safe test architecture.

Never accept:

* arbitrary webhook signatures
* missing signatures
* fake payment statuses
* client-provided payment confirmation
* client-provided final prices
* client-provided payment ownership
* client-provided settlement state

as trusted information.

---

# 0.5 Provider documentation is authoritative

If the project integrates with Paymob, Stripe, or another payment provider:

DO NOT invent the provider's signature algorithm.

DO NOT assume:

```text
HMAC-SHA256(raw body)
```

is automatically correct for every provider.

First determine:

* provider
* callback type
* endpoint type
* signature location
* signature algorithm
* canonicalization rules
* signed fields
* raw body requirements
* header/query parameter requirements
* encoding
* secret type
* timestamp requirements
* replay protection requirements

Use the provider's current official documentation when necessary.

For Paymob specifically, verify the exact callback type being integrated. Paymob documents transaction processed callbacks as server-side POST callbacks and states that callbacks should be authenticated with HMAC. Its current documentation also shows callback-specific HMAC construction rules, so do not apply a generic formula without verifying the exact callback contract.

---

# 1. PHASE 5.5 FINDINGS — MANDATORY INPUT

Read and understand:

```text
docs/hardening/PHASE_5_5_FINDINGS.md
docs/hardening/PHASE_5_5_FINAL_REPORT.md
docs/hardening/PHASE_5_5_SECURITY_MATRIX.md
docs/hardening/PHASE_5_5_ATTACK_SURFACE.md
docs/hardening/PHASE_5_5_SECURITY_BOUNDARY_MAP.md
docs/hardening/LEDGER.md
docs/hardening/BACKLOG.md
```

The known findings are:

---

## FINDING-001 — P0

Webhook Cryptographic HMAC Verification is a Placeholder.

Affected:

```text
backend/app/Http/Middleware/VerifyWebhookSignature.php
```

Current risk:

An attacker may send:

```text
X-Webhook-Signature: fake
```

and potentially cause:

```text
booking -> confirmed
payment -> paid
```

without a real provider transaction.

This is the primary Phase 6 production blocker.

---

## FINDING-003 — P1

Cross-user Idempotency Key Isolation Gap.

Current behavior:

```text
where('key', $idempotencyKey)
```

without appropriate actor/tenant partitioning.

Potential result:

* cross-user conflict
* denial of service
* response collision
* possible data leakage

---

## FINDING-004 — P2

Web checkout:

```text
POST /checkout/process
```

does not use the same idempotency protection as API checkout.

Potential result:

duplicate pending booking creation.

---

## FINDING-005 — P2

PostgreSQL exclusion constraints are not fully verified in the normal SQLite test suite.

Production uses PostgreSQL.

Therefore PostgreSQL-specific concurrency behavior must be tested explicitly.

---

# 2. PHASE 6 OBJECTIVES

Phase 6 must accomplish all of the following.

### Objective A

Implement real provider webhook verification.

### Objective B

Prevent forged payment confirmation.

### Objective C

Prevent webhook replay.

### Objective D

Prevent duplicate webhook processing.

### Objective E

Prevent payment/booking state corruption.

### Objective F

Make idempotency actor-safe.

### Objective G

Protect the legacy Blade checkout flow.

### Objective H

Verify financial amount/currency/reference integrity.

### Objective I

Audit payment authorization.

### Objective J

Design safe refund handling.

### Objective K

Design reconciliation.

### Objective L

Verify database concurrency behavior on PostgreSQL.

### Objective M

Create adversarial tests.

### Objective N

Create a production-readiness gate.

---

# 3. STEP 1 — COMPLETE PAYMENT ARCHITECTURE DISCOVERY

Before coding, inventory every payment-related component.

Search for:

```text
payment
payments
checkout
webhook
transaction
refund
capture
authorize
settlement
gateway
paymob
stripe
hmac
signature
idempotency
invoice
receipt
booking
confirmed
paid
failed
cancelled
refunded
```

Inventory:

### Routes

Identify:

* API payment routes
* webhook routes
* checkout routes
* mock payment routes
* redirect routes
* callback routes
* refund routes
* admin payment routes
* payment status routes

For every route record:

```text
HTTP method
URI
name
controller
middleware
authentication
authorization
rate limiter
CSRF behavior
idempotency behavior
request validation
response type
financial mutation
```

---

# 4. STEP 2 — TRACE THE REAL PAYMENT FLOW

Document the real current flow.

At minimum trace:

```text
Client
 ↓
Checkout
 ↓
Booking creation
 ↓
Price calculation
 ↓
Payment intent/order creation
 ↓
Provider
 ↓
Customer payment
 ↓
Provider callback/webhook
 ↓
Webhook verification
 ↓
Payment lookup
 ↓
Amount verification
 ↓
Currency verification
 ↓
Booking lookup
 ↓
State transition
 ↓
Transaction
 ↓
Payment record
 ↓
Booking confirmation
 ↓
Response
```

Also trace failure paths:

```text
payment failed
payment pending
payment timeout
webhook delayed
webhook duplicated
webhook arrives before redirect
redirect arrives before webhook
webhook arrives after cancellation
refund
partial refund
full refund
provider timeout
database failure
transaction rollback
```

Document the current behavior before modifying it.

---

# 5. STEP 3 — DEFINE FINANCIAL TRUST BOUNDARIES

Create:

```text
docs/hardening/PHASE_6_FINANCIAL_TRUST_BOUNDARIES.md
```

Document at least:

### Boundary 1

Customer → Application

### Boundary 2

Frontend → Backend

### Boundary 3

Backend → Payment Provider

### Boundary 4

Payment Provider → Webhook Endpoint

### Boundary 5

Webhook → Booking Database

### Boundary 6

Admin → Refund System

### Boundary 7

Background Jobs → Financial State

### Boundary 8

Database → Application

For each boundary document:

```text
trusted data
untrusted data
authentication mechanism
authorization mechanism
integrity verification
replay protection
failure behavior
logging requirements
```

---

# 6. STEP 4 — REAL WEBHOOK CRYPTOGRAPHIC VERIFICATION

This is the P0 requirement.

Inspect:

```text
VerifyWebhookSignature.php
```

and all webhook controllers/services.

Do not simply patch the middleware.

Understand the complete webhook flow.

---

## 6.1 Identify the exact provider

Determine:

```text
Provider:
Integration type:
Callback type:
Environment:
Test/Sandbox:
Production:
```

If the code supports multiple providers, identify each separately.

---

## 6.2 Provider-specific verification

Implement provider-specific verification.

Do not create a generic:

```php
verifyHmac($payload)
```

and assume every provider uses the same algorithm.

Instead use a structure appropriate to the existing architecture, for example:

```text
Webhook
 ├── Provider identification
 ├── Signature extraction
 ├── Provider verification
 ├── Replay protection
 ├── Payload validation
 └── Domain processing
```

Do not introduce excessive abstraction.

---

# 7. RAW REQUEST INTEGRITY

If the provider signs the raw body:

The signature must be calculated from the actual raw request payload.

Do NOT verify a re-serialized JSON structure if the provider expects raw bytes.

Do NOT:

```php
json_decode()
json_encode()
```

and then verify the reconstructed body if that changes the signed representation.

Preserve:

```text
raw request body
```

before mutation.

---

# 8. SIGNATURE COMPARISON

Use constant-time comparison where appropriate:

```php
hash_equals($expected, $received)
```

Never:

```php
$expected === $received
```

for cryptographic signatures.

Reject:

* missing signature
* empty signature
* malformed signature
* wrong length where provider specifies fixed length
* invalid encoding
* invalid algorithm
* incorrect secret
* invalid canonical payload

Return a generic authentication failure.

Do not reveal:

```text
expected signature
actual signature
secret
internal verification details
```

to the caller.

---

# 9. WEBHOOK ENVIRONMENT SAFETY

There must be NO production bypass.

Production must never contain:

```php
if (! $signature) {
    return $next($request);
}
```

or equivalent.

Testing must test the real verification mechanism.

If local/test fixtures need bypass behavior, isolate that behavior from production code.

Prefer deterministic test secrets/configuration rather than disabling verification.

---

# 10. WEBHOOK REPLAY PROTECTION

Signature validity alone does NOT necessarily prevent replay.

Determine whether the provider supplies:

* event ID
* transaction ID
* timestamp
* nonce
* callback ID
* unique transaction reference

Use the strongest provider-supported identifier.

Implement duplicate detection.

A webhook received twice must NOT cause:

```text
payment amount added twice
booking confirmed twice
refund created twice
inventory changed twice
notification duplicated incorrectly
```

---

# 11. WEBHOOK IDEMPOTENCY

Design webhook processing as idempotent.

The same event should produce the same final state.

Example:

```text
Webhook #1
payment success
→ confirm booking

Webhook #2
same event
→ no second financial mutation
→ safe acknowledgement
```

Do not treat duplicate delivery as an application error requiring destructive rollback.

Persist sufficient provider event/transaction identity to safely identify duplicates.

If the current schema already has suitable payment transaction identifiers, reuse them rather than adding redundant identifiers.

---

# 12. WEBHOOK STATE TRANSITION SECURITY

Never allow a webhook to arbitrarily set:

```text
booking.status
payment.status
```

based solely on client/provider fields.

Instead define an explicit state transition policy.

For example:

```text
pending → paid
pending → failed
pending → cancelled
paid → refunded
```

must be explicitly allowed.

Prevent illegal transitions such as:

```text
refunded → paid
cancelled → paid
failed → refunded
paid → pending
```

unless there is a documented legitimate business flow.

---

# 13. PAYMENT REFERENCE OWNERSHIP

Never trust a webhook reference without verifying ownership.

A webhook containing:

```text
reference = BK-123
```

must resolve to the correct internal payment/booking record.

Validate:

```text
provider
provider transaction ID
merchant/order reference
booking ID/reference
amount
currency
customer/account where applicable
integration/account ID where applicable
```

These values must correspond to the same transaction.

Prevent:

```text
valid signature + wrong booking reference
```

from confirming another booking.

---

# 14. AMOUNT INTEGRITY

The client must never be authoritative for the final payable amount.

At payment creation:

```text
server calculated amount
```

must become the authoritative expected amount.

At webhook processing:

```text
provider amount
```

must match:

```text
expected server amount
```

according to provider units.

Example:

```text
100 EGP
```

may be represented as:

```text
10000 cents
```

Do not compare incompatible units.

Document the canonical money representation.

---

# 15. CURRENCY INTEGRITY

Verify:

```text
expected currency
==
provider currency
```

Reject mismatches.

Never silently convert an unexpected currency.

Example:

```text
Expected: EGP
Received: USD
```

must not become a successful payment.

---

# 16. PAYMENT PROVIDER IDENTITY

Verify the callback belongs to the configured merchant/account/integration.

Where provider payload supports it, verify:

```text
integration_id
profile_id
merchant ID
account ID
gateway identifier
environment
```

Prevent:

```text
valid provider signature
+
transaction belonging to another merchant/account
```

from mutating local records.

---

# 17. PAYMENT STATE MACHINE

Create a clear payment state model.

Do not invent unnecessary states.

Inspect existing states first.

Document:

```text
docs/hardening/PHASE_6_PAYMENT_STATE_MACHINE.md
```

Include:

```text
State
Allowed incoming transitions
Allowed outgoing transitions
Who may trigger transition
Provider evidence required
Database mutation
Booking mutation
Refund implications
```

Example conceptual model:

```text
initiated
   ↓
pending
   ├──→ paid
   ├──→ failed
   └──→ expired

paid
   └──→ refunded
```

Actual states must match the existing application.

---

# 18. BOOKING/PAYMENT CONSISTENCY

Audit whether booking and payment records can become inconsistent.

Examples:

```text
payment = paid
booking = pending
```

or:

```text
payment = failed
booking = confirmed
```

or:

```text
booking = cancelled
payment = paid
```

Determine whether each state is legitimate or corruption.

Where the transition requires multiple DB mutations, use a transaction.

---

# 19. TRANSACTION BOUNDARIES

Financial state transitions must be atomic.

Example:

```text
BEGIN

lock payment
lock booking

validate current states
validate amount
validate currency
validate provider transaction
validate duplicate event

update payment
update booking

create financial ledger record if applicable
create audit record

COMMIT
```

If anything fails:

```text
ROLLBACK
```

Do not allow:

```text
payment updated
booking update failed
```

without a defined recovery strategy.

---

# 20. LOCKING AND CONCURRENCY

Audit:

```php
lockForUpdate()
```

usage.

Determine the correct lock order.

Avoid deadlocks caused by inconsistent lock order.

Example:

```text
Payment → Booking
```

must not be reversed elsewhere:

```text
Booking → Payment
```

without justification.

Document the canonical lock order.

Test:

* two identical webhooks
* two different webhook statuses
* webhook + cancellation
* webhook + refund
* checkout + webhook
* duplicate payment callback

---

# 21. IDEMPOTENCY KEY ISOLATION — FINDING-003

Audit:

```text
EnsureIdempotency.php
idempotency_keys migration
idempotency model
```

Do NOT immediately implement:

```text
hash(actorId + key)
```

without understanding the actor model.

First determine:

```text
authenticated user
guest
session
admin
service-to-service
webhook
system job
tenant
customer
```

Define the actual idempotency namespace.

---

## 21.1 Required behavior

User A:

```text
key = ABC
```

User B:

```text
key = ABC
```

must NOT accidentally collide if they are independent actors.

But the same actor:

```text
key = ABC
payload A
```

followed by:

```text
key = ABC
payload B
```

must remain a conflict if the request semantics require it.

---

## 21.2 Do not use IP as the primary identity if avoidable

Do not blindly implement:

```text
IP + key
```

because:

* multiple users can share an IP
* NAT exists
* mobile networks change IPs
* proxies exist
* IPv6 behavior differs

Prefer a stable authenticated actor identity where available.

For guests, inspect the existing guest/session architecture and design accordingly.

---

# 22. IDEMPOTENCY RESPONSE SECURITY

If an existing idempotency key is reused:

Return the correct semantics.

Do NOT return another user's cached response.

Verify ownership before returning cached data.

Test:

```text
User A key
User B same key
different payload
```

and:

```text
User A key
User A same key
same payload
```

and:

```text
User A key
User A same key
different payload
```

---

# 23. IDEMPOTENCY DATABASE CONSTRAINTS

The database constraint must match the logical namespace.

For example, conceptually:

```text
UNIQUE(actor_scope, key_hash)
```

but DO NOT apply this exact schema blindly.

Determine the correct schema based on the actual actor model.

Document the migration impact.

---

# 24. WEB CHECKOUT — FINDING-004

Inspect:

```text
POST /checkout/process
```

Determine whether this route is:

* legacy
* still actively used
* internally used
* reachable publicly
* used by tests
* used by administrators
* used by any frontend

Do not remove it blindly.

If it remains active, protect duplicate mutation.

Preferred solution must fit the existing architecture.

Options to evaluate:

```text
EnsureIdempotency
```

or:

```text
single-use checkout token
```

or another transaction-safe mechanism.

Do not use frontend JavaScript as the security mechanism.

Server-side protection is mandatory.

---

# 25. MOCK PAYMENT ROUTES

Verify FINDING-002 is actually fixed.

Search all:

```text
mock
fake
simulation
test payment
cardMock
paypalMock
```

Mock payment endpoints must NEVER be available in production.

Test that production returns:

```text
404
```

or equivalent safe behavior.

Do not rely only on frontend hiding.

---

# 26. PAYMENT AUTHORIZATION AUDIT

Audit every payment-related route.

For each mutation verify:

```text
Authentication
+
Authorization
+
Ownership
+
Scope
+
State
```

Examples:

A customer must not:

```text
mark payment as paid
refund payment
change amount
change payment provider reference
change payment status
```

An admin must not automatically gain unrestricted financial authority if the application requires maker-checker behavior.

---

# 27. REFUND SECURITY

Inspect existing refund functionality.

If refunds exist:

Audit:

* who can request refund
* who can approve refund
* who can execute refund
* refund amount
* remaining refundable amount
* duplicate refunds
* partial refunds
* full refunds
* authorization
* audit logging
* provider transaction ID
* booking state
* payment state
* concurrency

Prevent:

```text
refund > paid amount
```

and:

```text
refund total > original captured amount
```

unless provider/business rules explicitly permit it.

---

# 28. MAKER-CHECKER / REFUND APPROVAL

If the current business model requires administrative refunds:

Do not allow a single privileged request to silently perform unlimited refunds without review if a maker-checker model is required.

Inspect whether the current project has:

```text
admin roles
finance roles
manager roles
approval states
audit logs
```

If maker-checker is required by the current business rules, implement it with the minimum architecture necessary.

Do NOT create an elaborate workflow engine.

At minimum consider:

```text
requested
approved
rejected
executed
failed
```

with:

```text
requester != approver
```

where required.

---

# 29. FINANCIAL LEDGER AUDIT

Determine whether the project currently has a financial ledger.

If one already exists:

Audit it.

If there is no ledger:

DO NOT automatically create a full accounting system.

Determine whether a minimal immutable payment event/audit record is required for reconciliation.

If introducing a record, it should preserve facts such as:

```text
provider
provider transaction ID
internal payment ID
booking ID
event type
amount
currency
event timestamp
received timestamp
event ID
status
raw payload reference/hash if appropriate
actor/system source
```

Do NOT store sensitive payment credentials.

Do NOT store full card numbers.

---

# 30. RAW WEBHOOK PAYLOAD STORAGE

Do not blindly store complete webhook payloads.

First classify fields.

Avoid storing:

* card numbers
* CVV
* secrets
* authentication tokens
* unnecessary PII

If payload persistence is required for reconciliation/debugging:

Prefer:

```text
sanitized payload
+
cryptographic payload hash
+
provider event ID
+
metadata
```

and define retention.

---

# 31. LOGGING SECURITY

Search all payment logs.

Never log:

```text
HMAC secret
API secret
private key
authorization token
payment credentials
full card number
CVV
raw sensitive payload
```

Mask:

```text
transaction identifiers
email
phone
PII
```

where appropriate.

Ensure failed signature verification does not log the secret or full attacker-controlled payload.

---

# 32. WEBHOOK ERROR RESPONSES

Do not expose internal details.

Bad:

```json
{
  "error": "Expected HMAC X but received Y using secret Z"
}
```

Good conceptual behavior:

```json
{
  "message": "Invalid webhook signature"
}
```

Use the existing S2 error envelope.

Do not invent another API response format.

---

# 33. RATE LIMITING AND RESOURCE EXHAUSTION

Audit webhook endpoint against:

* request flooding
* huge body
* malformed JSON
* repeated invalid signatures
* repeated valid duplicate events
* expensive payload processing

Protect the endpoint without breaking legitimate provider retries.

Do not create a rate limit that causes legitimate payment callbacks to be dropped without a recovery strategy.

---

# 34. REQUEST BODY LIMITS

Inspect:

```text
web server
PHP
Laravel
middleware
```

for webhook body limits.

Prevent excessively large payloads.

But do not choose arbitrary tiny limits that can reject legitimate provider callbacks.

Base the limit on observed provider payload sizes with reasonable headroom.

---

# 35. WEBHOOK TIMEOUTS

Webhook processing must be fast enough for provider retry behavior.

Avoid doing expensive unrelated work synchronously.

If existing jobs are available, evaluate whether secondary work can be queued AFTER the financial state transition is safely committed.

Never queue the actual payment verification before authenticity is established.

---

# 36. EXTERNAL PROVIDER FAILURE

Test:

```text
provider timeout
provider 500
provider 429
DNS failure
network timeout
malformed provider response
```

Determine whether the local payment state becomes:

```text
failed
pending
unknown
```

Do not mark payment as failed simply because a network request timed out if the provider may have processed it.

Use a safe state such as:

```text
pending / reconciliation required
```

if appropriate to the existing model.

---

# 37. REDIRECT VS WEBHOOK

The customer redirect must NOT become the financial source of truth.

For providers such as Paymob, current documentation explicitly distinguishes the client-side transaction response redirect from the server-side transaction processed callback and states that the callback should be relied upon for final payment status.

Therefore audit:

```text
GET payment-success
GET redirect
frontend callback
```

and ensure they cannot independently mark a booking paid.

The redirect may:

```text
display status
poll status
redirect user
```

but must not bypass webhook/provider verification.

---

# 38. PAYMENT STATUS QUERY

If the backend has:

```text
GET /payment/status
```

or similar:

Audit whether it:

* leaks another user's payment
* accepts arbitrary transaction IDs
* reveals sensitive provider data
* allows enumeration
* trusts client status
* bypasses authorization

Use internal ownership checks.

---

# 39. RECONCILIATION DESIGN

Create:

```text
docs/hardening/PHASE_6_RECONCILIATION.md
```

Document how the system handles:

```text
local payment pending
provider says paid

local says paid
provider says failed

provider transaction missing locally

local transaction missing at provider

duplicate provider event

refund mismatch

amount mismatch

currency mismatch

booking/payment mismatch
```

Define:

```text
detected
→ isolated
→ investigated
→ corrected
```

Do not silently mutate financial records during reconciliation without auditability.

---

# 40. PAYMENT/BOOKING RECONCILIATION INVARIANTS

Define explicit invariants.

Examples:

```text
A booking cannot be confirmed by an unauthenticated client.
```

```text
A payment cannot become paid without valid provider evidence.
```

```text
A webhook cannot change another booking.
```

```text
Captured amount cannot exceed expected amount.
```

```text
Refund total cannot exceed refundable amount.
```

```text
Duplicate webhook cannot duplicate financial effects.
```

```text
A payment cannot move backward to an invalid state.
```

Adapt these to the actual project state machine.

---

# 41. POSTGRESQL CONCURRENCY — FINDING-005

Inspect:

```text
backend/phpunit.postgres.xml
```

and the Docker PostgreSQL setup.

Run the dedicated PostgreSQL suite.

Do NOT consider SQLite passing sufficient evidence for PostgreSQL-specific guarantees.

Verify:

```text
EXCLUDE USING gist
```

or whatever actual production constraint exists.

Test:

* overlapping booking race
* same inventory
* same dates
* adjacent dates
* same checkout day
* concurrent transactions
* rollback
* deadlock behavior
* duplicate payment processing

---

# 42. SQLITE VS POSTGRESQL DIFFERENCE AUDIT

Create:

```text
docs/hardening/PHASE_6_DATABASE_ENGINE_MATRIX.md
```

Document differences relevant to:

```text
locking
constraints
unique indexes
NULL behavior
transactions
date/time
JSON
foreign keys
exclusion constraints
case sensitivity
upserts
concurrency
```

Do not attempt to make SQLite behave like PostgreSQL artificially.

SQLite is acceptable for fast local tests.

PostgreSQL must be the authoritative production compatibility suite.

---

# 43. TESTING STRATEGY

Add or improve tests for every security invariant.

Minimum test categories:

### Webhook

1. missing signature
2. invalid signature
3. malformed signature
4. valid signature
5. modified payload
6. modified signature
7. replayed event
8. duplicate transaction
9. wrong booking reference
10. wrong merchant/integration
11. wrong amount
12. wrong currency
13. invalid state transition
14. provider mismatch

### Payment

15. fake success
16. fake transaction ID
17. fake amount
18. fake currency
19. unauthorized status mutation
20. customer attempting refund
21. refund overpayment
22. duplicate refund
23. concurrent refund

### Idempotency

24. same user + same key + same payload
25. same user + same key + different payload
26. different users + same key
27. guest collision
28. concurrent same key
29. cached response ownership

### Checkout

30. double submit
31. concurrent checkout
32. legacy Blade duplicate submit

### Concurrency

33. duplicate webhook concurrently
34. webhook + cancellation
35. webhook + refund
36. two bookings same inventory
37. PostgreSQL exclusion constraint

---

# 44. ADVERSARIAL WEBHOOK TESTING

Write a dedicated suite:

```text
backend/tests/Feature/AdversarialPaymentSecurityTest.php
```

or integrate into the existing test structure if a better location already exists.

Attack examples:

```text
fake signature
empty signature
signature copied from another payload
valid signature with modified booking ID
valid signature with modified amount
valid signature with modified currency
valid signature from another merchant
replayed valid callback
duplicate callback
wrong transaction ID
wrong internal reference
state transition manipulation
```

---

# 45. PROPERTY-STYLE INVARIANTS

Where practical, test properties rather than only individual examples.

For example:

```text
No unauthenticated request can cause payment = paid.
```

```text
No invalid webhook can cause booking = confirmed.
```

```text
No payment callback can mutate a booking outside its verified reference.
```

```text
Processing the same webhook N times has the same financial result as processing it once.
```

```text
Refunded amount never exceeds captured amount.
```

---

# 46. FAILURE INJECTION

Test database failure during payment processing.

Simulate:

```text
payment update succeeds
booking update fails
```

and verify transaction rollback.

Simulate:

```text
booking lock timeout
```

and verify safe behavior.

Simulate:

```text
duplicate webhook arrives during transaction
```

and verify only one financial mutation occurs.

---

# 47. OBSERVABILITY

Add appropriate structured logs/metrics if the current observability architecture supports them.

Track events such as:

```text
webhook_received
webhook_signature_failed
webhook_duplicate
webhook_processed
payment_state_changed
payment_amount_mismatch
payment_currency_mismatch
payment_reference_mismatch
refund_requested
refund_approved
refund_executed
reconciliation_required
```

Do not log secrets or sensitive payment data.

Every relevant event should contain the existing:

```text
request_id
```

and appropriate internal identifiers.

---

# 48. AUDIT TRAIL

Financial state changes must be traceable.

Determine whether existing audit infrastructure can record:

```text
who
what
when
old state
new state
reason
provider event
request ID
```

Do not create duplicate audit systems if one already exists.

---

# 49. DATABASE MIGRATIONS

If schema changes are required:

Create proper migrations.

Do NOT edit old migrations that may already have been deployed unless the repository policy explicitly permits it.

Consider:

```text
existing data
unique constraints
indexes
foreign keys
nullability
backfill
rollback
production size
lock duration
```

For large tables, avoid unsafe blocking migrations.

---

# 50. DATA MIGRATION SAFETY

If changing:

```text
idempotency_keys
payments
transactions
refunds
webhook events
```

provide a safe migration path.

Test:

```text
old data
new code
migration
new data
rollback where applicable
```

Do not destroy existing payment history.

---

# 51. PERFORMANCE

Do not sacrifice security for performance.

But avoid:

* repeated database queries
* unnecessary JSON parsing
* repeated provider calls
* unbounded webhook processing
* N+1 queries
* unnecessary locks

Profile critical payment paths.

Expected goal:

```text
fast verification
+
minimal DB queries
+
short transactions
+
safe concurrency
```

---

# 52. SECURITY OF CONFIGURATION

Inspect:

```text
config/services.php
.env.example
payment config
secret handling
```

Ensure:

* secrets are configuration-driven
* secrets are not committed
* production secret is required
* missing production secret fails safely
* test secrets are isolated
* provider credentials are not exposed to frontend
* logging never prints secrets

Production should fail closed if a required payment secret is missing.

---

# 53. SECRET SCANNING

Search repository for:

```text
sk_live
secret
hmac
api_key
private_key
token
password
authorization
```

Distinguish:

```text
placeholder
test secret
real secret
```

If a real credential is found:

1. do not print it
2. do not copy it into reports
3. flag it immediately
4. recommend rotation
5. remove it from source control if appropriate
6. inspect git history according to repository policy

---

# 54. API CONTRACT PRESERVATION

Do not arbitrarily change API responses.

If webhook/payment errors use the existing S2 response envelope, preserve it.

If a breaking API change is unavoidable:

Document:

```text
old contract
new contract
reason
frontend impact
migration
tests
```

---

# 55. FRONTEND COMPATIBILITY

The frontend is Next.js 15.

Inspect current payment API usage.

Search frontend for:

```text
checkout
payment
booking
idempotency-key
payment status
redirect
webhook
```

Do not put secrets in Next.js client-side code.

Do not move financial authority into the frontend.

Frontend may:

```text
start checkout
display payment UI
poll safe status
show result
```

Backend remains authoritative.

---

# 56. SECURITY HEADERS / CSRF / CORS

Audit payment routes for:

```text
CSRF
CORS
SameSite cookies
origin validation
method handling
content type
```

Do not disable CSRF globally to make payment endpoints work.

Webhook routes should use the appropriate authentication mechanism rather than relying on browser CSRF semantics.

---

# 57. HTTP METHOD SECURITY

Verify payment mutation routes cannot be triggered unexpectedly using:

```text
GET
HEAD
OPTIONS
method override
```

especially:

```text
refund
payment confirmation
checkout
status mutation
```

Only intended methods should cause state changes.

---

# 58. MASS ASSIGNMENT / INPUT VALIDATION

Audit payment models and requests for:

```text
fillable
guarded
validated
casts
DTOs
```

Prevent user input from setting:

```text
payment_status
paid_at
amount
currency
provider_transaction_id
provider
refund_amount
confirmed_at
booking_status
```

unless explicitly controlled by server-side domain logic.

---

# 59. EXCEPTION HANDLING

Payment exceptions must not leak:

* provider secrets
* SQL details
* internal paths
* credentials
* raw provider payloads

Use existing exception mapping.

Distinguish:

```text
invalid request
unauthorized
forbidden
conflict
provider unavailable
internal error
```

without exposing unnecessary internals.

---

# 60. TEST COMMANDS

At minimum run:

```bash
php artisan test --env=testing
```

```bash
./vendor/bin/pint --test
```

```bash
./vendor/bin/phpstan analyse app routes --memory-limit=1G
```

```bash
composer audit
```

```bash
python3 api_test_suite.py --auto-start
```

And PostgreSQL:

```bash
phpunit -c phpunit.postgres.xml
```

or the repository's actual PostgreSQL test command.

Do not invent the command if the repository already defines another canonical command.

---

# 61. TEST ENVIRONMENT MATRIX

Run:

```text
SQLite
PostgreSQL
```

where relevant.

Classify tests:

```text
SQLite-compatible
PostgreSQL-required
Provider-contract
Security
Concurrency
Integration
```

---

# 62. STATIC ANALYSIS

Run:

```bash
./vendor/bin/phpstan analyse app routes --memory-limit=1G
```

Must be:

```text
0 errors
```

unless a pre-existing documented baseline exists.

Do not suppress errors simply to make the command pass.

---

# 63. CODE STYLE

Run:

```bash
./vendor/bin/pint --test
```

Fix actual style issues.

Do not introduce broad unrelated formatting changes.

---

# 64. DEPENDENCY SECURITY

Run:

```bash
composer audit
```

Do not upgrade unrelated dependencies unless required.

If a payment dependency is vulnerable:

* identify impact
* identify safe version
* test compatibility
* update deliberately

---

# 65. DOCUMENTATION

Create/update:

```text
docs/hardening/PHASE_6_PAYMENT_ARCHITECTURE.md
docs/hardening/PHASE_6_PAYMENT_STATE_MACHINE.md
docs/hardening/PHASE_6_FINANCIAL_TRUST_BOUNDARIES.md
docs/hardening/PHASE_6_RECONCILIATION.md
docs/hardening/PHASE_6_DATABASE_ENGINE_MATRIX.md
docs/hardening/PHASE_6_SECURITY_MATRIX.md
docs/hardening/PHASE_6_FINAL_REPORT.md
```

Update:

```text
docs/hardening/LEDGER.md
docs/hardening/BACKLOG.md
```

---

# 66. SECURITY MATRIX

Create:

```text
PHASE_6_SECURITY_MATRIX.md
```

Every control must map to:

```text
Control
Threat
Implementation
File
Test
Expected Result
Actual Result
Status
```

Example:

```text
Webhook HMAC
Forged callback
VerifyWebhookSignature
...
AdversarialWebhookTest
Invalid signature rejected
PASS
```

---

# 67. FINDINGS MANAGEMENT

For each Phase 5.5 finding:

```text
FINDING-001
FINDING-002
FINDING-003
FINDING-004
FINDING-005
```

record:

```text
Original severity
Original risk
Current status
Fix
Files changed
Migration
Tests
Residual risk
```

Statuses should be:

```text
FIXED
ACCEPTED
DEFERRED
REJECTED WITH EVIDENCE
```

Do not mark something FIXED unless the corresponding security test passes.

---

# 68. FINDING-001 CLOSURE REQUIREMENTS

FINDING-001 may only be marked:

```text
FIXED
```

when all are true:

* real provider signature verification exists
* no production bypass exists
* correct provider algorithm verified
* correct canonicalization verified
* constant-time comparison used
* missing signature rejected
* invalid signature rejected
* modified payload rejected
* valid payload accepted
* replay protection exists where applicable
* duplicate event is idempotent
* amount is verified
* currency is verified
* transaction/reference is verified
* booking ownership/reference is verified
* tests pass

---

# 69. FINDING-003 CLOSURE REQUIREMENTS

Only mark fixed after proving:

```text
same actor + same key + same payload
```

is safely idempotent.

And:

```text
same actor + same key + different payload
```

is rejected.

And:

```text
different actors + same key
```

do not collide incorrectly.

And cached responses cannot cross actor boundaries.

---

# 70. FINDING-004 CLOSURE REQUIREMENTS

Only mark fixed when:

```text
POST /checkout/process
```

cannot generate duplicate mutation from repeated submission.

Test simultaneous requests.

Do not rely only on UI button disabling.

---

# 71. FINDING-005 CLOSURE REQUIREMENTS

Only mark fixed when the PostgreSQL-specific test suite proves the production constraint/locking behavior.

SQLite passing alone is insufficient evidence.

---

# 72. ADVERSARIAL FINAL AUDIT

After implementation, STOP coding temporarily.

Pretend the implementation was written by another developer.

Audit it from the perspective of an attacker.

Try to:

```text
forge payment
forge webhook
reuse webhook
change amount
change currency
change booking reference
reuse transaction ID
refund twice
refund another user's payment
confirm another user's booking
reuse idempotency key
cause cross-user idempotency collision
double submit checkout
race two callbacks
race webhook and cancellation
race refund and webhook
bypass authorization
bypass validation
trigger mutation using GET
trigger mock endpoint
leak payment information
enumerate transaction IDs
cause database inconsistency
```

Do not assume tests prove security.

Try to break the implementation.

---

# 73. PRODUCTION READINESS GATE

Phase 6 is NOT complete if any of the following remains unresolved:

### P0

* forged payment possible
* webhook signature bypass
* client can mark payment paid
* unauthorized financial mutation
* payment amount can be manipulated
* booking can be confirmed without valid payment evidence
* refund can exceed paid amount through exploitable path
* critical payment state corruption

### P1

Any unresolved high-severity payment authorization, ownership, replay, or financial integrity issue must block the phase unless explicitly accepted by the project owner with documented risk.

---

# 74. FINAL REQUIRED REPORT

Create:

```text
docs/hardening/PHASE_6_FINAL_REPORT.md
```

Use this exact structure:

```text
# PHASE 6 FINAL REPORT

## Executive Summary

## Scope

## Architecture Reviewed

## Payment Flow

## Webhook Security

## HMAC Verification

## Replay Protection

## Payment State Machine

## Booking/Payment Consistency

## Amount Integrity

## Currency Integrity

## Idempotency

## Refund Security

## Reconciliation

## PostgreSQL Concurrency

## SQLite Compatibility

## Authorization

## Logging & Secrets

## Performance

## Tests

## Static Analysis

## Dependency Audit

## Phase 5.5 Findings

### FINDING-001
### FINDING-002
### FINDING-003
### FINDING-004
### FINDING-005

## New Findings

## Deferred Findings

## Residual Risks

## Production Blockers

## Final Gate
```

---

# 75. FINAL REPORT MUST INCLUDE EXACT NUMBERS

Do NOT write:

```text
Tests passed successfully.
```

Write:

```text
Application tests:
X passed
Y assertions

PostgreSQL tests:
X passed
Y assertions

Adversarial tests:
X passed
Y failed

PHPStan:
0 errors

Pint:
Passed

Composer audit:
0 advisories
```

Use actual observed numbers.

Never invent counts.

---

# 76. FINAL GATE VALUES

The final gate must be exactly one of:

```text
PASS
```

or:

```text
CONDITIONAL PASS
```

or:

```text
FAIL
```

Use:

### PASS

Only if:

* no P0
* no unresolved P1
* required Phase 5.5 findings closed or explicitly accepted
* security tests pass
* PostgreSQL tests pass
* payment invariants verified

### CONDITIONAL PASS

Only if:

* no exploitable P0 remains
* remaining risks are clearly documented
* none of them invalidate financial integrity
* explicit follow-up exists

### FAIL

If:

* forged payment remains possible
* webhook authenticity is not cryptographically verified
* payment authorization is bypassable
* financial state can be corrupted
* critical concurrency issue remains
* production secrets/security are compromised
* tests demonstrate a critical exploit

---

# 77. DO NOT HIDE FAILURES

If something cannot be implemented safely because information is missing:

Do NOT invent behavior.

Do NOT mark it fixed.

Instead report:

```text
BLOCKED
```

and explain exactly what information is missing.

Examples:

```text
Provider callback specification unavailable
Payment provider not configured
Production secret unavailable
Business refund policy undefined
```

---

# 78. IMPORTANT: DO NOT MIX BUSINESS ASSUMPTIONS WITH SECURITY FACTS

Separate:

```text
Verified fact
```

from:

```text
Assumption
```

from:

```text
Recommendation
```

from:

```text
Business rule requiring owner confirmation
```

Do not invent business rules merely to make tests pass.

---

# 79. CHANGE DISCIPLINE

Every code modification must answer:

```text
Why was this file changed?
What vulnerability/problem does it solve?
What existing behavior could it affect?
What test proves it?
```

Avoid unrelated refactoring.

Do not rename large portions of the project unnecessarily.

Do not reformat unrelated files.

Do not rewrite working modules.

---

# 80. FINAL IMPLEMENTATION PRINCIPLE

The final architecture should remain conceptually:

```text
Client
   ↓
HTTPS / Reverse Proxy
   ↓
Laravel
   ↓
Authentication
   ↓
Authorization
   ↓
Validation
   ↓
Checkout / Payment Service
   ↓
Server-authoritative pricing
   ↓
Payment Provider
   ↓
Cryptographically verified webhook
   ↓
Replay / Idempotency protection
   ↓
Reference + Amount + Currency verification
   ↓
Transaction
   ↓
Payment state transition
   ↓
Booking state transition
   ↓
Audit / reconciliation
   ↓
Response
```

The payment provider is authoritative for external payment evidence.

The backend is authoritative for:

* booking
* pricing
* ownership
* authorization
* local state
* financial consistency

The frontend is NEVER authoritative for financial state.

---

# 81. STARTING PROCEDURE

Before modifying anything, execute this sequence:

### Step 1

Read:

```text
promit.md
```

### Step 2

Read:

```text
docs/hardening/PHASE_5_5_FINDINGS.md
```

### Step 3

Read:

```text
docs/hardening/PHASE_5_5_FINAL_REPORT.md
```

### Step 4

Read:

```text
docs/hardening/LEDGER.md
docs/hardening/BACKLOG.md
```

### Step 5

Inventory payment-related files.

### Step 6

Trace the complete payment lifecycle.

### Step 7

Identify the exact payment provider and callback contract.

### Step 8

Verify provider documentation if necessary.

### Step 9

Create an implementation plan.

### Step 10

Only then begin modifications.

---

# 82. BEFORE CODING — REQUIRED OUTPUT

Before making code changes, produce a concise internal implementation map containing:

```text
1. Current payment architecture
2. Current webhook flow
3. Current payment states
4. Current booking/payment relationship
5. Current idempotency design
6. Current refund design
7. Current PostgreSQL constraints
8. Phase 5.5 findings mapping
9. Files that must change
10. Files that should NOT change
11. Required migrations
12. Required tests
13. Provider-specific verification requirements
14. Risks
```

Then implement.

---

# 83. FINAL SUCCESS CONDITION

Phase 6 is successful only when the system can demonstrate:

```text
An attacker cannot forge a payment webhook.
```

```text
An attacker cannot mark a booking as paid from the client.
```

```text
A valid webhook cannot be redirected to another booking.
```

```text
A modified payment amount is rejected.
```

```text
A modified currency is rejected.
```

```text
A replayed webhook produces no duplicate financial effect.
```

```text
A duplicate webhook is safely idempotent.
```

```text
Different users cannot corrupt each other's idempotency state.
```

```text
Legacy checkout cannot create duplicate financial mutations.
```

```text
Refunds cannot exceed refundable amounts.
```

```text
Concurrent financial operations remain consistent.
```

```text
PostgreSQL production constraints are actually tested.
```

```text
Payment secrets never leak through logs or responses.
```

```text
All critical security properties have automated regression tests.
```

```text
The final production gate is based on evidence, not assumptions.
```

# END OF PHASE 6
