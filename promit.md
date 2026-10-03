# 🛡️ PHASE 5.5 — ADVERSARIAL PRODUCTION AUDIT

## GouNow Platform — Pre-Production Adversarial Security, Architecture, Data Integrity & Reliability Audit

> **Purpose:** This phase is NOT a feature-development phase.
>
> This phase exists to aggressively challenge, attack, verify, and validate everything implemented during Phases 0–5 before the system proceeds to Payment, PII, PostgreSQL, Performance, Observability, and Final Production Hardening.
>
> The objective is to determine whether the current implementation is genuinely secure and production-safe, rather than merely passing the existing test suite.
>
> **You are not allowed to assume that passing tests means the implementation is correct.**
>
> Treat the existing backend as potentially vulnerable until every important security and reliability boundary has been independently verified.

---

# 0. ROLE — ACT AS AN ADVERSARIAL AUDIT TEAM

You are simultaneously acting as:

* Principal Laravel Architect
* Senior Application Security Engineer
* Offensive Security Engineer
* API Security Auditor
* Database Security Engineer
* PostgreSQL/SQLite Reliability Engineer
* Concurrency Engineer
* Authentication Security Engineer
* Authorization/RBAC Auditor
* Payment Security Auditor
* QA/Test Architect
* Performance Engineer
* Production Reliability Engineer
* Code Reviewer

Your objective is NOT to make the existing implementation look good.

Your objective is to find where it can fail.

Assume that:

* existing code may contain hidden bugs
* existing tests may have blind spots
* security controls may only work in the happy path
* middleware may not cover every route
* policies may contain logic gaps
* database constraints may be incomplete
* race-condition protection may be incorrectly placed
* SQLite behavior may hide PostgreSQL problems
* API responses may leak fields in edge cases
* logs may contain sensitive information
* idempotency may fail under concurrency
* authentication may be correct in one flow but vulnerable in another
* authorization may work for normal users but fail through alternate routes
* frontend validation may be incorrectly trusted
* exception handling may leak internal implementation details
* tests may assert implementation details instead of security properties

Do not attempt to prove the previous developer was wrong.

Attempt to prove whether the current system is actually safe.

---

# 1. CRITICAL RULE — DO NOT MODIFY FIRST

Before modifying code:

1. Inspect the repository.
2. Read `promit.md`.
3. Read:

   * `docs/hardening/LEDGER.md`
   * `docs/hardening/BACKLOG.md`
   * `docs/hardening/ROUTE_INVENTORY.md`
   * `docs/hardening/DATABASE_SCHEMA_AND_SECURITY.md`
4. Inspect the current Git status.
5. Inspect recent Git diff.
6. Identify all changes made after Phase 5.
7. Identify all tests added during Phases 0–5.
8. Inspect the current Laravel configuration.
9. Inspect environment configuration.
10. Inspect migrations.
11. Inspect routes.
12. Inspect middleware.
13. Inspect authentication.
14. Inspect authorization.
15. Inspect booking flows.
16. Inspect pricing flows.
17. Inspect idempotency implementation.
18. Inspect exception handling.
19. Inspect logging.
20. Inspect database transactions and locking.
21. Inspect API Resources/DTOs.
22. Inspect test infrastructure.

Only after establishing the current baseline may you begin adversarial testing.

---

# 2. ABSOLUTE RULE — DO NOT TRUST EXISTING TESTS

Existing tests are evidence, not proof.

For every important security control ask:

> "What test would pass even if this security control were incorrectly implemented?"

Then create a stronger test.

Do not simply rerun:

```bash
php artisan test
```

and conclude that the system is secure.

You must perform:

* positive testing
* negative testing
* boundary testing
* authorization bypass testing
* malformed input testing
* concurrent request testing
* state transition testing
* replay testing
* enumeration testing
* privilege escalation testing
* alternate-route testing
* alternate-content-type testing
* database constraint testing
* transaction failure testing
* exception-path testing

---

# 3. NO NEW FEATURES

This phase must NOT introduce:

* Redis
* Kafka
* RabbitMQ
* Kubernetes
* Elasticsearch
* microservices
* CQRS
* event sourcing
* new databases
* unnecessary repositories
* unnecessary interfaces
* unnecessary abstractions
* unrelated refactoring

Only create code when required to:

1. reproduce a vulnerability
2. prove a security property
3. fix a confirmed defect
4. improve testability without changing behavior
5. instrument an audit finding

---

# 4. ESTABLISH THE ATTACK SURFACE

Create or update:

```text
docs/hardening/PHASE_5_5_ATTACK_SURFACE.md
```

Document:

## 4.1 HTTP Attack Surface

Inventory:

* public GET routes
* public POST routes
* public PUT/PATCH routes
* public DELETE routes
* customer routes
* authenticated routes
* admin routes
* webhook routes
* upload routes
* authentication routes
* password recovery routes
* 2FA routes
* booking routes
* payment routes
* CMS routes
* lead/contact routes

For every route record:

```text
METHOD
URI
Controller
Action
Middleware
Authentication
Authorization
Validation
Rate Limit
Idempotency
Transaction
Database Mutation
External Service
Response Resource
Potential Sensitive Data
```

Do not rely only on the route inventory document.

Generate the inventory from the actual Laravel route collection where possible.

---

# 5. ROUTE SECURITY AUDIT

Run:

```bash
php artisan route:list
```

and inspect the complete output.

For every mutation route:

* POST
* PUT
* PATCH
* DELETE

verify:

* authentication requirements
* authorization requirements
* validation
* rate limiting
* CSRF assumptions where relevant
* idempotency requirements where appropriate
* transaction boundaries
* response filtering

