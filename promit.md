# 🛡️ GouNow Platform — Enhanced Enterprise Hardening Prompts (v2)

> النسخة دي موسّعة من الملف الأصلي. الهدف: الـ AI ميتوهش، ميفوتش حاجة، ويشتغل بترتيب ثابت، مع تركيز على:
> **معمارية الباك إند • التعامل مع البيانات • الاختبارات • الصلاحيات • السرعة • التعامل مع الـ Requests ودورة الطلب مع السيرفر**

---

## 0. إيه اللي اتغير عن النسخة الأولى؟

| التغيير | السبب |
|---|---|
| إضافة **Phase 0** (Baseline & Safety Net) | الـ AI لازم يعرف الوضع الحالي ويثبّته باختبارات قبل ما يعدّل أي حاجة، وإلا مش هيعرف إنه كسر حاجة |
| كل Phase بقت **Tasks مرقّمة بـ ID** (مثلاً `P3-T07`) | الـ AI مينفعش يتخطى Task بدون ما يكتب `SKIPPED + reason` |
| إضافة **5 Standards مشتركة (S1–S5)** | بدل تكرار الكلام في كل Phase، كل Phase بتشاور على Standard محدد: Request Pipeline / Response Contract / Performance / Testing / Permissions |
| إضافة **Phase 2 موسّعة** للـ Request Lifecycle | ترتيب الـ middleware، الـ validation، الـ idempotency، الـ error contract، التعامل مع Next.js |
| إضافة **Phase 9: Performance & Caching** | السرعة محتاجة قياس قبل وبعد، مش تخمين |
| إضافة **LEDGER.md** (ذاكرة المشروع) | لو الـ context طال أو الـ session اتقطعت، الـ AI يرجع يكمل من نفس النقطة |
| كل Phase فيها **Search Patterns (grep)** محددة | عشان الـ AI يدوّر على حاجات بعينها بدل ما يعتمد على الانطباع |
| كل Phase فيها **Tests مسمّاة** مطلوبة | مفيش "اختبرت" من غير أسماء اختبارات حقيقية |
| الترقيم الجديد: **0 → 11** | Phase 9 جديدة، والـ Observability بقت 10، والـ Final Gate بقت 11 |

### ترتيب المراحل (ومنطق الترتيب)

```
Phase 0  Baseline & Safety Net          ← نثبّت الوضع الحالي
Phase 1  Architecture Discovery         ← نفهم قبل ما نلمس
Phase 2  API Layer & Request Pipeline   ← نظبّط دورة الطلب (الأساس اللي باقي المراحل بتتبني عليه)
Phase 3  RBAC & Authorization           ← مين يعمل إيه (بعد ما الـ routes اتنظّمت)
Phase 4  Authentication & 2FA           ← مين انت
Phase 5  Booking & Concurrency          ← أهم Domain
Phase 6  Payment & Financial Integrity  ← الفلوس
Phase 7  PII & Media Security           ← البيانات والملفات
Phase 8  PostgreSQL & Data Layer        ← الداتابيز الحقيقية
Phase 9  Performance & Caching          ← السرعة (بعد ما الـ schema والـ indexes استقرّوا)
Phase 10 Observability, Queues, Audit   ← المراقبة والتشغيل
Phase 11 Final Gate                     ← الإثبات
```

> **ملحوظة ترتيب مهمة:** Phase 5 و6 محتاجين PostgreSQL عشان اختبار الـ concurrency الحقيقي (SQLite مينفعش يثبت إن مفيش race condition). فلو مفيش PostgreSQL محلي، **الـ AI يجهّز Docker Compose service لـ PostgreSQL للاختبار فقط في Phase 0** (ده مش infrastructure جديد على production، ده بيئة اختبار).

---

## 1. القواعد العامة (تتطبق على كل المراحل)

### G-Rules — الأصلية (محتفظ بيها)
1. اقرأ الكود الفعلي قبل أي تعديل. 2. التقرير مش مصدر حقيقة، الكود هو المصدر. 3. مفيش Feature جديدة. 4. مفيش rewrite شامل. 5. حافظ على الـ business logic إلا لو فيه defect أمني/صحة. 6. مفيش حلول شكلية. 7. كل تغيير قابل للاختبار. 8. وجود middleware/column مش دليل حماية. 9. افصل Authentication عن Authorization. 10. وثّق كل قرار معماري (سطرين + السبب). 11. ممنوع Redis/Kafka/RabbitMQ/Kubernetes إلا لو الـ workload أثبت الحاجة بقياس. 12. مفيش secrets في logs/commits. 13. مفيش card data. 14. لو التقرير والكود اتعارضوا، الكود هو الصح ووثّق التعارض.

### G-Rules — الجديدة

**G15 — LEDGER (ذاكرة المشروع)**
أنشئ `docs/hardening/LEDGER.md` في Phase 0 وحدّثه في **نهاية كل Task مهم وكل Phase**. يحتوي:
```
## Current State
- Current phase: N
- Last completed task ID: PX-TYY
- Branch: hardening/phase-N
- Test status: <pass/fail counts>
## Decisions (ADR-lite)
- D-001: <قرار> — السبب — البدائل المرفوضة
## Open Findings
- F-ID | severity | file:line | status
## Files changed (cumulative)
## Commands that must pass before moving on
```
**أول حاجة تعملها في أي session جديدة أو لو حسّيت إنك ضايع: اقرأ LEDGER.md وملف الـ Phase الحالي من الأول.**

**G16 — Scope Lock**
كل Phase ليها `IN SCOPE` و `OUT OF SCOPE`. أي مشكلة تلاقيها خارج النطاق **متصلّحهاش**؛ سجّلها في `docs/hardening/BACKLOG.md` بـ: الوصف، الملف، الخطورة، الـ Phase المقترحة لها. (الاستثناء الوحيد: Critical security يوقف الشغل ويتبلّغ عنه فورًا.)

**G17 — Task Discipline (مفيش تخطي صامت)**
كل Task ليها ID. في آخر الـ Phase اطبع جدول:
```
| Task ID | Status (DONE / SKIPPED / N-A / BLOCKED) | Evidence (file:line أو test name) | Reason لو مش DONE |
```
مفيش Task تتسيب من غير صف في الجدول.

**G18 — Evidence Labels**
كل جملة في التقارير لازم تتصنّف: `VERIFIED` (شفتها في الكود/نفّذت اختبار) أو `ASSUMPTION` (محتاجة تحقق). ممنوع تقول "تم التأكد" من غير ذكر الدليل.

**G19 — Finding Format**
```
ID: P3-F012 | Severity: Critical/High/Medium/Low/Info
Location: app/Http/Controllers/Admin/PropertyController.php:84
Evidence: <snippet قصير أو اسم test>
Impact: <إيه اللي ممكن يحصل>
Fix: <الإصلاح> | Test: <اسم الاختبار اللي بيثبته>
Status: Open / Fixed / Accepted-Risk / Backlog
```

**G20 — Red → Green → Refactor**
أي إصلاح أمني أو bug: (1) اكتب الاختبار اللي يفشل ويثبت المشكلة، (2) شغّله وسجّل إنه فشل، (3) أصلح، (4) شغّله وسجّل إنه نجح، (5) شغّل الـ suite كلها للـ regressions.

**G21 — Git Hygiene**
Branch لكل Phase: `hardening/phase-N`. Commits صغيرة بوصف واضح. مفيش `.env` أو secrets. لا تعمل `git push --force`. لا تعمل squash لحاجة بدون طلب.

**G22 — Questions Protocol**
لو القرار business-related (سياسة إلغاء، نسبة refund، من يوافق على إيه) ومش واضح من الكود → **اسأل المستخدم** بعرض الخيارات والتوصية. متخمّنش. لو القرار تقني بحت → قرّر ووثّق.

**G23 — Definition of Done (لكل Phase)**
Phase تعتبر خلصت **فقط** لو: كل Tasks في الجدول DONE/N-A بدليل ✅ + الـ suite الكاملة خضراء ✅ + `vendor/bin/pint --test` ✅ + static analysis مفيش errors جديدة ✅ + LEDGER اتحدّث ✅ + Phase Result Report اتطبع ✅.

**G24 — Commands Baseline (استخدمها بعد كل Phase)**
```bash
php artisan test                      # أو vendor/bin/pest لو المشروع Pest
vendor/bin/pint --test
vendor/bin/phpstan analyse            # أو larastan لو موجود؛ لو مش موجود أضفه كـ dev dependency (مبرر)
composer audit
php artisan route:list --json > docs/hardening/snapshots/routes_phaseN.json
php artisan migrate:status
```

---

## 2. الـ Standards المشتركة (S1–S5)

> كل Phase تشاور على Standard بالرقم. الـ AI يقرأ الـ Standards دي **مرة واحدة** في Phase 0 ويرجع لها عند الحاجة.

### S1 — Request Pipeline Standard (دورة الطلب مع السيرفر)

**الترتيب المطلوب لأي API request:**
```
1. Correlation ID           (middleware: يولّد/يقرأ X-Request-ID ويحطه في log context والـ response header)
2. Trusted Proxies / HTTPS  (تأكد إن الـ scheme/IP الحقيقي صح خلف الـ proxy)
3. CORS                     (origins صريحة، مفيش * مع credentials)
4. Force JSON               (Accept: application/json لكل /api/*؛ مفيش redirect أو HTML error)
5. Rate Limiting (throttle) (قبل الـ auth عشان يحمي login نفسه)
6. Authentication           (sanctum)
7. Account state checks     (active? 2FA completed? email verified لو العملية تتطلب؟ force-password-change؟)
8. Route Model Binding      (scoped bindings لمنع الوصول لـ child object تابع لـ parent تاني)
9. Authorization            (can:/Policy/FormRequest::authorize)
10. Validation              (FormRequest->rules)
11. Controller (رفيع)       (يستلم validated data → يستدعي Action → يرجّع Resource)
12. Action / Service        (business logic + DB::transaction + domain events)
13. API Resource            (تشكيل الـ response — لا تسرّب fields داخلية)
14. Exception Handler       (تحويل أي exception لـ error envelope موحد)
```

**قواعد الـ Controller:**
- الـ Controller مسموح له بـ 3 حاجات فقط: استلام الـ validated input، استدعاء Action/Service واحد، إرجاع Resource/Response.
- ممنوع: `$request->all()`، `Model::create($request->all())`، `->fill($request->all())`، `$request->input()` على بيانات مش متحقق منها، query مباشرة معقدة، حساب فلوس، حساب availability، إرسال إيميل.
- استخدم `$request->validated()` أو `$request->safe()->only([...])` فقط.

**قواعد الـ FormRequest (لكل write endpoint):**
- `authorize()` تتحقق من الـ ability الفعلي (مش `return true` إلا للـ public endpoints المقصودة، وتتوثق).
- `rules()` تغطي: type، required/nullable، max length، regex للـ IDs/phones، `Rule::exists()->where(...)` مقيّد بالـ ownership/tenant، `Rule::in()`/Enum للـ status، مصفوفات محدودة (`max:`)، تواريخ (`after_or_equal:today`, `after:check_in`)، أرقام (`integer|min|max`) ومفيش decimals للفلوس.
- `prepareForValidation()` للـ normalization (trim، lowercase email، تحويل أرقام عربية لو مطلوب).
- ممنوع تقبل من العميل: `price`, `total`, `status`, `role_id`, `user_id`, `is_admin`, `paid`, `discount_amount`… إلا لو الـ endpoint admin ومحمي بصلاحية صريحة.

**قواعد الـ Idempotency:**
- أي POST بينشئ حجز/دفع/refund يقبل header `Idempotency-Key` (UUID). يخزّن (key + user + endpoint + request hash + response snapshot + status). نفس key + نفس hash = نفس الـ response بدون side effects. نفس key + hash مختلف = `422/409`.
- اتأكد الأول لو الـ column `idempotency_key` موجود فعليًا ومستخدم قبل ما تبني حاجة جديدة.

**قواعد الحماية من إساءة الاستخدام:**
- `per_page` سقفه 100 (والافتراضي 15-25). `page` سقف معقول. `sort`/`filter`/`include` whitelist صريحة (مفيش `orderBy($request->sort)` مباشر).
- حد أقصى لحجم الـ JSON body ولعدد عناصر المصفوفات.
- Timeouts: كل HTTP call خارجي (gateway/email/SMS) له `->timeout()` و `->connectTimeout()` و retry محدود وبـ backoff، ومفيش retry على عملية مش idempotent من غير key.
- Rate limiters مسمّاة (`RateLimiter::for`): `auth` (per email+IP)، `api` (per user أو IP)، `booking-create`، `payment`، `search`، `webhook` (per source IP أو بدون throttle لو الـ signature كافي)، `password-reset`، `otp`.

**جدول الـ Status Codes:**
| Code | الاستخدام |
|---|---|
| 200 | GET/PUT/PATCH ناجح |
| 201 | إنشاء (مع `Location`) |
| 202 | قُبل ويتنفذ async |
| 204 | حذف ناجح بدون body |
| 400 | request مش مفهوم (JSON فاسد) |
| 401 | مش authenticated |
| 403 | authenticated بس مش مسموح |
| 404 | مش موجود (وأحيانًا بدل 403 لمنع enumeration — قرار موثق لكل resource) |
| 409 | تعارض state (حجز متاح لشخص تاني، transition غير مسموح، idempotency conflict) |
| 410 | منتهي (hold/link expired) |
| 422 | validation |
| 429 | rate limit (مع `Retry-After`) |
| 500/503 | أخطاء سيرفر (رسالة generic، بدون SQL/stack/paths) |

