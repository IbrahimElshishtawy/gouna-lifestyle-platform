# GouNow Performance Baseline Report (Phase 0 — P0-T07)

- **Environment**: Local SQLite testing database (`testing.sqlite`)
- **Timestamp**: 2026-11-08T18:48:35+00:00
- **Iterations**: 20 requests per critical endpoint
- **Strict Mode Test**: Monitored query logs and executed query counts

| Endpoint | Method | Status | Queries Count | p50 Latency (ms) | p95 Latency (ms) | Response Size (Bytes) |
|---|---|---|---|---|---|---|
| Homepage | GET | 200 | 10 | 2.29 ms | 4.40 ms | 8862 |
| Stays Catalog (/stays) | GET | 200 | 6 | 2.43 ms | 3.03 ms | 6140 |
| Property Detail (/stays/{slug}) | GET | 200 | 14 | 3.10 ms | 4.04 ms | 4582 |
| Quote Calculation (POST /checkout/calculate) | POST | 200 | 8 | 2.39 ms | 3.42 ms | 1875 |
| Checkout Page (/checkout/{slug}) | GET | 200 | 8 | 2.34 ms | 2.53 ms | 2428 |
| Curated Experiences (/experiences) | GET | 200 | 2 | 0.89 ms | 1.47 ms | 2557 |
| Admin Login Page (/admin/login) | GET | 200 | 0 | 0.61 ms | 0.91 ms | 1653 |
| Admin Dashboard (/admin) | GET | 200 | 26 | 4.36 ms | 6.81 ms | 1273 |
| Admin Properties Index (/admin/properties) | GET | 200 | 8 | 1.92 ms | 2.11 ms | 884 |
| Admin Bookings Index (/admin/bookings) | GET | 200 | 3 | 1.49 ms | 1.55 ms | 1608 |
