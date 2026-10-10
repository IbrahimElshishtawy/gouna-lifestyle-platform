# GouNow Performance Baseline Report (Phase 0 — P0-T07)

- **Environment**: Local SQLite testing database (`testing.sqlite`)
- **Timestamp**: 2026-10-09T20:38:49+00:00
- **Iterations**: 20 requests per critical endpoint
- **Strict Mode Test**: Monitored query logs and executed query counts

| Endpoint | Method | Status | Queries Count | p50 Latency (ms) | p95 Latency (ms) | Response Size (Bytes) |
|---|---|---|---|---|---|---|
| Homepage | GET | 500 | 10 | 94.72 ms | 139.21 ms | 958693 |
| Stays Catalog (/stays) | GET | 500 | 6 | 95.04 ms | 107.14 ms | 1190015 |
| Property Detail (/stays/{slug}) | GET | 500 | 17 | 92.49 ms | 103.67 ms | 1201001 |
| Quote Calculation (POST /checkout/calculate) | POST | 200 | 8 | 2.94 ms | 4.37 ms | 1874 |
| Checkout Page (/checkout/{slug}) | GET | 500 | 11 | 87.53 ms | 139.63 ms | 1208308 |
| Curated Experiences (/experiences) | GET | 500 | 2 | 79.79 ms | 93.22 ms | 1189914 |
| Admin Login Page (/admin/login) | GET | 500 | 0 | 86.24 ms | 133.20 ms | 1189858 |
| Admin Dashboard (/admin) | GET | 500 | 26 | 85.98 ms | 91.69 ms | 1218259 |
| Admin Properties Index (/admin/properties) | GET | 500 | 8 | 86.68 ms | 98.21 ms | 1218394 |
| Admin Bookings Index (/admin/bookings) | GET | 500 | 3 | 81.97 ms | 85.91 ms | 1219979 |
