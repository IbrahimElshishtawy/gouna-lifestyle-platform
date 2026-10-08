# GouNow Performance Baseline Report (Phase 0 — P0-T07)

- **Environment**: Local SQLite testing database (`testing.sqlite`)
- **Timestamp**: 2026-10-08T02:24:23+00:00
- **Iterations**: 20 requests per critical endpoint
- **Strict Mode Test**: Monitored query logs and executed query counts

| Endpoint | Method | Status | Queries Count | p50 Latency (ms) | p95 Latency (ms) | Response Size (Bytes) |
|---|---|---|---|---|---|---|
| Homepage | GET | 500 | 10 | 145.97 ms | 179.84 ms | 958695 |
| Stays Catalog (/stays) | GET | 500 | 6 | 147.22 ms | 242.42 ms | 1190013 |
| Property Detail (/stays/{slug}) | GET | 500 | 14 | 150.48 ms | 158.07 ms | 1198260 |
| Quote Calculation (POST /checkout/calculate) | POST | 200 | 8 | 5.67 ms | 9.23 ms | 1871 |
| Checkout Page (/checkout/{slug}) | GET | 500 | 8 | 155.10 ms | 215.30 ms | 1205567 |
| Curated Experiences (/experiences) | GET | 500 | 2 | 145.00 ms | 147.76 ms | 1189912 |
| Admin Login Page (/admin/login) | GET | 500 | 0 | 143.94 ms | 188.94 ms | 1189856 |
| Admin Dashboard (/admin) | GET | 500 | 26 | 160.18 ms | 214.99 ms | 1218257 |
| Admin Properties Index (/admin/properties) | GET | 500 | 8 | 155.17 ms | 193.88 ms | 1218392 |
| Admin Bookings Index (/admin/bookings) | GET | 500 | 3 | 153.95 ms | 167.27 ms | 1219977 |
