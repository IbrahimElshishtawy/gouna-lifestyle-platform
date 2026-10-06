# GOUNOW ADMIN DASHBOARD

## BOOKINGS, STAYS & PROPERTIES — PRODUCTION UX/UI IMPLEMENTATION

You are working on the GouNow platform admin dashboard.

Your task is to redesign and implement the **Bookings, Stays, Properties, Units/Villas, Availability, Pricing, and related operational workflows** inside the existing admin dashboard.

The goal is NOT to create random CRUD pages.

The goal is to build a **production-grade operational admin experience** that is:

* Clear
* Fast
* Practical
* Scalable
* Consistent
* Easy for administrators to understand
* Easy to operate under heavy daily usage
* Permission-aware
* Error-resistant
* Connected to the existing Laravel backend
* Compatible with the existing Next.js frontend architecture
* Consistent with the existing GouNow visual identity
* Not visually repetitive
* Not overloaded with cards
* Not dependent on unnecessary animations
* Not a redesign of the entire website

---

# 1. CRITICAL RULES

Before changing anything:

1. Inspect the existing frontend completely.
2. Inspect the existing backend API completely.
3. Inspect existing database models/resources/relations.
4. Inspect existing authentication and authorization.
5. Inspect existing admin roles and permissions.
6. Inspect existing API response structures.
7. Inspect existing design system/components.
8. Inspect existing routing.
9. Inspect existing loading/error/empty states.
10. Inspect existing forms and validation.
11. Inspect existing booking/property models.
12. Inspect existing tests.

DO NOT assume that an API exists.

DO NOT invent backend endpoints when an existing endpoint already provides the required operation.

DO NOT duplicate business logic in the frontend.

DO NOT bypass backend authorization.

DO NOT directly manipulate database state from the frontend.

DO NOT create fake data for production screens unless explicitly required for development fallback.

DO NOT rewrite unrelated parts of the application.

DO NOT replace the existing visual identity unnecessarily.

DO NOT introduce a new UI library unless absolutely necessary.

DO NOT create huge monolithic components.

DO NOT put everything into one page.

---

# 2. PRODUCT ARCHITECTURE

Use this conceptual separation:

Properties = Inventory

Bookings = Reservations

Stays = Actual guest occupancy

Guests = Customers

Payments = Money

Owners / Partners = Property ownership

Never mix these responsibilities unnecessarily.

A booking represents a reservation lifecycle.

A stay represents the actual physical occupancy lifecycle.

A property represents inventory.

A unit/villa represents a bookable inventory item belonging to a property.

---

# 3. ADMIN INFORMATION ARCHITECTURE

The admin sidebar should use this structure:

Dashboard

Bookings

* All Bookings
* Upcoming
* Active Stays
* Check-ins
* Check-outs
* Cancellations
* Calendar

Properties

* All Properties
* Pending Approval
* Active
* Suspended
* Units / Villas
* Availability
* Pricing
* Maintenance

Guests

Owners / Partners

Payments

* Transactions
* Refunds
* Payouts

Services

Reviews

Reports

Notifications

Settings

Do not necessarily create every item as a new route if the existing architecture can provide the same functionality through filters/tabs.

Prefer fewer meaningful screens over unnecessary navigation.

---

# 4. BOOKING MANAGEMENT UX

## 4.1 Booking Overview

Create a professional booking management page.

At the top:

* Page title
* Short contextual description
* Primary action if authorized
* Search
* Filters
* View switcher if useful

Avoid excessive KPI cards.

If summary statistics are useful, use a compact summary row:

* Total
* Pending
* Confirmed
* Active
* Completed
* Cancelled

The numbers must come from real backend data.

---

# 5. BOOKING TABLE

Build a high-quality operational table.

Columns should include:

* Booking ID
* Guest
* Property
* Unit
* Check-in
* Check-out
* Guests
* Amount
* Payment status
* Booking status
* Created at
* Actions

Do NOT show every possible field in the default table.

Use progressive disclosure.

