# PHASE 9 — API SECURITY & ROUTE BOUNDARY MATRIX

## 1. Executive Summary

Phase 9 establishes complete verification of every externally reachable API and web route. All routes enforce explicit boundaries: authentication requirements, RBAC permissions, rate limits, input validations, security headers, and protection against IDOR, BOLA, and account enumeration.

---

## 2. API Route Security Matrix

| HTTP Method | Route URI | Controller Action | Auth Guard | Authorization Policy | Rate Limit | Security Headers |
|---|---|---|---|---|---|---|
| `GET` | `/api/v1/stays` | `StayController@index` | Public | None | `api` (60/min) | Yes (nosniff, SAMEORIGIN, etc.) |
| `GET` | `/api/v1/stays/{slug}` | `StayController@show` | Public | None | `api` (60/min) | Yes |
| `GET` | `/api/v1/experiences` | `ExperienceController@index` | Public | None | `api` (60/min) | Yes |
| `GET` | `/api/v1/experiences/{slug}` | `ExperienceController@show` | Public | None | `api` (60/min) | Yes |
| `GET` | `/api/v1/events` | `EventController@index` | Public | None | `api` (60/min) | Yes |
| `GET` | `/api/v1/events/{slug}` | `EventController@show` | Public | None | `api` (60/min) | Yes |
| `POST` | `/api/v1/checkout/quote` | `PublicCheckoutController@quote` | Public | None | `quote` (60/min) | Yes |
| `POST` | `/api/v1/checkout/bookings` | `PublicCheckoutController@createBooking` | Public/Guest | Token/Signature | `booking` (10/min) | Yes |
| `GET` | `/api/v1/checkout/bookings/{ref}` | `PublicCheckoutController@showBooking` | Token / Signed | Token Hash Matching | `booking_confirmation` (15/min) | Yes |
| `POST` | `/api/v1/webhooks/payments` | `PaymentWebhookController@handle` | HMAC Signature | `VerifyWebhookSignature` | `webhooks` (120/min) | Yes |
| `POST` | `/api/v1/auth/login` | `AuthController@login` | Public | Rate limited | `auth` (5/min by email, 20 by IP) | Yes |
| `POST` | `/api/v1/auth/logout` | `AuthController@logout` | `sanctum` | Authenticated Token | `api` (60/min) | Yes |
| `GET` | `/api/v1/me` | `AuthController@me` | `sanctum` | Authenticated Token | `api` (60/min) | Yes |
| `GET` | `/api/v1/me/abilities` | `AuthController@abilities` | `sanctum` | Authenticated Token | `api` (60/min) | Yes |
| `POST` | `/api/v1/me/change-password` | `AuthController@changePassword` | `sanctum` | Current password verification | `auth` (5/min) | Yes |
| `GET` | `/api/v1/customer/bookings` | `CustomerBookingController@index` | `sanctum` | `CustomerPolicy` (own bookings only) | `api` (60/min) | Yes |
| `GET` | `/api/v1/customer/bookings/{ref}` | `CustomerBookingController@show` | `sanctum` | `BookingPolicy@view` (own record) | `api` (60/min) | Yes |
| `POST` | `/api/v1/customer/bookings/{ref}/cancel`| `CustomerBookingController@cancel` | `sanctum` | `BookingPolicy@cancel` (own record) | `booking` (10/min) | Yes |
| `GET` | `/admin/properties` | `Admin\PropertyController@index` | `web` | `can:properties.view` | `web` | Yes |
| `POST` | `/admin/properties` | `Admin\PropertyController@store` | `web` | `can:properties.create` | `web` | Yes |
| `PUT` | `/admin/properties/{property}` | `Admin\PropertyController@update` | `web` | `can:properties.edit` | `web` | Yes |
| `DELETE` | `/admin/properties/{property}` | `Admin\PropertyController@destroy` | `web` | `can:properties.delete` | `web` | Yes |

---

## 3. Mandatory Security Headers Applied

All web and API responses pass through `ApplySecurityHeaders` middleware:
- `X-Content-Type-Options: nosniff`: Prevents MIME-type sniffing attacks.
- `X-Frame-Options: SAMEORIGIN`: Prevents UI redressing and clickjacking.
- `X-XSS-Protection: 1; mode=block`: Activates browser legacy XSS filter.
- `Referrer-Policy: strict-origin-when-cross-origin`: Restricts referrer data leakage across origins.
- `Permissions-Policy: camera=(), microphone=(), geolocation=(self)`: Restricts sensitive device hardware APIs.
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`: Mandated over HTTPS/production connections.
