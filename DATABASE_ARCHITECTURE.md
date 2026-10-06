# DATABASE ARCHITECTURE & SPECIFICATION MASTER REFERENCE

> **System:** GouNow El Gouna Lifestyle & Vacation Platform (Laravel 12)  
> **Author:** Database Architecture Engineering Team  
> **Classification:** Production Design & Specification Guide  
> **Status:** Audited, Normalized, Hardened & Fully Documented  

---

## 1. Architecture Overview

The GouNow persistent data layer is engineered for a high-end luxury vacation rental, real estate, and lifestyle experience platform in El Gouna, Red Sea, Egypt. The system accommodates complex multi-channel operations including short-term holiday rentals, long-term property sales, yacht and sea charters, high-ticket event ticketing, and concierge service requests.

### Core Architectural Tenets
1. **Pragmatic Third Normal Form (3NF) with Strategic Snapshots:** Core entities are strictly normalized to eliminate update anomalies, while financial and legal transaction points capture immutable snapshots (`pricing_snapshot`, `booking_nightly_prices`, `cancellation_policy_snapshot`).
2. **Integer Cents Financial Ledger:** Zero floating-point columns for monetary values. All currency values are stored as unsigned 64-bit integer cents (`total_cents`, `base_price_cents`, etc.) with ISO-4217 currency identifiers (`EGP`, `EUR`, `USD`).
3. **Authoritative Concurrency Protection:** High-concurrency race condition and double-booking prevention enforced through covered composite B-Tree indexes, pessimistic locking (`lockForUpdate()`), and PostgreSQL Exclusion Constraints (`EXCLUDE USING gist`) over half-open date ranges `[check_in, check_out)`.
4. **Decoupled Customer & User Identities:** Guests (`customers`) can complete bookings, hold reservations, and create leads without mandatory administrative login, while registered guests link seamlessly to user accounts via nullable `user_id` foreign keys.
5. **Polymorphic Extensibility:** Reusable business capabilities (Media assets, Activity logs, SEO metadata, Leads, Favorites) interface with inventory entities (`properties`, `experiences`, `events`) via standardized Laravel polymorphic patterns.

---

## 2. Business Domain Map

The 53 database tables are partitioned into 22 cohesive business domains:

| Business Domain | Primary Tables | Responsibility |
| :--- | :--- | :--- |
| **AUTH** | `users`, `personal_access_tokens`, `password_reset_tokens`, `sessions` | Authentication, credential security, token issuance, session tracking |
| **RBAC** | `roles`, `permissions`, `role_user`, `permission_role`, `permission_user` | Granular role-based authorization matrix, abilities, overrides |
| **USERS** | `users` | Staff member profiles, agent directory, contact information |
| **CUSTOMERS** | `customers` | Guest traveler identity profiles, VIP status, booking history |
| **PROPERTIES** | `properties`, `property_categories`, `locations`, `amenities`, `amenity_property` | Vacation accommodations, real estate inventory, specifications, neighborhoods |
| **BOOKINGS** | `bookings`, `booking_nightly_prices` | Central reservation lifecycle, nightly rate audits, availability locks |
| **PAYMENTS** | `payment_methods`, `payment_method_property`, `payment_transactions` | Payment gateway configurations, transaction ledger, 3DS challenges |
| **FINANCE** | `payment_transactions`, `fees`, `bookings` (refund tracking) | Financial reconciliations, revenue accounting, fee definitions |
| **PRICING** | `seasonal_prices`, `fees`, `discounts`, `discount_usages` | Dynamic yield management, promo code validation, surge pricing rules |
| **YACHTS** | `experiences` (charter category), `bookings` (polymorphic) | Yacht charters, sea cruises, boat rentals, marine itineraries |
| **EXPERIENCES** | `experiences`, `experience_categories`, `locations` | Curated desert safaris, kitesurfing, private dining, lifestyle activities |
| **EVENTS** | `events`, `locations` | Concerts, festivals, beach parties, cultural schedules |
| **TICKETING** | `event_ticket_types`, `event_orders`, `event_tickets`, `ticket_scans` | Tier pricing, barcode/QR ticket issuance, door access control audit |
| **CONCIERGE** | `leads`, `vehicles` | VIP concierge requests, private chauffeur fleet, viewing scheduling |
| **CRM** | `leads`, `customers`, `favorites` | Inbound inquiries, lead conversion tracking, guest wishlists |
| **INVESTORS** | `properties` (sale listings), `leads` (property viewing inquiries) | Real estate acquisition inquiries and buyer relations |
| **CMS** | `pages`, `homepage_sections`, `navigation_items`, `faqs`, `blog_posts` | Dynamic editorial layout, menus, articles, knowledge base |
| **OPERATIONS** | `availability_blocks`, `vehicles`, `activity_logs` | Calendar maintenance, asset tracking, administrative actions |
| **AUDIT** | `activity_logs`, `ticket_scans`, `discount_usages`, `booking_nightly_prices` | Forensic compliance, promotional use audit, rate preservation |
| **NOTIFICATIONS** | `notifications` | In-app alerts, transactional notification status |
| **MEDIA** | `media` | Polymorphic image/document gallery, responsive formats, sort orders |
| **SYSTEM** | `settings`, `idempotency_keys`, `cache`, `cache_locks`, `jobs`, `job_batches`, `failed_jobs`, `migrations` | Runtime configuration, idempotency, async queues, schema versioning |

---

## 3. Table Catalog & Responsibility Audit (Phase 2)

For every table in the database, the 12 architectural responsibility criteria have been evaluated:

### `activity_logs`
- **1. Responsibility:** Administrative and operational audit trail of system events, logins, and model changes.
- **2. Why It Exists:** Regulatory compliance, forensic investigation, and staff accountability.
- **3. Owning Module:** `AUDIT / COMPLIANCE`
- **4. Dependent Tables:** *None*
- **5. Dependencies:** `users (user_id)`, `polymorphic (entity_type, entity_id)`
- **6. Core Entity:** NO
- **7. Transaction Table:** NO
- **8. Lookup / Reference Table:** NO
- **9. Audit Table:** YES
- **10. Junction / Pivot Table:** NO
- **11. Temporary Data:** NO
- **12. Historical Data:** YES

