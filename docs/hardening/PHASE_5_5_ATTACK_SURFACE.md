# Phase 5.5 — HTTP Attack Surface Inventory

> Generated from real Laravel route collection (`routes_phase5_5.json`) for GouNow Pre-Production Adversarial Audit.

Total Registered Routes: 135

## 4.webhook — WEBHOOK (1 Routes)

### `POST /api/v1/webhooks/payments`
- **Controller:** `App\Http\Controllers\Api\V1\Webhooks\PaymentWebhookController`
- **Action:** `handle`
- **Middleware:** `api, Illuminate\Routing\Middleware\ThrottleRequests:webhooks, App\Http\Middleware\VerifyWebhookSignature`
- **Authentication:** None (Public)
- **Authorization:** None
- **Rate Limit:** `webhooks`
- **Idempotency:** None
- **Transaction:** YES (Database Transaction DB::transaction)
- **Database Mutation:** YES (State change in database)
- **External Service:** Payment Gateways (Card/Paymob/PayPal)
- **Potential Sensitive Data:** Card details, Transaction Tokens, Customer Billing Info

---

## 4.auth — AUTH (7 Routes)

### `GET|HEAD /admin/login`
- **Controller:** `App\Http\Controllers\Auth\LoginController`
- **Action:** `showLoginForm`
- **Middleware:** `web`
- **Authentication:** None (Public)
- **Authorization:** None
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** Passwords, Hashes, Plaintext Credentials, Tokens

### `POST /admin/login`
- **Controller:** `App\Http\Controllers\Auth\LoginController`
- **Action:** `login`
- **Middleware:** `web, Illuminate\Routing\Middleware\ThrottleRequests:admin_login`
- **Authentication:** Session Cookie (web)
- **Authorization:** None
- **Rate Limit:** `admin_login`
- **Idempotency:** None
- **Transaction:** Implicit / Single Statement
- **Database Mutation:** YES (State change in database)
- **External Service:** None
- **Potential Sensitive Data:** Passwords, Hashes, Plaintext Credentials, Tokens

### `GET|POST|HEAD /admin/logout`
- **Controller:** `App\Http\Controllers\Auth\LoginController`
- **Action:** `logout`
- **Middleware:** `web`
- **Authentication:** None (Public)
- **Authorization:** None
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** Implicit / Single Statement
- **Database Mutation:** YES (State change in database)
- **External Service:** None
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `POST /api/v1/auth/confirm-password`
- **Controller:** `App\Http\Controllers\Api\V1\Public\AuthController`
- **Action:** `confirmPassword`
- **Middleware:** `api, Illuminate\Auth\Middleware\Authenticate:sanctum`
- **Authentication:** None (Public)
- **Authorization:** None
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** Implicit / Single Statement
- **Database Mutation:** YES (State change in database)
- **External Service:** None
- **Potential Sensitive Data:** Passwords, Hashes, Plaintext Credentials, Tokens

### `POST /api/v1/auth/login`
- **Controller:** `App\Http\Controllers\Api\V1\Public\AuthController`
- **Action:** `login`
- **Middleware:** `api, Illuminate\Routing\Middleware\ThrottleRequests:auth`
- **Authentication:** Session Cookie (web)
- **Authorization:** None
- **Rate Limit:** `auth`
- **Idempotency:** None
- **Transaction:** Implicit / Single Statement
- **Database Mutation:** YES (State change in database)
- **External Service:** None
- **Potential Sensitive Data:** Passwords, Hashes, Plaintext Credentials, Tokens

### `POST /api/v1/auth/logout`
- **Controller:** `App\Http\Controllers\Api\V1\Public\AuthController`
- **Action:** `logout`
- **Middleware:** `api, Illuminate\Auth\Middleware\Authenticate:sanctum`
- **Authentication:** None (Public)
- **Authorization:** None
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** Implicit / Single Statement
- **Database Mutation:** YES (State change in database)
- **External Service:** None
- **Potential Sensitive Data:** Passwords, Hashes, Plaintext Credentials, Tokens

### `POST /api/v1/me/logout-all`
- **Controller:** `App\Http\Controllers\Api\V1\Public\AuthController`
- **Action:** `logoutAll`
- **Middleware:** `api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureAccountActive`
- **Authentication:** None (Public)
- **Authorization:** None
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** Implicit / Single Statement
- **Database Mutation:** YES (State change in database)
- **External Service:** None
- **Potential Sensitive Data:** None

---

## 4.2fa — 2FA (11 Routes)

### `GET|HEAD /admin/2fa/challenge`
- **Controller:** `App\Http\Controllers\Auth\TwoFactorController`
- **Action:** `showChallenge`
- **Middleware:** `web`
- **Authentication:** None (Public)
- **Authorization:** None
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** TOTP Secrets, Recovery Codes, OTP

### `POST /admin/2fa/challenge`
- **Controller:** `App\Http\Controllers\Auth\TwoFactorController`
- **Action:** `verifyChallenge`
- **Middleware:** `web`
- **Authentication:** None (Public)
- **Authorization:** None
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** Implicit / Single Statement
- **Database Mutation:** YES (State change in database)
- **External Service:** None
- **Potential Sensitive Data:** TOTP Secrets, Recovery Codes, OTP

### `POST /admin/2fa/confirm`
- **Controller:** `App\Http\Controllers\Auth\TwoFactorController`
- **Action:** `confirmSetup`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale`
- **Authentication:** None (Public)
- **Authorization:** Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** Implicit / Single Statement
- **Database Mutation:** YES (State change in database)
- **External Service:** None
- **Potential Sensitive Data:** TOTP Secrets, Recovery Codes, OTP

### `POST /admin/2fa/disable`
- **Controller:** `App\Http\Controllers\Auth\TwoFactorController`
- **Action:** `disable`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale`
- **Authentication:** None (Public)
- **Authorization:** Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** Implicit / Single Statement
- **Database Mutation:** YES (State change in database)
- **External Service:** None
- **Potential Sensitive Data:** TOTP Secrets, Recovery Codes, OTP

