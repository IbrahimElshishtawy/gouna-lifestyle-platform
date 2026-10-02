# GouNow Hardening Ledger

## Current State
- **Current phase**: 0 (Baseline & Safety Net) — COMPLETED
- **Next phase**: 1 (Architecture Discovery & Boundary Cleanup)
- **Last completed task ID**: P0-T09 (DONE)
- **Branch**: `hardening/phase-0`
- **Test status**: 56 PASS / 1 FAIL (Pre-existing branding string in `PublicFrontendTest.php:130`). 6/6 Characterization tests PASS.
- **Overall status**: PHASE 0 SIGNED-OFF

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

## Open Findings
- None blocking Phase 0 (All 6 out-of-scope discoveries logged in `BACKLOG.md`).

## Files Changed (Cumulative)
- `docs/hardening/LEDGER.md`
- `docs/hardening/BACKLOG.md`
- `docs/hardening/BASELINE_REPORT.md`
- `docs/hardening/snapshots/routes_phase0.json`
- `docs/hardening/snapshots/migrate_status_phase0.txt`
- `docs/hardening/snapshots/db_show_phase0.txt`
- `docs/hardening/snapshots/critical_tables_schema.txt`
- `docs/hardening/snapshots/composer_lock_hash.txt`
- `docs/hardening/snapshots/perf_baseline.md`
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
