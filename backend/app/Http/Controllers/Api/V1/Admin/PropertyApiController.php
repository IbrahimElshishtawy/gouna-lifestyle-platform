<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Amenity;
use App\Models\AvailabilityBlock;
use App\Models\Booking;
use App\Models\Location;
use App\Models\Property;
use App\Models\PropertyCategory;
use App\Models\SeasonalPrice;
use App\Services\LocationParserService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PropertyApiController extends Controller
{
    /**
     * Display a listing of all properties (both active and paused) for admin management.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Property::with(['category', 'location', 'images'])
            ->withCount('units')
            ->orderByDesc('created_at');

        // Filter top-level inventory vs units under parent
        if ($request->has('parent_id')) {
            $parentId = $request->query('parent_id');
            if ($parentId !== 'all') {
                $query->where('parent_id', (int) $parentId);
            }
        } else {
            $query->whereNull('parent_id');
        }

        // Type filter: rent or sale
        if ($type = $request->query('type')) {
            $query->where('listing_type', $type);
        }

        // Status filter: published (active), paused (hidden)
        if ($status = $request->query('status')) {
            if ($status === 'published' || $status === 'active') {
                $query->where('is_published', true);
            } elseif ($status === 'paused' || $status === 'hidden') {
                $query->where('is_published', false);
            }
        }

        // Search query
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title_en', 'like', "%{$search}%")
                    ->orWhere('title_ar', 'like', "%{$search}%")
                    ->orWhere('reference_number', 'like', "%{$search}%")
                    ->orWhere('compound', 'like', "%{$search}%");
            });
        }

        // Aggregate statistics for admin tabs
        $totalProperties = Property::whereNull('parent_id')->count();
        $publishedCount = Property::whereNull('parent_id')->where('is_published', true)->count();
        $pausedCount = Property::whereNull('parent_id')->where('is_published', false)->count();
        $rentCount = Property::whereNull('parent_id')->where('listing_type', 'rent')->count();
        $saleCount = Property::whereNull('parent_id')->where('listing_type', 'sale')->count();

        $paginator = $query->paginate(15);

        $items = collect($paginator->items())->map(function (Property $p) {
            $priceCents = $p->listing_type === 'sale'
                ? ($p->sale_price_cents ?? $p->base_price_cents)
                : $p->base_price_cents;
            $currency = $p->currency ?? 'EGP';
            $primaryImg = $p->images->first()?->url ?? '/assets/images/bg-sand-texture.jpg';

            return [
                'id' => $p->id,
                'parent_id' => $p->parent_id,
                'reference_number' => $p->reference_number,
                'unit_number' => $p->unit_number,
                'slug' => $p->slug,
                'title_en' => $p->title_en,
                'title_ar' => $p->title_ar,
                'listing_type' => $p->listing_type,
                'bedrooms' => $p->bedrooms,
                'bathrooms' => $p->bathrooms,
                'max_guests' => $p->max_guests,
                'area_sqm' => $p->area_sqm,
                'compound' => $p->compound,
                'view' => $p->view,
                'units_count' => (int) ($p->units_count ?? 0),
                'is_published' => (bool) $p->is_published,
                'is_available' => (bool) $p->is_available,
                'is_featured' => (bool) $p->is_featured,
                'status' => $p->is_published ? 'active' : 'paused',
                'base_price_cents' => (int) $p->base_price_cents,
                'sale_price_cents' => (int) $p->sale_price_cents,
                'currency' => $currency,
                'formatted_price' => number_format(((int) $priceCents) / 100, 2) . ' ' . $currency,
                'location' => [
                    'id' => $p->location?->id ?? 0,
                    'name_en' => $p->location?->name_en ?? 'El Gouna',
                    'name_ar' => $p->location?->name_ar ?? 'الجونة',
                ],
                'category' => [
                    'id' => $p->category?->id ?? 0,
                    'name_en' => $p->category?->name_en ?? 'Villa',
                    'name_ar' => $p->category?->name_ar ?? 'فيلا',
                ],
                'primary_image' => $primaryImg,
                'created_at' => $p->created_at ? $p->created_at->toIso8601String() : null,
                'updated_at' => $p->updated_at ? $p->updated_at->toIso8601String() : null,
            ];
        });

        return response()->json([
            'data' => $items,
            'summary' => [
                'total' => $totalProperties,
                'published' => $publishedCount,
                'paused' => $pausedCount,
                'rent' => $rentCount,
                'sale' => $saleCount,
            ],
            'links' => [
                'first' => $paginator->url(1),
                'last' => $paginator->url($paginator->lastPage()),
                'prev' => $paginator->previousPageUrl(),
                'next' => $paginator->nextPageUrl(),
            ],
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'from' => $paginator->firstItem(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'to' => $paginator->lastItem(),
                'total' => $paginator->total(),
                'request_id' => $request->attributes->get('request_id'),
                'timestamp' => now()->toIso8601String(),
            ],
        ]);
    }

    /**
     * Toggle the visibility (published / paused) of a unit or property.
     */
    public function toggleStatus(int $id, Request $request): JsonResponse
    {
        $property = Property::findOrFail($id);

        $newPublishedState = $request->has('is_published')
            ? (bool) $request->input('is_published')
            : !$property->is_published;

        $property->is_published = $newPublishedState;
        $property->status = $newPublishedState ? 'published' : 'draft';
        $property->save();

        ActivityLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'property_visibility_toggled',
            'entity_type' => 'Property',
            'entity_id' => $property->id,
            'description' => "Property [{$property->reference_number}] display status changed to " . ($newPublishedState ? 'ACTIVE' : 'PAUSED'),
            'new_values' => [
                'is_published' => $newPublishedState,
                'status' => $property->status,
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => $newPublishedState
                ? 'تم تفعيل عرض الوحدة بنجاح للمستخدمين.'
                : 'تم إيقاف عرض الوحدة بنجاح وتم إخفاؤها من الموقع.',
            'data' => [
                'id' => $property->id,
                'reference_number' => $property->reference_number,
                'is_published' => (bool) $property->is_published,
                'status' => $property->status,
            ],
        ]);
    }

    /**
     * Show single property details for admin with its full inventory relationships.
     */
    public function show(int $id): JsonResponse
    {
        $property = Property::with([
            'category',
            'location',
            'images',
            'amenities',
            'parent',
            'units' => function ($q) {
                $q->with(['category', 'images', 'availabilityBlocks', 'seasonalPrices'])->orderBy('title_en');
            },
            'seasonalPrices' => function ($q) {
                $q->orderBy('start_date');
            },
            'availabilityBlocks' => function ($q) {
                $q->orderBy('start_date');
            },
        ])->findOrFail($id);

        $recentBookings = Booking::with('customer')
            ->where('bookable_type', Property::class)
            ->where('bookable_id', $property->id)
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(function ($b) {
                return [
                    'id' => $b->id,
                    'reference' => $b->reference,
                    'customer_name' => $b->customer?->full_name ?? 'Guest User',
                    'check_in' => $b->check_in ? $b->check_in->toDateString() : '',
                    'check_out' => $b->check_out ? $b->check_out->toDateString() : '',
                    'nights' => $b->nights,
                    'guests' => $b->guests,
                    'total_cents' => (int) $b->total_cents,
                    'formatted_total' => number_format(((int) $b->total_cents) / 100, 2) . ' ' . ($b->currency ?? 'EGP'),
                    'status' => $b->status,
                    'payment_status' => $b->payment_status,
                ];
            });

        $totalBookingsCount = Booking::where('bookable_type', Property::class)
            ->where('bookable_id', $property->id)
            ->count();

        $totalRevenueCents = Booking::where('bookable_type', Property::class)
            ->where('bookable_id', $property->id)
            ->whereIn('payment_status', ['paid', 'partially_paid'])
            ->sum('amount_paid_cents');

        $recentActivity = ActivityLog::with('user')
            ->where('entity_type', 'Property')
            ->where('entity_id', $property->id)
            ->orderByDesc('created_at')
            ->limit(15)
            ->get()
            ->map(function ($act) {
                return [
                    'id' => $act->id,
                    'user_name' => $act->user?->name ?? 'Administrator',
                    'action' => $act->action,
                    'description' => $act->description,
                    'created_at' => $act->created_at ? $act->created_at->toIso8601String() : '',
                ];
            });

        $data = $property->toArray();
        $data['formatted_base_price'] = number_format(((int) $property->base_price_cents) / 100, 2) . ' ' . ($property->currency ?? 'EGP');
        $data['formatted_sale_price'] = $property->sale_price_cents ? number_format(((int) $property->sale_price_cents) / 100, 2) . ' ' . ($property->currency ?? 'EGP') : null;
        $data['recent_bookings'] = $recentBookings;
        $data['recent_activity'] = $recentActivity;
        $data['stats'] = [
            'total_bookings' => $totalBookingsCount,
            'total_revenue_cents' => (int) $totalRevenueCents,
            'formatted_revenue' => number_format(((int) $totalRevenueCents) / 100, 2) . ' ' . ($property->currency ?? 'EGP'),
            'seasonal_prices_count' => $property->seasonalPrices->count(),
            'availability_blocks_count' => $property->availabilityBlocks->count(),
            'units_count' => $property->units->count(),
        ];

        return response()->json([
            'data' => $data,
        ]);
    }

    /**
     * List all units belonging to a specific parent property.
     */
    public function listUnits(int $id): JsonResponse
    {
        $property = Property::findOrFail($id);

        $units = Property::with(['category', 'images', 'availabilityBlocks', 'seasonalPrices'])
            ->where('parent_id', $property->id)
            ->orderBy('title_en')
            ->get()
            ->map(function (Property $u) {
                return [
                    'id' => $u->id,
                    'parent_id' => $u->parent_id,
                    'reference_number' => $u->reference_number,
                    'unit_number' => $u->unit_number,
                    'title_en' => $u->title_en,
                    'title_ar' => $u->title_ar,
                    'slug' => $u->slug,
                    'listing_type' => $u->listing_type,
                    'view' => $u->view,
                    'floor' => $u->floor,
                    'building' => $u->building,
                    'bedrooms' => $u->bedrooms,
                    'bathrooms' => $u->bathrooms,
                    'max_guests' => $u->max_guests,
                    'area_sqm' => $u->area_sqm,
                    'base_price_cents' => (int) $u->base_price_cents,
                    'formatted_base_price' => number_format(((int) $u->base_price_cents) / 100, 2) . ' ' . ($u->currency ?? 'EGP'),
                    'currency' => $u->currency ?? 'EGP',
                    'min_stay_nights' => $u->min_stay_nights ?? 1,
                    'is_published' => (bool) $u->is_published,
                    'is_available' => (bool) $u->is_available,
                    'status' => $u->is_published ? 'active' : 'paused',
                    'category' => [
                        'id' => $u->category?->id ?? 0,
                        'name_en' => $u->category?->name_en ?? 'Villa',
                        'name_ar' => $u->category?->name_ar ?? 'فيلا',
                    ],
                    'primary_image' => $u->images->first()?->url ?? '/assets/images/bg-sand-texture.jpg',
                ];
            });

        return response()->json([
            'property' => [
                'id' => $property->id,
                'reference_number' => $property->reference_number,
                'title_en' => $property->title_en,
                'title_ar' => $property->title_ar,
            ],
            'data' => $units,
        ]);
    }

    /**
     * Store a new unit inside a parent property.
     */
    public function storeUnit(int $id, Request $request): JsonResponse
    {
        $property = Property::findOrFail($id);

        $validated = $request->validate([
            'unit_number' => ['nullable', 'string', 'max:100'],
            'title_en' => ['required', 'string', 'max:255'],
            'title_ar' => ['nullable', 'string', 'max:255'],
            'property_category_id' => ['nullable', 'exists:property_categories,id'],
            'listing_type' => ['nullable', 'string', 'in:rent,sale,both'],
            'bedrooms' => ['required', 'integer', 'min:0'],
            'bathrooms' => ['required', 'integer', 'min:0'],
            'max_guests' => ['required', 'integer', 'min:1'],
            'area_sqm' => ['nullable', 'numeric', 'min:0'],
            'floor' => ['nullable', 'integer'],
            'building' => ['nullable', 'string', 'max:100'],
            'view' => ['nullable', 'string', 'max:150'],
            'base_price_cents' => ['nullable', 'integer', 'min:0'],
            'cleaning_fee_cents' => ['nullable', 'integer', 'min:0'],
            'service_fee_cents' => ['nullable', 'integer', 'min:0'],
            'min_stay_nights' => ['nullable', 'integer', 'min:1'],
            'max_stay_nights' => ['nullable', 'integer', 'min:1'],
            'description_en' => ['nullable', 'string'],
            'description_ar' => ['nullable', 'string'],
            'is_published' => ['nullable', 'boolean'],
            'is_available' => ['nullable', 'boolean'],
            'status' => ['nullable', 'in:draft,published,archived'],
            'amenity_ids' => ['nullable', 'array'],
            'amenity_ids.*' => ['exists:amenities,id'],
        ]);

        $baseSlug = Str::slug($property->slug . '-' . ($validated['unit_number'] ?? $validated['title_en']));
        $slug = $baseSlug;
        $count = 1;
        while (Property::where('slug', $slug)->exists()) {
            $slug = "{$baseSlug}-{$count}";
            $count++;
        }

        $ref = $property->reference_number . '-U' . strtoupper(Str::random(4));
        while (Property::where('reference_number', $ref)->exists()) {
            $ref = $property->reference_number . '-U' . strtoupper(Str::random(4));
        }

        $amenityIds = $validated['amenity_ids'] ?? [];
        unset($validated['amenity_ids']);

        $unit = Property::create(array_merge($validated, [
            'parent_id' => $property->id,
            'slug' => $slug,
            'reference_number' => $ref,
            'property_category_id' => $validated['property_category_id'] ?? $property->property_category_id,
            'location_id' => $property->location_id,
            'compound' => $property->compound,
            'address' => $property->address,
            'latitude' => $property->latitude,
            'longitude' => $property->longitude,
            'map_url' => $property->map_url,
            'currency' => $property->currency ?? 'EGP',
            'listing_type' => $validated['listing_type'] ?? $property->listing_type ?? 'rent',
            'base_price_cents' => $validated['base_price_cents'] ?? $property->base_price_cents,
            'is_published' => $validated['is_published'] ?? true,
            'is_available' => $validated['is_available'] ?? true,
            'status' => $validated['status'] ?? 'published',
        ]));

        if (!empty($amenityIds)) {
            $unit->amenities()->sync($amenityIds);
        }

        ActivityLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'unit_created',
            'entity_type' => 'Property',
            'entity_id' => $unit->id,
            'description' => "Unit [{$unit->reference_number}] added to property [{$property->reference_number}].",
            'new_values' => $unit->toArray(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم إنشاء الوحدة بنجاح.',
            'data' => $unit->load(['category', 'amenities']),
        ], 201);
    }

    /**
     * Show single unit details inside a parent property.
     */
    public function showUnit(int $id, int $unitId): JsonResponse
    {
        $property = Property::findOrFail($id);
        $unit = Property::with([
            'category',
            'images',
            'amenities',
            'parent',
            'seasonalPrices' => function ($q) {
                $q->orderBy('start_date');
            },
            'availabilityBlocks' => function ($q) {
                $q->orderBy('start_date');
            },
        ])->where('parent_id', $property->id)->findOrFail($unitId);

        $recentBookings = Booking::with('customer')
            ->where('bookable_type', Property::class)
            ->where('bookable_id', $unit->id)
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(function ($b) {
                return [
                    'id' => $b->id,
                    'reference' => $b->reference,
                    'customer_name' => $b->customer?->full_name ?? 'Guest User',
                    'check_in' => $b->check_in ? $b->check_in->toDateString() : '',
                    'check_out' => $b->check_out ? $b->check_out->toDateString() : '',
                    'nights' => $b->nights,
                    'guests' => $b->guests,
                    'total_cents' => (int) $b->total_cents,
                    'formatted_total' => number_format(((int) $b->total_cents) / 100, 2) . ' ' . ($b->currency ?? 'EGP'),
                    'status' => $b->status,
                    'payment_status' => $b->payment_status,
                ];
            });

        $recentActivity = ActivityLog::with('user')
            ->where('entity_type', 'Property')
            ->where('entity_id', $unit->id)
            ->orderByDesc('created_at')
            ->limit(15)
            ->get()
            ->map(function ($act) {
                return [
                    'id' => $act->id,
                    'user_name' => $act->user?->name ?? 'Administrator',
                    'action' => $act->action,
                    'description' => $act->description,
                    'created_at' => $act->created_at ? $act->created_at->toIso8601String() : '',
                ];
            });

        $data = $unit->toArray();
        $data['formatted_base_price'] = number_format(((int) $unit->base_price_cents) / 100, 2) . ' ' . ($unit->currency ?? 'EGP');
        $data['recent_bookings'] = $recentBookings;
        $data['recent_activity'] = $recentActivity;

        return response()->json([
            'data' => $data,
            'parent_property' => [
                'id' => $property->id,
                'title_en' => $property->title_en,
                'title_ar' => $property->title_ar,
                'reference_number' => $property->reference_number,
            ],
        ]);
    }

    /**
     * Update unit details.
     */
    public function updateUnit(int $id, int $unitId, Request $request): JsonResponse
    {
        $property = Property::findOrFail($id);
        $unit = Property::where('parent_id', $property->id)->findOrFail($unitId);

        $validated = $request->validate([
            'unit_number' => ['nullable', 'string', 'max:100'],
            'title_en' => ['nullable', 'string', 'max:255'],
            'title_ar' => ['nullable', 'string', 'max:255'],
            'property_category_id' => ['nullable', 'exists:property_categories,id'],
            'bedrooms' => ['nullable', 'integer', 'min:0'],
            'bathrooms' => ['nullable', 'integer', 'min:0'],
            'max_guests' => ['nullable', 'integer', 'min:1'],
            'area_sqm' => ['nullable', 'numeric', 'min:0'],
            'floor' => ['nullable', 'integer'],
            'building' => ['nullable', 'string', 'max:100'],
            'view' => ['nullable', 'string', 'max:150'],
            'base_price_cents' => ['nullable', 'integer', 'min:0'],
            'cleaning_fee_cents' => ['nullable', 'integer', 'min:0'],
            'service_fee_cents' => ['nullable', 'integer', 'min:0'],
            'min_stay_nights' => ['nullable', 'integer', 'min:1'],
            'description_en' => ['nullable', 'string'],
            'description_ar' => ['nullable', 'string'],
            'is_published' => ['nullable', 'boolean'],
            'is_available' => ['nullable', 'boolean'],
            'status' => ['nullable', 'in:draft,published,archived'],
            'amenity_ids' => ['nullable', 'array'],
            'amenity_ids.*' => ['exists:amenities,id'],
        ]);

        $amenityIds = $validated['amenity_ids'] ?? null;
        unset($validated['amenity_ids']);

        $unit->update($validated);

        if (is_array($amenityIds)) {
            $unit->amenities()->sync($amenityIds);
        }

        ActivityLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'unit_updated',
            'entity_type' => 'Property',
            'entity_id' => $unit->id,
            'description' => "Unit [{$unit->reference_number}] details updated by admin.",
            'new_values' => $validated,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث بيانات الوحدة بنجاح.',
            'data' => $unit->fresh(['category', 'amenities']),
        ]);
    }

    /**
     * Delete unit.
     */
    public function deleteUnit(int $id, int $unitId, Request $request): JsonResponse
    {
        $property = Property::findOrFail($id);
        $unit = Property::where('parent_id', $property->id)->findOrFail($unitId);

        $hasActiveBookings = Booking::where('bookable_type', Property::class)
            ->where('bookable_id', $unit->id)
            ->whereIn('status', ['confirmed', 'paid'])
            ->whereDate('check_out', '>=', now()->toDateString())
            ->exists();

        if ($hasActiveBookings) {
            return response()->json([
                'success' => false,
                'message' => 'لا يمكن حذف هذه الوحدة لوجود حجوزات نشطة عليها.',
            ], 422);
        }

        $ref = $unit->reference_number;
        $unit->delete();

        ActivityLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'unit_deleted',
            'entity_type' => 'Property',
            'entity_id' => $unitId,
            'description' => "Unit [{$ref}] deleted from property [{$property->reference_number}].",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم حذف الوحدة بنجاح.',
        ]);
    }

    /**
     * Create a new property / unit inventory item.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title_en' => ['required', 'string', 'max:255'],
            'title_ar' => ['nullable', 'string', 'max:255'],
            'property_category_id' => ['nullable', 'exists:property_categories,id'],
            'location_id' => ['nullable', 'exists:locations,id'],
            'listing_type' => ['required', 'string', 'in:rent,sale,both'],
            'compound' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'map_url' => ['nullable', 'string', 'max:1000'],
            'bedrooms' => ['required', 'integer', 'min:0'],
            'bathrooms' => ['required', 'integer', 'min:0'],
            'max_guests' => ['required', 'integer', 'min:1'],
            'area_sqm' => ['nullable', 'numeric', 'min:0'],
            'floor' => ['nullable', 'integer'],
            'building' => ['nullable', 'string', 'max:100'],
            'min_stay_nights' => ['nullable', 'integer', 'min:1'],
            'max_stay_nights' => ['nullable', 'integer', 'min:1'],
            'check_in_time' => ['nullable', 'string'],
            'check_out_time' => ['nullable', 'string'],
            'base_price_cents' => ['nullable', 'integer', 'min:0'],
            'sale_price_cents' => ['nullable', 'integer', 'min:0'],
            'currency' => ['nullable', 'string', 'size:3'],
            'cleaning_fee_cents' => ['nullable', 'integer', 'min:0'],
            'service_fee_cents' => ['nullable', 'integer', 'min:0'],
            'tax_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'is_published' => ['nullable', 'boolean'],
            'is_featured' => ['nullable', 'boolean'],
            'is_available' => ['nullable', 'boolean'],
            'status' => ['nullable', 'in:draft,published,archived'],
            'description_en' => ['nullable', 'string'],
            'description_ar' => ['nullable', 'string'],
            'short_description_en' => ['nullable', 'string'],
            'short_description_ar' => ['nullable', 'string'],
            'house_rules_en' => ['nullable', 'string'],
            'house_rules_ar' => ['nullable', 'string'],
            'amenity_ids' => ['nullable', 'array'],
            'amenity_ids.*' => ['exists:amenities,id'],
        ]);

        $baseSlug = Str::slug($validated['title_en'] ?? 'property');
        $slug = $baseSlug;
        $count = 1;
        while (Property::where('slug', $slug)->exists()) {
            $slug = "{$baseSlug}-{$count}";
            $count++;
        }

        $refPrefix = match($validated['listing_type'] ?? 'rent') {
            'sale' => 'GON-S-',
            default => 'GON-V-',
        };
        $reference = $refPrefix . strtoupper(Str::random(6));
        while (Property::where('reference_number', $reference)->exists()) {
            $reference = $refPrefix . strtoupper(Str::random(6));
        }

        $isPublished = (bool) ($validated['is_published'] ?? false);
        $status = $validated['status'] ?? ($isPublished ? 'published' : 'draft');

        $amenityIds = $validated['amenity_ids'] ?? [];
        unset($validated['amenity_ids']);

        $property = Property::create(array_merge($validated, [
            'slug' => $slug,
            'reference_number' => $reference,
            'status' => $status,
            'currency' => $validated['currency'] ?? 'EGP',
            'is_published' => $isPublished,
            'is_available' => $validated['is_available'] ?? true,
            'is_featured' => $validated['is_featured'] ?? false,
        ]));

        if (!empty($amenityIds)) {
            $property->amenities()->sync($amenityIds);
        }

        ActivityLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'property_created',
            'entity_type' => 'Property',
            'entity_id' => $property->id,
            'description' => "Property [{$property->reference_number}] created by admin.",
            'new_values' => $property->toArray(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم إنشاء العقار بنجاح.',
            'data' => $property->load(['category', 'location', 'amenities']),
        ], 201);
    }

    /**
     * Update property details.
     */
    public function update(int $id, Request $request): JsonResponse
    {
        $property = Property::findOrFail($id);

        $validated = $request->validate([
            'title_en' => ['nullable', 'string', 'max:255'],
            'title_ar' => ['nullable', 'string', 'max:255'],
            'property_category_id' => ['nullable', 'exists:property_categories,id'],
            'location_id' => ['nullable', 'exists:locations,id'],
            'listing_type' => ['nullable', 'string', 'in:rent,sale,both'],
            'compound' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'map_url' => ['nullable', 'string', 'max:1000'],
            'bedrooms' => ['nullable', 'integer', 'min:0'],
            'bathrooms' => ['nullable', 'integer', 'min:0'],
            'max_guests' => ['nullable', 'integer', 'min:1'],
            'area_sqm' => ['nullable', 'numeric', 'min:0'],
            'floor' => ['nullable', 'integer'],
            'building' => ['nullable', 'string', 'max:100'],
            'min_stay_nights' => ['nullable', 'integer', 'min:1'],
            'max_stay_nights' => ['nullable', 'integer', 'min:1'],
            'check_in_time' => ['nullable', 'string'],
            'check_out_time' => ['nullable', 'string'],
            'base_price_cents' => ['nullable', 'integer', 'min:0'],
            'sale_price_cents' => ['nullable', 'integer', 'min:0'],
            'currency' => ['nullable', 'string', 'size:3'],
            'cleaning_fee_cents' => ['nullable', 'integer', 'min:0'],
            'service_fee_cents' => ['nullable', 'integer', 'min:0'],
            'tax_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'is_published' => ['nullable', 'boolean'],
            'is_featured' => ['nullable', 'boolean'],
            'is_available' => ['nullable', 'boolean'],
            'status' => ['nullable', 'in:draft,published,archived'],
            'description_en' => ['nullable', 'string'],
            'description_ar' => ['nullable', 'string'],
            'short_description_en' => ['nullable', 'string'],
            'short_description_ar' => ['nullable', 'string'],
            'house_rules_en' => ['nullable', 'string'],
            'house_rules_ar' => ['nullable', 'string'],
            'amenity_ids' => ['nullable', 'array'],
            'amenity_ids.*' => ['exists:amenities,id'],
        ]);

        $amenityIds = $validated['amenity_ids'] ?? null;
        unset($validated['amenity_ids']);

        $property->update($validated);

        if (is_array($amenityIds)) {
            $property->amenities()->sync($amenityIds);
        }

        ActivityLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'property_updated',
            'entity_type' => 'Property',
            'entity_id' => $property->id,
            'description' => "Property [{$property->reference_number}] details updated by admin.",
            'new_values' => $validated,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث بيانات العقار بنجاح.',
            'data' => $property->fresh(['category', 'location', 'amenities']),
        ]);
    }

    /**
     * Delete or archive a property.
     */
    public function destroy(int $id, Request $request): JsonResponse
    {
        $property = Property::findOrFail($id);

        $hasActiveBookings = Booking::where('bookable_type', Property::class)
            ->where('bookable_id', $property->id)
            ->whereIn('status', ['confirmed', 'paid'])
            ->whereDate('check_out', '>=', now()->toDateString())
            ->exists();

        if ($hasActiveBookings) {
            return response()->json([
                'success' => false,
                'message' => 'لا يمكن حذف هذا العقار لوجود حجوزات نشطة أو مؤكدة حالياً عليه.',
            ], 422);
        }

        $propertyRef = $property->reference_number;
        $property->update(['status' => 'archived', 'is_published' => false, 'is_available' => false]);
        $property->delete();

        ActivityLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'property_archived',
            'entity_type' => 'Property',
            'entity_id' => $id,
            'description' => "Property [{$propertyRef}] was archived/deleted by admin.",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم أرشفة العقار بنجاح.',
        ]);
    }

    /**
     * Parse and normalize location coordinates from input URL or coordinates.
     */
    public function parseLocation(Request $request, LocationParserService $parser): JsonResponse
    {
        $input = $request->input('url') ?? $request->input('location') ?? $request->input('query');

        if (empty($input)) {
            return response()->json([
                'success' => false,
                'message' => 'Please provide a Google Maps URL or coordinates string.',
            ], 422);
        }

        $result = $parser->parse((string) $input);

        return response()->json($result, $result['success'] ? 200 : 422);
    }

    /**
     * Unified availability calendar data for a property (Booked intervals + Blocked intervals).
     */
    public function availabilityCalendar(int $id, Request $request): JsonResponse
    {
        $property = Property::findOrFail($id);
        $year = (int) $request->query('year', now()->year);

        $startDate = Carbon::createFromDate($year, 1, 1)->startOfYear()->toDateString();
        $endDate = Carbon::createFromDate($year, 12, 31)->endOfYear()->toDateString();

        // 1. Confirmed / In-progress Bookings occupying inventory
        $bookings = Booking::with('customer')
            ->where('bookable_type', Property::class)
            ->where('bookable_id', $property->id)
            ->whereIn('status', ['confirmed', 'paid', 'pending', 'completed'])
            ->where(function ($q) use ($startDate, $endDate) {
                $q->whereBetween('check_in', [$startDate, $endDate])
                    ->orWhereBetween('check_out', [$startDate, $endDate])
                    ->orWhere(function ($sub) use ($startDate, $endDate) {
                        $sub->where('check_in', '<=', $startDate)
                            ->where('check_out', '>=', $endDate);
                    });
            })
            ->get()
            ->map(function ($b) {
                return [
                    'id' => $b->id,
                    'reference' => $b->reference,
                    'guest_name' => $b->customer?->full_name ?? 'Guest User',
                    'start_date' => $b->check_in ? $b->check_in->toDateString() : '',
                    'end_date' => $b->check_out ? $b->check_out->toDateString() : '',
                    'status' => $b->status,
                    'type' => 'booking',
                ];
            });

        // 2. Administrative availability blocks (maintenance, owner use, blocked)
        $blocks = AvailabilityBlock::where('property_id', $property->id)
            ->where(function ($q) use ($startDate, $endDate) {
                $q->whereBetween('start_date', [$startDate, $endDate])
                    ->orWhereBetween('end_date', [$startDate, $endDate])
                    ->orWhere(function ($sub) use ($startDate, $endDate) {
                        $sub->where('start_date', '<=', $startDate)
                            ->where('end_date', '>=', $endDate);
                    });
            })
            ->get()
            ->map(function ($ab) {
                return [
                    'id' => $ab->id,
                    'start_date' => $ab->start_date ? $ab->start_date->toDateString() : '',
                    'end_date' => $ab->end_date ? $ab->end_date->toDateString() : '',
                    'status' => $ab->status,
                    'reason' => $ab->reason,
                    'type' => 'block',
                ];
            });

        // 3. Seasonal pricing periods
        $seasons = SeasonalPrice::where('property_id', $property->id)
            ->where('is_active', true)
            ->where(function ($q) use ($startDate, $endDate) {
                $q->whereBetween('start_date', [$startDate, $endDate])
                    ->orWhereBetween('end_date', [$startDate, $endDate]);
            })
            ->get()
            ->map(function ($sp) {
                return [
                    'id' => $sp->id,
                    'name_en' => $sp->name_en,
                    'name_ar' => $sp->name_ar,
                    'start_date' => $sp->start_date ? $sp->start_date->toDateString() : '',
                    'end_date' => $sp->end_date ? $sp->end_date->toDateString() : '',
                    'price_cents' => (int) $sp->price_cents,
                    'formatted_price' => number_format(((int) $sp->price_cents) / 100, 2) . ' EGP',
                    'priority' => (int) $sp->priority,
                ];
            });

        return response()->json([
            'property_id' => $property->id,
            'reference_number' => $property->reference_number,
            'year' => $year,
            'base_price_cents' => (int) $property->base_price_cents,
            'booked_ranges' => $bookings,
            'blocked_ranges' => $blocks,
            'seasonal_prices' => $seasons,
        ]);
    }

    /**
     * Add an administrative availability block (Maintenance, Owner Use, Closed).
     */
    public function addAvailabilityBlock(int $id, Request $request): JsonResponse
    {
        $property = Property::findOrFail($id);

        $request->validate([
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'status' => ['required', 'string', 'in:blocked,maintenance,owner_use'],
            'reason' => ['nullable', 'string', 'max:255'],
        ]);

        $startDate = Carbon::parse($request->input('start_date'))->toDateString();
        $endDate = Carbon::parse($request->input('end_date'))->toDateString();

        // Validate conflict with confirmed bookings
        $hasConflict = Booking::where('bookable_type', Property::class)
            ->where('bookable_id', $property->id)
            ->whereIn('status', ['confirmed', 'paid'])
            ->where(function ($q) use ($startDate, $endDate) {
                $q->whereBetween('check_in', [$startDate, $endDate])
                    ->orWhereBetween('check_out', [$startDate, $endDate])
                    ->orWhere(function ($sub) use ($startDate, $endDate) {
                        $sub->where('check_in', '<=', $startDate)
                            ->where('check_out', '>=', $endDate);
                    });
            })
            ->exists();

        if ($hasConflict) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot block these dates: Conflicting confirmed reservation exists within the requested date range.',
            ], 422);
        }

        $block = AvailabilityBlock::create([
            'property_id' => $property->id,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'status' => $request->input('status', 'blocked'),
            'reason' => $request->input('reason'),
            'created_by' => $request->user()?->id,
        ]);

        ActivityLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'availability_blocked',
            'entity_type' => 'Property',
            'entity_id' => $property->id,
            'description' => "Availability blocked for [{$property->reference_number}] from {$startDate} to {$endDate}. Reason: {$block->reason}",
            'new_values' => $block->toArray(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Availability block created successfully.',
            'data' => $block,
        ]);
    }

    /**
     * Remove an administrative availability block.
     */
    public function removeAvailabilityBlock(int $id, int $blockId, Request $request): JsonResponse
    {
        $property = Property::findOrFail($id);
        $block = AvailabilityBlock::where('property_id', $property->id)->findOrFail($blockId);

        $oldValues = $block->toArray();
        $block->delete();

        ActivityLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'availability_unblocked',
            'entity_type' => 'Property',
            'entity_id' => $property->id,
            'description' => "Availability unblocked for [{$property->reference_number}] between {$oldValues['start_date']} and {$oldValues['end_date']}.",
            'old_values' => $oldValues,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Availability block removed successfully.',
        ]);
    }

    /**
     * Add a seasonal price rule to a property.
     */
    public function addSeasonalPrice(int $id, Request $request): JsonResponse
    {
        $property = Property::findOrFail($id);

        $validated = $request->validate([
            'name_en' => ['required', 'string', 'max:255'],
            'name_ar' => ['nullable', 'string', 'max:255'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'price_cents' => ['required', 'integer', 'min:0'],
            'priority' => ['nullable', 'integer', 'min:1'],
            'min_stay_nights' => ['nullable', 'integer', 'min:1'],
            'notes' => ['nullable', 'string'],
        ]);

        $season = SeasonalPrice::create(array_merge($validated, [
            'property_id' => $property->id,
            'is_active' => true,
        ]));

        ActivityLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'seasonal_price_added',
            'entity_type' => 'Property',
            'entity_id' => $property->id,
            'description' => "Seasonal price rule [{$season->name_en}] added to property [{$property->reference_number}]. Rate: " . number_format($season->price_cents / 100, 2) . " EGP/night.",
            'new_values' => $season->toArray(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Seasonal price rule added successfully.',
            'data' => $season,
        ]);
    }

    /**
     * Remove a seasonal price rule from a property.
     */
    public function removeSeasonalPrice(int $id, int $seasonId, Request $request): JsonResponse
    {
        $property = Property::findOrFail($id);
        $season = SeasonalPrice::where('property_id', $property->id)->findOrFail($seasonId);

        $oldValues = $season->toArray();
        $season->delete();

        ActivityLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'seasonal_price_removed',
            'entity_type' => 'Property',
            'entity_id' => $property->id,
            'description' => "Seasonal price rule [{$oldValues['name_en']}] removed from property [{$property->reference_number}].",
            'old_values' => $oldValues,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Seasonal price rule removed successfully.',
        ]);
    }

    /**
     * Get taxonomy options for properties (Categories, Locations, Amenities).
     */
    public function taxonomies(): JsonResponse
    {
        $categories = PropertyCategory::orderBy('name_en')->get(['id', 'name_en', 'name_ar', 'slug']);
        $locations = Location::orderBy('name_en')->get(['id', 'name_en', 'name_ar', 'slug']);
        $amenities = Amenity::orderBy('name_en')->get(['id', 'name_en', 'name_ar', 'group', 'icon']);

        return response()->json([
            'categories' => $categories,
            'locations' => $locations,
            'amenities' => $amenities,
        ]);
    }
}
