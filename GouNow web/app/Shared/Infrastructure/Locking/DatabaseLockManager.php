<?php

declare(strict_types=1);

namespace App\Shared\Infrastructure\Locking;

use App\Shared\Application\Contracts\LockManagerInterface;
use Closure;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class DatabaseLockManager implements LockManagerInterface
{
    public function lockRowForUpdate(string $modelClass, int|string $id): ?Model
    {
        return $modelClass::where('id', $id)->lockForUpdate()->first();
    }

    public function withRowLock(string $modelClass, int|string $id, Closure $callback): mixed
    {
        return DB::transaction(function () use ($modelClass, $id, $callback) {
            $lockedModel = $this->lockRowForUpdate($modelClass, $id);
            if (! $lockedModel) {
                throw new \RuntimeException("Resource of type {$modelClass} with ID {$id} not found for locking.");
            }

            return $callback($lockedModel);
        });
    }
}
