# GouNow Hardening Ledger

## Current State
- **Current phase**: 1 (Architecture Discovery & Boundary Cleanup) — COMPLETED
- **Next phase**: 2 (API Layer, Request Pipeline & Next.js Integration)
- **Last completed task ID**: P1-T17 (DONE)
- **Branch**: `hardening/phase-1`
- **Test status**: 56 PASS / 1 FAIL (Pre-existing branding string in `PublicFrontendTest.php:130`). 6/6 Characterization tests PASS.
- **Overall status**: PHASE 1 SIGNED-OFF

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

## Open Findings
- None blocking Phase 1 (All 13 findings cataloged and routed to Phases 2–10 in `docs/hardening/FINDINGS.md`).

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
- `docs/hardening/snapshots/*`
- `backend/docker-compose.yml` (added `postgres_test` service)
- `backend/.env.testing`
- `backend/.env.testing.postgres`
- `backend/phpunit.xml` (isolated test db path)
- `backend/phpunit.postgres.xml`
- `backend/tests/Feature/BaselineCharacterizationTest.php`
- `backend/tests/Feature/PerformanceBaselineBenchmarkTest.php`

## Commands That Must Pass Before Moving On
```bash
php artisan test --group=baseline
php artisan migrate:status
composer audit
```
