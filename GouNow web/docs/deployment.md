# Production Deployment & High-Concurrency Scaling

## 1. High-Concurrency Production Architecture

To handle tens of thousands of concurrent users browsing properties, booking yacht excursions, and checking out simultaneously without bottlenecks, GouNow is deployed as a **Stateless Scalable Monolith**:

```
                       ┌─────────────────────────┐
                       │  Cloudflare / CDN Edge  │
                       │  (DDoS, SSL, Static CSS)│
                       └────────────┬────────────┘
                                    │
                       ┌────────────▼────────────┐
                       │   AWS ALB / Nginx Proxy  │
                       └────────────┬────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         │                          │                          │
┌────────▼────────┐        ┌────────▼────────┐        ┌────────▼────────┐
│ App Server 1    │        │ App Server 2    │        │ Worker Server   │
│ (Laravel/PHP)   │        │ (Laravel/PHP)   │        │ (Horizon Queues)│
└────────┬────────┘        └────────┬────────┘        └────────┬────────┘
         │                          │                          │
         ├──────────────────────────┴──────────────────────────┤
         │                                                     │
┌────────▼────────────────┐                          ┌─────────▼────────┐
│      Redis Cluster      │                          │   AWS S3 / R2    │
│ Sessions, Cache, Locks  │                          │  Property Photos │
└─────────────────────────┘                          └──────────────────┘
         │
┌────────▼────────────────┐
│   MySQL 8+ Primary DB   │
│   (Transactions, Rows)  │
└────────┬────────────────┘
         │ (Replication)
┌────────▼────────────────┐
│   MySQL Read Replica    │
│   (Search & Catalogs)   │
└─────────────────────────┘
```

---

## 2. Stateless Application Design Principles

1. **Centralized Sessions:**
   `SESSION_DRIVER=redis` ensures a user's session remains valid regardless of which application container receives their next request.
2. **Centralized Locking & Idempotency:**
   Row locks run on the primary MySQL database; cache tags and distributed rate limiters operate on Redis.
3. **Decoupled File Storage:**
   All uploaded property images, brochures, and tickets are streamed directly to S3/Cloudflare R2 (`FILESYSTEM_DISK=s3`). Application containers remain completely ephemeral and stateless.

---

## 3. Production Environment Configuration (`.env`)

```ini
APP_ENV=production
APP_DEBUG=false
APP_URL=https://gounow.com

# Database
DB_CONNECTION=mysql
DB_HOST=primary-db.internal
DB_PORT=3306
DB_DATABASE=gounow_prod
DB_USERNAME=gounow_user
DB_PASSWORD=secret_production_password

# Read Replica (for high-volume search queries)
DB_READ_HOST=replica-db.internal

# Caching & Sessions
CACHE_STORE=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis
REDIS_CLIENT=phpredis
REDIS_HOST=redis.internal
REDIS_PORT=6379

# Media Storage
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_DEFAULT_REGION=eu-central-1
AWS_BUCKET=gounow-assets-prod
AWS_URL=https://assets.gounow.com
```

---

## 4. Zero-Downtime Deployment Runbook

Deployments execute using zero-downtime symlink deployment (Envoy, Deployer, or ECS Blue/Green):

```bash
# 1. Fetch latest release
git pull origin main

# 2. Install production dependencies
composer install --no-dev --optimize-autoloader --no-interaction

# 3. Compile frontend assets
npm ci && npm run build

# 4. Migrate database (Safe non-blocking schema updates)
php artisan migrate --force

# 5. Clear and pre-warm caches
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# 6. Restart queue workers cleanly
php artisan queue:restart

# 7. Reload PHP-FPM / Octane
sudo systemctl reload php8.2-fpm
```
