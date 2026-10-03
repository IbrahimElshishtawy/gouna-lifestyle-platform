<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Experience;
use App\Modules\Experience\Application\Queries\SearchExperiencesQuery;
use App\Modules\Experience\Presentation\Requests\ExperienceSearchRequest;
use App\Modules\Lead\Application\Actions\StoreInquiryLeadAction;
use App\Modules\Lead\Presentation\Requests\StoreExperienceInquiryRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class ExperienceListingController extends Controller
{
    public function __construct(
        private readonly StoreInquiryLeadAction $storeLeadAction,
        private readonly SearchExperiencesQuery $searchExperiencesQuery,
    ) {}

    /**
     * Display a listing of curated El Gouna experiences (Section 29 & 30).
     */
    public function index(ExperienceSearchRequest $request): View
    {
        $viewData = $this->searchExperiencesQuery->execute($request->toDTO());

        return view('experiences.index', $viewData);
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
    public function inquire(StoreExperienceInquiryRequest $request, Experience $experience): RedirectResponse|JsonResponse
    {
        $this->storeLeadAction->execute($request->toDTO($experience));

        $feedback = app()->getLocale() === 'ar'
            ? 'تم إرسال طلب حجز التجربة بنجاح! سيتواصل معك فريق التجارب لتأكيد الموعد.'
            : 'Your experience request has been submitted! Our concierge will contact you to confirm timing.';

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'message' => $feedback]);
        }

        return back()->with('success', $feedback);
    }
}
