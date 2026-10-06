# GOUNOW ADMIN

# PROPERTIES + VILLAS + UNITS + LOCATION + PRICING ENGINE

## PRODUCTION IMPLEMENTATION PROMPT

You are implementing the GouNow Admin Dashboard.

The goal is to build a production-grade administration system for managing:

* Properties
* Villas
* Residential Units
* Property Information
* Location
* Media
* Amenities
* Availability
* Maintenance
* Pricing
* Seasonal Pricing
* Holiday Pricing
* Weekend Pricing
* Discounts
* Minimum Stay
* Pricing Calendar
* Price Overrides

The system must be practical for real administrative use.

Do not build a visual prototype.

Do not build fake CRUD.

Do not create fake APIs.

Use the existing Laravel backend and Next.js frontend architecture.

---

# 1. FIRST: AUDIT THE EXISTING PROJECT

Before changing any code, inspect:

* Next.js structure
* Existing Admin Dashboard
* Existing design system
* Existing components
* Existing routes
* Existing API client
* Authentication
* Authorization
* Admin roles
* Permissions
* Laravel routes
* Controllers
* Requests
* Resources
* Models
* Relationships
* Migrations
* Database schema
* Property-related tables
* Booking-related tables
* Pricing-related tables
* Location fields
* Media/storage system
* Existing tests

Do not assume the architecture.

Do not replace working architecture unnecessarily.

Do not create duplicate models.

Do not create duplicate tables.

Do not create duplicate API endpoints.

---

# 2. CORE DOMAIN MODEL

Use this conceptual structure:

Property
↓
Units
↓
Unit Type

Examples:

Property
├── Villa 01
├── Villa 02
├── Apartment 101
├── Apartment 102
└── Chalet 03

Important:

A Villa should normally be a Unit Type.

Do NOT create:

Property → Villa → Unit

unless the existing business model explicitly requires a separate Villa entity.

If the villa itself is bookable, it is a Unit.

Recommended conceptual model:

Unit

* Villa
* Apartment
* Chalet
* Studio
* Room
* Other

---

# 3. PROPERTY RESPONSIBILITY

The Property represents the main inventory/container.

Admin can manage:

## Basic Information

* Property name
* Property type
* Description
* Owner/Partner
* Status
* Internal reference
* Creation date
* Last update

## Location

* Country
* Governorate
* City
* Area
* Address
* Latitude
* Longitude
* Map URL
* Location accuracy/source

## General Information

* Total units
* General capacity
* Property rules
* Shared facilities
* Services
* Amenities

## Media

* Cover image
* Gallery
* Videos if supported

## Operations

* Availability
* Maintenance
* Units
* Bookings
* Activity

---

# 4. PROPERTY STATUS

Use only states supported by the backend.

Possible states:

Draft
Pending Approval
Active
Suspended
Maintenance
Archived

Do not invent additional states if the backend does not support them.

---

# 5. LOCATION MANAGEMENT — VERY IMPORTANT

Location selection must be extremely easy for the admin.

DO NOT force the admin to manually enter latitude and longitude.

Provide two primary methods.

---

# 6. LOCATION METHOD A — GPS / MAP PICKER

The property form must contain:

Location

[ Use Current Location ]

[ Pick Location on Map ]

When the administrator chooses:

Use Current Location

request browser/device geolocation permission.

If permission is granted:

* Get latitude
* Get longitude
* Store coordinates
* Update the location preview
* Show the selected location clearly

Do not silently fail.

If permission is denied:

Display a useful message:

"Location access was denied. You can select the location manually on the map or paste a Google Maps link."

Do not expose browser errors directly.

---

# 7. MAP LOCATION PICKER

Provide a map-based location selector where the administrator can:

* Open map
* Search location if supported
* Move map
* Drop/select marker
* Confirm location

After selecting:

Show:

Latitude
Longitude

and a human-readable location if reverse geocoding is available.

Example:

Location selected

Cairo, Egypt

