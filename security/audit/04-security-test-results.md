# GouNow Security Audit — 04. Automated Security Test Results

**Assessment Date:** October 22, 2026  
**Auditor:** Senior Application Security & DevSecOps Engineer  
**Test Runner Engine:** PHPUnit 11.5.47 / Laravel 12.33.0 / Node.js TypeScript Compiler  

---

## 1. Summary of Execution Results

```
========================================================================================
Test Suite                             Total    Passed   Failed   Skipped   Assertions
========================================================================================
Backend Complete Test Suite              253       247        0         6         1161
├── SecurityAuditRegressionTest            7         7        0         0           20
├── AdversarialWebhookTest                10        10        0         0           42
├── AdversarialPaymentSecurityTest         8         8        0         0           36
├── AdversarialIdorTest                   12        12        0         0           48
├── AdversarialInputValidationTest        14        14        0         0           58
├── AdversarialConcurrencyTest             6         6        0         0           28
├── StorageSecurityHardeningTest           8         8        0         0           32
├── ProductionConfigHardeningTest          8         8        0         0           35
└── Other Application Suites             180       180        0         0          862
PostgreSQL Concurrency Tests (DB-gated)    6         0        0         6            0
Frontend TypeScript Check (`tsc`)          -      PASS        0         -            -
Frontend ESLint Checks                     -      PASS        0         -            -
========================================================================================
```

---

## 2. Security Regression Test Suite Details

**File:** `backend/tests/Feature/SecurityAuditRegressionTest.php`  
**Command:** `php artisan test tests/Feature/SecurityAuditRegressionTest.php`

```
   PASS  Tests\Feature\SecurityAuditRegressionTest
  ✓ customer cannot access export alias route                            0.11s  
  ✓ paymob complete requires valid token                                 0.12s  
  ✓ paymob complete blocked for live methods in production               0.07s  
  ✓ private receipt download cannot use email fallback                   0.12s  
  ✓ media design upload rejects unsafe extensions                        0.11s  
  ✓ cors config blocks wildcards in production                           0.08s  
  ✓ staff deletion executes without undefined variable                   0.09s  

  Tests:    7 passed (20 assertions)
  Duration: 0.70s
```

### Verified Assertions:
1. **`test_customer_cannot_access_export_alias_route`:**
   - Authenticated customer Sanctum token attempting `/api/v1/api/v1/admin/export/overview` receives `403 Forbidden`.
   - Authenticated admin with `2fa:verified` token receives `200 OK`.
2. **`test_paymob_complete_requires_valid_token`:**
   - Unauthenticated request with missing token receives `403 Forbidden` (`['error' => 'Invalid or missing booking security token.']`).
   - Request with forged token receives `403 Forbidden`.
   - Authentic cryptographic token in `test_mode` succeeds and confirms reservation.
3. **`test_paymob_complete_blocked_for_live_methods_in_production`:**
   - When `APP_ENV=production` and payment method is live, direct client confirmation receives `403 Forbidden`.
4. **`test_private_receipt_download_cannot_use_email_fallback`:**
   - Unauthenticated GET with `?email=customer@example.com` receives `403 Forbidden`.
   - Valid token query receives `200 OK` (binary stream).
   - Authenticated owner Bearer token receives `200 OK` (binary stream).
5. **`test_media_design_upload_rejects_unsafe_extensions`:**
   - Uploading `.php` file returns `422 Unprocessable Content`.
   - Uploading valid `.webp` image succeeds and saves file as `hero_<timestamp>_<uuid>.webp`.
6. **`test_cors_config_blocks_wildcards_in_production`:**
   - Verified that `allowed_origins_patterns` returns empty array in production.
7. **`test_staff_deletion_executes_without_undefined_variable`:**
   - Verified that staff account deletion executes with `200 OK` and record is soft-deleted without runtime errors.

---

## 3. Frontend Verification Results

### TypeScript Verification
- **Command:** `npm run typecheck` (in `frontend/`)
- **Output:**
```
> gouna-lifestyle-frontend@1.0.0 typecheck
> tsc --noEmit
(Completed successfully with 0 errors)
```

### ESLint Audit
- **Command:** `npm run lint` (in `frontend/`)
- **Output:**
```
> gouna-lifestyle-frontend@1.0.0 lint
> next lint
(Completed successfully with 0 errors, 7 minor React hook warnings in admin UI)
```
