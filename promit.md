أيوه، فهمت المطلوب بالضبط. أنت مش عايز Prompt واحد يقول للـ AI "كمّل الموقع"، لأن ده غالبًا هيخليه يعمل **Frontend شكله حلو لكن منفصل عن الـ Backend** أو يكرر نفس الـ UI ويكسر حاجات موجودة.

الملفين بيحددوا أساس المنظومة: **11 Module + RBAC + Backend APIs + Audit Logs + Finance + Booking lifecycle + Concierge + CRM**، والهدف الأساسي إننا نحولهم لخطة تنفيذ تدريجية قبل ما الـ AI يبدأ يكتب كود.  

أنا أقترح تستخدم **Prompt مستقل لكل مرحلة**، وتنفذهم بالترتيب. والأهم: كل Prompt يمنع الـ AI من اختراع Backend أو بيانات وهمية أو تغيير Architecture بدون إذنك.

---

# المرحلة 0 — Audit وفهم المشروع قبل لمس أي كود

**دي أهم مرحلة. لا تخلي الـ AI يعدل أي ملف في البداية.**

```text
You are a Senior Full-Stack Architect, Security Engineer, UX Engineer, and Next.js Engineer.

I have an existing Next.js web application for a luxury Gouna platform.

The platform includes:

- Luxury villa/chalet rentals
- Real estate sales
- Yacht bookings
- Experiences and diving
- Events and ticketing
- VIP concierge services
- Customer CRM
- Investors
- Finance and payouts
- Staff management
- RBAC permissions
- Audit logs
- Platform settings
- Admin dashboard

IMPORTANT:

Do NOT start coding.
Do NOT redesign the application yet.
Do NOT create fake APIs.
Do NOT create mock backend data.
Do NOT replace existing components.
Do NOT change the existing architecture.

Your first task is to perform a complete technical audit of the existing project.

Analyze:

1. Next.js version
2. App Router structure
3. TypeScript configuration
4. Tailwind configuration
5. Existing UI architecture
6. Existing components
7. Existing layouts
8. Existing pages
9. Existing API clients
10. Existing backend integration
11. Authentication
12. Authorization
13. Session handling
14. Environment variables
15. API endpoints already implemented
16. Database-related code
17. State management
18. Forms
19. Validation
20. Error handling
21. Loading states
22. Empty states
23. Responsive behavior
24. Accessibility
25. Security weaknesses
26. Secrets exposure risks
27. XSS risks
28. CSRF risks where applicable
29. IDOR/BOLA risks
30. Broken authorization risks
31. Rate limiting requirements
32. Input validation
33. File upload risks
34. Payment-related risks
35. Admin privilege escalation risks
36. Audit logging gaps
37. Dependency risks
38. Production configuration problems

Then compare the existing project against the supplied Gouna platform specification.

Create a report with:

A. Existing Architecture
B. Existing Frontend Modules
C. Existing Backend Integration
D. Existing Authentication
E. Existing Authorization
F. Missing APIs
G. Missing UI
H. Security Risks
I. Architecture Problems
J. Duplicate Components
K. Components that should be reused
L. Components that should be redesigned
M. Components that should NOT be touched
N. Required Backend contracts
O. Recommended implementation order

For every finding classify it as:

CRITICAL
HIGH
MEDIUM
LOW

IMPORTANT:

Do not modify files during this stage.

At the end provide:

1. Current architecture map
2. Frontend → Backend dependency map
3. Module dependency map
4. Permission dependency map
5. Security risk map
6. Recommended implementation roadmap

Wait for approval before making code changes.
```

---

# المرحلة 1 — تثبيت الـ Architecture

بعد ما يخلص الـ Audit، استخدم:

```text
You are now acting as the Lead Software Architect.

Based on the previous audit, redesign the internal architecture of the existing Next.js project WITHOUT changing the visual design yet.

The objective is to create a clean, scalable, maintainable architecture.

The platform contains:

1. Dashboard
2. Bookings
3. Properties
4. Pricing Engine
5. Yachts & Experiences
6. Events & Ticketing
7. Staff / Roles / Permissions
8. VIP Concierge
9. Finance
10. Platform Settings / Security
11. Customers / Investors / CRM

ARCHITECTURE RULES:

- Do not duplicate business logic.
- Do not put business logic inside UI components.
- Do not call APIs directly from random components.
- Create a centralized API/data-access layer.
- Create centralized authentication handling.
- Create centralized authorization handling.
- Create centralized validation.
- Create centralized error handling.
- Create reusable table patterns.
- Create reusable modal patterns.
- Create reusable form patterns.
- Create reusable loading states.
- Create reusable empty states.
- Create reusable confirmation dialogs.
- Create reusable permission guards.
- Keep domain logic separated by module.
- Keep shared components separate from domain components.

Recommended conceptual structure:

app/
components/
features/
lib/
services/
hooks/
types/
schemas/
config/
providers/
middleware/

Do not blindly follow this structure if the existing project already has a better architecture.

Preserve good existing architecture.

For every architectural change explain:

- Why it is needed
- What problem it solves
- What files are affected
- What dependencies it creates
- Whether it affects backend integration

Do not introduce unnecessary libraries.

Do not rewrite the entire project.

Perform incremental refactoring only.

At the end provide the final architecture tree and dependency rules.
```

---

# المرحلة 2 — Backend Contract أولًا

دي المرحلة اللي هتمنع أكبر مشكلة عندك: **Frontend يتصمم على API وهمية وبعدها يطلع مش متوافق مع الـ Backend.**

الـ specification نفسه محدد APIs مثل dashboard وbookings وproperties وstaff وconcierge. 

```text
You are now acting as a Senior Backend Integration Architect.

Before modifying frontend UI, inspect the existing backend integration and establish a strict Frontend ↔ Backend contract.

IMPORTANT:

The frontend must never invent backend behavior.

Do not create fake API responses.

Do not silently assume database fields.

Do not assume an endpoint exists.

Do not change backend behavior from the frontend.

For every module define:

1. Endpoint
2. HTTP method
3. Authentication requirement
4. Required permission
5. Request body
6. Query parameters
7. Response structure
8. Pagination
9. Filtering
10. Sorting
11. Validation errors
12. Authorization errors
13. Not-found behavior
14. Server errors
15. Loading behavior
16. Empty-state behavior

Modules:

Dashboard
Bookings
Properties
Pricing
Yachts
Experiences
Events
Staff
Permissions
Concierge
Finance
Settings
Audit Logs
Customers
Investors

Create a typed API contract for every endpoint.

If an endpoint does not exist in the backend:

DO NOT fake it.

Mark it as:

BACKEND REQUIRED

For every frontend action identify its backend operation.

Example:

Approve Booking
→ PUT /api/v1/admin/bookings/{id}/status
→ permission: bookings.approve
→ body: { status: "confirmed" }

Property Update
→ PUT /api/v1/admin/properties/{id}
→ permission: properties.update

Staff Creation
→ POST /api/v1/admin/staff
→ permission: staff.create

Concierge Update
→ PUT /api/v1/admin/concierge/{id}
→ permission: concierge.update

Create a single source of truth for API contracts.

Do not duplicate endpoint definitions throughout the application.

At the end produce:

API Contract Matrix
Permission Matrix
Request/Response Type Matrix
Error Matrix
Frontend Action → Backend Endpoint Matrix
```

---

# المرحلة 3 — Authentication + RBAC Security

هنا بنقفل النظام من ناحية الصلاحيات.

المواصفات أصلًا بتطلب RBAC، granular permissions، 2FA، وإمكانية إنهاء الجلسات. 

```text
You are now acting as a Senior Application Security Engineer.

Implement and audit the authentication and authorization architecture.

The platform contains these roles:

SUPER_ADMIN
OPERATIONS_ADMIN
REAL_ESTATE_DIRECTOR
VIP_CONCIERGE_AGENT
and any additional roles already supported by the backend.

IMPORTANT SECURITY PRINCIPLE:

Frontend permissions are UX protection only.

The backend MUST remain the final authority.

Never rely on:

- hidden buttons
- disabled buttons
- route hiding
- frontend role checks alone

for actual security.

Implement:

1. Authentication state
2. Session validation
3. Token/session expiration handling
4. Protected routes
5. Role-based access
6. Permission-based access
7. Server-side authorization where applicable
8. Permission guards
9. Route guards
10. API authorization handling
11. 401 handling
12. 403 handling
13. Session expiration handling
14. Forced logout handling
15. Multi-session handling if supported
16. 2FA state handling
17. Secure logout

Create granular permissions such as:

bookings.view
bookings.create
bookings.update
bookings.cancel
bookings.refund
bookings.approve

properties.view
properties.create
properties.update
properties.delete
properties.publish

pricing.view
pricing.create
pricing.update
pricing.delete

finance.view
finance.refund
finance.payout
finance.export

staff.view
staff.create
staff.update
staff.delete
staff.force_logout

settings.view
settings.update

audit.view

concierge.view
concierge.assign
concierge.update
concierge.convert

customers.view
customers.update
customers.export

investors.view
investors.create
investors.update

IMPORTANT:

Never expose permissions that the authenticated user does not have.

Never trust role/permission values coming from client-side storage.

Never store sensitive authorization information in insecure client-controlled locations.

Do not expose secrets.

Do not expose internal API keys.

Do not expose payment secret keys.

Do not expose database credentials.

At the end perform an authorization audit and report possible:

- IDOR
- BOLA
- privilege escalation
- broken access control
- unauthorized API access
- session fixation
- insecure token handling
```

