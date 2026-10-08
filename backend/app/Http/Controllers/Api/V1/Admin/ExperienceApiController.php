<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Experience;
use App\Models\ExperienceCategory;
use App\Models\Location;
use App\Models\Media;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ExperienceApiController extends Controller
{
    /**
     * Display a listing of experiences for administration.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Experience::with(['category', 'location', 'media'])->latest();

        if ($search = $request->input('q')) {
            $query->where(function ($q) use ($search) {
                $q->where('title_en', 'like', "%{$search}%")
                    ->orWhere('title_ar', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category_id')) {
            $query->where('experience_category_id', $request->input('category_id'));
        }

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        $perPage = (int) $request->input('per_page', 25);
        $experiences = $query->paginate($perPage);

        $categories = ExperienceCategory::active()->orderBy('sort_order')->get();
        $locations = Location::all(['id', 'name_en', 'name_ar', 'slug']);

        return response()->json([
            'data' => $experiences->items(),
            'meta' => [
                'current_page' => $experiences->currentPage(),
                'last_page' => $experiences->lastPage(),
                'per_page' => $experiences->perPage(),
                'total' => $experiences->total(),
            ],
            'categories' => $categories,
            'locations' => $locations,
        ]);
    }

    /**
     * Get taxonomies required for experience creation/editing.
     */
    public function taxonomies(): JsonResponse
    {
        return response()->json([
            'categories' => ExperienceCategory::active()->orderBy('sort_order')->get(),
            'locations' => Location::all(['id', 'name_en', 'name_ar', 'slug']),
        ]);
    }

    /**
     * Store a newly created experience.
     */
    public function store(Request $request): JsonResponse
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
            'pricing_model' => ['nullable', 'in:per_person,per_group,per_vehicle,per_day,per_hour,fixed'],
            'base_price' => ['nullable', 'numeric', 'min:0'],
            'base_price_cents' => ['nullable', 'integer', 'min:0'],
            'max_capacity' => ['nullable', 'integer', 'min:1'],
            'duration' => ['nullable', 'string', 'max:255'],
            'meeting_point_en' => ['nullable', 'string', 'max:255'],
            'meeting_point_ar' => ['nullable', 'string', 'max:255'],
            'what_to_bring_en' => ['nullable', 'string'],
            'what_to_bring_ar' => ['nullable', 'string'],
            'cancellation_policy_en' => ['nullable', 'string'],
            'cancellation_policy_ar' => ['nullable', 'string'],
            'image_url' => ['nullable', 'string', 'max:1000'],
            'status' => ['nullable', 'in:draft,published,archived'],
            'is_published' => ['nullable', 'boolean'],
            'is_featured' => ['nullable', 'boolean'],
        ]);

        $baseSlug = Str::slug($validated['title_en']);
        $slug = $baseSlug;
        $counter = 1;
        while (Experience::withTrashed()->where('slug', $slug)->exists()) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        $basePriceCents = isset($validated['base_price_cents'])
            ? (int) $validated['base_price_cents']
            : (int) round(((float) ($validated['base_price'] ?? 0)) * 100);

        $isPublished = (bool) ($validated['is_published'] ?? ($validated['status'] === 'published'));
        $status = $validated['status'] ?? ($isPublished ? 'published' : 'draft');

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
            'pricing_model' => $validated['pricing_model'] ?? 'per_group',
            'base_price_cents' => $basePriceCents,
            'currency' => 'EGP',
            'max_capacity' => $validated['max_capacity'] ?? 10,
            'duration' => $validated['duration'] ?? 'Full Day',
            'payment_requirement' => 'both',
            'deposit_percentage' => 30.00,
            'booking_mode' => 'instant',
            'cancellation_policy_en' => $validated['cancellation_policy_en'] ?? 'Full refund up to 48 hours prior to departure.',
            'cancellation_policy_ar' => $validated['cancellation_policy_ar'] ?? 'استرداد كامل حتى 48 ساعة قبل موعد الانطلاق.',
            'what_to_bring_en' => $validated['what_to_bring_en'] ?? 'Swimwear, sunglasses, sunscreen.',
            'what_to_bring_ar' => $validated['what_to_bring_ar'] ?? 'ملابس بحر، نظارات شمسية، واقي شمس.',
            'meeting_point_en' => $validated['meeting_point_en'] ?? 'Abu Tig Marina, El Gouna',
            'meeting_point_ar' => $validated['meeting_point_ar'] ?? 'مارينا أبو تيج، الجونة',
            'status' => $status,
            'is_published' => $isPublished,
            'is_featured' => (bool) ($validated['is_featured'] ?? false),
        ]);

        if (!empty($validated['image_url'])) {
            Media::create([
                'mediable_type' => Experience::class,
                'mediable_id' => $experience->id,
                'file_path' => $validated['image_url'],
                'file_type' => 'image',
                'is_primary' => true,
                'is_featured' => true,
                'sort_order' => 1,
            ]);
        }

        ActivityLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'experience_created',
            'entity_type' => 'Experience',
            'entity_id' => $experience->id,
            'description' => "Created experience/yacht [{$experience->title_en}] with status [{$experience->status}].",
            'new_values' => $experience->toArray(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم إنشاء التجربة بنجاح.',
            'data' => $experience->load(['category', 'location', 'media']),
        ], 201);
    }

    /**
     * Show a single experience.
     */
    public function show(int $id): JsonResponse
    {
        $experience = Experience::with(['category', 'location', 'media'])->findOrFail($id);

        return response()->json([
            'data' => $experience,
        ]);
    }

    /**
     * Update an existing experience.
     */
    public function update(int $id, Request $request): JsonResponse
    {
        $experience = Experience::findOrFail($id);

        $validated = $request->validate([
            'title_en' => ['sometimes', 'required', 'string', 'max:255'],
            'title_ar' => ['nullable', 'string', 'max:255'],
            'experience_category_id' => ['sometimes', 'required', 'exists:experience_categories,id'],
            'location_id' => ['nullable', 'exists:locations,id'],
            'short_description_en' => ['nullable', 'string'],
            'short_description_ar' => ['nullable', 'string'],
            'description_en' => ['nullable', 'string'],
            'description_ar' => ['nullable', 'string'],
            'pricing_model' => ['nullable', 'in:per_person,per_group,per_vehicle,per_day,per_hour,fixed'],
            'base_price' => ['nullable', 'numeric', 'min:0'],
            'base_price_cents' => ['nullable', 'integer', 'min:0'],
            'max_capacity' => ['nullable', 'integer', 'min:1'],
            'duration' => ['nullable', 'string', 'max:255'],
            'meeting_point_en' => ['nullable', 'string', 'max:255'],
            'meeting_point_ar' => ['nullable', 'string', 'max:255'],
            'what_to_bring_en' => ['nullable', 'string'],
            'what_to_bring_ar' => ['nullable', 'string'],
            'cancellation_policy_en' => ['nullable', 'string'],
            'cancellation_policy_ar' => ['nullable', 'string'],
            'image_url' => ['nullable', 'string', 'max:1000'],
            'status' => ['nullable', 'in:draft,published,archived'],
            'is_published' => ['nullable', 'boolean'],
            'is_featured' => ['nullable', 'boolean'],
        ]);

        if (isset($validated['base_price']) && !isset($validated['base_price_cents'])) {
            $validated['base_price_cents'] = (int) round(((float) $validated['base_price']) * 100);
        }
        unset($validated['base_price']);

        if (isset($validated['is_published'])) {
            $validated['status'] = $validated['is_published'] ? 'published' : 'draft';
        }

        $imageUrl = $validated['image_url'] ?? null;
        unset($validated['image_url']);

        $experience->update($validated);

        if (!empty($imageUrl)) {
            Media::updateOrCreate(
                [
                    'mediable_type' => Experience::class,
                    'mediable_id' => $experience->id,
                    'is_primary' => true,
                ],
                [
                    'file_path' => $imageUrl,
                    'file_type' => 'image',
                    'is_featured' => true,
                    'sort_order' => 1,
                ]
            );
        }

        ActivityLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'experience_updated',
            'entity_type' => 'Experience',
            'entity_id' => $experience->id,
            'description' => "Updated experience/yacht [{$experience->title_en}].",
            'new_values' => $experience->toArray(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث التجربة بنجاح.',
            'data' => $experience->load(['category', 'location', 'media']),
        ]);
    }

    /**
     * Toggle status between published and draft.
     */
    public function toggleStatus(int $id, Request $request): JsonResponse
    {
        $experience = Experience::findOrFail($id);

        $newPublished = !$experience->is_published;
        $experience->update([
            'is_published' => $newPublished,
            'status' => $newPublished ? 'published' : 'draft',
        ]);

        ActivityLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'experience_status_toggled',
            'entity_type' => 'Experience',
            'entity_id' => $experience->id,
            'description' => "Toggled status of experience [{$experience->title_en}] to [{$experience->status}].",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => $newPublished ? 'تم تفعيل ونشر التجربة بنجاح.' : 'تم تحويل التجربة إلى مسودة (غير منشورة).',
            'data' => $experience,
        ]);
    }

    /**
     * Soft delete an experience.
     */
    public function destroy(int $id, Request $request): JsonResponse
    {
        $experience = Experience::findOrFail($id);
        $title = $experience->title_en;
        $experience->delete();

        ActivityLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'experience_deleted',
            'entity_type' => 'Experience',
            'entity_id' => $id,
            'description' => "Archived/deleted experience [{$title}].",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "تم حذف/أرشفة التجربة '{$title}' بنجاح.",
        ]);
    }
}
