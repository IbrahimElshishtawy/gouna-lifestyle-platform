# GouNow Performance Baseline Report (Phase 0 — P0-T07)

- **Environment**: Local SQLite testing database (`testing.sqlite`)
- **Timestamp**: 2026-10-03T15:47:40+00:00
- **Iterations**: 20 requests per critical endpoint
- **Strict Mode Test**: Monitored query logs and executed query counts

| Endpoint | Method | Status | Queries Count | p50 Latency (ms) | p95 Latency (ms) | Response Size (Bytes) |
|---|---|---|---|---|---|---|
| Homepage | GET | 200 | 11 | 5.47 ms | 8.17 ms | 100456 |
| Stays Catalog (/stays) | GET | 200 | 7 | 6.94 ms | 10.30 ms | 47954 |
| Property Detail (/stays/{slug}) | GET | 200 | 16 | 6.65 ms | 7.54 ms | 50179 |
| Quote Calculation (POST /checkout/calculate) | POST | 200 | 8 | 3.94 ms | 4.51 ms | 1819 |
| Checkout Page (/checkout/{slug}) | GET | 200 | 12 | 5.06 ms | 5.36 ms | 24227 |
| Curated Experiences (/experiences) | GET | 200 | 3 | 2.94 ms | 4.06 ms | 28371 |
| Admin Login Page (/admin/login) | GET | 200 | 0 | 0.90 ms | 1.11 ms | 8449 |
| Admin Dashboard (/admin) | GET | 200 | 27 | 10.41 ms | 13.35 ms | 81349 |
| Admin Properties Index (/admin/properties) | GET | 200 | 10 | 6.20 ms | 6.83 ms | 76483 |
| Admin Bookings Index (/admin/bookings) | GET | 200 | 3 | 4.70 ms | 4.90 ms | 71396 |
