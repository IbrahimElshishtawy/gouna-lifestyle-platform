# GouNow — Backend Phase 01: Laravel Production Audit & Implementation

## المهمة الأساسية

أنت تعمل داخل مشروع **GouNow**. المطلوب تنفيذ مراجعة شاملة للـLaravel Backend ثم **إصلاح وتنفيذ الكود نفسه** للوصول لأعلى مستوى عملي ممكن من Production Readiness.

**هذه مهمة تنفيذ برمجي وليست مهمة كتابة Documentation.**

لا تنشئ ملفات شرح أو تقارير أو Checklists أو Markdown جديدة. لا تكتفِ بتحليل المشروع أو اقتراح حلول. افحص الكود الفعلي، حدّد العيوب، نفّذ الإصلاحات الآمنة داخل ملفات المشروع، واختبرها. في النهاية اعرض ملخصًا داخل المحادثة فقط.

---

# 1. قواعد إلزامية قبل لمس الكود

1. اكتشف جذر مشروع Laravel الحقيقي بنفسك من بنية المستودع وملفات `artisan` و`composer.json`. لا تفترض مسارًا.
2. افحص `git status` والتغييرات الموجودة قبل البدء. **لا تمسح أو تستبدل أو تعِد تنسيق تغييرات المستخدم الحالية.**
3. افهم المعمارية الموجودة أولًا: Laravel version، PHP constraints، routes، middleware، controllers، services/actions، models، policies، requests، resources، migrations، tests، integrations.
4. اقرأ ملفات المشروع ذات الصلة وملفات المتطلبات/القرارات الموجودة بالفعل عند الحاجة. لا تنشئ نسخًا جديدة منها.
5. اعتبر الكود والـtests والـschema الفعلي مصادر الحقيقة. لا تعتبر وجود Controller أو Route دليلًا على اكتمال Feature.
6. لا تخترع Business Rules أو حالات Status أو صلاحيات أو حقول أو علاقات غير موجودة في المتطلبات أو السلوك الحالي المؤكد.
7. عند وجود قرار تجاري غامض يؤثر على البيانات أو الأموال أو الصلاحيات أو سلوك المستخدم، لا تخمّن. نفّذ ما هو واضح وآمن، واترك هذا القرار دون تغيير مع ذكر السؤال المحدد في الملخص النهائي.
8. لا تغيّر API contracts أو أسماء الحقول أو response formats أو route URLs لمجرد تحسين الأسلوب. حافظ على التوافق مع Frontend الحالي. إذا كان التغيير breaking ضروريًا، لا تنفذه قبل تحديد أثره وطلب الموافقة.
9. لا تنفّذ أي حذف لبيانات حقيقية، ولا `migrate:fresh`، ولا `db:wipe`، ولا truncate، ولا reset لقاعدة بيانات موجودة.
10. لا تضع Secrets أو Tokens أو بيانات مستخدمين حقيقية في الكود أو الاختبارات أو المخرجات.
11. لا تضف Packages جديدة إلا إذا كانت ضرورية فعلًا، وبعد التأكد من توافقها مع Laravel وPHP وإمكانية صيانتها. فضّل إمكانيات Laravel الموجودة.
12. لا تنفّذ Git commit أو push أو deploy من نفسك.
13. لا تعدّل Next.js أو تطبيقات أخرى أو إعدادات VPS/Hostinger أو Cloudflare ضمن هذه المرحلة.
14. لا تعتبر `APP_DEBUG=false` أو نجاح `build` وحدهما دليل Production Readiness.
15. لا تنشئ Documentation أو تقريرًا داخل المستودع. المخرجات المطلوبة هي **كود عامل + اختبارات**.

## حدود الأمان في التنفيذ

- افحص أولًا، ثم نفّذ على دفعات صغيرة.
- بعد كل مجموعة تغييرات شغّل الاختبارات المناسبة.
- استخدم قاعدة اختبار معزولة فقط. تحقّق من `.env.testing` وإعدادات الاختبار قبل تشغيل أي أمر قد يكتب في قاعدة بيانات.
- لا تشغّل migrations على Production أو على قاعدة بيانات غير معروفة.
- لا تعدّل migrations قديمة سبق استخدامها في بيئات مشتركة أو Production بطريقة تكسر قواعد البيانات الموجودة. أنشئ migration جديدة additive عند الحاجة.
- لا تحذف أعمدة أو جداول أو بيانات ولا تغيّر نوع عمود بطريقة قد تفقد بيانات.
- لا تنفّذ أوامر shell مدمرة أو واسعة النطاق.
- لا تضع الملفات المرفوعة في Git إذا كانت ملفات بيانات فعلية أو صور مستخدمين.

