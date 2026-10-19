# Phase 11 — Open Blockers & Required Actions for Production Go-Live

**Document ID:** PR-ACT-011  
**Date:** 2026-10-19  
**Status:** ACTIVE GATING DOCUMENT  
**Current Verdict:** CONDITIONAL GO  
**Target Verdict:** GO  

---

## 1. Executive Summary

During the Phase 11 independent verification audit, the software application demonstrated high code quality, security rigor, and test coverage (227/227 PHPUnit tests passed, 0 Next.js type errors, clean OWASP ASVS compliance).

However, transition from **`CONDITIONAL GO`** to an unrestricted **`GO`** is currently blocked by **6 operational, architectural, and testing blockers**. 

This document defines the exact blockers, technical root causes, required remediation actions, owning engineering roles, and empirical sign-off criteria required to achieve full production readiness.

```
                           CURRENT STATUS: CONDITIONAL GO
                                         │
        ┌────────────────────────────────┴────────────────────────────────┐
        ▼                                                                 ▼
[ Architecture & Storage ]                                      [ Testing & Validation ]
- Blocker 1: Managed PostgreSQL & S3                            - Blocker 2: Staging Booking Write Load Test
- Blocker 3: Container Entrypoint & Supervisor                  - Blocker 4: Backup Script & PostgreSQL Restore
- Blocker 5: Live Secrets & Payment Gateways                    - Blocker 6: Edge CDN & Alerting Webhooks
        └────────────────────────────────┬────────────────────────────────┘
                                         ▼
                             ALL CRITERIA SATISFIED
                                         │
                                         ▼
                            FINAL VERDICT: FULL GO
```

---

## 2. Detailed Blocker Breakdown & Action Items

### Blocker 1: Production Database Provisioning & Ephemeral Storage Remediation
- **Severity:** CRITICAL (BLOCKER)
- **Assigned Roles:** Database Engineer, DevOps / SRE Lead
- **Technical Problem:**
  1. `render.yaml` currently specifies `DB_CONNECTION: sqlite` and `DB_DATABASE: /var/www/html/database/database.sqlite` on a `free` plan. On stateless container platforms, filesystems are ephemeral. Any container restart, deployment, or auto-scaling permanently deletes the SQLite database and all uploaded media files.
  2. Physical double-booking protection via the `bookings_no_double_booking` GiST exclusion constraint (`btree_gist`) is only active on PostgreSQL (`DB::getDriverName() === 'pgsql'`). SQLite lacks row-level locks and exclusion constraints.
- **Remediation Action Items:**
  1. Provision a Managed PostgreSQL 16+ instance (AWS RDS, Supabase, Neon, or Render PostgreSQL).
  2. Connect to the PostgreSQL instance and enable the required extension:
     ```sql
     CREATE EXTENSION IF NOT EXISTS btree_gist;
     ```
  3. Update `render.yaml` (or target container configuration) to use PostgreSQL and S3 storage:
     - Set `DB_CONNECTION: pgsql`
     - Set `FILESYSTEM_DISK: s3`
     - Remove local SQLite database paths and configure PostgreSQL connection environment variables.
  4. Run `php artisan migrate --force` against the PostgreSQL database and verify all 46 migrations succeed.
- **Verification & Sign-Off Criteria:**
  - `php artisan migrate:status` returns all 46 migrations as `Ran` under PostgreSQL.
  - `\d bookings` in `psql` shows constraint `bookings_no_double_booking EXCLUDE USING gist (...)`.

---

### Blocker 2: High-Concurrency Booking Write Load Test on Staging
- **Severity:** HIGH (BLOCKER)
- **Assigned Roles:** Performance & Load Testing Engineer, QA Automation Lead
- **Technical Problem:**
  1. The 500 VU k6 benchmark in Phase 7 executed **zero stateful booking write operations** (`POST /api/v1/checkout/bookings`). 100% of the 54,388 requests were reads or in-memory quote calculations (`POST /api/v1/checkout/quote`).
  2. Quote calculation latency was mislabeled in custom metrics as `write_duration_ms`, creating a false impression that transactional writes were tested under load.
  3. True database locking behavior, connection pooling, and double-booking exclusion constraints under concurrent booking creation remain unmeasured.
  4. The test ran on localhost loopback (`127.0.0.1`), bypassing network latency, TLS handshakes, and bandwidth constraints.