---

### S2 — Response Contract Standard

**Success:**
```json
{ "data": { ... }, "meta": { "request_id": "..." } }
// قوائم:
{ "data": [ ... ], "meta": { "page": 1, "per_page": 20, "total": 134, "request_id": "..." }, "links": { "next": "...", "prev": null } }
```
**Error (موحد لكل الأخطاء):**
```json
{
  "error": {
    "code": "BOOKING_UNAVAILABLE",       // ثابت وmachine-readable، Next.js يعتمد عليه
    "message": "الفترة المطلوبة غير متاحة",  // قابلة للعرض
    "details": { "field": ["..."] },        // للـ validation فقط
    "request_id": "..."
  }
}
```
**قواعد:**
- الفلوس: integer minor units + `currency` (مثال `{ "amount": 150000, "currency": "EGP" }`). مفيش float.
- التواريخ: ISO-8601 UTC للـ timestamps؛ `Y-m-d` للتواريخ بدون وقت (check_in/check_out).
- IDs: لو الـ ID التسلسلي بيتعرض للعامة ويمثل enumeration risk، استخدم reference عشوائي (ULID/UUID) في الـ public API. قرار موثق.
- Resources بتستخدم `whenLoaded` و `when(authorized)` — مفيش lazy-load داخل Resource.
- مفيش `password`, `remember_token`, `two_factor_secret`, `two_factor_recovery_codes`, internal notes، provider raw payloads في أي response.
- Enum codes للأخطاء في ملف واحد `ErrorCode` (enum) ومتوثقة.

---

### S3 — Performance Standard (السرعة)

**قاعدة ذهبية: Measure → Change → Re-measure. ممنوع تحسين من غير رقم قبل وبعد.**

**أدوات داخل Laravel (من غير infrastructure جديدة):**
- في `AppServiceProvider::boot()`: `Model::shouldBeStrict(! app()->isProduction());` (يمنع lazy loading، silently-discarded attributes، missing attributes).
- في production: `Model::preventLazyLoading()` مع handler يسجّل violation (log) بدل ما يرمي exception.
- `DB::listen` أو query log في الاختبارات لعدّ الـ queries.
- Slow query logging: أي query > 100ms تتسجّل (بدون bindings حساسة).

**Checklist ثابتة لأي endpoint (query budget):**
- مفيش N+1: كل relation يتعرض في Resource لازم `with()` أو `load()` قبلها.
- `select()` للأعمدة المطلوبة في القوائم الكبيرة.
- `withCount/withSum/withExists` بدل `->count()` في loop.
- Pagination إجباري على كل list endpoint (`cursorPaginate`/`simplePaginate` للجداول الكبيرة بدل `paginate` اللي بيعمل COUNT(*) تقيل).
- مفيش `Model::all()` أو `->get()` من غير limit على جدول قابل للكبر.
- مفيش `LIKE '%term%'` على جداول كبيرة من غير حل (PostgreSQL: `pg_trgm` + GIN index لو الـ search حقيقي).
- Heavy work (PDF, email, image processing, export) → queue.
- كل endpoint حرج يتحدد له **query budget** يتقاس في اختبار (مثلاً "property list ≤ N queries" — الـ N يتحدد بالقياس الفعلي ثم يتثبّت).

**Caching (بالترتيب، وقف عند أول مستوى كفاية):**
1. Framework caches في الـ deploy: `config:cache`, `route:cache`, `event:cache`, `view:cache` + OPcache.
2. Application cache بـ `Cache::remember` للـ read-heavy/نادر التغيير (CMS، settings، facets، قوائم lookup) بمفاتيح versioned وinvalidation واضح على الـ write.
3. `Cache::lock` لمنع cache stampede على الحاجات التقيلة.
4. HTTP caching للـ public GET: `Cache-Control` + `ETag`.
5. Redis/Octane: **فقط** لو القياس أثبت إن الـ file/database cache هو bottleneck. غير كده ممنوع.

**ملاحظة:** drivers زي `file`/`database` مش بتدعم cache tags → استخدم key versioning (`cms:v{N}:page:{slug}`).

---

### S4 — Testing Standard (الاختبارات)

**الهرم:**
- **Unit**: Actions/Services/Value objects (حسابات الأسعار، state machines، policies المعزولة).
- **Feature (HTTP)**: لكل endpoint — happy path + validation + 401 + 403 + 404 + 409/422 + rate limit.
- **Contract**: شكل JSON ثابت (assertJsonStructure) + مفيش fields ممنوعة (assertJsonMissing).
- **Security**: IDOR/BOLA، privilege escalation، mass assignment، enumeration.
- **Concurrency**: على PostgreSQL فقط، بـ processes متوازية فعلًا (مش loop تسلسلي!).
- **Query-count / Performance**: assert على عدد الـ queries لكل endpoint حرج.
- **Migration**: `migrate:fresh` + `migrate:rollback` + seed على PostgreSQL.

**قواعد:**
- استخدم Pest لو موجود، وإلا PHPUnit (متضيفش framework جديد بدون مبرر).
- Factories للجداول الحرجة + states (`->confirmed()`, `->paid()`, `->forCustomer($u)`).
- `Http::fake()`, `Queue::fake()`, `Mail::fake()`, `Storage::fake()`, `Carbon::setTestNow()` — **ممنوع** نداء gateway حقيقي.
- **Data-driven authorization tests**: dataset (role × route/action × expected status) — مصفوفة كاملة مش حالات متفرقة.
- **Route Inventory Test**: اختبار يمرّ على `Route::getRoutes()` ويفشل لو أي route تحت `admin`/`api/v1/admin` من غير middleware authorization صريح (deny-by-default يتحقق آليًا).
- **No-leak test**: لكل Resource حساس اختبار إن الـ fields الممنوعة مش موجودة.
- كل Finding متقفّل ليه اختبار بنفس الـ ID في اسم الاختبار (`test_P3_F012_staff_cannot_delete_property`) → Traceability.
- اختبار الـ concurrency على SQLite **مش دليل**؛ لازم PostgreSQL.
- Coverage: قيس على `app/Domain|Actions|Policies|Services` وسجّل الرقم (حدّد الحد الأدنى بعد القياس، متخترعش رقم).

---

### S5 — Permission Standard (الصلاحيات)

- **التسمية**: `resource.action` (`bookings.view`, `bookings.cancel`, `payments.refund`, `users.manage`, `settings.update`, `content.publish`).
- **ثلاث طبقات لازم كلها تتحقق** لأي عملية على object:
  1. **Role/Permission**: هل يملك الصلاحية؟
  2. **Scope**: `own` / `assigned` / `all` (مثال: Property Manager يدير عقاراته فقط).
  3. **State**: هل الحالة الحالية للـ object تسمح؟ (مثلاً مينفعش refund لحجز مش مدفوع).
- **Deny-by-default**: غياب الـ rule = رفض.
- **Query scoping**: الـ list/search/export لازم تتفلتر بالـ scope (مش بس `show`). IDOR بيحصل غالبًا في الـ list والـ export والـ nested routes.
- **Scoped route binding**: `/properties/{property}/rooms/{room}` لازم الـ room تتبع الـ property.
- **`Gate::before` لـ super-admin**: لو موجود، وثّقه، واتأكد إنه مش بيتخطى الـ state checks أو الـ audit.
- **Maker-checker** للعمليات المالية الحساسة (اللي بينشئ ≠ اللي بيوافق) حسب قرار المستخدم.
- **Self-protection**: مينفعش المستخدم يرفع صلاحياته، يحذف آخر super-admin، أو يعدّل أعلى منه في الـ hierarchy.
- **Permission cache**: تتحمّل مرة واحدة per request (eager) وتتكاشّ per user بـ versioned key وتتمسح عند أي تغيير role/permission.
- **UI gating ≠ security**: endpoint `GET /api/v1/me/abilities` لـ Next.js يخفي الأزرار، لكن الـ server هو اللي بيفرض.
- كل تغيير صلاحيات يتسجل في audit log.


---
---

# Phase 0 — Baseline & Safety Net (جديدة)

## الهدف
تثبيت الوضع الحالي بالأرقام والاختبارات قبل أي تعديل، عشان أي كسر يتكشف فورًا.

## Scope
- **IN**: قياس، توثيق، إعداد بيئة الاختبار، characterization tests.
- **OUT**: أي تعديل في business logic أو schema أو routes.

## Prompt
أنت Senior Laravel Engineer. مهمتك في الـ Phase دي إنك **متغيّرش سلوك التطبيق**، بس تثبّته وتقيسه.

### Tasks
- **P0-T01** — اعمل branch `hardening/phase-0`. أنشئ `docs/hardening/{LEDGER.md,BACKLOG.md,FINDINGS.md,snapshots/}`.
- **P0-T02** — شغّل الأوامر في G24 وسجّل النتيجة الحالية (عدد tests pass/fail/skipped، أخطاء static analysis، نتيجة `composer audit`). **لو في tests بتفشل أصلًا، سجّلها كـ "pre-existing failures" ومتصلّحهاش دلوقتي إلا لو بتمنع التشغيل.**
- **P0-T03** — احفظ snapshot: `route:list --json`، `migrate:status`، قائمة الـ tables والـ columns (`php artisan db:show --counts --views` و `db:table <name>` للجداول الحرجة)، نسخة من `composer.lock` hash.
- **P0-T04** — افحص `.env.example` مقابل `config/*`: مين الـ keys الناقصة؟ في secrets حقيقية متسجلة؟ (`APP_DEBUG`, `APP_ENV`, `SESSION_*`, `SANCTUM_*`, `CORS`, `QUEUE_CONNECTION`, `CACHE_STORE`, `LOG_*`, `DB_*`, مفاتيح الـ payment gateway). **متطبعش قيم الـ secrets.**
- **P0-T05** — جهّز بيئة اختبار PostgreSQL محلية (Docker Compose service `postgres` للاختبار فقط، أو استخدم موجود) واضبط `phpunit.xml`/`.env.testing` بحيث يتشغّل الـ suite على الاتنين: SQLite (سريع) وPostgreSQL (للـ concurrency/migrations). وثّق الأمر.
- **P0-T06** — اكتب **Characterization Tests** للـ flows الحرجة بسلوكها الحالي (حتى لو فيها عيوب، الهدف التثبيت): login، إنشاء حجز، checkout، payment callback/webhook، admin CRUD لعقار، رفع media. كل test يتسمى `characterization_*` ومتعلّم بـ `@group baseline`.
- **P0-T07** — Performance baseline: seed بيانات واقعية (مثلاً N عقارات/حجوزات — حدد الأرقام بناءً على حجم البيانات المتوقع واسأل المستخدم لو مش واضح). لكل endpoint حرج سجّل: عدد الـ queries، الزمن (p50 على 20 تكرار)، حجم الـ response. احفظها في `docs/hardening/snapshots/perf_baseline.md`.
- **P0-T08** — فعّل `Model::shouldBeStrict()` في بيئة local/testing **كتجربة** وسجّل كل violation (lazy loading, missing attribute) بدون إصلاح — دي قائمة شغل Phase 9.
- **P0-T09** — اقرأ الـ Standards S1–S5 واكتب في LEDGER ملخص 10 سطور بفهمك لها.

### Deliverables
`LEDGER.md`, `BASELINE_REPORT.md` (النتائج + pre-existing failures + perf baseline + strict-mode violations), characterization tests, طريقة تشغيل PostgreSQL للاختبار.

### Acceptance
- ✅ الـ suite تتشغل بأمر واحد موثق ونتيجتها مسجلة.
- ✅ فيه characterization test لكل flow حرج.
- ✅ Perf baseline مسجل برقم.
- ✅ مفيش تعديل في سلوك الـ production code.

---

# Phase 1 — Architecture Discovery & Boundary Cleanup

## الهدف
فهم البنية الفعلية بالأدلة، وتحديد الـ boundaries والـ findings اللي هتتوزع على باقي المراحل.

## Scope
- **IN**: قراءة، تصنيف، توثيق، خطة migration تدريجية، تعديلات صغيرة جدًا لو ضرورية لتوضيح الحدود.
- **OUT**: refactor كبير، تغيير schema، حذف Blade/web routes، أي infrastructure.

## Prompt
أنت Senior Software Architect + Laravel 12 Engineer. اشتغل **قراءة فقط** إلا لو اتحدد غير كده. كل استنتاج لازم معاه `file:line`.

### Tasks (Inventories)

- **P1-T01 — Route Inventory.** ولّد CSV/Markdown table لكل route: `method | uri | name | controller@action | middleware (resolved) | الحماية (auth? permission? policy?) | بيرجّع (Blade/JSON/redirect/file) | بيخدم مين (public/customer/admin/webhook/Next.js) | ملاحظات`. استخدم `php artisan route:list --json` + قراءة الـ controllers. **كل route لازم يظهر. لو فيه عدد routes مش مطابق، دوّر على السبب.**
- **P1-T02 — Hybrid Endpoint Detection.** دوّر بـ:
  `grep -rnE "wantsJson|expectsJson|ajax\(\)|isJson|->view\(|return view\(|redirect\(" app routes`
  وسجّل كل controller بيرجع Blade وJSON حسب الـ request.
