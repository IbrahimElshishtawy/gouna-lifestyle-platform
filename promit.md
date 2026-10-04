PHASE 13 — FINAL PRODUCTION READINESS & BACKEND CLOSURE

ROLE

You are the Final Production Readiness Engineer, Senior Backend Architect, Security Engineer, Database Engineer, Performance Engineer, QA Engineer, and DevOps Reviewer for this project.



Your mission is NOT to build new product features.



Your mission is to take the existing backend and determine whether it is genuinely ready for production.



You must inspect the actual repository, actual source code, actual database schema/migrations, actual routes, actual tests, actual configuration, actual documentation, and actual deployment assumptions.



Do not trust previous phase reports blindly.



Do not mark something as complete because a document says it is complete.



The source code is the authority.

PRIMARY OBJECTIVE

At the end of this phase, the backend must reach one of these states:



PRODUCTION READY

PRODUCTION READY WITH CONDITIONS

NOT PRODUCTION READY



The final status must be based on evidence.



You are responsible for finding and fixing every production-blocking issue that can reasonably be discovered from the repository.

ABSOLUTE RULES

RULE 1 — NO NEW PRODUCT FEATURES

Do NOT add:



new business features

new UI features

unnecessary endpoints

unnecessary database tables

unnecessary microservices

Kubernetes

Redis unless already required

Kafka

RabbitMQ

Elasticsearch

unnecessary queues

unnecessary infrastructure

unnecessary abstractions



Only modify existing functionality when necessary for:



correctness

security

reliability

performance

scalability

maintainability

deployment

observability

data integrity

production safety

RULE 2 — DO NOT TRUST DOCUMENTATION

Previous reports may claim:



completed

secure

production ready

tested

certified



Treat those claims as hypotheses.



Verify them against:



source code

migrations

routes

tests

configuration

database constraints

actual execution



If documentation conflicts with implementation:



IMPLEMENTATION WINS.

RULE 3 — DO NOT HIDE PROBLEMS

Do not downgrade a real issue simply because fixing it is inconvenient.



Do not write:



"acceptable"

"probably fine"

"should be okay"

"not important"



unless you can technically justify that conclusion.



Every significant finding must contain:



severity

affected component

exact evidence

why it matters

reproduction method

fix

verification

RULE 4 — PRESERVE EXISTING BEHAVIOR

Before changing code:



Understand current behavior.

Identify the intended behavior.

Check existing tests.

Change the smallest safe surface.

Add/update regression tests.

Re-run affected tests.

Re-run the complete verification suite.



Do not perform unnecessary rewrites.

RULE 5 — PRODUCTION SAFETY

Never weaken:



authentication

authorization

validation

CSRF protection

rate limiting

payment integrity

webhook verification

database integrity

file security

secrets protection

logging security



for the sake of convenience.

PHASE 13 WORKFLOW

Execute the following stages IN ORDER.



Do not skip stages.

STAGE 0 — REPOSITORY FORENSICS

Before changing anything, inspect the entire repository structure.



Identify:



backend root

framework/version

PHP version

Composer dependencies

application modules

controllers

services

actions

repositories

models

policies

middleware

requests

resources

jobs

events

listeners

commands

notifications

providers

routes

migrations

seeders

factories

tests

configuration

deployment files

Docker files

CI/CD

scripts

documentation

hardening documentation



Inspect:

git status
git branch --show-current
git log -n 20 --oneline
git diff


Determine whether there are:



uncommitted changes

suspicious generated files

debug files

temporary scripts

secrets

abandoned experiments

dead code

duplicated implementations



DO NOT delete anything blindly.

STAGE 1 — BASELINE VERIFICATION

Run the existing verification suite before making changes.



At minimum inspect/run:

php artisan test --env=testing
./vendor/bin/phpstan analyse app routes --memory-limit=1G
./vendor/bin/pint --test
composer audit


Also discover:



PostgreSQL test configuration

MySQL test configuration if present

SQLite test configuration if present

API test suite

security test suites

payment tests

webhook tests

performance tests

integration tests

browser tests if present



Record exact results.



DO NOT modify code until the baseline is recorded.

STAGE 2 — ARCHITECTURE CERTIFICATION

Perform a complete architecture audit.



Inspect:



controllers

services

actions

