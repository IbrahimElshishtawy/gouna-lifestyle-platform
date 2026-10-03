<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class CreateBookingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'property_id' => ['required', 'integer', 'exists:properties,id'],
            'check_in' => ['required', 'date', 'after_or_equal:today'],
            'check_out' => ['required', 'date', 'after:check_in'],
            'guests' => ['required', 'integer', 'min:1', 'max:50'],
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:30'],
            'special_requests' => ['nullable', 'string', 'max:1000'],
            'promo_code' => ['nullable', 'string', 'max:50'],
            'payment_method' => ['required', 'string', 'in:card,paypal,cash,bank_transfer'],

            // Strictly prohibited fields from customer/client (Mass Assignment & Price Tampering Defense)
            'id' => ['prohibited'],
            'reference' => ['prohibited'],
            'status' => ['prohibited'],
            'payment_status' => ['prohibited'],
            'price' => ['prohibited'],
            'price_cents' => ['prohibited'],
            'total' => ['prohibited'],
            'total_cents' => ['prohibited'],
            'amount' => ['prohibited'],
            'deposit' => ['prohibited'],
            'deposit_cents' => ['prohibited'],
            'subtotal_cents' => ['prohibited'],
            'cleaning_fee_cents' => ['prohibited'],
            'service_fee_cents' => ['prohibited'],
            'tax_cents' => ['prohibited'],
            'discount_cents' => ['prohibited'],
            'amount_paid_cents' => ['prohibited'],
            'amount_remaining_cents' => ['prohibited'],
            'internal_notes' => ['prohibited'],
            'assigned_to' => ['prohibited'],
            'is_admin' => ['prohibited'],
        ];
    }
}
