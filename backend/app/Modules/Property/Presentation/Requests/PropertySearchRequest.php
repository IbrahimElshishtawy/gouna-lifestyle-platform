<?php

declare(strict_types=1);

namespace App\Modules\Property\Presentation\Requests;

use App\Modules\Property\Application\DTOs\PropertySearchFiltersDTO;
use Illuminate\Foundation\Http\FormRequest;

class PropertySearchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'listing_type' => ['nullable', 'string', 'in:rent,sale,all'],
            'location' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', 'string', 'max:100'],
            'bedrooms' => ['nullable', 'integer', 'min:0', 'max:20'],
            'guests' => ['nullable', 'integer', 'min:1', 'max:50'],
            'min_price' => ['nullable', 'integer', 'min:0'],
            'max_price' => ['nullable', 'integer', 'min:0'],
            'sort' => ['nullable', 'string', 'in:featured,price_asc,price_desc,newest'],
            'check_in' => ['nullable', 'date'],
            'check_out' => ['nullable', 'date', 'after:check_in'],
        ];
    }

    public function toDTO(): PropertySearchFiltersDTO
    {
        return new PropertySearchFiltersDTO(
            listingType: (string) $this->query('listing_type', 'rent'),
            locationSlug: $this->query('location'),
            categorySlug: $this->query('category'),
            bedrooms: $this->filled('bedrooms') ? (int) $this->query('bedrooms') : null,
            guests: $this->filled('guests') ? (int) $this->query('guests') : null,
            minPrice: $this->filled('min_price') ? (int) $this->query('min_price') : null,
            maxPrice: $this->filled('max_price') ? (int) $this->query('max_price') : null,
            sort: (string) $this->query('sort', 'featured'),
            checkIn: $this->query('check_in'),
            checkOut: $this->query('check_out'),
            perPage: 12
        );
    }
}