### `POST /admin/2fa/recovery`
- **Controller:** `App\Http\Controllers\Auth\TwoFactorController`
- **Action:** `verifyRecovery`
- **Middleware:** `web`
- **Authentication:** None (Public)
- **Authorization:** None
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** Implicit / Single Statement
- **Database Mutation:** YES (State change in database)
- **External Service:** None
- **Potential Sensitive Data:** TOTP Secrets, Recovery Codes, OTP

### `GET|HEAD /admin/2fa/setup`
- **Controller:** `App\Http\Controllers\Auth\TwoFactorController`
- **Action:** `showSetup`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale`
- **Authentication:** None (Public)
- **Authorization:** Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** TOTP Secrets, Recovery Codes, OTP

### `POST /api/v1/auth/2fa/challenge`
- **Controller:** `App\Http\Controllers\Api\V1\Public\AuthController`
- **Action:** `challenge2fa`
- **Middleware:** `api, Illuminate\Routing\Middleware\ThrottleRequests:auth`
- **Authentication:** Session Cookie (web)
- **Authorization:** None
- **Rate Limit:** `auth`
- **Idempotency:** None
- **Transaction:** Implicit / Single Statement
- **Database Mutation:** YES (State change in database)
- **External Service:** None
- **Potential Sensitive Data:** Passwords, Hashes, Plaintext Credentials, Tokens

### `POST /api/v1/auth/2fa/confirm`
- **Controller:** `App\Http\Controllers\Api\V1\Public\AuthController`
- **Action:** `confirm2fa`
- **Middleware:** `api, Illuminate\Auth\Middleware\Authenticate:sanctum`
- **Authentication:** None (Public)
- **Authorization:** None
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** Implicit / Single Statement
- **Database Mutation:** YES (State change in database)
- **External Service:** None
- **Potential Sensitive Data:** Passwords, Hashes, Plaintext Credentials, Tokens

### `POST /api/v1/auth/2fa/disable`
- **Controller:** `App\Http\Controllers\Api\V1\Public\AuthController`
- **Action:** `disable2fa`
- **Middleware:** `api, Illuminate\Auth\Middleware\Authenticate:sanctum`
- **Authentication:** None (Public)
- **Authorization:** None
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** Implicit / Single Statement
- **Database Mutation:** YES (State change in database)
- **External Service:** None
- **Potential Sensitive Data:** Passwords, Hashes, Plaintext Credentials, Tokens

### `POST /api/v1/auth/2fa/recovery`
- **Controller:** `App\Http\Controllers\Api\V1\Public\AuthController`
- **Action:** `recovery2fa`
- **Middleware:** `api, Illuminate\Routing\Middleware\ThrottleRequests:auth`
- **Authentication:** Session Cookie (web)
- **Authorization:** None
- **Rate Limit:** `auth`
- **Idempotency:** None
- **Transaction:** Implicit / Single Statement
- **Database Mutation:** YES (State change in database)
- **External Service:** None
- **Potential Sensitive Data:** Passwords, Hashes, Plaintext Credentials, Tokens

### `POST /api/v1/auth/2fa/setup`
- **Controller:** `App\Http\Controllers\Api\V1\Public\AuthController`
- **Action:** `setup2fa`
- **Middleware:** `api, Illuminate\Auth\Middleware\Authenticate:sanctum`
- **Authentication:** None (Public)
- **Authorization:** None
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** Implicit / Single Statement
- **Database Mutation:** YES (State change in database)
- **External Service:** None
- **Potential Sensitive Data:** Passwords, Hashes, Plaintext Credentials, Tokens

---

## 4.password_recovery — PASSWORD RECOVERY (2 Routes)

### `POST /api/v1/auth/forgot-password`
- **Controller:** `App\Http\Controllers\Api\V1\Public\AuthController`
- **Action:** `forgotPassword`
- **Middleware:** `api, Illuminate\Routing\Middleware\ThrottleRequests:auth`
- **Authentication:** Session Cookie (web)
- **Authorization:** None
- **Rate Limit:** `auth`
- **Idempotency:** None
- **Transaction:** Implicit / Single Statement
- **Database Mutation:** YES (State change in database)
- **External Service:** None
- **Potential Sensitive Data:** Passwords, Hashes, Plaintext Credentials, Tokens

### `POST /api/v1/auth/reset-password`
- **Controller:** `App\Http\Controllers\Api\V1\Public\AuthController`
- **Action:** `resetPassword`
- **Middleware:** `api, Illuminate\Routing\Middleware\ThrottleRequests:auth`
- **Authentication:** Session Cookie (web)
- **Authorization:** None
- **Rate Limit:** `auth`
- **Idempotency:** None
- **Transaction:** Implicit / Single Statement
- **Database Mutation:** YES (State change in database)
- **External Service:** None
- **Potential Sensitive Data:** Passwords, Hashes, Plaintext Credentials, Tokens

---

## 4.customer — CUSTOMER (21 Routes)

### `GET|HEAD /admin/bookings/confirmed`
- **Controller:** `App\Http\Controllers\Admin\DashboardController`
- **Action:** `bookingsConfirmed`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:bookings.view`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: bookings.view + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** Mail / SMS Notification queues
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `GET|HEAD /admin/bookings/payments`
- **Controller:** `App\Http\Controllers\Admin\DashboardController`
- **Action:** `bookingsPayments`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:bookings.view, Illuminate\Auth\Middleware\Authorize:payments.view`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: payments.view + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** Payment Gateways (Card/Paymob/PayPal)
- **Potential Sensitive Data:** Card details, Transaction Tokens, Customer Billing Info

### `GET|HEAD /admin/cms/homepage`
- **Controller:** `App\Http\Controllers\Admin\DashboardController`
- **Action:** `cmsHomepage`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:cms.manage`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: cms.manage + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `GET|HEAD /admin/customers`
- **Controller:** `App\Http\Controllers\Admin\DashboardController`
- **Action:** `customersIndex`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:customers.view`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: customers.view + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** Customer PII (Name, Email, Phone, Budget, Notes)

### `GET|HEAD /admin/customers/inquiries`
- **Controller:** `App\Http\Controllers\Admin\DashboardController`
- **Action:** `customersInquiries`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:leads.view`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: leads.view + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** Customer PII (Name, Email, Phone, Budget, Notes)

