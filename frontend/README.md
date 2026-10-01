# GouNow Lifestyle Platform — Next.js Frontend

Production-ready Next.js 15 (App Router, React 19, TypeScript, Tailwind CSS) frontend for **GouNow**, the premier luxury lifestyle, vacation villa rental, yacht charter, and real estate platform in El Gouna, Red Sea, Egypt.

---

## 🏛️ Architecture Overview

The frontend is structured using a scalable **Feature-Driven Architecture**:

```
frontend/
├── public/                      # Static assets, logos, and property images
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── (public)/            # Public guest-facing routes
│   │   │   ├── stays/           # Stays catalog & stay detail pages
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/page.tsx
│   │   │   ├── properties/      # Route aliases for stays & real estate
│   │   │   ├── experiences/     # Red Sea adventures catalog & detail pages
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/page.tsx
│   │   │   ├── checkout/        # 3-Step reservation & payment checkout
│   │   │   │   └── [slug]/page.tsx
│   │   │   └── layout.tsx       # Public shell (Navbar + Footer + WhatsApp CTA)
│   │   ├── admin/               # Administrative Management Portal
│   │   │   ├── login/           # Admin login with demo credentials
│   │   │   ├── properties/      # Property portfolio & + Add Property
│   │   │   ├── bookings/        # Reservations & payments audit
│   │   │   ├── pricing/         # Base prices, seasonal surges, promo vouchers
│   │   │   ├── experiences/     # Experience operations
│   │   │   ├── customers/       # Buyer leads & client inquiries
│   │   │   ├── layout.tsx       # Responsive Admin Layout (Sidebar + Header)
│   │   │   └── page.tsx         # Executive Overview Dashboard (KPIs & tables)
│   │   ├── layout.tsx           # Root layout with SEO JSON-LD & GA4 DataLayer
│   │   ├── not-found.tsx        # 404 Error page matching brand aesthetic
│   │   └── page.tsx             # Homepage with editorial sections
│   ├── components/
│   │   └── layout/              # Shared Navbar, Footer, WhatsApp Floating Button
│   ├── features/                # Domain-Driven Modules
│   │   ├── properties/          # Types, local data, API services, quote calculator
│   │   ├── experiences/         # Types, data, API services, inquiry widget
│   │   ├── checkout/            # Checkout form state, financial summary
│   │   ├── home/                # Hero, featured listings, concierge, FAQs
│   │   └── admin/               # Sidebar & Topbar components
│   ├── lib/
│   │   ├── api/client.ts        # Unified API fetch client with local fallback
│   │   └── analytics/gtm.ts     # GA4 / GTM DataLayer event dispatcher
│   └── types/                   # Common and shared TypeScript interfaces
```

---

## 🎨 Visual Fidelity & Design System

The application preserves **100% exact design fidelity** matching the legacy HTML/CSS layout:
* **Palette Tokens:** `brand-terracotta` (`#B85D3B`), `brand-sand` (`#E5DCD3`), `brand-brown` (`#3D2E26`), `brand-sand-light` (`#F6F3EE`), `brand-sand-card` (`#FAF8F5`).
* **Typography:** `Plus Jakarta Sans`, `Playfair Display`, `Tajawal` (Arabic).
* **Integrations:** Direct WhatsApp Concierge Desk integration with pre-filled dynamic messages.
* **Safety:** The Laravel backend (`backend/`) was left completely untouched. The original frontend is preserved in `frontend-legacy/`.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
# In Linux environments with IPv6 autoselection issues, use:
NODE_OPTIONS="--no-network-family-autoselection" npm install --legacy-peer-deps
```

### 2. Development Server
```bash
npm run dev
# Starts at http://localhost:3000
```

### 3. Production Build
```bash
NODE_OPTIONS="--no-network-family-autoselection" npm run build
npm run start
```

---

## 🔑 Administrative Demo Credentials
Available directly from the `/admin/login` interface:
* **Super Admin:** `admin@gounow.com` / `GouNow@2026!Secure`
* **Property Manager:** `stays@gounow.com` / `GouNow@2026!Secure`
