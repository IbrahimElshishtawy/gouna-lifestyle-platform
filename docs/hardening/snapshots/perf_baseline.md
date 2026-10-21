# GouNow Performance Baseline Report (Phase 0 — P0-T07)

- **Environment**: Local SQLite testing database (`testing.sqlite`)
- **Timestamp**: 2026-10-21T23:08:24+00:00
- **Iterations**: 20 requests per critical endpoint
- **Strict Mode Test**: Monitored query logs and executed query counts

| Endpoint | Method | Status | Queries Count | p50 Latency (ms) | p95 Latency (ms) | Response Size (Bytes) |
|---|---|---|---|---|---|---|
| Homepage | GET | 200 | 10 | 3.94 ms | 5.62 ms | 8862 |
| Stays Catalog (/stays) | GET | 200 | 6 | 2.97 ms | 10.93 ms | 6140 |
| Property Detail (/stays/{slug}) | GET | 200 | 14 | 3.25 ms | 4.02 ms | 4582 |
| Quote Calculation (POST /checkout/calculate) | POST | 200 | 8 | 2.40 ms | 3.36 ms | 1872 |
| Checkout Page (/checkout/{slug}) | GET | 200 | 8 | 2.44 ms | 2.65 ms | 2428 |
| Curated Experiences (/experiences) | GET | 200 | 2 | 0.87 ms | 7.37 ms | 2557 |
| Admin Login Page (/admin/login) | GET | 200 | 0 | 0.54 ms | 0.62 ms | 1653 |
| Admin Dashboard (/admin) | GET | 200 | 25 | 4.00 ms | 4.56 ms | 1273 |
| Admin Properties Index (/admin/properties) | GET | 200 | 8 | 2.04 ms | 2.19 ms | 884 |
| Admin Bookings Index (/admin/bookings) | GET | 200 | 3 | 1.54 ms | 1.62 ms | 1608 |
