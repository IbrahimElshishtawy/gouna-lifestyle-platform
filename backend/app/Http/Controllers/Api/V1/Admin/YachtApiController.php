<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Addon;
use App\Models\Booking;
use App\Models\Location;
use App\Models\Yacht;
use App\Models\YachtAvailabilityBlock;
use App\Models\YachtPackage;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class YachtApiController extends Controller
{
    /**
     * List all yachts with search, filtering and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Yacht::with(['location', 'packages', 'availabilityBlocks'])
            ->withCount(['packages', 'availabilityBlocks', 'bookings']);

        if ($request->filled('q')) {
            $q = trim($request->input('q'));
            $query->where(function ($b) use ($q) {
                $b->where('name_en', 'like', "%{$q}%")
                    ->orWhere('name_ar', 'like', "%{$q}%")
                    ->orWhere('brand', 'like', "%{$q}%")
                    ->orWhere('model', 'like', "%{$q}%")
                    ->orWhere('marina_berth', 'like', "%{$q}%");
            });
        }

        if ($request->filled('yacht_type')) {
            $query->where('yacht_type', $request->input('yacht_type'));
        }

        if ($request->filled('category')) {
            $query->where('category', $request->input('category'));
        }

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('location_id')) {
            $query->where('location_id', $request->input('location_id'));
        }

        $yachts = $query->latest('id')->paginate($request->input('per_page', 12));

        return response()->json([
            'success' => true,
            'data' => $yachts->items(),
            'meta' => [
                'current_page' => $yachts->currentPage(),
                'last_page' => $yachts->lastPage(),
                'per_page' => $yachts->perPage(),
                'total' => $yachts->total(),
            ],
        ]);
    }

    /**
     * Operational KPIs for the Yacht Dashboard.
     */
    public function dashboard(): JsonResponse
    {
        $totalYachts = Yacht::count();
        $activeYachts = Yacht::where('status', 'active')->count();
        $maintenanceYachts = Yacht::where('status', 'maintenance')->count();
        $pendingApproval = Yacht::where('status', 'pending_approval')->count();

        // Booked today check
        $today = Carbon::today()->toDateString();
        $bookedTodayCount = Booking::where('bookable_type', Yacht::class)
            ->where('check_in', '<=', $today)
            ->where('check_out', '>=', $today)
            ->whereIn('status', ['confirmed', 'paid'])
            ->count();

        // Upcoming yacht bookings (next 30 days)
        $upcomingBookings = Booking::with(['customer'])
            ->where('bookable_type', Yacht::class)
            ->where('check_in', '>=', $today)
            ->whereIn('status', ['confirmed', 'paid', 'pending'])
            ->orderBy('check_in')
            ->limit(5)
            ->get();

        $revenueCents = Booking::where('bookable_type', Yacht::class)
            ->whereIn('status', ['confirmed', 'paid', 'completed'])
            ->sum('total_cents');

        return response()->json([
            'success' => true,
            'data' => [
                'total_yachts' => $totalYachts,
                'active_yachts' => $activeYachts,
                'maintenance_yachts' => $maintenanceYachts,
                'pending_approval' => $pendingApproval,
                'booked_today' => $bookedTodayCount,
                'revenue_egp' => round($revenueCents / 100, 2),
                'upcoming_bookings' => $upcomingBookings,
            ],
        ]);
    }

    /**
     * Get taxonomies for Yacht creation/filters.
     */
    public function taxonomies(): JsonResponse
    {
        $locations = Location::active()->select('id', 'name_en', 'name_ar', 'slug')->get();

        $yachtTypes = [
            ['id' => 'motor_yacht', 'name_en' => 'Motor Yacht', 'name_ar' => 'يخت بمحرك'],
            ['id' => 'sailing_yacht', 'name_en' => 'Sailing Yacht', 'name_ar' => 'يخت شراعي'],
            ['id' => 'catamaran', 'name_en' => 'Catamaran', 'name_ar' => 'كاتاماران'],
            ['id' => 'superyacht', 'name_en' => 'Superyacht', 'name_ar' => 'سوبر يخت فاخر'],
            ['id' => 'speedboat', 'name_en' => 'Speedboat', 'name_ar' => 'قارب سريع'],
        ];

        $categories = [
            ['id' => 'luxury', 'name_en' => 'Ultra Luxury Charters', 'name_ar' => 'رحلات يخوت فائقة الفخامة'],
            ['id' => 'sunset', 'name_en' => 'Sunset Lagoon Cruises', 'name_ar' => 'جولات الغروب في اللاجون'],
            ['id' => 'island_hopping', 'name_en' => 'Island Hopping & Sandbars', 'name_ar' => 'استكشاف الجزر والرمال البيضاء'],
            ['id' => 'family', 'name_en' => 'Family & Gatherings', 'name_ar' => 'رحلات العائلات والمجموعات'],
            ['id' => 'party', 'name_en' => 'Private Celebrations & Events', 'name_ar' => 'مناسبات واحتفالات خاصة'],
        ];

        $pricingModels = [
            ['id' => 'hourly', 'name_en' => 'Hourly Rate', 'name_ar' => 'سعر بالساعة'],
            ['id' => 'half_day', 'name_en' => 'Half-Day (4 Hours)', 'name_ar' => 'نصف يوم (4 ساعات)'],
            ['id' => 'full_day', 'name_en' => 'Full-Day (8 Hours)', 'name_ar' => 'يوم كامل (8 ساعات)'],
            ['id' => 'per_trip', 'name_en' => 'Per Fixed Trip', 'name_ar' => 'لكل رحلة محددة'],
        ];

        $statuses = [
            ['id' => 'draft', 'name_en' => 'Draft', 'name_ar' => 'مسودة'],
            ['id' => 'pending_approval', 'name_en' => 'Pending Approval', 'name_ar' => 'قيد المراجعة'],
            ['id' => 'active', 'name_en' => 'Active', 'name_ar' => 'نشط ومتاح'],
            ['id' => 'suspended', 'name_en' => 'Suspended', 'name_ar' => 'معلق مؤقتاً'],
            ['id' => 'maintenance', 'name_en' => 'In Maintenance', 'name_ar' => 'تحت الصيانة'],
            ['id' => 'inactive', 'name_en' => 'Inactive', 'name_ar' => 'غير نشط'],
            ['id' => 'archived', 'name_en' => 'Archived', 'name_ar' => 'مؤرشف'],
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'locations' => $locations,
                'yacht_types' => $yachtTypes,
                'categories' => $categories,
                'pricing_models' => $pricingModels,
                'statuses' => $statuses,
            ],
        ]);
    }

    /**
     * Store a newly created yacht.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name_en' => ['required', 'string', 'max:255'],
            'name_ar' => ['nullable', 'string', 'max:255'],
            'location_id' => ['nullable', 'exists:locations,id'],
            'yacht_type' => ['required', 'string', 'max:50'],
            'category' => ['required', 'string', 'max:50'],
            'brand' => ['nullable', 'string', 'max:100'],
            'model' => ['nullable', 'string', 'max:100'],
            'year' => ['nullable', 'integer', 'min:1980', 'max:'.(date('Y') + 1)],
            'length_ft' => ['nullable', 'integer', 'min:15', 'max:500'],
            'capacity' => ['required', 'integer', 'min:1', 'max:200'],
            'crew_capacity' => ['nullable', 'integer', 'min:0', 'max:50'],
            'cabins' => ['nullable', 'integer', 'min:0', 'max:20'],
            'bathrooms' => ['nullable', 'integer', 'min:0', 'max:20'],
            'owner_partner_name' => ['nullable', 'string', 'max:255'],
            'owner_partner_contact' => ['nullable', 'string', 'max:255'],
            'pricing_model' => ['required', 'in:hourly,half_day,full_day,per_trip'],
            'base_price' => ['required', 'numeric', 'min:0'],
            'weekend_price' => ['nullable', 'numeric', 'min:0'],
            'extra_hour_price' => ['nullable', 'numeric', 'min:0'],
            'security_deposit' => ['nullable', 'numeric', 'min:0'],
            'min_duration_hours' => ['nullable', 'integer', 'min:1', 'max:24'],
            'marina_berth' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'map_url' => ['nullable', 'string', 'max:500'],
            'short_description_en' => ['nullable', 'string'],
            'short_description_ar' => ['nullable', 'string'],
            'description_en' => ['nullable', 'string'],
            'description_ar' => ['nullable', 'string'],
            'rules_en' => ['nullable', 'string'],
            'rules_ar' => ['nullable', 'string'],
            'cancellation_policy_en' => ['nullable', 'string'],
            'cancellation_policy_ar' => ['nullable', 'string'],
            'cover_image' => ['nullable', 'string'],
            'gallery' => ['nullable', 'array'],
            'is_featured' => ['nullable', 'boolean'],
            'status' => ['required', 'in:draft,pending_approval,active,suspended,maintenance,inactive,archived'],
        ]);

        $slug = Str::slug($validated['name_en']).'-'.strtolower(Str::random(5));

        $yacht = Yacht::create([
            'location_id' => $validated['location_id'] ?? null,
            'name_en' => $validated['name_en'],
            'name_ar' => $validated['name_ar'] ?? null,
            'slug' => $slug,
            'short_description_en' => $validated['short_description_en'] ?? null,
            'short_description_ar' => $validated['short_description_ar'] ?? null,
            'description_en' => $validated['description_en'] ?? null,
            'description_ar' => $validated['description_ar'] ?? null,
            'yacht_type' => $validated['yacht_type'],
            'category' => $validated['category'],
            'brand' => $validated['brand'] ?? null,
            'model' => $validated['model'] ?? null,
            'year' => $validated['year'] ?? null,
            'length_ft' => $validated['length_ft'] ?? null,
            'capacity' => $validated['capacity'],
            'crew_capacity' => $validated['crew_capacity'] ?? 2,
            'cabins' => $validated['cabins'] ?? 1,
            'bathrooms' => $validated['bathrooms'] ?? 1,
            'owner_partner_name' => $validated['owner_partner_name'] ?? null,
            'owner_partner_contact' => $validated['owner_partner_contact'] ?? null,
            'pricing_model' => $validated['pricing_model'],
            'base_price_cents' => (int) round($validated['base_price'] * 100),
            'weekend_price_cents' => isset($validated['weekend_price']) ? (int) round($validated['weekend_price'] * 100) : null,
            'extra_hour_price_cents' => isset($validated['extra_hour_price']) ? (int) round($validated['extra_hour_price'] * 100) : null,
            'security_deposit_cents' => isset($validated['security_deposit']) ? (int) round($validated['security_deposit'] * 100) : null,
            'min_duration_hours' => $validated['min_duration_hours'] ?? 2,
            'marina_berth' => $validated['marina_berth'] ?? null,
            'address' => $validated['address'] ?? 'Abu Tig Marina, El Gouna',
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
            'map_url' => $validated['map_url'] ?? null,
            'rules_en' => $validated['rules_en'] ?? null,
            'rules_ar' => $validated['rules_ar'] ?? null,
            'cancellation_policy_en' => $validated['cancellation_policy_en'] ?? null,
            'cancellation_policy_ar' => $validated['cancellation_policy_ar'] ?? null,
            'cover_image' => $validated['cover_image'] ?? '/assets/images/tawila-yacht.jpg',
            'gallery' => $validated['gallery'] ?? ['/assets/images/tawila-yacht.jpg'],
            'is_featured' => $validated['is_featured'] ?? false,
            'status' => $validated['status'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Yacht registered successfully.',
            'data' => $yacht->load(['location', 'packages', 'addons']),
        ], 201);
    }

    /**
     * Show single yacht with details, packages, addons, and availability blocks.
     */
    public function show($id): JsonResponse
    {
        $yacht = Yacht::with(['location', 'packages', 'addons', 'availabilityBlocks.creator'])
            ->withCount(['bookings'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $yacht,
        ]);
    }

    /**
     * Update an existing yacht.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $yacht = Yacht::findOrFail($id);

        $validated = $request->validate([
            'name_en' => ['sometimes', 'required', 'string', 'max:255'],
            'name_ar' => ['nullable', 'string', 'max:255'],
            'location_id' => ['nullable', 'exists:locations,id'],
            'yacht_type' => ['sometimes', 'required', 'string', 'max:50'],
            'category' => ['sometimes', 'required', 'string', 'max:50'],
            'brand' => ['nullable', 'string', 'max:100'],
            'model' => ['nullable', 'string', 'max:100'],
            'year' => ['nullable', 'integer', 'min:1980', 'max:'.(date('Y') + 1)],
            'length_ft' => ['nullable', 'integer', 'min:15', 'max:500'],
            'capacity' => ['sometimes', 'required', 'integer', 'min:1', 'max:200'],
            'crew_capacity' => ['nullable', 'integer', 'min:0', 'max:50'],
            'cabins' => ['nullable', 'integer', 'min:0', 'max:20'],
            'bathrooms' => ['nullable', 'integer', 'min:0', 'max:20'],
            'owner_partner_name' => ['nullable', 'string', 'max:255'],
            'owner_partner_contact' => ['nullable', 'string', 'max:255'],
            'pricing_model' => ['sometimes', 'required', 'in:hourly,half_day,full_day,per_trip'],
            'base_price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'weekend_price' => ['nullable', 'numeric', 'min:0'],
            'extra_hour_price' => ['nullable', 'numeric', 'min:0'],
            'security_deposit' => ['nullable', 'numeric', 'min:0'],
            'min_duration_hours' => ['nullable', 'integer', 'min:1', 'max:24'],
            'marina_berth' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'map_url' => ['nullable', 'string', 'max:500'],
            'short_description_en' => ['nullable', 'string'],
            'short_description_ar' => ['nullable', 'string'],
            'description_en' => ['nullable', 'string'],
            'description_ar' => ['nullable', 'string'],
            'rules_en' => ['nullable', 'string'],
            'rules_ar' => ['nullable', 'string'],
            'cancellation_policy_en' => ['nullable', 'string'],
            'cancellation_policy_ar' => ['nullable', 'string'],
            'cover_image' => ['nullable', 'string'],
            'gallery' => ['nullable', 'array'],
            'is_featured' => ['nullable', 'boolean'],
            'status' => ['sometimes', 'required', 'in:draft,pending_approval,active,suspended,maintenance,inactive,archived'],
        ]);

        if (isset($validated['base_price'])) {
            $validated['base_price_cents'] = (int) round($validated['base_price'] * 100);
            unset($validated['base_price']);
        }
        if (array_key_exists('weekend_price', $validated)) {
            $validated['weekend_price_cents'] = $validated['weekend_price'] !== null ? (int) round($validated['weekend_price'] * 100) : null;
            unset($validated['weekend_price']);
        }
        if (array_key_exists('extra_hour_price', $validated)) {
            $validated['extra_hour_price_cents'] = $validated['extra_hour_price'] !== null ? (int) round($validated['extra_hour_price'] * 100) : null;
            unset($validated['extra_hour_price']);
        }
        if (array_key_exists('security_deposit', $validated)) {
            $validated['security_deposit_cents'] = $validated['security_deposit'] !== null ? (int) round($validated['security_deposit'] * 100) : null;
            unset($validated['security_deposit']);
        }

        $yacht->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Yacht updated successfully.',
            'data' => $yacht->load(['location', 'packages', 'addons']),
        ]);
    }

    /**
     * Delete (soft-delete) a yacht.
     */
    public function destroy($id): JsonResponse
    {
        $yacht = Yacht::findOrFail($id);
        $yacht->delete();

        return response()->json([
            'success' => true,
            'message' => 'Yacht archived successfully.',
        ]);
    }

    /**
     * Toggle yacht status (e.g. active <-> suspended).
     */
    public function toggleStatus($id): JsonResponse
    {
        $yacht = Yacht::findOrFail($id);
        $newStatus = $yacht->status === 'active' ? 'suspended' : 'active';
        $yacht->update(['status' => $newStatus]);

        return response()->json([
            'success' => true,
            'message' => "Yacht status updated to {$newStatus}.",
            'status' => $newStatus,
        ]);
    }

    /**
     * Availability calendar view for yacht.
     */
    public function availability($id): JsonResponse
    {
        $yacht = Yacht::with(['availabilityBlocks'])->findOrFail($id);

        $bookings = Booking::where('bookable_type', Yacht::class)
            ->where('bookable_id', $yacht->id)
            ->whereIn('status', ['confirmed', 'paid', 'pending'])
            ->select('id', 'reference', 'check_in', 'check_out', 'status', 'guests')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'yacht_id' => $yacht->id,
                'name' => $yacht->name_en,
                'status' => $yacht->status,
                'blocks' => $yacht->availabilityBlocks,
                'bookings' => $bookings,
            ],
        ]);
    }

    /**
     * Block dates/hours for maintenance or private hold.
     */
    public function addAvailabilityBlock(Request $request, $id): JsonResponse
    {
        $yacht = Yacht::findOrFail($id);

        $validated = $request->validate([
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'start_time' => ['nullable', 'string'],
            'end_time' => ['nullable', 'string'],
            'status' => ['required', 'in:blocked,maintenance,booked,unavailable'],
            'reason' => ['nullable', 'string', 'max:255'],
        ]);

        // Guard against conflicting confirmed bookings
        $hasConflict = Booking::where('bookable_type', Yacht::class)
            ->where('bookable_id', $yacht->id)
            ->whereIn('status', ['confirmed', 'paid'])
            ->where(function ($q) use ($validated) {
                $q->whereBetween('check_in', [$validated['start_date'], $validated['end_date']])
                    ->orWhereBetween('check_out', [$validated['start_date'], $validated['end_date']]);
            })
            ->exists();

        if ($hasConflict) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot block availability: Confirmed bookings exist within this date range.',
            ], 422);
        }

        $block = YachtAvailabilityBlock::create([
            'yacht_id' => $yacht->id,
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'start_time' => $validated['start_time'] ?? null,
            'end_time' => $validated['end_time'] ?? null,
            'status' => $validated['status'],
            'reason' => $validated['reason'] ?? null,
            'created_by' => auth()->id(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Availability block created.',
            'data' => $block,
        ], 201);
    }

    /**
     * Remove an availability block.
     */
    public function removeAvailabilityBlock($id, $blockId): JsonResponse
    {
        $yacht = Yacht::findOrFail($id);
        $block = YachtAvailabilityBlock::where('yacht_id', $yacht->id)->findOrFail($blockId);
        $block->delete();

        return response()->json([
            'success' => true,
            'message' => 'Availability block removed.',
        ]);
    }

    /**
     * Add a yacht package (e.g., Sunset Cruise, Island Hopping).
     */
    public function storePackage(Request $request, $id): JsonResponse
    {
        $yacht = Yacht::findOrFail($id);

        $validated = $request->validate([
            'name_en' => ['required', 'string', 'max:255'],
            'name_ar' => ['nullable', 'string', 'max:255'],
            'description_en' => ['nullable', 'string'],
            'description_ar' => ['nullable', 'string'],
            'duration_hours' => ['required', 'numeric', 'min:0.5', 'max:48'],
            'capacity' => ['nullable', 'integer', 'min:1'],
            'price' => ['required', 'numeric', 'min:0'],
            'inclusions_en' => ['nullable', 'array'],
            'inclusions_ar' => ['nullable', 'array'],
            'exclusions_en' => ['nullable', 'array'],
            'exclusions_ar' => ['nullable', 'array'],
            'status' => ['nullable', 'in:active,inactive'],
        ]);

        $package = YachtPackage::create([
            'yacht_id' => $yacht->id,
            'name_en' => $validated['name_en'],
            'name_ar' => $validated['name_ar'] ?? null,
            'description_en' => $validated['description_en'] ?? null,
            'description_ar' => $validated['description_ar'] ?? null,
            'duration_hours' => $validated['duration_hours'],
            'capacity' => $validated['capacity'] ?? $yacht->capacity,
            'price_cents' => (int) round($validated['price'] * 100),
            'currency' => 'EGP',
            'inclusions_en' => $validated['inclusions_en'] ?? [],
            'inclusions_ar' => $validated['inclusions_ar'] ?? [],
            'exclusions_en' => $validated['exclusions_en'] ?? [],
            'exclusions_ar' => $validated['exclusions_ar'] ?? [],
            'status' => $validated['status'] ?? 'active',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Package added successfully.',
            'data' => $package,
        ], 201);
    }

    /**
     * Delete a yacht package.
     */
    public function deletePackage($id, $packageId): JsonResponse
    {
        $yacht = Yacht::findOrFail($id);
        $package = YachtPackage::where('yacht_id', $yacht->id)->findOrFail($packageId);
        $package->delete();

        return response()->json([
            'success' => true,
            'message' => 'Package deleted.',
        ]);
    }

    /**
     * Add a yacht add-on.
     */
    public function storeAddon(Request $request, $id): JsonResponse
    {
        $yacht = Yacht::findOrFail($id);

        $validated = $request->validate([
            'name_en' => ['required', 'string', 'max:255'],
            'name_ar' => ['nullable', 'string', 'max:255'],
            'description_en' => ['nullable', 'string'],
            'description_ar' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'pricing_model' => ['required', 'in:per_booking,per_person,per_hour,per_item'],
            'max_quantity' => ['nullable', 'integer', 'min:1'],
            'is_available' => ['nullable', 'boolean'],
        ]);

        $addon = $yacht->addons()->create([
            'name_en' => $validated['name_en'],
            'name_ar' => $validated['name_ar'] ?? null,
            'description_en' => $validated['description_en'] ?? null,
            'description_ar' => $validated['description_ar'] ?? null,
            'price_cents' => (int) round($validated['price'] * 100),
            'currency' => 'EGP',
            'pricing_model' => $validated['pricing_model'],
            'max_quantity' => $validated['max_quantity'] ?? 1,
            'is_available' => $validated['is_available'] ?? true,
            'status' => 'active',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Add-on created successfully.',
            'data' => $addon,
        ], 201);
    }

    /**
     * Delete an add-on.
     */
    public function deleteAddon($id, $addonId): JsonResponse
    {
        $yacht = Yacht::findOrFail($id);
        $addon = $yacht->addons()->findOrFail($addonId);
        $addon->delete();

        return response()->json([
            'success' => true,
            'message' => 'Add-on deleted.',
        ]);
    }

    /**
     * List bookings for this yacht.
     */
    public function bookings($id): JsonResponse
    {
        $yacht = Yacht::findOrFail($id);

        $bookings = Booking::with(['customer', 'paymentMethod'])
            ->where('bookable_type', Yacht::class)
            ->where('bookable_id', $yacht->id)
            ->latest('id')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $bookings->items(),
            'meta' => [
                'current_page' => $bookings->currentPage(),
                'last_page' => $bookings->lastPage(),
                'total' => $bookings->total(),
            ],
        ]);
    }
}
