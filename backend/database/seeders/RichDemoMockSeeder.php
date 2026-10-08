<?php

namespace Database\Seeders;

use App\Models\Amenity;
use App\Models\Booking;
use App\Models\BookingNightlyPrice;
use App\Models\ConciergeNote;
use App\Models\ConciergeQuote;
use App\Models\ConciergeQuoteItem;
use App\Models\ConciergeRequest;
use App\Models\Customer;
use App\Models\Lead;
use App\Models\Location;
use App\Models\Media;
use App\Models\PaymentMethod;
use App\Models\PaymentTransaction;
use App\Models\Property;
use App\Models\PropertyCategory;
use App\Models\User;
use App\Models\Venue;
use App\Models\Yacht;
use App\Models\YachtPackage;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class RichDemoMockSeeder extends Seeder
{
    public function run(): void
    {
        $allAmenities = Amenity::all();
        $allPaymentMethods = PaymentMethod::all();
        $cardMethod = PaymentMethod::where('code', 'card')->first();
        $bankMethod = PaymentMethod::where('code', 'bank_transfer')->first();
        $cashMethod = PaymentMethod::where('code', 'cash')->first();

        $villasCat = PropertyCategory::where('slug', 'luxury-villas')->first();
        $chaletsCat = PropertyCategory::where('slug', 'waterfront-chalets')->first();
        $apartmentsCat = PropertyCategory::where('slug', 'marina-apartments')->first();
        $townhousesCat = PropertyCategory::where('slug', 'townhouses')->first();

        $fanadir = Location::where('slug', 'fanadir-bay')->first();
        $marina = Location::where('slug', 'abu-tig-marina')->first();
        $mangroovy = Location::where('slug', 'mangroovy-kite-beach')->first();
        $westGolf = Location::where('slug', 'west-golf')->first();
        $tawila = Location::where('slug', 'tawila-island-lagoons')->first();
        $downtown = Location::where('slug', 'downtown-kafr')->first();

        $adminUser = User::whereHas('roles', function ($q) {
            $q->whereIn('name', ['super_admin', 'concierge_manager', 'admin']);
        })->first() ?? User::where('is_admin', true)->first();

        // =========================================================================
        // 1. RICH LUXURY PROPERTIES & ATTACHED HIGH-RES MEDIA
        // =========================================================================
        $propertiesData = [
            [
                'reference_number' => 'GON-PROP-006',
                'slug' => 'tawila-island-sunset-lagoon-villa',
                'property_category_id' => $villasCat?->id,
                'location_id' => $tawila?->id,
                'title_en' => 'Tawila Island Signature Sunset Villa',
                'title_ar' => 'فيلا تويلا آيلاند الملكية بإطلالة الغروب',
                'short_description_en' => 'Sublime 5-bedroom waterfront villa with heated infinity pool, private white sand lagoon beach, and personal boat jetty.',
                'short_description_ar' => 'فيلا استثنائية من 5 غرف نوم بحمام سباحة دافئ متصل وشاطئ رملي أبيض خاص ومرسى قوارب.',
                'description_en' => 'Perched on the private islands of Tawila, this architectural masterpiece features seamless indoor-outdoor living, double-height ceilings, floor-to-ceiling glass pavilions, a gourmet chef kitchen, private gym, and an expansive sunset pergola overlooking turquoise crystal waters.',
                'description_ar' => 'تقع على جزر تويلا الهادئة وتتميز بتصميم معماري عصري مدمج مع الطبيعة، أسقف مزدوجة الارتفاع، واجهات زجاجية بانورامية، مطبخ شيف متكامل، صالة رياضية خاصة، وتراس واسع بإطلالة مباشرة على غروب الشمس فوق مياه الجونة الصافية.',
                'listing_type' => 'rent',
                'bedrooms' => 5,
                'bathrooms' => 6,
                'max_guests' => 10,
                'area_sqm' => 550.00,
                'floor' => 1,
                'compound' => 'Tawila Lagoons',
                'view' => 'Sunset Lagoon & Sea Horizon',
                'address' => 'Island 3, Tawila Water Villas, El Gouna',
                'latitude' => 27.4190,
                'longitude' => 33.6705,
                'min_stay_nights' => 3,
                'max_stay_nights' => 45,
                'check_in_time' => '15:00:00',
                'check_out_time' => '11:00:00',
                'base_price_cents' => 1850000, // 18,500 EGP per night
                'currency' => 'EGP',
                'cleaning_fee_cents' => 200000,
                'service_fee_cents' => 250000,
                'tax_percentage' => 14.00,
                'payment_requirement' => 'both',
                'deposit_percentage' => 30.00,
                'booking_mode' => 'instant',
                'cancellation_policy' => 'flexible',
                'developer' => 'Orascom Development',
                'completion_status' => 'ready',
                'furnished_status' => 'furnished',
                'is_featured' => true,
                'is_published' => true,
                'is_available' => true,
                'status' => 'published',
                'images' => [
                    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1400&q=80',
                    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
                ],
            ],
            [
                'reference_number' => 'GON-PROP-007',
                'slug' => 'cyan-waterside-modern-townhouse',
                'property_category_id' => $townhousesCat?->id,
                'location_id' => $fanadir?->id,
                'title_en' => 'Cyan Waterside Contemporary Townhouse',
                'title_ar' => 'تاون هاوس عصري بإطلالة مائية في سيان',
                'short_description_en' => 'Modern 3-bedroom corner townhouse with lagoon deck, private plunge pool, and floor-to-ceiling glass lounge.',
                'short_description_ar' => 'تاون هاوس ناصية من 3 غرف نوم بحمام سباحة خاص وتراس خشبي يطل مباشرة على مياه البحيرة.',
                'description_en' => 'Located in the stylish Cyan neighborhood, this sunlit home offers minimalist luxury, Scandinavian furnishings, outdoor barbecue patio, and tranquil lagoon views just moments from the beach.',
                'description_ar' => 'يقع في حي سيان الهادئ، ويوفر تصميماً بسيطاً مفعماً بالنور، أثاثاً راقياً، منطقة شواء خارجية، وإطلالة مباشرة على البحيرة بالقرب من أرقى شواطئ الجونة.',
                'listing_type' => 'both', // Rent & Sale
                'bedrooms' => 3,
                'bathrooms' => 3,
                'max_guests' => 6,
                'area_sqm' => 220.00,
                'floor' => 1,
                'compound' => 'Cyan El Gouna',
                'view' => 'Direct Lagoon & Green Park',
                'address' => 'Unit C-14, Cyan Waterfront, El Gouna',
                'latitude' => 27.4110,
                'longitude' => 33.6680,
                'min_stay_nights' => 2,
                'max_stay_nights' => 30,
                'check_in_time' => '15:00:00',
                'check_out_time' => '11:00:00',
                'base_price_cents' => 950000, // 9,500 EGP / night
                'sale_price_cents' => 2450000000, // 24,500,000 EGP
                'currency' => 'EGP',
                'cleaning_fee_cents' => 120000,
                'service_fee_cents' => 150000,
                'tax_percentage' => 14.00,
                'payment_requirement' => 'both',
                'deposit_percentage' => 30.00,
                'booking_mode' => 'instant',
                'cancellation_policy' => 'flexible',
                'developer' => 'Orascom Development',
                'completion_status' => 'ready',
                'furnished_status' => 'furnished',
                'is_featured' => true,
                'is_published' => true,
                'is_available' => true,
                'status' => 'published',
                'images' => [
                    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=80',
                    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
                ],
            ],
            [
                'reference_number' => 'GON-PROP-008',
                'slug' => 'ancient-sands-golf-panoramic-penthouse',
                'property_category_id' => $apartmentsCat?->id,
                'location_id' => $westGolf?->id,
                'title_en' => 'Ancient Sands Panoramic Golf Penthouse',
                'title_ar' => 'بنتهاوس بانورامي مطل على ملاعب الجولف في إنشنت ساندز',
                'short_description_en' => 'Executive 3-bedroom rooftop penthouse with private jacuzzi, Karl Litten golf course views, and endless Red Sea vistas.',
                'short_description_ar' => 'بنتهاوس ملكي من 3 غرف نوم مع جاكوزي بالروف وإطلالة ممتدة على ملاعب الجولف العالمية والبحر.',
                'description_en' => 'Elevated atop the hill at Ancient Sands, enjoy total privacy and cinematic views over the championship golf greens and Red Sea horizon. Includes full resort pool access, daily housekeeping option, and concierge perks.',
                'description_ar' => 'يتميز بموقع مرتفع يوفر إطلالات خيالية على ملاعب الجولف وأفق البحر الأحمر، مع جاكوزي خاص بالروف، دخول مجاني لمسابح المنتجع، وخدمات الكونسيرج الفندقية.',
                'listing_type' => 'rent',
                'bedrooms' => 3,
                'bathrooms' => 3,
                'max_guests' => 6,
                'area_sqm' => 260.00,
                'floor' => 3,
                'compound' => 'Ancient Sands Golf Resort',
                'view' => 'Golf Fairways & Sea Panorama',
                'address' => 'Hilltop Penthouse 302, Ancient Sands, El Gouna',
                'latitude' => 27.3820,
                'longitude' => 33.6810,
                'min_stay_nights' => 2,
                'max_stay_nights' => 45,
                'check_in_time' => '15:00:00',
                'check_out_time' => '12:00:00',
                'base_price_cents' => 1100000, // 11,000 EGP / night
                'currency' => 'EGP',
                'cleaning_fee_cents' => 140000,
                'service_fee_cents' => 180000,
                'tax_percentage' => 14.00,
                'payment_requirement' => 'both',
                'deposit_percentage' => 30.00,
                'booking_mode' => 'instant',
                'cancellation_policy' => 'flexible',
                'is_featured' => true,
                'is_published' => true,
                'is_available' => true,
                'status' => 'published',
                'images' => [
                    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1400&q=80',
                    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
                ],
            ],
            [
                'reference_number' => 'GON-PROP-009',
                'slug' => 'sabina-lagoon-peaceful-chalet',
                'property_category_id' => $chaletsCat?->id,
                'location_id' => $tawila?->id,
                'title_en' => 'Sabina Lagoon Peaceful Family Chalet',
                'title_ar' => 'شاليه عائلي هادئ على بحيرة سابينا',
                'short_description_en' => 'Serene 2-bedroom garden chalet with private lagoon access, sandy sunbathing lawn, and shaded outdoor dining pergola.',
                'short_description_ar' => 'شاليه عائلي هادئ من غرفتي نوم بحديقة وشاطئ رملي خاص على بحيرة سابينا الهادئة.',
                'description_en' => 'Ideal for families and couples seeking tranquility. Step directly from your patio onto the lagoon beach, kayak in calm waters, and enjoy spectacular starry night skies in El Gouna.',
                'description_ar' => 'مثالي للعائلات الباحثة عن الهدوء والاستجمام. خطوات معدودة من التراس إلى مياه البحيرة، مع إمكانية التجديف بالكياك والتمتع بليالي الجونة الهادئة.',
                'listing_type' => 'rent',
                'bedrooms' => 2,
                'bathrooms' => 2,
                'max_guests' => 4,
                'area_sqm' => 140.00,
                'floor' => 0,
                'compound' => 'Sabina Lagoons',
                'view' => 'Calm Lagoon Beach',
                'address' => 'Chalet 18, Sabina, El Gouna',
                'latitude' => 27.4050,
                'longitude' => 33.6730,
                'min_stay_nights' => 2,
                'max_stay_nights' => 30,
                'check_in_time' => '15:00:00',
                'check_out_time' => '11:00:00',
                'base_price_cents' => 680000, // 6,800 EGP / night
                'currency' => 'EGP',
                'cleaning_fee_cents' => 100000,
                'service_fee_cents' => 120000,
                'tax_percentage' => 14.00,
                'payment_requirement' => 'both',
                'deposit_percentage' => 30.00,
                'booking_mode' => 'instant',
                'cancellation_policy' => 'flexible',
                'is_featured' => false,
                'is_published' => true,
                'is_available' => true,
                'status' => 'published',
                'images' => [
                    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1400&q=80',
                    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
                ],
            ],
        ];

        // Seed or update properties
        foreach ($propertiesData as $pData) {
            $images = $pData['images'] ?? [];
            unset($pData['images']);

            $prop = Property::updateOrCreate(
                ['reference_number' => $pData['reference_number']],
                $pData
            );

            $prop->amenities()->sync($allAmenities->pluck('id'));
            $prop->paymentMethods()->sync($allPaymentMethods->pluck('id'));

            // Attach Media Images
            foreach ($images as $idx => $imgUrl) {
                Media::updateOrCreate(
                    [
                        'mediable_type' => Property::class,
                        'mediable_id' => $prop->id,
                        'file_path' => $imgUrl,
                    ],
                    [
                        'file_name' => basename(parse_url($imgUrl, PHP_URL_PATH) ?? 'photo.jpg'),
                        'file_type' => 'image',
                        'mime_type' => 'image/jpeg',
                        'file_size' => 1024000,
                        'disk' => 'public',
                        'alt_text_en' => $prop->title_en,
                        'alt_text_ar' => $prop->title_ar,
                        'sort_order' => $idx + 1,
                        'is_featured' => $idx === 0,
                    ]
                );
            }
        }

        // Also ensure existing initial properties have valid Media images attached!
        $existingProps = Property::all();
        $fallbackImages = [
            'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1400&q=80',
        ];

        foreach ($existingProps as $i => $ep) {
            if ($ep->images()->count() === 0) {
                $chosenImg = $fallbackImages[$i % count($fallbackImages)];
                Media::create([
                    'mediable_type' => Property::class,
                    'mediable_id' => $ep->id,
                    'file_path' => $chosenImg,
                    'file_name' => "prop-{$ep->id}.jpg",
                    'file_type' => 'image',
                    'mime_type' => 'image/jpeg',
                    'file_size' => 1024000,
                    'disk' => 'public',
                    'alt_text_en' => $ep->title_en,
                    'alt_text_ar' => $ep->title_ar,
                    'sort_order' => 1,
                    'is_featured' => true,
                ]);
            }
        }

        // =========================================================================
        // 2. DETAILED VIP CLIENTS & GUEST PROFILES
        // =========================================================================
        $clients = [
            [
                'email' => 'sarah.mansour@example.com',
                'first_name' => 'Sarah',
                'last_name' => 'Mansour',
                'phone' => '+201012345678',
                'phone_country_code' => '+20',
                'nationality' => 'Egyptian',
                'country_of_residence' => 'Egypt',
                'notes' => 'VVIP frequent guest. Prefers late check-out, lagoon sunset view, and private housekeeping service.',
                'source' => 'website',
                'is_active' => true,
            ],
            [
                'email' => 'alex.weber@example.de',
                'first_name' => 'Alexander',
                'last_name' => 'Weber',
                'phone' => '+491701234567',
                'phone_country_code' => '+49',
                'nationality' => 'German',
                'country_of_residence' => 'Germany',
                'notes' => 'Pro kitesurfer. Prefers Mangroovy and kite beach villas with gear storage.',
                'source' => 'google',
                'is_active' => true,
            ],
            [
                'email' => 'tariq.alsabah@vip.kw',
                'first_name' => 'Tariq',
                'last_name' => 'Al-Sabah',
                'phone' => '+96599112233',
                'phone_country_code' => '+965',
                'nationality' => 'Kuwaiti',
                'country_of_residence' => 'Kuwait',
                'notes' => 'VVIP royal guest. Requires luxury motor yacht charters, private chefs, and airport VIP greeting.',
                'source' => 'concierge_referral',
                'is_active' => true,
            ],
            [
                'email' => 'lady.eleanor@london.co.uk',
                'first_name' => 'Eleanor',
                'last_name' => 'Vane',
                'phone' => '+447911987654',
                'phone_country_code' => '+44',
                'nationality' => 'British',
                'country_of_residence' => 'United Kingdom',
                'notes' => 'High-profile art curator. Annual winter stay in Fanadir Bay.',
                'source' => 'website',
                'is_active' => true,
            ],
            [
                'email' => 'karim.elgammal@invest.eg',
                'first_name' => 'Karim',
                'last_name' => 'El-Gammal',
                'phone' => '+201288889999',
                'phone_country_code' => '+20',
                'nationality' => 'Egyptian',
                'country_of_residence' => 'Egypt',
                'notes' => 'Prominent real estate investor and yacht enthusiast. Regular buyer in El Gouna.',
                'source' => 'whatsapp',
                'is_active' => true,
            ],
            [
                'email' => 'sophie.dubois@paris.fr',
                'first_name' => 'Sophie',
                'last_name' => 'Dubois',
                'phone' => '+33612345678',
                'phone_country_code' => '+33',
                'nationality' => 'French',
                'country_of_residence' => 'France',
                'notes' => 'Honeymoon couple. Enjoys romantic sunset cruises and private spa treatments.',
                'source' => 'instagram',
                'is_active' => true,
            ],
            [
                'email' => 'omar.farouk@dubai.ae',
                'first_name' => 'Omar',
                'last_name' => 'Farouk',
                'phone' => '+971501234567',
                'phone_country_code' => '+971',
                'nationality' => 'Emirati',
                'country_of_residence' => 'United Arab Emirates',
                'notes' => 'Tech founder. Seeks secluded quiet villas with high-speed fiber internet.',
                'source' => 'website',
                'is_active' => true,
            ],
            [
                'email' => 'marcus.lindqvist@stockholm.se',
                'first_name' => 'Marcus',
                'last_name' => 'Lindqvist',
                'phone' => '+46701234567',
                'phone_country_code' => '+46',
                'nationality' => 'Swedish',
                'country_of_residence' => 'Sweden',
                'notes' => 'Passionate golfer and scuba diver. Prefers Ancient Sands golf villas.',
                'source' => 'referral',
                'is_active' => true,
            ],
            [
                'email' => 'yasmine.rostom@cairo.eg',
                'first_name' => 'Yasmine',
                'last_name' => 'Rostom',
                'phone' => '+201005544332',
                'phone_country_code' => '+20',
                'nationality' => 'Egyptian',
                'country_of_residence' => 'Egypt',
                'notes' => 'VIP table guest for GFF Film Festival and Smokery nightlife events.',
                'source' => 'website',
                'is_active' => true,
            ],
        ];

        $customerModels = [];
        foreach ($clients as $cData) {
            $customerModels[$cData['email']] = Customer::updateOrCreate(
                ['email' => $cData['email']],
                $cData
            );
        }

        // =========================================================================
        // 3. OPERATIONAL BOOKINGS & STAYS ENGINE
        // =========================================================================
        $fanadirVilla = Property::where('slug', 'fanadir-bay-sunlight-villa')->first() ?? Property::first();
        $marinaPenthouse = Property::where('slug', 'abu-tig-marina-penthouse')->first() ?? Property::first();
        $mangroovyChalet = Property::where('slug', 'mangroovy-beachfront-chalet')->first() ?? Property::first();
        $tawilaVilla = Property::where('slug', 'tawila-island-sunset-lagoon-villa')->first() ?? Property::first();
        $cyanTownhouse = Property::where('slug', 'cyan-waterside-modern-townhouse')->first() ?? Property::first();
        $ancientSandsPenthouse = Property::where('slug', 'ancient-sands-golf-panoramic-penthouse')->first() ?? Property::first();
        $sabinaChalet = Property::where('slug', 'sabina-lagoon-peaceful-chalet')->first() ?? Property::first();

        $today = now()->toDateString();

        $bookingsPlan = [
            // A. ACTIVE IN-HOUSE STAYS (Currently checked-in guests!)
            [
                'reference' => 'GON-2026-000201',
                'customer' => $customerModels['sarah.mansour@example.com'],
                'property' => $fanadirVilla,
                'check_in' => now()->subDays(2)->toDateString(),
                'check_out' => now()->addDays(3)->toDateString(),
                'nights' => 5,
                'guests' => 6,
                'nightly_cents' => 1200000,
                'cleaning_cents' => 150000,
                'service_cents' => 200000,
                'status' => 'confirmed',
                'payment_status' => 'paid',
                'notes' => 'Active guest in-house. Villa keys handed over. Requested late check-out on departure day.',
            ],
            [
                'reference' => 'GON-2026-000202',
                'customer' => $customerModels['alex.weber@example.de'],
                'property' => $mangroovyChalet,
                'check_in' => now()->subDays(1)->toDateString(),
                'check_out' => now()->addDays(4)->toDateString(),
                'nights' => 5,
                'guests' => 2,
                'nightly_cents' => 750000,
                'cleaning_cents' => 120000,
                'service_cents' => 150000,
                'status' => 'confirmed',
                'payment_status' => 'paid',
                'notes' => 'Active in-house. Kitesurfing at Mangroovy daily. Paid in full via Credit Card.',
            ],

            // B. TODAY'S CHECK-INS (Guests arriving today!)
            [
                'reference' => 'GON-2026-000203',
                'customer' => $customerModels['tariq.alsabah@vip.kw'],
                'property' => $tawilaVilla,
                'check_in' => $today,
                'check_out' => now()->addDays(5)->toDateString(),
                'nights' => 5,
                'guests' => 8,
                'nightly_cents' => 1850000,
                'cleaning_cents' => 200000,
                'service_cents' => 250000,
                'status' => 'confirmed',
                'payment_status' => 'paid',
                'notes' => 'Expected arrival at 16:00. Airport VIP Maybach pickup organized. Welcome fruit basket and champagne ready.',
            ],
            [
                'reference' => 'GON-2026-000204',
                'customer' => $customerModels['sophie.dubois@paris.fr'],
                'property' => $marinaPenthouse,
                'check_in' => $today,
                'check_out' => now()->addDays(3)->toDateString(),
                'nights' => 3,
                'guests' => 2,
                'nightly_cents' => 850000,
                'cleaning_cents' => 120000,
                'service_cents' => 150000,
                'status' => 'confirmed',
                'payment_status' => 'paid',
                'notes' => 'Honeymoon arrival today at 14:30. Flower bouquet placed on master bed.',
            ],

            // C. TODAY'S CHECK-OUTS (Guests departing today!)
            [
                'reference' => 'GON-2026-000205',
                'customer' => $customerModels['karim.elgammal@invest.eg'],
                'property' => $cyanTownhouse,
                'check_in' => now()->subDays(4)->toDateString(),
                'check_out' => $today,
                'nights' => 4,
                'guests' => 4,
                'nightly_cents' => 950000,
                'cleaning_cents' => 120000,
                'service_cents' => 150000,
                'status' => 'confirmed',
                'payment_status' => 'paid',
                'notes' => 'Departing today at 11:30. Luggage storage arranged at Marina desk. Housekeeping dispatched for turnover.',
            ],

            // D. UPCOMING ARRIVALS (Next 2-7 days)
            [
                'reference' => 'GON-2026-000206',
                'customer' => $customerModels['lady.eleanor@london.co.uk'],
                'property' => $ancientSandsPenthouse,
                'check_in' => now()->addDays(2)->toDateString(),
                'check_out' => now()->addDays(7)->toDateString(),
                'nights' => 5,
                'guests' => 4,
                'nightly_cents' => 1100000,
                'cleaning_cents' => 140000,
                'service_cents' => 180000,
                'status' => 'confirmed',
                'payment_status' => 'paid',
                'notes' => 'Arrival in 2 days. Requested extra hypoallergenic pillows and quiet suite setup.',
            ],
            [
                'reference' => 'GON-2026-000207',
                'customer' => $customerModels['marcus.lindqvist@stockholm.se'],
                'property' => $sabinaChalet,
                'check_in' => now()->addDays(4)->toDateString(),
                'check_out' => now()->addDays(10)->toDateString(),
                'nights' => 6,
                'guests' => 3,
                'nightly_cents' => 680000,
                'cleaning_cents' => 100000,
                'service_cents' => 120000,
                'status' => 'confirmed',
                'payment_status' => 'paid',
                'notes' => 'Golf package booked with Ancient Sands golf club. Green fees confirmed.',
            ],
            [
                'reference' => 'GON-2026-000208',
                'customer' => $customerModels['omar.farouk@dubai.ae'],
                'property' => $fanadirVilla,
                'check_in' => now()->addDays(5)->toDateString(),
                'check_out' => now()->addDays(9)->toDateString(),
                'nights' => 4,
                'guests' => 5,
                'nightly_cents' => 1200000,
                'cleaning_cents' => 150000,
                'service_cents' => 200000,
                'status' => 'pending',
                'payment_status' => 'partially_paid',
                'notes' => 'Deposit paid. Balance due upon check-in.',
            ],

            // E. COMPLETED PAST STAYS (Historic records)
            [
                'reference' => 'GON-2026-000190',
                'customer' => $customerModels['sarah.mansour@example.com'],
                'property' => $marinaPenthouse,
                'check_in' => now()->subDays(15)->toDateString(),
                'check_out' => now()->subDays(11)->toDateString(),
                'nights' => 4,
                'guests' => 4,
                'nightly_cents' => 850000,
                'cleaning_cents' => 120000,
                'service_cents' => 150000,
                'status' => 'completed',
                'payment_status' => 'paid',
                'notes' => 'Stay completed with excellent 5-star review. Zero damages.',
            ],
            [
                'reference' => 'GON-2026-000191',
                'customer' => $customerModels['alex.weber@example.de'],
                'property' => $mangroovyChalet,
                'check_in' => now()->subDays(25)->toDateString(),
                'check_out' => now()->subDays(20)->toDateString(),
                'nights' => 5,
                'guests' => 2,
                'nightly_cents' => 750000,
                'cleaning_cents' => 120000,
                'service_cents' => 150000,
                'status' => 'completed',
                'payment_status' => 'paid',
                'notes' => 'Regular kite trip completed.',
            ],

            // F. CANCELLED & REFUNDED (Test audit trails & filters)
            [
                'reference' => 'GON-2026-000180',
                'customer' => $customerModels['yasmine.rostom@cairo.eg'],
                'property' => $cyanTownhouse,
                'check_in' => now()->addDays(12)->toDateString(),
                'check_out' => now()->addDays(15)->toDateString(),
                'nights' => 3,
                'guests' => 2,
                'nightly_cents' => 950000,
                'cleaning_cents' => 120000,
                'service_cents' => 150000,
                'status' => 'cancelled',
                'payment_status' => 'refunded',
                'notes' => 'Cancelled by guest due to emergency flight change. 100% refund processed within flexible cancellation window.',
            ],
        ];

        foreach ($bookingsPlan as $bPlan) {
            $subtotal = $bPlan['nightly_cents'] * $bPlan['nights'];
            $cleaning = $bPlan['cleaning_cents'];
            $service = $bPlan['service_cents'];
            $tax = (int) round(($subtotal + $cleaning + $service) * 0.14);
            $total = $subtotal + $cleaning + $service + $tax;

            $paid = $bPlan['payment_status'] === 'paid' ? $total : (int) round($total * 0.35);
            $remaining = $total - $paid;

            $booking = Booking::updateOrCreate(
                ['reference' => $bPlan['reference']],
                [
                    'customer_id' => $bPlan['customer']->id,
                    'bookable_type' => Property::class,
                    'bookable_id' => $bPlan['property']->id,
                    'check_in' => $bPlan['check_in'],
                    'check_out' => $bPlan['check_out'],
                    'nights' => $bPlan['nights'],
                    'guests' => $bPlan['guests'],
                    'subtotal_cents' => $subtotal,
                    'cleaning_fee_cents' => $cleaning,
                    'service_fee_cents' => $service,
                    'tax_cents' => $tax,
                    'discount_cents' => 0,
                    'total_cents' => $total,
                    'deposit_cents' => (int) round($total * 0.30),
                    'amount_paid_cents' => $paid,
                    'amount_remaining_cents' => $remaining,
                    'currency' => 'EGP',
                    'payment_type' => $bPlan['payment_status'] === 'paid' ? 'full' : 'deposit',
                    'payment_method_id' => $cardMethod?->id,
                    'status' => $bPlan['status'],
                    'payment_status' => $bPlan['payment_status'],
                    'balance_due_date' => $bPlan['check_in'],
                    'source' => 'website',
                    'internal_notes' => $bPlan['notes'] ?? '',
                ]
            );

            // Nightly Snapshot
            for ($n = 0; $n < $bPlan['nights']; $n++) {
                $nDate = date('Y-m-d', strtotime("{$bPlan['check_in']} +{$n} days"));
                BookingNightlyPrice::updateOrCreate(
                    ['booking_id' => $booking->id, 'night_date' => $nDate],
                    [
                        'price_cents' => $bPlan['nightly_cents'],
                        'currency' => 'EGP',
                        'is_base_price' => true,
                    ]
                );
            }

            // Payment Transaction
            PaymentTransaction::updateOrCreate(
                ['transaction_id' => "TXN-{$booking->reference}"],
                [
                    'booking_id' => $booking->id,
                    'customer_id' => $bPlan['customer']->id,
                    'payment_method_id' => $cardMethod?->id,
                    'amount_cents' => $paid,
                    'currency' => 'EGP',
                    'type' => 'payment',
                    'status' => 'completed',
                    'gateway_provider' => 'card',
                    'gateway_reference' => "GATEWAY-{$booking->reference}",
                    'completed_at' => now(),
                ]
            );
        }

        // =========================================================================
        // 4. VIP CONCIERGE REQUESTS ACROSS ALL WORKFLOW QUEUES
        // =========================================================================
        $conciergeRequests = [
            [
                'request_number' => 'CR-20261008-0001',
                'customer_name' => 'H.E. Sheikh Tariq Al-Sabah',
                'customer_email' => 'tariq.alsabah@vip.kw',
                'customer_phone' => '+96599112233',
                'customer_id' => $customerModels['tariq.alsabah@vip.kw']->id,
                'request_type' => 'yacht',
                'priority' => 'urgent',
                'status' => 'quoted',
                'description' => '65ft Luxury Motor Yacht charter for 6 hours around Tavila Island with gourmet sushi catering and premium champagne service.',
                'preferred_date' => now()->addDays(2)->toDateString(),
                'preferred_time' => '13:00',
                'location' => 'Abu Tig Marina',
                'guests_count' => 8,
                'budget_cents' => 4500000,
                'currency' => 'EGP',
                'assigned_to' => $adminUser?->id,
                'assigned_at' => now()->subHours(4),
                'notes' => 'Captain Tamer on standby at Marina dock. Client requested Japanese sushi master on board.',
            ],
            [
                'request_number' => 'CR-20261008-0002',
                'customer_name' => 'Lady Eleanor Vane',
                'customer_email' => 'lady.eleanor@london.co.uk',
                'customer_phone' => '+447911987654',
                'customer_id' => $customerModels['lady.eleanor@london.co.uk']->id,
                'request_type' => 'private_chef',
                'priority' => 'high',
                'status' => 'confirmed',
                'description' => 'Private Michelin-trained French chef for an intimate 5-course dinner at Fanadir Bay Villa terrace.',
                'preferred_date' => now()->addDays(3)->toDateString(),
                'preferred_time' => '19:30',
                'location' => 'Fanadir Bay Waterfront Villa',
                'guests_count' => 6,
                'budget_cents' => 1800000,
                'currency' => 'EGP',
                'assigned_to' => $adminUser?->id,
                'assigned_at' => now()->subHours(10),
                'notes' => 'Chef Jean-Luc confirmed menu: Seared scallops, truffle risotto, Red Sea sea bass, and raspberry souffle.',
            ],
            [
                'request_number' => 'CR-20261008-0003',
                'customer_name' => 'Omar Farouk',
                'customer_email' => 'omar.farouk@dubai.ae',
                'customer_phone' => '+971501234567',
                'customer_id' => $customerModels['omar.farouk@dubai.ae']->id,
                'request_type' => 'transport',
                'priority' => 'high',
                'status' => 'in_progress',
                'description' => 'VIP Airport Transfer from Hurghada International Airport directly to El Gouna via Mercedes Maybach with tarmac greeting.',
                'preferred_date' => now()->addDays(5)->toDateString(),
                'preferred_time' => '11:45',
                'location' => 'Hurghada Airport VIP Lounge',
                'guests_count' => 2,
                'budget_cents' => 350000,
                'currency' => 'EGP',
                'assigned_to' => $adminUser?->id,
                'assigned_at' => now()->subHours(2),
                'notes' => 'Flight EK924 arriving terminal 2. Airport pass requested for chauffeur.',
            ],
            [
                'request_number' => 'CR-20261008-0004',
                'customer_name' => 'Alexander Weber',
                'customer_email' => 'alex.weber@example.de',
                'customer_phone' => '+491701234567',
                'customer_id' => $customerModels['alex.weber@example.de']->id,
                'request_type' => 'activities',
                'priority' => 'normal',
                'status' => 'new',
                'description' => 'Advanced downwind kitesurfing expedition to Tawila Island sandbar with rescue zodiac boat support.',
                'preferred_date' => now()->addDays(1)->toDateString(),
                'preferred_time' => '10:00',
                'location' => 'Mangroovy Kite Beach',
                'guests_count' => 3,
                'budget_cents' => 850000,
                'currency' => 'EGP',
                'assigned_to' => null, // Unassigned for testing assign button!
                'assigned_at' => null,
                'notes' => 'Awaiting staff assignment at front desk.',
            ],
            [
                'request_number' => 'CR-20261008-0005',
                'customer_name' => 'Karim El-Gammal',
                'customer_email' => 'karim.elgammal@invest.eg',
                'customer_phone' => '+201288889999',
                'customer_id' => $customerModels['karim.elgammal@invest.eg']->id,
                'request_type' => 'nightlife',
                'priority' => 'urgent',
                'status' => 'completed',
                'description' => 'VIP Front-Row Table and Premium Bottle Service at Smokery Beach Club Sunset Sessions.',
                'preferred_date' => now()->subDays(1)->toDateString(),
                'preferred_time' => '22:00',
                'location' => 'Abu Tig Marina Smokery Beach',
                'guests_count' => 6,
                'budget_cents' => 2500000,
                'currency' => 'EGP',
                'assigned_to' => $adminUser?->id,
                'assigned_at' => now()->subDays(2),
                'notes' => 'Table #1 secured. Guest enjoyed event thoroughly and tipped host.',
            ],
            [
                'request_number' => 'CR-20261008-0006',
                'customer_name' => 'Sophie Dubois',
                'customer_email' => 'sophie.dubois@paris.fr',
                'customer_phone' => '+33612345678',
                'customer_id' => $customerModels['sophie.dubois@paris.fr']->id,
                'request_type' => 'wellness',
                'priority' => 'normal',
                'status' => 'quoted',
                'description' => 'Couples In-Villa Aromatherapy and Deep Tissue Massage session on the private lagoon deck.',
                'preferred_date' => now()->addDays(1)->toDateString(),
                'preferred_time' => '17:00',
                'location' => 'Abu Tig Marina Penthouse Deck',
                'guests_count' => 2,
                'budget_cents' => 450000,
                'currency' => 'EGP',
                'assigned_to' => $adminUser?->id,
                'assigned_at' => now()->subHours(6),
                'notes' => 'Spa specialists from Steigenberger Spa confirmed availability.',
            ],
        ];

        foreach ($conciergeRequests as $cReq) {
            $notesText = $cReq['notes'];
            unset($cReq['notes']);

            $req = ConciergeRequest::updateOrCreate(
                ['request_number' => $cReq['request_number']],
                $cReq
            );

            ConciergeNote::updateOrCreate(
                ['concierge_request_id' => $req->id, 'content' => $notesText],
                [
                    'user_id' => $adminUser?->id,
                    'author_name' => $adminUser?->name ?? 'GouNow Concierge Operations',
                    'is_customer_visible' => false,
                ]
            );

            // Add Quote if quoted or confirmed
            if ($req->status === 'quoted' || $req->status === 'confirmed') {
                $subtotal = $req->budget_cents;
                $fee = (int) round($subtotal * 0.10);
                $total = $subtotal + $fee;

                $quote = ConciergeQuote::updateOrCreate(
                    ['concierge_request_id' => $req->id],
                    [
                        'quote_number' => "QT-{$req->request_number}",
                        'status' => $req->status === 'confirmed' ? 'accepted' : 'sent',
                        'currency' => 'EGP',
                        'subtotal_cents' => $subtotal,
                        'discount_cents' => 0,
                        'fees_cents' => $fee,
                        'total_cents' => $total,
                        'valid_until' => now()->addDays(3),
                        'notes' => 'Official all-inclusive VIP GouNow Concierge Package.',
                        'created_by' => $adminUser?->id,
                    ]
                );

                ConciergeQuoteItem::updateOrCreate(
                    ['concierge_quote_id' => $quote->id, 'title' => "VIP {$req->request_type} Curated Experience"],
                    [
                        'item_type' => $req->request_type,
                        'description' => $req->description,
                        'quantity' => 1,
                        'unit_price_cents' => $subtotal,
                        'total_price_cents' => $subtotal,
                    ]
                );
            }
        }

        // =========================================================================
        // 5. CRM LEADS & HIGH-INTENT INVESTMENT INQUIRIES
        // =========================================================================
        $leads = [
            [
                'email' => 'tarek.khalil@investcorp.com',
                'name' => 'Tarek Khalil',
                'phone' => '+201098765432',
                'type' => 'property_sale',
                'source' => 'whatsapp',
                'message' => 'Looking to purchase a 4 to 5 bedroom standalone waterfront villa in Tawila or Fanadir Bay with budget up to 50,000,000 EGP cash payment.',
                'status' => 'qualified',
                'property_location' => 'Fanadir Bay / Tawila Island',
                'property_type' => 'Villa',
                'property_bedrooms' => 5,
                'expected_price_cents' => 5000000000,
                'admin_notes' => 'High-intent investor based in Dubai. Scheduled viewing tour for this Friday.',
            ],
            [
                'email' => 'mona.elshazly@media.eg',
                'name' => 'Mona El-Shazly',
                'phone' => '+201122334455',
                'type' => 'yacht_charter',
                'source' => 'website',
                'message' => 'Need a 70ft luxury yacht for corporate executive retreat with 15 guests during the El Gouna Film Festival week.',
                'status' => 'contacted',
                'property_location' => 'Abu Tig Marina',
                'property_type' => 'Yacht',
                'expected_price_cents' => 12000000,
                'admin_notes' => 'Shared Majesty 65 and Catamaran portfolio.',
            ],
            [
                'email' => 'david.stern@geneva.ch',
                'name' => 'David Stern',
                'phone' => '+41791234567',
                'type' => 'long_term_rental',
                'source' => 'referral',
                'message' => 'Inquiring about 3-month winter residency villa in West Golf with private heated pool and daily cleaning service.',
                'status' => 'new',
                'property_location' => 'West Golf',
                'property_type' => 'Villa',
                'property_bedrooms' => 3,
                'expected_price_cents' => 45000000,
                'admin_notes' => 'Arriving end of October for in-person inspection.',
            ],
        ];

        foreach ($leads as $lData) {
            Lead::updateOrCreate(
                ['email' => $lData['email']],
                $lData
            );
        }

        // =========================================================================
        // 6. ADDITIONAL NIGHTLIFE & BEACH VENUES
        // =========================================================================
        $venues = [
            [
                'slug' => 'club-88-pool-and-beach',
                'location_id' => $marina?->id,
                'name_en' => 'Club 88 Pool & Beach Lounge',
                'name_ar' => 'كلوب 88 لاونج الشاطئ والمسبح',
                'description_en' => 'Celebrated luxury beach club with saltwater pool overlooking the Red Sea, famous for chill house beats and gourmet Mediterranean cuisine.',
                'description_ar' => 'أشهر أندية الشاطئ الفاخرة بمسبحه المطل على البحر الأبيض المتوسط وسهراته الموسيقية الراقية.',
                'venue_type' => 'beach_club',
                'capacity' => 280,
                'address' => 'Abu Tig Marina South, El Gouna',
                'latitude' => 27.3985,
                'longitude' => 33.6815,
                'map_url' => 'https://maps.google.com/?q=27.3985,33.6815',
                'facilities' => ['Infinity Saltwater Pool', 'Daybeds', 'Cocktail Bar', 'DJ Booth', 'Beach Cabanas'],
                'cover_image' => 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
                'status' => 'active',
            ],
            [
                'slug' => 'moods-restaurant-and-beach-club',
                'location_id' => $marina?->id,
                'name_en' => 'Moods Restaurant & Beach Club',
                'name_ar' => 'مطعم ونادي شاطئ مودز',
                'description_en' => 'Iconic beachfront dining and cocktail lounge right at the mouth of Abu Tig Marina basin.',
                'description_ar' => 'مطعم وشاطئ أيقوني يقع مباشرة عند مدخل حوض يخوت مارينا أبو تيج.',
                'venue_type' => 'restaurant_lounge',
                'capacity' => 200,
                'address' => 'Northern Basin Pier, Abu Tig Marina, El Gouna',
                'latitude' => 27.3995,
                'longitude' => 33.6830,
                'map_url' => 'https://maps.google.com/?q=27.3995,33.6830',
                'facilities' => ['Waterfront Dining Deck', 'Cocktail Lounge', 'Sunset Terrace', 'Marina Pier Access'],
                'cover_image' => 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
                'status' => 'active',
            ],
        ];

        foreach ($venues as $vData) {
            Venue::updateOrCreate(
                ['slug' => $vData['slug']],
                $vData
            );
        }
    }
}
