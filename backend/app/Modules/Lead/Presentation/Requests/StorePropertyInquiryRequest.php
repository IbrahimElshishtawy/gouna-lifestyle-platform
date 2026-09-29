<?php

declare(strict_types=1);

namespace App\Modules\Lead\Presentation\Requests;

use App\Models\Property;
use App\Modules\Lead\Application\DTOs\LeadInquiryDTO;
use Illuminate\Foundation\Http\FormRequest;

class StorePropertyInquiryRequest extends FormRequest
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
            'phone' => ['required', 'string', 'max:30'],
            'message' => ['required', 'string', 'max:1500'],
            'type' => ['nullable', 'string', 'in:inquiry,property_sale,viewing'],
        ];
    }

    public function toDTO(Property $property): LeadInquiryDTO
    {
        $validated = $this->validated();

        return new LeadInquiryDTO(
            name: $validated['name'],
            email: $validated['email'],
            phone: $validated['phone'],
            message: $validated['message'],
            type: $validated['type'] ?? ($property->listing_type === 'sale' ? 'property_sale' : 'inquiry'),
            source: 'website_property_page',
            leadableType: Property::class,
            leadableId: $property->id
        );
    }
}
