<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;

class BookingResource extends BaseJsonResource
{
    /**
     * Transform the resource into an array adhering to Standard S2.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $user = $request->user();
        $isStaff = $user && ($user->is_admin || $user->hasRole('staff') || $user->hasRole('super_admin'));

        return [
            'id' => $this->id,
            'type' => 'bookings',
            'attributes' => [
                'reference' => $this->reference,
                'status' => $this->status,
                'payment_status' => $this->payment_status,
                'check_in' => $this->check_in?->format('Y-m-d'),
                'check_out' => $this->check_out?->format('Y-m-d'),
                'nights' => (int) $this->nights,
                'guests' => (int) $this->guests,
                'pricing' => [
                    'subtotal_cents' => (int) $this->subtotal_cents,
                    'cleaning_fee_cents' => (int) $this->cleaning_fee_cents,
                    'service_fee_cents' => (int) $this->service_fee_cents,
                    'tax_cents' => (int) $this->tax_cents,
                    'discount_cents' => (int) $this->discount_cents,
                    'total_cents' => (int) $this->total_cents,
                    'deposit_cents' => (int) $this->deposit_cents,
                    'amount_paid_cents' => (int) $this->amount_paid_cents,
                    'amount_remaining_cents' => (int) $this->amount_remaining_cents,
                    'currency' => $this->currency ?: 'EGP',
                ],
                'cancelled_at' => $this->cancelled_at?->toIso8601String(),
                'created_at' => $this->created_at?->toIso8601String(),
                // Sensitive internal notes only visible to staff
                'internal_notes' => $this->when($isStaff, $this->internal_notes),
            ],
            'relationships' => [
                'bookable' => $this->whenLoaded('bookable', function () {
                    if ($this->bookable instanceof \App\Models\Property) {
                        return new PropertyResource($this->bookable);
                    }
                    return null;
                }),
                'customer' => $this->whenLoaded('customer', fn() => [
                    'id' => $this->customer->id,
                    'name' => $this->customer->name,
                    'email' => $this->customer->email,
                    'phone' => $this->customer->phone,
                ]),
            ],
        ];
    }
}
