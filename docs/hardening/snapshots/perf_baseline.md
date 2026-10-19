# GouNow Performance Baseline Report (Phase 0 — P0-T07)

- **Environment**: Local SQLite testing database (`testing.sqlite`)
- **Timestamp**: 2026-10-19T14:21:02+00:00
- **Iterations**: 20 requests per critical endpoint
- **Strict Mode Test**: Monitored query logs and executed query counts

| Endpoint | Method | Status | Queries Count | p50 Latency (ms) | p95 Latency (ms) | Response Size (Bytes) |
|---|---|---|---|---|---|---|
| Homepage | GET | 200 | 10 | 3.01 ms | 6.29 ms | 8862 |
| Stays Catalog (/stays) | GET | 200 | 6 | 2.95 ms | 3.95 ms | 6140 |
| Property Detail (/stays/{slug}) | GET | 200 | 14 | 3.98 ms | 4.85 ms | 4582 |
| Quote Calculation (POST /checkout/calculate) | POST | 200 | 8 | 3.19 ms | 4.31 ms | 1874 |
| Checkout Page (/checkout/{slug}) | GET | 200 | 8 | 3.19 ms | 3.40 ms | 2428 |
| Curated Experiences (/experiences) | GET | 200 | 2 | 1.14 ms | 1.99 ms | 2557 |
| Admin Login Page (/admin/login) | GET | 200 | 0 | 0.71 ms | 0.82 ms | 1653 |
| Admin Dashboard (/admin) | GET | 200 | 25 | 5.28 ms | 6.25 ms | 1273 |
| Admin Properties Index (/admin/properties) | GET | 200 | 8 | 2.64 ms | 2.79 ms | 884 |
| Admin Bookings Index (/admin/bookings) | GET | 200 | 3 | 1.99 ms | 2.11 ms | 1608 |
