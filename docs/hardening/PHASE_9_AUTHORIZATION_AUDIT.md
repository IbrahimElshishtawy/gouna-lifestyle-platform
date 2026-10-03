# PHASE 9 — AUTHORIZATION, IDOR & BOLA AUDIT

## 1. Executive Summary

This audit assesses the platform's authorization architecture against Broken Object Level Authorization (BOLA / IDOR), Horizontal Privilege Escalation, Vertical Privilege Escalation, and Mass Assignment vulnerabilities.

---

## 2. Horizontal Privilege Escalation & IDOR Defenses

### 2.1 Customer Booking Invariant
- **Route**: `GET /api/v1/customer/bookings/{reference}` and `POST /api/v1/customer/bookings/{reference}/cancel`.
- **Policy**: `BookingPolicy@view` and `BookingPolicy@cancel`.
- **Enforcement**:
  ```php
  public function view(User $user, Booking $booking): bool
  {
      if ($user->is_admin || $user->hasRole('super_admin') || $user->hasRole('property_manager')) {
          return true;
      }
      return $booking->customer && $booking->customer->user_id === $user->id;
  }
  ```
- **Adversarial Test**: `test_customer_cannot_view_another_customers_booking_via_api()` proves User A cannot read User B's booking (HTTP 403/404 returned).
- **Adversarial Test**: `test_customer_cannot_cancel_another_customers_booking()` proves User A cannot cancel User B's booking (HTTP 403/404 returned; booking status unchanged).

### 2.2 Guest Confirmation Token Defense
- **Route**: `GET /api/v1/checkout/bookings/{reference}` and `GET /checkout/confirmation/{reference}`.
- **Enforcement**: Requires SHA-256 matching of `booking_access_token` passed as a bearer token, signed URL parameter, or active customer session. Enumeration attempts with random references return generic 404.

---

## 3. Vertical Privilege Escalation Defenses

### 3.1 Customer to Admin Boundary
- Unauthenticated requests to administrative routes (`/admin/*`) redirect to `/admin/login` or emit HTTP 401.
- Authenticated regular customers attempting to access `/admin/properties` or `/api/v1/admin/ping` are rejected with HTTP 403.
- Super Admin privilege escalation via user registration or update endpoints is prevented by FormRequest authorization and prohibited role mass assignment.

### 3.2 Role Separation Invariants
- `Sales` role: Granted lead visibility, zero financial payment visibility (`PaymentTransaction::scopeVisibleTo`).
- `Staff` role: Cannot export customer records or perform destructive property operations.
- `Content Manager`: Cannot process refunds or cancel bookings.
- `Last Super Admin`: System strictly rejects deleting the last remaining Super Admin.

---

## 4. Account Enumeration Defenses

- **Login Endpoint**: `POST /api/v1/auth/login` uses timing equalization (dummy BCrypt hash execution on nonexistent user) and emits identical error payloads:
  ```json
  {
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "The given data was invalid.",
      "details": {
        "email": ["Invalid email or password."]
      }
    }
  }
  ```
- **Password Reset**: `POST /api/v1/auth/forgot-password` returns generic success regardless of whether the submitted email address exists.
