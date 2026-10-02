# GouNow Platform — Phase 0 Baseline & Safety Net Report

- **Date**: 2026-10-02 / 2026-10-03
- **Branch**: `hardening/phase-0`
- **Framework**: Laravel 12.69.3 / PHP 8.5.4
- **Database**: SQLite (local test DB) & PostgreSQL 16 Alpine (Docker service `postgres_test`)
- **Assigned Architect**: Senior Laravel Security & Performance Engineer

---

## 1. G24 Commands Baseline Results

| Command | Status | Result / Details | Evidence |
|---|---|---|---|
| `php artisan test` | 56 PASS / 1 FAIL | 56 tests passed, 337 assertions. 1 pre-existing failure documented below. | [BaselineCharacterizationTest.php](file:///home/ibrahim-elshishtawy/flutter%20project/gouna-lifestyle-platform/backend/tests/Feature/BaselineCharacterizationTest.php) |
| `vendor/bin/pint --test` | 48 files flagged | Style & formatting inconsistencies (import ordering, braces, concatenation spaces). No functional syntax errors. | `task-158` log |
| `vendor/bin/phpstan analyse app routes` | 1 error | Level 0 analysis: 1 error in `routes/console.php:7` (`Undefined variable: $this` in Artisan inspire command closure). | Command output |
| `composer audit` | PASS | Zero security vulnerability advisories found. | `task-169` log |
| `php artisan route:list --json` | PASS | 87 routes mapped and exported. | [routes_phase0.json](file:///home/ibrahim-elshishtawy/flutter%20project/gouna-lifestyle-platform/docs/hardening/snapshots/routes_phase0.json) |
| `php artisan migrate:status` | PASS | 36 migrations all ran successfully. | [migrate_status_phase0.txt](file:///home/ibrahim-elshishtawy/flutter%20project/gouna-lifestyle-platform/docs/hardening/snapshots/migrate_status_phase0.txt) |

### Pre-Existing Test Failures (P0-T02)
- **Test**: `Tests\Feature\PublicFrontendTest::test_homepage_renders_successfully_with_sections`
- **File & Line**: `tests/Feature/PublicFrontendTest.php:130`
- **Root Cause**: The test asserts seeing the string `'Discover El Gouna with GouNow'`. Following recent branding updates (commit `08185ac`), homepage copy was replaced with official luxury branding (`Curated Luxury Experiences • Private Escapes`). This is a known copy drift, not a system failure. Per P0-T02 instructions, left untouched in Phase 0.

---

## 2. Characterization Tests (P0-T06)

Six dedicated characterization tests were created in `tests/Feature/BaselineCharacterizationTest.php` under `@group baseline`. All 6 pass:

| Flow ID | Test Method | Flow Covered | Status | Execution Time |
|---|---|---|---|---|
| FLOW-01 | `characterization_login` | Admin authentication (valid credentials redirect to dashboard, invalid shows error) | PASS | 0.62s |
| FLOW-02 | `characterization_booking_creation` | Quote calculation AJAX (`POST /checkout/calculate`) returns financial breakdown | PASS | 0.16s |
| FLOW-03 | `characterization_checkout` | Public checkout view rendering (`GET /checkout/{slug}`) with payment methods | PASS | 0.16s |
| FLOW-04 | `characterization_payment_webhook` | Card 3DS checkout processing & completion callback simulation | PASS | 0.17s |
| FLOW-05 | `characterization_admin_crud_property` | Admin property creation with section 20 & 21 settings | PASS | 0.12s |
| FLOW-06 | `characterization_media_upload` | Media attachment upload to public disk for property inventory | PASS | 0.15s |

---

## 3. Performance Baseline (P0-T07)

Measured across 20 iterations per endpoint with query logging enabled:

| Endpoint | Method | Status | Queries Count | p50 Latency (ms) | p95 Latency (ms) | Response Size (Bytes) |
|---|---|---|---|---|---|---|
| Homepage | GET | 200 | 19 | 14.01 ms | 68.30 ms | 100,456 |
| Stays Catalog (/stays) | GET | 200 | 7 | 11.21 ms | 44.18 ms | 69,076 |
| Property Detail (/stays/{slug}) | GET | 200 | 13 | 8.96 ms | 24.52 ms | 48,389 |
| Quote Calculation (POST /checkout/calculate) | POST | 200 | 9 | 6.11 ms | 13.77 ms | 5,292 |
| Checkout Page (/checkout/{slug}) | GET | 200 | 14 | 7.47 ms | 23.40 ms | 28,347 |
| Curated Experiences (/experiences) | GET | 200 | 7 | 7.56 ms | 14.27 ms | 45,624 |
| Admin Login Page (/admin/login) | GET | 200 | 0 | 1.89 ms | 7.37 ms | 8,449 |
| Admin Dashboard (/admin) | GET | 200 | 28 | 16.41 ms | 38.83 ms | 87,912 |
| Admin Properties Index (/admin/properties) | GET | 200 | 17 | 13.55 ms | 22.87 ms | 132,780 |
| Admin Bookings Index (/admin/bookings) | GET | 200 | 3 | 11.59 ms | 16.47 ms | 142,164 |

*Note: Full snapshot stored at [perf_baseline.md](file:///home/ibrahim-elshishtawy/flutter%20project/gouna-lifestyle-platform/docs/hardening/snapshots/perf_baseline.md).*

---

## 4. Model::shouldBeStrict() Trial Violations (P0-T08)

During the trial run with strict mode enabled in non-production, the following 3 lazy-loading violations were identified. These are cataloged for resolution in Phase 9:
1. `App\Models\Event`: Attempted to lazy load `media` in `resources/views/admin/events/index.blade.php`.
2. `App\Models\Experience`: Attempted to lazy load `media` in `resources/views/admin/experiences/index.blade.php`.
3. `App\Models\Property`: Attempted to lazy load `media` in `resources/views/admin/properties/index.blade.php`.

---

## 5. PostgreSQL Test Environment (P0-T05)

- **Service**: Docker container `gounow_postgres_test` running `postgres:16-alpine` on `0.0.0.0:5432`.
- **Database**: `gounow_test` (User: `gounow_test`, Pass: `gounow_test_secret`).
- **Configuration Files**:
  - `backend/.env.testing`: Local SQLite testing configuration.
  - `backend/.env.testing.postgres`: PostgreSQL testing configuration.
  - `backend/phpunit.postgres.xml`: Dedicated PHPUnit configuration targeting PostgreSQL.
- **Execution Command**:
  ```bash
  # Fast SQLite tests
  php artisan test
  
  # PostgreSQL Concurrency & Migrations test suite
  php artisan test --configuration=phpunit.postgres.xml
  ```

---

## 6. Environment & Configuration Audit (P0-T04)

- **Codebase Secrets**: VERIFIED clean. No API keys, credentials, or card details hardcoded in repository files.
- **`env()` Usage**: VERIFIED 0 calls to `env()` outside `config/` directory.
- **`.env.example` Gap**: 72 configuration variables referenced in `config/*.php` are missing in `.env.example`. Detailed backlog created.