- **P1-T03 — Controller Audit.** لكل controller: عدد الأسطر، عدد الـ actions، هل بيعمل DB مباشرة، هل بيحسب فلوس/availability/status، هل بيبعت mail/notification، هل بيستخدم `$request->all()`. صنّفه: `Thin / Mixed / Fat`.
  أوامر مساعدة:
  `grep -rnE "\$request->all\(\)|->fill\(\$request|::create\(\$request|->update\(\$request->all" app`
  `grep -rnE "DB::(table|select|statement|raw)|whereRaw|orderByRaw|selectRaw|havingRaw" app`
- **P1-T04 — Request Handling Audit.** لكل write endpoint: بيستخدم FormRequest ولا `$request->validate()` ولا مفيش validation؟ (`grep -rn "extends FormRequest" app/Http/Requests` مقابل الـ controllers.) هل الـ `authorize()` بترجع `true` فاضية؟ في validation duplicated؟
- **P1-T05 — Model Audit.** لكل model: `$fillable`/`$guarded` (أي `$guarded = []`؟)، `$hidden`، `$casts` (money كـ int؟ JSON؟ encrypted؟)، relations، scopes، business logic داخل الـ model، observers، global scopes، traits.
  `grep -rn "guarded = \[\]" app/Models`
- **P1-T06 — Services/Actions Audit.** إيه الموجود؟ في تكرار؟ فين الـ transactions (`DB::transaction`) وفين مفيش؟ في circular dependencies (A يستدعي B ويستدعي A)؟
- **P1-T07 — Auth/AuthZ Inventory.** فين Gates/Policies/middleware aliases؟ `bootstrap/app.php` و `app/Providers`. هل `is_admin` أو `role` check مبعثر في controllers؟ `grep -rnE "is_admin|hasRole|->role ==|->role ===|can\(|authorize\(|Gate::" app routes resources`
- **P1-T08 — Database Inventory (51 tables).** صنّف كل table لـ Domain. لكل table: PK type، FKs (وعليها index؟)، unique constraints، soft deletes، money columns (int ولا decimal ولا float؟)، JSON columns، enums/strings للـ status.
- **P1-T09 — External Integrations.** payment gateway، email/SMS، storage، maps، analytics، أي HTTP client (`grep -rnE "Http::|Guzzle|curl_|file_get_contents\(\s*['\"]http"`). لكل integration: timeout؟ retry؟ بيعالج الأخطاء؟ secrets جاية من config؟
- **P1-T10 — Jobs/Events/Observers/Scheduler Inventory.** إيه اللي sync وكان المفروض async والعكس.
- **P1-T11 — Test Inventory.** إيه المغطى؟ Feature/Unit؟ فين الفجوات في الـ Auth/Booking/Payment؟
- **P1-T12 — Performance Smells (Static).**
  `grep -rnE "::all\(\)|->get\(\)" app/Http` (بدون limit)، `foreach` بيوصل لـ relation، `->count()` داخل loop، `LIKE '%`، `Model::all`، `->each(function` مع queries.
- **P1-T13 — Next.js Integration Surface.** إيه الـ endpoints اللي Next.js بيناديها فعلًا (لو الـ frontend repo متاح، اقرأ الـ fetch/axios calls)؟ cookie ولا token؟ CORS config؟ Sanctum config (`stateful`, `supports_credentials`)؟ لو الـ frontend مش متاح → علّم `ASSUMPTION` واسأل المستخدم.
- **P1-T14 — Flow Diagrams.** ارسم (mermaid) واقعيًا من الكود: Request flow، Authentication، Authorization، Booking، Payment، Admin. **ارسم اللي موجود فعلًا مش اللي المفروض.**
- **P1-T15 — Target Architecture + Boundary.** حدد: Laravel API / Next.js / Admin (Next.js ولا Blade؟) / Domain-Application-Infrastructure layers / مكان الـ Actions والـ DTOs والـ Policies. اقترح **هيكل مجلدات** يتوافق مع الموجود (بدون نقل عشوائي).
- **P1-T16 — Finding Register + Phase Routing.** كل finding يتصنف وينسب للـ Phase اللي هتحله (2 للـ request/API، 3 للـ authz…). ده بيبقى `FINDINGS.md`.
- **P1-T17 — Migration Strategy.** ترتيب تدريجي: إيه اللي ينتقل الأول (الأخطر + الأسهل)، وإيه اللي يفضل مؤقتًا (Blade/web) وشرط إزالته.

### Deliverables
`ARCHITECTURE_AUDIT.md`, `CURRENT_ARCHITECTURE.md`, `TARGET_ARCHITECTURE.md`, `ROUTE_INVENTORY.md`, `ROUTE_BOUNDARY_PLAN.md`, `FINDINGS.md` (موزّعة على Phases), قائمة ملفات مقترح تعديلها مع السبب.

### Acceptance
- ✅ عدد الـ routes في الـ Inventory = عدد `route:list`.
- ✅ كل controller مصنّف Thin/Mixed/Fat.
- ✅ كل Hybrid endpoint متسجل.
- ✅ كل finding له severity + Phase.
- ✅ مفيش تغيير سلوكي في الكود.

---

# Phase 2 — API Layer, Request Pipeline & Next.js Integration

## الهدف
بناء API boundary نظيفة، ودورة طلب (Request → Server → Response) منظمة وموحدة ومحمية، تتعامل صح مع Next.js.

## Scope
- **IN**: routing structure، middleware order، FormRequests، Resources، error contract، pagination/filter standards، idempotency middleware، CORS/Sanctum config، OpenAPI/contract docs.
- **OUT**: صلاحيات تفصيلية (Phase 3)، 2FA (Phase 4)، منطق الحجز/الدفع الداخلي (5/6) — هنا بس بنوصّل الـ pipeline.

## Prompt
أنت Senior Laravel API Architect. اتبع S1 و S2 حرفيًا. اشتغل **endpoint group بعد endpoint group** (مش كلهم مرة واحدة) بالترتيب: Auth → Booking/Checkout → Payment → Property/Search → Customer → Admin → CMS.

### Tasks

- **P2-T01 — Decision Record: Auth mode.** قرر Sanctum **SPA cookie** (لو Next.js وLaravel على نفس الـ top-level domain) أو **API tokens** (لو domains مختلفة أو mobile). اكتب ADR: السبب، الـ trade-offs (CSRF/XSS/CORS/SSR). لو cookie: `statefulApi()`، `/sanctum/csrf-cookie`، `SESSION_DOMAIN`، `SANCTUM_STATEFUL_DOMAINS`، `SameSite`، `Secure`. لو tokens: abilities، expiration، rotation، تخزين آمن في Next.js (httpOnly cookie على server، مش localStorage).
- **P2-T02 — Routing structure.** `routes/api/v1/{public,customer,admin,webhooks}.php` تتحمّل من `bootstrap/app.php` بـ prefix/name/middleware groups. `/api/v1` ثابت، و`/api/v2` مستقبلاً. الـ webhooks خارج الـ auth العادي وبـ signature middleware. الـ web routes القديمة تتسجل في `ROUTE_MIGRATION_MAP.md` (route قديم → جديد → حالة → شرط الإزالة).
- **P2-T03 — Middleware pipeline.** طبّق الترتيب في S1 (1–14). أنشئ: `AssignRequestId`، `ForceJsonResponse`، `EnsureAccountActive`، `EnsureTwoFactorVerified` (placeholder يتفعل في Phase 4)، `VerifyWebhookSignature` (placeholder لـ Phase 6). اضبط ترتيب الأولويات `$middleware->priority([...])` لو لازم. **اكتب Feature test بيثبت الترتيب** (مثلاً request بدون token لـ route متحدد بـ throttle يرجع 429 قبل 401 بعد تجاوز الحد، وكل response فيه `X-Request-ID`).
- **P2-T04 — Exception Handler → Error Envelope.** في `bootstrap/app.php` `->withExceptions()`: حوّل `ValidationException→422`, `AuthenticationException→401`, `AuthorizationException/AccessDenied→403`, `ModelNotFoundException/NotFoundHttpException→404`, `ThrottleRequestsException→429 (+Retry-After)`, `MethodNotAllowed→405`, domain exceptions→409/422 بكود `ErrorCode`, أي Throwable تانية→500 generic. **مفيش SQL/stack/paths/class names في الـ response** حتى مع `APP_DEBUG=true` على `/api/*` في production. اختبر كل mapping.
- **P2-T05 — FormRequests.** لكل write endpoint FormRequest بحسب S1. لو موجودة inline validation، انقلها. سجّل في جدول: endpoint | FormRequest | الحقول الممنوعة من العميل. اختبر: كل حقل ممنوع لو اتبعت **يتتجاهل أو يرفض** (mass assignment test).
- **P2-T06 — Thin Controllers + Actions.** لأي Fat/Mixed controller في مسار الحجز/الدفع/Auth: استخرج **Action class** (`CreateBookingAction`, `CancelBookingAction`, …) بنفس السلوك بالظبط. اعتمد DTO بسيط (readonly class) للمدخلات. **الـ Web/Blade controllers والـ API controllers يستدعوا نفس الـ Action** (مفيش duplicate logic). كل refactor مغطى بـ characterization test من Phase 0 (لازم يفضل أخضر).
- **P2-T07 — API Resources.** لكل model بيتعرض: Resource + Collection. `whenLoaded`, `when()`. مفيش `return $model` أو `->toArray()` مباشر. فلوس integer + currency. اختبر عدم تسريب الـ fields الممنوعة.
- **P2-T08 — Listing standard.** Trait/Query object موحد للـ `page/per_page(cap 100)/sort(whitelist)/filter(whitelist)/include(whitelist)/q`. عدّل list endpoints الحرجة (properties, bookings, events). اختبر: `per_page=100000` يتقص لـ 100، `sort=password` يرجع 422.
- **P2-T09 — Idempotency middleware.** بحسب S1، على `POST` الحجز/الدفع/refund. جدول `idempotency_keys` لو مش موجود (أو استخدم الموجود لو مناسب — اقرأ الأول). TTL 24h. اختبر: نفس key مرتين → booking واحد؛ key + payload مختلف → 409.
- **P2-T10 — CORS & CSRF & Cookies.** `config/cors.php`: origins صريحة من env، methods وheaders محددة، `supports_credentials` حسب الـ ADR. `config/session.php`: `secure`, `http_only`, `same_site`. اختبر preflight من origin مسموح ومن origin غير مسموح.
- **P2-T11 — Rate limiters مسمّاة.** عرّف في `AppServiceProvider` حسب S1. كل limiter بـ key مناسب (email+IP للـ login، user id للـ authenticated، IP للـ public). ارجع `Retry-After`. اختبر كل limiter.
- **P2-T12 — Public vs Auth'd data exposure.** كل endpoint عام: إيه اللي بيرجعه؟ هل في PII/internal fields؟ هل ممكن enumeration؟ (IDs تسلسلية للحجوزات/المستخدمين؟)
- **P2-T13 — Contract Documentation.** OpenAPI 3 (hand-maintained أو مولّد — لو هتضيف package مولّد، اكتب مبرر، وخليه dev-only). يشمل: auth، error codes، pagination، idempotency، rate limits، أمثلة request/response. + `docs/NEXTJS_INTEGRATION.md`: base URL، كيفية الـ auth، تعامل مع 401/403/409/422/429، retry policy (GET فقط)، timeout، idempotency-key generation، SSR cookie forwarding، caching guidance (`no-store` للـ authenticated).
- **P2-T14 — Blade/Web deprecation.** نفّذ الخطة من `ROUTE_MIGRATION_MAP.md` للـ routes اللي اتنقلت: خليها redirect/410 أو سيبها مؤقتًا بحسب القرار. مفيش حذف بدون اختبار وبدون إثبات إنها مش مستخدمة.

### Tests المطلوبة (أمثلة بأسماء)
`ApiAlwaysReturnsJsonTest`, `ErrorEnvelopeContractTest`, `RequestIdHeaderTest`, `MiddlewareOrderTest`, `FormRequestMassAssignmentTest`, `ListingStandardTest`, `IdempotencyKeyTest`, `CorsPolicyTest`, `RateLimiterTest`, `ResourceNoLeakTest`, `ApiVersioningTest`.

### Deliverables
API structure، `ROUTE_MIGRATION_MAP.md`، `API_CONTRACT.md`/OpenAPI، `AUTHENTICATION_FLOW.md`، `ERROR_STANDARD.md`، `NEXTJS_INTEGRATION.md`، ADRs، الاختبارات.

### Acceptance
- ✅ لا يوجد `/api/*` route يرجع HTML أو redirect.
- ✅ كل write endpoint له FormRequest، ولا يستخدم `$request->all()`.
- ✅ كل الأخطاء بنفس الـ envelope ومعاها `request_id`.
- ✅ كل list endpoint paginated ومحمي بالـ whitelists.
- ✅ idempotency شغال على الحجز والدفع.
- ✅ characterization tests خضراء (السلوك ما اتغيرش).

