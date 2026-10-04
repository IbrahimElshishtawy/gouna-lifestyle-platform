# Phase 13 — Architecture Certification

**Project**: GouNow Lifestyle Platform  
**Phase**: 13 (Final Production Readiness & Backend Closure)  
**Date**: 2026-10-04  
**Author**: Final Production Readiness Engineer & Senior Backend Architect  
**Status**: **CERTIFIED PRODUCTION ARCHITECTURE**  

---

## 1. Current Architecture Overview

The GouNow platform backend is implemented as a hardened, layered modular monolith built on **Laravel 12 (PHP 8.2+ / 8.5 runtime)**. It powers both the server-rendered Blade administrative and marketing web application and headless API consumers (Next.js frontend web app, native mobile applications, and payment webhook integrations).

The application design strictly enforces layered decoupling:
1. **HTTP / Presentation Layer (`app/Http/Controllers`, `app/Http/Requests`, `app/Http/Resources`, `app/Http/Middleware`)**:
   - Thin controllers orchestrate request validation, authentication, and HTTP responses.
   - FormRequests (`app/Http/Requests/*`) enforce strict input validation, authorization, and prohibit client-injected mass assignment fields.
   - API Resources (`app/Http/Resources/Api/V1/*`) transform domain entities into standardized envelopes (`data`, `meta`) while hiding internal IDs, tokens, and credentials.
   - S1-compliant Middleware Pipeline (`bootstrap/app.php`) enforces Request IDs, trusted proxies, CORS origin whitelisting, JSON enforcement, named rate limiting, session security, and universal exception handling.
2. **Domain & Application Modules (`app/Modules/*`, `app/Services/*`)**:
   - **Booking Module (`app/Modules/Booking/`)**: State machine (`BookingStateMachine`), DTOs (`CreateBookingDTO`), domain actions (`CreateBookingAction`, `CancelBookingAction`, `RecordBookingPaymentAction`).
   - **Pricing Module (`app/Modules/Pricing/`)**: Authoritative calculation queries (`CalculateBookingQuoteQuery`, `AnalyzeSeasonalOverlapQuery`), money value objects (`NightlyRate`, `Money`).
   - **Availability Module (`app/Modules/Availability/`)**: Range checks (`CheckPropertyAvailabilityQuery`), pessimistic concurrency locking (`LockAndValidateAvailabilityAction`), half-open intervals (`[check_in, check_out)`).
   - **Customer Module (`app/Modules/Customer/`)**: Tenant resolution (`FindOrCreateCustomerAction`), query scoping.
   - **Payment Module (`app/Modules/Payment/`, `app/Services/Payment/`)**: State machine, HMAC cryptographic webhook verification (`WebhookSignatureVerifier`), gateway abstractions (`CardGateway`, `PayPalGateway`, `ManualCashGateway`, `ManualBankTransferGateway`).
   - **Lead & Inquiry Module (`app/Modules/Lead/`)**: Structured intake DTOs and CRM event dispatching.
3. **Infrastructure & Shared Layer (`app/Shared/*`, `app/Models/*`)**:
   - Idempotency Engine (`IdempotencyService`, `idempotency_keys` table with SHA-256 payload hashing and atomic execution locks).
   - Database Lock Manager (`DatabaseLockManager` utilizing pessimistic `lockForUpdate` and transaction retries).
   - Sensitive Data Redaction (`SensitiveDataRedactionProcessor` in Monolog).
   - Multi-Tier Authorization Policies (`app/Policies/*` and `PermissionResolver`).

---

## 2. Architectural Strengths

1. **Strict Presentation Decoupling via Shared Actions**:
   Both traditional Blade routes (`routes/web.php`) and REST API routes (`routes/api/v1/*.php`) call identical domain actions (`CreateBookingAction`, `CalculateBookingQuoteQuery`, `FindOrCreateCustomerAction`). This eliminates duplicate business logic while allowing different presentation concerns.
