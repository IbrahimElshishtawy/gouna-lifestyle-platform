<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;

class QuoteResource extends BaseJsonResource
{
    /**
     * Transform the resource into an array adhering to Standard S2.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'type' => 'quotes',
            'attributes' => [
                'property_id' => $this->resource['property_id'] ?? null,
                'check_in' => $this->resource['check_in'] ?? null,
                'check_out' => $this->resource['check_out'] ?? null,
                'nights' => (int) ($this->resource['nights'] ?? 0),
                'guests' => (int) ($this->resource['guests'] ?? 1),
                'pricing' => [
                    'nightly_rate_cents' => (int) ($this->resource['nightly_rate_cents'] ?? 0),
                    'subtotal_cents' => (int) ($this->resource['subtotal_cents'] ?? 0),
                    'cleaning_fee_cents' => (int) ($this->resource['cleaning_fee_cents'] ?? 0),
                    'service_fee_cents' => (int) ($this->resource['service_fee_cents'] ?? 0),
                    'tax_cents' => (int) ($this->resource['tax_cents'] ?? 0),
                    'discount_cents' => (int) ($this->resource['discount_cents'] ?? 0),
                    'total_cents' => (int) ($this->resource['total_cents'] ?? 0),
                    'deposit_cents' => (int) ($this->resource['deposit_cents'] ?? 0),
                    'currency' => $this->resource['currency'] ?? 'EGP',
                ],
                'breakdown' => $this->resource['breakdown'] ?? [],
            ],
        ];
    }
}
