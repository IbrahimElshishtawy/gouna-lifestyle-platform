# GouNow Performance Baseline Report (Phase 0 — P0-T07)

- **Environment**: Local SQLite testing database (`testing.sqlite`)
- **Timestamp**: 2026-10-03T19:29:27+00:00
- **Iterations**: 20 requests per critical endpoint
- **Strict Mode Test**: Monitored query logs and executed query counts

| Endpoint | Method | Status | Queries Count | p50 Latency (ms) | p95 Latency (ms) | Response Size (Bytes) |
|---|---|---|---|---|---|---|
| Homepage | GET | 200 | 11 | 3.57 ms | 6.62 ms | 100456 |
| Stays Catalog (/stays) | GET | 200 | 7 | 3.72 ms | 4.54 ms | 47954 |
| Property Detail (/stays/{slug}) | GET | 200 | 16 | 4.63 ms | 5.26 ms | 50179 |
| Quote Calculation (POST /checkout/calculate) | POST | 200 | 8 | 2.44 ms | 3.20 ms | 1819 |
| Checkout Page (/checkout/{slug}) | GET | 200 | 12 | 3.23 ms | 3.55 ms | 24227 |
| Curated Experiences (/experiences) | GET | 200 | 3 | 1.83 ms | 2.54 ms | 28371 |
| Admin Login Page (/admin/login) | GET | 200 | 0 | 0.68 ms | 0.75 ms | 8449 |
| Admin Dashboard (/admin) | GET | 200 | 27 | 6.79 ms | 8.21 ms | 81314 |
| Admin Properties Index (/admin/properties) | GET | 200 | 10 | 4.24 ms | 4.99 ms | 76483 |
| Admin Bookings Index (/admin/bookings) | GET | 200 | 3 | 3.14 ms | 3.52 ms | 71396 |
