GouNow Platform

Admin Dashboard — Yachts, Experiences & Events

Full Production Implementation Prompt

You are working on the GouNow platform.

The platform consists of:

- Laravel 12 backend
- Next.js 15 frontend
- PostgreSQL production target
- Existing authentication and authorization system
- Existing booking infrastructure
- Existing payment infrastructure
- Existing admin dashboard
- Existing design system
- Existing API conventions
- Existing security and hardening work

Your task is to implement and integrate the complete Admin Management system for:

1. Yachts
2. Experiences
3. Events
4. Parties / Occasions
5. Venues
6. Packages
7. Add-ons
8. Schedules
9. Availability
10. Pricing
11. Tickets
12. Event Orders
13. Event Check-in

The implementation must be production-oriented.

---

PHASE 0 — NON-NEGOTIABLE RULES

Before changing anything:

0.1 Audit the existing project

Inspect:

- Laravel backend
- Next.js frontend
- database schema
- migrations
- models
- controllers
- services
- repositories if present
- policies
- permissions
- routes
- API resources
- request validation
- authentication
- admin roles
- existing booking system
- payment system
- notification system
- media/file handling
- location handling
- pricing logic
- availability logic
- existing UI components
- tables
- forms
- modals
- drawers
- calendars
- filters
- pagination
- loading states
- error handling
- empty states
- existing tests

Do NOT immediately start creating files.

First understand the architecture.

---

PHASE 1 — ARCHITECTURE AUDIT

Determine whether the existing backend already contains:

- products
- services
- inventory
- bookings
- orders
- payments
- customers/guests
- owners/partners
- locations
- media
- pricing
- availability
- categories
- statuses
- schedules

Reuse existing abstractions where they are appropriate.

Do NOT create duplicate systems.

For example:

If the backend already has:

"Booking"

do not create:

"YachtBookingEngine"

"ExperienceBookingEngine"

"EventBookingEngine"

unless the existing architecture genuinely requires separate domain services.

Instead:

Use the shared booking infrastructure and introduce domain-specific rules where necessary.

---

PHASE 2 — DOMAIN MODEL

Use the following conceptual model.

Marketplace

The marketplace contains:

Properties

Accommodation inventory.

Yachts

Bookable yacht products.

Experiences

Bookable activities/services.

---

Events

Events are scheduled experiences with:

- date
- time
- venue
- capacity
- ticketing
- attendees/orders

A party or occasion should normally be represented as an Event category/type.

Do NOT create a completely separate Party system unless the existing business requirements require it.

Example:

Event
 ├── Music Event
 ├── Party
 ├── Wedding
 ├── Birthday
 ├── Corporate Event
 ├── Festival
 └── Other

---

PHASE 3 — YACHT MANAGEMENT

Create a complete admin management system for yachts.

The admin must be able to control the complete lifecycle of a yacht.

Yacht basic information

Support fields where compatible with the existing schema:

- name
- description
- yacht type
- category
- brand
- model
- year
- length
- capacity
- crew capacity
- bedrooms
- bathrooms
- owner/partner
- status

Possible statuses:

Draft
Pending Approval
Active
Suspended
Maintenance
Inactive
Archived

Do not introduce statuses that conflict with the existing backend.

---

YACHT MEDIA

Admin must be able to manage:

- cover image
- gallery
- videos
- optional virtual tour
- image ordering
- primary image
- media deletion
- media replacement

Reuse the existing media system if available.

Do not build a second media infrastructure.

---

YACHT LOCATION

Location management must be user-friendly.

The admin should NOT be required to manually type latitude and longitude.

Provide:

Location

[ Search location / paste Google Maps link ]

[ Use Current Location ]

[ Pick Location on Map ]

After selection show:

Address
City
Area
Latitude
Longitude
Map Preview

Support:

- GPS/current location
- map selection
- Google Maps URL
- searchable location
- draggable map marker if supported

The backend must store normalized coordinates.

Validate:

latitude >= -90
latitude <= 90

longitude >= -180
longitude <= 180

Google Maps links should be treated as input/reference.

