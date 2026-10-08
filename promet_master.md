GouNow Platform

Administration, RBAC, Permissions & Concierge

Full Production Implementation Prompt

You are working on the existing GouNow platform.

The platform contains:

- Laravel 12 backend
- Next.js 15 frontend
- Existing authentication
- Existing authorization/policies
- Existing admin dashboard
- Existing booking infrastructure
- Existing payment infrastructure
- Existing customer/guest system
- Existing owner/partner system
- Existing notification infrastructure
- Existing audit/security hardening
- Existing API conventions
- Existing design system

Your task is to implement and/or complete two major administrative domains:

1. Administration / Staff / Roles / Permissions / RBAC
2. Concierge Requests / Assignment / Quotes / Operations

This is a production implementation.

Do NOT build a fake CRUD dashboard.

Do NOT create a second authorization system.

Do NOT create a second booking/payment system.

Do NOT invent APIs without auditing the existing backend first.

---

GLOBAL RULES

Before writing code:

1. Audit the existing Laravel backend.
2. Audit the existing Next.js frontend.
3. Audit authentication.
4. Audit authorization.
5. Audit existing roles.
6. Audit existing permissions.
7. Audit policies.
8. Audit booking architecture.
9. Audit payment architecture.
10. Audit customer/guest architecture.
11. Audit partner/owner architecture.
12. Audit notification system.
13. Audit audit-log system.
14. Audit database schema.
15. Audit existing admin UI.

Reuse existing infrastructure whenever possible.

If a feature already exists, extend it.

Do not duplicate it.

---

PHASE 0 — ARCHITECTURE DISCOVERY

Before implementation, produce an internal architecture map.

Identify:

Authentication
Authorization
Roles
Permissions
Policies
Admin users
Staff users
Scopes
Teams
Bookings
Orders
Payments
Customers
Partners
Notifications
Audit Logs
Files / Media
Messaging

Determine which of these already exist.

For each existing subsystem answer internally:

Where is it?
How is it implemented?
Who owns the business logic?
Which APIs expose it?
Which frontend components consume it?
What should be reused?

Do not replace existing architecture merely because another implementation is easier.

---

PHASE 1 — ADMINISTRATION DOMAIN

The Administration section must provide controlled management of platform staff.

Conceptual structure:

Administration
├── Admins / Staff
├── Roles
├── Permissions
├── Access Policies
├── Activity Logs
└── Security

Only expose modules supported by the existing architecture.

---

PHASE 2 — ADMIN / STAFF MANAGEMENT

Create a complete Staff Management interface.

Admin users/staff should be manageable without exposing unnecessary security-sensitive information.

Each staff account may contain:

Name
Email
Phone
Avatar
Role
Scope
Status
Created At
Last Login

Use the actual user model and fields from the backend.

Do not duplicate users into a separate "admins" table if the existing authentication system already uses one user model.

---

STAFF STATUS

Support the existing account lifecycle.

Potential statuses:

Active
Suspended
Inactive
Pending

Do not introduce duplicate status systems.

Changing staff status must be authorized.

A suspended staff member must not be able to continue using protected admin APIs.

Backend must enforce this.

Frontend hiding the account is NOT security.

---

STAFF DETAIL PAGE

The staff detail page should contain:

Overview
Roles
Permissions
Scope
Activity
Security
Sessions

Only display sections actually supported by the backend.

---

STAFF ACTIONS

Depending on permissions, administrators may:

Create Staff
Update Staff
Assign Role
Change Scope
Suspend Staff
Reactivate Staff
Force Logout
View Activity

Potentially:

Reset MFA
Reset Recovery

ONLY if supported by the existing security architecture and only for highly authorized administrators.

Never expose passwords.

Never display password hashes.

Never display MFA secrets.

Never display recovery secrets.

---

PHASE 3 — ROLES

Roles represent collections of permissions.

Examples:

Super Admin
Operations Manager
Property Manager
Yacht Manager
Experience Manager
Event Manager
Concierge Manager
Finance Manager
Support Agent
Content Manager

These are examples only.

Inspect the current business requirements and existing database before creating roles.

---

ROLE MANAGEMENT

Admin should be able to:

View Roles
Create Role
Update Role
Assign Permissions
Assign Scope
View Assigned Staff
Deactivate Role

Do not allow deletion of a role that is still assigned to active users unless the system has a safe reassignment workflow.

