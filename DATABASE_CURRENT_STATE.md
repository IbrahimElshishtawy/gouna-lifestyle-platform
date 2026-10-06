# DATABASE CURRENT STATE ARCHITECTURE AUDIT (PHASE 0)

> **Document Type:** Production Database Baseline & Current State Specification  
> **Application:** GouNow El Gouna Lifestyle & Vacation Platform (Laravel 12)  
> **Target Engines:** PostgreSQL 16 (Primary Production) / SQLite 3 (Test/Local)  
> **Status:** Discovered, Audited & Fully Grounded in Codebase  

---

## 1. Executive Summary & Architecture Overview

This document establishes the comprehensive ground truth for the GouNow persistent database layer prior to applying any structural optimizations. The audit covers **53 tables**, **38 Eloquent models**, **41 database migrations**, and their interactions with Controllers, Form Requests, Services, API Resources, and the Next.js frontend.

### Key Statistical Metrics
- **Total Tables:** 53
- **Eloquent Managed Tables:** 38 (38 models mapped)
- **Framework & Pivot Tables:** 15 (Sanctum tokens, Sessions, Cache, Queue Jobs, RBAC & Amenity pivots)
- **Total Foreign Key Constraints:** 51 explicit relational constraints enforced in database
- **Total Indexes:** 114 primary, unique, and secondary indexes
- **Polymorphic Entities:** 6 tables (`bookings`, `media`, `activity_logs`, `leads`, `favorites`, `seo_metadata`)
- **Financial Integrity:** 100% integer cents (`*_cents`) strategy with zero floating-point money fields

---

## 2. Table Classification Analysis

### High-Volume Tables
These tables experience rapid row growth and require partitioned indexes, strict query scoping, or pruning strategies:
1. `activity_logs`: Administrative and operational audit trail records.
2. `booking_nightly_prices`: Granular rate snapshot for every reserved night per booking (N nights × M bookings).
3. `payment_transactions`: Financial transaction ledger, card gateway attempts, 3DS challenges, webhooks.
4. `ticket_scans`: High-concurrency event door access control logs.
5. `media`: Media catalog storing photos, floor plans, and assets for all inventory types.
6. `notifications`: In-app alerts and notifications delivered to users.
7. `sessions`: Web session storage for visitors and administrators.
8. `jobs` / `job_batches` / `failed_jobs`: Asynchronous processing queues for emails, PDFs, webhooks.

### Potentially Dangerous Tables
Tables containing critical credentials, state machines, or financial money flows:
1. `users`: Credentials, password hashes, two-factor authentication secrets, status.
2. `bookings`: Central business reservation state; subject to race conditions and double bookings.
3. `payment_transactions`: External gateway references, money transfer logs, refund tracking.
4. `personal_access_tokens`: API authorization tokens for Sanctum bearer auth.
5. `idempotency_keys`: Critical for avoiding duplicate payments or duplicate booking reservations.
6. `roles` & `permissions`: RBAC authorization matrices controlling administrative privileges.

### Duplicate / Redundant Structures Identified
1. **Duplicate Index in `bookings`:**
   - `bookings_availability_search_idx` and `idx_bookings_concurrency_conflict` both index identical 5 columns: `(bookable_type, bookable_id, status, check_in, check_out)`.
   - *Action Plan:* Safely drop `bookings_availability_search_idx` in a non-destructive migration while retaining `idx_bookings_concurrency_conflict`.
2. **Duplicate Index in `properties`:**
   - `properties_base_price_cents_index` (from initial migration) and `idx_properties_base_price` (from concurrency migration) both index single column `(base_price_cents)`.
   - *Action Plan:* Safely drop `idx_properties_base_price` in a corrective migration.
3. **Redundant Index Prefix in `bookings`:**
   - `bookings_status_index` `(status)` is a single-column prefix covered by `bookings_status_payment_status_index` `(status, payment_status)` and `idx_bookings_status_created` `(status, created_at)`.

### Unused / Orphan Structures Analysis
- **Zero Unused Tables:** All 53 tables correspond to active Laravel features, models, migrations, or framework contracts.
- **Zero Orphan Foreign Keys:** Every foreign key column references an existing parent table and primary key.
- **Model-Table Alignment:** Zero missing tables for Eloquent models (38 models verified).

### Missing Relationships / Relational Integrity Gaps
All non-foreign-key `*_id` columns were audited:
- `bookings.bookable_id`: Polymorphic (`bookable_type` + `bookable_id`). Indexed.
- `media.mediable_id`: Polymorphic (`mediable_type` + `mediable_id`). Indexed.
- `leads.leadable_id`: Polymorphic (`leadable_type` + `leadable_id`). Indexed.
- `favorites.favoriteable_id`: Polymorphic (`favoriteable_type` + `favoriteable_id`). Indexed.
- `activity_logs.entity_id`: Polymorphic (`entity_type` + `entity_id`). Indexed.
- `seo_metadata.seoable_id`: Polymorphic (`seoable_type` + `seoable_id`). Indexed.
- `notifications.notifiable_id`: Polymorphic (`notifiable_type` + `notifiable_id`). Indexed.
- `personal_access_tokens.tokenable_id`: Polymorphic Sanctum (`tokenable_type` + `tokenable_id`). Indexed.
- `payment_transactions.transaction_id`: Gateway string identifier (e.g. Paymob/Stripe charge ID). Indexed.
- `payment_transactions.webhook_event_id`: External gateway webhook idempotency ID. Unique constraint enforced.

---

## 3. Comprehensive Table-by-Table Schema Specification

### `activity_logs`
- **Domain:** `AUDIT / COMPLIANCE`
- **Eloquent Model:** `App\Models\ActivityLog`
- **Soft Deletes:** NO
- **Timestamps:** YES (`created_at`, `updated_at`)

#### Columns

| Column | Type | Nullable | Default | Auto Inc | PK | Sensitive / PII | Financial | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `integer` | NO | *NULL* | YES | PK | NO | NO | - |
| `user_id` | `integer` | YES | *NULL* | NO | - | NO | NO | - |
| `action` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `entity_type` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `entity_id` | `integer` | YES | *NULL* | NO | - | NO | NO | - |
| `description` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `old_values` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `new_values` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `ip_address` | `varchar` | YES | *NULL* | NO | - | YES | NO | - |
| `user_agent` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `created_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `updated_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |

#### Foreign Keys

| Constraint | Columns | References Table | References Column | On Delete | On Update |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `fk_activity_logs_user_id` | `user_id` | `users` | `id` | `set null` | `no action` |

#### Indexes & Constraints

| Index Name | Columns | Unique | Primary | Type / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `activity_logs_entity_type_entity_id_index` | `entity_type, entity_id` | NO | NO | Lookup / Secondary Index |
| `activity_logs_user_id_created_at_index` | `user_id, created_at` | NO | NO | Lookup / Secondary Index |
| `primary` | `id` | YES | YES | Primary Key |

#### Eloquent Model Relations

- **`App\Models\ActivityLog::user()`**: `BelongsTo` -> `App\Models\User` (FK: `user_id`)

---

### `amenities`
- **Domain:** `PROPERTIES (Reference)`
- **Eloquent Model:** `App\Models\Amenity`
- **Soft Deletes:** NO
- **Timestamps:** YES (`created_at`, `updated_at`)

#### Columns

| Column | Type | Nullable | Default | Auto Inc | PK | Sensitive / PII | Financial | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `integer` | NO | *NULL* | YES | PK | NO | NO | - |
| `name_en` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `name_ar` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `icon` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `group` | `varchar` | NO | `'general'` | NO | - | NO | NO | - |
| `is_active` | `tinyint(1)` | NO | `'1'` | NO | - | NO | NO | - |
| `sort_order` | `integer` | NO | `'0'` | NO | - | NO | NO | - |
| `created_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `updated_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |

#### Foreign Keys

*No foreign key constraints defined.*

#### Indexes & Constraints

| Index Name | Columns | Unique | Primary | Type / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `primary` | `id` | YES | YES | Primary Key |

#### Eloquent Model Relations

- **`App\Models\Amenity::properties()`**: `BelongsToMany` -> `App\Models\Property` (Pivot: `amenity_property`)

---

### `amenity_property`
- **Domain:** `PROPERTIES (Pivot)`
- **Eloquent Model:** None (Framework / System / Pivot table)
- **Soft Deletes:** NO
- **Timestamps:** NO

#### Columns

| Column | Type | Nullable | Default | Auto Inc | PK | Sensitive / PII | Financial | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `property_id` | `integer` | NO | *NULL* | NO | PK | NO | NO | - |
| `amenity_id` | `integer` | NO | *NULL* | NO | PK | NO | NO | - |

#### Foreign Keys

| Constraint | Columns | References Table | References Column | On Delete | On Update |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `fk_amenity_property_amenity_id` | `amenity_id` | `amenities` | `id` | `cascade` | `no action` |
| `fk_amenity_property_property_id` | `property_id` | `properties` | `id` | `cascade` | `no action` |

#### Indexes & Constraints

| Index Name | Columns | Unique | Primary | Type / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `sqlite_autoindex_amenity_property_1` | `property_id, amenity_id` | YES | YES | Primary Key |

---

### `availability_blocks`
- **Domain:** `PROPERTIES / AVAILABILITY`
- **Eloquent Model:** `App\Models\AvailabilityBlock`
- **Soft Deletes:** NO
- **Timestamps:** YES (`created_at`, `updated_at`)

#### Columns

| Column | Type | Nullable | Default | Auto Inc | PK | Sensitive / PII | Financial | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `integer` | NO | *NULL* | YES | PK | NO | NO | - |
| `property_id` | `integer` | NO | *NULL* | NO | - | NO | NO | - |
| `start_date` | `date` | NO | *NULL* | NO | - | NO | NO | - |
| `end_date` | `date` | NO | *NULL* | NO | - | NO | NO | - |
| `status` | `varchar` | NO | `'blocked'` | NO | - | NO | NO | Controlled state machine |
| `reason` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `created_by` | `integer` | YES | *NULL* | NO | - | NO | NO | - |
| `created_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `updated_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |

#### Foreign Keys

| Constraint | Columns | References Table | References Column | On Delete | On Update |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `fk_availability_blocks_created_by` | `created_by` | `users` | `id` | `set null` | `no action` |
| `fk_availability_blocks_property_id` | `property_id` | `properties` | `id` | `cascade` | `no action` |

#### Indexes & Constraints

| Index Name | Columns | Unique | Primary | Type / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `availability_blocks_property_id_start_date_end_date_index` | `property_id, start_date, end_date` | NO | NO | Lookup / Secondary Index |
| `primary` | `id` | YES | YES | Primary Key |

#### Eloquent Model Relations

- **`App\Models\AvailabilityBlock::property()`**: `BelongsTo` -> `App\Models\Property` (FK: `property_id`)
- **`App\Models\AvailabilityBlock::creator()`**: `BelongsTo` -> `App\Models\User` (FK: `created_by`)

---

### `blog_posts`
- **Domain:** `CMS`
- **Eloquent Model:** `App\Models\BlogPost`
- **Soft Deletes:** YES (`deleted_at`)
- **Timestamps:** YES (`created_at`, `updated_at`)

#### Columns

| Column | Type | Nullable | Default | Auto Inc | PK | Sensitive / PII | Financial | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `integer` | NO | *NULL* | YES | PK | NO | NO | - |
| `author_id` | `integer` | YES | *NULL* | NO | - | NO | NO | - |
| `slug` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `title_en` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `title_ar` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `excerpt_en` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `excerpt_ar` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `content_en` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `content_ar` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `featured_image` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `tags` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `category` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `is_published` | `tinyint(1)` | NO | `'0'` | NO | - | NO | NO | - |
| `published_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `created_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `updated_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `deleted_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |

#### Foreign Keys

| Constraint | Columns | References Table | References Column | On Delete | On Update |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `fk_blog_posts_author_id` | `author_id` | `users` | `id` | `set null` | `no action` |

#### Indexes & Constraints

| Index Name | Columns | Unique | Primary | Type / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `blog_posts_is_published_published_at_index` | `is_published, published_at` | NO | NO | Lookup / Secondary Index |
| `blog_posts_slug_unique` | `slug` | YES | NO | Unique Constraint |
| `primary` | `id` | YES | YES | Primary Key |

#### Eloquent Model Relations

- **`App\Models\BlogPost::author()`**: `BelongsTo` -> `App\Models\User` (FK: `author_id`)
- **`App\Models\BlogPost::seoMetadata()`**: `MorphMany` -> `App\Models\SeoMetadata` (FK: `seoable_id`)

---

### `booking_nightly_prices`
- **Domain:** `BOOKINGS / PRICING (Audit Snapshot)`
- **Eloquent Model:** `App\Models\BookingNightlyPrice`
- **Soft Deletes:** NO
- **Timestamps:** YES (`created_at`, `updated_at`)

#### Columns

