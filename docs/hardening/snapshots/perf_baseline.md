# GouNow Performance Baseline Report (Phase 0 — P0-T07)

- **Environment**: Local SQLite testing database (`testing.sqlite`)
- **Timestamp**: 2026-10-04T22:02:38+00:00
- **Iterations**: 20 requests per critical endpoint
- **Strict Mode Test**: Monitored query logs and executed query counts

| Endpoint | Method | Status | Queries Count | p50 Latency (ms) | p95 Latency (ms) | Response Size (Bytes) |
|---|---|---|---|---|---|---|
| Homepage | GET | 200 | 11 | 10.95 ms | 17.38 ms | 100456 |
| Stays Catalog (/stays) | GET | 200 | 7 | 10.82 ms | 13.83 ms | 47954 |
| Property Detail (/stays/{slug}) | GET | 200 | 16 | 12.83 ms | 18.39 ms | 50174 |
| Quote Calculation (POST /checkout/calculate) | POST | 200 | 8 | 8.77 ms | 11.48 ms | 1814 |
| Checkout Page (/checkout/{slug}) | GET | 200 | 12 | 8.02 ms | 11.64 ms | 23942 |
| Curated Experiences (/experiences) | GET | 200 | 3 | 6.10 ms | 7.69 ms | 28371 |
| Admin Login Page (/admin/login) | GET | 200 | 0 | 2.36 ms | 3.09 ms | 8449 |
| Admin Dashboard (/admin) | GET | 200 | 26 | 23.51 ms | 32.33 ms | 81303 |
| Admin Properties Index (/admin/properties) | GET | 200 | 8 | 22.45 ms | 27.92 ms | 76483 |
| Admin Bookings Index (/admin/bookings) | GET | 200 | 3 | 14.34 ms | 28.10 ms | 71396 |
