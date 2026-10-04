PHASE 14 — NEXT.JS ↔ LARAVEL BACKEND FULL INTEGRATION

ROLE

You are the Senior Full-Stack Integration Engineer, Next.js Architect, Laravel API Integration Engineer, Security Engineer, QA Engineer, and E2E Test Engineer responsible for integrating the existing Next.js frontend with the existing Laravel backend.



Your job is to connect the existing frontend to the existing backend correctly and completely.



You are NOT being asked to redesign the website.



You are NOT being asked to create a new backend.



You are NOT being asked to replace the existing Laravel API.



You are NOT allowed to invent API behavior when the real backend already defines it.



The Laravel backend is the source of truth for:



authentication

authorization

API contracts

validation

business rules

payment behavior

booking behavior

resource ownership

data structure

error semantics

HTTP status codes



The Next.js frontend must adapt to the existing backend.

PRIMARY OBJECTIVE

Connect the existing:

Next.js Frontend
        ↓
Laravel REST API
        ↓
PostgreSQL
        ↓
Redis / Queue / Storage / External Services


and make the application function as one integrated system.



The final result must allow real users to:



browse public content

authenticate

register/login/logout

manage their account

browse available resources

create bookings/orders where supported

view their own data

upload files/media where supported

interact with payments where supported

receive backend validation errors correctly

handle loading states

handle empty states

handle errors

respect authorization

preserve the existing UI design

ABSOLUTE RULES

RULE 1 — DO NOT REDESIGN THE FRONTEND

Preserve the existing:



visual design

colors

spacing

typography

layout

responsive behavior

components

navigation

animations

UX patterns



Do not redesign pages just because the API integration requires changes.



If a page currently uses static/mock data, replace the data source while preserving its presentation.

RULE 2 — LARAVEL BACKEND IS THE SOURCE OF TRUTH

Do not modify backend behavior simply to make frontend integration easier.



Before changing anything:



Inspect the Laravel routes.

Inspect controllers.

Inspect Form Requests.

Inspect API Resources.

Inspect authentication middleware.

Inspect policies.

Inspect validation.

Inspect response structures.

Inspect status codes.

Inspect tests.



Only modify Laravel if a genuine integration defect is discovered.



Do not create duplicate business logic in Next.js.

RULE 3 — NO MOCK DATA IN PRODUCTION CODE

Search for:

mock
dummy
fake
sample
placeholder
hardcoded API response
static JSON
temporary array


Do not leave fake backend data powering production pages.



If mock data is necessary for UI-only components, clearly isolate it and ensure production paths use the real API.

RULE 4 — DO NOT INVENT ENDPOINTS

Never assume:

/api/login
/api/users
/api/bookings


or any other endpoint exists.



Discover the actual backend routes.



Use the real API contract.

RULE 5 — DO NOT EXPOSE SECRETS

Never put these into:

NEXT_PUBLIC_*


or browser-side code:



backend secrets

payment secret keys

database credentials

private API keys

webhook secrets

internal tokens



Only public configuration may be exposed to the browser.

RULE 6 — SECURITY FIRST

Frontend security must respect backend security.



Never trust:



user ID from frontend

price from frontend

role from frontend

payment status from frontend

booking status from frontend

authorization flags from frontend



The backend remains authoritative.

RULE 7 — DO NOT DISABLE SECURITY TO MAKE IT WORK

Never solve integration problems by:



disabling CORS

allowing * credentials

removing authentication

bypassing authorization

exposing private endpoints

putting secrets in frontend code

disabling HTTPS requirements

trusting arbitrary frontend headers

RULE 8 — WORK IN PHASES

Do not blindly modify the entire application.



Follow:

Discovery
↓
API Mapping
↓
Integration Architecture
↓
Infrastructure Configuration
↓
Authentication
↓
Public APIs
↓
Protected APIs
↓
Forms
↓
Uploads
↓
Payments
↓
Error Handling
↓
Testing
↓
E2E Verification
↓
Final Certification


STAGE 0 — REPOSITORY DISCOVERY

Inspect both projects.



Determine:

Frontend root
Backend root
Frontend framework
Next.js version
React version
TypeScript/JavaScript
Laravel version
PHP version
Package manager
Build system


Inspect:

pwd
ls -la
find . -maxdepth 2 -type f


Inspect Git:

git status
git branch --show-current
git log -n 10 --oneline


Do not modify anything during the initial discovery.

STAGE 1 — FRONTEND ARCHITECTURE AUDIT

Inspect:

