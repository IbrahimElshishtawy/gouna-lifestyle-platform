# GouNow Security Audit — 01. Attack Surface Mapping

**Assessment Date:** October 22, 2026  
**Status:** Comprehensive Analysis Complete  

---

## 1. External & Public Surface (Unauthenticated)

The public attack surface comprises all endpoints accessible to an untrusted internet client without prior credentials or session tokens.

### A. Public Catalog & Inquiries
- `GET /api/v1/stays`, `GET /api/v1/stays/{slug}`: Public property listings, unit options, seasonal rates, and availability.
- `GET /api/v1/experiences`, `GET /api/v1/experiences/{slug}`: Excursions, private yacht trips, activities.
- `GET /api/v1/events`, `GET /api/v1/events/{slug}`: Local events, ticket packages.
- `POST /api/v1/stays/{slug}/inquire`, `POST /api/v1/experiences/{slug}/inquire`: Inbound sales leads (throttled by `throttle:inquiries` at 20 requests/minute).
- `POST /api/v1/concierge/leads`: Luxury concierge inquiry lead generation.

### B. Checkout & Booking Initiation
- `POST /api/v1/checkout/quote`: Dynamic price calculation with promotion code evaluation (throttled by `throttle:quote`).
- `POST /api/v1/checkout/bookings`: Atomic reservation creation, customer provisioning, and payment transaction creation (protected by `throttle:booking`, 10 req/min, and mandatory `Idempotency-Key` header).
- `GET /api/v1/checkout/bookings/{reference}`: Reservation state display. Protected by IDOR controls: requires either an authenticated owner or a valid `token` query matching `booking_access_token`.

### C. Public Authentication & Registration
- `POST /api/v1/auth/register`: Public customer account creation.
- `POST /api/v1/auth/login`: Sanctum token issuance and session login. Protected by dual rate limiting (`throttle:auth`: 5 attempts/min per email+IP, 20 attempts/min per IP).
- `POST /api/v1/auth/forgot-password`, `POST /api/v1/auth/reset-password`: Password reset flows via cryptographic tokens.

---

## 2. Authenticated Customer Surface

Accessible only to callers bearing a valid customer Sanctum Bearer token (`auth:sanctum`) with an active account status (`account.active`).

- `GET /api/v1/customer/profile`: Read personal profile.
- `PUT /api/v1/customer/profile`: Update personal contact details.
- `GET /api/v1/customer/bookings`: Paginated listing of personal reservations (strictly scoped to `customer_id`).
- `GET /api/v1/customer/bookings/{reference}`: Detailed reservation view (strictly scoped to `customer_id`).
- `POST /api/v1/customer/bookings/{reference}/cancel`: Customer-initiated cancellation obeying dynamic cancellation policies.
- `GET /api/v1/me/sessions`, `POST /api/v1/me/logout-all`: Active session and token revocation.

---

## 3. Administrative Surface

Accessible strictly to users with `is_admin = true`, assigned administrative roles, and confirmed 2FA (`['auth:sanctum', 'account.active', 'admin', '2fa']`).

### A. Core Management
- `/api/v1/admin/dashboard`: Real-time operational metrics, revenue analytics, occupancy rates.
- `/api/v1/admin/bookings/*`: Reservation approval, check-in, check-out, manual stay extension, refunds.
- `/api/v1/admin/properties/*`, `/api/v1/admin/units/*`: Inventory management, unit pricing, rate rules.
- `/api/v1/admin/finance/*`: Payment transaction inspection, manual payment proof verification/rejection.
- `/api/v1/admin/users/*`: Administrative user CRUD, session termination, account suspension.
- `/api/v1/admin/roles/*`: RBAC permission matrix adjustments.

### B. Export Endpoints
- `/api/v1/admin/export/*` & alias `/api/v1/api/v1/admin/export/*`: Full database dumps in JSON, Excel, and Word formats. Protected by strict `admin` and `2fa` middleware.

---

## 4. Payment Gateway & Webhook Surface

- `POST /api/v1/webhooks/payments`: Paymob and external gateway server-to-server transaction status callbacks.
  - **Security Controls:**
    - Protected by `throttle:webhooks` (120 req/min).
    - Verified by `WebhookSignatureVerifier`: calculates SHA-512 HMAC across ordered Paymob payload keys.
    - Idempotency guard: duplicate transaction references are logged and short-circuited.
    - Rejects placeholder secrets in production mode.

---

## 5. Storage & Upload Surface

- `POST /api/v1/checkout/bookings/{reference}/payment-proof`: Upload of bank transfer/Instapay receipts (max 5MB; jpeg, png, webp, pdf only).
- `GET /api/v1/checkout/bookings/{reference}/receipt/{proofId}`: Download of private bank receipts. Strictly gated: requires authenticated booking owner, admin/finance role, or valid `booking_access_token`.
- `POST /api/v1/admin/media-design/upload`: Administrative asset uploads for homepage hero/media CMS. Validated by `MediaService` (max 50MB, magic-byte inspection, UUID storage).
