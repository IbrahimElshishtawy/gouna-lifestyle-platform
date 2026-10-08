# GouNow Performance Baseline Report (Phase 0 — P0-T07)

- **Environment**: Local SQLite testing database (`testing.sqlite`)
- **Timestamp**: 2026-10-08T12:53:36+00:00
- **Iterations**: 20 requests per critical endpoint
- **Strict Mode Test**: Monitored query logs and executed query counts

| Endpoint | Method | Status | Queries Count | p50 Latency (ms) | p95 Latency (ms) | Response Size (Bytes) |
|---|---|---|---|---|---|---|
| Homepage | GET | 500 | 10 | 382.95 ms | 435.10 ms | 958689 |
| Stays Catalog (/stays) | GET | 500 | 6 | 287.82 ms | 447.37 ms | 1190005 |
| Property Detail (/stays/{slug}) | GET | 500 | 14 | 294.87 ms | 470.18 ms | 1198252 |
| Quote Calculation (POST /checkout/calculate) | POST | 200 | 8 | 9.37 ms | 12.85 ms | 1871 |
| Checkout Page (/checkout/{slug}) | GET | 500 | 8 | 263.65 ms | 456.93 ms | 1205559 |
| Curated Experiences (/experiences) | GET | 500 | 2 | 339.96 ms | 462.09 ms | 1189904 |
| Admin Login Page (/admin/login) | GET | 500 | 0 | 400.71 ms | 468.06 ms | 1189848 |
| Admin Dashboard (/admin) | GET | 500 | 26 | 279.52 ms | 413.54 ms | 1218249 |
| Admin Properties Index (/admin/properties) | GET | 500 | 8 | 278.97 ms | 440.84 ms | 1218384 |
| Admin Bookings Index (/admin/bookings) | GET | 500 | 3 | 346.23 ms | 430.29 ms | 1219969 |