app/
pages/
components/
features/
lib/
services/
hooks/
providers/
contexts/
types/
utils/
public/


depending on the actual project structure.



Determine:



App Router or Pages Router

Server Components

Client Components

API utilities

authentication implementation

state management

forms

validation

routing

layouts

loading UI

error UI

reusable components



Do not assume the project uses any particular structure.

STAGE 2 — BACKEND API DISCOVERY

Inspect Laravel:

routes/api.php
routes/web.php
app/Http/Controllers/
app/Http/Requests/
app/Http/Resources/
app/Models/
app/Policies/
app/Services/
app/Actions/
app/Http/Middleware/


Extract every endpoint.



Create an API inventory.



Use this structure:

Method

Endpoint

Auth

Permission

Request

Response

Status

Include:



public endpoints

authenticated endpoints

admin endpoints

payment endpoints

webhook endpoints

upload endpoints

STAGE 3 — API CONTRACT MAPPING

For every endpoint document:

HTTP method
URL
Authentication
Authorization
Headers
Query parameters
Path parameters
Request body
Validation
Response structure
Error structure
Status codes
Pagination
Sorting
Filtering


Create:

docs/integration/FRONTEND_BACKEND_API_MAP.md


Do not invent missing information.



Use actual source code.

STAGE 4 — FRONTEND ↔ BACKEND DATA MAPPING

For every frontend data model determine:

Frontend field
Backend field
Type
Nullable
Transformation
Read-only
Writable


Example:

Frontend:
booking.id

Backend:
booking.id

Frontend:
booking.totalPrice

Backend:
booking.total_price


Create explicit transformation logic where necessary.



Do not scatter field transformations throughout components.

STAGE 5 — API CLIENT ARCHITECTURE

Create or improve a centralized API layer.



Do NOT make raw fetch() calls everywhere.



Prefer a structure such as:

src/
  lib/
    api/
      client.ts
      errors.ts
      auth.ts
      bookings.ts
      users.ts
      payments.ts
      uploads.ts


Adapt this to the existing project architecture.



The exact folder structure is not mandatory.



The principles are mandatory:



centralized HTTP behavior

consistent headers

consistent error handling

authentication handling

request timeout behavior

response parsing

typed responses

reusable API functions

STAGE 6 — API CLIENT REQUIREMENTS

The API client must support:

GET
POST
PUT
PATCH
DELETE
multipart/form-data
JSON
query parameters
path parameters
authentication
timeouts
error normalization


Do not manually concatenate URLs throughout the application.



Use a centralized base URL.

STAGE 7 — ENVIRONMENT CONFIGURATION

Create appropriate environment configuration.



Example:

NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1


Only use NEXT_PUBLIC_ for values that are safe to expose to the browser.



Private values must remain server-side.



Create/update:

.env.example


Never commit:

.env
.env.local
production secrets


STAGE 8 — LOCAL DEVELOPMENT TOPOLOGY

The local architecture should be:

Browser
   ↓
Next.js
http://localhost:3000
   ↓
Laravel API
http://127.0.0.1:8000
   ↓
PostgreSQL
   ↓
Redis
   ↓
Storage / Queue


Configure the frontend to communicate with the real local Laravel backend.



Do not use mock API responses.

STAGE 9 — CORS

Inspect Laravel CORS configuration.



Allow only required frontend origins.



For local development:

http://localhost:3000


and/or:

http://127.0.0.1:3000


depending on actual usage.



Do not blindly use:

*


with credentials.



Verify:



methods

headers

credentials

preflight

Authorization

Content-Type

STAGE 10 — AUTHENTICATION ARCHITECTURE

First determine which authentication mechanism Laravel actually uses.



Possible examples:



Sanctum cookie authentication

bearer tokens

JWT

session authentication

custom token



DO NOT assume.



Implement the frontend according to the actual backend.

STAGE 11 — AUTHENTICATION FLOWS

Implement and test:

Register
Login
Logout
Current User
Session restoration
Token expiration
Unauthorized response
Password reset if available
Email verification if available


Frontend must correctly handle:

401
403
419


where applicable.

STAGE 12 — AUTH STATE

Create a single source of truth for authentication state.



Avoid having:

Header auth state
Dashboard auth state
Profile auth state
Booking auth state


all independently determine authentication.



Use one coherent authentication architecture.

STAGE 13 — SERVER VS CLIENT AUTH

Respect Next.js architecture.



Determine which operations should run:

Server-side


and which require:

Client-side


