# GouNow Hardening Ledger

## Current State
- **Current phase**: 0 (Baseline & Safety Net)
- **Last completed task ID**: P0-T01 (In Progress)
- **Branch**: `hardening/phase-0`
- **Test status**: Baseline pending execution
- **Overall status**: IN-PROGRESS

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
- None yet.

## Open Findings
- None yet.

## Files changed (cumulative)
- `docs/hardening/LEDGER.md`
- `docs/hardening/BACKLOG.md`
- `docs/hardening/FINDINGS.md`
- `docs/hardening/DECISIONS_PENDING.md`
- `docs/hardening/RESIDUAL_RISKS.md`

## Commands that must pass before moving on
```bash
php artisan test
vendor/bin/pint --test
vendor/bin/phpstan analyse
composer audit
```