Protect system-critical roles.

---

PHASE 4 — PERMISSIONS

Permissions must be granular.

Example permission groups:

properties.view
properties.create
properties.update
properties.delete
properties.manage_availability
properties.manage_pricing

yachts.view
yachts.create
yachts.update
yachts.delete
yachts.manage_availability
yachts.manage_pricing

experiences.view
experiences.create
experiences.update
experiences.manage_schedule
experiences.manage_pricing

events.view
events.create
events.update
events.delete
events.manage_tickets
events.manage_checkin

bookings.view
bookings.update
bookings.cancel
bookings.refund

payments.view
payments.refund
payments.payouts

concierge.view
concierge.create
concierge.assign
concierge.update
concierge.quote
concierge.close
concierge.escalate

admins.view
admins.create
admins.update
admins.suspend

roles.view
roles.create
roles.update
roles.delete

permissions.view
audit.view
security.manage

Do not blindly create all of these.

Use only permissions required by the actual system.

Follow existing permission naming conventions.

---

PHASE 5 — RBAC + SCOPE + STATE

Authorization must not depend only on:

User has permission

Use the existing authorization architecture to enforce:

Role
+
Permission
+
Scope
+
Resource
+
Resource State

Example:

A Property Manager may have:

properties.update

but only for:

Properties assigned to that manager

A Finance Manager may:

payments.view
payments.refund

but must not automatically receive:

admins.manage
properties.update

A Concierge Agent may:

concierge.view
concierge.update

but not:

roles.update
permissions.update

Backend policies are authoritative.

---

PHASE 6 — SUPER ADMIN PROTECTION

Super Admin is the highest privilege level.

Protect it heavily.

Do not allow normal administrators to:

- assign themselves Super Admin
- grant themselves permissions
- modify Super Admin privileges
- remove the final Super Admin
- bypass authorization
- modify security-critical settings

Any operation affecting:

- roles
- permissions
- Super Admin
- security
- refunds
- financial settings

must have appropriate authorization.

---

PHASE 7 — PERMISSION MATRIX

Create an operational permission matrix.

Example:

                 View  Create  Update  Delete  Manage
Properties        ✓      ✓       ✓       -       ✓
Yachts            ✓      ✓       ✓       -       ✓
Experiences       ✓      ✓       ✓       -       ✓
Events            ✓      ✓       ✓       -       ✓
Bookings          ✓      -       ✓       -       ✓
Payments          ✓      -       -       -       ✓
Concierge         ✓      ✓       ✓       -       ✓
Admins            ✓      ✓       ✓       -       ✓
Roles             ✓      ✓       ✓       -       ✓
Audit             ✓      -       -       -       -

This matrix is conceptual.

Generate the real matrix from the actual project.

---

PHASE 8 — PERMISSION-AWARE FRONTEND

The frontend must not display actions the current user cannot perform.

For example:

If the user cannot:

concierge.assign

hide/disable:

Assign Request

If the user cannot:

payments.refund

do not show:

Refund

However:

IMPORTANT:

Frontend permission checks are UX only.

Every action MUST also be authorized by the Laravel backend.

Never rely on frontend permission checks for security.

---

PHASE 9 — ADMIN SIDEBAR

Build permission-aware navigation.

Conceptually:

Dashboard

BOOKINGS
├── All Bookings
├── Accommodation
├── Yachts
├── Experiences
└── Events

MARKETPLACE
├── Properties
├── Yachts
├── Experiences
└── Events

CONCIERGE
├── All Requests
├── New
├── Assigned
├── In Progress
├── Quotes
└── Completed

CUSTOMERS
├── Guests
└── Partners

PAYMENTS
├── Transactions
├── Refunds
└── Payouts

ADMINISTRATION
├── Staff
├── Roles
├── Permissions
├── Activity
└── Security

REPORTS

SETTINGS

The actual sidebar must follow the existing frontend navigation architecture.

Do not duplicate routes.

Do not show unauthorized sections.

---

PHASE 10 — ADMIN ACTIVITY / AUDIT

Implement or integrate with the existing audit system.

Important administrative actions must be logged.

Examples:

Staff Created
Staff Suspended
Role Assigned
Role Changed
Permission Changed
Scope Changed
Refund Approved
Booking Cancelled
Pricing Changed
Availability Blocked
Concierge Assigned
Concierge Status Changed
Quote Created
Quote Approved
Concierge Escalated