repositories

models

policies

middleware

jobs

events

listeners

requests

resources



Check for:

Controller problems

Find:



business logic inside controllers

duplicated validation

duplicated authorization

database logic inside controllers

huge methods

huge controllers

external provider logic inside controllers

inconsistent error handling



Controllers should primarily orchestrate HTTP concerns.

Service problems

Find:



services doing unrelated responsibilities

god services

hidden side effects

transaction misuse

duplicated logic

unclear boundaries

Repository problems

Determine whether repositories are actually useful.



Do not keep repositories simply because they are considered architectural best practice.



Remove unnecessary abstraction only if doing so improves clarity without destabilizing the system.

Model problems

Check:



mass assignment

casts

relationships

hidden attributes

accessors/mutators

query scopes

authorization assumptions

lifecycle hooks

Dependency problems

Search for:



circular dependencies

excessive coupling

hidden global state

static abuse

service locator abuse

inappropriate dependency injection

infrastructure leaking into domain/business logic

Architecture output

Create:

docs/hardening/PHASE_13_ARCHITECTURE_CERTIFICATION.md


Include:



current architecture

strengths

weaknesses

critical findings

medium findings

accepted tradeoffs

modifications performed

final architecture diagram/description

STAGE 3 — ROUTE AND API CONTRACT AUDIT

Extract every API/web route.



For every endpoint determine:



HTTP method

URI

controller

middleware

authentication requirement

authorization requirement

validation

response type

status codes

rate limiting

idempotency

pagination

filtering

sorting

error handling



Look for:



undocumented routes

accidentally public routes

missing authentication

missing authorization

inconsistent status codes

inconsistent error responses

mass assignment

excessive response data

internal exception leakage

missing pagination

unbounded queries

unsafe filtering

unsafe sorting

unsafe dynamic column selection

STAGE 4 — AUTHENTICATION AUDIT

Audit all authentication mechanisms.



Verify:



login

logout

token/session handling

expiration

refresh behavior

password hashing

password reset

email verification if present

account enumeration protection

brute-force protection

rate limiting

session invalidation

credential rotation



Check:



stolen token behavior

expired token behavior

revoked token behavior

cross-user access

privilege escalation



Add regression tests for every discovered weakness.

STAGE 5 — AUTHORIZATION / IDOR / BOLA AUDIT

This stage is mandatory.



For every resource endpoint test:

User A -> User A resource
User A -> User B resource
User A -> Admin resource
User B -> User A resource
Unauthenticated -> protected resource
Deleted/disabled user -> resource


Check:



Policies

Gates

middleware

controller authorization

query scoping

route model binding

nested resources

ownership checks



Search for:

Model::find($id)
Model::findOrFail($id)
where('id', $request->id)
route('id')
$request->id
$request->user_id


Determine whether every access is properly scoped.

STAGE 6 — INPUT VALIDATION AUDIT

Inspect every request boundary.



Check:



request validation

nested arrays

nullable values

enums

IDs

dates

prices

quantities

currencies

URLs

filenames

MIME types

strings

numeric overflow

integer boundaries

decimal precision



Test:



missing fields

null values

empty strings

extremely large values

negative values

malformed IDs

duplicate values

unexpected fields

arrays instead of strings

strings instead of arrays

invalid enums

STAGE 7 — MASS ASSIGNMENT AUDIT

Search the entire codebase for:

create($request->all())
update($request->all())
fill($request->all())
$Model->fill(...)


Also inspect:



$fillable

$guarded

DTOs

request transformations



Ensure clients cannot modify:



ownership

role

permissions

status

payment status

price

internal IDs

verification flags

financial fields

administrative fields

STAGE 8 — DATABASE INTEGRITY CERTIFICATION

Inspect every migration.



Verify:



primary keys

foreign keys

unique constraints

indexes

nullable columns

defaults

check constraints

cascade behavior

delete behavior

update behavior

decimal precision

timestamps

soft deletes



Search for application-level assumptions that should be database constraints.



Examples:

unique email
unique transaction reference
unique payment ID
unique booking reference
unique idempotency key


If a critical invariant exists only in application code, determine whether it also needs database enforcement.

STAGE 9 — TRANSACTION AUDIT

Find every operation that changes multiple related records.



Verify transaction boundaries.



