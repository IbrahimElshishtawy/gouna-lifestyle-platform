# GouNow Performance Baseline Report (Phase 0 — P0-T07)

- **Environment**: Local SQLite testing database (`testing.sqlite`)
- **Timestamp**: 2026-10-08T01:28:41+00:00
- **Iterations**: 20 requests per critical endpoint
- **Strict Mode Test**: Monitored query logs and executed query counts

| Endpoint | Method | Status | Queries Count | p50 Latency (ms) | p95 Latency (ms) | Response Size (Bytes) |
|---|---|---|---|---|---|---|
| Homepage | GET | 200 | 11 | 2.97 ms | 5.27 ms | 100456 |
| Stays Catalog (/stays) | GET | 200 | 7 | 3.41 ms | 4.02 ms | 47954 |
| Property Detail (/stays/{slug}) | GET | 200 | 16 | 4.25 ms | 7.45 ms | 50231 |
| Quote Calculation (POST /checkout/calculate) | POST | 200 | 8 | 2.36 ms | 3.08 ms | 1871 |
| Checkout Page (/checkout/{slug}) | GET | 200 | 12 | 3.11 ms | 3.32 ms | 24227 |
| Curated Experiences (/experiences) | GET | 200 | 3 | 1.72 ms | 2.29 ms | 28371 |
| Admin Login Page (/admin/login) | GET | 200 | 0 | 0.66 ms | 0.70 ms | 8449 |
| Admin Dashboard (/admin) | GET | 200 | 26 | 5.91 ms | 6.98 ms | 81356 |
| Admin Properties Index (/admin/properties) | GET | 200 | 8 | 3.49 ms | 3.60 ms | 76483 |
| Admin Bookings Index (/admin/bookings) | GET | 200 | 3 | 2.94 ms | 3.09 ms | 71396 |