| Column | Type | Nullable | Default | Auto Inc | PK | Sensitive / PII | Financial | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `integer` | NO | *NULL* | YES | PK | NO | NO | - |
| `booking_id` | `integer` | NO | *NULL* | NO | - | NO | NO | - |
| `night_date` | `date` | NO | *NULL* | NO | - | NO | NO | - |
| `price_cents` | `integer` | NO | *NULL* | NO | - | NO | YES | Integer cents currency |
| `currency` | `varchar` | NO | `'EGP'` | NO | - | NO | NO | - |
| `seasonal_price_id` | `integer` | YES | *NULL* | NO | - | NO | YES | - |
| `season_name` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `is_base_price` | `tinyint(1)` | NO | `'0'` | NO | - | NO | YES | - |
| `created_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `updated_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |

#### Foreign Keys

| Constraint | Columns | References Table | References Column | On Delete | On Update |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `fk_booking_nightly_prices_seasonal_price_id` | `seasonal_price_id` | `seasonal_prices` | `id` | `set null` | `no action` |
| `fk_booking_nightly_prices_booking_id` | `booking_id` | `bookings` | `id` | `cascade` | `no action` |

#### Indexes & Constraints

| Index Name | Columns | Unique | Primary | Type / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `booking_nightly_prices_booking_id_night_date_index` | `booking_id, night_date` | NO | NO | Lookup / Secondary Index |
| `primary` | `id` | YES | YES | Primary Key |

#### Eloquent Model Relations

- **`App\Models\BookingNightlyPrice::booking()`**: `BelongsTo` -> `App\Models\Booking` (FK: `booking_id`)
- **`App\Models\BookingNightlyPrice::seasonalPrice()`**: `BelongsTo` -> `App\Models\SeasonalPrice` (FK: `seasonal_price_id`)

---

### `bookings`
- **Domain:** `BOOKINGS (Core Transaction)`
- **Eloquent Model:** `App\Models\Booking`
- **Soft Deletes:** YES (`deleted_at`)
- **Timestamps:** YES (`created_at`, `updated_at`)

#### Columns

| Column | Type | Nullable | Default | Auto Inc | PK | Sensitive / PII | Financial | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `integer` | NO | *NULL* | YES | PK | NO | NO | - |
| `reference` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `customer_id` | `integer` | YES | *NULL* | NO | - | NO | NO | - |
| `bookable_type` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `bookable_id` | `integer` | YES | *NULL* | NO | - | NO | NO | - |
| `check_in` | `date` | NO | *NULL* | NO | - | NO | NO | - |
| `check_out` | `date` | NO | *NULL* | NO | - | NO | NO | - |
| `nights` | `integer` | NO | *NULL* | NO | - | NO | NO | - |
| `guests` | `integer` | NO | `'1'` | NO | - | NO | NO | - |
| `subtotal_cents` | `integer` | NO | `'0'` | NO | - | NO | YES | Integer cents currency |
| `cleaning_fee_cents` | `integer` | NO | `'0'` | NO | - | NO | YES | Integer cents currency |
| `service_fee_cents` | `integer` | NO | `'0'` | NO | - | NO | YES | Integer cents currency |
| `tax_cents` | `integer` | NO | `'0'` | NO | - | NO | YES | Integer cents currency |
| `discount_cents` | `integer` | NO | `'0'` | NO | - | NO | YES | Integer cents currency |
| `total_cents` | `integer` | NO | `'0'` | NO | - | NO | YES | Integer cents currency |
| `deposit_cents` | `integer` | NO | `'0'` | NO | - | NO | YES | Integer cents currency |
| `amount_paid_cents` | `integer` | NO | `'0'` | NO | - | NO | YES | Integer cents currency |
| `amount_remaining_cents` | `integer` | NO | `'0'` | NO | - | NO | YES | Integer cents currency |
| `currency` | `varchar` | NO | `'EGP'` | NO | - | NO | NO | - |
| `payment_type` | `varchar` | NO | `'full'` | NO | - | NO | NO | - |
| `payment_method_id` | `integer` | YES | *NULL* | NO | - | NO | NO | - |
| `status` | `varchar` | NO | `'draft'` | NO | - | NO | NO | Controlled state machine |
| `payment_status` | `varchar` | NO | `'unpaid'` | NO | - | NO | NO | - |
| `discount_id` | `integer` | YES | *NULL* | NO | - | NO | YES | - |
| `promo_code` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `balance_due_date` | `date` | YES | *NULL* | NO | - | NO | YES | - |
| `internal_notes` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `source` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `assigned_to` | `integer` | YES | *NULL* | NO | - | NO | NO | - |
| `cancelled_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `cancellation_reason` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `refund_amount_cents` | `integer` | NO | `'0'` | NO | - | NO | YES | Integer cents currency |
| `created_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `updated_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `deleted_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `expires_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `booking_access_token` | `varchar` | YES | *NULL* | NO | - | YES | NO | Protected / Hidden |
| `idempotency_key` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `pricing_snapshot` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `cancellation_policy_snapshot` | `text` | YES | *NULL* | NO | - | NO | NO | - |

#### Foreign Keys

| Constraint | Columns | References Table | References Column | On Delete | On Update |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `fk_bookings_assigned_to` | `assigned_to` | `users` | `id` | `set null` | `no action` |
| `fk_bookings_discount_id` | `discount_id` | `discounts` | `id` | `set null` | `no action` |
| `fk_bookings_payment_method_id` | `payment_method_id` | `payment_methods` | `id` | `set null` | `no action` |
| `fk_bookings_customer_id` | `customer_id` | `customers` | `id` | `set null` | `no action` |

#### Indexes & Constraints

| Index Name | Columns | Unique | Primary | Type / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `bookings_availability_search_idx` | `bookable_type, bookable_id, status, check_in, check_out` | NO | NO | Lookup / Secondary Index |
| `bookings_bookable_type_bookable_id_index` | `bookable_type, bookable_id` | NO | NO | Lookup / Secondary Index |
| `bookings_booking_access_token_index` | `booking_access_token` | NO | NO | Lookup / Secondary Index |
| `bookings_check_in_check_out_index` | `check_in, check_out` | NO | NO | Lookup / Secondary Index |
| `bookings_customer_id_status_index` | `customer_id, status` | NO | NO | Lookup / Secondary Index |
| `bookings_expires_at_index` | `expires_at` | NO | NO | Lookup / Secondary Index |
| `bookings_idempotency_key_index` | `idempotency_key` | NO | NO | Lookup / Secondary Index |
| `bookings_payment_status_index` | `payment_status` | NO | NO | Lookup / Secondary Index |
| `bookings_reference_unique` | `reference` | YES | NO | Unique Constraint |
| `bookings_status_index` | `status` | NO | NO | Lookup / Secondary Index |
| `bookings_status_payment_status_index` | `status, payment_status` | NO | NO | Lookup / Secondary Index |
| `idx_bookings_concurrency_conflict` | `bookable_type, bookable_id, status, check_in, check_out` | NO | NO | Lookup / Secondary Index |
| `idx_bookings_status_created` | `status, created_at` | NO | NO | Lookup / Secondary Index |
| `primary` | `id` | YES | YES | Primary Key |

#### Eloquent Model Relations

- **`App\Models\Booking::customer()`**: `BelongsTo` -> `App\Models\Customer` (FK: `customer_id`)
- **`App\Models\Booking::bookable()`**: `MorphTo` -> `App\Models\Booking` (FK: `bookable_id`)
- **`App\Models\Booking::paymentMethod()`**: `BelongsTo` -> `App\Models\PaymentMethod` (FK: `payment_method_id`)
- **`App\Models\Booking::discount()`**: `BelongsTo` -> `App\Models\Discount` (FK: `discount_id`)
- **`App\Models\Booking::assignedUser()`**: `BelongsTo` -> `App\Models\User` (FK: `assigned_to`)
- **`App\Models\Booking::nightlyPrices()`**: `HasMany` -> `App\Models\BookingNightlyPrice` (FK: `booking_id`)
- **`App\Models\Booking::transactions()`**: `HasMany` -> `App\Models\PaymentTransaction` (FK: `booking_id`)
- **`App\Models\Booking::paymentTransactions()`**: `HasMany` -> `App\Models\PaymentTransaction` (FK: `booking_id`)

---

### `cache`
- **Domain:** `SYSTEM / INFRASTRUCTURE`
- **Eloquent Model:** None (Framework / System / Pivot table)
- **Soft Deletes:** NO
- **Timestamps:** NO

#### Columns

| Column | Type | Nullable | Default | Auto Inc | PK | Sensitive / PII | Financial | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `key` | `varchar` | NO | *NULL* | NO | PK | NO | NO | - |
| `value` | `text` | NO | *NULL* | NO | - | NO | NO | - |
| `expiration` | `integer` | NO | *NULL* | NO | - | NO | NO | - |

#### Foreign Keys

*No foreign key constraints defined.*

#### Indexes & Constraints

| Index Name | Columns | Unique | Primary | Type / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `sqlite_autoindex_cache_1` | `key` | YES | YES | Primary Key |

---

### `cache_locks`
- **Domain:** `SYSTEM / INFRASTRUCTURE`
- **Eloquent Model:** None (Framework / System / Pivot table)
- **Soft Deletes:** NO
- **Timestamps:** NO

#### Columns

| Column | Type | Nullable | Default | Auto Inc | PK | Sensitive / PII | Financial | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `key` | `varchar` | NO | *NULL* | NO | PK | NO | NO | - |
| `owner` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `expiration` | `integer` | NO | *NULL* | NO | - | NO | NO | - |

#### Foreign Keys

*No foreign key constraints defined.*

#### Indexes & Constraints

| Index Name | Columns | Unique | Primary | Type / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `sqlite_autoindex_cache_locks_1` | `key` | YES | YES | Primary Key |

---

### `customers`
- **Domain:** `CUSTOMERS / CRM`
- **Eloquent Model:** `App\Models\Customer`
- **Soft Deletes:** YES (`deleted_at`)
- **Timestamps:** YES (`created_at`, `updated_at`)

#### Columns

| Column | Type | Nullable | Default | Auto Inc | PK | Sensitive / PII | Financial | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `integer` | NO | *NULL* | YES | PK | NO | NO | - |
| `user_id` | `integer` | YES | *NULL* | NO | - | NO | NO | - |
| `first_name` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `last_name` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `email` | `varchar` | YES | *NULL* | NO | - | YES | NO | - |
| `phone` | `varchar` | YES | *NULL* | NO | - | YES | NO | - |
| `phone_country_code` | `varchar` | YES | *NULL* | NO | - | YES | NO | - |
| `nationality` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `country_of_residence` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `notes` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `source` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `is_active` | `tinyint(1)` | NO | `'1'` | NO | - | NO | NO | - |
| `created_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `updated_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `deleted_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |

#### Foreign Keys

| Constraint | Columns | References Table | References Column | On Delete | On Update |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `fk_customers_user_id` | `user_id` | `users` | `id` | `set null` | `no action` |

#### Indexes & Constraints

| Index Name | Columns | Unique | Primary | Type / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `customers_email_index` | `email` | NO | NO | Lookup / Secondary Index |
| `primary` | `id` | YES | YES | Primary Key |

#### Eloquent Model Relations

- **`App\Models\Customer::user()`**: `BelongsTo` -> `App\Models\User` (FK: `user_id`)
- **`App\Models\Customer::bookings()`**: `HasMany` -> `App\Models\Booking` (FK: `customer_id`)
- **`App\Models\Customer::eventOrders()`**: `HasMany` -> `App\Models\EventOrder` (FK: `customer_id`)
- **`App\Models\Customer::leads()`**: `HasMany` -> `App\Models\Lead` (FK: `customer_id`)
- **`App\Models\Customer::paymentTransactions()`**: `HasMany` -> `App\Models\PaymentTransaction` (FK: `customer_id`)

---

### `discount_usages`
- **Domain:** `PRICING / AUDIT`
- **Eloquent Model:** `App\Models\DiscountUsage`
- **Soft Deletes:** NO
- **Timestamps:** YES (`created_at`, `updated_at`)

#### Columns

| Column | Type | Nullable | Default | Auto Inc | PK | Sensitive / PII | Financial | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `integer` | NO | *NULL* | YES | PK | NO | NO | - |
| `discount_id` | `integer` | NO | *NULL* | NO | - | NO | YES | - |
| `booking_id` | `integer` | NO | *NULL* | NO | - | NO | NO | - |
| `customer_id` | `integer` | YES | *NULL* | NO | - | NO | NO | - |
| `amount_discounted_cents` | `integer` | NO | *NULL* | NO | - | NO | YES | Integer cents currency |
| `created_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `updated_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |

#### Foreign Keys

| Constraint | Columns | References Table | References Column | On Delete | On Update |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `fk_discount_usages_customer_id` | `customer_id` | `customers` | `id` | `set null` | `no action` |
| `fk_discount_usages_booking_id` | `booking_id` | `bookings` | `id` | `cascade` | `no action` |
| `fk_discount_usages_discount_id` | `discount_id` | `discounts` | `id` | `cascade` | `no action` |

#### Indexes & Constraints