Identify:

```text
unprotected mutation
missing authorization
missing validation
missing rate limit
missing idempotency
wrong middleware ordering
wrong guard
wrong policy
wrong scope
wrong route model binding
```

---

# 6. AUTHORIZATION ADVERSARIAL AUDIT

The authorization model is described as:

```text
Role + Scope + State
```

Do not assume this model is correctly enforced.

Test all combinations.

---

## 6.1 Horizontal Privilege Escalation

Create:

```text
User A
User B
Admin A
Admin B
```

Where applicable.

Attempt:

```text
User A → User B resource
User B → User A resource
Admin A → Admin B scoped resource
Customer → another customer's booking
Customer → another customer's profile
Customer → another customer's private data
```

Test using:

* direct IDs
* UUIDs
* slugs
* booking codes
* public identifiers
* alternate endpoints
* nested resources
* query parameters

Expected result:

```text
403 or 404
```

depending on the intended contract.

Never leak:

* existence
* ownership
* internal IDs
* private metadata

unless the endpoint is intentionally public.

---

# 7. IDOR / BOLA ATTACK MATRIX

Build an automated matrix.

For each protected resource:

```text
Own resource
Other user's resource
Non-existent resource
Deleted resource
Soft-deleted resource
Unauthorized resource
Resource belonging to another scope
```

Test:

```text
GET
POST
PUT
PATCH
DELETE
```

where applicable.

Do not test only the obvious endpoint.

Check alternate paths that access the same model.

Example:

```text
/bookings/{id}
/customer/bookings/{id}
/bookings/{code}
/bookings/{token}
/admin/bookings/{id}
```

The same underlying object must not accidentally become accessible through a weaker route.

---

# 8. VERTICAL PRIVILEGE ESCALATION

Test:

```text
guest
customer
staff
manager
admin
super-admin
```

or whatever roles actually exist.

Attempt:

```text
customer → admin endpoint
staff → admin-only mutation
admin → super-admin operation
lower scope → higher scope resource
```

Try modifying:

```text
role_id
permissions
scope_id
owner_id
user_id
status
approval_state
is_admin
is_active
```

through:

* JSON
* form data
* query parameters
* nested arrays
* mass assignment
* hidden fields
* alternate endpoints

Never trust:

```php
$request->validated()
```

alone.

Verify that the validated fields are actually authorized to be modified.

---

# 9. MASS ASSIGNMENT AUDIT

Inspect all models for:

```php
$fillable
$guarded
casts
```

Search for:

```php
create()
update()
fill()
forceFill()
firstOrCreate()
updateOrCreate()
upsert()
```

Identify sensitive attributes that could be mass assigned.

Examples:

```text
role
permissions
user_id
owner_id
customer_id
status
payment_status
verified_at
approved_at
is_admin
is_active
price
total
discount
refund_amount
booking_state
```

For every sensitive attribute determine:

```text
Can client submit it?
Can it reach validated data?
Can it reach DTO?
Can it reach Action?
Can it reach Model?
Can it modify DB?
```

Create regression tests for every confirmed risk.

---

# 10. AUTHENTICATION ADVERSARIAL AUDIT

Inspect:

* login
* logout
* password reset
* password update
* registration
* email verification
* 2FA
* recovery codes
* session/token management

Test:

### Login

* valid credentials
* invalid password
* nonexistent email
* disabled user
* deleted user
* unverified user
* locked user
* repeated attempts
* distributed attempts
* timing differences

Verify that failures do not disclose:

```text
account existence
account status
internal exception
database information
```

---

# 11. PASSWORD RESET ATTACKS

Test:

```text
expired token
already-used token
malformed token
short token
long token
random token
token replay
parallel token use
wrong user
token after password change
token after logout
```

Verify:

* single use
* expiration
* invalidation
* hashing
* race-condition protection
* generic responses

Test two concurrent reset attempts using the same token.

Only one operation should succeed where the contract requires one-time use.

---

# 12. 2FA ADVERSARIAL AUDIT

Inspect TOTP implementation.

Verify:

* secret encryption at rest
* secret never returned in normal API responses
* secret never logged
* replay prevention
* recovery code hashing
* recovery code one-time use
* rate limiting
* brute-force resistance
* clock-window configuration
* enrollment confirmation
* disable flow
* recovery flow

Attack:

```text
same OTP twice
same recovery code twice
invalid OTP flood
OTP from wrong user
OTP after 2FA disabled
OTP after secret rotation
```

Test concurrent recovery-code usage.

---

# 13. SESSION / TOKEN SECURITY

Inspect authentication guard and token lifecycle.

Verify:

* token expiration
* revocation
* logout behavior
* password-change invalidation
* account-disable behavior
* session fixation resistance
* secure cookie configuration if cookies are used
* SameSite
* HttpOnly
* Secure
* CORS assumptions

Never assume the frontend will enforce these controls.

---

# 14. INPUT VALIDATION ADVERSARIAL AUDIT

For every important endpoint test:

```text
missing fields
null
empty string
whitespace
zero
negative number
huge number
decimal
scientific notation
boolean instead of string
array instead of scalar
object instead of scalar
unexpected nested object
unexpected nested array
duplicate fields
unknown fields
extra JSON fields
very long strings
Unicode
emoji
control characters
HTML
SQL-like strings
JSON injection patterns
```

The objective is not merely SQL injection testing.

The objective is ensuring the application's input contract is strict.

---

# 15. MASSIVE INPUT / RESOURCE EXHAUSTION

Identify every endpoint accepting:

* arrays
* lists
* filters
* sorting
* pagination
* search
* uploads
* nested structures

