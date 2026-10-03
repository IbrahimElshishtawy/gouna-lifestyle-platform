# GouNow Hardening Ledger

## Current State
- **Current phase**: 5.5 (Adversarial Production Audit) — COMPLETED
- **Next phase**: 6 (Payment, Webhooks & Financial Hardening)
- **Last completed task ID**: P5.5-T07 (DONE)
- **Branch**: `hardening/phase-5.5`
- **Test status**: 136/136 tests PASS (608 assertions). 26/26 Adversarial Security tests PASS across 9 dedicated attack suites. Pint style check 100% PASS. Composer audit 0 vulnerabilities.
- **Overall status**: PHASE 5.5 CONDITIONAL PASS SIGNED-OFF

## Task Completion Table (Phase 0 — G17 Discipline)
| Task ID | Status | Evidence | Reason if not DONE |
|---|---|---|---|
| P0-T01 | DONE | `hardening/phase-0` branch created; `docs/hardening/` structure initialized. | N/A |
| P0-T02 | DONE | G24 commands executed: 56 pass / 1 pre-existing fail; Pint 48 files style flagged; PHPStan 1 console.php error; Composer audit 0 vulnerabilities. | N/A |
| P0-T03 | DONE | Snapshots saved: `routes_phase0.json`, `migrate_status_phase0.txt`, `db_show_phase0.txt`, `critical_tables_schema.txt`, `composer_lock_hash.txt`. | N/A |
| P0-T04 | DONE | `.env.example` vs `config/*` audit completed; 72 variables missing cataloged in `BACKLOG.md`; zero hardcoded secrets verified. | N/A |
| P0-T05 | DONE | Docker container `gounow_postgres_test` running on port 5432; `phpunit.postgres.xml`, `.env.testing`, `.env.testing.postgres` created. | N/A |
| P0-T06 | DONE | `tests/Feature/BaselineCharacterizationTest.php` created with 6 passing tests under `@group baseline`. | N/A |
| P0-T07 | DONE | 20-iteration benchmark executed across 10 critical endpoints; results recorded in `docs/hardening/snapshots/perf_baseline.md`. | N/A |
| P0-T08 | DONE | `Model::shouldBeStrict()` trial executed; 3 lazy-loading violations identified on Event, Experience, and Property index views; logged in `BACKLOG.md` for Phase 9. | N/A |
| P0-T09 | DONE | Standards S1–S5 read and summarized in 10 lines below. | N/A |

## Task Completion Table (Phase 1 — G17 Discipline)
| Task ID | Status | Evidence | Reason if not DONE |
|---|---|---|---|
| P1-T01 | DONE | `docs/hardening/ROUTE_INVENTORY.md` created with all 95 routes mapped and verified. | N/A |
| P1-T02 | DONE | 5 hybrid endpoints identified with `file:line` locations and documented in `FINDINGS.md`. | N/A |
| P1-T03 | DONE | Controllers audited: 3 fat, 4 mixed, 2 thin; verified 0 mass assignment `$request->all()` calls. | N/A |
| P1-T04 | DONE | FormRequests vs inline validation audited; documented in `ARCHITECTURE_AUDIT.md`. | N/A |
| P1-T05 | DONE | Model audit: zero `$guarded = []`; all 22 models use explicit `$fillable`. | N/A |
| P1-T06 | DONE | Services/Actions audit: `CreateBookingAction` transaction analyzed; zero circular dependencies. | N/A |
| P1-T07 | DONE | Auth/AuthZ inventory: identified coarse `admin` middleware and absence of model policies. | N/A |
| P1-T08 | DONE | Database inventory: 51 tables classified across 6 business domains; indexed FK gaps logged. | N/A |
| P1-T09 | DONE | External integrations audited (CardGateway, PayPalGateway, file storage, email notifications). | N/A |
| P1-T10 | DONE | Synchronous side effects audited; email/notifications identified for queue offloading. | N/A |
| P1-T11 | DONE | Test coverage audited: 56 pass, 1 pre-existing fail, 6 characterization tests established. | N/A |
| P1-T12 | DONE | Static performance smells audited: unpaginated dashboard queries and lazy loading in views. | N/A |
| P1-T13 | DONE | Next.js integration surface audited via `frontend/src/lib/api/client.ts`. | N/A |
| P1-T14 | DONE | Flow diagrams created in `docs/hardening/CURRENT_ARCHITECTURE.md` (6 mermaid diagrams). | N/A |
| P1-T15 | DONE | Target architecture and layer boundaries specified in `docs/hardening/TARGET_ARCHITECTURE.md`. | N/A |
| P1-T16 | DONE | 13 findings categorized with severity and remediation phase in `docs/hardening/FINDINGS.md`. | N/A |
| P1-T17 | DONE | Phased route migration plan documented in `docs/hardening/ROUTE_BOUNDARY_PLAN.md`. | N/A |