### `amenities`
- **1. Responsibility:** Property features and conveniences (Private Pool, Beach Access, High-Speed Wi-Fi, etc.).
- **2. Why It Exists:** Catalog filtering and standardized feature display on listings.
- **3. Owning Module:** `PROPERTIES`
- **4. Dependent Tables:** `amenity_property`
- **5. Dependencies:** *None*
- **6. Core Entity:** NO
- **7. Transaction Table:** NO
- **8. Lookup / Reference Table:** YES
- **9. Audit Table:** NO
- **10. Junction / Pivot Table:** NO
- **11. Temporary Data:** NO
- **12. Historical Data:** NO

### `amenity_property`
- **1. Responsibility:** Pivot table linking properties to amenities.
- **2. Why It Exists:** Many-to-many relationship mapping between properties and their features.
- **3. Owning Module:** `PROPERTIES`
- **4. Dependent Tables:** *None*
- **5. Dependencies:** `properties`, `amenities`
- **6. Core Entity:** NO
- **7. Transaction Table:** NO
- **8. Lookup / Reference Table:** NO
- **9. Audit Table:** NO
- **10. Junction / Pivot Table:** YES
- **11. Temporary Data:** NO
- **12. Historical Data:** NO

### `availability_blocks`
- **1. Responsibility:** Blackout date ranges preventing reservations (owner stays, maintenance, renovation).
- **2. Why It Exists:** Physical calendar blocking without creating pseudo-bookings.
- **3. Owning Module:** `PROPERTIES / AVAILABILITY`
- **4. Dependent Tables:** *None*
- **5. Dependencies:** `properties`, `users (created_by)`
- **6. Core Entity:** NO
- **7. Transaction Table:** NO
- **8. Lookup / Reference Table:** NO
- **9. Audit Table:** NO
- **10. Junction / Pivot Table:** NO
- **11. Temporary Data:** NO
- **12. Historical Data:** NO

### `blog_posts`
- **1. Responsibility:** Lifestyle editorial articles, neighborhood guides, and travel inspiration.
- **2. Why It Exists:** Inbound content marketing, community engagement, and organic search ranking.
- **3. Owning Module:** `CMS`
- **4. Dependent Tables:** `seo_metadata (seoable)`, `media (mediable)`
- **5. Dependencies:** `users (author_id)`
- **6. Core Entity:** NO
- **7. Transaction Table:** NO
- **8. Lookup / Reference Table:** NO
- **9. Audit Table:** NO
- **10. Junction / Pivot Table:** NO
- **11. Temporary Data:** NO
- **12. Historical Data:** NO

### `booking_nightly_prices`
- **1. Responsibility:** Itemized audit snapshot of each specific night rate at the moment a booking was confirmed.
- **2. Why It Exists:** Guarantees financial immutability; historical rates remain unaltered even if seasonal rates change later.
- **3. Owning Module:** `BOOKINGS / PRICING`
- **4. Dependent Tables:** *None*
- **5. Dependencies:** `bookings`, `seasonal_prices (nullable reference)`
- **6. Core Entity:** NO
- **7. Transaction Table:** NO
- **8. Lookup / Reference Table:** NO
- **9. Audit Table:** YES
- **10. Junction / Pivot Table:** NO
- **11. Temporary Data:** NO
- **12. Historical Data:** YES

### `bookings`
- **1. Responsibility:** Primary reservation header and state machine for accommodations, yachts, and activities.
- **2. Why It Exists:** Central business transaction containing dates, guests, pricing breakdown snapshots, and payment status.
- **3. Owning Module:** `BOOKINGS`
- **4. Dependent Tables:** `booking_nightly_prices`, `payment_transactions`, `discount_usages`
- **5. Dependencies:** `customers`, `payment_methods`, `discounts`, `users (assigned_to)`, `properties/experiences (polymorphic)`
- **6. Core Entity:** YES
- **7. Transaction Table:** YES
- **8. Lookup / Reference Table:** NO
- **9. Audit Table:** NO
- **10. Junction / Pivot Table:** NO
- **11. Temporary Data:** NO
- **12. Historical Data:** NO

### `cache`
- **1. Responsibility:** Database cache storage for high-frequency computed queries (availability, catalog filters).
- **2. Why It Exists:** Accelerates read operations and offloads primary database load.
- **3. Owning Module:** `SYSTEM / INFRASTRUCTURE`
- **4. Dependent Tables:** *None*
- **5. Dependencies:** *None*
- **6. Core Entity:** NO
- **7. Transaction Table:** NO
- **8. Lookup / Reference Table:** NO
- **9. Audit Table:** NO
- **10. Junction / Pivot Table:** NO
- **11. Temporary Data:** YES
- **12. Historical Data:** NO

### `cache_locks`
- **1. Responsibility:** Atomic distributed locks for concurrency control and race condition prevention.
- **2. Why It Exists:** Coordinates mutex locking across concurrent checkout sessions.
- **3. Owning Module:** `SYSTEM / INFRASTRUCTURE`
- **4. Dependent Tables:** *None*
- **5. Dependencies:** *None*
- **6. Core Entity:** NO
- **7. Transaction Table:** NO
- **8. Lookup / Reference Table:** NO
- **9. Audit Table:** NO
- **10. Junction / Pivot Table:** NO
- **11. Temporary Data:** YES
- **12. Historical Data:** NO

### `customers`
- **1. Responsibility:** Guest traveler and booking customer identity profiles, contact info, and booking history rollup.
- **2. Why It Exists:** Decouples guest profile records from internal staff users; allows guest bookings with optional user link.
- **3. Owning Module:** `CUSTOMERS / CRM`
- **4. Dependent Tables:** `bookings`, `event_orders`, `event_tickets`, `discount_usages`, `payment_transactions`, `leads`
- **5. Dependencies:** `users (nullable link)`
- **6. Core Entity:** YES
- **7. Transaction Table:** NO
- **8. Lookup / Reference Table:** NO
- **9. Audit Table:** NO
- **10. Junction / Pivot Table:** NO
- **11. Temporary Data:** NO
- **12. Historical Data:** NO

### `discount_usages`
- **1. Responsibility:** Immutable audit log of each promo code redemption tied to a booking and customer.
- **2. Why It Exists:** Enforces `max_uses_per_customer` and provides reconciliation of discount promotions.
- **3. Owning Module:** `PRICING / AUDIT`
- **4. Dependent Tables:** *None*
- **5. Dependencies:** `discounts`, `bookings`, `customers`
- **6. Core Entity:** NO
- **7. Transaction Table:** NO
- **8. Lookup / Reference Table:** NO
- **9. Audit Table:** YES
- **10. Junction / Pivot Table:** NO
- **11. Temporary Data:** NO
- **12. Historical Data:** YES