---

# المرحلة 4 — Security Hardening

هنا نحقق طلبك بتاع إن الموقع مايبقاش سهل يتلعب فيه.

**مهم:** مفيش موقع نقدر نضمن إنه "مستحيل الاختراق"، لكن نقدر نخليه مبني بأسلوب دفاعي قوي ونقلل المخاطر بشكل كبير.

```text
You are now acting as a defensive Web Application Security Engineer.

Harden the existing application against common web application vulnerabilities.

This is defensive security work only.

Do not create offensive exploitation tools.

Do not add attack payloads.

Do not create malware.

Do not create credential harvesting.

Do not create unauthorized access mechanisms.

Audit and harden the application against:

1. Broken Access Control
2. IDOR / BOLA
3. XSS
4. CSRF where applicable
5. SQL Injection through backend integration
6. Command Injection risks
7. SSRF risks
8. File Upload vulnerabilities
9. Path Traversal
10. Open Redirects
11. Authentication weaknesses
12. Session vulnerabilities
13. Privilege escalation
14. Rate-limit abuse
15. Brute-force attempts
16. Sensitive information disclosure
17. API enumeration
18. Excessive data exposure
19. Mass assignment
20. Unsafe redirects
21. Insecure CORS
22. Security header weaknesses
23. Dependency vulnerabilities
24. Debug information exposure
25. Production error leakage

Frontend requirements:

- Never expose secrets.
- Never trust client input.
- Validate forms.
- Sanitize where required.
- Handle API errors safely.
- Never display raw server exceptions to users.
- Do not expose stack traces.
- Do not expose database errors.
- Do not expose internal service information.

Backend requirements:

- Validate all input.
- Authorize every protected operation.
- Apply rate limiting.
- Apply proper request size limits.
- Validate file types and file sizes.
- Use secure storage for uploaded files.
- Use secure HTTP headers.
- Use secure cookie/session configuration where applicable.
- Log security-sensitive events.
- Avoid logging passwords, tokens, payment secrets, or sensitive personal data.

For every security improvement explain:

Threat
→ Risk
→ Mitigation
→ Implementation
→ Verification

Do not claim the system is "100% secure".

At the end generate a Security Hardening Checklist.
```

---

# المرحلة 5 — UI/UX بدون تكرار التصميم

دي مهمة جدًا لأنك قلت إنك **مش عايز التصميم يبقى متشابه**.

المقصود هنا مش إن كل Module يبقى له Design غريب؛ يبقى عندنا **Design System واحد** لكن كل Module له interaction pattern مناسب لطبيعته.