Latitude:
30.0444

Longitude:
31.2357

[Confirm Location]

Do not require the admin to type coordinates.

---

# 8. LOCATION METHOD B — PASTE MAP LINK

Provide:

Paste Google Maps location link

Example:

https://www.google.com/maps/...

The system should:

1. Accept the URL.
2. Validate the URL.
3. Extract coordinates when possible.
4. Validate latitude and longitude.
5. Save the normalized coordinates.
6. Display the resulting location.
7. Show the map preview.
8. Allow the admin to confirm.

Do NOT trust arbitrary URL parameters.

Only parse supported location formats.

---

# 9. GOOGLE MAPS LINK HANDLING

Support common Google Maps formats where technically possible.

Examples may include:

* Coordinates embedded directly
* `@lat,lng`
* `/place/.../@lat,lng`
* Query parameter coordinate formats

Do not assume every Google Maps URL can be parsed.

If parsing fails:

Display:

"Unable to detect the exact coordinates from this link. Please choose the location on the map."

Do not save invalid coordinates.

---

# 10. LOCATION DATA MODEL

Prefer storing normalized geographic data:

latitude
longitude

Optionally:

map_url
formatted_address
country
governorate
city
area

The database should treat latitude/longitude as the authoritative geographic coordinates.

Do not store only the Google Maps URL.

The link is useful as a reference, but coordinates should be first-class data.

---

# 11. LOCATION VALIDATION

Validate:

Latitude:

-90 ≤ latitude ≤ 90

Longitude:

-180 ≤ longitude ≤ 180

Reject:

* Empty coordinates
* NaN
* Infinity
* Invalid strings
* Malformed URLs

Do validation on both:

Frontend
Backend

Frontend validation is for UX.

Backend validation is authoritative.

---

# 12. LOCATION UX

Do not make the form visually complicated.

Use:

Location

[Search / paste Google Maps link]

OR

[Use GPS]

OR

[Pick on Map]

Then show:

Selected Location

Address
Latitude
Longitude

Map Preview

[Change Location]

This should feel simple.

---

# 13. LOCATION SECURITY

Do not trust client-provided location metadata.

Validate all location data on the backend.

Do not allow arbitrary HTML in address fields.

Sanitize user-controlled text.

Do not expose internal geocoding API keys to the browser.

If an external geocoding service is used:

Prefer server-side integration where appropriate.

---

# 14. UNIT / VILLA MANAGEMENT

Inside each Property:

Units

Example:

Villa 01
Villa 02
Apartment 101
Apartment 102

Admin can:

* Add unit
* Edit unit
* View unit
* Block unit
* Unblock unit
* Set maintenance
* Manage availability
* Manage pricing
* View bookings

---

# 15. UNIT FIELDS

Each Unit may contain:

* Unit name
* Unit type
* Capacity
* Bedrooms
* Bathrooms
* Beds
* Area
* Floor
* View
* Description
* Amenities
* Media
* Status
* Availability
* Pricing

Only implement fields supported by the existing backend.

Do not add meaningless fields.

---

# 16. UNIT TYPES

Use a controlled type system.

Examples:

Villa
Apartment
Chalet
Studio
Room
Other

Do not hardcode these directly into dozens of components.

Prefer backend configuration or centralized constants where appropriate.

---

# 17. UNIT STATUS

Possible:

Available
Occupied
Blocked
Maintenance
Inactive

Use backend-supported statuses.

Do not allow invalid transitions.

---

# 18. PROPERTY DETAILS PAGE

Create:

/admin/properties/[id]

Recommended sections:

Overview
Units
Media
Amenities
Services
Availability
Pricing
Maintenance
Bookings
Activity

Use tabs if appropriate.

Do not create a separate page for every small property field.

---

# 19. UNIT DETAILS PAGE

Create:

/admin/properties/[propertyId]/units/[unitId]

Recommended sections:

Overview
Bookings
Availability
Pricing
Media
Amenities
Activity

---

