<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaymentMethod;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminPaymentMethodController extends Controller
{
    /**
     * Public list of enabled payment methods for checkout.
     */
    public function publicList(Request $request): JsonResponse
    {
        $locale = app()->getLocale();

        $methods = PaymentMethod::where('is_enabled', true)
            ->orderBy('sort_order')
            ->get()
            ->map(function (PaymentMethod $m) use ($locale) {
                return [
                    'id' => $m->id,
                    'code' => $m->code,
                    'name' => $m->name,
                    'description' => $m->description,
                    'logo' => $m->logo,
                    'is_online' => (bool) $m->is_online,
                    'instructions' => $m->instructions,
                    'instructions_en' => $m->instructions_en,
                    'instructions_ar' => $m->instructions_ar,
                    'supported_currencies' => $m->supported_currencies,
                    'configuration' => $m->is_online ? null : $m->configuration, // Only expose public bank/wallet details for manual transfers
                ];
            });

        return response()->json([
            'data' => $methods,
        ]);
    }

    /**
     * Admin list of all payment methods.
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorizeAdmin($request);

        $methods = PaymentMethod::orderBy('sort_order')->get();

        return response()->json([
            'data' => $methods,
        ]);
    }

    /**
     * Admin update payment method instructions, configuration, or active state.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $this->authorizeAdmin($request);

        $method = PaymentMethod::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:100',
            'description' => 'nullable|string|max:500',
            'is_enabled' => 'sometimes|boolean',
            'instructions_en' => 'nullable|string',
            'instructions_ar' => 'nullable|string',
            'configuration' => 'nullable|array',
            'sort_order' => 'sometimes|integer',
        ]);

        $method->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Payment method updated successfully.',
            'data' => $method->fresh(),
        ]);
    }

    private function authorizeAdmin(Request $request): User
    {
        /** @var User|null $user */
        $user = $request->user('sanctum') ?? auth()->user();

        if (! $user) {
            abort(401, 'Unauthenticated.');
        }

        if (! ($user->is_admin || $user->hasRole('super_admin') || $user->hasRole('finance'))) {
            abort(403, 'Unauthorized. Requires Finance or Super Admin privileges.');
        }

        return $user;
    }
}
