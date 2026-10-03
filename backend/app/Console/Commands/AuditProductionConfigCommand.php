<?php

declare(strict_types=1);

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Config;

class AuditProductionConfigCommand extends Command
{
    protected $signature = 'config:audit-production {--strict : Exit with non-zero status code if any warning is encountered}';

    protected $description = 'Audit application configuration for production readiness and security compliance';

    /**
     * @var array<int, array{check: string, status: string, details: string}>
     */
    protected array $results = [];

    public function handle(): int
    {
        $this->info('Starting Production Configuration & Security Audit...');
        $hasErrors = false;
        $hasWarnings = false;

        // 1. Environment & Debug
        $env = (string) Config::get('app.env');
        $debug = (bool) Config::get('app.debug');
        $key = (string) Config::get('app.key');

        if ($env !== 'production') {
            $this->addResult('APP_ENV is production', 'WARN', "Current environment is [{$env}]. Target production must be 'production'.");
            $hasWarnings = true;
        } else {
            $this->addResult('APP_ENV is production', 'PASS', 'Environment is production.');
        }

        if ($debug) {
            $this->addResult('APP_DEBUG is disabled', 'FAIL', 'APP_DEBUG is true! Detailed traces and secrets can leak to clients.');
            $hasErrors = true;
        } else {
            $this->addResult('APP_DEBUG is disabled', 'PASS', 'Debug mode is safely disabled.');
        }

        if (empty($key) || ! str_starts_with($key, 'base64:')) {
            $this->addResult('APP_KEY is configured', 'FAIL', 'APP_KEY is missing or not a valid base64 encryption key.');
            $hasErrors = true;
        } else {
            $this->addResult('APP_KEY is configured', 'PASS', 'APP_KEY is set with valid base64 key.');
        }

        // 2. Database Engine & Production Target
        $dbConnection = (string) Config::get('database.default');
        if ($dbConnection === 'sqlite') {
            $this->addResult('Database Engine', 'FAIL', 'DB_CONNECTION is sqlite. Production target must be PostgreSQL (pgsql).');
            $hasErrors = true;
        } elseif ($dbConnection !== 'pgsql') {
            $this->addResult('Database Engine', 'WARN', "DB_CONNECTION is [{$dbConnection}]. Production target standard is PostgreSQL.");
            $hasWarnings = true;
        } else {
            $this->addResult('Database Engine', 'PASS', 'PostgreSQL database driver configured.');
        }

        // 3. Session Security
        $sessionDriver = (string) Config::get('session.driver');
        $sessionSecure = (bool) Config::get('session.secure');
        $sessionHttpOnly = (bool) Config::get('session.http_only');
        $sessionSameSite = (string) Config::get('session.same_site');

        if (in_array($sessionDriver, ['file', 'array', 'cookie'], true)) {
            $this->addResult('Session Driver', 'FAIL', "Session driver is [{$sessionDriver}]. Multi-instance production requires database or redis.");
            $hasErrors = true;
        } else {
            $this->addResult('Session Driver', 'PASS', "Production session driver [{$sessionDriver}] persistence verified.");
        }

        if (! $sessionSecure) {
            $this->addResult('Session Secure Cookie', 'FAIL', 'SESSION_SECURE_COOKIE is false. Cookies can be intercepted over unencrypted HTTP.');
            $hasErrors = true;
        } else {
            $this->addResult('Session Secure Cookie', 'PASS', 'Secure cookie flag enabled.');
        }

        if (! $sessionHttpOnly) {
            $this->addResult('Session HTTP Only', 'FAIL', 'SESSION_HTTP_ONLY is false. Cookies are vulnerable to XSS theft.');
            $hasErrors = true;
        } else {
            $this->addResult('Session HTTP Only', 'PASS', 'HTTP only cookie flag enabled.');
        }

        if (! in_array(strtolower($sessionSameSite), ['lax', 'strict'], true)) {
            $this->addResult('Session SameSite', 'WARN', "SameSite is [{$sessionSameSite}]. Recommended 'lax' or 'strict'.");
            $hasWarnings = true;
        } else {
            $this->addResult('Session SameSite', 'PASS', "SameSite policy set to [{$sessionSameSite}].");
        }

        // 4. Cache & Locks
        $cacheStore = (string) Config::get('cache.default');
        if (in_array($cacheStore, ['file', 'array'], true)) {
            $this->addResult('Cache Driver', 'FAIL', "Cache store is [{$cacheStore}]. Concurrency locks and distributed rate limiting require database or redis.");
            $hasErrors = true;
        } else {
            $this->addResult('Cache Driver', 'PASS', "Production cache store [{$cacheStore}] verified.");
        }

        // 5. Queue Driver
        $queueConn = (string) Config::get('queue.default');
        if ($queueConn === 'sync') {
            $this->addResult('Queue Connection', 'WARN', 'Queue driver is sync. Heavy async jobs will block HTTP request workers.');
            $hasWarnings = true;
        } else {
            $this->addResult('Queue Connection', 'PASS', "Queue connection set to [{$queueConn}].");
        }

        // 6. CORS Policy
        $allowedOrigins = (array) Config::get('cors.allowed_origins', []);
        $supportsCredentials = (bool) Config::get('cors.supports_credentials', false);

        if (in_array('*', $allowedOrigins, true) && $supportsCredentials) {
            $this->addResult('CORS Security', 'FAIL', "CORS contains wildcard '*' with supports_credentials=true! This violates browser security standards.");
            $hasErrors = true;
        } elseif (empty($allowedOrigins)) {
            $this->addResult('CORS Security', 'WARN', 'CORS allowed_origins is empty. Cross-origin frontend requests may fail.');
            $hasWarnings = true;
        } else {
            $this->addResult('CORS Security', 'PASS', 'Strict origin whitelist configured without wildcards.');
        }

        // 7. Payment Secrets & Fail-Closed Behavior
        $webhookSecret = (string) (Config::get('services.payment.webhook_secret') ?? '');
        $paymobHmac = (string) (Config::get('services.payment.paymob.hmac_secret') ?? '');

        if ($webhookSecret === 'whsec_placeholder' || $paymobHmac === 'whsec_placeholder') {
            $this->addResult('Payment Secrets', 'FAIL', "Payment secrets contain default 'whsec_placeholder'. Webhooks cannot be safely verified in production.");
            $hasErrors = true;
        } elseif (empty($webhookSecret) && empty($paymobHmac)) {
            $this->addResult('Payment Secrets', 'FAIL', 'Payment webhook HMAC secret is completely missing from configuration.');
            $hasErrors = true;
        } else {
            $this->addResult('Payment Secrets', 'PASS', 'Payment webhook cryptographic secret configured and not using placeholder.');
        }

        // 8. Mail Transport
        $mailer = (string) Config::get('mail.default');
        if (in_array($mailer, ['log', 'array'], true)) {
            $this->addResult('Mail Driver', 'WARN', "Mail driver is [{$mailer}]. Real customer notifications will not be delivered.");
            $hasWarnings = true;
        } else {
            $this->addResult('Mail Driver', 'PASS', "Production mail driver [{$mailer}] configured.");
        }

        // Render Table
        $rows = array_map(function ($r) {
            $statusFormatted = match ($r['status']) {
                'PASS' => '<info>[PASS]</info>',
                'WARN' => '<comment>[WARN]</comment>',
                'FAIL' => '<error>[FAIL]</error>',
                default => $r['status'],
            };

            return [$r['check'], $statusFormatted, $r['details']];
        }, $this->results);

        $this->table(['Check', 'Status', 'Details'], $rows);

        if ($hasErrors) {
            $this->error('Production Configuration Audit: FAILED (Critical security/reliability blockers found).');

            return Command::FAILURE;
        }

        if ($hasWarnings && $this->option('strict')) {
            $this->warn('Production Configuration Audit: COMPLETED WITH WARNINGS (Strict mode active).');

            return Command::FAILURE;
        }

        $this->info('Production Configuration Audit: PASSED (Configuration meets production standards).');

        return Command::SUCCESS;
    }

    protected function addResult(string $check, string $status, string $details): void
    {
        $this->results[] = [
            'check' => $check,
            'status' => $status,
            'details' => $details,
        ];
    }
}
