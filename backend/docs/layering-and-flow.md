# Complete Flow & Layering: Frontend, Backend & Data Integration

## 1. The Three-Pillar Architecture

GouNow follows an integrated, predictable contract across **Frontend**, **Backend**, and **Data**:

```
 ┌────────────────────────────────────────────────────────────────────────┐
 │                         1. FRONTEND (الفرونت)                           │
 │   • Blade Templates (resources/views/) & Tailwind CSS                  │
 │   • Alpine.js Client-Side Reactivity (Dates, Counters, Modals)         │
 │   • Form Inputs & Query String Parameters                              │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │ (HTTP POST / GET)
                                     ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │                         2. BACKEND (الباك)                             │
 │   ┌────────────────────────────────────────────────────────────────┐   │
 │   │ Presentation: FormRequests (Validation & Casting to DTOs)      │   │
 │   │               Thin Controllers (Route Orchestration)           │   │
 │   └───────────────────────────────┬────────────────────────────────┘   │
 │                                   │
 │   ┌───────────────────────────────▼────────────────────────────────┐   │
 │   │ Application:  Actions (Commands / State Mutations in DB Trx)   │   │
 │   │               Queries (Calculations & Filtered Projections)    │   │
 │   │               DTOs (Immutable Structured Payloads)             │   │
 │   └───────────────────────────────┬────────────────────────────────┘   │
 │                                   │
 │   ┌───────────────────────────────▼────────────────────────────────┐   │
 │   │ Domain:       Value Objects (Money, DateRange, GuestCount)     │   │
 │   │               Domain Exceptions (BookingUnavailableException)  │   │
 │   └────────────────────────────────────────────────────────────────┘   │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │ (ORM / Query Builder)
                                     ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │                          3. DATA (الداتا)                              │
 │   • Eloquent Models (app/Models/) with Scopes, Casts, & Relations      │
 │   • Database Migrations & Optimized Composite B-Tree Indexes           │
 │   • MySQL 8+ Transaction Isolation & Pessimistic Row-Level Locks       │
 │   • Redis Caching & Queue Tables                                       │
 └────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Why This Makes Development & Updates Super Easy ("سهلة في التحديث")

In a traditional messy MVC, updating a feature requires editing 500-line controllers where validation, SQL queries, payment logic, and view rendering are mixed together. 

In GouNow's new architecture, every task has **one exact, isolated place**:

### Scenario A: Adding a new filter to Property Search (e.g. `has_private_pool`)
1. **Frontend:** Add the checkbox in `resources/views/properties/index.blade.php`:
   ```html
   <input type="checkbox" name="has_pool" value="1" {{ request('has_pool') ? 'checked' : '' }}>
   ```
2. **Backend Request:** Add `'has_pool' => ['nullable', 'boolean']` in [`PropertySearchRequest.php`](file:///home/ibrahim-elshishtawy/flutter%20project/gouna-lifestyle-platform/GouNow%20web/app/Modules/Property/Presentation/Requests/PropertySearchRequest.php).
3. **Backend DTO:** Add `public readonly ?bool $hasPool = null` in [`PropertySearchFiltersDTO.php`](file:///home/ibrahim-elshishtawy/flutter%20project/gouna-lifestyle-platform/GouNow%20web/app/Modules/Property/Application/DTOs/PropertySearchFiltersDTO.php).
4. **Data Query:** Add the filter condition in [`SearchPropertiesQuery.php`](file:///home/ibrahim-elshishtawy/flutter%20project/gouna-lifestyle-platform/GouNow%20web/app/Modules/Property/Application/Queries/SearchPropertiesQuery.php):
   ```php
   if ($filters->hasPool) {
       $query->whereHas('amenities', fn($q) => $q->where('slug', 'private-pool'));
   }
   ```
*Notice:* The Controller [`PropertyListingController.php`](file:///home/ibrahim-elshishtawy/flutter%20project/gouna-lifestyle-platform/GouNow%20web/app/Http/Controllers/PropertyListingController.php) does not need to change at all! The contract handles it automatically.

---

### Scenario B: Adding a new input to Contact / Inquiry Form (e.g. `whatsapp_number`)
1. **Frontend:** Add `<input name="whatsapp">` in the Blade form.
2. **Backend Request:** Add validation in [`StoreInquiryRequest.php`](file:///home/ibrahim-elshishtawy/flutter%20project/gouna-lifestyle-platform/GouNow%20web/app/Modules/Lead/Presentation/Requests/StoreInquiryRequest.php).
3. **Backend DTO:** Add property to [`LeadInquiryDTO.php`](file:///home/ibrahim-elshishtawy/flutter%20project/gouna-lifestyle-platform/GouNow%20web/app/Modules/Lead/Application/DTOs/LeadInquiryDTO.php).
4. **Backend Action:** Persist in [`StoreInquiryLeadAction.php`](file:///home/ibrahim-elshishtawy/flutter%20project/gouna-lifestyle-platform/GouNow%20web/app/Modules/Lead/Application/Actions/StoreInquiryLeadAction.php).

---

## 3. Directory Layout by Layer

### Frontend Layer (`resources/views/`)
- `properties/`: Stays catalog search and single villa detail view.
- `experiences/`: Curated yacht/safari activities catalog and detail view.
- `checkout/`: Booking checkout summary, payment gateway selection, 3DS redirect, confirmation.
- `home.blade.php`: Editorial El Gouna homepage sections.
- `components/`: Reusable Blade UI components (`seo-head.blade.php`, `whatsapp-widget.blade.php`).
- `layouts/`: Master layouts (`app.blade.php`, `admin.blade.php`).

### Backend Layer (`app/Modules/` & `app/Http/`)
- `app/Http/Controllers/`: Thin controllers receiving validated requests, delegating to Actions/Queries, returning views or JSON.
- `app/Modules/{Domain}/Presentation/Requests/`: FormRequests validating inputs and mapping to DTOs.
- `app/Modules/{Domain}/Application/Queries/`: Read-only database operations with caching and pagination.
- `app/Modules/{Domain}/Application/Actions/`: Atomic write operations executed within DB transactions and locks.
- `app/Modules/{Domain}/Application/DTOs/`: Strictly typed data containers.
- `app/Shared/Domain/ValueObjects/`: Self-validating domain primitives (`Money`, `DateRange`, `GuestCount`).

### Data Layer (`app/Models/` & `database/`)
- `app/Models/`: 38 Eloquent models encapsulating database tables, query scopes, casts, and relations.
- `database/migrations/`: Database schema definitions and B-Tree composite indexes.
- `database/seeders/`: Realistic production seed data.
