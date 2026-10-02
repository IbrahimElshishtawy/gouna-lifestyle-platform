<?php

namespace App\Support\Traits;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

trait AppliesListingStandard
{
    /**
     * Apply standardized sorting, filtering, eager loading, and pagination to an Eloquent query.
     */
    protected function paginateWithListingStandard(
        Builder $query,
        Request $request,
        array $allowedSorts = ['id', 'created_at'],
        array $allowedFilters = [],
        array $allowedIncludes = [],
        string $defaultSort = '-created_at',
        int $defaultPerPage = 15,
        int $maxPerPage = 100
    ): LengthAwarePaginator {
        $this->applyIncludes($query, $request, $allowedIncludes);
        $this->applyFilters($query, $request, $allowedFilters);
        $this->applySorting($query, $request, $allowedSorts, $defaultSort);

        return $this->applyPagination($query, $request, $defaultPerPage, $maxPerPage);
    }

    /**
     * Apply sorting with strict whitelist validation.
     */
    protected function applySorting(
        Builder $query,
        Request $request,
        array $allowedSorts,
        string $defaultSort = '-created_at'
    ): Builder {
        $sortParam = $request->input('sort', $defaultSort);

        if (empty($sortParam)) {
            $sortParam = $defaultSort;
        }

        $sortFields = explode(',', (string) $sortParam);

        foreach ($sortFields as $sortField) {
            $sortField = trim($sortField);
            if (empty($sortField)) {
                continue;
            }

            $direction = str_starts_with($sortField, '-') ? 'desc' : 'asc';
            $cleanField = ltrim($sortField, '-+');

            if (! in_array($cleanField, $allowedSorts, true)) {
                throw ValidationException::withMessages([
                    'sort' => ["Invalid sort field '{$cleanField}'. Allowed fields: ".implode(', ', $allowedSorts)],
                ]);
            }

            $query->orderBy($cleanField, $direction);
        }

        return $query;
    }

    /**
     * Apply allowed relationship includes.
     */
    protected function applyIncludes(
        Builder $query,
        Request $request,
        array $allowedIncludes
    ): Builder {
        $includeParam = $request->input('include');

        if (empty($includeParam)) {
            return $query;
        }

        $includes = array_filter(array_map('trim', explode(',', (string) $includeParam)));

        foreach ($includes as $include) {
            if (! in_array($include, $allowedIncludes, true)) {
                throw ValidationException::withMessages([
                    'include' => ["Invalid include '{$include}'. Allowed includes: ".implode(', ', $allowedIncludes)],
                ]);
            }
        }

        return $query->with($includes);
    }

    /**
     * Apply simple equality or range filters.
     */
    protected function applyFilters(
        Builder $query,
        Request $request,
        array $allowedFilters
    ): Builder {
        $filterInputs = $request->input('filter', []);

        if (! is_array($filterInputs)) {
            return $query;
        }

        foreach ($filterInputs as $filterKey => $filterValue) {
            if (! in_array($filterKey, $allowedFilters, true)) {
                throw ValidationException::withMessages([
                    'filter' => ["Invalid filter '{$filterKey}'. Allowed filters: ".implode(', ', $allowedFilters)],
                ]);
            }

            if ($filterValue !== null && $filterValue !== '') {
                if (is_array($filterValue)) {
                    $query->whereIn($filterKey, $filterValue);
                } else {
                    $query->where($filterKey, $filterValue);
                }
            }
        }

        return $query;
    }

    /**
     * Apply strict pagination capped at maxPerPage.
     */
    protected function applyPagination(
        Builder $query,
        Request $request,
        int $defaultPerPage = 15,
        int $maxPerPage = 100
    ): LengthAwarePaginator {
        $rawPerPage = $request->input('per_page', $defaultPerPage);

        // Cap pagination between 1 and maxPerPage
        $perPage = (int) $rawPerPage;
        if ($perPage < 1) {
            $perPage = $defaultPerPage;
        }
        $perPage = min($perPage, $maxPerPage);

        return $query->paginate($perPage)->appends($request->query());
    }
}