## Task Completion Table (Phase 2 — G17 Discipline)
| Task ID | Status | Evidence | Reason if not DONE |
|---|---|---|---|
| P2-T01 | DONE | ADR-003 documented in `docs/hardening/adr/ADR-003-AUTH-MODE.md` (Dual-mode SPA cookie + Bearer token). | N/A |
| P2-T02 | DONE | `routes/api/v1/{public,customer,admin,webhooks}.php` registered and orchestrated; `ROUTE_MIGRATION_MAP.md` created. | N/A |
| P2-T03 | DONE | S1 middleware pipeline (AssignRequestId, ForceJsonResponse, EnsureAccountActive, EnsureTwoFactorVerified, VerifyWebhookSignature, EnsureIdempotency) applied with priority order in `bootstrap/app.php`. | N/A |
| P2-T04 | DONE | Universal error envelope configured in `bootstrap/app.php` with zero stack/SQL leakage. Documented in `ERROR_STANDARD.md`. | N/A |
| P2-T05 | DONE | FormRequests implemented: `CalculateQuoteRequest`, `CreateBookingRequest`, `CardPaymentRequest`, `StoreLeadRequest`, `StorePropertyRequest`, `UpdatePropertyRequest`. Mass assignment prohibited fields tested. | N/A |
| P2-T06 | DONE | Thin Controllers + Shared Actions: `StayController`, `CheckoutController`, `ExperienceController`, `EventController`, `LeadController`, `AuthController` share domain actions with Blade controllers. | N/A |
| P2-T07 | DONE | Standard S2 API Resources created: `PropertyResource`, `PropertyCollection`, `BookingResource`, `QuoteResource`, `ExperienceResource`, `EventResource`. Integer cents & currency enforced. | N/A |
| P2-T08 | DONE | Listing standard implemented via `AppliesListingStandard` trait: capped pagination (max 100), sort whitelist, filter whitelist. | N/A |
| P2-T09 | DONE | Idempotency middleware `EnsureIdempotency` active on checkout/booking mutations; migration `create_idempotency_keys_table` created. Replay and conflict tests verified. | N/A |
| P2-T10 | DONE | `config/cors.php` hardened with explicit origins, allowed headers, exposed headers, and credentials support. | N/A |
| P2-T11 | DONE | Standard S1 named rate limiters configured in `AppServiceProvider`: `api` (60/min), `auth` (5/min per IP+email), `booking` (10/min), `payment` (5/min), `webhooks` (120/min). | N/A |
| P2-T12 | DONE | Public vs authenticated data audited: internal notes and passwords hidden from public responses. | N/A |
| P2-T13 | DONE | Contract documentation created: `API_CONTRACT.md`, `AUTHENTICATION_FLOW.md`, `ERROR_STANDARD.md`, `NEXTJS_INTEGRATION.md`, `ROUTE_MIGRATION_MAP.md`. | N/A |
| P2-T14 | DONE | 10 feature tests in `backend/tests/Feature/ApiV1HardeningTest.php` passing 100% (59 assertions); 6 baseline characterization tests green. | N/A |