---

# Phase 3 — RBAC & Authorization Enforcement

## الهدف
تطبيق الصلاحيات فعليًا (Function-level + Object-level) وإغلاق BOLA/BFLA، بدون الاعتماد على `is_admin`.

## Scope
- **IN**: Policies، Gates، permission middleware، query scoping، user/role management rules، authorization tests.
- **OUT**: 2FA وlogin (Phase 4)، منطق الحجز/الدفع الداخلي.

## Prompt
أنت Security Engineer + Laravel Authorization Specialist. اتبع S5. افترض إن الصلاحيات الـ24 **مش مطبقة** لحد ما تثبت العكس.

### Tasks

- **P3-T01 — Permission Catalog.** اقرأ seeders/DB واستخرج الـ 7 roles والـ 24 permission الفعليين. قارنهم بقائمة العمليات في الكود (كل controller action = عملية). اعمل **Gap Table**: عمليات بدون permission مناظرة | permissions بدون أي استخدام. اقترح تسمية موحدة `resource.action` وخريطة rename (مع backward compat لحد ما الـ seeders تتحدث).
- **P3-T02 — Authorization Matrix.** `AUTHORIZATION_MATRIX.md`: صفوف = (route/action)، أعمدة = (permission، scope own/assigned/all، state conditions، الـ 7 roles ✅/❌). **كل admin route لازم يظهر.** القرارات الغامضة (مين يعمل refund؟ هل Sales يشوف المالية؟) → اسأل المستخدم وسجّل الإجابة.
- **P3-T03 — Permission Resolver.** Service واحد (`PermissionResolver`) يحمّل roles + direct permissions (permission_user) بـ query/اتنين eager لكل request، ويدعم: union، وdirect **deny** لو الـ schema يدعمه (وإلا وثّق). Cache per-user بـ versioned key، يتمسح عند أي تغيير. اختبر عدد الـ queries (≤ ثابت صغير مهما كان عدد الـ checks).
- **P3-T04 — Policies.** Policy لكل model حساس: Booking، Customer، Property، Event، Ticket، PaymentTransaction/Refund، Lead، Media، User/Role، Setting، CMS pages. كل Policy method بتتحقق من الـ 3 طبقات (permission + scope + state). `Gate::policy` أو auto-discovery — وثّق الاختيار. مفيش policy بترجع `true` ثابت.
- **P3-T05 — Route Enforcement.** كل admin route: `->middleware('can:...')` أو `authorizeResource` أو `$this->authorize()` في الـ Action. **متعتمدش على group middleware `admin` وحده.** لو في `is_admin` متبعثر → استبدله.
- **P3-T06 — Query Scoping.** كل list/search/export/report/dashboard aggregate: طبّق scope (Policy `scopeFor($user)` أو Eloquent local scope `visibleTo($user)`). افحص خصوصًا: export CSV، dashboard stats، global search، autocomplete، `include=` في الـ API (ممكن يسرّب relation بيانات مش مصرح بها).
- **P3-T07 — Scoped Bindings.** كل nested route (`property/{p}/rooms/{r}`, `booking/{b}/payments/{x}`) → `->scopeBindings()` + اختبار إن id من parent تاني يرجع 404.
- **P3-T08 — Admin User Management Rules.** مفيش self-escalation، مفيش منح permission/role أعلى من اللي أنت فيه، مفيش حذف/تعطيل آخر super-admin، تغيير role/permission يحتاج `password.confirm` (Phase 4)، وكل تغيير في audit log (event جاهز الآن، التخزين الكامل في Phase 10).
- **P3-T09 — Mass assignment on authz fields.** `role_ids`, `permissions`, `is_admin`, `status`, `user_id`, `owner_id`, `property_id` ما تتقبلش من request عادي. اختبر.
- **P3-T10 — 403 vs 404 policy.** لكل resource: ممكن تسرّب وجوده؟ (booking/customer → 404 للمستخدم العادي، 403 للـ staff اللي بيشوف النوع بس مش الـ object.) وثّق في الـ matrix.
- **P3-T11 — `GET /api/v1/me/abilities`.** يرجّع permissions + scopes للـ Next.js (لإخفاء UI فقط). مفيش تسريب لتفاصيل داخلية.
- **P3-T12 — Route Inventory Test (آلي).** يفشل لو أي route admin/sensitive من غير authorization middleware/permission صريح (قائمة استثناءات مكتوبة ومبررة).
- **P3-T13 — Data-driven Authorization Tests.** Dataset: كل (role × action) من الـ Matrix ← status متوقع. بالإضافة لـ privilege escalation scenarios (من الأصلي):
  Staff→delete property، Content Manager→refund، Sales→modify financial records، Property Manager→manage users، User→booking لعميل تاني، Property Manager→عقار مش بتاعه، Staff→export all customers، user→PATCH `role_ids` على نفسه.
  **كل scenario: اكتب الاختبار → شغّله وسجّل فشله على الكود القديم → أصلح → سجّل نجاحه.**
- **P3-T14 — Seeders.** idempotent (`updateOrCreate`)، ومتزامنة مع الـ Catalog الجديد، وبتتشغل في الاختبارات.

### Deliverables
`AUTHORIZATION_MATRIX.md`, Policies, `PermissionResolver`, middleware, route-inventory test, authorization test suite, تقرير الـ Red→Green.

### Acceptance
- ✅ كل sensitive admin action له authorization check مثبت بالـ Route Inventory Test.
- ✅ لا يعتمد أي route حساس على `is_admin` فقط.
- ✅ unauthorized → 403 (أو 404 حسب القرار الموثق).
- ✅ privilege escalation tests: failed-before / passed-after مسجلة.
- ✅ مفيش N+1 في فحص الصلاحيات.

---

# Phase 4 — Authentication, 2FA & Account Security

## الهدف
تقوية دورة حياة الهوية (Login → Session/Token → Logout → Recovery)، وفرض 2FA فعليًا على الأدمن.

## Scope
- **IN**: login/logout، password reset، email verification، sessions/tokens، 2FA، recovery codes، lockout، password policy.
- **OUT**: RBAC (Phase 3)، تغيير متطلبات التسجيل business.

## Prompt
أنت Application Security Engineer. اتبع S1 (خصوصًا خطوات 5–7). افترض إن 2FA مجرد columns لحد ما تثبت العكس.

### Tasks

- **P4-T01 — Current State Audit.** لكل flow (login, logout, register, forgot/reset, verify email, 2FA enable/disable/challenge, recovery, change password, remember-me, deactivate, force-password-change): اقرأ الكود الفعلي، وسجّل: بيشتغل؟ محمي بـ throttle؟ بيسرّب وجود email؟ بيجدد session؟ بيسجل secrets في log؟
  `grep -rnE "two_factor|Fortify|Google2FA|otp|recovery" app config database routes`
- **P4-T02 — Login hardening.**
  - رسالة generic واحدة لكل أنواع الفشل (email مش موجود / password غلط / حساب معطل → نفس الـ message والـ status، مع تسجيل السبب الداخلي في audit).
  - Throttle بمفتاحين: `email+IP` و`IP` فقط (credential stuffing).
  - Timing equalization: نفّذ `Hash::check` ضد dummy hash لو الـ user مش موجود.
  - Session regenerate بعد login (cookie mode) / إصدار token جديد وإلغاء القديم لو نفس الـ device (token mode).
  - تحقق إن `Hash` driver و rounds مناسبة، وإن `password_hash` بتتعمل rehash تلقائي عند الحاجة (`Hash::needsRehash`).
- **P4-T03 — 2FA حقيقي (TOTP).**
  - **State machine للـ login:** `password_ok → 2fa_pending (token/session flag مؤقت، لا يعطي وصول لأي endpoint محمي) → 2fa_verified → authenticated`.
  - الـ pending state: صلاحية ≤ 5 دقايق، حد أقصى 5 محاولات، يتبطل بعد النجاح.
  - الـ secret متخزن مشفر (`encrypted` cast)، window ±1 step، ومنع replay لنفس الكود (خزّن آخر time-step مستخدم).
  - فرض 2FA إجباري على roles الأدمن/المالية (config `auth.require_2fa_roles`) مع grace flow للإعداد الأول (يسمح بـ endpoints الإعداد فقط).
  - `EnsureTwoFactorVerified` middleware (من Phase 2) يتفعّل ويتطبق على كل admin route.
  - اختبر محاولة الوصول لأي admin endpoint بـ token/session في حالة `2fa_pending` → 403 `TWO_FACTOR_REQUIRED`.
- **P4-T04 — Recovery Codes.** 8–10 codes عشوائية CSPRNG، متخزنة **hashed** (مش مشفرة عكسيًا) أو بحسب implementation الحالية مع مبرر، single-use (تتحذف/تتعلم used atomically داخل transaction)، regenerate يحتاج password confirmation ويبطل القديم، العرض مرة واحدة فقط. اختبر: نفس الكود مرتين → الثانية فشل، وسباق متزامن بنفس الكود → واحد بس ينجح.
- **P4-T05 — Password Reset.** token عشوائي مخزن hashed، صلاحية ≤ 60 دقيقة، one-time، response واحد سواء الـ email موجود أو لا، throttle، بعد النجاح: إبطال كل sessions/tokens الأخرى + إشعار email للمستخدم، ومفيش تسجيل للتوكن في logs. اختبر: token منتهي، token مستخدم، token مع email تاني.
- **P4-T06 — Password Policy.** `Password::min(12)` (أو حسب قرار المستخدم)، رفض الـ common passwords، `uncompromised()` اختياري (بيعمل network call → وثّق ومرّر له timeout/fallback)، منع إعادة استخدام آخر N لو مطلوب.
- **P4-T07 — Email Verification.** حدد العمليات اللي تتطلب verified (حجز؟ دفع؟ إدارة؟) بقرار موثق وطبّق `verified` عليها. signed URL + throttle.
- **P4-T08 — Session/Token Management.** قائمة الأجهزة النشطة `GET /me/sessions`، logout كل الأجهزة، token expiration (`sanctum.expiration`)، idle timeout للأدمن، إبطال sessions عند تغيير password/تعطيل الحساب/تغيير role. `SESSION_SECURE_COOKIE`, `SESSION_SAME_SITE`, `SESSION_HTTP_ONLY` في production config.
- **P4-T09 — Sensitive-action re-auth.** `password.confirm` (أو ما يعادله في API: endpoint يصدر "recent-confirmation" flag صلاحيته 10–15 دقيقة) على: تغيير password/email، تعطيل 2FA، تغيير roles، refund، تغيير payment settings، حذف حساب.
- **P4-T10 — Account lifecycle.** تعطيل حساب يقطع كل الجلسات فورًا، force-password-change يمنع كل شيء ما عدا تغيير الباسورد، حذف/تعطيل لا يكسر الـ FK ولا يسرّب بيانات.
- **P4-T11 — Log hygiene.** افحص logs/exception context/audit: مفيش password, token, 2FA code, recovery code, reset token. أضف Monolog processor يعمل redact لمفاتيح معروفة (`password`, `token`, `secret`, `code`, `authorization`, `card`, `cvv`).
- **P4-T12 — Enumeration.** register / forgot / login / verify-email: نفس الرد والزمن التقريبي.

### Tests
`LoginGenericErrorTest`, `LoginThrottleEmailIpTest`, `SessionRegenerationTest`, `TwoFactorPendingCannotAccessAdminTest`, `TwoFactorRequiredForAdminRolesTest`, `TotpReplayRejectedTest`, `TotpWindowTest`, `RecoveryCodeSingleUseTest`, `RecoveryCodeConcurrentUseTest`, `PasswordResetExpiryTest`, `PasswordResetOneTimeTest`, `PasswordChangeRevokesOtherSessionsTest`, `ReAuthRequiredForSensitiveActionsTest`, `NoSecretsInLogsTest`, `AccountDisableRevokesAccessTest`.

### Deliverables
`AUTHENTICATION_SECURITY.md`, `TWO_FACTOR_FLOW.md` (state diagram)، الاختبارات، config production checklist للـ session/cookies.

### Acceptance
- ✅ مفيش طريقة لتخطي 2FA (مختبر).
- ✅ recovery code single-use حتى تحت التزامن.
- ✅ login rate limit فعال بالمفتاحين.
- ✅ session/token بتتجدد وبتتبطل صح.
- ✅ مفيش secrets في logs (مختبر).

---

# Phase 5 — Booking, IDOR & Concurrency

## الهدف
حجز صحيح، محمي، ومقاوم للتزامن والتكرار والـ enumeration.

## Scope
- **IN**: availability، pricing، booking lifecycle/state machine، ownership/confirmation access، concurrency، holds/expiry، cancellation.
- **OUT**: تفاصيل الدفع (Phase 6)، نشر الـ PII (7).

## Prompt
أنت Senior Booking Systems Engineer + AppSec Engineer. شغّل اختبارات التزامن على **PostgreSQL** (من Phase 0).

### Tasks

