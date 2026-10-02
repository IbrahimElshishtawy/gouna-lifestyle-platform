# GouNow Route Boundary & Migration Plan (P1-T17)

> **Document Status**: APPROVED for Phased Execution  
> **Primary Objective**: Safely decouple Next.js and API consumers from Blade Web routes without regressions or broken user journeys.

---

## 1. Migration Strategy Principles

1. **Zero-Breakage Guarantee**: Existing web routes (`/`, `/stays`, `/checkout/*`, `/admin/*`) must continue serving existing Blade pages and web consumers while new `/api/v1/*` routes are introduced and tested.
2. **Action-Sharing Architecture**: Both Web Controllers and API Controllers call the exact same underlying Application Actions (`CreateBookingAction`, `StorePropertyAction`, etc.). This eliminates code duplication and ensures identical business logic across channels.
3. **Phased Decoupling**:
   - **Phase 2**: Introduce `/api/v1/*` routes; build Standard S1 pipeline; extract hybrid logic into clean API Controllers; update Next.js API client paths.
   - **Phase 3**: Add granular authorization policies to both Web and API.
   - **Phase 4–7**: Secure Authentication, Concurrency, Payments, and PII across both boundaries.
   - **Future Deprecation**: Web routes serving JSON conditionally will be removed only after Next.js is confirmed 100% migrated to `/api/v1/*`.

---

## 2. Route Migration Mapping Matrix

| Current Route (Web / Hybrid) | Current Behavior | Target API Endpoint | Target Web Endpoint | Migration Phase |
|---|---|---|---|---|
| `GET /stays` | Hybrid (Blade or JSON based on `wantsJson()`) | `GET /api/v1/stays` | `GET /stays` (Blade only) | Phase 2 |
| `GET /stays/{slug}` | Hybrid (Blade or JSON based on `wantsJson()`) | `GET /api/v1/stays/{slug}` | `GET /stays/{slug}` (Blade only) | Phase 2 |
| `POST /checkout/calculate` | Hybrid (JSON response with price quote) | `POST /api/v1/checkout/quote` | `POST /checkout/calculate` (Delegates to Action) | Phase 2 |
| `POST /checkout/process` | Hybrid (Creates booking, returns JSON or redirect) | `POST /api/v1/checkout/bookings` | `POST /checkout/process` (Delegates to Action) | Phase 2 |
| `POST /checkout/payment/{gateway}` | Mutation (Initiates payment gateway charge) | `POST /api/v1/checkout/payments/{gateway}` | `POST /checkout/payment/{gateway}` | Phase 2 & 6 |
| `GET /checkout/confirmation/{ref}` | Blade view with guest confirmation | `GET /api/v1/checkout/bookings/{ref}` | `GET /checkout/confirmation/{ref}` (Blade only) | Phase 2 & 5 |
| `GET /experiences` | Hybrid (Blade or JSON based on `wantsJson()`) | `GET /api/v1/experiences` | `GET /experiences` (Blade only) | Phase 2 |
| `GET /experiences/{slug}` | Blade view with experience details | `GET /api/v1/experiences/{slug}` | `GET /experiences/{slug}` (Blade only) | Phase 2 |
| `GET /events` | Blade view | `GET /api/v1/events` | `GET /events` (Blade only) | Phase 2 |
| `GET /events/{slug}` | Blade view | `GET /api/v1/events/{slug}` | `GET /events/{slug}` (Blade only) | Phase 2 |
| `POST /contact` | Form submission (Sends lead notification) | `POST /api/v1/leads` | `POST /contact` (Web form) | Phase 2 |
| `GET /admin/*` | Blade Admin views (51 routes) | `GET /api/v1/admin/*` (Future optional headless API) | `GET /admin/*` (Retained Blade portal with RBAC) | Phase 3 (RBAC) |

---

## 3. Step-by-Step Implementation Sequence

### Step 1: Create Dedicated API Route Files (Phase 2)
Establish modular route declarations in `routes/api/v1/`:
- `routes/api/v1/public.php`: Stays, Experiences, Events, Quotes, Reviews.
- `routes/api/v1/customer.php`: Customer profile, past bookings, saved properties (Guarded by `auth:sanctum`).
- `routes/api/v1/webhooks.php`: Payment webhooks (Guarded by signature verification).

### Step 2: Extract Hybrid Controllers (Phase 2)
Transform existing hybrid controllers into clean pairs:
1. `App\Http\Controllers\Api\V1\Public\StayController`: Returns pure Standard S2 JSON resources (`PropertyResource`).
2. `App\Http\Controllers\PropertyListingController`: Simplified to strictly return Blade views, fetching data via the same Read Repository/Action.

### Step 3: Next.js Client Harmonization (Phase 2)
Update `frontend/src/lib/api/client.ts` to prepend `/api/v1` to all remote fetch paths:
- Replace `/stays` -> `/api/v1/stays`
- Replace `/checkout/calculate` -> `/api/v1/checkout/quote`
- Replace `/checkout/process` -> `/api/v1/checkout/bookings`
- Verify that Next.js receives standardized `{ data: ..., meta: ... }` envelopes.

### Step 4: Deprecation & Cleanup Gate
The conditional `$request->wantsJson()` checks in `PropertyListingController.php`, `ExperienceListingController.php`, and `CheckoutController.php` will be permanently excised once all Next.js test suites pass against `/api/v1/*`.
