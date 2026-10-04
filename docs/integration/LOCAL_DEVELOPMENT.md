# Local Development Topology & Setup Guide

This guide describes how to run and verify the integrated Next.js frontend and Laravel backend locally.

---

## 1. System Requirements

- **PHP**: 8.2 or 8.3+ with `pdo_sqlite`, `sqlite3`, `mbstring`, `openssl`, `curl` extensions
- **Node.js**: v20+ or v24+
- **Composer**: 2.x
- **NPM**: 10.x+

---

## 2. Local Architecture

```
Browser (http://localhost:3000)
    │
    ▼
Next.js Frontend (Next 15 App Router)
    │
    ▼ (HTTP / API via process.env.NEXT_PUBLIC_API_URL)
Laravel 11 REST API (http://127.0.0.1:8000/api/v1)
    │
    ▼
SQLite Database (database/testing.sqlite or database/database.sqlite)
```

---

## 3. Quick Start (Step-by-Step)

### Terminal 1: Backend Server
```bash
cd backend
# Ensure dependencies are installed
composer install

# Run database migrations
php artisan migrate

# Seed baseline properties, users, and CMS records
php artisan db:seed

# Start backend server on port 8000
php artisan serve --host=127.0.0.1 --port=8000
```
Verify backend is reachable:
```bash
curl http://127.0.0.1:8000/api/v1/stays
```

### Terminal 2: Frontend Server
```bash
cd frontend
# Ensure dependencies are installed
npm install

# Verify environment variables
cp .env.example .env.local

# Run Next.js in development mode
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 4. Administrative Credentials (Local Testing)

- **URL**: `http://localhost:3000/admin/login`
- **Email**: `admin@gounow.com`
- **Password**: `GouNow@2026!Secure`
- **Role**: `super_admin` (`is_admin: true`)

---

## 5. Verification Commands

Run full system verification at any time:

```bash
# 1. Automated Frontend <-> Backend Integration Suite
python3 test_frontend_backend_integration.py

# 2. Backend Feature & Security Tests
cd backend && php artisan test --env=testing

# 3. Backend Static Analysis & Code Style
cd backend && ./vendor/bin/phpstan analyse app routes --memory-limit=1G && ./vendor/bin/pint --test

# 4. Frontend Typecheck, Lint & Production Build
cd frontend && npm run typecheck && npm run lint && npm run build
```
