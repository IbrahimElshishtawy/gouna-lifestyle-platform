<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Experience;
use App\Models\ExperienceCategory;
use App\Models\Location;
use App\Models\Media;
use App\Services\MediaService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\View\View;

class ExperienceController extends Controller
{
    public function __construct(
        private MediaService $mediaService,
    ) {}

    /**
     * Display a listing of experiences and activities.
     */
    public function index(Request $request): View
    {
        $query = Experience::with(['category', 'location', 'featuredImage'])->latest();

        if ($request->filled('search')) {
            $s = $request->input('search');
            $query->where(function ($q) use ($s) {
                $q->where('title_en', 'like', "%{$s}%")
                  ->orWhere('title_ar', 'like', "%{$s}%")
                  ->orWhere('slug', 'like', "%{$s}%");
            });
        }

        if ($request->filled('category_id')) {
            $query->where('experience_category_id', $request->input('category_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $experiences = $query->paginate(12)->withQueryString();
        $categories = ExperienceCategory::active()->get();

        return view('admin.experiences.index', compact('experiences', 'categories'));
    }

    /**
     * Show the form for creating a new experience.
     */
    public function create(): View
    {
        $categories = ExperienceCategory::active()->get();
        $locations = Location::active()->get();

        return view('admin.experiences.create', compact('categories', 'locations'));
    }

    /**
     * Store a newly created experience.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title_en' => ['required', 'string', 'max:255'],
            'title_ar' => ['nullable', 'string', 'max:255'],
            'experience_category_id' => ['required', 'exists:experience_categories,id'],
            'location_id' => ['nullable', 'exists:locations,id'],
            'short_description_en' => ['nullable', 'string'],
            'short_description_ar' => ['nullable', 'string'],
            'description_en' => ['nullable', 'string'],
            'description_ar' => ['nullable', 'string'],
            'pricing_model' => ['required', 'in:per_person,per_group,per_vehicle,per_day,per_hour,fixed'],
            'base_price' => ['required', 'numeric', 'min:0'],
            'max_capacity' => ['nullable', 'integer', 'min:1'],
            'duration' => ['nullable', 'string', 'max:255'],
            'payment_requirement' => ['required', 'in:full,deposit,both'],
            'deposit_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'booking_mode' => ['required', 'in:instant,request,whatsapp,manual'],
            'cancellation_policy_en' => ['nullable', 'string'],
            'cancellation_policy_ar' => ['nullable', 'string'],
            'what_to_bring_en' => ['nullable', 'string'],
            'what_to_bring_ar' => ['nullable', 'string'],
            'meeting_point_en' => ['nullable', 'string'],
            'meeting_point_ar' => ['nullable', 'string'],
            'status' => ['required', 'in:draft,published,archived'],
            'is_published' => ['nullable', 'boolean'],
            'is_featured' => ['nullable', 'boolean'],
            'images.*' => ['nullable', 'image', 'max:10240'],
        ]);

        $slug = Str::slug($validated['title_en']) . '-' . strtolower(Str::random(4));
        $basePriceCents = (int) round($validated['base_price'] * 100);

        $experience = Experience::create([
            'slug' => $slug,
            'experience_category_id' => $validated['experience_category_id'],
            'location_id' => $validated['location_id'] ?? null,
            'title_en' => $validated['title_en'],
            'title_ar' => $validated['title_ar'] ?? null,
            'short_description_en' => $validated['short_description_en'] ?? null,
            'short_description_ar' => $validated['short_description_ar'] ?? null,
            'description_en' => $validated['description_en'] ?? null,
            'description_ar' => $validated['description_ar'] ?? null,
            'pricing_model' => $validated['pricing_model'],
            'base_price_cents' => $basePriceCents,
            'currency' => 'EGP',
            'max_capacity' => $validated['max_capacity'] ?? null,
            'duration' => $validated['duration'] ?? null,
            'payment_requirement' => $validated['payment_requirement'],
            'deposit_percentage' => $validated['deposit_percentage'] ?? null,
            'booking_mode' => $validated['booking_mode'],
            'cancellation_policy_en' => $validated['cancellation_policy_en'] ?? null,
            'cancellation_policy_ar' => $validated['cancellation_policy_ar'] ?? null,
            'what_to_bring_en' => $validated['what_to_bring_en'] ?? null,
            'what_to_bring_ar' => $validated['what_to_bring_ar'] ?? null,
            'meeting_point_en' => $validated['meeting_point_en'] ?? null,
            'meeting_point_ar' => $validated['meeting_point_ar'] ?? null,
            'status' => $validated['status'],
            'is_published' => $request->boolean('is_published'),
            'is_featured' => $request->boolean('is_featured'),
        ]);

        if ($request->hasFile('images')) {
            $isFirst = true;
            foreach ($request->file('images') as $image) {
                $this->mediaService->uploadMedia(
                    $experience,
                    $image,
                    $isFirst,
                    $experience->title_en,
                    $experience->title_ar
                );
                $isFirst = false;
            }
        }

        return redirect()->route('admin.experiences.index')->with('success', "Experience '{$experience->title_en}' created successfully!");
    }

    /**
     * Show the form for editing an existing experience.
     */
    public function edit(Experience $experience): View
    {
        $experience->load('media');
        $categories = ExperienceCategory::active()->get();
        $locations = Location::active()->get();

        return view('admin.experiences.edit', compact('experience', 'categories', 'locations'));
    }

    /**
     * Update an existing experience.
     */
    public function update(Request $request, Experience $experience): RedirectResponse
    {
        $validated = $request->validate([
            'title_en' => ['required', 'string', 'max:255'],
            'title_ar' => ['nullable', 'string', 'max:255'],
            'experience_category_id' => ['required', 'exists:experience_categories,id'],
            'location_id' => ['nullable', 'exists:locations,id'],
            'short_description_en' => ['nullable', 'string'],
            'short_description_ar' => ['nullable', 'string'],
            'description_en' => ['nullable', 'string'],
            'description_ar' => ['nullable', 'string'],
            'pricing_model' => ['required', 'in:per_person,per_group,per_vehicle,per_day,per_hour,fixed'],
            'base_price' => ['required', 'numeric', 'min:0'],
            'max_capacity' => ['nullable', 'integer', 'min:1'],
            'duration' => ['nullable', 'string', 'max:255'],
            'payment_requirement' => ['required', 'in:full,deposit,both'],
            'deposit_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'booking_mode' => ['required', 'in:instant,request,whatsapp,manual'],
            'cancellation_policy_en' => ['nullable', 'string'],
            'cancellation_policy_ar' => ['nullable', 'string'],
            'what_to_bring_en' => ['nullable', 'string'],
            'what_to_bring_ar' => ['nullable', 'string'],
            'meeting_point_en' => ['nullable', 'string'],
            'meeting_point_ar' => ['nullable', 'string'],
            'status' => ['required', 'in:draft,published,archived'],
            'images.*' => ['nullable', 'image', 'max:10240'],
        ]);

        $experience->update([
            'experience_category_id' => $validated['experience_category_id'],
            'location_id' => $validated['location_id'] ?? null,
            'title_en' => $validated['title_en'],
            'title_ar' => $validated['title_ar'] ?? null,
            'short_description_en' => $validated['short_description_en'] ?? null,
            'short_description_ar' => $validated['short_description_ar'] ?? null,
            'description_en' => $validated['description_en'] ?? null,
            'description_ar' => $validated['description_ar'] ?? null,
            'pricing_model' => $validated['pricing_model'],
            'base_price_cents' => (int) round($validated['base_price'] * 100),
            'max_capacity' => $validated['max_capacity'] ?? null,
            'duration' => $validated['duration'] ?? null,
            'payment_requirement' => $validated['payment_requirement'],
            'deposit_percentage' => $validated['deposit_percentage'] ?? null,
            'booking_mode' => $validated['booking_mode'],
            'cancellation_policy_en' => $validated['cancellation_policy_en'] ?? null,
            'cancellation_policy_ar' => $validated['cancellation_policy_ar'] ?? null,
            'what_to_bring_en' => $validated['what_to_bring_en'] ?? null,
            'what_to_bring_ar' => $validated['what_to_bring_ar'] ?? null,
            'meeting_point_en' => $validated['meeting_point_en'] ?? null,
            'meeting_point_ar' => $validated['meeting_point_ar'] ?? null,
            'status' => $validated['status'],
            'is_published' => $request->boolean('is_published'),
            'is_featured' => $request->boolean('is_featured'),
        ]);

        if ($request->hasFile('images')) {
            $hasFeatured = $experience->media()->where('is_featured', true)->exists();
            $first = ! $hasFeatured;
            foreach ($request->file('images') as $image) {
                $this->mediaService->uploadMedia(
                    $experience,
                    $image,
                    $first,
                    $experience->title_en,
                    $experience->title_ar
                );
                $first = false;
            }
        }

        return redirect()->route('admin.experiences.index')->with('success', "Experience '{$experience->title_en}' updated successfully!");
    }

    /**
     * Delete an experience.
     */
    public function destroy(Experience $experience): RedirectResponse
    {
        $title = $experience->title_en;
        $experience->delete();

        return redirect()->route('admin.experiences.index')->with('success', "Experience '{$title}' moved to archive.");
    }

    /**
     * Delete an attached media file.
     */
    public function deleteMedia(Experience $experience, Media $media): RedirectResponse
    {
        if ($media->mediable_id === $experience->id && $media->mediable_type === Experience::class) {
            $this->mediaService->deleteMedia($media);
            return back()->with('success', 'Media file removed successfully.');
        }

        abort(403);
    }
}
