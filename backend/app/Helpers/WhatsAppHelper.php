<?php

namespace App\Helpers;

use App\Models\Booking;
use App\Models\Event;
use App\Models\Experience;
use App\Models\Property;
use App\Models\Setting;

class WhatsAppHelper
{
    /**
     * Get the configured primary WhatsApp phone number (Section 37).
     */
    public static function number(): string
    {
        $raw = Setting::get('whatsapp_number', config('services.whatsapp.number', '+201000000000'));
        return preg_replace('/[^0-9]/', '', $raw);
    }

    /**
     * Generate standard WhatsApp web link with encoded message.
     */
    public static function url(string $message): string
    {
        return 'https://wa.me/' . self::number() . '?text=' . urlencode(trim($message));
    }

    /**
     * Generate contextual WhatsApp message for a Property (Section 37).
     */
    public static function forProperty(
        Property $property,
        ?string $checkIn = null,
        ?string $checkOut = null,
        ?int $guests = null
    ): string {
        $msg = "Hello GouNow,\n\n";
        $msg .= "I am inquiring about: " . $property->title . "\n";
        $msg .= "Reference: " . $property->reference_number . "\n";

        if ($checkIn && $checkOut) {
            $msg .= "Dates: " . $checkIn . " to " . $checkOut . "\n";
        }
        if ($guests) {
            $msg .= "Party Size: " . $guests . " guests\n";
        }

        $msg .= "\nCould you please provide more details on availability and arrangements?";

        return self::url($msg);
    }

    /**
     * Generate contextual WhatsApp message for an Experience (Section 37).
     */
    public static function forExperience(
        Experience $experience,
        ?string $date = null,
        ?int $guests = null
    ): string {
        $msg = "Hello GouNow,\n\n";
        $msg .= "I am inquiring about the experience: " . $experience->title . "\n";

        if ($date) {
            $msg .= "Preferred Date: " . $date . "\n";
        }
        if ($guests) {
            $msg .= "Number of Guests: " . $guests . "\n";
        }

        $msg .= "\nCould you please let me know availability and departure options?";

        return self::url($msg);
    }

    /**
     * Generate contextual WhatsApp message for an Event (Section 37).
     */
    public static function forEvent(Event $event): string
    {
        $msg = "Hello GouNow,\n\n";
        $msg .= "I would like to book tickets for the event: " . $event->title_en . "\n";
        $msg .= "Date: " . $event->event_date->format('M d, Y') . "\n";
        $msg .= "Venue: " . ($event->venue_name ?? 'El Gouna') . "\n\n";
        $msg .= "Please advise on ticket availability and table reservations.";

        return self::url($msg);
    }

    /**
     * Generate contextual WhatsApp message for a Booking voucher (Section 37).
     */
    public static function forBooking(Booking $booking): string
    {
        $msg = "Hello GouNow,\n\n";
        $msg .= "I am contacting you regarding my reservation.\n";
        $msg .= "Booking Reference: " . $booking->reference . "\n";
        $msg .= "Property: " . ($booking->bookable?->title ?? 'El Gouna Stay') . "\n";
        $msg .= "Dates: " . $booking->check_in->toDateString() . " to " . $booking->check_out->toDateString() . "\n\n";
        $msg .= "I would like assistance with my booking.";

        return self::url($msg);
    }
}
