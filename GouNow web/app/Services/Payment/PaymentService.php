<?php

namespace App\Services\Payment;

use App\Models\Booking;
use App\Models\PaymentMethod;
use App\Models\PaymentTransaction;
use App\Services\BookingService;
use App\Services\Payment\Gateways\CardGateway;
use App\Services\Payment\Gateways\ManualBankTransferGateway;
use App\Services\Payment\Gateways\ManualCashGateway;
use App\Services\Payment\Gateways\PayPalGateway;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PaymentService
{
    public function __construct(
        private BookingService $bookingService
    ) {}

    /**
     * Resolve the appropriate gateway instance for a payment method.
     */
    public function resolveGateway(PaymentMethod $method): PaymentGatewayInterface
    {
        $config = $method->configuration ?? [];

        return match($method->code) {
            'card' => new CardGateway(array_merge($config, ['test_mode' => $method->test_mode])),
            'paypal' => new PayPalGateway(array_merge($config, ['test_mode' => $method->test_mode])),
            'bank_transfer' => new ManualBankTransferGateway($config),
            'cash' => new ManualCashGateway(),
            default => throw new \InvalidArgumentException("No gateway driver for payment method: {$method->code}"),
        };
    }

    /**
     * Initiate payment for a booking. Creates a pending transaction record.
     * Returns data for the frontend to redirect/display.
     */
    public function initiatePayment(Booking $booking, ?int $amountCents = null): array
    {
        $method = $booking->paymentMethod;
        if (! $method) {
            throw new \InvalidArgumentException('No payment method set on booking.');
        }

        // Default to required upfront deposit or total amount
        if ($amountCents === null) {
            $amountCents = $booking->payment_type === 'deposit'
                ? (int) $booking->deposit_cents
                : (int) $booking->total_cents;
        }

        $gateway = $this->resolveGateway($method);
        $result = $gateway->createPayment($booking, $amountCents, $booking->currency);

        // Create transaction record
        $transaction = PaymentTransaction::create([
            'transaction_id' => $result['transaction_id'],
            'booking_id' => $booking->id,
            'customer_id' => $booking->customer_id,
            'payment_method_id' => $method->id,
            'amount_cents' => $amountCents,
            'currency' => $booking->currency,
            'type' => $booking->payment_type === 'deposit' ? 'deposit' : 'payment',
            'status' => 'pending',
            'gateway_provider' => $gateway->getDriverCode(),
        ]);

        // Update booking status
        $booking->update([
            'status' => 'awaiting_payment',
            'payment_status' => 'pending',
        ]);

        return array_merge($result, [
            'transaction_db_id' => $transaction->id,
            'amount_cents' => $amountCents,
            'currency' => $booking->currency,
        ]);
    }

    /**
     * Mark a payment transaction as failed.
     */
    public function failPayment(string $transactionId, ?string $reason = null): PaymentTransaction
    {
        return DB::transaction(function () use ($transactionId, $reason) {
            $transaction = PaymentTransaction::where('transaction_id', $transactionId)
                ->lockForUpdate()
                ->firstOrFail();

            $transaction->update([
                'status' => 'failed',
                'failure_reason' => $reason ?? 'Payment declined by gateway or user cancelled.',
            ]);

            $booking = $transaction->booking;
            if ($booking) {
                $booking->update(['payment_status' => 'failed']);
            }

            return $transaction;
        });
    }

    /**
     * Confirm a completed payment (called from webhook or test mode callback).
     * Idempotent: will not double-process.
     */
    public function confirmPayment(string $transactionId, string $gatewayReference): PaymentTransaction
    {
        return DB::transaction(function () use ($transactionId, $gatewayReference) {
            $transaction = PaymentTransaction::where('transaction_id', $transactionId)
                ->lockForUpdate()
                ->firstOrFail();

            if ($transaction->status === 'completed') {
                return $transaction; // idempotent
            }

            $transaction->update([
                'status' => 'completed',
                'gateway_reference' => $gatewayReference,
                'completed_at' => now(),
            ]);

            // Update booking financials
            $this->bookingService->recordPayment(
                $transaction->booking,
                $transaction->amount_cents,
                $transaction->type
            );

            return $transaction;
        });
    }

    /**
     * Process a webhook event. Idempotent via webhook_event_id.
     */
    public function processWebhook(PaymentMethod $method, array $payload, string $signature): void
    {
        $gateway = $this->resolveGateway($method);
        $result = $gateway->handleWebhook($payload, $signature);

        if (! isset($result['event_id'])) {
            return;
        }

        // Prevent duplicate processing
        if (PaymentTransaction::where('webhook_event_id', $result['event_id'])->exists()) {
            return;
        }

        $transaction = PaymentTransaction::where('gateway_reference', $result['event_id'])->first();
        if ($transaction) {
            $transaction->update(['webhook_event_id' => $result['event_id'], 'webhook_processed' => true]);

            if ($result['status'] === 'completed') {
                $this->confirmPayment($transaction->transaction_id, $result['event_id']);
            }
        }
    }

    /**
     * Record a manual payment by an admin.
     */
    public function recordManualPayment(
        Booking $booking,
        int $amountCents,
        string $paymentMethodCode,
        string $reference,
        \DateTime $paymentDate,
        int $adminUserId,
        ?string $notes = null
    ): PaymentTransaction {
        return DB::transaction(function () use (
            $booking, $amountCents, $paymentMethodCode, $reference, $paymentDate, $adminUserId, $notes
        ) {
            $transaction = PaymentTransaction::create([
                'transaction_id' => 'MANUAL-' . Str::upper(Str::random(12)),
                'booking_id' => $booking->id,
                'customer_id' => $booking->customer_id,
                'payment_method_id' => $booking->payment_method_id,
                'amount_cents' => $amountCents,
                'currency' => $booking->currency,
                'type' => 'payment',
                'status' => 'completed',
                'gateway_provider' => $paymentMethodCode,
                'manual_reference' => $reference,
                'manual_payment_date' => $paymentDate,
                'manual_notes' => $notes,
                'recorded_by' => $adminUserId,
                'completed_at' => now(),
            ]);

            $this->bookingService->recordPayment($booking, $amountCents);

            return $transaction;
        });
    }

    /**
     * Initiate a refund.
     */
    public function initiateRefund(
        PaymentTransaction $transaction,
        int $refundAmountCents,
        string $reason,
        int $adminUserId
    ): array {
        $method = $transaction->paymentMethod;
        $gateway = $this->resolveGateway($method);
        $result = $gateway->refundPayment($transaction, $refundAmountCents);

        $transaction->update([
            'refund_amount_cents' => $refundAmountCents,
            'refund_reason' => $reason,
            'refunded_at' => now(),
        ]);

        return $result;
    }
}