Allow:

* Search
* Status filtering
* Payment filtering
* Property filtering
* Date filtering
* Guest filtering
* Sorting
* Pagination

Use server-side filtering and pagination where supported.

Do not load thousands of records unnecessarily.

---

# 6. BOOKING ROW UX

The row should communicate status immediately.

Use clear status badges:

Pending
Confirmed
Checked-in
Checked-out
Cancelled
No-show

Payment:

Unpaid
Partially Paid
Paid
Refunded
Failed

Do not rely only on colors.

Use text/icon/state combinations where appropriate.

---

# 7. BOOKING ACTIONS

Actions should depend on the booking state.

Examples:

Pending:

* View
* Confirm
* Cancel

Confirmed:

* View
* Check-in
* Cancel

Checked-in:

* View
* Extend Stay
* Add Service
* Check-out

Checked-out:

* View
* Refund if applicable
* View receipt

Cancelled:

* View
* View refund
* View history

Never show impossible actions.

Never allow the frontend to bypass backend state validation.

---

# 8. BOOKING DETAILS

Create a dedicated Booking Details experience.

The screen should not become a giant wall of information.

Use a clear hierarchy.

Header:

* Booking ID
* Current booking status
* Payment status
* Main contextual actions

Example:

Booking #GN-12345

Confirmed
Paid

[Check-in]
[More]

---

# 9. BOOKING DETAILS SECTIONS

Use tabs or clearly separated sections.

Recommended:

Overview
Guest
Stay
Payment
Activity

## Overview

Show:

* Property
* Unit
* Check-in
* Check-out
* Number of guests
* Duration
* Booking creation date
* Total amount

The property and unit should be clickable.

The guest should be clickable.

The payment section should be clickable.

This creates a connected operational workflow.

---

# 10. GUEST SECTION

Display:

* Guest name
* Phone
* Email
* Number of guests
* Relevant booking information

Sensitive information must follow backend authorization.

Never expose unnecessary PII.

Never display sensitive information simply because it exists in the API.

---

# 11. STAY MANAGEMENT

Create a dedicated operational Stay Management experience.

The purpose is not to duplicate bookings.

It answers:

"Who is physically staying now?"

Provide:

* Currently staying
* Expected arrivals
* Expected departures
* Today's check-ins
* Today's check-outs
* Late check-outs

Use operational tables/lists instead of excessive cards.

---

# 12. STAY STATUS

Recommended states:

Expected
Checked-in
In progress
Checked-out
Extended
No-show

The actual state machine must come from the backend.

Do not implement an independent frontend state machine.

---

# 13. CHECK-IN UX

When an authorized admin clicks Check-in:

Open a confirmation/action flow.

Show:

* Guest
* Property
* Unit
* Booking
* Scheduled check-in
* Current time
* Important notes

Then:

[Confirm Check-in]

After successful completion:

* Update the booking
* Update the stay
* Refresh affected data
* Show success feedback
* Add activity entry if backend supports it

Do not optimistically display a successful state if the backend operation fails.

---

# 14. CHECK-OUT UX

When clicking Check-out:

Show:

* Guest
* Property
* Unit
* Booking
* Scheduled checkout
* Current stay status
* Outstanding payment if applicable
* Relevant notes

If outstanding payment prevents checkout according to backend business rules, explain the reason clearly.

Do not silently block the user.

Do not invent business rules.

Use backend validation as the authority.

---

# 15. EXTEND STAY

Provide an Extend Stay workflow where supported.

The flow should:

1. Select new checkout date.
2. Validate availability.
3. Show price impact.
4. Show updated total if applicable.
5. Confirm.
6. Send request to backend.
7. Refresh booking/stay state.

Never assume availability.

Never calculate authoritative pricing only on the frontend.

---

# 16. BOOKING ACTIVITY TIMELINE

Create a professional timeline.

Example:

Booking created
↓
Payment received
↓
Booking confirmed
↓
Guest checked in
↓
Service added
↓
Guest checked out

