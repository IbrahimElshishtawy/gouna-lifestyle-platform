# Phase Report
Phase: Phase 1 — Architecture & Code Quality Audit
Status: PASS

## Scope
In-depth, read-only architectural, design pattern, and code quality audit across `backend` (Laravel 12) and `frontend` (Next.js 15), evaluating separation of concerns, request lifecycle flows, authentication/authorization, data integrity, idempotency, N+1 query prevention, and test suite health.

## Environment and versions (no secrets)
- **Backend Runtime:** PHP 8.5.4 CLI, Laravel Framework 12.0
- **Frontend Runtime:** Node.js v24.21.0, Next.js 15.1.8, React 19.0.0
- **Database Driver:** SQLite 3.50.6 (`database/database.sqlite`, `busy_timeout=5000ms`) with PostgreSQL schema compatibility tested in `.env.testing.postgres`
- **Dependency Managers:** Composer 2.9.5, npm 11.19.0

## Commands executed + exit codes
- `./vendor/bin/phpstan analyse --level=1 app --memory-limit=512M` (Exit code: 1 - 735 static analysis notices due to unconfigured Larastan Eloquent extension)
- `php artisan test tests/Feature/AdminStaffRbacAndConciergeTest.php` (Exit code: 0 - 7 passed, 81 assertions)
- `php artisan test tests/Feature/PublicFrontendTest.php` (Exit code: 1 - 7 failed, 1 passed, missing Blade views)
- `npm run typecheck` in `frontend/` (Exit code: 0)
- `npm run lint` in `frontend/` (Exit code: 0)
- `npm run build` in `frontend/` (Exit code: 0 - 66 static and dynamic routes compiled)

## Evidence and results
### Request Lifecycle & Architectural Flow
1. **Public Web Routing Flow:**
   `Client` -> `Next.js 15 App Router` (SSR/SSG via `next-intl`) -> `Fetch Client` -> `HTTP JSON API (/api/v1/*)` -> `Laravel Kernel` -> `AssignRequestId` -> `ForceJsonResponse` -> `ApplySecurityHeaders` -> `ThrottleRequests` -> `Route Controller` -> `FormRequest Validation` -> `Domain Action / Service` -> `DB Transaction` -> `Eloquent Model` -> `API Resource (JSON:API Standard)`.
2. **Admin & Staff Routing Flow:**
   `Next.js Admin Pages` -> `Bearer Token Authorization` -> `EnsureAccountActive` -> `TrackAdminSession` -> `Role/Permission Policy Check` -> `Idempotent Action Execution` -> `Audit Trail Logging (ActivityLog)`.
3. **Idempotency & Race Condition Mitigation:**
   - Mutations on critical routes (`/checkout/bookings`, `/checkout/quote`, payment webhooks) enforce `Idempotency-Key` headers via `EnsureIdempotency` middleware with actor namespacing (`user:{id}`, `session:{id}`, `guest:{hash}`).
   - `CreateBookingAction` wraps checkout in `DB::transaction()` and pessimistic locking (`lockForUpdate()`), snapshotting exact prices (`pricing_snapshot`) and generating cryptographically unguessable reference codes (`BookingReference`).
4. **Authorization & IDOR Defense:**
   - `BookingPolicy`, `CustomerPolicy`, `LeadPolicy`, and `PropertyPolicy` strictly verify ownership: `$booking->customer->user_id === $user->id`.
   - RBAC rules isolate roles (e.g., `sales` and `content_manager` cannot access booking financial data; `staff` can only access assigned bookings).

## Findings by severity

### 1. [High] Unhandled 500 Errors on Legacy Public Blade Routes
- **Severity:** High
- **File / Location:** `backend/routes/web.php:187-196`, `PropertyListingController.php:36,86`, `ExperienceListingController.php:31,52`
- **Evidence:** Running `php artisan test tests/Feature/PublicFrontendTest.php` failed with:
  `InvalidArgumentException: View [properties.index] not found.` and `View [experiences.index] not found.`
- **Scenario & Impact:** Web visitors or web crawlers directly accessing `http://example.com/stays` or `http://example.com/experiences` on the backend web server receive an unhandled HTTP 500 error instead of a clean redirect to the Next.js frontend or a valid view.
- **Safe Reproduction:** Run `curl -I http://127.0.0.1:8000/stays` when Laravel is serving web traffic.
- **Proposed Fix:** Either provide lightweight fallback Blade views or issue HTTP 301/302 redirects to the corresponding frontend paths (`env('FRONTEND_URL') . '/stays'`).
- **Regression Test:** `tests/Feature/PublicFrontendTest.php` assertion `$response->assertStatus(200)` or `$response->assertRedirect(...)`.

