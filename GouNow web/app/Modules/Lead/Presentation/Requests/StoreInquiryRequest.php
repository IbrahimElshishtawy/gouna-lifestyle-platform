<?php

declare(strict_types=1);

namespace App\Modules\Lead\Presentation\Requests;

use App\Modules\Lead\Application\DTOs\LeadInquiryDTO;
use Illuminate\Foundation\Http\FormRequest;

class StoreInquiryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'type' => ['nullable', 'string', 'in:inquiry,concierge,real_estate,experience,property_sale,viewing'],
            'message' => ['required', 'string', 'max:2000'],
            'source' => ['nullable', 'string', 'max:50'],
        ];
    }

    public function toDTO(): LeadInquiryDTO
    {
        $validated = $this->validated();

        return new LeadInquiryDTO(
            name: $validated['name'],
            email: $validated['email'],
            phone: $validated['phone'] ?? null,
            message: $validated['message'],
            type: $validated['type'] ?? 'inquiry',
            source: $validated['source'] ?? 'website_homepage'
        );
    }
}