| Index Name | Columns | Unique | Primary | Type / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `primary` | `id` | YES | YES | Primary Key |

#### Eloquent Model Relations

- **`App\Models\DiscountUsage::discount()`**: `BelongsTo` -> `App\Models\Discount` (FK: `discount_id`)
- **`App\Models\DiscountUsage::booking()`**: `BelongsTo` -> `App\Models\Booking` (FK: `booking_id`)
- **`App\Models\DiscountUsage::customer()`**: `BelongsTo` -> `App\Models\Customer` (FK: `customer_id`)

---

### `discounts`
- **Domain:** `PRICING`
- **Eloquent Model:** `App\Models\Discount`
- **Soft Deletes:** YES (`deleted_at`)
- **Timestamps:** YES (`created_at`, `updated_at`)

#### Columns

| Column | Type | Nullable | Default | Auto Inc | PK | Sensitive / PII | Financial | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `integer` | NO | *NULL* | YES | PK | NO | NO | - |
| `name_en` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `name_ar` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `code` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `type` | `varchar` | NO | `'percentage'` | NO | - | NO | NO | - |
| `value` | `numeric` | NO | *NULL* | NO | - | NO | NO | - |
| `currency` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `applies_to_all` | `tinyint(1)` | NO | `'1'` | NO | - | NO | NO | - |
| `applicable_ids` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `applicable_type` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `min_stay_nights` | `integer` | YES | *NULL* | NO | - | NO | NO | - |
| `min_booking_amount_cents` | `integer` | YES | *NULL* | NO | - | NO | YES | Integer cents currency |
| `max_uses` | `integer` | YES | *NULL* | NO | - | NO | NO | - |
| `used_count` | `integer` | NO | `'0'` | NO | - | NO | NO | - |
| `valid_from` | `date` | YES | *NULL* | NO | - | NO | NO | - |
| `valid_until` | `date` | YES | *NULL* | NO | - | NO | NO | - |
| `is_active` | `tinyint(1)` | NO | `'1'` | NO | - | NO | NO | - |
| `created_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `updated_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `deleted_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |

#### Foreign Keys

*No foreign key constraints defined.*

#### Indexes & Constraints

| Index Name | Columns | Unique | Primary | Type / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `discounts_code_unique` | `code` | YES | NO | Unique Constraint |
| `primary` | `id` | YES | YES | Primary Key |

#### Eloquent Model Relations

- **`App\Models\Discount::usages()`**: `HasMany` -> `App\Models\DiscountUsage` (FK: `discount_id`)

---

### `event_orders`
- **Domain:** `EVENTS / TICKETING (Transaction)`
- **Eloquent Model:** `App\Models\EventOrder`
- **Soft Deletes:** YES (`deleted_at`)
- **Timestamps:** YES (`created_at`, `updated_at`)

#### Columns

| Column | Type | Nullable | Default | Auto Inc | PK | Sensitive / PII | Financial | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `integer` | NO | *NULL* | YES | PK | NO | NO | - |
| `order_number` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `event_id` | `integer` | NO | *NULL* | NO | - | NO | NO | - |
| `customer_id` | `integer` | YES | *NULL* | NO | - | NO | NO | - |
| `payment_method_id` | `integer` | YES | *NULL* | NO | - | NO | NO | - |
| `total_cents` | `integer` | NO | *NULL* | NO | - | NO | YES | Integer cents currency |
| `currency` | `varchar` | NO | `'EGP'` | NO | - | NO | NO | - |
| `status` | `varchar` | NO | `'pending'` | NO | - | NO | NO | Controlled state machine |
| `payment_status` | `varchar` | NO | `'unpaid'` | NO | - | NO | NO | - |
| `gateway_reference` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `created_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `updated_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `deleted_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |

#### Foreign Keys

| Constraint | Columns | References Table | References Column | On Delete | On Update |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `fk_event_orders_payment_method_id` | `payment_method_id` | `payment_methods` | `id` | `set null` | `no action` |
| `fk_event_orders_customer_id` | `customer_id` | `customers` | `id` | `set null` | `no action` |
| `fk_event_orders_event_id` | `event_id` | `events` | `id` | `cascade` | `no action` |

#### Indexes & Constraints

| Index Name | Columns | Unique | Primary | Type / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `event_orders_order_number_unique` | `order_number` | YES | NO | Unique Constraint |
| `event_orders_status_index` | `status` | NO | NO | Lookup / Secondary Index |
| `primary` | `id` | YES | YES | Primary Key |

#### Eloquent Model Relations

- **`App\Models\EventOrder::event()`**: `BelongsTo` -> `App\Models\Event` (FK: `event_id`)
- **`App\Models\EventOrder::customer()`**: `BelongsTo` -> `App\Models\Customer` (FK: `customer_id`)
- **`App\Models\EventOrder::paymentMethod()`**: `BelongsTo` -> `App\Models\PaymentMethod` (FK: `payment_method_id`)
- **`App\Models\EventOrder::tickets()`**: `HasMany` -> `App\Models\EventTicket` (FK: `event_order_id`)

---

### `event_ticket_types`
- **Domain:** `EVENTS / TICKETING (Tiers)`
- **Eloquent Model:** `App\Models\EventTicketType`
- **Soft Deletes:** NO
- **Timestamps:** YES (`created_at`, `updated_at`)

#### Columns

| Column | Type | Nullable | Default | Auto Inc | PK | Sensitive / PII | Financial | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `integer` | NO | *NULL* | YES | PK | NO | NO | - |
| `event_id` | `integer` | NO | *NULL* | NO | - | NO | NO | - |
| `name_en` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `name_ar` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `description_en` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `description_ar` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `price_cents` | `integer` | NO | *NULL* | NO | - | NO | YES | Integer cents currency |
| `currency` | `varchar` | NO | `'EGP'` | NO | - | NO | NO | - |
| `capacity` | `integer` | YES | *NULL* | NO | - | NO | NO | - |
| `sold_count` | `integer` | NO | `'0'` | NO | - | NO | NO | - |
| `sales_start_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `sales_end_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `max_per_order` | `integer` | YES | *NULL* | NO | - | NO | NO | - |
| `payment_requirement` | `varchar` | NO | `'full'` | NO | - | NO | NO | - |
| `is_active` | `tinyint(1)` | NO | `'1'` | NO | - | NO | NO | - |
| `sort_order` | `integer` | NO | `'0'` | NO | - | NO | NO | - |
| `created_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `updated_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |

#### Foreign Keys

| Constraint | Columns | References Table | References Column | On Delete | On Update |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `fk_event_ticket_types_event_id` | `event_id` | `events` | `id` | `cascade` | `no action` |

#### Indexes & Constraints

| Index Name | Columns | Unique | Primary | Type / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `event_ticket_types_event_id_is_active_index` | `event_id, is_active` | NO | NO | Lookup / Secondary Index |
| `primary` | `id` | YES | YES | Primary Key |

#### Eloquent Model Relations

- **`App\Models\EventTicketType::event()`**: `BelongsTo` -> `App\Models\Event` (FK: `event_id`)
- **`App\Models\EventTicketType::tickets()`**: `HasMany` -> `App\Models\EventTicket` (FK: `event_ticket_type_id`)

---

### `event_tickets`
- **Domain:** `EVENTS / TICKETING (Scannable Units)`
- **Eloquent Model:** `App\Models\EventTicket`
- **Soft Deletes:** YES (`deleted_at`)
- **Timestamps:** YES (`created_at`, `updated_at`)

#### Columns

| Column | Type | Nullable | Default | Auto Inc | PK | Sensitive / PII | Financial | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `integer` | NO | *NULL* | YES | PK | NO | NO | - |
| `event_order_id` | `integer` | NO | *NULL* | NO | - | NO | NO | - |
| `event_id` | `integer` | NO | *NULL* | NO | - | NO | NO | - |
| `event_ticket_type_id` | `integer` | NO | *NULL* | NO | - | NO | NO | - |
| `customer_id` | `integer` | YES | *NULL* | NO | - | NO | NO | - |
| `ticket_number` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `qr_token` | `varchar` | NO | *NULL* | NO | - | YES | NO | - |
| `price_cents` | `integer` | NO | *NULL* | NO | - | NO | YES | Integer cents currency |
| `currency` | `varchar` | NO | `'EGP'` | NO | - | NO | NO | - |
| `status` | `varchar` | NO | `'valid'` | NO | - | NO | NO | Controlled state machine |
| `used_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `scanned_by` | `integer` | YES | *NULL* | NO | - | NO | NO | - |
| `created_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `updated_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `deleted_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |

#### Foreign Keys

| Constraint | Columns | References Table | References Column | On Delete | On Update |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `fk_event_tickets_scanned_by` | `scanned_by` | `users` | `id` | `set null` | `no action` |
| `fk_event_tickets_customer_id` | `customer_id` | `customers` | `id` | `set null` | `no action` |
| `fk_event_tickets_event_ticket_type_id` | `event_ticket_type_id` | `event_ticket_types` | `id` | `cascade` | `no action` |
| `fk_event_tickets_event_id` | `event_id` | `events` | `id` | `cascade` | `no action` |
| `fk_event_tickets_event_order_id` | `event_order_id` | `event_orders` | `id` | `cascade` | `no action` |

#### Indexes & Constraints

| Index Name | Columns | Unique | Primary | Type / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `event_tickets_event_id_status_index` | `event_id, status` | NO | NO | Lookup / Secondary Index |
| `event_tickets_qr_token_unique` | `qr_token` | YES | NO | Unique Constraint |
| `event_tickets_status_index` | `status` | NO | NO | Lookup / Secondary Index |
| `event_tickets_ticket_number_unique` | `ticket_number` | YES | NO | Unique Constraint |
| `primary` | `id` | YES | YES | Primary Key |

#### Eloquent Model Relations

- **`App\Models\EventTicket::order()`**: `BelongsTo` -> `App\Models\EventOrder` (FK: `event_order_id`)
- **`App\Models\EventTicket::event()`**: `BelongsTo` -> `App\Models\Event` (FK: `event_id`)
- **`App\Models\EventTicket::ticketType()`**: `BelongsTo` -> `App\Models\EventTicketType` (FK: `event_ticket_type_id`)
- **`App\Models\EventTicket::customer()`**: `BelongsTo` -> `App\Models\Customer` (FK: `customer_id`)
- **`App\Models\EventTicket::scanner()`**: `BelongsTo` -> `App\Models\User` (FK: `scanned_by`)
- **`App\Models\EventTicket::scans()`**: `HasMany` -> `App\Models\TicketScan` (FK: `event_ticket_id`)

---

### `events`
- **Domain:** `EVENTS (Core Inventory)`
- **Eloquent Model:** `App\Models\Event`
- **Soft Deletes:** YES (`deleted_at`)
- **Timestamps:** YES (`created_at`, `updated_at`)

#### Columns