2. **Authoritative Financial Boundary**:
   Clients cannot inject pricing, discounts, fees, currency, or payment statuses. All money calculations occur exclusively server-side using integer minor units (`bigint`/cents).
3. **Pessimistic Concurrency & Exclusion Constraints**:
   Double-booking is prevented through a dual-defense strategy:
   - Application level: Transactional row-level locking (`Property::lockForUpdate()`) and hold expiry verification.
   - Database engine level (PostgreSQL): Kernel GiST exclusion constraint (`bookings_no_double_booking`).
4. **Actor-Scoped Idempotency**:
   Mutating operations (`POST /checkout/bookings`, `POST /checkout/process`) utilize SHA-256 payload hashed idempotency keys partitioned by actor, preventing replay attacks and double charging.
5. **Universal Error Envelope & Information Leakage Prevention**:
   The exception handler (`bootstrap/app.php`) intercepts all API errors, mapping them to uniform JSON envelopes without leaking stack traces, database schemas, or filesystem paths in production.

---

## 3. Weaknesses & Technical Debt Analyzed

1. **Single Repository Database Setup**:
   The application uses a modular monolith sharing a single relational database rather than distributed microservices.
   - *Verdict*: This is an intentional architectural strength for current scale, avoiding distributed transaction complexities (Saga/2PC) and network latency.
2. **Dual Presentation Surface (Blade + Next.js REST API)**:
   The backend supports both traditional Blade views for admin/marketing and REST API v1 for the headless frontend.
   - *Mitigation*: Both surfaces share identical FormRequests, policies, and domain Actions.
3. **External Gateway Mock Fallbacks**:
   Mock payment gateways exist for local testing and automated staging verification.
   - *Remediation*: Explicitly guarded with `abort_unless(app()->environment('local', 'testing'), 403)` to prevent production exposure.

---

## 4. Critical & Medium Findings Addressed

| ID | Component | Severity | Description | Resolution | Status |
|---|---|---|---|---|---|
| **ARC-001** | `CheckoutController@show` (API) | P1 | `GET /api/v1/checkout/bookings/{reference}` allowed lookup without validating guest access token or user ownership, exposing customer PII. | Added multi-tier authorization checking customer ownership, admin roles, guest access token (`?token=`), and email verification. | **FIXED & TESTED** |
| **ARC-002** | `CheckoutController@process` (Web) | P2 | Concurrent double submissions from web forms could race before idempotency check. | Enforced cache atomic submission lock (`checkout_lock_{hash}`) during checkout transaction. | **FIXED & TESTED** |
| **ARC-003** | `WebhookSignatureVerifier` | P0 | Empty or placeholder webhook secret in production could allow forged webhook transactions. | Made webhook verification fail-closed (`return false`) when secrets are missing or set to placeholder in production. | **FIXED & TESTED** |
| **ARC-004** | `MediaService` | P1 | Media uploads could accept disguised polyglot files with PHP tags. | Implemented magic-byte inspection, strict MIME whitelist, 23-extension blacklist, and UUID renames. | **FIXED & TESTED** |
| **ARC-005** | `BookingPolicy@refund` | P1 | Missing alias `paymentTransactions` on Booking model caused policy refund calculation check to fail on un-aliased calls. | Added `paymentTransactions()` relationship alias and ensured ceiling validation against amount paid. | **FIXED & TESTED** |

---

## 5. Accepted Architectural Tradeoffs

1. **Modular Monolith vs Microservices**:
   - *Decision*: Kept as modular monolith.
   - *Technical Justification*: Eliminates network partition risks, avoids distributed data inconsistencies, and maximizes ACID transaction guarantees for financial bookings.
2. **Synchronous Core Operations vs Background Queues**:
   - *Decision*: Booking creation and payment transaction records execute synchronously within ACID transactions; notification dispatching, hold expiration, and media cleanup execute via background workers.
   - *Technical Justification*: Immediate financial consistency is required for reservation confirmation.
