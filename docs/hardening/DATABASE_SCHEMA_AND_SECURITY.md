# 🗄️ Database Schema & Security Architecture Blueprint (GouNow)

> **وثيقة معمارية شاملة:** توضح تصنيف جداول قاعدة البيانات (51 جدول)، العلاقات والروابط (ERD)، ومصفوفة الأمان والحماية التابعة للباك إند ومنظومة الـ API.

---

## 1. تصنيف الجداول والـ Domains (51 Tables Overview)

تم تصنيف جداول قاعدة البيانات إلى **7 مجالات وظيفية (Domains)** مترابطة:

```mermaid
mindmap
  root((GouNow Core DB))
    Auth & RBAC
      users
      roles
      permissions
      role_user
      permission_role
      permission_user
      sessions
      password_reset_tokens
    Properties & Units
      properties
      property_categories
      amenities
      amenity_property
      locations
      seasonal_prices
      availability_blocks
    Bookings & Stays
      bookings
      booking_nightly_prices
      customers
      idempotency_keys
    Payments & Financials
      payment_methods
      payment_method_property
      payment_transactions
      fees
      discounts
      discount_usages
    Experiences & Events
      experiences
      experience_categories
      events
      event_ticket_types
      event_tickets
      event_orders
      ticket_scans
    Content & CMS
      pages
      blog_posts
      faqs
      homepage_sections
      navigation_items
      redirects
      seo_metadata
      media
    Operations & System
      leads
      activity_logs
      admin_notifications
      notifications
      favorites
      vehicles
      cache
      cache_locks
      jobs
      job_batches
      failed_jobs
      migrations
```

### تفاصيل المجالات الـ 7:

| المجال (Domain) | الجداول التابعة | الدور الوظيفي | درجة الحساسية الأمنية |
|---|---|---|---|
| **1. Auth & RBAC** | `users`, `roles`, `permissions`, `role_user`, `permission_role`, `permission_user`, `sessions`, `password_reset_tokens` | إدارة الهوية، الأدوار الـ 7، الصلاحيات الـ 24، الجلسات ورموز الاستعادة والـ 2FA | **عالية جداً (Critical)** |
| **2. Properties & Inventory** | `properties`, `property_categories`, `amenities`, `amenity_property`, `locations`, `seasonal_prices`, `availability_blocks` | العقارات المتاحة للإيجار والبيع، التسعير الموسمي، بلوكات التوفر والتعطيل | **متوسطة إلى عالية** |
| **3. Bookings & Reservations** | `bookings`, `booking_nightly_prices`, `customers`, `idempotency_keys` | محرك الحجز، حساب الليالي، إدارة بيانات العملاء، ومنع التكرار بـ Idempotency | **عالية جداً (Financial & PII)** |
| **4. Payments & Financials** | `payment_methods`, `payment_method_property`, `payment_transactions`, `fees`, `discounts`, `discount_usages` | العمليات المالية، بوابات الدفع (Cards, PayPal, Cash)، الكوبونات والرسوم | **عالية جداً (Financial)** |
| **5. Experiences & Events** | `experiences`, `experience_categories`, `events`, `event_ticket_types`, `event_tickets`, `event_orders`, `ticket_scans` | الأنشطة البحرية والصحراوية، الفعاليات وحفلات الجونة، التذاكر والمسح بالباركود | **متوسطة** |
| **6. Content & CMS** | `pages`, `blog_posts`, `faqs`, `homepage_sections`, `navigation_items`, `redirects`, `seo_metadata`, `media` | إدارة المحتوى، المقالات، الأسئلة الشائعة، الوسائط والصور والـ SEO | **منخفضة إلى متوسطة** |
| **7. System & Operations** | `leads`, `activity_logs`, `admin_notifications`, `notifications`, `favorites`, `vehicles`, `cache`, `cache_locks`, `jobs`, `job_batches`, `failed_jobs`, `migrations` | طلبات التواصل والكونسيرج، سجل التدقيق (Audit Logs)، الطوابير والكاش | **حساسة (PII & Audit)** |

---

## 2. الرسم التخطيطي للعلاقات (Entity Relationship Diagram - ERD)

