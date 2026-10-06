# GouNow Performance Baseline Report (Phase 0 — P0-T07)

- **Environment**: Local SQLite testing database (`testing.sqlite`)
- **Timestamp**: 2026-10-05T22:54:00+00:00
- **Iterations**: 20 requests per critical endpoint
- **Strict Mode Test**: Monitored query logs and executed query counts

| Endpoint | Method | Status | Queries Count | p50 Latency (ms) | p95 Latency (ms) | Response Size (Bytes) |
|---|---|---|---|---|---|---|
| Homepage | GET | 200 | 11 | 11.49 ms | 21.67 ms | 100456 |
| Stays Catalog (/stays) | GET | 200 | 7 | 11.52 ms | 20.15 ms | 47954 |
| Property Detail (/stays/{slug}) | GET | 200 | 16 | 12.35 ms | 20.30 ms | 50177 |
| Quote Calculation (POST /checkout/calculate) | POST | 200 | 8 | 7.41 ms | 16.50 ms | 1817 |
| Checkout Page (/checkout/{slug}) | GET | 200 | 12 | 8.17 ms | 11.17 ms | 24227 |
| Curated Experiences (/experiences) | GET | 200 | 3 | 5.97 ms | 10.46 ms | 28371 |
| Admin Login Page (/admin/login) | GET | 200 | 0 | 2.05 ms | 2.60 ms | 8449 |
| Admin Dashboard (/admin) | GET | 200 | 26 | 18.47 ms | 38.15 ms | 81303 |
| Admin Properties Index (/admin/properties) | GET | 200 | 8 | 10.95 ms | 23.72 ms | 76483 |
| Admin Bookings Index (/admin/bookings) | GET | 200 | 3 | 9.24 ms | 11.02 ms | 71396 |
