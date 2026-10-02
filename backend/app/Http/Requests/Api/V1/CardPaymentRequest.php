<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class CardPaymentRequest extends FormRequest
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
            'booking_id' => ['required', 'integer', 'exists:bookings,id'],
            'card_number' => ['required', 'string', 'regex:/^[0-9]{13,19}$/'],
            'exp_month' => ['required', 'integer', 'between:1,12'],
            'exp_year' => ['required', 'integer', 'min:'.date('Y'), 'max:'.(date('Y') + 20)],
            'cvv' => ['required', 'string', 'regex:/^[0-9]{3,4}$/'],
            'cardholder_name' => ['required', 'string', 'max:150'],

            // Prohibited fields
            'amount' => ['prohibited'],
            'currency' => ['prohibited'],
            'status' => ['prohibited'],
        ];
    }
}
