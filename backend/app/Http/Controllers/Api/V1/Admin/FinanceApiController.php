<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaymentTransaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FinanceApiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = PaymentTransaction::with(['booking', 'customer'])->orderByDesc('created_at');

        if ($type = $request->query('type')) {
            $query->where('transaction_type', $type);
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $paginator = $query->paginate(20);

        $items = collect($paginator->items())->map(function ($tx) {
            return [
                'id' => $tx->id,
                'booking_id' => $tx->booking_id,
                'booking_reference' => $tx->booking?->reference,
                'customer_name' => $tx->customer ? $tx->customer->full_name : null,
                'payment_method' => $tx->paymentMethod?->name ?? 'Credit Card',
                'gateway' => $tx->gateway ?? 'stripe',
                'gateway_reference' => $tx->gateway_reference,
                'type' => $tx->transaction_type ?? 'charge',
                'status' => $tx->status ?? 'successful',
                'amount_cents' => (int) $tx->amount_cents,
                'formatted_amount' => number_format(((int) $tx->amount_cents) / 100, 2).' '.($tx->currency ?? 'EGP'),
                'currency' => $tx->currency ?? 'EGP',
                'created_at' => $tx->created_at ? $tx->created_at->toIso8601String() : '',
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

    public function summary(Request $request): JsonResponse
    {
        $charges = (int) PaymentTransaction::where('status', 'successful')
            ->whereIn('transaction_type', ['charge', 'deposit'])
            ->sum('amount_cents');

        $refunds = (int) PaymentTransaction::where('status', 'successful')
            ->where('transaction_type', 'refund')
            ->sum('amount_cents');

        $net = $charges - $refunds;
        $count = PaymentTransaction::count();

        return response()->json([
            'data' => [
                'totalRevenueCents' => $charges,
                'totalRefundsCents' => $refunds,
                'netRevenueCents' => $net,
                'formattedTotalRevenue' => number_format($charges / 100, 2).' EGP',
                'formattedTotalRefunds' => number_format($refunds / 100, 2).' EGP',
                'formattedNetRevenue' => number_format($net / 100, 2).' EGP',
                'transactionCount' => $count,
            ],
            'meta' => [
                'request_id' => $request->attributes->get('request_id'),
                'timestamp' => now()->toIso8601String(),
            ],
        ]);
    }
}
