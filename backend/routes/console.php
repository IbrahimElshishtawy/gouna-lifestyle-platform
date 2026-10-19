<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    // @phpstan-ignore-next-line
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('bookings:expire-pending')
    ->everyFiveMinutes()
    ->withoutOverlapping()
    ->onOneServer();

Artisan::command('db:backup', function () {
    $script = base_path('../docker/scripts/backup_database.sh');
    if (! file_exists($script)) {
        $script = '/usr/local/bin/backup_database.sh';
    }
    if (! file_exists($script)) {
        $script = base_path('docker/scripts/backup_database.sh');
    }

    if (! file_exists($script)) {
        $this->error('Backup script not found.');
        return 1;
    }

    $this->info('Executing encrypted database backup routine...');
    passthru("bash " . escapeshellarg($script), $status);
    return $status;
})->purpose('Execute encrypted database backup and retention purge');

Schedule::command('db:backup')
    ->everySixHours()
    ->withoutOverlapping()
    ->onOneServer();