Each audit record should contain, where supported:

Actor
Action
Resource Type
Resource ID
Timestamp
Request ID
Relevant Metadata

Do not log:

- passwords
- MFA secrets
- recovery secrets
- access tokens
- full payment credentials
- unnecessary PII

---

PHASE 11 — ADMIN ACTIVITY UI

Create an Activity page that supports:

Search
Actor filter
Action filter
Resource filter
Date range

Example:

08 Oct 2026
Ahmed Hassan

Changed Yacht Pricing

Yacht:
Yacht #204

Before:
15,000 EGP

After:
17,500 EGP

Sensitive values must be redacted.

---

PHASE 12 — SECURITY SECTION

If the current platform supports security administration, expose appropriate operational controls.

Potential features:

Active Sessions
Force Logout
Security Events
MFA Status
Recent Login Activity
Suspicious Activity

Do not expose secrets.

Do not allow low-privilege admins to manipulate security controls.

---

PHASE 13 — CONCIERGE DOMAIN

The Concierge system represents customer requests requiring human operational assistance.

Examples:

Book a Yacht
Restaurant Reservation
Airport Transfer
Private Chef
Birthday Setup
Wedding Arrangement
Car Rental
Photography
Tour
Event Planning
Special Request

Concierge is NOT merely customer support.

It is an operational workflow.

---

PHASE 14 — CONCIERGE REQUEST

A Concierge Request should contain, depending on the actual business model:

Request ID
Customer
Request Type
Description
Date
Preferred Time
Location
Number of Guests
Budget
Priority
Status
Assigned Staff
Attachments
Created At
Updated At

Do not add unnecessary fields.

---

PHASE 15 — REQUEST TYPES

Request types should be data-driven where appropriate.

Examples:

Yacht
Experience
Event
Accommodation
Transportation
Restaurant
Dining
Celebration
Photography
Other

Do not hardcode these throughout the frontend.

---

PHASE 16 — CONCIERGE STATUS MACHINE

Use explicit state transitions.

Recommended conceptual lifecycle:

New
 ↓
Assigned
 ↓
In Progress
 ↓
Waiting for Customer
 ↓
Waiting for Partner
 ↓
Quoted
 ↓
Confirmed
 ↓
Completed

Exceptional states:

Cancelled
Rejected
Escalated

Do not allow arbitrary status mutation.

For example:

A request should not move directly from:

New → Completed

unless the backend explicitly permits it.

Use a service/state-machine approach if the existing architecture already uses one.

---

PHASE 17 — CONCIERGE PRIORITY

Support:

Low
Normal
High
Urgent

Priority changes must be audited.

Urgent requests should be visible in the dashboard.

---

PHASE 18 — CONCIERGE ASSIGNMENT

A manager should be able to assign requests to authorized staff.

Assignment must respect:

- staff permissions
- staff status
- staff scope
- workload rules if supported

Do not assign requests to suspended/inactive staff.

When reassigned:

Record:

Previous Agent
New Agent
Changed By
Timestamp
Reason

if the business requires a reason.

---

PHASE 19 — CONCIERGE QUEUE

Create operational views:

All
New
Unassigned
Assigned
My Requests
In Progress
Waiting Customer
Waiting Partner
Quoted
Confirmed
Completed
Cancelled
Escalated

Each queue should be filterable.

---

PHASE 20 — CONCIERGE DASHBOARD

Dashboard should show:

New Requests
Urgent Requests
Unassigned
In Progress
Waiting Customer
Waiting Partner
Pending Quotes
Completed Today

Operational metrics:

Average Response Time
Average Resolution Time
Requests by Type
Requests by Agent
Conversion to Booking

Only implement metrics that can be calculated reliably from actual data.

Do not invent fake analytics.

---

PHASE 21 — CONCIERGE REQUEST DETAIL

The request detail page should contain:

Overview
Customer
Request Details
Assignment
Quote
Related Booking
Conversation
Internal Notes
Attachments
Activity

Example:

Request #CN-10482

Customer:
Mohamed Ahmed

Request:
Birthday Yacht Setup

Date:
20 October

Guests:
8

Budget:
25,000 EGP

Location:
El Gouna

Status:
In Progress

Assigned To:
Ahmed

---

PHASE 22 — CUSTOMER COMMUNICATION

If the existing platform has messaging/communication infrastructure:

Integrate with it.

Do NOT create another messaging system.