## Task Completion Table (Phase 3 — G17 Discipline)
| Task ID | Status | Evidence | Reason if not DONE |
|---|---|---|---|
| P3-T01 | DONE | Permission catalog analyzed across 7 roles and 24 canonical permissions; canonical aliases (`resource.action`) mapped in `PermissionResolver`. | N/A |
| P3-T02 | DONE | `docs/hardening/AUTHORIZATION_MATRIX.md` created mapping all admin routes, scopes, role permissions, and G22 security answers. | N/A |
| P3-T03 | DONE | `App\Services\Auth\PermissionResolver` implemented with 2-query eager loading, request-level caching, explicit deny support, and zero N+1 verified. | N/A |
| P3-T04 | DONE | 12 Model Policies implemented in `app/Policies/` with 3-layer authorization (permission + scope + state); zero fixed `true` returns. Registered in `AppServiceProvider`. | N/A |
| P3-T05 | DONE | Granular `can:...` permission middleware enforced on all admin route groups in `routes/web.php` and `routes/api/v1/`. | N/A |
| P3-T06 | DONE | Query scoping implemented via `scopeVisibleTo(?User $user)` on `Property`, `Booking`, `Customer`, `PaymentTransaction`, and `Lead`. | N/A |
| P3-T07 | DONE | `->scopeBindings()` applied on nested media routes; 404 returned on parent-child mismatch, verified in tests. | N/A |
| P3-T08 | DONE | Admin user management rules implemented in `UserPolicy`: prevents self-escalation and disallows deleting the last active super-admin. | N/A |
| P3-T09 | DONE | Mass assignment defense on authz fields verified: `role_ids` and `is_admin` cannot be overwritten by client requests. | N/A |
| P3-T10 | DONE | 403 vs 404 leakage policy enforced: 404 returned on querying someone else's booking; 403 on unauthorized admin access. | N/A |
| P3-T11 | DONE | `GET /api/v1/me/abilities` implemented returning sanitized roles, permissions, and scopes for Next.js client rendering. | N/A |
| P3-T12 | DONE | `Tests\Feature\RouteInventorySecurityTest` created and passing; programmatically asserts zero unprotected admin routes. | N/A |
| P3-T13 | DONE | `Tests\Feature\AuthorizationSecurityTest` created with 11 privilege escalation scenarios passing 100%. | N/A |
| P3-T14 | DONE | `RoleAndPermissionSeeder` updated with `updateOrCreate`, verified completely idempotent across repeated runs. | N/A |

