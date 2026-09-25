<?php

namespace Database\Seeders;

use App\Models\PropertyCategory;
use Illuminate\Database\Seeder;

class PropertyCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name_en' => 'Luxury Villas',
                'name_ar' => 'فلل فاخرة',
                'slug' => 'luxury-villas',
                'description_en' => 'Standalone private waterfront villas featuring private swimming pools, gardens, and lagoon docks.',
                'description_ar' => 'فلل مستقلة على ضفاف البحيرات بحمامات سباحة خاصة وحدائق وإطلالات استثنائية.',
                'icon' => 'home',
                'sort_order' => 1,
            ],
            [
                'name_en' => 'Waterfront Chalets',
                'name_ar' => 'شاليهات على البحيرات',
                'slug' => 'waterfront-chalets',
                'description_en' => 'Ground floor and duplex chalets with direct open lagoon access and sandy beach areas.',
                'description_ar' => 'شاليهات أرضية ودوبلكس مع إمكانية الوصول المباشر للبحيرات والشواطئ الرملية.',
                'icon' => 'umbrella',
                'sort_order' => 2,
            ],
            [
                'name_en' => 'Marina Apartments & Penthouses',
                'name_ar' => 'شقق وبنتهاوس المارينا',
                'slug' => 'marina-apartments',
                'description_en' => 'Stylish 1, 2, and 3-bedroom modern residences steps away from Abu Tig Marina restaurants.',
                'description_ar' => 'شقق وبنتهاوس عصرية بغرفة وغرفتين وثلاث غرف على بعد خطوات من مارينا أبو تيج.',
                'icon' => 'building',
                'sort_order' => 3,
            ],
            [
                'name_en' => 'Townhouses & Houses',
                'name_ar' => 'تاون هاوس ومنازل عائلية',
                'slug' => 'townhouses',
                'description_en' => 'Multi-level cozy coastal residences suitable for families and longer tranquil retreats.',
                'description_ar' => 'منازل شاطئية أنيقة متعددة الطوابق مثالية للعائلات والإقامات المريحة في الجونة.',
                'icon' => 'layout-grid',
                'sort_order' => 4,
            ],
        ];

        foreach ($categories as $cat) {
            PropertyCategory::updateOrCreate(['slug' => $cat['slug']], $cat);
        }
    }
}