| Column | Type | Nullable | Default | Auto Inc | PK | Sensitive / PII | Financial | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `integer` | NO | *NULL* | YES | PK | NO | NO | - |
| `location_id` | `integer` | YES | *NULL* | NO | - | NO | NO | - |
| `slug` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `title_en` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `title_ar` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `short_description_en` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `short_description_ar` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `description_en` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `description_ar` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `organizer` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `event_date` | `date` | NO | *NULL* | NO | - | NO | NO | - |
| `start_time` | `time` | YES | *NULL* | NO | - | NO | NO | - |
| `end_time` | `time` | YES | *NULL* | NO | - | NO | NO | - |
| `venue_name` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `venue_address` | `varchar` | YES | *NULL* | NO | - | YES | NO | - |
| `latitude` | `numeric` | YES | *NULL* | NO | - | NO | NO | - |
| `longitude` | `numeric` | YES | *NULL* | NO | - | NO | NO | - |
| `category` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `is_ticketed` | `tinyint(1)` | NO | `'1'` | NO | - | NO | NO | - |
| `is_featured` | `tinyint(1)` | NO | `'0'` | NO | - | NO | NO | - |
| `is_published` | `tinyint(1)` | NO | `'0'` | NO | - | NO | NO | - |
| `status` | `varchar` | NO | `'draft'` | NO | - | NO | NO | Controlled state machine |
| `created_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `updated_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `deleted_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |

#### Foreign Keys

| Constraint | Columns | References Table | References Column | On Delete | On Update |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `fk_events_location_id` | `location_id` | `locations` | `id` | `set null` | `no action` |

#### Indexes & Constraints

| Index Name | Columns | Unique | Primary | Type / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `events_event_date_is_published_index` | `event_date, is_published` | NO | NO | Lookup / Secondary Index |
| `events_slug_unique` | `slug` | YES | NO | Unique Constraint |
| `primary` | `id` | YES | YES | Primary Key |

#### Eloquent Model Relations

- **`App\Models\Event::location()`**: `BelongsTo` -> `App\Models\Location` (FK: `location_id`)
- **`App\Models\Event::ticketTypes()`**: `HasMany` -> `App\Models\EventTicketType` (FK: `event_id`)
- **`App\Models\Event::orders()`**: `HasMany` -> `App\Models\EventOrder` (FK: `event_id`)
- **`App\Models\Event::tickets()`**: `HasMany` -> `App\Models\EventTicket` (FK: `event_id`)
- **`App\Models\Event::media()`**: `MorphMany` -> `App\Models\Media` (FK: `mediable_id`)
- **`App\Models\Event::images()`**: `MorphMany` -> `App\Models\Media` (FK: `mediable_id`)
- **`App\Models\Event::featuredImage()`**: `MorphMany` -> `App\Models\Media` (FK: `mediable_id`)
- **`App\Models\Event::seoMetadata()`**: `MorphMany` -> `App\Models\SeoMetadata` (FK: `seoable_id`)
- **`App\Models\Event::leads()`**: `MorphMany` -> `App\Models\Lead` (FK: `leadable_id`)

---

### `experience_categories`
- **Domain:** `EXPERIENCES (Reference)`
- **Eloquent Model:** `App\Models\ExperienceCategory`
- **Soft Deletes:** NO
- **Timestamps:** YES (`created_at`, `updated_at`)

#### Columns

| Column | Type | Nullable | Default | Auto Inc | PK | Sensitive / PII | Financial | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `integer` | NO | *NULL* | YES | PK | NO | NO | - |
| `name_en` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `name_ar` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `slug` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `description_en` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `description_ar` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `icon` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `is_active` | `tinyint(1)` | NO | `'1'` | NO | - | NO | NO | - |
| `sort_order` | `integer` | NO | `'0'` | NO | - | NO | NO | - |
| `created_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `updated_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |

#### Foreign Keys

*No foreign key constraints defined.*

#### Indexes & Constraints

| Index Name | Columns | Unique | Primary | Type / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `experience_categories_slug_unique` | `slug` | YES | NO | Unique Constraint |
| `primary` | `id` | YES | YES | Primary Key |

#### Eloquent Model Relations

- **`App\Models\ExperienceCategory::experiences()`**: `HasMany` -> `App\Models\Experience` (FK: `experience_category_id`)

---

### `experiences`
- **Domain:** `EXPERIENCES (Core Inventory / Charters)`
- **Eloquent Model:** `App\Models\Experience`
- **Soft Deletes:** YES (`deleted_at`)
- **Timestamps:** YES (`created_at`, `updated_at`)

#### Columns

| Column | Type | Nullable | Default | Auto Inc | PK | Sensitive / PII | Financial | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `integer` | NO | *NULL* | YES | PK | NO | NO | - |
| `experience_category_id` | `integer` | YES | *NULL* | NO | - | NO | NO | - |
| `location_id` | `integer` | YES | *NULL* | NO | - | NO | NO | - |
| `slug` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `title_en` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `title_ar` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `short_description_en` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `short_description_ar` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `description_en` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `description_ar` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `pricing_model` | `varchar` | NO | `'per_person'` | NO | - | NO | NO | - |
| `base_price_cents` | `integer` | NO | `'0'` | NO | - | NO | YES | Integer cents currency |
| `currency` | `varchar` | NO | `'EGP'` | NO | - | NO | NO | - |
| `max_capacity` | `integer` | YES | *NULL* | NO | - | NO | NO | - |
| `duration` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `payment_requirement` | `varchar` | NO | `'full'` | NO | - | NO | NO | - |
| `deposit_percentage` | `numeric` | YES | *NULL* | NO | - | NO | YES | - |
| `booking_mode` | `varchar` | NO | `'instant'` | NO | - | NO | NO | - |
| `cancellation_policy_en` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `cancellation_policy_ar` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `what_to_bring_en` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `what_to_bring_ar` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `meeting_point_en` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `meeting_point_ar` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `is_featured` | `tinyint(1)` | NO | `'0'` | NO | - | NO | NO | - |
| `is_published` | `tinyint(1)` | NO | `'0'` | NO | - | NO | NO | - |
| `status` | `varchar` | NO | `'draft'` | NO | - | NO | NO | Controlled state machine |
| `created_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `updated_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `deleted_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |

#### Foreign Keys

| Constraint | Columns | References Table | References Column | On Delete | On Update |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `fk_experiences_location_id` | `location_id` | `locations` | `id` | `set null` | `no action` |
| `fk_experiences_experience_category_id` | `experience_category_id` | `experience_categories` | `id` | `set null` | `no action` |

#### Indexes & Constraints

| Index Name | Columns | Unique | Primary | Type / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `experiences_experience_category_id_is_published_index` | `experience_category_id, is_published` | NO | NO | Lookup / Secondary Index |
| `experiences_slug_unique` | `slug` | YES | NO | Unique Constraint |
| `primary` | `id` | YES | YES | Primary Key |

#### Eloquent Model Relations

- **`App\Models\Experience::category()`**: `BelongsTo` -> `App\Models\ExperienceCategory` (FK: `experience_category_id`)
- **`App\Models\Experience::location()`**: `BelongsTo` -> `App\Models\Location` (FK: `location_id`)
- **`App\Models\Experience::media()`**: `MorphMany` -> `App\Models\Media` (FK: `mediable_id`)
- **`App\Models\Experience::images()`**: `MorphMany` -> `App\Models\Media` (FK: `mediable_id`)
- **`App\Models\Experience::featuredImage()`**: `MorphMany` -> `App\Models\Media` (FK: `mediable_id`)
- **`App\Models\Experience::seoMetadata()`**: `MorphMany` -> `App\Models\SeoMetadata` (FK: `seoable_id`)
- **`App\Models\Experience::leads()`**: `MorphMany` -> `App\Models\Lead` (FK: `leadable_id`)

---

### `failed_jobs`
- **Domain:** `SYSTEM / INFRASTRUCTURE`
- **Eloquent Model:** None (Framework / System / Pivot table)
- **Soft Deletes:** NO
- **Timestamps:** NO

#### Columns

| Column | Type | Nullable | Default | Auto Inc | PK | Sensitive / PII | Financial | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `integer` | NO | *NULL* | YES | PK | NO | NO | - |
| `uuid` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `connection` | `text` | NO | *NULL* | NO | - | NO | NO | - |
| `queue` | `text` | NO | *NULL* | NO | - | NO | NO | - |
| `payload` | `text` | NO | *NULL* | NO | - | NO | NO | - |
| `exception` | `text` | NO | *NULL* | NO | - | NO | NO | - |
| `failed_at` | `datetime` | NO | `CURRENT_TIMESTAMP` | NO | - | NO | NO | - |

#### Foreign Keys

*No foreign key constraints defined.*

#### Indexes & Constraints

| Index Name | Columns | Unique | Primary | Type / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `failed_jobs_uuid_unique` | `uuid` | YES | NO | Unique Constraint |
| `primary` | `id` | YES | YES | Primary Key |

---

### `faqs`
- **Domain:** `CMS`
- **Eloquent Model:** `App\Models\Faq`
- **Soft Deletes:** NO
- **Timestamps:** YES (`created_at`, `updated_at`)

#### Columns

| Column | Type | Nullable | Default | Auto Inc | PK | Sensitive / PII | Financial | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `integer` | NO | *NULL* | YES | PK | NO | NO | - |
| `group` | `varchar` | NO | `'general'` | NO | - | NO | NO | - |
| `question_en` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `question_ar` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `answer_en` | `text` | NO | *NULL* | NO | - | NO | NO | - |
| `answer_ar` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `is_published` | `tinyint(1)` | NO | `'1'` | NO | - | NO | NO | - |
| `sort_order` | `integer` | NO | `'0'` | NO | - | NO | NO | - |
| `created_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `updated_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |

#### Foreign Keys

*No foreign key constraints defined.*

#### Indexes & Constraints

| Index Name | Columns | Unique | Primary | Type / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `primary` | `id` | YES | YES | Primary Key |

#### Eloquent Model Relations

*No outgoing relations defined directly on model.*

---

### `favorites`
- **Domain:** `CUSTOMERS / CRM`
- **Eloquent Model:** `App\Models\Favorite`
- **Soft Deletes:** NO
- **Timestamps:** YES (`created_at`, `updated_at`)

#### Columns

| Column | Type | Nullable | Default | Auto Inc | PK | Sensitive / PII | Financial | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `integer` | NO | *NULL* | YES | PK | NO | NO | - |
| `user_id` | `integer` | YES | *NULL* | NO | - | NO | NO | - |
| `session_id` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `favoriteable_type` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `favoriteable_id` | `integer` | YES | *NULL* | NO | - | NO | NO | - |
| `created_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `updated_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |

#### Foreign Keys

| Constraint | Columns | References Table | References Column | On Delete | On Update |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `fk_favorites_user_id` | `user_id` | `users` | `id` | `cascade` | `no action` |

#### Indexes & Constraints

| Index Name | Columns | Unique | Primary | Type / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `favorites_favoriteable_type_favoriteable_id_index` | `favoriteable_type, favoriteable_id` | NO | NO | Lookup / Secondary Index |
| `favorites_session_id_favoriteable_type_index` | `session_id, favoriteable_type` | NO | NO | Lookup / Secondary Index |
| `favorites_user_id_favoriteable_type_favoriteable_id_index` | `user_id, favoriteable_type, favoriteable_id` | NO | NO | Lookup / Secondary Index |
| `primary` | `id` | YES | YES | Primary Key |

#### Eloquent Model Relations

- **`App\Models\Favorite::user()`**: `BelongsTo` -> `App\Models\User` (FK: `user_id`)
- **`App\Models\Favorite::favoriteable()`**: `MorphTo` -> `App\Models\Favorite` (FK: `favoriteable_id`)

---

### `fees`
- **Domain:** `PRICING / FINANCE`
- **Eloquent Model:** `App\Models\Fee`
- **Soft Deletes:** NO
- **Timestamps:** YES (`created_at`, `updated_at`)

#### Columns

| Column | Type | Nullable | Default | Auto Inc | PK | Sensitive / PII | Financial | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `integer` | NO | *NULL* | YES | PK | NO | NO | - |
| `name_en` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `name_ar` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `code` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `type` | `varchar` | NO | `'fixed'` | NO | - | NO | NO | - |
| `value` | `numeric` | NO | *NULL* | NO | - | NO | NO | - |
| `currency` | `varchar` | NO | `'EGP'` | NO | - | NO | NO | - |
| `applies_globally` | `tinyint(1)` | NO | `'1'` | NO | - | NO | NO | - |
| `is_active` | `tinyint(1)` | NO | `'1'` | NO | - | NO | NO | - |
| `sort_order` | `integer` | NO | `'0'` | NO | - | NO | NO | - |
| `created_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `updated_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |

#### Foreign Keys

*No foreign key constraints defined.*

#### Indexes & Constraints

| Index Name | Columns | Unique | Primary | Type / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `fees_code_unique` | `code` | YES | NO | Unique Constraint |
| `primary` | `id` | YES | YES | Primary Key |

#### Eloquent Model Relations

*No outgoing relations defined directly on model.*

---

### `homepage_sections`
- **Domain:** `CMS`
- **Eloquent Model:** `App\Models\HomepageSection`
- **Soft Deletes:** NO
- **Timestamps:** YES (`created_at`, `updated_at`)

#### Columns

| Column | Type | Nullable | Default | Auto Inc | PK | Sensitive / PII | Financial | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `integer` | NO | *NULL* | YES | PK | NO | NO | - |
| `section_key` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `title_en` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `title_ar` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `subtitle_en` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `subtitle_ar` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `content_en` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `content_ar` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `cta_text_en` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `cta_text_ar` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `cta_url` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `background_image` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `background_video` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `extra_data` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `is_visible` | `tinyint(1)` | NO | `'1'` | NO | - | NO | NO | - |
| `sort_order` | `integer` | NO | `'0'` | NO | - | NO | NO | - |
| `created_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `updated_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |

#### Foreign Keys

*No foreign key constraints defined.*

#### Indexes & Constraints

| Index Name | Columns | Unique | Primary | Type / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `homepage_sections_section_key_unique` | `section_key` | YES | NO | Unique Constraint |
| `primary` | `id` | YES | YES | Primary Key |

#### Eloquent Model Relations

*No outgoing relations defined directly on model.*

---

### `idempotency_keys`
- **Domain:** `SYSTEM / CONCURRENCY`
- **Eloquent Model:** None (Framework / System / Pivot table)
- **Soft Deletes:** NO
- **Timestamps:** YES

#### Columns

| Column | Type | Nullable | Default | Auto Inc | PK | Sensitive / PII | Financial | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `integer` | NO | *NULL* | YES | PK | NO | NO | - |
| `key` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `user_id` | `integer` | YES | *NULL* | NO | - | NO | NO | - |
| `route` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `request_hash` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `status` | `varchar` | NO | `'pending'` | NO | - | NO | NO | Controlled state machine |
| `response_code` | `integer` | YES | *NULL* | NO | - | NO | NO | - |
| `response_body` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `response_headers` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `expires_at` | `datetime` | NO | *NULL* | NO | - | NO | NO | - |
| `created_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `updated_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `actor_scope` | `varchar` | NO | `'global'` | NO | - | NO | NO | - |

