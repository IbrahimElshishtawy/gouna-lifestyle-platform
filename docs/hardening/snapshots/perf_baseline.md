# GouNow Performance Baseline Report (Phase 0 — P0-T07)

- **Environment**: Local SQLite testing database (`testing.sqlite`)
- **Timestamp**: 2026-10-03T12:08:26+00:00
- **Iterations**: 20 requests per critical endpoint
- **Strict Mode Test**: Monitored query logs and executed query counts

| Endpoint | Method | Status | Queries Count | p50 Latency (ms) | p95 Latency (ms) | Response Size (Bytes) |
|---|---|---|---|---|---|---|
| Homepage | GET | 200 | 11 | 9.81 ms | 15.10 ms | 100456 |
| Stays Catalog (/stays) | GET | 200 | 7 | 12.45 ms | 20.92 ms | 44231 |
| Property Detail (/stays/{slug}) | GET | 200 | 16 | 23.29 ms | 39.86 ms | 50179 |
| Quote Calculation (POST /checkout/calculate) | POST | 200 | 8 | 8.29 ms | 10.36 ms | 1819 |
| Checkout Page (/checkout/{slug}) | GET | 200 | 12 | 10.83 ms | 15.11 ms | 24227 |
| Curated Experiences (/experiences) | GET | 200 | 3 | 6.92 ms | 11.99 ms | 28371 |
| Admin Login Page (/admin/login) | GET | 200 | 0 | 2.16 ms | 2.52 ms | 8449 |
| Admin Dashboard (/admin) | GET | 200 | 27 | 23.87 ms | 35.59 ms | 74642 |
| Admin Properties Index (/admin/properties) | GET | 200 | 9 | 13.29 ms | 17.03 ms | 68836 |
| Admin Bookings Index (/admin/bookings) | GET | 200 | 3 | 10.78 ms | 15.37 ms | 65957 |
