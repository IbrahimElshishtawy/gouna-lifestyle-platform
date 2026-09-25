# Database Architecture & Concurrency Strategy

## 1. Overview
GouNow uses **MySQL 8.0+** (InnoDB engine) in production and **SQLite** for rapid local unit testing and development. All schema designs and query strategies are optimized for multi-tenant scalability, high read-through catalog queries, and lock-isolated write transactions.

---

## 2. Production Concurrency & Performance Indexes

Migration `2026_09_25_000001_add_production_concurrency_and_performance_indexes.php` introduced composite indexes tailored specifically for high-throughput queries:

### A. Availability & Booking Conflict Index
```sql
CREATE INDEX idx_bookings_availability_lookup 
ON bookings (bookable_type, bookable_id, status, check_in, check_out);
```
- **Why it matters:** Availability checks query `WHERE bookable_type = 'property' AND bookable_id = ? AND status IN ('confirmed', 'pending') AND check_in < ? AND check_out > ?`.
- **Performance impact:** Changes full-table scans or multi-column filter overhead to an index range scan directly on the B-Tree.

### B. Catalog Filtering Composite Index
```sql
CREATE INDEX idx_properties_catalog_filter 
ON properties (status, is_published, listing_type, is_featured);
```
- **Why it matters:** The public stays and real estate catalogs filter published properties by listing type (`stay` vs `sale`) and order featured properties first.
- **Performance impact:** Avoids `Using filesort` on catalog views.

### C. Price Range Filtering Indexes
```sql
CREATE INDEX idx_properties_base_price ON properties (base_price_cents);
CREATE INDEX idx_properties_sale_price ON properties (sale_price_cents);
```
- **Why it matters:** Fast min/max budget sliders on the search page without table scans.

### D. Seasonal Pricing Range Index
```sql
CREATE INDEX idx_seasonal_prices_lookup 
ON seasonal_prices (property_id, is_active, start_date, end_date, priority);
```
- **Why it matters:** Quote calculations iterate through stay dates to find matching seasons. This composite index allows index-only range scans.

### E. Idempotency & Webhook Deduplication Constraints
```sql
ALTER TABLE payment_transactions ADD UNIQUE KEY uq_payment_transactions_webhook_event_id (webhook_event_id);
ALTER TABLE payment_transactions ADD UNIQUE KEY uq_payment_transactions_idempotency_key (idempotency_key);
```
- **Why it matters:** Guarantees database-level rejection of duplicate webhooks or replay attacks, preventing double credits.

---

## 3. Transaction Isolation & Locking Rules

1. **Isolation Level:** Recommended production isolation level is **`READ COMMITTED`** with `binlog_format=ROW`.
   - Avoids unnecessary gap locks common in `REPEATABLE READ`.
   - Ensures queries see only committed data while minimizing deadlock probability.

2. **Pessimistic Row Locking (`SELECT ... FOR UPDATE`):**
   - Implemented via `DatabaseLockManager` and `LockAndValidateAvailabilityAction`.
   - When a booking or payment is initiated, the relevant parent row (`Property` or `Booking`) is locked.
   - Any concurrent request attempting to book the same property for the same dates will wait until the lock is released, then immediately see the new reservation and fail gracefully.

3. **Short-Lived Transactions:**
   - Database transactions must wrap **only** database operations.
   - Long-running external tasks (such as sending HTTP requests to payment gateways or rendering email templates) MUST NOT occur inside a database transaction holding row locks.

---

## 4. Production MySQL Tuning Guidelines

For a production environment running on AWS RDS, Google Cloud SQL, or DigitalOcean Managed MySQL 8+:

| Parameter | Recommended Setting | Purpose |
| :--- | :--- | :--- |
| `innodb_buffer_pool_size` | 70% - 80% of total RAM | Caches working dataset and indexes in memory. |
| `innodb_log_file_size` | 512MB - 1GB | Accommodates peak transaction write spikes. |
| `innodb_flush_log_at_trx_commit` | `1` (strict ACID) or `2` | Ensures zero data loss during unexpected server shutdowns. |
| `max_connections` | 500 - 1000 | Configured with PHP-FPM / Octane connection pool limits. |
| `sql_mode` | `STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION` | Enforces type safety and prevents implicit truncation. |