The admin should be able to distinguish:

Customer-visible messages

from:

Internal notes

Example:

Customer message:

I want to add a photographer.

Internal note:

Waiting for photographer confirmation.

Internal notes MUST NEVER be exposed to the customer.

---

PHASE 23 — CONCIERGE QUOTES

A Concierge Request may require a custom quote.

Quote structure:

Quote
├── Items
├── Subtotal
├── Discount
├── Fees
├── Total
├── Currency
├── Valid Until
└── Status

Example:

Yacht                   18,000
BBQ                      2,500
Photography              3,000
Birthday Decoration      1,500
--------------------------------
Subtotal                25,000
Discount                -2,000
--------------------------------
Total                   23,000 EGP

The backend must calculate the authoritative total.

Never trust a total submitted by the frontend.

---

PHASE 24 — QUOTE ITEMS

Quote items should reference real products/services where possible.

Examples:

Yacht
Package
Experience
Add-on
Transportation
Custom Service

Avoid arbitrary free-text financial items unless the business model requires them.

---

PHASE 25 — QUOTE LIFECYCLE

Possible lifecycle:

Draft
Sent
Viewed
Accepted
Rejected
Expired
Cancelled

Use the existing project conventions.

Do not allow unauthorized quote manipulation.

---

PHASE 26 — QUOTE APPROVAL

When customer accepts a quote:

The system should:

1. Verify quote is still valid.
2. Revalidate availability.
3. Recalculate authoritative pricing if necessary.
4. Create the appropriate booking/order.
5. Preserve the relationship with the Concierge Request.
6. Start the appropriate payment workflow.
7. Record the transition.
8. Prevent duplicate conversion.

Do NOT simply mark:

quote.status = accepted

and assume the booking exists.

---

PHASE 27 — CONCIERGE → BOOKING

Concierge must integrate with the existing booking engine.

Correct conceptual flow:

Concierge Request
        ↓
Research / Operations
        ↓
Quote
        ↓
Customer Approval
        ↓
Availability Revalidation
        ↓
Existing Booking / Order
        ↓
Payment
        ↓
Service
        ↓
Completed

Do NOT create:

ConciergeBooking
ConciergePayment
ConciergeInventory

if the existing booking/payment/inventory infrastructure can handle the request.

Concierge is an orchestration layer.

---

PHASE 28 — CONCIERGE + YACHTS

Example:

Customer asks:

Yacht for 10 people
Friday
6 PM
BBQ
Photography

The Concierge system should be able to:

1. Find suitable yachts.
2. Check availability.
3. Calculate pricing.
4. Add packages.
5. Add add-ons.
6. Create quote.
7. Send quote.
8. Receive approval.
9. Revalidate availability.
10. Create yacht booking.
11. Start payment.
12. Track completion.

Do not bypass existing yacht business rules.

---

PHASE 29 — CONCIERGE + EXPERIENCES

Same principle.

Concierge can create a custom request for an experience.

The system should use:

Experience
Schedule
Capacity
Pricing
Packages
Add-ons
Booking
Payment

from the existing domain.

---

PHASE 30 — CONCIERGE + EVENTS

Concierge may assist with:

- event tickets
- VIP arrangements
- private tables
- transportation
- decoration
- photography
- event planning

If a request becomes a normal event order:

Convert it into the existing event order flow.

Do not create a second event ticketing system.

---

PHASE 31 — ATTACHMENTS

If customers can attach:

- photos
- documents
- references
- event inspiration

use the existing secure file/media infrastructure.

Apply:

- authorization
- file type validation
- size limits
- safe storage
- access control
- retention rules where required

Do not expose private files through public URLs unless explicitly intended.

---

PHASE 32 — DATABASE

Before adding tables:

Audit existing schema.

Potential conceptual entities:

Staff/User
Role
Permission
RolePermission
UserRole
Scope
AuditLog
ConciergeRequest
ConciergeAssignment
ConciergeQuote
ConciergeQuoteItem
ConciergeNote

These are conceptual.

Use the existing architecture.

Do not create duplicate role/permission tables if they already exist.

Do not create a duplicate audit system.

---

PHASE 33 — DATABASE CONSTRAINTS

Use:

- foreign keys
- indexes
- unique constraints
- appropriate nullable rules
- timestamps
- transactional operations

Important indexes should cover:

Concierge status
Assigned staff
Customer
Priority
Created date
Request type
Quote status

