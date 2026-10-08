# GouNow Performance Baseline Report (Phase 0 — P0-T07)

- **Environment**: Local SQLite testing database (`testing.sqlite`)
- **Timestamp**: 2026-10-08T16:38:00+00:00
- **Iterations**: 20 requests per critical endpoint
- **Strict Mode Test**: Monitored query logs and executed query counts

| Endpoint | Method | Status | Queries Count | p50 Latency (ms) | p95 Latency (ms) | Response Size (Bytes) |
|---|---|---|---|---|---|---|
| Homepage | GET | 500 | 10 | 80.75 ms | 83.14 ms | 958695 |
| Stays Catalog (/stays) | GET | 500 | 6 | 81.87 ms | 83.46 ms | 1190026 |
| Property Detail (/stays/{slug}) | GET | 500 | 14 | 85.13 ms | 102.70 ms | 1198273 |
| Quote Calculation (POST /checkout/calculate) | POST | 200 | 8 | 3.04 ms | 4.24 ms | 1871 |
| Checkout Page (/checkout/{slug}) | GET | 500 | 8 | 85.63 ms | 87.07 ms | 1205580 |
| Curated Experiences (/experiences) | GET | 500 | 2 | 79.93 ms | 82.43 ms | 1189925 |
| Admin Login Page (/admin/login) | GET | 500 | 0 | 80.97 ms | 89.98 ms | 1189869 |
| Admin Dashboard (/admin) | GET | 500 | 26 | 89.37 ms | 93.26 ms | 1218270 |
| Admin Properties Index (/admin/properties) | GET | 500 | 8 | 87.22 ms | 96.76 ms | 1218405 |
| Admin Bookings Index (/admin/bookings) | GET | 500 | 3 | 119.70 ms | 178.92 ms | 1219990 |
