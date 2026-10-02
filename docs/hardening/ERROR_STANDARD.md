# GouNow API Error Standard (Standard S2)

> **Document Status**: ENFORCED in `bootstrap/app.php`  
> **Target Audience**: Backend Engineers, Frontend Engineers, Mobile Developers

---

## 1. The Universal Error Envelope

Every failed HTTP response on any `/api/*` endpoint strictly conforms to the following JSON structure:

```json
{
  "error": {
    "code": "ERROR_CODE_STRING",
    "message": "Human-readable description in English or active locale.",
    "details": null,
    "request_id": "c7a8b3d0-9f2e-4b1a-8c7e-123456789abc",
    "timestamp": "2026-10-02T22:30:00Z"
  }
}
```

### Key Field Rules:
- `code` (string, required): A machine-readable, SNAKE_CASE string uniquely identifying the error condition.
- `message` (string, required): A concise explanation suitable for logging or user feedback.
- `details` (object|array|null): Granular details (e.g. field validation errors or rate limit remaining retry seconds).
- `request_id` (string, UUID v4): Sourced from the `X-Request-ID` HTTP header for cross-tier log tracing.
- `timestamp` (string, ISO-8601 UTC): Accurate execution timestamp.

---

## 2. Standard Error Catalog

| HTTP Status | Error Code (`code`) | Trigger Condition | Example Details |
|---|---|---|---|
| **400** | `MISSING_IDEMPOTENCY_KEY` | Mutation endpoint called without `Idempotency-Key` header | `null` |
| **400** | `INVALID_IDEMPOTENCY_KEY` | Key length not between 16 and 64 alphanumeric characters | `null` |
| **401** | `UNAUTHENTICATED` | Missing, invalid, or expired session cookie / Bearer token | `null` |
| **401** | `INVALID_WEBHOOK_SIGNATURE` | Webhook callback failed HMAC verification | `null` |
| **403** | `FORBIDDEN` | Authenticated user lacks required permission or policy grant | `null` |
| **403** | `ACCOUNT_DEACTIVATED` | User account has `is_active = false` | `null` |
| **404** | `RESOURCE_NOT_FOUND` | Model or route not found (e.g. invalid slug/reference) | `null` |
| **405** | `METHOD_NOT_ALLOWED` | Disallowed HTTP verb on route | `null` |
| **409** | `AVAILABILITY_COLLISION` | Selected inventory / villa booked during requested dates | `{"conflicting_dates": ["2026-11-02"]}` |
| **409** | `IDEMPOTENCY_CONFLICT` | Idempotency key reused with different request payload | `null` |
| **409** | `REQUEST_IN_FLIGHT` | Request with this idempotency key is currently processing | `null` (with `Retry-After: 2`) |
| **422** | `VALIDATION_ERROR` | Request payload failed FormRequest validation | `{"email": ["Invalid email format."]}` |
| **429** | `RATE_LIMIT_EXCEEDED` | Client exceeded named rate limiter bucket | `{"retry_after": 45}` |
| **500** | `INTERNAL_SERVER_ERROR` | Unhandled exception or infrastructure failure | `null` |

---

## 3. Data Leakage Prevention (Security Constraint)

Under no circumstances will database table names, SQL queries, local file paths, or PHP stack traces be emitted in API error responses. Even if `APP_DEBUG=true` is set locally, the global exception handler in `bootstrap/app.php` intercepts all throwables on `/api/*` and normalizes them into the standard error envelope. Full diagnostic exceptions are written strictly to application log files (`storage/logs/laravel.log`) tagged with the `request_id`.