Exact indexes must follow real query patterns.

---

PHASE 34 — CONCURRENCY

Protect:

Assignment

Two managers must not incorrectly assign the same request simultaneously.

Quote acceptance

A quote must not create duplicate bookings when accepted twice.

Availability

Revalidate availability before creating the final booking.

Financial totals

Recalculate totals server-side.

Use transactions where needed.

Use idempotency where the existing architecture supports it.

---

PHASE 35 — SECURITY TESTING

Test:

Unauthorized staff access
Privilege escalation
Self-permission escalation
Self-role escalation
IDOR
Cross-scope access
Suspended staff access
Role deletion with assigned users
Permission bypass
Audit manipulation
Quote price tampering
Quote acceptance replay
Duplicate booking conversion
Internal note leakage
Private attachment leakage

These tests are mandatory for a production-grade implementation.

---

PHASE 36 — RBAC TEST MATRIX

Create tests for combinations such as:

Super Admin
Operations Manager
Property Manager
Yacht Manager
Experience Manager
Event Manager
Concierge Manager
Concierge Agent
Finance Manager
Support Agent

Verify that each can only perform authorized actions.

Do not rely only on role names.

Test actual permissions and policies.

---

PHASE 37 — FRONTEND ADMIN UX

Use the existing GouNow design system.

Do not redesign the entire dashboard.

Reuse:

- tables
- filters
- forms
- cards
- badges
- dialogs
- drawers
- buttons
- pagination
- notifications
- calendars

Do not create duplicated UI components.

---

PHASE 38 — STAFF TABLE

Staff list should provide:

Name
Role
Scope
Status
Last Login
Created At
Actions

Filters:

Role
Status
Scope
Search

---

PHASE 39 — ROLE UI

Role detail:

Role Name
Description
Status

Permissions
├── Properties
├── Yachts
├── Experiences
├── Events
├── Bookings
├── Payments
├── Concierge
├── Customers
└── Administration

Use grouped permission selection.

Avoid a massive unorganized checkbox wall.

---

PHASE 40 — CONCIERGE TABLE

Columns:

Request ID
Customer
Type
Priority
Status
Assigned To
Date
Created
Actions

Filters:

Status
Priority
Type
Assigned Agent
Date

Support search.

Support pagination.

---

PHASE 41 — REQUEST DETAIL UX

Make the request page operational.

The admin should be able to understand the request without navigating through five unrelated pages.

Show:

Customer
Request
Assignment
Current Status
Timeline
Quote
Related Booking
Communication
Internal Notes

---

PHASE 42 — RESPONSIVE UX

Everything must
Everything must work on:
desktop
laptop
tablet
mobile
On mobile:
Use:
cards
drawers
bottom sheets
responsive forms
horizontal table scrolling when unavoidable
Do not simply shrink desktop layouts.
PHASE 43 — ERROR HANDLING
Handle existing API errors consistently.
At minimum:
401
403
404
409
422
429
500
Use the existing API envelope.
Never show:
SQL errors
stack traces
internal file paths
raw exception messages
secrets
PHASE 44 — LOADING / EMPTY / ERROR
Every admin screen needs:
Loading state
Skeleton or appropriate loading UI.
Empty state
Example:
No concierge requests found.
Error state
Human-readable error.
Retry
Where appropriate.
PHASE 45 — API INTEGRATION
Do not use fake data in production UI.
Do not hardcode:
Admins
Roles
Permissions
Requests
Quotes
Bookings
The frontend must consume the real Laravel APIs.
Follow existing:
authentication
CSRF/session/token conventions
API resources
pagination
validation
error envelopes
request IDs
PHASE 46 — API DESIGN
First inspect existing routes.
Only add routes that are actually necessary.
Conceptually:
GET    /admin/staff
POST   /admin/staff
GET    /admin/staff/{id}
PATCH  /admin/staff/{id}
POST   /admin/staff/{id}/suspend

GET    /admin/roles
POST   /admin/roles
GET    /admin/roles/{id}
PATCH  /admin/roles/{id}

GET    /admin/permissions

GET    /admin/audit

GET    /admin/concierge
POST   /admin/concierge
GET    /admin/concierge/{id}
PATCH  /admin/concierge/{id}