### `discounts`
- **1. Responsibility:** Promotional discount codes, percentage/fixed amounts, validity dates, and usage limits.
- **2. Why It Exists:** Marketing campaigns and checkout promo code redemption.
- **3. Owning Module:** `PRICING`
- **4. Dependent Tables:** `discount_usages`, `bookings (discount_id)`
- **5. Dependencies:** *None*
- **6. Core Entity:** NO
- **7. Transaction Table:** NO
- **8. Lookup / Reference Table:** YES
- **9. Audit Table:** NO
- **10. Junction / Pivot Table:** NO
- **11. Temporary Data:** NO
- **12. Historical Data:** NO

### `event_orders`
- **1. Responsibility:** Order transaction header for ticket purchases.
- **2. Why It Exists:** Aggregates multiple tickets under a single customer order and payment status.
- **3. Owning Module:** `EVENTS / TICKETING`
- **4. Dependent Tables:** `event_tickets`
- **5. Dependencies:** `events`, `customers`, `payment_methods`
- **6. Core Entity:** YES
- **7. Transaction Table:** YES
- **8. Lookup / Reference Table:** NO
- **9. Audit Table:** NO
- **10. Junction / Pivot Table:** NO
- **11. Temporary Data:** NO
- **12. Historical Data:** NO

### `event_ticket_types`
- **1. Responsibility:** Ticket pricing tiers for events (General Admission, VIP Lounge, Early Bird).
- **2. Why It Exists:** Defines capacity quota, price in integer cents, and sales date windows per tier.
- **3. Owning Module:** `EVENTS / TICKETING`
- **4. Dependent Tables:** `event_tickets`
- **5. Dependencies:** `events`
- **6. Core Entity:** NO
- **7. Transaction Table:** NO
- **8. Lookup / Reference Table:** YES
- **9. Audit Table:** NO
- **10. Junction / Pivot Table:** NO
- **11. Temporary Data:** NO
- **12. Historical Data:** NO

### `event_tickets`
- **1. Responsibility:** Individual scannable ticket items with unique QR tokens and access status.
- **2. Why It Exists:** One record per attendee ticket; validated at door for entry.
- **3. Owning Module:** `EVENTS / TICKETING`
- **4. Dependent Tables:** `ticket_scans`
- **5. Dependencies:** `event_orders`, `events`, `event_ticket_types`, `customers`, `users (scanned_by)`
- **6. Core Entity:** YES
- **7. Transaction Table:** YES
- **8. Lookup / Reference Table:** NO
- **9. Audit Table:** NO
- **10. Junction / Pivot Table:** NO
- **11. Temporary Data:** NO
- **12. Historical Data:** NO

### `events`
- **1. Responsibility:** Festivals, music concerts, sports tournaments, and beach parties in El Gouna.
- **2. Why It Exists:** Event discovery, marketing, ticketing schedule, and venue coordination.
- **3. Owning Module:** `EVENTS`
- **4. Dependent Tables:** `event_ticket_types`, `event_orders`, `event_tickets`, `media (mediable)`
- **5. Dependencies:** `locations`
- **6. Core Entity:** YES
- **7. Transaction Table:** NO
- **8. Lookup / Reference Table:** NO
- **9. Audit Table:** NO
- **10. Junction / Pivot Table:** NO
- **11. Temporary Data:** NO
- **12. Historical Data:** NO

### `experience_categories`
- **1. Responsibility:** Categorization for experiential offerings (Boat Trips, Water Sports, Desert Safaris, Nightlife).
- **2. Why It Exists:** Catalog navigation and taxonomy for non-stay activities.
- **3. Owning Module:** `EXPERIENCES`
- **4. Dependent Tables:** `experiences`
- **5. Dependencies:** *None*
- **6. Core Entity:** NO
- **7. Transaction Table:** NO
- **8. Lookup / Reference Table:** YES
- **9. Audit Table:** NO
- **10. Junction / Pivot Table:** NO
- **11. Temporary Data:** NO
- **12. Historical Data:** NO

### `experiences`
- **1. Responsibility:** Curated activities, yacht charters, kitesurfing lessons, and desert adventures.
- **2. Why It Exists:** Inventory catalog for Gouna lifestyle services with pricing, duration, and capacity.
- **3. Owning Module:** `EXPERIENCES / YACHTS`
- **4. Dependent Tables:** `bookings (bookable)`, `media (mediable)`, `leads (leadable)`
- **5. Dependencies:** `locations`, `experience_categories`
- **6. Core Entity:** YES
- **7. Transaction Table:** NO
- **8. Lookup / Reference Table:** NO
- **9. Audit Table:** NO
- **10. Junction / Pivot Table:** NO
- **11. Temporary Data:** NO
- **12. Historical Data:** NO

### `failed_jobs`
- **1. Responsibility:** Dead-letter queue storing failed job payloads, exceptions, and stack traces.
- **2. Why It Exists:** Reliable error tracking and manual or automated retry of background tasks.
- **3. Owning Module:** `SYSTEM / INFRASTRUCTURE`
- **4. Dependent Tables:** *None*
- **5. Dependencies:** *None*
- **6. Core Entity:** NO
- **7. Transaction Table:** NO
- **8. Lookup / Reference Table:** NO
- **9. Audit Table:** YES
- **10. Junction / Pivot Table:** NO
- **11. Temporary Data:** NO
- **12. Historical Data:** YES

### `faqs`
- **1. Responsibility:** Frequently Asked Questions repository categorized by domain (Booking, Check-in, Policies).
- **2. Why It Exists:** Provides structured help content and FAQPage JSON-LD rich snippets.
- **3. Owning Module:** `CMS`
- **4. Dependent Tables:** *None*
- **5. Dependencies:** *None*
- **6. Core Entity:** NO
- **7. Transaction Table:** NO
- **8. Lookup / Reference Table:** NO
- **9. Audit Table:** NO
- **10. Junction / Pivot Table:** NO
- **11. Temporary Data:** NO
- **12. Historical Data:** NO