### `GET|HEAD /admin/customers/leads`
- **Controller:** `App\Http\Controllers\Admin\DashboardController`
- **Action:** `customersLeads`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:leads.view`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: leads.view + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** Mail / SMS Notification queues
- **Potential Sensitive Data:** Customer PII (Name, Email, Phone, Budget, Notes)

### `DELETE /admin/events/{event}/media/{media}`
- **Controller:** `App\Http\Controllers\Admin\EventController`
- **Action:** `deleteMedia`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:media.manage`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: media.manage + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** Implicit / Single Statement
- **Database Mutation:** YES (State change in database)
- **External Service:** None
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `DELETE /admin/experiences/{experience}/media/{media}`
- **Controller:** `App\Http\Controllers\Admin\ExperienceController`
- **Action:** `deleteMedia`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:media.manage`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: media.manage + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** Implicit / Single Statement
- **Database Mutation:** YES (State change in database)
- **External Service:** None
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `GET|HEAD /admin/media`
- **Controller:** `App\Http\Controllers\Admin\DashboardController`
- **Action:** `mediaIndex`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:media.manage`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: media.manage + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `GET|HEAD /admin/properties/amenities`
- **Controller:** `App\Http\Controllers\Admin\DashboardController`
- **Action:** `propertyAmenities`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:properties.view`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: properties.view + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `DELETE /admin/properties/{property}/media/{media}`
- **Controller:** `App\Http\Controllers\Admin\PropertyController`
- **Action:** `deleteMedia`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:media.manage`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: media.manage + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** Implicit / Single Statement
- **Database Mutation:** YES (State change in database)
- **External Service:** None
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `GET|HEAD /admin/settings/payments`
- **Controller:** `App\Http\Controllers\Admin\DashboardController`
- **Action:** `settingsPayments`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:settings.manage`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: settings.manage + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** Payment Gateways (Card/Paymob/PayPal)
- **Potential Sensitive Data:** Card details, Transaction Tokens, Customer Billing Info

### `GET|HEAD /api/v1/customer/bookings`
- **Controller:** `App\Http\Controllers\Api\V1\Customer\BookingController`
- **Action:** `index`
- **Middleware:** `api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureAccountActive`
- **Authentication:** None (Public)
- **Authorization:** None
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** Mail / SMS Notification queues
- **Potential Sensitive Data:** Customer PII (Name, Email, Phone, Budget, Notes)

### `GET|HEAD /api/v1/customer/bookings/{reference}`
- **Controller:** `App\Http\Controllers\Api\V1\Customer\BookingController`
- **Action:** `show`
- **Middleware:** `api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureAccountActive`
- **Authentication:** None (Public)
- **Authorization:** None
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** Mail / SMS Notification queues
- **Potential Sensitive Data:** Customer PII (Name, Email, Phone, Budget, Notes)

### `POST /api/v1/customer/bookings/{reference}/cancel`
- **Controller:** `App\Http\Controllers\Api\V1\Customer\BookingController`
- **Action:** `cancel`
- **Middleware:** `api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureAccountActive`
- **Authentication:** None (Public)
- **Authorization:** None
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** YES (Database Transaction DB::transaction)
- **Database Mutation:** YES (State change in database)
- **External Service:** Mail / SMS Notification queues
- **Potential Sensitive Data:** Customer PII (Name, Email, Phone, Budget, Notes)

### `GET|HEAD /api/v1/customer/me`
- **Controller:** `App\Http\Controllers\Api\V1\Public\AuthController`
- **Action:** `me`
- **Middleware:** `api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureAccountActive`
- **Authentication:** None (Public)
- **Authorization:** None
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** Customer PII (Name, Email, Phone, Budget, Notes)

### `GET|HEAD /api/v1/customer/me/abilities`
- **Controller:** `App\Http\Controllers\Api\V1\Public\AuthController`
- **Action:** `abilities`
- **Middleware:** `api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureAccountActive`
- **Authentication:** None (Public)
- **Authorization:** None
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** Customer PII (Name, Email, Phone, Budget, Notes)

### `GET|HEAD /api/v1/me`
- **Controller:** `App\Http\Controllers\Api\V1\Public\AuthController`
- **Action:** `me`
- **Middleware:** `api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureAccountActive`
- **Authentication:** None (Public)
- **Authorization:** None
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** None

### `GET|HEAD /api/v1/me/abilities`
- **Controller:** `App\Http\Controllers\Api\V1\Public\AuthController`
- **Action:** `abilities`
- **Middleware:** `api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureAccountActive`
- **Authentication:** None (Public)
- **Authorization:** None
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** None

### `POST /api/v1/me/change-password`
- **Controller:** `App\Http\Controllers\Api\V1\Public\AuthController`
- **Action:** `changePassword`
- **Middleware:** `api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureAccountActive`
- **Authentication:** None (Public)
- **Authorization:** None
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** Implicit / Single Statement
- **Database Mutation:** YES (State change in database)
- **External Service:** None
- **Potential Sensitive Data:** Passwords, Hashes, Plaintext Credentials, Tokens

### `GET|HEAD /api/v1/me/sessions`
- **Controller:** `App\Http\Controllers\Api\V1\Public\AuthController`
- **Action:** `sessions`
- **Middleware:** `api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureAccountActive`
- **Authentication:** None (Public)
- **Authorization:** None
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** None

---

## 4.booking — BOOKING (18 Routes)

### `GET|HEAD /admin/bookings`
- **Controller:** `App\Http\Controllers\Admin\DashboardController`
- **Action:** `bookingsIndex`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:bookings.view`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: bookings.view + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** Mail / SMS Notification queues
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `GET|HEAD /admin/bookings/calendar`
- **Controller:** `App\Http\Controllers\Admin\DashboardController`
- **Action:** `bookingsCalendar`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:bookings.view`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: bookings.view + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** Mail / SMS Notification queues
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `GET|HEAD /admin/bookings/cancelled`
- **Controller:** `App\Http\Controllers\Admin\DashboardController`
- **Action:** `bookingsIndex`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:bookings.view`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: bookings.view + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** Mail / SMS Notification queues
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `GET|HEAD /admin/bookings/pending`
- **Controller:** `App\Http\Controllers\Admin\DashboardController`
- **Action:** `bookingsPending`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:bookings.view`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: bookings.view + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** Mail / SMS Notification queues
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `POST /admin/bookings/{booking}/refund`
- **Controller:** `App\Http\Controllers\Admin\DashboardController`
- **Action:** `bookingsRefund`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:bookings.view, Illuminate\Auth\Middleware\Authorize:payments.refund`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: payments.refund + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** YES (Database Transaction DB::transaction)
- **Database Mutation:** YES (State change in database)
- **External Service:** Mail / SMS Notification queues
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `GET|HEAD /admin/settings/booking`
- **Controller:** `App\Http\Controllers\Admin\DashboardController`
- **Action:** `settingsBooking`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:settings.manage`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: settings.manage + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** Mail / SMS Notification queues
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `POST /api/v1/checkout/bookings`
- **Controller:** `App\Http\Controllers\Api\V1\Public\CheckoutController`
- **Action:** `createBooking`
- **Middleware:** `api, Illuminate\Routing\Middleware\ThrottleRequests:booking, App\Http\Middleware\EnsureIdempotency`
- **Authentication:** None (Public)
- **Authorization:** None
- **Rate Limit:** `booking`
- **Idempotency:** Enforced (Idempotency-Key header, SHA-256 payload)
- **Transaction:** YES (Database Transaction DB::transaction)
- **Database Mutation:** YES (State change in database)
- **External Service:** Payment Gateways (Card/Paymob/PayPal)
- **Potential Sensitive Data:** Card details, Transaction Tokens, Customer Billing Info

### `GET|HEAD /api/v1/checkout/bookings/{reference}`
- **Controller:** `App\Http\Controllers\Api\V1\Public\CheckoutController`
- **Action:** `show`
- **Middleware:** `api`
- **Authentication:** None (Public)
- **Authorization:** None
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** Payment Gateways (Card/Paymob/PayPal)
- **Potential Sensitive Data:** Card details, Transaction Tokens, Customer Billing Info

### `POST /api/v1/checkout/quote`
- **Controller:** `App\Http\Controllers\Api\V1\Public\CheckoutController`
- **Action:** `quote`
- **Middleware:** `api, Illuminate\Routing\Middleware\ThrottleRequests:booking`
- **Authentication:** None (Public)
- **Authorization:** None
- **Rate Limit:** `booking`
- **Idempotency:** None
- **Transaction:** YES (Database Transaction DB::transaction)
- **Database Mutation:** YES (State change in database)
- **External Service:** Payment Gateways (Card/Paymob/PayPal)
- **Potential Sensitive Data:** Card details, Transaction Tokens, Customer Billing Info

### `POST /checkout/calculate`
- **Controller:** `App\Http\Controllers\CheckoutController`
- **Action:** `calculate`
- **Middleware:** `web, Illuminate\Routing\Middleware\ThrottleRequests:checkout`
- **Authentication:** None (Public)
- **Authorization:** None
- **Rate Limit:** `checkout`
- **Idempotency:** None
- **Transaction:** YES (Database Transaction DB::transaction)
- **Database Mutation:** YES (State change in database)
- **External Service:** Payment Gateways (Card/Paymob/PayPal)
- **Potential Sensitive Data:** Card details, Transaction Tokens, Customer Billing Info

### `GET|HEAD /checkout/confirmation/{reference}`
- **Controller:** `App\Http\Controllers\CheckoutController`
- **Action:** `confirmation`
- **Middleware:** `web, Illuminate\Routing\Middleware\ThrottleRequests:checkout, Illuminate\Routing\Middleware\ThrottleRequests:booking_confirmation`
- **Authentication:** None (Public)
- **Authorization:** None
- **Rate Limit:** `booking_confirmation`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** Payment Gateways (Card/Paymob/PayPal)
- **Potential Sensitive Data:** Card details, Transaction Tokens, Customer Billing Info

### `GET|HEAD /checkout/mock/card/{reference}`
- **Controller:** `App\Http\Controllers\CheckoutController`
- **Action:** `cardMock`
- **Middleware:** `web, Illuminate\Routing\Middleware\ThrottleRequests:checkout`
- **Authentication:** None (Public)
- **Authorization:** None
- **Rate Limit:** `checkout`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** Payment Gateways (Card/Paymob/PayPal)
- **Potential Sensitive Data:** Card details, Transaction Tokens, Customer Billing Info

### `POST /checkout/mock/card/{reference}/complete`
- **Controller:** `App\Http\Controllers\CheckoutController`
- **Action:** `cardMockComplete`
- **Middleware:** `web, Illuminate\Routing\Middleware\ThrottleRequests:checkout`
- **Authentication:** None (Public)
- **Authorization:** None
- **Rate Limit:** `checkout`
- **Idempotency:** None
- **Transaction:** YES (Database Transaction DB::transaction)
- **Database Mutation:** YES (State change in database)
- **External Service:** Payment Gateways (Card/Paymob/PayPal)
- **Potential Sensitive Data:** Card details, Transaction Tokens, Customer Billing Info

### `POST /checkout/mock/card/{reference}/decline`
- **Controller:** `App\Http\Controllers\CheckoutController`
- **Action:** `cardMockDecline`
- **Middleware:** `web, Illuminate\Routing\Middleware\ThrottleRequests:checkout`
- **Authentication:** None (Public)
- **Authorization:** None
- **Rate Limit:** `checkout`
- **Idempotency:** None
- **Transaction:** YES (Database Transaction DB::transaction)
- **Database Mutation:** YES (State change in database)
- **External Service:** Payment Gateways (Card/Paymob/PayPal)
- **Potential Sensitive Data:** Card details, Transaction Tokens, Customer Billing Info

### `GET|HEAD /checkout/mock/paypal/{reference}`
- **Controller:** `App\Http\Controllers\CheckoutController`
- **Action:** `paypalMock`
- **Middleware:** `web, Illuminate\Routing\Middleware\ThrottleRequests:checkout`
- **Authentication:** None (Public)
- **Authorization:** None
- **Rate Limit:** `checkout`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** Payment Gateways (Card/Paymob/PayPal)
- **Potential Sensitive Data:** Card details, Transaction Tokens, Customer Billing Info

### `POST /checkout/mock/paypal/{reference}/complete`
- **Controller:** `App\Http\Controllers\CheckoutController`
- **Action:** `paypalMockComplete`
- **Middleware:** `web, Illuminate\Routing\Middleware\ThrottleRequests:checkout`
- **Authentication:** None (Public)
- **Authorization:** None
- **Rate Limit:** `checkout`
- **Idempotency:** None
- **Transaction:** YES (Database Transaction DB::transaction)
- **Database Mutation:** YES (State change in database)
- **External Service:** Payment Gateways (Card/Paymob/PayPal)
- **Potential Sensitive Data:** Card details, Transaction Tokens, Customer Billing Info

### `POST /checkout/process`
- **Controller:** `App\Http\Controllers\CheckoutController`
- **Action:** `process`
- **Middleware:** `web, Illuminate\Routing\Middleware\ThrottleRequests:checkout`
- **Authentication:** None (Public)
- **Authorization:** None
- **Rate Limit:** `checkout`
- **Idempotency:** None
- **Transaction:** YES (Database Transaction DB::transaction)
- **Database Mutation:** YES (State change in database)
- **External Service:** Payment Gateways (Card/Paymob/PayPal)
- **Potential Sensitive Data:** Card details, Transaction Tokens, Customer Billing Info

### `GET|HEAD /checkout/{property}`
- **Controller:** `App\Http\Controllers\CheckoutController`
- **Action:** `show`
- **Middleware:** `web, Illuminate\Routing\Middleware\ThrottleRequests:checkout`
- **Authentication:** None (Public)
- **Authorization:** None
- **Rate Limit:** `checkout`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** Payment Gateways (Card/Paymob/PayPal)
- **Potential Sensitive Data:** Card details, Transaction Tokens, Customer Billing Info

---

## 4.lead — LEAD (4 Routes)

### `POST /api/v1/leads`
- **Controller:** `App\Http\Controllers\Api\V1\Public\LeadController`
- **Action:** `store`
- **Middleware:** `api, Illuminate\Routing\Middleware\ThrottleRequests:inquiries`
- **Authentication:** None (Public)
- **Authorization:** None
- **Rate Limit:** `inquiries`
- **Idempotency:** None
- **Transaction:** Implicit / Single Statement
- **Database Mutation:** YES (State change in database)
- **External Service:** Mail / SMS Notification queues
- **Potential Sensitive Data:** Customer PII (Name, Email, Phone, Budget, Notes)

### `POST /experiences/{experience}/inquire`
- **Controller:** `App\Http\Controllers\ExperienceListingController`
- **Action:** `inquire`
- **Middleware:** `web, App\Http\Middleware\SetLocale, Illuminate\Routing\Middleware\ThrottleRequests:inquiries`
- **Authentication:** None (Public)
- **Authorization:** None
- **Rate Limit:** `inquiries`
- **Idempotency:** None
- **Transaction:** Implicit / Single Statement
- **Database Mutation:** YES (State change in database)
- **External Service:** None
- **Potential Sensitive Data:** None

### `POST /inquire`
- **Controller:** `App\Http\Controllers\HomeController`
- **Action:** `inquire`
- **Middleware:** `web, App\Http\Middleware\SetLocale, Illuminate\Routing\Middleware\ThrottleRequests:inquiries`
- **Authentication:** None (Public)
- **Authorization:** None
- **Rate Limit:** `inquiries`
- **Idempotency:** None
- **Transaction:** Implicit / Single Statement
- **Database Mutation:** YES (State change in database)
- **External Service:** None
- **Potential Sensitive Data:** None

### `POST /stays/{property}/inquire`
- **Controller:** `App\Http\Controllers\PropertyListingController`
- **Action:** `inquire`
- **Middleware:** `web, App\Http\Middleware\SetLocale, Illuminate\Routing\Middleware\ThrottleRequests:inquiries`
- **Authentication:** None (Public)
- **Authorization:** None
- **Rate Limit:** `inquiries`
- **Idempotency:** None
- **Transaction:** Implicit / Single Statement
- **Database Mutation:** YES (State change in database)
- **External Service:** None
- **Potential Sensitive Data:** None

---

## 4.admin — ADMIN (47 Routes)

### `GET|HEAD /admin`
- **Controller:** `App\Http\Controllers\Admin\DashboardController`
- **Action:** `index`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:dashboard.view`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: dashboard.view + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `GET|HEAD /admin/analytics/reports`
- **Controller:** `App\Http\Controllers\Admin\DashboardController`
- **Action:** `analyticsReports`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:reports.view`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: reports.view + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `GET|HEAD /admin/analytics/tracking`
- **Controller:** `App\Http\Controllers\Admin\DashboardController`
- **Action:** `analyticsTracking`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:seo.manage`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: seo.manage + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `GET|HEAD /admin/events`
- **Controller:** `App\Http\Controllers\Admin\EventController`
- **Action:** `index`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:events.view`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: events.view + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `POST /admin/events`
- **Controller:** `App\Http\Controllers\Admin\EventController`
- **Action:** `store`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:events.create`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: events.create + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** Implicit / Single Statement
- **Database Mutation:** YES (State change in database)
- **External Service:** None
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `GET|HEAD /admin/events/checkin`
- **Controller:** `App\Http\Controllers\Admin\DashboardController`
- **Action:** `eventsCheckin`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:tickets.scan`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: tickets.scan + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `GET|HEAD /admin/events/create`
- **Controller:** `App\Http\Controllers\Admin\EventController`
- **Action:** `create`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:events.create`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: events.create + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `GET|HEAD /admin/events/orders`
- **Controller:** `App\Http\Controllers\Admin\DashboardController`
- **Action:** `eventsOrders`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:events.view`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: events.view + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `GET|HEAD /admin/events/tickets`
- **Controller:** `App\Http\Controllers\Admin\DashboardController`
- **Action:** `eventsTickets`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:events.view`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: events.view + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `PUT|PATCH /admin/events/{event}`
- **Controller:** `App\Http\Controllers\Admin\EventController`
- **Action:** `update`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:events.update`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: events.update + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** Implicit / Single Statement
- **Database Mutation:** YES (State change in database)
- **External Service:** None
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `DELETE /admin/events/{event}`
- **Controller:** `App\Http\Controllers\Admin\EventController`
- **Action:** `destroy`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:events.delete`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: events.delete + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** Implicit / Single Statement
- **Database Mutation:** YES (State change in database)
- **External Service:** None
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `GET|HEAD /admin/events/{event}/edit`
- **Controller:** `App\Http\Controllers\Admin\EventController`
- **Action:** `edit`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:events.update`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: events.update + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `GET|HEAD /admin/experiences`
- **Controller:** `App\Http\Controllers\Admin\ExperienceController`
- **Action:** `index`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:experiences.view`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: experiences.view + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `POST /admin/experiences`
- **Controller:** `App\Http\Controllers\Admin\ExperienceController`
- **Action:** `store`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:experiences.create`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: experiences.create + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** Implicit / Single Statement
- **Database Mutation:** YES (State change in database)
- **External Service:** None
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `GET|HEAD /admin/experiences/boats`
- **Controller:** `App\Http\Controllers\Admin\DashboardController`
- **Action:** `experiencesBoats`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:experiences.view`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: experiences.view + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `GET|HEAD /admin/experiences/categories`
- **Controller:** `App\Http\Controllers\Admin\DashboardController`
- **Action:** `experiencesCategories`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:experiences.view`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: experiences.view + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `GET|HEAD /admin/experiences/create`
- **Controller:** `App\Http\Controllers\Admin\ExperienceController`
- **Action:** `create`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:experiences.create`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: experiences.create + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `GET|HEAD /admin/experiences/safari`
- **Controller:** `App\Http\Controllers\Admin\DashboardController`
- **Action:** `experiencesSafari`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:experiences.view`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: experiences.view + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `GET|HEAD /admin/experiences/vehicles`
- **Controller:** `App\Http\Controllers\Admin\DashboardController`
- **Action:** `experiencesVehicles`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:vehicles.manage`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: vehicles.manage + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `PUT|PATCH /admin/experiences/{experience}`
- **Controller:** `App\Http\Controllers\Admin\ExperienceController`
- **Action:** `update`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:experiences.update`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: experiences.update + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** Implicit / Single Statement
- **Database Mutation:** YES (State change in database)
- **External Service:** None
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `DELETE /admin/experiences/{experience}`
- **Controller:** `App\Http\Controllers\Admin\ExperienceController`
- **Action:** `destroy`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:experiences.delete`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: experiences.delete + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** Implicit / Single Statement
- **Database Mutation:** YES (State change in database)
- **External Service:** None
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `GET|HEAD /admin/experiences/{experience}/edit`
- **Controller:** `App\Http\Controllers\Admin\ExperienceController`
- **Action:** `edit`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:experiences.update`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: experiences.update + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `GET|HEAD /admin/pricing/base`
- **Controller:** `App\Http\Controllers\Admin\DashboardController`
- **Action:** `pricingBase`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:pricing.manage`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: pricing.manage + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `GET|HEAD /admin/pricing/calendar`
- **Controller:** `App\Http\Controllers\Admin\DashboardController`
- **Action:** `pricingCalendar`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:pricing.manage`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: pricing.manage + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `GET|HEAD /admin/pricing/discounts`
- **Controller:** `App\Http\Controllers\Admin\DashboardController`
- **Action:** `pricingDiscounts`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:pricing.manage`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: pricing.manage + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `GET|HEAD /admin/pricing/fees`
- **Controller:** `App\Http\Controllers\Admin\DashboardController`
- **Action:** `pricingFees`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:pricing.manage`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: pricing.manage + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `GET|HEAD /admin/pricing/seasons`
- **Controller:** `App\Http\Controllers\Admin\DashboardController`
- **Action:** `pricingSeasons`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:pricing.manage`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: pricing.manage + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `GET|HEAD /admin/properties`
- **Controller:** `App\Http\Controllers\Admin\PropertyController`
- **Action:** `index`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:properties.view`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: properties.view + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `POST /admin/properties`
- **Controller:** `App\Http\Controllers\Admin\PropertyController`
- **Action:** `store`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:properties.create`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: properties.create + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** Implicit / Single Statement
- **Database Mutation:** YES (State change in database)
- **External Service:** None
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `GET|HEAD /admin/properties/categories`
- **Controller:** `App\Http\Controllers\Admin\DashboardController`
- **Action:** `propertyCategories`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:properties.view`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: properties.view + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `GET|HEAD /admin/properties/create`
- **Controller:** `App\Http\Controllers\Admin\PropertyController`
- **Action:** `create`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:properties.create`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: properties.create + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `GET|HEAD /admin/properties/locations`
- **Controller:** `App\Http\Controllers\Admin\DashboardController`
- **Action:** `propertyLocations`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:properties.view`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: properties.view + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `GET|HEAD /admin/properties/rent`
- **Controller:** `Closure`
- **Action:** `Closure`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:properties.view`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: properties.view + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `GET|HEAD /admin/properties/sale`
- **Controller:** `Closure`
- **Action:** `Closure`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:properties.view`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: properties.view + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `PUT|PATCH /admin/properties/{property}`
- **Controller:** `App\Http\Controllers\Admin\PropertyController`
- **Action:** `update`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:properties.update`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: properties.update + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** Implicit / Single Statement
- **Database Mutation:** YES (State change in database)
- **External Service:** None
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `DELETE /admin/properties/{property}`
- **Controller:** `App\Http\Controllers\Admin\PropertyController`
- **Action:** `destroy`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:properties.delete`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: properties.delete + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** Implicit / Single Statement
- **Database Mutation:** YES (State change in database)
- **External Service:** None
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `GET|HEAD /admin/properties/{property}/edit`
- **Controller:** `App\Http\Controllers\Admin\PropertyController`
- **Action:** `edit`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:properties.update`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: properties.update + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `GET|HEAD /admin/seo/global`
- **Controller:** `App\Http\Controllers\Admin\DashboardController`
- **Action:** `seoGlobal`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:seo.manage`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: seo.manage + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `GET|HEAD /admin/seo/redirects`
- **Controller:** `App\Http\Controllers\Admin\DashboardController`
- **Action:** `seoRedirects`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:seo.manage`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: seo.manage + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `GET|HEAD /admin/seo/sitemap`
- **Controller:** `App\Http\Controllers\Admin\DashboardController`
- **Action:** `seoSitemap`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:seo.manage`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: seo.manage + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `GET|HEAD /admin/settings/general`
- **Controller:** `App\Http\Controllers\Admin\DashboardController`
- **Action:** `settingsGeneral`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:settings.manage`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: settings.manage + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `GET|HEAD /admin/settings/notifications`
- **Controller:** `App\Http\Controllers\Admin\DashboardController`
- **Action:** `settingsNotifications`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:settings.manage`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: settings.manage + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `GET|HEAD /admin/system/health`
- **Controller:** `App\Http\Controllers\Admin\DashboardController`
- **Action:** `systemHealth`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:settings.manage`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: settings.manage + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `GET|HEAD /admin/system/logs`
- **Controller:** `App\Http\Controllers\Admin\DashboardController`
- **Action:** `systemLogs`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:settings.manage`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: settings.manage + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `GET|HEAD /admin/users`
- **Controller:** `App\Http\Controllers\Admin\DashboardController`
- **Action:** `usersIndex`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:users.manage`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: users.manage + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `GET|HEAD /admin/users/roles`
- **Controller:** `App\Http\Controllers\Admin\DashboardController`
- **Action:** `usersRoles`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:users.manage`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: users.manage + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `GET|HEAD /api/v1/admin/ping`
- **Controller:** `Closure`
- **Action:** `Closure`
- **Middleware:** `api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureAccountActive, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin`
- **Authentication:** None (Public)
- **Authorization:** Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

---

## 4.cms — CMS (4 Routes)

### `GET|HEAD /admin/cms/blog`
- **Controller:** `App\Http\Controllers\Admin\DashboardController`
- **Action:** `cmsBlog`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:cms.manage`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: cms.manage + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `GET|HEAD /admin/cms/faqs`
- **Controller:** `App\Http\Controllers\Admin\DashboardController`
- **Action:** `cmsFaqs`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:cms.manage`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: cms.manage + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `GET|HEAD /admin/cms/navigation`
- **Controller:** `App\Http\Controllers\Admin\DashboardController`
- **Action:** `cmsNavigation`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:cms.manage`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: cms.manage + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