#### Foreign Keys

| Constraint | Columns | References Table | References Column | On Delete | On Update |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `fk_idempotency_keys_user_id` | `user_id` | `users` | `id` | `set null` | `no action` |

#### Indexes & Constraints

| Index Name | Columns | Unique | Primary | Type / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `idempotency_keys_actor_scope_status_index` | `actor_scope, status` | NO | NO | Lookup / Secondary Index |
| `idempotency_keys_expires_at_index` | `expires_at` | NO | NO | Lookup / Secondary Index |
| `idempotency_keys_key_status_index` | `key, status` | NO | NO | Lookup / Secondary Index |
| `primary` | `id` | YES | YES | Primary Key |
| `uq_idempotency_actor_key` | `actor_scope, key` | YES | NO | Unique Constraint |

---

### `job_batches`
- **Domain:** `SYSTEM / INFRASTRUCTURE`
- **Eloquent Model:** None (Framework / System / Pivot table)
- **Soft Deletes:** NO
- **Timestamps:** YES

#### Columns

| Column | Type | Nullable | Default | Auto Inc | PK | Sensitive / PII | Financial | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `varchar` | NO | *NULL* | NO | PK | NO | NO | - |
| `name` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `total_jobs` | `integer` | NO | *NULL* | NO | - | NO | YES | - |
| `pending_jobs` | `integer` | NO | *NULL* | NO | - | NO | NO | - |
| `failed_jobs` | `integer` | NO | *NULL* | NO | - | NO | NO | - |
| `failed_job_ids` | `text` | NO | *NULL* | NO | - | NO | NO | - |
| `options` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `cancelled_at` | `integer` | YES | *NULL* | NO | - | NO | NO | - |
| `created_at` | `integer` | NO | *NULL* | NO | - | NO | NO | - |
| `finished_at` | `integer` | YES | *NULL* | NO | - | NO | NO | - |

#### Foreign Keys

*No foreign key constraints defined.*

#### Indexes & Constraints

| Index Name | Columns | Unique | Primary | Type / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `sqlite_autoindex_job_batches_1` | `id` | YES | YES | Primary Key |

---

### `jobs`
- **Domain:** `SYSTEM / INFRASTRUCTURE`
- **Eloquent Model:** None (Framework / System / Pivot table)
- **Soft Deletes:** NO
- **Timestamps:** YES

#### Columns

| Column | Type | Nullable | Default | Auto Inc | PK | Sensitive / PII | Financial | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `integer` | NO | *NULL* | YES | PK | NO | NO | - |
| `queue` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `payload` | `text` | NO | *NULL* | NO | - | NO | NO | - |
| `attempts` | `integer` | NO | *NULL* | NO | - | NO | NO | - |
| `reserved_at` | `integer` | YES | *NULL* | NO | - | NO | NO | - |
| `available_at` | `integer` | NO | *NULL* | NO | - | NO | NO | - |
| `created_at` | `integer` | NO | *NULL* | NO | - | NO | NO | - |

#### Foreign Keys

*No foreign key constraints defined.*

#### Indexes & Constraints

| Index Name | Columns | Unique | Primary | Type / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `jobs_queue_index` | `queue` | NO | NO | Lookup / Secondary Index |
| `primary` | `id` | YES | YES | Primary Key |

---

### `leads`
- **Domain:** `CRM / CONCIERGE`
- **Eloquent Model:** `App\Models\Lead`
- **Soft Deletes:** YES (`deleted_at`)
- **Timestamps:** YES (`created_at`, `updated_at`)

#### Columns

| Column | Type | Nullable | Default | Auto Inc | PK | Sensitive / PII | Financial | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `integer` | NO | *NULL* | YES | PK | NO | NO | - |
| `customer_id` | `integer` | YES | *NULL* | NO | - | NO | NO | - |
| `name` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `email` | `varchar` | YES | *NULL* | NO | - | YES | NO | - |
| `phone` | `varchar` | YES | *NULL* | NO | - | YES | NO | - |
| `type` | `varchar` | NO | `'inquiry'` | NO | - | NO | NO | - |
| `source` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `message` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `leadable_type` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `leadable_id` | `integer` | YES | *NULL* | NO | - | NO | NO | - |
| `status` | `varchar` | NO | `'new'` | NO | - | NO | NO | Controlled state machine |
| `assigned_to` | `integer` | YES | *NULL* | NO | - | NO | NO | - |
| `admin_notes` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `property_location` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `property_type` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `property_bedrooms` | `integer` | YES | *NULL* | NO | - | NO | NO | - |
| `property_area_sqm` | `numeric` | YES | *NULL* | NO | - | NO | NO | - |
| `expected_price_cents` | `integer` | YES | *NULL* | NO | - | NO | YES | Integer cents currency |
| `created_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `updated_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `deleted_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |

#### Foreign Keys

| Constraint | Columns | References Table | References Column | On Delete | On Update |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `fk_leads_assigned_to` | `assigned_to` | `users` | `id` | `set null` | `no action` |
| `fk_leads_customer_id` | `customer_id` | `customers` | `id` | `set null` | `no action` |

#### Indexes & Constraints

| Index Name | Columns | Unique | Primary | Type / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `leads_email_status_index` | `email, status` | NO | NO | Lookup / Secondary Index |
| `leads_leadable_type_leadable_id_index` | `leadable_type, leadable_id` | NO | NO | Lookup / Secondary Index |
| `leads_source_index` | `source` | NO | NO | Lookup / Secondary Index |
| `leads_status_index` | `status` | NO | NO | Lookup / Secondary Index |
| `primary` | `id` | YES | YES | Primary Key |

#### Eloquent Model Relations

- **`App\Models\Lead::customer()`**: `BelongsTo` -> `App\Models\Customer` (FK: `customer_id`)
- **`App\Models\Lead::leadable()`**: `MorphTo` -> `App\Models\Lead` (FK: `leadable_id`)
- **`App\Models\Lead::assignedTo()`**: `BelongsTo` -> `App\Models\User` (FK: `assigned_to`)

---

### `locations`
- **Domain:** `PROPERTIES / EXPERIENCES (Reference)`
- **Eloquent Model:** `App\Models\Location`
- **Soft Deletes:** NO
- **Timestamps:** YES (`created_at`, `updated_at`)

#### Columns

| Column | Type | Nullable | Default | Auto Inc | PK | Sensitive / PII | Financial | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `integer` | NO | *NULL* | YES | PK | NO | NO | - |
| `name_en` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `name_ar` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `slug` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `description_en` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `description_ar` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `city` | `varchar` | NO | `'El Gouna'` | NO | - | NO | NO | - |
| `country` | `varchar` | NO | `'Egypt'` | NO | - | NO | NO | - |
| `latitude` | `numeric` | YES | *NULL* | NO | - | NO | NO | - |
| `longitude` | `numeric` | YES | *NULL* | NO | - | NO | NO | - |
| `is_active` | `tinyint(1)` | NO | `'1'` | NO | - | NO | NO | - |
| `sort_order` | `integer` | NO | `'0'` | NO | - | NO | NO | - |
| `created_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `updated_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |

#### Foreign Keys

*No foreign key constraints defined.*

#### Indexes & Constraints

| Index Name | Columns | Unique | Primary | Type / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `locations_slug_unique` | `slug` | YES | NO | Unique Constraint |
| `primary` | `id` | YES | YES | Primary Key |

#### Eloquent Model Relations

- **`App\Models\Location::properties()`**: `HasMany` -> `App\Models\Property` (FK: `location_id`)
- **`App\Models\Location::experiences()`**: `HasMany` -> `App\Models\Experience` (FK: `location_id`)
- **`App\Models\Location::events()`**: `HasMany` -> `App\Models\Event` (FK: `location_id`)

---

### `media`
- **Domain:** `MEDIA (Polymorphic)`
- **Eloquent Model:** `App\Models\Media`
- **Soft Deletes:** NO
- **Timestamps:** YES (`created_at`, `updated_at`)

#### Columns

| Column | Type | Nullable | Default | Auto Inc | PK | Sensitive / PII | Financial | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `integer` | NO | *NULL* | YES | PK | NO | NO | - |
| `mediable_type` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `mediable_id` | `integer` | NO | *NULL* | NO | - | NO | NO | - |
| `file_path` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `file_name` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `file_type` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `mime_type` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `file_size` | `integer` | NO | `'0'` | NO | - | NO | NO | - |
| `disk` | `varchar` | NO | `'public'` | NO | - | NO | NO | - |
| `alt_text_en` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `alt_text_ar` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `caption_en` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `caption_ar` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `title` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `thumb_path` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `medium_path` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `width` | `integer` | YES | *NULL* | NO | - | NO | NO | - |
| `height` | `integer` | YES | *NULL* | NO | - | NO | NO | - |
| `sort_order` | `integer` | NO | `'0'` | NO | - | NO | NO | - |
| `is_featured` | `tinyint(1)` | NO | `'0'` | NO | - | NO | NO | - |
| `created_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `updated_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |

#### Foreign Keys

*No foreign key constraints defined.*

#### Indexes & Constraints

| Index Name | Columns | Unique | Primary | Type / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `media_mediable_type_mediable_id_index` | `mediable_type, mediable_id` | NO | NO | Lookup / Secondary Index |
| `media_mediable_type_mediable_id_sort_order_index` | `mediable_type, mediable_id, sort_order` | NO | NO | Lookup / Secondary Index |
| `primary` | `id` | YES | YES | Primary Key |

#### Eloquent Model Relations

- **`App\Models\Media::mediable()`**: `MorphTo` -> `App\Models\Media` (FK: `mediable_id`)

---

### `migrations`
- **Domain:** `SYSTEM / INFRASTRUCTURE`
- **Eloquent Model:** None (Framework / System / Pivot table)
- **Soft Deletes:** NO
- **Timestamps:** NO

#### Columns

| Column | Type | Nullable | Default | Auto Inc | PK | Sensitive / PII | Financial | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `integer` | NO | *NULL* | YES | PK | NO | NO | - |
| `migration` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `batch` | `integer` | NO | *NULL* | NO | - | NO | NO | - |

#### Foreign Keys

*No foreign key constraints defined.*

#### Indexes & Constraints

| Index Name | Columns | Unique | Primary | Type / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `primary` | `id` | YES | YES | Primary Key |

---

### `navigation_items`
- **Domain:** `CMS`
- **Eloquent Model:** `App\Models\NavigationItem`
- **Soft Deletes:** NO
- **Timestamps:** YES (`created_at`, `updated_at`)

#### Columns

| Column | Type | Nullable | Default | Auto Inc | PK | Sensitive / PII | Financial | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `integer` | NO | *NULL* | YES | PK | NO | NO | - |
| `menu_location` | `varchar` | NO | `'main'` | NO | - | NO | NO | - |
| `parent_id` | `integer` | YES | *NULL* | NO | - | NO | NO | - |
| `label_en` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `label_ar` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `url` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `route_name` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `target` | `varchar` | NO | `'_self'` | NO | - | NO | NO | - |
| `is_visible` | `tinyint(1)` | NO | `'1'` | NO | - | NO | NO | - |
| `sort_order` | `integer` | NO | `'0'` | NO | - | NO | NO | - |
| `created_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `updated_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |

#### Foreign Keys

| Constraint | Columns | References Table | References Column | On Delete | On Update |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `fk_navigation_items_parent_id` | `parent_id` | `navigation_items` | `id` | `set null` | `no action` |

#### Indexes & Constraints

| Index Name | Columns | Unique | Primary | Type / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `navigation_items_menu_location_is_visible_sort_order_index` | `menu_location, is_visible, sort_order` | NO | NO | Lookup / Secondary Index |
| `primary` | `id` | YES | YES | Primary Key |

#### Eloquent Model Relations

- **`App\Models\NavigationItem::parent()`**: `BelongsTo` -> `App\Models\NavigationItem` (FK: `parent_id`)
- **`App\Models\NavigationItem::children()`**: `HasMany` -> `App\Models\NavigationItem` (FK: `parent_id`)

---

### `notifications`
- **Domain:** `NOTIFICATIONS`
- **Eloquent Model:** `App\Models\AdminNotification`
- **Soft Deletes:** NO
- **Timestamps:** YES (`created_at`, `updated_at`)

#### Columns

| Column | Type | Nullable | Default | Auto Inc | PK | Sensitive / PII | Financial | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `integer` | NO | *NULL* | YES | PK | NO | NO | - |
| `user_id` | `integer` | NO | *NULL* | NO | - | NO | NO | - |
| `type` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `title_en` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `title_ar` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `body_en` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `body_ar` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `notifiable_type` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `notifiable_id` | `integer` | YES | *NULL* | NO | - | NO | NO | - |
| `action_url` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `is_read` | `tinyint(1)` | NO | `'0'` | NO | - | NO | NO | - |
| `read_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `created_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `updated_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |

#### Foreign Keys

