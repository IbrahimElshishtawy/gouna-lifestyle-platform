# GouNow Performance Baseline Report (Phase 0 — P0-T07)

- **Environment**: Local SQLite testing database (`testing.sqlite`)
- **Timestamp**: 2026-10-03T13:24:59+00:00
- **Iterations**: 20 requests per critical endpoint
- **Strict Mode Test**: Monitored query logs and executed query counts

| Endpoint | Method | Status | Queries Count | p50 Latency (ms) | p95 Latency (ms) | Response Size (Bytes) |
|---|---|---|---|---|---|---|
| Homepage | GET | 200 | 11 | 10.75 ms | 18.69 ms | 100456 |
| Stays Catalog (/stays) | GET | 200 | 7 | 12.21 ms | 27.79 ms | 44231 |
| Property Detail (/stays/{slug}) | GET | 200 | 16 | 16.12 ms | 30.61 ms | 50179 |
| Quote Calculation (POST /checkout/calculate) | POST | 200 | 8 | 8.37 ms | 9.94 ms | 1819 |
| Checkout Page (/checkout/{slug}) | GET | 200 | 12 | 11.11 ms | 12.34 ms | 24227 |
| Curated Experiences (/experiences) | GET | 200 | 3 | 6.39 ms | 8.79 ms | 28371 |
| Admin Login Page (/admin/login) | GET | 200 | 0 | 2.30 ms | 2.79 ms | 8449 |
| Admin Dashboard (/admin) | GET | 200 | 27 | 40.70 ms | 58.53 ms | 79375 |
| Admin Properties Index (/admin/properties) | GET | 200 | 9 | 13.27 ms | 21.71 ms | 68836 |
| Admin Bookings Index (/admin/bookings) | GET | 200 | 3 | 10.28 ms | 15.35 ms | 65957 |