### `GET|HEAD /admin/cms/pages`
- **Controller:** `App\Http\Controllers\Admin\DashboardController`
- **Action:** `cmsPages`
- **Middleware:** `web, App\Http\Middleware\EnsureTwoFactorVerified, App\Http\Middleware\EnsureAdmin, App\Http\Middleware\SetLocale, Illuminate\Auth\Middleware\Authorize:cms.manage`
- **Authentication:** None (Public)
- **Authorization:** Policy / Permission: cms.manage + Admin Role Guard
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** Business financials, Internal admin notes, System configs, User records

---

## 4.public_put_patch — PUBLIC PUT PATCH (1 Routes)

### `PUT /storage/{path}`
- **Controller:** `Closure`
- **Action:** `Closure`
- **Middleware:** `None`
- **Authentication:** None (Public)
- **Authorization:** None
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** Implicit / Single Statement
- **Database Mutation:** YES (State change in database)
- **External Service:** None
- **Potential Sensitive Data:** None

---

## 4.public_get — PUBLIC GET (19 Routes)

### `GET|HEAD //`
- **Controller:** `App\Http\Controllers\HomeController`
- **Action:** `index`
- **Middleware:** `web, App\Http\Middleware\SetLocale`
- **Authentication:** None (Public)
- **Authorization:** None
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** None