```mermaid
erDiagram
    USERS ||--o{ ROLE_USER : "has roles"
    ROLES ||--o{ ROLE_USER : "assigned to"
    ROLES ||--o{ PERMISSION_ROLE : "has permissions"
    PERMISSIONS ||--o{ PERMISSION_ROLE : "assigned to"
    USERS ||--o{ PERMISSION_USER : "has direct permissions"
    PERMISSIONS ||--o{ PERMISSION_USER : "direct assign"

    PROPERTIES ||--o{ AMENITY_PROPERTY : "has amenities"
    AMENITIES ||--o{ AMENITY_PROPERTY : "tagged in"
    PROPERTIES ||--o{ SEASONAL_PRICES : "defines pricing"
    PROPERTIES ||--o{ AVAILABILITY_BLOCKS : "blocks dates"
    PROPERTIES ||--o{ BOOKINGS : "reserved in"
    
    CUSTOMERS ||--o{ BOOKINGS : "books"
    BOOKINGS ||--o{ BOOKING_NIGHTLY_PRICES : "nightly breakdown"
    BOOKINGS ||--o{ PAYMENT_TRANSACTIONS : "paid via"
    
    DISCOUNTS ||--o{ DISCOUNT_USAGES : "tracks usage"
    BOOKINGS ||--o{ DISCOUNT_USAGES : "applies discount"

    EVENTS ||--o{ EVENT_TICKET_TYPES : "offers tiers"
    EVENT_TICKET_TYPES ||--o{ EVENT_TICKETS : "issues"
    EVENT_ORDERS ||--o{ EVENT_TICKETS : "contains"
    EVENT_TICKETS ||--o{ TICKET_SCANS : "scanned via"

    USERS {
        bigint id PK
        string name
        string email UK
        string password
        string two_factor_secret "encrypted"
        text two_factor_recovery_codes "hashed"
        boolean is_active
        timestamp two_factor_confirmed_at
    }

    BOOKINGS {
        bigint id PK
        string reference UK
        bigint property_id FK
        bigint customer_id FK
        date check_in
        date check_out
        integer guests
        bigint total_cents "integer minor units"
        bigint amount_paid_cents
        bigint amount_remaining_cents
        string currency
        string status "enum: pending, confirmed, cancelled, completed"
        string payment_status "enum: unpaid, partial, paid, refunded"
        string idempotency_key UK
        string booking_access_token "hashed SHA-256"
        json pricing_snapshot
        json cancellation_policy_snapshot
    }

    PAYMENT_TRANSACTIONS {
        bigint id PK
        bigint booking_id FK
        string transaction_id UK
        string payment_method
        bigint amount_cents
        string currency
        string status "enum: pending, completed, failed, refunded"
        json payload "sanitized"
    }

    CUSTOMERS {
        bigint id PK
        string first_name
        string last_name
        string email UK
        string phone
        string nationality
    }

    PROPERTIES {
        bigint id PK
        string reference_number UK
        string slug UK
        string title_en
        string title_ar
        integer max_guests
        integer bedrooms
        integer bathrooms
        bigint base_price_cents
        string listing_type "rent, sale, both"
        boolean is_available
    }
```

---

## 3. المعمارية الأمنية لدورة الطلب والـ API (Security Pipeline)

تلتزم جميع الـ APIs بمعيار صارم مكون من **14 مرحلة أمنية (Pipeline Standard S1)**:

```mermaid
sequenceDiagram
    autonumber
    actor Client as Frontend / Next.js / Mobile
    participant Proxy as Trusted Proxies / Cloudflare
    participant MW as Middleware Security Pipeline
    participant FormReq as FormRequest & Validator
    participant Action as Domain Action (Business Logic)
    participant DB as Database (Transactions & Locks)
    participant Resource as Strict API Resource

    Client->>Proxy: HTTPS Request + Headers (X-Request-ID, Idempotency-Key)
    Proxy->>MW: 1. AssignRequestId (UUID injection)
    MW->>MW: 2. ForceJsonResponse & CORS Origin Whitelist
    MW->>MW: 3. RateLimiter (auth: 5/min, booking: 10/min, api: 60/min)
    MW->>MW: 4. EnsureAccountActive & EnsureTwoFactorVerified (for admin)
    MW->>MW: 5. EnsureIdempotency (check duplicate mutation)
    MW->>FormReq: 6. Authorize Ability & Rules Validation (Zero $request->all)
    FormReq-->>Client: 422 Unprocessable (Normalized Error Envelope if invalid)
    FormReq->>Action: 7. Validated Data Transfer Object (DTO)
    Action->>DB: 8. DB::transaction + lockForUpdate (Pessimistic lock)
    DB-->>Action: 9. Exclusion & Unique Constraints Verified
    Action->>Resource: 10. Immutable Domain Result / Model
    Resource-->>Client: 11. 200/201 Success Response Envelope {data, meta.request_id}
```

