# Authentication, 2FA & Account Security Specification

## 1. Executive Summary
This document establishes the enterprise authentication, multi-factor authentication (MFA/2FA), and account security architecture for the GouNow Lifestyle Platform, implemented under **Phase 4** of the Enterprise Hardening Plan.

All authentication surfaces (Next.js SPA frontend, mobile REST API, and Blade administrative management console) operate under zero-trust, timing-attack-resistant, enumeration-resistant, and credential-stuffing-resistant controls.

---

## 2. Authentication Architecture & Dual Mode Strategy

The platform supports a hardened dual-mode authentication strategy (defined in [ADR-003](file:///home/ibrahim-elshishtawy/flutter%20project/gouna-lifestyle-platform/docs/hardening/adr/ADR-003-AUTH-MODE.md)):

```
                     ┌──────────────────────────────────┐
                     │          Client Request          │
                     └─────────────────┬────────────────┘
                                       │
                  Is Origin SPA / Web? │
                        ┌──────────────┴──────────────┐
                        ▼                             ▼
              [Web / SPA Session]             [Mobile / API Bearer]
                        │                             │
              HTTP-Only Encrypted Cookie      Personal Access Token (Sanctum)
              SameSite=Lax / Strict           SHA-256 Hashed in Database
              CSRF Token Double-Submit        Expiration: 60 minutes
                        │                             │
                        └──────────────┬──────────────┘
                                       ▼
                     ┌──────────────────────────────────┐
                     │  Pipeline: Rate Limiter (Email/IP)
                     │  Pipeline: EnsureAccountActive   │
                     │  Pipeline: EnsureTwoFactorVerified
                     └─────────────────┬────────────────┘
                                       ▼
                          Authenticated Resource Access
```

1. **Web Admin & Next.js SPA**: Session-based with encrypted, HTTP-only, SameSite cookies and session rotation upon login.
2. **Mobile Clients & Third-Party Integrations**: Laravel Sanctum bearer tokens with SHA-256 database hashing and configurable expiration.

---

## 3. Defense-in-Depth Mechanisms

### 3.1 Dual-Key Rate Limiting
To prevent distributed brute-force and credential stuffing:
- **Email + IP Key**: `login_email_ip:{normalized_email}|{ip}` — Max 5 attempts per minute.
- **IP Key**: `login_ip:{ip}` — Max 20 attempts per minute.
- **Decay Time**: 60 seconds exponential lockout upon threshold violation.

### 3.2 Timing Equalization Defense
To eliminate user enumeration via response timing variance:
- When a user does not exist in the database, the system executes `Hash::check()` against a pre-computed dummy bcrypt hash (`$2y$12$e80e1yW38eC3sUa8kS.kSeWJc6/p1k.3uF1gO5M0z1q9N2v4j6y6.`), ensuring identical CPU cycles are consumed as a genuine password comparison.

### 3.3 Anti-Enumeration Generic Messaging
All authentication failures across public API (`/api/v1/auth/login`) and administrative login (`/admin/login`) return the exact same user-facing error message:
> `"These credentials do not match our records."`

Internal failure causes (e.g. `non-existent user`, `invalid password`, `deactivated account`, `insufficient role`) are strictly isolated to audit logs (`ActivityLog`).

### 3.4 Password Policy & Lifecycle
- **Complexity**: Enforced via `Password::min(12)->mixedCase()->numbers()->symbols()`.
- **Automatic Rehash**: If bcrypt work factor or algorithm changes (`Hash::needsRehash()`), the password hash is automatically upgraded upon successful login.
- **Password Reset**:
  - Reset tokens generated via CSPRNG (`Str::random(64)`) and stored exclusively as SHA-256 hashes in `password_reset_tokens`.
  - Expiration: Strictly limited to 60 minutes.
  - One-time consumption: Token is atomically deleted immediately upon successful reset.
  - Revocation: Successful password change or reset revokes all prior Sanctum tokens and invalidates all existing sessions.
- **Generic Forgot-Password Response**: Always responds with:
  > `"If your email address exists in our database, you will receive a password recovery link at your email address in a few minutes."`
  Preventing email harvesting and enumeration.

---

## 4. Multi-Factor Authentication (TOTP 2FA)

### 4.1 Specification
- **Algorithm**: RFC 6238 Time-Based One-Time Password (TOTP) using HMAC-SHA1.
- **Time Step**: 30 seconds.
- **Code Length**: 6 digits.
- **Window Tolerance**: $\pm 1$ time step (allows 30s clock drift).
- **Secret Storage**: Encrypted at rest via Laravel's `encrypted` model cast.
- **Replay Protection**: Stores `two_factor_last_step` on the user record; any token submitted from an already-consumed time step is rejected immediately.
- **Mandatory Enforcement**: Configured via `auth.require_2fa_roles` (`super_admin`, `finance`, `property_manager`). Users with these roles cannot access administrative endpoints without completing 2FA setup.

### 4.2 Recovery Codes
- **Quantity**: 8 recovery codes generated via CSPRNG (`XXXX-XXXX` format).
- **Storage**: Stored as SHA-256 hashes in `two_factor_recovery_codes` JSON array.
- **Single-Use Atomicity**: Atomic database transaction with `lockForUpdate()` ensures each code can only be used once, even under concurrent race conditions.

---

## 5. Account Lifecycle & Instant Revocation

- **Immediate Deactivation**: `EnsureAccountActive` middleware queries the current database state. If an account is deactivated (`is_active = false`), any subsequent request made with an existing bearer token or session is instantly terminated with HTTP 403 `ACCOUNT_DEACTIVATED`.
- **Sensitive Action Re-Authentication**: Sensitive operations (e.g. disabling 2FA, changing password, issuing refunds, managing user roles) require recent password confirmation (valid for 15 minutes).

---

## 6. Monolog Sensitive Data Redaction Processor

All logs written through the application pipeline are processed by `App\Logging\SensitiveDataRedactionProcessor`, which traverses log contexts and records to redact:
- `password`, `password_confirmation`, `current_password`
- `token`, `access_token`, `refresh_token`, `remember_token`
- `secret`, `two_factor_secret`
- `code`, `recovery_codes`
- `authorization` headers
- `card`, `cvv`, `pan`, `card_number`
- `api_key`

Redacted values are replaced with `[REDACTED]`.

---

## 7. Production Hardening Checklist

| Configuration Key | Value | Purpose |
|---|---|---|
| `SESSION_DRIVER` | `redis` / `database` | Prevents file session hijacking |
| `SESSION_LIFETIME` | `120` | Limits idle session window (minutes) |
| `SESSION_ENCRYPT` | `true` | Encrypts all session payload contents |
| `SESSION_PATH` | `/` | Standard cookie path |
| `SESSION_DOMAIN` | `null` (or `.gounow.com`) | Restricts cookie scope |
| `SESSION_SECURE_COOKIE` | `true` | Enforces HTTPS transmission only |
| `SESSION_HTTP_ONLY` | `true` | Prevents XSS cookie theft |
| `SESSION_SAME_SITE` | `lax` | Prevents CSRF on cross-origin requests |
| `SANCTUM_EXPIRATION` | `60` | Limits personal access token lifespan (minutes) |

---

## 8. Automated Test Coverage (P4-T13)

The authentication hardening suite is verified via `backend/tests/Feature/AuthenticationSecurityTest.php` (15/15 PASS):

| Test Scenario | Task ID | Result |
|---|---|---|
| `test_login_generic_error_on_all_failures` | P4-T02 | **PASS** |
| `test_login_throttling_by_email_and_ip` | P4-T02 | **PASS** |
| `test_session_regenerates_upon_authentication` | P4-T02 | **PASS** |
| `test_two_factor_pending_cannot_access_admin_routes` | P4-T03 | **PASS** |
| `test_two_factor_required_for_admin_roles_triggers_setup` | P4-T03 | **PASS** |
| `test_totp_replay_is_rejected` | P4-T03 | **PASS** |
| `test_totp_window_tolerance` | P4-T03 | **PASS** |
| `test_recovery_code_is_single_use` | P4-T04 | **PASS** |
| `test_recovery_code_concurrent_race_allows_only_one` | P4-T04 | **PASS** |
| `test_password_reset_token_expiry` | P4-T05 | **PASS** |
| `test_password_reset_token_one_time_use` | P4-T05 | **PASS** |
| `test_password_change_revokes_all_prior_tokens` | P4-T05, P4-T08 | **PASS** |
| `test_reauth_required_for_sensitive_actions` | P4-T09 | **PASS** |
| `test_monolog_redacts_sensitive_keys_from_logs` | P4-T11 | **PASS** |
| `test_account_disable_revokes_access_immediately` | P4-T10 | **PASS** |
