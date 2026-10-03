<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdatePropertyRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check() && (auth()->user()->is_admin || auth()->user()->hasRole('admin') || auth()->user()->hasRole('super_admin'));
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title_en' => ['required', 'string', 'max:255'],
            'title_ar' => ['nullable', 'string', 'max:255'],
            'property_category_id' => ['required', 'exists:property_categories,id'],
            'location_id' => ['required', 'exists:locations,id'],
            'listing_type' => ['required', 'in:rent,sale,both'],
            'short_description_en' => ['nullable', 'string'],
            'short_description_ar' => ['nullable', 'string'],
            'description_en' => ['nullable', 'string'],
            'description_ar' => ['nullable', 'string'],
            'bedrooms' => ['required', 'integer', 'min:0'],
            'bathrooms' => ['required', 'integer', 'min:0'],
            'max_guests' => ['required', 'integer', 'min:1'],
            'area_sqm' => ['nullable', 'numeric', 'min:0'],
            'floor' => ['nullable', 'integer'],
            'compound' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string'],
            'latitude' => ['nullable', 'numeric'],
            'longitude' => ['nullable', 'numeric'],
            'min_stay_nights' => ['nullable', 'integer', 'min:1'],
            'max_stay_nights' => ['nullable', 'integer', 'min:1'],
            'check_in_time' => ['nullable', 'string'],
            'check_out_time' => ['nullable', 'string'],
            'base_price' => ['nullable', 'numeric', 'min:0'],
            'sale_price' => ['nullable', 'numeric', 'min:0'],
            'cleaning_fee' => ['nullable', 'numeric', 'min:0'],
            'service_fee' => ['nullable', 'numeric', 'min:0'],
            'tax_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'payment_requirement' => ['required', 'in:full,deposit,both'],
            'deposit_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'deposit_fixed' => ['nullable', 'numeric', 'min:0'],
            'payment_methods' => ['nullable', 'array'],
            'payment_methods.*' => ['exists:payment_methods,id'],
            'booking_mode' => ['required', 'in:instant,request,whatsapp,manual'],
            'cancellation_policy' => ['required', 'in:flexible,moderate,strict,non_refundable,custom'],
            'cancellation_policy_text_en' => ['nullable', 'string'],
            'cancellation_policy_text_ar' => ['nullable', 'string'],
            'house_rules_en' => ['nullable', 'string'],
            'house_rules_ar' => ['nullable', 'string'],
            'developer' => ['nullable', 'string'],
            'completion_status' => ['nullable', 'in:ready,off_plan,under_construction'],
            'furnished_status' => ['nullable', 'in:furnished,unfurnished,semi_furnished'],
            'status' => ['required', 'in:draft,published,archived'],
            'is_featured' => ['nullable', 'boolean'],
            'is_published' => ['nullable', 'boolean'],
            'is_available' => ['nullable', 'boolean'],
            'amenities' => ['nullable', 'array'],
            'amenities.*' => ['exists:amenities,id'],
            'images.*' => ['nullable', 'image', 'max:10240'],
            'videos.*' => ['nullable', 'mimes:mp4,mov,avi', 'max:51200'],
        ];
    }
}
