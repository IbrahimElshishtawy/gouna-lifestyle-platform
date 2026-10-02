<?php

namespace App\Http\Controllers\Api\V1\Webhooks;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\PaymentTransaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentWebhookController extends Controller
{
    /**
     * Handle incoming payment gateway webhooks.
     */
    public function handle(Request $request): JsonResponse
    {
        $payload = $request->all();
        $reference = $request->input('reference') ?? $request->input('order_id') ?? $request->input('obj.order.merchant_order_id');
        $status = strtolower((string) ($request->input('status') ?? ($request->boolean('success') ? 'success' : 'failed')));

        Log::info('Payment Webhook Received', [
            'reference' => $reference,
            'status' => $status,
            'ip' => $request->ip(),
        ]);

        if (! $reference) {
            return response()->json(['message' => 'Missing reference identifier.'], 400);
        }

        DB::transaction(function () use ($reference, $status, $payload) {
            $booking = Booking::where('reference', $reference)->first();

            if ($booking) {
                if (in_array($status, ['success', 'completed', 'paid', 'approved'])) {
                    $booking->update([
                        'status' => 'confirmed',
                        'payment_status' => 'paid',
                        'amount_paid_cents' => $booking->total_cents,
                        'amount_remaining_cents' => 0,
                    ]);

                    PaymentTransaction::updateOrCreate(
                        ['booking_id' => $booking->id, 'transaction_id' => $payload['transaction_id'] ?? 'wh-'.uniqid()],
                        [
                            'amount_cents' => $booking->total_cents,
                            'currency' => $booking->currency ?: 'EGP',
                            'status' => 'completed',
                            'payload' => json_encode($payload),
                        ]
                    );
                } elseif (in_array($status, ['failed', 'declined', 'cancelled'])) {
                    $booking->update([
                        'payment_status' => 'failed',
                    ]);
                }
            }
        });

        $requestId = $request->attributes->get('request_id');

        return response()->json([
            'data' => [
                'acknowledged' => true,
                'reference' => $reference,
            ],
            'meta' => [
                'request_id' => $requestId,
                'timestamp' => now()->toIso8601String(),
            ],
        ], 200);
    }
}