---

# 2. المرحلة A — فهم الحالة الفعلية وبناء خريطة تنفيذ داخلية

نفّذ الفحص التالي دون إنشاء ملفات توثيق:

1. تأكد من Laravel وPHP وإصدارات Composer والحزم.
2. افحص:
   - `composer.json` و`composer.lock`
   - `bootstrap/app.php` أو إعدادات HTTP Kernel حسب إصدار Laravel
   - `routes/api.php` و`routes/web.php` وأي route files أخرى
   - middleware registration وexception handling
   - Models وrelationships وcasts وscopes
   - Controllers وForm Requests وResources
   - Services / Actions / Jobs / Events / Listeners / Notifications
   - Policies / Gates / authorization checks
   - migrations / seeders / factories
   - tests وPHPUnit/Pest configuration
   - Filesystem disks وupload endpoints
   - config files و`.env.example` دون كشف أسرار
3. استخرج قائمة Routes الفعلية من Laravel، وافهم لكل endpoint:
   - HTTP method وURI واسم Route
   - middleware
   - authentication requirement
   - authorization requirement
   - validation
   - controller/action
   - response/resource
   - الاختبار الذي يثبت السلوك
4. اربط كل Module بمتطلباته الفعلية وواجهاته الحالية.
5. حدّد الوظائف التي تستخدم mock/static/demo data أو TODO أو placeholder أو `dd()` أو `dump()` أو `TODO` أو `FIXME` أو `NotImplemented` أو استجابات نجاح وهمية.
6. افحص الأخطاء الموجودة قبل التعديل، ولا تنسب أخطاء سابقة إلى تغييراتك.

لا تنشئ ملفًا لتخزين هذه الخريطة؛ استخدمها لتوجيه التنفيذ فقط.

---

# 3. المرحلة B — API Endpoints

راجع جميع الـAPI endpoints الموجودة، ونفّذ الإصلاحات اللازمة:

## 3.1 اكتمال التنفيذ
- تأكد أن كل Route يصل إلى تنفيذ حقيقي وليس Placeholder.
- تأكد أن كل endpoint ينفذ العملية الصحيحة ويستخدم البيانات الحقيقية من قاعدة البيانات.
- أزل أي success response وهمي لا ينفذ العملية المعلنة.
- عالج أي endpoint مكرر أو متعارض فقط إذا كان واضحًا أنه خطأ ولا يكسر التوافق.
- لا تنشئ endpoints جديدة إلا إذا كانت مطلوبة بوضوح من Feature موجودة لكنها غير مكتملة.

## 3.2 HTTP وResponses
- استخدم HTTP status codes صحيحة ومتسقة مع النمط الحالي للمشروع.
- حافظ على شكل API response الحالي المتفق عليه.
- امنع إرجاع Models أو بيانات داخلية غير مقصودة.
- استخدم API Resources أو طبقة التحويل الموجودة بالمشروع بدل تسريب أعمدة قاعدة البيانات.
- تأكد من pagination وfiltering وsorting وحدودها الآمنة.
- تعامل مع Empty Results بصورة صحيحة.
- لا ترجع 200 لعمليات فاشلة.
- لا تعرض SQL أو stack traces أو مسارات السيرفر أو أسرارًا في production responses.

## 3.3 Validation
- استخدم Form Requests أو النمط الموجود.
- تحقق من كل المدخلات، بما فيها IDs وarrays وnested objects وdates وnumeric ranges وfile uploads.
- استخدم allowlists للقيم المحددة مثل sorting columns وfilters.
- لا تثق في `user_id` أو `owner_id` أو role أو price أو status القادمة من العميل عندما يجب تحديدها من المستخدم المصادق عليه أو من Business Logic.
- امنع mass assignment غير الآمن.
- اجعل رسائل Validation متوافقة مع أسلوب الـAPI الحالي.

