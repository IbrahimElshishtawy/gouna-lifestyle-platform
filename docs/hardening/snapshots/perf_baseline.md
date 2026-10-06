# GouNow Performance Baseline Report (Phase 0 — P0-T07)

- **Environment**: Local SQLite testing database (`testing.sqlite`)
- **Timestamp**: 2026-10-06T18:59:20+00:00
- **Iterations**: 20 requests per critical endpoint
- **Strict Mode Test**: Monitored query logs and executed query counts

| Endpoint | Method | Status | Queries Count | p50 Latency (ms) | p95 Latency (ms) | Response Size (Bytes) |
|---|---|---|---|---|---|---|
| Homepage | GET | 200 | 11 | 14.96 ms | 29.63 ms | 100456 |
| Stays Catalog (/stays) | GET | 200 | 7 | 24.50 ms | 29.13 ms | 47954 |
| Property Detail (/stays/{slug}) | GET | 200 | 16 | 29.51 ms | 34.64 ms | 50175 |
| Quote Calculation (POST /checkout/calculate) | POST | 200 | 8 | 11.81 ms | 13.13 ms | 1815 |
| Checkout Page (/checkout/{slug}) | GET | 200 | 12 | 14.57 ms | 18.17 ms | 24227 |
| Curated Experiences (/experiences) | GET | 200 | 3 | 9.52 ms | 10.54 ms | 28371 |
| Admin Login Page (/admin/login) | GET | 200 | 0 | 3.06 ms | 3.82 ms | 8449 |
| Admin Dashboard (/admin) | GET | 200 | 26 | 34.90 ms | 45.22 ms | 81303 |
| Admin Properties Index (/admin/properties) | GET | 200 | 8 | 25.62 ms | 28.87 ms | 76483 |
| Admin Bookings Index (/admin/bookings) | GET | 200 | 3 | 16.25 ms | 24.56 ms | 71396 |
