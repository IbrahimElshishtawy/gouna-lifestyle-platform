# GouNow Performance Baseline Report (Phase 0 — P0-T07)

- **Environment**: Local SQLite testing database (`testing.sqlite`)
- **Timestamp**: 2026-10-02T21:57:05+00:00
- **Iterations**: 20 requests per critical endpoint
- **Strict Mode Test**: Monitored query logs and executed query counts

| Endpoint | Method | Status | Queries Count | p50 Latency (ms) | p95 Latency (ms) | Response Size (Bytes) |
|---|---|---|---|---|---|---|
| Homepage | GET | 200 | 19 | 30.21 ms | 47.31 ms | 100456 |
| Stays Catalog (/stays) | GET | 200 | 7 | 19.83 ms | 41.03 ms | 69093 |
| Property Detail (/stays/{slug}) | GET | 200 | 13 | 26.05 ms | 33.61 ms | 48389 |
| Quote Calculation (POST /checkout/calculate) | POST | 200 | 9 | 19.47 ms | 33.11 ms | 5292 |
| Checkout Page (/checkout/{slug}) | GET | 200 | 14 | 24.33 ms | 27.94 ms | 28347 |
| Curated Experiences (/experiences) | GET | 200 | 7 | 20.01 ms | 22.45 ms | 45624 |
| Admin Login Page (/admin/login) | GET | 200 | 0 | 4.14 ms | 5.33 ms | 8449 |
| Admin Dashboard (/admin) | GET | 200 | 28 | 53.51 ms | 63.64 ms | 87883 |
| Admin Properties Index (/admin/properties) | GET | 500 | 7 | 765.05 ms | 943.75 ms | 1188780 |
| Admin Bookings Index (/admin/bookings) | GET | 200 | 3 | 29.45 ms | 40.12 ms | 161208 |