- **Remediation Action Items:**
  1. Create a dedicated k6 scenario `tests/k6/scenarios/booking_write_concurrency.js` that exercises stateful write endpoints:
     - Scenario A (Independent Properties): 50 concurrent VUs creating bookings on separate properties using synthetic accounts and mock payment flows.
     - Scenario B (Contention Spike): 10 concurrent requests submitted at the exact same millisecond for the *exact same property and overlapping dates*.
  2. Execute the test against a dedicated staging environment running on the target cloud infrastructure with PostgreSQL 16+ and TLS enabled.
  3. Validate that:
     - For Scenario A: 50 bookings are created (HTTP 201), with $p_{95} \le 500\text{ ms}$ and 0 database lock timeouts.
     - For Scenario B: Exactly 1 booking succeeds (HTTP 201) and exactly 9 requests are rejected with HTTP 409 or 422 (`BookingUnavailableException`), with zero double bookings created in the database and zero unhandled 500 errors.
- **Verification & Sign-Off Criteria:**
  - k6 summary JSON exported showing successful write requests against staging.
  - Zero double bookings verified via SQL query:
    ```sql
    SELECT bookable_id, check_in, check_out, count(*) 
    FROM bookings 
    WHERE status IN ('confirmed', 'paid', 'pending', 'awaiting_payment') 
    GROUP BY bookable_id, check_in, check_out 
    HAVING count(*) > 1;
    ```
    Returns 0 rows.

---

### Blocker 3: Containerization & Process Supervision Hardening
- **Severity:** HIGH (BLOCKER)
- **Assigned Roles:** DevOps / SRE Lead
- **Technical Problem:**
  1. `docker/production/entrypoint.sh` executes migrations with:
     ```bash
     php /var/www/html/artisan migrate --force || true
     ```
     The `|| true` suppresses migration errors. If a migration fails due to bad syntax or connection drops, the container boots anyway, serving traffic against a broken schema.
  2. `docker/production/supervisord.conf` only runs `php-fpm` and `nginx`. It contains no worker configuration. Background queue jobs (`default`, `notifications`, `webhooks`) and scheduled tasks (`bookings:expire-pending`) will never execute inside the container.
  3. `render.yaml` sets `healthCheckPath: /` (loading the full homepage view) instead of the dedicated, fast `/up` probe.
- **Remediation Action Items:**
  1. Modify `docker/production/entrypoint.sh`:
     - Remove `|| true` from `php artisan migrate --force` so failed migrations halt deployment.
     - Guard SQLite initialization so it only executes when explicitly configured for local dev.
  2. Update `docker/production/supervisord.conf` to supervise Laravel queue workers and cron:
     ```ini
     [program:gounow-worker]
     process_name=%(program_name)s_%(process_num)02d
     command=php /var/www/html/artisan queue:work --sleep=3 --tries=3 --max-time=3600 --timeout=90
     autostart=true
     autorestart=true
     user=www-data
     numprocs=2
     redirect_stderr=true
     stdout_logfile=/dev/stdout
     stdout_logfile_maxbytes=0

     [program:cron]
     command=crond -f -l 2
     autostart=true
     autorestart=true
     user=root
     ```
  3. Update `render.yaml` line 9 to:
     ```yaml
     healthCheckPath: /up
     ```
- **Verification & Sign-Off Criteria:**
  - Docker container boots successfully, with `supervisorctl status` showing `php-fpm`, `nginx`, and `gounow-worker` in `RUNNING` state.
  - `/up` responds with HTTP 200 within <20ms.

---

### Blocker 4: Automated Backup Scripting, Verification & Cold Restore Drill
- **Severity:** HIGH (BLOCKER)
- **Assigned Roles:** DevOps / SRE Lead, Database Engineer
- **Technical Problem:**
  1. `backup_database.sh` exists only as markdown text in Report 09. It was never committed as an executable file.
  2. No automated backup scheduling exists in Laravel `routes/console.php` or system cron.
  3. The restore drill in Phase 9 was an isolated local SQLite file copy. No encrypted PostgreSQL backup/restore drill was ever conducted.
  4. RPO ($\le 15\text{ min}$) and RTO ($\le 60\text{ min}$) are theoretical estimates and have never been empirically measured.