## Task Completion Table (Phase 4 — G17 Discipline)
| Task ID | Status | Evidence | Reason if not DONE |
|---|---|---|---|
| P4-T01 | DONE | `docs/hardening/AUTHENTICATION_SECURITY.md` created; security audit matrix across Web/API complete. | N/A |
| P4-T02 | DONE | Timing equalization (`Hash::check` against dummy bcrypt hash), dual rate limiting (`login_email_ip` and `login_ip`), and generic error messages implemented in `LoginController` and `AuthController`. Verified in tests. | N/A |
| P4-T03 | DONE | RFC 6238 TOTP 2FA engine built (`TotpService.php`), replay protection via `two_factor_last_step`, window tolerance (+-1 step), mandatory 2FA enforcement for admin roles in `EnsureTwoFactorVerified.php`. Verified in tests. | N/A |
| P4-T04 | DONE | Single-use recovery codes (8 CSPRNG codes stored as SHA-256 hashes) implemented in `User::generateRecoveryCodes` and `User::consumeRecoveryCode` with pessimistic row locking (`lockForUpdate`). Concurrent race test verified. | N/A |
| P4-T05 | DONE | Secure password reset pipeline: 64-char CSPRNG token stored as SHA-256 hash, 60-min TTL, atomic one-time deletion, generic response (no enumeration), and instant revocation of other sessions/tokens. | N/A |
| P4-T06 | DONE | Strict password policy (`Password::min(12)->mixedCase()->numbers()->symbols()`) enforced across registration, password resets, and changes. | N/A |
| P4-T07 | DONE | Email verification architecture documented; signed URLs and throttle enforced. | N/A |
| P4-T08 | DONE | Session and token management: `GET /api/v1/me/sessions`, `POST /api/v1/me/logout-all`, and token revocation upon password change implemented and verified. | N/A |
| P4-T09 | DONE | Sensitive action re-authentication: `POST /api/v1/auth/confirm-password` issues confirmation state for sensitive operations (15 min validity). | N/A |
| P4-T10 | DONE | Account lifecycle: immediate revocation of active tokens and sessions upon user deactivation (`EnsureAccountActive` checks fresh DB state). | N/A |
| P4-T11 | DONE | Monolog log hygiene processor (`SensitiveDataRedactionProcessor`) implemented and registered; automatically redacts passwords, tokens, secrets, codes, cards, and authorization headers. | N/A |
| P4-T12 | DONE | Anti-enumeration defense verified across registration, forgot-password, login, and 2FA challenge endpoints. | N/A |
| P4-T13 | DONE | 15/15 automated tests in `backend/tests/Feature/AuthenticationSecurityTest.php` passing 100% (57 assertions). | N/A |

## Task Completion Table (Phase 5 — G17 Discipline)
| Task ID | Status | Evidence | Reason if not DONE |
|---|---|---|---|
| P5-T01 | DONE | `BookingStateMachine` built with strict transition matrix (`BookingStatus` backed enum), idempotency support, role check, side effects, activity logging, and `BookingStatusChangedEvent` implementing `ShouldDispatchAfterCommit`. Verified in tests. | N/A |
| P5-T02 | DONE | Server-side pricing enforcement: `CreateBookingRequest` and `ProcessCheckoutRequest` prohibit client injection of `price`, `total`, `total_cents`, `deposit`, etc. Authoritative quote recalculated server-side. Verified in tests. | N/A |
| P5-T03 | DONE | Half-open range availability checks (`[check_in, check_out)`) implemented in `CheckPropertyAvailabilityQuery` allowing same-day turnaround bookings. Verified in tests. | N/A |
| P5-T04 | DONE | Concurrency control: database migration adds PostgreSQL exclusion constraint using `btree_gist` (`EXCLUDE USING gist (bookable_id WITH =, daterange(check_in, check_out, '[)') WITH &&)`), backed by pessimistic row locking `Property::lockForUpdate()` and transaction retries (`DB::transaction($cb, 3)`). Verified in tests. | N/A |
| P5-T05 | DONE | Hold expiry background job: 15-minute hold TTL (`expires_at`), ignored in availability queries after expiry, and purged by artisan command `bookings:expire-pending`. Verified in tests. | N/A |
| P5-T06 | DONE | Idempotent booking creation: `Idempotency-Key` header passed to `CreateBookingDTO` and checked upfront; replay returns existing booking without duplicate records. Verified in tests. | N/A |
| P5-T07 | DONE | Transaction boundary enforcement: atomic rollback on booking creation failure verified with 0 orphan records in database. | N/A |
| P5-T08 | DONE | IDOR & enumeration defense on confirmation page: 64-char CSPRNG token generated and hashed with SHA-256 (`booking_access_token`). Multi-tier authorization enforced in `CheckoutController::confirmation`; generic 404 returned on any unauthorized access to prevent reference enumeration. Verified in tests. | N/A |
| P5-T09 | DONE | Pricing & cancellation policy snapshots: `pricing_snapshot` and `cancellation_policy_snapshot` JSON columns added to `bookings` table and persisted upon reservation creation. | N/A |
| P5-T10 | DONE | Customer cancellation self-service: `POST /api/v1/customer/bookings/{reference}/cancel` implemented in `Customer\BookingController` and verified idempotent. Non-owners receive 404. | N/A |
| P5-T11 | DONE | Confirmation rate limiting: named rate limiter `booking_confirmation` (15/min per IP) registered in `AppServiceProvider` and enforced on `/checkout/confirmation/{reference}`. Verified in tests. | N/A |
| P5-T12 | DONE | Concurrency test suite: `BookingHardeningTest::test_concurrent_booking_same_inventory_concurrency` verifies conflicting bookings throw `BookingUnavailableException`. | N/A |
| P5-T13 | DONE | IDOR regression test suite: `BookingHardeningTest::test_confirmation_page_idor_protection` verifies bare references, invalid tokens, and stranger users receive 404 while owners and token holders receive 200. | N/A |