# 20. PROPERTY LIST

Create a production-grade property table.

Columns:

Property
Type
Location
Owner
Units
Availability
Status
Updated
Actions

Actions:

View
Edit
Publish
Suspend
Archive

Only show actions allowed by permissions and current state.

---

# 21. UNIT LIST

Inside property:

Unit
Type
Capacity
Status
Availability
Current Booking
Price
Actions

Do not overload the table.

---

# 22. AVAILABILITY

Availability is separate from pricing.

Availability answers:

"Can this unit be booked?"

Pricing answers:

"How much does this unit cost?"

Never merge these concepts.

Availability states may include:

Available
Booked
Blocked
Maintenance
Unavailable

Use a calendar.

---

# 23. AVAILABILITY CALENDAR

Admin should be able to:

* View dates
* View bookings
* View blocked dates
* View maintenance
* Block date range
* Unblock date range

Before blocking:

Check:

* Existing bookings
* Existing reservations
* Current state
* Permissions

If blocking conflicts with an existing confirmed booking:

DO NOT silently override it.

Show the conflict.

---

# 24. PRICING ENGINE

Pricing must be a separate module.

Sidebar:

Pricing Engine

Subsections:

Overview
Base Prices
Seasonal Rules
Weekend Rules
Holiday Rules
Discounts
Minimum Stay
Pricing Calendar
Price Overrides
Price Preview

---

# 25. PRICING HIERARCHY

Use:

Global Rules
↓
Property Rules
↓
Unit Rules
↓
Date-specific Override

The most specific valid rule wins.

Example:

Global:
Weekend +10%

Property:
Summer +30%

Unit:
Villa 01 base = 7,000

Date override:
August 10 = 12,000

The final price must be calculated by the backend pricing engine.

---

# 26. BASE PRICE

Admin can define:

Base price per night

Example:

Villa 01

Base:
5,000 EGP / night

The system should clearly display currency.

Do not hardcode currency logic into frontend components.

Use the project's currency configuration.

---

# 27. SEASONAL PRICING

Admin can create:

Season name
Start date
End date
Pricing rule
Applicable property/unit
Priority
Status

Examples:

Summer
01 June → 30 September

Eid
Holiday period

Winter
01 October → 31 May

---

# 28. WEEKEND PRICING

Admin can define weekend adjustments.

Examples:

Friday
Saturday

+20%

or:

Weekend fixed price

The exact business logic must be determined by the existing backend pricing model.

Do not create frontend-only pricing rules.

---

# 29. HOLIDAY PRICING

Allow configured holiday periods.

Fields:

Holiday name
Start
End
Pricing rule
Priority
Applicable inventory
Status

---

# 30. MINIMUM STAY

Allow:

Global minimum stay

Property minimum stay

Unit minimum stay

Season minimum stay

Date-specific minimum stay

Example:

Summer:
Minimum 5 nights

Normal:
Minimum 2 nights

---

# 31. DISCOUNTS

Keep discounts separate from base pricing.

Possible:

Early booking
Last minute
Weekly
Monthly
Promotion

Fields:

Name
Type
Value
Start
End
Eligibility
Priority
Status

Never apply discounts blindly on the frontend.

---

# 32. PRICE OVERRIDES

Allow an authorized admin to override a specific date/range.

Example:

Villa 01
10 August → 15 August

8,000 EGP/night

The UI must clearly show that this is an override.

---

# 33. PRICING CALENDAR

Create a calendar-based pricing interface.

Example:

August

Villa 01

1   2   3   4   5   6   7
5k  5k  5k  7k  7k  7k  7k

8   9   10  11  12
8k  8k  8k  8k  8k

The admin should be able to select a date range and apply a pricing rule.

Example:

Select:

01 Aug → 15 Aug

Set:

8,000 EGP/night

Confirm.

The backend must validate and persist the change.

---

# 34. PRICE PREVIEW

Create a Price Preview tool.

Admin selects:

Property
Unit
Check-in
Check-out
Guests

The system returns the backend-calculated price breakdown.

Example:

Base price
5,000

Season adjustment
+1,000

Weekend adjustment
+500

Cleaning
+300

Service fee
+200

Discount
-500

Final:
6,500 EGP

The frontend must NOT calculate the authoritative final price itself.

---

# 35. PRICE EXPLANATION

Every final price should be explainable.

The admin must be able to understand:

Why is this price 8,000?

The backend should return the applied pricing rules.

The frontend displays:

Base price
+
Season rule
+
Weekend rule
+
Fees
----

# Discount

Final amount

---

# 36. PRIORITY / CONFLICTS

Pricing rules can overlap.

Do not silently choose a random rule.

Implement the backend's defined priority system.

The admin UI should clearly show:

Rule priority
Active dates
Applicable inventory
Conflict warnings

---

# 37. PROPERTY ↔ UNIT ↔ PRICING

Navigation must be connected.

From Property:

Property
→ Units
→ Unit
→ Pricing

From Pricing:

Pricing Rule
→ Property
→ Unit

From Booking:

Booking
→ Property
→ Unit
→ Applied Price Breakdown

Do not create isolated modules.

---

# 38. ADMIN PERMISSIONS

Use existing permission architecture.

Potential permissions:

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
unit.maintenance

availability.view
availability.update

pricing.view
pricing.create
pricing.update
pricing.delete
pricing.override

location.update

Never rely only on frontend permission checks.

Backend authorization remains authoritative.

---

# 39. FORMS

Property form:

Basic Information
Location
Capacity
Amenities
Media
Rules

Unit form:

Basic Information
Capacity
Features
Amenities
Media

Pricing form:

Rule
Dates
Scope
Value
Priority
Status

Do not create huge forms without logical sections.

---

# 40. LOCATION FORM UX

The final property location component should look conceptually like:

Location

[ Search or paste Google Maps link................ ]

[ Use GPS ]   [ Pick on Map ]

---

Selected location:

Cairo, Egypt

Latitude:
30.0444

Longitude:
31.2357

[ Change Location ]

Map Preview

---

If no location:

"No location selected yet."

---

# 41. LOCATION ERROR UX

Examples:

GPS permission denied:

"Location access was denied. You can paste a map link or choose the location manually."

Invalid link:

"This map link doesn't contain a recognizable location."

Invalid coordinates:

"The selected coordinates are invalid."

Geocoding failure:

"Location selected, but the address could not be resolved. The coordinates are still saved."

Never show raw exceptions.

---

# 42. RESPONSIVE DESIGN

Desktop-first admin interface.

Must remain usable on:

Desktop
Laptop
Tablet

Do not simply shrink tables.

Use responsive layouts.

---

# 43. VISUAL DESIGN

Maintain the existing GouNow design system.

The UI should feel:

Professional
Clean
Operational
Fast
Modern

Avoid:

Excessive cards
Huge gradients
Unnecessary animations
Overly decorative dashboards
Random colors
Huge shadows
Visual clutter

Use cards only where they improve grouping.

Use:

Tables for datasets
Calendars for dates
Tabs for related data
Drawers for quick inspection
Dialogs for confirmation
Forms for editing

---

# 44. LOADING STATES

Implement:

Table skeletons
Form loading states
Map loading states
Pricing calculation loading states
Calendar loading states

Do not freeze the entire page unnecessarily.

---

# 45. EMPTY STATES

Examples:

No properties found.

No units found.

No pricing rules configured.

No availability restrictions.

No location selected.

Every empty state should explain what to do next where applicable.

---

# 46. ERROR HANDLING

Never expose:

SQL errors
Stack traces
Internal paths
Database details
Secrets
Raw exceptions

Use human-readable errors.

---

# 47. DESTRUCTIVE ACTIONS

Require confirmation for:

Delete
Archive
Suspend
Block availability
Remove media
Delete pricing rule

Explain the consequences.

