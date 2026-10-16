<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\PropertyCollection;
use App\Http\Resources\Api\V1\PropertyResource;
use App\Models\Property;
use App\Support\Traits\AppliesListingStandard;
use Illuminate\Http\Request;

class StayController extends Controller
{
    use AppliesListingStandard;

    /**
     * Display a paginated listing of available properties adhering to Standard S2 and S3.
     */
    public function index(Request $request): PropertyCollection
    {
        $query = Property::query()
            ->with(['images', 'category', 'location'])
            ->where('is_published', true)
            ->where('is_available', true);

        // Support full-text or title/compound search
        if ($search = $request->input('q')) {
            $query->where(function ($q) use ($search) {
                $q->where('title_en', 'like', "%{$search}%")
                    ->orWhere('title_ar', 'like', "%{$search}%")
                    ->orWhere('compound', 'like', "%{$search}%")
                    ->orWhere('reference_number', 'like', "%{$search}%");
            });
        }

        // Support guest capacity filtering
        if ($guests = $request->input('guests')) {
            $query->where('max_guests', '>=', (int) $guests);
        }

        // Support price range filtering
        if ($minPrice = $request->input('min_price')) {
            $query->where('base_price_cents', '>=', (int) $minPrice);
        }
        if ($maxPrice = $request->input('max_price')) {
            $query->where('base_price_cents', '<=', (int) $maxPrice);
        }

        $paginated = $this->paginateWithListingStandard(
            query: $query,
            request: $request,
            allowedSorts: ['id', 'base_price_cents', 'bedrooms', 'bathrooms', 'created_at'],
            allowedFilters: ['bedrooms', 'bathrooms', 'compound', 'location_id', 'property_category_id', 'listing_type'],
            allowedIncludes: ['category', 'location', 'amenities', 'media'],
            defaultSort: '-created_at',
            defaultPerPage: 15,
            maxPerPage: 100
        );

        return new PropertyCollection($paginated);
    }

    /**
     * Display the specified property by slug or ID.
     */
    public function show(string $slug): PropertyResource
    {
        $property = Property::where(function ($q) use ($slug) {
            $q->where('slug', $slug);
            if (is_numeric($slug)) {
                $q->orWhere('id', (int) $slug);
            }
        })
            ->where('is_published', true)
            ->with(['category', 'location', 'amenities', 'media'])
            ->firstOrFail();

        return new PropertyResource($property);
    }

    /**
     * Retrieve calendar of unavailable (booked or blocked) dates for a property.
     */
    public function availability(
        string $slug,
        \App\Modules\Availability\Application\Queries\GetUnavailableDatesQuery $unavailableDatesQuery
    ): \Illuminate\Http\JsonResponse {
        $property = Property::where(function ($q) use ($slug) {
            $q->where('slug', $slug);
            if (is_numeric($slug)) {
                $q->orWhere('id', (int) $slug);
            }
        })
            ->where('is_published', true)
            ->firstOrFail();

        $from = now()->startOfDay();
        $to = now()->addMonths(12)->endOfDay();

        $unavailableMap = $unavailableDatesQuery->execute($property, $from, $to);

        return response()->json([
            'property_id' => $property->id,
            'slug' => $property->slug,
            'min_stay_nights' => $property->min_stay_nights ?? 1,
            'max_stay_nights' => $property->max_stay_nights ?? 30,
            'unavailable_dates' => $unavailableMap,
        ]);
    }

