# GouNow Architecture Guide

## 1. High-Level Architectural Pattern
GouNow Lifestyle Platform is structured as a **Modular Monolith** inspired by Clean/Hexagonal Architecture principles within Laravel 12.

The application remains **one single deployable codebase**, eliminating the operational friction of distributed microservices while enforcing clear domain boundaries and high scalability.

```
┌────────────────────────────────────────────────────────┐
│                   Presentation Layer                   │
│   (Blade Controllers, API Controllers, Form Requests)  │
└───────────────────────────┬────────────────────────────┘
                            │ (invokes)
                            ▼
┌────────────────────────────────────────────────────────┐
│                    Application Layer                   │
│        (Actions, Queries, DTOs, Application Events)    │
└───────────────────────────┬────────────────────────────┘
                            │ (orchestrates)
                            ▼
┌────────────────────────────────────────────────────────┐
│                      Domain Layer                      │
│     (Entities, Value Objects, Domain Exceptions)       │
└───────────────────────────▲────────────────────────────┘
                            │ (implements)
┌───────────────────────────┴────────────────────────────┐
│                  Infrastructure Layer                  │
│  (Eloquent Repositories, Gateway Adapters, Redis, S3)  │
└────────────────────────────────────────────────────────┘
```

## 2. Directory Layout
- `app/Modules/`: Isolated business capabilities.
  - `Booking/`: Reservation lifecycle, state transitions, snapshotting.
  - `Pricing/`: Seasonal price resolution, priority calculation, discount codes.
  - `Availability/`: Availability checking, changeover turnover rules, row locking.
  - `Payment/`: Gateway abstraction, transaction tracking, idempotent webhook intake.
  - `Property/`: Real estate and vacation stay specifications, categories, amenities.
  - `Customer/`: Guest profiles and contact records.
  - `Lead/`: Inquiries for concierge, stays, sales, and experiences.
  - `Experience/`: Curated Red Sea yacht charters, safaris, and activities.
  - `Event/`: Events, ticketing tiers, ticket scanning.
  - `Media/`: Media upload pipeline and object storage adapters.
  - `CMS/`: Editorial pages, navigation, homepage sections, and FAQs.
  - `Identity/`: Admin users, RBAC roles, permissions, audit activity logs.
- `app/Shared/`:
  - `Domain/ValueObjects/`: `Money`, `DateRange`, `GuestCount`, `BookingReference`.
  - `Domain/Exceptions/`: `DomainException` and specialized business rule exceptions.
  - `Application/Contracts/`: `LockManagerInterface`, `IdempotencyServiceInterface`.
  - `Infrastructure/`: `DatabaseLockManager`, `IdempotencyService`, `CacheKeys`.
  - `Support/Helpers/`: `WhatsAppHelper`.

## 3. Strict Architectural Rules
1. **Controllers are Thin:** Controllers must ONLY validate requests via FormRequests, invoke an Action or Query, and return a View or JSON response. No business rules or manual transactions in controllers.
2. **Direction of Dependencies:**
   - Presentation depends on Application.
   - Application depends on Domain.
   - Infrastructure implements contracts defined by Application/Domain.
   - Domain never depends on HTTP, controllers, or external third-party SDKs.
3. **Pessimistic Concurrency Safety:**
   - Critical operations (booking creation, payment confirmation) execute under explicit row-level locks (`SELECT ... FOR UPDATE`) inside database transactions.
4. **Zero Primitive Obsession:**
   - Monetary amounts are encapsulated in `Money` (cents).
   - Booking periods are encapsulated in `DateRange`.
   - References are encapsulated in `BookingReference`.
