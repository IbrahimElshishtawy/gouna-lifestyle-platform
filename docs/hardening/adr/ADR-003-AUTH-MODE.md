# ADR-003: Authentication Mode Strategy (Sanctum SPA Cookie vs API Tokens)

## Context & Problem Statement
The GouNow platform consists of a Laravel 12 backend (`backend/`) and a Next.js 14 frontend (`frontend/`). The system must support:
1. Web browsers navigating public listings, managing customer bookings, and accessing administrative tools.
2. Next.js executing both Server-Side Rendering (SSR) data fetches and client-side user interactions.
3. Future native mobile applications (e.g. Flutter client) or third-party partner integrations requiring headless API access.

We must define the authoritative authentication mechanism, session lifecycle, CSRF defense, and credential storage model to prevent token theft (XSS) and unauthorized cross-origin requests (CSRF).

---

## Decision

We adopt a **Dual-Mode Authentication Architecture powered by Laravel Sanctum**:

### 1. Primary Mode for Web & Next.js: First-Party Stateful Cookie Authentication
For the Next.js frontend (both browser interactions and SSR proxying) and Blade portals:
- Authentication utilizes encrypted, `httpOnly`, `SameSite=Lax`, `Secure` session cookies.
- Laravel Sanctum `EnsureFrontendRequestsAreStateful` middleware (`statefulApi()`) is enabled for authorized origins.
- Next.js fetches `/sanctum/csrf-cookie` prior to state-mutating requests (`POST`, `PUT`, `DELETE`), passing the `X-XSRF-TOKEN` header.
- **Security Justification**: Storing access tokens in `localStorage` or `sessionStorage` exposes credentials to XSS vulnerabilities. By utilizing `httpOnly` cookies, JavaScript execution cannot extract credentials.

### 2. Secondary Mode for Mobile & Headless Partners: Personal Access Bearer Tokens
For native mobile clients (Flutter) or programmatic API access:
- Clients issue credentials to `POST /api/v1/auth/token` and receive a cryptographically random, hashed Bearer token (`plainTextToken`).
- Sanctum guards the endpoints via `auth:sanctum` which seamlessly supports both session cookies and `Bearer` headers.
- Tokens enforce explicit abilities (`['*']`, `['customer:booking']`, `['admin:properties']`) and expiration policies.

---

## Configuration Specifics

### Backend Environment & Session Config:
- `SESSION_DRIVER=database` (or `redis`)
- `SESSION_LIFETIME=120` (minutes)
- `SESSION_SECURE_COOKIE=true` (in production, false in local dev when HTTP)
- `SESSION_HTTP_ONLY=true`
- `SESSION_SAME_SITE=lax`
- `SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000,gounow.com,app.gounow.com`

### CORS Configuration:
- `supports_credentials => true`
- `allowed_origins => [env('FRONTEND_URL', 'http://localhost:3000')]`
- `allowed_methods => ['*']`
- `allowed_headers => ['Content-Type', 'X-Requested-With', 'Authorization', 'X-XSRF-TOKEN', 'X-Request-ID', 'Idempotency-Key']`

---

## Consequences
- **Positive**: Complete defense against token theft via XSS for web users; seamless compatibility with SSR; zero overhead for mobile API consumers.
- **Negative / Trade-off**: Next.js SSR requests that require user authentication must forward the `Cookie` header from incoming browser requests to the Laravel backend.
