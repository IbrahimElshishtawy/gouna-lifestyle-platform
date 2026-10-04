# PHASE 12: REALISTIC LOAD TESTING PLAN & EXECUTION SPECIFICATION

**Date**: 2026-10-04  
**Status**: APPROVED & OPERATIONAL  
**Evaluator**: Antigravity Autonomous Production Readiness Agent  

---

## 1. Traffic Profile & Sizing Model

Rather than designing for synthetic hyper-scale, this load test plan models realistic boutique luxury hospitality traffic for El Gouna:

- **Target Audience**: High-net-worth vacationers, long-term residents, and event attendees.
- **Concurrent Active Users**:
  - Baseline Traffic: 25–50 concurrent users.
  - Peak Season / Marketing Campaigns: 150–250 concurrent users.
- **Traffic Composition**:
  - **80% Read-Heavy Browsing**: Homepage, property catalog, category filtering, property detail views, curated experiences.
  - **15% Interactive Calculation**: Quote calculation API (`/checkout/calculate`), stay duration adjustments.
  - **5% Transactional Writes**: Booking submissions, web checkout processing, gateway webhook callbacks.

---

## 2. Service Level Objectives (SLOs)

| Metric | Read Endpoints (`GET`) | Quote Calculation (`POST`) | Booking & Checkout (`POST`) | Gateway Webhook (`POST`) |
|---|---|---|---|---|
| **p50 Latency** | < 50 ms | < 40 ms | < 150 ms | < 100 ms |
| **p95 Latency** | < 200 ms | < 120 ms | < 350 ms | < 250 ms |
| **p99 Latency** | < 400 ms | < 250 ms | < 600 ms | < 500 ms |
| **Max Error Rate** | < 0.1% (HTTP 5xx) | < 0.1% (HTTP 5xx) | 0.0% (HTTP 5xx) | 0.0% (HTTP 5xx) |
| **Correctness** | 100% data consistency | Exact price match | 0 double bookings | 0 duplicate allocations |

---

## 3. Test Scenarios

### Scenario 1: Warmup & Ramp-Up
- **Duration**: 2 minutes.
- **Virtual Users (VUs)**: 1 -> 50 VUs linearly.
- **Goal**: Populate application opcache, warm database query planner buffers, verify base health.

### Scenario 2: Peak Steady State (Sustained)
- **Duration**: 10 minutes.
- **Virtual Users**: 150 VUs sustained.
- **Mix**: 120 VUs browsing, 20 VUs requesting quotes, 10 VUs creating bookings.
- **Goal**: Measure steady-state latency distribution, memory stability, and connection pool behavior.

### Scenario 3: Spike / Event Announcement Surge
- **Duration**: 3 minutes.
- **Virtual Users**: Spike from 50 to 300 VUs in 30 seconds, held for 2 minutes, ramp down.
- **Goal**: Verify rate limiter behavior (HTTP 429 throttling) without crashing the PHP-FPM pool or PostgreSQL connection pool.

### Scenario 4: High-Contention Concurrency Stress
- **Duration**: 1 minute.
- **Virtual Users**: 20 concurrent threads attempting to book the exact same property on the exact same dates simultaneously.
- **Expected Outcome**: Exactly 1 thread succeeds (201 Created); 19 threads receive 409 Conflict (`AvailabilityConflictException`). Zero double bookings.

---

## 4. k6 Execution Script (`load_test.js`)

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },
    { duration: '3m', target: 150 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<300'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.TARGET_URL || 'http://localhost:8000';

export default function () {
  // 1. Browse Homepage
  let res = http.get(`${BASE_URL}/`);
  check(res, { 'homepage 200': (r) => r.status === 200 });
  sleep(1);

  // 2. Browse Stays Catalog
  res = http.get(`${BASE_URL}/stays`);
  check(res, { 'stays catalog 200': (r) => r.status === 200 });
  sleep(2);

  // 3. Request Authoritative Quote
  const quotePayload = JSON.stringify({
    property_id: 1,
    check_in: '2026-11-15',
    check_out: '2026-11-19',
    guests: 2,
  });

  res = http.post(`${BASE_URL}/checkout/calculate`, quotePayload, {
    headers: { 'Content-Type': 'application/json' },
  });
  check(res, { 'quote 200': (r) => r.status === 200 });
  sleep(1);
}
```

---

## 5. Monitoring & Resource Health Thresholds

During load tests, operational metrics must remain within safe operational bounds:
- **CPU Utilization**: < 70% sustained on application servers.
- **Memory Consumption**: PHP worker memory cap set to 256MB (`memory_limit = 256M`), pool total consumption < 75% system RAM.
- **Database Active Connections**: < 60 connections out of 100 max configured in PostgreSQL pool (`max_connections = 100`).
- **Database Query Latency**: Active slow query threshold set to 100ms in PostgreSQL log (`log_min_duration_statement = 100`).
