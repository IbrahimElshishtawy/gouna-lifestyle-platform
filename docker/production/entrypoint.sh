#!/bin/sh
set -e

# Dynamically set Nginx port if $PORT is provided by cloud environment (e.g. Render / Railway)
TARGET_PORT="${PORT:-8080}"
sed -i "s/listen [0-9]\+;/listen ${TARGET_PORT};/g" /etc/nginx/http.d/default.conf

# Setup storage and cache permissions
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# If SQLite is used, ensure database directory and file exist
if [ "$DB_CONNECTION" = "sqlite" ] || [ -z "$DB_CONNECTION" ]; then
    mkdir -p /var/www/html/database
    if [ ! -f "/var/www/html/database/database.sqlite" ]; then
        touch /var/www/html/database/database.sqlite
    fi
    chown -R www-data:www-data /var/www/html/database
    chmod -R 775 /var/www/html/database
fi

# Ensure storage link exists
php /var/www/html/artisan storage:link --force || true

# Run database migrations if requested
if [ "$RUN_MIGRATIONS" = "true" ] || [ "$RUN_MIGRATIONS" = "1" ]; then
    echo "Running database migrations..."
    php /var/www/html/artisan migrate --force || true
fi

# Cache configuration, routes, and views in production
if [ "$APP_ENV" = "production" ]; then
    php /var/www/html/artisan config:cache || true
    php /var/www/html/artisan route:cache || true
    php /var/www/html/artisan view:cache || true
fi

exec "$@"
