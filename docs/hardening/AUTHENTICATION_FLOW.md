# GouNow Authentication & Session Architecture (ADR-003)

> **Document Status**: IMPLEMENTED & TESTED  
> **Target Boundaries**: Next.js 14 App (`frontend/`), Laravel 12 API (`backend/`), Mobile Clients

---

## 1. Authentication Modalities

The GouNow platform implements a dual-mode authentication architecture governed by Laravel Sanctum:

1. **SPA Session Cookie Mode (Primary for Web & Next.js)**:
   - Next.js web application interacts using `httpOnly`, `SameSite=Lax`, `Secure` session cookies.
   - CSRF protection via Laravel's double-submit `/sanctum/csrf-cookie` endpoint and `X-XSRF-TOKEN` header.
   - Zero storage of credentials in `localStorage` or `sessionStorage` (preventing XSS credential theft).

2. **Bearer Token Mode (Primary for Native Mobile / External Partners)**:
   - Native mobile applications (Flutter) or server-to-server partners authenticate via `POST /api/v1/auth/login` with `token=true`.
   - Backend issues a cryptographically secure Sanctum personal access token.
   - Token is passed via `Authorization: Bearer <plainTextToken>` header.

---

## 2. SPA Session Authentication Lifecycle (Mermaid)

```mermaid
sequenceDiagram
    autonumber
    actor Browser as User Browser / Next.js
    participant NextServer as Next.js Server (SSR)
    participant LaravelAPI as Laravel Backend API
    participant DB as Session Store / Database

    Note over Browser,LaravelAPI: Step 1: CSRF Initialization
    Browser->>LaravelAPI: GET /sanctum/csrf-cookie
    LaravelAPI-->>Browser: Set-Cookie: XSRF-TOKEN (readable by JS) & laravel_session (httpOnly)

    Note over Browser,LaravelAPI: Step 2: Login Request
    Browser->>LaravelAPI: POST /api/v1/auth/login (email, password)<br/>Header: X-XSRF-TOKEN
    LaravelAPI->>LaravelAPI: RateLimiter check (limit 5/min per IP+email)
    LaravelAPI->>DB: Verify credentials & Ensure is_active = true
    LaravelAPI->>LaravelAPI: session()->regenerate()
    LaravelAPI-->>Browser: 200 OK + Updated session cookie + User Resource

    Note over Browser,LaravelAPI: Step 3: Authenticated Request
    Browser->>LaravelAPI: GET /api/v1/customer/me (Cookie: laravel_session)
    LaravelAPI->>DB: Resolve session & authenticate User
    LaravelAPI-->>Browser: 200 OK { data: { user: ..., abilities: [...] } }

    Note over Browser,LaravelAPI: Step 4: Logout
    Browser->>LaravelAPI: POST /api/v1/auth/logout<br/>Header: X-XSRF-TOKEN
    LaravelAPI->>DB: Invalidate session in database
    LaravelAPI-->>Browser: 200 OK + Cleared session cookie
```

---

## 3. Personal Access Token Lifecycle (Mermaid)

```mermaid
sequenceDiagram
    autonumber
    actor MobileClient as Flutter / Mobile Client
    participant LaravelAPI as Laravel Backend API
    participant DB as Personal Access Tokens Table

    MobileClient->>LaravelAPI: POST /api/v1/auth/login<br/>Body: { email, password, token: true, device_name: "Pixel-7" }
    LaravelAPI->>LaravelAPI: RateLimiter check (5/min per IP+email)
    LaravelAPI->>LaravelAPI: Validate credentials & is_active = true
    LaravelAPI->>DB: INSERT into personal_access_tokens (hashed token)
    LaravelAPI-->>MobileClient: 200 OK { data: { token: "1|abcdef...", token_type: "Bearer" } }

    Note over MobileClient,LaravelAPI: Subsequent API Request
    MobileClient->>LaravelAPI: GET /api/v1/customer/me<br/>Header: Authorization: Bearer 1|abcdef...
    LaravelAPI->>DB: Lookup token hash & verify expiration
    LaravelAPI-->>MobileClient: 200 OK { data: { user: ..., abilities: [...] } }
```

---

## 4. Rate Limiting Safeguards

To defeat credential stuffing and brute-force attacks:
- The `auth` named rate limiter enforces a strict ceiling of **5 attempts per minute per IP + email address combination**.
- Upon reaching the limit, the server immediately emits an HTTP 429 response:
  ```json
  {
    "error": {
      "code": "RATE_LIMIT_EXCEEDED",
      "message": "Too many login attempts. Please try again later.",
      "details": { "retry_after": 48 },
      "request_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "timestamp": "2026-10-02T22:45:00Z"
    }
  }
  ```
  Accompanied by the standard HTTP header `Retry-After: 48`.
