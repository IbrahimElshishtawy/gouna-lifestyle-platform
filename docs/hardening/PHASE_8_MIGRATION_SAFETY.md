# PHASE 8 — MIGRATION SAFETY & DEPLOYMENT RUNBOOK

## 1. Migration Inventory & Safety Classification

Every migration in the repository has been evaluated for locking overhead, index creation impact, rollback viability, and zero-downtime compatibility.

| Migration Identifier | Operation Summary | Locking Risk | Rollback Feasible | Deployment Window |
|---|---|---|---|---|
| `0001_01_01_000000_create_users_table` | Core identity & 2FA columns | Low | Yes | Initial deploy |
| `0001_01_01_000001_create_cache_table` | Distributed cache table | Low | Yes | Initial deploy |
| `0001_01_01_000002_create_jobs_table` | Queue worker queue storage | Low | Yes | Initial deploy |
| `2024_01_01_000001_create_roles_and_permissions_table` | RBAC structure | Low | Yes | Initial deploy |
| `2024_01_01_000011_create_properties_table` | Properties catalog | Low | Yes | Initial deploy |
| `2024_01_01_000019_create_discounts_table` | Discounts structure | Low | Yes | Initial deploy |
| `2024_01_01_000020_create_bookings_table` | Core bookings & discount_usages | Low | Yes | Initial deploy |
| `2024_01_01_000022_create_payment_transactions_table` | Financial audit ledger | Low | Yes | Initial deploy |
| `2026_09_25_000001_add_production_concurrency_and_performance_indexes` | Composite btree indexes | Medium | Yes | Online / concurrent |
| `2026_10_02_223000_create_idempotency_keys_table` | Idempotency log | Low | Yes | Initial deploy |
| `2026_10_03_000001_add_actor_scope_to_idempotency_keys_table` | Actor isolation index | Low | Yes | Online migration |
| `2026_10_03_120000_add_booking_hardening_columns_and_constraints` | PostgreSQL exclusion constraint & GiST | Medium | Yes | Brief write lock during `ADD CONSTRAINT` |

---

## 2. Zero-Downtime Migration Policy

1. **Expanding Columns**:
   - New columns must always be declared `nullable` or provide default values so ongoing production requests continue without error before application code deploy.
2. **Dropping Columns**:
   - Never drop columns in the same release as code updates. Follow the 2-phase staged migration:
     - Phase A: Remove all application code reading/writing the column.
     - Phase B: Execute migration dropping the column after all workers/web processes run Phase A code.
3. **Index Creation on High-Volume Tables**:
   - Large tables (`bookings`, `payment_transactions`, `activity_logs`) should use `CREATE INDEX CONCURRENTLY` in PostgreSQL during maintenance or rolling deploys.

---

## 3. Rollback Feasibility

- All 41 migrations implement deterministic `down()` methods that drop created constraints, indexes, and tables.
- Foreign key dependencies in `down()` methods are sequenced strictly in reverse creation order, ensuring `php artisan migrate:rollback` executes without relational constraint violations.
