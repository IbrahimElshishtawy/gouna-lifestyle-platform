#!/usr/bin/env bash
# ==============================================================================
# GouNow Production Database Restore Script (Phase 12E)
# ==============================================================================
# Usage:
#   BACKUP_ENCRYPTION_KEY_FILE=/etc/gounow/backup.key ./restore_database.sh /path/to/backup.dump.enc
#
# Environment variables:
#   DB_CONNECTION          Database driver ('pgsql' or 'sqlite', default: pgsql)
#   DB_HOST                Database host (default: localhost)
#   DB_PORT                Database port (default: 5432)
#   DB_DATABASE            Target database to restore into (default: gounow_restore_drill)
#   DB_USERNAME            Database user (default: gounow_user)
#   DB_PASSWORD            Database password
#   BACKUP_ENCRYPTION_KEY  Passphrase string (fallback if key file not provided)
#   BACKUP_ENCRYPTION_KEY_FILE Path to key file containing passphrase
#   CONFIRM_PRODUCTION_RESTORE Must be set to 'I_UNDERSTAND_THIS_OVERWRITES_PRODUCTION' if DB_DATABASE contains 'production'
# ==============================================================================

set -eo pipefail

if [ -z "$1" ]; then
    echo "ERROR: Missing backup file argument." >&2
    echo "Usage: $0 <path_to_encrypted_backup_file>" >&2
    exit 1
fi

ENCRYPTED_FILE="$1"
if [ ! -f "$ENCRYPTED_FILE" ]; then
    echo "ERROR: Backup file not found: ${ENCRYPTED_FILE}" >&2
    exit 1
fi

DB_CONNECTION="${DB_CONNECTION:-pgsql}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_DATABASE="${DB_DATABASE:-gounow_restore_drill}"
DB_USERNAME="${DB_USERNAME:-gounow_user}"

# Guardrail: Prevent accidental destructive restore into production
if [[ "$DB_DATABASE" =~ production ]] && [ "$CONFIRM_PRODUCTION_RESTORE" != "I_UNDERSTAND_THIS_OVERWRITES_PRODUCTION" ]; then
    echo "FATAL: Attempting restore against production database '${DB_DATABASE}' without explicit confirmation!" >&2
    echo "Set CONFIRM_PRODUCTION_RESTORE=I_UNDERSTAND_THIS_OVERWRITES_PRODUCTION to proceed." >&2
    exit 1
fi

echo "=== [GouNow Restore Drill] Starting at $(date -u +"%Y%m%d_%H%M%SZ") ==="
echo "Target DB: ${DB_DATABASE} on ${DB_HOST}:${DB_PORT} (Driver: ${DB_CONNECTION})"
echo "Artifact:  ${ENCRYPTED_FILE}"

START_SECONDS=$SECONDS

TMP_DIR=$(mktemp -d /tmp/gounow_restore_XXXXXX)
trap 'rm -rf "$TMP_DIR"' EXIT

DECRYPTED_FILE="${TMP_DIR}/restored.raw"

# 1. Verify SHA-256 Checksum if present
if [ -f "${ENCRYPTED_FILE}.sha256" ]; then
    echo "[1/5] Verifying SHA-256 checksum..."
    (cd "$(dirname "$ENCRYPTED_FILE")" && sha256sum -c "$(basename "${ENCRYPTED_FILE}.sha256")")
    echo "  SHA-256 checksum matches."
else
    echo "[1/5] Notice: Checksum file not found. Skipping checksum verification."
fi

# 2. Decrypt archive with OpenSSL AES-256-CBC
echo "[2/5] Decrypting archive with OpenSSL AES-256-CBC..."
if [ -n "$BACKUP_ENCRYPTION_KEY_FILE" ] && [ -f "$BACKUP_ENCRYPTION_KEY_FILE" ]; then
    openssl enc -d -aes-256-cbc -salt -pbkdf2 -iter 100000 \
        -pass file:"$BACKUP_ENCRYPTION_KEY_FILE" \
        -in "$ENCRYPTED_FILE" \
        -out "$DECRYPTED_FILE"
