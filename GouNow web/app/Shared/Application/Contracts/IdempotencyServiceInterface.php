<?php

declare(strict_types=1);

namespace App\Shared\Application\Contracts;

use Closure;

interface IdempotencyServiceInterface
{
    /**
     * Execute an action with idempotency protection.
     * If the key was already executed, returns the cached result.
     *
     * @param string $key Unique idempotency key (e.g. from client request header or generated)
     * @param Closure(): mixed $callback
     * @param int $ttlSeconds
     * @return mixed
     */
    public function execute(string $key, Closure $callback, int $ttlSeconds = 86400): mixed;
}
