# GouNow Security Audit — 03. Remediation Changelog

**Assessment Date:** October 22, 2026  
**Auditor:** Senior Application Security & DevSecOps Engineer  
**Branch:** `security/audit-hardening`  

---

## Overview of Code Modifications

| File Modified | Component | Vulnerability Addressed | Change Description |
| :--- | :--- | :--- | :--- |
| `backend/routes/api.php` | API Routing | GN-SEC-01 (BFLA) | Added `admin` and `2fa` middleware to the `/api/v1/admin/export` route group. |
| `backend/app/Http/Controllers/Api/V1/Public/CheckoutController.php` | Payment Checkout | GN-SEC-02 (Paymob bypass) | Enforced mandatory cryptographic token checking and gated direct client confirmation in production. |
| `backend/app/Http/Controllers/Api/V1/Public/CustomerPaymentProofController.php` | Payment Proofs | GN-SEC-03 (IDOR on receipts) | Prohibited email-only fallback on `downloadReceipt` endpoint. |
| `backend/app/Http/Controllers/Api/V1/Admin/MediaDesignApiController.php` | Media CMS | GN-SEC-04 (File upload) | Integrated `MediaService::validateFile` and enforced UUID filenames. |
| `backend/config/cors.php` | CORS Configuration | GN-SEC-05 (Wildcard CORS) | Disabled wildcard subdomains in production environment. |
| `backend/app/Providers/AppServiceProvider.php` | Rate Limiting | GN-SEC-06 (Global Throttling) | Adjusted `RateLimiter::for('api')` with production 120/min ceiling. |
| `backend/bootstrap/app.php` | Application Bootstrap | GN-SEC-06 (Global Throttling) | Appended `throttle:api` to the `$middleware->api` pipeline. |
| `backend/app/Http/Middleware/EnsureAdmin.php` | RBAC Middleware | GN-SEC-01 (BFLA / Auth) | Updated user resolution to support both Sanctum Bearer tokens and Web guard sessions. |
| `backend/app/Http/Controllers/Api/V1/Admin/StaffApiController.php` | Administrative Users | GN-SEC-08 (Undefined variable) | Initialized `$user` before checking admin deletion constraints. |
| `frontend/next.config.ts` | Frontend Gateway | GN-SEC-07 (Security Headers) | Injected standard HTTP security headers (`X-Frame-Options`, `nosniff`, `Referrer-Policy`). |
| `frontend/src/context/AdminAuthContext.tsx` | Frontend RBAC | GN-SEC-07 (Admin Route Guard) | Added `userProfile.is_admin` validation to redirect unauthorized customers to `/admin/login`. |
| `backend/tests/Feature/SecurityAuditRegressionTest.php` | Automated Testing | All Findings | Created 7 comprehensive security regression tests with 20 assertions. |

---

## Detailed File Modifications

### 1. `backend/routes/api.php`
```diff
     // Graceful alias to absorb any accidental double-prefix from cached frontend bundles
-    Route::prefix('api/v1/admin/export')->middleware(['auth:sanctum', 'account.active'])->group(function () {
+    Route::prefix('api/v1/admin/export')->middleware(['auth:sanctum', 'account.active', 'admin', '2fa'])->group(function () {
         Route::get('/overview', [\App\Http\Controllers\Api\V1\Admin\ExportApiController::class, 'overview']);
         Route::get('/excel', [\App\Http\Controllers\Api\V1\Admin\ExportApiController::class, 'exportExcel']);
```

### 2. `backend/app/Http/Controllers/Api/V1/Public/CheckoutController.php`
```diff
-        $token = $request->input('token') ?? $request->query('token');
-        if ($token && ! empty($booking->booking_access_token)) {
-            if (! hash_equals($booking->booking_access_token, hash('sha256', (string) $token))) {
-                return response()->json(['error' => 'Invalid booking security token.'], 403);
-            }
+        $token = (string) ($request->input('token') ?? $request->query('token') ?? '');
+        if (! empty($booking->booking_access_token)) {
+            if (empty($token) || ! hash_equals($booking->booking_access_token, hash('sha256', $token))) {
+                return response()->json(['error' => 'Invalid or missing booking security token.'], 403);
+            }
+        } elseif (auth('sanctum')->check()) {
+            $user = auth('sanctum')->user();
+            if ($booking->customer_id && $user->customer && $booking->customer_id !== $user->customer->id && ! $user->is_admin) {
+                return response()->json(['error' => 'Unauthorized access to booking.'], 403);
+            }
+        } else {
+            return response()->json(['error' => 'Authentication or valid booking security token is required.'], 403);
         }
+
+        // In production with live payment methods, direct client self-confirmation is strictly forbidden.
+        $paymentMethod = $transaction->paymentMethod;
+        if (app()->environment('production') && $paymentMethod && ! $paymentMethod->test_mode) {
+            return response()->json([
+                'error' => 'Direct client payment confirmation is disabled in production. Payments must be verified via authentic payment gateway webhooks.',
+            ], 403);
+        }
```

