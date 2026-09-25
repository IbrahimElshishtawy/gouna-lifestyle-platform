<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Experience;
use App\Models\HomepageSection;
use App\Models\Location;
use App\Models\Property;
use App\Models\PropertyCategory;
use App\Modules\Lead\Application\Actions\StoreInquiryLeadAction;
use App\Modules\Lead\Application\DTOs\LeadInquiryDTO;
use App\Shared\Infrastructure\Caching\CacheKeys;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\View\View;

class HomeController extends Controller
{
    public function __construct(
        private readonly StoreInquiryLeadAction $storeLeadAction
    ) {}

    /**
     * Display the editorial Gounow Homepage (Sections 7 & 126).
     */
    public function index(): View
    {
        // Featured Vacation Rentals
        $featuredRentals = Property::published()
            ->forRent()
            ->with(['category', 'location', 'images'])
            ->orderByDesc('is_featured')
            ->orderBy('id')
            ->take(6)
            ->get();

        // Featured Real Estate for Sale (Section 26 & 28)
        $featuredSales = Property::published()
            ->forSale()
            ->with(['category', 'location', 'images'])
            ->orderByDesc('is_featured')
            ->take(3)
            ->get();

        // Featured Curated Experiences (Section 29)
        $featuredExperiences = Experience::published()
            ->with(['category', 'location', 'images'])
            ->orderByDesc('is_featured')
            ->take(4)
            ->get();

        // Featured Events / What's On (Section 40)
        $upcomingEvents = Event::published()
            ->with(['location', 'ticketTypes'])
            ->where('event_date', '>=', now()->toDateString())
            ->orderBy('event_date')
            ->take(3)
            ->get();

        // Cached Locations & Categories for Search Filter Bar
        $locations = Cache::remember(
            CacheKeys::LOCATIONS_ACTIVE,
            CacheKeys::TTL_EXTENDED,
            fn() => Location::active()->get()
        );

        $categories = Cache::remember(
            CacheKeys::PROPERTY_CATEGORIES_ACTIVE,
            CacheKeys::TTL_EXTENDED,
            fn() => PropertyCategory::active()->get()
        );

        // CMS Homepage Sections
        $sections = HomepageSection::where('is_visible', true)
            ->orderBy('sort_order')
            ->get()
            ->keyBy('section_key');

        return view('home', compact(
            'featuredRentals',
            'featuredSales',
            'featuredExperiences',
            'upcomingEvents',
            'locations',
            'categories',
            'sections'
        ));
    }

    /**
     * Store a general contact lead or concierge request (Section 131).
     */
    public function inquire(Request $request): RedirectResponse|JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'type' => ['nullable', 'string', 'in:inquiry,concierge,real_estate,experience'],
            'message' => ['required', 'string', 'max:2000'],
            'source' => ['nullable', 'string', 'max:50'],
        ]);

        $dto = new LeadInquiryDTO(
            name: $validated['name'],
            email: $validated['email'],
            phone: $validated['phone'] ?? null,
            message: $validated['message'],
            type: $validated['type'] ?? 'inquiry',
            source: $validated['source'] ?? 'website_homepage'
        );

        $this->storeLeadAction->execute($dto);

        $message = app()->getLocale() === 'ar'
            ? 'شكراً لتواصلك معنا! سيقوم فريق كونسيرج الجونة بالرد عليك في أقرب وقت.'
            : 'Thank you! The GouNow El Gouna Concierge team will get back to you shortly.';

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'message' => $message]);
        }

        return back()->with('success', $message);
    }
}