## Task Completion Table (Phase 5.5 — Adversarial Production Audit)
| Task ID | Status | Evidence | Reason if not DONE |
|---|---|---|---|
| P5.5-T01 | DONE | `docs/hardening/PHASE_5_5_ATTACK_SURFACE.md` generated documenting all 135 Laravel routes with 15 adversarial properties per route. | N/A |
| P5.5-T02 | DONE | `docs/hardening/PHASE_5_5_SECURITY_BOUNDARY_MAP.md` created mapping all 10 architectural trust boundaries and trust flows. | N/A |
| P5.5-T03 | DONE | 9 dedicated adversarial test suites implemented in `backend/tests/Feature/Adversarial*Test.php` with 26/26 attacks passing 100% (73 assertions). | N/A |
| P5.5-T04 | DONE | `docs/hardening/PHASE_5_5_FINDINGS.md` created documenting 5 findings (FINDING-001 to FINDING-005) with severity and reproduction steps. | N/A |
| P5.5-T05 | DONE | `docs/hardening/PHASE_5_5_SECURITY_MATRIX.md` created linking each security property to direct test and code evidence. | N/A |
| P5.5-T06 | DONE | Shielded mock payment gateways in `backend/routes/web.php` with `if (! app()->isProduction())` (resolving FINDING-002). | N/A |
| P5.5-T07 | DONE | `docs/hardening/PHASE_5_5_FINAL_REPORT.md` generated issuing CONDITIONAL PASS for Phase 6 transition. | N/A |

## Standards S1–S5 Comprehension (10-line summary)
1. **S1 (Request Pipeline)**: Strict 14-step request lifecycle (Correlation ID → Trusted Proxies → CORS → Force JSON → Rate limit → Auth → Account state → Scoped bindings → Policy → FormRequest → Thin Controller → Action/Transaction → Resource → Exception envelope).
2. **S1 Controllers/Requests**: Controllers only accept validated input, call a single Action, return Resource; FormRequests enforce explicit authorization and rigorous rules; zero `$request->all()`.
3. **S1 Idempotency & Abuses**: Enforce `Idempotency-Key` (UUID) on booking/payment mutations; cap pagination (max 100); explicit sort/filter whitelists; named rate limiters (`auth`, `api`, `booking`, `payment`, `webhook`).
4. **S2 (Response Contract)**: Uniform success envelope `{ "data": ..., "meta": { "request_id": ... } }` and standardized error envelope `{ "error": { "code": "...", "message": "...", "details": {...}, "request_id": ... } }`.
5. **S2 Financial & Data types**: Money exclusively represented as integer minor units with currency code (no floats); ISO-8601 UTC timestamps; no sensitive fields leaked in resources.
6. **S3 (Performance Standard)**: Measure → Change → Re-measure; eliminate N+1 queries via eager loading (`with()`, `load()`, `whenLoaded`); strict query budgets on critical endpoints.
7. **S3 Caching & strictness**: Enable `Model::shouldBeStrict()`; versioned cache keys with explicit invalidation on writes; prevent stampedes; deploy-time framework caches.
8. **S4 (Testing Standard)**: Full testing pyramid (Unit, Feature, Contract, Security, PostgreSQL Concurrency with true parallel processes, Query-count budgets, Migration up/down/up).
9. **S4 Test Discipline**: Red → Green → Refactor for all fixes; complete dataset-driven authorization matrix tests; route-inventory tests to eliminate unprotected admin routes.
10. **S5 (Permission Standard)**: 3-layer authorization on every access (Role/Permission `resource.action` + Scope `own/assigned/all` + Object State); deny-by-default; query-level scoping.

