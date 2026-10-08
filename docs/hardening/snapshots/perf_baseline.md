# GouNow Performance Baseline Report (Phase 0 — P0-T07)

- **Environment**: Local SQLite testing database (`testing.sqlite`)
- **Timestamp**: 2026-10-08T14:48:12+00:00
- **Iterations**: 20 requests per critical endpoint
- **Strict Mode Test**: Monitored query logs and executed query counts

| Endpoint | Method | Status | Queries Count | p50 Latency (ms) | p95 Latency (ms) | Response Size (Bytes) |
|---|---|---|---|---|---|---|
| Homepage | GET | 500 | 10 | 161.89 ms | 313.65 ms | 958691 |
| Stays Catalog (/stays) | GET | 500 | 6 | 166.17 ms | 184.91 ms | 1190001 |
| Property Detail (/stays/{slug}) | GET | 500 | 14 | 167.66 ms | 218.10 ms | 1198248 |
| Quote Calculation (POST /checkout/calculate) | POST | 200 | 8 | 5.23 ms | 7.34 ms | 1871 |
| Checkout Page (/checkout/{slug}) | GET | 500 | 8 | 164.19 ms | 181.11 ms | 1205555 |
| Curated Experiences (/experiences) | GET | 500 | 2 | 159.28 ms | 197.12 ms | 1189900 |
| Admin Login Page (/admin/login) | GET | 500 | 0 | 160.70 ms | 245.20 ms | 1189844 |
| Admin Dashboard (/admin) | GET | 500 | 26 | 183.41 ms | 226.02 ms | 1218245 |
| Admin Properties Index (/admin/properties) | GET | 500 | 8 | 175.86 ms | 284.03 ms | 1218380 |
| Admin Bookings Index (/admin/bookings) | GET | 500 | 3 | 170.83 ms | 216.88 ms | 1219965 |
