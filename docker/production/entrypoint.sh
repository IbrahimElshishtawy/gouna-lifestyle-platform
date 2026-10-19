#!/bin/sh
set -e

# Dynamically set Nginx port if $PORT is provided by cloud environment (e.g. Render / Railway)
TARGET_PORT="${PORT:-8080}"
sed -i "s/listen [0-9]\+;/listen ${TARGET_PORT};/g" /etc/nginx/http.d/default.conf

# Setup storage and cache permissions
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# If SQLite is explicitly configured, ensure database directory and file exist
if [ "$DB_CONNECTION" = "sqlite" ]; then
    if [ "$APP_ENV" = "production" ]; then
        echo "WARNING: SQLite is configured in production. Ephemeral filesystems will cause data loss on container restart." >&2
    fi
    mkdir -p /var/www/html/database
    if [ ! -f "/var/www/html/database/database.sqlite" ]; then
        touch /var/www/html/database/database.sqlite
    fi
    chown -R www-data:www-data /var/www/html/database
    chmod -R 775 /var/www/html/database
fi

# Determine container operational role for process supervision
# Supported roles: 'web', 'worker', 'scheduler', 'all_in_one'
CONTAINER_ROLE="${CONTAINER_ROLE:-all_in_one}"
case "$CONTAINER_ROLE" in
    "web")
        export SUPERVISOR_START_WEB="true"
        export SUPERVISOR_START_WORKER="${ENABLE_QUEUE_WORKER:-false}"
        export SUPERVISOR_START_CRON="${ENABLE_SCHEDULER:-false}"
        ;;
    "worker")
        export SUPERVISOR_START_WEB="false"
        export SUPERVISOR_START_WORKER="true"
        export SUPERVISOR_START_CRON="${ENABLE_SCHEDULER:-false}"
        ;;
    "scheduler")
        export SUPERVISOR_START_WEB="false"
        export SUPERVISOR_START_WORKER="false"
        export SUPERVISOR_START_CRON="true"
        ;;
    "all_in_one"|*)
        export SUPERVISOR_START_WEB="true"
        export SUPERVISOR_START_WORKER="true"
        export SUPERVISOR_START_CRON="true"
        ;;
esac

# Configure system cron if scheduler is enabled
if [ "$SUPERVISOR_START_CRON" = "true" ]; then
    mkdir -p /etc/crontabs
    echo "* * * * * php /var/www/html/artisan schedule:run >> /dev/null 2>&1" > /etc/crontabs/root
    chmod 0600 /etc/crontabs/root
fi

# Ensure storage link exists
php /var/www/html/artisan storage:link --force || true

# Run database migrations if requested (migration failures MUST halt deployment)
if [ "$RUN_MIGRATIONS" = "true" ] || [ "$RUN_MIGRATIONS" = "1" ]; then
    echo "Running database migrations..."
    php /var/www/html/artisan migrate --force
fi

# Cache configuration, routes, and views in production
if [ "$APP_ENV" = "production" ]; then
    php /var/www/html/artisan config:cache || true
    php /var/www/html/artisan route:cache || true
    php /var/www/html/artisan view:cache || true
fi

exec "$@"