3. **Dual-Mode Auth (Cookies for Web, Tokens for Mobile/API)**:
   - *Decision*: Sanctum stateful cookies for first-party web clients; Bearer tokens for external API clients.
   - *Technical Justification*: Best practice for SPA security (prevents XSS token exfiltration via HttpOnly cookies) while offering standard API interoperability.

---

## 6. Architecture Diagram

```
                              +---------------------------------------+
                              |   Client Layer (Web / Mobile / Third) |
                              +---------------------------------------+
                                                 |
                                         HTTPS / TLS 1.3
                                                 v
                              +---------------------------------------+
                              |       Nginx Reverse Proxy / WAF       |
                              | (SSL Termination, Rate Limit, CSP)    |
                              +---------------------------------------+
                                                 |
                                           FastCGI / HTTP
                                                 v
                              +---------------------------------------+
                              |         Laravel 12 HTTP Kernel        |
                              +---------------------------------------+
                                                 |
        +----------------------------------------+----------------------------------------+
        |                                        |                                        |
        v                                        v                                        v
+------------------+                    +------------------+                    +------------------+
| Security Middle- |                    |  Authentication  |                    | Error & Logging  |
| ware Pipeline    |                    | & Dual-Mode Auth |                    | Redaction        |
| (AssignRequestId,|                    | (Sanctum Cookie/ |                    | (Monolog Redact, |
|  SecurityHeaders,|                    |  Bearer Token,   |                    |  ForceJSON,      |
|  CORS, Throttles)|                    |  TOTP 2FA, Rec.) |                    |  Universal Env.) |
+------------------+                    +------------------+                    +------------------+
        |                                        |                                        |
        +----------------------------------------+----------------------------------------+
                                                 |
                                                 v
                              +---------------------------------------+
                              |       Routing & Dispatch Layer        |
                              | - Web Routes (routes/web.php)         |
                              | - Headless API (routes/api/v1/*.php)  |
                              | - Webhook Receivers (routes/api/v1)   |
                              +---------------------------------------+
                                                 |
        +----------------------------------------+----------------------------------------+
        |                                                                                 |
        v                                                                                 v
+-----------------------------+                                           +-----------------------------+
|    Blade Web Presentation   |                                           |     Headless API Layer      |
| - PropertyListingController |                                           | - StayController            |
| - CheckoutController        |                                           | - CheckoutController        |
| - Admin\PropertyController  |                                           | - AuthController            |
| - Admin\DashboardController |                                           | - PaymentWebhookController  |
+-----------------------------+                                           +-----------------------------+
        |                                                                                 |
        +----------------------------------------+----------------------------------------+
                                                 |
                                                 v
                              +---------------------------------------+
                              |    Domain & Application Action Layer  |
                              +---------------------------------------+
                               |                  |                  |
           +-------------------+                  |                  +-------------------+
           v                                      v                                      v
+-----------------------+              +-----------------------+              +-----------------------+
|    Booking Module     |              |    Pricing Module     |              |    Payment Module     |
| - CreateBookingAction |              | - CalculateQuoteQuery |              | - InitiatePaymentAct. |
| - CancelBookingAction |              | - NightlyRate VO      |              | - ConfirmPaymentAct.  |
| - BookingStateMachine |              | - Money Value Object  |              | - WebhookVerifier     |
+-----------------------+              +-----------------------+              +-----------------------+
           |                                      |                                      |
           +-------------------+                  |                  +-------------------+
                               |                  |                  |
                               v                  v                  v
                              +---------------------------------------+
                              | Infrastructure, Storage & Database    |
                              | - PostgreSQL 16 (GiST Exclusions)     |
                              | - Redis 7 (Cache, Locks, Queues)      |
                              | - Storage / S3 (Media UUID Isolation) |
                              +---------------------------------------+
```

---

## 7. Architecture Certification Verdict

The architecture of the GouNow Lifestyle Platform is certified as **SOUND, RESILIENT, AND PRODUCTION-READY**. Layer boundaries are respected, financial and state invariants are enforced at both application and database layers, and information disclosure vectors have been eliminated.
