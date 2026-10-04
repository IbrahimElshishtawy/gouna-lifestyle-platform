# GouNow Frontend ↔ Backend Integration Guide

## 1. Executive Architecture

The GouNow platform architecture connects a high-performance Next.js 15 App Router frontend with a hardened Laravel 11 REST API engine, backed by SQLite (local/testing) / PostgreSQL (production), Redis caching & queue workers, and hardened local/S3 asset storage.

```
                         INTERNET
                            │
                            ▼
                     Next.js Frontend (Port 3000)
                            │
                            │ HTTPS / API (Bearer Token / Cookie Sessions)
                            ▼
                     Laravel REST API (Port 8000)
                            │
             ┌──────────────┼──────────────┐
             ▼              ▼              ▼
        PostgreSQL        Redis        File Storage
             │              │
             │              ▼
             │         Queue Workers
             │
             ▼
       Business Logic
             │
      ┌──────┼──────────┐
      ▼      ▼          ▼
   Booking Payment    External APIs
                      / Webhooks
```

---

## 2. Core Integration Principles

1. **Backend as Source of Truth**:
   - The frontend never calculates authoritative prices, never creates bookings directly, and never bypasses backend business validation.
   - All financial numbers (subtotals, taxes, fees, deposits, totals) are authoritative values calculated by the backend domain engine (`CalculateBookingQuoteQuery`).
   - Anti-tampering defense: Injected client pricing fields (`total`, `total_cents`, `price`, etc.) are rejected by FormRequests with HTTP 422.

2. **Normalized API Client (`src/lib/api/client.ts`)**:
   - Centralized fetch wrapper with automatic `Accept: application/json` and `Content-Type: application/json`.
   - Automatic injection of `Authorization: Bearer <token>` when an authenticated session exists.
   - Comprehensive error normalization mapping HTTP status codes (400, 401, 403, 404, 409, 422, 429, 500, 503) to a structured `ApiError` instance.
   - Extraction of `X-Request-ID` from response headers for end-to-end tracing and audit logs.
   - Request timeouts (8000ms default) with abort controller support.

3. **Adapter & Transformation Layer**:
   - The backend utilizes strict JSON:API-compliant resources (`id`, `type`, `attributes`, `relationships`).
   - Feature services (`properties.api.ts`, `experiences.api.ts`) convert backend resource structures into type-safe frontend UI models via explicit adapters (`mapBackendPropertyToFrontend`, `mapBackendExperienceToFrontend`).

4. **Authentication Architecture (`src/lib/api/auth.ts`)**:
   - Authentication endpoint: `POST /api/v1/auth/login`.
   - Supports Bearer token issuance (`token: true` or `X-Auth-Mode: token`) and SPA cookie sessions.
   - Full 2FA TOTP support (`POST /api/v1/auth/2fa/challenge` and `POST /api/v1/auth/2fa/recovery`).
   - Session inspection and ability resolution via `GET /api/v1/me` and `GET /api/v1/me/abilities`.
   - Clean revocation upon logout via `POST /api/v1/auth/logout`.

5. **CORS Security**:
   - Strictly whitelists `http://localhost:3000` and `http://127.0.0.1:3000`.
   - Permits credentials (`Access-Control-Allow-Credentials: true`).
   - Exposes `X-Request-ID`, `Retry-After`, and `X-Idempotent` headers.

---

## 3. Supported User Flows

- **Public Catalog Browsing**: Guests browse filtered, sorted, and paginated vacation rentals (`/stays`), experiences (`/experiences`), and ticketed events (`/events`).
- **Live Quote Generation**: Dynamically fetches authoritative breakdown of nightly rates, 14% VAT, cleaning fee, and service fees for selected dates.
- **Reservation & Idempotent Checkout**: Guests submit reservations with automated idempotency keys (`Idempotency-Key` header) to guarantee duplicate submissions do not result in double bookings.
- **Token-Authorized Booking Confirmation**: Guest access to reservations is secured via cryptographic tokens (`booking_access_token`) preventing IDOR vulnerabilities.
- **Leads & Concierge Inquiries**: Real-time dispatch of concierge and viewing leads directly to backend `leads` table with contextual notes.
- **Executive Administration**: Administrative command center authenticated against Laravel Sanctum with fine-grained role/ability resolution.