## 3.4 الأداء
- امنع N+1 queries باستخدام eager loading المناسب.
- أضف pagination وحدودًا للاستعلامات التي قد ترجع بيانات كبيرة.
- لا تُحمّل علاقات أو أعمدة غير لازمة.
- أضف indexes فقط بعد فحص الاستعلامات والـschema والتأكد من عدم وجود index مكافئ.
- لا تضف caching عشوائيًا لبيانات شخصية أو متغيرة أو صلاحيات.

---

# 4. المرحلة C — Database & Migrations

راجع قاعدة البيانات الفعلية في الكود ونفّذ الإصلاحات الآمنة:

1. افحص كل Model وعلاقاته مع migrations المقابلة.
2. تأكد من صحة:
   - Primary keys
   - Foreign keys
   - Unique constraints
   - Nullable/default values
   - Indexes
   - Cascades / restrict behavior
   - timestamps وsoft deletes عند الحاجة الفعلية
3. راجع أنواع البيانات ودقتها، خصوصًا الأسعار والمبالغ المالية والتواريخ والإحداثيات والعدادات.
4. استخدم Decimal للمبالغ المالية، ولا تستخدم float لحساب الأموال.
5. تأكد من أن العلاقات تمنع orphan records حيث يتطلب منطق المشروع ذلك.
6. راجع uniqueness في البيانات الحساسة مثل email/phone/identifiers حسب متطلبات المشروع، مع مراعاة soft deletes وقواعد PostgreSQL.
7. راجع migrations لتكون قابلة للتنفيذ على قاعدة جديدة وعلى قاعدة موجودة دون فقد بيانات.
8. لا تعدّل migration قديمة مستخدمة في بيئة مشتركة؛ أنشئ migration جديدة آمنة.
9. لا تستخدم SQLite وحدها لإثبات توافق PostgreSQL. شغّل الاختبارات الأساسية على PostgreSQL إذا كانت بيئة اختبار PostgreSQL متاحة.
10. اختبر migration على قاعدة اختبار فارغة، وعلى نسخة اختبار تمثل schema موجودة عند الإمكان.
11. تأكد من أن seeders لا تضيف حسابات افتراضية ضعيفة أو بيانات تجريبية إلى Production.
12. لا تنفّذ migrations على Production خلال هذه المهمة.

## معاملات قاعدة البيانات
- استخدم `DB::transaction()` للعمليات متعددة الخطوات التي يجب أن تنجح أو تفشل كوحدة واحدة.
- عالج التزامن في العمليات الحساسة باستخدام locking أو constraints أو atomic updates حسب الحالة.
- امنع التكرار في العمليات التي قد يعيد العميل إرسالها بسبب timeout أو retry عندما يكون ذلك مطلوبًا.
- لا تضع عمليات خارجية بطيئة داخل transaction مفتوحة دون داعٍ.

---

# 5. المرحلة D — Authentication & Authorization

راجع المصادقة والصلاحيات على مستوى كل endpoint، وليس مجرد وجود Sanctum:

## Authentication
- راجع Laravel Sanctum وطريقة استخدامه الحالية (tokens أو SPA cookies) ولا تغيّر الاستراتيجية دون سبب مؤكد.
- تحقق من login / register / logout / token revocation أو session lifecycle حسب المعمارية.
- تحقق من password hashing وسياسة كلمات المرور.
- امنع كشف وجود حساب بطريقة غير لازمة في رسائل login/reset.
- راجع email/phone verification وpassword reset إن كانت ضمن نطاق المشروع.
- راجع token abilities/expiration/revocation إذا كان المشروع يستخدمها.
- لا تسجل كلمات مرور أو tokens أو authorization headers في logs.

## Authorization
- افحص كل endpoint يقرأ أو يعدّل أو يحذف بيانات مستخدم أو Listing أو Booking أو Payment Proof أو Admin resource.
- طبّق Policies/Gates أو authorization pattern الموجود.
- اختبر ملكية المورد: المستخدم لا يعدّل أو يحذف مورد مستخدم آخر.
- لا تعتمد على إخفاء الزر في Frontend كوسيلة حماية.
- افحص صلاحيات Admin/Staff/Owner/User من المصدر الفعلي للأدوار.
- امنع privilege escalation عبر mass assignment أو تعديل role/status/owner_id.
- طبّق مبدأ أقل صلاحية.
- لا تخترع أدوارًا جديدة أو تغيّر تعريف الدور دون متطلبات مؤكدة.