- **Remediation Action Items:**
  1. Commit production-ready backup and restore scripts to `docker/scripts/`:
     - `docker/scripts/backup_database.sh`
     - `docker/scripts/restore_database.sh`
  2. Ensure the backup script supports PostgreSQL:
     - Uses `pg_dump -Fc` with `PGPASSWORD` injected securely.
     - Encrypts the dump using OpenSSL AES-256-CBC with a secure key file.
     - Uploads the encrypted archive to private S3 bucket (`s3://gounow-offsite-backups-production/`).
     - Verifies upload completion via S3 object existence check (`aws s3 ls`).
     - Purges local backups older than 7 days.
  3. Provision the S3 backup bucket with:
     - 30-day lifecycle expiration rule.
     - Server-side encryption (SSE-S3 or KMS).
     - Block Public Access enabled.
  4. Schedule the backup script via cron to run every 6 hours (or WAL archiving for continuous RPO).
  5. Conduct an empirical **cold disaster restore drill** on a test database instance:
     - Download the latest backup from S3.
     - Decrypt using the encryption key.
     - Restore to test PostgreSQL instance using `pg_restore`.
     - Validate row counts across `users`, `properties`, `bookings`, and `payment_transactions`.
     - Record empirical RTO (duration from disaster trigger to restored health) and verify RTO $\le 60$ minutes.
- **Verification & Sign-Off Criteria:**
  - Backup script executed cleanly with exit code 0 and verified in S3.
  - Restore script executed cleanly with exit code 0; 100% record match verified.
  - Measured RTO documented with empirical timestamps.

---

### Blocker 5: Production Secrets Injection & Live Gateway Verification
- **Severity:** CRITICAL (BLOCKER)
- **Assigned Roles:** Principal Engineer, Application Security Engineer
- **Technical Problem:**
  1. Production credentials (live Stripe keys, Paymob keys, SendGrid credentials, AWS S3 keys) are intentionally not committed to Git.
  2. Launching with sandbox or mock credentials would cause real transactions to fail or mock payments to grant free bookings in production.
  3. `tests/k6/config.js` commits default administrator credentials (`admin@gounow.com` / `Admin@2026!`).
- **Remediation Action Items:**
  1. Remove hardcoded credentials from `tests/k6/config.js`; read from environment variables `__ENV.ADMIN_EMAIL` and `__ENV.ADMIN_PASSWORD`.
  2. Generate a secure, production-grade application key:
     ```bash
     php artisan key:generate --show
     ```
  3. Inject all required production environment variables directly into the cloud hosting secrets manager (Render, AWS Secrets Manager, or Doppler):
     - `APP_KEY`, `APP_DEBUG=false`, `APP_ENV=production`
     - Database credentials (`DB_HOST`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`)
     - Live Payment credentials (`STRIPE_KEY`, `STRIPE_SECRET`, `STRIPE_WEBHOOK_SECRET`, `PAYMOB_*`)
     - Mailer credentials (`MAIL_USERNAME`, `MAIL_PASSWORD`)
     - Object storage credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_BUCKET`)
  4. Execute a single $1.00 live transaction via Stripe/Paymob in a staging/alpha environment to confirm:
     - Payment intent creation.
     - 3D Secure redirect flow.
     - HMAC webhook signature validation and booking confirmation state transition.
- **Verification & Sign-Off Criteria:**
  - Live $1.00 transaction completed and confirmed in Stripe/Paymob dashboard.
  - Webhook received, verified, and processed with HTTP 200; booking status updated to `confirmed`.

---

### Blocker 6: CDN / Edge Security, TLS & Alerting Webhook Integration
- **Severity:** MEDIUM (BLOCKER)
- **Assigned Roles:** DevOps / SRE Lead, Application Security Engineer
- **Technical Problem:**
  1. Edge CDN (Cloudflare or AWS CloudFront) is not yet configured for the production domain (`gounow.com` / `api.gounow.com`).
  2. Rate limiting at the application level protects backend routes, but does not shield the origin server from Layer 7 DDoS volumetric floods.
  3. Monitoring alert thresholds are documented in Report 09, but webhook notification channels (Slack `#alerts` or PagerDuty) are unconfigured.
