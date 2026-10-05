<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Booking;
use App\Models\PaymentTransaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookingApiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Booking::with(['customer', 'bookable'])->orderByDesc('created_at');

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('reference', 'like', "%{$search}%")
                    ->orWhereHas('customer', function ($cq) use ($search) {
                        $cq->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        $paginator = $query->paginate(15);

        $items = collect($paginator->items())->map(function ($b) {
            return [
                'id' => $b->id,
                'reference' => $b->reference,
                'customer' => [
                    'id' => $b->customer?->id ?? 0,
                    'name' => $b->customer ? $b->customer->full_name : 'Guest User',
                    'email' => $b->customer?->email ?? '',
                    'phone' => $b->customer?->phone ?? null,
                ],
                'bookable' => [
                    'id' => $b->bookable?->id ?? 0,
                    'title' => $b->bookable?->title ?? 'Luxury Unit',
                    'title_ar' => $b->bookable?->title_ar ?? null,
                    'slug' => $b->bookable?->slug ?? '',
                    'type' => 'property',
                ],
                'check_in' => $b->check_in ? $b->check_in->toDateString() : '',
                'check_out' => $b->check_out ? $b->check_out->toDateString() : '',
                'nights' => $b->nights ?? 1,
                'guests' => $b->guests ?? 1,
                'total_cents' => (int) $b->total_cents,
                'formatted_total' => number_format(((int) $b->total_cents) / 100, 2).' '.($b->currency ?? 'EGP'),
                'amount_paid_cents' => (int) $b->amount_paid_cents,
                'formatted_paid' => number_format(((int) $b->amount_paid_cents) / 100, 2).' '.($b->currency ?? 'EGP'),
                'currency' => $b->currency ?? 'EGP',
                'status' => $b->status ?? 'pending',
                'payment_status' => $b->payment_status ?? 'pending',
                'created_at' => $b->created_at ? $b->created_at->toIso8601String() : '',
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

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'status' => ['required', 'string', 'in:pending,confirmed,cancelled,completed'],
        ]);

        $booking = Booking::findOrFail($id);
        $oldStatus = $booking->status;
        $newStatus = $request->input('status');

        $booking->update([
            'status' => $newStatus,
            'cancelled_at' => $newStatus === 'cancelled' ? now() : $booking->cancelled_at,
        ]);

        ActivityLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'booking_status_updated',
            'entity_type' => 'Booking',
            'entity_id' => $booking->id,
            'description' => "Booking {$booking->reference} status changed from {$oldStatus} to {$newStatus}.",
            'old_values' => ['status' => $oldStatus],
            'new_values' => ['status' => $newStatus],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Booking status updated successfully to {$newStatus}.",
            'data' => [
                'id' => $booking->id,
                'status' => $booking->status,
            ],
        ]);
    }

    public function refund(Request $request, int $id): JsonResponse
    {
        $booking = Booking::findOrFail($id);
        $refundAmountCents = $request->input('amount_cents', $booking->amount_paid_cents);

        $booking->update([
            'payment_status' => 'refunded',
            'status' => 'cancelled',
            'refund_amount_cents' => $refundAmountCents,
            'cancelled_at' => now(),
            'cancellation_reason' => $request->input('reason', 'Administrative refund processed'),
        ]);

        // Record refund transaction
        PaymentTransaction::create([
            'booking_id' => $booking->id,
            'customer_id' => $booking->customer_id,
            'payment_method_id' => $booking->payment_method_id,
            'transaction_type' => 'refund',
            'amount_cents' => $refundAmountCents,
            'currency' => $booking->currency ?? 'EGP',
            'status' => 'successful',
            'gateway' => 'manual_admin',
            'gateway_reference' => 'REF-'.strtoupper(uniqid()),
        ]);

        ActivityLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'booking_refund_issued',
            'entity_type' => 'Booking',
            'entity_id' => $booking->id,
            'description' => "Refund of {$refundAmountCents} cents processed for booking {$booking->reference}.",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Refund processed successfully.',
        ]);
    }
}
