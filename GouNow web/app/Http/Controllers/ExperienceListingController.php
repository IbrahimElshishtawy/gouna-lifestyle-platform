<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Experience;
use App\Models\ExperienceCategory;
use App\Models\Location;
use App\Modules\Lead\Application\Actions\StoreInquiryLeadAction;
use App\Modules\Lead\Application\DTOs\LeadInquiryDTO;
use App\Shared\Infrastructure\Caching\CacheKeys;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\View\View;

class ExperienceListingController extends Controller
{
    public function __construct(
        private readonly StoreInquiryLeadAction $storeLeadAction
    ) {}

    /**
     * Display a listing of curated El Gouna experiences (Section 29 & 30).
     */
    public function index(Request $request): View
    {
        $categorySlug = $request->query('category');
        $locationSlug = $request->query('location');

        $query = Experience::published()->with(['category', 'location', 'images']);

        if (! empty($categorySlug) && $categorySlug !== 'all') {
            $query->whereHas('category', fn($q) => $q->where('slug', $categorySlug));
        }

        if (! empty($locationSlug) && $locationSlug !== 'all') {
            $query->whereHas('location', fn($q) => $q->where('slug', $locationSlug));
        }

        $experiences = $query->orderByDesc('is_featured')->orderBy('id')->paginate(12)->withQueryString();
        $categories = Cache::remember(CacheKeys::EXPERIENCE_CATEGORIES_ACTIVE, CacheKeys::TTL_EXTENDED, fn() => ExperienceCategory::active()->get());
        $locations = Cache::remember(CacheKeys::LOCATIONS_ACTIVE, CacheKeys::TTL_EXTENDED, fn() => Location::active()->get());

        return view('experiences.index', compact('experiences', 'categories', 'locations', 'categorySlug', 'locationSlug'));
    }

    /**
     * Display a single Experience detail page.
     */
    public function show(Request $request, Experience $experience): View
    {
        if (! $experience->is_published && ! auth()->user()?->is_admin) {
            abort(404);
        }

        $experience->load(['category', 'location', 'images']);

        $relatedExperiences = Experience::published()
            ->where('id', '!=', $experience->id)
            ->where('experience_category_id', $experience->experience_category_id)
            ->with(['category', 'location', 'images'])
            ->take(3)
            ->get();

        return view('experiences.show', compact('experience', 'relatedExperiences'));
    }

    /**
     * Store experience booking inquiry lead.
     */
    public function inquire(Request $request, Experience $experience): RedirectResponse|JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:30'],
            'requested_date' => ['nullable', 'date', 'after_or_equal:today'],
            'guests' => ['nullable', 'integer', 'min:1'],
            'message' => ['nullable', 'string', 'max:1500'],
        ]);

        $message = "Requested Date: " . ($validated['requested_date'] ?? 'Flexible') . "\n";
        $message .= "Party Size: " . ($validated['guests'] ?? 1) . " guests\n\n";
        $message .= ($validated['message'] ?? 'Experience booking request via website.');

        $dto = new LeadInquiryDTO(
            name: $validated['name'],
            email: $validated['email'],
            phone: $validated['phone'],
            message: $message,
            type: 'experience',
            source: 'website_experience_page',
            leadableType: Experience::class,
            leadableId: $experience->id
        );

        $this->storeLeadAction->execute($dto);

        $feedback = app()->getLocale() === 'ar'
            ? 'تم إرسال طلب حجز التجربة بنجاح! سيتواصل معك فريق التجارب لتأكيد الموعد.'
            : 'Your experience request has been submitted! Our concierge will contact you to confirm timing.';

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'message' => $feedback]);
        }

        return back()->with('success', $feedback);
    }
}