Each event should show:

* Event
* Timestamp
* Actor when available
* Relevant metadata

This is an operational audit trail.

Do not fabricate timeline events.

---

# 17. PROPERTY MANAGEMENT UX

Properties represent inventory.

Create a dedicated Properties section.

Top:

Properties

Short description

Primary action:

* Add Property

Then:

Search
Filters
View mode

Possible view modes:

* Table
* Compact grid

Do not force a visual grid if it reduces operational efficiency.

For large property inventories, table view should be the default.

---

# 18. PROPERTY LIST

Default fields:

* Property
* Type
* Location
* Owner
* Units
* Availability
* Status
* Rating if available
* Updated at
* Actions

Do not overload the table.

Use details pages for secondary information.

---

# 19. PROPERTY STATUS

Possible states depending on backend:

Draft
Pending Approval
Active
Suspended
Maintenance
Archived

Do not create states that don't exist in the backend.

The UI must reflect the actual backend domain model.

---

# 20. PROPERTY DETAILS

Property details should use a structured layout.

Header:

Property name

Status

Location

Owner

Primary actions

Possible actions:

Edit
Publish
Unpublish
Suspend
Archive

Only show actions allowed by the current user's permissions and property state.

---

# 21. PROPERTY DETAILS TABS

Recommended:

Overview
Units
Media
Amenities
Pricing
Availability
Services
Maintenance
Activity

Only implement tabs that map to real backend capabilities.

Do not create empty tabs simply to make the interface look complete.

---

# 22. PROPERTY OVERVIEW

Show:

* Name
* Description
* Type
* Location
* Address
* Owner
* Status
* Capacity
* Created date
* Updated date

Use sections.

Do not turn every field into a separate card.

---

# 23. UNITS / VILLAS

A property may contain multiple bookable units.

Example:

Property
├── Villa A
├── Villa B
├── Villa C
└── Villa D

Each unit should support, where backend allows:

* Name
* Type
* Capacity
* Bedrooms
* Bathrooms
* Beds
* Amenities
* Images
* Pricing
* Availability
* Status

The user should be able to navigate:

Property → Unit → Bookings

and:

Booking → Unit → Property

---

# 24. UNIT DETAILS UX

Create a dedicated Unit Details page or drawer depending on the existing routing architecture.

Header:

Unit name
Status
Property name

Actions:

Edit
Block
Unblock
Maintenance

Tabs/sections:

Overview
Bookings
Pricing
Availability
Media
Amenities
Activity

Again, do not create fake functionality.

---

# 25. AVAILABILITY MANAGEMENT

Availability is one of the most important operational screens.

Build a calendar-oriented experience.

Allow admins to understand:

Available
Booked
Blocked
Maintenance
Unavailable

Use a clear legend.

Do not rely only on colors.

Calendar interactions must be safe.

Before changing availability:

* Validate permission
* Validate current state
* Validate conflicts
* Confirm destructive changes

---

# 26. PRICING MANAGEMENT

Pricing should be separated from general property editing.

Show:

* Base price
* Seasonal pricing
* Weekend pricing if supported
* Holiday pricing if supported
* Minimum nights
* Maximum nights

Use date ranges where applicable.

Never make frontend calculations authoritative.

The backend remains the source of truth for final pricing.

---

# 27. PROPERTY MEDIA

Media management should support:

* Cover image
* Gallery
* Videos if supported

Provide:

* Upload
* Remove
* Reorder
* Set cover

Only implement capabilities actually supported by the backend/storage architecture.

Do not expose private storage URLs if the architecture uses protected media.

---

# 28. AMENITIES

Create reusable amenity management.

Avoid hardcoding dozens of amenities directly inside components.

Use backend-provided amenity data where available.

Support:

* Add
* Remove
* Edit if authorized

---

# 29. MAINTENANCE

Property/unit maintenance should be operational.

Show:

* Open issues
* In progress
* Resolved
* Priority
* Assigned staff
* Created date
* Updated date