Do not rely only on the Google Maps URL.

If the URL contains coordinates, extract them when possible.

If extraction fails:

Ask the admin to choose the location on the map.

Never save invalid coordinates.

Do not expose secret API keys to the frontend.

---

YACHT AVAILABILITY

Admin must be able to manage yacht availability.

Support, where applicable:

- available
- booked
- blocked
- maintenance
- unavailable

Provide:

Calendar view

Admin should be able to see:

Date
Time
Booking
Status
Availability

Admin should be able to block availability.

Example:

01 Oct
09:00 - 18:00
Blocked
Maintenance

Do not allow manual availability changes to silently conflict with confirmed bookings.

Backend must remain authoritative.

---

YACHT PRICING

Support pricing according to the existing business model.

Possible pricing:

- hourly
- half-day
- full-day
- per trip
- per person
- private booking

Do not implement every pricing model blindly.

Use only models supported by the actual business/domain.

Support where applicable:

- base price
- weekend price
- holiday price
- seasonal price
- extra hour
- extra guest
- private booking
- minimum duration
- cancellation rules
- deposit
- discounts

Every calculated price must be explainable.

Example:

Base Price
+ Weekend Adjustment
+ Extra Hours
+ Add-ons
- Discount
= Final Price

The frontend must NOT calculate the final authoritative price.

The backend must calculate and return it.

---

YACHT PACKAGES

Allow admins to create packages.

Example:

Sunset Cruise

Duration:
2 Hours

Capacity:
10 Guests

Includes:
- Captain
- Soft Drinks
- Music

Price:
X

Status:
Active

Package fields may include:

- name
- description
- duration
- capacity
- price
- inclusions
- exclusions
- status
- availability

---

YACHT ADD-ONS

Allow optional yacht add-ons.

Examples:

- BBQ
- food
- birthday decoration
- photography
- DJ
- extra hour
- water sports
- transportation
- catering

Each add-on should support:

- name
- description
- price
- pricing model
- availability
- status

Do not hardcode add-ons into the frontend.

---

YACHT RULES

Admin must be able to configure business rules where supported:

- maximum guests
- minimum booking duration
- advance booking requirement
- cancellation policy
- child policy
- pet policy
- allowed activities
- pickup rules
- boarding instructions
- safety requirements

---

YACHT BOOKINGS

Yacht bookings must connect to the central booking system.

Admin should see:

Booking ID
Customer
Yacht
Package
Date
Start Time
Duration
Guests
Add-ons
Total Amount
Payment Status
Booking Status

Actions must be permission-aware:

- view
- confirm
- cancel
- reschedule
- refund
- update
- contact customer

Do not bypass backend booking rules.

---

PHASE 4 — EXPERIENCES

Implement complete Experience management.

An Experience represents a bookable activity.

Examples:

- desert safari
- diving
- snorkeling
- city tour
- private dinner
- horse riding
- photography experience
- cultural activity

---

EXPERIENCE BASIC INFORMATION

Support:

- name
- description
- category
- provider
- owner/partner
- duration
- capacity
- age requirements
- difficulty
- status

Possible statuses:

Draft
Pending Approval
Active
Suspended
Archived

Reuse existing status conventions if available.

---

EXPERIENCE MEDIA

Support:

- cover image
- gallery
- videos
- ordering
- primary image

Reuse existing media infrastructure.

---

EXPERIENCE LOCATION

Use the same production location component as Yachts.

Support:

Search
Paste Google Maps link
Use Current Location
Pick on Map

Store:

- latitude
- longitude
- address
- city
- area
- optional map URL

Show a map preview.

---

EXPERIENCE SCHEDULE

Experience scheduling must support the business model.

Possible scheduling models:

Daily

Every day
10:00
14:00
18:00

Weekly

Saturday
Sunday
Monday

Specific dates

10 Oct
15 Oct
22 Oct

Custom schedule

Different times for different days.

The admin should be able to:

- create schedule
- edit schedule
- deactivate schedule
- block specific dates
- set capacity
- view schedule calendar

Do not create a second availability engine if one already exists.

