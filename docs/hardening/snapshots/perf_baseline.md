# GouNow Performance Baseline Report (Phase 0 — P0-T07)

- **Environment**: Local SQLite testing database (`testing.sqlite`)
- **Timestamp**: 2026-10-02T22:36:49+00:00
- **Iterations**: 20 requests per critical endpoint
- **Strict Mode Test**: Monitored query logs and executed query counts

| Endpoint | Method | Status | Queries Count | p50 Latency (ms) | p95 Latency (ms) | Response Size (Bytes) |
|---|---|---|---|---|---|---|
| Homepage | GET | 200 | 19 | 25.66 ms | 44.35 ms | 100456 |
| Stays Catalog (/stays) | GET | 200 | 7 | 19.57 ms | 44.70 ms | 69093 |
| Property Detail (/stays/{slug}) | GET | 200 | 13 | 14.17 ms | 20.92 ms | 48389 |
| Quote Calculation (POST /checkout/calculate) | POST | 200 | 9 | 8.74 ms | 11.40 ms | 5292 |
| Checkout Page (/checkout/{slug}) | GET | 200 | 14 | 9.33 ms | 10.87 ms | 28347 |
| Curated Experiences (/experiences) | GET | 200 | 7 | 8.61 ms | 11.65 ms | 45624 |
| Admin Login Page (/admin/login) | GET | 200 | 0 | 1.79 ms | 2.10 ms | 8449 |
| Admin Dashboard (/admin) | GET | 200 | 28 | 18.61 ms | 23.78 ms | 87863 |
| Admin Properties Index (/admin/properties) | GET | 200 | 17 | 17.99 ms | 21.88 ms | 132780 |
| Admin Bookings Index (/admin/bookings) | GET | 200 | 3 | 15.87 ms | 31.82 ms | 182973 |