### `favorites`
- **1. Responsibility:** Saved wishlist properties and experiences for authenticated users or guest session tokens.
- **2. Why It Exists:** User experience enhancement allowing visitors to bookmark preferred stays.
- **3. Owning Module:** `CUSTOMERS / CRM`
- **4. Dependent Tables:** *None*
- **5. Dependencies:** `users (optional user_id)`, `polymorphic (favoriteable_type, favoriteable_id)`
- **6. Core Entity:** NO
- **7. Transaction Table:** NO
- **8. Lookup / Reference Table:** NO
- **9. Audit Table:** NO
- **10. Junction / Pivot Table:** NO
- **11. Temporary Data:** NO
- **12. Historical Data:** NO

### `fees`
- **1. Responsibility:** Configurable fees applied to reservations (cleaning fees, service charges, city taxes).
- **2. Why It Exists:** Standardized fee calculation engine for booking checkout quotes.
- **3. Owning Module:** `PRICING / FINANCE`
- **4. Dependent Tables:** *None*
- **5. Dependencies:** *None*
- **6. Core Entity:** NO
- **7. Transaction Table:** NO
- **8. Lookup / Reference Table:** YES
- **9. Audit Table:** NO
- **10. Junction / Pivot Table:** NO
- **11. Temporary Data:** NO
- **12. Historical Data:** NO

### `homepage_sections`
- **1. Responsibility:** Configurable homepage content blocks (Hero, Featured Stays, Curated Experiences, Testimonials).
- **2. Why It Exists:** Enables marketing team to reorganize and customize the homepage dynamically.
- **3. Owning Module:** `CMS`
- **4. Dependent Tables:** *None*
- **5. Dependencies:** *None*
- **6. Core Entity:** NO
- **7. Transaction Table:** NO
- **8. Lookup / Reference Table:** NO
- **9. Audit Table:** NO
- **10. Junction / Pivot Table:** NO
- **11. Temporary Data:** NO
- **12. Historical Data:** NO

### `idempotency_keys`
- **1. Responsibility:** Stores cryptographic hashes and cached HTTP responses for mutating requests (checkout, payments).
- **2. Why It Exists:** Guarantees strictly once execution for distributed API requests and webhook deliveries.
- **3. Owning Module:** `SYSTEM / CONCURRENCY`
- **4. Dependent Tables:** *None*
- **5. Dependencies:** `users (optional user_id)`
- **6. Core Entity:** NO
- **7. Transaction Table:** NO
- **8. Lookup / Reference Table:** NO
- **9. Audit Table:** NO
- **10. Junction / Pivot Table:** NO
- **11. Temporary Data:** YES
- **12. Historical Data:** NO

### `job_batches`
- **1. Responsibility:** Batch job orchestration and completion monitoring.
- **2. Why It Exists:** Coordinates multi-step background operations.
- **3. Owning Module:** `SYSTEM / INFRASTRUCTURE`
- **4. Dependent Tables:** *None*
- **5. Dependencies:** *None*
- **6. Core Entity:** NO
- **7. Transaction Table:** NO
- **8. Lookup / Reference Table:** NO
- **9. Audit Table:** NO
- **10. Junction / Pivot Table:** NO
- **11. Temporary Data:** YES
- **12. Historical Data:** NO

### `jobs`
- **1. Responsibility:** Asynchronous job queue storage for background tasks (email sending, PDF receipt generation).
- **2. Why It Exists:** Decouples web requests from slow I/O operations.
- **3. Owning Module:** `SYSTEM / INFRASTRUCTURE`
- **4. Dependent Tables:** *None*
- **5. Dependencies:** *None*
- **6. Core Entity:** NO
- **7. Transaction Table:** NO
- **8. Lookup / Reference Table:** NO
- **9. Audit Table:** NO
- **10. Junction / Pivot Table:** NO
- **11. Temporary Data:** YES
- **12. Historical Data:** NO

### `leads`
- **1. Responsibility:** Customer inquiries, concierge requests, sales inquiries, and viewing requests.
- **2. Why It Exists:** CRM inquiry intake and assignment to sales/concierge staff members.
- **3. Owning Module:** `CRM / CONCIERGE`
- **4. Dependent Tables:** *None*
- **5. Dependencies:** `customers`, `users (assigned_to)`, `polymorphic (leadable_type, leadable_id)`
- **6. Core Entity:** YES
- **7. Transaction Table:** NO
- **8. Lookup / Reference Table:** NO
- **9. Audit Table:** NO
- **10. Junction / Pivot Table:** NO
- **11. Temporary Data:** NO
- **12. Historical Data:** NO

### `locations`
- **1. Responsibility:** El Gouna neighborhoods, marinas, and geographical zones (Abu Tig, Marina, Golf, Fanadir).
- **2. Why It Exists:** Geographic categorization, location filtering, map coordinates, and SEO slug routing.
- **3. Owning Module:** `PROPERTIES / EXPERIENCES`
- **4. Dependent Tables:** `properties`, `experiences`, `events`
- **5. Dependencies:** *None*
- **6. Core Entity:** NO
- **7. Transaction Table:** NO
- **8. Lookup / Reference Table:** YES
- **9. Audit Table:** NO
- **10. Junction / Pivot Table:** NO
- **11. Temporary Data:** NO
- **12. Historical Data:** NO

### `media`
- **1. Responsibility:** Polymorphic asset registry (photos, floor plans, video covers, document attachments).
- **2. Why It Exists:** Centralized media storage, responsive dimensions, CDN URLs, and sort order.
- **3. Owning Module:** `MEDIA`
- **4. Dependent Tables:** *None*
- **5. Dependencies:** `polymorphic (mediable_type, mediable_id)`
- **6. Core Entity:** YES
- **7. Transaction Table:** NO
- **8. Lookup / Reference Table:** NO
- **9. Audit Table:** NO
- **10. Junction / Pivot Table:** NO
- **11. Temporary Data:** NO
- **12. Historical Data:** NO

### `migrations`
- **1. Responsibility:** Schema migration execution ledger.
- **2. Why It Exists:** Tracks executed schema changes across deployment environments.
- **3. Owning Module:** `SYSTEM / INFRASTRUCTURE`
- **4. Dependent Tables:** *None*
- **5. Dependencies:** *None*
- **6. Core Entity:** NO
- **7. Transaction Table:** NO
- **8. Lookup / Reference Table:** NO
- **9. Audit Table:** YES
- **10. Junction / Pivot Table:** NO
- **11. Temporary Data:** NO
- **12. Historical Data:** YES