---

EXPERIENCE PRICING

Support business-supported pricing models:

Per person

Adult
Child

Per group

Group of 1-5
Group of 6-10

Package pricing

Basic
Premium
VIP

Pricing must remain backend-authoritative.

Return a breakdown of applied rules.

---

EXPERIENCE INCLUDES / EXCLUDES

Admin can configure:

Includes:
- Equipment
- Guide
- Transportation

Excludes:
- Personal expenses
- Meals

Do not hardcode this content into the frontend.

---

EXPERIENCE REQUIREMENTS

Support:

- age requirements
- fitness requirements
- equipment requirements
- what to bring
- safety information
- restrictions
- accessibility information

---

EXPERIENCE ADD-ONS

Support optional add-ons such as:

- private guide
- transportation
- photography
- meals
- equipment
- premium service

Connect add-ons to pricing and booking.

---

EXPERIENCE BOOKINGS

Experience bookings must connect to the central booking infrastructure.

Display:

Booking ID
Customer
Experience
Date
Time
Guests
Package
Add-ons
Total
Payment
Status

Support permission-aware actions.

---

PHASE 5 — EVENTS

Implement a complete Event management system.

An Event is different from a normal experience because it is tied to a specific scheduled occurrence.

An Event contains:

Event
 ├── Date
 ├── Time
 ├── Venue
 ├── Capacity
 ├── Tickets
 ├── Schedule
 ├── Add-ons
 └── Orders

---

EVENT BASIC INFORMATION

Admin should control:

- event name
- description
- category
- organizer
- status
- age restriction
- dress code
- rules
- event date
- start time
- end time
- doors open time
- timezone

Possible event categories:

- Party
- Wedding
- Birthday
- Concert
- Festival
- Corporate
- Workshop
- Sports
- Cultural
- Other

Categories should preferably be data-driven.

Do not hardcode categories in multiple frontend files.

---

EVENT VENUE

An event can happen at:

- hotel
- beach
- restaurant
- club
- villa
- yacht
- external venue

The admin must be able to select an existing venue or create one if authorized.

Venue should contain:

- name
- description
- capacity
- location
- address
- coordinates
- map URL
- facilities
- status
- media

Reuse the location system.

---

EVENT LOCATION

Provide:

Search location

[ Use Current Location ]

[ Pick on Map ]

[ Paste Google Maps Link ]

Show:

Address
Latitude
Longitude
Map Preview

Store normalized geographic coordinates.

---

EVENT CAPACITY

Support capacity management.

Possible capacity structures:

Total Capacity

General
VIP
VVIP
Tables
Private Areas

Do not create separate capacity systems that can contradict each other.

Backend must enforce capacity.

---

PHASE 6 — EVENT TICKETS

Implement ticket management.

Examples:

Early Bird
Regular
VIP
VVIP
Couple
Group
Table
Private Area

Each ticket type can have:

- name
- description
- price
- quantity
- sale start
- sale end
- capacity
- benefits
- status

---

TICKET PRICING STAGES

Support:

Early Bird
↓
Regular
↓
Last Minute

Pricing must be server-controlled.

The frontend should display backend-calculated prices.

---

TICKET AVAILABILITY

The system must prevent:

Overselling
Negative inventory
Double allocation
Race conditions

Use transactional backend logic.

For PostgreSQL, use appropriate row-level locking or atomic inventory updates.

Do not trust frontend quantity validation.

---

EVENT SEATING

Do not build complex assigned seating unless the business actually requires it.

Prefer:

General
VIP
VVIP
Tables
Private Area

If assigned seating is already supported by the backend, integrate with it instead of replacing it.

---

EVENT SCHEDULE

Admin should be able to create event timeline items.

Example:

19:00 Doors Open

20:00 DJ

21:30 Main Performance

23:00 Special Show

00:30 Event Ends

Each schedule item may contain:

- title
- description
- start time
- end time
- performer
- status

---

PHASE 7 — ARTISTS / PERFORMERS

If the business model requires it, create reusable performers/artists.

Support:

- name
- type
- description
- image
- social links
- status

Events can reference performers.

Do not duplicate performer data inside every event.

---

PHASE 8 — EVENT ADD-ONS

Allow optional event purchases.

Examples:

- food
- drinks
- parking
- transportation
- decoration
- photography
- table
- private area

Each add-on should have:

- name
- description
- price
- quantity rules
- availability
- status

---

PHASE 9 — EVENT ORDERS

Event orders must integrate with the central order/booking/payment architecture.

Admin should see:

Order ID
Customer
Event
Ticket Type
Quantity
Add-ons
Subtotal
Discount
Fees
Total
Payment Status
Order Status
Check-in Status
Created At

Actions:

- view
- cancel
- refund
- resend ticket
- verify payment
- check-in
- view customer
- view audit history

---

PHASE 10 — EVENT CHECK-IN

Implement secure ticket check-in.

Admin/staff should be able to:

- scan ticket
- validate ticket
- manually search ticket
- confirm customer
- check in
- reject invalid ticket

The system must prevent:

Double Check-in
Fake Ticket
Cancelled Ticket Check-in
Refunded Ticket Check-in
Wrong Event Ticket

Backend must perform final validation.

The frontend must never decide whether a ticket is valid.

---

PHASE 11 — BOOKING ARCHITECTURE

Do NOT create four independent booking engines.

Use a shared booking infrastructure.

Conceptually:

BOOKING ENGINE

Accommodation Booking
Yacht Booking
Experience Booking
Event Order

Shared infrastructure:

- customer
- payment
- refund
- cancellation
- status
- audit
- notifications
- idempotency
- request correlation
- permissions

Domain-specific rules remain inside domain services.

Example:

YachtBookingService
ExperienceBookingService
EventOrderService

These should orchestrate business rules without duplicating the entire booking system.

---

PHASE 12 — ADMIN DASHBOARD UX

Do not create a generic CRUD dashboard.

The dashboard must be operational.

---

YACHT DASHBOARD

Show:

Total Yachts
Active
Booked Today
Maintenance
Upcoming Bookings
Revenue

Useful widgets:

- availability calendar
- upcoming departures
- today's bookings
- maintenance alerts
- pending approvals

---

EXPERIENCE DASHBOARD

Show:

Active Experiences
Today's Sessions
Upcoming Sessions
Bookings
Revenue
Capacity Utilization

---

EVENTS DASHBOARD

Show:

Upcoming Events
Tickets Sold
Tickets Remaining
Today's Events
Check-ins
Revenue

Useful:

Upcoming Events
Ticket Sales
Check-in Progress
Capacity Utilization

---

PHASE 13 — SEARCH / FILTER / PAGINATION

All large admin lists must support:

- search
- filters
- sorting
- pagination
- status filters
- date filters
- owner/provider filters
- location filters where appropriate

Never load thousands of records into the browser.

Pagination must be backend-driven.

Respect the existing maximum pagination limits.

---

PHASE 14 — PERMISSIONS

Do not allow every admin to perform every action.

Respect existing RBAC/policies.

Possible permissions:

yachts.view
yachts.create
yachts.update
yachts.delete
yachts.manage_pricing
yachts.manage_availability

experiences.view
experiences.create
experiences.update
experiences.delete
experiences.manage_pricing
experiences.manage_schedule

events.view
events.create
events.update
events.delete
events.manage_tickets
events.manage_checkin
events.refund

Only introduce permissions that fit the existing authorization architecture.

Frontend permission checks are for UX only.

Backend authorization is mandatory.

---

PHASE 15 — SECURITY

Apply existing GouNow security standards.

Do not introduce:

- insecure mass assignment
- IDOR
- authorization bypass
- SQL injection
- unsafe file uploads
- unrestricted media access
- sensitive data leakage
- stack traces
- SQL errors
- internal exception messages
- insecure direct object references

Validate every request server-side.

Use:

- Form Requests
- Policies
- Services
- Transactions
- authorization
- rate limiting where needed
- idempotency for appropriate operations
- audit logging

Do not trust:

- price from frontend
- availability from frontend
- ticket inventory from frontend
- permissions from frontend
- booking status from frontend

---

PHASE 16 — STATE MACHINES

Do not allow arbitrary status mutation.

If the project already has state machines, extend them.

Examples:

Yacht:

Draft
→ Pending Approval
→ Active
→ Suspended
→ Archived

Experience:

Draft
→ Pending Approval
→ Active
→ Suspended
→ Archived

Event:

Draft
→ Published
→ Sales Open
→ Sales Closed
→ Live
→ Completed
→ Cancelled

Only implement transitions that match the existing domain.

---

PHASE 17 — DATABASE

Before creating migrations:

Inspect the existing schema.

Avoid duplicate tables.

Use proper relationships.

Expected conceptual relationships:

Yacht
 ├── Owner
 ├── Media
 ├── Location
 ├── Packages
 ├── Addons
 ├── Availability
 ├── Pricing
 └── Bookings

Experience
 ├── Provider
 ├── Media
 ├── Location
 ├── Schedule
 ├── Packages
 ├── Addons
 ├── Availability
 ├── Pricing
 └── Bookings

Event
 ├── Venue
 ├── Media
 ├── Schedule
 ├── Tickets
 ├── Addons
 ├── Performers
 └── Orders

Use foreign keys.

Use appropriate indexes.

Use unique constraints where required.

Do not create nullable columns everywhere just to avoid migration problems.

---

PHASE 18 — LOCATION ARCHITECTURE

If Properties already have a location implementation, reuse it.

Do NOT create:

YachtLocation
ExperienceLocation
EventLocation

unless technically necessary.

Prefer a shared location abstraction.

Possible structure:

Location
 ├── latitude
 ├── longitude
 ├── address
 ├── city
 ├── area
 ├── country
 └── map_url

The exact implementation must follow the existing backend architecture.

---

PHASE 19 — API DESIGN

Do not invent APIs before auditing existing routes.

Follow existing:

- URL conventions
- API versioning
- response envelope
- pagination format
- validation errors
- authentication
- authorization
- resource transformers
- request IDs
- error handling

Possible conceptual endpoints:

GET    /admin/yachts
POST   /admin/yachts
GET    /admin/yachts/{id}
PATCH  /admin/yachts/{id}
DELETE /admin/yachts/{id}

GET    /admin/yachts/{id}/availability
GET    /admin/yachts/{id}/pricing
GET    /admin/yachts/{id}/bookings

GET    /admin/experiences
POST   /admin/experiences
GET    /admin/experiences/{id}
PATCH  /admin/experiences/{id}

GET    /admin/events
POST   /admin/events
GET    /admin/events/{id}
PATCH  /admin/events/{id}

GET    /admin/events/{id}/tickets
POST   /admin/events/{id}/tickets

GET    /admin/events/{id}/orders
POST   /admin/events/{id}/check-in

These are examples only.

Use actual project routing conventions after audit.

DO NOT create fake endpoints just because they look reasonable.

---

PHASE 20 — FRONTEND ARCHITECTURE

Use the existing Next.js architecture.

Do not create one giant component.

Separate:

pages/routes
features
components
services
api
hooks
types
schemas
utils

Use the existing project structure if one already exists.

Example conceptual structure:

features/
  yachts/
    components/
    hooks/
    services/
    schemas/
    types/

  experiences/
    components/
    hooks/
    services/
    schemas/
    types/

  events/
    components/
    hooks/
    services/
    schemas/
    types/

Do not blindly copy this structure if the existing project uses another architecture.

Follow the current architecture.

---

PHASE 21 — DESIGN SYSTEM

Do NOT redesign the entire website.

Reuse:

