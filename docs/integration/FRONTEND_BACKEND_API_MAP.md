# Frontend ↔ Backend API Contract Map

This document catalogues every backend endpoint exposed by the GouNow Laravel API (`/api/v1`) along with request requirements, response structures, and frontend consumption points.

---

## 1. Public Endpoints (`routes/api/v1/public.php`)

### 1.1 Stays / Properties
- **List Properties**:
  - `GET /api/v1/stays`
  - **Auth**: None (Public)
  - **Query Params**:
    - `q` (string): Text search across title, compound, and reference code.
    - `guests` (int): Filter by minimum guest capacity (`max_guests >= guests`).
    - `min_price` (int): Filter by minimum base price in cents.
    - `max_price` (int): Filter by maximum base price in cents.
    - `filter[listing_type]` (string): `rent` or `sale`.
    - `filter[bedrooms]` (int): Bedroom count.
    - `filter[bathrooms]` (int): Bathroom count.
    - `filter[compound]` (string): Compound / area slug.
    - `sort` (string): `id`, `base_price_cents`, `bedrooms`, `bathrooms`, `created_at` (prefix `-` for desc).
    - `include` (string): Comma-separated relationships (`category`, `location`, `amenities`, `media`).
    - `page` (int), `per_page` (int).
  - **Response (200 OK)**:
    - JSON:API collection with `data: Array<{ id, type: 'properties', attributes, relationships }>`, `links`, `meta`.
  - **Frontend Consumer**: `frontend/src/features/properties/services/properties.api.ts` -> `getProperties()`

- **Property Detail**:
  - `GET /api/v1/stays/{slug}`
  - **Auth**: None (Public)
  - **Query Params**: `include=category,location,amenities,media`
  - **Response (200 OK / 404 Not Found)**:
    - `{ data: { id, type: 'properties', attributes: {...}, relationships: {...} } }`
  - **Frontend Consumer**: `frontend/src/features/properties/services/properties.api.ts` -> `getPropertyBySlug()`

---

### 1.2 Experiences & Activities
- **List Experiences**:
  - `GET /api/v1/experiences`
  - **Auth**: None (Public)
  - **Response (200 OK)**:
    - `{ data: Array<{ id, type: 'experiences', attributes: {...}, relationships: {...} }>, links, meta }`
  - **Frontend Consumer**: `frontend/src/features/experiences/services/experiences.api.ts` -> `getExperiences()`

- **Experience Detail**:
  - `GET /api/v1/experiences/{slug}`
  - **Auth**: None (Public)
  - **Response (200 OK / 404 Not Found)**:
    - `{ data: { id, type: 'experiences', attributes: {...}, relationships: {...} } }`
  - **Frontend Consumer**: `frontend/src/features/experiences/services/experiences.api.ts` -> `getExperienceBySlug()`

---

### 1.3 Events & Nightlife
- **List Events**:
  - `GET /api/v1/events`
  - **Auth**: None (Public)
  - **Response (200 OK)**:
    - `{ data: Array<{ id, type: 'events', attributes: {...} }>, links, meta }`
  - **Frontend Consumer**: `frontend/src/features/home/components/EventsSection.tsx`

---

### 1.4 Checkout & Booking Engine
- **Calculate Authoritative Quote**:
  - `POST /api/v1/checkout/quote`
  - **Auth**: None (Rate Limited: `throttle:booking`)
  - **Request Body (JSON)**:
    - `property_id` (int, required)
    - `check_in` (date YYYY-MM-DD, required)
    - `check_out` (date YYYY-MM-DD, required)
    - `guests` (int, required, 1-50)
    - `promo_code` (string, optional)
    - *Prohibited*: `total`, `subtotal`, `tax`, `discount_cents`
  - **Response (200 OK / 422 Unprocessable)**:
    - `{ data: { type: 'quotes', attributes: { property_id, check_in, check_out, nights, guests, pricing: { nightly_rate_cents, subtotal_cents, cleaning_fee_cents, service_fee_cents, tax_cents, discount_cents, total_cents, deposit_cents, currency }, breakdown: [...] } } }`
  - **Frontend Consumer**: `frontend/src/features/properties/services/properties.api.ts` -> `calculateQuote()`

- **Create Booking**:
  - `POST /api/v1/checkout/bookings`
  - **Auth**: None (Rate Limited: `throttle:booking`, Idempotent: `idempotent`)
  - **Headers**: `Idempotency-Key` (UUID / unique string)
  - **Request Body (JSON)**:
    - `property_id` (int, required)
    - `check_in` (date YYYY-MM-DD, required)
    - `check_out` (date YYYY-MM-DD, required)
    - `guests` (int, required)
    - `first_name` (string, required)
    - `last_name` (string, required)
    - `email` (email, required)
    - `phone` (string, required)
    - `special_requests` (string, optional)
    - `promo_code` (string, optional)
    - `payment_method` (string: `card`, `paypal`, `cash`, `bank_transfer`)
    - *Prohibited*: All price and status fields (`total`, `status`, etc.)
  - **Response (201 Created / 409 Conflict / 422 Unprocessable)**:
    - `{ data: { id, type: 'bookings', attributes: { reference, status, payment_status, check_in, check_out, pricing: {...} } }, meta: { request_id, access_token, payment_result, redirect_url } }`
  - **Frontend Consumer**: `frontend/src/features/checkout/services/checkout.api.ts` -> `processCheckout()`

