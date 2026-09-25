<?php

namespace App\Services\Payment;

use App\Models\Booking;
use App\Models\PaymentTransaction;

interface PaymentGatewayInterface
{
    /**
     * Initiate a payment and return redirect URL or payment session data.
     *
     * @return array ['redirect_url' => string, 'transaction_id' => string, 'meta' => array]
     */
    public function createPayment(Booking $booking, int $amountCents, string $currency): array;

    /**
     * Capture/confirm a payment after user completes checkout.
     */
    public function capturePayment(string $gatewayReference): array;

    /**
     * Refund a completed payment, either partially or fully.
     */
    public function refundPayment(PaymentTransaction $transaction, int $refundAmountCents): array;

    /**
     * Query the current status of a transaction from the gateway.
     */
    public function getPaymentStatus(string $gatewayReference): string;

    /**
     * Process an incoming webhook payload.
     * Must verify signature and be idempotent.
     *
     * @return array ['status' => string, 'event_id' => string, 'amount_cents' => int]
     */
    public function handleWebhook(array $payload, string $signature): array;

    /**
     * Return the gateway driver code (card, paypal, cash, bank_transfer)
     */
    public function getDriverCode(): string;

    /**
     * Whether this gateway is in test/sandbox mode.
     */
    public function isTestMode(): bool;
}