- colors
- typography
- spacing
- buttons
- cards
- tables
- modals
- drawers
- forms
- inputs
- dropdowns
- badg
alerts
calendars
The new modules should look like they belong to the existing GouNow admin dashboard.
However:
Do not duplicate components unnecessarily.
Create reusable components where repetition exists.
PHASE 22 — FORMS
Forms must provide:
validation
loading states
server errors
inline errors
disabled state during submission
unsaved changes protection where appropriate
success feedback
accessible labels
keyboard support
Do not silently fail.
PHASE 23 — TABLE UX
Every table must support:
loading state
empty state
error state
pagination
search
filters
sorting where useful
row actions
responsive behavior
Do not create unusable tables on mobile.
PHASE 24 — DETAIL PAGES
Yacht detail:
Overview
Bookings
Availability
Pricing
Packages
Add-ons
Media
Location
Maintenance
Activity
Experience detail:
Overview
Bookings
Schedule
Availability
Pricing
Packages
Add-ons
Media
Location
Activity
Event detail:
Overview
Tickets
Orders
Schedule
Venue
Add-ons
Performers
Check-in
Media
Activity
Only display tabs that are actually supported.
PHASE 25 — AUDIT LOG
Every important administrative action must be auditable.
Examples:
Created yacht
Updated yacht
Changed yacht status
Changed pricing
Blocked availability
Created experience
Changed experience schedule
Published event
Created ticket type
Changed ticket price
Refunded order
Checked in customer
Audit records should include:
actor
action
entity
entity ID
timestamp
request ID where supported
relevant metadata
Never store unnecessary sensitive information.
PHASE 26 — NOTIFICATIONS
Reuse the existing notification system.
Examples:
Yacht:
New booking
Booking cancelled
Maintenance reminder
Experience:
New booking
Schedule change
Capacity warning
Event:
Ticket sold
Event capacity warning
Check-in
Cancellation
Refund
Do not create a second notification infrastructure.
PHASE 27 — PERFORMANCE
Do not introduce:
Kubernetes
Kafka
RabbitMQ
microservices
unnecessary Redis infrastructure
unless the existing system demonstrably requires them.
Optimize first using:
database indexes
eager loading
pagination
query optimization
caching where already supported
queues only for genuinely asynchronous work
Avoid N+1 queries.
Avoid loading unnecessary relationships.
PHASE 28 — CONCURRENCY
Pay special attention to:
Yacht availability
Two users must not book the same unavailable slot.
Experience capacity
Two users must not consume more capacity than exists.
Event tickets
Two users must not purchase the same remaining inventory simultaneously.
Pricing
Final price must be recalculated server-side.
Use database transactions and appropriate locking/atomic operations.
PHASE 29 — TESTING
Add backend tests for:
Yachts
create
update
authorization
availability
pricing
booking
capacity
cancellation
Experiences
create
update
schedule
capacity
pricing
booking
authorization
Events
create
publish
ticket creation
ticket inventory
pricing
order
cancellation
refund
check-in
Security
Test:
unauthorized access
IDOR
privilege escalation
invalid IDs
invalid status transitions
price tampering
quantity tampering
capacity bypass
duplicate requests
double check-in
PHASE 30 — FRONTEND TESTING
Test:
forms
validation
loading states
empty states
error states
filters
pagination
permissions
booking flows
ticket flows
check-in
pricing display
Do not rely only on visual testing.
PHASE 31 — API INTEGRATION
The frontend must communicate with the real Laravel backend.
Do NOT use:
mock data
fake API responses
hardcoded bookings
fake pricing
fake availability
unless specifically required for tests.
All production UI must consume real APIs.
Handle:
401
403
404
409
422
429
500
according to the existing API error contract.
PHASE 32 — ERROR HANDLING
Every screen needs:
Loading
Skeleton/spinner appropriate to existing design.
Empty
Example:
No yachts found.
Add your first yacht to start managing your yacht inventory.
Error
Human-readable message.
Retry
Where appropriate.
Do not expose backend exception details.
PHASE 33 — RESPONSIVE DESIGN
The admin dashboard must work on:
desktop
laptop
tablet
mobile
Do not simply shrink desktop tables.
For mobile:
use cards
horizontal scrolling where necessary
bottom sheets/drawers
responsive filters
readable forms
PHASE 34 — ACCESSIBILITY
Ensure:
labels
keyboard navigation
focus states
semantic buttons
accessible dialogs
accessible dropdowns
readable contrast
screen-reader-friendly status messages
Do not rely only on color to communicate status.
PHASE 35 — IMPLEMENTATION ORDER
Implement in this order:
1. Audit
2. Architecture mapping
3. Database/domain model
4. Backend models
5. Migrations
6. Validation
7. Policies
8. Services
9. Availability
10. Pricing
11. APIs
12. Tests
13. Frontend API layer
14. Yachts UI
15. Experiences UI
16. Events UI
17. Tickets
18. Orders
19. Check-in
20. Permissions
21. Error handling
22. Responsive UX
23. Integration tests
24. Final audit
Do not skip directly to frontend UI.
PHASE 36 — STOP CONDITIONS
If you discover that an existing abstraction already solves a requirement:
STOP.
Reuse it.
If implementing a feature requires changing an important existing domain:
STOP.
Explain the impact before making a destructive architectural change.
Do not silently:
rename tables
delete tables
change existing booking states
change payment behavior
change authorization rules
break existing APIs
replace the existing design system
without first verifying compatibility.
PHASE 37 — FINAL ACCEPTANCE CRITERIA
The implementation is complete only when:
Yachts
Admin can create yacht
Admin can edit yacht
Admin can manage media
Admin can manage location
Admin can manage availability
Admin can manage pricing
Admin can manage packages
Admin can manage add-ons
Admin can view bookings
Permissions work
Tests pass
Experiences
Admin can create experience
Admin can edit experience
Admin can manage media
Admin can manage location
Admin can manage schedule
Admin can manage availability
Admin can manage pricing
Admin can manage packages
Admin can manage add-ons
Admin can view bookings
Permissions work
Tests pass
Events
Admin can create event
Admin can edit event
Admin can manage venue
Admin can manage location
Admin can manage schedule
Admin can manage capacity
Admin can create ticket types
Admin can manage ticket inventory
Admin can manage ticket pricing
Admin can manage add-ons
Admin can manage performers if supported
Admin can view orders
Admin can refund/cancel according to permissions
Admin can perform secure check-in
Double check-in is prevented
Permissions work
Tests pass
PHASE 38 — FINAL ARCHITECTURE AUDIT
After implementation:
Review the entire feature.
Check for:
Duplicated logic
Duplicated components
Duplicated APIs
Duplicated booking logic
N+1 queries
Missing indexes
Missing authorization
Missing validation
Race conditions
Price tampering
Capacity bypass
Ticket overselling
Double check-in
PII leakage
Unsafe media access
Broken responsive UI
Fake data
Hardcoded business rules
Dead code
Unused imports
Type errors
Lint errors
Test failures
Run all existing project checks.
Do not consider the task complete if the new implementation passes in isolation but breaks existing functionality.
FINAL REPORT
At the end provide:
1. What was implemented
2. Files created
3. Files modified
4. Database changes
5. API changes
6. Permissions added/changed
7. Tests added
8. Existing tests status
9. Security considerations
10. Known limitations
11. Any architectural decisions that require approval
Do not claim something is implemented if it is not.
Do not hide failures.
Do not use fake success messages.
The final system must be:
maintainable
secure
scalable
understandable
consistent with the existing GouNow architecture
integrated with the existing backend
integrated with the existing frontend
production-oriented
resistant to common authorization and concurrency problems
Most importantly:
Do not build a collection of CRUD screens.
Build a real operational admin system where:
Yacht
    ↓
Availability
    ↓
Pricing
    ↓
Package / Add-ons
    ↓
Booking
    ↓
Payment
    ↓
Confirmation
    ↓
Stay / Trip
    ↓
Completion
and:
Experience
    ↓
Schedule
    ↓
Capacity
    ↓
Pricing
    ↓
Booking
    ↓
Payment
    ↓
Completion
and:
Event
    ↓
Venue
    ↓
Schedule
    ↓
Tickets
    ↓
Orders
    ↓
Payment
    ↓
Ticket Validation
    ↓
Check-in
    ↓
Event Completion
The backend remains the source of truth for all business-critical operations.