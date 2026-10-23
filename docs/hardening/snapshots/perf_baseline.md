# GouNow Performance Baseline Report (Phase 0 — P0-T07)

- **Environment**: Local SQLite testing database (`testing.sqlite`)
- **Timestamp**: 2026-10-22T14:49:34+00:00
- **Iterations**: 20 requests per critical endpoint
- **Strict Mode Test**: Monitored query logs and executed query counts

| Endpoint | Method | Status | Queries Count | p50 Latency (ms) | p95 Latency (ms) | Response Size (Bytes) |
|---|---|---|---|---|---|---|
| Homepage | GET | 200 | 10 | 15.35 ms | 26.51 ms | 8862 |
| Stays Catalog (/stays) | GET | 200 | 6 | 16.63 ms | 20.62 ms | 6140 |
| Property Detail (/stays/{slug}) | GET | 200 | 14 | 21.39 ms | 25.86 ms | 4582 |
| Quote Calculation (POST /checkout/calculate) | POST | 200 | 8 | 20.61 ms | 32.20 ms | 1871 |
| Checkout Page (/checkout/{slug}) | GET | 200 | 8 | 17.01 ms | 24.52 ms | 2428 |
| Curated Experiences (/experiences) | GET | 200 | 2 | 7.03 ms | 10.69 ms | 2557 |
| Admin Login Page (/admin/login) | GET | 200 | 0 | 3.61 ms | 4.83 ms | 1653 |
| Admin Dashboard (/admin) | GET | 200 | 25 | 28.53 ms | 37.11 ms | 1273 |
| Admin Properties Index (/admin/properties) | GET | 200 | 8 | 13.98 ms | 21.94 ms | 884 |
| Admin Bookings Index (/admin/bookings) | GET | 200 | 3 | 11.16 ms | 12.16 ms | 1608 |