### 2. [High] SQLite Concurrency Limitations for Pessimistic Locking
- **Severity:** High (for Concurrency Target of 500+ users)
- **File / Location:** `app/Modules/Availability/Application/Actions/LockAndValidateAvailabilityAction.php:51`
- **Evidence:** `Property::where('id', $property->id)->lockForUpdate()->first();` is executed inside a transaction. In PostgreSQL this acquires an exclusive row-level lock. In SQLite, `lockForUpdate()` is a no-op because SQLite only supports full-database file locking.
- **Scenario & Impact:** When 500 concurrent users attempt bookings, SQLite serializes all writes with a whole-database lock. Threads waiting longer than `busy_timeout` (5000ms) will throw `Illuminate\Database\QueryException: SQLITE_BUSY: database is locked`.
- **Safe Reproduction:** Execute concurrent booking creation tests with 50+ parallel threads against SQLite.
- **Proposed Fix:** Migrate production to PostgreSQL where `btree_gist` exclusion constraints (`bookings_no_double_booking`) and true `SELECT ... FOR UPDATE` row locks are natively supported.
- **Regression Test:** `tests/Feature/AdversarialConcurrencyTest.php`.

### 3. [Medium] Static Analysis Configuration Gap (Larastan)
- **Severity:** Medium
- **File / Location:** `backend/` root lacks `phpstan.neon`
- **Evidence:** `./vendor/bin/phpstan analyse` generated 735 false-positive errors because `larastan/larastan` extensions were not registered in a `phpstan.neon` configuration file.
- **Impact:** Automated CI/CD pipelines cannot run PHPStan to catch genuine type errors or null dereferences without being swamped by framework false positives.
- **Safe Reproduction:** Execute `./vendor/bin/phpstan analyse --level=1 app`.
- **Proposed Fix:** Create standard `backend/phpstan.neon` including `vendor/larastan/larastan/extension.neon`.
- **Regression Test:** `./vendor/bin/phpstan analyse --level=1 app` exits with 0.

### 4. [Low] Frontend React Hook Missing Dependency Warnings
- **Severity:** Low
- **File / Location:** `frontend/src/app/[locale]/admin/activity/page.tsx:50`, `concierge/page.tsx:132`, `events/page.tsx:133`, `roles/page.tsx:69`, `users/page.tsx:141`
- **Evidence:** `npm run lint` flagged 7 `react-hooks/exhaustive-deps` warnings where async fetch handlers were not wrapped in `useCallback` or listed in the `useEffect` dependency array.
- **Impact:** Potential stale closure states or redundant component re-fetches during administrative dashboard interactions.
- **Proposed Fix:** Wrap referenced data fetching functions with `useCallback` or adjust dependency arrays.
- **Regression Test:** `npm run lint` completes with 0 warnings.

## Files changed
- None (Phase 1 is strictly read-only audit).

## Tests passed / failed / not run
- `npm run typecheck`: PASS (0 errors)
- `npm run lint`: PASS (0 errors, 7 warnings)
- `npm run build`: PASS (66 routes generated)
- `php artisan test tests/Feature/AdminStaffRbacAndConciergeTest.php`: PASS (7/7 passed)
- `php artisan test tests/Feature/PublicFrontendTest.php`: FAIL (7 failed due to missing Blade templates)
- `phpstan analyse`: FAIL (735 false positives due to missing `phpstan.neon`)

## Data and operational risks
- Running simultaneous writes on SQLite without WAL mode and aggressive busy timeout leads to transaction timeouts under moderate traffic.
- Missing Blade templates on legacy web routes generate high 5xx error spikes if legacy URLs are exposed to the public internet.

## Rollback plan
- No modifications were performed; zero rollback required.

## Acceptance criteria
- [x] Separation of concerns, controllers, actions, and models evaluated.
- [x] Request lifecycle mapped from routing to JSON/API responses.
- [x] Authentication, RBAC, and IDOR/BOLA mitigations audited.
- [x] Concurrency and locking mechanics examined across SQLite and PostgreSQL.
- [x] Available tests and analysis tools executed and exit codes documented.
- [x] All findings classified by severity with reproduction scenarios and proposed fixes.
- [x] Report saved to `docs/production-readiness/01-architecture-code-quality-report.md`.

## Open questions
1. Are backend web routes (`/stays`, `/experiences`) intended to be deprecated and redirected to the Next.js frontend (`env('FRONTEND_URL')`), or should minimal Blade fallbacks be restored?
2. Shall we add `phpstan.neon` during the remediation sprint to enable clean level-5 static analysis?

## Recommendation for next phase
Proceed to **Phase 2 — Application Security Audit**, conducting a thorough defensive security evaluation aligned with OWASP ASVS.
