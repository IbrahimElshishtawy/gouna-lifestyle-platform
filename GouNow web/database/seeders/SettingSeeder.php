<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            // General
            ['group' => 'general', 'key' => 'site_name', 'value' => 'GOUNOW', 'type' => 'string'],
            ['group' => 'general', 'key' => 'site_tagline', 'value' => 'Stay. Experience. Live El Gouna.', 'type' => 'string'],
            ['group' => 'general', 'key' => 'company_name', 'value' => 'Gounow Lifestyle & Properties', 'type' => 'string'],
            ['group' => 'general', 'key' => 'primary_location', 'value' => 'El Gouna, Red Sea, Egypt', 'type' => 'string'],
            ['group' => 'general', 'key' => 'primary_currency', 'value' => 'EGP', 'type' => 'string'],
            ['group' => 'general', 'key' => 'supported_currencies', 'value' => json_encode(['EGP', 'EUR', 'USD', 'GBP']), 'type' => 'json'],
            ['group' => 'general', 'key' => 'primary_timezone', 'value' => 'Africa/Cairo', 'type' => 'string'],
            ['group' => 'general', 'key' => 'default_locale', 'value' => 'en', 'type' => 'string'],
            ['group' => 'general', 'key' => 'supported_locales', 'value' => json_encode(['en', 'ar']), 'type' => 'json'],

            // Contact
            ['group' => 'contact', 'key' => 'phone', 'value' => '+20 123 456 7890', 'type' => 'string'],
            ['group' => 'contact', 'key' => 'whatsapp_number', 'value' => '+201234567890', 'type' => 'string'],
            ['group' => 'contact', 'key' => 'email', 'value' => 'hello@gounow.com', 'type' => 'string'],
            ['group' => 'contact', 'key' => 'address', 'value' => 'Abu Tig Marina, El Gouna, Red Sea, Egypt', 'type' => 'string'],
            ['group' => 'contact', 'key' => 'google_maps_url', 'value' => 'https://maps.google.com/?q=El+Gouna+Egypt', 'type' => 'string'],

            // Social Media
            ['group' => 'social', 'key' => 'instagram_url', 'value' => 'https://instagram.com/gounow.eg', 'type' => 'string'],
            ['group' => 'social', 'key' => 'facebook_url', 'value' => 'https://facebook.com/gounow.eg', 'type' => 'string'],
            ['group' => 'social', 'key' => 'tiktok_url', 'value' => 'https://tiktok.com/@gounow.eg', 'type' => 'string'],
            ['group' => 'social', 'key' => 'linkedin_url', 'value' => 'https://linkedin.com/company/gounow', 'type' => 'string'],

            // Booking policies
            ['group' => 'booking', 'key' => 'default_checkin_time', 'value' => '15:00', 'type' => 'string'],
            ['group' => 'booking', 'key' => 'default_checkout_time', 'value' => '11:00', 'type' => 'string'],
            ['group' => 'booking', 'key' => 'default_min_stay_nights', 'value' => '2', 'type' => 'integer'],
            ['group' => 'booking', 'key' => 'default_deposit_percentage', 'value' => '30', 'type' => 'integer'],
            ['group' => 'booking', 'key' => 'booking_reference_prefix', 'value' => 'GON', 'type' => 'string'],

            // Analytics & Tracking
            ['group' => 'analytics', 'key' => 'gtm_id', 'value' => '', 'type' => 'string'],
            ['group' => 'analytics', 'key' => 'ga4_id', 'value' => '', 'type' => 'string'],
            ['group' => 'analytics', 'key' => 'google_ads_id', 'value' => '', 'type' => 'string'],
            ['group' => 'analytics', 'key' => 'meta_pixel_id', 'value' => '', 'type' => 'string'],
            ['group' => 'analytics', 'key' => 'enable_tracking', 'value' => '0', 'type' => 'boolean'],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(
                ['group' => $setting['group'], 'key' => $setting['key']],
                ['value' => $setting['value'], 'type' => $setting['type']]
            );
        }
    }
}