```text
You are now acting as a Senior Product Designer and UX Architect.

Redesign the admin dashboard UI while preserving the existing business requirements and backend contracts.

IMPORTANT:

Do NOT create repetitive pages.

Do NOT make every module look identical.

Do NOT use the same card layout everywhere.

Do NOT turn every screen into a generic CRUD table.

The application should have ONE coherent Design System but DIFFERENT UX patterns based on the job being performed.

Use:

- Shared typography
- Shared spacing system
- Shared navigation
- Shared buttons
- Shared form controls
- Shared status system
- Shared modal behavior
- Shared tables
- Shared visual language

But each module should have its own information architecture.

Examples:

Dashboard
→ command center
→ KPIs
→ live activity
→ critical alerts
→ charts

Bookings
→ operational workspace
→ filters
→ reservation table
→ calendar
→ timeline
→ booking drawer/modal

Properties
→ inventory management
→ gallery
→ map
→ availability calendar
→ property details

Pricing
→ rule builder
→ season timeline
→ pricing simulator

Yachts
→ fleet management
→ availability slots
→ schedule

Events
→ event management
→ ticket tiers
→ capacity
→ QR operations

Concierge
→ CRM/work queue
→ priorities
→ assignment
→ timeline
→ communication

Finance
→ financial command center
→ transactions
→ payouts
→ reconciliation

Staff
→ security administration
→ users
→ roles
→ permissions
→ sessions

Audit
→ security timeline
→ filters
→ event details

CRM
→ customer 360
→ history
→ preferences
→ communication

Every page must prioritize:

1. Clarity
2. Speed
3. Information hierarchy
4. Practical workflow
5. Error prevention
6. Responsive behavior
7. Accessibility

Avoid unnecessary animations.

Animations should communicate state changes, not decorate the interface.

Do not sacrifice usability for visual effects.
```

---

# المرحلة 6 — تحويل كل Module إلى Workflow عملي

بدل ما نخلي AI يعمل CRUD وخلاص.

```text
You are now acting as a Senior Product Engineer.

Convert every dashboard module from simple CRUD screens into complete operational workflows.

For every action define:

User Intent
→ UI Action
→ Validation
→ Permission Check
→ API Request
→ Backend Processing
→ Success State
→ Error State
→ Audit Event
→ UI Refresh

Implement this for:

Bookings
Properties
Pricing
Yachts
Events
Staff
Concierge
Finance
Customers
Investors
Settings

Example:

Booking Confirmation:

User clicks Confirm
↓
Check bookings.update/approve permission
↓
Validate booking state
↓
Confirm availability
↓
Send API request
↓
Backend processes transaction
↓
Booking becomes Confirmed
↓
Audit event recorded
↓
Notification generated
↓
UI updates
↓
Success message

If any step is not supported by the backend:

DO NOT simulate it.

Mark the missing backend capability.

Every destructive operation must require:

- explicit confirmation
- clear description
- affected resource
- permission verification
- proper API response handling

For financial actions:

Require additional confirmation where appropriate.

For irreversible actions:

Use stronger confirmation UX.

For high-risk actions:

Require appropriate elevated permission.

Never use optimistic UI for irreversible financial/security actions unless the backend contract explicitly supports it.
```

---

# المرحلة 7 — Error Handling + Loading + Empty States

دي هتمنع الموقع من شكل "بيطلع Error وخلاص".

```text
You are now acting as a Senior Frontend Reliability Engineer.

Implement a unified application state system.

Every asynchronous operation must support:

1. Loading
2. Success
3. Empty
4. Validation Error
5. Unauthorized
6. Forbidden
7. Not Found
8. Conflict
9. Rate Limited
10. Server Error
11. Network Error
12. Timeout

Create a consistent error-handling architecture.

Rules:

Never show raw API errors.

Never show stack traces.

Never expose database errors.

Never expose internal server paths.

Never expose secrets.

Never silently swallow errors.

Every error should provide:

- Human-readable message
- Appropriate action
- Retry where appropriate
- Support/reference ID where appropriate

Examples:

401
→ Session expired
→ Sign in again

403
→ You do not have permission to perform this action

404
→ Resource no longer exists

409
→ Resource changed or booking conflict occurred

422
→ Validation errors

429
→ Too many requests

500
→ Something went wrong
→ Try again later

Implement reusable:

ErrorBoundary
ApiErrorHandler
Toast system
Form error system
Loading skeletons
Empty states
Retry actions
Confirmation states

Make the UI resilient to slow APIs and temporary network failures.
```

---

# المرحلة 8 — Backend ↔ Frontend Integration Verification

دي مرحلة **ممنوع فيها الشكل فقط**؛ بنختبر إن كل زر فعلًا مربوط بالـ Backend.

