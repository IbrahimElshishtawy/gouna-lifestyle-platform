# Phase 13 — Production Deployment Runbook

**Project**: GouNow Lifestyle Platform  
**Target Environment**: Production Linux (Ubuntu 22.04 / 24.04 LTS or Alpine Linux Container)  
**PHP Version**: PHP 8.2+ (Recommended PHP 8.5)  
**Database**: PostgreSQL 16 (Managed AWS RDS, Supabase, or Dedicated Node)  
**Cache & Queue**: Redis 7+  
**Storage**: AWS S3 / Cloudflare R2 / MinIO  

---

## 1. System Requirements & Prerequisites

### 1.1 Operating System & Packages
- Ubuntu 22.04/24.04 LTS or Docker Alpine Linux
- Nginx 1.22+
- PHP 8.2+ with PHP-FPM
- Required PHP Extensions:
  - `pdo_pgsql` (PostgreSQL driver)
  - `redis` (Phpredis extension for caching, locks, and queues)
  - `bcmath` (high-precision arithmetic for financial logic)
  - `mbstring` (multibyte UTF-8 string operations for English/Arabic)
  - `opcache` (bytecode caching)
  - `intl` (internationalization and locale support)
  - `gd` or `imagick` (image processing)
  - `curl`, `zip`, `xml`, `fileinfo`
- Redis 7.0+
- PostgreSQL 16 with `btree_gist` extension support
- Composer 2.7+

---

## 2. Production Environment Configuration (`.env`)

Deploy the production environment configuration strictly verified against `docs/hardening/PHASE_7_PRODUCTION_CONFIG.md`:

```dotenv
APP_NAME=Gounow
APP_ENV=production
APP_KEY=base64:YOUR_32_BYTE_PRODUCTION_KEY
APP_DEBUG=false
APP_URL=https://gounow.com

APP_LOCALE=en
APP_FALLBACK_LOCALE=en

LOG_CHANNEL=stack
LOG_STACK=single
LOG_LEVEL=info

# Database (PostgreSQL 16)
DB_CONNECTION=pgsql
DB_HOST=your-postgres-cluster.internal
DB_PORT=5432
DB_DATABASE=gounow_production
DB_USERNAME=gounow_app
DB_PASSWORD=YOUR_STRONG_DB_PASSWORD
DB_SSLMODE=require

# Sessions (Isolated in Database or Redis)
SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=true
SESSION_SECURE_COOKIE=true
SESSION_HTTP_ONLY=true
SESSION_SAME_SITE=lax

# Cache & Queues (Redis)
CACHE_STORE=redis
QUEUE_CONNECTION=redis
REDIS_CLIENT=phpredis
REDIS_HOST=your-redis-cluster.internal
REDIS_PORT=6379
REDIS_PASSWORD=YOUR_REDIS_PASSWORD

# Security & CORS
TRUSTED_PROXIES=10.0.0.0/8,172.16.0.0/12,192.168.0.0/16
CORS_ALLOWED_ORIGINS=https://gounow.com,https://admin.gounow.com

# Media & Storage (AWS S3)
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_KEY
AWS_DEFAULT_REGION=eu-central-1
AWS_BUCKET=gounow-production-media
AWS_USE_PATH_STYLE_ENDPOINT=false

# Payment Webhooks (Fail-Closed Secrets)
PAYMENT_WEBHOOK_SECRET=live_webhook_secret_production_key_here
PAYMOB_HMAC_SECRET=live_paymob_hmac_secret_production_key_here

# Mail
MAIL_MAILER=smtp
MAIL_HOST=email-smtp.eu-central-1.amazonaws.com
MAIL_PORT=587
MAIL_USERNAME=YOUR_SES_USERNAME
MAIL_PASSWORD=YOUR_SES_PASSWORD
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=concierge@gounow.com
MAIL_FROM_NAME="GouNow Lifestyle"
```

---

## 3. Pre-Flight Verification

Before switching web traffic, execute the automated configuration and security audit command:

```bash
php artisan config:audit-production
```

**Quality Gate**: The command must return exit code `0`. If any critical blockers are flagged, the deployment must immediately halt.

---

## 4. Zero-Downtime Deployment Sequence

Deploy using atomic directory symlinking (e.g., Deployer, Capistrano, or AWS CodeDeploy):

```bash
# Step 1: Export variables and paths
RELEASE_DIR="/var/www/gounow/releases/$(date +%Y%m%d%H%M%S)"
SHARED_DIR="/var/www/gounow/shared"
CURRENT_DIR="/var/www/gounow/current"

# Step 2: Clone repository
git clone --depth 1 --branch main https://github.com/org/gouna-lifestyle-platform.git "$RELEASE_DIR"
cd "$RELEASE_DIR/backend"

# Step 3: Link shared storage and production environment
ln -nfs "$SHARED_DIR/.env" .env
rm -rf storage
ln -nfs "$SHARED_DIR/storage" storage

# Step 4: Install composer production dependencies
composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction

# Step 5: Execute database migrations
php artisan migrate --force

# Step 6: Warm up caches
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Step 7: Pre-flight audit check
php artisan config:audit-production

# Step 8: Atomic switch of current symlink
ln -nfs "$RELEASE_DIR/backend" "$CURRENT_DIR"

# Step 9: Reload PHP-FPM and restart background queue workers
sudo systemctl reload php8.2-fpm || sudo systemctl reload php8.5-fpm
php artisan queue:restart

# Step 10: Health check validation
curl -f -s https://gounow.com/up || exit 1
```

---

## 5. Background Workers & Scheduled Tasks

### 5.1 Crontab / Task Scheduler
Configure crontab for `www-data`:
```cron
* * * * * cd /var/www/gounow/current && php artisan schedule:run >> /dev/null 2>&1
```

Scheduled jobs automatically invoked by Laravel:
- `bookings:expire-pending` (runs every 5 minutes to release stale unpaid booking holds).
- `media:cleanup-orphans` (runs weekly to delete unreferenced temporary uploads).
- `activitylog:clean` (runs monthly to prune aged activity records).

### 5.2 Supervisor Configuration for Queue Workers
Create `/etc/supervisor/conf.d/gounow-worker.conf`:
```ini
[program:gounow-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/gounow/current/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600 --timeout=90
autostart=true
autorestart=true
user=www-data
numprocs=4
redirect_stderr=true
stdout_logfile=/var/log/gounow/worker.log
```

---

## 6. Rollback Procedure

If fatal errors, 5xx spikes, or critical regressions are detected post-deployment:

```bash
# 1. Swap current symlink to previous release
PREVIOUS_RELEASE=$(ls -dt /var/www/gounow/releases/* | sed -n '2p')
ln -nfs "$PREVIOUS_RELEASE/backend" /var/www/gounow/current

# 2. Clear & re-warm caches on previous release
cd /var/www/gounow/current
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 3. Reload PHP-FPM and restart queue workers
sudo systemctl reload php8.2-fpm || sudo systemctl reload php8.5-fpm
php artisan queue:restart

# 4. Verify system health
curl -f -s https://gounow.com/up
```

*Note on Database Migrations*: If the failed deployment included additive migrations (new tables, nullable columns, indexes), do not rollback the database unless strictly necessary, as existing code is backward-compatible with additive changes.