| Constraint | Columns | References Table | References Column | On Delete | On Update |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `fk_notifications_user_id` | `user_id` | `users` | `id` | `cascade` | `no action` |

#### Indexes & Constraints

| Index Name | Columns | Unique | Primary | Type / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `notifications_notifiable_type_notifiable_id_index` | `notifiable_type, notifiable_id` | NO | NO | Lookup / Secondary Index |
| `notifications_user_id_is_read_index` | `user_id, is_read` | NO | NO | Lookup / Secondary Index |
| `primary` | `id` | YES | YES | Primary Key |

#### Eloquent Model Relations

- **`App\Models\AdminNotification::user()`**: `BelongsTo` -> `App\Models\User` (FK: `user_id`)
- **`App\Models\AdminNotification::notifiable()`**: `MorphTo` -> `App\Models\AdminNotification` (FK: `notifiable_id`)

---

### `pages`
- **Domain:** `CMS`
- **Eloquent Model:** `App\Models\Page`
- **Soft Deletes:** YES (`deleted_at`)
- **Timestamps:** YES (`created_at`, `updated_at`)

#### Columns

| Column | Type | Nullable | Default | Auto Inc | PK | Sensitive / PII | Financial | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `integer` | NO | *NULL* | YES | PK | NO | NO | - |
| `slug` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `template` | `varchar` | NO | `'default'` | NO | - | NO | NO | - |
| `title_en` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `title_ar` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `content_en` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `content_ar` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `featured_image` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `is_published` | `tinyint(1)` | NO | `'0'` | NO | - | NO | NO | - |
| `show_in_nav` | `tinyint(1)` | NO | `'0'` | NO | - | NO | NO | - |
| `sort_order` | `integer` | NO | `'0'` | NO | - | NO | NO | - |
| `created_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `updated_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `deleted_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |

#### Foreign Keys

*No foreign key constraints defined.*

#### Indexes & Constraints

| Index Name | Columns | Unique | Primary | Type / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `pages_slug_unique` | `slug` | YES | NO | Unique Constraint |
| `primary` | `id` | YES | YES | Primary Key |

#### Eloquent Model Relations

- **`App\Models\Page::seoMetadata()`**: `MorphMany` -> `App\Models\SeoMetadata` (FK: `seoable_id`)

---

### `password_reset_tokens`
- **Domain:** `AUTH`
- **Eloquent Model:** None (Framework / System / Pivot table)
- **Soft Deletes:** NO
- **Timestamps:** YES

#### Columns

| Column | Type | Nullable | Default | Auto Inc | PK | Sensitive / PII | Financial | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `email` | `varchar` | NO | *NULL* | NO | PK | YES | NO | - |
| `token` | `varchar` | NO | *NULL* | NO | - | YES | NO | - |
| `created_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |

#### Foreign Keys

*No foreign key constraints defined.*

#### Indexes & Constraints

| Index Name | Columns | Unique | Primary | Type / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `sqlite_autoindex_password_reset_tokens_1` | `email` | YES | YES | Primary Key |

---

### `payment_method_property`
- **Domain:** `PROPERTIES / PAYMENTS (Pivot)`
- **Eloquent Model:** None (Framework / System / Pivot table)
- **Soft Deletes:** NO
- **Timestamps:** NO

#### Columns

| Column | Type | Nullable | Default | Auto Inc | PK | Sensitive / PII | Financial | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `property_id` | `integer` | NO | *NULL* | NO | PK | NO | NO | - |
| `payment_method_id` | `integer` | NO | *NULL* | NO | PK | NO | NO | - |
| `is_enabled` | `tinyint(1)` | NO | `'1'` | NO | - | NO | NO | - |

#### Foreign Keys

| Constraint | Columns | References Table | References Column | On Delete | On Update |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `fk_payment_method_property_payment_method_id` | `payment_method_id` | `payment_methods` | `id` | `cascade` | `no action` |
| `fk_payment_method_property_property_id` | `property_id` | `properties` | `id` | `cascade` | `no action` |

#### Indexes & Constraints

| Index Name | Columns | Unique | Primary | Type / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `sqlite_autoindex_payment_method_property_1` | `property_id, payment_method_id` | YES | YES | Primary Key |

---

### `payment_methods`
- **Domain:** `PAYMENTS (Reference)`
- **Eloquent Model:** `App\Models\PaymentMethod`
- **Soft Deletes:** NO
- **Timestamps:** YES (`created_at`, `updated_at`)

#### Columns

| Column | Type | Nullable | Default | Auto Inc | PK | Sensitive / PII | Financial | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `integer` | NO | *NULL* | YES | PK | NO | NO | - |
| `name` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `code` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `description` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `logo` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `is_enabled` | `tinyint(1)` | NO | `'1'` | NO | - | NO | NO | - |
| `is_online` | `tinyint(1)` | NO | `'1'` | NO | - | NO | NO | - |
| `gateway_driver` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `test_mode` | `tinyint(1)` | NO | `'1'` | NO | - | NO | NO | - |
| `configuration` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `instructions_en` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `instructions_ar` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `transaction_fee_percentage` | `numeric` | NO | `'0'` | NO | - | NO | YES | - |
| `transaction_fee_fixed_cents` | `integer` | NO | `'0'` | NO | - | NO | YES | Integer cents currency |
| `supported_currencies` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `sort_order` | `integer` | NO | `'0'` | NO | - | NO | NO | - |
| `created_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `updated_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |

#### Foreign Keys

*No foreign key constraints defined.*

#### Indexes & Constraints

| Index Name | Columns | Unique | Primary | Type / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `payment_methods_code_unique` | `code` | YES | NO | Unique Constraint |
| `primary` | `id` | YES | YES | Primary Key |

#### Eloquent Model Relations

- **`App\Models\PaymentMethod::properties()`**: `BelongsToMany` -> `App\Models\Property` (Pivot: `payment_method_property`)
- **`App\Models\PaymentMethod::transactions()`**: `HasMany` -> `App\Models\PaymentTransaction` (FK: `payment_method_id`)

---

### `payment_transactions`
- **Domain:** `PAYMENTS / FINANCE (Immutable Ledger)`
- **Eloquent Model:** `App\Models\PaymentTransaction`
- **Soft Deletes:** NO
- **Timestamps:** YES (`created_at`, `updated_at`)

#### Columns

| Column | Type | Nullable | Default | Auto Inc | PK | Sensitive / PII | Financial | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `integer` | NO | *NULL* | YES | PK | NO | NO | - |
| `transaction_id` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `booking_id` | `integer` | YES | *NULL* | NO | - | NO | NO | - |
| `customer_id` | `integer` | YES | *NULL* | NO | - | NO | NO | - |
| `payment_method_id` | `integer` | YES | *NULL* | NO | - | NO | NO | - |
| `amount_cents` | `integer` | NO | *NULL* | NO | - | NO | YES | Integer cents currency |
| `currency` | `varchar` | NO | `'EGP'` | NO | - | NO | NO | - |
| `type` | `varchar` | NO | `'payment'` | NO | - | NO | NO | - |
| `status` | `varchar` | NO | `'pending'` | NO | - | NO | NO | Controlled state machine |
| `gateway_provider` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `gateway_reference` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `gateway_response` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `manual_reference` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `manual_payment_date` | `date` | YES | *NULL* | NO | - | NO | NO | - |
| `manual_notes` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `recorded_by` | `integer` | YES | *NULL* | NO | - | NO | NO | - |
| `refund_amount_cents` | `integer` | NO | `'0'` | NO | - | NO | YES | Integer cents currency |
| `refund_reason` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `refunded_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `webhook_event_id` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `webhook_processed` | `tinyint(1)` | NO | `'0'` | NO | - | NO | NO | - |
| `failure_reason` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `completed_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `created_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `updated_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `idempotency_key` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |

#### Foreign Keys

| Constraint | Columns | References Table | References Column | On Delete | On Update |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `fk_payment_transactions_recorded_by` | `recorded_by` | `users` | `id` | `set null` | `no action` |
| `fk_payment_transactions_payment_method_id` | `payment_method_id` | `payment_methods` | `id` | `set null` | `no action` |
| `fk_payment_transactions_customer_id` | `customer_id` | `customers` | `id` | `set null` | `no action` |
| `fk_payment_transactions_booking_id` | `booking_id` | `bookings` | `id` | `set null` | `no action` |

#### Indexes & Constraints

| Index Name | Columns | Unique | Primary | Type / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `payment_transactions_booking_id_status_index` | `booking_id, status` | NO | NO | Lookup / Secondary Index |
| `payment_transactions_gateway_reference_index` | `gateway_reference` | NO | NO | Lookup / Secondary Index |
| `payment_transactions_idempotency_key_unique` | `idempotency_key` | YES | NO | Unique Constraint |
| `payment_transactions_transaction_id_unique` | `transaction_id` | YES | NO | Unique Constraint |
| `primary` | `id` | YES | YES | Primary Key |
| `uq_payment_transactions_webhook_event` | `webhook_event_id` | YES | NO | Unique Constraint |

#### Eloquent Model Relations

- **`App\Models\PaymentTransaction::booking()`**: `BelongsTo` -> `App\Models\Booking` (FK: `booking_id`)
- **`App\Models\PaymentTransaction::customer()`**: `BelongsTo` -> `App\Models\Customer` (FK: `customer_id`)
- **`App\Models\PaymentTransaction::paymentMethod()`**: `BelongsTo` -> `App\Models\PaymentMethod` (FK: `payment_method_id`)
- **`App\Models\PaymentTransaction::recordedBy()`**: `BelongsTo` -> `App\Models\User` (FK: `recorded_by`)

---

### `permission_role`
- **Domain:** `RBAC (Pivot)`
- **Eloquent Model:** None (Framework / System / Pivot table)
- **Soft Deletes:** NO
- **Timestamps:** NO

#### Columns

| Column | Type | Nullable | Default | Auto Inc | PK | Sensitive / PII | Financial | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `role_id` | `integer` | NO | *NULL* | NO | PK | NO | NO | - |
| `permission_id` | `integer` | NO | *NULL* | NO | PK | NO | NO | - |

#### Foreign Keys

| Constraint | Columns | References Table | References Column | On Delete | On Update |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `fk_permission_role_permission_id` | `permission_id` | `permissions` | `id` | `cascade` | `no action` |
| `fk_permission_role_role_id` | `role_id` | `roles` | `id` | `cascade` | `no action` |

#### Indexes & Constraints

| Index Name | Columns | Unique | Primary | Type / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `sqlite_autoindex_permission_role_1` | `role_id, permission_id` | YES | YES | Primary Key |

---

### `permission_user`
- **Domain:** `RBAC (Pivot)`
- **Eloquent Model:** None (Framework / System / Pivot table)
- **Soft Deletes:** NO
- **Timestamps:** NO

#### Columns

| Column | Type | Nullable | Default | Auto Inc | PK | Sensitive / PII | Financial | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `user_id` | `integer` | NO | *NULL* | NO | PK | NO | NO | - |
| `permission_id` | `integer` | NO | *NULL* | NO | PK | NO | NO | - |
| `granted` | `tinyint(1)` | NO | `'1'` | NO | - | NO | NO | - |

#### Foreign Keys

| Constraint | Columns | References Table | References Column | On Delete | On Update |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `fk_permission_user_permission_id` | `permission_id` | `permissions` | `id` | `cascade` | `no action` |
| `fk_permission_user_user_id` | `user_id` | `users` | `id` | `cascade` | `no action` |

#### Indexes & Constraints

| Index Name | Columns | Unique | Primary | Type / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `sqlite_autoindex_permission_user_1` | `user_id, permission_id` | YES | YES | Primary Key |

---

### `permissions`
- **Domain:** `RBAC`
- **Eloquent Model:** `App\Models\Permission`
- **Soft Deletes:** NO
- **Timestamps:** YES (`created_at`, `updated_at`)

#### Columns

| Column | Type | Nullable | Default | Auto Inc | PK | Sensitive / PII | Financial | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `integer` | NO | *NULL* | YES | PK | NO | NO | - |
| `name` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `display_name` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `group` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `description` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `created_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `updated_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |

#### Foreign Keys

*No foreign key constraints defined.*

#### Indexes & Constraints

| Index Name | Columns | Unique | Primary | Type / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `permissions_name_unique` | `name` | YES | NO | Unique Constraint |
| `primary` | `id` | YES | YES | Primary Key |

#### Eloquent Model Relations

- **`App\Models\Permission::roles()`**: `BelongsToMany` -> `App\Models\Role` (Pivot: `permission_role`)
- **`App\Models\Permission::users()`**: `BelongsToMany` -> `App\Models\User` (Pivot: `permission_user`)

---

### `personal_access_tokens`
- **Domain:** `AUTH (Sanctum)`
- **Eloquent Model:** None (Framework / System / Pivot table)
- **Soft Deletes:** NO
- **Timestamps:** YES

#### Columns

