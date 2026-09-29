<?php

namespace Database\Seeders;

use App\Models\ExperienceCategory;
use Illuminate\Database\Seeder;

class ExperienceCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name_en' => 'Private Boat Trips & Yachts',
                'name_ar' => 'رحلات اليخوت والمراكب الخاصة',
                'slug' => 'boat-trips',
                'description_en' => 'Private luxury yacht charters, dolphin reef snorkeling, and secluded island escapes in the Red Sea.',
                'description_ar' => 'رحلات يخوت خاصة ومغامرات السنوركلينج وجزر البحر الأحمر البكر ومشاهدة الدلافين.',
                'icon' => 'ship',
                'sort_order' => 1,
            ],
            [
                'name_en' => 'Desert Safaris & Stargazing',
                'name_ar' => 'رحلات السفاري والتخييم الصحراوي',
                'slug' => 'safari',
                'description_en' => 'Sunset quad biking, desert buggy dunes, Bedouin dinners, and astronomy nights.',
                'description_ar' => 'سفاري البيتش باجي وسط الرمال الذهبية وعشاء بدوي أصيل تحت سماء النجوم الساحرة.',
                'icon' => 'compass',
                'sort_order' => 2,
            ],
            [
                'name_en' => 'Watersports & Kitesurfing',
                'name_ar' => 'الرياضات المائية والكايت سيرف',
                'slug' => 'watersports-kitesurfing',
                'description_en' => 'World-renowned kitesurfing coaching, wakeboarding at Sliders Cable Park, and scuba diving.',
                'description_ar' => 'أفضل وجهة للكايت سيرف عالمياً، ورياضة التزلج على الماء والغوص الاستكشافي.',
                'icon' => 'wind',
                'sort_order' => 3,
            ],
            [
                'name_en' => 'Lifestyle & Wellness',
                'name_ar' => 'العافية وأسلوب الحياة الراقي',
                'slug' => 'lifestyle-wellness',
                'description_en' => 'Lagoon paddleboard yoga, private chefs, wine tastings, and bespoke spa experiences.',
                'description_ar' => 'جلسات يوجا على البحيرات، طهاة خاصون، وجلسات استرخاء وعناية متكاملة.',
                'icon' => 'sparkles',
                'sort_order' => 4,
            ],
        ];

        foreach ($categories as $cat) {
            ExperienceCategory::updateOrCreate(['slug' => $cat['slug']], $cat);
        }
    }
}
