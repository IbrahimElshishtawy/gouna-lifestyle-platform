# GouNow Hardening Ledger

## Current State
- **Current phase**: 2 (API Layer, Request Pipeline & Next.js Integration) — COMPLETED
- **Next phase**: 3 (RBAC & Authorization Enforcement)
- **Last completed task ID**: P2-T14 (DONE)
- **Branch**: `hardening/phase-2`
- **Test status**: 56 PASS / 1 FAIL (Pre-existing branding string in `PublicFrontendTest.php:130`). 6/6 Baseline tests PASS. 10/10 ApiV1HardeningTest PASS (59 assertions).
- **Overall status**: PHASE 2 SIGNED-OFF

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

## Open Findings
- None blocking Phase 2.

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
- `docs/hardening/ERROR_STANDARD.md`
- `docs/hardening/NEXTJS_INTEGRATION.md`
- `docs/hardening/adr/ADR-003-AUTH-MODE.md`
- `backend/bootstrap/app.php`
- `backend/config/cors.php`
- `backend/app/Providers/AppServiceProvider.php`
- `backend/app/Models/User.php`
- `backend/app/Exceptions/DomainException.php`
- `backend/app/Exceptions/AvailabilityConflictException.php`
- `backend/app/Exceptions/IdempotencyConflictException.php`
- `backend/app/Exceptions/MissingIdempotencyKeyException.php`
- `backend/app/Http/Middleware/AssignRequestId.php`
- `backend/app/Http/Middleware/ForceJsonResponse.php`
- `backend/app/Http/Middleware/EnsureAccountActive.php`
- `backend/app/Http/Middleware/EnsureTwoFactorVerified.php`
- `backend/app/Http/Middleware/VerifyWebhookSignature.php`
- `backend/app/Http/Middleware/EnsureIdempotency.php`
- `backend/app/Support/Traits/AppliesListingStandard.php`
- `backend/app/Http/Resources/Api/V1/*`
- `backend/app/Http/Requests/Api/V1/*`
- `backend/app/Http/Requests/Admin/StorePropertyRequest.php`
- `backend/app/Http/Requests/Admin/UpdatePropertyRequest.php`
- `backend/app/Http/Controllers/Api/V1/*`
- `backend/app/Http/Controllers/Admin/PropertyController.php`
- `backend/routes/api.php`
- `backend/routes/api/v1/*`
- `backend/database/migrations/2026_10_02_223000_create_idempotency_keys_table.php`
- `backend/tests/Feature/ApiV1HardeningTest.php`
- `frontend/src/lib/api/client.ts`
- `frontend/.env.local`
- `frontend/.env.example`

## Commands That Must Pass Before Moving On
```bash
php artisan test --group=baseline
php artisan test tests/Feature/ApiV1HardeningTest.php
php artisan migrate:status
composer audit
```
