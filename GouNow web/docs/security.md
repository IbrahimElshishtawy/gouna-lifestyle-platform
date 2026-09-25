# Security Architecture & Hardening Guide

## 1. Overview
GouNow enforces defense-in-depth across the presentation, application, and infrastructure layers to protect customer data, preserve financial integrity, and prevent malicious abuse.

---

## 2. Rate Limiting & Abuse Prevention

Rate limiters are configured via `RateLimiter::for` in `AppServiceProvider`:

| Route / Endpoint | Limit | Purpose |
| :--- | :--- | :--- |
| `POST /admin/login` | 5 attempts / minute per IP | Brute force credential stuffing protection |
| `POST /api/booking/quote` | 30 requests / minute per IP | Scraper & pricing bot prevention |
| `POST /checkout` | 10 attempts / minute per IP | Fraudulent card testing & reservation denial-of-service |
| `POST /contact` & leads | 5 submissions / minute per IP | Contact form spam mitigation |

---

## 3. Strict Input Validation & Type Safety

1. **Form Requests:** Every HTTP write operation is guarded by a dedicated `FormRequest` class (`CalculateQuoteRequest`, `ProcessCheckoutRequest`). No untyped request arrays are passed into services.
2. **Domain Value Objects:**
   - [`Money`](file:///home/ibrahim-elshishtawy/flutter%20project/gouna-lifestyle-platform/GouNow%20web/app/Shared/Domain/ValueObjects/Money.php): Rejects negative amounts (unless explicitly allowed in refunds), strictly calculates in integer cents, and throws `\InvalidArgumentException` on currency mismatch.
   - [`DateRange`](file:///home/ibrahim-elshishtawy/flutter%20project/gouna-lifestyle-platform/GouNow%20web/app/Shared/Domain/ValueObjects/DateRange.php): Enforces `check_out > check_in` and disallows reservations beginning in the past.
   - [`GuestCount`](file:///home/ibrahim-elshishtawy/flutter%20project/gouna-lifestyle-platform/GouNow%20web/app/Shared/Domain/ValueObjects/GuestCount.php): Bounds guests strictly between `1` and `max_guests`.
   - [`BookingReference`](file:///home/ibrahim-elshishtawy/flutter%20project/gouna-lifestyle-platform/GouNow%20web/app/Shared/Domain/ValueObjects/BookingReference.php): Formats uppercase unguessable reference codes (e.g. `GN-ABC12345`).

---

## 4. Environment Safety Guards

Mock payment endpoints used for testing and local development (`/checkout/mock-card/process` and `/checkout/mock-paypal/process`) are protected with strict environment checks:

```php
if (!app()->environment('local', 'testing')) {
    abort(404, 'Mock payment processing is strictly disabled in production environments.');
}
```
In staging and production, only live or sandbox gateway integrations (Stripe, Paymob, PayPal) with signed webhooks can process payments.

---

## 5. Payment Security & PCI-DSS Compliance
- **Zero Card Data Stored:** GouNow never touches, processes, or stores raw credit card numbers or CVVs on its servers. All payments utilize hosted fields, embedded iframes, or 3DS redirection provided directly by certified PCI-DSS Level 1 gateways.
- **Webhook HMAC Signatures:** Every incoming webhook endpoint checks cryptographic signatures using the gateway's secret key before parsing payloads.
- **Idempotency Keys:** Duplicate charge attempts or intercepted payloads are dropped by the database unique constraint on `idempotency_key`.

---

## 6. Role-Based Access Control (RBAC) & Audit Logs
- Super Administrators, Property Managers, and Concierge Agents have distinct permissions.
- Administrative mutations (editing prices, deleting properties, manually confirming offline payments) log an entry into `activity_logs` recording the user ID, IP address, timestamp, and before/after changes.
