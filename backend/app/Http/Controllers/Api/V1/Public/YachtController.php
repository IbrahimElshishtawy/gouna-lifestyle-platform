<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Models\Yacht;
use App\Support\Traits\AppliesListingStandard;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class YachtController extends Controller
{
    use AppliesListingStandard;

    /**
     * Display a listing of active yachts.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Yacht::with(['location', 'packages', 'addons'])
            ->where('status', 'active');

        if ($search = $request->input('q')) {
            $query->where(function ($q) use ($search) {
                $q->where('name_en', 'like', "%{$search}%")
                    ->orWhere('name_ar', 'like', "%{$search}%")
                    ->orWhere('brand', 'like', "%{$search}%")
                    ->orWhere('model', 'like', "%{$search}%")
                    ->orWhere('marina_berth', 'like', "%{$search}%");
            });
        }

        if ($request->filled('yacht_type')) {
            $query->where('yacht_type', $request->input('yacht_type'));
        }

        if ($request->filled('category')) {
            $query->where('category', $request->input('category'));
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
     * Display a specific yacht by slug or id.
     */
    public function show(string $slug): JsonResponse
    {
        $yacht = Yacht::where(function ($q) use ($slug) {
            $q->where('slug', $slug)
                ->orWhere('id', is_numeric($slug) ? (int) $slug : 0);
        })
            ->where('status', 'active')
            ->with(['location', 'packages', 'addons'])
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $yacht,
        ]);
    }
}
