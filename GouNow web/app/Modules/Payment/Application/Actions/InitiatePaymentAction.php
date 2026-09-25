<?php

declare(strict_types=1);

namespace App\Modules\Payment\Application\Actions;

use App\Models\Booking;
use App\Models\PaymentTransaction;
use App\Modules\Payment\Application\DTOs\PaymentInitiationResultDTO;
use App\Services\Payment\PaymentService;
use InvalidArgumentException;

class InitiatePaymentAction
{
    public function __construct(
        private readonly PaymentService $paymentService
    ) {}

    public function execute(Booking $booking, ?int $amountCents = null): PaymentInitiationResultDTO
    {
        $method = $booking->paymentMethod;
        if (! $method) {
            throw new InvalidArgumentException('No payment method set on booking.');
        }

        if ($amountCents === null) {
            $amountCents = $booking->payment_type === 'deposit'
                ? (int) $booking->deposit_cents
                : (int) $booking->total_cents;
        }

        $gateway = $this->paymentService->resolveGateway($method);
        $result = $gateway->createPayment($booking, $amountCents, $booking->currency);

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

        $booking->update([
            'status' => 'awaiting_payment',
            'payment_status' => 'pending',
        ]);

        return new PaymentInitiationResultDTO(
            transactionId: $result['transaction_id'],
            transactionDbId: $transaction->id,
            redirectUrl: $result['redirect_url'] ?? null,
            amountCents: $amountCents,
            currency: $booking->currency,
            meta: $result['meta'] ?? []
        );
    }
}