Do not mix maintenance issues into booking logic.

---

# 30. GLOBAL SEARCH

If supported by the existing architecture, provide admin search capable of finding:

* Booking
* Guest
* Property
* Unit

Search should return clearly categorized results.

Example:

Bookings
#GN-12345

Guests
Ahmed Mohamed

Properties
Sunset Villa

Units
Villa A

Do not create a search engine in the frontend.

Use backend search APIs where appropriate.

---

# 31. EMPTY STATES

Every screen must have intentional empty states.

Examples:

No bookings found.

No properties found.

No active stays.

No upcoming check-ins.

No maintenance issues.

Do not show blank tables.

Do not use fake data.

Provide useful actions when appropriate.

---

# 32. LOADING STATES

Use proper skeleton/loading states.

Do not freeze the entire dashboard.

For tables:

Show table skeleton.

For details:

Show section skeleton.

For actions:

Disable only the affected action.

Do not block the entire interface unnecessarily.

---

# 33. ERROR STATES

Errors must be understandable.

Bad:

"Request failed."

Better:

"Unable to confirm this booking. The booking may have changed or is no longer available."

If backend returns validation information, display safe human-readable messages.

Never display:

* SQL errors
* stack traces
* internal server paths
* secrets
* raw exception messages
* sensitive backend details

---

# 34. DESTRUCTIVE ACTIONS

For:

* Cancel booking
* Refund
* Suspend property
* Archive property
* Delete media
* Block availability

Use confirmation dialogs.

The confirmation should explain:

What will happen.

What may be affected.

Whether the action is reversible.

Do not use generic:

"Are you sure?"

---

# 35. UNSAVED CHANGES

Forms must detect unsaved changes.

If the user attempts to leave:

Show a clear confirmation.

Do not silently lose form data.

---

# 36. FORMS

All forms must:

* Validate inputs
* Show field-level errors
* Preserve valid input after errors
* Disable duplicate submission
* Show loading state
* Handle backend validation errors
* Refresh affected data after success

Avoid giant forms.

Use logical sections.

Example property form:

Basic Information
Location
Capacity
Amenities
Media
Pricing
Availability

---

# 37. RESPONSIVE UX

The admin dashboard must work on:

* Desktop
* Laptop
* Tablet

Desktop is the primary admin environment.

For smaller screens:

Do not simply shrink tables.

Use:

* Horizontal scrolling
* Responsive columns
* Drawer details
* Stacked information
* Compact actions

---

# 38. ACCESSIBILITY

Use:

* Keyboard navigation
* Visible focus states
* Semantic buttons
* Proper labels
* Accessible dialogs
* Accessible form errors
* Sufficient contrast

Never use icons as the only indication of important meaning.

---

# 39. PERMISSIONS

Frontend visibility must respect backend permissions.

Possible permissions:

booking.view
booking.create
booking.update
booking.cancel
booking.checkin
booking.checkout
booking.refund

property.view
property.create
property.update
property.publish
property.suspend
property.archive

unit.view
unit.create
unit.update
unit.block

pricing.view
pricing.update

availability.view
availability.update

maintenance.view
maintenance.manage

Use the actual permission system already implemented by the project if it differs.

Do not hardcode role names unnecessarily.

Backend authorization is always authoritative.

---

# 40. DATA FETCHING

Follow the existing frontend data-fetching architecture.

Do not introduce another state management strategy without a strong reason.

Use:

* Proper caching where appropriate
* Request cancellation
* Pagination
* Debounced search
* Server-side filters
* Refetch/invalidation after mutations

Avoid:

Fetching the same data repeatedly.

Fetching the entire database.

N+1 frontend requests.

Unnecessary polling.

---

# 41. API INTEGRATION

Before implementing each feature:

Find the existing API endpoint.

Verify:

HTTP method
Path
Authentication
Authorization
Request body
Validation
Response
Error structure
Pagination
Filtering
Sorting

If an endpoint is missing:

DO NOT silently invent it.

Document the missing backend capability and implement the minimum backend endpoint required, following the existing Laravel architecture.

---

# 42. BACKEND INTEGRATION RULE

Laravel remains responsible for:

* Business rules
* Authorization
* Booking state transitions
* Pricing
* Availability
* Payment rules
* Refund rules
* Data integrity
* Concurrency
* Validation

Next.js remains responsible for:

* Presentation
* Interaction
* Form state
* Client-side validation for UX
* Loading states
* Error presentation
* Navigation

Never duplicate authoritative business rules.

---

# 43. CONCURRENCY

This is extremely important.

Booking operations can be concurrent.

Do not assume:

"If the UI says available, it is definitely available."

The backend must validate the final operation.

The frontend must gracefully handle conflicts.

Example:

Two admins attempt to modify the same booking.

The second operation must receive a safe conflict response.

Display:

"This booking was updated by another operation. Refreshing the latest information..."

Then refresh the relevant data.

---

# 44. URL / ROUTING DESIGN

Use meaningful routes.

Example:

/admin/bookings

/admin/bookings/[id]

/admin/stays

/admin/properties

/admin/properties/[id]

/admin/properties/[id]/units

/admin/properties/[id]/units/[unitId]

/admin/properties/[id]/availability

/admin/properties/[id]/pricing

Use the existing routing conventions if different.

Do not create unnecessary nested routes.

---

# 45. UX PRINCIPLE: PROGRESSIVE DISCLOSURE

The default screen should answer:

"What is happening?"

The details screen should answer:

"Why is it happening?"

The action flow should answer:

"What can I do?"

Do not show every piece of information at once.

---

# 46. UX PRINCIPLE: FEWER CLICKS

Common workflows should be extremely fast.

Admin needs to:

Find booking
→ Open booking
→ Check status
→ Execute action

or:

Find property
→ Open property
→ Open unit
→ Check availability

Avoid forcing users through unnecessary screens.

---

# 47. UX PRINCIPLE: CONTEXT PRESERVATION

When navigating back:

Preserve:

* Search
* Filters
* Pagination
* Sorting
* Selected tab

Do not force admins to rebuild their context after every action.

---

# 48. UX PRINCIPLE: ACTION-FIRST DESIGN

The most important actions should be easy to find.

Examples:

Booking:

Check-in
Check-out
Cancel

Property:

Edit
Publish
Suspend

Unit:

Block
Unblock
Maintenance

Do not bury primary operational actions inside three nested menus.

---

# 49. VISUAL DESIGN

Keep the existing GouNow visual identity.

Improve hierarchy rather than inventing an unrelated design.

Use:

* Consistent spacing
* Clear typography
* Controlled card usage
* Professional tables
* Subtle borders
* Clear status indicators
* Consistent buttons
* Consistent forms
* Consistent dialogs

Avoid:

* Excessive gradients
* Excessive glassmorphism
* Huge cards
* Excessive shadows
* Random colors
* Decorative animations
* Dashboard clutter

The interface should feel like a serious production operations platform.

---

# 50. DO NOT MAKE EVERYTHING A CARD

Use:

Tables for datasets.

Lists for activity.

Tabs for related information.

Calendars for availability.

Drawers for quick inspection.

Dialogs for confirmation.

Cards only when grouping information improves comprehension.

This is critical.

---

# 51. PROPERTY ↔ BOOKING CONNECTIONS

Every relevant entity should be navigable.

Booking:

Guest → Guest profile

Property → Property details

Unit → Unit details

Payment → Payment details

Stay → Stay details

Property:

Owner → Owner profile

Unit → Unit details

Bookings → Booking list filtered to property

Availability → Availability calendar

This creates a connected admin system instead of isolated CRUD pages.

---

# 52. AUDITABILITY

Every important mutation should produce or consume backend audit/activity information where supported.

Important actions:

* Booking status change
* Check-in
* Check-out
* Cancellation
* Refund
* Property publish
* Property suspension
* Availability block
* Pricing change