Do not expose sensitive tokens unnecessarily to client JavaScript.



Do not move sensitive server logic into browser code merely to simplify integration.

STAGE 14 — PUBLIC API INTEGRATION

Connect all public pages to real APIs.



Examples:

Homepage
Categories
Listings
Properties
Trips
Events
Services
Search
Details pages


Only implement what actually exists in the backend.



For every page:

Loading
Success
Empty
Error
Retry


must be handled.

STAGE 15 — SEARCH / FILTER / SORT

Map frontend controls to actual backend query parameters.



Verify:

search
category
location
price
date
availability
sort
page
per_page


only where supported.



Never send fake query parameters and assume the backend understands them.

STAGE 16 — PAGINATION

Use backend pagination.



Never load an unbounded dataset simply because the frontend can display it.



Handle:

current page
total
per page
last page
next page
previous page


according to the actual backend response.

STAGE 17 — PROTECTED RESOURCES

Connect authenticated pages:

Profile
Bookings
Orders
Favorites
Dashboard
Notifications
Account settings


where supported.



Every protected request must rely on backend authorization.



Do not use frontend route guards as the security boundary.



Frontend guards are UX only.

STAGE 18 — FORMS

Connect all existing forms to Laravel.



For every form:

Submit
Loading
Success
Validation errors
Server errors
Network failure
Retry


Map Laravel validation errors to the correct form fields.



Example:

{
  "message": "...",
  "errors": {
    "email": [
      "..."
    ]
  }
}


Do not display raw technical errors to users.

STAGE 19 — FORM VALIDATION

Frontend validation may improve UX.



But it must NOT replace backend validation.



Frontend validation should match backend rules where practical.



Backend remains authoritative.

STAGE 20 — ERROR NORMALIZATION

Create one normalized frontend error model.



Example concept:

ApiError
  status
  message
  fieldErrors
  code
  requestId


Adapt to actual backend responses.



Support:

400
401
403
404
409
422
429
500
502
503


STAGE 21 — HTTP STATUS BEHAVIOR

Define frontend behavior:

401 → authentication required
403 → permission denied
404 → resource not found
409 → conflict
422 → validation
429 → rate limited
500 → server error
503 → service unavailable


Do not display the same generic message for everything.

STAGE 22 — REQUEST ID / CORRELATION

If Laravel exposes request/correlation IDs:



Capture them.



Include them in error reporting.



When a request fails, users/support should be able to correlate:

Frontend error
      ↓
Request ID
      ↓
Laravel logs


Do not expose sensitive log data.

STAGE 23 — FILE UPLOAD INTEGRATION

Connect supported upload functionality.



Handle:

multipart/form-data
progress if useful
size limits
MIME types
server validation
upload errors
authorization
delete
preview


Do not trust frontend MIME validation.



Laravel remains authoritative.

STAGE 24 — IMAGE / MEDIA DISPLAY

Use backend-provided media URLs.



Respect:



signed URLs

private files

expiration

authorization



Do not make private storage publicly accessible simply to simplify frontend display.

STAGE 25 — PAYMENT FRONTEND INTEGRATION

Payment integration must use the backend's real flow.



DO NOT:



calculate final payable amount only in frontend

trust frontend price

expose secret payment credentials

mark bookings paid from frontend

directly modify payment status



The frontend should:

Create payment intent/session/order
       ↓
Receive backend-controlled payment information
       ↓
Open provider checkout where applicable
       ↓
Return/refresh
       ↓
Ask backend for authoritative status


Backend remains the source of truth.

STAGE 26 — PAYMENT STATUS

Never infer payment success solely from:

URL query
frontend callback
local state
provider redirect


Ask the backend for the authoritative status.



Handle:

pending
paid
failed
cancelled
refunded
partially_refunded


only if these states actually exist.

STAGE 27 — WEBHOOKS

The frontend must NOT process provider webhooks.



Webhook flow:

Payment Provider
      ↓
Laravel Backend
      ↓
Database
      ↓
Frontend reads authoritative state


Never expose webhook secrets to Next.js.

STAGE 28 — BOOKING INTEGRATION

For booking flows:

Select resource
↓
Select dates/options
↓
Send request
↓
Backend validates availability
↓
Backend calculates authoritative price
↓
Backend creates booking
↓
Frontend displays returned booking


Do not trust frontend availability.



Do not trust frontend pricing.



Do not implement duplicate booking rules in the frontend.

STAGE 29 — DUPLICATE SUBMISSION PROTECTION

Prevent accidental repeated submissions.