    /**
     * Check availability for selected dates; if unavailable, intelligently suggest curated available alternatives.
     */
    public function checkAvailability(
        Request $request,
        string $slug,
        \App\Modules\Availability\Application\Queries\CheckPropertyAvailabilityQuery $availabilityQuery,
        \App\Modules\Availability\Application\Queries\FilterAvailablePropertiesQuery $filterAvailableQuery,
        \App\Modules\Pricing\Application\Queries\CalculateBookingQuoteQuery $quoteQuery
    ): \Illuminate\Http\JsonResponse {
        $validated = $request->validate([
            'check_in' => ['required', 'date'],
            'check_out' => ['required', 'date', 'after:check_in'],
            'guests' => ['nullable', 'integer', 'min:1'],
            'promo_code' => ['nullable', 'string'],
        ]);

        $property = Property::where(function ($q) use ($slug) {
            $q->where('slug', $slug);
            if (is_numeric($slug)) {
                $q->orWhere('id', (int) $slug);
            }
        })
            ->where('is_published', true)
            ->firstOrFail();

        $checkIn = \Carbon\Carbon::parse($validated['check_in']);
        $checkOut = \Carbon\Carbon::parse($validated['check_out']);
        $guests = (int) ($validated['guests'] ?? 1);

        $checkResult = $availabilityQuery->execute($property, $checkIn, $checkOut);

        if ($checkResult->isAvailable) {
            $quote = null;
            try {
                $pricing = $quoteQuery->execute(
                    $property,
                    $checkIn,
                    $checkOut,
                    $guests,
                    $validated['promo_code'] ?? null
                );

                $quote = [
                    'nights' => $pricing->nights,
                    'nightly_rate_cents' => $pricing->nights > 0 ? (int) round($pricing->subtotalCents / $pricing->nights) : $property->base_price_cents,
                    'subtotal_cents' => $pricing->subtotalCents,
                    'subtotal_formatted' => number_format($pricing->subtotalCents / 100, 2),
                    'cleaning_fee_cents' => $pricing->cleaningFeeCents,
                    'service_fee_cents' => $pricing->serviceFeeCents,
                    'tax_cents' => $pricing->taxCents,
                    'discount_cents' => $pricing->discountCents,
                    'total_cents' => $pricing->totalCents,
                    'total_formatted' => number_format($pricing->totalCents / 100, 2),
                    'currency' => $pricing->currency,
                ];
            } catch (\Throwable) {
                // Keep quote null if pricing query encounters an issue
            }

            return response()->json([
                'is_available' => true,
                'message_en' => 'Property is fully available for your selected dates.',
                'message_ar' => 'الوحدة متاحة بالكامل للحجز في التواريخ المختارة.',
                'quote' => $quote,
            ]);
        }

        // Property is NOT available: Find alternatives matching the exact requested dates
        $candidateProperties = Property::query()
            ->where('id', '!=', $property->id)
            ->where('is_published', true)
            ->where('is_available', true)
            ->whereIn('listing_type', ['rent', 'both'])
            ->when($property->location_id, function ($q) use ($property) {
                $q->orderByRaw("CASE WHEN location_id = {$property->location_id} THEN 0 ELSE 1 END");
            })
            ->orderByRaw("ABS(bedrooms - {$property->bedrooms}) ASC")
            ->limit(20)
            ->get();

        $candidateIds = $candidateProperties->pluck('id')->all();
        $availableAlternativeIds = $filterAvailableQuery->execute($candidateIds, $checkIn, $checkOut);

        $alternatives = $candidateProperties
            ->whereIn('id', $availableAlternativeIds)
            ->take(4)
            ->map(function ($alt) {
                return [
                    'id' => $alt->id,
                    'slug' => $alt->slug,
                    'title_en' => $alt->title_en,
                    'title_ar' => $alt->title_ar ?: $alt->title_en,
                    'cover_image' => $alt->cover_url ?: ($alt->images->first()?->url ?? ''),
                    'bedrooms' => $alt->bedrooms,
                    'bathrooms' => $alt->bathrooms,
                    'max_guests' => $alt->max_guests,
                    'compound' => $alt->compound,
                    'location' => [
                        'name_en' => $alt->location?->name_en ?? 'El Gouna',
                        'name_ar' => $alt->location?->name_ar ?? 'الجونة',
                    ],
                    'price_formatted' => number_format(((int) $alt->base_price_cents) / 100) . ' ' . ($alt->currency ?? 'EGP'),
                    'base_price_cents' => (int) $alt->base_price_cents,
                ];
            })
            ->values();

        return response()->json([
            'is_available' => false,
            'conflict_type' => $checkResult->conflictType,
            'reason' => $checkResult->reason,
            'message_en' => 'This villa is reserved for your dates, but our VIP Concierge has curated these available alternative stays for your exact dates:',
            'message_ar' => 'هذه الفيلا غير متاحة في المواعيد المحددة، ولكن وفرنا لك بدائل فاخرة ومتاحة بنفس مواعيد رحلتك وبمواصفات مميزة تناسب احتياجك:',
            'alternatives' => $alternatives,
        ]);
    }
}