### `GET|HEAD /api/v1/events`
- **Controller:** `App\Http\Controllers\Api\V1\Public\EventController`
- **Action:** `index`
- **Middleware:** `api`
- **Authentication:** None (Public)
- **Authorization:** None
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** None

### `GET|HEAD /api/v1/events/{slug}`
- **Controller:** `App\Http\Controllers\Api\V1\Public\EventController`
- **Action:** `show`
- **Middleware:** `api`
- **Authentication:** None (Public)
- **Authorization:** None
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** None

### `GET|HEAD /api/v1/experiences`
- **Controller:** `App\Http\Controllers\Api\V1\Public\ExperienceController`
- **Action:** `index`
- **Middleware:** `api`
- **Authentication:** None (Public)
- **Authorization:** None
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** None

### `GET|HEAD /api/v1/experiences/{slug}`
- **Controller:** `App\Http\Controllers\Api\V1\Public\ExperienceController`
- **Action:** `show`
- **Middleware:** `api`
- **Authentication:** None (Public)
- **Authorization:** None
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** None

### `GET|HEAD /api/v1/stays`
- **Controller:** `App\Http\Controllers\Api\V1\Public\StayController`
- **Action:** `index`
- **Middleware:** `api`
- **Authentication:** None (Public)
- **Authorization:** None
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** None

