# GouNow Hardening — Finding Register & Phase Routing

This register logs all architectural, security, and performance findings discovered during the Phase 1 Discovery Audit, formatted according to G19, with exact code locations, severities, and mapped remediation phases.

---

### Finding P2-F001: Absence of Dedicated `/api/v1` Boundary and Uniform Response Envelope
- **Severity**: High
- **Location**: `backend/routes/` and `backend/bootstrap/app.php`
- **Evidence**: `routes/api.php` does not exist; all routes are registered in `routes/web.php`. No global exception handler formatting uniform JSON error envelopes (`{ "error": { "code": "...", "message": "...", "request_id": "..." } }`).
- **Impact**: Frontend Next.js receives inconsistent response formats, raw HTML error pages on server failures, or unstandardized validation error shapes.
- **Remediation Phase**: Phase 2 (API Layer & Request Pipeline)
- **Fix**: Mount `routes/api/v1/` routes in `bootstrap/app.php` with `ForceJsonResponse` and `AssignRequestId` middleware; register custom `->withExceptions()` envelope handler.
- **Test**: `ApiAlwaysReturnsJsonTest`, `ErrorEnvelopeContractTest`
- **Status**: Open

---

### Finding P2-F002: Hybrid Blade/JSON Responses Violating Single Responsibility
- **Severity**: Medium
- **Location**:
  - `app/Http/Controllers/ExperienceListingController.php:68`
  - `app/Http/Controllers/CheckoutController.php:130,149`
  - `app/Http/Controllers/HomeController.php:106`
  - `app/Http/Controllers/PropertyListingController.php:108`
- **Evidence**:
  ```php
  // app/Http/Controllers/PropertyListingController.php:108
  if ($request->wantsJson()) {
      return response()->json(['success' => true, ...]);
  }
  return back()->with('success', ...);
  ```
- **Impact**: Inconsistent client state handling, difficult contract versioning, and bypass of standard API pipeline.
- **Remediation Phase**: Phase 2 (API Layer & Request Pipeline)
- **Fix**: Separate dedicated API endpoints (`/api/v1/*`) returning API Resources from public web routes returning Blade views.
- **Test**: `ApiVersioningTest`, `ListingStandardTest`
- **Status**: Open

---

### Finding P2-F003: Admin Controllers Relying on Inline Validation
- **Severity**: Medium
- **Location**:
  - `app/Http/Controllers/Admin/PropertyController.php:88,258`
  - `app/Http/Controllers/Admin/ExperienceController.php:68,162`
  - `app/Http/Controllers/Admin/EventController.php:66,174`
  - `app/Http/Controllers/Auth/LoginController.php:34`
- **Evidence**: Controllers directly invoke `$request->validate([...])` without explicit FormRequest authorization or sanitization rules.
- **Impact**: Bloated controllers, lack of authorization layer before validation, duplicate rules.
- **Remediation Phase**: Phase 2 (API Layer & Request Pipeline)
- **Fix**: Extract dedicated FormRequests (`StorePropertyRequest`, `UpdatePropertyRequest`, etc.) adhering to Standard S1.
- **Test**: `FormRequestMassAssignmentTest`
- **Status**: Open

---

### Finding P2-F004: Closure Routes in Web Route File
- **Severity**: Low
- **Location**: `backend/routes/web.php:45,46`
- **Evidence**:
  ```php
  Route::get('/rent', fn() => redirect()->route('admin.properties.index', ['type' => 'rent']))->name('rent');
  Route::get('/sale', fn() => redirect()->route('admin.properties.index', ['type' => 'sale']))->name('sale');
  ```
- **Impact**: Prevents execution of `php artisan route:cache` in production deployments.
- **Remediation Phase**: Phase 2 (API Layer & Request Pipeline)
- **Fix**: Replace closures with dedicated controller methods.
- **Status**: Open

---

### Finding P2-F005: Absence of Idempotency-Key Middleware on Booking & Payment Mutations
- **Severity**: High
- **Location**: `app/Http/Controllers/CheckoutController.php:92`
- **Evidence**: `POST /checkout/process` and `POST /checkout/calculate` do not evaluate `Idempotency-Key` HTTP headers.
- **Impact**: Network retries from clients or mobile apps cause duplicate booking requests and double payment attempts.
- **Remediation Phase**: Phase 2 (API Layer & Request Pipeline)
- **Fix**: Implement `EnsureIdempotency` middleware and `idempotency_keys` storage table per Standard S1.
- **Test**: `IdempotencyKeyTest`
- **Status**: Open

