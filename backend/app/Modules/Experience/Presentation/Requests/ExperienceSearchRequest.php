<?php

declare(strict_types=1);

namespace App\Modules\Experience\Presentation\Requests;

use App\Modules\Experience\Application\DTOs\ExperienceSearchFiltersDTO;
use Illuminate\Foundation\Http\FormRequest;

class ExperienceSearchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category' => ['nullable', 'string', 'max:100'],
            'location' => ['nullable', 'string', 'max:100'],
        ];
    }

    public function toDTO(): ExperienceSearchFiltersDTO
    {
        return new ExperienceSearchFiltersDTO(
            categorySlug: $this->query('category'),
            locationSlug: $this->query('location'),
            perPage: 12
        );
    }
}