### `navigation_items`
- **1. Responsibility:** Header, footer, and mobile drawer navigation menu hierarchies.
- **2. Why It Exists:** Dynamic navigation structure supporting multi-level nested menus.
- **3. Owning Module:** `CMS`
- **4. Dependent Tables:** `navigation_items (self-referencing children)`
- **5. Dependencies:** `navigation_items (parent_id)`
- **6. Core Entity:** NO
- **7. Transaction Table:** NO
- **8. Lookup / Reference Table:** YES
- **9. Audit Table:** NO
- **10. Junction / Pivot Table:** NO
- **11. Temporary Data:** NO
- **12. Historical Data:** NO

### `notifications`
- **1. Responsibility:** User-targeted notifications, booking confirmations, and operational alerts.
- **2. Why It Exists:** In-app notification center and delivery status tracking.
- **3. Owning Module:** `NOTIFICATIONS`
- **4. Dependent Tables:** *None*
- **5. Dependencies:** `users (user_id)`, `polymorphic (notifiable_type, notifiable_id)`
- **6. Core Entity:** NO
- **7. Transaction Table:** NO
- **8. Lookup / Reference Table:** NO
- **9. Audit Table:** NO
- **10. Junction / Pivot Table:** NO
- **11. Temporary Data:** NO
- **12. Historical Data:** NO

### `pages`
- **1. Responsibility:** Editorial and legal CMS pages (About, Terms of Service, Privacy Policy, Concierge Info).
- **2. Why It Exists:** Content management for static and narrative frontend web routes.
- **3. Owning Module:** `CMS`
- **4. Dependent Tables:** `seo_metadata (seoable)`
- **5. Dependencies:** *None*
- **6. Core Entity:** NO
- **7. Transaction Table:** NO
- **8. Lookup / Reference Table:** NO
- **9. Audit Table:** NO
- **10. Junction / Pivot Table:** NO
- **11. Temporary Data:** NO
- **12. Historical Data:** NO

### `password_reset_tokens`
- **1. Responsibility:** Temporary hashed tokens for self-service password reset flows.
- **2. Why It Exists:** Standard Laravel authentication security mechanism.
- **3. Owning Module:** `AUTH`
- **4. Dependent Tables:** *None*
- **5. Dependencies:** *None*
- **6. Core Entity:** NO
- **7. Transaction Table:** NO
- **8. Lookup / Reference Table:** NO
- **9. Audit Table:** NO
- **10. Junction / Pivot Table:** NO
- **11. Temporary Data:** YES
- **12. Historical Data:** NO

### `payment_method_property`
- **1. Responsibility:** Restricts or enables specific payment methods on individual properties (e.g. cash on arrival restrictions).
- **2. Why It Exists:** Property-level policy overrides for checkout methods.
- **3. Owning Module:** `PROPERTIES / PAYMENTS`
- **4. Dependent Tables:** *None*
- **5. Dependencies:** `properties`, `payment_methods`
- **6. Core Entity:** NO
- **7. Transaction Table:** NO
- **8. Lookup / Reference Table:** NO
- **9. Audit Table:** NO
- **10. Junction / Pivot Table:** YES
- **11. Temporary Data:** NO
- **12. Historical Data:** NO

### `payment_methods`
- **1. Responsibility:** Accepted payment gateways and checkout mechanisms (Paymob, Visa/Mastercard, Apple Pay, Cash).
- **2. Why It Exists:** Configuration of payment gateways, fee overrides, active status, and frontend checkout options.
- **3. Owning Module:** `PAYMENTS`
- **4. Dependent Tables:** `bookings`, `payment_transactions`, `payment_method_property`, `event_orders`
- **5. Dependencies:** *None*
- **6. Core Entity:** NO
- **7. Transaction Table:** NO
- **8. Lookup / Reference Table:** YES
- **9. Audit Table:** NO
- **10. Junction / Pivot Table:** NO
- **11. Temporary Data:** NO
- **12. Historical Data:** NO

### `payment_transactions`
- **1. Responsibility:** Immutable financial ledger of payment attempts, 3DS tokens, gateway responses, cash entries, and refunds.
- **2. Why It Exists:** Double-entry audit trail, payment reconciliation, idempotency verification, and financial compliance.
- **3. Owning Module:** `PAYMENTS / FINANCE`
- **4. Dependent Tables:** *None*
- **5. Dependencies:** `bookings`, `customers`, `payment_methods`, `users (recorded_by)`
- **6. Core Entity:** YES
- **7. Transaction Table:** YES
- **8. Lookup / Reference Table:** NO
- **9. Audit Table:** YES
- **10. Junction / Pivot Table:** NO
- **11. Temporary Data:** NO
- **12. Historical Data:** YES

### `permission_role`
- **1. Responsibility:** Associates permissions with roles.
- **2. Why It Exists:** Allows roles to inherit specific sets of granular capabilities.
- **3. Owning Module:** `RBAC`
- **4. Dependent Tables:** *None*
- **5. Dependencies:** `roles`, `permissions`
- **6. Core Entity:** NO
- **7. Transaction Table:** NO
- **8. Lookup / Reference Table:** NO
- **9. Audit Table:** NO
- **10. Junction / Pivot Table:** YES
- **11. Temporary Data:** NO
- **12. Historical Data:** NO

### `permission_user`
- **1. Responsibility:** Direct assignment of permissions to specific individual users (permission overrides).
- **2. Why It Exists:** Supports exceptional privilege grants or restrictions without creating dedicated single-user roles.
- **3. Owning Module:** `RBAC`
- **4. Dependent Tables:** *None*
- **5. Dependencies:** `users`, `permissions`
- **6. Core Entity:** NO
- **7. Transaction Table:** NO
- **8. Lookup / Reference Table:** NO
- **9. Audit Table:** NO
- **10. Junction / Pivot Table:** YES
- **11. Temporary Data:** NO
- **12. Historical Data:** NO

### `permissions`
- **1. Responsibility:** Granular authorization action definitions (e.g., properties.publish, bookings.refund).
- **2. Why It Exists:** Enables fine-grained permission checks across controllers, policies, and API endpoints.
- **3. Owning Module:** `RBAC`
- **4. Dependent Tables:** `permission_role`, `permission_user`
- **5. Dependencies:** *None*
- **6. Core Entity:** YES
- **7. Transaction Table:** NO
- **8. Lookup / Reference Table:** YES
- **9. Audit Table:** NO
- **10. Junction / Pivot Table:** NO
- **11. Temporary Data:** NO
- **12. Historical Data:** NO

