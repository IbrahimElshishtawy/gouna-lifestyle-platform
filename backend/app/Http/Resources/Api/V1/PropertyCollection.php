<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class PropertyCollection extends ResourceCollection
{
    public $collects = PropertyResource::class;

    /**
     * Transform the resource collection into an array adhering to Standard S2.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'data' => $this->collection,
        ];
    }

    /**
     * Get additional data that should be returned with the resource array.
     *
     * @return array<string, mixed>
     */
    public function with(Request $request): array
    {
        $requestId = $request->attributes->get('request_id')
            ?? $request->header('X-Request-ID')
            ?? (string) \Illuminate\Support\Str::uuid();

        return [
            'meta' => [
                'request_id' => $requestId,
                'timestamp' => now()->toIso8601String(),
            ],
        ];
    }
}
