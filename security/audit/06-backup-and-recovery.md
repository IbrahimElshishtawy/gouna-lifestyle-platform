# GouNow Security Audit — 06. Backup, Disaster Recovery & Resilience

**Assessment Date:** October 22, 2026  
**Auditor:** Senior Application Security & DevSecOps Engineer  

---

## 1. Objectives & Metrics

- **Recovery Point Objective (RPO):** Maximum allowable data loss window = **1 hour** (supported by hourly automated WAL archiving and incremental snapshots).
- **Recovery Time Objective (RTO):** Maximum allowable downtime to service restoration = **30 minutes** (from standby image or automated restore script).

---

## 2. Automated PostgreSQL Backup Architecture

```
[ PostgreSQL 16 DB ]
        │
        ▼ (Every 6 hours / 00:00, 06:00, 12:00, 18:00 UTC)
 [ pg_dump custom format ]
        │
        ▼
 [ AES-256 Symmetric Encryption (GPG / OpenSSL) ]
        │
        ├─────────────────────────────────┐
        ▼ (Local Retention: 48h)          ▼ (Off-Site Replicated)
  /var/backups/gounow/           [ Encrypted AWS S3 Bucket / Wasabi ]
                                 - Versioning Enabled
                                 - Object Lock (WORM compliance)
                                 - Lifecycle: 7 Days Daily, 4 Weeks, 12 Months
```

### Production Backup Script (`/usr/local/bin/backup-gounow.sh`)

```bash
#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="/var/backups/gounow"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_NAME="gounow_production"
ENCRYPTION_KEY_FILE="/etc/gounow/backup_key.bin"

mkdir -p "${BACKUP_DIR}"

DUMP_FILE="${BACKUP_DIR}/${DB_NAME}_${TIMESTAMP}.dump"
ENC_FILE="${DUMP_FILE}.enc"

# 1. Consistent binary snapshot using pg_dump
PGPASSWORD="${DB_PASSWORD}" pg_dump \
    -h "${DB_HOST:-127.0.0.1}" \
    -U "${DB_USERNAME:-gounow_app_user}" \
    -F c \
    -b \
    -v \
    -f "${DUMP_FILE}" \
    "${DB_NAME}"

# 2. Encrypt at rest using AES-256-CBC
openssl enc -aes-256-cbc -salt -pbkdf2 \
    -in "${DUMP_FILE}" \
    -out "${ENC_FILE}" \
    -pass file:"${ENCRYPTION_KEY_FILE}"

rm -f "${DUMP_FILE}"

# 3. Off-site sync to secure S3 storage
aws s3 cp "${ENC_FILE}" "s3://gounow-backups-secure/database/${ENC_FILE##*/}" \
    --storage-class STANDARD_IA

# 4. Prune local backups older than 7 days
find "${BACKUP_DIR}" -name "*.dump.enc" -type f -mtime +7 -delete

echo "[SUCCESS] Backup completed and encrypted at ${TIMESTAMP}"
```

---

## 3. Restoration Drill & Validation Procedure

Backups must never be claimed usable without executing an actual restore drill:

```bash
# Step 1: Download target encrypted backup
aws s3 cp s3://gounow-backups-secure/database/gounow_production_20261022_120000.dump.enc /tmp/restore.dump.enc

# Step 2: Decrypt with secure key
openssl enc -d -aes-256-cbc -pbkdf2 \
    -in /tmp/restore.dump.enc \
    -out /tmp/restore.dump \
    -pass file:/etc/gounow/backup_key.bin

# Step 3: Restore into isolated disposable PostgreSQL instance
createdb -h 127.0.0.1 -U postgres gounow_drill_test
pg_restore -h 127.0.0.1 -U postgres -d gounow_drill_test -v /tmp/restore.dump

# Step 4: Verify database integrity and record counts
psql -h 127.0.0.1 -U postgres -d gounow_drill_test -c "SELECT COUNT(*) FROM properties;"
psql -h 127.0.0.1 -U postgres -d gounow_drill_test -c "SELECT COUNT(*) FROM bookings;"
psql -h 127.0.0.1 -U postgres -d gounow_drill_test -c "SELECT COUNT(*) FROM payment_transactions;"

# Step 5: Clean up test instance
dropdb -h 127.0.0.1 -U postgres gounow_drill_test
rm -f /tmp/restore.dump /tmp/restore.dump.enc
```