Test:

```text
per_page=1
per_page=100
per_page=101
per_page=1000000
page=-1
page=0
page=999999999
huge search strings
huge filter arrays
deeply nested JSON
```

Verify:

* bounded input
* bounded database work
* bounded memory
* bounded response size

---

# 16. SQL / QUERY SAFETY

Search for:

```php
DB::raw()
whereRaw()
selectRaw()
orderByRaw()
havingRaw()
groupByRaw()
raw SQL
```

For each usage verify:

* parameters are bound
* identifiers are allowlisted
* sorting fields are allowlisted
* user input cannot become SQL syntax

Test malicious values against:

```text
sort
filter
search
column
direction
group
date range
```

---

# 17. AUTHORITATIVE PRICING AUDIT

The server must remain authoritative for all financial values.

For every booking/quote/payment-related endpoint test tampering with:

```text
price
unit_price
nightly_rate
subtotal
discount
tax
fees
total
currency
quantity
guest count
dates
property ID
season
coupon
payment amount
```

Attempt:

```json
{
  "total": 1,
  "price": 1,
  "discount": 999999,
  "nightly_rate": 0
}
```

Verify that server-side calculations remain authoritative.

The client must never determine the final amount.

---

# 18. BOOKING STATE MACHINE ATTACK

Enumerate all valid states.

For each state:

```text
Allowed transitions
Forbidden transitions
Actor allowed
Actor forbidden
Side effects
```

Attempt illegal transitions.

Examples:

```text
cancelled → confirmed
completed → pending
expired → confirmed
refunded → paid
paid → pending
```

depending on actual domain rules.

Attempt transitions through:

* direct API calls
* duplicate requests
* concurrent requests
* stale frontend state
* repeated webhooks
* admin endpoints
* customer endpoints

---

# 19. BOOKING CONCURRENCY AUDIT

This is one of the highest-priority tests.

Do not only test sequential requests.

Create concurrent requests attempting to book:

```text
same property
same dates
same inventory
same customer
same idempotency key
different idempotency keys
```

Run at least:

```text
2 concurrent requests
5 concurrent requests
10 concurrent requests
```

where practical.

Verify:

```text
exactly one valid booking
no double booking
no negative inventory
no inconsistent status
no partial writes
no duplicated financial records
```

Inspect actual transaction boundaries.

Do not assume:

```php
DB::transaction()
```

automatically solves concurrency.

Verify lock ordering and database constraints.

---

# 20. IDEMPOTENCY ADVERSARIAL AUDIT

For every idempotent endpoint test:

### Same request

```text
same key
same payload
```

Expected:

```text
same logical result
no duplicate mutation
```

### Same key + different payload

Example:

```text
Key = ABC
Request 1 = Booking A
Request 2 = Booking B
```

This must NOT silently mutate the first operation into the second.

Expected behavior must be explicitly defined and tested.

### Concurrent replay

Send the same idempotency key concurrently.

Verify:

```text
one mutation
consistent response
no race
no duplicate database rows
```

### Expired key

Verify cleanup and replay behavior.

### Cross-user key reuse

Test:

```text
User A → key X
User B → key X
```

Ensure users cannot interfere with each other's operations.

---

# 21. DATABASE INTEGRITY AUDIT

Inspect all migrations.

For every important relationship verify:

* foreign key
* nullability
* uniqueness
* check constraints where appropriate
* indexes
* cascade behavior
* delete behavior
* update behavior

Identify business rules enforced only in PHP but not protected at the database level.

For critical invariants ask:

> "Could two application instances violate this rule simultaneously?"

If yes, determine whether a database-level constraint is required.

---

# 22. UNIQUE CONSTRAINT AUDIT

Search for logical uniqueness requirements such as:

```text
email
phone
booking code
idempotency key
external transaction ID
payment reference
slug
username
role assignment
permission assignment
```

Verify uniqueness at the database level where required.

Do not rely only on:

```php
Rule::unique()
```

because validation can race.

---

# 23. FOREIGN KEY / DELETE AUDIT

For every foreign key determine whether deletion should:

```text
CASCADE
RESTRICT
SET NULL
soft delete
```

Test destructive operations.

Attempt to delete parent records with dependent records.

Verify no orphan records are created.

---

# 24. TRANSACTION FAILURE AUDIT

For every critical mutation:

1. identify transaction boundary
2. identify every database write
3. identify every external side effect
4. intentionally force failure between operations

Examples:

```text
booking created
→ payment record fails

booking created
→ nightly prices fail

booking status updated
→ notification fails

payment updated
→ audit log fails
```

Determine whether failure results in:

```text
complete rollback
partial state
recoverable state
irrecoverable state
```

Critical database invariants must remain intact.

---

# 25. EXCEPTION HANDLING AUDIT

Search:

```php
catch
throw
report
render
```

Verify that exceptions are classified correctly.

Public API must never expose:

```text
SQLSTATE
SQL query
filesystem path
stack trace
vendor path
environment variable
database credentials
internal class names
private IDs
```

Test:

```text
404
401
403
409
422
429
500
database failure
external service failure
unexpected exception
```

Verify the error envelope remains stable.

---

# 26. ERROR RESPONSE SIDE-CHANNEL AUDIT

Compare responses for:

```text
existing email
non-existing email
existing booking
non-existing booking
authorized resource
unauthorized resource
deleted resource
```

Look for differences in:

* status
* message
* response size
* response timing
* headers

Only expose distinctions intentionally required by the public API.

---

# 27. API RESOURCE / DATA LEAKAGE AUDIT

Inspect every:

```text
JsonResource
ResourceCollection
DTO
Transformer
Model serialization
toArray()
```

