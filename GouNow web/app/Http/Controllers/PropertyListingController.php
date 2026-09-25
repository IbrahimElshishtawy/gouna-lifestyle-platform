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
use App\Modules\Lead\Application\Actions\StoreInquiryLeadAction;
use App\Modules\Lead\Application\DTOs\LeadInquiryDTO;
use App\Shared\Infrastructure\Caching\CacheKeys;
use Illuminate\Support\Facades\Cache;
use Illuminate\View\View;

class PropertyListingController extends Controller
{
    public function __construct(
        private AvailabilityService $availabilityService,
        private PricingService $pricingService,
        private StoreInquiryLeadAction $storeLeadAction,
        private \App\Modules\Property\Application\Queries\SearchPropertiesQuery $searchPropertiesQuery,
    ) {}

    /**
     * Display a filtered listing of properties (Vacation Rentals & Real Estate).
     */
    public function index(\App\Modules\Property\Presentation\Requests\PropertySearchRequest $request): View
    {
        $viewData = $this->searchPropertiesQuery->execute($request->toDTO());

        return view('properties.index', $viewData);
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
    public function inquire(\App\Modules\Lead\Presentation\Requests\StorePropertyInquiryRequest $request, Property $property): RedirectResponse|JsonResponse
    {
        $this->storeLeadAction->execute($request->toDTO($property));

        $message = app()->getLocale() === 'ar'
            ? 'تم استلام استفسارك بنجاح! سيتواصل معك مستشارنا العقاري قريباً.'
            : 'Your inquiry has been received! Our El Gouna property consultant will contact you shortly.';

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'message' => $message]);
        }

        return back()->with('success', $message);
    }
}
