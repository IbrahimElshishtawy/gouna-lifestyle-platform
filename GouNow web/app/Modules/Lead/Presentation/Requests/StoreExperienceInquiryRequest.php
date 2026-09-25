<?php

declare(strict_types=1);

namespace App\Modules\Lead\Presentation\Requests;

use App\Models\Experience;
use App\Modules\Lead\Application\DTOs\LeadInquiryDTO;
use Illuminate\Foundation\Http\FormRequest;

class StoreExperienceInquiryRequest extends FormRequest
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
            'requested_date' => ['nullable', 'date', 'after_or_equal:today'],
            'guests' => ['nullable', 'integer', 'min:1'],
            'message' => ['nullable', 'string', 'max:1500'],
        ];
    }

    public function toDTO(Experience $experience): LeadInquiryDTO
    {
        $validated = $this->validated();

        $message = "Requested Date: " . ($validated['requested_date'] ?? 'Flexible') . "\n";
        $message .= "Party Size: " . ($validated['guests'] ?? 1) . " guests\n\n";
        $message .= ($validated['message'] ?? 'Experience booking request via website.');

        return new LeadInquiryDTO(
            name: $validated['name'],
            email: $validated['email'],
            phone: $validated['phone'],
            message: $message,
            type: 'experience',
            source: 'website_experience_page',
            leadableType: Experience::class,
            leadableId: $experience->id
        );
    }
}
