<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Discount;
use App\Models\Property;
use App\Models\SeasonalPrice;
use App\Services\PricingService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PricingApiController extends Controller
{
    /**
     * 1. Overview of pricing engine metrics, base prices, and active seasonal rules.
     */
    public function overview(Request $request): JsonResponse
    {
        $rentPropertiesCount = Property::whereIn('listing_type', ['rent', 'both'])->count();
        $activeSeasonsCount = SeasonalPrice::where('is_active', true)->count();
        $discountsCount = Discount::where('is_active', true)->count();
        $avgPriceCents = Property::whereIn('listing_type', ['rent', 'both'])
            ->where('base_price_cents', '>', 0)
            ->avg('base_price_cents') ?? 0;

        $properties = Property::with(['location', 'category', 'parent'])
            ->whereIn('listing_type', ['rent', 'both'])
            ->withCount([
                'seasonalPrices as active_seasons_count' => function ($q) {
                    $q->where('is_active', true);
                },
            ])
            ->orderBy('title_en')
            ->get()
            ->map(function (Property $p) {
                return [
                    'id' => $p->id,
                    'parent_id' => $p->parent_id,
                    'parent_title' => $p->parent?->title_en,
                    'reference_number' => $p->reference_number,
                    'title_en' => $p->title_en,
                    'title_ar' => $p->title_ar,
                    'base_price_cents' => (int) $p->base_price_cents,
                    'formatted_base_price' => number_format(((int) $p->base_price_cents) / 100, 2) . ' ' . ($p->currency ?? 'EGP'),
                    'currency' => $p->currency ?? 'EGP',
                    'min_stay_nights' => (int) ($p->min_stay_nights ?? 1),
                    'cleaning_fee_cents' => (int) ($p->cleaning_fee_cents ?? 0),
                    'service_fee_cents' => (int) ($p->service_fee_cents ?? 0),
                    'tax_percentage' => (float) ($p->tax_percentage ?? 0),
                    'is_published' => (bool) $p->is_published,
                    'active_seasons_count' => (int) $p->active_seasons_count,
                    'location_name' => $p->location?->name_en ?? 'El Gouna',
                    'category_name' => $p->category?->name_en ?? 'Villa',
                ];
            });

        $upcomingRules = SeasonalPrice::with('property')
            ->where('is_active', true)
            ->whereDate('end_date', '>=', now()->toDateString())
            ->orderBy('start_date')
            ->limit(10)
            ->get()
            ->map(function (SeasonalPrice $sp) {
                return [
                    'id' => $sp->id,
                    'property_id' => $sp->property_id,
                    'property_title' => $sp->property?->title_en ?? 'Unknown Property',
                    'property_reference' => $sp->property?->reference_number ?? '',
                    'name_en' => $sp->name_en,
                    'start_date' => $sp->start_date ? $sp->start_date->toDateString() : '',
                    'end_date' => $sp->end_date ? $sp->end_date->toDateString() : '',
                    'price_cents' => (int) $sp->price_cents,
                    'formatted_price' => number_format(((int) $sp->price_cents) / 100, 2) . ' EGP',
                    'priority' => (int) $sp->priority,
                    'min_stay_nights' => $sp->min_stay_nights ? (int) $sp->min_stay_nights : null,
                ];
            });

        return response()->json([
            'summary' => [
                'total_rent_inventory' => $rentPropertiesCount,
                'total_active_seasonal_rules' => $activeSeasonsCount,
                'total_active_discounts' => $discountsCount,
                'average_nightly_rate_cents' => (int) round($avgPriceCents),
                'formatted_average_nightly_rate' => number_format($avgPriceCents / 100, 2) . ' EGP',
            ],
            'properties' => $properties,
            'upcoming_rules' => $upcomingRules,
        ]);
    }

    /**
     * 2. Monthly Pricing Calendar matrix for any property / unit.
     */
    public function calendar(Request $request, PricingService $pricingService): JsonResponse
    {
        $request->validate([
            'property_id' => ['required', 'exists:properties,id'],
            'year' => ['nullable', 'integer', 'min:2020', 'max:2035'],
            'month' => ['nullable', 'integer', 'min:1', 'max:12'],
        ]);

        $property = Property::findOrFail((int) $request->input('property_id'));
        $year = (int) $request->input('year', now()->year);
        $month = (int) $request->input('month', now()->month);

        $calendarData = $pricingService->getMonthlyPriceCalendar($property, $year, $month);

        return response()->json([
            'property' => [
                'id' => $property->id,
                'reference_number' => $property->reference_number,
                'title_en' => $property->title_en,
                'title_ar' => $property->title_ar,
                'base_price_cents' => (int) $property->base_price_cents,
                'formatted_base_price' => number_format(((int) $property->base_price_cents) / 100, 2) . ' ' . ($property->currency ?? 'EGP'),
                'currency' => $property->currency ?? 'EGP',
                'min_stay_nights' => (int) ($property->min_stay_nights ?? 1),
            ],
            'year' => $year,
            'month' => $month,
            'calendar' => array_values($calendarData),
        ]);
    }

    /**
     * 3. Authoritative Price Quote Preview & Explanation.
     */
    public function previewQuote(Request $request, PricingService $pricingService): JsonResponse
    {
        $validated = $request->validate([
            'property_id' => ['required', 'exists:properties,id'],
            'check_in' => ['required', 'date'],
            'check_out' => ['required', 'date', 'after:check_in'],
            'guests' => ['nullable', 'integer', 'min:1'],
            'promo_code' => ['nullable', 'string', 'max:50'],
        ]);

        $property = Property::findOrFail((int) $validated['property_id']);
        $checkIn = Carbon::parse($validated['check_in']);
        $checkOut = Carbon::parse($validated['check_out']);
        $guests = (int) ($validated['guests'] ?? 1);
        $promoCode = !empty($validated['promo_code']) ? trim($validated['promo_code']) : null;

        try {
            $quote = $pricingService->calculateBooking($property, $checkIn, $checkOut, $guests, $promoCode);

            // Construct explanation breakdown
            $explanation = [
                'base_nightly_rate' => number_format($property->base_price_cents / 100, 2) . ' ' . ($property->currency ?? 'EGP'),
                'nights_count' => $quote['nights'],
                'subtotal' => $quote['subtotal_formatted'] . ' ' . $quote['currency'],
                'cleaning_fee' => number_format($quote['cleaning_fee_cents'] / 100, 2) . ' ' . $quote['currency'],
                'service_fee' => number_format($quote['service_fee_cents'] / 100, 2) . ' ' . $quote['currency'],
                'discount' => number_format($quote['discount_cents'] / 100, 2) . ' ' . $quote['currency'],
                'tax' => number_format($quote['tax_cents'] / 100, 2) . ' ' . $quote['currency'] . ' (' . $quote['tax_percentage'] . '%)',
                'final_total' => $quote['total_formatted'] . ' ' . $quote['currency'],
                'deposit_required' => number_format($quote['deposit_cents'] / 100, 2) . ' ' . $quote['currency'],
                'min_stay_check' => [
                    'required' => $quote['min_stay_required'],
                    'actual' => $quote['nights'],
                    'satisfied' => $quote['satisfies_min_stay'],
                    'message' => $quote['satisfies_min_stay']
                        ? 'Minimum stay constraint satisfied.'
                        : "Requires minimum stay of {$quote['min_stay_required']} nights (booked {$quote['nights']} nights).",
                ],
            ];

            return response()->json([
                'success' => true,
                'property' => [
                    'id' => $property->id,
                    'reference_number' => $property->reference_number,
                    'title_en' => $property->title_en,
                    'currency' => $property->currency ?? 'EGP',
                ],
                'quote' => $quote,
                'explanation' => $explanation,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * 4. Analyze Seasonal Price Overlap and Priority Resolution.
     */
    public function analyzeOverlap(Request $request, PricingService $pricingService): JsonResponse
    {
        $validated = $request->validate([
            'property_id' => ['required', 'exists:properties,id'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'priority' => ['required', 'integer', 'min:1'],
            'ignore_season_id' => ['nullable', 'integer'],
        ]);

        $property = Property::findOrFail((int) $validated['property_id']);
        $startDate = Carbon::parse($validated['start_date']);
        $endDate = Carbon::parse($validated['end_date']);
        $priority = (int) $validated['priority'];
        $ignoreSeasonId = !empty($validated['ignore_season_id']) ? (int) $validated['ignore_season_id'] : null;

        $analysis = $pricingService->analyzeSeasonalOverlap(
            $property,
            $startDate,
            $endDate,
            $priority,
            $ignoreSeasonId
        );

        return response()->json([
            'success' => true,
            'data' => $analysis,
        ]);
    }

    /**
     * 5. List all seasonal / holiday / weekend pricing rules with pagination.
     */
    /**
     * 5. List all seasonal / holiday / weekend pricing rules with pagination.
     */
    public function rules(Request $request): JsonResponse
    {
        $query = SeasonalPrice::with(['property.parent'])->orderByDesc('start_date');

        if ($propertyId = $request->query('property_id')) {
            if ($propertyId === 'global') {
                $query->whereNull('property_id');
            } else {
                $query->where('property_id', (int) $propertyId);
            }
        }

        if ($ruleType = $request->query('rule_type')) {
            $query->where('rule_type', $ruleType);
        }

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name_en', 'like', "%{$search}%")
                    ->orWhere('name_ar', 'like', "%{$search}%")
                    ->orWhereHas('property', function ($p) use ($search) {
                        $p->where('title_en', 'like', "%{$search}%")
                            ->orWhere('reference_number', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->query('is_active'), FILTER_VALIDATE_BOOLEAN));
        }

        $paginator = $query->paginate(20);

        $items = collect($paginator->items())->map(function (SeasonalPrice $sp) {
            return [
                'id' => $sp->id,
                'property_id' => $sp->property_id,
                'parent_id' => $sp->property?->parent_id,
                'property_title' => $sp->property ? $sp->property->title_en : 'Global (All Inventory)',
                'property_reference' => $sp->property ? $sp->property->reference_number : 'GLOBAL',
                'rule_type' => $sp->rule_type ?? 'season',
                'adjustment_type' => $sp->adjustment_type ?? 'fixed',
                'adjustment_percent' => $sp->adjustment_percent ? (float) $sp->adjustment_percent : null,
                'days_of_week' => $sp->days_of_week ?? null,
                'name_en' => $sp->name_en,
                'name_ar' => $sp->name_ar,
                'start_date' => $sp->start_date ? $sp->start_date->toDateString() : '',
                'end_date' => $sp->end_date ? $sp->end_date->toDateString() : '',
                'price_cents' => (int) $sp->price_cents,
                'formatted_price' => number_format(((int) $sp->price_cents) / 100, 2) . ' EGP',
                'priority' => (int) $sp->priority,
                'min_stay_nights' => $sp->min_stay_nights ? (int) $sp->min_stay_nights : null,
                'is_active' => (bool) $sp->is_active,
                'notes' => $sp->notes,
                'created_at' => $sp->created_at ? $sp->created_at->toIso8601String() : null,
            ];
        });

        return response()->json([
            'data' => $items,
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'from' => $paginator->firstItem(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'to' => $paginator->lastItem(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    /**
     * 6. Create seasonal / holiday / weekend pricing rule.
     */
    public function storeRule(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'property_id' => ['nullable', 'exists:properties,id'],
            'rule_type' => ['nullable', 'string', 'in:season,holiday,weekend,override'],
            'adjustment_type' => ['nullable', 'string', 'in:fixed,percentage'],
            'adjustment_percent' => ['nullable', 'numeric', 'min:-100', 'max:500'],
            'days_of_week' => ['nullable', 'array'],
            'days_of_week.*' => ['string'],
            'name_en' => ['required', 'string', 'max:255'],
            'name_ar' => ['nullable', 'string', 'max:255'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'price_cents' => ['required', 'integer', 'min:0'],
            'priority' => ['nullable', 'integer', 'min:1'],
            'min_stay_nights' => ['nullable', 'integer', 'min:1'],
            'is_active' => ['nullable', 'boolean'],
            'notes' => ['nullable', 'string'],
        ]);

        $season = SeasonalPrice::create(array_merge($validated, [
            'rule_type' => $validated['rule_type'] ?? 'season',
            'adjustment_type' => $validated['adjustment_type'] ?? 'fixed',
            'is_active' => $validated['is_active'] ?? true,
            'priority' => $validated['priority'] ?? 1,
        ]));

        $property = $season->property_id ? Property::find($season->property_id) : null;
        $targetDesc = $property ? "property [{$property->reference_number}]" : "Global Inventory";

        ActivityLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'seasonal_price_added',
            'entity_type' => 'Property',
            'entity_id' => $season->property_id ?? 0,
            'description' => "Pricing rule [{$season->name_en}] ({$season->rule_type}) created for {$targetDesc}. Rate: " . number_format($season->price_cents / 100, 2) . " EGP.",
            'new_values' => $season->toArray(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم إنشاء قاعدة السعر بنجاح.',
            'data' => $season->load('property'),
        ], 201);
    }

    /**
     * 7. Update an existing pricing rule.
     */
    public function updateRule(int $id, Request $request): JsonResponse
    {
        $rule = SeasonalPrice::findOrFail($id);

        $validated = $request->validate([
            'property_id' => ['nullable', 'exists:properties,id'],
            'rule_type' => ['nullable', 'string', 'in:season,holiday,weekend,override'],
            'adjustment_type' => ['nullable', 'string', 'in:fixed,percentage'],
            'adjustment_percent' => ['nullable', 'numeric', 'min:-100', 'max:500'],
            'days_of_week' => ['nullable', 'array'],
            'days_of_week.*' => ['string'],
            'name_en' => ['nullable', 'string', 'max:255'],
            'name_ar' => ['nullable', 'string', 'max:255'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'price_cents' => ['nullable', 'integer', 'min:0'],
            'priority' => ['nullable', 'integer', 'min:1'],
            'min_stay_nights' => ['nullable', 'integer', 'min:1'],
            'is_active' => ['nullable', 'boolean'],
            'notes' => ['nullable', 'string'],
        ]);

        $rule->update($validated);

        ActivityLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'seasonal_price_updated',
            'entity_type' => 'Property',
            'entity_id' => $rule->property_id ?? 0,
            'description' => "Pricing rule [{$rule->name_en}] updated by admin.",
            'new_values' => $validated,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث قاعدة السعر بنجاح.',
            'data' => $rule->fresh('property'),
        ]);
    }

    /**
     * 8. Delete a pricing rule.
     */
    public function deleteRule(int $id, Request $request): JsonResponse
    {
        $rule = SeasonalPrice::findOrFail($id);
        $old = $rule->toArray();
        $rule->delete();

        ActivityLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'seasonal_price_removed',
            'entity_type' => 'Property',
            'entity_id' => $old['property_id'],
            'description' => "Seasonal rule [{$old['name_en']}] deleted by admin.",
            'old_values' => $old,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم حذف قاعدة السعر بنجاح.',
        ]);
    }

    /**
     * 9. Date Range Price Override (highest priority targeted rule).
     */
    public function overrideDateRange(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'property_id' => ['required', 'exists:properties,id'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'price_cents' => ['required', 'integer', 'min:0'],
            'min_stay_nights' => ['nullable', 'integer', 'min:1'],
            'reason' => ['nullable', 'string', 'max:255'],
        ]);

        $property = Property::findOrFail((int) $validated['property_id']);

        // Highest existing priority + 5 to ensure date override precedence
        $maxPriority = (int) (SeasonalPrice::where('property_id', $property->id)->max('priority') ?? 10);
        $overridePriority = max(99, $maxPriority + 5);

        $overrideName = !empty($validated['reason'])
            ? "Override: {$validated['reason']}"
            : "Price Override (" . Carbon::parse($validated['start_date'])->format('M d') . ' - ' . Carbon::parse($validated['end_date'])->format('M d') . ")";

        $season = SeasonalPrice::create([
            'property_id' => $property->id,
            'name_en' => $overrideName,
            'name_ar' => "تعديل سعر استثنائي",
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'price_cents' => $validated['price_cents'],
            'priority' => $overridePriority,
            'min_stay_nights' => $validated['min_stay_nights'] ?? null,
            'is_active' => true,
            'notes' => 'Administrative date override created from Pricing Calendar.',
        ]);

        ActivityLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'price_override_applied',
            'entity_type' => 'Property',
            'entity_id' => $property->id,
            'description' => "Price override applied on [{$property->reference_number}] from {$validated['start_date']} to {$validated['end_date']} at " . number_format($validated['price_cents'] / 100, 2) . " EGP/night.",
            'new_values' => $season->toArray(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم تطبيق السعر المخصص للفترة المحددة بنجاح.',
            'data' => $season,
        ], 201);
    }

    /**
     * 10. List promotional discounts and coupon codes.
     */
    public function discounts(Request $request): JsonResponse
    {
        $query = Discount::orderByDesc('created_at');

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name_en', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        $paginator = $query->paginate(20);

        return response()->json([
            'data' => $paginator->items(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    /**
     * 11. Create a discount / promotion code.
     */
    public function storeDiscount(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name_en' => ['required', 'string', 'max:255'],
            'name_ar' => ['nullable', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:50', 'unique:discounts,code'],
            'type' => ['required', 'in:percentage,fixed'],
            'value' => ['required', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'size:3'],
            'valid_from' => ['nullable', 'date'],
            'valid_until' => ['nullable', 'date', 'after_or_equal:valid_from'],
            'min_stay_nights' => ['nullable', 'integer', 'min:1'],
            'min_booking_amount_cents' => ['nullable', 'integer', 'min:0'],
            'max_uses' => ['nullable', 'integer', 'min:1'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $discount = Discount::create(array_merge($validated, [
            'is_active' => $validated['is_active'] ?? true,
        ]));

        ActivityLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'discount_created',
            'entity_type' => 'Discount',
            'entity_id' => $discount->id,
            'description' => "Promotional discount [{$discount->name_en}] ({$discount->code}) created.",
            'new_values' => $discount->toArray(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم إنشاء كود الخصم بنجاح.',
            'data' => $discount,
        ], 201);
    }

    /**
     * 12. Toggle active state of a discount.
     */
    public function toggleDiscount(int $id, Request $request): JsonResponse
    {
        $discount = Discount::findOrFail($id);
        $discount->is_active = !$discount->is_active;
        $discount->save();

        return response()->json([
            'success' => true,
            'message' => 'تم تغيير حالة كود الخصم بنجاح.',
            'data' => $discount,
        ]);
    }

    /**
     * 13. Delete a discount.
     */
    public function deleteDiscount(int $id, Request $request): JsonResponse
    {
        $discount = Discount::findOrFail($id);
        $discount->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف كود الخصم بنجاح.',
        ]);
    }
}
