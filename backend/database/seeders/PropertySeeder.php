<?php

namespace Database\Seeders;

use App\Models\Amenity;
use App\Models\Location;
use App\Models\PaymentMethod;
use App\Models\Property;
use App\Models\PropertyCategory;
use Illuminate\Database\Seeder;

class PropertySeeder extends Seeder
{
    public function run(): void
    {
        $villasCat = PropertyCategory::where('slug', 'luxury-villas')->first();
        $chaletsCat = PropertyCategory::where('slug', 'waterfront-chalets')->first();
        $apartmentsCat = PropertyCategory::where('slug', 'marina-apartments')->first();
        $townhousesCat = PropertyCategory::where('slug', 'townhouses')->first();

        $fanadir = Location::where('slug', 'fanadir-bay')->first();
        $marina = Location::where('slug', 'abu-tig-marina')->first();
        $mangroovy = Location::where('slug', 'mangroovy-kite-beach')->first();
        $westGolf = Location::where('slug', 'west-golf')->first();
        $tawila = Location::where('slug', 'tawila-island-lagoons')->first();

        $allAmenities = Amenity::all();
        $allPaymentMethods = PaymentMethod::all();

        $properties = [
            [
                'reference_number' => 'GON-PROP-001',
                'slug' => 'fanadir-bay-sunlight-villa',
                'property_category_id' => $villasCat?->id,
                'location_id' => $fanadir?->id,
                'title_en' => 'Fanadir Bay Waterfront Villa',
                'title_ar' => 'فيلا خليج فنادير المطلة على البحيرة',
                'short_description_en' => 'Sublime 4-bedroom signature villa with heated private infinity pool and direct turquoise lagoon beach.',
                'short_description_ar' => 'فيلا استثنائية من 4 غرف نوم بحمام سباحة دافئ وإطلالة ساحرة مباشرة على البحيرة الفيروزية.',
                'description_en' => 'Designed with earthy sand tones, floor-to-ceiling glass, and coastal organic textures, this Fanadir Bay masterpiece offers the pinnacle of El Gouna living. Features an expansive open-plan lounge, shaded outdoor dining pergolas, barbecue bar, sun loungers, and private dock access.',
                'description_ar' => 'صُممت الفيلا بدرجات رمال الجونة الدافئة وواجهات زجاجية واسعة وخامات طبيعية راقية. تتميز بمساحات معيشة رحبة، جلسات خارجية مظللة، ركن شواء، وحمام سباحة خاص يندمج مع مياه البحيرة.',
                'listing_type' => 'rent',
                'bedrooms' => 4,
                'bathrooms' => 5,
                'max_guests' => 8,
                'area_sqm' => 420.00,
                'floor' => 1,
                'compound' => 'Fanadir Bay',
                'address' => 'Villa 12, Fanadir Bay Waterfront, El Gouna',
                'latitude' => 27.4162,
                'longitude' => 33.6661,
                'min_stay_nights' => 3,
                'max_stay_nights' => 30,
                'check_in_time' => '15:00:00',
                'check_out_time' => '11:00:00',
                'base_price_cents' => 1200000, // 12,000 EGP per night base
                'currency' => 'EGP',
                'cleaning_fee_cents' => 150000, // 1,500 EGP
                'service_fee_cents' => 200000,  // 2,000 EGP
                'tax_percentage' => 14.00,
                'payment_requirement' => 'both',
                'deposit_percentage' => 30.00,
                'booking_mode' => 'instant',
                'cancellation_policy' => 'moderate',
                'cancellation_policy_text_en' => 'Full refund up to 7 days before check-in. 50% refund thereafter.',
                'cancellation_policy_text_ar' => 'استرداد كامل حتى 7 أيام قبل موعد الوصول، وخصم 50% بعد ذلك.',
                'house_rules_en' => 'No loud parties after 11 PM. Strictly non-smoking inside the villa.',
                'house_rules_ar' => 'يمنع الحفلات الصاخبة بعد 11 مساءً. التدخين ممنوع داخل الفيلا.',
                'is_featured' => true,
                'is_published' => true,
                'is_available' => true,
                'status' => 'published',
            ],
            [
                'reference_number' => 'GON-PROP-002',
                'slug' => 'abu-tig-marina-penthouse',
                'property_category_id' => $apartmentsCat?->id,
                'location_id' => $marina?->id,
                'title_en' => 'Abu Tig Marina Luxury Penthouse',
                'title_ar' => 'بنتهاوس فاخر بمارينا أبو تيج',
                'short_description_en' => 'Spectacular 3-bedroom rooftop penthouse with panoramic marina yacht basin views and private sun deck.',
                'short_description_ar' => 'بنتهاوس ساحر من 3 غرف نوم مع روف خاص وإطلالة بانورامية كاملة على مارينا اليخوت.',
                'description_en' => 'Positioned directly along the prestigious Abu Tig Marina promenade, this penthouse harmonizes relaxed boho luxury with immediate walking access to fine dining, cafes, boutique shopping, and marina nightlife.',
                'description_ar' => 'يقع مباشرة بمحاذاة ممشى مارينا أبو تيج الراقي، ويجمع بين فخامة الطابع الساحلي والهدوء مع القرب التام من أشهر مطاعم ومقاهي ومتاجر الجونة.',
                'listing_type' => 'both', // Both rent and sale!
                'bedrooms' => 3,
                'bathrooms' => 3,
                'max_guests' => 6,
                'area_sqm' => 245.00,
                'floor' => 3,
                'compound' => 'Abu Tig Marina Basin',
                'address' => 'Building 22, Marina Boulevard, El Gouna',
                'latitude' => 27.4045,
                'longitude' => 33.6760,
                'min_stay_nights' => 2,
                'max_stay_nights' => 60,
                'check_in_time' => '15:00:00',
                'check_out_time' => '12:00:00',
                'base_price_cents' => 850000, // 8,500 EGP per night
                'sale_price_cents' => 2800000000, // 28,000,000 EGP
                'currency' => 'EGP',
                'cleaning_fee_cents' => 120000,
                'service_fee_cents' => 150000,
                'tax_percentage' => 14.00,
                'payment_requirement' => 'both',
                'deposit_percentage' => 30.00,
                'booking_mode' => 'instant',
                'cancellation_policy' => 'flexible',
                'developer' => 'Orascom Development Egypt',
                'completion_status' => 'ready',
                'furnished_status' => 'furnished',
                'is_featured' => true,
                'is_published' => true,
                'is_available' => true,
                'status' => 'published',
            ],
            [
                'reference_number' => 'GON-PROP-003',
                'slug' => 'mangroovy-beachfront-chalet',
                'property_category_id' => $chaletsCat?->id,
                'location_id' => $mangroovy?->id,
                'title_en' => 'Mangroovy Beachfront Ground Chalet',
                'title_ar' => 'شاليه أرضي على البحر في مانجروفي',
                'short_description_en' => 'Chic 2-bedroom garden chalet steps from the open sea beach clubs and kitesurf centers.',
                'short_description_ar' => 'شاليه أنيق بحديقة خاصة من غرفتي نوم على بعد خطوات من شاطئ البحر ونوادي الكايت سيرف.',
                'description_en' => 'Unwind in this ground floor sanctuary with lush lawn, outdoor dining, and immediate access to Mangroovy’s legendary open Red Sea beach, club pool, and pristine kite beaches.',
                'description_ar' => 'استمتع بإقامة هادئة في شاليه أرضي بحديقة خضراء وجلسة خارجية راقية مع إمكانية الوصول الفوري لشواطئ مانجروفي والمسابح ومراكز الرياضات المائية.',
                'listing_type' => 'rent',
                'bedrooms' => 2,
                'bathrooms' => 2,
                'max_guests' => 4,
                'area_sqm' => 135.00,
                'floor' => 0,
                'compound' => 'Mangroovy Residence',
                'address' => 'Unit G-04, Mangroovy Beach, El Gouna',
                'latitude' => 27.4215,
                'longitude' => 33.6720,
                'min_stay_nights' => 2,
                'max_stay_nights' => 30,
                'check_in_time' => '15:00:00',
                'check_out_time' => '11:00:00',
                'base_price_cents' => 600000, // 6,000 EGP per night
                'currency' => 'EGP',
                'cleaning_fee_cents' => 90000,
                'service_fee_cents' => 100000,
                'tax_percentage' => 14.00,
                'payment_requirement' => 'both',
                'deposit_percentage' => 30.00,
                'booking_mode' => 'instant',
                'cancellation_policy' => 'moderate',
                'is_featured' => true,
                'is_published' => true,
                'is_available' => true,
                'status' => 'published',
            ],
            [
                'reference_number' => 'GON-PROP-004',
                'slug' => 'tawila-island-modern-villa-for-sale',
                'property_category_id' => $villasCat?->id,
                'location_id' => $tawila?->id,
                'title_en' => 'Tawila Lagoons Modern Designer Villa',
                'title_ar' => 'فيلا عصرية بتصميم معماري حديث في طويلة',
                'short_description_en' => 'Newly finished 5-bedroom lagoon-front masterpiece offered for sale, featuring private pool and infinity dock.',
                'short_description_ar' => 'فيلا راقية حديثة التشطيب من 5 غرف نوم معروضة للبيع بإطلالة مباشرة على بحيرات طويلة.',
                'description_en' => 'An architectural tour de force in Tawila. This contemporary private estate boasts soaring ceilings, seamless indoor-outdoor lagoon flow, private pool, landscaped desert garden, staff quarters, and premium imported finishes.',
                'description_ar' => 'تحفة معمارية عصرية في مجمع طويلة الراقي. أسقف مرتفعة، إطلالات بحرية متصلة، حمام سباحة خاص، غرف للخدم والضيوف وتشطيبات فندقية عالمية.',
                'listing_type' => 'sale', // Exclusive sale listing
                'bedrooms' => 5,
                'bathrooms' => 6,
                'max_guests' => 10,
                'area_sqm' => 510.00,
                'floor' => 1,
                'compound' => 'Tawila Lagoons',
                'address' => 'Villa T-18, Tawila Island, El Gouna',
                'latitude' => 27.3895,
                'longitude' => 33.6598,
                'sale_price_cents' => 4500000000, // 45,000,000 EGP
                'currency' => 'EGP',
                'developer' => 'Orascom Development Egypt',
                'completion_status' => 'ready',
                'furnished_status' => 'semi_furnished',
                'is_featured' => true,
                'is_published' => true,
                'is_available' => true,
                'status' => 'published',
            ],
            [
                'reference_number' => 'GON-PROP-005',
                'slug' => 'west-golf-lagoon-villa',
                'property_category_id' => $villasCat?->id,
                'location_id' => $westGolf?->id,
                'title_en' => 'West Golf Sunset Lagoon Villa',
                'title_ar' => 'فيلا وست جولف بإطلالة الغروب على البحيرة',
                'short_description_en' => 'Charming 3-bedroom Nubian-modern villa with private garden, swimming pool, and golf course vistas.',
                'short_description_ar' => 'فيلا بطابع نوبي معاصر من 3 غرف نوم مع حديقة ومسبح خاص وإطلالة على ملاعب الجولف.',
                'description_en' => 'Nestled on the tranquil lagoon waters of West Golf with sunset views over the golf fairways. Features vaulted brick ceilings, terracotta accents, a private heated pool, and lush bougainvillea gardens.',
                'description_ar' => 'تقع على بحيرات وست جولف الهادئة مع إطلالة بانورامية على ملاعب الجولف والغروب. تتميز بالقباب النوبية التقليدية، حمام سباحة دافئ، وحدائق خضراء وارفة.',
                'listing_type' => 'rent',
                'bedrooms' => 3,
                'bathrooms' => 3,
                'max_guests' => 6,
                'area_sqm' => 280.00,
                'floor' => 1,
                'compound' => 'West Golf Phase 2',
                'address' => 'Villa WG-45, West Golf, El Gouna',
                'latitude' => 27.3828,
                'longitude' => 33.6655,
                'min_stay_nights' => 2,
                'max_stay_nights' => 45,
                'check_in_time' => '15:00:00',
                'check_out_time' => '11:00:00',
                'base_price_cents' => 750000, // 7,500 EGP per night
                'currency' => 'EGP',
                'cleaning_fee_cents' => 120000,
                'service_fee_cents' => 150000,
                'tax_percentage' => 14.00,
                'payment_requirement' => 'both',
                'deposit_percentage' => 30.00,
                'booking_mode' => 'instant',
                'cancellation_policy' => 'flexible',
                'is_featured' => true,
                'is_published' => true,
                'is_available' => true,
                'status' => 'published',
            ],
        ];

        foreach ($properties as $propData) {
            $property = Property::updateOrCreate(
                ['reference_number' => $propData['reference_number']],
                $propData
            );

            // Sync amenities
            $property->amenities()->sync($allAmenities->pluck('id'));

            // Sync payment methods
            $property->paymentMethods()->sync($allPaymentMethods->pluck('id'));
        }
    }
}