Do not create fake audit records from the frontend.

---

# 53. PERFORMANCE

The implementation must be optimized for large datasets.

Do not:

* Render thousands of table rows
* Load all properties
* Load all bookings
* Fetch unnecessary relations
* Re-render the entire dashboard after one action

Use:

Pagination
Filtering
Memoization where appropriate
Virtualization only where actually necessary
Server-side operations

---

# 54. TESTING

Before finishing:

Run existing tests.

Add tests for important workflows.

At minimum test:

Booking list loading

Booking filtering

Booking details

Permission restrictions

Confirm booking

Cancel booking

Check-in

Check-out

Property list

Property details

Unit navigation

Availability changes

Pricing changes

Error handling

Loading states

Empty states

Unauthorized operations

Concurrent/conflict responses where practical

---

# 55. FINAL VALIDATION

After implementation verify:

1. No TypeScript errors.
2. No lint errors.
3. No broken routes.
4. No broken imports.
5. No console errors.
6. No duplicated components unnecessarily.
7. No fake API endpoints.
8. No unauthorized actions.
9. No raw backend errors exposed.
10. No sensitive data leakage.
11. No broken mobile/tablet layout.
12. No unnecessary API requests.
13. No duplicated business logic.
14. No destructive action without confirmation.
15. No empty page without proper empty state.

---

# 56. IMPLEMENTATION ORDER

Execute in this order.

## STEP 1 — AUDIT

Inspect:

Frontend
Backend
Routes
API
Models
Permissions
Components
Design system
Tests

Produce a short implementation map before editing.

---

## STEP 2 — DESIGN SYSTEM ALIGNMENT

Identify reusable:

Table
Button
Badge
Modal
Drawer
Form
Input
Select
Date picker
Tabs
Pagination
Skeleton
Toast
Empty state
Error state

Reuse existing components.

Create reusable components only when genuinely missing.

---

## STEP 3 — BOOKING MANAGEMENT

Implement:

Booking list
Filters
Search
Pagination
Booking details
Booking actions
Activity timeline

---

## STEP 4 — STAY MANAGEMENT

Implement:

Active stays
Arrivals
Departures
Check-in
Check-out
Extend stay where supported

---

## STEP 5 — PROPERTY MANAGEMENT

Implement:

Property list
Property details
Property status
Property editing

---

## STEP 6 — UNITS / VILLAS

Implement:

Unit list
Unit details
Unit editing
Unit availability
Unit bookings

---

## STEP 7 — AVAILABILITY

Implement:

Calendar
Availability status
Blocking/unblocking
Conflict handling

---

## STEP 8 — PRICING

Implement:

Pricing display
Pricing editing
Date ranges
Backend-authoritative calculations

---

## STEP 9 — MEDIA / AMENITIES / SERVICES

Implement only backend-supported capabilities.

---

## STEP 10 — POLISH

Improve:

Loading
Errors
Empty states
Responsive behavior
Accessibility
Transitions
Navigation
Context preservation

---

# 57. IMPORTANT: DO NOT OVERBUILD

Do NOT add:

Kubernetes

Redis

Kafka

RabbitMQ

Microservices

A new database

A new authentication system

A new state management framework

A new UI framework

A new API architecture

unless the existing project explicitly requires them.

This task is primarily about building the best admin UX on top of the existing GouNow architecture.

---

# 58. FINAL DELIVERABLE

When finished, provide:

1. Files changed.
2. Routes added/changed.
3. Components added.
4. API endpoints consumed.
5. Backend endpoints added, if any.
6. Permissions used.
7. Tests added.
8. Tests executed.
9. Problems discovered.
10. Problems fixed.
11. Remaining limitations.

Most importantly:

Do not claim completion if a feature is only visually implemented.

Every displayed action must either:

* work against the real backend,
* or clearly be marked as unavailable because the backend capability does not exist.

The final result must feel like a real production administration system used daily by operations staff, not a UI prototype.