### `GET|HEAD /api/v1/stays/{slug}`
- **Controller:** `App\Http\Controllers\Api\V1\Public\StayController`
- **Action:** `show`
- **Middleware:** `api`
- **Authentication:** None (Public)
- **Authorization:** None
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** None

### `GET|HEAD /experiences`
- **Controller:** `App\Http\Controllers\ExperienceListingController`
- **Action:** `index`
- **Middleware:** `web, App\Http\Middleware\SetLocale`
- **Authentication:** None (Public)
- **Authorization:** None
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** None

### `GET|HEAD /experiences/{experience}`
- **Controller:** `App\Http\Controllers\ExperienceListingController`
- **Action:** `show`
- **Middleware:** `web, App\Http\Middleware\SetLocale`
- **Authentication:** None (Public)
- **Authorization:** None
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** None

### `GET|HEAD /locale/{locale}`
- **Controller:** `App\Http\Controllers\Admin\LocaleController`
- **Action:** `switch`
- **Middleware:** `web`
- **Authentication:** None (Public)
- **Authorization:** None
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** None

### `GET|HEAD /properties`
- **Controller:** `App\Http\Controllers\PropertyListingController`
- **Action:** `index`
- **Middleware:** `web, App\Http\Middleware\SetLocale`
- **Authentication:** None (Public)
- **Authorization:** None
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** None

