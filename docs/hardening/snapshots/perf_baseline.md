# GouNow Performance Baseline Report (Phase 0 — P0-T07)

- **Environment**: Local SQLite testing database (`testing.sqlite`)
- **Timestamp**: 2026-10-08T07:53:33+00:00
- **Iterations**: 20 requests per critical endpoint
- **Strict Mode Test**: Monitored query logs and executed query counts

| Endpoint | Method | Status | Queries Count | p50 Latency (ms) | p95 Latency (ms) | Response Size (Bytes) |
|---|---|---|---|---|---|---|
| Homepage | GET | 500 | 10 | 216.15 ms | 402.49 ms | 958689 |
| Stays Catalog (/stays) | GET | 500 | 6 | 355.86 ms | 465.54 ms | 1190004 |
| Property Detail (/stays/{slug}) | GET | 500 | 14 | 254.68 ms | 466.55 ms | 1198251 |
| Quote Calculation (POST /checkout/calculate) | POST | 200 | 8 | 8.14 ms | 10.40 ms | 1871 |
| Checkout Page (/checkout/{slug}) | GET | 500 | 8 | 231.93 ms | 469.07 ms | 1205558 |
| Curated Experiences (/experiences) | GET | 500 | 2 | 225.70 ms | 438.53 ms | 1189903 |
| Admin Login Page (/admin/login) | GET | 500 | 0 | 250.02 ms | 427.70 ms | 1189847 |
| Admin Dashboard (/admin) | GET | 500 | 26 | 292.54 ms | 501.30 ms | 1218248 |
| Admin Properties Index (/admin/properties) | GET | 500 | 8 | 250.20 ms | 492.31 ms | 1218383 |
| Admin Bookings Index (/admin/bookings) | GET | 500 | 3 | 240.71 ms | 586.74 ms | 1219968 |
