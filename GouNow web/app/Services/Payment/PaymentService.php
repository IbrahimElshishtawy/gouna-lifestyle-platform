<?php

declare(strict_types=1);

namespace App\Services\Payment;

use App\Models\Booking;
use App\Models\PaymentMethod;
use App\Models\PaymentTransaction;
use App\Modules\Payment\Application\Actions\ConfirmPaymentAction;
use App\Modules\Payment\Application\Actions\FailPaymentAction;
use App\Modules\Payment\Application\Actions\InitiatePaymentAction;
use App\Modules\Payment\Application\Actions\ProcessPaymentWebhookAction;
use App\Modules\Payment\Application\Actions\RecordManualPaymentAction;
use App\Services\BookingService;
use App\Services\Payment\Gateways\CardGateway;
use App\Services\Payment\Gateways\ManualBankTransferGateway;
use App\Services\Payment\Gateways\ManualCashGateway;
use App\Services\Payment\Gateways\PayPalGateway;
use DateTimeInterface;
use InvalidArgumentException;

/**
 * Payment Service (Backward-compatibility adapter delegating to Modular Payment actions).
 */
class PaymentService
{
    public function __construct(
        private readonly ?BookingService $bookingService = null,
        private readonly ?InitiatePaymentAction $initiateAction = null,
        private readonly ?ConfirmPaymentAction $confirmAction = null,
        private readonly ?FailPaymentAction $failAction = null,
        private readonly ?ProcessPaymentWebhookAction $webhookAction = null,
        private readonly ?RecordManualPaymentAction $manualPaymentAction = null,
    ) {}

    private function getInitiateAction(): InitiatePaymentAction
    {
        return $this->initiateAction ?? app(InitiatePaymentAction::class);
    }

    private function getConfirmAction(): ConfirmPaymentAction
    {
        return $this->confirmAction ?? app(ConfirmPaymentAction::class);
    }

    private function getFailAction(): FailPaymentAction
    {
        return $this->failAction ?? app(FailPaymentAction::class);
    }

    private function getWebhookAction(): ProcessPaymentWebhookAction
    {
        return $this->webhookAction ?? app(ProcessPaymentWebhookAction::class);
    }

    private function getManualPaymentAction(): RecordManualPaymentAction
    {
        return $this->manualPaymentAction ?? app(RecordManualPaymentAction::class);
    }

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
            default => throw new InvalidArgumentException("No gateway driver for payment method: {$method->code}"),
        };
    }

    /**
     * Initiate payment for a booking. Creates a pending transaction record.
     */
    public function initiatePayment(Booking $booking, ?int $amountCents = null): array
    {
        $result = $this->getInitiateAction()->execute($booking, $amountCents);
        return $result->toArray();
    }

    /**
     * Mark a payment transaction as failed.
     */
    public function failPayment(string $transactionId, ?string $reason = null): PaymentTransaction
    {
        return $this->getFailAction()->execute($transactionId, $reason);
    }

    /**
     * Confirm a completed payment (called from webhook or callback).
     * Idempotent: will not double-process.
     */
    public function confirmPayment(string $transactionId, string $gatewayReference): PaymentTransaction
    {
        return $this->getConfirmAction()->execute($transactionId, $gatewayReference);
    }

    /**
     * Process a webhook event. Idempotent via webhook_event_id.
     */
    public function processWebhook(PaymentMethod $method, array $payload, string $signature): void
    {
        $this->getWebhookAction()->execute($method, $payload, $signature);
    }

    /**
     * Record a manual payment by an admin.
     */
    public function recordManualPayment(
        Booking $booking,
        int $amountCents,
        string $paymentMethodCode,
        string $reference,
        DateTimeInterface $paymentDate,
        int $adminUserId,
        ?string $notes = null
    ): PaymentTransaction {
        return $this->getManualPaymentAction()->execute(
            $booking,
            $amountCents,
            $paymentMethodCode,
            $reference,
            $paymentDate,
            $adminUserId,
            $notes
        );
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