| Column | Type | Nullable | Default | Auto Inc | PK | Sensitive / PII | Financial | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `integer` | NO | *NULL* | YES | PK | NO | NO | - |
| `tokenable_type` | `varchar` | NO | *NULL* | NO | - | YES | NO | - |
| `tokenable_id` | `integer` | NO | *NULL* | NO | - | YES | NO | - |
| `name` | `text` | NO | *NULL* | NO | - | NO | NO | - |
| `token` | `varchar` | NO | *NULL* | NO | - | YES | NO | - |
| `abilities` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `last_used_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `expires_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `created_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `updated_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |

#### Foreign Keys

*No foreign key constraints defined.*

#### Indexes & Constraints

| Index Name | Columns | Unique | Primary | Type / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `personal_access_tokens_expires_at_index` | `expires_at` | NO | NO | Lookup / Secondary Index |
| `personal_access_tokens_token_unique` | `token` | YES | NO | Unique Constraint |
| `personal_access_tokens_tokenable_type_tokenable_id_index` | `tokenable_type, tokenable_id` | NO | NO | Lookup / Secondary Index |
| `primary` | `id` | YES | YES | Primary Key |

---

### `properties`
- **Domain:** `PROPERTIES (Core Inventory)`
- **Eloquent Model:** `App\Models\Property`
- **Soft Deletes:** YES (`deleted_at`)
- **Timestamps:** YES (`created_at`, `updated_at`)

#### Columns

| Column | Type | Nullable | Default | Auto Inc | PK | Sensitive / PII | Financial | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `integer` | NO | *NULL* | YES | PK | NO | NO | - |
| `reference_number` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `slug` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `property_category_id` | `integer` | YES | *NULL* | NO | - | NO | NO | - |
| `location_id` | `integer` | YES | *NULL* | NO | - | NO | NO | - |
| `title_en` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `title_ar` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `short_description_en` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `short_description_ar` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `description_en` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `description_ar` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `listing_type` | `varchar` | NO | `'rent'` | NO | - | NO | NO | - |
| `bedrooms` | `integer` | NO | `'1'` | NO | - | NO | NO | - |
| `bathrooms` | `integer` | NO | `'1'` | NO | - | NO | NO | - |
| `max_guests` | `integer` | NO | `'2'` | NO | - | NO | NO | - |
| `area_sqm` | `numeric` | YES | *NULL* | NO | - | NO | NO | - |
| `floor` | `integer` | YES | *NULL* | NO | - | NO | NO | - |
| `building` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `compound` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `address` | `text` | YES | *NULL* | NO | - | YES | NO | - |
| `latitude` | `numeric` | YES | *NULL* | NO | - | NO | NO | - |
| `longitude` | `numeric` | YES | *NULL* | NO | - | NO | NO | - |
| `map_url` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `min_stay_nights` | `integer` | NO | `'1'` | NO | - | NO | NO | - |
| `max_stay_nights` | `integer` | YES | *NULL* | NO | - | NO | NO | - |
| `check_in_time` | `time` | NO | `'15:00:00'` | NO | - | NO | NO | - |
| `check_out_time` | `time` | NO | `'11:00:00'` | NO | - | NO | NO | - |
| `base_price_cents` | `integer` | NO | `'0'` | NO | - | NO | YES | Integer cents currency |
| `currency` | `varchar` | NO | `'EGP'` | NO | - | NO | NO | - |
| `cleaning_fee_cents` | `integer` | NO | `'0'` | NO | - | NO | YES | Integer cents currency |
| `service_fee_cents` | `integer` | NO | `'0'` | NO | - | NO | YES | Integer cents currency |
| `tax_percentage` | `numeric` | NO | `'0'` | NO | - | NO | YES | - |
| `sale_price_cents` | `integer` | YES | *NULL* | NO | - | NO | YES | Integer cents currency |
| `payment_requirement` | `varchar` | NO | `'both'` | NO | - | NO | NO | - |
| `deposit_percentage` | `numeric` | YES | *NULL* | NO | - | NO | YES | - |
| `deposit_fixed_cents` | `integer` | YES | *NULL* | NO | - | NO | YES | Integer cents currency |
| `booking_mode` | `varchar` | NO | `'instant'` | NO | - | NO | NO | - |
| `cancellation_policy` | `varchar` | NO | `'moderate'` | NO | - | NO | NO | - |
| `cancellation_policy_text_en` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `cancellation_policy_text_ar` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `house_rules_en` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `house_rules_ar` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `is_featured` | `tinyint(1)` | NO | `'0'` | NO | - | NO | NO | - |
| `is_published` | `tinyint(1)` | NO | `'0'` | NO | - | NO | NO | - |
| `is_available` | `tinyint(1)` | NO | `'1'` | NO | - | NO | NO | - |
| `status` | `varchar` | NO | `'draft'` | NO | - | NO | NO | Controlled state machine |
| `developer` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `completion_status` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `furnished_status` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `created_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `updated_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `deleted_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |

#### Foreign Keys

| Constraint | Columns | References Table | References Column | On Delete | On Update |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `fk_properties_location_id` | `location_id` | `locations` | `id` | `set null` | `no action` |
| `fk_properties_property_category_id` | `property_category_id` | `property_categories` | `id` | `set null` | `no action` |

#### Indexes & Constraints

| Index Name | Columns | Unique | Primary | Type / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `idx_properties_base_price` | `base_price_cents` | NO | NO | Lookup / Secondary Index |
| `idx_properties_catalog_filter` | `status, is_published, listing_type, is_featured` | NO | NO | Lookup / Secondary Index |
| `idx_properties_sale_price` | `sale_price_cents` | NO | NO | Lookup / Secondary Index |
| `primary` | `id` | YES | YES | Primary Key |
| `properties_base_price_cents_index` | `base_price_cents` | NO | NO | Lookup / Secondary Index |
| `properties_bedrooms_bathrooms_index` | `bedrooms, bathrooms` | NO | NO | Lookup / Secondary Index |
| `properties_listing_type_is_published_is_featured_index` | `listing_type, is_published, is_featured` | NO | NO | Lookup / Secondary Index |
| `properties_location_id_index` | `location_id` | NO | NO | Lookup / Secondary Index |
| `properties_property_category_id_is_published_index` | `property_category_id, is_published` | NO | NO | Lookup / Secondary Index |
| `properties_reference_number_unique` | `reference_number` | YES | NO | Unique Constraint |
| `properties_slug_unique` | `slug` | YES | NO | Unique Constraint |

#### Eloquent Model Relations

- **`App\Models\Property::category()`**: `BelongsTo` -> `App\Models\PropertyCategory` (FK: `property_category_id`)
- **`App\Models\Property::location()`**: `BelongsTo` -> `App\Models\Location` (FK: `location_id`)
- **`App\Models\Property::amenities()`**: `BelongsToMany` -> `App\Models\Amenity` (Pivot: `amenity_property`)
- **`App\Models\Property::seasonalPrices()`**: `HasMany` -> `App\Models\SeasonalPrice` (FK: `property_id`)
- **`App\Models\Property::availabilityBlocks()`**: `HasMany` -> `App\Models\AvailabilityBlock` (FK: `property_id`)
- **`App\Models\Property::bookings()`**: `HasMany` -> `App\Models\Booking` (FK: `bookable_id`)
- **`App\Models\Property::media()`**: `MorphMany` -> `App\Models\Media` (FK: `mediable_id`)
- **`App\Models\Property::images()`**: `MorphMany` -> `App\Models\Media` (FK: `mediable_id`)
- **`App\Models\Property::featuredImage()`**: `MorphMany` -> `App\Models\Media` (FK: `mediable_id`)
- **`App\Models\Property::paymentMethods()`**: `BelongsToMany` -> `App\Models\PaymentMethod` (Pivot: `payment_method_property`)
- **`App\Models\Property::seoMetadata()`**: `MorphMany` -> `App\Models\SeoMetadata` (FK: `seoable_id`)
- **`App\Models\Property::favorites()`**: `MorphMany` -> `App\Models\Favorite` (FK: `favoriteable_id`)
- **`App\Models\Property::leads()`**: `MorphMany` -> `App\Models\Lead` (FK: `leadable_id`)

---

### `property_categories`
- **Domain:** `PROPERTIES (Reference)`
- **Eloquent Model:** `App\Models\PropertyCategory`
- **Soft Deletes:** NO
- **Timestamps:** YES (`created_at`, `updated_at`)

#### Columns

| Column | Type | Nullable | Default | Auto Inc | PK | Sensitive / PII | Financial | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `integer` | NO | *NULL* | YES | PK | NO | NO | - |
| `name_en` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `name_ar` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `slug` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `description_en` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `description_ar` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `icon` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `is_active` | `tinyint(1)` | NO | `'1'` | NO | - | NO | NO | - |
| `sort_order` | `integer` | NO | `'0'` | NO | - | NO | NO | - |
| `created_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `updated_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |

#### Foreign Keys

*No foreign key constraints defined.*

#### Indexes & Constraints

| Index Name | Columns | Unique | Primary | Type / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `primary` | `id` | YES | YES | Primary Key |
| `property_categories_slug_unique` | `slug` | YES | NO | Unique Constraint |

#### Eloquent Model Relations

- **`App\Models\PropertyCategory::properties()`**: `HasMany` -> `App\Models\Property` (FK: `property_category_id`)

---

### `redirects`
- **Domain:** `CMS / SEO`
- **Eloquent Model:** `App\Models\Redirect`
- **Soft Deletes:** NO
- **Timestamps:** YES (`created_at`, `updated_at`)

#### Columns

| Column | Type | Nullable | Default | Auto Inc | PK | Sensitive / PII | Financial | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `integer` | NO | *NULL* | YES | PK | NO | NO | - |
| `from_url` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `to_url` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `status_code` | `integer` | NO | `'301'` | NO | - | NO | NO | - |
| `is_active` | `tinyint(1)` | NO | `'1'` | NO | - | NO | NO | - |
| `hit_count` | `integer` | NO | `'0'` | NO | - | NO | NO | - |
| `created_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `updated_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |

#### Foreign Keys

*No foreign key constraints defined.*

#### Indexes & Constraints

| Index Name | Columns | Unique | Primary | Type / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `primary` | `id` | YES | YES | Primary Key |
| `redirects_from_url_unique` | `from_url` | YES | NO | Unique Constraint |

#### Eloquent Model Relations

*No outgoing relations defined directly on model.*

---

### `role_user`
- **Domain:** `RBAC (Pivot)`
- **Eloquent Model:** None (Framework / System / Pivot table)
- **Soft Deletes:** NO
- **Timestamps:** NO

#### Columns

| Column | Type | Nullable | Default | Auto Inc | PK | Sensitive / PII | Financial | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `user_id` | `integer` | NO | *NULL* | NO | PK | NO | NO | - |
| `role_id` | `integer` | NO | *NULL* | NO | PK | NO | NO | - |

#### Foreign Keys

| Constraint | Columns | References Table | References Column | On Delete | On Update |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `fk_role_user_role_id` | `role_id` | `roles` | `id` | `cascade` | `no action` |
| `fk_role_user_user_id` | `user_id` | `users` | `id` | `cascade` | `no action` |

#### Indexes & Constraints

| Index Name | Columns | Unique | Primary | Type / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `sqlite_autoindex_role_user_1` | `user_id, role_id` | YES | YES | Primary Key |

---

### `roles`
- **Domain:** `RBAC`
- **Eloquent Model:** `App\Models\Role`
- **Soft Deletes:** YES (`deleted_at`)
- **Timestamps:** YES (`created_at`, `updated_at`)

#### Columns

| Column | Type | Nullable | Default | Auto Inc | PK | Sensitive / PII | Financial | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `integer` | NO | *NULL* | YES | PK | NO | NO | - |
| `name` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `display_name` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `description` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `is_system` | `tinyint(1)` | NO | `'0'` | NO | - | NO | NO | - |
| `created_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `updated_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `deleted_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |

#### Foreign Keys

*No foreign key constraints defined.*

#### Indexes & Constraints

| Index Name | Columns | Unique | Primary | Type / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `primary` | `id` | YES | YES | Primary Key |
| `roles_name_unique` | `name` | YES | NO | Unique Constraint |

#### Eloquent Model Relations

- **`App\Models\Role::users()`**: `BelongsToMany` -> `App\Models\User` (Pivot: `role_user`)
- **`App\Models\Role::permissions()`**: `BelongsToMany` -> `App\Models\Permission` (Pivot: `permission_role`)

---

### `seasonal_prices`
- **Domain:** `PRICING`
- **Eloquent Model:** `App\Models\SeasonalPrice`
- **Soft Deletes:** NO
- **Timestamps:** YES (`created_at`, `updated_at`)

#### Columns