- **P5-T01 — Booking Lifecycle Map.** ارسم state machine الفعلي من الكود: كل status وكل transition (من → إلى، مين يقدر يعملها، side effects). اعمل **Transition Table** في كود (Enum + `canTransitionTo()`)، وكل تغيير status يمر عبر method واحدة (`BookingStateMachine::transition()`) مفيش `->update(['status'=>...])` متفرقة.
  `grep -rnE "'status'\s*=>|->status\s*=" app`
- **P5-T02 — Server-side Pricing.** الأسعار تتحسب بالكامل في Action واحدة (`PriceQuote`/`CalculateBookingPriceAction`): base + seasonal + fees + taxes + discount، كله integer minor units، ترتيب العمليات وقواعد التقريب موثقة. العميل يبعت (property, dates, guests, discount_code) **فقط**. الـ quote يتحفظ مع الحجز (snapshot) وبيتأكد عند التأكيد إنه لسه صالح. اختبر manipulation: بعت `total`/`price` في الـ body → يتتجاهل.
- **P5-T03 — Availability Model.** افهم الموجود (availability blocks / bookings / seasonal). حدد قاعدة التداخل بدقة: `[check_in, check_out)` (نصف مفتوح) عشان check-out يوم = check-in يوم تاني مسموح. وثّق المناطق الزمنية (تواريخ property-local كـ `date`، مش timestamps).
- **P5-T04 — Double-Booking Prevention (على مستوى الداتابيز).**
  - **PostgreSQL (الهدف):** exclusion constraint:
    `EXCLUDE USING gist (property_id WITH =, daterange(check_in, check_out, '[)') WITH &&) WHERE (status IN (<active statuses>))` (يحتاج `btree_gist`). لو الـ inventory على مستوى room/unit، استخدم `room_id`.
  - **Fallback/إضافي في التطبيق:** `DB::transaction` + `lockForUpdate()` على صف الـ property/inventory قبل فحص الـ availability وإنشاء الحجز، مع retry محدود على deadlock (`DB::transaction($cb, 3)`).
  - SQLite dev: وثّق إن الـ constraint مش موجود هناك، وإن الاختبار الحقيقي على PostgreSQL فقط.
  - معالجة الـ `QueryException` من الـ constraint وتحويلها لـ `409 BOOKING_UNAVAILABLE`.
- **P5-T05 — Holds / Pending Expiry.** لو في pending قبل الدفع: `expires_at`، scheduled command يحرر المنتهي (idempotent، `chunkById`، `withoutOverlapping`). الـ availability check يتجاهل المنتهي. اختبر بـ `Carbon::setTestNow`.
- **P5-T06 — Idempotent Creation.** `Idempotency-Key` (من Phase 2) + unique constraint منطقي (مثلاً `(user_id, idempotency_key)`). retry من العميل مش بيعمل حجز تاني.
- **P5-T07 — Atomicity.** إنشاء الحجز + الـ items + الـ quote + الـ hold داخل transaction واحدة. الـ side effects (email/notification/webhook) بـ `afterCommit` / `ShouldDispatchAfterCommit`. اختبر rollback: خلّي خطوة في النص تفشل → مفيش سجلات يتيمة.
- **P5-T08 — Reference & Confirmation Access (IDOR).**
  - `reference` يتولد CSPRNG (≥ 10 chars base32/ULID)، مش sequential ولا قابل للتخمين، مع unique index.
  - `/checkout/confirmation/{reference}`: **مفيش وصول بالـ reference لوحده لو الصفحة فيها PII/مالية.** النموذج المقترح (وثّق القرار): (أ) authenticated owner = الأساسي. (ب) للضيف بدون حساب: signed temporary URL + `booking_access_token` عشوائي مخزن hashed + (اختياري) verification بـ email/last-4 phone. صلاحية محدودة.
  - الرد في حالة reference غلط = نفس رد "غير مصرح" (مفيش فرق بين "مش موجود" و"مش بتاعك") + throttle على المحاولات (per IP) لمنع enumeration.
  - أي response عام للـ guest يرجع حقول مختصرة (بدون PII كاملة).
- **P5-T09 — Cancellation & Modification.** القواعد (سياسة الإلغاء، رسوم، refund eligibility) تتحسب server-side من الـ policy المحفوظة وقت الحجز (snapshot). state check + ownership check + lock. مفيش double cancel (idempotent). الـ refund نفسه في Phase 6 (هنا بس بنسيب hook واضح).
- **P5-T10 — Authorization for bookings.** (يكمل Phase 3) customer → حجوزاته فقط، staff → حسب scope. اختبر `/bookings/{id}` و`/bookings?customer_id=` و export.
- **P5-T11 — Availability/Search Performance.** استعلام الـ availability للـ search: EXPLAIN، composite index `(property_id, status, check_in, check_out)`، تجنّب loop per property (استعلام واحد set-based)، حدود على نطاق التواريخ (مثلاً ≤ 365 يوم) وعدد الضيوف.
- **P5-T12 — Concurrency Test Suite (إلزامي).**
  - سيناريو A: **100 محاولة متزامنة** لحجز نفس inventory/نفس التواريخ → حجز واحد بالظبط ينجح، الباقي 409، مفيش سجلات يتيمة، مفيش over-allocation.
  - سيناريو B: تواريخ متداخلة جزئيًا (A: 1–5، B: 4–8) متزامنة.
  - سيناريو C: نفس `Idempotency-Key` متزامن 20 مرة → حجز واحد.
  - سيناريو D: إلغاء + حجز جديد متزامنين على نفس الفترة.
  - سيناريو E: انتهاء hold أثناء الدفع.
  - **التنفيذ:** processes حقيقية متوازية (`Process::pool()` أو artisan command بيتشغل N مرات مع barrier بسيط) على PostgreSQL. **loop تسلسلي مش دليل.** اطبع الأرقام الفعلية (نجح كام/فشل كام/زمن).
- **P5-T13 — Enumeration Tests.** مسح reference/ID متسلسل/emails بعدد كبير → throttle + مفيش تسريب.

### Tests (أمثلة)
`BookingStateMachineTransitionsTest`, `PriceCannotBeTamperedTest`, `HalfOpenRangeAvailabilityTest`, `ConcurrentBookingSameInventoryTest`, `ConcurrentOverlapTest`, `IdempotentBookingCreationTest`, `BookingCreationRollbackTest`, `ConfirmationPageIdorTest`, `GuestAccessTokenExpiryTest`, `BookingEnumerationThrottleTest`, `CancelTwiceIsIdempotentTest`, `PendingHoldExpiryTest`.

### Deliverables
`BOOKING_SECURITY_AUDIT.md`, `BOOKING_STATE_MACHINE.md`, `TRANSACTION_STRATEGY.md`, concurrency suite مع نتائج الأرقام الفعلية، IDOR regression tests.

### Acceptance
- ✅ 100 concurrent → حجز واحد (رقم فعلي مسجل، على PostgreSQL).
- ✅ الـ DB نفسها ترفض التداخل (constraint)، مش بس التطبيق.
- ✅ مفيش وصول لحجز غيرك (مختبر).
- ✅ rollback مفيش بيانات نصف مكتملة.
- ✅ retry مفيش duplicates.

---

# Phase 6 — Payment & Financial Integrity

## الهدف
منع double charge، tampering، replay، وحالات مالية غير متسقة.

## Scope
- **IN**: payment lifecycle، webhooks، refunds، manual bank transfer، money types، reconciliation.
- **OUT**: تغيير الـ gateway أو إضافة وسائل دفع جديدة.

## Prompt
أنت Payment Security Engineer. أي سلوك مالي غامض → اسأل المستخدم (G22).

### Tasks

- **P6-T01 — Money Audit.** افحص كل عمود مالي في كل الجداول (`bookings`, `payment_transactions`, `refunds`, invoices, ticket orders, events, discounts, fees): نوعه (int/decimal/float)؟ العملة موجودة؟ وبعدين كل الكود اللي بيحسب بيهم (`grep -rnE "round\(|number_format|floatval|\(float\)|\* 100|/ 100|bcmul|bcadd" app`). **لو في decimal/float:** خطة migration آمنة (عمود جديد integer + backfill + dual-write + verify equality + switch + drop) — **متنفذهاش بدون موافقة المستخدم لو فيها بيانات حقيقية.** استخدم Value Object `Money(int $amount, string $currency)` وقاعدة تقريب واحدة (مثلاً half-up) موثقة.
- **P6-T02 — Payment State Machine.** حالات: `pending → authorized? → captured/paid → partially_refunded → refunded` و`failed`, `cancelled`, `expired`, `disputed` (حسب الموجود). جدول transitions مسموحة في كود (Enum)، وأي transition خارجه ترمي `InvalidPaymentTransition`. تغيير الـ status من مكان واحد فقط. كل transition يسجل event/audit.
- **P6-T03 — Create Payment (Server-side Amount).** المبلغ يتحسب من الـ booking/quote المحفوظ على السيرفر، مش من الـ request. اتأكد من currency. discount/fee كلها server-side وتتحقق (صلاحية الكود، حد الاستخدام، min spend) داخل lock لمنع تخطي حد الاستخدام بالتزامن.
- **P6-T04 — Idempotency & Duplicate Requests.** `idempotency_key` + unique `(booking_id, idempotency_key)`. دفعتين متزامنتين لنفس الحجز → واحدة بس تنشأ (lock على الـ booking row). لو في payment pending نشطة لنفس الحجز → ارجعها بدل إنشاء جديدة.
- **P6-T05 — Webhook Handler (الترتيب مهم):**
  1. اقرأ **raw body** (مش parsed) → تحقق من الـ signature بـ constant-time compare (`hash_equals`) + secret من config. فشل → `400/401` بدون معالجة.
  2. تحقق من timestamp tolerance (≤ 5 دقايق) لو الـ gateway بيدعمه (replay).
  3. **Insert-first dedupe:** سجّل `webhook_event_id` في جدول `webhook_events` بـ **unique constraint** (provider, event_id). لو الـ insert فشل بـ unique violation → الحدث متعالج: ارجع `200` بدون side effects.
  4. داخل transaction: `lockForUpdate` على الـ payment، تحقق إن (amount, currency, booking, gateway_reference) مطابقين للمحفوظ، طبّق transition مسموح فقط.
  5. الـ side effects (email، تأكيد حجز، tickets) تتبعت **afterCommit** عبر job idempotent.
  6. حدث خارج الترتيب (مثلاً `refunded` قبل `paid`) → خزّنه وعالجه بقاعدة واضحة أو ارفضه بـ 409/202 موثق.
  7. مفيش logging للـ payload الكامل أو الـ signature؛ سجّل event_id وtype وresult فقط.
  8. استجابات الـ webhook: `2xx` للمعالَج/المكرر، `4xx` للتوقيع الغلط، `5xx` للخطأ المؤقت (عشان الـ gateway يعيد). وثّق.
- **P6-T06 — Gateway Calls.** timeouts، retry بـ backoff **فقط** مع idempotency key عند الـ gateway، معالجة timeout غامض (الدفع ممكن اتم عند الـ gateway) → حالة `pending_verification` + job بيستعلم من الـ gateway للتأكد (reconciliation) بدل افتراض فشل. circuit-breaker بسيط (cache flag) اختياري لو في أعطال متكررة.
- **P6-T07 — Refunds.** permission منفصلة `payments.refund` (+ maker-checker لو القرار كده + `password.confirm`/2FA). القواعد: `refund_amount ≤ captured − already_refunded`، داخل transaction + `lockForUpdate` على الـ payment (يمنع refund race)، idempotency key، audit كامل (مين، كام، ليه)، ربط بسياسة الإلغاء، تحديث state الحجز/التذاكر بشكل متسق. اختبر double-refund متزامن.
- **P6-T08 — Manual Bank Transfer.** رفع الإثبات (media مؤمن — Phase 7)، حالة `awaiting_verification`، الموافقة من user مختلف عن اللي أنشأ (لو maker-checker)، ربط المبلغ المتوقع بالمبلغ المؤكد، timeout للإلغاء التلقائي، audit.
- **P6-T09 — Reconciliation Command.** scheduled command يومي: payments في حالة وسيطة أكتر من X دقيقة، فروق بين الـ DB والـ gateway (لو API متاح)، حجوزات مدفوعة بدون payment captured وبالعكس. يطلع تقرير (log/notification للأدمن) — **قراءة فقط** مبدئيًا.
- **P6-T10 — Card Data.** تأكد إن مفيش PAN/CVV/expiry/track في DB أو logs أو request logging أو exception context أو error trackers. grep + اختبار.
- **P6-T11 — Invoice/Totals Consistency.** invariant tests: `sum(payments.captured) − sum(refunds) == booking.paid_amount` وكل المبالغ ≥ 0.

### Tests إلزامية
`DuplicatePaymentRequestTest`, `ConcurrentPaymentSameBookingTest`, `DuplicateWebhookNoSideEffectsTest`, `WebhookReplayTest`, `WebhookInvalidSignatureTest`, `WebhookOutOfOrderTest`, `WebhookAmountMismatchRejectedTest`, `ClientAmountTamperIgnoredTest`, `DiscountUsageLimitConcurrencyTest`, `RefundExceedsCapturedTest`, `ConcurrentRefundTest`, `RefundRequiresPermissionTest`, `GatewayTimeoutThenRetryTest`, `PaymentRollbackConsistencyTest`, `MoneyRoundingTest`, `PaymentInvariantTest`, `NoCardDataInLogsTest`.

