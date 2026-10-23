# GouNow Security Audit — 00. Baseline & Architecture Verification

**Assessment Date:** October 22, 2026  
**Lead Auditor:** Senior Application Security & DevSecOps Engineer  
**Branch:** `security/audit-hardening`  
**Assessment Scope:** Backend (Laravel 12 API), Frontend (Next.js 15 App Router), Database, API Endpoints, Payment Gateway Workflows, Infrastructure Configuration.

---

## 1. Verified Technology Stack

| Layer | Declared Specification | Verified In Repository | Notes |
| :--- | :--- | :--- | :--- |
| **Backend Framework** | Laravel 12.x on PHP 8.2+ | Laravel 12.33.0 / PHP 8.2.28 CLI | Strict type declaration (`declare(strict_types=1);`), Sanctum authentication, named rate limiters. |
| **Frontend Framework** | Next.js 15.x | Next.js 15.2.4 (React 19.0.0, TypeScript 5.7.3) | App Router with `next-intl` localization (`ar` and `en`), Tailwind CSS, Headless Admin Portal. |
| **Development DB** | SQLite 3 | SQLite 3 (`database/database.sqlite`, `database/test_runner.sqlite`) | Used for local test execution and test runner. |
| **Production Target DB** | PostgreSQL 16+ | PostgreSQL planned (`pgsql` driver configured in `config/database.php`) | Includes GiST btree reservation exclusion constraints for double-booking prevention. |
| **Authentication** | Laravel Sanctum | Personal Access Tokens (Bearer) & Session Cookies | Multi-tier RBAC (`super_admin`, `property_manager`, `finance`, `concierge`), 2FA enforcement. |
| **Storage Subsystem** | Local Disk / S3 | `public`, `receipts`, and `s3` disks configured | `receipts` disk is strictly private; `public` disk serves media assets with sanitized UUIDs. |
| **Payment Gateway** | Paymob / Instapay / Offline | Paymob 3DS hosted gateway, Instapay, Manual Bank Transfer | Server-to-server HMAC-SHA512 webhook verification on `/api/v1/webhooks/payments`. |

---

## 2. Architecture & Trust Boundaries

```
[ Public Internet / Untrusted Client ]
                │
                ▼ (TLS 1.3 / HTTPS)
        [ Cloudflare / Reverse Proxy ]
                │
                ├────────────────────────────────────────┐
                ▼ (Next.js App Server :3000)             ▼ (Nginx / API Gateway)
     [ Next.js 15 Frontend ]                             │
     - Public Guest Browsing / Stays Catalog             ▼
     - Customer Booking & Proof Upload       [ Laravel 12 API Server :8000 ]
     - Admin Dashboard (SPA Shell)           ├── Middleware: AssignRequestId, ForceJsonResponse
                                             ├── Middleware: ApplySecurityHeaders, EnsureAccountActive
                                             ├── Middleware: TrackAdminSession, throttle:api
                                             └── Route Groups:
                                                  ├── /api/v1/ (Public endpoints)
                                                  ├── /api/v1/customer/ (Customer sanctum auth)
                                                  ├── /api/v1/admin/ (Admin + 2FA verified)
                                                  └── /api/v1/webhooks/ (HMAC-SHA512 verified)
                                                         │
                                    ┌────────────────────┴────────────────────┐
                                    ▼                                         ▼
                        [ PostgreSQL 16 DB ]                     [ Secure File Storage ]
                        - GiST Exclusion Lock                     - /storage/receipts (Private 0600)
                        - Pessimistic Locks                       - /storage/public (Assets UUID)
                        - Strict Foreign Keys
```

### Trust Boundary Analysis
1. **Public Boundary:** Any anonymous visitor can view published properties, calculate quotes, and initiate a draft reservation.
2. **Customer Boundary:** Authenticated customers access their personal reservations, profiles, and active sessions via Sanctum Bearer tokens.
3. **Guest Checkout Boundary:** Unauthenticated customers complete bookings via high-entropy `booking_access_token` (SHA-256 hashed at rest).
4. **Administrative Boundary:** Administrative operations require `is_admin = true`, assigned administrative roles, and confirmed 2FA token capabilities (`2fa:verified`).
5. **Webhook Boundary:** Payment gateway webhooks must be cryptographically verified using SHA-512 HMAC signatures before transaction state mutations.

---

## 3. Initial Baseline Test & Analysis Results

Before implementing any changes, the automated baseline test suites were executed on the repository:

### Backend Automated Test Baseline
- **Command:** `php artisan test`
- **Result:** **240 passed, 6 skipped** (PostgreSQL exclusion tests skip gracefully when SQLite test driver is active).
- **Assertions:** 1,141 assertions passed.
- **Duration:** 30.72s.

### Frontend Automated Analysis Baseline
- **Typecheck:** `npm run typecheck` (`tsc --noEmit`) → **0 errors**.
- **Linter:** `npm run lint` (`next lint`) → **0 errors, 7 non-blocking React hook warnings**.

### Dependency Vulnerability Baseline
- **Backend (`composer audit`):** Flagged `symfony/yaml` (PKSA-xz3r-9gp4-4m1z / CVE-2026-109413) regarding unbounded recursion in YAML inline lexers.
- **Frontend (`npm audit`):** Flagged transitive vulnerabilities in development bundlers (`postcss`, `sharp`, `braces`). `images.unoptimized: true` is configured in `next.config.ts`, mitigating remote image optimization hazards.

---

## 4. Files and Subsystems Inspected

- **Routing & Middleware:**
  - `backend/routes/api.php`, `backend/routes/api/v1/*.php`, `backend/routes/web.php`
  - `backend/bootstrap/app.php`, `backend/app/Http/Middleware/*.php`
- **Authentication & RBAC:**
  - `backend/app/Http/Controllers/Api/V1/Public/AuthController.php`
  - `backend/app/Http/Controllers/Api/V1/Admin/StaffApiController.php`
  - `backend/app/Services/Auth/PermissionResolver.php`
  - `frontend/src/context/AdminAuthContext.tsx`, `frontend/src/lib/api/auth.ts`
- **Booking & Concurrency:**
  - `backend/app/Services/Booking/BookingService.php`
  - `backend/app/Services/Booking/ReservationLockManager.php`
  - `backend/app/Http/Controllers/Api/V1/Public/CheckoutController.php`
- **Financial Proofs & Storage:**
  - `backend/app/Http/Controllers/Api/V1/Public/CustomerPaymentProofController.php`
  - `backend/app/Http/Controllers/Api/V1/Admin/FinanceApiController.php`
  - `backend/app/Http/Controllers/Api/V1/Admin/MediaDesignApiController.php`
  - `backend/app/Services/MediaService.php`, `backend/config/filesystems.php`
- **Webhooks & Integrations:**
  - `backend/app/Services/Payment/WebhookSignatureVerifier.php`
  - `backend/app/Http/Controllers/Api/V1/Webhooks/PaymentWebhookController.php`
- **Database & Migrations:**
  - `backend/database/migrations/*.php`
- **Configuration & Deployment:**
  - `backend/config/cors.php`, `backend/config/database.php`, `backend/config/session.php`
  - `frontend/next.config.ts`, `docker-compose.yml`, `nginx/*.conf`
