<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Media;
use App\Models\Property;
use App\Models\User;
use App\Services\MediaService;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use InvalidArgumentException;
use Tests\TestCase;

class StorageSecurityHardeningTest extends TestCase
{
    use RefreshDatabase;

    private MediaService $mediaService;

    private Property $property;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);
        $this->mediaService = app(MediaService::class);
        Storage::fake('public');

        $this->admin = User::factory()->create([
            'is_admin' => true,
            'is_active' => true,
        ]);

        $this->property = Property::create([
            'reference_number' => 'PROP-SEC-'.uniqid(),
            'slug' => 'sec-villa-'.uniqid(),
            'title_en' => 'Security Villa',
            'title_ar' => 'فيلا تجربة الأمان',
            'listing_type' => 'rent',
            'base_price_cents' => 300000,
            'currency' => 'EGP',
            'is_published' => true,
            'status' => 'published',
        ]);
    }

    /**
     * Test 1: Executable extensions (.php, .phtml, .sh, .exe, .svg) are rejected.
     */
    public function test_dangerous_extensions_are_rejected(): void
    {
        $dangerousFiles = [
            UploadedFile::fake()->create('shell.php', 100, 'image/jpeg'),
            UploadedFile::fake()->create('backdoor.phtml', 100, 'image/png'),
            UploadedFile::fake()->create('script.sh', 100, 'image/jpeg'),
            UploadedFile::fake()->create('trojan.exe', 100, 'image/jpeg'),
            UploadedFile::fake()->create('xss.svg', 100, 'image/svg+xml'),
            UploadedFile::fake()->create('page.html', 100, 'text/html'),
        ];

        foreach ($dangerousFiles as $file) {
            try {
                $this->mediaService->uploadMedia($this->property, $file);
                $this->fail("Expected upload of {$file->getClientOriginalName()} to be rejected.");
            } catch (InvalidArgumentException $e) {
                $this->assertTrue(
                    str_contains($e->getMessage(), 'Disallowed file extension') ||
                    str_contains($e->getMessage(), 'Unsupported or unsafe MIME type')
                );
            }
        }
    }

    /**
     * Test 2: Unsafe or unpermitted MIME types are rejected.
     */
    public function test_unsafe_mime_types_are_rejected(): void
    {
        $unsafeMimeFile = UploadedFile::fake()->create('document.pdf', 500, 'application/pdf');

        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Unsupported or unsafe MIME type');

        $this->mediaService->uploadMedia($this->property, $unsafeMimeFile);
    }

    /**
     * Test 3: Oversized images (> 10MB) are rejected.
     */
    public function test_oversized_image_is_rejected(): void
    {
        // 11 MB image
        $oversizedFile = UploadedFile::fake()->create('huge.jpg', 11 * 1024, 'image/jpeg');

        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Image file size exceeds maximum allowable limit');

        $this->mediaService->uploadMedia($this->property, $oversizedFile);
    }

    /**
     * Test 4: Polyglot file with embedded PHP code is blocked.
     */
    public function test_polyglot_embedded_php_signature_is_blocked(): void
    {
        // Create a temporary file with a JPEG MIME but containing executable PHP payload
        $tempPath = tempnam(sys_get_temp_dir(), 'test_polyglot');
        file_put_contents($tempPath, "\xFF\xD8\xFF\xE0<?php phpinfo(); ?>");

        $file = new UploadedFile(
            $tempPath,
            'innocent.jpg',
            'image/jpeg',
            null,
            true
        );

        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Malicious code signature detected');

        try {
            $this->mediaService->uploadMedia($this->property, $file);
        } finally {
            if (file_exists($tempPath)) {
                @unlink($tempPath);
            }
        }
    }

    /**
     * Test 5: Valid file is stored with UUID filename and normalized client name.
     */
    public function test_valid_file_is_stored_with_uuid_and_sanitized_name(): void
    {
        $file = UploadedFile::fake()->create('my photo #1 (final)!.jpg', 200, 'image/jpeg');

        $media = $this->mediaService->uploadMedia($this->property, $file);

        $this->assertNotNull($media->id);
        $this->assertEquals('image', $media->file_type);
        $this->assertEquals('image/jpeg', $media->mime_type);

        // Verify storage file path uses UUID v4
        $this->assertMatchesRegularExpression('#^uploads/properties/[a-f0-9\-]{36}\.jpg$#', $media->file_path);
        Storage::disk('public')->assertExists($media->file_path);

        // Verify client-provided original filename is sanitized
        $this->assertEquals('my_photo__1__final__.jpg', $media->file_name);
    }

    /**
     * Test 6: Media physical deletion removes file from disk.
     */
    public function test_media_deletion_removes_physical_file(): void
    {
        $file = UploadedFile::fake()->create('to_delete.jpg', 200, 'image/jpeg');
        $media = $this->mediaService->uploadMedia($this->property, $file);

        Storage::disk('public')->assertExists($media->file_path);

        $deleted = $this->mediaService->deleteMedia($media);
        $this->assertTrue($deleted);

        Storage::disk('public')->assertMissing($media->file_path);
        $this->assertDatabaseMissing('media', ['id' => $media->id]);
    }

    /**
     * Test 7: Orphan media cleanup scans and prunes unreferenced storage files.
     */
    public function test_orphan_media_cleanup_prunes_unreferenced_files(): void
    {
        // 1. Create a legitimate referenced media file
        $validFile = UploadedFile::fake()->create('valid.jpg', 200, 'image/jpeg');
        $validMedia = $this->mediaService->uploadMedia($this->property, $validFile);

        // 2. Put an orphan unreferenced file directly on disk
        $orphanPath = 'uploads/properties/orphan-abandoned-file.jpg';
        Storage::disk('public')->put($orphanPath, 'orphan data payload');

        $this->assertTrue(Storage::disk('public')->exists($orphanPath));

        // Execute cleanup with 0 hours cutoff (immediate prune)
        $result = $this->mediaService->cleanupOrphans('public', 0, false);

        $this->assertEquals(1, $result['deleted']);
        Storage::disk('public')->assertMissing($orphanPath);
        Storage::disk('public')->assertExists($validMedia->file_path);
    }

    /**
     * Test 8: Unauthorized user cannot delete media (403 Forbidden).
     */
    public function test_unauthorized_user_cannot_delete_media(): void
    {
        $file = UploadedFile::fake()->create('secured.jpg', 200, 'image/jpeg');
        $media = $this->mediaService->uploadMedia($this->property, $file);

        $staffUser = User::factory()->create([
            'is_admin' => false,
            'is_active' => true,
        ]);

        $response = $this->actingAs($staffUser)
            ->delete("/admin/properties/{$this->property->id}/media/{$media->id}");

        $response->assertStatus(403);
        Storage::disk('public')->assertExists($media->file_path);
    }
}