---

## 4. نموذج الصلاحيات ثلاثي الطبقات (3-Layer Authorization Architecture)

تم بناء الصلاحيات بالكامل على مبدأ **Zero-Trust** وعدم الاعتماد على مجرد عمود `is_admin`:

```mermaid
flowchart TD
    Req([User Request to Action]) --> L1{Layer 1: Role & Permission?}
    L1 -- No --> Deny403[403 Forbidden]
    L1 -- Yes: Has Ability --> L2{Layer 2: Scope Hierarchy?}
    L2 -- Mismatch: Not Assigned/Not Owner --> Hide404[404 Not Found / Anti-Enumeration]
    L2 -- Yes: Scope Valid --> L3{Layer 3: Object State Permitted?}
    L3 -- Invalid: e.g. Cancelling Past Booking --> Conflict409[409 State Conflict]
    L3 -- Yes: All Clear --> Allow[Allow Controller & Domain Execution]
```

### ميزات الأمان المطبقة:
1. **Deny-by-Default:** أي route غير مخصص له policy أو permission صريح يتم رفضه تلقائياً ويتحقق من ذلك اختبار `RouteInventorySecurityTest`.
2. **Pessimistic Row Locking (`lockForUpdate`):** يمنع حدوث حجزين لنفس العقار في نفس التوقيت عبر سباقات التزامن (Race Conditions).
3. **Pessimistic Recovery Code Consumption:** أكواد استعادة الـ 2FA تُستهلك لمرة واحدة فقط وبشكل ذري داخل Database Transaction.
4. **Authoritative Server Pricing:** جميع الأسعار تُحسب على السيرفر، وتمنع الـ FormRequests حقن أي حقول أسعار (`price`, `total`, `deposit`) من العميل.
5. **Universal Error Envelope:** إخفاء كامل لرسائل SQL والأخطاء الداخلية والـ Stack Traces لحماية النظام من تسريب المعلومات حتى لو تم تفعيل `APP_DEBUG`.

---

## 5. حالة جاهزية الإنتاج (Production Readiness Matrix)

| المحور | الوضع الحالي في الكود | هل جاهز للإنتاج فوراً؟ | ما هو المطلوب قبل الإطلاق المالي الكامل؟ |
|---|---|---|---|
| **معمارية الكود (Clean Architecture)** | مطبقة بأعلى المعايير (Actions, DTOs, FormRequests, Resources) | **جاهز 100%** | الحفاظ على نفس النمط عند إضافة ميزات جديدة |
| **اختبارات النظام (Testing Suite)** | 110 اختبار مؤتمت (535 assertion) خضراء بالكامل | **جاهز 100%** | استمرار تشغيل الاختبارات في الـ CI/CD |
| **التحليل الثابت وجودة الكود** | PHPStan Analysis 0 أخطاء + Laravel Pint Style 0 أخطاء | **جاهز 100%** | تفعيل قواعد إضافية تدريجياً |
| **قاعدة البيانات (Database)** | تعمل حالياً على SQLite (مع توفر بيئة PostgreSQL للاختبار) | **يحتاج تبديل للإنتاج** | ربط سيرفر PostgreSQL حقيقي وتطبيق الـ PostgreSQL Constraints (Phase 8) |
| **الدفع والـ Webhooks** | دورة الدفع تعمل بنجاح مع Mock وCard/PayPal/Cash | **يحتاج إكمال Phase 6** | استبدال الـ placeholder في `VerifyWebhookSignature` بـ HMAC حقيقي للـ Gateway |
| **بيئة السيرفر (Environment)** | إعدادات التطوير الحالية | **يحتاج تدقيق أخير** | ضبط `APP_DEBUG=false`, `APP_ENV=production`, `QUEUE_CONNECTION=database` |
