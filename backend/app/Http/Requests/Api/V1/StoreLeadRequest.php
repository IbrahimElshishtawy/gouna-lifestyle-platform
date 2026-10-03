<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreLeadRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:150'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'message' => ['required', 'string', 'max:2000'],
            'type' => ['nullable', 'string', 'in:concierge,general,stay,experience,viewing,lead'],
            'property_id' => ['nullable', 'integer', 'exists:properties,id'],

            // Prohibited admin/staff fields
            'status' => ['prohibited'],
            'assigned_to' => ['prohibited'],
            'notes' => ['prohibited'],
        ];
    }
}