Search for sensitive fields:

```text
password
password_hash
remember_token
2fa_secret
recovery_codes
internal_notes
admin_notes
private_path
storage_path
payment secrets
webhook secrets
internal IDs
PII
```

Test API responses for accidental leakage.

Do not assume `$hidden` alone is sufficient.

Verify the actual JSON response.

---

# 28. LOGGING / PII AUDIT

Search:

```php
Log::
logger()
info()
warning()
error()
debug()
dump()
dd()
```

Also inspect:

```text
storage/logs
exception reports
request logging
queue logging
webhook logging
authentication logging
```

Ensure logs do not contain:

```text
passwords
tokens
session IDs
2FA secrets
recovery codes
payment secrets
full authorization headers
private documents
sensitive PII
```

Inspect exception context.

Test intentionally failing requests and inspect the resulting log.

---

# 29. REQUEST-ID / CORRELATION-ID AUDIT

Verify:

```text
incoming X-Request-ID
generated request ID
response propagation
logs
exceptions
database audit records where applicable
```

Test malicious IDs:

```text
empty
huge
invalid characters
newline
control characters
structured injection
```

The request ID must not become a log-injection vector.

Verify normalization and length limits.

---

# 30. RATE LIMITING AUDIT

Enumerate all sensitive endpoints:

```text
login
password reset
2FA
OTP
recovery
booking
lead submission
search
uploads
webhooks
admin mutations
```

For each determine:

```text
rate limiter
key
window
limit
response
headers
proxy awareness
```

Attack using:

```text
same IP
different IP
same account
different accounts
same token
different tokens
X-Forwarded-For manipulation
```

Verify that proxy headers cannot trivially bypass rate limits.

---

# 31. TRUSTED PROXY AUDIT

Inspect:

```php
trustProxies
X-Forwarded-For
X-Real-IP
Forwarded
```

Determine the actual deployment topology.

Do NOT blindly trust arbitrary proxy headers in direct-to-Laravel deployments.

Verify:

```text
client IP
rate limiting
audit logs
security logs
```

remain correct.

Document the expected production proxy chain.

---

# 32. CORS AUDIT

Inspect CORS configuration.

Verify:

* allowed origins
* methods
* headers
* credentials
* wildcard usage
* production origins
* development origins

Test:

```text
unknown origin
null origin
malicious subdomain
http origin
https origin
```

Do not use:

```text
*
```

with credentials unless explicitly justified and safe.

---

# 33. SECURITY HEADERS AUDIT

Inspect actual HTTP responses.

Verify appropriate deployment headers such as:

```text
Strict-Transport-Security
Content-Security-Policy where applicable
X-Content-Type-Options
Referrer-Policy
Permissions-Policy
Cache-Control for sensitive responses
```

Do not blindly add headers without understanding whether the API/frontend architecture requires them.

Document what belongs to:

```text
Laravel
Reverse Proxy
Cloudflare
Next.js
```

---

# 34. CACHE SECURITY AUDIT

Inspect all caching.

Verify that private/user-specific data is not accidentally cached publicly.

Test:

```text
User A request
User B request
```

for any endpoint involving private data.

Inspect:

```text
Cache-Control
ETag
Vary
application cache keys
route cache
query cache
```

Look for cross-user cache poisoning or leakage.

---

# 35. FILE UPLOAD SECURITY AUDIT

If uploads exist, inspect:

* validation
* MIME detection
* extension validation
* size limits
* storage location
* filename generation
* public/private storage
* executable file prevention
* path traversal protection
* authorization
* download authorization

Attempt:

```text
.php
.phtml
.phar
.svg
.html
.js
double extension
null byte
path traversal
very large file
invalid MIME
forged MIME
```

Do not rely solely on client-provided MIME type.

---

# 36. WEBHOOK SECURITY AUDIT

For every webhook:

Verify:

```text
signature
timestamp
replay protection
raw request body verification
constant-time comparison
idempotency
event uniqueness
authorization
logging redaction
```

Test:

```text
missing signature
wrong signature
modified body
modified header
replay
duplicate event
old timestamp
malformed payload
```

If the current implementation uses a placeholder/sandbox signature mechanism, mark it:

```text
BLOCKER — NOT PRODUCTION READY
```

Do not falsely mark it secure.

---

# 37. WEBHOOK CONCURRENCY

Send the same webhook event concurrently.

Verify:

```text
one logical mutation
no duplicate payment
no duplicate booking state transition
no duplicate refund
no inconsistent state
```

Database uniqueness should protect against duplicate delivery where appropriate.

---

# 38. PAYMENT STATE INTEGRITY

Even before Phase 6 is implemented, inspect current payment-related code.

Determine whether clients can influence:

```text
payment status
amount
currency
transaction ID
provider status
refund state
```

Attempt direct manipulation through APIs.

Any client-controlled financial state must be treated as a critical finding.

---

# 39. CSRF / CORS / AUTH MODEL REVIEW

Determine whether the frontend authentication model is:

```text
Bearer token
Sanctum SPA
cookie session
hybrid
```

Do not mix assumptions.

Document:

```text
browser request
Next.js request
mobile request
server-to-server request
webhook request
```

and the security mechanism expected for each.

---

# 40. API CONTENT NEGOTIATION AUDIT

Test requests with:

```text
application/json
application/x-www-form-urlencoded
multipart/form-data
missing Content-Type
invalid JSON
duplicate JSON keys
```

Verify the same authorization and validation guarantees remain enforced.

Do not allow an alternate content type to bypass validation.

---

# 41. HTTP METHOD OVERRIDE AUDIT

