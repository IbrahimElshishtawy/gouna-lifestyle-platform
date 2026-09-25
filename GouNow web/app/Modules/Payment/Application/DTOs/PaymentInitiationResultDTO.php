<?php

declare(strict_types=1);

namespace App\Modules\Payment\Application\DTOs;

use JsonSerializable;

final class PaymentInitiationResultDTO implements JsonSerializable
{
    public function __construct(
        public readonly string $transactionId,
        public readonly int $transactionDbId,
        public readonly ?string $redirectUrl,
        public readonly int $amountCents,
        public readonly string $currency,
        public readonly array $meta = [],
    ) {}

    public function toArray(): array
    {
        return [
            'transaction_id' => $this->transactionId,
            'transaction_db_id' => $this->transactionDbId,
            'redirect_url' => $this->redirectUrl,
            'amount_cents' => $this->amountCents,
            'currency' => $this->currency,
            'meta' => $this->meta,
        ];
    }

    public function jsonSerialize(): array
    {
        return $this->toArray();
    }
}