Examples:



disable submit while pending

use request state

use backend idempotency where supported



Do not rely only on button disabling.



Backend must remain the final protection.

STAGE 30 — LOADING STATES

Every API-dependent UI must have appropriate loading behavior.



Avoid:

blank page
frozen button
layout jumping
infinite spinner


Use existing design language.

STAGE 31 — EMPTY STATES

Handle:

No bookings
No search results
No favorites
No notifications
No available resources
No media


Do not treat empty data as an error.

STAGE 32 — ERROR UI

Create reusable error states.



Examples:

Network error
Unauthorized
Forbidden
Not found
Validation error
Server error
Service unavailable


Provide retry where appropriate.

STAGE 33 — ROUTING

Connect routes to real backend data.



Verify:

/listings
/listings/[id]
/booking/[id]
/profile
/dashboard


or whatever actual frontend routes exist.



Handle invalid IDs and missing resources.

STAGE 34 — NEXT.JS SERVER / CLIENT BOUNDARIES

Audit every API call.



Determine whether it belongs in:

Server Component
Server Action
Route Handler
Client Component


Do not expose private credentials or tokens unnecessarily.



Avoid turning the entire application into Client Components just to simplify API calls.

STAGE 35 — OPTIONAL BFF LAYER

Only introduce a Next.js backend-for-frontend layer if there is a real architectural/security reason.



Do NOT create:

Next.js API
      ↓
Laravel API


for every endpoint by default.



Avoid unnecessary duplication.

STAGE 36 — STATE MANAGEMENT

Inspect existing state management.



Do not introduce Redux/Zustand/etc. unless genuinely needed.



Server state should not automatically become global client state.



Prefer:



server fetching

local component state

existing project state management

caching only where useful

STAGE 37 — DATA CACHING

If using Next.js caching:



Be extremely careful with authenticated/personalized data.



Never accidentally cache:

User A response


and serve it to:

User B


Authenticated responses should be treated carefully.



Verify:



cache headers

revalidation

dynamic rendering

cookies

authorization

STAGE 38 — SECURITY AUDIT OF FRONTEND

Search for:

