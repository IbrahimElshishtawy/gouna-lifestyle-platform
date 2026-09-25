<?php

namespace Database\Seeders;

use App\Models\Property;
use App\Models\SeasonalPrice;
use Illuminate\Database\Seeder;

class SeasonalPriceSeeder extends Seeder
{
    public function run(): void
    {
        $properties = Property::all();

        foreach ($properties as $property) {
            if ($property->listing_type === 'sale') {
                continue;
            }

            $currentYear = (int) now()->format('Y');
            $nextYear = $currentYear + 1;

            // 1. Winter Season (Broadest, lowest priority)
            SeasonalPrice::create([
                'property_id' => $property->id,
                'name_en' => 'Winter High Season',
                'name_ar' => 'موسم الشتاء',
                'start_date' => "{$currentYear}-11-01",
                'end_date' => "{$nextYear}-03-31",
                'price_cents' => (int) ($property->base_price_cents * 1.35),
                'priority' => 1,
                'min_stay_nights' => 3,
                'is_active' => true,
                'notes' => 'General sunny winter season in El Gouna.',
            ]);

            // 2. December Holiday Season (Medium priority)
            SeasonalPrice::create([
                'property_id' => $property->id,
                'name_en' => 'December Holiday Season',
                'name_ar' => 'موسم شهر ديسمبر',
                'start_date' => "{$currentYear}-12-01",
                'end_date' => "{$nextYear}-01-31",
                'price_cents' => (int) ($property->base_price_cents * 1.65),
                'priority' => 2,
                'min_stay_nights' => 4,
                'is_active' => true,
                'notes' => 'December festivities and European winter escape.',
            ]);

            // 3. Christmas & New Year Peak Season (Highest priority)
            SeasonalPrice::create([
                'property_id' => $property->id,
                'name_en' => 'Christmas & New Year Peak',
                'name_ar' => 'ذروة أعياد رأس السنة والميلاد',
                'start_date' => "{$currentYear}-12-20",
                'end_date' => "{$nextYear}-01-15",
                'price_cents' => (int) ($property->base_price_cents * 2.20),
                'priority' => 3,
                'min_stay_nights' => 5, // minimum 5 nights during Christmas/NYE
                'is_active' => true,
                'notes' => 'Peak holiday period with strict 5-night minimum stay.',
            ]);

            // 4. Easter & Spring Break Season
            SeasonalPrice::create([
                'property_id' => $property->id,
                'name_en' => 'Easter & Sham El-Nessim Break',
                'name_ar' => 'عطلة الربيع وعيد الفصح',
                'start_date' => "{$nextYear}-04-10",
                'end_date' => "{$nextYear}-04-28",
                'price_cents' => (int) ($property->base_price_cents * 1.50),
                'priority' => 2,
                'min_stay_nights' => 3,
                'is_active' => true,
                'notes' => 'Spring holidays and beach events.',
            ]);
        }
    }
}