## Decisions (ADR-lite)
- **D-001**: Isolated test database to `database/testing.sqlite` in `phpunit.xml` to prevent write locks and conflicts with active developer GUI instances (SQLiteBrowser).
- **D-002**: Provisioned Docker service `postgres_test` (`postgres:16-alpine` on port 5432) with dedicated `phpunit.postgres.xml` to support authentic concurrency testing in Phase 5 and PostgreSQL migration in Phase 8 without modifying production infrastructure prematurely.
- **D-003**: Decided on Action-sharing architecture: Blade web controllers and `/api/v1` controllers will invoke the identical domain actions, preventing code duplication while decoupling presentation formats.
- **D-004 (ADR-003)**: Dual-mode authentication: HTTP-only session cookies with CSRF double-submit protection for Next.js web application; Sanctum personal access tokens for native mobile and third-party API clients.
- **D-005**: Persistent database idempotency ledger via `idempotency_keys` table with SHA-256 payload hashing, 24-hour TTL, and atomic response caching to prevent duplicate bookings and financial double-charges.
- **D-006**: Three-layer Zero-Trust Authorization Architecture: Model Policies evaluate permission + scope + state invariants; `Gate::after` acts strictly as an unhandled fallback for simple string abilities without overriding policy decisions; `Gate::before` allows super-admin bypass while strictly preserving User safety invariants (cannot delete self, cannot delete last super-admin).
- **D-007**: Eloquent Model Cast `'password' => 'hashed'` automatically hashes any raw string assigned to `$user->password`. Tests and factories must pass plain strings to avoid double-hashing.
- **D-008**: User Email Normalization: Added `setEmailAttribute` mutator on `User` model and `whereRaw('LOWER(email) = ?', [$email])` across queries to guarantee cross-database case-insensitive authentication regardless of backend engine (SQLite vs PostgreSQL vs MySQL).
- **D-009**: Fresh DB Status Check in `EnsureAccountActive`: `EnsureAccountActive` checks fresh database status rather than stale in-memory cached model attributes, ensuring account deactivations revoke access across all ongoing sessions and tokens immediately.
- **D-010**: Atomic Recovery Code Consumption: Recovery codes are stored as SHA-256 hashes and consumed inside a database transaction with `lockForUpdate()`, strictly preventing concurrent race conditions from executing multiple logins with the same single-use code.
- **D-011**: Multi-Tier IDOR Defense & Reference Enumeration Protection: Access to `/checkout/confirmation/{reference}` requires authenticated customer ownership, active checkout session, valid cryptographic signed URL, or secret guest access token matching the stored SHA-256 hash. Generic 404 is returned on any unauthorized access to prevent reference enumeration.
- **D-012**: PostgreSQL Exclusion Constraint & Driver Strategy: Exclusion constraint `EXCLUDE USING gist (bookable_id WITH =, daterange(check_in, check_out, '[)') WITH &&)` defined in migration with driver check so PostgreSQL enforces it at the database engine level while SQLite test runner relies on transactional pessimistic locking (`lockForUpdate()`).
- **D-013**: Authoritative Server Pricing & Prohibited Mass Assignment Invariants: Client-provided pricing fields (`price`, `total`, `total_cents`, etc.) are declared `prohibited` in FormRequests, preventing client injection. Immutable snapshots (`pricing_snapshot`, `cancellation_policy_snapshot`) freeze financial rules at booking time.

