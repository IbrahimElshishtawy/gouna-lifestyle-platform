<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Throwable;

class HealthCheckController extends Controller
{
    public function check(Request $request): JsonResponse
    {
        $status = 'healthy';
        $httpCode = 200;
        $checks = [];

        // 1. Database Check
        try {
            DB::connection()->getPdo();
            $driver = DB::getDriverName();
            $checks['database'] = [
                'status' => 'ok',
                'driver' => $driver,
            ];
        } catch (Throwable $e) {
            $status = 'unhealthy';
            $httpCode = 503;
            $checks['database'] = [
                'status' => 'fail',
                'error' => 'Database connection failed.',
            ];
        }

        // 2. Cache Check
        try {
            $testKey = 'health_check_' . time();
            Cache::put($testKey, 'ok', 5);
            $val = Cache::get($testKey);
            Cache::forget($testKey);

            $checks['cache'] = [
                'status' => ($val === 'ok') ? 'ok' : 'degraded',
                'store' => config('cache.default'),
            ];
        } catch (Throwable $e) {
            $checks['cache'] = [
                'status' => 'degraded',
                'error' => 'Cache operation failed.',
            ];
        }

        // 3. Private Storage Check
        try {
            $testFile = 'health_' . time() . '.tmp';
            Storage::disk('receipts')->put($testFile, 'test');
            $read = Storage::disk('receipts')->get($testFile);
            Storage::disk('receipts')->delete($testFile);

            $checks['storage'] = [
                'status' => ($read === 'test') ? 'ok' : 'degraded',
                'disk' => 'receipts',
            ];
        } catch (Throwable $e) {
            $checks['storage'] = [
                'status' => 'degraded',
                'error' => 'Private storage disk inaccessible.',
            ];
        }

        return response()->json([
            'status' => $status,
            'timestamp' => now()->toIso8601String(),
            'app_env' => config('app.env'),
            'checks' => $checks,
        ], $httpCode);
    }
}
