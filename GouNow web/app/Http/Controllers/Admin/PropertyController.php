<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Amenity;
use App\Models\Location;
use App\Models\Media;
use App\Models\PaymentMethod;
use App\Models\Property;
use App\Models\PropertyCategory;
use App\Services\MediaService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\View\View;

class PropertyController extends Controller
{
    public function __construct(
        private MediaService $mediaService,
    ) {}

    /**
     * Display a listing of properties with filtering and search.
     */
    public function index(Request $request): View
    {
        $query = Property::with(['category', 'location', 'featuredImage'])
            ->latest();

        if ($request->filled('search')) {
            $s = $request->input('search');
            $query->where(function ($q) use ($s) {
                $q->where('title_en', 'like', "%{$s}%")
                  ->orWhere('title_ar', 'like', "%{$s}%")
                  ->orWhere('reference_number', 'like', "%{$s}%")
                  ->orWhere('compound', 'like', "%{$s}%");
            });
        }

        if ($request->filled('type')) {
            $type = $request->input('type');
            if ($type === 'rent') {
                $query->whereIn('listing_type', ['rent', 'both']);
            } elseif ($type === 'sale') {
                $query->whereIn('listing_type', ['sale', 'both']);
            }
        }

        if ($request->filled('category_id')) {
            $query->where('property_category_id', $request->input('category_id'));
        }

        if ($request->filled('location_id')) {
            $query->where('location_id', $request->input('location_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $properties = $query->paginate(12)->withQueryString();
        $categories = PropertyCategory::orderBy('name_en')->get();
        $locations = Location::orderBy('name_en')->get();

        return view('admin.properties.index', compact('properties', 'categories', 'locations'));
    }

    /**
     * Show the form for creating a new property.
     */
    public function create(): View
    {
        $categories = PropertyCategory::active()->get();
        $locations = Location::active()->get();
        $amenities = Amenity::active()->get()->groupBy('group');
        $paymentMethods = PaymentMethod::enabled()->get();

        return view('admin.properties.create', compact('categories', 'locations', 'amenities', 'paymentMethods'));
    }

    /**
     * Store a newly created property in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
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
            // Section 20 Payment Settings
            'payment_requirement' => ['required', 'in:full,deposit,both'],
            'deposit_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'deposit_fixed' => ['nullable', 'numeric', 'min:0'],
            'payment_methods' => ['nullable', 'array'],
            'payment_methods.*' => ['exists:payment_methods,id'],
            // Section 21 Booking Mode
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
            'images.*' => ['nullable', 'image', 'max:10240'], // 10MB
            'videos.*' => ['nullable', 'mimes:mp4,mov,avi', 'max:51200'], // 50MB
        ]);

        // Auto-generate reference number and slug
        $referenceNumber = 'GON-P-' . strtoupper(Str::random(6));
        $slug = Str::slug($validated['title_en']) . '-' . strtolower(Str::random(4));

        // Money conversion: standard EGP to integer cents
        $basePriceCents = isset($validated['base_price']) ? (int) round($validated['base_price'] * 100) : 0;
        $salePriceCents = ! empty($validated['sale_price']) ? (int) round($validated['sale_price'] * 100) : null;
        $cleaningFeeCents = isset($validated['cleaning_fee']) ? (int) round($validated['cleaning_fee'] * 100) : 0;
        $serviceFeeCents = isset($validated['service_fee']) ? (int) round($validated['service_fee'] * 100) : 0;
        $depositFixedCents = ! empty($validated['deposit_fixed']) ? (int) round($validated['deposit_fixed'] * 100) : null;

        $property = Property::create([
            'reference_number' => $referenceNumber,
            'slug' => $slug,
            'property_category_id' => $validated['property_category_id'],
            'location_id' => $validated['location_id'],
            'title_en' => $validated['title_en'],
            'title_ar' => $validated['title_ar'] ?? null,
            'listing_type' => $validated['listing_type'],
            'short_description_en' => $validated['short_description_en'] ?? null,
            'short_description_ar' => $validated['short_description_ar'] ?? null,
            'description_en' => $validated['description_en'] ?? null,
            'description_ar' => $validated['description_ar'] ?? null,
            'bedrooms' => $validated['bedrooms'],
            'bathrooms' => $validated['bathrooms'],
            'max_guests' => $validated['max_guests'],
            'area_sqm' => $validated['area_sqm'] ?? null,
            'floor' => $validated['floor'] ?? null,
            'compound' => $validated['compound'] ?? null,
            'address' => $validated['address'] ?? null,
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
            'min_stay_nights' => $validated['min_stay_nights'] ?? 1,
            'max_stay_nights' => $validated['max_stay_nights'] ?? null,
            'check_in_time' => $validated['check_in_time'] ?? '15:00:00',
            'check_out_time' => $validated['check_out_time'] ?? '11:00:00',
            'base_price_cents' => $basePriceCents,
            'sale_price_cents' => $salePriceCents,
            'cleaning_fee_cents' => $cleaningFeeCents,
            'service_fee_cents' => $serviceFeeCents,
            'tax_percentage' => $validated['tax_percentage'] ?? 14.00,
            'currency' => 'EGP',
            'payment_requirement' => $validated['payment_requirement'],
            'deposit_percentage' => $validated['deposit_percentage'] ?? null,
            'deposit_fixed_cents' => $depositFixedCents,
            'booking_mode' => $validated['booking_mode'],
            'cancellation_policy' => $validated['cancellation_policy'],
            'cancellation_policy_text_en' => $validated['cancellation_policy_text_en'] ?? null,
            'cancellation_policy_text_ar' => $validated['cancellation_policy_text_ar'] ?? null,
            'house_rules_en' => $validated['house_rules_en'] ?? null,
            'house_rules_ar' => $validated['house_rules_ar'] ?? null,
            'developer' => $validated['developer'] ?? null,
            'completion_status' => $validated['completion_status'] ?? null,
            'furnished_status' => $validated['furnished_status'] ?? null,
            'status' => $validated['status'],
            'is_published' => $request->boolean('is_published'),
            'is_featured' => $request->boolean('is_featured'),
            'is_available' => $request->boolean('is_available', true),
        ]);

        // Sync Amenities
        if ($request->has('amenities')) {
            $property->amenities()->sync($request->input('amenities'));
        }

        // Sync Allowed Payment Methods
        if ($request->has('payment_methods')) {
            $property->paymentMethods()->sync($request->input('payment_methods'));
        } else {
            // Default to all active payment methods
            $property->paymentMethods()->sync(PaymentMethod::pluck('id'));
        }

        // Upload media (images/videos)
        if ($request->hasFile('images')) {
            $isFirst = true;
            foreach ($request->file('images') as $image) {
                $this->mediaService->uploadMedia(
                    $property,
                    $image,
                    $isFirst, // Set first image as featured
                    $property->title_en,
                    $property->title_ar
                );
                $isFirst = false;
            }
        }

        if ($request->hasFile('videos')) {
            foreach ($request->file('videos') as $video) {
                $this->mediaService->uploadMedia($property, $video, false, $property->title_en);
            }
        }

        return redirect()->route('admin.properties.index')->with('success', "Property '{$property->title_en}' created successfully!");
    }

    /**
     * Show the form for editing an existing property.
     */
    public function edit(Property $property): View
    {
        $property->load(['amenities', 'paymentMethods', 'media']);
        $categories = PropertyCategory::active()->get();
        $locations = Location::active()->get();
        $amenities = Amenity::active()->get()->groupBy('group');
        $paymentMethods = PaymentMethod::enabled()->get();

        return view('admin.properties.edit', compact('property', 'categories', 'locations', 'amenities', 'paymentMethods'));
    }

    /**
     * Update an existing property.
     */
    public function update(Request $request, Property $property): RedirectResponse
    {
        $validated = $request->validate([
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
            'amenities' => ['nullable', 'array'],
            'amenities.*' => ['exists:amenities,id'],
            'images.*' => ['nullable', 'image', 'max:10240'],
            'videos.*' => ['nullable', 'mimes:mp4,mov,avi', 'max:51200'],
        ]);

        $basePriceCents = isset($validated['base_price']) ? (int) round($validated['base_price'] * 100) : $property->base_price_cents;
        $salePriceCents = ! empty($validated['sale_price']) ? (int) round($validated['sale_price'] * 100) : null;
        $cleaningFeeCents = isset($validated['cleaning_fee']) ? (int) round($validated['cleaning_fee'] * 100) : $property->cleaning_fee_cents;
        $serviceFeeCents = isset($validated['service_fee']) ? (int) round($validated['service_fee'] * 100) : $property->service_fee_cents;
        $depositFixedCents = ! empty($validated['deposit_fixed']) ? (int) round($validated['deposit_fixed'] * 100) : null;

        $property->update([
            'property_category_id' => $validated['property_category_id'],
            'location_id' => $validated['location_id'],
            'title_en' => $validated['title_en'],
            'title_ar' => $validated['title_ar'] ?? null,
            'listing_type' => $validated['listing_type'],
            'short_description_en' => $validated['short_description_en'] ?? null,
            'short_description_ar' => $validated['short_description_ar'] ?? null,
            'description_en' => $validated['description_en'] ?? null,
            'description_ar' => $validated['description_ar'] ?? null,
            'bedrooms' => $validated['bedrooms'],
            'bathrooms' => $validated['bathrooms'],
            'max_guests' => $validated['max_guests'],
            'area_sqm' => $validated['area_sqm'] ?? null,
            'floor' => $validated['floor'] ?? null,
            'compound' => $validated['compound'] ?? null,
            'address' => $validated['address'] ?? null,
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
            'min_stay_nights' => $validated['min_stay_nights'] ?? 1,
            'max_stay_nights' => $validated['max_stay_nights'] ?? null,
            'check_in_time' => $validated['check_in_time'] ?? '15:00:00',
            'check_out_time' => $validated['check_out_time'] ?? '11:00:00',
            'base_price_cents' => $basePriceCents,
            'sale_price_cents' => $salePriceCents,
            'cleaning_fee_cents' => $cleaningFeeCents,
            'service_fee_cents' => $serviceFeeCents,
            'tax_percentage' => $validated['tax_percentage'] ?? 14.00,
            'payment_requirement' => $validated['payment_requirement'],
            'deposit_percentage' => $validated['deposit_percentage'] ?? null,
            'deposit_fixed_cents' => $depositFixedCents,
            'booking_mode' => $validated['booking_mode'],
            'cancellation_policy' => $validated['cancellation_policy'],
            'cancellation_policy_text_en' => $validated['cancellation_policy_text_en'] ?? null,
            'cancellation_policy_text_ar' => $validated['cancellation_policy_text_ar'] ?? null,
            'house_rules_en' => $validated['house_rules_en'] ?? null,
            'house_rules_ar' => $validated['house_rules_ar'] ?? null,
            'developer' => $validated['developer'] ?? null,
            'completion_status' => $validated['completion_status'] ?? null,
            'furnished_status' => $validated['furnished_status'] ?? null,
            'status' => $validated['status'],
            'is_published' => $request->boolean('is_published'),
            'is_featured' => $request->boolean('is_featured'),
            'is_available' => $request->boolean('is_available', true),
        ]);

        // Sync Amenities
        $property->amenities()->sync($request->input('amenities', []));

        // Sync Allowed Payment Methods
        $property->paymentMethods()->sync($request->input('payment_methods', []));

        // Upload additional media
        if ($request->hasFile('images')) {
            $hasFeatured = $property->media()->where('is_featured', true)->exists();
            $first = ! $hasFeatured;
            foreach ($request->file('images') as $image) {
                $this->mediaService->uploadMedia(
                    $property,
                    $image,
                    $first,
                    $property->title_en,
                    $property->title_ar
                );
                $first = false;
            }
        }

        if ($request->hasFile('videos')) {
            foreach ($request->file('videos') as $video) {
                $this->mediaService->uploadMedia($property, $video, false, $property->title_en);
            }
        }

        return redirect()->route('admin.properties.index')->with('success', "Property '{$property->title_en}' updated successfully!");
    }

    /**
     * Delete a property (soft delete).
     */
    public function destroy(Property $property): RedirectResponse
    {
        $title = $property->title_en;
        $property->delete();

        return redirect()->route('admin.properties.index')->with('success', "Property '{$title}' moved to archive.");
    }

    /**
     * Delete an attached media file.
     */
    public function deleteMedia(Property $property, Media $media): RedirectResponse
    {
        if ($media->mediable_id === $property->id && $media->mediable_type === Property::class) {
            $this->mediaService->deleteMedia($media);
            return back()->with('success', 'Media file removed successfully.');
        }

        abort(403);
    }
}