- **Remediation Action Items:**
  1. Point domain DNS to Cloudflare:
     - Enable Full (Strict) SSL/TLS encryption.
     - Enforce HTTPS and HTTP/2 + HTTP/3.
     - Configure Cloudflare Web Application Firewall (WAF) rate limiting rules:
       - Limit `/api/v1/checkout/*` to 30 requests/minute per IP.
       - Limit `/api/v1/admin/login` to 10 requests/minute per IP.
  2. Configure application logging and alerting:
     - Configure Sentry DSN in backend and frontend for real-time unhandled exception tracking.
     - Integrate uptime monitor (BetterStack, UptimeRobot, or Cloudflare Health Checks) pinging `https://api.gounow.com/up` every 60 seconds.
     - Configure alerting webhook posting directly to engineering Slack channel `#ops-alerts`.
- **Verification & Sign-Off Criteria:**
  - `curl -I https://api.gounow.com/up` returns HTTP 200 over HTTPS with Cloudflare headers (`cf-ray`).
  - Test alert sent from uptime monitor successfully triggers Slack notification.

---

## 3. Engineering Responsibilities & Execution Matrix

| Blocker | Owner | Collaborator | Estimated Effort | Target Completion | Sign-Off Deliverable |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Blocker 1: Database & S3** | Database Engineer | DevOps Lead | 4 hours | Day 0 | PostgreSQL connected; 46 migrations verified; exclusion constraint confirmed. |
| **Blocker 2: Write Concurrency Load Test** | Performance Engineer | QA Lead | 6 hours | Day 1 | k6 staging write report showing 0 double-bookings and sub-500ms write latency. |
| **Blocker 3: Container Hardening** | DevOps Lead | Backend Engineer | 3 hours | Day 0 | Updated `Dockerfile`, `entrypoint.sh`, `supervisord.conf`, and `render.yaml`. |
| **Blocker 4: Backup & Restore Drill** | DevOps Lead | Database Engineer | 5 hours | Day 1 | `backup_database.sh` & `restore_database.sh` executed; empirical RTO measured. |
| **Blocker 5: Secrets & Payment Verification** | Principal Engineer | AppSec Engineer | 4 hours | Day 1 | Secrets injected in cloud; live $1 transaction verified in payment dashboard. |
| **Blocker 6: Edge CDN & Monitoring** | DevOps Lead | AppSec Engineer | 4 hours | Day 2 | Cloudflare proxy active; uptime probe verified; Slack alerting operational. |

---

## 4. Final Transition Gate Criteria (Conditional Go to Full Go)

The release verdict will transition from **`CONDITIONAL GO`** to **`GO`** once the following verification checklist is 100% completed:

- [ ] **PostgreSQL 16+ Migration Complete:** Database provisioned, `btree_gist` active, 46 migrations passed, zero errors.
- [ ] **S3 Object Storage Connected:** Media uploads store to S3 bucket; `FILESYSTEM_DISK=s3`.
- [ ] **Staging Write Concurrency Benchmark Passed:** 50 concurrent booking writes succeed; 10 contention writes result in exactly 1 booking and 9 rejected (0 double bookings).
- [ ] **Container Entrypoint Hardened:** `migrate --force` fails cleanly without `|| true`; queue workers supervised in `supervisord.conf`.
- [ ] **Backup & Restore Runbook Verified:** Automated backup runs in cron; restore drill executed against PostgreSQL with empirical RTO $\le 60\text{ min}$.
- [ ] **Live Credentials Injected:** Production secrets manager configured; $1 live test transaction succeeds.
- [ ] **Edge Proxy & Health Checks Active:** Cloudflare Strict SSL active; `/up` probe returns HTTP 200; Slack alerting webhook operational.

Upon unanimous sign-off by the Engineering Review Board on the above checklist, the formal deployment verdict shall become **`GO`**.
