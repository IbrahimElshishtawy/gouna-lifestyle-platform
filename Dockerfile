# -------------------------------------------------------------
# Stage 1: Build Frontend Assets with Node.js & Vite
# -------------------------------------------------------------
FROM node:20-alpine AS frontend
WORKDIR /app

# Copy package files
COPY "GouNow web/package*.json" ./
RUN npm ci || npm install

# Copy application assets for Vite build
COPY "GouNow web" ./
RUN npm run build

# -------------------------------------------------------------
# Stage 2: Production PHP-FPM + Nginx + Composer
# -------------------------------------------------------------
FROM php:8.4-fpm-alpine

WORKDIR /var/www/html

# Install Nginx, Supervisor, and required PHP extensions
RUN apk add --no-cache \
    nginx \
    supervisor \
    curl \
    git \
    zip \
    unzip \
    libzip-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libxml2-dev \
    oniguruma-dev \
    sqlite-dev \
    linux-headers \
    $PHPIZE_DEPS \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo_mysql \
        pdo_sqlite \
        mbstring \
        exif \
        pcntl \
        bcmath \
        gd \
        zip \
        opcache \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && rm -rf /tmp/pear

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copy application code
COPY "GouNow web" /var/www/html

# Copy pre-compiled Vite frontend assets from stage 1
COPY --from=frontend /app/public/build /var/www/html/public/build

# Install PHP dependencies for production
RUN composer install --no-interaction --prefer-dist --optimize-autoloader --no-dev

# Copy configuration files
COPY docker/production/nginx.conf /etc/nginx/http.d/default.conf
COPY docker/production/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/production/entrypoint.sh /usr/local/bin/entrypoint.sh
COPY "GouNow web/docker/php/custom.ini" /usr/local/etc/php/conf.d/custom.ini

RUN chmod +x /usr/local/bin/entrypoint.sh \
    && chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Expose default HTTP port
EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