### `personal_access_tokens`
- **1. Responsibility:** Sanctum API token persistence for SPA and mobile client authentication.
- **2. Why It Exists:** Stateless API bearer token authentication and token capability scoping.
- **3. Owning Module:** `AUTH`
- **4. Dependent Tables:** *None*
- **5. Dependencies:** `users (polymorphic tokenable)`
- **6. Core Entity:** NO
- **7. Transaction Table:** NO
- **8. Lookup / Reference Table:** NO
- **9. Audit Table:** NO
- **10. Junction / Pivot Table:** NO
- **11. Temporary Data:** YES
- **12. Historical Data:** NO

### `properties`
- **1. Responsibility:** Core vacation rental accommodations and real estate sales inventory records.
- **2. Why It Exists:** Primary revenue-generating asset; holds capacity, base pricing, coordinates, specs, and status.
- **3. Owning Module:** `PROPERTIES`
- **4. Dependent Tables:** `amenity_property`, `payment_method_property`, `seasonal_prices`, `availability_blocks`, `bookings (bookable)`, `media (mediable)`, `favorites (favoriteable)`
- **5. Dependencies:** `locations`, `property_categories`
- **6. Core Entity:** YES
- **7. Transaction Table:** NO
- **8. Lookup / Reference Table:** NO
- **9. Audit Table:** NO
- **10. Junction / Pivot Table:** NO
- **11. Temporary Data:** NO
- **12. Historical Data:** NO
- **⚠️ ARCHITECTURAL FLAG:** Dual responsibility: vacation rental listings and for-sale real estate. Evaluated: cleanly segregated via `listing_type` enum (rental, sale, both) with shared address/specs.

### `property_categories`
- **1. Responsibility:** Classification of properties (Villas, Apartments, Penthouses, Townhouses).
- **2. Why It Exists:** Hierarchical organization and browsing structure for vacation rentals and real estate.
- **3. Owning Module:** `PROPERTIES`
- **4. Dependent Tables:** `properties`
- **5. Dependencies:** *None*
- **6. Core Entity:** NO
- **7. Transaction Table:** NO
- **8. Lookup / Reference Table:** YES
- **9. Audit Table:** NO
- **10. Junction / Pivot Table:** NO
- **11. Temporary Data:** NO
- **12. Historical Data:** NO

### `redirects`
- **1. Responsibility:** 301 permanent and 302 temporary URL redirect routing table.
- **2. Why It Exists:** Preserves search engine authority when slugs or legacy URLs change.
- **3. Owning Module:** `CMS / SEO`
- **4. Dependent Tables:** *None*
- **5. Dependencies:** *None*
- **6. Core Entity:** NO
- **7. Transaction Table:** NO
- **8. Lookup / Reference Table:** YES
- **9. Audit Table:** NO
- **10. Junction / Pivot Table:** NO
- **11. Temporary Data:** NO
- **12. Historical Data:** NO

### `role_user`
- **1. Responsibility:** Associates users with one or more RBAC roles.
- **2. Why It Exists:** Many-to-many relationship mapping between users and roles.
- **3. Owning Module:** `RBAC`
- **4. Dependent Tables:** *None*
- **5. Dependencies:** `users`, `roles`
- **6. Core Entity:** NO
- **7. Transaction Table:** NO
- **8. Lookup / Reference Table:** NO
- **9. Audit Table:** NO
- **10. Junction / Pivot Table:** YES
- **11. Temporary Data:** NO
- **12. Historical Data:** NO

### `roles`
- **1. Responsibility:** RBAC role definitions (super_admin, manager, agent, staff, content_manager, etc.).
- **2. Why It Exists:** Enables role-based access control and grouping of permissions.
- **3. Owning Module:** `RBAC`
- **4. Dependent Tables:** `role_user`, `permission_role`
- **5. Dependencies:** *None*
- **6. Core Entity:** YES
- **7. Transaction Table:** NO
- **8. Lookup / Reference Table:** YES
- **9. Audit Table:** NO
- **10. Junction / Pivot Table:** NO
- **11. Temporary Data:** NO
- **12. Historical Data:** NO

### `seasonal_prices`
- **1. Responsibility:** Date-specific nightly pricing overrides, minimum stay rules, and priority ranking.
- **2. Why It Exists:** High/low season pricing, holiday surges, and dynamic yield management.
- **3. Owning Module:** `PRICING`
- **4. Dependent Tables:** `booking_nightly_prices (seasonal_price_id)`
- **5. Dependencies:** `properties`
- **6. Core Entity:** NO
- **7. Transaction Table:** NO
- **8. Lookup / Reference Table:** NO
- **9. Audit Table:** NO
- **10. Junction / Pivot Table:** NO
- **11. Temporary Data:** NO
- **12. Historical Data:** NO

### `seo_metadata`
- **1. Responsibility:** Polymorphic SEO tags, OpenGraph metadata, canonical URLs, and schema markup.
- **2. Why It Exists:** Centralized SEO optimization across properties, experiences, events, blog posts, and pages.
- **3. Owning Module:** `CMS / SEO`
- **4. Dependent Tables:** *None*
- **5. Dependencies:** `polymorphic (seoable_type, seoable_id)`
- **6. Core Entity:** NO
- **7. Transaction Table:** NO
- **8. Lookup / Reference Table:** NO
- **9. Audit Table:** NO
- **10. Junction / Pivot Table:** NO
- **11. Temporary Data:** NO
- **12. Historical Data:** NO

### `sessions`
- **1. Responsibility:** HTTP session state storage for web requests.
- **2. Why It Exists:** Provides server-side session persistence for admin panel and web portal.
- **3. Owning Module:** `SYSTEM`
- **4. Dependent Tables:** *None*
- **5. Dependencies:** `users (nullable user_id)`
- **6. Core Entity:** NO
- **7. Transaction Table:** NO
- **8. Lookup / Reference Table:** NO
- **9. Audit Table:** NO
- **10. Junction / Pivot Table:** NO
- **11. Temporary Data:** YES
- **12. Historical Data:** NO