### `GET|HEAD /properties/{property}`
- **Controller:** `App\Http\Controllers\PropertyListingController`
- **Action:** `show`
- **Middleware:** `web, App\Http\Middleware\SetLocale`
- **Authentication:** None (Public)
- **Authorization:** None
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** None

### `GET|HEAD /robots.txt`
- **Controller:** `App\Http\Controllers\SeoController`
- **Action:** `robots`
- **Middleware:** `web, App\Http\Middleware\SetLocale`
- **Authentication:** None (Public)
- **Authorization:** None
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** None

### `GET|HEAD /sanctum/csrf-cookie`
- **Controller:** `Laravel\Sanctum\Http\Controllers\CsrfCookieController`
- **Action:** `show`
- **Middleware:** `web`
- **Authentication:** None (Public)
- **Authorization:** None
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** None

### `GET|HEAD /sitemap.xml`
- **Controller:** `App\Http\Controllers\SeoController`
- **Action:** `sitemap`
- **Middleware:** `web, App\Http\Middleware\SetLocale`
- **Authentication:** None (Public)
- **Authorization:** None
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** None

### `GET|HEAD /stays`
- **Controller:** `App\Http\Controllers\PropertyListingController`
- **Action:** `index`
- **Middleware:** `web, App\Http\Middleware\SetLocale`
- **Authentication:** None (Public)
- **Authorization:** None
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** None

### `GET|HEAD /stays/{property}`
- **Controller:** `App\Http\Controllers\PropertyListingController`
- **Action:** `show`
- **Middleware:** `web, App\Http\Middleware\SetLocale`
- **Authentication:** None (Public)
- **Authorization:** None
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** None

### `GET|HEAD /storage/{path}`
- **Controller:** `Closure`
- **Action:** `Closure`
- **Middleware:** `None`
- **Authentication:** None (Public)
- **Authorization:** None
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** None

### `GET|HEAD /up`
- **Controller:** `Closure`
- **Action:** `Closure`
- **Middleware:** `None`
- **Authentication:** None (Public)
- **Authorization:** None
- **Rate Limit:** `None`
- **Idempotency:** None
- **Transaction:** None
- **Database Mutation:** NO (Read only)
- **External Service:** None
- **Potential Sensitive Data:** None

---

