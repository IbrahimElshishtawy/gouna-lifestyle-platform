<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Media;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use InvalidArgumentException;

class MediaService
{
    /**
     * Whitelist of strictly permitted image MIME types and their canonical extension.
     *
     * @var array<string, string>
     */
    public const ALLOWED_IMAGE_MIMES = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
        'image/gif' => 'gif',
        'image/avif' => 'avif',
    ];

    /**
     * Whitelist of strictly permitted video MIME types and their canonical extension.
     *
     * @var array<string, string>
     */
    public const ALLOWED_VIDEO_MIMES = [
        'video/mp4' => 'mp4',
        'video/quicktime' => 'mov',
        'video/webm' => 'webm',
    ];

    /**
     * Blacklist of disallowed and hazardous file extensions.
     *
     * @var array<int, string>
     */
    public const DISALLOWED_EXTENSIONS = [
        'php', 'phtml', 'phar', 'php3', 'php4', 'php5', 'php7', 'phps',
        'sh', 'bash', 'exe', 'bat', 'cmd', 'cgi', 'pl', 'py', 'js',
        'html', 'htm', 'shtml', 'svg', 'htaccess', 'env', 'config',
    ];

    public const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

    public const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

    /**
     * Store and associate an uploaded file with a model (Property, Experience, Event).
     */
    public function uploadMedia(
        Model $mediable,
        UploadedFile $file,
        bool $isFeatured = false,
        ?string $altTextEn = null,
        ?string $altTextAr = null
    ): Media {
        // Validate file integrity, mime type, size, and header signatures
        $safeExtension = $this->validateFile($file);

        $folder = Str::plural(Str::lower(class_basename($mediable)));
        $filename = Str::uuid()->toString().'.'.$safeExtension;
        $path = $file->storeAs("uploads/{$folder}", $filename, 'public');

        $mime = (string) $file->getMimeType();
        $isVideo = array_key_exists($mime, self::ALLOWED_VIDEO_MIMES);

        // If this is set as featured, unfeature any previous media on this model
        if ($isFeatured) {
            $mediable->media()->update(['is_featured' => false]);
        }

        $nextOrder = (int) ($mediable->media()->max('sort_order') ?? 0) + 1;

        // Sanitize client-provided original filename for database metadata
        $rawClientName = basename($file->getClientOriginalName());
        $cleanOriginalName = preg_replace('/[^a-zA-Z0-9_\.-]/', '_', $rawClientName) ?: 'asset.'.$safeExtension;

        return $mediable->media()->create([
            'file_path' => $path,
            'file_name' => $cleanOriginalName,
            'file_type' => $isVideo ? 'video' : 'image',
            'mime_type' => $mime,
            'file_size' => $file->getSize() ?: 0,
            'disk' => 'public',
            'alt_text_en' => $altTextEn ?? $mediable->title_en ?? $mediable->name_en ?? 'GOUNOW Asset',
            'alt_text_ar' => $altTextAr ?? $mediable->title_ar ?? $mediable->name_ar ?? null,
            'title' => pathinfo($cleanOriginalName, PATHINFO_FILENAME),
            'sort_order' => $nextOrder,
            'is_featured' => $isFeatured,
        ]);
    }

    /**
     * Validate the uploaded file against strict security rules.
     * Returns the canonical safe extension.
     */
    public function validateFile(UploadedFile $file): string
    {
        if (! $file->isValid()) {
            throw new InvalidArgumentException('Uploaded file is corrupted or incomplete.');
        }

        // 1. Extension Blacklist Check (Defense against polyglots and executable bypasses)
        $clientExt = strtolower((string) pathinfo($file->getClientOriginalName(), PATHINFO_EXTENSION));
        if (in_array($clientExt, self::DISALLOWED_EXTENSIONS, true)) {
            Log::warning('File upload blocked: disallowed extension attempt.', [
                'filename' => $file->getClientOriginalName(),
                'extension' => $clientExt,
            ]);
            throw new InvalidArgumentException("Disallowed file extension: .{$clientExt}");
        }

        // 2. MIME Whitelist Check
        $mime = (string) $file->getMimeType();
        $isImage = array_key_exists($mime, self::ALLOWED_IMAGE_MIMES);
        $isVideo = array_key_exists($mime, self::ALLOWED_VIDEO_MIMES);

        if (! $isImage && ! $isVideo) {
            Log::warning('File upload blocked: unpermitted MIME type.', [
                'filename' => $file->getClientOriginalName(),
                'mime' => $mime,
            ]);
            throw new InvalidArgumentException("Unsupported or unsafe MIME type: {$mime}");
        }

        // 3. File Size Validation
        $size = $file->getSize() ?: 0;
        if ($isImage && $size > self::MAX_IMAGE_SIZE_BYTES) {
            throw new InvalidArgumentException('Image file size exceeds maximum allowable limit of 10MB.');
        }

        if ($isVideo && $size > self::MAX_VIDEO_SIZE_BYTES) {
            throw new InvalidArgumentException('Video file size exceeds maximum allowable limit of 50MB.');
        }

        // 4. Executable / Polyglot Content Header Inspection
        $realPath = $file->getRealPath();
        if ($realPath && file_exists($realPath) && is_readable($realPath)) {
            $handle = @fopen($realPath, 'rb');
            if ($handle) {
                $headerBytes = (string) fread($handle, 2048);
                fclose($handle);

                // Reject any embedded PHP tags or script execution vectors
                if (
                    stripos($headerBytes, '<?php') !== false ||
                    stripos($headerBytes, '<?=') !== false ||
                    stripos($headerBytes, '<script') !== false ||
                    stripos($headerBytes, '__halt_compiler') !== false
                ) {
                    Log::critical('File upload blocked: executable code signature detected in file content.', [
                        'filename' => $file->getClientOriginalName(),
                        'client_mime' => $mime,
                    ]);
                    throw new InvalidArgumentException('Malicious code signature detected in file content.');
                }
            }
        }

        // Return canonical safe extension mapped directly from verified MIME type
        return $isImage ? self::ALLOWED_IMAGE_MIMES[$mime] : self::ALLOWED_VIDEO_MIMES[$mime];
    }

    /**
     * Delete a media item and its physical file.
     */
    public function deleteMedia(Media $media): bool
    {
        if (Storage::disk($media->disk)->exists($media->file_path)) {
            Storage::disk($media->disk)->delete($media->file_path);
        }

        return (bool) $media->delete();
    }

    /**
     * Set a specific media record as featured for its model.
     */
    public function setFeatured(Media $media): void
    {
        Media::where('mediable_type', $media->mediable_type)
            ->where('mediable_id', $media->mediable_id)
            ->update(['is_featured' => false]);

        $media->update(['is_featured' => true]);
    }

    /**
     * Scan disk and delete orphan uploaded files with no matching database record.
     *
     * @return array{scanned: int, deleted: int, bytes_freed: int}
     */
    public function cleanupOrphans(string $disk = 'public', int $olderThanHours = 24, bool $dryRun = false): array
    {
        $storage = Storage::disk($disk);
        $files = $storage->allFiles('uploads');
        $cutoffTime = now()->subHours($olderThanHours)->timestamp;

        $scanned = 0;
        $deleted = 0;
        $bytesFreed = 0;

        foreach ($files as $filePath) {
            $scanned++;

            // Check if file is old enough to not be an in-progress upload
            $lastModified = $storage->lastModified($filePath);
            if ($lastModified > $cutoffTime) {
                continue;
            }

            // Check if record exists in media table
            $existsInDb = Media::where('file_path', $filePath)->exists();
            if (! $existsInDb) {
                $fileSize = $storage->size($filePath);
                if (! $dryRun) {
                    $storage->delete($filePath);
                    Log::info('Orphan media file pruned', ['path' => $filePath, 'size' => $fileSize]);
                }
                $deleted++;
                $bytesFreed += $fileSize;
            }
        }

        return [
            'scanned' => $scanned,
            'deleted' => $deleted,
            'bytes_freed' => $bytesFreed,
        ];
    }
}
