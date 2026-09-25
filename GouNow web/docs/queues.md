# Asynchronous Processing & Queue Strategy

## 1. Overview
In a high-concurrency booking platform, synchronous HTTP requests must **never** block on third-party APIs or heavy computations. GouNow offloads notification delivery, media processing, and cache synchronization to asynchronous background queues backed by **Redis** in production.

---

## 2. Queue Segregation & Priorities

Queues are partitioned by SLA (Service Level Agreement) to ensure that a burst of heavy image uploads or bulk newsletters never delays an urgent payment confirmation or booking notification.

| Queue Name | Priority | Typical Jobs | Concurrency Target |
| :--- | :--- | :--- | :--- |
| **`critical`** | 1 (Highest) | Payment webhook reconciliation, emergency lock releases. | 5+ workers |
| **`notifications`** | 2 | Customer booking confirmation emails, host WhatsApp alerts, SMS OTPs. | 5+ workers |
| **`default`** | 3 | Lead CRM syncing, cache invalidation, activity audit logging. | 3 workers |
| **`media`** | 4 (Lowest) | High-res image resizing, WebP conversion, S3 uploads. | 2 workers |

---

## 3. Worker Supervisor Configuration

In production, queues are managed via **Laravel Horizon** (for Redis) or standard systemd/Supervisor daemons:

```ini
[program:gounow-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/artisan queue:work redis --queue=critical,notifications,default,media --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
user=www-data
numprocs=8
redirect_stderr=true
stdout_logfile=/var/log/supervisor/gounow-worker.log
```

---

## 4. Failure Handling & Exponential Backoff

Jobs interacting with external services (SendGrid for emails, WhatsApp Cloud API, payment gateways) implement resilience patterns:

```php
namespace App\Modules\Booking\Application\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendBookingConfirmationEmailJob implements ShouldQueue
{
    use InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = [10, 60, 300]; // 10s, 1m, 5m exponential backoff
    public int $timeout = 30;

    public function __construct(public int $bookingId) {}

    public function handle(): void
    {
        // Fetch booking snapshot and deliver mail
    }

    public function failed(\Throwable $exception): void
    {
        // Log critical failure to Sentry and notify on-call administrator
    }
}
```

---

## 5. Dead Letter Queue & Monitoring
- Any job that exhausts its maximum attempts is recorded in the `failed_jobs` database table.
- Admins can inspect and re-run failed jobs via `php artisan queue:retry all` or through the Laravel Horizon dashboard.
- Automated alerts notify engineering if the failed jobs rate exceeds 1% of total throughput.
