# GouNow Performance Baseline Report (Phase 0 — P0-T07)

- **Environment**: Local SQLite testing database (`testing.sqlite`)
- **Timestamp**: 2026-11-08T18:31:29+00:00
- **Iterations**: 20 requests per critical endpoint
- **Strict Mode Test**: Monitored query logs and executed query counts

| Endpoint | Method | Status | Queries Count | p50 Latency (ms) | p95 Latency (ms) | Response Size (Bytes) |
|---|---|---|---|---|---|---|
| Homepage | GET | 200 | 10 | 1.91 ms | 3.77 ms | 8862 |
| Stays Catalog (/stays) | GET | 200 | 6 | 2.08 ms | 2.68 ms | 6140 |
| Property Detail (/stays/{slug}) | GET | 200 | 14 | 2.89 ms | 3.54 ms | 4582 |
| Quote Calculation (POST /checkout/calculate) | POST | 200 | 8 | 2.40 ms | 3.27 ms | 1875 |
| Checkout Page (/checkout/{slug}) | GET | 200 | 8 | 2.38 ms | 2.52 ms | 2428 |
| Curated Experiences (/experiences) | GET | 200 | 2 | 0.89 ms | 1.53 ms | 2557 |
| Admin Login Page (/admin/login) | GET | 200 | 0 | 0.55 ms | 0.64 ms | 1653 |
| Admin Dashboard (/admin) | GET | 200 | 25 | 4.09 ms | 6.41 ms | 1273 |
| Admin Properties Index (/admin/properties) | GET | 200 | 8 | 2.04 ms | 2.15 ms | 884 |
| Admin Bookings Index (/admin/bookings) | GET | 200 | 3 | 1.58 ms | 1.65 ms | 1608 |
