# GouNow Performance Baseline Report (Phase 0 — P0-T07)

- **Environment**: Local SQLite testing database (`testing.sqlite`)
- **Timestamp**: 2026-10-03T14:39:06+00:00
- **Iterations**: 20 requests per critical endpoint
- **Strict Mode Test**: Monitored query logs and executed query counts

| Endpoint | Method | Status | Queries Count | p50 Latency (ms) | p95 Latency (ms) | Response Size (Bytes) |
|---|---|---|---|---|---|---|
| Homepage | GET | 200 | 11 | 6.70 ms | 8.22 ms | 100456 |
| Stays Catalog (/stays) | GET | 200 | 7 | 6.79 ms | 16.78 ms | 47954 |
| Property Detail (/stays/{slug}) | GET | 200 | 16 | 8.02 ms | 12.44 ms | 50179 |
| Quote Calculation (POST /checkout/calculate) | POST | 200 | 8 | 3.89 ms | 8.53 ms | 1819 |
| Checkout Page (/checkout/{slug}) | GET | 200 | 12 | 4.91 ms | 6.66 ms | 24227 |
| Curated Experiences (/experiences) | GET | 200 | 3 | 3.23 ms | 6.63 ms | 28371 |
| Admin Login Page (/admin/login) | GET | 200 | 0 | 1.24 ms | 1.86 ms | 8449 |
| Admin Dashboard (/admin) | GET | 200 | 26 | 11.90 ms | 19.21 ms | 81301 |
| Admin Properties Index (/admin/properties) | GET | 200 | 10 | 7.05 ms | 8.59 ms | 76483 |
| Admin Bookings Index (/admin/bookings) | GET | 200 | 3 | 5.23 ms | 9.44 ms | 71396 |