### Deliverables
`PAYMENT_SECURITY_AUDIT.md`, `PAYMENT_STATE_MACHINE.md`, `WEBHOOK_SPEC.md`, `MONEY_POLICY.md`, tests، reconciliation command.

### Acceptance
- ✅ لا double charge ولا double refund تحت التزامن (أرقام فعلية).
- ✅ duplicate/replayed webhook = صفر side effects (مختبر).
- ✅ العميل لا يقدر يغيّر أي مبلغ.
- ✅ كل transition مالي مسموح فقط حسب الجدول.
- ✅ invariants المالية متسقة.

---

# Phase 7 — PII, Data Protection & Media Security

## الهدف
تصنيف وحماية البيانات الحساسة والملفات.

## Scope
- **IN**: تصنيف، encryption at rest للحقول المختارة، redaction، media pipeline، retention/erasure.
- **OUT**: تشفير شامل للداتابيز (ده infrastructure)، DLP.

## Prompt
أنت Data Security & Privacy Engineer.

### Tasks

- **P7-T01 — Data Inventory.** كل table/column فيها PII أو بيانات مالية أو ملفات. جدول: `table.column | تصنيف (Public/Internal/Sensitive/Highly Sensitive) | مين يقراها (roles) | بتظهر في (API/logs/exports/emails) | encryption؟ | retention`. ركّز: users, customers, leads, bookings (guest details), activity_logs (قد تحتوي old/new values بها PII)، media, invoices, documents, passport/ID fields.
- **P7-T02 — Encryption Decisions.** قرار لكل حقل Highly Sensitive (passport/ID number، IBAN، tax id، 2FA secret، API credentials مخزنة…): `encrypted` cast. لو محتاج بحث بالحقل → **blind index** (HMAC-SHA256 بمفتاح منفصل في عمود مستقل + index). Hash بدل encryption لو مش محتاج تقرا القيمة. وثّق: **مفيش تشفير للحقول اللي بتتفلتر/تترتب عليها بكثرة** (هتخرب الـ performance). اكتب خطة **key rotation** (APP_KEY previous keys `APP_PREVIOUS_KEYS`) وخطوات migration للبيانات القديمة (command chunked + idempotent + قابل للإعادة).
- **P7-T03 — Exposure Control.** `$hidden` على الـ models، Resources بـ `when(can)` للحقول الحساسة، masking في الـ listings (`****1234`)، exports تحتاج permission خاصة وتتسجل في audit، الإيميلات والـ PDFs ما فيهاش أكتر من اللازم.
- **P7-T04 — Logging Redaction.** Monolog processor مركزي (من Phase 4) يغطي مفاتيح PII (`email`, `phone`, `passport`, `national_id`, `address`, `card`, ...) حسب القرار. `activity_logs`: ما تخزنش old/new values للحقول الحساسة (خزّن "changed" فقط). Exception context وreporting مفيهومش request bodies كاملة. `APP_DEBUG=false` في production. اختبر.
- **P7-T05 — Media Upload Pipeline (كل uploads).** FormRequest موحد:
  - Allow-list للـ extensions **و** فحص الـ MIME الحقيقي (`finfo`/`mimetypes:`) **و** مطابقتهم لبعض.
  - حدود حجم + أبعاد صور + عدد ملفات.
  - اسم ملف عشوائي (ULID) — اسم المستخدم الأصلي يتخزن كـ metadata فقط (sanitized).
  - الصور: re-encode (GD/Imagick/Intervention لو موجود) لإزالة EXIF/GPS والـ polyglot payloads.
  - **SVG:** ممنوع إلا لو ضروري، ولو ضروري → sanitizer + تقديم بـ `Content-Disposition`/`Content-Type` آمن + `Content-Security-Policy: sandbox`.
  - PDF/documents: تقديمها download فقط (`nosniff`).
  - مفيش executable extensions (php, phtml, phar, html, js, exe, sh, …)، ومفيش double extensions.
  - Path traversal: أي path من المستخدم يتنضف، والـ storage بيستخدم `Storage` disk مش مسارات يدوية.
- **P7-T06 — Storage Isolation & Private Files.** disk `public` للصور العامة المقصودة فقط (property images). كل حاجة تانية (إثباتات تحويل، هويات، فواتير، exports) على disk **private** (`storage/app/private`) وتتقدم عبر controller بيعمل authorization (Policy على الـ media/owner) أو `Storage::temporaryUrl` / signed route قصيرة الصلاحية. اتأكد إن مفيش وصول مباشر عبر `/storage/...` للخاص. ملف `.htaccess`/nginx rule بتمنع تنفيذ PHP في مجلدات الرفع.
- **P7-T07 — Media Authorization & Ownership.** رفع/حذف/عرض media لازم يتحقق من ملكية الـ parent (property/booking/event). منع IDOR على `media/{id}`. حذف media يمسح الملف الفعلي والـ variants (queued).
- **P7-T08 — Media Performance.** thumbnails/variants تتولد queued أو lazily مرة واحدة، Cache headers طويلة للـ public (مع file hash في الاسم)، حدود على عدد الـ media في list endpoints.
- **P7-T09 — Retention & Erasure.** سياسة حذف/إخفاء هوية: soft delete → anonymization job (يستبدل PII بقيم محايدة مع الحفاظ على السجلات المالية المطلوبة قانونيًا)، `Prunable` للبيانات المنتهية (leads قديمة، tokens، idempotency keys، webhook_events قديمة، notifications)، data-export للمستخدم (لو مطلوب). **اسأل المستخدم عن مدد الاحتفاظ** — متخمّنش.
- **P7-T10 — Backups/Exports.** الـ exports والـ backups مشفرة أو في مكان محمي، ومفيهاش secrets.

### Tests
`SensitiveFieldsEncryptedAtRestTest`, `BlindIndexSearchTest`, `HiddenFieldsNotInResponsesTest`, `PiiMaskedInListingsTest`, `LogRedactionTest`, `ActivityLogNoSensitiveValuesTest`, `UploadRejectsExecutableTest`, `UploadRejectsMimeExtensionMismatchTest`, `UploadRejectsPolyglotTest`, `UploadOversizeRejectedTest`, `UploadPathTraversalTest`, `SvgUploadPolicyTest`, `PrivateFileNotPubliclyAccessibleTest`, `MediaIdorTest`, `SignedUrlExpiryTest`, `ExifStrippedTest`, `AnonymizationJobTest`.

### Deliverables
`DATA_CLASSIFICATION.md`, `PII_SECURITY.md`, `MEDIA_SECURITY.md`, `RETENTION_POLICY.md`, encryption migration command, tests.

### Acceptance
- ✅ كل Highly Sensitive field مشفر أو مبرر عدم تشفيره.
- ✅ الملفات الخاصة مش مفتوحة بدون authorization/توقيع.
- ✅ كل upload بيعدي pipeline التحقق.
- ✅ logs فاضية من secrets و PII غير الضرورية (مختبر).

---

# Phase 8 — PostgreSQL Production Migration & Data Layer

## الهدف
نقل منضبط من SQLite لـ PostgreSQL، مع تقوية الـ schema (constraints/indexes) وطبقة الوصول للبيانات.

## Scope
- **IN**: compatibility audit، migrations fixes، constraints، indexes، transactions، DB config، backup/restore، data access conventions.
- **OUT**: replicas / sharding / pgbouncer / أي infra إضافية بدون إثبات.

## Prompt
أنت Database Architect (Laravel/PostgreSQL). **ابدأ بـ audit، متنفذش migration مباشرة.**

### Tasks

- **P8-T01 — Compatibility Audit (51 tables).** شغّل `migrate:fresh --seed` على PostgreSQL فعلي وسجّل كل خطأ. وبعدين افحص يدويًا لكل table: types، boolean (`0/1` vs `true/false`)، JSON → `jsonb`، enums، string lengths (SQLite مبيفرضش)، `LIKE` case sensitivity (PostgreSQL case-sensitive → استخدم `ILIKE`)، `GROUP BY` strictness، `DATE()` functions، raw SQL خاص بـ SQLite (`grep -rnE "strftime|ifnull|datetime\(|GROUP_CONCAT|PRAGMA|RANDOM\(\)|substr\(" app database`), `orderBy` على nulls، unique على NULL، case-insensitive email uniqueness (`citext` أو unique index على `lower(email)`).
- **P8-T02 — Foreign Keys & Delete Rules.** جدول لكل FK: parent/child | onDelete (`restrict` للمالي والحجوزات، `cascade` للبيانات التابعة فعلًا، `set null` للـ optional) | مبرر. افحص orphans في seed/data حالية بـ queries. **PostgreSQL مبينشئش index تلقائي على الـ FK columns** → أضف index لكل FK column لسه ملوش.
- **P8-T03 — Constraints = Security.** أضف حسب الحاجة (كل واحدة بمبرر واختبار): `CHECK (amount >= 0)`, `CHECK (check_out > check_in)`, `CHECK (status IN (...))` (أو PG enum), `NOT NULL` على اللي لازم، unique constraints (reference، idempotency، webhook event، `(user_id, role_id)` pivots)، partial unique للـ soft-deleted (`WHERE deleted_at IS NULL`)، exclusion constraint للحجز (Phase 5)، `timestamptz` + UTC.
- **P8-T04 — Index Strategy (بالدليل).** مفيش index عشوائي. الخطوات: اجمع الـ queries الفعلية (query log من الـ test suite + feature flows + Phase 0 perf baseline)، لكل query بطيئة/متكررة `EXPLAIN (ANALYZE, BUFFERS)` قبل وبعد، composite indexes بترتيب الأعمدة الصحيح (equality ثم range ثم sort)، partial indexes للـ statuses النشطة، GIN على `jsonb` المستخدم في الفلترة فقط، `pg_trgm` للبحث النصي لو الـ search حقيقي. سجّل: index | query اللي بيخدمه | قبل/بعد. وشيّل أي index زيادة (كل index بيبطّأ الكتابة).
- **P8-T05 — Transaction Conventions.** وثّق وطبّق: كل write متعدد الجداول في `DB::transaction`، `lockForUpdate` للمواضع الحرجة بترتيب ثابت للـ locks (يمنع deadlocks)، `afterCommit` للـ side effects، retry على deadlock (`attempts`)، isolation level الافتراضي (READ COMMITTED) مع تبرير لو احتجت أعلى، مفيش network call داخل transaction.
- **P8-T06 — Eloquent Data-Access Conventions.** `Model::shouldBeStrict()`, eager loading, local scopes/Query objects للـ queries المعقدة (مش repository layer كامل — over-engineering), `chunkById`/`lazyById` للـ batch، `upsert` بدل loop، `Model::unguard` ممنوع، raw queries مع bindings دايمًا.
- **P8-T07 — Migration Safety.** كل migration: `down()` شغالة أو موثق إنها irreversible. التغييرات الكبيرة بنمط expand → migrate data → contract (مع حقن batches). `CREATE INDEX CONCURRENTLY` عبر `public $withinTransaction = false;` على الجداول الكبيرة. مفيش data migration داخل schema migration تقيلة. اختبر `migrate` ثم `migrate:rollback` ثم `migrate` على PostgreSQL.
- **P8-T08 — DB Config (Production).** `config/database.php` pgsql: `sslmode=require`, `application_name`, `statement_timeout`, `lock_timeout`, `idle_in_transaction_session_timeout` (عبر `options`/`SET` عند الاتصال)، `charset utf8`, timezone UTC. Persistent connections قرار موثق. **DB users بأقل صلاحيات:** app user (DML فقط)، migration user (DDL)، read-only user للتقارير لو لزم.
- **P8-T09 — Data Migration (SQLite → PostgreSQL) لو في بيانات حقيقية.** أداة/command بتنقل chunked مع تحويل types، تتحقق من row counts وchecksums لكل table، تعيد ضبط sequences (`setval`)، وتتجرب على نسخة قبل الـ cutover. خطة cutover وrollback بجدول زمني.
- **P8-T10 — Backup/Restore/Rollback.** `pg_dump -Fc` يومي + retention، اختبار **restore فعلي** في DB مؤقتة + smoke queries + مقارنة counts، RPO/RTO مسجلة (قيمتها يحددها المستخدم)، سيناريو rollback بعد deploy فاشل، وbackup قبل كل migration production.
- **P8-T11 — CI على PostgreSQL.** الـ suite كلها (أو على الأقل groups: migrations, concurrency, payment, booking) تتشغل على PostgreSQL.

### Tests
`MigrationsFreshOnPostgresTest` (أو CI step), `MigrationRollbackTest`, `ForeignKeyIntegrityTest`, `CheckConstraintsTest`, `UniqueConstraintsTest`, `CaseInsensitiveEmailUniqueTest`, `OverlapExclusionConstraintTest`, `SequenceResetAfterImportTest`, `RestoreSmokeTest` (script).

### Deliverables
`POSTGRES_MIGRATION_AUDIT.md`, `INDEX_REPORT.md` (قبل/بعد EXPLAIN)، `FK_DELETE_RULES.md`, `DB_CONVENTIONS.md`, `BACKUP_RESTORE_RUNBOOK.md`, `PRODUCTION_DB_CHECKLIST.md`, migration fixes.