- **Show Booking by Reference**:
  - `GET /api/v1/checkout/bookings/{reference}`
  - **Auth**: Sanctum Authenticated Customer/Staff OR Guest Token (`?token=...` or `X-Booking-Token`) OR Guest Email Verification (`?email=...` or `X-Customer-Email`)
  - **Response (200 OK / 404 Not Found)**:
    - `{ data: { id, type: 'bookings', attributes: {...}, relationships: { bookable, customer } } }`
  - **Frontend Consumer**: `frontend/src/features/checkout/services/checkout.api.ts` -> `getBookingByReference()`

---

### 1.5 Leads & Concierge Inquiries
- **Store Lead**:
  - `POST /api/v1/leads`
  - **Auth**: None (Rate Limited: `throttle:inquiries`)
  - **Request Body (JSON)**:
    - `name` (string, required)
    - `email` (email, required)
    - `phone` (string, optional)
    - `message` (string, required)
    - `type` (string: `concierge`, `general`, `stay`, `experience`, `viewing`, `lead`)
    - `property_id` (int, optional)
  - **Response (201 Created)**:
    - `{ data: { id, message }, meta: { request_id, timestamp } }`
  - **Frontend Consumer**:
    - `frontend/src/features/home/services/home.api.ts` -> `submitConciergeInquiry()`
    - `frontend/src/features/properties/services/properties.api.ts` -> `inquireProperty()`
    - `frontend/src/features/experiences/services/experiences.api.ts` -> `inquireExperience()`

---

### 1.6 Authentication (`routes/api/v1/public.php -> auth`)
- **Login**:
  - `POST /api/v1/auth/login`
  - **Request Body**: `email`, `password`, `remember`, `token` (bool, true for Bearer token)
  - **Response (200 OK)**: `{ data: { user: {...}, token: "...", token_type: "Bearer" } }` (or `{ data: { two_factor_required: true, two_factor_token: "..." } }`)
- **2FA Challenge**:
  - `POST /api/v1/auth/2fa/challenge`
  - **Request Body**: `two_factor_token`, `code` (6 digits)
  - **Response (200 OK)**: `{ data: { user: {...}, token: "...", token_type: "Bearer" } }`
- **2FA Recovery**:
  - `POST /api/v1/auth/2fa/recovery`
  - **Request Body**: `two_factor_token`, `recovery_code`
  - **Response (200 OK)**: `{ data: { user: {...}, token: "...", token_type: "Bearer" } }`
- **Forgot Password**:
  - `POST /api/v1/auth/forgot-password`
  - **Request Body**: `email`
  - **Response (200 OK)**: `{ data: { message: "..." } }`
- **Reset Password**:
  - `POST /api/v1/auth/reset-password`
  - **Request Body**: `email`, `token`, `password`, `password_confirmation`
  - **Response (200 OK)**: `{ data: { message: "..." } }`
- **Logout**:
  - `POST /api/v1/auth/logout`
  - **Auth**: `auth:sanctum`
  - **Response (200 OK)**: `{ data: { message: "Successfully logged out." } }`

---

## 2. Authenticated Profile & Abilities
- **User Profile**: `GET /api/v1/me` (Auth: `auth:sanctum`)
- **User Abilities & Scopes**: `GET /api/v1/me/abilities` (Auth: `auth:sanctum`)
- **Active Sessions**: `GET /api/v1/me/sessions` (Auth: `auth:sanctum`)
- **Logout All Sessions**: `POST /api/v1/me/logout-all` (Auth: `auth:sanctum`)
- **Change Password**: `POST /api/v1/me/change-password` (Auth: `auth:sanctum`)

---

## 3. Customer Routes (`routes/api/v1/customer.php`)
- **Customer Profile**: `GET /api/v1/customer/me`
- **Customer Bookings**: `GET /api/v1/customer/bookings` (Paginated, filtered by customer ownership)
- **Customer Booking Detail**: `GET /api/v1/customer/bookings/{reference}` (Strict IDOR ownership enforced)
- **Cancel Booking**: `POST /api/v1/customer/bookings/{reference}/cancel` (Customer self-service cancellation)

---

## 4. Webhooks (`routes/api/v1/webhooks.php`)
- **Payment Webhook Handler**:
  - `POST /api/v1/webhooks/payments`
  - **Middleware**: `throttle:webhooks`, `webhook.signature`
  - **Note**: Handled exclusively on the backend. Frontend does not consume or proxy webhooks.