POST   /admin/concierge/{id}/assign
POST   /admin/concierge/{id}/quote
POST   /admin/concierge/{id}/status
POST   /admin/concierge/{id}/escalate
These are conceptual examples only.
Do not create them blindly.
Follow the actual API architecture.
PHASE 47 — SERVICE LAYER
Business-critical logic must not live entirely inside controllers.
Use appropriate services such as:
StaffManagementService
RoleManagementService
PermissionService
ConciergeService
ConciergeAssignmentService
ConciergeQuoteService
ConciergeConversionService
Only create services that fit the existing architecture.
Do not create meaningless abstraction layers.
PHASE 48 — VALIDATION
Use backend request validation.
Validate:
staff information
roles
permissions
assignments
request status
quote items
quote expiration
discounts
amounts
attachments
IDs
scope
Never trust frontend validation.
PHASE 49 — AUDIT INTEGRATION
All sensitive administrative actions must pass through the existing audit infrastructure.
Especially:
Role Changes
Permission Changes
Staff Suspension
Staff Activation
Refunds
Quote Approval
Quote Modification
Concierge Assignment
Concierge Escalation
Booking Conversion
Do not implement ad-hoc logging in random controllers.
PHASE 50 — PERFORMANCE
Avoid:
N+1 queries
loading all staff at once
loading all permissions repeatedly
loading all concierge requests into browser
unnecessary API calls
Use:
pagination
eager loading
indexes
query optimization
existing cache mechanisms where appropriate
Do not introduce unnecessary infrastructure.
Do NOT add:
Kubernetes
Kafka
RabbitMQ
microservices
unless the existing project clearly requires them.
PHASE 51 — TESTING
Backend tests must cover:
Administration
create staff
update staff
suspend staff
reactivate staff
role assignment
permission assignment
scope enforcement
authorization
privilege escalation prevention
Super Admin protection
Concierge
create request
update request
assignment
reassignment
status transitions
priority
quote creation
quote modification
quote expiry
quote acceptance
booking conversion
duplicate conversion prevention
authorization
cross-scope access
PHASE 52 — SECURITY TESTS
Explicitly test:
User A cannot access User B's staff record without permission.

Concierge Agent cannot modify Roles.

Concierge Agent cannot modify Permissions.

Property Manager cannot modify financial settings.

Finance Manager cannot assign Super Admin.

Normal Admin cannot grant himself a permission.

Suspended Admin cannot access protected admin APIs.

Staff cannot access requests outside their allowed scope.

Internal concierge notes cannot be returned to customers.

Private attachments cannot be accessed by unauthorized users.

Quote total cannot be manipulated from frontend.

Quote acceptance cannot be replayed.

A Concierge request cannot create duplicate bookings.
PHASE 53 — FRONTEND TESTING
Test:
Permission-aware sidebar
Permission-aware buttons
Staff forms
Role forms
Permission matrix
Concierge filters
Assignment
Status changes
Quote creation
Quote editing
Error handling
Loading states
Empty states
Mobile layouts
PHASE 54 — FINAL INTEGRATION TEST
Test a complete Concierge scenario:
Customer creates Concierge Request
        ↓
Request appears in Admin
        ↓
Manager assigns Agent
        ↓
Agent opens request
        ↓
Agent investigates availability
        ↓
Agent creates Quote
        ↓
Customer accepts
        ↓
Backend revalidates availability
        ↓
Existing Booking/Order is created
        ↓
Payment flow starts
        ↓
Request becomes Confirmed
        ↓
Service is completed
        ↓
