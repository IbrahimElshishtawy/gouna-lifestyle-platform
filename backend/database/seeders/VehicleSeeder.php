<?php

namespace Database\Seeders;

use App\Models\Vehicle;
use Illuminate\Database\Seeder;

class VehicleSeeder extends Seeder
{
    public function run(): void
    {
        $vehicles = [
            [
                'slug' => 'club-car-onward-luxury-golf-cart-4-seat',
                'name_en' => 'Club Car Onward 4-Seater Electric Golf Cart',
                'name_ar' => 'سيارة جولف كار كهربائية 4 ركاب كلوب كار',
                'brand' => 'Club Car',
                'model' => 'Onward Lifted',
                'year' => 2025,
                'transmission' => 'automatic',
                'fuel_type' => 'electric',
                'seats' => 4,
                'daily_price_cents' => 250000, // 2,500 EGP per day
                'weekly_price_cents' => 1400000, // 14,000 EGP per week
                'monthly_price_cents' => 4500000, // 45,000 EGP per month
                'deposit_cents' => 500000, // 5,000 EGP refundable deposit
                'currency' => 'EGP',
                'delivery_available' => true,
                'pickup_location' => 'Delivered to any El Gouna Villa or Marina',
                'dropoff_location' => 'Any El Gouna Villa or Marina',
                'insurance_info_en' => 'Full comprehensive coverage included with zero deductible.',
                'insurance_info_ar' => 'تأمين شامل متكامل وبدون أي نسبة تحمل.',
                'features_en' => 'Lithium-ion long range battery, premium sound system with Bluetooth, USB charging ports, LED headlights.',
                'features_ar' => 'بطارية ليثيوم طويلة المدى، نظام صوت بلوتوث، منافذ شحن USB، وإضاءة LED أمامية.',
                'is_available' => true,
                'is_published' => true,
                'status' => 'published',
            ],
            [
                'slug' => 'range-rover-sport-dynamic-suv',
                'name_en' => 'Range Rover Sport Dynamic HSE',
                'name_ar' => 'رينج روفر سبورت ديناميك دفع رباعي',
                'brand' => 'Land Rover',
                'model' => 'Range Rover Sport',
                'year' => 2024,
                'transmission' => 'automatic',
                'fuel_type' => 'petrol',
                'seats' => 5,
                'daily_price_cents' => 1200000, // 12,000 EGP per day
                'weekly_price_cents' => 7000000, // 70,000 EGP per week
                'monthly_price_cents' => 22000000, // 220,000 EGP per month
                'deposit_cents' => 2000000, // 20,000 EGP
                'currency' => 'EGP',
                'delivery_available' => true,
                'pickup_location' => 'Hurghada Airport (HRG) or El Gouna Private Delivery',
                'dropoff_location' => 'Hurghada Airport (HRG) or El Gouna',
                'insurance_info_en' => 'Comprehensive luxury coverage with 24/7 Red Sea roadside assistance.',
                'insurance_info_ar' => 'تأمين شامل للمركبات الفاخرة مع خدمة المساعدة على الطريق على مدار 24 ساعة.',
                'features_en' => 'Panoramic glass roof, Meridian surround sound, air suspension, cooled leather massage seats.',
                'features_ar' => 'سقف بانورامي، نظام صوت ميريديان، نظام تعليق هوائي متطور، ومقاعد جلدية مبردة ومساج.',
                'is_available' => true,
                'is_published' => true,
                'status' => 'published',
            ],
            [
                'slug' => 'mini-cooper-s-convertible-cabriolet',
                'name_en' => 'MINI Cooper S Convertible (Cabriolet)',
                'name_ar' => 'ميني كوبر إس كابريوليه مكشوفة',
                'brand' => 'MINI',
                'model' => 'Cooper S Cabrio',
                'year' => 2024,
                'transmission' => 'automatic',
                'fuel_type' => 'petrol',
                'seats' => 4,
                'daily_price_cents' => 550000, // 5,500 EGP per day
                'weekly_price_cents' => 3200000, // 32,000 EGP
                'deposit_cents' => 1000000, // 10,000 EGP
                'currency' => 'EGP',
                'delivery_available' => true,
                'pickup_location' => 'El Gouna Abu Tig Marina',
                'dropoff_location' => 'El Gouna Abu Tig Marina',
                'insurance_info_en' => 'Standard CDW insurance included.',
                'insurance_info_ar' => 'تأمين ضد الحوادث والسرقة متضمن.',
                'features_en' => 'Electric soft top, Harman Kardon sound, sport driving mode, wireless Apple CarPlay.',
                'features_ar' => 'سقف كهربائي قابل للفتح، نظام صوت هارمان كاردون، ودعم نظام أبل كاربلاي لاسلكياً.',
                'is_available' => true,
                'is_published' => true,
                'status' => 'published',
            ],
        ];

        foreach ($vehicles as $v) {
            Vehicle::updateOrCreate(['slug' => $v['slug']], $v);
        }
    }
}
