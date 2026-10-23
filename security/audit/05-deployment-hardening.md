# GouNow Security Audit — 05. Deployment & Production Hardening Guide

**Assessment Date:** October 22, 2026  
**Auditor:** Senior Application Security & DevSecOps Engineer  
**Target Environment:** Docker / Linux VPS / Nginx Reverse Proxy / PostgreSQL 16  

---

## 1. Production Environment Configuration (`.env.production`)

The following environment variables are strictly mandatory for public production launch:

```ini
# Application Runtime
APP_NAME="GouNow Lifestyle Platform"
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:GENERATE_FRESH_32_BYTE_KEY_DO_NOT_REUSE_DEV
APP_URL=https://gounow.com
FRONTEND_URL=https://gounow.com

# Database Connection (PostgreSQL 16)
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=gounow_production
DB_USERNAME=gounow_app_user
DB_PASSWORD=USE_STRONG_RANDOMLY_GENERATED_PASSWORD_32_CHARS
DB_SSLMODE=prefer

# Session & Cookie Security
SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=true
SESSION_PATH=/
SESSION_DOMAIN=gounow.com
SESSION_SECURE_COOKIE=true
SESSION_HTTP_ONLY=true
SESSION_SAME_SITE=lax

# Cache & Locking (Database or Redis)
CACHE_STORE=database
LOCK_STORE=database

# Queue Worker
QUEUE_CONNECTION=database

# CORS Policy
CORS_ALLOWED_ORIGINS="https://gounow.com,https://admin.gounow.com"
# Wildcard patterns are automatically disabled in production

# Payment Gateway Live Credentials
PAYMOB_API_KEY=live_paymob_api_key_xxxxxxxx
PAYMOB_INTEGRATION_ID=123456
PAYMOB_IFRAME_ID=789101
PAYMOB_HMAC_SECRET=live_paymob_hmac_secret_sha512_xxxxxxxx

# Trusted Proxies (Cloudflare / Nginx IP range)
TRUSTED_PROXIES=127.0.0.1,10.0.0.0/8,172.16.0.0/12,192.168.0.0/16
```

---

## 2. Nginx Reverse Proxy Hardening (`/etc/nginx/conf.d/gounow.conf`)

```nginx
# Hide server software tokens
server_tokens off;

# Rate Limiting Zones
limit_req_zone $binary_remote_addr zone=api_general:10m rate=30r/s;
limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=5r/m;
limit_req_zone $binary_remote_addr zone=checkout_limit:10m rate=10r/m;

server {
    listen 80;
    server_name gounow.com www.gounow.com;
    return 301 https://gounow.com$request_uri;
}

server {
    listen 443 ssl http2;
    server_name gounow.com;

    # TLS 1.2 and 1.3 only with modern ciphers
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;
    ssl_session_tickets off;

    # SSL Certificates
    ssl_certificate /etc/letsencrypt/live/gounow.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/gounow.com/privkey.pem;

    # Defense-in-depth HTTP Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header Permissions-Policy "geolocation=(), camera=(), microphone=()" always;

    # Request Body Size Limitation (Block oversized payload attacks)
    client_max_body_size 50M;

    # Backend API Routing
    location /api/ {
        limit_req zone=api_general burst=20 nodelay;

        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }

    # Storage Disk (Public assets only - Receipts disk is NEVER exposed here)
    location /storage/ {
        alias /var/www/gounow/backend/storage/app/public/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
        try_files $uri =404;
    }

    # Frontend Routing (Next.js Node server)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 3. Storage & File Permissions

```bash
# Web application ownership
chown -R www-data:www-data /var/www/gounow/backend/storage /var/www/gounow/backend/bootstrap/cache

# Restrict permissions
find /var/www/gounow/backend/storage -type d -exec chmod 750 {} \;
find /var/www/gounow/backend/storage -type f -exec chmod 640 {} \;

# Private Receipts directory strictly inaccessible from public webroot
chmod 700 /var/www/gounow/backend/storage/app/receipts
```