---

# 6. المرحلة E — Business Logic

هذه من أهم مراحل التنفيذ. افهم كل Module من الكود والمتطلبات الحالية، ثم اختبر أن العمليات صحيحة من البداية للنهاية.

راجع على الأقل كل Modules الموجودة فعلًا في المشروع، بما فيها ما ينطبق من:
- Users / Profiles
- Listings / Categories
- Real Estate
- Cars
- Services
- Products / Appliances / Materials
- Favorites
- Search / Filters
- Bookings / Reservations
- Wallet أو Payment Proof / Transfer Verification إذا كانت موجودة
- Notifications
- Reviews / Ratings
- Admin moderation
- أي Module آخر موجود فعليًا

لكل عملية:
1. تحقق من الحالات المسموح الانتقال بينها.
2. امنع الانتقال غير القانوني للحالة.
3. تحقق من أن المستخدم صاحب الصلاحية فقط هو من ينفذ العملية.
4. تحقق من العلاقات بين الموردين.
5. امنع تكرار العملية أو تنفيذها مرتين عند إعادة الطلب.
6. استخدم transactions للعمليات المركبة.
7. تأكد من أن response يعكس النتيجة المحفوظة فعلًا.
8. اختبر حالات النجاح والفشل والحالات الحدّية.

## قواعد خاصة بالبيانات المالية والحجوزات
- لا تفترض وجود online payment gateway إذا لم يكن موجودًا في التصميم الحالي.
- لا تنشئ دفعًا إلكترونيًا أو Wallet أو رسومًا جديدة من عندك.
- لا تغيّر مبالغ أو عملات أو قواعد عمولة أو إلغاء أو استرداد دون متطلبات مؤكدة.
- لا تسمح بتأكيد حجز أو إثبات تحويل من مستخدم غير مخوّل.
- استخدم decimal/atomic operations والـtransactions عند الحاجة.
- إذا كان منطق مالي غير محدد، لا تخمّن؛ اعرض السؤال في الملخص النهائي.

---

# 7. المرحلة F — Security

نفّذ Security Review وإصلاحات الكود ضمن حدود المشروع:

1. SQL Injection: استخدم Eloquent/Query Builder وparameter binding، وامنع إدخال أسماء أعمدة أو sort directions غير موثوقة.
2. Mass Assignment: راجع `$fillable` / `$guarded` وكل `create()` و`update()` و`fill()`.
3. IDOR/BOLA: افحص كل الوصول إلى الموارد باستخدام IDs وتحقق من ownership/authorization.
4. XSS: لا تثق في HTML أو rich text المقدم من المستخدم، ونظّف المحتوى عند الحاجة حسب طريقة عرضه.
5. CSRF/CORS: راجع إعدادات Sanctum وCORS وCSRF وفق نمط المصادقة الحقيقي. لا تستخدم wildcard credentials.
6. Rate Limiting: طبّق حدودًا مناسبة على login/register/password reset/OTP/search والعمليات الحساسة حسب الموجود.
7. Secrets: تأكد من عدم وجود مفاتيح أو كلمات مرور أو tokens في Git أو responses أو logs. لا تطبع قيم `.env`.
8. Debug: production يجب ألا يكشف debug pages أو stack traces.
9. File Uploads: افحص الملف الفعلي ومحتواه، لا تعتمد على extension أو client MIME فقط.
10. SSRF / URL fetching: راجع أي ميزة تجلب URL خارجيًا، وامنع الوصول إلى private/internal IPs عند الحاجة.
11. Open Redirect: راجع أي redirect URL قادم من المستخدم.
12. Dependency security: افحص Composer dependencies وأي advisories متاحة محليًا دون تحديثات عشوائية قد تكسر المشروع.
13. Logging: لا تسجل كلمات مرور أو tokens أو بيانات دفع حساسة أو محتوى مستندات خاصة.
14. Error handling: أخفِ التفاصيل الداخلية في Production مع الاحتفاظ بتفاصيل كافية في logs الآمنة.
15. تأكد من أن endpoints الإدارية محمية server-side.

