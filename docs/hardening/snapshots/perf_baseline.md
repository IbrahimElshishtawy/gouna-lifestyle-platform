# GouNow Performance Baseline Report (Phase 0 — P0-T07)

- **Environment**: Local SQLite testing database (`testing.sqlite`)
- **Timestamp**: 2026-10-04T11:01:56+00:00
- **Iterations**: 20 requests per critical endpoint
- **Strict Mode Test**: Monitored query logs and executed query counts

| Endpoint | Method | Status | Queries Count | p50 Latency (ms) | p95 Latency (ms) | Response Size (Bytes) |
|---|---|---|---|---|---|---|
| Homepage | GET | 200 | 11 | 7.35 ms | 16.03 ms | 100456 |
| Stays Catalog (/stays) | GET | 200 | 7 | 8.71 ms | 31.45 ms | 47954 |
| Property Detail (/stays/{slug}) | GET | 200 | 16 | 10.21 ms | 25.53 ms | 50178 |
| Quote Calculation (POST /checkout/calculate) | POST | 200 | 8 | 5.32 ms | 6.64 ms | 1818 |
| Checkout Page (/checkout/{slug}) | GET | 200 | 12 | 7.07 ms | 9.24 ms | 24227 |
| Curated Experiences (/experiences) | GET | 200 | 3 | 4.17 ms | 20.32 ms | 28371 |
| Admin Login Page (/admin/login) | GET | 200 | 0 | 1.51 ms | 1.63 ms | 8449 |
| Admin Dashboard (/admin) | GET | 200 | 26 | 16.23 ms | 38.03 ms | 81303 |
| Admin Properties Index (/admin/properties) | GET | 200 | 8 | 9.55 ms | 20.55 ms | 76483 |
| Admin Bookings Index (/admin/bookings) | GET | 200 | 3 | 7.35 ms | 19.10 ms | 71396 |
