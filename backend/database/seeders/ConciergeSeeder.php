<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\ConciergeNote;
use App\Models\ConciergeQuote;
use App\Models\ConciergeQuoteItem;
use App\Models\ConciergeRequest;
use App\Models\Customer;
use App\Models\Property;
use App\Models\User;
use Illuminate\Database\Seeder;

class ConciergeSeeder extends Seeder
{
    public function run(): void
    {
        $agent = User::whereHas('roles', function ($q) {
            $q->whereIn('name', ['concierge_manager', 'concierge_agent', 'super_admin']);
        })->first() ?? User::where('is_admin', true)->first();

        $property = Property::first();

        // 1. Quoted Yacht Charter
        $req1 = ConciergeRequest::updateOrCreate(
            ['request_number' => 'CR-20261008-0001'],
            [
                'customer_name' => 'H.E. Sheikh Tariq Al-Sabah',
                'customer_email' => 'tariq.alsabah@vip.kw',
                'customer_phone' => '+96599112233',
                'request_type' => 'yacht',
                'priority' => 'urgent',
                'status' => 'quoted',
                'description' => '65ft Luxury Motor Yacht charter for 6 hours around Tavila Island with gourmet sushi catering and premium champagne.',
                'preferred_date' => now()->addDays(3)->toDateString(),
                'preferred_time' => '14:00',
                'location' => 'Abu Tig Marina',
                'guests_count' => 8,
                'budget_cents' => 4500000,
                'currency' => 'EGP',
                'assigned_to' => $agent?->id,
                'assigned_at' => now()->subHours(5),
            ]
        );

        ConciergeNote::firstOrCreate(
            ['concierge_request_id' => $req1->id, 'content' => 'Captain Tamer confirmed 65ft Majesty Yacht availability for Saturday afternoon.'],
            ['user_id' => $agent?->id, 'author_name' => $agent?->name ?? 'Concierge Desk', 'is_customer_visible' => false]
        );

        ConciergeNote::firstOrCreate(
            ['concierge_request_id' => $req1->id, 'content' => 'We have prepared an exclusive quote with a dedicated captain, hostess, and gourmet sushi service.'],
            ['user_id' => $agent?->id, 'author_name' => $agent?->name ?? 'Concierge Desk', 'is_customer_visible' => true]
        );

        $quote1 = ConciergeQuote::updateOrCreate(
            ['concierge_request_id' => $req1->id, 'quote_number' => 'QT-20261008-0001'],
            [
                'status' => 'pending',
                'currency' => 'EGP',
                'subtotal_cents' => 4500000,
                'discount_cents' => 300000,
                'fees_cents' => 150000,
                'total_cents' => 4350000,
                'valid_until' => now()->addDays(2),
                'notes' => 'Includes yacht fuel, professional captain, deckhand, sushi lunch set, and fresh fruits.',
                'created_by' => $agent?->id,
            ]
        );

        ConciergeQuoteItem::firstOrCreate(
            ['concierge_quote_id' => $quote1->id, 'title' => '65ft Majesty Yacht Charter (6 Hours)'],
            ['item_type' => 'yacht', 'description' => 'Full yacht charter with private crew', 'quantity' => 1, 'unit_price_cents' => 3200000, 'total_price_cents' => 3200000]
        );

        ConciergeQuoteItem::firstOrCreate(
            ['concierge_quote_id' => $quote1->id, 'title' => 'Gourmet Sushi & Seafood Catering (8 Pax)'],
            ['item_type' => 'addon', 'description' => 'Fresh rolls, sashimi, and beverage service', 'quantity' => 8, 'unit_price_cents' => 125000, 'total_price_cents' => 1000000]
        );

        ConciergeQuoteItem::firstOrCreate(
            ['concierge_quote_id' => $quote1->id, 'title' => 'Tavila Island National Park Permits'],
            ['item_type' => 'custom', 'description' => 'Marine reserve access permits', 'quantity' => 1, 'unit_price_cents' => 300000, 'total_price_cents' => 300000]
        );

        // 2. Confirmed Private Dining Request
        $customer = Customer::firstOrCreate(
            ['email' => 'lady.eleanor@london.co.uk'],
            ['first_name' => 'Eleanor', 'last_name' => 'Vane', 'phone' => '+447911987654']
        );

        $booking = Booking::firstOrCreate(
            ['reference' => 'BK-CON-2026-0001'],
            [
                'customer_id' => $customer->id,
                'bookable_type' => Property::class,
                'bookable_id' => $property?->id,
                'check_in' => now()->addDays(5)->toDateString(),
                'check_out' => now()->addDays(6)->toDateString(),
                'nights' => 1,
                'guests' => 2,
                'status' => 'confirmed',
                'subtotal_cents' => 1800000,
                'total_cents' => 1800000,
                'currency' => 'EGP',
                'payment_status' => 'paid',
                'source' => 'concierge',
            ]
        );

        $req2 = ConciergeRequest::updateOrCreate(
            ['request_number' => 'CR-20261008-0002'],
            [
                'customer_id' => $customer->id,
                'customer_name' => 'Lady Eleanor Vane',
                'customer_email' => 'lady.eleanor@london.co.uk',
                'customer_phone' => '+447911987654',
                'request_type' => 'dining',
                'priority' => 'high',
                'status' => 'confirmed',
                'description' => 'Private beachside candlelit 5-course anniversary dinner with acoustic guitarist.',
                'preferred_date' => now()->addDays(5)->toDateString(),
                'preferred_time' => '19:30',
                'location' => 'Club 88 Beach',
                'guests_count' => 2,
                'budget_cents' => 2000000,
                'currency' => 'EGP',
                'assigned_to' => $agent?->id,
                'assigned_at' => now()->subDays(1),
                'booking_id' => $booking->id,
            ]
        );

        $quote2 = ConciergeQuote::updateOrCreate(
            ['concierge_request_id' => $req2->id, 'quote_number' => 'QT-20261008-0002'],
            [
                'status' => 'accepted',
                'currency' => 'EGP',
                'subtotal_cents' => 1800000,
                'discount_cents' => 0,
                'fees_cents' => 0,
                'total_cents' => 1800000,
                'valid_until' => now()->addDays(1),
                'accepted_at' => now()->subHours(2),
                'notes' => 'Custom beach setup with torchlights and rose petals.',
                'created_by' => $agent?->id,
            ]
        );

        ConciergeQuoteItem::firstOrCreate(
            ['concierge_quote_id' => $quote2->id, 'title' => 'Private 5-Course Beach Dinner Setup'],
            ['item_type' => 'dining', 'description' => 'Romantic setup and dedicated chef', 'quantity' => 1, 'unit_price_cents' => 1400000, 'total_price_cents' => 1400000]
        );

        ConciergeQuoteItem::firstOrCreate(
            ['concierge_quote_id' => $quote2->id, 'title' => 'Live Acoustic Guitarist (2 Hours)'],
            ['item_type' => 'custom', 'description' => 'Romantic acoustic repertoire', 'quantity' => 1, 'unit_price_cents' => 400000, 'total_price_cents' => 400000]
        );

        // 3. In Progress Desert Safari
        ConciergeRequest::updateOrCreate(
            ['request_number' => 'CR-20261008-0003'],
            [
                'customer_name' => 'Alexander & Friends',
                'customer_email' => 'alex.ross@vienna-adventures.at',
                'customer_phone' => '+436761234567',
                'request_type' => 'experience',
                'priority' => 'normal',
                'status' => 'in_progress',
                'description' => 'Private Quad runner safari into Eastern Desert canyons with traditional Bedouin BBQ dinner and astronomy astronomer telescope session.',
                'preferred_date' => now()->addDays(4)->toDateString(),
                'preferred_time' => '15:30',
                'location' => 'El Gouna Desert Dunes',
                'guests_count' => 6,
                'budget_cents' => 2500000,
                'currency' => 'EGP',
                'assigned_to' => $agent?->id,
                'assigned_at' => now()->subHours(2),
            ]
        );

        // 4. New Urgent Inbound Request
        ConciergeRequest::updateOrCreate(
            ['request_number' => 'CR-20261008-0004'],
            [
                'customer_name' => 'Baron von Hohenberg',
                'customer_email' => 'baron@hohenberg.de',
                'customer_phone' => '+491712233445',
                'request_type' => 'transportation',
                'priority' => 'urgent',
                'status' => 'new',
                'description' => 'VIP Chauffeur Maybach transfer from Hurghada International Airport directly to Fanadir Lagoon Villa with luggage concierge.',
                'preferred_date' => now()->addDays(1)->toDateString(),
                'preferred_time' => '11:15',
                'location' => 'HRG Airport Terminal 1',
                'guests_count' => 4,
                'budget_cents' => 800000,
                'currency' => 'EGP',
            ]
        );
    }
}
