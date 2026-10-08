<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Event;
use App\Models\EventOrder;
use App\Models\EventTicket;
use App\Models\EventTicketType;
use App\Models\Location;
use App\Models\Venue;
use App\Models\Yacht;
use App\Models\YachtPackage;
use App\Models\Addon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class YachtAndVenueSeeder extends Seeder
{
    public function run(): void
    {
        $marina = Location::where('slug', 'abu-tig-marina')->first();
        $mangroovy = Location::where('slug', 'mangroovy-kite-beach')->first();
        $downtown = Location::where('slug', 'downtown-kafr')->first();

        // 1. Seed Venues
        $venue1 = Venue::updateOrCreate(
            ['slug' => 'abu-tig-marina-smokery-beach'],
            [
                'location_id' => $marina?->id,
                'name_en' => 'Abu Tig Marina Smokery Beach & Lounge',
                'name_ar' => 'شاطئ ولاونج سموكري، مارينا أبو تيج',
                'description_en' => 'Premier open-air seaside beach club and nightlife hotspot overlooking the marina yachts.',
                'description_ar' => 'أرقى نوادي الشاطئ والسهرات الموسيقية المفتوحة المطلة على يخوت مارينا أبو تيج.',
                'venue_type' => 'beach_club',
                'capacity' => 350,
                'address' => 'Abu Tig Marina North, El Gouna',
                'latitude' => 27.3972,
                'longitude' => 33.6822,
                'map_url' => 'https://maps.google.com/?q=27.3972,33.6822',
                'facilities' => ['VIP Deck', 'Sound System', 'Full Cocktail Bar', 'Seaside Daybeds', 'Security'],
                'cover_image' => 'https://images.unsplash.com/photo-1545128485-c400e7702796?auto=format&fit=crop&w=1200&q=80',
                'status' => 'active',
            ]
        );

        $venue2 = Venue::updateOrCreate(
            ['slug' => 'el-gouna-conference-culture-centre-plaza'],
            [
                'location_id' => $downtown?->id,
                'name_en' => 'El Gouna Conference & Culture Centre (GFF Plaza)',
                'name_ar' => 'مركز الجونة للمؤتمرات والثقافة (ساحة المهرجان)',
                'description_en' => 'Iconic architectural plaza hosting the red carpet opening galas, world-class concerts, and festivals.',
                'description_ar' => 'الساحة المعمارية الأيقونية التي تستضيف مهرجان الجونة السينمائي والحفلات العالمية الكبرى.',
                'venue_type' => 'plaza',
                'capacity' => 1200,
                'address' => 'Festival Plaza, Central El Gouna',
                'latitude' => 27.3888,
                'longitude' => 33.6765,
                'map_url' => 'https://maps.google.com/?q=27.3888,33.6765',
                'facilities' => ['Grand Amphitheater', 'Red Carpet Lane', 'VIP Green Rooms', 'Valet Parking'],
                'cover_image' => 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
                'status' => 'active',
            ]
        );

        $venue3 = Venue::updateOrCreate(
            ['slug' => 'club-88-pool-lounge'],
            [
                'location_id' => $marina?->id,
                'name_en' => 'Club 88 Pool & Beach Lounge',
                'name_ar' => 'كلوب 88 لاونج والمسبح',
                'description_en' => 'Exclusive day-to-night poolside lounge famous for bohemian vibes and signature music.',
                'description_ar' => 'لاونج فاخر يجمع بين المسبح والشاطئ بأجواء بوهيمية ساحرة وموسيقى راقية.',
                'venue_type' => 'club',
                'capacity' => 280,
                'address' => 'Abu Tig Marina Promenade, El Gouna',
                'latitude' => 27.3955,
                'longitude' => 33.6810,
                'facilities' => ['Infinity Pool', 'Cabanas', 'DJ Stage', 'Valet'],
                'cover_image' => 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
                'status' => 'active',
            ]
        );

        // 2. Link existing and new Events to Venues
        $event1 = Event::where('slug', 'gounow-sunset-sessions-mangroovy-beach')->first();
        if ($event1) {
            $event1->update([
                'venue_id' => $venue1->id,
                'doors_open_time' => '16:00:00',
                'age_restriction' => '21+',
                'dress_code' => 'Boho Chic / Beach Smart',
                'rules_en' => 'Couples or mixed groups only. No outside beverages permitted. Tickets are non-refundable after entry.',
                'rules_ar' => 'دخول الكوبلز والمجموعات المختلطة فقط. يمنع إدخال المشروبات الخارجية.',
            ]);
        }

        $event2 = Event::updateOrCreate(
            ['slug' => 'gouna-film-festival-vip-opening-gala'],
            [
                'venue_id' => $venue2->id,
                'location_id' => $downtown?->id,
                'title_en' => 'Gouna Film Festival VIP Opening Gala & Red Carpet',
                'title_ar' => 'حفل افتتاح مهرجان الجونة السينمائي (VIP والسجادة الحمراء)',
                'short_description_en' => 'Exclusive admission to the cinematic world premiere, red carpet arrivals, and VIP cocktail after-party.',
                'short_description_ar' => 'حضور حصري لحفل الافتتاح الرسمي والسجادة الحمراء مع نجوم وصناع السينما العالمية.',
                'description_en' => 'Experience the magic of cinema on the Red Sea coast. Full red-carpet access, reserved premier amphitheater seating, and exclusive VIP reception.',
                'description_ar' => 'عش سحر الفن السابع في ساحة المهرجان العالمية مع أرقى خدمات الضيافة.',
                'organizer' => 'El Gouna Festival Committee & GouNow Concierge',
                'event_date' => now()->addDays(20)->toDateString(),
                'start_time' => '19:00:00',
                'end_time' => '02:00:00',
                'doors_open_time' => '17:30:00',
                'venue_name' => $venue2->name_en,
                'venue_address' => $venue2->address,
                'latitude' => $venue2->latitude,
                'longitude' => $venue2->longitude,
                'category' => 'Festival',
                'is_ticketed' => true,
                'is_featured' => true,
                'is_published' => true,
                'status' => 'published',
                'age_restriction' => '18+',
                'dress_code' => 'Black Tie / Evening Glamour',
                'rules_en' => 'Strict Black Tie dress code. Government photo ID required upon entry.',
                'rules_ar' => 'الالتزام الكامل بملابس السهرة الرسمية (Black Tie). يلزم إبراز بطاقة الهوية الأصلية.',
            ]
        );

        EventTicketType::updateOrCreate(
            ['event_id' => $event2->id, 'name_en' => 'VIP Red Carpet & Ceremony'],
            [
                'name_ar' => 'تذكرة كبار الزوار والسجادة الحمراء',
                'description_en' => 'Red carpet walk, reserved amphitheater row 1-5, champagne reception.',
                'description_ar' => 'المرور على السجادة الحمراء، مقاعد الصفوف الأولى، واستقبال شرفي فاخر.',
                'price_cents' => 1250000, // 12,500 EGP
                'currency' => 'EGP',
                'capacity' => 150,
                'sold_count' => 62,
                'sales_start_at' => now()->subDays(10),
                'sales_end_at' => now()->addDays(20),
                'max_per_order' => 2,
                'is_active' => true,
                'sort_order' => 1,
            ]
        );

        EventTicketType::updateOrCreate(
            ['event_id' => $event2->id, 'name_en' => 'VVIP Table & After-Party Access'],
            [
                'name_ar' => 'طاولة VVIP ودخول حفل الاستقبال الخاص',
                'description_en' => 'Dedicated lounge table, butler service, full after-party access with celebrities.',
                'description_ar' => 'طاولة خاصة مع خدمة مضيف خاص والدخول الكامل لحفل السهرة المغلق مع النجوم.',
                'price_cents' => 2800000, // 28,000 EGP
                'currency' => 'EGP',
                'capacity' => 25,
                'sold_count' => 18,
                'sales_start_at' => now()->subDays(10),
                'sales_end_at' => now()->addDays(20),
                'max_per_order' => 1,
                'is_active' => true,
                'sort_order' => 2,
            ]
        );

        // 3. Seed Sample Event Order & Tickets for Check-in Testing
        $customer = Customer::first() ?? Customer::create([
            'first_name' => 'Karim',
            'last_name' => 'El-Alfy',
            'email' => 'karim.alfy@example.com',
            'phone' => '+201099887766',
        ]);

        $ticketType = $event2->ticketTypes()->first();
        if ($ticketType) {
            $sampleOrder = EventOrder::firstOrCreate(
                ['order_number' => 'ORD-GFF-2026-001'],
                [
                    'event_id' => $event2->id,
                    'customer_id' => $customer->id,
                    'total_cents' => $ticketType->price_cents,
                    'currency' => 'EGP',
                    'status' => 'paid',
                    'payment_status' => 'paid',
                    'gateway_reference' => 'PAY-SIM-SUCCESS-9988',
                ]
            );

            EventTicket::firstOrCreate(
                ['ticket_number' => 'TCK-GFF-001-ALPHA'],
                [
                    'event_order_id' => $sampleOrder->id,
                    'event_id' => $event2->id,
                    'event_ticket_type_id' => $ticketType->id,
                    'customer_id' => $customer->id,
                    'qr_token' => 'QR-DEMO-VIP-TOKEN-778899',
                    'price_cents' => $ticketType->price_cents,
                    'currency' => 'EGP',
                    'status' => 'valid',
                ]
            );
        }

        // 4. Seed Yachts
        $yacht1 = Yacht::updateOrCreate(
            ['slug' => 'azimut-68-flybridge-tawila-explorer'],
            [
                'location_id' => $marina?->id,
                'name_en' => 'Azimut 68 Flybridge - Tawila Explorer',
                'name_ar' => 'يخت أزيموت 68 فلاي بريدج - مستكشف طوّيلة',
                'short_description_en' => '68-foot ultra-luxury Italian motor yacht with expansive sun deck, jacuzzi, and private chef.',
                'short_description_ar' => 'يخت إيطالي فاخر بطول 68 قدماً، مجهز بسطح تشمس فسيح وجاكوزي وشيف خاص للإبحار في مياه البحر الأحمر.',
                'description_en' => 'The ultimate private yachting experience in El Gouna. Glide through the azure lagoons toward Tawila and Gubal Islands. Complete with professional captain, deckhands, water-sports Seabob, and gourmet catering options.',
                'description_ar' => 'تجربة إبحار استثنائية في الجونة. انطلق نحو جزر طوّيلة وجوبال مع طاقم محترف وشيف وطائفة من الأنشطة المائية.',
                'yacht_type' => 'motor_yacht',
                'category' => 'luxury',
                'brand' => 'Azimut',
                'model' => '68 Flybridge',
                'year' => 2023,
                'length_ft' => 68,
                'capacity' => 14,
                'crew_capacity' => 3,
                'cabins' => 3,
                'bathrooms' => 3,
                'owner_partner_name' => 'Red Sea Marine Elite Charters',
                'owner_partner_contact' => '+20 122 555 7890',
                'pricing_model' => 'hourly',
                'base_price_cents' => 1200000, // 12,000 EGP / hour
                'currency' => 'EGP',
                'weekend_price_cents' => 1450000, // 14,500 EGP / hour
                'extra_hour_price_cents' => 1000000,
                'security_deposit_cents' => 2000000,
                'min_duration_hours' => 3,
                'marina_berth' => 'Abu Tig Marina, Berth G-12',
                'address' => 'Abu Tig Marina, El Gouna',
                'latitude' => 27.3975,
                'longitude' => 33.6828,
                'map_url' => 'https://maps.google.com/?q=27.3975,33.6828',
                'rules_en' => 'Barefoot onboard rule. Smoking permitted in exterior aft deck only. Life jackets provided for all guests.',
                'rules_ar' => 'خلع الأحذية على متن اليخت. يسمح بالتدخين في المنطقة الخارجية فقط. سترات النجاة متوفرة للجميع.',
                'cancellation_policy_en' => 'Full refund up to 72 hours prior to scheduled departure. 50% refund within 48-72 hours.',
                'cancellation_policy_ar' => 'استرداد كامل حتى 72 ساعة قبل موعد الانطلاق. 50% قبل 48 ساعة.',
                'child_policy' => 'Children welcome with guardian supervision. Child life vests available onboard.',
                'pet_policy' => 'Small pets allowed upon prior authorization.',
                'cover_image' => '/assets/images/tawila-yacht.jpg',
                'gallery' => [
                    '/assets/images/tawila-yacht.jpg',
                    'https://images.unsplash.com/photo-1569263979104-865ab7cd8d17?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
                ],
                'is_featured' => true,
                'status' => 'active',
            ]
        );

        YachtPackage::updateOrCreate(
            ['yacht_id' => $yacht1->id, 'name_en' => 'Tawila Island Private Day Expedition'],
            [
                'name_ar' => 'رحلة يوم كامل خاصة إلى جزيرة طوّيلة',
                'description_en' => 'Full day 7-hour cruise to pristine sandbars, secluded lagoon snorkeling, and open-buffet seafood lunch.',
                'description_ar' => 'إبحار لمدة 7 ساعات نحو الرمال البيضاء ومياه طوّيلة الفيروزية مع وجبة غداء مأكولات بحرية طازجة.',
                'duration_hours' => 7.0,
                'capacity' => 14,
                'price_cents' => 6500000, // 65,000 EGP
                'currency' => 'EGP',
                'inclusions_en' => ['Captain & 2 Crew', 'Fuel for Tawila Route', 'Fresh Seafood Lunch', 'Snorkeling Gear', 'Soft Drinks & Ice'],
                'inclusions_ar' => ['قبطان وطاقم بحري', 'الوقود لخط طوّيلة', 'غداء سي فود فاخر', 'معدات غطس وسنوركلينج', 'مشروبات وعصائر منعشة'],
                'exclusions_en' => ['National Park Protected Area Fees', 'Alcoholic Beverages'],
                'exclusions_ar' => ['رسوم المحميات الطبيعية إن وجدت', 'المشروبات الروحية'],
                'status' => 'active',
                'sort_order' => 1,
            ]
        );

        YachtPackage::updateOrCreate(
            ['yacht_id' => $yacht1->id, 'name_en' => 'Sunset Champagne Lagoon Cruise'],
            [
                'name_ar' => 'جولة الغروب الرومانسية في اللاجون',
                'description_en' => '2.5 hours golden hour cruise through Abu Tig Marina and coastal waters with artisan canapés.',
                'description_ar' => 'إبحار لمدة ساعتين ونصف مع لحظات الغروب الذهبية ومقبلات خفيفة وموسيقى هادئة.',
                'duration_hours' => 2.5,
                'capacity' => 14,
                'price_cents' => 2800000, // 28,000 EGP
                'currency' => 'EGP',
                'inclusions_en' => ['Captain', 'Canapé Platters', 'Fruit Board', 'Atmosphere Sound System'],
                'inclusions_ar' => ['قبطان ومساعد', 'مقبلات وفواكه طازجة', 'نظام صوتي راقٍ'],
                'exclusions_en' => [],
                'exclusions_ar' => [],
                'status' => 'active',
                'sort_order' => 2,
            ]
        );

        // Seed Add-ons for Yacht 1
        Addon::updateOrCreate(
            ['addonable_type' => Yacht::class, 'addonable_id' => $yacht1->id, 'name_en' => 'Seabob Underwater Scooter'],
            [
                'name_ar' => 'سكوتر سيبوب البحري فائق السرعة',
                'description_en' => 'High-performance underwater hydrodynamic scooter for effortless reef cruising.',
                'description_ar' => 'سكوتر مائي فائق التطور للغوص والسباحة السريعة بين الشعاب المرجانية.',
                'price_cents' => 350000, // 3,500 EGP
                'currency' => 'EGP',
                'pricing_model' => 'per_booking',
                'max_quantity' => 2,
                'is_available' => true,
                'status' => 'active',
            ]
        );

        Addon::updateOrCreate(
            ['addonable_type' => Yacht::class, 'addonable_id' => $yacht1->id, 'name_en' => 'Private Master Chef Onboard BBQ'],
            [
                'name_ar' => 'شيف خاص لتحضير مشاوي الباربكيو على متن اليخت',
                'description_en' => 'Dedicated chef grilling fresh Red Sea grouper, jumbo prawns, and premium tenderloins on the flybridge.',
                'description_ar' => 'شيف محترف يقوم بإعداد أطباق المشاوي الطازجة والجمبري الجامبو على سطح اليخت مباشرة.',
                'price_cents' => 500000, // 5,000 EGP
                'currency' => 'EGP',
                'pricing_model' => 'per_booking',
                'max_quantity' => 1,
                'is_available' => true,
                'status' => 'active',
            ]
        );

        $yacht2 = Yacht::updateOrCreate(
            ['slug' => 'lagoon-46-catamaran-blue-horizon'],
            [
                'location_id' => $marina?->id,
                'name_en' => 'Lagoon 46 Catamaran - Blue Horizon',
                'name_ar' => 'كاتاماران لاجون 46 - بلو هورايزون',
                'short_description_en' => '46-foot luxury sailing catamaran offering rock-steady stability and spacious double trampolines.',
                'short_description_ar' => 'كاتاماران شراعي فاخر بطول 46 قدماً يوفر استقراراً فائقاً ومساحات تشمس وشباك إبحار واسعة.',
                'description_en' => 'Ideal for family gatherings and celebrations. Enjoy smooth, unrolling navigation with wide cockpit lounges and 4 en-suite cabins.',
                'description_ar' => 'الخيار المثالي للعائلات ومجموعات الأصدقاء لقضاء يوم ممتع في عرض البحر.',
                'yacht_type' => 'catamaran',
                'category' => 'family',
                'brand' => 'Lagoon',
                'model' => '46',
                'year' => 2022,
                'length_ft' => 46,
                'capacity' => 18,
                'crew_capacity' => 2,
                'cabins' => 4,
                'bathrooms' => 4,
                'owner_partner_name' => 'El Gouna Catamaran Fleet',
                'owner_partner_contact' => '+20 100 111 2233',
                'pricing_model' => 'hourly',
                'base_price_cents' => 900000, // 9,000 EGP / hour
                'currency' => 'EGP',
                'weekend_price_cents' => 1100000,
                'extra_hour_price_cents' => 800000,
                'security_deposit_cents' => 1500000,
                'min_duration_hours' => 3,
                'marina_berth' => 'Abu Tig Marina, South Basin B-08',
                'address' => 'Abu Tig Marina, El Gouna',
                'latitude' => 27.3960,
                'longitude' => 33.6815,
                'cover_image' => 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d17?auto=format&fit=crop&w=1200&q=80',
                'gallery' => [
                    'https://images.unsplash.com/photo-1569263979104-865ab7cd8d17?auto=format&fit=crop&w=1200&q=80',
                    '/assets/images/tawila-yacht.jpg',
                ],
                'is_featured' => true,
                'status' => 'active',
            ]
        );
    }
}
