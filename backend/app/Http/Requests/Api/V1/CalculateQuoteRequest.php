<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class CalculateQuoteRequest extends FormRequest
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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'property_id' => ['required', 'integer', 'exists:properties,id'],
            'check_in' => ['required', 'date', 'after_or_equal:today'],
            'check_out' => ['required', 'date', 'after:check_in'],
            'guests' => ['required', 'integer', 'min:1', 'max:50'],
            'promo_code' => ['nullable', 'string', 'max:50'],
            // Prohibited client-injected fields (Standard S1)
            'total' => ['prohibited'],
            'subtotal' => ['prohibited'],
            'tax' => ['prohibited'],
            'discount_cents' => ['prohibited'],
            'status' => ['prohibited'],
            'price_per_night' => ['prohibited'],
        ];
    }
}