لا تدّعِ أن النظام آمن بالكامل لمجرد عدم ظهور نتائج من أداة فحص واحدة.

---

# 8. المرحلة G — Laravel File Storage & Images

اعتمد القرار التالي ما لم يكن المشروع يحتوي بالفعل على تنفيذ صحيح يحقق نفس الهدف:

**الصور العامة للإعلانات تُخزّن فعليًا عبر Laravel Filesystem على Local Public Disk، وPostgreSQL يخزن metadata والمسار فقط.**

- استخدم `Storage` / Filesystem abstraction، ولا تكتب مسارات filesystem يدويًا في Business Logic.
- استخدم `storage/app/public` و`public/storage` symlink وفق إعداد Laravel الحالي.
- احفظ path وdisk وmime type وsize وأي metadata يحتاجها schema الحالي.
- أنشئ أسماء ملفات عشوائية وآمنة.
- تحقّق من نوع الملف ومحتواه وحجمه وأبعاد الصورة عند الحاجة.
- امنع تنفيذ أي ملف مرفوع.
- لا تثق في اسم الملف الأصلي.
- لا تحذف الملف القديم قبل نجاح حفظ البديل وتحديث قاعدة البيانات.
- عند فشل حفظ سجل قاعدة البيانات بعد رفع الملف، نظّف الملف الجديد بأمان.
- عند حذف Listing، تعامل مع ملفاته وفق سياسة الحذف الموجودة، وتجنب حذف ملف مشترك.
- لا تسمح بمسارات يحددها المستخدم تؤدي إلى Path Traversal.
- لا تجعل مستندات إثبات التحويل أو الملفات الشخصية الخاصة على Public Disk.
- الملفات الخاصة يجب أن تستخدم Private disk أو تخزينًا غير مكشوف، وتُقدّم عبر endpoint يتحقق من authorization.
- اختبر رفع وعرض واستبدال وحذف الصور، واختبر عدم الوصول إلى الملفات الخاصة دون صلاحية.
- لا تنفّذ bulk import لصور Google Drive ما لم تكن بيانات المصدر والربط بالـrecords متاحة ومؤكدة؛ لا تخمّن listing IDs أو أسماء الملفات.
- جهّز الكود بحيث يمكن تغيير disk مستقبلًا إلى R2/S3 من خلال config دون ربط Business Logic بمزوّد تخزين بعينه.

إذا كان نظام التخزين الحالي صحيحًا، لا تعِد بناءه لمجرد اتباع هذا القسم؛ أصلح النواقص فقط.

---

# 9. المرحلة H — Testing

لا تكتفِ بتشغيل الاختبارات الموجودة. أصلح الكود واكتب اختبارات حقيقية للسلوك المهم.

## الحد الأدنى المطلوب
- Unit tests للـBusiness Logic المعقد.
- Feature tests لكل API endpoint مهم.
- Authentication tests.
- Authorization/ownership tests.
- Validation tests.
- Database relationship/constraint tests.
- Booking/state transition tests.
- Upload tests للصور العامة والملفات الخاصة.
- Error handling tests.
- Regression tests لكل Bug يتم إصلاحه.

## لكل endpoint حساس اختبر
- مستخدم غير مصادق عليه.
- مستخدم مصادق عليه بلا صلاحية.
- صاحب المورد.
- مستخدم آخر ليس صاحب المورد.
- بيانات صحيحة.
- بيانات ناقصة أو غير صالحة.
- ID غير موجود.
- تكرار الطلب أو retry إذا كانت العملية معرضة للتكرار.
- الحالات الحدّية ذات الصلة.

## قواعد الاختبارات
- استخدم Factories وFakes بدل بيانات حقيقية.
- لا تعتمد على mocks وحدها لإثبات تكامل قاعدة البيانات.
- اختبر PostgreSQL إذا كانت متاحة، خصوصًا constraints وJSON وcase sensitivity وlocking.
- لا تجعل الاختبارات تمر عبر تعطيل assertions أو تخطي الاختبارات أو تحويلها إلى meaningless tests.
- لا تغيّر الاختبار ليقبل سلوكًا خاطئًا لمجرد جعل CI أخضر.
- لا تستخدم `withoutExceptionHandling()` كحل دائم لإخفاء أخطاء الاختبارات.
- شغّل كل الاختبارات ذات الصلة بعد كل تعديل، ثم مجموعة الاختبارات الكاملة.