Inspect whether Laravel method spoofing is enabled/used.

Test whether:

```text
POST + _method=DELETE
POST + _method=PUT
```

can bypass security middleware or route-specific authorization.

Ensure authorization is based on the effective route/method.

---

# 42. MASS REQUEST / REPLAY AUDIT

For every state-changing endpoint test:

```text
rapid repeated requests
same request body
slightly modified request body
same idempotency key
different idempotency keys
expired authentication
revoked authentication
```

Observe:

```text
database state
logs
notifications
emails
side effects
```

---

# 43. QUEUE / ASYNC SAFETY REVIEW

Even if queues are not yet production-enabled, inspect code that dispatches jobs/events.

Verify:

* serialization safety
* retry behavior
* duplicate execution
* idempotency
* transaction timing
* after-commit behavior
* stale model assumptions

Look for:

```text
dispatch() inside transaction
job reads uncommitted state
duplicate job side effect
job assumes model still exists
```

Mark risks for Phase 10 where appropriate.

---

# 44. EVENT / AFTER-COMMIT AUDIT

Inspect:

```text
events
listeners
dispatches
ShouldQueue
afterCommit
```

Verify that external side effects do not occur before the database transaction commits when correctness requires after-commit execution.

Test rollback scenarios.

---

# 45. OBSERVABILITY AUDIT

Verify that critical operations produce enough information to investigate failures without leaking sensitive data.

For important operations capture where appropriate:

```text
request_id
actor_id
resource_id
operation
result
duration
failure category
```

Do NOT log:

```text
password
tokens
secrets
full payment credentials
private documents
```

---

# 46. PERFORMANCE ADVERSARIAL AUDIT

This is not a full Phase 9 load test.

The goal is to identify obvious architectural performance failures.

Inspect:

```text
N+1 queries
unbounded relationships
large eager loads
missing indexes
repeated queries
query loops
expensive serialization
large API responses
unbounded pagination
```

Use Laravel query logging or Telescope-equivalent tooling if available.

For important endpoints record:

```text
query count
query duration
response time
response size
```

Do not optimize based on intuition alone.

---

# 47. N+1 DETECTION

For:

```text
stays
properties
experiences
events
bookings
admin listings
```

measure representative endpoints.

Identify:

```text
1 + N
N + N
relationship loops
lazy-loaded nested relationships
```

Create regression tests for confirmed N+1 problems where practical.

---

# 48. DATABASE INDEX AUDIT

Inspect real query patterns.

For important queries verify indexes support:

```text
WHERE
JOIN
ORDER BY
UNIQUE
foreign keys
date ranges
status filters
ownership filters
lookup codes
```

Do not add indexes blindly.

Document:

```text
query
current index
expected execution pattern
missing index
reason
```

This phase may identify indexes for Phase 8.

Do not perform broad schema optimization without evidence.

---

# 49. SQLITE VS POSTGRESQL COMPATIBILITY AUDIT

The development database is SQLite and production is PostgreSQL.

Identify code relying on SQLite-specific behavior.

Search for:

```text
SQLite-specific SQL
boolean assumptions
date behavior
JSON behavior
NULL behavior
case sensitivity
foreign-key behavior
unique behavior
locking behavior
```

Compare important migrations and queries against PostgreSQL expectations.

Do not declare production-ready PostgreSQL compatibility without actually testing against PostgreSQL where practical.

---

# 50. TESTING INFRASTRUCTURE AUDIT

Inspect the test suite itself.

Determine:

```text
unit tests
feature tests
integration tests
authorization tests
database tests
concurrency tests
API tests
security tests
```

Look for tests that:

* mock too much
* never touch the database
* assert only status codes
* fail to verify database state
* don't test authorization
* don't test alternate users
* don't test concurrent behavior
* don't test failure paths

A test that only verifies:

```text
$response->assertStatus(200)
```

is not sufficient for a critical security operation.

---

# 51. TEST QUALITY AUDIT

For each major security property ask:

```text
What exact invariant is being protected?
What test proves it?
Could the test pass while the vulnerability still exists?
Does the test exercise the real route?
Does it exercise the real middleware?
Does it exercise the real database?
```

Where tests are weak, improve them.

---

# 52. NEGATIVE TEST REQUIREMENT

Every critical endpoint should have negative tests covering at minimum:

```text
unauthenticated
unauthorized
invalid input
missing input
tampered input
wrong owner
wrong role
wrong state
duplicate request
concurrent request
database failure
unexpected exception
```

Not every category applies to every endpoint, but the audit must explicitly classify applicability.

---

# 53. SECURITY PROPERTY MATRIX

Create:

```text
docs/hardening/PHASE_5_5_SECURITY_MATRIX.md
```

Use this structure:

| Security Property | Attack                | Expected Result     | Actual Result | Evidence | Status |
| ----------------- | --------------------- | ------------------- | ------------- | -------- | ------ |
| Authentication    | Invalid credentials   | Generic 401         | ...           | Test/log | PASS   |
| Authorization     | Other user's booking  | 403/404             | ...           | Test     | PASS   |
| IDOR              | Modified ID           | Denied              | ...           | Test     | PASS   |
| Mass Assignment   | role=admin            | Ignored/Denied      | ...           | Test     | PASS   |
| Idempotency       | Same key concurrently | One mutation        | ...           | Test     | PASS   |
| Pricing           | total=1               | Server recalculates | ...           | Test     | PASS   |
| Booking race      | Same inventory        | No double booking   | ...           | Test     | PASS   |
| Webhook           | Invalid signature     | 401/403             | ...           | Test     | PASS   |

Do not mark a control PASS without evidence.

