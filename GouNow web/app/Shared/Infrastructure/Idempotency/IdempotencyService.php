<?php

declare(strict_types=1);

namespace App\Shared\Infrastructure\Idempotency;

use App\Shared\Application\Contracts\IdempotencyServiceInterface;
use Closure;
use Illuminate\Support\Facades\Cache;
use RuntimeException;

class IdempotencyService implements IdempotencyServiceInterface
{
    public function execute(string $key, Closure $callback, int $ttlSeconds = 86400): mixed
    {
        $cacheKey = "idempotency:result:{$key}";
        $lockKey = "idempotency:lock:{$key}";

        // If previously completed, return cached result directly
        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        // Acquire atomic lock to prevent concurrent duplicate execution
        $lock = Cache::lock($lockKey, 15);

        if (! $lock->get()) {
            // Another thread is currently processing this exact request. Wait briefly for result.
            $lock->block(5);
            if (Cache::has($cacheKey)) {
                return Cache::get($cacheKey);
            }
            throw new RuntimeException("Concurrent operation in progress for key {$key}. Please retry.");
        }

        try {
            // Double check inside lock
            if (Cache::has($cacheKey)) {
                return Cache::get($cacheKey);
            }

            $result = $callback();

            Cache::put($cacheKey, $result, $ttlSeconds);

            return $result;
        } finally {
            optional($lock)->release();
        }
    }
}
