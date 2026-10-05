<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerApiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Customer::withCount('bookings')->orderByDesc('created_at');

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $paginator = $query->paginate(15);

        $items = collect($paginator->items())->map(function ($c) {
            $spent = (int) $c->bookings()->whereIn('status', ['confirmed', 'paid'])->sum('total_cents');

            return [
                'id' => $c->id,
                'first_name' => $c->first_name,
                'last_name' => $c->last_name,
                'full_name' => $c->full_name,
                'email' => $c->email,
                'phone' => $c->phone,
                'nationality' => $c->nationality,
                'country_of_residence' => $c->country_of_residence,
                'is_active' => (bool) $c->is_active,
                'bookings_count' => $c->bookings_count ?? 0,
                'total_spent_cents' => $spent,
                'formatted_total_spent' => number_format($spent / 100, 2).' EGP',
                'created_at' => $c->created_at ? $c->created_at->toIso8601String() : '',
            ];
        });

        return response()->json([
            'data' => $items,
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

    public function show(Request $request, int $id): JsonResponse
    {
        $customer = Customer::with(['bookings', 'leads'])->findOrFail($id);

        return response()->json([
            'data' => [
                'id' => $customer->id,
                'first_name' => $customer->first_name,
                'last_name' => $customer->last_name,
                'full_name' => $customer->full_name,
                'email' => $customer->email,
                'phone' => $customer->phone,
                'nationality' => $customer->nationality,
                'country_of_residence' => $customer->country_of_residence,
                'is_active' => (bool) $customer->is_active,
                'bookings' => $customer->bookings,
                'leads' => $customer->leads,
                'created_at' => $customer->created_at ? $customer->created_at->toIso8601String() : '',
            ],
        ]);
    }
}