---

# 54. FINDING SEVERITY

Every finding must receive one of:

## P0 — Critical

Examples:

* authentication bypass
* authorization bypass
* arbitrary account takeover
* financial manipulation
* double booking causing financial/data corruption
* forged webhook accepted
* secrets exposed
* remote code execution
* critical data exposure

P0 blocks production.

---

## P1 — High

Examples:

* serious IDOR
* privilege escalation
* payment integrity weakness
* sensitive PII leakage
* race condition affecting business integrity
* authentication bypass under realistic conditions
* critical missing security boundary

P1 blocks production unless explicitly accepted by the project owner.

---

## P2 — Medium

Examples:

* limited information disclosure
* incomplete rate limiting
* weak validation with limited impact
* non-critical authorization inconsistency
* moderate performance vulnerability

---

## P3 — Low

Examples:

* hardening opportunity
* minor logging issue
* minor consistency issue
* documentation gap

---

# 55. FINDING FORMAT

Every confirmed vulnerability must be documented as:

```markdown
## FINDING-XXX — <Title>

Severity:
P0/P1/P2/P3

Category:
Authentication / Authorization / IDOR / Database / API / etc.

Affected Component:
<file/class/route>

Attack Scenario:
<exact scenario>

Precondition:
<required conditions>

Steps to Reproduce:
1.
2.
3.
4.

Expected:
<secure behavior>

Actual:
<actual behavior>

Security Impact:
<what attacker can achieve>

Business Impact:
<impact on GouNow>

Root Cause:
<technical root cause>

Evidence:
<test/log/query/output>

Recommended Fix:
<minimal safe fix>

Regression Test:
<test that must be added>

Production Blocking:
YES / NO
```

---

# 56. FIX POLICY

Do NOT immediately fix every finding.

First:

1. document it
2. reproduce it
3. determine severity
4. determine root cause
5. determine affected surface
6. determine whether it is real
7. determine the smallest safe fix

Then fix:

```text
P0
P1
security-critical P2
```

unless the finding requires a later architectural phase.

Do not perform unrelated refactoring while fixing vulnerabilities.

---

# 57. AFTER EACH FIX

For every fix:

1. reproduce vulnerability before fix
2. implement minimal fix
3. rerun reproduction
4. verify exploit no longer works
5. add regression test
6. run related tests
7. run full test suite
8. run static analysis
9. run formatter
10. inspect git diff
11. verify no unrelated changes

Required commands where applicable:

```bash
php artisan test --env=testing
./vendor/bin/pint --test
./vendor/bin/phpstan analyse app routes --memory-limit=1G
composer audit
```

Also run the external API suite:

```bash
python3 api_test_suite.py
```

---

# 58. DATABASE CLEANUP AFTER TESTING

Adversarial testing may create:

* users
* bookings
* payments
* idempotency keys
* logs
* jobs
* failed jobs

Ensure test data does not pollute development/production data.

Never run destructive cleanup against production.

Clearly separate:

```text
testing
development
production
```

---

# 59. GIT SAFETY

Before changes:

```bash
git status --short
```

After changes:

```bash
git diff --stat
git diff
git status --short
```

Do not overwrite unrelated user work.

Do not reset the repository.

Do not use destructive Git commands.

---

# 60. REQUIRED ADVERSARIAL TEST CATEGORIES

The final audit must explicitly report results for:

```text
[ ] Authentication
[ ] Session/token security
[ ] Password reset
[ ] 2FA
[ ] RBAC
[ ] Scope enforcement
[ ] State authorization
[ ] IDOR/BOLA
[ ] Mass assignment
[ ] Input validation
[ ] SQL injection
[ ] Query safety
[ ] Rate limiting
[ ] Request ID
[ ] CORS
[ ] Security headers
[ ] API error leakage
[ ] Resource leakage
[ ] Logging/PII
[ ] File upload
[ ] Webhooks
[ ] Payment integrity
[ ] Pricing integrity
[ ] Booking state machine
[ ] Booking concurrency
[ ] Idempotency
[ ] Database constraints
[ ] Transactions
[ ] Rollbacks
[ ] Events
[ ] Queue safety
[ ] Cache isolation
[ ] N+1
[ ] Pagination
[ ] Database indexes
[ ] SQLite/PostgreSQL compatibility
[ ] Test quality
[ ] Production configuration
```

Every item must be:

```text
PASS
FAIL
PARTIAL
NOT APPLICABLE
DEFERRED TO PHASE X
```

Never silently skip a category.

---

# 61. PRODUCTION CONFIGURATION REVIEW

Inspect `.env.example`, configuration files, and deployment assumptions.

Look for unsafe production defaults:

```text
APP_DEBUG=true
weak APP_KEY assumptions
insecure session configuration
unsafe cookie configuration
broad CORS
unrestricted filesystem
development credentials
test routes
debug routes
profiler
exposed health/debug information
```

Never expose actual secrets in the audit document.

Use:

```text
REDACTED
```

---

# 62. SECRET SCANNING

Search the repository for likely secrets:

```text
API keys
tokens
passwords
private keys
JWT secrets
webhook secrets
AWS keys
database credentials
OAuth secrets
```

Check:

```text
.env
.env.example
config
tests
fixtures
logs
documentation
Git-tracked files
```

Never print discovered secrets into the report.

If found:

```text
SECRET EXPOSURE — P0/P1
```

depending on exposure and validity.

---

# 63. ROUTE / CONTROLLER / POLICY CONSISTENCY

For every protected controller action verify:

```text
Route middleware
Controller authorization
Policy
FormRequest authorization
Service-level authorization
```

