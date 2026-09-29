<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Booking;
use App\Models\Customer;
use App\Models\PaymentMethod;
use App\Models\Property;
use App\Modules\Booking\Application\Actions\CancelBookingAction;
use App\Modules\Booking\Application\Actions\CreateBookingAction;
use App\Modules\Booking\Application\Actions\RecordBookingPaymentAction;
use App\Modules\Booking\Application\DTOs\CreateBookingDTO;
use App\Shared\Domain\ValueObjects\BookingReference;
use Carbon\Carbon;
use InvalidArgumentException;

/**
 * Booking Service (Backward-compatibility adapter delegating to Modular Booking actions).
 */
class BookingService
{
    public function __construct(
        private ?PricingService $pricingService = null,
        private ?AvailabilityService $availabilityService = null,
        private ?CreateBookingAction $createBookingAction = null,
        private ?CancelBookingAction $cancelBookingAction = null,
        private ?RecordBookingPaymentAction $recordBookingPaymentAction = null,
    ) {}

    private function getPricingService(): PricingService
    {
        return $this->pricingService ?? app(PricingService::class);
    }

    private function getAvailabilityService(): AvailabilityService
    {
        return $this->availabilityService ?? app(AvailabilityService::class);
    }

    private function getCreateBookingAction(): CreateBookingAction
    {
        return $this->createBookingAction ?? app(CreateBookingAction::class);
    }

    private function getCancelBookingAction(): CancelBookingAction
    {
        return $this->cancelBookingAction ?? app(CancelBookingAction::class);
    }

    private function getRecordPaymentAction(): RecordBookingPaymentAction
    {
        return $this->recordBookingPaymentAction ?? app(RecordBookingPaymentAction::class);
    }

    /**
     * Generate a fast calculation quote for checkout or frontend pricing display.
     */
    public function getQuote(
        Property $property,
        Carbon $checkIn,
        Carbon $checkOut,
        int $guests = 1,
        ?string $promoCode = null
    ): array {
        // Enforce guest capacity
        if ($guests > $property->max_guests) {
            throw new InvalidArgumentException(
                "Maximum allowable guests for {$property->title_en} is {$property->max_guests}."
            );
        }

        // Validate date order
        if ($checkIn->gte($checkOut)) {
            throw new InvalidArgumentException('Check-out date must be after check-in date.');
        }

        $isAvailable = $this->getAvailabilityService()->isAvailable($property, $checkIn, $checkOut);
        if (! $isAvailable) {
            throw new InvalidArgumentException('The property is not available for the selected dates.');
        }

        $pricing = $this->getPricingService()->calculateBooking($property, $checkIn, $checkOut, $guests, $promoCode);
        if (! $pricing['satisfies_min_stay']) {
            throw new InvalidArgumentException(
                "Minimum stay for the selected dates is {$pricing['min_stay_required']} nights."
            );
        }

        // Allowed payment options for this property
        $allowedPaymentMethods = $property->paymentMethods()
            ->wherePivot('is_enabled', true)
            ->where('payment_methods.is_enabled', true)
            ->get();
        if ($allowedPaymentMethods->isEmpty()) {
            $allowedPaymentMethods = PaymentMethod::enabled()->get();
        }

        return array_merge($pricing, [
            'is_available' => $isAvailable,
            'booking_mode' => $property->booking_mode,
            'payment_requirement' => $property->payment_requirement,
            'allowed_payment_methods' => $allowedPaymentMethods,
            'property_id' => $property->id,
            'property_title' => $property->title,
        ]);
    }

    /**
     * Create a new booking with full pricing snapshot and server-side validation.
     * Uses atomic DB transaction and re-validates availability before creation to avoid race conditions.
     */
    public function createPropertyBooking(
        Property $property,
        Customer $customer,
        Carbon $checkIn,
        Carbon $checkOut,
        int $guests,
        string $paymentType,        // 'full' or 'deposit'
        PaymentMethod $paymentMethod,
        ?string $promoCode = null,
        ?string $source = null,
        ?string $internalNotes = null,
    ): Booking {
        $dto = new CreateBookingDTO(
            property: $property,
            customer: $customer,
            checkIn: $checkIn,
            checkOut: $checkOut,
            guests: $guests,
            paymentType: $paymentType,
            paymentMethod: $paymentMethod,
            promoCode: $promoCode,
            source: $source ?? 'website_checkout',
            internalNotes: $internalNotes
        );

        return $this->getCreateBookingAction()->execute($dto);
    }

    /**
     * Record a payment against a booking (manual or gateway confirmed).
     */
    public function recordPayment(Booking $booking, int $amountCents, string $type = 'payment'): void
    {
        $this->getRecordPaymentAction()->execute($booking, $amountCents, $type);
    }

    /**
     * Cancel a booking.
     */
    public function cancelBooking(Booking $booking, string $reason, ?int $refundAmountCents = 0): void
    {
        $this->getCancelBookingAction()->execute($booking, $reason, $refundAmountCents);
    }

    /**
     * Generate a human-readable booking reference: GON-YYYY-XXXXXX
     */
    public function generateReference(): string
    {
        do {
            $reference = BookingReference::generate()->toString();
        } while (Booking::where('reference', $reference)->exists());

        return $reference;
    }
}
