<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\BookingNightlyPrice;
use App\Models\Customer;
use App\Models\Event;
use App\Models\EventOrder;
use App\Models\EventTicket;
use App\Models\Lead;
use App\Models\PaymentMethod;
use App\Models\PaymentTransaction;
use App\Models\Property;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CustomerAndBookingSeeder extends Seeder
{
    public function run(): void
    {
        $cardMethod = PaymentMethod::where('code', 'card')->first();
        $bankMethod = PaymentMethod::where('code', 'bank_transfer')->first();
        $cashMethod = PaymentMethod::where('code', 'cash')->first();

        // 1. Customers
        $customer1 = Customer::updateOrCreate(
            ['email' => 'sarah.mansour@example.com'],
            [
                'first_name' => 'Sarah',
                'last_name' => 'Mansour',
                'phone' => '+201012345678',
                'phone_country_code' => '+20',
                'nationality' => 'Egyptian',
                'country_of_residence' => 'Egypt',
                'notes' => 'VIP recurring guest. Prefers lagoon view and late checkout.',
                'source' => 'website',
                'is_active' => true,
            ]
        );

        $customer2 = Customer::updateOrCreate(
            ['email' => 'alex.weber@example.de'],
            [
                'first_name' => 'Alexander',
                'last_name' => 'Weber',
                'phone' => '+491701234567',
                'phone_country_code' => '+49',
                'nationality' => 'German',
                'country_of_residence' => 'Germany',
                'notes' => 'Kitesurfing enthusiast staying in Mangroovy.',
                'source' => 'google',
                'is_active' => true,
            ]
        );

        $customer3 = Customer::updateOrCreate(
            ['email' => 'tarek.khalil@example.com'],
            [
                'first_name' => 'Tarek',
                'last_name' => 'Khalil',
                'phone' => '+201098765432',
                'phone_country_code' => '+20',
                'nationality' => 'Egyptian',
                'country_of_residence' => 'United Arab Emirates',
                'notes' => 'Interested in purchasing a waterfront lagoon villa.',
                'source' => 'whatsapp',
                'is_active' => true,
            ]
        );

        // 2. Demo Booking 1 (Confirmed Villa Rental with Nightly Breakdown Snapshot)
        $villa = Property::where('slug', 'fanadir-bay-sunlight-villa')->first();
        if ($villa) {
            $checkIn = now()->addDays(10)->toDateString();
            $checkOut = now()->addDays(14)->toDateString();
            $nights = 4;
            $nightlyCents = 1200000;
            $subtotal = $nightlyCents * $nights;
            $cleaning = 150000;
            $service = 200000;
            $tax = (int) round(($subtotal + $cleaning + $service) * 0.14);
            $total = $subtotal + $cleaning + $service + $tax;
            $deposit = (int) round($total * 0.30);

            $booking1 = Booking::updateOrCreate(
                ['reference' => 'GON-2026-000101'],
                [
                    'customer_id' => $customer1->id,
                    'bookable_type' => Property::class,
                    'bookable_id' => $villa->id,
                    'check_in' => $checkIn,
                    'check_out' => $checkOut,
                    'nights' => $nights,
                    'guests' => 6,
                    'subtotal_cents' => $subtotal,
                    'cleaning_fee_cents' => $cleaning,
                    'service_fee_cents' => $service,
                    'tax_cents' => $tax,
                    'discount_cents' => 0,
                    'total_cents' => $total,
                    'deposit_cents' => $deposit,
                    'amount_paid_cents' => $deposit,
                    'amount_remaining_cents' => $total - $deposit,
                    'currency' => 'EGP',
                    'payment_type' => 'deposit',
                    'payment_method_id' => $cardMethod?->id,
                    'status' => 'partially_paid',
                    'payment_status' => 'partially_paid',
                    'balance_due_date' => now()->addDays(3)->toDateString(),
                    'source' => 'website',
                ]
            );

            // Nightly Snapshot
            for ($i = 0; $i < $nights; $i++) {
                $nightDate = now()->addDays(10 + $i)->toDateString();
                BookingNightlyPrice::updateOrCreate(
                    ['booking_id' => $booking1->id, 'night_date' => $nightDate],
                    [
                        'price_cents' => $nightlyCents,
                        'currency' => 'EGP',
                        'is_base_price' => true,
                    ]
                );
            }

            // Payment Transaction for Deposit
            PaymentTransaction::updateOrCreate(
                ['transaction_id' => 'TXN-CARD-9018274'],
                [
                    'booking_id' => $booking1->id,
                    'customer_id' => $customer1->id,
                    'payment_method_id' => $cardMethod?->id,
                    'amount_cents' => $deposit,
                    'currency' => 'EGP',
                    'type' => 'deposit',
                    'status' => 'completed',
                    'gateway_provider' => 'card',
                    'gateway_reference' => 'PAY-SIM-9018274',
                    'completed_at' => now()->subDay(),
                ]
            );
        }

        // 3. Demo Event Order & Digital Tickets with QR Tokens
        $event = Event::where('slug', 'gounow-sunset-sessions-mangroovy-beach')->first();
        if ($event) {
            $ticketType = $event->ticketTypes()->first();
            if ($ticketType) {
                $orderTotal = $ticketType->price_cents * 2;

                $eventOrder = EventOrder::updateOrCreate(
                    ['order_number' => 'EVT-2026-00088'],
                    [
                        'event_id' => $event->id,
                        'customer_id' => $customer2->id,
                        'payment_method_id' => $cardMethod?->id,
                        'total_cents' => $orderTotal,
                        'currency' => 'EGP',
                        'status' => 'paid',
                        'payment_status' => 'paid',
                        'gateway_reference' => 'PAY-EVT-44819',
                    ]
                );

                for ($t = 1; $t <= 2; $t++) {
                    EventTicket::updateOrCreate(
                        ['ticket_number' => "TKT-2026-{$eventOrder->id}-0{$t}"],
                        [
                            'event_order_id' => $eventOrder->id,
                            'event_id' => $event->id,
                            'event_ticket_type_id' => $ticketType->id,
                            'customer_id' => $customer2->id,
                            'qr_token' => Str::random(48),
                            'price_cents' => $ticketType->price_cents,
                            'currency' => 'EGP',
                            'status' => 'valid',
                        ]
                    );
                }
            }
        }

        // 4. Leads / Inquiries
        Lead::updateOrCreate(
            ['email' => 'tarek.khalil@example.com'],
            [
                'customer_id' => $customer3->id,
                'name' => 'Tarek Khalil',
                'phone' => '+201098765432',
                'type' => 'property_sale',
                'source' => 'whatsapp',
                'message' => 'Looking to purchase a 4 to 5 bedroom standalone villa in Tawila or Fanadir Bay with budget up to 50,000,000 EGP.',
                'status' => 'qualified',
                'property_location' => 'Fanadir Bay / Tawila',
                'property_type' => 'Villa',
                'property_bedrooms' => 5,
                'expected_price_cents' => 5000000000,
                'admin_notes' => 'High-intent investor based in Dubai. Scheduled WhatsApp call for tomorrow.',
            ]
        );

        Lead::updateOrCreate(
            ['email' => 'nadia.hassan@example.com'],
            [
                'name' => 'Nadia Hassan',
                'phone' => '+201122334455',
                'type' => 'inquiry',
                'source' => 'website',
                'message' => 'Inquiring about private yacht charter for 10 people next weekend.',
                'status' => 'new',
            ]
        );
    }
}