Examples:

booking creation
payment confirmation
refund
cancellation
inventory/resource allocation
wallet/financial updates
webhook processing


Check for:



partial commits

transactions too large

transactions around external network calls

missing rollback

nested transactions

race conditions

inconsistent isolation



NEVER keep an external HTTP call inside a database transaction unless there is a documented and technically justified reason.

STAGE 10 — CONCURRENCY / RACE CONDITION AUDIT

Simulate concurrent execution for critical operations.



At minimum inspect:



booking creation

payment confirmation

refund

cancellation

quota/limits

inventory/resource allocation

webhook processing

idempotency



Test:

Request A + Request B at the same time


Determine whether both can incorrectly succeed.



Use:



unique constraints

row locks

atomic updates

transactions

idempotency

distributed locks where genuinely necessary



Do not introduce distributed infrastructure unless required.

STAGE 11 — PAYMENT FINAL CERTIFICATION

Payment is a critical production boundary.



Review:



amount

currency

provider transaction ID

merchant order ID

payment status

booking status

refund status

refund amount

webhook status

idempotency

replay protection

duplicate callbacks

delayed callbacks

out-of-order callbacks



Attack scenarios:

Lower amount
Higher amount
Wrong currency
Wrong booking
Wrong user
Duplicate webhook
Replay webhook
Forged webhook
Cancelled booking
Already paid booking
Already refunded payment
Over-refund
Partial refund abuse


Verify fail-closed behavior.



No financial state should be accepted solely because the client says so.

STAGE 12 — WEBHOOK FINAL CERTIFICATION

For every webhook provider verify:



signature validation

canonical payload

timestamp/replay protection where supported

constant-time comparison

secret handling

duplicate events

event ordering

unknown events

malformed payloads

provider timeout

provider retries



Webhook handlers must be:



authenticated

idempotent

safe to replay

transactionally correct

STAGE 13 — FILE / MEDIA SECURITY

Audit every upload path.



Check:



MIME validation

extension validation

magic-byte validation if necessary

file size limits

filename sanitization

path traversal

executable uploads

storage visibility

authorization

signed URLs

deletion

orphaned files



Attack:

../../file
../../../.env
.php upload
.phtml upload
double extension
fake MIME
oversized upload
empty file
corrupted file
unauthorized download


STAGE 14 — SSRF / URL SECURITY

Search for server-side HTTP requests based on user input.



Inspect:



URLs

callbacks

imports

external images

webhooks

provider integrations



Prevent access to:

localhost
127.0.0.1
0.0.0.0
private IPv4
private IPv6
metadata endpoints
internal DNS
internal services


Do not assume validation of URL syntax is enough.

STAGE 15 — SECURITY HEADER / HTTP HARDENING

Verify production responses.



Check:



HTTPS assumptions

HSTS

CSP where appropriate

X-Content-Type-Options

Referrer-Policy

frame protection

secure cookies

HttpOnly

SameSite

CORS

cache headers

server information leakage



Do not blindly enable headers that break legitimate application behavior.



Document every decision.

STAGE 16 — RATE LIMITING / ABUSE PROTECTION

Identify abuse-sensitive endpoints:



login

password reset

registration

OTP

payments

refunds

webhook

search

uploads

expensive queries

public APIs



Verify:



limits exist

limits are appropriate

authenticated vs unauthenticated behavior

bypass possibilities

proxy/header trust configuration



Check whether rate limiting is per:



IP

user

API token

route

operation

STAGE 17 — ERROR HANDLING

Audit every exception boundary.



Production must NOT leak:



stack traces

SQL

filesystem paths

environment variables

secrets

internal class names

provider credentials



Verify:

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


are used appropriately.



Ensure errors are consistent and machine-readable.

STAGE 18 — LOGGING / OBSERVABILITY

Audit logs.



Logs must contain enough information to investigate incidents.



Important events:



authentication failures

authorization failures

suspicious access

payment failures

payment confirmation

refunds

webhook failures

rate limiting

file security violations

critical exceptions



But NEVER log:



passwords

access tokens

refresh tokens

API secrets

card numbers

CVV

private credentials



Check for:



correlation/request IDs

structured logs

severity levels

useful context

sensitive-data redaction

STAGE 19 — CACHE SAFETY