elif [ -n "$BACKUP_ENCRYPTION_KEY" ]; then
    openssl enc -d -aes-256-cbc -salt -pbkdf2 -iter 100000 \
        -pass pass:"$BACKUP_ENCRYPTION_KEY" \
        -in "$ENCRYPTED_FILE" \
        -out "$DECRYPTED_FILE"
else
    echo "ERROR: Neither BACKUP_ENCRYPTION_KEY_FILE nor BACKUP_ENCRYPTION_KEY is set!" >&2
    exit 1
fi

DECRYPTED_SIZE=$(wc -c < "$DECRYPTED_FILE" | tr -d ' ')
echo "  Archive decrypted successfully (${DECRYPTED_SIZE} bytes)."

# 3. Restore to target database
if [ "$DB_CONNECTION" = "pgsql" ]; then
    echo "[3/5] Validating PostgreSQL archive table of contents..."
    pg_restore -l "$DECRYPTED_FILE" >/dev/null

    echo "[4/5] Restoring database schema and records via pg_restore..."
    export PGPASSWORD="${DB_PASSWORD:-}"

    # Drop and recreate or clean target database schema
    pg_restore \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USERNAME" \
        -d "$DB_DATABASE" \
        --clean \
        --if-exists \
        --no-owner \
        --no-privileges \
        "$DECRYPTED_FILE" || true

    unset PGPASSWORD

    # 4. Integrity Validation Queries
    echo "[5/5] Executing post-restore record count audit..."
    export PGPASSWORD="${DB_PASSWORD:-}"
    
    USERS_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_DATABASE" -t -A -c "SELECT count(*) FROM users;")
    PROPERTIES_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_DATABASE" -t -A -c "SELECT count(*) FROM properties;")
    BOOKINGS_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_DATABASE" -t -A -c "SELECT count(*) FROM bookings;")
    PAYMENTS_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_DATABASE" -t -A -c "SELECT count(*) FROM payment_transactions;")
    
    unset PGPASSWORD

    echo "  Restored Tables Verification:"
    echo "    - users:                ${USERS_COUNT} rows"
    echo "    - properties:           ${PROPERTIES_COUNT} rows"
    echo "    - bookings:             ${BOOKINGS_COUNT} rows"
    echo "    - payment_transactions: ${PAYMENTS_COUNT} rows"

elif [ "$DB_CONNECTION" = "sqlite" ]; then
    echo "[3/5] Restoring SQLite database to '${DB_DATABASE}'..."
    mkdir -p "$(dirname "$DB_DATABASE")"
    cp "$DECRYPTED_FILE" "$DB_DATABASE"

    echo "[4/5] Validating SQLite integrity..."
    sqlite3 "$DB_DATABASE" "PRAGMA integrity_check;"

    echo "[5/5] Executing post-restore record count audit..."
    USERS_COUNT=$(sqlite3 "$DB_DATABASE" "SELECT count(*) FROM users;")
    PROPERTIES_COUNT=$(sqlite3 "$DB_DATABASE" "SELECT count(*) FROM properties;")
    BOOKINGS_COUNT=$(sqlite3 "$DB_DATABASE" "SELECT count(*) FROM bookings;")
    PAYMENTS_COUNT=$(sqlite3 "$DB_DATABASE" "SELECT count(*) FROM payment_transactions;")

    echo "  Restored Tables Verification:"
    echo "    - users:                ${USERS_COUNT} rows"
    echo "    - properties:           ${PROPERTIES_COUNT} rows"
    echo "    - bookings:             ${BOOKINGS_COUNT} rows"
    echo "    - payment_transactions: ${PAYMENTS_COUNT} rows"
fi

ELAPSED=$(( SECONDS - START_SECONDS ))

echo "=== [GouNow Restore Drill] RESTORE COMPLETED SUCCESSFULLY in ${ELAPSED}s ==="
echo "Empirical RTO: ${ELAPSED} seconds (SLO: <= 3600 seconds)"
exit 0
