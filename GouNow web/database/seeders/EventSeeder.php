<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\EventTicketType;
use App\Models\Location;
use Illuminate\Database\Seeder;

class EventSeeder extends Seeder
{
    public function run(): void
    {
        $marina = Location::where('slug', 'abu-tig-marina')->first();
        $mangroovy = Location::where('slug', 'mangroovy-kite-beach')->first();

        // Event 1: Sunset Sessions Beach Party
        $event1 = Event::updateOrCreate(
            ['slug' => 'gounow-sunset-sessions-mangroovy-beach'],
            [
                'location_id' => $mangroovy?->id,
                'title_en' => 'Gounow Sunset Sessions @ Mangroovy Beach Club',
                'title_ar' => 'حفل الغروب الشاطئي الساحر في نادي مانجروفي',
                'short_description_en' => 'An ethereal open-air seaside gathering featuring international deep house DJs, artisan cocktail bars, and sunset bonfire.',
                'short_description_ar' => 'سهرة شاطئية مميزة عند الغروب مع نخبة من منسقي الموسيقى العالميين وأجواء راقية.',
                'description_en' => 'Join the Gounow community as golden hour transforms into an electric seaside evening. Set against the turquoise waters of Mangroovy Beach, expect curated deep melodic rhythms, immersive boho beach aesthetics, and refreshing signature mixology.',
                'description_ar' => 'انضم إلى تجربة استثنائية على شاطئ مانجروفي الساحر. موسيقى راقية وأجواء بوهيمية مفعمة بالحيوية تمتد حتى ساعات الليل الأولى.',
                'organizer' => 'Gounow Experiences & Entertainment',
                'event_date' => now()->addDays(14)->toDateString(),
                'start_time' => '17:00:00',
                'end_time' => '02:00:00',
                'venue_name' => 'Mangroovy Beach Club & Lounge',
                'venue_address' => 'North Beach, Mangroovy, El Gouna',
                'category' => 'nightlife',
                'is_ticketed' => true,
                'is_featured' => true,
                'is_published' => true,
                'status' => 'published',
            ]
        );

        EventTicketType::updateOrCreate(
            ['event_id' => $event1->id, 'name_en' => 'General Admission'],
            [
                'name_ar' => 'تذكرة الدخول العامة',
                'description_en' => 'Access to main beach dance floor and beach cocktail bars.',
                'description_ar' => 'دخول لمنطقة الشاطئ الرئيسية ومنافذ المشروبات.',
                'price_cents' => 80000, // 800 EGP
                'currency' => 'EGP',
                'capacity' => 350,
                'sold_count' => 85,
                'sales_start_at' => now()->subDays(5),
                'sales_end_at' => now()->addDays(14),
                'max_per_order' => 6,
                'is_active' => true,
                'sort_order' => 1,
            ]
        );

        EventTicketType::updateOrCreate(
            ['event_id' => $event1->id, 'name_en' => 'VIP Backstage & Lounge'],
            [
                'name_ar' => 'تذكرة كبار الزوار VIP',
                'description_en' => 'Fast-track priority entry, elevated VIP lounge access, and private bar service.',
                'description_ar' => 'دخول سريع بأولوية، الدخول لمنطقة كبار الزوار الخاصة وخدمة ضيافة حصرية.',
                'price_cents' => 180000, // 1,800 EGP
                'currency' => 'EGP',
                'capacity' => 100,
                'sold_count' => 34,
                'sales_start_at' => now()->subDays(5),
                'sales_end_at' => now()->addDays(14),
                'max_per_order' => 4,
                'is_active' => true,
                'sort_order' => 2,
            ]
        );

        EventTicketType::updateOrCreate(
            ['event_id' => $event1->id, 'name_en' => 'VIP Waterfront Cabana (Up to 8 Guests)'],
            [
                'name_ar' => 'كابانا VIP خاصة (حتى 8 أفراد)',
                'description_en' => 'Dedicated waterfront private cabana, dedicated butler, fruit platters, and 2 premium bottles included.',
                'description_ar' => 'كابانا شاطئية خاصة مع مضيف مخصص وطبق فواكه ومشروبات فاخرة متضمنة.',
                'price_cents' => 1200000, // 12,000 EGP
                'currency' => 'EGP',
                'capacity' => 12,
                'sold_count' => 4,
                'sales_start_at' => now()->subDays(5),
                'sales_end_at' => now()->addDays(14),
                'max_per_order' => 1,
                'is_active' => true,
                'sort_order' => 3,
            ]
        );

        // Event 2: Abu Tig Marina Yacht Gala
        $event2 = Event::updateOrCreate(
            ['slug' => 'abu-tig-marina-moonlight-gala'],
            [
                'location_id' => $marina?->id,
                'title_en' => 'Abu Tig Marina Moonlight Yacht & Jazz Gala',
                'title_ar' => 'أمسية الجاز واليخوت تحت ضوء القمر بمارينا أبو تيج',
                'short_description_en' => 'An elegant open-air jazz concert along the marina waterfront with gourmet canapés and vintage champagne.',
                'short_description_ar' => 'حفل جاز ساحر على ضفاف المارينا مع بوفيه مقبلات راقٍ ومشروبات منعشة.',
                'description_en' => 'Immerse yourself in a refined El Gouna soiree. Set directly on the marina deck overlooking illuminated super-yachts, enjoy a live 7-piece international jazz ensemble followed by acoustic lounge sets.',
                'description_ar' => 'استمتع بأمسية ساحرة وسط يخوت المارينا المضيئة وموسيقى الجاز الحية في الهواء الطلق مع أشهى المأكولات الفاخرة.',
                'organizer' => 'Gounow Culture & Music',
                'event_date' => now()->addDays(28)->toDateString(),
                'start_time' => '20:00:00',
                'end_time' => '01:00:00',
                'venue_name' => 'Abu Tig Marina Promenade Deck',
                'venue_address' => 'Marina Promenade, El Gouna',
                'category' => 'concert',
                'is_ticketed' => true,
                'is_featured' => true,
                'is_published' => true,
                'status' => 'published',
            ]
        );

        EventTicketType::updateOrCreate(
            ['event_id' => $event2->id, 'name_en' => 'Gala Entry & Cocktail Pass'],
            [
                'name_ar' => 'تذكرة الحفل وكوكتيل الاستقبال',
                'description_en' => 'Admission, welcoming champagne flute, and open gourmet canapés.',
                'description_ar' => 'دخول الحفل، مشروب ترحيبي، وبوفيه مقبلات مفتوح طوال الأمسية.',
                'price_cents' => 150000, // 1,500 EGP
                'currency' => 'EGP',
                'capacity' => 150,
                'sold_count' => 20,
                'sales_start_at' => now()->subDays(2),
                'sales_end_at' => now()->addDays(28),
                'max_per_order' => 4,
                'is_active' => true,
                'sort_order' => 1,
            ]
        );
    }
}