---

# 10. طريقة العمل المطلوبة

اشتغل بالتسلسل التالي:

### Step 1 — Baseline
- افحص حالة Git.
- افحص إعدادات المشروع والاختبارات.
- شغّل الاختبارات الموجودة على قاعدة اختبار معزولة.
- شغّل Laravel route listing وstatic checks المتاحة.
- سجل النتائج ذهنيًا/في سياق التنفيذ فقط؛ لا تنشئ تقريرًا.

### Step 2 — Implement
- أصلح الـBlockers والعيوب المؤكدة أولًا.
- نفّذ الإصلاحات في ملفات PHP/config/migrations/tests اللازمة فقط.
- أضف migrations جديدة additive عند الحاجة.
- أضف tests لكل إصلاح.
- حافظ على API compatibility.

### Step 3 — Verify
شغّل ما ينطبق من:
- `composer validate`
- `composer audit` (إن كان متاحًا ولا يتطلب اتصالًا غير مصرح به)
- `php artisan route:list`
- `php artisan test`
- `php artisan migrate:status` على قاعدة آمنة فقط
- PHP syntax checks
- Pint/PHPStan/Psalm إن كانت مثبتة ومهيأة بالفعل
- PostgreSQL test suite إن كانت بيئتها متاحة

لا تضف أدوات جديدة لمجرد تشغيل هذه الأوامر. لا تشغّل migrations على Production.

### Step 4 — Regression & Compatibility
- تأكد من أن الـroutes والـresponse contracts الحالية لم تتغير دون ضرورة.
- تأكد من أن كل migrations الجديدة لا تحذف بيانات.
- تأكد من عدم تسريب Secrets.
- تأكد من أن التغييرات لا تعتمد على ملفات موجودة في جهاز المطور فقط.
- تأكد من عدم كسر integrations الحالية.

### Step 5 — Final Result
لا تنشئ أي تقرير أو Documentation file.

اعرض في الرد النهائي داخل المحادثة فقط:
1. ما الذي فحصته فعليًا.
2. ما الذي عدّلته في الكود، مع أسماء الملفات.
3. ما الاختبارات والأوامر التي شغّلتها ونتائجها الفعلية.
4. عدد الاختبارات الناجحة والفاشلة والمتخطاة إن أمكن.
5. أي مشاكل كانت موجودة قبل التعديل.
6. أي Blockers لم تستطع حلها وسبب ذلك.
7. أي قرارات مطلوبة مني قبل استكمال التنفيذ.
8. حالة المرحلة: `PASS` أو `PASS WITH BLOCKERS` أو `NOT PASS`.

لا تقل `PASS` إلا إذا كانت الأدلة والاختبارات تدعم ذلك. لا تدّعِ تنفيذ شيء لم تنفذه.

---

# 11. تعريف النجاح

تُعتبر هذه المرحلة ناجحة فقط عندما:

- تمت مراجعة كل Routes وModules الموجودة فعليًا.
- لا توجد endpoints أساسية وهمية أو غير منفذة دون توضيح.
- Authentication وAuthorization مطبّقان server-side.
- Validation وDatabase integrity سليمان.
- Business Logic الحساسة محمية من الحالات غير الصحيحة والتكرار.
- لا توجد ثغرات واضحة تم اكتشافها وتركت دون معالجة أو توضيح.
- الملفات والصور تُدار عبر Laravel Storage بصورة آمنة إذا كان ذلك ضمن النظام الحالي.
- الاختبارات تثبت أهم حالات النجاح والفشل والصلاحيات.
- لا توجد migrations مدمرة أو تغييرات غير متوافقة غير معتمدة.
- الـAPI contracts الحالية محفوظة.
- لا توجد تغييرات خارج نطاق Laravel Backend.

**ابدأ الآن بفحص المشروع ثم نفّذ الإصلاحات البرمجية الفعلية. لا تتوقف بعد مرحلة التحليل، ولا تنشئ Documentation. إذا ظهر قرار لا يمكن حسمه دون تخمين، اعزله ولا تغيّر سلوكه، وأكمل بقية الإصلاحات الآمنة.**
