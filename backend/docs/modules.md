# Modular Architecture Specification

## 1. Overview
GouNow employs a **Modular Monolith** pattern. Rather than slicing the application into microservices with network latency and distributed data consistency challenges, the platform organizes distinct business domains inside `app/Modules/` and reusable cross-cutting concerns in `app/Shared/`.

Each module encapsulates its own domain models, data transfer objects (DTOs), queries, actions, presentation requests, and event handlers.

---

## 2. Module Inventory & Responsibilities

| Module | Location | Primary Responsibilities | Dependencies |
| :--- | :--- | :--- | :--- |
| **Booking** | `app/Modules/Booking` | Reservation lifecycle, status transitions (`pending`, `confirmed`, `cancelled`), financial snapshotting, cancellation policies. | Pricing, Availability, Customer, Payment |
| **Pricing** | `app/Modules/Pricing` | Base night calculation, seasonal pricing priority resolution, minimum stay overrides, cleaning & service fees, promo code discounts. | Shared (`Money`, `DateRange`) |
| **Availability** | `app/Modules/Availability` | Availability checking, calendar occupancy, hotel changeover turnover rules (same-day check-in/check-out), row-level booking locks. | Shared (`DateRange`, `LockManagerInterface`) |
| **Payment** | `app/Modules/Payment` | Gateway integration (Card 3DS, PayPal, Cash/Offline), transaction logging, idempotent webhook handling, manual receipts. | Booking, Shared (`Money`, `IdempotencyServiceInterface`) |
| **Property** | `app/Modules/Property` | Vacation rentals and real estate listings, amenities, locations, categories, room configs, base rates. | Media |
| **Customer** | `app/Modules/Customer` | Guest contact details, profile deduplication (`findOrCreate`), identity linkage. | None |
| **Lead** | `app/Modules/Lead` | Concierge inquiries, yacht/safari leads, property viewing requests, contact form submissions. | Customer |
| **Experience** | `app/Modules/Experience` | Curated activities, yacht charters, desert safaris, kitesurfing packages, guide bookings. | Customer, Media |
| **Event** | `app/Modules/Event` | Festival/concert events, ticket tiers, capacity controls, ticket verification. | Booking, Customer |
| **Media** | `app/Modules/Media` | Image uploads, responsive image optimization, CDN/S3 storage synchronization. | Shared |
| **CMS** | `app/Modules/CMS` | Static pages, navigation menus, FAQ management, editorial landing sections. | Media |
| **Identity** | `app/Modules/Identity` | Super admins, agents, role-based access control (RBAC), authentication sessions, audit logs. | Shared |

---

## 3. Module Boundaries & Communication Rules

To prevent spaghetti architecture, modules adhere to three core communication rules:

### Rule 1: Actions and Queries as Public Module APIs
Modules interact with one another strictly through **Action** and **Query** classes using typed DTOs. 
- To request a quote from Pricing, call `CalculateBookingQuoteQuery`.
- To check availability, call `CheckPropertyAvailabilityQuery`.
- To acquire a pessimistic row lock, call `LockAndValidateAvailabilityAction`.
- To persist a confirmed reservation, call `CreateBookingAction`.

Directly reaching across modules into another module's raw Eloquent queries or writing to their tables is forbidden.

### Rule 2: Synchronous Operations via Service Layer / Actions
When an immediate transaction requires cross-module orchestration (e.g., checkout requiring customer creation -> availability locking -> booking record -> payment intent), the caller invokes an Application Action orchestrating the modules inside a DB transaction.

### Rule 3: Asynchronous Communication via Events
Side-effects such as sending transactional emails, issuing WhatsApp notifications, updating marketing CRMs, or refreshing read-model search caches are triggered via **Laravel Events & Queued Listeners**.

```
[BookingConfirmed Event]
      │
      ├──> [SendBookingConfirmationEmailListener] (Queue: 'notifications')
      ├──> [SendWhatsAppConfirmationListener]     (Queue: 'notifications')
      └──> [FlushPropertyAvailabilityCacheListener] (Queue: 'default')
```

---

## 4. Module Directory Structure Blueprint

Each module in `app/Modules/{ModuleName}` follows this structure:

```
app/Modules/{ModuleName}/
├── Domain/
│   ├── Entities/ or Models/       # Rich domain models & Eloquent models
│   ├── ValueObjects/              # Domain-specific value objects
│   └── Exceptions/                # Domain-specific exceptions
├── Application/
│   ├── Actions/                   # Command operations (Write operations)
│   ├── Queries/                   # Read operations (Projection/Calculation)
│   ├── DTOs/                      # Data Transfer Objects
│   └── Events/                    # Module domain events
├── Presentation/
│   ├── Controllers/               # Web/API controllers (if module-specific)
│   └── Requests/                  # Form request validation classes
└── Infrastructure/
    └── Repositories/              # DB queries, external API adapters
```

---

## 5. Backward-Compatibility Adapters
For existing controllers or admin interfaces that previously imported `App\Services\BookingService`, `PricingService`, `AvailabilityService`, or `PaymentService`, thin adapter classes are maintained in `app/Services/`. These adapters translate legacy method calls into the new modular Actions and Queries without breaking existing routes or tests.