```text
You are now acting as a Full-Stack Integration QA Engineer.

Audit every interactive feature in the admin dashboard.

For every button, form, filter, modal, table action, and workflow answer:

1. What does it do?
2. Which permission is required?
3. Which API endpoint does it call?
4. What request does it send?
5. What response does it expect?
6. What happens on success?
7. What happens on failure?
8. Is the operation audited?
9. Is the operation idempotent where required?
10. Is the UI synchronized with the backend state?

Create a matrix:

UI Element
→ Module
→ Action
→ Permission
→ Endpoint
→ HTTP Method
→ Request
→ Response
→ Error States
→ Audit Event

Search the entire project for:

- TODO
- FIXME
- mock data
- fake API
- hardcoded IDs
- hardcoded users
- hardcoded permissions
- fake success responses
- console.log
- temporary bypasses
- disabled security checks
- placeholder endpoints

Remove production-only fake behavior.

Do not remove intentional demo/example data without verifying its purpose.

If backend functionality is missing:

mark it as BACKEND REQUIRED.

Do not implement fake behavior to make the UI appear functional.
```

---

# المرحلة 9 — Security + Production Readiness Audit

```text
You are now acting as a Senior Production Security Auditor.

Perform a final pre-production audit of the entire application.

Check:

AUTHENTICATION
- session handling
- expiration
- logout
- forced logout
- 2FA
- password handling

AUTHORIZATION
- RBAC
- granular permissions
- server-side enforcement
- route protection
- API protection
- privilege escalation

DATA SECURITY
- secrets
- environment variables
- PII
- payment information
- logs
- API responses

APPLICATION SECURITY
- XSS
- CSRF where applicable
- IDOR/BOLA
- injection risks
- SSRF
- file uploads
- path traversal
- open redirects
- CORS
- security headers

API SECURITY
- validation
- rate limiting
- pagination
- maximum request size
- error handling
- authorization
- sensitive field exposure

BUSINESS LOGIC
- double booking
- race conditions
- duplicate payments
- duplicate refunds
- unauthorized discounts
- unauthorized financial changes
- unauthorized property publishing
- unauthorized staff creation

AUDITABILITY
- sensitive actions logged
- actor
- role
- action
- resource
- resource ID
- timestamp
- result
- appropriate request metadata

PRODUCTION
- debug disabled
- production error pages
- secure configuration
- dependency audit
- build verification
- environment validation

Do not claim "100% secure".

Instead produce:

Security Score
Critical Findings
High Findings
Medium Findings
Low Findings
Fixed Findings
Remaining Backend Findings
Remaining Infrastructure Findings
Production Blockers
Recommended Next Steps
```

---

# المرحلة 10 — Final UX + Architecture Quality Review

آخر Prompt قبل الـ Production:

```text
You are now acting as:

- Senior UX Designer
- Senior Frontend Engineer
- Senior Backend Integration Engineer
- Software Architect
- Security Engineer
- QA Engineer

Perform a final complete review.

The goal is NOT to add more features.

The goal is to ensure the existing system is:

- Practical
- Understandable
- Fast
- Secure
- Maintainable
- Scalable
- Consistent
- Backend-connected
- Production-ready

Review every module:

Dashboard
Bookings
Properties
Pricing
Yachts
Events
Staff
Concierge
Finance
Settings
Audit Logs
Customers
Investors

For every module evaluate:

1. UX quality
2. Information architecture
3. Backend integration
4. Permission enforcement
5. Error handling
6. Loading states
7. Empty states
8. Validation
9. Accessibility
10. Responsiveness
11. Security
12. Performance
13. Maintainability
14. Reusability
15. Visual consistency
16. Workflow efficiency

IMPORTANT:

Do not redesign the whole application unnecessarily.

Do not introduce visual changes just for the sake of change.

Only change something if it improves:

- usability
- clarity
- performance
- consistency
- security
- maintainability

At the end produce a Production Readiness Report:

READY
NOT READY
BLOCKED BY BACKEND
BLOCKED BY INFRASTRUCTURE
BLOCKED BY SECURITY
OPTIONAL IMPROVEMENTS
```

---

# الترتيب اللي أنصحك تمشي به

```text
PHASE 0
Audit Existing Project
        ↓
PHASE 1
Architecture
        ↓
PHASE 2
Backend Contracts
        ↓
PHASE 3
Authentication + RBAC
        ↓
PHASE 4
Security Hardening
        ↓
PHASE 5
UI/UX + Design System
        ↓
PHASE 6
Operational Workflows
        ↓
PHASE 7
Error / Loading / Empty States
        ↓
PHASE 8
Frontend ↔ Backend Verification
        ↓
PHASE 9
Security Audit
        ↓
PHASE 10
Production Readiness
```