### `settings`
- **1. Responsibility:** Global application key-value configuration (commission rates, contact info, payment switches).
- **2. Why It Exists:** Dynamic runtime configuration without code redeployment.
- **3. Owning Module:** `SYSTEM / CONFIG`
- **4. Dependent Tables:** *None*
- **5. Dependencies:** *None*
- **6. Core Entity:** NO
- **7. Transaction Table:** NO
- **8. Lookup / Reference Table:** YES
- **9. Audit Table:** NO
- **10. Junction / Pivot Table:** NO
- **11. Temporary Data:** NO
- **12. Historical Data:** NO

### `ticket_scans`
- **1. Responsibility:** Audit log of entrance gate ticket scanning attempts.
- **2. Why It Exists:** Prevents ticket reuse / duplicate entry; records door staff user, device info, and timestamp.
- **3. Owning Module:** `EVENTS / TICKETING`
- **4. Dependent Tables:** *None*
- **5. Dependencies:** `event_tickets`, `users (scanned_by)`
- **6. Core Entity:** NO
- **7. Transaction Table:** NO
- **8. Lookup / Reference Table:** NO
- **9. Audit Table:** YES
- **10. Junction / Pivot Table:** NO
- **11. Temporary Data:** NO
- **12. Historical Data:** YES

### `users`
- **1. Responsibility:** Authentication, administrative staff accounts, credential storage, 2FA status, and RBAC principal identity.
- **2. Why It Exists:** Central user identity model for administrative staff, managers, agents, and customer logins.
- **3. Owning Module:** `AUTH / USERS`
- **4. Dependent Tables:** `role_user`, `permission_user`, `activity_logs`, `bookings (assigned_to)`, `leads (assigned_to)`, `ticket_scans`, `notifications`, `personal_access_tokens`, `customers (user_id)`
- **5. Dependencies:** *None*
- **6. Core Entity:** YES
- **7. Transaction Table:** NO
- **8. Lookup / Reference Table:** NO
- **9. Audit Table:** NO
- **10. Junction / Pivot Table:** NO
- **11. Temporary Data:** NO
- **12. Historical Data:** NO

### `vehicles`
- **1. Responsibility:** Transportation fleet management (golf carts, VIP shuttles, limousines).
- **2. Why It Exists:** Concierge transportation coordination and asset tracking.
- **3. Owning Module:** `OPERATIONS / CONCIERGE`
- **4. Dependent Tables:** `leads (leadable)`
- **5. Dependencies:** *None*
- **6. Core Entity:** NO
- **7. Transaction Table:** NO
- **8. Lookup / Reference Table:** NO
- **9. Audit Table:** NO
- **10. Junction / Pivot Table:** NO
- **11. Temporary Data:** NO
- **12. Historical Data:** NO

---

## 4. Relationship Map & Referential Integrity (Phase 3)

### Enforced Foreign Key Behaviors
Referential integrity rules are configured to prevent accidental deletion of critical business transactions:

1. **Cascade on Delete (`cascadeOnDelete`):**
   - `amenity_property` -> `properties`, `amenities` (pivot records deleted when property/amenity deleted).
   - `payment_method_property` -> `properties`, `payment_methods`.
   - `role_user`, `permission_role`, `permission_user` -> parent RBAC definitions.
   - `seasonal_prices`, `availability_blocks` -> `properties` (calendar/pricing overrides belong strictly to parent).
   - `booking_nightly_prices`, `discount_usages` -> `bookings` (itemized lines belong strictly to parent booking).
   - `event_ticket_types`, `event_orders` -> `events`.
   - `event_tickets` -> `event_orders`, `events`, `event_ticket_types`.
   - `ticket_scans` -> `event_tickets`.
2. **Null on Delete (`nullOnDelete` / `set null`):**
   - `bookings.customer_id`, `payment_transactions.customer_id`, `event_orders.customer_id` -> `customers`.
     *Crucial Rule:* Deleting or anonymizing a customer MUST NEVER delete historical bookings or financial transaction ledger entries.
   - `bookings.assigned_to`, `leads.assigned_to`, `activity_logs.user_id`, `payment_transactions.recorded_by` -> `users`.
     *Crucial Rule:* Deleting a staff account retains transaction and audit history with a null staff pointer.
   - `properties.location_id`, `properties.property_category_id` -> `locations`, `property_categories`.
   - `bookings.payment_method_id`, `bookings.discount_id` -> `payment_methods`, `discounts`.
3. **Polymorphic Relationships:**
   - `bookings.bookable_type` + `bookings.bookable_id`: Points to `App\Models\Property` or `App\Models\Experience`.
   - `media.mediable_type` + `media.mediable_id`: Attached to properties, experiences, events, blog posts.
   - `leads.leadable_type` + `leads.leadable_id`: Inquiries against specific properties, experiences, or vehicles.
   - `favorites.favoriteable_type` + `favorites.favoriteable_id`: Saved items across inventory models.
   - `seo_metadata.seoable_type` + `seo_metadata.seoable_id`: Meta tags for pages and catalog items.

---

## 5. Normalization & Single Source of Truth (Phases 4 & 5)

### Source of Truth Hierarchy
To prevent data corruption while honoring historical integrity, duplicate data across tables is strictly governed:

1. **Customer Information:**
   - *Authoritative Record:* `customers` table (`first_name`, `last_name`, `email`, `phone`, `country_code`).
   - *Derived Link:* `bookings.customer_id` references `customers.id`.
   - *Historical Snapshots:* Booking invoice payloads store the snapshot of customer billing details in `pricing_snapshot->customer` to preserve billing records against subsequent customer profile updates.
2. **Property Details & Nightly Rates:**
   - *Authoritative Base Price:* `properties.base_price_cents`.
   - *Authoritative Overrides:* `seasonal_prices` table with date windows and priority rankings.
   - *Authoritative Historical Rate:* `booking_nightly_prices` table. Once a booking is reserved, each night's rate is recorded permanently. Subsequent changes to `properties` or `seasonal_prices` NEVER alter confirmed bookings.
3. **Financial Balances:**
   - *Authoritative Ledger:* `payment_transactions` (`amount_cents`, `status`, `gateway_reference`, `idempotency_key`).
   - *Derived Aggregate:* `bookings.amount_paid_cents` and `bookings.amount_remaining_cents` are calculated and updated strictly via `RecordBookingPaymentAction` upon successful transaction settlement.

---

