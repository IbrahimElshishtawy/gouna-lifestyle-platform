<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\Location;
use App\Models\Property;
use App\Models\PropertyCategory;
use App\Services\AvailabilityService;
use App\Services\PricingService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class PropertyListingController extends Controller
{
    public function __construct(
        private AvailabilityService $availabilityService,
        private PricingService $pricingService,
    ) {}

    /**
     * Display a filtered listing of properties (Vacation Rentals & Real Estate).
     */
    public function index(Request $request): View
    {
        $listingType = $request->query('listing_type', 'rent'); // 'rent', 'sale', 'all'
        $locationSlug = $request->query('location');
        $categorySlug = $request->query('category');
        $bedrooms = $request->query('bedrooms');
        $guests = $request->query('guests');
        $minPrice = $request->query('min_price');
        $maxPrice = $request->query('max_price');
        $sort = $request->query('sort', 'featured');

        $checkInStr = $request->query('check_in');
        $checkOutStr = $request->query('check_out');

        $query = Property::published()->with(['category', 'location', 'images']);

        // Listing Type filter
        if ($listingType === 'rent') {
            $query->forRent();
        } elseif ($listingType === 'sale') {
            $query->forSale();
        }

        // Location filter
        if (! empty($locationSlug) && $locationSlug !== 'all') {
            $query->whereHas('location', fn($q) => $q->where('slug', $locationSlug));
        }

        // Category filter
        if (! empty($categorySlug) && $categorySlug !== 'all') {
            $query->whereHas('category', fn($q) => $q->where('slug', $categorySlug));
        }

        // Bedrooms filter
        if (! empty($bedrooms) && is_numeric($bedrooms)) {
            $query->where('bedrooms', '>=', (int) $bedrooms);
        }

        // Guests filter
        if (! empty($guests) && is_numeric($guests)) {
            $query->where('max_guests', '>=', (int) $guests);
        }

        // Price range filter
        if ($listingType === 'sale') {
            if (! empty($minPrice)) {
                $query->where('sale_price_cents', '>=', (int) $minPrice * 100);
            }
            if (! empty($maxPrice)) {
                $query->where('sale_price_cents', '<=', (int) $maxPrice * 100);
            }
        } else {
            if (! empty($minPrice)) {
                $query->where('base_price_cents', '>=', (int) $minPrice * 100);
            }
            if (! empty($maxPrice)) {
                $query->where('base_price_cents', '<=', (int) $maxPrice * 100);
            }
        }

        // Date availability filter
        if (! empty($checkInStr) && ! empty($checkOutStr)) {
            try {
                $checkIn = Carbon::parse($checkInStr);
                $checkOut = Carbon::parse($checkOutStr);

                if ($checkIn->lt($checkOut)) {
                    // Filter in PHP collection or query sub-select
                    $candidateProperties = $query->get();
                    $availableIds = $candidateProperties->filter(function ($property) use ($checkIn, $checkOut) {
                        return $this->availabilityService->isAvailable($property, $checkIn, $checkOut);
                    })->pluck('id');

                    $query = Property::published()
                        ->with(['category', 'location', 'images'])
                        ->whereIn('id', $availableIds);
                }
            } catch (\Exception $e) {
                // Ignore parse errors, proceed with unfiltered dates
            }
        }

        // Sorting
        match ($sort) {
            'price_asc' => $query->orderBy(
                $listingType === 'sale' ? 'sale_price_cents' : 'base_price_cents',
                'asc'
            ),
            'price_desc' => $query->orderBy(
                $listingType === 'sale' ? 'sale_price_cents' : 'base_price_cents',
                'desc'
            ),
            'newest' => $query->orderBy('created_at', 'desc'),
            default => $query->orderByDesc('is_featured')->orderBy('id', 'asc'),
        };

        $properties = $query->paginate(12)->withQueryString();
        $locations = Location::active()->get();
        $categories = PropertyCategory::active()->get();

        return view('properties.index', compact(
            'properties',
            'locations',
            'categories',
            'listingType',
            'locationSlug',
            'categorySlug',
            'bedrooms',
            'guests',
            'minPrice',
            'maxPrice',
            'checkInStr',
            'checkOutStr',
            'sort'
        ));
    }

    /**
     * Display a single Property detail page (Section 127).
     */
    public function show(Request $request, Property $property): View
    {
        // Must be published unless previewed by an authenticated admin
        if (! $property->is_published && ! auth()->user()?->is_admin) {
            abort(404);
        }

        $property->load([
            'category',
            'location',
            'amenities',
            'seasonalPrices' => fn($q) => $q->active()->orderByDesc('priority'),
            'images',
            'paymentMethods' => fn($q) => $q->wherePivot('is_enabled', true)->where('payment_methods.is_enabled', true),
        ]);

        // Default query params for initial booking widget state
        $defaultCheckIn = $request->query('check_in', now()->addDays(3)->toDateString());
        $defaultCheckOut = $request->query('check_out', now()->addDays(6)->toDateString());
        $defaultGuests = (int) $request->query('guests', 2);

        // Calculate initial quote safely
        $initialQuote = null;
        try {
            $in = Carbon::parse($defaultCheckIn);
            $out = Carbon::parse($defaultCheckOut);
            if ($in->lt($out) && $in->gte(now()->startOfDay())) {
                $initialQuote = $this->pricingService->calculateBooking($property, $in, $out, $defaultGuests);
            }
        } catch (\Exception $e) {
            $initialQuote = null;
        }

        // Similar properties in the same location or category
        $similarProperties = Property::published()
            ->where('id', '!=', $property->id)
            ->where(function ($q) use ($property) {
                $q->where('location_id', $property->location_id)
                  ->orWhere('property_category_id', $property->property_category_id);
            })
            ->with(['category', 'location', 'images'])
            ->take(3)
            ->get();

        return view('properties.show', compact(
            'property',
            'initialQuote',
            'similarProperties',
            'defaultCheckIn',
            'defaultCheckOut',
            'defaultGuests'
        ));
    }

    /**
     * Store lead inquiry for a property (Sale viewing or rental question).
     */
    public function inquire(Request $request, Property $property): RedirectResponse|JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:30'],
            'message' => ['required', 'string', 'max:1500'],
            'type' => ['nullable', 'string', 'in:inquiry,property_sale,viewing'],
        ]);

        Lead::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'leadable_type' => Property::class,
            'leadable_id' => $property->id,
            'type' => $validated['type'] ?? ($property->listing_type === 'sale' ? 'property_sale' : 'inquiry'),
            'source' => 'website_property_page',
            'message' => $validated['message'],
            'status' => 'new',
        ]);

        $message = app()->getLocale() === 'ar'
            ? 'تم استلام استفسارك بنجاح! سيتواصل معك مستشارنا العقاري قريباً.'
            : 'Your inquiry has been received! Our El Gouna property consultant will contact you shortly.';

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'message' => $message]);
        }

        return back()->with('success', $message);
    }
}
