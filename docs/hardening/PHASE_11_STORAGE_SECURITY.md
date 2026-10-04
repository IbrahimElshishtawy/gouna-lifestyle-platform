# PHASE 11: FILES, MEDIA, UPLOADS & STORAGE SECURITY

**Date**: 2026-10-04  
**Status**: PASSED  
**Evaluator**: Antigravity Autonomous Production Readiness Agent  

---

## 1. Storage & Upload Architecture Overview

User and administrator uploads (property photos/videos, experience assets, and event banners) represent an attack surface if not strictly isolated, validated, and normalized. 

In Phase 11, the upload pipeline was systematically audited and hardened against remote code execution (RCE), arbitrary file write, polyglot payloads, Stored XSS via SVG, path traversal, and storage exhaustion.

---

## 2. Hardened Upload Security Controls

### 2.1 Strict Whitelist of Permitted MIME Types
`App\Services\MediaService` strictly validates files against a static whitelist of safe media formats:

| Category | Permitted MIME Type | Canonical Safe Extension |
|---|---|---|
| Image | `image/jpeg` | `.jpg` |
| Image | `image/png` | `.png` |
| Image | `image/webp` | `.webp` |
| Image | `image/gif` | `.gif` |
| Image | `image/avif` | `.avif` |
| Video | `video/mp4` | `.mp4` |
| Video | `video/quicktime` | `.mov` |
| Video | `video/webm` | `.webm` |

Any MIME type outside this whitelist (including `application/pdf`, `text/html`, `application/x-php`, `application/octet-stream`) is rejected with `InvalidArgumentException`.

### 2.2 Extension Blacklist & Normalization
1. **Extension Blacklist**:
   Directly rejects files with extensions associated with executable scripts, templates, or vectors:
   `php`, `phtml`, `phar`, `php3`, `php4`, `php5`, `php7`, `sh`, `bash`, `exe`, `bat`, `cmd`, `cgi`, `pl`, `py`, `js`, `html`, `htm`, `shtml`, `svg`, `htaccess`, `env`, `config`.
2. **Canonical Mapping**:
   The stored file extension is mapped directly from the verified MIME type, **NEVER** trusted from the client-supplied `getClientOriginalExtension()`.

### 2.3 Executable & Polyglot Payload Inspection
Even if a file presents an `image/jpeg` MIME header, `MediaService::validateFile` inspects the initial binary bytes (2048 bytes) of the file payload. If signatures such as `<?php`, `<?=`, `<script`, or `__halt_compiler` are detected, the upload is aborted and a critical security warning is logged.

### 2.4 File Size & Resource Exhaustion Defense
- **Images**: Enforced maximum of **10 MB** (`MAX_IMAGE_SIZE_BYTES = 10,485,760 bytes`).
- **Videos**: Enforced maximum of **50 MB** (`MAX_VIDEO_SIZE_BYTES = 52,428,800 bytes`).
- Files exceeding these thresholds are rejected before file movement.

### 2.5 Storage Isolation & Path Traversal Defense
- **Path Generation**: Files are saved with UUID v4 filenames:
  `uploads/{folder}/{uuid}.{safeExtension}` (e.g., `uploads/properties/550e8400-e29b-41d4-a716-446655440000.jpg`).
- Path traversal sequences (`../`, `..\`) cannot influence the destination path.
- Client-provided original names are sanitized using:
  `preg_replace('/[^a-zA-Z0-9_\.-]/', '_', basename($clientName))` before recording in database metadata.

### 2.6 Orphan Cleanup Tooling
- Implemented `MediaService::cleanupOrphans` and artisan command:
  `php artisan media:cleanup-orphans [--disk=public] [--hours=24] [--dry-run]`
- Identifies and prunes physical files on disk that lack an active reference in the `media` database table, reclaiming unindexed storage.

---

## 3. Storage Visibility & Access Control

| Storage Disk | Visibility | Serve Route Status | Access Control |
|---|---|---|---|
| `public` | Public read (via web server symlink `public/storage`) | Static file serving only; PHP execution disabled | Open GET for authorized assets; write restricted to authenticated admin |
| `local` (private) | Private internal | `'serve' => false` (disabled in Phase 9) | Direct HTTP routes disabled; accessible only via backend controller |

---

## 4. Authorization & Destruction Safety

- Media deletion is governed by `MediaPolicy::delete` (`can:media.manage`).
- Route model binding uses `->scopeBindings()` (e.g., `/admin/properties/{property}/media/{media}`) ensuring that media items belonging to other entities cannot be deleted via IDOR.
- Physical file deletion is verified: when a `Media` record is deleted, `Storage::disk($media->disk)->delete($media->file_path)` removes the actual binary file from disk.
