# PHASE 7 — PRODUCTION CONFIGURATION & RUNTIME HARDENING

## 1. Executive Summary

Phase 7 establishes explicit, fail-closed configuration baselines across all runtime subsystems of the GouNow application. It guarantees that the platform cannot accidentally execute under insecure defaults (such as debug traces, insecure cookies, local filesystem sessions, unpartitioned cache, or wildcard CORS) when deployed to production.

---

## 2. Configuration Subsystems & Hardened State

### 2.1 Application Environment & Debugging (`config/app.php`)
- **`APP_ENV`**: Defaults to `'production'` if not set in environment.
- **`APP_DEBUG`**: Evaluates to `(bool) env('APP_DEBUG', false)`. Strictly fails closed to disabled debug output, ensuring detailed stack traces and database queries are never exposed in production HTTP responses.
- **`APP_KEY`**: 32-byte AES-256-CBC cryptographic key required for session encryption, token signing, and field-level database encryption.

### 2.2 Session Security & State Persistence (`config/session.php`)
- **`SESSION_DRIVER`**: Defaults to `database` (or `redis`), preventing split-brain session issues across multi-instance production nodes.
- **`SESSION_SECURE_COOKIE`**: Configured to `env('SESSION_SECURE_COOKIE', env('APP_ENV') === 'production')`. Enforces that in production, session cookies are transmitted exclusively over TLS/HTTPS.
- **`SESSION_HTTP_ONLY`**: Enabled (`true`), preventing client-side JavaScript from accessing session identifiers.
- **`SESSION_SAME_SITE`**: Set to `'lax'`, protecting against Cross-Site Request Forgery (CSRF) in stateful operations.

### 2.3 Cross-Origin Resource Sharing (`config/cors.php`)
- **`supports_credentials`**: `true` (required for authenticated SPA cookie sessions).
- **`allowed_origins`**: Parsed strictly from `CORS_ALLOWED_ORIGINS`. Wildcards (`*`) are strictly prohibited in combination with credentials.
- **`exposed_headers`**: Explicitly limited to `['X-Request-ID', 'Retry-After', 'X-Idempotent', 'X-Cache-Lookup']`.

### 2.4 Database Connection & TLS Mode (`config/database.php`)
- **Production Engine**: PostgreSQL 16 (`pgsql`).
- **`DB_SSLMODE`**: Configurable via `env('DB_SSLMODE', 'prefer')`, enabling `require` or `verify-full` when connecting to managed database clusters.

### 2.5 Cache & Concurrency Locks (`config/cache.php`)
- **Default Store**: `database` (or `redis`), enabling cluster-wide atomic cache locks (`Cache::lock()`) required for checkout idempotency (`checkout_lock_{hash}`) and rate limiting.

### 2.6 Reverse Proxy & Trusted Headers (`bootstrap/app.php`)
- **`TRUSTED_PROXIES`**: Configurable via `env('TRUSTED_PROXIES', '*')`, supporting explicit CIDR blocks for Cloudflare, AWS ALB, or internal ingress gateways.

---

## 3. Mass Assignment & Model Serialization Guardrails

| Model | Hidden Fields Added | Security Justification |
|---|---|---|
| `App\Models\User` | `password`, `remember_token`, `two_factor_secret`, `two_factor_recovery_codes` | Prevents credential and 2FA seed leakage during JSON transformation. |
| `App\Models\Booking` | `booking_access_token`, `internal_notes` | Prevents exposure of raw guest access token hashes and staff-only notes. |
| `App\Models\PaymentTransaction` | `gateway_response`, `manual_notes` | Prevents exposure of raw payment provider payloads and internal accounting notes. |
| `App\Models\Customer` | `notes` | Prevents customer leakage of administrative notes. |

---

## 4. Automated Production Audit Command

Command `php artisan config:audit-production` provides automated verification of the 13 production prerequisites:
```bash
php artisan config:audit-production
```
Exits with status code `0` on compliant production configuration and `1` on critical vulnerabilities (e.g. debug mode active, SQLite in production, missing secrets, wildcard CORS).