Concierge becomes Completed
Verify every step.
PHASE 55 — NO FAKE BUSINESS LOGIC
Absolutely do not implement fake logic such as:
if user.role === "admin"
throughout the frontend.
Do not hardcode:
role === "super_admin"
as the only security mechanism.
Use the existing backend authorization system.
Do not hardcode financial totals.
Do not hardcode availability.
Do not hardcode booking states.
Do not hardcode ticket inventory.
PHASE 56 — NO DUPLICATE SYSTEMS
Before creating any of the following:
Role
Permission
Audit
Booking
Payment
Notification
Messaging
Customer
Partner
Media
Location
search the existing project.
If it already exists:
EXTEND IT.
Do not create:
NewRoleSystem
NewPermissionSystem
NewBookingSystem
NewPaymentSystem
NewAuditSystem
PHASE 57 — MIGRATION SAFETY
Before migrations:
Inspect existing database.
Identify existing tables.
Identify foreign keys.
Identify existing production assumptions.
Check SQLite development compatibility.
Check PostgreSQL compatibility.
Add indexes deliberately.
Avoid destructive migrations unless explicitly required.
Do not delete production data.
Do not rename existing tables casually.
Do not change existing booking/payment behavior without impact analysis.
PHASE 58 — BACKWARD COMPATIBILITY
Existing functionality must continue working.
After implementation verify:
Authentication
Authorization
Bookings
Payments
Properties
Yachts
Experiences
Events
Customers
Partners
Notifications
Audit
Do not consider the feature complete if existing tests fail.
PHASE 59 — FINAL SECURITY AUDIT
Before completion inspect for:
IDOR
Privilege Escalation
Mass Assignment
Missing Policy
Broken Access Control
Sensitive Data Exposure
PII Leakage
Audit Bypass
File Upload Vulnerabilities
Quote Tampering
Booking Duplication
Race Conditions
Session Abuse
CSRF issues
Rate Limit gaps
Fix issues before declaring completion.
PHASE 60 — FINAL CODE QUALITY AUDIT
Check:
PHPStan
Laravel tests
Pint
Frontend type checking
ESLint
Frontend tests
Build
Database migrations
API tests
Security tests
Use the project's actual commands.
Do not invent commands that do not exist.
PHASE 61 — FINAL ACCEPTANCE CRITERIA
The implementation is complete only when:
Administration
Staff management works.
Roles work.
Permissions work.
Scope works.
Policies work.
Permission-aware UI works.
Super Admin is protected.
Audit works.
Security controls respect authorization.
Existing authentication remains intact.
Concierge
Requests work.
Assignment works.
Status lifecycle works.
Priority works.
Quotes work.
Quote totals are backend-authoritative.
Customer approval works.
Availability is revalidated.
Existing booking/order is created correctly.
Payment integration works through existing infrastructure.
Internal notes remain private.
Attachments are secure.
Audit works.
Permissions work.
PHASE 62 — FINAL REPORT
When implementation is finished, provide a clear report containing:
1. Architecture Audit
What already existed?
What was reused?
What was extended?
2. Database
Tables created:
Tables modified:
Indexes:
Constraints:
3. Backend
Models:
Services:
Policies:
Requests:
Controllers:
Routes:
Resources:
4. Frontend
Pages:
Components:
Hooks:
API clients:
Permission guards:
5. RBAC
Roles:
Permissions:
Scopes:
Policy changes:
6. Concierge
Request lifecycle:
Assignment:
Quotes:
Booking conversion:
Payment integration:
7. Security
Security controls added:
Security issues found:
Security issues fixed:
8. Testing
Tests added:
Existing tests:
Failures:
9. Known Limitations
Clearly list anything that remains unfinished.
10. Approval Required
Clearly list any architectural decision that requires human approval.
FINAL PRINCIPLE
The goal is NOT:
Admin CRUD
The goal is:
REAL OPERATIONS PLATFORM
Administration must answer:
Who can do this?
What are they allowed to access?
What resources can they modify?
What happened?
Who did it?
When?
What changed?
Concierge must answer:
What does the customer want?
Who is handling it?
What is the current status?
What options are available?
What is the quote?
Did the customer approve?
Was availability revalidated?
Was a real booking created?
Was payment completed?
Was the service completed?
The architecture should therefore be:
                    ┌─────────────────────┐
                    │      ADMIN USER     │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Authentication      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Role + Permission   │
                    │ + Scope + Policy    │
                    └──────────┬──────────┘
                               │
                ┌──────────────┴──────────────┐
                ▼                             ▼
        ┌───────────────┐             ┌───────────────┐
        │ Administration│             │   Concierge   │
        └───────┬───────┘             └───────┬───────┘
                │                             │
        Staff / Roles /                  Requests /
        Permissions                      Assignment
        Audit / Security                 Quotes
                                        │
                                        ▼
                               Availability Recheck
                                        │
                                        ▼
                               Existing Booking /
                                   Order System
                                        │
                                        ▼
                                  Payment System
                                        │
                                        ▼
                                    Completion
The Laravel backend is the final authority for:
authentication
authorization
permissions
scopes
state transitions
pricing
availability
booking creation
payment state
quote acceptance
audit records
The Next.js frontend is an operational interface, not the source of truth.
Never declare completion based only on the UI looking correct.
The implementation is complete only when the complete workflow works end-to-end and the existing project test suite remains healthy