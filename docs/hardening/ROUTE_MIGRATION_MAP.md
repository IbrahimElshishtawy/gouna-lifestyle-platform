# GouNow Route Migration Map (P2-T02 / P2-T14)

| Old Web / Hybrid Route | New Versioned API Endpoint | Status | Removal Condition |
|---|---|---|---|
| `GET /stays` (hybrid) | `GET /api/v1/stays` | **MIGRATED** | When Next.js stays page calls `/api/v1/stays` exclusively; Blade `/stays` kept for SEO/direct web visits |
| `GET /stays/{slug}` (hybrid) | `GET /api/v1/stays/{slug}` | **MIGRATED** | When Next.js stay details page calls `/api/v1/stays/{slug}` exclusively |
| `GET /experiences` (hybrid) | `GET /api/v1/experiences` | **MIGRATED** | When Next.js experiences catalog calls `/api/v1/experiences` |
| `GET /experiences/{slug}` | `GET /api/v1/experiences/{slug}` | **MIGRATED** | When Next.js experience details calls `/api/v1/experiences/{slug}` |
| `GET /events` | `GET /api/v1/events` | **MIGRATED** | When Next.js events page calls `/api/v1/events` |
| `GET /events/{slug}` | `GET /api/v1/events/{slug}` | **MIGRATED** | When Next.js event details calls `/api/v1/events/{slug}` |
| `POST /checkout/calculate` | `POST /api/v1/checkout/quote` | **MIGRATED** | Deprecate web JSON check once Next.js booking widget uses `/api/v1/checkout/quote` |
| `POST /checkout/process` | `POST /api/v1/checkout/bookings` | **MIGRATED** | Web route remains for traditional Blade checkout; API route handles headless Next.js booking |
| `GET /checkout/confirmation/{ref}` | `GET /api/v1/checkout/bookings/{ref}` | **MIGRATED** | Web route renders Blade voucher; API route provides JSON booking resource for headless checkout |
| `POST /contact` | `POST /api/v1/leads` | **MIGRATED** | Web form posts to `/contact`; Next.js inquiries post to `/api/v1/leads` |
| `POST /admin/login` | `POST /api/v1/auth/login` | **COEXISTING** | Traditional Blade admin continues using session form; headless/API clients use `/api/v1/auth/login` |
| `POST /checkout/payment/webhook` | `POST /api/v1/webhooks/payments` | **MIGRATED** | Payment providers updated to target `/api/v1/webhooks/payments` with HMAC signature |
