<?php

namespace Database\Seeders;

use App\Models\Discount;
use App\Models\Fee;
use Illuminate\Database\Seeder;

class FeeAndDiscountSeeder extends Seeder
{
    public function run(): void
    {
        // Global Fee Configurations
        $fees = [
            [
                'name_en' => 'Standard Cleaning Fee',
                'name_ar' => 'رسوم النظافة والتعقيم',
                'code' => 'cleaning',
                'type' => 'fixed',
                'value' => 1500.00, // 1,500 EGP
                'currency' => 'EGP',
                'applies_globally' => true,
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name_en' => 'Concierge & Service Fee',
                'name_ar' => 'رسوم الخدمة والكونسيرج',
                'code' => 'service',
                'type' => 'fixed',
                'value' => 1200.00, // 1,200 EGP
                'currency' => 'EGP',
                'applies_globally' => true,
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'name_en' => 'Value Added Tax (VAT)',
                'name_ar' => 'ضريبة القيمة المضافة',
                'code' => 'tax',
                'type' => 'percentage',
                'value' => 14.00, // 14%
                'currency' => 'EGP',
                'applies_globally' => true,
                'is_active' => true,
                'sort_order' => 3,
            ],
        ];

        foreach ($fees as $fee) {
            Fee::updateOrCreate(['code' => $fee['code']], $fee);
        }

        // Promotional Discount Codes
        $discounts = [
            [
                'name_en' => 'Welcome to Gounow Promo (10% Off)',
                'name_ar' => 'عرض الترحيب بضيوف الجونة (خصم 10%)',
                'code' => 'GOUNOW10',
                'type' => 'percentage',
                'value' => 10.00,
                'applies_to_all' => true,
                'min_stay_nights' => 3,
                'min_booking_amount_cents' => 1500000, // 15,000 EGP minimum
                'max_uses' => 500,
                'used_count' => 12,
                'valid_from' => now()->subMonth()->toDateString(),
                'valid_until' => now()->addMonths(12)->toDateString(),
                'is_active' => true,
            ],
            [
                'name_en' => 'Early Bird Direct Booking (5,000 EGP Off)',
                'name_ar' => 'خصم الحجز المبكر المباشر (5,000 جنيه)',
                'code' => 'EARLYBIRD',
                'type' => 'fixed',
                'value' => 5000.00,
                'currency' => 'EGP',
                'applies_to_all' => true,
                'min_stay_nights' => 5,
                'min_booking_amount_cents' => 4000000, // 40,000 EGP
                'max_uses' => 100,
                'used_count' => 5,
                'valid_from' => now()->subMonth()->toDateString(),
                'valid_until' => now()->addMonths(6)->toDateString(),
                'is_active' => true,
            ],
        ];

        foreach ($discounts as $d) {
            Discount::updateOrCreate(['code' => $d['code']], $d);
        }
    }
}
