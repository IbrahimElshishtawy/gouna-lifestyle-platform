# GouNow Performance Baseline Report (Phase 0 — P0-T07)

- **Environment**: Local SQLite testing database (`testing.sqlite`)
- **Timestamp**: 2026-10-03T23:58:23+00:00
- **Iterations**: 20 requests per critical endpoint
- **Strict Mode Test**: Monitored query logs and executed query counts

| Endpoint | Method | Status | Queries Count | p50 Latency (ms) | p95 Latency (ms) | Response Size (Bytes) |
|---|---|---|---|---|---|---|
| Homepage | GET | 200 | 11 | 6.71 ms | 10.01 ms | 100456 |
| Stays Catalog (/stays) | GET | 200 | 7 | 7.43 ms | 9.37 ms | 47954 |
| Property Detail (/stays/{slug}) | GET | 200 | 16 | 9.12 ms | 10.18 ms | 50179 |
| Quote Calculation (POST /checkout/calculate) | POST | 200 | 8 | 4.92 ms | 6.07 ms | 1819 |
| Checkout Page (/checkout/{slug}) | GET | 200 | 12 | 6.50 ms | 7.15 ms | 24227 |
| Curated Experiences (/experiences) | GET | 200 | 3 | 3.70 ms | 4.90 ms | 28371 |
| Admin Login Page (/admin/login) | GET | 200 | 0 | 1.40 ms | 1.48 ms | 8449 |
| Admin Dashboard (/admin) | GET | 200 | 26 | 12.90 ms | 16.33 ms | 81318 |
| Admin Properties Index (/admin/properties) | GET | 200 | 10 | 8.30 ms | 9.01 ms | 76483 |
| Admin Bookings Index (/admin/bookings) | GET | 200 | 3 | 6.42 ms | 7.12 ms | 71396 |
