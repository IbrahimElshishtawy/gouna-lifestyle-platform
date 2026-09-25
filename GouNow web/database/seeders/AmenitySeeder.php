<?php

namespace Database\Seeders;

use App\Models\Amenity;
use Illuminate\Database\Seeder;

class AmenitySeeder extends Seeder
{
    public function run(): void
    {
        $amenities = [
            ['name_en' => 'Private Pool', 'name_ar' => 'حمام سباحة خاص', 'icon' => 'pool', 'group' => 'outdoor', 'sort_order' => 1],
            ['name_en' => 'Lagoon Access & View', 'name_ar' => 'إطلالة ومخرج مباشر للبحيرة', 'icon' => 'waves', 'group' => 'outdoor', 'sort_order' => 2],
            ['name_en' => 'High-Speed Wi-Fi', 'name_ar' => 'إنترنت عالي السرعة', 'icon' => 'wifi', 'group' => 'general', 'sort_order' => 3],
            ['name_en' => 'Air Conditioning', 'name_ar' => 'تكييف هواء مركزي', 'icon' => 'wind', 'group' => 'general', 'sort_order' => 4],
            ['name_en' => 'Fully Equipped Kitchen', 'name_ar' => 'مطبخ متكامل التجهيز', 'icon' => 'utensils', 'group' => 'kitchen', 'sort_order' => 5],
            ['name_en' => 'Sea View', 'name_ar' => 'إطلالة مباشرة على البحر', 'icon' => 'eye', 'group' => 'outdoor', 'sort_order' => 6],
            ['name_en' => 'Private Terrace / Garden', 'name_ar' => 'تراس أو حديقة خاصة', 'icon' => 'sun', 'group' => 'outdoor', 'sort_order' => 7],
            ['name_en' => 'BBQ Station', 'name_ar' => 'منطقة شواء خارجية', 'icon' => 'flame', 'group' => 'outdoor', 'sort_order' => 8],
            ['name_en' => 'Smart 4K TV & Streaming', 'name_ar' => 'تلفزيون ذكي وخدمات البث', 'icon' => 'tv', 'group' => 'general', 'sort_order' => 9],
            ['name_en' => 'Washer & Dryer', 'name_ar' => 'غسالة ومجفف ملابس', 'icon' => 'disc', 'group' => 'general', 'sort_order' => 10],
            ['name_en' => 'Dedicated Free Parking', 'name_ar' => 'موقف سيارات مجاني خاص', 'icon' => 'car', 'group' => 'general', 'sort_order' => 11],
            ['name_en' => 'Daily Housekeeping Available', 'name_ar' => 'خدمة تنظيف يومية متاحة', 'icon' => 'sparkles', 'group' => 'services', 'sort_order' => 12],
            ['name_en' => 'Pet Friendly', 'name_ar' => 'يسمح باصطحاب الحيوانات الأليفة', 'icon' => 'paw', 'group' => 'policies', 'sort_order' => 13],
            ['name_en' => '24/7 Gated Security', 'name_ar' => 'أمن وحراسة على مدار الساعة', 'icon' => 'shield-check', 'group' => 'safety', 'sort_order' => 14],
        ];

        foreach ($amenities as $amenity) {
            Amenity::updateOrCreate(['name_en' => $amenity['name_en']], $amenity);
        }
    }
}