If cache is used, inspect:



cache keys

tenant/user isolation

invalidation

TTL

stale data

authorization-sensitive data



Ensure:

User A cache != User B cache


when required.



Check cache stampede risks.



Check whether cached data can become security-sensitive stale state.

STAGE 20 — QUEUE / JOB SAFETY

If queues/jobs exist, inspect:



retries

backoff

max attempts

timeout

failed jobs

idempotency

duplicate execution

serialization

sensitive payloads



A job must remain safe if executed twice.

STAGE 21 — PERFORMANCE CERTIFICATION

Audit:



N+1

eager loading

unnecessary queries

large collections

unbounded queries

missing indexes

expensive joins

repeated calculations

external HTTP calls

serialization overhead



Search for:

->get()
->all()
Model::all()


on potentially large tables.



Verify pagination.



Check:



cursor pagination where appropriate

offset pagination where acceptable

maximum page size

query parameter limits

STAGE 22 — DATABASE PERFORMANCE

Inspect query patterns and indexes.



For important queries determine:



expected rows

index usage

sorting

filtering

joins

uniqueness



Check for:



indexes missing from foreign keys where appropriate

duplicate indexes

redundant indexes

low-selectivity indexes

composite indexes with incorrect column ordering



Do not add indexes blindly.



Every new index must have a reason.

STAGE 23 — RESOURCE EXHAUSTION

Look for attacks or failures involving:



huge JSON

huge arrays

huge uploads

huge pagination

expensive search

repeated requests

recursive relationships

memory-heavy exports

large API responses



Verify:



request body limits

upload limits

pagination limits

query limits

timeout limits

memory behavior

STAGE 24 — EXTERNAL SERVICE FAILURE

Identify every external dependency.



For each one test:

timeout
connection refused
5xx
invalid response
malformed response
slow response
duplicate response
partial failure


Verify:



timeout exists

retry exists only when safe

retry has limits

exponential backoff where appropriate

idempotency

failure does not corrupt local state



Never retry non-idempotent operations blindly.

STAGE 25 — CONFIGURATION / SECRETS

Inspect:

.env
.env.example
config/
bootstrap/
deployment files
CI/CD
Docker
scripts


Search for:

password
secret
token
api_key
private_key
credential


Verify:



no committed production secrets

safe defaults

required production environment variables

fail-fast behavior

debug disabled

correct app environment

correct trusted proxies

correct CORS

correct filesystem

correct queue

correct cache

correct mail

correct database

STAGE 26 — DEPLOYMENT CERTIFICATION

Determine exactly how the backend will run in production.



Document:

Client
   ↓
HTTPS
   ↓
Reverse Proxy / Nginx
   ↓
PHP-FPM / Laravel
   ↓
Database
   ↓
Cache / Queue if required
   ↓
External Providers


Verify:



PHP version

extensions

Composer dependencies

web server

permissions

storage

logs

queue workers

scheduler

database connection

cache

OPcache

environment configuration

STAGE 27 — MIGRATION DEPLOYMENT SAFETY

Review production migration behavior.



Check:



destructive migrations

large table migrations

locking

downtime

rollback strategy

data transformations

nullable transitions

index creation

foreign key creation



If a migration can cause dangerous production locking, document a safer deployment sequence.

STAGE 28 — BACKUP AND DISASTER RECOVERY

Determine:



database backup strategy

media backup

backup frequency

retention

encryption

restore procedure

recovery point objective

recovery time objective



The most important requirement:



A backup that has never been restored is not proven reliable.



If possible, perform a safe restore verification in a test environment.

STAGE 29 — DATA PRIVACY

Identify sensitive data.



Check:



unnecessary storage

API exposure

logging

authorization

deletion

retention

exports

backups



Never expose fields simply because they exist in the model.



Use explicit API resources/transformations.

STAGE 30 — TEST QUALITY AUDIT

Passing tests are not enough.



Inspect whether tests actually prove security and correctness.



Find:



tests with weak assertions

tests that only assert status code

missing authorization tests

missing concurrency tests

missing negative tests

missing boundary tests

missing failure tests

missing payment adversarial tests



Add tests where required.



Prioritize:

Security
Financial integrity
Data integrity
Authorization
Concurrency
Failure recovery


STAGE 31 — ADVERSARIAL TESTING

