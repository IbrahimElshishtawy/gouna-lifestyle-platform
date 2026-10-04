# GouNow Performance Baseline Report (Phase 0 — P0-T07)

- **Environment**: Local SQLite testing database (`testing.sqlite`)
- **Timestamp**: 2026-10-04T18:56:07+00:00
- **Iterations**: 20 requests per critical endpoint
- **Strict Mode Test**: Monitored query logs and executed query counts

| Endpoint | Method | Status | Queries Count | p50 Latency (ms) | p95 Latency (ms) | Response Size (Bytes) |
|---|---|---|---|---|---|---|
| Homepage | GET | 200 | 11 | 7.68 ms | 24.45 ms | 100456 |
| Stays Catalog (/stays) | GET | 200 | 7 | 8.33 ms | 10.50 ms | 47954 |
| Property Detail (/stays/{slug}) | GET | 200 | 16 | 10.22 ms | 13.77 ms | 50178 |
| Quote Calculation (POST /checkout/calculate) | POST | 200 | 8 | 5.52 ms | 8.30 ms | 1818 |
| Checkout Page (/checkout/{slug}) | GET | 200 | 12 | 7.29 ms | 8.87 ms | 24227 |
| Curated Experiences (/experiences) | GET | 200 | 3 | 4.19 ms | 5.34 ms | 28371 |
| Admin Login Page (/admin/login) | GET | 200 | 0 | 1.54 ms | 1.66 ms | 8449 |
| Admin Dashboard (/admin) | GET | 200 | 26 | 16.18 ms | 22.68 ms | 81318 |
| Admin Properties Index (/admin/properties) | GET | 200 | 8 | 8.62 ms | 13.43 ms | 76483 |
| Admin Bookings Index (/admin/bookings) | GET | 200 | 3 | 9.49 ms | 24.20 ms | 71396 |