Avoid relying on one layer where the operation can be reached through another path.

The authorization model must be consistent.

---

# 64. SERVICE-LEVEL AUTHORIZATION REVIEW

Important business actions must not become insecure if called from another controller, job, command, or internal code path.

For every critical Action/Service ask:

> "Does this operation rely entirely on the HTTP controller to be secure?"

If yes, determine whether the business invariant itself should be enforced deeper.

Do not blindly duplicate authorization everywhere.

Separate:

```text
authentication
authorization
business invariant
```

---

# 65. COMMAND / JOB / SCHEDULE SECURITY

Inspect:

```text
app/Console
routes/console.php
scheduled commands
jobs
listeners
queued actions
```

Verify that privileged commands cannot be triggered through untrusted input.

Inspect the changes already made to:

```text
console.php
```

because this file was modified during previous hardening work.

---

# 66. ADMIN SURFACE AUDIT

Treat the admin area as a separate attack surface.

Verify:

```text
admin authentication
admin authorization
role hierarchy
scope restrictions
mass assignment
bulk actions
destructive actions
exports
reports
uploads
CMS
user management
permissions management
payment/refund operations
```

Test bulk operations carefully.

A secure single-record endpoint does not guarantee a secure bulk endpoint.

---

# 67. BULK OPERATION AUDIT

Search for:

```text
bulk
batch
mass
sync
deleteMany
updateMany
upsert
```

Verify:

* authorization for every affected record
* scope filtering
* transaction behavior
* maximum batch size
* partial failure handling
* audit logging
* idempotency

Never authorize a bulk operation merely because the user can access one record.

---

# 68. DATA EXPORT AUDIT

If exports exist:

Verify:

* authorization
* scope
* pagination/chunking
* sensitive fields
* rate limiting
* asynchronous processing if needed
* audit logging

An export endpoint can bypass normal API field restrictions.

---

# 69. SEARCH / FILTER SECURITY

Inspect all search endpoints.

Verify that filters cannot bypass authorization.

Bad pattern:

```text
query all bookings
→ filter by customer_id
```

when authorization should be:

```text
query only records the actor is allowed to see
→ then apply user filters
```

Authorization filtering must occur at the correct database/query boundary.

---

# 70. TENANT / SCOPE ISOLATION

If any domain uses:

```text
property ownership
organization
branch
admin scope
location
assigned resources
```

verify scope isolation.

Attempt:

```text
scope A → scope B
scope A → global resource
global admin → scoped resource
scoped admin → global mutation
```

Document the exact scope rules.

---

# 71. STATE + AUTHORIZATION COMBINATION

Authorization must not depend only on:

```text
role
```

or only on:

```text
ownership
```

Test state-dependent authorization.

Examples:

```text
owner + pending
owner + paid
owner + cancelled
admin + locked
staff + completed
```

The policy must reflect actual domain state.

---

# 72. DATA CONSISTENCY AUDIT

After every adversarial mutation test, verify database invariants.

Check:

```text
booking
customer
property
availability
nightly prices
payments
discount usage
notifications
audit records
```

No orphan or contradictory state should remain.

---

# 73. FAILURE INJECTION

Where practical, intentionally simulate:

```text
database exception
timeout
deadlock
duplicate key
validation failure
external API failure
serialization failure
unexpected exception
```

Observe system behavior.

The objective is to ensure failure does not create invalid business state.

---

# 74. DEADLOCK / LOCK ORDER REVIEW

Inspect transactions containing:

```text
lockForUpdate()
```

Determine:

* tables locked
* order of locks
* possible circular locking
* transaction duration
* external calls inside transaction

Avoid:

```text
database transaction
→ HTTP request
→ wait
→ database operation
```

where possible.

---

# 75. LONG TRANSACTION AUDIT

Identify transactions that perform:

* API calls
* file operations
* email sending
* heavy calculations
* large queries
* unnecessary serialization

Transactions should remain focused on atomic database state changes.

---

# 76. SECURITY BOUNDARY MAP

Create:

```text
docs/hardening/PHASE_5_5_SECURITY_BOUNDARY_MAP.md
```

Document:

```text
Internet
 ↓
Reverse Proxy
 ↓
Laravel
 ↓
Middleware
 ↓
Authentication
 ↓
Authorization
 ↓
Validation
 ↓
Application Actions
 ↓
Database
 ↓
External Providers
```

For each boundary identify:

```text
trust level
input
output
validation
authentication
authorization
logging
failure behavior
```

---

# 77. FINAL ADVERSARIAL REVIEW

After all automated tests and manual inspections, perform one final pass asking:

### "If I were trying to steal another customer's booking, what endpoint would I attack?"

### "If I wanted to change a booking price, what would I modify?"

### "If I wanted to create two bookings for one inventory slot, what race would I exploit?"

### "If I wanted to become an admin, where would I inject role/permission data?"

### "If I wanted to replay a payment webhook, what happens?"

### "If I wanted to discover whether an email exists, what response/timing difference could I use?"

### "If I wanted to extract private data, which export/admin/resource endpoint would I target?"

### "If I wanted to bypass rate limiting, which proxy/header/token behavior would I exploit?"

### "If I wanted to crash the API, which endpoint accepts the most expensive input?"

### "If I wanted to poison a cache, which cache key or HTTP header would I manipulate?"

### "If I wanted to exploit SQLite/production differences, which query or constraint would I target?"

Document the answers.

---

# 78. REQUIRED DELIVERABLES

At the end of Phase 5.5 create/update:

