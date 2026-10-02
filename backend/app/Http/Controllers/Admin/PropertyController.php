<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Amenity;
use App\Models\Location;
use App\Models\Media;
use App\Models\PaymentMethod;
use App\Models\Property;
use App\Http\Requests\Admin\StorePropertyRequest;
use App\Http\Requests\Admin\UpdatePropertyRequest;
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
    public function store(StorePropertyRequest $request): RedirectResponse
    {
        $validated = $request->validated();

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
    public function update(UpdatePropertyRequest $request, Property $property): RedirectResponse
    {
        $validated = $request->validated();

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