dangerouslySetInnerHTML
eval(
innerHTML
localStorage
sessionStorage
document.cookie
NEXT_PUBLIC_


Determine whether each use is safe.



Avoid storing sensitive credentials in localStorage unless explicitly required and justified.

STAGE 39 — XSS PROTECTION

Do not render backend-provided HTML blindly.



If HTML must be rendered:



sanitize it

document the reason

test malicious payloads



Test:

<script>
<img onerror=...>
javascript:


STAGE 40 — URL SECURITY

Do not blindly redirect based on user-controlled URLs.



Audit:

redirect
returnUrl
callbackUrl
next
continue


Prevent open redirects.

STAGE 41 — TYPESCRIPT CONTRACTS

If the project uses TypeScript:



Create accurate types for API responses.



Avoid:

any


for API contracts unless absolutely necessary.



Prefer:

interface
type
unknown
runtime validation where appropriate


Do not create types that contradict Laravel.

STAGE 42 — RUNTIME VALIDATION

For critical external/API data, consider runtime validation if needed.



Especially:



payment responses

authentication

user

booking

financial information



Do not blindly trust JSON shape.

STAGE 43 — ACCESSIBILITY

While integrating APIs, preserve and improve where necessary:



keyboard navigation

labels

focus states

errors

aria attributes

loading announcements



Do not redesign the UI.

STAGE 44 — RESPONSIVE BEHAVIOR

API integration must not break:



mobile

tablet

desktop



Test all major states.

STAGE 45 — PERFORMANCE

Avoid:

request waterfalls
duplicate API requests
unnecessary re-renders
fetching entire datasets
large client bundles
unnecessary client components


Use appropriate:



server fetching

caching

pagination

lazy loading

STAGE 46 — API REQUEST DEDUPLICATION

Search for situations where the same API is called multiple times unnecessarily.



Examples:

Layout fetches user
Header fetches user
Dashboard fetches user
Profile fetches user


Determine whether requests can be safely reused.



Do not over-cache personalized data.

STAGE 47 — NETWORK FAILURE

Simulate:

backend offline
slow backend
timeout
500
503
connection refused


The frontend must fail gracefully.

STAGE 48 — BACKEND VALIDATION FAILURE

For every important form test:

valid request
invalid request
missing field
wrong type
duplicate value
unauthorized
forbidden
conflict


Verify correct UI behavior.

STAGE 49 — AUTH EXPIRATION

Test:

User logged in
↓
Session/token expires
↓
API returns 401
↓
Frontend handles it


Do not leave the UI in a broken authenticated state.

STAGE 50 — MULTI-USER SECURITY TEST

Create:

User A
User B
Admin
Guest


Verify:

User A cannot access User B data.
User cannot access admin data.
Guest cannot access protected data.


Do not rely on frontend hiding buttons.



Verify actual API responses.

STAGE 51 — E2E TESTING

Use the project's existing browser/E2E tooling if available.



Test complete flows.



At minimum:

Public

Open homepage
Browse
Search
Open details


Authentication

Register
Login
Refresh
Logout


Account

Open profile
Update profile


Booking

Browse
Select
Create booking
View booking


where applicable.

Payment

Create payment
Redirect/checkout
Return
Refresh status


using sandbox/test mode where available.

Security

Unauthorized request
Forbidden request
IDOR attempt
Expired authentication


STAGE 52 — API TESTING

Run backend API tests again.



Frontend integration must not modify backend behavior unexpectedly.



Run:

php artisan test --env=testing


and the project's API/security suites.

STAGE 53 — FRONTEND TESTING

Run the actual frontend scripts discovered from package.json.



Examples:

npm run lint
npm run typecheck
npm run test
npm run build


Only run commands that actually exist.



Do not invent scripts.

STAGE 54 — PRODUCTION BUILD

The Next.js production build must succeed.



Example:

npm run build


Resolve:



TypeScript errors

lint errors

build errors

invalid environment configuration

server/client boundary issues

hydration errors

STAGE 55 — HYDRATION AUDIT

Check for:

hydration mismatch
window on server
document on server
localStorage during SSR
random values during SSR
date mismatch
client-only APIs


Fix properly.



Do not simply disable SSR unnecessarily.

STAGE 56 — ENVIRONMENT MATRIX

Document:

Environment

Frontend API URL

Backend URL

Payment

Local

localhost

localhost

sandbox

Staging

staging domain

staging API

sandbox/test

Production

production domain

production API

live

Never hardcode production URLs.

STAGE 57 — LOCAL INTEGRATION CERTIFICATION

Before staging verify:

Next.js running
Laravel running
Database running
Redis running
Queues running if required
Storage working
Authentication working
Public APIs working
Protected APIs working
Uploads working
Payments sandbox working


STAGE 58 — FINAL SECURITY REVIEW

Search frontend source for:

secret
password
token
api_key
private_key
NEXT_PUBLIC_
console.log
console.error
debugger


Review every result.



Remove accidental sensitive logging.



Do not blindly remove useful production error logging.

STAGE 59 — CLEANUP

Remove:



temporary mock data

debug code

temporary API endpoints

unused API clients

duplicated fetch functions

dead integration code

hardcoded test credentials

temporary console logs

TODOs that indicate incomplete integration



Do not remove legitimate documentation or useful logging.

STAGE 60 — DOCUMENTATION

Create:

docs/integration/FRONTEND_BACKEND_INTEGRATION.md
docs/integration/FRONTEND_BACKEND_API_MAP.md
docs/integration/LOCAL_DEVELOPMENT.md
docs/integration/ENVIRONMENT_MATRIX.md
docs/integration/E2E_TEST_REPORT.md


Document:



architecture

API mapping

authentication

local setup

environment variables

common errors

testing

deployment assumptions

STAGE 61 — FINAL INTEGRATION AUDIT

Verify:

No fake API data
No invented endpoints
No broken routes
No authentication bypass
No authorization bypass
No secret exposure
No payment trust issue
No duplicate critical requests
No uncontrolled caching
No broken SSR
No hydration errors
No production build errors
No TypeScript errors
No lint errors


STAGE 62 — FULL VERIFICATION

Run all actual available checks.



Backend:

php artisan test --env=testing
./vendor/bin/phpstan analyse app routes --memory-limit=1G
./vendor/bin/pint --test
composer audit


Frontend:

npm run lint
npm run typecheck
npm run test
npm run build


Only run scripts that actually exist.



Also run:

E2E tests
API tests
Security tests


where available.

STAGE 63 — GIT AUDIT

Run:

git status
git diff
git diff --cached
git log -n 10 --oneline


Ensure:



no secrets

no .env

no credentials

no temporary files

no generated junk

no unintended backend changes

STAGE 64 — FINAL REPORT

Create:

docs/integration/PHASE_14_FRONTEND_BACKEND_FINAL_REPORT.md


The report must include:

Executive Summary

Frontend Architecture

Backend API Architecture

Integration Architecture

Authentication

Authorization

API Mapping

Data Mapping

Forms

Uploads

Payments

Error Handling

Performance

Security

E2E Testing

Build Verification

Environment Configuration

Known Limitations

Remaining Conditions

FINAL TEST TABLE

Use:

Check

Result

Evidence

Backend tests

PASS/FAIL

command

Security tests

PASS/FAIL

command

API tests

PASS/FAIL

command

Frontend lint

PASS/FAIL

command

TypeScript

PASS/FAIL

command

Frontend tests

PASS/FAIL

command

Production build

PASS/FAIL

command

E2E

PASS/FAIL

command

Authentication

PASS/FAIL

evidence

Authorization

PASS/FAIL

evidence

Payments

PASS/FAIL

evidence

Uploads

PASS/FAIL

evidence

CORS

PASS/FAIL

evidence

FINAL STATUS

Return exactly one:

INTEGRATION READY


or:

INTEGRATION READY WITH CONDITIONS


or:

NOT READY


BLOCKER CLASSIFICATION

P0

Critical integration/security failure.

P1

Major authentication, authorization, payment, data, or functional failure.

P2

High-impact integration issue.

P3

Medium issue.

P4

Minor cleanup.



No P0/P1 issue may remain for:

INTEGRATION READY


IMPORTANT: DO NOT CLAIM SUCCESS WITHOUT EVIDENCE

Never say:

Everything works.


unless tested.



Never say:

Payment works.


unless payment flow was actually tested.



Never say:

Authentication works.


unless login/session/authorization were tested.



Never say:



unless the actual production build and required checks passed.



If something cannot be tested locally, explicitly state:

NOT VERIFIED LOCALLY


and explain why.

DEFINITION OF DONE

This phase is complete only when:



 Frontend architecture audited

 Backend routes audited

 API contract mapped

 Data models mapped

 API client centralized

 Environment configuration completed

 CORS verified

 Authentication integrated

 Logout integrated

 Session/token expiration handled

 Protected routes integrated

 Authorization behavior verified

 Public APIs integrated

 Forms integrated

 Validation errors integrated

 Pagination integrated

 Search/filter integrated where supported

 Uploads integrated

 Media access verified

 Booking flow integrated

 Payment flow integrated where applicable

 Payment status verified from backend

 Webhooks remain backend-only

 Loading states implemented

 Empty states implemented

 Error states implemented

 Network failures handled

 401/403/404/409/422/429/500/503 handled

 Request correlation supported where available

 Frontend security audited

 XSS risks audited

 Open redirects audited

 Sensitive storage audited

 Caching audited

 Server/client boundaries audited

 TypeScript/API types verified

 Accessibility preserved

 Responsive behavior preserved

 Performance audited

 Duplicate requests audited

 Multi-user authorization tested

 E2E flows tested

 Backend test suite passes

 Frontend lint passes

 TypeScript passes

 Frontend tests pass

 Production build passes

 No secrets committed

 Documentation generated

 Git tree reviewed

 Final report generated

FINAL ARCHITECTURE

The desired result is:

                         INTERNET
                            │
                            ▼
                    Next.js Frontend
                            │
                            │ HTTPS / API
                            ▼
                    Laravel REST API
                            │
             ┌──────────────┼──────────────┐
             ▼              ▼              ▼
        PostgreSQL        Redis        File Storage
             │              │
             │              ▼
             │         Queue Workers
             │
             ▼
       Business Logic
             │
      ┌──────┼──────────┐
      ▼      ▼          ▼
   Booking Payment    External APIs
                      / Webhooks


The frontend is responsible for:

Presentation
UX
Navigation
Forms
Client-side validation
Loading states
Error display
API consumption


The backend is responsible for:

Authentication
Authorization
Business rules
Validation
Pricing
Booking integrity
Payment integrity
Database integrity
Webhooks
Security


Never move backend responsibilities into the frontend.

FINAL INSTRUCTION

This is an integration phase, not a redesign phase.



Preserve the existing frontend design.



Preserve the hardened backend.



Connect them correctly.



Do not weaken backend security.



Do not invent APIs.



Do not create unnecessary infrastructure.



Do not create unnecessary abstractions.



Do not leave mock data powering production functionality.



Do not claim completion without evidence.



At the end, produce the complete integration report and clearly state whether the system is ready to move from:

LOCAL


to:

STAGING


END OF PHASE 14.