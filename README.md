# Gouna Lifestyle Platform

A multilingual lifestyle, stays, experiences, events and real estate platform for El Gouna.

---

## 🏛️ Project Architecture

```
gouna-lifestyle-platform/
├── frontend/             # 🌐 Web Client & UI (Static Pages, CSS, JS, Assets)
│   ├── index.html        # Main landing page
│   ├── stays/            # Stays & properties catalog
│   ├── experiences/      # Curated adventures & activities
│   ├── admin/            # Admin management shell & login
│   ├── checkout/         # Reservation & checkout flows
│   ├── assets/           # Media & brand images
│   └── build/            # Compiled frontend CSS and JS
│
├── backend/              # ⚙️ Laravel 12 Backend Core
│   ├── app/              # Business logic, Controllers, Models, DTOs
│   ├── database/         # SQLite DB, Migrations & Seeders
│   ├── routes/           # Web & API routes
│   ├── tests/            # Feature & Unit test suites (53 tests)
│   ├── scripts/          # Automation tools & static exporter
│   └── composer.json     # Backend dependencies
│
├── .github/workflows/    # 🚀 CI/CD Pipelines
│   └── ci-cd.yml         # Automated testing & GitHub Pages deployment
│
├── docker/               # 🐳 Production Docker configuration
└── Dockerfile            # Container deployment image
```

---

## 🚀 Deployment

- **Frontend (Live Demo):** Deployed automatically to **GitHub Pages** on every push.
- **Backend (Cloud Server):** Containerized via Docker for deployment on cloud hosts (Render, Railway, Fly.io).