---

### Finding P3-F001: Broad Admin Group Middleware Without Fine-Grained Policy Enforcement (BFLA/BOLA)
- **Severity**: High
- **Location**: `backend/routes/web.php:27` and `app/Http/Middleware/EnsureAdmin.php:23`
- **Evidence**:
  ```php
  Route::middleware(['web', 'admin', 'locale'])->prefix('admin')->group(...)
  ```
  `EnsureAdmin` only verifies if user has `is_admin` flag or any role. No individual route checks `can:properties.delete`, `can:payments.refund`, or uses Model Policies.
- **Impact**: Broken Function Level Authorization (BFLA); any staff user with admin portal access can delete properties, modify financial settings, or trigger sensitive actions.
- **Remediation Phase**: Phase 3 (RBAC & Authorization)
- **Fix**: Introduce Model Policies, register granular `can:resource.action` middleware on all admin routes, and build `PermissionResolver`.
- **Test**: `test_P3_F012_staff_cannot_delete_property`, `RouteInventorySecurityTest`
- **Status**: Open

---

### Finding P3-F002: Missing Scoped Route Model Binding on Nested Resources
- **Severity**: Medium
- **Location**: `backend/routes/web.php:52,75,90`
- **Evidence**:
  ```php
  Route::delete('/{property}/media/{media}', [PropertyController::class, 'deleteMedia']);
  Route::delete('/{experience}/media/{media}', [ExperienceController::class, 'deleteMedia']);
  Route::delete('/{event}/media/{media}', [EventController::class, 'deleteMedia']);
  ```
- **Impact**: BOLA vulnerability; an attacker can pass a `{media}` ID belonging to Property A while calling Property B's delete endpoint.
- **Remediation Phase**: Phase 3 (RBAC & Authorization)
- **Fix**: Enforce `->scopeBindings()` on all nested routes and verify parent-child relation.
- **Test**: `ScopedRouteBindingsTest`
- **Status**: Open

---

### Finding P4-F001: Absence of Enforced Two-Factor Authentication (2FA) for Administrative Roles
- **Severity**: High
- **Location**: `app/Http/Controllers/Auth/LoginController.php`
- **Evidence**: Admin login completes immediately upon password verification without TOTP challenge or 2FA state machine.
- **Impact**: Compromised administrative credentials grant immediate full access to platform infrastructure and guest records.
- **Remediation Phase**: Phase 4 (Authentication & 2FA)
- **Fix**: Implement TOTP state machine (`2fa_pending -> 2fa_verified`), encrypted secret storage, single-use hashed recovery codes, and `EnsureTwoFactorVerified` middleware.
- **Test**: `TwoFactorPendingCannotAccessAdminTest`, `RecoveryCodeSingleUseTest`
- **Status**: Open

---

### Finding P5-F001: Double-Booking Concurrency Vulnerability
- **Severity**: Critical
- **Location**: `app/Modules/Booking/Application/Actions/CreateBookingAction.php` and `database/migrations/2024_01_01_000020_create_bookings_table.php`
- **Evidence**: Availability validation and booking creation run without database-level exclusion constraint (`btree_gist` daterange exclusion) and without row-level lock ordering.
- **Impact**: Concurrent requests for the same villa on overlapping dates succeed, causing double-booking.
- **Remediation Phase**: Phase 5 (Booking & Concurrency)
- **Fix**: Implement PostgreSQL exclusion constraint `EXCLUDE USING gist (bookable_id WITH =, daterange(check_in, check_out, '[)') WITH &&)` and pessimistic `lockForUpdate()` fallback with deadlock retry.
- **Test**: `ConcurrentBookingSameInventoryTest` (100 parallel workers)
- **Status**: Open

---

### Finding P5-F002: Booking Reference Enumeration and Confirmation IDOR
- **Severity**: Medium
- **Location**: `app/Http/Controllers/CheckoutController.php:156`
- **Evidence**: `GET /checkout/confirmation/{reference}` looks up booking solely by reference code without guest session token verification or rate-limiting.
- **Impact**: Enumeration of guest full names, contact info, and booking amounts.
- **Remediation Phase**: Phase 5 (Booking & Concurrency)
- **Fix**: Require authenticated ownership or temporary signed token (`booking_access_token`) with timing-equalized 404/403 responses and IP throttling.
- **Test**: `ConfirmationPageIdorTest`, `BookingEnumerationThrottleTest`
- **Status**: Open

---