---

# 48. DATA INTEGRITY

The backend is authoritative.

Frontend must never:

* Invent prices
* Override availability
* Bypass permissions
* Directly modify database
* Assume booking availability
* Assume pricing validity

Every mutation goes through backend APIs.

---

# 49. CONCURRENCY

Handle:

Two admins editing the same property.

Two admins editing pricing.

Two admins modifying availability.

Two admins changing the same unit.

If conflict occurs:

Tell the user that the data changed.

Refresh latest state.

Do not silently overwrite newer data.

---

# 50. PERFORMANCE

For large inventories:

Use:

Server-side pagination
Server-side filtering
Debounced search
Caching where appropriate
Selective refetching

Do not fetch every property/unit/pricing rule at once.

---

# 51. ROUTES

Recommended:

/admin/properties

/admin/properties/[id]

/admin/properties/[id]/units

/admin/properties/[id]/units/[unitId]

/admin/properties/[id]/availability

/admin/properties/[id]/pricing

/admin/pricing

/admin/pricing/calendar

/admin/pricing/rules

Adapt to existing routing conventions instead of blindly replacing them.

---

# 52. TESTING

Test:

Property creation
Property editing
Property publishing
Property suspension
Unit creation
Unit editing
Unit blocking
Availability updates
Location selection
GPS permission handling
Map link parsing
Invalid location links
Invalid coordinates
Pricing creation
Pricing update
Pricing conflicts
Pricing calendar
Price preview
Permissions
Unauthorized actions
Loading states
Error states
Empty states

---

# 53. LOCATION TEST CASES

At minimum test:

1. Valid Google Maps URL.
2. Google Maps URL with `@lat,lng`.
3. Direct coordinate URL.
4. Invalid URL.
5. URL without coordinates.
6. GPS permission granted.
7. GPS permission denied.
8. Invalid latitude.
9. Invalid longitude.
10. Backend validation failure.
11. Existing property location editing.
12. Removing/changing location if allowed.

---

# 54. FINAL VALIDATION

Before declaring completion:

Run:

TypeScript checks
Lint
Unit tests
Integration tests
Existing backend tests
Existing frontend tests

Verify:

No broken imports.

No broken routes.

No console errors.

No fake endpoints.

No fake data.

No unauthorized operations.

No sensitive data leakage.

No invalid pricing calculations.

No invalid location data.

No duplicate business logic.

---

# 55. IMPLEMENTATION ORDER

Follow exactly:

PHASE 1
Audit existing architecture.

PHASE 2
Map existing database/API capabilities.

PHASE 3
Implement/reuse Property management.

PHASE 4
Implement Units/Villas.

PHASE 5
Implement Location management.

PHASE 6
Implement Availability.

PHASE 7
Implement Pricing Engine.

PHASE 8
Implement Pricing Calendar.

PHASE 9
Implement Price Preview.

PHASE 10
Implement permissions and authorization checks.

PHASE 11
Implement loading/error/empty states.

PHASE 12
Testing.

PHASE 13
UX polish.

---

# 56. IMPORTANT: DO NOT OVERBUILD

Do not introduce:

Kubernetes
Redis
Kafka
RabbitMQ
Microservices
New authentication
New database
New state-management framework
New UI framework

unless the existing project genuinely requires them.

Use the current GouNow architecture.

---

# 57. FINAL REPORT

When finished, report:

1. Files changed.
2. Components created.
3. Routes created/modified.
4. API endpoints consumed.
5. Backend endpoints added.
6. Database changes.
7. Permissions used.
8. Location implementation.
9. Google Maps link formats supported.
10. Pricing engine implementation.
11. Pricing hierarchy.
12. Availability implementation.
13. Tests added.
14. Tests executed.
15. Errors discovered.
16. Errors fixed.
17. Remaining limitations.

Do not claim a feature is complete if it is only visually implemented.

Every action visible in the UI must either work with the real backend or clearly indicate that the backend capability is unavailable.
