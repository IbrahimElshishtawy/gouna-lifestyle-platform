# GouNow Performance Baseline Report (Phase 0 — P0-T07)

- **Environment**: Local SQLite testing database (`testing.sqlite`)
- **Timestamp**: 2026-10-06T14:20:51+00:00
- **Iterations**: 20 requests per critical endpoint
- **Strict Mode Test**: Monitored query logs and executed query counts

| Endpoint | Method | Status | Queries Count | p50 Latency (ms) | p95 Latency (ms) | Response Size (Bytes) |
|---|---|---|---|---|---|---|
| Homepage | GET | 200 | 11 | 11.14 ms | 18.68 ms | 100456 |
| Stays Catalog (/stays) | GET | 200 | 7 | 13.25 ms | 25.32 ms | 47954 |
| Property Detail (/stays/{slug}) | GET | 200 | 16 | 13.74 ms | 17.59 ms | 50175 |
| Quote Calculation (POST /checkout/calculate) | POST | 200 | 8 | 7.85 ms | 8.81 ms | 1815 |
| Checkout Page (/checkout/{slug}) | GET | 200 | 12 | 9.50 ms | 10.42 ms | 24227 |
| Curated Experiences (/experiences) | GET | 200 | 3 | 5.89 ms | 13.26 ms | 28371 |
| Admin Login Page (/admin/login) | GET | 200 | 0 | 2.45 ms | 3.00 ms | 8449 |
| Admin Dashboard (/admin) | GET | 200 | 26 | 22.17 ms | 24.32 ms | 81302 |
| Admin Properties Index (/admin/properties) | GET | 200 | 8 | 13.18 ms | 13.72 ms | 76483 |
| Admin Bookings Index (/admin/bookings) | GET | 200 | 3 | 10.84 ms | 11.23 ms | 71396 |
