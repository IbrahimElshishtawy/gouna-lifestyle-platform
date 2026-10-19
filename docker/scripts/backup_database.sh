#!/usr/bin/env bash
# ==============================================================================
# GouNow Production Database Backup Script (Phase 12E)
# ==============================================================================
# Usage:
#   BACKUP_ENCRYPTION_KEY_FILE=/etc/gounow/backup.key ./backup_database.sh
#
# Environment variables:
#   DB_CONNECTION          Database driver ('pgsql' or 'sqlite', default: pgsql)
#   DB_HOST                Database host (default: localhost)
#   DB_PORT                Database port (default: 5432)
#   DB_DATABASE            Database name (default: gounow_production)
#   DB_USERNAME            Database user (default: gounow_user)
#   DB_PASSWORD            Database password
#   BACKUP_DIR             Local directory to store backups (default: /var/backups/gounow)
#   BACKUP_ENCRYPTION_KEY  Passphrase string (fallback if key file not provided)
#   BACKUP_ENCRYPTION_KEY_FILE Path to key file containing passphrase
#   S3_BACKUP_BUCKET       Target S3 bucket (optional, e.g. s3://gounow-offsite-backups)
#   RETENTION_DAYS         Local retention in days (default: 7)
# ==============================================================================

set -eo pipefail

TIMESTAMP=$(date -u +"%Y%m%d_%H%M%SZ")
DB_CONNECTION="${DB_CONNECTION:-pgsql}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_DATABASE="${DB_DATABASE:-gounow_production}"
DB_USERNAME="${DB_USERNAME:-gounow_user}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/gounow}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"

mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

echo "=== [GouNow Backup] Starting at ${TIMESTAMP} (Driver: ${DB_CONNECTION}) ==="

TMP_DIR=$(mktemp -d /tmp/gounow_backup_XXXXXX)
trap 'rm -rf "$TMP_DIR"' EXIT

RAW_FILE="${TMP_DIR}/gounow_${DB_DATABASE}_${TIMESTAMP}.dump"
ENCRYPTED_FILE="${BACKUP_DIR}/gounow_${DB_DATABASE}_${TIMESTAMP}.dump.enc"

START_SECONDS=$SECONDS

# 1. Perform database dump based on engine
if [ "$DB_CONNECTION" = "pgsql" ]; then
    echo "[1/5] Dumping PostgreSQL database '${DB_DATABASE}' using pg_dump..."
    export PGPASSWORD="${DB_PASSWORD:-}"
    
    pg_dump \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USERNAME" \
        -d "$DB_DATABASE" \
        -Fc \
        --no-owner \
        --no-privileges \
        -f "$RAW_FILE"

    unset PGPASSWORD

    # Validate archive integrity using pg_restore listing
    echo "[2/5] Validating PostgreSQL archive table of contents..."
    if ! pg_restore -l "$RAW_FILE" >/dev/null 2>&1; then
        echo "ERROR: pg_dump output failed integrity verification!" >&2
        exit 1
    fi
elif [ "$DB_CONNECTION" = "sqlite" ]; then
    SQLITE_PATH="${DB_DATABASE}"
    if [ ! -f "$SQLITE_PATH" ]; then
        echo "ERROR: SQLite database file not found at ${SQLITE_PATH}" >&2
        exit 1
    fi
    echo "[1/5] Dumping SQLite database '${SQLITE_PATH}'..."
    sqlite3 "$SQLITE_PATH" ".backup '${RAW_FILE}'"
    
    echo "[2/5] Validating SQLite backup integrity..."
    INTEGRITY_CHECK=$(sqlite3 "$RAW_FILE" "PRAGMA integrity_check;")
    if [ "$INTEGRITY_CHECK" != "ok" ]; then
        echo "ERROR: SQLite backup integrity check failed: ${INTEGRITY_CHECK}" >&2
        exit 1
    fi
else
    echo "ERROR: Unsupported DB_CONNECTION '${DB_CONNECTION}'" >&2
    exit 1
fi

RAW_SIZE=$(wc -c < "$RAW_FILE" | tr -d ' ')
echo "  Raw archive validated successfully (${RAW_SIZE} bytes)."

# 2. Encrypt archive with OpenSSL AES-256-CBC
echo "[3/5] Encrypting archive with OpenSSL AES-256-CBC (PBKDF2 100k iterations)..."

if [ -n "$BACKUP_ENCRYPTION_KEY_FILE" ] && [ -f "$BACKUP_ENCRYPTION_KEY_FILE" ]; then
    openssl enc -aes-256-cbc -salt -pbkdf2 -iter 100000 \
        -pass file:"$BACKUP_ENCRYPTION_KEY_FILE" \
        -in "$RAW_FILE" \
        -out "$ENCRYPTED_FILE"
elif [ -n "$BACKUP_ENCRYPTION_KEY" ]; then
    openssl enc -aes-256-cbc -salt -pbkdf2 -iter 100000 \
        -pass pass:"$BACKUP_ENCRYPTION_KEY" \
        -in "$RAW_FILE" \
        -out "$ENCRYPTED_FILE"
else
    echo "ERROR: Neither BACKUP_ENCRYPTION_KEY_FILE nor BACKUP_ENCRYPTION_KEY is set!" >&2
    exit 1
fi

chmod 600 "$ENCRYPTED_FILE"
ENC_SIZE=$(wc -c < "$ENCRYPTED_FILE" | tr -d ' ')

# 3. Generate SHA256 checksum
echo "[4/5] Computing SHA-256 checksum..."
sha256sum "$ENCRYPTED_FILE" > "${ENCRYPTED_FILE}.sha256"

# 4. Optional Offsite Upload to S3
if [ -n "$S3_BACKUP_BUCKET" ]; then
    if command -v aws >/dev/null 2>&1; then
        echo "[5/5] Uploading encrypted archive to off-site S3 storage (${S3_BACKUP_BUCKET})..."
        aws s3 cp "$ENCRYPTED_FILE" "${S3_BACKUP_BUCKET}/$(basename "$ENCRYPTED_FILE")"
        aws s3 cp "${ENCRYPTED_FILE}.sha256" "${S3_BACKUP_BUCKET}/$(basename "$ENCRYPTED_FILE").sha256"
        
        # Verify remote existence
        if ! aws s3 ls "${S3_BACKUP_BUCKET}/$(basename "$ENCRYPTED_FILE")" >/dev/null 2>&1; then
            echo "ERROR: S3 upload failed remote verification!" >&2
            exit 1
        fi
        echo "  S3 off-site verification confirmed."
    else
        echo "WARNING: S3_BACKUP_BUCKET specified but 'aws' CLI is not installed. Skipping off-site transfer."
    fi
else
    echo "[5/5] Off-site S3 bucket unconfigured. Encrypted backup retained locally."
fi

# 5. Local Retention Purge
echo "Enforcing ${RETENTION_DAYS}-day local retention policy in ${BACKUP_DIR}..."
find "$BACKUP_DIR" -maxdepth 1 -name "gounow_*.dump.enc*" -type f -mtime "+${RETENTION_DAYS}" -delete

ELAPSED=$(( SECONDS - START_SECONDS ))

echo "=== [GouNow Backup] COMPLETED SUCCESSFULLY in ${ELAPSED}s ==="
echo "Artifact: ${ENCRYPTED_FILE} (${ENC_SIZE} bytes)"
echo "Checksum: $(cat "${ENCRYPTED_FILE}.sha256")"
exit 0
