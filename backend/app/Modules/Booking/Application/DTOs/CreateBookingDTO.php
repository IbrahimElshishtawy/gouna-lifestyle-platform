<?php

declare(strict_types=1);

namespace App\Modules\Booking\Application\DTOs;

use App\Models\Customer;
use App\Models\PaymentMethod;
use App\Models\Property;
use Carbon\Carbon;

final class CreateBookingDTO
{
    public function __construct(
        public readonly Property $property,
        public readonly Customer $customer,
        public readonly Carbon $checkIn,
        public readonly Carbon $checkOut,
        public readonly int $guests,
        public readonly string $paymentType, // 'full' | 'deposit'
        public readonly PaymentMethod $paymentMethod,
        public readonly ?string $promoCode = null,
        public readonly ?string $source = 'website_checkout',
        public readonly ?string $internalNotes = null,
    ) {}
}
