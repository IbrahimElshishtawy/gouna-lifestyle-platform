# GOUNA LIFESTYLE PLATFORM
# MASTER PRODUCTION READINESS & FINAL RELEASE PROMPT
# Post-PHASE-6 Finalization Plan
# Version: 1.0
#
# PURPOSE:
# Take the existing backend from the current hardened state after PHASE 6
# to a genuinely production-ready, deployable, observable, recoverable,
# security-hardened release.
#
# IMPORTANT:
# This document is an EXECUTION PROMPT for an AI coding agent.
# Do not treat it as a feature-development plan.
# The goal is to validate, harden, test, document, and certify the existing
# backend without unnecessary architectural expansion.
#
# CURRENT BASELINE:
# - PHASE 6 PAYMENT & FINANCIAL INTEGRITY HARDENING completed.
# - Application tests reported passing.
# - Adversarial payment/webhook/idempotency tests reported passing.
# - PHPStan reported 0 errors.
# - Pint passed.
# - Composer audit reported no advisories.
# - Payment/webhook/idempotency hardening has already been implemented.
#
# NON-NEGOTIABLE RULE:
# DO NOT assume the previous completion report is correct.
# Inspect the repository and verify every claim against the actual code,
# database, configuration, routes, tests, infrastructure, and runtime.
#
# FINAL OBJECTIVE:
# Produce a backend that can be released to production with:
# - secure configuration
# - deterministic database behavior
# - PostgreSQL production validation
# - safe payment integration
# - secure webhook processing
# - reliable idempotency
# - race-condition resistance
# - authorization correctness
# - resilient API behavior
# - production observability
# - backup and recovery procedures
# - deployment safety
# - rollback capability
# - rate limiting and abuse resistance
# - load/concurrency evidence
# - security verification
# - operational documentation
# - final release evidence
#
# NEVER:
# - rewrite the whole backend without evidence
# - introduce microservices unnecessarily
# - add Kubernetes merely because it is "production"
# - add Redis/Postgres/Kafka/RabbitMQ unless the existing architecture
#   demonstrably requires it
# - add features unrelated to production readiness
# - weaken existing security controls to make tests pass
# - bypass authorization
# - trust client-provided financial values
# - disable tests
# - delete failing tests
# - mark a gate PASS without evidence
# - claim production-ready merely because unit tests pass
#
# EXECUTION MODEL:
# Execute phases sequentially.
# Each phase must:
# 1. Inspect.
# 2. Identify findings.
# 3. Fix only justified findings.
# 4. Add/update tests.
# 5. Run verification.
# 6. Document evidence.
# 7. Update ledger/backlog.
# 8. Produce a PASS/FAIL gate.
#
# If a blocking issue is found:
# - STOP progression where appropriate.
# - Fix it.
# - Re-run all affected tests.
# - Do not hide it in documentation.
#
# Evidence must contain:
# - command executed
# - result
# - affected files
# - tests
# - environment
# - remaining limitations
#
# ================================================================
# PHASE 7 — PRODUCTION CONFIGURATION & SECRETS HARDENING
# ================================================================
#
# OBJECTIVE:
# Make sure the application cannot accidentally run in an insecure
# configuration in production.
#
# 7.1 ENVIRONMENT AUDIT
# Inspect:
# - .env.example
# - .env files
# - config/*.php
# - bootstrap configuration
# - service providers
# - route configuration
# - queue configuration
# - cache configuration
# - filesystem configuration
# - mail configuration
# - logging configuration
# - payment configuration
# - CORS
# - session configuration
# - cookie configuration
# - trusted proxies
# - URL/app environment configuration
#
# Verify:
# - APP_ENV is production in production
# - APP_DEBUG=false
# - APP_URL is correct
# - secure cookies enabled
# - HTTPS assumptions are correct
# - SameSite policy is appropriate
# - session driver is production-safe
# - filesystem disks are correct
# - mail is not using accidental development drivers
# - queue is production-safe
# - cache is production-safe
# - logging is production-safe
#
# 7.2 SECRET MANAGEMENT
# Search for:
# - hardcoded API keys
# - payment secrets
# - webhook secrets
# - database passwords
# - JWT secrets
# - OAuth secrets
# - SMTP credentials
# - private keys
# - test credentials accidentally committed
#
# Check git history and repository files for accidental secrets.
# Do not print secret values in reports.
#
# Verify secret separation between:
# - local
# - testing
# - staging
# - production
#
# Verify secrets are loaded from environment/secure secret storage.
#
# 7.3 FAIL-CLOSED CONFIGURATION
# For security-critical values:
# - production must fail startup or fail the affected operation if a
#   required secret/configuration is missing.
# - never silently use development defaults in production.
#
# 7.4 CORS
# Audit:
# - allowed origins
# - methods
# - headers
# - credentials
# - wildcard origins
#
# No "*" where credentials/security policy makes it unsafe.
#
# 7.5 MASS ASSIGNMENT / SERIALIZATION
# Audit models for:
# - fillable/guarded
# - hidden fields
# - sensitive serialization
# - password/token/payment data leakage
#
# 7.6 OUTPUT
# Create:
# docs/hardening/PHASE_7_PRODUCTION_CONFIG.md
# docs/hardening/PHASE_7_SECRETS_MATRIX.md
# docs/hardening/PHASE_7_FINAL_REPORT.md
#
# GATE 7:
# PASS only if production configuration is explicit, secure, and tested.
#
# ================================================================
# PHASE 8 — DATABASE PRODUCTION HARDENING & MIGRATION SAFETY
# ================================================================
#
# OBJECTIVE:
# Prove that the database layer is safe under real production conditions.
#
# 8.1 DATABASE ENGINE
# Treat PostgreSQL as the production target unless repository evidence
# explicitly establishes another production engine.
#
# Verify:
# - PostgreSQL compatibility
# - migrations
# - indexes
# - foreign keys
# - unique constraints
# - check constraints
# - nullable columns
# - numeric precision
# - timestamps/time zones
# - enum/state consistency
#
# 8.2 FINANCIAL DATA TYPES
# Audit all money-related fields.
# Never use floating point for authoritative monetary values.
# Verify:
# - integer minor units OR exact decimal strategy
# - currency consistency
# - rounding policy
# - precision
# - maximum values
#
# 8.3 CONCURRENCY
# Test:
# - simultaneous checkout
# - simultaneous booking
# - simultaneous payment confirmation
# - simultaneous refund
# - simultaneous webhook delivery
# - simultaneous cancellation
# - simultaneous inventory/unit reservation
#
# Verify:
# - transactions
# - row locks
# - unique constraints
# - optimistic/pessimistic concurrency
# - deadlock handling
# - retry strategy
#
# 8.4 MIGRATION SAFETY
# Every migration must be reviewed for:
# - destructive changes
# - locking large tables
# - missing indexes
# - unsafe defaults
# - production downtime
# - rollback feasibility
#
# Identify migrations that require:
# - maintenance window
# - online migration
# - backfill
# - staged deployment
#
# 8.5 BACKUP/RESTORE
# Verify actual backup and restore procedure against PostgreSQL.
# Do not merely document a hypothetical command.
#
# Test:
# - backup
# - restore
# - integrity check
# - application reconnect
#
# 8.6 OUTPUT
# docs/hardening/PHASE_8_DATABASE_PRODUCTION.md
# docs/hardening/PHASE_8_MIGRATION_SAFETY.md
# docs/hardening/PHASE_8_BACKUP_RESTORE.md
# docs/hardening/PHASE_8_FINAL_REPORT.md
#
# GATE 8:
# PASS only if production DB behavior and recovery are demonstrated.
#
# ================================================================
# PHASE 9 — AUTHENTICATION, AUTHORIZATION & API SECURITY FINAL AUDIT
# ================================================================
#
# OBJECTIVE:
# Perform a final adversarial security audit of every externally reachable
# API and web route.
#
# 9.1 ROUTE INVENTORY
# Build a complete route matrix:
# - method
# - path
# - controller
# - middleware
# - authentication requirement
# - authorization requirement
# - rate limit
# - validation
# - sensitive data
# - state mutation
#
# No route may be left unexplained.
#
# 9.2 AUTHENTICATION
# Verify:
# - password hashing
# - login protections
# - session/token expiration
# - logout/revocation where applicable
# - password reset
# - email verification
# - account enumeration resistance
# - brute-force protection
# - credential stuffing resistance
#
# 9.3 AUTHORIZATION
# Test:
# - horizontal privilege escalation
# - vertical privilege escalation
# - IDOR/BOLA
# - admin/user separation
# - owner/resource boundaries
# - role changes
# - deleted/revoked users
#
# Every sensitive resource must be authorized server-side.
#
# 9.4 INPUT SECURITY
# Audit:
# - validation
# - type coercion
# - unexpected fields
# - SQL injection
# - mass assignment
# - path traversal
# - SSRF
# - unsafe redirects
# - XSS where relevant
# - command injection
# - file upload abuse
#
# 9.5 API SECURITY HEADERS
# Verify appropriate:
# - HSTS
# - X-Content-Type-Options
# - Content-Security-Policy where applicable
# - Referrer-Policy
# - Permissions-Policy
# - frame protection
#
# Do not add headers blindly; document compatibility implications.
#
# 9.6 RATE LIMITING
# Identify abuse-sensitive endpoints:
# - login
# - registration
# - password reset
# - checkout
# - payment
# - webhook
# - file upload
# - search-heavy endpoints
# - expensive endpoints
#
# Rate limits must be appropriate and testable.
#
# 9.7 ADVERSARIAL TEST SUITE
# Add tests for all confirmed findings.
#
# OUTPUT:
# docs/hardening/PHASE_9_API_SECURITY_MATRIX.md
# docs/hardening/PHASE_9_AUTHORIZATION_AUDIT.md
# docs/hardening/PHASE_9_FINAL_REPORT.md
#
# GATE 9:
# PASS only when every sensitive route has an explicit security boundary.
#
# ================================================================
# PHASE 10 — PAYMENT GATEWAY REAL-WORLD INTEGRATION CERTIFICATION
# ================================================================
#
# OBJECTIVE:
# Prove that payment behavior is correct beyond mocked tests.
#
# 10.1 GATEWAY CONFIGURATION
# Verify:
# - production credentials are separated
# - sandbox credentials are separated
# - webhook secrets are separate
# - callback URLs are HTTPS
# - gateway environment cannot accidentally mix
#
# 10.2 PAYMENT TRUST MODEL
# The client must NEVER be authoritative for:
# - final price
# - currency
# - payment status
# - transaction ID
# - refund amount
# - booking ownership
#
# Server must derive authoritative values from server-side data.
#
# 10.3 PAYMENT STATE MACHINE
# Verify every transition:
# pending
# initiated
# authorized
# paid
# failed
# cancelled
# refunded
# partially_refunded
# expired
# or repository-specific equivalent.
#
# Reject invalid transitions.
#
# 10.4 WEBHOOKS
# Verify:
# - signature
# - timestamp
# - replay protection
# - idempotency
# - event uniqueness
# - event ordering assumptions
# - duplicate delivery
# - malformed payloads
# - unknown events
# - unavailable DB/gateway behavior
#
# Webhook processing must be safe if the same event arrives many times.
#
# 10.5 REFUNDS
# Verify:
# - cannot exceed captured amount
# - cumulative refunds cannot exceed captured amount
# - authorization required
# - transaction atomicity
# - gateway failure behavior
# - retry behavior
#
# 10.6 REAL SANDBOX
# If gateway sandbox credentials are available:
# execute actual sandbox transactions.
#
# Test:
# - successful payment
# - failed payment
# - duplicate callback
# - delayed callback
# - invalid signature
# - mismatched amount
# - mismatched currency
# - duplicate payment request
# - refund
#
# If sandbox credentials are unavailable:
# do NOT fake a PASS.
# Mark external integration evidence as BLOCKED/NOT VERIFIED.
#
# OUTPUT:
# docs/hardening/PHASE_10_PAYMENT_CERTIFICATION.md
# docs/hardening/PHASE_10_WEBHOOK_CERTIFICATION.md
# docs/hardening/PHASE_10_FINAL_REPORT.md
#
# GATE 10:
# PASS only with real sandbox evidence or clearly documented limitation.
#
# ================================================================
# PHASE 11 — FILES, MEDIA, UPLOADS & STORAGE SECURITY
# ================================================================
#
# OBJECTIVE:
# Ensure user-uploaded content cannot become a production attack vector.
#
# Audit every upload:
# - MIME validation
# - extension validation
# - content validation
# - maximum size
# - filename normalization
# - storage isolation
# - public/private visibility
# - authorization
# - deletion
# - orphan cleanup
#
# Prevent:
# - executable upload
# - path traversal
# - polyglot files
# - malicious SVG where relevant
# - oversized files
# - resource exhaustion
#
# Verify image processing if used.
#
# Ensure private files are never exposed through predictable URLs.
#
# Test:
# - unauthorized download
# - unauthorized deletion
# - malicious filename
# - fake MIME
# - oversized file
# - invalid content
#
# OUTPUT:
# docs/hardening/PHASE_11_STORAGE_SECURITY.md
# docs/hardening/PHASE_11_FINAL_REPORT.md
#
# GATE 11:
# PASS only when upload/download paths have explicit security boundaries.
#
# ================================================================
# PHASE 12 — PERFORMANCE, LOAD, CONCURRENCY & RESOURCE SAFETY
# ================================================================
#
# OBJECTIVE:
# Determine whether the backend can handle realistic traffic without
# correctness failures or catastrophic resource exhaustion.
#
# DO NOT invent a huge scale target.
# Derive realistic targets from:
# - expected users
# - expected traffic
# - hosting resources
# - database capacity
# - application architecture
#
# 12.1 N+1 QUERY AUDIT
# Inspect:
# - controllers
# - services
# - repositories
# - resources/serializers
# - relationships
#
# Use query logging/profiling to identify N+1 queries.
#
# 12.2 INDEX AUDIT
# Identify:
# - frequently filtered columns
# - foreign keys
# - unique lookups
# - ordering columns
# - composite query patterns
#
# Add indexes only when justified by actual queries.
#
# 12.3 PAGINATION
# Ensure large collections are paginated.
# Prevent unbounded:
# - SELECT
# - relationship loading
# - exports
# - search
#
# 12.4 EXPENSIVE OPERATIONS
# Identify operations that should not block HTTP requests:
# - emails
# - notifications
# - media processing
# - large exports
# - external integrations
#
# Do not introduce queues unless justified by actual workload.
#
# 12.5 LOAD TESTING
# Build realistic scenarios:
# - read-heavy traffic
# - login
# - authenticated API
# - booking
# - checkout
# - payment webhook
#
# Measure:
# - latency
# - throughput
# - error rate
# - DB utilization
# - memory
# - CPU
# - queue behavior if present
#
# 12.6 CONCURRENCY TESTING
# Specifically test:
# - same booking
# - same unit
# - same payment
# - same idempotency key
# - same webhook
#
# Correctness has priority over raw throughput.
#
# OUTPUT:
# docs/hardening/PHASE_12_PERFORMANCE_REPORT.md
# docs/hardening/PHASE_12_LOAD_TEST_PLAN.md
# docs/hardening/PHASE_12_FINAL_REPORT.md
#
# GATE 12:
# PASS only if measured performance is acceptable and concurrency preserves
# financial/business invariants.
#
# ================================================================
# PHASE 13 — OBSERVABILITY, LOGGING, MONITORING & ALERTING
# ================================================================
#
# OBJECTIVE:
# Make production failures detectable and diagnosable.
#
# 13.1 STRUCTURED LOGGING
# Audit logs for:
# - request failures
# - authentication failures
# - authorization failures
# - payment events
# - webhook events
# - state transitions
# - refunds
# - security violations
#
# NEVER log:
# - passwords
# - access tokens
# - payment secrets
# - webhook secrets
# - full card data
# - sensitive personal data unnecessarily
#
# 13.2 CORRELATION
# Requests and important async/payment flows should have correlation IDs
# or equivalent trace identifiers.
#
# 13.3 HEALTH ENDPOINTS
# Distinguish:
# - liveness
# - readiness
# - dependency health
#
# Do not expose sensitive internals.
#
# 13.4 METRICS
# At minimum identify measurable indicators for:
# - request rate
# - error rate
# - latency
# - authentication failures
# - authorization failures
# - payment failures
# - webhook failures
# - duplicate webhook events
# - queue failures if applicable
# - DB failures
#
# 13.5 ALERTING
# Define actionable alerts for:
# - payment failure spikes
# - webhook failure spikes
# - database unavailable
# - elevated 5xx
# - disk/storage exhaustion
# - queue backlog if applicable
#
# 13.6 AUDIT LOGS
# Ensure audit logs are:
# - attributable
# - timestamped
# - tamper-resistant as far as architecture allows
# - free from secret leakage
#
# OUTPUT:
# docs/hardening/PHASE_13_OBSERVABILITY.md
# docs/hardening/PHASE_13_LOGGING_POLICY.md
# docs/hardening/PHASE_13_ALERTING_MATRIX.md
# docs/hardening/PHASE_13_FINAL_REPORT.md
#
# GATE 13:
# PASS only when a production incident can be detected and investigated.
#
# ================================================================
# PHASE 14 — DEPLOYMENT, CI/CD & RELEASE SAFETY
# ================================================================
#
# OBJECTIVE:
# Make deployment repeatable and safe.
#
# 14.1 DEPLOYMENT AUDIT
# Document exact:
# - server prerequisites
# - PHP version
# - extensions
# - Composer
# - web server
# - process manager
# - database
# - storage
# - queue workers if applicable
# - cron/scheduler if applicable
#
# 14.2 DEPLOYMENT ORDER
# Define safe order:
# - code
# - migrations
# - cache
# - workers
# - health checks
#
# Migration compatibility must be considered.
#
# 14.3 CI PIPELINE
# Verify automated execution of:
# - dependency install
# - tests
# - Pint
# - PHPStan
# - security audit
# - build/package checks
#
# Security checks must fail the pipeline when appropriate.
#
# 14.4 PRODUCTION DEPLOYMENT
# Do not deploy with:
# - debug mode
# - development credentials
# - mock payment endpoints
# - test routes
# - verbose exception pages
#
# 14.5 ROLLBACK
# Define:
# - code rollback
# - migration rollback strategy
# - data rollback limitations
# - feature/config rollback
#
# Never claim DB rollback is safe unless verified.
#
# 14.6 ZERO/MINIMAL DOWNTIME
# Identify deployments requiring downtime.
#
# OUTPUT:
# docs/hardening/PHASE_14_DEPLOYMENT_RUNBOOK.md
# docs/hardening/PHASE_14_CICD.md
# docs/hardening/PHASE_14_ROLLBACK.md
# docs/hardening/PHASE_14_FINAL_REPORT.md
#
# GATE 14:
# PASS only when a fresh deployment and rollback procedure are reproducible.
#
# ================================================================
# PHASE 15 — DISASTER RECOVERY, BACKUP & BUSINESS CONTINUITY
# ================================================================
#
# OBJECTIVE:
# Prove the system can recover from realistic failures.
#
# Define and verify:
# - backup frequency
# - retention
# - backup encryption
# - backup location
# - database restore
# - media restore
# - configuration/secrets recovery
#
# Establish:
# - RPO
# - RTO
#
# These must be realistic for the actual infrastructure.
#
# Simulate:
# - database loss
# - application restart
# - failed deployment
# - corrupted release
# - missing storage
#
# Verify recovery.
#
# OUTPUT:
# docs/hardening/PHASE_15_DISASTER_RECOVERY.md
# docs/hardening/PHASE_15_BACKUP_POLICY.md
# docs/hardening/PHASE_15_FINAL_REPORT.md
#
# GATE 15:
# PASS only if recovery is tested, not merely described.
#
# ================================================================
# PHASE 16 — FULL SECURITY & ADVERSARIAL RED TEAM AUDIT
# ================================================================
#
# OBJECTIVE:
# Attack the application as an untrusted external actor.
#
# Build an attack matrix covering:
#
# Authentication:
# - brute force
# - credential stuffing
# - session abuse
#
# Authorization:
# - IDOR
# - BOLA
# - privilege escalation
# - tenant/resource crossing
#
# Input:
# - SQL injection
# - XSS
# - SSRF
# - command injection
# - path traversal
# - malformed JSON
# - type confusion
#
# Business logic:
# - price manipulation
# - currency manipulation
# - negative amounts
# - duplicate checkout
# - duplicate payment
# - replayed webhook
# - invalid refund
# - unauthorized cancellation
# - booking race
# - inventory race
#
# Infrastructure:
# - exposed debug
# - exposed test endpoints
# - leaked secrets
# - unsafe headers
# - directory listing
# - unsafe file uploads
#
# Abuse:
# - request flooding
# - expensive endpoint abuse
# - upload exhaustion
#
# Every discovered vulnerability must receive:
# - severity
# - exploit scenario
# - affected route/file
# - root cause
# - fix
# - regression test
# - evidence
#
# OUTPUT:
# docs/hardening/PHASE_16_RED_TEAM_REPORT.md
# docs/hardening/PHASE_16_ATTACK_MATRIX.md
# docs/hardening/PHASE_16_FINAL_REPORT.md
#
# GATE 16:
# No unresolved P0/P1 findings.
# P2 findings require explicit risk acceptance or remediation.
#
# ================================================================
# PHASE 17 — FINAL TEST & REGRESSION CERTIFICATION
# ================================================================
#
# OBJECTIVE:
# Prove nothing was broken by hardening.
#
# Run:
# - full PHPUnit suite
# - all feature tests
# - all adversarial tests
# - payment tests
# - webhook tests
# - idempotency tests
# - authorization tests
# - database integration tests
# - PostgreSQL test suite
# - static analysis
# - code style
# - dependency audit
#
# If frontend/API contract tests exist, run them.
#
# Verify:
# - HTTP status codes
# - validation formats
# - response structures
# - pagination
# - error contracts
# - authentication behavior
# - authorization behavior
#
# No test may be disabled simply to obtain PASS.
#
# Produce an exact machine-readable summary:
# - total tests
# - passed
# - failed
# - skipped
# - assertions
# - PHPStan result
# - Pint result
# - dependency audit result
# - DB engine tested
#
# OUTPUT:
# docs/hardening/PHASE_17_TEST_CERTIFICATION.md
# docs/hardening/PHASE_17_FINAL_REPORT.md
#
# GATE 17:
# PASS only with zero unexplained failures.
#
# ================================================================
# PHASE 18 — PRODUCTION ENVIRONMENT DRY RUN
# ================================================================
#
# OBJECTIVE:
# Perform the final rehearsal using production-like configuration.
#
# Create/verify a staging environment that mirrors production as closely
# as practical.
#
# MUST verify:
# - APP_ENV=production-equivalent
# - APP_DEBUG=false
# - PostgreSQL
# - production-like cache/session/queue
# - HTTPS
# - real reverse proxy behavior
# - real worker behavior if applicable
# - real scheduled jobs if applicable
# - real storage configuration
# - payment sandbox
#
# Execute:
# - deploy
# - migrate
# - smoke tests
# - authentication flow
# - booking flow
# - checkout flow
# - payment sandbox flow
# - webhook flow
# - refund flow if supported
# - monitoring verification
# - backup verification
#
# Verify logs contain no secrets.
#
# OUTPUT:
# docs/hardening/PHASE_18_PRODUCTION_DRY_RUN.md
# docs/hardening/PHASE_18_SMOKE_TESTS.md
# docs/hardening/PHASE_18_FINAL_REPORT.md
#
# GATE 18:
# PASS only when staging behaves as expected under production-like settings.
#
# ================================================================
# PHASE 19 — FINAL PRODUCTION RELEASE CERTIFICATION
# ================================================================
#
# OBJECTIVE:
# Make the final GO / NO-GO decision.
#
# DO NOT write "PASS" automatically.
#
# Build a single final matrix:
#
# SECURITY
# - secrets
# - auth
# - authorization
# - rate limiting
# - input validation
# - uploads
# - headers
#
# DATABASE
# - PostgreSQL
# - migrations
# - indexes
# - transactions
# - concurrency
# - backup
# - restore
#
# PAYMENTS
# - amount integrity
# - currency integrity
# - state machine
# - webhook signature
# - replay protection
# - idempotency
# - refunds
# - sandbox evidence
#
# PERFORMANCE
# - latency
# - throughput
# - DB performance
# - memory
# - concurrency
#
# OPERATIONS
# - logging
# - monitoring
# - alerting
# - health checks
# - deployment
# - rollback
# - disaster recovery
#
# TESTING
# - full suite
# - adversarial suite
# - static analysis
# - dependency audit
#
# Every row must contain:
# - requirement
# - status
# - evidence
# - test
# - risk
# - owner/action if not PASS
#
# FINAL STATUS MUST BE ONE OF:
#
# GO
# - all mandatory gates PASS
# - no unresolved critical/high-risk blockers
#
# CONDITIONAL GO
# - only explicitly accepted non-critical risks remain
# - no payment/security/data-integrity blocker
#
# NO-GO
# - any critical security issue
# - financial integrity issue
# - broken authorization
# - unverified production DB integrity
# - unverified recovery where required
# - broken deployment
# - unexplained failing tests
#
# OUTPUT:
# docs/hardening/PRODUCTION_READINESS_MATRIX.md
# docs/hardening/PRODUCTION_RELEASE_CERTIFICATION.md
# docs/hardening/FINAL_GO_NO_GO.md
#
# ================================================================
# FINAL RELEASE CHECKLIST
# ================================================================
#
# Before declaring production ready, verify all:
#
# [ ] No P0 findings.
# [ ] No unresolved P1 findings.
# [ ] No unexplained failing tests.
# [ ] Production debug disabled.
# [ ] Production secrets are not committed.
# [ ] Mock/test payment endpoints unavailable in production.
# [ ] Webhook signatures verified.
# [ ] Replay protection verified.
# [ ] Idempotency verified.
# [ ] Financial state machine verified.
# [ ] Amount/currency integrity verified.
# [ ] Refund limits verified.
# [ ] Authorization/IDOR audit passed.
# [ ] Rate limiting verified.
# [ ] Upload security verified.
# [ ] PostgreSQL production behavior verified.
# [ ] Migration safety reviewed.
# [ ] Backup executed.
# [ ] Restore executed.
# [ ] Monitoring available.
# [ ] Alerts defined/tested.
# [ ] Health checks available.
# [ ] Deployment runbook verified.
# [ ] Rollback procedure verified.
# [ ] Load/concurrency tests executed.
# [ ] Payment sandbox flow executed if credentials available.
# [ ] Full regression suite passed.
# [ ] PHPStan passed.
# [ ] Pint passed.
# [ ] Composer audit passed.
# [ ] Production-like dry run passed.
# [ ] Final GO/NO-GO certification generated.
#
# ================================================================
# AGENT BEHAVIOR RULES
# ================================================================
#
# 1. READ BEFORE MODIFYING.
# Inspect the actual repository first.
#
# 2. DO NOT TRUST DOCUMENTATION BLINDLY.
# Documentation may be stale. Code and runtime evidence are authoritative.
#
# 3. DO NOT CREATE FAKE EVIDENCE.
# Never fabricate successful commands, gateway responses, load numbers,
# backup restores, or infrastructure checks.
#
# 4. DO NOT OVERENGINEER.
# Prefer the simplest architecture that satisfies production requirements.
#
# 5. PRESERVE EXISTING BUSINESS LOGIC.
# Change behavior only when required for correctness/security/reliability.
#
# 6. SECURITY FIXES REQUIRE TESTS.
# Every meaningful security fix must have a regression test where practical.
#
# 7. DATABASE CHANGES REQUIRE CONCURRENCY CONSIDERATION.
# Do not assume application-level checks alone are sufficient.
#
# 8. FINANCIAL OPERATIONS REQUIRE ATOMICITY.
# Payment, refund, booking, and financial state changes must preserve
# invariants under retries and concurrency.
#
# 9. EXTERNAL SYSTEMS ARE UNTRUSTED.
# Gateway responses, webhook payloads, client values, uploaded files,
# external APIs, and user input are untrusted until verified.
#
# 10. FAIL CLOSED FOR SECURITY-CRITICAL CONTROLS.
#
# 11. KEEP TEST/PRODUCTION BOUNDARIES STRICT.
#
# 12. DO NOT REMOVE OLD TESTS WITHOUT EXPLICIT JUSTIFICATION.
#
# 13. DOCUMENT EVERY MATERIAL DECISION.
#
# 14. UPDATE:
# - docs/hardening/*
# - LEDGER.md
# - BACKLOG.md
# after each completed phase.
#
# 15. FINAL RESPONSE TO USER:
# Provide:
# - phases completed
# - files changed
# - tests run
# - exact results
# - remaining risks
# - blockers
# - final GO/CONDITIONAL GO/NO-GO
#
# ================================================================
# FINAL CERTIFICATION PRINCIPLE
# ================================================================
#
# "Production Ready" means:
#
# The backend is not merely capable of passing tests.
# It has demonstrated that it can:
#
# - protect money
# - protect identities and permissions
# - reject untrusted input
# - survive retries and concurrency
# - operate safely on the production database
# - recover from failure
# - expose actionable operational signals
# - deploy predictably
# - roll back safely where possible
# - detect attacks and failures
# - maintain business invariants
#
# ONLY after these conditions are evidenced may the agent issue:
#
# =========================
# PRODUCTION READY — GO
# =========================
#
# Otherwise it MUST issue:
#
# =========================
# NOT PRODUCTION READY — NO-GO
# =========================
#
# with the exact blockers.