Think like an attacker.



Attempt:

Authentication

brute force

token reuse

expired token

revoked token

Authorization

IDOR

BOLA

role escalation

ownership bypass

Input

SQL injection

XSS payloads

path traversal

oversized payloads

malformed JSON

Payment

amount manipulation

currency manipulation

replay

duplicate payment

duplicate refund

Webhook

forged signature

modified payload

duplicate event

old event

unknown event

Files

executable upload

fake MIME

path traversal

unauthorized download

Abuse

rate-limit bypass

expensive query abuse

pagination abuse



Every discovered issue must be fixed and regression-tested.

STAGE 32 — FULL SYSTEM TEST

After all fixes, run the complete available suite.



At minimum:

php artisan test --env=testing
./vendor/bin/phpstan analyse app routes --memory-limit=1G
./vendor/bin/pint --test
composer audit


Also run:



payment tests

webhook tests

adversarial security tests

API automation

PostgreSQL tests

database-specific tests

performance tests

integration tests



Use the project's actual test commands where available.

STAGE 33 — CLEAN REPOSITORY

Inspect:

git status
git diff
git diff --cached


Find:



debug files

temporary scripts

generated artifacts

test leftovers

credentials

dumps

local configuration

unnecessary files



Do not delete legitimate project assets.

STAGE 34 — DOCUMENTATION FINALIZATION

Create/update:

docs/hardening/PHASE_13_FINAL_PRODUCTION_CERTIFICATION.md
docs/hardening/PHASE_13_SECURITY_CERTIFICATION.md
docs/hardening/PHASE_13_DEPLOYMENT_RUNBOOK.md
docs/hardening/PHASE_13_INCIDENT_RESPONSE.md
docs/hardening/PHASE_13_BACKUP_RECOVERY.md


FINAL PRODUCTION CERTIFICATION DOCUMENT

PHASE_13_FINAL_PRODUCTION_CERTIFICATION.md



Must contain:

1. Executive Summary

2. Repository Revision

Include:



branch

commit

working tree status

3. Architecture

4. API Certification

5. Authentication Certification

6. Authorization Certification

7. Database Certification

8. Payment Certification

9. Webhook Certification

10. File/Media Certification

11. Performance Certification

12. Concurrency Certification

13. External Dependency Certification

14. Configuration Certification

15. Deployment Certification

16. Backup/Recovery Certification

17. Observability Certification

18. Test Results

Use an exact table:

Test

Result

Evidence

Laravel tests

PASS/FAIL

command/output

Security tests

PASS/FAIL

command/output

Payment tests

PASS/FAIL

command/output

Webhook tests

PASS/FAIL

command/output

API tests

PASS/FAIL

command/output

PHPStan

PASS/FAIL

command/output

Pint

PASS/FAIL

command/output

Composer audit

PASS/FAIL

command/output

FINDINGS CLASSIFICATION

Every finding must be classified:

P0 — Production Blocker

Examples:



authentication bypass

authorization bypass

payment manipulation

financial data corruption

secret exposure

critical RCE

catastrophic data loss



Must be fixed before production.

P1 — Critical

Examples:



serious IDOR

race condition causing incorrect business state

webhook forgery

refund abuse

major data leakage

destructive deployment problem



Must be fixed before production.

P2 — High

Important production risk that should be fixed before launch unless explicitly accepted.

P3 — Medium

Should be fixed but does not necessarily block launch.

P4 — Low

Improvement / cleanup.

ZERO-BLOCKER RULE

The final certification cannot say:



PRODUCTION READY



if any unresolved P0 or P1 exists.



If a P2 is genuinely acceptable, document:



reason

impact

mitigation

owner

future action

ARCHITECTURE QUALITY GATE

Before certification verify:

No unnecessary complexity
No obvious circular dependencies
No major god classes
No business logic hidden in controllers
No duplicated security logic
No duplicated payment logic
No uncontrolled database access
No undocumented critical behavior


API QUALITY GATE

Verify:

Authentication
Authorization
Validation
Consistent errors
Correct status codes
Pagination
Rate limiting
Idempotency where needed
No sensitive data leakage
No unbounded queries


DATABASE QUALITY GATE

Verify:

Constraints
Indexes
Foreign keys
Transactions
Concurrency
Migration safety
Data types
Precision
Uniqueness


SECURITY QUALITY GATE

Verify:

Auth
Authorization
IDOR/BOLA
Mass assignment
CSRF
CORS
Headers
Rate limiting
File uploads
SSRF
Secrets
Logging
Payment
Webhooks


PRODUCTION QUALITY GATE

Verify:

APP_ENV
APP_DEBUG
APP_KEY
DATABASE
CACHE
QUEUE
FILESYSTEM
MAIL
HTTPS
TRUSTED PROXIES
LOGGING
SCHEDULER
WORKERS
OPCACHE
BACKUPS
MONITORING


IMPORTANT: DO NOT FAKE CERTIFICATION

You are NOT allowed to claim:



tested

verified

secure

production ready

backup tested

load tested

deployment tested



unless there is actual evidence.



If something cannot be tested locally, explicitly write:



NOT VERIFIED LOCALLY



Then explain what must be verified in staging/production.

FINAL STATUS

At the end output:

========================================
FINAL BACKEND PRODUCTION CERTIFICATION
========================================

Status:
[PRODUCTION READY / PRODUCTION READY WITH CONDITIONS / NOT PRODUCTION READY]

P0 Findings: X
P1 Findings: X
P2 Findings: X
P3 Findings: X
P4 Findings: X

Tests:
PASS: X
FAIL: X

Security:
PASS / FAIL

Architecture:
PASS / FAIL

Database:
PASS / FAIL

API:
PASS / FAIL

Payments:
PASS / FAIL

Webhooks:
PASS / FAIL

Performance:
PASS / FAIL

Concurrency:
PASS / FAIL

Deployment:
PASS / FAIL

Backup/Recovery:
VERIFIED / NOT VERIFIED

Observability:
PASS / FAIL

Remaining blockers:
...

Required staging verification:
...

Final recommendation:
...


FINAL LEDGER UPDATE

Update:

docs/hardening/LEDGER.md


Add the final Phase 13 status.



The ledger must clearly distinguish:

Implemented
Tested
Verified
Not Locally Verifiable
Production Prerequisite


Do not mark something "verified" when it was only implemented.

GIT REQUIREMENTS

Before finalizing:

git status
git diff
git log -n 10 --oneline


All production-hardening changes should be committed.



Use a clear commit message such as:

feat(hardening): complete final production readiness certification


Do not commit secrets.



Do not commit:



.env

credentials

private keys

production dumps

temporary artifacts

FINAL RESPONSE TO THE USER

Your final response must be concise but evidence-based.



Include:



Final status.

What was fixed.

Important security findings.

Test results.

Any remaining blockers.

Anything that must be verified in staging/production.

Final commit hash.

Exact statement whether the backend can move to production.



Do NOT simply say:



"Everything is production ready."



Show evidence.

DEFINITION OF DONE

This phase is COMPLETE only when:



 Repository audited

 Architecture audited

 Routes audited

 API contracts audited

 Authentication audited

 Authorization audited

 IDOR/BOLA tested

 Input validation audited

 Mass assignment audited

 Database audited

 Transactions audited

 Concurrency audited

 Payments audited

 Webhooks audited

 File uploads audited

 SSRF audited

 HTTP security audited

 Rate limiting audited

 Error handling audited

 Logging audited

 Cache audited

 Jobs/queues audited

 Performance audited

 Resource exhaustion audited

 External services audited

 Secrets audited

 Deployment audited

 Migration safety audited

 Backup/recovery audited

 Privacy audited

 Test quality audited

 Adversarial testing completed

 Full test suite passed

 Static analysis passed

 Code style passed

 Dependency audit passed

 Documentation finalized

 Ledger updated

 Git tree clean

 Changes committed

 Final production certification generated

CRITICAL FINAL INSTRUCTION

DO NOT START ANOTHER DEVELOPMENT PHASE AFTER THIS.



This is the final backend closure phase.



If the backend passes all gates:



STOP FEATURE DEVELOPMENT.



The backend should then be treated as a production candidate and the next work should move to:



staging deployment

real infrastructure configuration

frontend integration

real payment provider credentials

domain/HTTPS

production monitoring

controlled launch



Only reopen backend development if staging or production verification discovers a real defect.



END OF PHASE 13.