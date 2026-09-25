<?php

namespace App\Services;

use App\Models\Media;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaService
{
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
        $folder = Str::plural(Str::lower(class_basename($mediable)));
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs("uploads/{$folder}", $filename, 'public');

        $mime = $file->getMimeType();
        $isImage = str_starts_with($mime, 'image/');
        $isVideo = str_starts_with($mime, 'video/');

        // If this is set as featured, unfeature any previous media on this model
        if ($isFeatured) {
            $mediable->media()->update(['is_featured' => false]);
        }

        $nextOrder = (int) ($mediable->media()->max('sort_order') ?? 0) + 1;

        return $mediable->media()->create([
            'file_path' => $path,
            'file_name' => $file->getClientOriginalName(),
            'file_type' => $isVideo ? 'video' : 'image',
            'mime_type' => $mime,
            'file_size' => $file->getSize() ?? 0,
            'disk' => 'public',
            'alt_text_en' => $altTextEn ?? $mediable->title_en ?? $mediable->name_en ?? 'GOUNOW Asset',
            'alt_text_ar' => $altTextAr ?? $mediable->title_ar ?? $mediable->name_ar ?? null,
            'title' => pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
            'sort_order' => $nextOrder,
            'is_featured' => $isFeatured,
        ]);
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
}
