# GouNow Hardening — Out of Scope Backlog

| ID | Description | File / Location | Severity | Suggested Phase | Notes |
|---|---|---|---|---|---|
| BL-001 | Pre-existing test failure: Homepage branding copy drift (`Discover El Gouna with GouNow`) | `tests/Feature/PublicFrontendTest.php:130` | Low | Phase 1 / Phase 2 | Test string expectation diverges from official El Gouna branding update in commit 08185ac |
| BL-002 | Strict Mode Lazy Loading: `Event` model lazy-loads `media` collection | `resources/views/admin/events/index.blade.php:32` | Medium | Phase 9 (Performance) | Discovered in P0-T08 trial run; needs eager loading `with('media')` |
| BL-003 | Strict Mode Lazy Loading: `Experience` model lazy-loads `media` collection | `resources/views/admin/experiences/index.blade.php:28` | Medium | Phase 9 (Performance) | Discovered in P0-T08 trial run; needs eager loading `with('media')` |
| BL-004 | Strict Mode Lazy Loading: `Property` model lazy-loads `media` collection | `resources/views/admin/properties/index.blade.php:45` | Medium | Phase 9 (Performance) | Discovered in P0-T08 trial run; needs eager loading `with('media')` |
| BL-005 | PHPStan analysis: `$this` undefined in Artisan closure | `routes/console.php:7` | Info | Phase 2 | Typical Laravel 11/12 default closure in console.php |
| BL-006 | 72 configuration variables referenced in `config/*.php` absent from `.env.example` | `.env.example` vs `config/` | Low | Phase 2 / Phase 8 | Comprehensive environment template update |
| BL-007 | FINDING-001: Webhook HMAC Cryptographic Signature Placeholder | `backend/app/Http/Middleware/VerifyWebhookSignature.php` | High / P0 | Phase 6 (Payments) | Mandatory precondition for payment integration |
| BL-008 | FINDING-003: Cross-User Idempotency Key Isolation Partitioning | `backend/app/Http/Middleware/EnsureIdempotency.php` | Medium / P1 | Phase 8 (PostgreSQL) | Partition key hashing by actor context (`user_id ?? ip`) |
| BL-009 | FINDING-004: Web Blade Checkout Idempotency Enforcement | `backend/routes/web.php` (`POST /checkout/process`) | Medium / P2 | Phase 6 (Payments) | Attach idempotency middleware or one-time token |
