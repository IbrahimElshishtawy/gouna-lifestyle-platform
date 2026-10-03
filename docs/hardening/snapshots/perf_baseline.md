# GouNow Performance Baseline Report (Phase 0 — P0-T07)

- **Environment**: Local SQLite testing database (`testing.sqlite`)
- **Timestamp**: 2026-10-03T17:14:08+00:00
- **Iterations**: 20 requests per critical endpoint
- **Strict Mode Test**: Monitored query logs and executed query counts

| Endpoint | Method | Status | Queries Count | p50 Latency (ms) | p95 Latency (ms) | Response Size (Bytes) |
|---|---|---|---|---|---|---|
| Homepage | GET | 200 | 11 | 28.09 ms | 45.40 ms | 100456 |
| Stays Catalog (/stays) | GET | 200 | 7 | 22.55 ms | 45.70 ms | 47954 |
| Property Detail (/stays/{slug}) | GET | 200 | 16 | 40.80 ms | 60.81 ms | 50179 |
| Quote Calculation (POST /checkout/calculate) | POST | 200 | 8 | 13.95 ms | 16.78 ms | 1819 |
| Checkout Page (/checkout/{slug}) | GET | 200 | 12 | 16.20 ms | 30.19 ms | 24227 |
| Curated Experiences (/experiences) | GET | 200 | 3 | 11.75 ms | 30.08 ms | 28371 |
| Admin Login Page (/admin/login) | GET | 200 | 0 | 6.23 ms | 19.88 ms | 8449 |
| Admin Dashboard (/admin) | GET | 200 | 26 | 40.24 ms | 86.37 ms | 81303 |
| Admin Properties Index (/admin/properties) | GET | 200 | 10 | 7.03 ms | 32.31 ms | 76483 |
| Admin Bookings Index (/admin/bookings) | GET | 200 | 3 | 5.43 ms | 5.79 ms | 71396 |
