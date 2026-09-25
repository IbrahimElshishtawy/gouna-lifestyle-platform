#!/bin/sh
set -e

# Ensure storage and bootstrap/cache permissions
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# If vendor directory doesn't exist, install dependencies
if [ ! -d "/var/www/html/vendor" ]; then
    echo "Installing composer dependencies..."
    composer install --no-interaction --prefer-dist --optimize-autoloader --no-dev
fi

# Create storage symlink if missing
if [ ! -L "/var/www/html/public/storage" ]; then
    php /var/www/html/artisan storage:link || true
fi

# Execute main container command
exec "$@"
