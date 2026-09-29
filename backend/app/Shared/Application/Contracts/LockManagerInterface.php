<?php

declare(strict_types=1);

namespace App\Shared\Application\Contracts;

use Closure;
use Illuminate\Database\Eloquent\Model;

interface LockManagerInterface
{
    /**
     * Lock a model row for update (SELECT ... FOR UPDATE) to prevent concurrency races.
     */
    public function lockRowForUpdate(string $modelClass, int|string $id): ?Model;

    /**
     * Execute a callback inside an atomic database transaction with a row lock.
     *
     * @template T
     * @param class-string<Model> $modelClass
     * @param int|string $id
     * @param Closure(Model): T $callback
     * @return T
     */
    public function withRowLock(string $modelClass, int|string $id, Closure $callback): mixed;
}
