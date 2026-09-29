<?php

namespace Database\Seeders;

use App\Models\Location;
use Illuminate\Database\Seeder;

class LocationSeeder extends Seeder
{
    public function run(): void
    {
        $locations = [
            [
                'name_en' => 'Abu Tig Marina',
                'name_ar' => 'مارينا أبو تيج',
                'slug' => 'abu-tig-marina',
                'description_en' => 'The vibrant super-yacht marina, dining hub, and nightlife heart of El Gouna.',
                'description_ar' => 'مارينا اليخوت الفاخرة، ومطاعم وسهرات الجونة الأكثر حيوية وتألقاً.',
                'city' => 'El Gouna',
                'country' => 'Egypt',
                'latitude' => 27.4042,
                'longitude' => 33.6765,
                'sort_order' => 1,
            ],
            [
                'name_en' => 'Kafr El Gouna / Downtown',
                'name_ar' => 'كفر الجونة / وسط البلد',
                'slug' => 'kafr-el-gouna-downtown',
                'description_en' => 'Traditional Nubian architectural center with shops, cafes, and open-air bazaars.',
                'description_ar' => 'القلب التراثي بطابع نوبي ساحر يضم المقاهي والمتاجر والأسواق المفتوحة.',
                'city' => 'El Gouna',
                'country' => 'Egypt',
                'latitude' => 27.3941,
                'longitude' => 33.6782,
                'sort_order' => 2,
            ],
            [
                'name_en' => 'Fanadir Bay',
                'name_ar' => 'خليج فنادير',
                'slug' => 'fanadir-bay',
                'description_en' => 'Ultra-exclusive residential enclave offering pristine lagoons and expansive private luxury villas.',
                'description_ar' => 'أرقى المجمعات السكنية الخاصة مع بحيرات فيروزية وفلل فاخرة استثنائية.',
                'city' => 'El Gouna',
                'country' => 'Egypt',
                'latitude' => 27.4150,
                'longitude' => 33.6650,
                'sort_order' => 3,
            ],
            [
                'name_en' => 'Mangroovy & Kite Beach',
                'name_ar' => 'مانجروفي وشاطئ الكايت',
                'slug' => 'mangroovy-kite-beach',
                'description_en' => 'Direct open sea beaches, beach clubs, and world-class kitesurfing paradise.',
                'description_ar' => 'شواطئ البحر المفتوح ونوادي الشاطئ الراقية ومركز التزلج الشراعي العالمي.',
                'city' => 'El Gouna',
                'country' => 'Egypt',
                'latitude' => 27.4200,
                'longitude' => 33.6710,
                'sort_order' => 4,
            ],
            [
                'name_en' => 'West Golf',
                'name_ar' => 'وست جولف',
                'slug' => 'west-golf',
                'description_en' => 'Lush golf course greens surrounding tranquil private lagoons and Mediterranean architecture.',
                'description_ar' => 'مساحات خضراء تحيط بملاعب الجولف والبحيرات الهادئة بطراز معماري متوسطي.',
                'city' => 'El Gouna',
                'country' => 'Egypt',
                'latitude' => 27.3820,
                'longitude' => 33.6650,
                'sort_order' => 5,
            ],
            [
                'name_en' => 'Tawila Island & Lagoons',
                'name_ar' => 'طويلة والبحيرات الهادئة',
                'slug' => 'tawila-island-lagoons',
                'description_en' => 'Contemporary minimalist waterfront living with endless turquoise lagoon vistas.',
                'description_ar' => 'أسلوب حياة عصري على ضفاف البحيرات الفيروزية الساحرة وتصميم حديث متميز.',
                'city' => 'El Gouna',
                'country' => 'Egypt',
                'latitude' => 27.3890,
                'longitude' => 33.6590,
                'sort_order' => 6,
            ],
        ];

        foreach ($locations as $loc) {
            Location::updateOrCreate(['slug' => $loc['slug']], $loc);
        }
    }
}