### Acceptance
- ✅ كل migrations تعدي (up/down/up) على PostgreSQL.
- ✅ الـ suite تمر على PostgreSQL.
- ✅ كل FK له index وrule موثقة.
- ✅ الـ critical queries ليها EXPLAIN مقبول (مسجل).
- ✅ restore اتجرب فعلًا وتم التحقق من البيانات.

---

# Phase 9 — Performance & Caching (جديدة)

## الهدف
تسريع النظام **بالقياس**، وتقليل الـ queries والـ payload والـ latency للـ flows الحرجة.

## Scope
- **IN**: query optimization، N+1، caching، HTTP caching، payload، async offloading، deploy optimizations، load measurement.
- **OUT**: Redis / Octane / CDN / replicas إلا لو القياس أثبت الحاجة (وبعد موافقة).

## Prompt
أنت Performance Engineer (Laravel). اتبع S3 حرفيًا. قارن دايمًا بـ `perf_baseline.md` من Phase 0.

### Tasks

- **P9-T01 — Re-baseline.** أعد القياس على PostgreSQL، `APP_DEBUG=false`، caches مفعلة، بيانات seed واقعية. لكل endpoint حرج: queries count، p50/p95، payload size. (login، property search/list، property details، availability، quote، booking create، checkout، payment webhook، customer bookings، admin dashboard، admin bookings list، CMS pages.)
- **P9-T02 — Rank Hotspots.** رتّب بالـ (تكرار × بطء). اشتغل على الأعلى تأثيرًا الأول. سجّل في `PERFORMANCE_REPORT.md` قائمة مرتبة.
- **P9-T03 — Kill N+1.** استخدم violations من P0-T08 + strict mode. لكل endpoint: `with()` صح، `withCount`، `select` محدد، Resources بـ `whenLoaded`. أضف **Query-count tests** (assert `<=` الرقم المقاس بعد الإصلاح) كـ regression guard.
- **P9-T04 — Query Rewrites.** استبدل loops بـ set-based queries، `exists()` بدل `count()>0`، `simplePaginate/cursorPaginate` للجداول الكبيرة، تجنب `OFFSET` العميق، `whereIn` بدل queries متكررة، subquery/`withSum` للـ aggregates، متحمّلش models كاملة لو محتاج أعمدة (`pluck`/`select`).
- **P9-T05 — Admin Dashboard & Reports.** الـ aggregates (إيرادات، حجوزات، occupancy) بـ queries مجمعة (`GROUP BY`) + cache قصير (60–300s) بمفتاح versioned، أو جدول تجميعي يتحدث بـ scheduled job لو القياس يبرر. التقارير الكبيرة/exports → queue + ملف جاهز للتحميل.
- **P9-T06 — Application Cache.** حدد المرشحين (CMS pages، settings، lookups، facets الفلاتر، قوائم المدن/الفئات). `Cache::remember` + TTL + **invalidation صريح** عند الكتابة (observer/event) + `Cache::lock` ضد stampede. driver: `database` أو `file` حاليًا (وثّق). مفيش كاش لبيانات شخصية/مرتبطة بصلاحيات إلا بمفتاح per-user/role.
- **P9-T07 — HTTP Caching.** `Cache-Control: public, max-age, stale-while-revalidate` + `ETag` للـ public GETs (property list/details، CMS). `private, no-store` للـ authenticated. اضبط Next.js (`revalidate`/tags) بالتنسيق: وثّق في `NEXTJS_INTEGRATION.md`. اختبر conditional requests (`If-None-Match` → 304).
- **P9-T08 — Payload Slimming.** list endpoints ترجّع الحقول الضرورية للكارت فقط، details ترجّع الأكتر، `include=` whitelisted، gzip/brotli على مستوى الـ web server (وثّق)، الصور variants بمقاسات.
- **P9-T09 — Async Offloading.** حدد اللي لسه sync وتقيل (emails، PDFs، notifications، image processing، exports، webhooks الخارجية) وانقله لـ queue (بالتنسيق مع Phase 10). متنقلش اللي المستخدم محتاج نتيجته فورًا.
- **P9-T10 — Framework & Deploy Optimization.** `composer install --no-dev --optimize-autoloader --classmap-authoritative`، `config:cache`, `route:cache`, `event:cache`, `view:cache`, `optimize`، OPcache settings موثقة (`validate_timestamps=0` في production + reload عند deploy)، تأكد إن `route:cache` بيشتغل (مفيش closures routes)، `config()` مش بتتنادى من `env()` برا config files. الجلسات: `session.driver` مناسب (database/file) بدل مصدر بطيء.
- **P9-T11 — Middleware Cost.** قيس تكلفة كل middleware على الـ hot path (مثلاً permission resolver، audit، locale). لو بيعمل query في كل request، كاشّه.
- **P9-T12 — Load Test (واقعي).** أداة خفيفة (k6 أو Artillery أو `ab`/`wrk`) كسكربت في `tests/load/`. سيناريوهات بخليط واقعي (مثلاً 70% browse، 20% search/availability، 8% booking، 2% admin) على بيئة production-like. قيس p50/p95/p99، error rate، throughput، استهلاك CPU/RAM/DB connections، slow queries. ارفع الحمل تدريجيًا لحد أول bottleneck وسجّله. **متستخدمش أرقام وهمية؛ اسأل المستخدم عن الحمل المتوقع (مستخدمين متزامنين/حجوزات في الساعة).**
- **P9-T13 — Decision Gate للـ infrastructure.** لو بعد كل اللي فوق لسه فيه bottleneck مثبت بالأرقام → اكتب Proposal (المشكلة، القياس، الحل المقترح Redis/Octane/…، المخاطر) واستنى موافقة. غير كده: لا.
- **P9-T14 — Performance Budget في CI.** query-count tests + (اختياري) smoke load test صغير يفشل لو p95 اتخطى الميزانية المتفق عليها.

### Deliverables
`PERFORMANCE_REPORT.md` (قبل/بعد لكل endpoint)، query-count tests، load scripts + نتائجها، caching map (key | TTL | invalidation)، deploy optimization checklist.

### Acceptance
- ✅ كل تحسين له رقم قبل/بعد.
- ✅ مفيش N+1 في الـ endpoints الحرجة (مختبر بـ query-count).
- ✅ كل list paginated وبحدود.
- ✅ الـ cache لها invalidation مختبر ومفيش تسريب بيانات بين المستخدمين.
- ✅ load test نتايجه مسجلة وأول bottleneck معروف.

---

# Phase 10 — Observability, Queues, Audit Logs & Production Operations

## الهدف
نظام يتراقب ويتشخّص ويتعافى، وعمليات async موثوقة، وأثر تدقيق (audit trail) قابل للتتبع.

## Scope
- **IN**: queues، scheduler، audit log، correlation IDs، structured logging، health checks، alerts، runbooks.
- **OUT**: APM/ELK/Prometheus stack كاملة (اقترح فقط لو لزم)، Horizon/Redis بدون إثبات.

## Prompt
أنت Production Backend + SRE Engineer.

### Tasks

- **P10-T01 — Async Classification.** جدول: العملية | sync/async | السبب | الأثر لو فشلت. المرشحة للـ queue: emails، notifications، PDF، webhook side effects، image processing، exports، reconciliation. **اللي يفضل sync:** اللي المستخدم محتاج نتيجته في نفس الـ request (availability، quote، تأكيد الحجز نفسه).
- **P10-T02 — Job Standards.** كل Job له: `$tries`, `backoff()` تصاعدي، `$timeout`, `failOnTimeout`, `maxExceptions`، `failed()` handler (log + alert + حالة الـ entity)، `ShouldBeUnique`/`uniqueId` أو `WithoutOverlapping` حيث التكرار ضار، `ThrottlesExceptions` للـ external APIs، `afterCommit`، payload صغير (IDs مش models كاملة)، و **idempotent** (إعادة التشغيل مش بتكرر الأثر: تحقق من state قبل التنفيذ، أو جدول processed-markers).
- **P10-T03 — Queue Runtime.** driver: `database` مقبول مبدئيًا (وثّق). supervisor/systemd config لـ `queue:work --tries --max-time --memory`، إعادة تشغيل worker عند deploy (`queue:restart`)، `retry_after` > أقصى `timeout`، أولويات (queues: `critical,default,low`)، `queue:prune-failed` و`queue:prune-batches` scheduled، `job_batches` لو مستخدمة.
- **P10-T04 — Failed Jobs.** `failed_jobs` تتراقب (count > threshold → alert)، سياسة retry (يدوي vs تلقائي)، runbook لإعادة التشغيل الآمن، اختبار job بيفشل ويعيد ويوصل لـ failed() handler.
- **P10-T05 — Scheduler.** كل scheduled task: `withoutOverlapping()`، `onOneServer()` (لو أكتر من instance والـ cache يدعم locks)، `runInBackground` عند الحاجة، log للنجاح/الفشل، heartbeat. القائمة: hold expiry, reconciliation, prune models, prune failed jobs, backups check.
- **P10-T06 — Correlation ID.** `AssignRequestId` (من Phase 2) يحط `request_id` في `Log::withContext()`، في response header، في error envelope، وفي payload الـ jobs (job middleware يستعيده في الـ worker)، وفي audit log، وفي outbound calls (header `X-Request-ID` للـ gateway لو مدعوم).
- **P10-T07 — Audit Log.** جدول (أو تطوير `activity_logs` الموجود — اقرأه الأول) بالأعمدة: `id, occurred_at(timestamptz), actor_type, actor_id, actor_ip, user_agent(مختصر), action (resource.verb), target_type, target_id, result (success/denied/failed), request_id, changes (jsonb — الحقول المتغيرة فقط، بدون قيم حساسة), meta (jsonb)`. 
  - **ما يتسجل إلزاميًا:** login (نجاح/فشل)، 2FA، password changes، role/permission changes، user create/disable، refund/payment status changes، booking status changes من الأدمن، exports، settings changes، media حساسة، **كل 403 على عملية حساسة** (denied).
  - Append-only (مفيش update/delete من التطبيق؛ DB privilege يمنع)، index على `(target_type,target_id)`, `(actor_id,occurred_at)`, `(action,occurred_at)`.
  - يتسجل عبر Action/Listener واحد (`AuditLogger::record()`) مش متفرق.
  - لا تسجل: passwords, tokens, codes, card data, PII غير لازمة (Phase 7).
  - Audit write الفاشل ميكسرش الطلب العادي لكن يتبلّغ عنه (باستثناء العمليات المالية الحساسة — قرار موثق).
- **P10-T08 — Structured Logging.** channel JSON (stderr/daily) فيه `timestamp, level, message, request_id, user_id, route, method, status, duration_ms, ip(masked اختياريًا)`. مستويات واضحة. slow request log (> threshold) وslow query log. `APP_DEBUG=false`. Exceptions: `dontReport` للمتوقع (validation/auth)، والباقي يتسجل بـ context بدون payload حساس.
- **P10-T09 — Health Checks.** `/up` (Laravel default — liveness خفيف بدون DB). `/health/ready` (محمي بـ token/IP): DB (`SELECT 1` بـ timeout قصير)، migrations pending؟، queue (آخر heartbeat للـ worker / عمر أقدم job)، scheduler heartbeat، storage writable، disk space، cache read/write، gateway (اختياري، من غير نداء حقيقي في كل مرة — كاش). رجّع 200/503 + تفاصيل مختصرة.
- **P10-T10 — Alerts (قواعد، مش أداة).** وثّق العتبات: error rate، 5xx، failed_jobs > N، queue lag > X، p95 latency، payments stuck، webhook failures، login failures spikes، disk، DB connections. + قناة التبليغ (email/Slack webhook) كـ notification بسيطة.
- **P10-T11 — Runbooks.** deploy، rollback، queue stuck، DB down، gateway down، webhook failures، restore من backup، تدوير مفاتيح (APP_KEY، gateway secrets)، incident triage.
- **P10-T12 — Failure Tests.** job بيفشل وبيعيد بـ backoff، job مكرر، worker restart في نص job، DB timeout داخل job، `afterCommit` مع rollback (الـ job مايتبعتش)، audit-write failure، health check بـ DB down.

### Deliverables
`OBSERVABILITY.md`, `QUEUE_ARCHITECTURE.md`, `AUDIT_LOG_POLICY.md`, `ALERTING.md`, `RUNBOOK.md`, supervisor/systemd samples, tests.

### Acceptance
- ✅ أي request/job/log/audit entry يتتبع بـ `request_id`.
- ✅ كل job حساس idempotent (مختبر بتشغيله مرتين).
- ✅ failed jobs ليها handling ومراقبة واضحة.
- ✅ audit trail كامل للعمليات الإلزامية ومحمي من التعديل.
- ✅ health checks تكشف DB/queue/scheduler المعطلين.

---

# Phase 11 — Final Security Validation & Production Gate

## الهدف
عدم إعلان "Production Ready" إلا بإثبات.

## Prompt
أنت Principal Security Engineer + QA Architect. **افترض إن المشروع فيه ثغرات لحد ما تفشل في إيجادها بعد مجهود حقيقي.** شغّل كل حاجة على PostgreSQL وبيئة production-like.

