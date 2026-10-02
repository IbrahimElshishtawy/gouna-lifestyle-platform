# GouNow Next.js Integration Guide

> **Document Status**: APPROVED FOR IMPLEMENTATION  
> **Target Framework**: Next.js 14 App Router (SSR & Client Components)  
> **API Version**: `/api/v1`

---

## 1. Environment & API Base URL

Configure the backend endpoint in `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

---

## 2. API Client Architecture & Standard Fetcher

All Next.js remote communications must utilize the standardized client in `frontend/src/lib/api/client.ts`.

### Standard Success Response Contract:
```typescript
interface ApiResponse<T> {
  data: T;
  meta: {
    request_id: string;
    timestamp: string;
    [key: string]: unknown;
  };
}
```

### Standard Error Response Contract:
```typescript
interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details: Record<string, string[]> | null;
    request_id: string;
    timestamp: string;
  };
}
```

---

## 3. Handling HTTP Error States

| HTTP Status | Error Code | Client UI Handling |
|---|---|---|
| **401** | `UNAUTHENTICATED` | Redirect to login modal or clear local user context. |
| **403** | `FORBIDDEN` | Display permission denied banner or restricted access view. |
| **403** | `ACCOUNT_DEACTIVATED` | Force logout, display account suspended message. |
| **404** | `RESOURCE_NOT_FOUND` | Trigger Next.js `notFound()` to render brand 404 page. |
| **409** | `AVAILABILITY_COLLISION` | Display date conflict alert; prompt guest to choose alternate dates. |
| **409** | `REQUEST_IN_FLIGHT` | Maintain loading spinner; poll with exponential backoff. |
| **422** | `VALIDATION_ERROR` | Attach error strings from `details` directly to form input fields. |
| **429** | `RATE_LIMIT_EXCEEDED` | Disable submit button for the duration of `Retry-After` seconds. |
| **500** | `INTERNAL_SERVER_ERROR` | Show generic fallback toast quoting the `request_id` for customer support. |

---

## 4. Idempotency Key Generation on Mutations

State-mutating calls (`POST /checkout/bookings`, payment submissions) must include a unique UUID v4 header:

```typescript
import { v4 as uuidv4 } from 'uuid';

async function createBooking(payload: BookingPayload) {
  const idempotencyKey = uuidv4();

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/checkout/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify(payload),
    credentials: 'include', // Ensures cookies are forwarded
  });

  return response.json();
}
```

---

## 5. Next.js SSR Cookie Forwarding (Server Components)

When fetching authenticated customer resources (e.g. `/api/v1/customer/me` or `/api/v1/customer/bookings`) inside Next.js Server Components, forward incoming request cookies:

```typescript
import { cookies } from 'next/headers';

export async function getCustomerProfile() {
  const cookieStore = cookies();
  const cookieHeader = cookieStore.toString();

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customer/me`, {
    headers: {
      Accept: 'application/json',
      Cookie: cookieHeader,
    },
    cache: 'no-store', // Prevent caching authenticated data
  });

  if (!res.ok) {
    if (res.status === 401) return null;
    throw new Error('Failed to load profile');
  }

  return res.json();
}
```

---

## 6. Caching & Revalidation Guidelines

- **Public Catalogs (`/api/v1/stays`, `/api/v1/experiences`)**:
  Can use ISR (Incremental Static Regeneration) or `next: { revalidate: 300 }` (5 minutes).
- **Price Quotes & Checkout (`/api/v1/checkout/*`)**:
  Strictly `cache: 'no-store'`.
- **Customer Account & Admin**:
  Strictly `cache: 'no-store'`.
