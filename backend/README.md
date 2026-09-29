# GouNow Platform - Backend

The Laravel 12 application core and API for the El Gouna Lifestyle Platform.

## Directory Structure
- `app/`: Models, Controllers, Services, DTOs, and Value Objects.
- `database/`: Migrations, seeders, factories, and SQLite database.
- `routes/`: Web and API routing definitions.
- `tests/`: Feature and Unit test suites (53 tests).
- `scripts/`: Static site generator and operational utilities.
- `docker/`: PHP and Nginx container configuration.
- `composer.json`: PHP dependencies and autoload rules.

## Local Execution
```bash
composer install
php artisan migrate --seed
php artisan test
php artisan serve
```
