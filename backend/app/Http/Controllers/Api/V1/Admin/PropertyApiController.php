<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Property;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PropertyApiController extends Controller
{
    /**
     * Display a listing of all properties (both active and paused) for admin management.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Property::with(['category', 'location', 'images'])
            ->orderByDesc('created_at');

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
        $totalProperties = Property::count();
        $publishedCount = Property::where('is_published', true)->count();
        $pausedCount = Property::where('is_published', false)->count();
        $rentCount = Property::where('listing_type', 'rent')->count();
        $saleCount = Property::where('listing_type', 'sale')->count();

        $paginator = $query->paginate(15);

        $items = collect($paginator->items())->map(function (Property $p) {
            $priceCents = $p->listing_type === 'sale'
                ? ($p->sale_price_cents ?? $p->base_price_cents)
                : $p->base_price_cents;
            $currency = $p->currency ?? 'EGP';
            $primaryImg = $p->images->first()?->url ?? '/assets/images/bg-sand-texture.jpg';

            return [
                'id' => $p->id,
                'reference_number' => $p->reference_number,
                'slug' => $p->slug,
                'title_en' => $p->title_en,
                'title_ar' => $p->title_ar,
                'listing_type' => $p->listing_type,
                'bedrooms' => $p->bedrooms,
                'bathrooms' => $p->bathrooms,
                'max_guests' => $p->max_guests,
                'area_sqm' => $p->area_sqm,
                'compound' => $p->compound,
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
     * Show single property details for admin.
     */
    public function show(int $id): JsonResponse
    {
        $property = Property::with(['category', 'location', 'images', 'amenities'])->findOrFail($id);

        return response()->json([
            'data' => $property,
        ]);
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
            'base_price_cents' => ['nullable', 'integer', 'min:0'],
            'sale_price_cents' => ['nullable', 'integer', 'min:0'],
            'is_published' => ['nullable', 'boolean'],
            'is_featured' => ['nullable', 'boolean'],
            'is_available' => ['nullable', 'boolean'],
        ]);

        $property->update($validated);

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
            'data' => $property,
        ]);
    }
}