### 3. `backend/app/Http/Controllers/Api/V1/Public/CustomerPaymentProofController.php`
```diff
     public function downloadReceipt(Request $request, string $reference, int $proofId)
     {
         $booking = Booking::where('reference', $reference)->first();
         if (! $booking) {
             abort(404, 'Reservation not found.');
         }
 
-        $this->authorizeCustomerAccess($request, $booking);
+        // Strict authorization: private financial documents must never use email-only fallback
+        $this->authorizeCustomerAccess($request, $booking, allowEmailFallback: false);
```

### 4. `backend/app/Http/Controllers/Api/V1/Admin/MediaDesignApiController.php`
```diff
     public function uploadMedia(Request $request): JsonResponse
     {
         $request->validate([
-            'file' => ['required', 'file', 'max:102400', 'mimes:jpeg,jpg,png,webp,gif,mp4,webm,mov,ogg,quicktime'],
+            'file' => ['required', 'file', 'max:51200'],
         ]);
 
         $file = $request->file('file');
-        $extension = $file->getClientOriginalExtension();
-        $fileName = 'hero_' . time() . '_' . uniqid() . '.' . $extension;
+        try {
+            $safeExtension = app(MediaService::class)->validateFile($file);
+        } catch (\InvalidArgumentException $e) {
+            return response()->json([
+                'success' => false,
+                'error' => $e->getMessage(),
+            ], 422);
+        }
+
+        $fileName = 'hero_' . time() . '_' . Str::uuid()->toString() . '.' . $safeExtension;
```

### 5. `backend/config/cors.php`
```diff
-    'allowed_origins_patterns' => [
-        '#^https?://.*\.ngrok-free\.app$#',
-        '#^https?://.*\.vercel\.app$#',
-        '#^https?://(192\.168|10\.|172\.(1[6-9]|2[0-9]|3[0-1]))\.\d+\.\d+(:\d+)?$#',
-    ],
+    'allowed_origins_patterns' => env('APP_ENV') === 'production'
+        ? array_filter(explode(',', (string) env('CORS_ALLOWED_PATTERNS', '')))
+        : [
+            '#^https?://.*\.ngrok-free\.app$#',
+            '#^https?://.*\.vercel\.app$#',
+            '#^https?://(192\.168|10\.|172\.(1[6-9]|2[0-9]|3[0-1]))\.\d+\.\d+(:\d+)?$#',
+        ],
```

### 6. `backend/bootstrap/app.php` & `AppServiceProvider.php`
```diff
         $middleware->api(append: [
             EnsureAccountActive::class,
             \App\Http\Middleware\TrackAdminSession::class,
+            'throttle:api',
         ]);
```

### 7. `backend/app/Http/Middleware/EnsureAdmin.php`
```diff
     public function handle(Request $request, Closure $next): Response
     {
-        if (! auth()->check()) {
+        $user = $request->user('sanctum') ?? $request->user() ?? auth()->user();
+
+        if (! $user) {
             if ($request->expectsJson() || $request->is('api/*')) {
                 abort(401, 'Unauthenticated.');
             }
 
             return redirect()->guest(route('admin.login'));
         }
-
-        $user = auth()->user();
```

### 8. `backend/app/Http/Controllers/Api/V1/Admin/StaffApiController.php`
```diff
         if (! $actor?->hasRole('super_admin') && ! $actor?->hasPermission('manage_users')) {
             return response()->json([
                 'error' => [
                     'code' => 'UNAUTHORIZED_ACCESS',
                     'message' => 'You do not have permission to delete staff members.',
                 ],
             ], 403);
         }
+
+        $user = User::findOrFail($id);
 
         if ($user->id === $actor?->id || $user->email === 'superadmin@gounow.com') {
```
