<?php

namespace Database\Seeders;

use App\Models\Faq;
use App\Models\HomepageSection;
use App\Models\NavigationItem;
use App\Models\Page;
use Illuminate\Database\Seeder;

class CmsSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Homepage Sections
        $sections = [
            [
                'section_key' => 'hero',
                'title_en' => 'Stay. Experience. Live El Gouna.',
                'title_ar' => 'أقم. عش التجربة. استمتع بسحر الجونة.',
                'subtitle_en' => 'Curated luxury waterfront villas, private yacht charters, and unforgettable coastal moments.',
                'subtitle_ar' => 'مجموعة مختارة من أرقى فلل الجونة على البحيرات، رحلات اليخوت الخاصة، ولحظات لا تُنسى.',
                'cta_text_en' => 'Explore Stays',
                'cta_text_ar' => 'استكشف الإقامات',
                'cta_url' => '/stays',
                'background_image' => '/assets/images/hero-gouna.jpg',
                'is_visible' => true,
                'sort_order' => 1,
            ],
            [
                'section_key' => 'intro',
                'title_en' => 'Welcome to Gounow',
                'title_ar' => 'مرحباً بكم في جونو',
                'subtitle_en' => 'A New Lifestyle & Hospitality Vision in El Gouna',
                'subtitle_ar' => 'رؤية جديدة لأسلوب الحياة والضيافة الراقية في الجونة',
                'content_en' => 'Gounow connects discerning travelers and homeowners with the genuine soul of El Gouna. From private architectural retreats on turquoise lagoons to sunset desert expeditions and marina nightlife, we curate your complete coastal journey.',
                'content_ar' => 'جونو تقدم تجربة متكاملة تجمع بين أرقى بيوت العطلات على البحيرات الفيروزية، ورحلات اليخوت الخاصة، والمغامرات الصحراوية، وأمسيات المارينا الساحرة.',
                'is_visible' => true,
                'sort_order' => 2,
            ],
            [
                'section_key' => 'featured_stays',
                'title_en' => 'Signature Stays',
                'title_ar' => 'إقامات مميزة ومختارة',
                'subtitle_en' => 'Architectural villas and penthouses handpicked for tranquility and beauty.',
                'subtitle_ar' => 'فلل وبنتهاوس مصممة بأعلى معايير الفخامة والخصوصية على ضفاف مياه الجونة.',
                'cta_text_en' => 'View All Properties',
                'cta_text_ar' => 'عرض جميع العقارات',
                'cta_url' => '/stays',
                'is_visible' => true,
                'sort_order' => 3,
            ],
            [
                'section_key' => 'experiences',
                'title_en' => 'Bespoke Experiences',
                'title_ar' => 'تجارب ومغامرات حصرية',
                'subtitle_en' => 'Venture into the pristine Red Sea and golden Eastern Desert dunes.',
                'subtitle_ar' => 'انطلق في مغامرات بحرية نقية وسط جزر البحر الأحمر ورمال الصحراء الذهبية.',
                'cta_text_en' => 'Discover Experiences',
                'cta_text_ar' => 'اكتشف المغامرات',
                'cta_url' => '/experiences',
                'is_visible' => true,
                'sort_order' => 4,
            ],
            [
                'section_key' => 'properties_for_sale',
                'title_en' => 'Buy & Sell in El Gouna',
                'title_ar' => 'بيع وشراء العقارات في الجونة',
                'subtitle_en' => 'Prime investment residences, lagoon villas, and off-plan coastal developments.',
                'subtitle_ar' => 'عقارات استثمارية مميزة، فلل بحرية، وفرص تملك استثنائية في قلب الجونة.',
                'cta_text_en' => 'Explore Properties for Sale',
                'cta_text_ar' => 'استكشف عقارات للبيع',
                'cta_url' => '/buy-sell',
                'is_visible' => true,
                'sort_order' => 5,
            ],
            [
                'section_key' => 'whats_on',
                'title_en' => "What's On in El Gouna",
                'title_ar' => 'فعاليات وأمسيات الجونة',
                'subtitle_en' => 'Live music events, beach club sunsets, and curated nightlife.',
                'subtitle_ar' => 'حفلات موسيقية حية، فعاليات شاطئية عند الغروب، وأرقى سهرات المارينا.',
                'cta_text_en' => 'Explore Events',
                'cta_text_ar' => 'استكشف الفعاليات',
                'cta_url' => '/events',
                'is_visible' => true,
                'sort_order' => 6,
            ],
            [
                'section_key' => 'lifestyle',
                'title_en' => 'The Gouna Lifestyle',
                'title_ar' => 'أسلوب حياة الجونة',
                'subtitle_en' => 'Sun-drenched days, lagoon breezes, and a warm boho-chic coastal community.',
                'subtitle_ar' => 'أيام مشمسة، نسيم البحيرات العليل، ومجتمع ساحلي راقٍ ينبض بالحياة والهدوء.',
                'is_visible' => true,
                'sort_order' => 7,
            ],
            [
                'section_key' => 'cta',
                'title_en' => 'Ready to Experience El Gouna?',
                'title_ar' => 'هل أنت مستعد لتجربة لا تُنسى في الجونة؟',
                'subtitle_en' => 'Connect directly with our local concierge team or book your retreat online.',
                'subtitle_ar' => 'تواصل مباشرة مع فريق الكونسيرج المحلي أو احجز إقامتك ومغامرتك عبر الإنترنت الآن.',
                'cta_text_en' => 'Contact Our Concierge',
                'cta_text_ar' => 'تواصل مع الكونسيرج',
                'cta_url' => '/contact',
                'is_visible' => true,
                'sort_order' => 8,
            ],
        ];

        foreach ($sections as $s) {
            HomepageSection::updateOrCreate(['section_key' => $s['section_key']], $s);
        }

        // 2. Navigation Items (Main Header & Footer)
        $mainNav = [
            ['label_en' => 'Stay', 'label_ar' => 'الإقامة', 'url' => '/stays', 'route_name' => 'stays.index', 'sort_order' => 1],
            ['label_en' => 'Buy & Sell', 'label_ar' => 'بيع وشراء', 'url' => '/buy-sell', 'route_name' => 'buy-sell.index', 'sort_order' => 2],
            ['label_en' => 'Experiences', 'label_ar' => 'التجارب', 'url' => '/experiences', 'route_name' => 'experiences.index', 'sort_order' => 3],
            ['label_en' => "What's On", 'label_ar' => 'الفعاليات', 'url' => '/events', 'route_name' => 'events.index', 'sort_order' => 4],
            ['label_en' => 'About', 'label_ar' => 'عن جونو', 'url' => '/about', 'route_name' => 'about', 'sort_order' => 5],
            ['label_en' => 'Contact', 'label_ar' => 'اتصل بنا', 'url' => '/contact', 'route_name' => 'contact', 'sort_order' => 6],
        ];

        foreach ($mainNav as $item) {
            NavigationItem::updateOrCreate(
                ['menu_location' => 'main', 'label_en' => $item['label_en']],
                array_merge($item, ['menu_location' => 'main', 'is_visible' => true])
            );
        }

        $legalNav = [
            ['label_en' => 'Privacy Policy', 'label_ar' => 'سياسة الخصوصية', 'url' => '/page/privacy-policy', 'sort_order' => 1],
            ['label_en' => 'Terms of Service', 'label_ar' => 'الشروط والأحكام', 'url' => '/page/terms-of-service', 'sort_order' => 2],
            ['label_en' => 'Cancellation Policy', 'label_ar' => 'سياسة الإلغاء والاسترداد', 'url' => '/page/cancellation-policy', 'sort_order' => 3],
            ['label_en' => 'Cookie Policy', 'label_ar' => 'سياسة ملفات تعريف الارتباط', 'url' => '/page/cookie-policy', 'sort_order' => 4],
        ];

        foreach ($legalNav as $item) {
            NavigationItem::updateOrCreate(
                ['menu_location' => 'footer_legal', 'label_en' => $item['label_en']],
                array_merge($item, ['menu_location' => 'footer_legal', 'is_visible' => true])
            );
        }

        // 3. Pages
        $pages = [
            [
                'slug' => 'about-gounow',
                'template' => 'about',
                'title_en' => 'About Gounow',
                'title_ar' => 'عن جونو لايف ستايل',
                'content_en' => 'Gounow was born from a deep passion for El Gouna — its sunlit lagoon waters, its distinctive terracotta and sand architecture, and its cosmopolitan coastal soul. We are a specialized boutique platform providing exceptional holiday stays, property sales advisory, private sea and desert expeditions, and vibrant nightlife gatherings.',
                'content_ar' => 'انطلقت جونو من شغف حقيقي بمدينة الجونة الساحرة، وبحيراتها الفيروزية، وطابعها المعماري الفريد ومجتمعها الراقي. نقدم منصة متكاملة تجمع بين أرقى خيارات الإقامة، الاستشارات العقارية، المغامرات البحرية والصحراوية الحصرية، والفعاليات المميزة.',
                'is_published' => true,
                'show_in_nav' => true,
                'sort_order' => 1,
            ],
            [
                'slug' => 'cancellation-policy',
                'template' => 'legal',
                'title_en' => 'Cancellation & Refund Policy',
                'title_ar' => 'سياسة الإلغاء والاسترداد',
                'content_en' => 'Flexible bookings may be cancelled up to 14 days prior to check-in for a full refund minus payment processing fees. Moderate bookings provide a 100% refund up to 7 days before arrival and 50% thereafter. Christmas, New Year, and peak event bookings are strictly non-refundable.',
                'content_ar' => 'يمكن إلغاء الحجوزات المرنة حتى 14 يوماً قبل موعد الوصول لاسترداد كامل المبلغ باستثناء رسوم التحويل الإلكتروني. الحجوزات المتوسطة تتيح استرداد 100% حتى 7 أيام قبل الوصول و50% بعد ذلك. حجوزات أعياد رأس السنة والمواسم الاستثنائية غير قابلة للاسترداد.',
                'is_published' => true,
                'show_in_nav' => false,
                'sort_order' => 2,
            ],
            [
                'slug' => 'privacy-policy',
                'template' => 'legal',
                'title_en' => 'Privacy Policy',
                'title_ar' => 'سياسة الخصوصية وحماية البيانات',
                'content_en' => 'At Gounow, your privacy is paramount. We collect personal contact details solely to facilitate your reservations, process secure payments through accredited financial gateways, and provide tailored concierge assistance. We never sell or share your data with unauthorized third parties.',
                'content_ar' => 'في جونو نلتزم بأعلى معايير حماية البيانات والخصوصية. نقوم بجمع معلومات التواصل فقط لإتمام الحجوزات ومعالجة الدفع الآمن عبر البوابات المصرفية المعتمدة وتوفير خدمات الكونسيرج دون مشاركتها مع أي جهة خارجية غير مخولة.',
                'is_published' => true,
                'show_in_nav' => false,
                'sort_order' => 3,
            ],
        ];

        foreach ($pages as $p) {
            Page::updateOrCreate(['slug' => $p['slug']], $p);
        }

        // 4. Frequently Asked Questions (Bilingual)
        $faqs = [
            [
                'group' => 'stays',
                'question_en' => 'What is the check-in and check-out procedure in El Gouna?',
                'question_ar' => 'ما هي إجراءات تسجيل الوصول والمغادرة في الجونة؟',
                'answer_en' => 'Standard check-in is from 3:00 PM and check-out is by 11:00 AM. Our concierge meets you directly at the property or will provide keyless electronic access codes along with an El Gouna guest gate pass.',
                'answer_ar' => 'يبدأ تسجيل الوصول القياسي من الساعة 3:00 عصراً وتسجيل المغادرة حتى 11:00 صباحاً. يستقبلكم فريق الكونسيرج مباشرة بالفيلا أو يوفر رمز الدخول الإلكتروني وتصريح بوابات الجونة.',
                'sort_order' => 1,
            ],
            [
                'group' => 'payments',
                'question_en' => 'What payment methods do you accept?',
                'question_ar' => 'ما هي وسائل الدفع المتاحة على المنصة؟',
                'answer_en' => 'We accept Visa and Mastercard online, PayPal, Instapay, direct Egyptian bank wire transfers, and cash at our Abu Tig Marina office.',
                'answer_ar' => 'نقبل الدفع ببطاقات فيزا وماستركارد، باي بال، إنستاباي، التحويلات البنكية المباشرة، والدفع نقداً بمقر مكتبنا بمارينا أبو تيج.',
                'sort_order' => 2,
            ],
            [
                'group' => 'stays',
                'question_en' => 'Can we book a golf cart or airport transfer with our villa?',
                'question_ar' => 'هل يمكننا حجز جولف كار أو توصيل من مطار الغردقة مع الفيلا؟',
                'answer_en' => 'Yes! You can reserve Club Car electric golf carts or private airport transfers directly during checkout or by messaging our WhatsApp concierge.',
                'answer_ar' => 'نعم بكل تأكيد! يمكنك إضافة جولف كار كهربائية أو خدمة التوصيل الخاص من وإلى مطار الغردقة أثناء إتمام الحجز أو عبر التواصل معنا عبر الواتساب.',
                'sort_order' => 3,
            ],
            [
                'group' => 'experiences',
                'question_en' => 'What happens if a boat trip is postponed due to weather?',
                'question_ar' => 'ماذا يحدث إذا تأجلت رحلة اليخت بسبب الرياح أو الأحوال الجوية؟',
                'answer_en' => 'Your safety is our top priority. In the rare event of Red Sea coast guard restrictions, we offer free rescheduling to another date or a 100% full refund.',
                'answer_ar' => 'سلامتكم هي أولويتنا القصوى. في حال صدور تعليمات من حرس الحدود بسبب الرياح، يتم تغيير موعد الرحلة مجاناً أو استرداد كامل المبلغ بنسبة 100%.',
                'sort_order' => 4,
            ],
        ];

        foreach ($faqs as $faq) {
            Faq::updateOrCreate(
                ['question_en' => $faq['question_en']],
                array_merge($faq, ['is_published' => true])
            );
        }
    }
}
