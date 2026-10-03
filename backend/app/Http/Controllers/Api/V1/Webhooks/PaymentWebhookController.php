<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Webhooks;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\PaymentTransaction;
use App\Modules\Booking\Domain\Enums\BookingStatus;
use App\Modules\Booking\Domain\Services\BookingStateMachine;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentWebhookController extends Controller
{
    public function __construct(
        private readonly BookingStateMachine $stateMachine
    ) {}

    /**
     * Handle incoming payment gateway webhooks with cryptographic authenticity and financial integrity.
     */
    public function handle(Request $request): JsonResponse
    {
        $payload = $request->all();
        $requestId = (string) $request->attributes->get('request_id', uniqid('req_'));

        // Extract reference, transaction identifier, amount, currency, and status
        $reference = $request->input('reference')
            ?? $request->input('order_id')
            ?? $request->input('obj.order.merchant_order_id');

        $transactionId = (string) ($request->input('transaction_id')
            ?? $request->input('id')
            ?? $request->input('obj.id'));

        $amountCents = $request->input('amount_cents')
            ?? $request->input('obj.amount_cents')
            ?? ($request->has('amount') ? (int) round(((float) $request->input('amount')) * 100) : null);

        $currency = $request->input('currency')
            ?? $request->input('obj.currency');

        // Determine success vs failure
        $isSuccess = false;
        if ($request->has('obj.success')) {
            $isSuccess = (bool) $request->input('obj.success');
        } elseif ($request->has('success')) {
            $isSuccess = $request->boolean('success');
        } elseif ($request->has('status')) {
            $statusStr = strtolower((string) $request->input('status'));
            $isSuccess = in_array($statusStr, ['success', 'completed', 'paid', 'approved', 'captured'], true);
        }

        Log::info('Payment Webhook Authenticated and Processing', [
            'request_id' => $requestId,
            'reference' => $reference,
            'transaction_id' => $transactionId,
            'is_success' => $isSuccess,
            'ip' => $request->ip(),
        ]);

        if (empty($reference)) {
            return $this->errorResponse('MISSING_REFERENCE_IDENTIFIER', 'Missing order/booking reference identifier.', 400, $requestId);
        }

        if (empty($transactionId)) {
            return $this->errorResponse('MISSING_TRANSACTION_IDENTIFIER', 'Missing provider transaction identifier.', 400, $requestId);
        }

        $booking = Booking::where('reference', $reference)->first();
        if (! $booking) {
            return $this->errorResponse('BOOKING_NOT_FOUND', "Booking reference {$reference} not found.", 404, $requestId);
        }

        // Execute financial state mutation within atomic transaction and pessimistic row locking
        $result = DB::transaction(function () use (
            $booking,
            $transactionId,
            $amountCents,
            $currency,
            $isSuccess,
            $payload,
            $requestId
        ) {
            /** @var Booking $lockedBooking */
            $lockedBooking = Booking::where('id', $booking->id)
                ->lockForUpdate()
                ->firstOrFail();

            // 1. Replay / Duplicate Webhook Idempotency Check
            $existingTx = PaymentTransaction::where('webhook_event_id', $transactionId)
                ->orWhere('transaction_id', $transactionId)
                ->lockForUpdate()
                ->first();

            if ($existingTx && $existingTx->status === 'completed') {
                return [
                    'status' => 'acknowledged',
                    'replayed' => true,
                    'reference' => $lockedBooking->reference,
                    'transaction_id' => $transactionId,
                ];
            }

            // 2. State Transition Security: verify booking is in an acceptable state for payment confirmation
            $currentStatus = BookingStatus::tryFrom($lockedBooking->status);
            $disallowedStatuses = [BookingStatus::CANCELLED, BookingStatus::REFUNDED];

            if ($isSuccess && in_array($currentStatus, $disallowedStatuses, true)) {
                return [
                    'error' => [
                        'code' => 'INVALID_STATE_TRANSITION',
                        'message' => "Cannot apply payment confirmation to a booking with status '{$lockedBooking->status}'.",
                        'status_code' => 409,
                    ],
                ];
            }

            // 3. Amount Integrity Verification
            if ($isSuccess && $amountCents !== null) {
                $expectedAmountCents = (int) $lockedBooking->total_cents;
                if ((int) $amountCents < $expectedAmountCents) {
                    Log::warning('Payment Webhook Amount Mismatch Rejected', [
                        'booking_reference' => $lockedBooking->reference,
                        'expected_cents' => $expectedAmountCents,
                        'received_cents' => $amountCents,
                    ]);

                    return [
                        'error' => [
                            'code' => 'AMOUNT_MISMATCH',
                            'message' => "Received payment amount ({$amountCents}) is less than expected ({$expectedAmountCents}).",
                            'status_code' => 422,
                        ],
                    ];
                }
            }

            // 4. Currency Integrity Verification
            if ($isSuccess && $currency !== null) {
                $expectedCurrency = strtoupper((string) ($lockedBooking->currency ?: 'EGP'));
                $receivedCurrency = strtoupper((string) $currency);

                if ($receivedCurrency !== $expectedCurrency) {
                    Log::warning('Payment Webhook Currency Mismatch Rejected', [
                        'booking_reference' => $lockedBooking->reference,
                        'expected_currency' => $expectedCurrency,
                        'received_currency' => $receivedCurrency,
                    ]);

                    return [
                        'error' => [
                            'code' => 'CURRENCY_MISMATCH',
                            'message' => "Received currency '{$receivedCurrency}' does not match expected '{$expectedCurrency}'.",
                            'status_code' => 422,
                        ],
                    ];
                }
            }

            // 5. Apply Financial Mutation
            $sanitizedPayload = $this->sanitizePayload($payload);

            if ($isSuccess) {
                $lockedBooking->amount_paid_cents = $lockedBooking->total_cents;
                $lockedBooking->amount_remaining_cents = 0;
                $lockedBooking->payment_status = 'paid';
                $lockedBooking->save();

                // Transition booking status to CONFIRMED via domain state machine
                if ($lockedBooking->status !== BookingStatus::CONFIRMED->value) {
                    $this->stateMachine->transition(
                        booking: $lockedBooking,
                        targetStatus: BookingStatus::CONFIRMED,
                        actor: null,
                        context: [
                            'transaction_id' => $transactionId,
                            'source' => 'payment_webhook',
                            'request_id' => $requestId,
                        ]
                    );
                }

                PaymentTransaction::updateOrCreate(
                    [
                        'booking_id' => $lockedBooking->id,
                        'transaction_id' => $transactionId,
                    ],
                    [
                        'amount_cents' => $lockedBooking->total_cents,
                        'currency' => $lockedBooking->currency ?: 'EGP',
                        'status' => 'completed',
                        'webhook_event_id' => $transactionId,
                        'webhook_processed' => true,
                        'completed_at' => now(),
                        'payload' => json_encode($sanitizedPayload),
                    ]
                );

                return [
                    'status' => 'confirmed',
                    'replayed' => false,
                    'reference' => $lockedBooking->reference,
                    'transaction_id' => $transactionId,
                ];
            }

            // Failed / Declined Transaction
            $lockedBooking->payment_status = 'failed';
            $lockedBooking->save();

            PaymentTransaction::updateOrCreate(
                [
                    'booking_id' => $lockedBooking->id,
                    'transaction_id' => $transactionId,
                ],
                [
                    'amount_cents' => $lockedBooking->total_cents,
                    'currency' => $lockedBooking->currency ?: 'EGP',
                    'status' => 'failed',
                    'webhook_event_id' => $transactionId,
                    'webhook_processed' => true,
                    'payload' => json_encode($sanitizedPayload),
                ]
            );

            return [
                'status' => 'payment_failed',
                'replayed' => false,
                'reference' => $lockedBooking->reference,
                'transaction_id' => $transactionId,
            ];
        });

        if (isset($result['error'])) {
            return $this->errorResponse(
                $result['error']['code'],
                $result['error']['message'],
                $result['error']['status_code'],
                $requestId
            );
        }

        return response()->json([
            'data' => [
                'acknowledged' => true,
                'reference' => $result['reference'],
                'transaction_id' => $result['transaction_id'],
                'status' => $result['status'],
                'replayed' => $result['replayed'] ?? false,
            ],
            'meta' => [
                'request_id' => $requestId,
                'timestamp' => now()->toIso8601String(),
            ],
        ], 200);
    }

    /**
     * Sanitize webhook payload before persistence to prevent storing sensitive card or auth data.
     *
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function sanitizePayload(array $payload): array
    {
        $sensitiveKeys = [
            'password', 'token', 'secret', 'cvv', 'cvc', 'pan',
            'card_number', 'credit_card', 'pin', 'authorization',
        ];

        array_walk_recursive($payload, function (&$value, $key) use ($sensitiveKeys) {
            if (is_string($key) && in_array(strtolower($key), $sensitiveKeys, true)) {
                $value = '[REDACTED]';
            }
        });

        return $payload;
    }

    private function errorResponse(string $code, string $message, int $status, string $requestId): JsonResponse
    {
        return response()->json([
            'error' => [
                'code' => $code,
                'message' => $message,
                'details' => null,
                'request_id' => $requestId,
                'timestamp' => now()->toIso8601String(),
            ],
        ], $status);
    }
}
