# Environment Configuration Matrix

This document provides the authoritative environment configuration across Local, Staging, and Production deployments for both Next.js Frontend and Laravel Backend.

---

## 1. Environment Topology Matrix

| Variable / Setting | Local Development | Staging (Render/VPS) | Production (High-Availability) |
|---|---|---|---|
| **Frontend URL** | `http://localhost:3000` | `https://staging.gounow.com` | `https://gounow.com` |
| **Backend API URL** | `http://127.0.0.1:8000/api/v1` | `https://api-staging.gounow.com/api/v1` | `https://api.gounow.com/api/v1` |
| **Backend Base URL** | `http://127.0.0.1:8000` | `https://api-staging.gounow.com` | `https://api.gounow.com` |
| **Database Engine** | SQLite (`database/testing.sqlite`) | PostgreSQL 16 | PostgreSQL 16 (Managed Cluster) |
| **Session Driver** | `file` / `cookie` | `redis` | `redis` (Encrypted) |
| **Cache Driver** | `file` | `redis` | `redis` |
| **Queue Connection** | `database` / `sync` | `redis` | `redis` |
| **Filesystem / Storage** | `local` (`storage/app/public`) | S3 / MinIO (Test Bucket) | AWS S3 (Hardened, Private ACL, CloudFront) |
| **CORS Whitelist** | `http://localhost:3000,http://127.0.0.1:3000` | `https://staging.gounow.com` | `https://gounow.com` |
| **Payment Gateway Mode** | Simulated / Sandbox | Sandbox (Paymob / Stripe Test) | Production (Paymob / Stripe Live) |
| **Webhooks Security** | Local test signature | HMAC SHA256 (Staging Secret) | HMAC SHA256 (Rotated Secret in Vault) |

---

## 2. Frontend Configuration (`frontend/.env.*`)

### Public Client Variables (`NEXT_PUBLIC_*`)
Only variables safe to be bundled into client-side JavaScript are prefixed with `NEXT_PUBLIC_`:

- `NEXT_PUBLIC_API_URL`: Root base for API calls (e.g. `http://localhost:8000/api/v1`).
- `NEXT_PUBLIC_BACKEND_URL`: Root base for backend media assets (e.g. `http://localhost:8000`).

### Private Server Variables
Server-side secrets must **never** be prefixed with `NEXT_PUBLIC_`. All payment keys, database credentials, and webhook secrets remain isolated inside the Laravel backend.

---

## 3. Backend Configuration (`backend/.env.*`)

Key security and integration settings:

```ini
APP_NAME=Gounow
APP_ENV=local                    # 'production' in live environments
APP_KEY=base64:...
APP_DEBUG=true                   # MUST be 'false' in production
APP_URL=http://localhost:8000

# CORS Whitelist for Next.js
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Sanctum Stateful Domains
SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000

# Rate Limiting Drivers
CACHE_STORE=file                 # 'redis' in production
```