## 6. Financial Architecture & Ledger Integrity (Phase 6)

### Financial Rules Enforced
1. **Zero Floats:** All monetary fields end with `_cents` and are stored as unsigned 64-bit integers (`BIGINT`). For example, 1,500.50 EGP is stored as `150050`.
2. **Explicit ISO Currency:** Every financial table specifies an ISO-4217 currency code (default: `EGP`, supports `USD`, `EUR`, `GBP`).
3. **Immutable Payment Ledger:** `payment_transactions` rows are append-only. A failed transaction is marked `failed`; a refund creates a new negative transaction record or refund entry referencing the original charge.
4. **Webhook Idempotency:** `payment_transactions.webhook_event_id` is guarded by a database unique constraint (`uq_payment_transactions_webhook_event`), guaranteeing that duplicate webhook deliveries from payment gateways (e.g. Paymob, Stripe) produce no duplicate credit.
5. **Request Idempotency:** API checkout endpoints accept an `Idempotency-Key` header, validated against `idempotency_keys` table to prevent double charging during network retries.

---

## 7. Booking Architecture & Concurrency Control (Phase 7)

### Concurrency Protection Strategy
Double bookings and inventory race conditions are prevented through a 3-layer defense:

```
Layer 1: Application Pessimistic Lock (SELECT ... FOR UPDATE on bookable)
   ↓
Layer 2: Database Covered Composite Index on Inventory & Date Range
   ↓
Layer 3: PostgreSQL Exclusion Constraint (EXCLUDE USING gist with daterange)
```

1. **PostgreSQL GiST Exclusion Constraint:**
   ```sql
   ALTER TABLE bookings ADD CONSTRAINT bookings_no_double_booking
   EXCLUDE USING gist (
       bookable_id WITH =,
       daterange(check_in, check_out, '[)') WITH &&
   ) WHERE (
       status IN ('confirmed', 'paid', 'completed', 'pending', 'awaiting_payment', 'partially_paid', 'payment_processing')
       AND deleted_at IS NULL
   );
   ```
   - Uses half-open ranges `[)` allowing checkout on date `D` and check-in by a new guest on the same date `D` (hotel turnaround standard).
2. **Expiring Reservation Holds:**
   - Temporary holds have `status = 'pending'` with `expires_at` (15-minute countdown).
   - Expired holds are released automatically by scheduled command `bookings:release-expired-holds`.

---

## 8. Controlled State Machines & Enums (Phase 12)

### Booking State Transitions
```
                 [draft]
                    │
                    ▼
                [pending]
               ╱         ╲
              ▼           ▼
     [awaiting_payment]  [expired]
            │     ╲
            ▼      ▼
   [payment_processing] [cancelled]
            │
            ▼
       [confirmed]
       ╱         ╲
      ▼           ▼
  [completed]   [refunded]
```

All transitions are validated via `App\Modules\Booking\Domain\Enums\BookingStatus::canTransitionTo()`. Invalid status updates throw `InvalidBookingStatusTransitionException`.

---

## 9. RBAC Architecture & Authoritative Authorization (Phase 8)

### Authorization Matrix
- **Guards:** Multi-guard setup (`web` session guard for Blade administrative dashboard; `sanctum` bearer token guard for REST APIs).
- **Roles:** `super_admin`, `property_manager`, `agent`, `sales`, `staff`, `finance`, `content_manager`.
- **Granular Capabilities:** Checked server-side using Laravel Policies (`PropertyPolicy`, `BookingPolicy`, `PaymentPolicy`, `CustomerPolicy`, `LeadPolicy`, `EventPolicy`).
- **Data-Level Row Scoping:** `Booking::scopeVisibleTo($user)` ensures staff members can only inspect bookings explicitly assigned to them, while sales/content managers are blocked at SQL query level (`whereRaw('1 = 0')`).

---

## 10. PII, Privacy & Data Security (Phases 9 & 16)

### Protected Attributes
- `User`: `password`, `remember_token`, `two_factor_secret`, `two_factor_recovery_codes` hidden from JSON serialization.
- `Customer`: `notes` marked internal and hidden from public serialization.
- `Booking`: `booking_access_token` and `internal_notes` hidden.
- `PaymentTransaction`: `gateway_response` payload contains sanitized metadata with raw payment secrets excluded.
- **IDOR Protection:** Customer self-service booking confirmation endpoints require unguessable `booking_access_token` alongside numeric ID.

---

## 11. Indexing & Optimization Strategy (Phase 10)

### Deduplication & Index Health Plan
1. **Drop Redundant Duplicate Index in `bookings`:**
   - Index `bookings_availability_search_idx` duplicates `idx_bookings_concurrency_conflict` on columns `(bookable_type, bookable_id, status, check_in, check_out)`.
2. **Drop Redundant Duplicate Index in `properties`:**
   - Index `idx_properties_base_price` duplicates `properties_base_price_cents_index` on `(base_price_cents)`.
3. **Covered Lookup Indexes Preserved:**
   - `idx_properties_catalog_filter`: `(status, is_published, listing_type, is_featured)`.
   - `idx_seasonal_prices_lookup`: `(property_id, is_active, start_date, end_date, priority)`.
   - `payment_transactions_booking_id_status_index`: `(booking_id, status)`.

---

## 12. Migration & Zero-Downtime Strategy (Phases 13 & 18)

1. **Preserve Historical Migrations:** All 41 existing migrations are preserved intact to maintain verifiable audit trails across deployed environments.
2. **Additive Corrective Migration:** Optimization adjustments (such as deduplicating redundant indexes) are implemented via a dedicated forward migration (`2026_10_06_000001_optimize_database_indexes_and_cleanup_duplicates.php`).
3. **Engine Portability:** Schema definitions use conditional engine checks (`DB::getDriverName() === 'pgsql'`) to leverage advanced PostgreSQL GiST indexes while maintaining full local SQLite/MySQL development compatibility.

---

## 13. Data Retention & Archival Policies

- **Soft Deletions:** Implemented on all core business entities (`properties`, `bookings`, `customers`, `events`, `experiences`, `discounts`). Deleted records retain relations to historical financial records.
- **Audit Log Archival:** `activity_logs` rows older than 365 days are archived to cold storage via scheduled pruning job.
- **Session & Temporary Token Pruning:** `personal_access_tokens` and expired `idempotency_keys` pruned every 24 hours.

