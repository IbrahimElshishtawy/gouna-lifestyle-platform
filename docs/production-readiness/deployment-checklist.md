# Single VPS Production Deployment Checklist & Runbook

**Platform:** GouNow (Gouna Lifestyle & Booking Platform)  
**Target Infrastructure:** Single Ubuntu 24.04 LTS VPS (Hetzner / DigitalOcean / Contabo / AWS EC2)  
**Document:** `docs/production-readiness/deployment-checklist.md`

---

## 1. Hardware & Operating System Specifications

| Component | Minimum Specification | Recommended Specification |
|---|---|---|
| **CPU** | 2 vCPU | 4 vCPU |
| **RAM** | 4 GB | 8 GB – 16 GB |
| **Disk** | 40 GB NVMe SSD | 80 GB – 160 GB NVMe SSD |
| **OS** | Ubuntu 22.04 LTS | Ubuntu 24.04 LTS (Noble Numbat) |
| **Docker** | Docker Engine 26.0+ | Docker Engine 27.x + Compose V2 |

---

## 2. Pre-Deployment Server Hardening

Execute on the clean VPS host prior to deploying Docker:

```bash
# 1. Update OS packages
sudo apt update && sudo apt upgrade -y

# 2. Configure firewall (UFW)
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP (Let's Encrypt validation)
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# 3. Create non-root deploy user
sudo adduser gounow
sudo usermod -aG sudo,docker gounow

# 4. Install Docker Engine and Compose plugin
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

---

## 3. Environment Variables Configuration (`.env.production`)

Ensure the following critical keys are configured and NEVER committed to version control:

```ini
APP_NAME=GouNow
APP_ENV=production
APP_KEY=base64:... # Generated via php artisan key:generate --show
APP_DEBUG=false
APP_URL=https://gounow.com

# PostgreSQL 16
DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=gounow_prod
DB_USERNAME=gounow_user
DB_PASSWORD=USE_A_STRONG_RANDOM_PASSWORD_HERE

# Redis 7
REDIS_HOST=redis
REDIS_PASSWORD=USE_A_STRONG_REDIS_PASSWORD_HERE
REDIS_PORT=6379
CACHE_STORE=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

# Private Storage (Receipts & Documents)
FILESYSTEM_DISK=local
RECEIPTS_DISK=receipts

# CORS & Domain Hardening
SANCTUM_STATEFUL_DOMAINS=gounow.com,www.gounow.com
FRONTEND_URL=https://gounow.com
```

---

## 4. Docker Compose Architecture

Services configured in `docker-compose.production.yml`:

1. **`postgres`** (PostgreSQL 16 Alpine):
   - Volume: `postgres_data:/var/lib/postgresql/data`
   - Initial script enables extension: `CREATE EXTENSION IF NOT EXISTS btree_gist;`
2. **`redis`** (Redis 7 Alpine):
   - Configured with password and persistence (`appendonly yes`).
3. **`app`** (PHP 8.3 FPM + Nginx):
   - Exposes internal HTTP port to reverse proxy.
   - Volume for private receipts: `private_receipts:/var/www/html/storage/app/private/receipts`
   - Volume for public media: `public_media:/var/www/html/storage/app/public`
4. **`queue`** (Artisan Worker):
   - Runs `php artisan queue:work --sleep=3 --tries=3 --timeout=90`.
5. **`scheduler`** (Cron Worker):
   - Runs `php artisan schedule:work` to automatically purge expired booking holds and clear old tokens.
6. **`frontend`** (Next.js Standalone):
   - Node 20 alpine running `node server.js` on port 3000.

---

## 5. Pre-Flight Execution Steps

Execute inside the deployment directory on the host:

```bash
# 1. Pull latest verified commit
git checkout main
git pull origin main

# 2. Build containers
docker compose -f docker-compose.production.yml build --no-cache

# 3. Start PostgreSQL and Redis first
docker compose -f docker-compose.production.yml up -d postgres redis

# 4. Wait 10 seconds for PostgreSQL to be healthy, then run migrations:
docker compose -f docker-compose.production.yml run --rm app php artisan migrate --force

# 5. Seed default offline payment methods and roles (if fresh DB)
docker compose -f docker-compose.production.yml run --rm app php artisan db:seed --class=PaymentMethodSeeder --force
docker compose -f docker-compose.production.yml run --rm app php artisan db:seed --class=RoleAndPermissionSeeder --force

# 6. Warm application production caches
docker compose -f docker-compose.production.yml run --rm app php artisan config:cache
docker compose -f docker-compose.production.yml run --rm app php artisan route:cache
docker compose -f docker-compose.production.yml run --rm app php artisan view:cache

# 7. Start all services
docker compose -f docker-compose.production.yml up -d
```

---

## 6. Automated Backup Strategy

Set up a daily cron task on the VPS host:

```bash
#!/bin/bash
# /opt/scripts/backup-gounow.sh
BACKUP_DIR="/var/backups/gounow"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
mkdir -p "$BACKUP_DIR"

# 1. PostgreSQL Database Dump
docker exec gounow-postgres-1 pg_dump -U gounow_user -d gounow_prod | gzip > "$BACKUP_DIR/db_$TIMESTAMP.sql.gz"

# 2. Archive Private Receipts & Media
tar -czf "$BACKUP_DIR/receipts_$TIMESTAMP.tar.gz" -C /var/lib/docker/volumes/gounow_private_receipts/_data .

# 3. Retain last 14 days locally
find "$BACKUP_DIR" -type f -mtime +14 -delete

# 4. (Optional) Sync to Cloud Object Storage via rclone
# rclone copy "$BACKUP_DIR" remote:gounow-offsite-backups/
```

Add to root crontab:
```cron
0 3 * * * /opt/scripts/backup-gounow.sh >> /var/log/gounow-backup.log 2>&1
```

---

## 7. Post-Deployment Verification Checklist

- [ ] **Health Endpoint**: `curl -I https://gounow.com/api/v1/health` returns HTTP 200 with DB, Redis, and Storage OK.
- [ ] **Public Stays Catalog**: Navigating to `https://gounow.com/en/stays` loads properties without hydration errors.
- [ ] **Manual Checkout**: Create a test booking using Instapay. Confirm reference number and bank instructions render cleanly.
- [ ] **Receipt Upload**: Upload a sample test receipt (`test.jpg`). Verify upload succeeds and status changes to `pending`.
- [ ] **Admin Verification**: Log into `/admin/finances`, view receipt, click **Verify & Confirm**. Verify booking changes to `confirmed` and ledger updates.
- [ ] **Private Storage Lockdown**: Directly querying `https://gounow.com/storage/app/private/receipts/...` returns HTTP 404 or 403.
