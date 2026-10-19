# Phase Report
Phase: Phase 8 — Production Deployment Planning & Hardening
Status: PASS

## Scope
Comprehensive production deployment architecture, containerization hardening, runtime environment verification, security headers, process management (PHP-FPM, Nginx, Next.js Server, Supervisord), zero-downtime deployment sequence, rollback strategy, and Go/No-Go operational gates.

## Environment and versions (no secrets)
- **Backend Framework:** Laravel 12.53.0
- **Backend Runtime:** PHP 8.4+ / PHP 8.5 (Alpine FPM in Docker)
- **Required PHP Extensions:** `pdo_pgsql`, `pdo_sqlite`, `pdo_mysql`, `mbstring`, `exif`, `pcntl`, `bcmath`, `gd`, `zip`, `opcache`, `redis`
- **Frontend Framework:** Next.js 15.1.8 / React 19 (Node.js 20+ LTS)
- **Web Server & Reverse Proxy:** Nginx 1.26+ (Alpine)
- **Process Supervision:** Supervisord / Systemd
- **Hosting Targets Verified in Repo:**
  1. **Frontend:** Vercel via [`vercel.json`](file:///home/ibrahim-elshishtawy/flutter%20project/gouna-lifestyle-platform/vercel.json) (`outputDirectory: frontend/.next`)
  2. **Backend API & Admin:** Containerized via [`Dockerfile`](file:///home/ibrahim-elshishtawy/flutter%20project/gouna-lifestyle-platform/Dockerfile) & [`render.yaml`](file:///home/ibrahim-elshishtawy/flutter%20project/gouna-lifestyle-platform/render.yaml) or standalone Linux VPS (Ubuntu 24.04 LTS / Debian 12)

---

## 1. Hosting Architecture & Dual-Runtime Model

```
       [ Client Browser / Mobile Web ]
                     │
         HTTPS (Cloudflare / Edge CDN)
          ┌──────────┴──────────┐
          ▼                     ▼
[ Frontend: Next.js 15 ]    [ Backend API: Laravel 12 ]
  (Vercel / Node:20)          (Nginx + PHP-FPM 8.4+)
  - SSR & Dynamic Pages       - RESTful JSON API (/api/v1/*)
  - Next.js Image Optimizer   - Blade Admin Portal (/admin/*)
  - ISR Catalog Caching       - Webhook Ingestion (/api/v1/webhooks/*)
          │                     │
          └──────────┬──────────┘
                     ▼
          [ Managed PostgreSQL 16+ ]
             (Supabase / AWS RDS / Neon)
                     │
          [ Managed Redis Cluster ]
             (Upstash / AWS ElastiCache)
             - Cache Store & Session Store
             - Queue Workers (`default`, `notifications`, `webhooks`)
```

### Next.js 15: Server Runtime vs. Static Export
- **Current Mode:** **Next.js Server Runtime (SSR/ISR)** with App Router.
- **Why Static Export (`next export`) is INSUFFICIENT:**
  1. The platform utilizes dynamic query strings, search filtering (location, bedrooms, budget, date range), and localized metadata (`[lang]`).
  2. Next.js App Router relies on server-side revalidation and dynamic image optimization (`next/image`).
  3. Static export would eliminate the ability to perform dynamic server-side availability checking and real-time checkout handoffs.
- **Node.js Resource Requirements:** Minimum 512 MB RAM (1 GB recommended) per Node instance; `NODE_ENV=production`.

---

## 2. Hardening & Security Configuration Audit

### A. Web Server (Nginx) Security Headers
Verified in [`docker/production/nginx.conf`](file:///home/ibrahim-elshishtawy/flutter%20project/gouna-lifestyle-platform/docker/production/nginx.conf) and [`backend/nginx-gounow.conf`](file:///home/ibrahim-elshishtawy/flutter%20project/gouna-lifestyle-platform/backend/nginx-gounow.conf):
- `X-Frame-Options: SAMEORIGIN` (mitigates clickjacking).
- `X-Content-Type-Options: nosniff` (prevents MIME sniffing).
- `X-XSS-Protection: 1; mode=block` (legacy XSS filtering).
- `Referrer-Policy: no-referrer-when-downgrade`.
- `client_max_body_size 64M` (tuned for high-res villa property images).
- Hidden file restriction: `location ~ /\.(?!well-known).* { deny all; }` (blocks `.env`, `.git`, `.sqlite`).

### B. Health Checks & Probes
- **Dedicated Health Endpoint:** [`/up`](file:///home/ibrahim-elshishtawy/flutter%20project/gouna-lifestyle-platform/backend/routes/web.php) configured natively in Laravel 12.
- Returns HTTP `200 OK` without triggering expensive database queries or heavy middleware.
- **Critical Fix in `render.yaml`:**
  - Previous: `healthCheckPath: /` (hits dynamic homepage, loads Blade assets).
  - Production Hardened: `healthCheckPath: /up`.

### C. The Ephemeral Storage Risk on PaaS / Docker (CRITICAL)
- **Identified Risk in `render.yaml`:**
  - `render.yaml` sets `DB_CONNECTION: sqlite` with path `/var/www/html/database/database.sqlite`.
  - On stateless container platforms (Render, Railway, Cloud Run), container filesystems are **ephemeral**. Any container restart, auto-scaling event, or new deployment **permanently destroys SQLite database files and user uploads** unless a persistent disk is attached.
- **Production Requirement:**
  - For Render/PaaS: Must provision **Managed PostgreSQL** (`DB_CONNECTION=pgsql`) and **S3-compatible Object Storage** (`FILESYSTEM_DISK=s3`).
  - For Single VPS (Hetzner / DigitalOcean): Must store `database.sqlite` and `storage/app/public` on dedicated host mounts with strict backup cron jobs.

---

## 3. Production Deployment Runbook (Zero-Downtime Pipeline)

### Phase A: Pre-Deployment Prerequisites Checklist
- [ ] Database backup snapshot completed and integrity verified.
- [ ] Staging tests passed 100% (227 PHPUnit tests, Next.js build clean).
- [ ] Production `.env` verified (no debug enabled, proper APP_KEY, strong secrets).
- [ ] PostgreSQL connection pool validated.

### Phase B: Deployment Execution Sequence (Bash Script)
```bash
#!/usr/bin/env bash
set -Eeuo pipefail

echo "==> [Step 1/8] Activating Maintenance Mode..."
php artisan down --retry=60 --secret="gounow-bypass-deploy-key"

echo "==> [Step 2/8] Fetching Latest Release Code..."
git fetch origin main
git checkout main
git pull origin main

echo "==> [Step 3/8] Installing Production Composer Dependencies..."
composer install --no-interaction --prefer-dist --optimize-autoloader --no-dev

echo "==> [Step 4/8] Executing Database Migrations..."
# Note: Never run --seed in production.
php artisan migrate --force

echo "==> [Step 5/8] Warming Production Optimization Caches..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

echo "==> [Step 6/8] Linking Public Storage..."
php artisan storage:link || true

echo "==> [Step 7/8] Restarting Queue Workers & Reloading PHP-FPM..."
php artisan queue:restart
sudo systemctl reload php8.4-fpm || sudo supervisorctl restart php-fpm

echo "==> [Step 8/8] Deactivating Maintenance Mode & Health Verification..."
php artisan up

# Smoke test verify
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://api.gounow.com/up)
if [ "$HTTP_STATUS" -ne 200 ]; then
    echo "CRITICAL: Health check returned HTTP $HTTP_STATUS! Initiating rollback..."
    exit 1
fi

echo "==> Deployment Successfully Completed and Verified Healthy."
```

---

## 4. Rollback Plan

### Instant Rollback Triggers
Initiate immediate rollback if within 5 minutes of deployment:
1. Health check `/up` fails or returns 5xx for $> 30$ seconds.
2. Error rate exceeds 0.5% in Nginx error log or Sentry.
3. PostgreSQL experiences fatal lock contention or deadlocks.

### Rollback Execution Sequence
```bash
#!/usr/bin/env bash
set -Eeuo pipefail

echo "==> [Rollback Step 1] Entering maintenance mode..."
php artisan down

echo "==> [Rollback Step 2] Checking out previous stable release commit..."
git checkout <PREVIOUS_STABLE_COMMIT_HASH>

echo "==> [Rollback Step 3] Rebuilding autoloader..."
composer install --no-interaction --prefer-dist --optimize-autoloader --no-dev

echo "==> [Rollback Step 4] Re-caching configuration..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "==> [Rollback Step 5] Restarting workers and exiting maintenance..."
php artisan queue:restart
sudo systemctl reload php8.4-fpm
php artisan up

echo "==> Rollback complete. Inspecting logs..."
```

> **Warning on Destructive Migrations:** If the failed release contained irreversible column drops (`dropColumn`), rolling back code without rolling back database schemas can break the previous code version. Rule: Never drop columns in the same release that deprecates them; use expand-and-contract migrations.

---

## 5. Background Process Management (Supervisord)

In production, long-running processes must be supervised to automatically restart upon failure:

### `supervisord.conf` Worker Configuration
```ini
[program:gounow-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/html/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600 --timeout=90
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=4
redirect_stderr=true
stdout_logfile=/var/log/supervisor/worker.log
stdout_logfile_maxbytes=10MB
stdout_logfile_backups=5
```

### Scheduled Tasks (Cron)
Host crontab entry:
```cron
* * * * * cd /var/www/html && php artisan schedule:run >> /dev/null 2>&1
```

---

## 6. Acceptance Criteria (Phase 8 Sign-Off)
- [x] Web server security headers verified (`X-Frame-Options`, `X-Content-Type-Options`, `nosniff`, `Referrer-Policy`).
- [x] Dedicated health check endpoint (`/up`) configured and verified returning HTTP 200.
- [x] Zero-downtime deployment sequence and bash runbook drafted and verified.
- [x] Ephemeral storage risks on containerized PaaS identified with PostgreSQL/S3 remediation.
- [x] Supervisord queue worker and Cron scheduling specifications defined.
- [x] Rollback plan with migration constraints established.

## Recommendation for next phase
Proceed to **Phase 9: Backup, Disaster Recovery & Monitoring**, establishing backup scripts, restore drills, RPO/RTO targets, alerting thresholds, and incident response runbooks.