## Open Findings
- None blocking Phase 5. All 13 booking hardening scenarios verified.

## Files Changed (Cumulative)
- `docs/hardening/LEDGER.md`
- `docs/hardening/BACKLOG.md`
- `docs/hardening/BASELINE_REPORT.md`
- `docs/hardening/ROUTE_INVENTORY.md`
- `docs/hardening/FINDINGS.md`
- `docs/hardening/CURRENT_ARCHITECTURE.md`
- `docs/hardening/TARGET_ARCHITECTURE.md`
- `docs/hardening/ROUTE_BOUNDARY_PLAN.md`
- `docs/hardening/ARCHITECTURE_AUDIT.md`
- `docs/hardening/ROUTE_MIGRATION_MAP.md`
- `docs/hardening/API_CONTRACT.md`
- `docs/hardening/AUTHENTICATION_FLOW.md`
- `docs/hardening/AUTHENTICATION_SECURITY.md`
- `docs/hardening/TWO_FACTOR_FLOW.md`
- `docs/hardening/ERROR_STANDARD.md`
- `docs/hardening/NEXTJS_INTEGRATION.md`
- `docs/hardening/adr/ADR-003-AUTH-MODE.md`
- `docs/hardening/AUTHORIZATION_MATRIX.md`
- `backend/bootstrap/app.php`
- `backend/config/cors.php`
- `backend/config/auth.php`
- `backend/app/Providers/AppServiceProvider.php`
- `backend/app/Models/User.php`
- `backend/app/Services/Auth/TotpService.php`
- `backend/app/Services/Auth/PermissionResolver.php`
- `backend/app/Logging/SensitiveDataRedactionProcessor.php`
- `backend/app/Policies/*`
- `backend/app/Exceptions/*`
- `backend/app/Http/Middleware/*`
- `backend/app/Support/Traits/AppliesListingStandard.php`
- `backend/app/Http/Resources/Api/V1/*`
- `backend/app/Http/Requests/Api/V1/*`
- `backend/app/Http/Requests/Admin/*`
- `backend/app/Http/Controllers/Api/V1/*`
- `backend/app/Http/Controllers/Auth/*`
- `backend/app/Http/Controllers/Admin/*`
- `backend/resources/views/auth/*`
- `backend/routes/api.php`
- `backend/routes/api/v1/*`
- `backend/routes/web.php`
- `backend/database/migrations/*`
- `backend/database/seeders/RoleAndPermissionSeeder.php`
- `backend/tests/Feature/BaselineCharacterizationTest.php`
- `backend/tests/Feature/ApiV1HardeningTest.php`
- `docs/hardening/BOOKING_SECURITY_AUDIT.md`
- `docs/hardening/BOOKING_STATE_MACHINE.md`
- `docs/hardening/TRANSACTION_STRATEGY.md`
- `backend/app/Modules/Booking/Domain/*`
- `backend/app/Console/Commands/ExpirePendingBookingsCommand.php`
- `backend/tests/Feature/BookingHardeningTest.php`
- `frontend/src/lib/api/client.ts`
- `frontend/.env.local`
- `frontend/.env.example`

## Commands That Must Pass Before Moving On
```bash
php artisan test --group=baseline --env=testing
php artisan test tests/Feature/ApiV1HardeningTest.php --env=testing
php artisan test tests/Feature/RouteInventorySecurityTest.php --env=testing
php artisan test tests/Feature/AuthorizationSecurityTest.php --env=testing
php artisan test tests/Feature/AuthenticationSecurityTest.php --env=testing
php artisan test tests/Feature/BookingHardeningTest.php --env=testing
./vendor/bin/pint --test
php artisan migrate:status --env=testing
composer audit
```
