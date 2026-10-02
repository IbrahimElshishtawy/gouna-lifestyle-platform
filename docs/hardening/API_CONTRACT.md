# GouNow API Contract Specification (OpenAPI 3 Compatible)

> **Document Status**: ACTIVE (Version 1.0.0)  
> **Base URL**: `/api/v1`  
> **Protocol**: HTTPS / JSON  
> **Compliance**: Standard S1 (Request Pipeline) & Standard S2 (Response Envelopes)

---

## 1. Global Request Headers

| Header | Type | Required? | Description |
|---|---|---|---|
| `Accept` | string | **Required** | Must be `application/json`. |
| `Content-Type` | string | Required on POST/PUT | Must be `application/json`. |
| `X-Request-ID` | string (UUID) | Optional | Client-provided correlation ID. Emitted back in response. |
| `Idempotency-Key` | string | **Required on mutations** | 16–64 char unique key for deduplication. |
| `Authorization` | string | Required on customer/admin | `Bearer <token>` for token auth. |
| `X-XSRF-TOKEN` | string | Required on SPA mutations | CSRF protection token for session cookie mode. |

---

## 2. Global Response Headers

| Header | Description |
|---|---|
| `X-Request-ID` | Unique correlation ID associated with the execution. |
| `Retry-After` | Present on HTTP 429 and in-flight 409 responses, indicating seconds to wait. |
| `X-Idempotent` | Emitted when a response was served from idempotency deduplication cache. |

---

## 3. Endpoints Catalog

### 3.1 Public Stays (Properties)
- `GET /api/v1/stays`:
  - **Query Parameters**:
    - `page` (int, default 1)
    - `per_page` (int, default 15, max 100)
    - `sort` (string, whitelist: `base_price_cents`, `bedrooms`, `bathrooms`, `created_at`, prefix `-` for descending)
    - `filter[bedrooms]` (int)
    - `filter[bathrooms]` (int)
    - `filter[compound]` (string)
    - `include` (comma-separated, whitelist: `category`, `location`, `amenities`, `media`)
    - `q` (string, text search on title/compound)
  - **Response 200**: `{ "data": [ PropertyResource ], "meta": { ... } }`

- `GET /api/v1/stays/{slug}`:
  - **Path Parameters**: `slug` (string or integer ID)
  - **Response 200**: `{ "data": PropertyResource, "meta": { ... } }`
  - **Response 404**: Standard `RESOURCE_NOT_FOUND` error envelope.

---

### 3.2 Curated Experiences
- `GET /api/v1/experiences`:
  - **Query Parameters**: `page`, `per_page` (max 100), `sort` (`base_price_cents`, `duration`, `created_at`), `filter[experience_category_id]`, `q`
  - **Response 200**: `{ "data": [ ExperienceResource ], "meta": { ... } }`

- `GET /api/v1/experiences/{slug}`:
  - **Response 200**: `{ "data": ExperienceResource, "meta": { ... } }`

---

### 3.3 Lifestyle Events
- `GET /api/v1/events`:
  - **Query Parameters**: `page`, `per_page` (max 100), `sort` (`event_date`, `created_at`), `filter[category]`, `q`
  - **Response 200**: `{ "data": [ EventResource ], "meta": { ... } }`

- `GET /api/v1/events/{slug}`:
  - **Response 200**: `{ "data": EventResource, "meta": { ... } }`

---

### 3.4 Checkout & Booking Engine
- `POST /api/v1/checkout/quote`:
  - **Rate Limit**: 10 requests / min (`throttle:booking`)
  - **Request Body**:
    ```json
    {
      "property_id": 14,
      "check_in": "2026-11-01",
      "check_out": "2026-11-05",
      "guests": 4,
      "promo_code": "SUMMER2026"
    }
    ```
  - **Response 200**:
    ```json
    {
      "data": {
        "type": "quotes",
        "attributes": {
          "property_id": 14,
          "check_in": "2026-11-01",
          "check_out": "2026-11-05",
          "nights": 4,
          "guests": 4,
          "pricing": {
            "nightly_rate_cents": 250000,
            "subtotal_cents": 1000000,
            "cleaning_fee_cents": 50000,
            "service_fee_cents": 30000,
            "tax_cents": 140000,
            "discount_cents": 100000,
            "total_cents": 1120000,
            "deposit_cents": 336000,
            "currency": "EGP"
          }
        }
      },
      "meta": { "request_id": "...", "timestamp": "..." }
    }
    ```

- `POST /api/v1/checkout/bookings`:
  - **Required Header**: `Idempotency-Key` (UUID v4)
  - **Rate Limit**: 10 requests / min (`throttle:booking`)
  - **Request Body**:
    ```json
    {
      "property_id": 14,
      "check_in": "2026-11-01",
      "check_out": "2026-11-05",
      "guests": 4,
      "first_name": "Karim",
      "last_name": "Mostafa",
      "email": "karim@example.com",
      "phone": "+201012345678",
      "payment_method": "card",
      "special_requests": "Late check-in requested."
    }
    ```
  - **Response 201**: `{ "data": BookingResource, "meta": { "redirect_url": "...", "request_id": "..." } }`
  - **Response 409**:
    - `AVAILABILITY_COLLISION`: Villa booked during selected dates.
    - `IDEMPOTENCY_CONFLICT`: Reused key with different payload.

- `GET /api/v1/checkout/bookings/{reference}`:
  - **Path Parameters**: `reference` (string, e.g. `GN-2026-9812`)
  - **Response 200**: `{ "data": BookingResource, "meta": { ... } }`

---

### 3.5 Customer Account (Authenticated)
- `GET /api/v1/customer/me`:
  - **Protection**: `auth:sanctum`
  - **Response 200**: `{ "data": { "id": 1, "name": "...", "email": "...", "abilities": [...] }, "meta": { ... } }`

- `GET /api/v1/customer/bookings`:
  - **Protection**: `auth:sanctum`
  - **Response 200**: `{ "data": [ BookingResource ], "meta": { ... } }`

---

### 3.6 Authentication (ADR-003)
- `POST /api/v1/auth/login`:
  - **Rate Limit**: 5 attempts / min per IP+email (`throttle:auth`)
  - **Request Body**: `{ "email": "...", "password": "...", "token": false }`
  - **Response 200**: `{ "data": { "user": ..., "token": null }, "meta": { ... } }` (Session cookie issued)

- `POST /api/v1/auth/logout`:
  - **Protection**: `auth:sanctum`
  - **Response 200**: `{ "data": { "message": "Successfully logged out." }, "meta": { ... } }`

---

### 3.7 Webhooks
- `POST /api/v1/webhooks/payments`:
  - **Protection**: `throttle:webhooks`, `webhook.signature`
  - **Response 200**: `{ "data": { "acknowledged": true, "reference": "..." }, "meta": { ... } }`