### Finding P6-F001: Simulated Payment Integration Lacking Cryptographic Webhook Verification
- **Severity**: High
- **Location**: `app/Services/Payment/Gateways/CardGateway.php` and `app/Services/Payment/Gateways/PayPalGateway.php`
- **Evidence**: Payment confirmations rely on synchronous HTTP mocks without constant-time signature verification, replay prevention, or idempotency deduplication tables.
- **Impact**: Insecure financial state transitions; vulnerability to replay attacks.
- **Remediation Phase**: Phase 6 (Payment & Financial Integrity)
- **Fix**: Implement `webhook_events` deduplication table, constant-time `hash_equals` signature verification, and transactional state machine.
- **Test**: `DuplicateWebhookNoSideEffectsTest`, `WebhookInvalidSignatureTest`
- **Status**: Open

---

### Finding P7-F001: Media Uploads Stored Publicly Without MIME-Type Enforcement
- **Severity**: Medium
- **Location**: `app/Http/Controllers/Admin/PropertyController.php:145` and `app/Services/MediaService.php`
- **Evidence**: Files stored on `public` disk directly using user-supplied names or basic extensions; lack of re-encoding or private disk isolation for sensitive files (e.g. wire transfer receipts).
- **Impact**: Risk of malicious file uploads and unauthorized access to customer documents.
- **Remediation Phase**: Phase 7 (PII & Media Security)
- **Fix**: Secure upload pipeline: strict MIME checking, ULID filenames, image re-encoding, and private disk isolation (`storage/app/private`) for sensitive documents.
- **Test**: `UploadRejectsExecutableTest`, `PrivateFileNotPubliclyAccessibleTest`
- **Status**: Open

---

### Finding P8-F001: Database Layer Lacking PostgreSQL Production Constraints and Indexes
- **Severity**: High
- **Location**: `database/migrations/`
- **Evidence**: SQLite does not enforce check constraints (`amount >= 0`, `check_out > check_in`), foreign key indexes are not created automatically, and string lengths are unconstrained.
- **Impact**: Data corruption, slow join queries on large datasets, and foreign key lock contention.
- **Remediation Phase**: Phase 8 (PostgreSQL Migration & Data Layer)
- **Fix**: Comprehensive migration audit, explicit FK indexing, check constraints, and UTC timestamptz standardization.
- **Test**: `MigrationsFreshOnPostgresTest`, `CheckConstraintsTest`
- **Status**: Open

---

### Finding P9-F001: Unpaginated Heavy Queries in Admin Dashboard Controller
- **Severity**: Medium
- **Location**: `app/Http/Controllers/Admin/DashboardController.php:110,191,220,272`
- **Evidence**: `Booking::with(...)->get()`, `Property::all()`, `Customer::all()`, and `Experience::all()` executed without limits or pagination.
- **Impact**: 28 queries per page load; high memory consumption and latency degradation as dataset grows.
- **Remediation Phase**: Phase 9 (Performance & Caching)
- **Fix**: Replace `all()` with paginated/chunked queries, composite indexes, and cached dashboard aggregate queries.
- **Test**: Query-budget assertion tests
- **Status**: Open

---

### Finding P9-F002: Lazy Loading Violations in Admin Index Views
- **Severity**: Low
- **Location**:
  - `resources/views/admin/events/index.blade.php:32`
  - `resources/views/admin/experiences/index.blade.php:28`
  - `resources/views/admin/properties/index.blade.php:45`
- **Evidence**: Strict mode trial in P0-T08 threw `LazyLoadingViolationException` on accessing `media` relation inside Blade loops.
- **Impact**: N+1 query proliferation on admin listing screens.
- **Remediation Phase**: Phase 9 (Performance & Caching)
- **Fix**: Add eager loading `with(['media'])` to controllers.
- **Status**: Open

---

### Finding P10-F001: Synchronous Side-Effect Execution in Web Request Loop
- **Severity**: Medium
- **Location**: `app/Http/Controllers/CheckoutController.php` and `app/Http/Controllers/HomeController.php`
- **Evidence**: Lead notifications and booking confirmations lack background queue job dispatching.
- **Impact**: Request timeouts during third-party email/SMS failures and potential lost notifications.
- **Remediation Phase**: Phase 10 (Observability, Queues, Audit)
- **Fix**: Dispatch asynchronous idempotent jobs implementing `ShouldQueue` and `ShouldBeUnique`.
- **Test**: Queue dispatch and failure retry tests
- **Status**: Open