| Column | Type | Nullable | Default | Auto Inc | PK | Sensitive / PII | Financial | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `integer` | NO | *NULL* | YES | PK | NO | NO | - |
| `property_id` | `integer` | NO | *NULL* | NO | - | NO | NO | - |
| `name_en` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `name_ar` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `start_date` | `date` | NO | *NULL* | NO | - | NO | NO | - |
| `end_date` | `date` | NO | *NULL* | NO | - | NO | NO | - |
| `price_cents` | `integer` | NO | *NULL* | NO | - | NO | YES | Integer cents currency |
| `priority` | `integer` | NO | `'1'` | NO | - | NO | NO | - |
| `min_stay_nights` | `integer` | YES | *NULL* | NO | - | NO | NO | - |
| `is_active` | `tinyint(1)` | NO | `'1'` | NO | - | NO | NO | - |
| `notes` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `created_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `updated_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |

#### Foreign Keys

| Constraint | Columns | References Table | References Column | On Delete | On Update |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `fk_seasonal_prices_property_id` | `property_id` | `properties` | `id` | `cascade` | `no action` |

#### Indexes & Constraints

| Index Name | Columns | Unique | Primary | Type / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `idx_seasonal_prices_lookup` | `property_id, is_active, start_date, end_date, priority` | NO | NO | Lookup / Secondary Index |
| `primary` | `id` | YES | YES | Primary Key |
| `seasonal_prices_property_id_priority_is_active_index` | `property_id, priority, is_active` | NO | NO | Lookup / Secondary Index |
| `seasonal_prices_property_id_start_date_end_date_index` | `property_id, start_date, end_date` | NO | NO | Lookup / Secondary Index |

#### Eloquent Model Relations

- **`App\Models\SeasonalPrice::property()`**: `BelongsTo` -> `App\Models\Property` (FK: `property_id`)

---

### `seo_metadata`
- **Domain:** `CMS / SEO`
- **Eloquent Model:** `App\Models\SeoMetadata`
- **Soft Deletes:** NO
- **Timestamps:** YES (`created_at`, `updated_at`)

#### Columns

| Column | Type | Nullable | Default | Auto Inc | PK | Sensitive / PII | Financial | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `integer` | NO | *NULL* | YES | PK | NO | NO | - |
| `seoable_type` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `seoable_id` | `integer` | YES | *NULL* | NO | - | NO | NO | - |
| `locale` | `varchar` | NO | `'en'` | NO | - | NO | NO | - |
| `meta_title` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `meta_description` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `canonical_url` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `og_title` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `og_description` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `og_image` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `twitter_title` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `twitter_description` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `twitter_image` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `no_index` | `tinyint(1)` | NO | `'0'` | NO | - | NO | NO | - |
| `no_follow` | `tinyint(1)` | NO | `'0'` | NO | - | NO | NO | - |
| `schema_markup` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `created_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `updated_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |

#### Foreign Keys

*No foreign key constraints defined.*

#### Indexes & Constraints

| Index Name | Columns | Unique | Primary | Type / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `primary` | `id` | YES | YES | Primary Key |
| `seo_metadata_seoable_type_seoable_id_index` | `seoable_type, seoable_id` | NO | NO | Lookup / Secondary Index |
| `seo_metadata_seoable_type_seoable_id_locale_index` | `seoable_type, seoable_id, locale` | NO | NO | Lookup / Secondary Index |

#### Eloquent Model Relations

- **`App\Models\SeoMetadata::seoable()`**: `MorphTo` -> `App\Models\SeoMetadata` (FK: `seoable_id`)

---

### `sessions`
- **Domain:** `AUTH / SYSTEM`
- **Eloquent Model:** None (Framework / System / Pivot table)
- **Soft Deletes:** NO
- **Timestamps:** NO

#### Columns

| Column | Type | Nullable | Default | Auto Inc | PK | Sensitive / PII | Financial | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `varchar` | NO | *NULL* | NO | PK | NO | NO | - |
| `user_id` | `integer` | YES | *NULL* | NO | - | NO | NO | - |
| `ip_address` | `varchar` | YES | *NULL* | NO | - | YES | NO | - |
| `user_agent` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `payload` | `text` | NO | *NULL* | NO | - | NO | NO | - |
| `last_activity` | `integer` | NO | *NULL* | NO | - | NO | NO | - |

#### Foreign Keys

*No foreign key constraints defined.*

#### Indexes & Constraints

| Index Name | Columns | Unique | Primary | Type / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `sessions_last_activity_index` | `last_activity` | NO | NO | Lookup / Secondary Index |
| `sessions_user_id_index` | `user_id` | NO | NO | Lookup / Secondary Index |
| `sqlite_autoindex_sessions_1` | `id` | YES | YES | Primary Key |

---

### `settings`
- **Domain:** `SYSTEM / CONFIG`
- **Eloquent Model:** `App\Models\Setting`
- **Soft Deletes:** NO
- **Timestamps:** YES (`created_at`, `updated_at`)

#### Columns

| Column | Type | Nullable | Default | Auto Inc | PK | Sensitive / PII | Financial | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `integer` | NO | *NULL* | YES | PK | NO | NO | - |
| `group` | `varchar` | NO | `'general'` | NO | - | NO | NO | - |
| `key` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `value` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `type` | `varchar` | NO | `'string'` | NO | - | NO | NO | - |
| `created_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `updated_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |

#### Foreign Keys

*No foreign key constraints defined.*

#### Indexes & Constraints

| Index Name | Columns | Unique | Primary | Type / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `primary` | `id` | YES | YES | Primary Key |
| `settings_group_index` | `group` | NO | NO | Lookup / Secondary Index |
| `settings_group_key_unique` | `group, key` | YES | NO | Unique Constraint |
| `settings_key_index` | `key` | NO | NO | Lookup / Secondary Index |

#### Eloquent Model Relations

*No outgoing relations defined directly on model.*

---

### `ticket_scans`
- **Domain:** `EVENTS / TICKETING (Access Audit Log)`
- **Eloquent Model:** `App\Models\TicketScan`
- **Soft Deletes:** NO
- **Timestamps:** YES (`created_at`, `updated_at`)

#### Columns

| Column | Type | Nullable | Default | Auto Inc | PK | Sensitive / PII | Financial | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `integer` | NO | *NULL* | YES | PK | NO | NO | - |
| `event_ticket_id` | `integer` | NO | *NULL* | NO | - | NO | NO | - |
| `scanned_by` | `integer` | NO | *NULL* | NO | - | NO | NO | - |
| `result` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `device_info` | `varchar` | YES | *NULL* | NO | - | YES | NO | - |
| `ip_address` | `varchar` | YES | *NULL* | NO | - | YES | NO | - |
| `created_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `updated_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |

#### Foreign Keys

| Constraint | Columns | References Table | References Column | On Delete | On Update |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `fk_ticket_scans_scanned_by` | `scanned_by` | `users` | `id` | `cascade` | `no action` |
| `fk_ticket_scans_event_ticket_id` | `event_ticket_id` | `event_tickets` | `id` | `cascade` | `no action` |

#### Indexes & Constraints

| Index Name | Columns | Unique | Primary | Type / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `primary` | `id` | YES | YES | Primary Key |

#### Eloquent Model Relations

- **`App\Models\TicketScan::ticket()`**: `BelongsTo` -> `App\Models\EventTicket` (FK: `event_ticket_id`)
- **`App\Models\TicketScan::scanner()`**: `BelongsTo` -> `App\Models\User` (FK: `scanned_by`)

---

### `users`
- **Domain:** `AUTH / USERS`
- **Eloquent Model:** `App\Models\User`
- **Soft Deletes:** YES (`deleted_at`)
- **Timestamps:** YES (`created_at`, `updated_at`)

#### Columns

| Column | Type | Nullable | Default | Auto Inc | PK | Sensitive / PII | Financial | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `integer` | NO | *NULL* | YES | PK | NO | NO | - |
| `name` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `email` | `varchar` | NO | *NULL* | NO | - | YES | NO | - |
| `email_verified_at` | `datetime` | YES | *NULL* | NO | - | YES | NO | - |
| `password` | `varchar` | NO | *NULL* | NO | - | YES | NO | Protected / Hidden |
| `phone` | `varchar` | YES | *NULL* | NO | - | YES | NO | - |
| `avatar` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `locale` | `varchar` | NO | `'en'` | NO | - | NO | NO | - |
| `is_admin` | `tinyint(1)` | NO | `'0'` | NO | - | NO | NO | - |
| `is_active` | `tinyint(1)` | NO | `'1'` | NO | - | NO | NO | - |
| `force_password_change` | `tinyint(1)` | NO | `'0'` | NO | - | YES | NO | - |
| `two_factor_secret` | `varchar` | YES | *NULL* | NO | - | YES | NO | Protected / Hidden |
| `two_factor_recovery_codes` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `two_factor_confirmed_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `last_login_ip` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `last_login_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `remember_token` | `varchar` | YES | *NULL* | NO | - | YES | NO | Protected / Hidden |
| `created_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `updated_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `deleted_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `two_factor_last_step` | `integer` | YES | *NULL* | NO | - | NO | NO | - |

#### Foreign Keys

*No foreign key constraints defined.*

#### Indexes & Constraints

| Index Name | Columns | Unique | Primary | Type / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `primary` | `id` | YES | YES | Primary Key |
| `users_email_unique` | `email` | YES | NO | Unique Constraint |

#### Eloquent Model Relations

- **`App\Models\User::roles()`**: `BelongsToMany` -> `App\Models\Role` (Pivot: `role_user`)
- **`App\Models\User::permissions()`**: `BelongsToMany` -> `App\Models\Permission` (Pivot: `permission_user`)
- **`App\Models\User::activityLogs()`**: `HasMany` -> `App\Models\ActivityLog` (FK: `user_id`)
- **`App\Models\User::adminNotifications()`**: `HasMany` -> `App\Models\AdminNotification` (FK: `user_id`)
- **`App\Models\User::favorites()`**: `HasMany` -> `App\Models\Favorite` (FK: `user_id`)
- **`App\Models\User::tokens()`**: `MorphMany` -> `Laravel\Sanctum\PersonalAccessToken` (FK: `tokenable_id`)
- **`App\Models\User::notifications()`**: `MorphMany` -> `Illuminate\Notifications\DatabaseNotification` (FK: `notifiable_id`)
- **`App\Models\User::readNotifications()`**: `MorphMany` -> `Illuminate\Notifications\DatabaseNotification` (FK: `notifiable_id`)
- **`App\Models\User::unreadNotifications()`**: `MorphMany` -> `Illuminate\Notifications\DatabaseNotification` (FK: `notifiable_id`)

---

### `vehicles`
- **Domain:** `OPERATIONS / CONCIERGE (Fleet)`
- **Eloquent Model:** `App\Models\Vehicle`
- **Soft Deletes:** YES (`deleted_at`)
- **Timestamps:** YES (`created_at`, `updated_at`)

#### Columns

| Column | Type | Nullable | Default | Auto Inc | PK | Sensitive / PII | Financial | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `integer` | NO | *NULL* | YES | PK | NO | NO | - |
| `slug` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `name_en` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `name_ar` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `brand` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `model` | `varchar` | NO | *NULL* | NO | - | NO | NO | - |
| `year` | `integer` | NO | *NULL* | NO | - | NO | NO | - |
| `transmission` | `varchar` | NO | `'automatic'` | NO | - | NO | NO | - |
| `fuel_type` | `varchar` | NO | `'petrol'` | NO | - | NO | NO | - |
| `seats` | `integer` | NO | *NULL* | NO | - | NO | NO | - |
| `daily_price_cents` | `integer` | NO | *NULL* | NO | - | NO | YES | Integer cents currency |
| `weekly_price_cents` | `integer` | YES | *NULL* | NO | - | NO | YES | Integer cents currency |
| `monthly_price_cents` | `integer` | YES | *NULL* | NO | - | NO | YES | Integer cents currency |
| `deposit_cents` | `integer` | YES | *NULL* | NO | - | NO | YES | Integer cents currency |
| `currency` | `varchar` | NO | `'EGP'` | NO | - | NO | NO | - |
| `delivery_available` | `tinyint(1)` | NO | `'0'` | NO | - | NO | NO | - |
| `pickup_location` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `dropoff_location` | `varchar` | YES | *NULL* | NO | - | NO | NO | - |
| `insurance_info_en` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `insurance_info_ar` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `terms_en` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `terms_ar` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `features_en` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `features_ar` | `text` | YES | *NULL* | NO | - | NO | NO | - |
| `is_available` | `tinyint(1)` | NO | `'1'` | NO | - | NO | NO | - |
| `is_published` | `tinyint(1)` | NO | `'0'` | NO | - | NO | NO | - |
| `status` | `varchar` | NO | `'draft'` | NO | - | NO | NO | Controlled state machine |
| `created_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `updated_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |
| `deleted_at` | `datetime` | YES | *NULL* | NO | - | NO | NO | - |

#### Foreign Keys

*No foreign key constraints defined.*

#### Indexes & Constraints

| Index Name | Columns | Unique | Primary | Type / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `primary` | `id` | YES | YES | Primary Key |
| `vehicles_slug_unique` | `slug` | YES | NO | Unique Constraint |

#### Eloquent Model Relations

- **`App\Models\Vehicle::media()`**: `MorphMany` -> `App\Models\Media` (FK: `mediable_id`)

---

