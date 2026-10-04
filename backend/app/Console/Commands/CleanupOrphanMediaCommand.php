<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Services\MediaService;
use Illuminate\Console\Command;

class CleanupOrphanMediaCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'media:cleanup-orphans
                            {--disk=public : Storage disk to scan}
                            {--hours=24 : Minimum age in hours of unreferenced files before deletion}
                            {--dry-run : Report without actually deleting files}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Scan storage and prune unreferenced orphan media files';

    /**
     * Execute the console command.
     */
    public function handle(MediaService $mediaService): int
    {
        $disk = (string) $this->option('disk');
        $hours = (int) $this->option('hours');
        $dryRun = (bool) $this->option('dry-run');

        $this->info("Scanning disk '{$disk}' for orphan media older than {$hours} hours...");
        if ($dryRun) {
            $this->warn('DRY RUN MODE: No files will be deleted.');
        }

        $result = $mediaService->cleanupOrphans($disk, $hours, $dryRun);

        $this->table(
            ['Files Scanned', 'Orphans Identified / Deleted', 'Storage Space Reclaimed'],
            [
                [
                    $result['scanned'],
                    $result['deleted'],
                    $this->formatBytes($result['bytes_freed']),
                ],
            ]
        );

        $this->info('Orphan cleanup completed successfully.');

        return Command::SUCCESS;
    }

    private function formatBytes(int $bytes): string
    {
        if ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2).' MB';
        }
        if ($bytes >= 1024) {
            return number_format($bytes / 1024, 2).' KB';
        }

        return $bytes.' Bytes';
    }
}
