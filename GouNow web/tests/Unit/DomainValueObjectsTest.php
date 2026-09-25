<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Shared\Domain\ValueObjects\BookingReference;
use App\Shared\Domain\ValueObjects\DateRange;
use App\Shared\Domain\ValueObjects\GuestCount;
use App\Shared\Domain\ValueObjects\Money;
use Carbon\Carbon;
use InvalidArgumentException;
use Tests\TestCase;

class DomainValueObjectsTest extends TestCase
{
    public function test_money_value_object_computations_and_currency_safety(): void
    {
        $m1 = Money::fromCents(50000, 'EGP'); // 500.00 EGP
        $m2 = Money::fromDecimal(250.50, 'EGP'); // 250.50 EGP

        $this->assertEquals(50000, $m1->getAmountCents());
        $this->assertEquals(500.00, $m1->getDecimalAmount());
        $this->assertEquals('500.00', $m1->formatted());
        $this->assertEquals('500.00 EGP', $m1->formattedWithCurrency());

        $sum = $m1->add($m2);
        $this->assertEquals(75050, $sum->getAmountCents());
        $this->assertEquals(750.50, $sum->getDecimalAmount());

        $diff = $m1->subtract($m2);
        $this->assertEquals(24950, $diff->getAmountCents());

        // Currency mismatch assertion
        $usd = Money::fromCents(1000, 'USD');
        $this->expectException(InvalidArgumentException::class);
        $m1->add($usd);
    }

    public function test_date_range_computations_and_hotel_turnover_overlap(): void
    {
        $rangeA = new DateRange('2026-08-01', '2026-08-05'); // 4 nights
        $this->assertEquals(4, $rangeA->getNights());
        $this->assertEquals('2026-08-01', $rangeA->getCheckInDateString());
        $this->assertEquals('2026-08-05', $rangeA->getCheckOutDateString());

        // Adjacent stay: checks in on the day Range A checks out (2026-08-05). Valid turnover!
        $rangeB = new DateRange('2026-08-05', '2026-08-10');
        $this->assertFalse($rangeA->overlapsWith($rangeB));
        $this->assertFalse($rangeB->overlapsWith($rangeA));

        // Overlapping stay: 2026-08-03 to 2026-08-07
        $rangeC = new DateRange('2026-08-03', '2026-08-07');
        $this->assertTrue($rangeA->overlapsWith($rangeC));
        $this->assertTrue($rangeC->overlapsWith($rangeA));
    }

    public function test_guest_count_validation(): void
    {
        $guests = GuestCount::fromInt(4);
        $this->assertEquals(4, $guests->toInt());
        $this->assertTrue($guests->fitsInCapacity(6));
        $this->assertFalse($guests->fitsInCapacity(3));

        $this->expectException(InvalidArgumentException::class);
        GuestCount::fromInt(0);
    }

    public function test_booking_reference_generation_and_validation(): void
    {
        $ref = BookingReference::generate(2026);
        $this->assertMatchesRegularExpression(BookingReference::PATTERN, $ref->toString());

        $parsed = BookingReference::fromString('GON-2026-123456');
        $this->assertEquals('GON-2026-123456', $parsed->toString());

        $this->expectException(InvalidArgumentException::class);
        BookingReference::fromString('INVALID-REF');
    }
}
