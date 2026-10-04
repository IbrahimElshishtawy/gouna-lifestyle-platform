# GouNow Performance Baseline Report (Phase 0 — P0-T07)

- **Environment**: Local SQLite testing database (`testing.sqlite`)
- **Timestamp**: 2026-10-04T21:27:49+00:00
- **Iterations**: 20 requests per critical endpoint
- **Strict Mode Test**: Monitored query logs and executed query counts

| Endpoint | Method | Status | Queries Count | p50 Latency (ms) | p95 Latency (ms) | Response Size (Bytes) |
|---|---|---|---|---|---|---|
| Homepage | GET | 200 | 11 | 7.60 ms | 15.33 ms | 100456 |
| Stays Catalog (/stays) | GET | 200 | 7 | 8.86 ms | 10.00 ms | 47954 |
| Property Detail (/stays/{slug}) | GET | 200 | 16 | 11.16 ms | 40.51 ms | 50178 |
| Quote Calculation (POST /checkout/calculate) | POST | 200 | 8 | 5.92 ms | 25.79 ms | 1818 |
| Checkout Page (/checkout/{slug}) | GET | 200 | 12 | 7.56 ms | 10.91 ms | 24227 |
| Curated Experiences (/experiences) | GET | 200 | 3 | 4.57 ms | 6.29 ms | 28371 |
| Admin Login Page (/admin/login) | GET | 200 | 0 | 1.90 ms | 2.24 ms | 8449 |
| Admin Dashboard (/admin) | GET | 200 | 26 | 42.96 ms | 66.84 ms | 81303 |
| Admin Properties Index (/admin/properties) | GET | 200 | 8 | 9.79 ms | 40.79 ms | 76483 |
| Admin Bookings Index (/admin/bookings) | GET | 200 | 3 | 8.42 ms | 31.53 ms | 71396 |
