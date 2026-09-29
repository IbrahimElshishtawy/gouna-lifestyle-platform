<?php

namespace Database\Seeders;

use App\Models\Experience;
use App\Models\ExperienceCategory;
use App\Models\Location;
use Illuminate\Database\Seeder;

class ExperienceSeeder extends Seeder
{
    public function run(): void
    {
        $boatCat = ExperienceCategory::where('slug', 'boat-trips')->first();
        $safariCat = ExperienceCategory::where('slug', 'safari')->first();
        $waterCat = ExperienceCategory::where('slug', 'watersports-kitesurfing')->first();
        $wellnessCat = ExperienceCategory::where('slug', 'lifestyle-wellness')->first();

        $marina = Location::where('slug', 'abu-tig-marina')->first();
        $mangroovy = Location::where('slug', 'mangroovy-kite-beach')->first();
        $tawila = Location::where('slug', 'tawila-island-lagoons')->first();

        $experiences = [
            [
                'slug' => 'luxury-private-yacht-charter-tawila-island',
                'experience_category_id' => $boatCat?->id,
                'location_id' => $marina?->id,
                'title_en' => 'Private Yacht Charter to Tawila Island',
                'title_ar' => 'رحلة يخت خاص فاخر إلى جزيرة طويلة',
                'short_description_en' => 'Full-day voyage aboard a 52ft Italian yacht with private captain, chef lunch, and dolphin reef snorkeling.',
                'short_description_ar' => 'يوم كامل على متن يخت إيطالي فاخر 52 قدماً مع قبطان خاص وغداء بحري وسنوركلينج.',
                'description_en' => 'Depart from Abu Tig Marina for an unforgettable day cruise across the pristine waters of the Red Sea. Anchor at Tawila Island’s sandbank for swimming in crystal turquoise lagoons, paddleboarding, snorkeling vivid coral reefs, and savoring freshly prepared seafood.',
                'description_ar' => 'انطلق من مارينا أبو تيج في رحلة بحرية لا تُنسى عبر مياه البحر الأحمر الفيروزية. استمتع بالسباحة في رمال جزيرة طويلة وتناول المأكولات البحرية الطازجة التي يعدها الشيف على متن اليخت.',
                'pricing_model' => 'per_group',
                'base_price_cents' => 3500000, // 35,000 EGP per group
                'currency' => 'EGP',
                'max_capacity' => 12,
                'duration' => '7 Hours (09:00 - 16:00)',
                'payment_requirement' => 'both',
                'deposit_percentage' => 30.00,
                'booking_mode' => 'instant',
                'cancellation_policy_en' => 'Full refund up to 48 hours before departure. Weather-guaranteed rescheduling.',
                'cancellation_policy_ar' => 'استرداد كامل حتى 48 ساعة قبل الرحلة مع ضمان تغيير الموعد في حال تغير الأحوال الجوية.',
                'what_to_bring_en' => 'Swimwear, sun protection, sunglasses, camera.',
                'what_to_bring_ar' => 'ملابس السباحة، واقي الشمس، نظارات شمسية، وكاميرا.',
                'meeting_point_en' => 'Abu Tig Marina, Pier B, Berth 14.',
                'meeting_point_ar' => 'مارينا أبو تيج، رصيف B، مرسى رقم 14.',
                'is_featured' => true,
                'is_published' => true,
                'status' => 'published',
            ],
            [
                'slug' => 'sunset-desert-quad-safari-bedouin-dinner',
                'experience_category_id' => $safariCat?->id,
                'location_id' => $tawila?->id,
                'title_en' => 'Sunset Desert Buggy & Bedouin Stargazing Dinner',
                'title_ar' => 'سفاري باجي صحراوي وقت الغروب مع عشاء بدوي',
                'short_description_en' => 'Drive powerful desert buggies through the Red Sea mountains, followed by candlelit Bedouin feast and telescope stargazing.',
                'short_description_ar' => 'جولة بالباجي الصحراوي بين جبال البحر الأحمر تليها سهرة عشاء بدوي مع رصد النجوم بالتلسكوب.',
                'description_en' => 'Experience the magic of the Eastern Desert. Carve through golden canyons at golden hour, ascend scenic mountain viewpoints for sunset tea, then settle into a private candlelit Bedouin camp for traditional zarb barbecue and guided astronomy telescope viewing.',
                'description_ar' => 'عيش سحر الصحراء الشرقية وقت المغيب. مغامرة عبر الوديان الرملية وإطلالات جبلية مهيبة، ثم الاسترخاء في مخيم بدوي خاص مع عشاء مشويات تقليدي ورصد فلكي للنجوم.',
                'pricing_model' => 'per_person',
                'base_price_cents' => 280000, // 2,800 EGP per person
                'currency' => 'EGP',
                'max_capacity' => 20,
                'duration' => '4.5 Hours',
                'payment_requirement' => 'full',
                'booking_mode' => 'instant',
                'cancellation_policy_en' => 'Free cancellation up to 24 hours in advance.',
                'cancellation_policy_ar' => 'إلغاء مجاني حتى 24 ساعة قبل موعد المغامرة.',
                'what_to_bring_en' => 'Comfortable shoes, sunglasses, light jacket for desert evening.',
                'what_to_bring_ar' => 'حذاء مريح، نظارات شمسية، وسترة خفيفة للمساء في الصحراء.',
                'meeting_point_en' => 'Complimentary pickup from your El Gouna villa or hotel.',
                'meeting_point_ar' => 'خدمة توصيل مجانية من مكان إقامتك داخل الجونة.',
                'is_featured' => true,
                'is_published' => true,
                'status' => 'published',
            ],
            [
                'slug' => 'private-kitesurf-coaching-mangroovy',
                'experience_category_id' => $waterCat?->id,
                'location_id' => $mangroovy?->id,
                'title_en' => 'VIP Private Kitesurf Coaching Session',
                'title_ar' => 'جلسة تدريب كايت سيرف خاصة مع مدرب محترف',
                'short_description_en' => 'One-on-one IKO certified coaching with radio helmet communication and premium Duotone gear.',
                'short_description_ar' => 'تدريب فردي معتمد دولياً باستخدام أحدث المعدات ونظام اتصال لاسلكي بالخوذة.',
                'description_en' => 'Whether you are taking your first board starts or mastering unhooked aerials, train with El Gouna’s top pro riders in the world-class shallow flat-water lagoon of Mangroovy Beach.',
                'description_ar' => 'سواء كنت مبتدئاً تبدأ خطواتك الأولى أو محترفاً ترغب في تطوير قفزاتك الهوائية، تدرب مع نخبة من أبطال اللعبة في المياه الضحلة المسطحة بشاطئ مانجروفي.',
                'pricing_model' => 'per_person',
                'base_price_cents' => 450000, // 4,500 EGP
                'currency' => 'EGP',
                'max_capacity' => 4,
                'duration' => '2 Hours',
                'payment_requirement' => 'full',
                'booking_mode' => 'instant',
                'cancellation_policy_en' => 'Rescheduled free of charge if wind conditions are insufficient.',
                'cancellation_policy_ar' => 'تأجيل مجاني دون أي رسوم في حال عدم توفر سرعة الرياح المناسبة.',
                'what_to_bring_en' => 'Swimwear, rash vest or wetsuit, sunscreen.',
                'what_to_bring_ar' => 'ملابس بحر، بدلة سباحة واقية، وواقي شمس.',
                'meeting_point_en' => 'Mangroovy Kite Club, North Beach.',
                'meeting_point_ar' => 'نادي مانجروفي كايت، الشاطئ الشمالي.',
                'is_featured' => true,
                'is_published' => true,
                'status' => 'published',
            ],
        ];

        foreach ($experiences as $exp) {
            Experience::updateOrCreate(['slug' => $exp['slug']], $exp);
        }
    }
}
