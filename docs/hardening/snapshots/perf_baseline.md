# GouNow Performance Baseline Report (Phase 0 — P0-T07)

- **Environment**: Local SQLite testing database (`testing.sqlite`)
- **Timestamp**: 2026-10-19T21:53:24+00:00
- **Iterations**: 20 requests per critical endpoint
- **Strict Mode Test**: Monitored query logs and executed query counts

| Endpoint | Method | Status | Queries Count | p50 Latency (ms) | p95 Latency (ms) | Response Size (Bytes) |
|---|---|---|---|---|---|---|
| Homepage | GET | 200 | 10 | 6.46 ms | 14.65 ms | 8862 |
| Stays Catalog (/stays) | GET | 200 | 6 | 6.52 ms | 16.72 ms | 6140 |
| Property Detail (/stays/{slug}) | GET | 200 | 14 | 8.66 ms | 15.29 ms | 4582 |
| Quote Calculation (POST /checkout/calculate) | POST | 200 | 8 | 6.83 ms | 8.85 ms | 1874 |
| Checkout Page (/checkout/{slug}) | GET | 200 | 8 | 8.41 ms | 22.87 ms | 2428 |
| Curated Experiences (/experiences) | GET | 200 | 2 | 8.18 ms | 16.50 ms | 2557 |
| Admin Login Page (/admin/login) | GET | 200 | 0 | 4.66 ms | 5.72 ms | 1653 |
| Admin Dashboard (/admin) | GET | 200 | 26 | 14.27 ms | 18.12 ms | 1273 |
| Admin Properties Index (/admin/properties) | GET | 200 | 8 | 5.42 ms | 6.61 ms | 884 |
| Admin Bookings Index (/admin/bookings) | GET | 200 | 3 | 9.71 ms | 14.82 ms | 1608 |