```text
docs/hardening/PHASE_5_5_ATTACK_SURFACE.md
docs/hardening/PHASE_5_5_SECURITY_MATRIX.md
docs/hardening/PHASE_5_5_FINDINGS.md
docs/hardening/PHASE_5_5_SECURITY_BOUNDARY_MAP.md
docs/hardening/LEDGER.md
docs/hardening/BACKLOG.md
```

If test files were added, organize them under the existing test structure.

Use clear names such as:

```text
AdversarialAuthorizationTest
AdversarialIdorTest
AdversarialIdempotencyTest
AdversarialConcurrencyTest
AdversarialPricingTest
AdversarialAuthenticationTest
AdversarialWebhookTest
AdversarialDataLeakageTest
AdversarialInputValidationTest
```

Do not duplicate tests unnecessarily.

---

# 79. FINAL REPORT FORMAT

Create:

```text
docs/hardening/PHASE_5_5_FINAL_REPORT.md
```

Use this structure:

```markdown
# Phase 5.5 — Adversarial Production Audit

## Executive Summary

Audit Date:
Commit/Revision:
Environment:
Database:
Laravel Version:
PHP Version:

## Scope

Phases audited:
0
1
2
3
4
5

## Test Summary

Total adversarial tests:
Passed:
Failed:
Blocked:
Skipped:
Deferred:

## Security Summary

P0:
P1:
P2:
P3:

## Critical Findings

...

## High Findings

...

## Medium Findings

...

## Low Findings

...

## Fixed During Phase 5.5

...

## Deferred

Finding:
Reason:
Target Phase:

## Architecture Findings

...

## Database Findings

...

## API Findings

...

## Authentication Findings

...

## Authorization Findings

...

## Concurrency Findings

...

## Performance Findings

...

## Observability Findings

...

## Test Quality Findings

...

## Production Blockers

...

## Required Before Phase 6

...

## Required Before Production

...

## Final Gate

PASS / CONDITIONAL PASS / FAIL
```

---

# 80. FINAL GATE RULES

The final gate is NOT allowed to be:

```text
PASS
```

merely because:

```text
PHPStan passes
Pint passes
PHPUnit passes
API tests pass
Composer audit passes
```

The final gate must consider:

```text
security
authorization
data integrity
concurrency
financial integrity
privacy
failure behavior
production configuration
database correctness
test quality
```

### PASS

Only if:

* no P0
* no unresolved P1
* no known critical security bypass
* no known financial integrity vulnerability
* no known double-booking vulnerability
* no known authentication bypass
* no known authorization bypass
* critical tests pass
* regression tests exist for fixed vulnerabilities

### CONDITIONAL PASS

Only if:

* no P0
* remaining findings are understood
* each deferred item has an owner and target phase
* none of the deferred items creates an unacceptable production risk

### FAIL

If:

* any P0 exists
* critical authorization bypass exists
* critical authentication bypass exists
* financial integrity is not trustworthy
* booking concurrency can corrupt inventory
* forged webhooks can mutate financial state
* secrets are exposed
* critical production assumptions are unverified

---

# 81. IMPORTANT — DO NOT HIDE UNCERTAINTY

If you cannot verify something, write:

```text
UNVERIFIED
```

Do NOT write:

```text
PASS
```

If a test cannot be executed because infrastructure is missing, write:

```text
BLOCKED — REQUIRES ENVIRONMENT
```

If something belongs to a later phase:

```text
DEFERRED — PHASE X
```

Do not confuse:

```text
not tested
```

with:

```text
secure
```

---

# 82. IMPORTANT — DO NOT OVER-ENGINEER THE FIX

When fixing findings:

Prefer:

```text
existing architecture
+
smallest correct change
+
strong regression test
```

over:

```text
new framework
+
new infrastructure
+
new abstraction
+
large rewrite
```

The goal is a backend that is:

```text
secure
predictable
maintainable
testable
observable
scalable
```

without unnecessary complexity.

---

# 83. REQUIRED FINAL COMMANDS

Before declaring Phase 5.5 complete, run:

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
python3 api_test_suite.py
```

Also run any newly created adversarial/security test suites.

If PostgreSQL test infrastructure exists:

```bash
php artisan test --env=testing
```

against PostgreSQL as well.

Record exact results.

---

# 84. FINAL RESPONSE FROM THE CODING AGENT

At the end of the work, DO NOT respond with a generic:

> "Phase 5.5 completed successfully."

Instead report:

```text
PHASE 5.5 STATUS

Repository:
<path>

Commit/Base Revision:
<revision>

Audit Scope:
Phases 0–5

Adversarial Tests:
X passed
Y failed
Z blocked
N deferred

P0 Findings:
X

P1 Findings:
X

P2 Findings:
X

P3 Findings:
X

Fixed:
X

Deferred:
X

Production Blockers:
<list>

Security Improvements:
<list>

Architecture Improvements:
<list>

Database Improvements:
<list>

Remaining Risks:
<list>

Required Phase 6 Preconditions:
<list>

Final Gate:
PASS / CONDITIONAL PASS / FAIL

Evidence:
<files/tests/commands>
```

Do not hide failures.

Do not downgrade severity merely to obtain PASS.

Do not claim production readiness unless the evidence supports it.

---

# 85. MOST IMPORTANT PRINCIPLE

The purpose of Phase 5.5 is not to make the project look secure.

The purpose is to discover whether it is secure.

A failed adversarial test is valuable.

A discovered vulnerability is valuable.

A documented uncertainty is valuable.

A blocked verification is valuable.

The worst outcome is:

```text
Everything passed
```

when the tests simply failed to attack the system correctly.

Therefore:

> **Assume nothing. Verify everything. Attack every trust boundary. Test every critical invariant. Prove security with evidence.**