### Tasks

- **P11-T01 — Full Suite Gate.** أمر واحد `composer test:gate` (script) يشغّل: tests (كل الـ groups) + Pint + PHPStan/Larastan + `composer audit` + (لو الـ frontend متاح) `npm audit` + route-inventory test + query-count tests + secret scan (`gitleaks` أو grep patterns لو الأداة مش متاحة). كله لازم أخضر.
- **P11-T02 — OWASP API Security Top 10 (2023) Coverage.** لكل بند: finding أو دليل إنه مغطى (test name):
  API1 BOLA • API2 Broken Authentication • API3 Broken Object Property Level Authorization (excessive data exposure + mass assignment) • API4 Unrestricted Resource Consumption (rate limit/pagination/payload/upload size) • API5 Broken Function Level Authorization • API6 Unrestricted Access to Sensitive Business Flows (حجز/تخفيضات/scraping) • API7 SSRF • API8 Security Misconfiguration • API9 Improper Inventory Management (routes قديمة، versions، debug endpoints) • API10 Unsafe Consumption of APIs (الـ gateway/third-parties).
- **P11-T03 — Attack Test Matrix (من الأصلي + موسّع):** auth bypass، authz bypass، RBAC escalation، IDOR/BOLA، SQLi (كل `whereRaw`/`DB::raw`/`orderBy` ديناميكي)، XSS (stored في CMS/reviews/messages، وفي الإيميلات وPDFs)، CSRF (cookie mode)، SSRF (أي URL fetch/webhook/image import)، mass assignment، file upload، path traversal، session fixation، brute force، credential stuffing، replay، webhook replay، payment tampering، booking races، open redirect، host header injection، CORS misconfig، clickjacking، user enumeration، pagination abuse، JSON depth/size abuse، تحميل CSV injection في الـ exports (`=cmd|...`).
- **P11-T04 — Security Headers & Config Audit.** `APP_DEBUG=false`, `APP_ENV=production`, `APP_KEY` مضبوط, HTTPS إجباري + HSTS, cookies `Secure/HttpOnly/SameSite`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`/CSP `frame-ancestors`, CSP مناسب للـ Blade المتبقي، `TRUSTED_PROXIES`, عدم وجود `/telescope` `/debugbar` `/phpinfo` `.env` `.git` exposure, `storage:link` فقط للعام, صلاحيات الملفات, أن DB/queue/cache مش مكشوفة للإنترنت. + اختبار headers آلي.
- **P11-T05 — Dependency & Supply Chain.** `composer audit`، مراجعة الـ packages المهجورة، lockfile committed، مفيش dev packages في production.
- **P11-T06 — Load & Concurrency (مرحلة نهائية).** أعد سيناريوهات Phase 9 + Phase 5/6 تحت حمل مختلط: login، search، availability، booking، checkout، webhook، admin. **الأرقام فعلية ومن بيئة شبه الإنتاج.** سجّل ما اتحقق وما لم يتحقق.
- **P11-T07 — Failure & Recovery Testing.** DB down/restart، gateway timeout/5xx، webhook مكرر ومتأخر وخارج الترتيب، queue stopped/worker restart، app restart وسط request، disk full (محاكاة)، transaction rollback، وبعد كل واحدة: invariants سليمة (مفيش حجز يتيم، مفيش payment عالق، الفلوس متسقة).
- **P11-T08 — Backup/Restore Drill.** نفّذ restore كامل في بيئة معزولة، شغّل smoke + invariants، سجّل الزمن (RTO) وأقصى فقد (RPO).
- **P11-T09 — Log Leak Review.** شغّل سيناريوهات (login، payment، upload، errors) ثم grep على الـ logs وaudit وDB لـ secrets/PII/card patterns.
- **P11-T10 — Traceability Matrix.** `FINDINGS.md` النهائية: كل Finding → Fix (commit/file) → Test name → Status. **أي finding مفتوح بدون اختبار = Gate failure.**
- **P11-T11 — Threat Model.** assets، actors، trust boundaries (Browser ↔ Next.js ↔ Laravel ↔ DB ↔ Gateway ↔ Storage)، STRIDE per boundary، mitigations مربوطة بـ tests.
- **P11-T12 — Final Docs.** `FINAL_SECURITY_AUDIT.md`, `PRODUCTION_READINESS.md`, `THREAT_MODEL.md`, `INCIDENT_RESPONSE.md`, `DEPLOYMENT_CHECKLIST.md`, `RESIDUAL_RISKS.md`.

### Production Gate (كلها لازم تتحقق)
- [ ] Critical findings = 0، High = 0
- [ ] Authorization matrix tests كلها pass
- [ ] Route-inventory test pass
- [ ] Payment integrity + webhook tests pass
- [ ] Booking concurrency tests pass (على PostgreSQL، بالأرقام)
- [ ] Migrations up/down/up pass على PostgreSQL
- [ ] Backup/restore drill تم
- [ ] Queues + scheduler + health checks متحقق منها
- [ ] Production config + security headers متحقق منها
- [ ] Secrets management متحقق (مفيش secrets في repo/logs، وخطة rotation)
- [ ] Logs reviewed: لا PII/secrets
- [ ] Performance budget متحقق (query-count + load results)
- [ ] Traceability: كل finding مغلق باختبار أو Accepted-Risk موقّع من المستخدم

لو فيه حاجة ناقصة: **ممنوع تقول "Production Ready"**. صنّف المتبقي (Critical/High/Medium/Low/Info) واكتب لكل واحد: impact • exploitability • affected component • remediation • هل يمنع الـ production؟

---

# Final Execution Rules

## تقرير نهاية كل Phase (إلزامي)

```
## Phase N Result
### Status: PASS / PASS WITH WARNINGS / BLOCKED
### Task Table (G17)
| Task ID | Status | Evidence | Reason لو مش DONE |
### Changes
| file | change | reason |
### Security Impact
- vulnerabilities closed (IDs)
- risk reduced
- remaining risk
### Performance Impact
- قبل/بعد (queries, p95, payload) — لو الـ Phase لمست الأداء
### Tests
| command | result (passed/failed/skipped) |
- Red→Green evidence للإصلاحات الأمنية
### Architecture Impact
- what changed / why / dependencies / ADRs جديدة
### Verified vs Not Verified   (VERIFIED / ASSUMPTION)
### Remaining Issues
| ID | issue | severity | blocker (yes/no) | planned phase |
### Decisions needing user input
### LEDGER updated: yes/no
### Next Phase: (فقط لو Definition of Done متحققة)
```

## Anti-Drift Checklist (الـ AI يراجعها قبل ما يقول "خلصت")
- [ ] قرأت LEDGER وكملت من نفس النقطة؟
- [ ] كل Task له صف في الجدول؟
- [ ] كل Finding له Test؟
- [ ] خرجت برا الـ Scope؟ (لو أيوه → BACKLOG)
- [ ] ضفت Feature أو dependency بدون مبرر؟
- [ ] غيّرت سلوك business بدون موافقة؟
- [ ] characterization tests لسه خضرا؟
- [ ] الـ suite كلها + Pint + static analysis خضرا؟
- [ ] أي رقم قلته (أداء/تزامن) جاي من تشغيل فعلي؟
- [ ] مفيش secrets/PII في output أو logs أو commits؟

---

# Important Engineering Principles (محدّثة)

1. **Security is not a middleware checkbox** — الفحص الفعلي بالاختبار.
2. **Database constraints are part of security and correctness** — unique / FK / CHECK / exclusion / transactions / locks.
3. **Frontend is never trusted** — price, permission, status, ownership, discount, amount, role, scope: كله server-side.
4. **Thin controllers, fat actions, strict resources** — دورة الطلب واضحة ومرتبة (S1).
5. **Measure, don't guess** — الأداء والتزامن بالأرقام الفعلية (S3).
6. **Tests are the proof** — مفيش "تم" من غير اسم test ونتيجته (S4).
7. **Permission = role + scope + state** (S5).
8. **Do not over-engineer** — Redis/Kafka/RabbitMQ/Kubernetes/microservices/event-sourcing/repository-layers كاملة: لا، إلا بإثبات ورقم وموافقة.
9. **Preserve business behavior** — الأمان ما يكسرش الحجز أو الدفع أو إدارة المحتوى.
10. **Evidence over assumptions** — code / test / DB evidence أو `ASSUMPTION`.
11. **Don't claim 100% security** — الهدف تقليل attack surface وإثبات ما تم اختباره وتوضيح المتبقي.
12. **Ask when the decision is business, decide when it's technical** (G22).

---

# Expected Final State

- Laravel API / Next.js boundary واضحة، `/api/v1` versioned، error + success contract موحد.
- Request pipeline مرتب (S1) مع correlation ID، rate limiting، idempotency.
- Authentication قوية + 2FA حقيقي مفروض + sessions/tokens مُدارة.
- RBAC صريح (role + scope + state) + Policies + Route-inventory test.
- Booking آمن ومحمي من التزامن على مستوى الداتابيز.
- Payments idempotent، webhooks محمية، فلوس integer، refund مفصول ومحمي.
- PII مصنّف ومحمي، media pipeline آمنة، private storage.
- PostgreSQL production-ready: constraints + indexes بالدليل + backup/restore مجرّب.
- أداء مقاس: مفيش N+1، caching بـ invalidation، payload خفيف، load test مسجل.
- Queues موثوقة + audit trail + structured logs + health checks + runbooks.
- Security regression suite + load/concurrency tests + traceability matrix + deployment checklist.

**قاعدة نهائية:** مفيش Phase تعتبر مكتملة لمجرد إن الكود "شكله صح". الاكتمال = اختبارات خضراء + أدلة + LEDGER متحدّث.

---

# Appendix A — Master Prompt (الصقه في بداية كل session جديدة)

```
أنت تعمل على مشروع GouNow (Laravel 12 + Next.js 15، 51 جدول، 7 domains).
نحن ننفذ خطة Hardening من 12 مرحلة (0–11) موثقة في ملف GouNow_Enhanced_Hardening_Prompts_v2.md.

قبل أي شيء:
1) اقرأ docs/hardening/LEDGER.md لتعرف وصلنا فين (لو مش موجود فنحن في Phase 0).
2) اقرأ قسم G-Rules والـ Standards S1–S5 من الملف.
3) اقرأ الـ Phase الحالية كاملة (Tasks + Tests + Acceptance).
4) قل لي بإيجاز: الـ Phase الحالية، آخر Task مكتملة، وأول Task هتنفذها.

التزم بالآتي: Scope Lock، Task IDs، Evidence Labels، Red→Green، لا Features جديدة، لا rewrite،
لا infrastructure ثقيلة بدون إثبات، اسأل في القرارات الـ business، وسجّل كل شيء في LEDGER.
لا تنتقل للـ Phase التالية إلا بعد Definition of Done (G23) وطباعة Phase Result Report.
```

# Appendix B — Resume Prompt (لو الـ AI تاه أو الـ context طال)

```
توقف. لا تكتب كود الآن.
1) اقرأ LEDGER.md وملف الـ Phase الحالي من البداية.
2) اطبع جدول Tasks للـ Phase الحالية بحالة كل Task (DONE / IN-PROGRESS / TODO) مع الدليل.
3) اذكر أي شيء خرجت به عن الـ Scope أو أضفته بدون مبرر.
4) اذكر الاختبارات الفاشلة حاليًا.
5) اقترح الخطوة التالية الواحدة، وانتظر موافقتي.
```

# Appendix C — Quick Search Cheat-Sheet

```bash
# Request handling
grep -rnE "\$request->all\(\)|->fill\(\$request|::create\(\$request|->update\(\$request->all" app
grep -rn "guarded = \[\]" app/Models
grep -rnL "extends FormRequest" app/Http/Requests
# Authorization
grep -rnE "is_admin|hasRole|->role\s*={2,3}|Gate::|->authorize\(|->can\(" app routes resources
# SQL / injection
grep -rnE "DB::(raw|select|statement|unprepared)|whereRaw|orderByRaw|selectRaw|havingRaw|groupByRaw" app
grep -rnE "orderBy\(\$request|orderBy\(request\(" app
# Money
grep -rnE "float|round\(|number_format|floatval|\(float\)|bcmul|bcadd" app database/migrations
# Status changes
grep -rnE "'status'\s*=>|->status\s*=" app
# Hybrid endpoints
grep -rnE "wantsJson|expectsJson|ajax\(\)|return view\(|->view\(|redirect\(" app/Http
# Performance smells
grep -rnE "::all\(\)|->get\(\)|->count\(\)" app/Http app/Services
grep -rnE "LIKE '%|like', '%" app
# Secrets / logging
grep -rnE "Log::(info|debug|error|warning)\(.*(password|token|secret|card|cvv|otp)" app
grep -rnE "env\(" app routes   # env() خارج config = مشكلة مع config:cache
# SQLite-specific
grep -rnE "strftime|ifnull|PRAGMA|GROUP_CONCAT|datetime\(|RANDOM\(\)" app database
# External calls
grep -rnE "Http::|Guzzle|curl_init|file_get_contents\(\s*['\"]http" app
```