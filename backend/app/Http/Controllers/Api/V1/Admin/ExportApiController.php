<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Customer;
use App\Models\Discount;
use App\Models\Event;
use App\Models\Experience;
use App\Models\Lead;
use App\Models\PaymentTransaction;
use App\Models\Property;
use App\Models\SeasonalPrice;
use App\Models\Setting;
use App\Models\User;
use App\Models\Yacht;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportApiController extends Controller
{
    /**
     * Get an overview of all exportable records and summary metrics.
     */
    public function overview()
    {
        return response()->json([
            'status' => 'success',
            'data' => [
                'properties_count' => Property::count(),
                'bookings_count' => Booking::count(),
                'pricing_count' => SeasonalPrice::count() + Discount::count(),
                'yachts_count' => Yacht::count(),
                'experiences_count' => Experience::count(),
                'events_count' => Event::count(),
                'users_count' => User::count(),
                'leads_count' => Lead::count(),
                'finances_count' => PaymentTransaction::count(),
                'customers_count' => Customer::count(),
                'settings_count' => Setting::count(),
                'generated_at' => now()->toIso8601String(),
                'supported_formats' => ['excel', 'word', 'json'],
                'supported_types' => [
                    'all', 'properties', 'bookings', 'pricing', 'yachts',
                    'experiences', 'events', 'users', 'leads', 'finances',
                    'customers', 'settings'
                ],
            ],
        ]);
    }

    /**
     * Export data to Excel-compatible UTF-8 CSV with BOM.
     */
    public function exportExcel(Request $request)
    {
        $type = $request->query('type', 'all');
        $filename = "gounow_export_{$type}_" . now()->format('Y-m-d_His') . ".csv";

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        return new StreamedResponse(function () use ($type) {
            $handle = fopen('php://output', 'w');

            // UTF-8 BOM to guarantee proper Arabic display in Microsoft Excel
            fputs($handle, "\xEF\xBB\xBF");

            switch ($type) {
                case 'properties':
                    $this->streamPropertiesCsv($handle);
                    break;
                case 'bookings':
                    $this->streamBookingsCsv($handle);
                    break;
                case 'pricing':
                    $this->streamPricingCsv($handle);
                    break;
                case 'yachts':
                    $this->streamYachtsCsv($handle);
                    break;
                case 'experiences':
                    $this->streamExperiencesCsv($handle);
                    break;
                case 'events':
                    $this->streamEventsCsv($handle);
                    break;
                case 'users':
                    $this->streamUsersCsv($handle);
                    break;
                case 'leads':
                case 'concierge':
                    $this->streamLeadsCsv($handle);
                    break;
                case 'finances':
                    $this->streamFinancesCsv($handle);
                    break;
                case 'customers':
                    $this->streamCustomersCsv($handle);
                    break;
                case 'settings':
                    $this->streamSettingsCsv($handle);
                    break;
                case 'all':
                default:
                    $this->streamAllCsv($handle);
                    break;
            }

            fclose($handle);
        }, 200, $headers);
    }

    /**
     * Export formatted Word Document (.doc via Word-compliant HTML envelope).
     */
    public function exportWord(Request $request)
    {
        $type = $request->query('type', 'all');
        $filename = "gounow_report_{$type}_" . now()->format('Y-m-d_His') . ".doc";

        $htmlContent = $this->buildWordDocumentHtml($type);

        return response($htmlContent, 200, [
            'Content-Type' => 'application/msword; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Cache-Control' => 'no-cache, no-store, max-age=0, must-revalidate',
            'Pragma' => 'no-cache',
        ]);
    }

    /**
     * Export full JSON raw data dump.
     */
    public function exportJson(Request $request)
    {
        $type = $request->query('type', 'all');
        $filename = "gounow_backup_{$type}_" . now()->format('Y-m-d_His') . ".json";

        $data = [
            'platform' => 'GouNow El Gouna Lifestyle & Properties',
            'exported_at' => now()->toIso8601String(),
            'scope' => $type,
        ];

        if ($type === 'all' || $type === 'properties') {
            $data['properties'] = Property::all();
        }
        if ($type === 'all' || $type === 'bookings') {
            $data['bookings'] = Booking::with('customer')->get();
        }
        if ($type === 'all' || $type === 'pricing') {
            $data['seasonal_prices'] = SeasonalPrice::all();
            $data['discounts'] = Discount::all();
        }
        if ($type === 'all' || $type === 'yachts') {
            $data['yachts'] = Yacht::all();
        }
        if ($type === 'all' || $type === 'experiences') {
            $data['experiences'] = Experience::all();
        }
        if ($type === 'all' || $type === 'events') {
            $data['events'] = Event::all();
        }
        if ($type === 'all' || $type === 'users') {
            $data['users'] = User::select('id', 'name', 'email', 'phone', 'role', 'status', 'created_at')->get();
        }
        if ($type === 'all' || $type === 'leads' || $type === 'concierge') {
            $data['leads'] = Lead::all();
        }
        if ($type === 'all' || $type === 'finances') {
            $data['transactions'] = PaymentTransaction::all();
        }
        if ($type === 'all' || $type === 'customers') {
            $data['customers'] = Customer::all();
        }
        if ($type === 'all' || $type === 'settings') {
            $data['settings'] = Setting::all();
        }

        return response()->json($data, 200, [
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    // -------------------------------------------------------------------------
    // CSV Stream Helpers
    // -------------------------------------------------------------------------

    protected function streamPropertiesCsv($handle)
    {
        fputcsv($handle, [
            'ID (المعرف)',
            'Title (اسم العقار)',
            'Slug (الرابط الدائم)',
            'Listing Type (نوع العرض)',
            'Location (الموقع)',
            'Bedrooms (الغرف)',
            'Bathrooms (الحمامات)',
            'Base Price (السعر الأساسي)',
            'Currency (العملة)',
            'Status (الحالة)',
            'Created At (تاريخ الإنشاء)',
        ]);

        Property::query()->chunk(200, function ($properties) use ($handle) {
            foreach ($properties as $p) {
                fputcsv($handle, [
                    $p->id,
                    $p->title_ar ?: ($p->title_en ?: $p->title),
                    $p->slug,
                    $p->listing_type,
                    $p->location_name ?: ($p->location ? $p->location->name_ar : 'El Gouna'),
                    $p->bedrooms,
                    $p->bathrooms,
                    $p->base_price ?: ($p->base_price_cents ? $p->base_price_cents / 100 : 0),
                    $p->currency ?: 'EGP',
                    $p->status,
                    $p->created_at?->format('Y-m-d H:i:s'),
                ]);
            }
        });
    }

    protected function streamBookingsCsv($handle)
    {
        fputcsv($handle, [
            'Reference (رقم الحجز)',
            'Customer Name (اسم العميل)',
            'Customer Email (البريد الإلكتروني)',
            'Customer Phone (رقم الهاتف)',
            'Property / Item (الوحدة المحجوزة)',
            'Check In (تاريخ الوصول)',
            'Check Out (تاريخ المغادرة)',
            'Guests (عدد الضيوف)',
            'Total Amount (المبلغ الإجمالي)',
            'Currency (العملة)',
            'Status (حالة الحجز)',
            'Payment Status (حالة الدفع)',
            'Created At (تاريخ الحجز)',
        ]);

        Booking::with(['customer', 'property', 'bookable'])->chunk(200, function ($bookings) use ($handle) {
            foreach ($bookings as $b) {
                $ref = $b->reference ?: ($b->booking_reference ?: 'BK-' . $b->id);
                $guestName = $b->customer?->name ?: ($b->customer?->full_name ?: ($b->guest_name ?: 'N/A'));
                $unitTitle = $b->property?->title_ar ?: ($b->property?->title_en ?: ($b->bookable?->title_ar ?: ($b->bookable?->name ?: 'Gouna Stay')));
                $totalAmt = $b->total_cents ? ($b->total_cents / 100) : ($b->total_amount ?: 0);

                fputcsv($handle, [
                    $ref,
                    $guestName,
                    $b->customer?->email ?: ($b->guest_email ?: 'N/A'),
                    $b->customer?->phone ?: ($b->guest_phone ?: 'N/A'),
                    $unitTitle,
                    $b->check_in?->format('Y-m-d') ?: 'N/A',
                    $b->check_out?->format('Y-m-d') ?: 'N/A',
                    $b->guests ?: ($b->guests_count ?: $b->adults_count ?: 1),
                    number_format((float)$totalAmt, 2),
                    $b->currency ?: 'EGP',
                    $b->status,
                    $b->payment_status ?: 'pending',
                    $b->created_at?->format('Y-m-d H:i:s'),
                ]);
            }
        });
    }

    protected function streamPricingCsv($handle)
    {
        fputcsv($handle, [
            'Category (التصنيف)',
            'ID (المعرف)',
            'Name / Property (الاسم / العقار المستهدف)',
            'Start Date (تاريخ البدء)',
            'End Date (تاريخ الانتهاء)',
            'Rate / Value (السعر / القيمة)',
            'Currency (العملة)',
            'Active (الحالة)',
            'Created At (تاريخ الإنشاء)',
        ]);

        SeasonalPrice::with('property')->chunk(200, function ($items) use ($handle) {
            foreach ($items as $sp) {
                fputcsv($handle, [
                    'Seasonal Price (سعر موسمي)',
                    $sp->id,
                    $sp->property?->title_ar ?: ($sp->name_ar ?: ($sp->name_en ?: "Property #{$sp->property_id}")),
                    $sp->start_date?->format('Y-m-d') ?: $sp->start_date,
                    $sp->end_date?->format('Y-m-d') ?: $sp->end_date,
                    $sp->price_per_night_cents ? ($sp->price_per_night_cents / 100) : 0,
                    'EGP',
                    $sp->is_active ? 'Active' : 'Inactive',
                    $sp->created_at?->format('Y-m-d H:i:s'),
                ]);
            }
        });

        Discount::chunk(200, function ($discounts) use ($handle) {
            foreach ($discounts as $d) {
                fputcsv($handle, [
                    'Discount Code (كوبون خصم)',
                    $d->id,
                    $d->code ?: $d->name,
                    $d->starts_at?->format('Y-m-d') ?: 'Immediate',
                    $d->expires_at?->format('Y-m-d') ?: 'Open',
                    $d->percentage ? "{$d->percentage}%" : ($d->amount_cents ? ($d->amount_cents / 100) : 0),
                    'EGP',
                    $d->is_active ? 'Active' : 'Inactive',
                    $d->created_at?->format('Y-m-d H:i:s'),
                ]);
            }
        });
    }

    protected function streamYachtsCsv($handle)
    {
        fputcsv($handle, [
            'ID (المعرف)',
            'Name (اسم اليخت)',
            'Type (النوع)',
            'Brand & Model (الماركة والطراز)',
            'Length Ft (الطول بالقدم)',
            'Capacity (السعة)',
            'Hourly Price (السعر بالساعة)',
            'Weekend Price (سعر الويك إند)',
            'Marina Berth (المرسى)',
            'Status (الحالة)',
            'Created At (تاريخ الإضافة)',
        ]);

        Yacht::chunk(200, function ($yachts) use ($handle) {
            foreach ($yachts as $y) {
                fputcsv($handle, [
                    $y->id,
                    $y->name_ar ?: ($y->name_en ?: 'El Gouna Luxury Yacht'),
                    $y->yacht_type ?: 'Motor Yacht',
                    trim("{$y->brand} {$y->model}"),
                    $y->length_ft ?: 'N/A',
                    $y->capacity ?: 10,
                    $y->base_price ?: ($y->base_price_cents ? $y->base_price_cents / 100 : 0),
                    $y->weekend_price ?: ($y->weekend_price_cents ? $y->weekend_price_cents / 100 : 0),
                    $y->marina_berth ?: 'Abu Tig Marina',
                    $y->status ?: 'Active',
                    $y->created_at?->format('Y-m-d H:i:s'),
                ]);
            }
        });
    }

    protected function streamExperiencesCsv($handle)
    {
        fputcsv($handle, [
            'ID (المعرف)',
            'Title (اسم التجربة)',
            'Category (التصنيف)',
            'Price (السعر)',
            'Currency (العملة)',
            'Duration (المدة)',
            'Max Capacity (السعة القصوى)',
            'Status (الحالة)',
            'Created At (تاريخ الإضافة)',
        ]);

        Experience::chunk(200, function ($items) use ($handle) {
            foreach ($items as $e) {
                fputcsv($handle, [
                    $e->id,
                    $e->title_ar ?: ($e->title_en ?: $e->title),
                    $e->category?->name_ar ?: ($e->category?->name ?: 'Activity'),
                    $e->price ?: ($e->price_cents ? $e->price_cents / 100 : 0),
                    $e->currency ?: 'EGP',
                    $e->duration_hours ? "{$e->duration_hours} Hours" : 'Flexible',
                    $e->max_participants ?: 12,
                    $e->is_published ? 'Published' : 'Draft',
                    $e->created_at?->format('Y-m-d H:i:s'),
                ]);
            }
        });
    }

    protected function streamEventsCsv($handle)
    {
        fputcsv($handle, [
            'ID (المعرف)',
            'Title (اسم الفعالية)',
            'Venue (المكان)',
            'Date (التاريخ)',
            'Start Time (وقت البدء)',
            'End Time (وقت الانتهاء)',
            'Min Price (أقل سعر تذكرة)',
            'Status (الحالة)',
            'Created At (تاريخ الإضافة)',
        ]);

        Event::chunk(200, function ($items) use ($handle) {
            foreach ($items as $ev) {
                fputcsv($handle, [
                    $ev->id,
                    $ev->title_ar ?: ($ev->title_en ?: $ev->title),
                    $ev->venue_name ?: ($ev->venue?->name ?: 'El Gouna Plaza'),
                    $ev->event_date?->format('Y-m-d') ?: $ev->event_date,
                    $ev->start_time ?: 'N/A',
                    $ev->end_time ?: 'N/A',
                    $ev->min_price ?: ($ev->min_price_cents ? $ev->min_price_cents / 100 : 0),
                    $ev->is_published ? 'Published' : 'Draft',
                    $ev->created_at?->format('Y-m-d H:i:s'),
                ]);
            }
        });
    }

    protected function streamUsersCsv($handle)
    {
        fputcsv($handle, [
            'ID (المعرف)',
            'Name (الاسم)',
            'Email (البريد الإلكتروني)',
            'Phone (الهاتف)',
            'Role (الدور والصلاحية)',
            'Active (الحالة)',
            '2FA (المصادقة الثنائية)',
            'Last Login (آخر دخول)',
            'Created At (تاريخ التسجيل)',
        ]);

        User::chunk(200, function ($users) use ($handle) {
            foreach ($users as $u) {
                fputcsv($handle, [
                    $u->id,
                    $u->name,
                    $u->email,
                    $u->phone ?: 'N/A',
                    $u->role ?: 'staff',
                    $u->is_active ? 'Active' : ($u->status ?: 'Active'),
                    $u->two_factor_secret ? 'Enabled' : 'Disabled',
                    $u->last_login_at?->format('Y-m-d H:i:s') ?: 'N/A',
                    $u->created_at?->format('Y-m-d H:i:s'),
                ]);
            }
        });
    }

    protected function streamLeadsCsv($handle)
    {
        fputcsv($handle, [
            'ID (المعرف)',
            'Client Name (اسم العميل)',
            'Email (البريد الإلكتروني)',
            'Phone (الهاتف)',
            'Service (الخدمة المطلوبة)',
            'Status (الحالة)',
            'Message (تفاصيل الطلب)',
            'Created At (تاريخ الطلب)',
        ]);

        Lead::chunk(200, function ($items) use ($handle) {
            foreach ($items as $l) {
                fputcsv($handle, [
                    $l->id,
                    $l->name,
                    $l->email,
                    $l->phone,
                    $l->service_type ?: $l->source,
                    $l->status,
                    $l->message ?: $l->notes,
                    $l->created_at?->format('Y-m-d H:i:s'),
                ]);
            }
        });
    }

    protected function streamFinancesCsv($handle)
    {
        fputcsv($handle, [
            'Transaction Ref (الرقم المرجعي)',
            'Booking ID (رقم الحجز)',
            'Customer ID (معرف العميل)',
            'Amount (المبلغ)',
            'Currency (العملة)',
            'Type (النوع)',
            'Status (حالة السداد)',
            'Gateway (بوابة الدفع)',
            'Completed At (تاريخ الدفع)',
            'Created At (تاريخ العملية)',
        ]);

        PaymentTransaction::chunk(200, function ($items) use ($handle) {
            foreach ($items as $tx) {
                fputcsv($handle, [
                    $tx->transaction_id ?: $tx->gateway_reference,
                    $tx->booking_id ?: 'N/A',
                    $tx->customer_id ?: 'N/A',
                    $tx->amount_cents ? ($tx->amount_cents / 100) : 0,
                    $tx->currency ?: 'EGP',
                    $tx->type ?: 'Payment',
                    $tx->status,
                    $tx->gateway_provider ?: 'Card / Online',
                    $tx->completed_at ? (Carbon::parse($tx->completed_at)->format('Y-m-d H:i:s')) : 'N/A',
                    $tx->created_at?->format('Y-m-d H:i:s'),
                ]);
            }
        });
    }

    protected function streamCustomersCsv($handle)
    {
        fputcsv($handle, [
            'ID (المعرف)',
            'Name (الاسم)',
            'Email (البريد الإلكتروني)',
            'Phone (الهاتف)',
            'Country (الدولة)',
            'Created At (تاريخ التسجيل)',
        ]);

        Customer::chunk(200, function ($items) use ($handle) {
            foreach ($items as $c) {
                fputcsv($handle, [
                    $c->id,
                    $c->full_name ?: $c->name,
                    $c->email,
                    $c->phone,
                    $c->country ?: 'N/A',
                    $c->created_at?->format('Y-m-d H:i:s'),
                ]);
            }
        });
    }

    protected function streamSettingsCsv($handle)
    {
        fputcsv($handle, [
            'Setting ID (المعرف)',
            'Key (المفتاح)',
            'Description (الوصف)',
            'Value Summary (ملخص الإعداد)',
            'Updated At (تاريخ التحديث)',
        ]);

        Setting::chunk(200, function ($settings) use ($handle) {
            foreach ($settings as $s) {
                $valStr = is_array($s->value) ? json_encode($s->value, JSON_UNESCAPED_UNICODE) : (string) $s->value;
                fputcsv($handle, [
                    $s->id,
                    $s->key,
                    $s->description ?: 'Platform Setting',
                    mb_strimwidth($valStr, 0, 160, '...'),
                    $s->updated_at?->format('Y-m-d H:i:s'),
                ]);
            }
        });
    }

    protected function streamAllCsv($handle)
    {
        fputcsv($handle, ['=== GOUNOW PLATFORM EXECUTIVE MASTER DATA EXPORT (تقرير شامل لمنصة جونو) ===']);
        fputcsv($handle, ['Export Timestamp:', now()->toIso8601String()]);
        fputcsv($handle, []);

        fputcsv($handle, ['--- 1. PROPERTIES & LUXURY ESTATES (العقارات والفلل) ---']);
        $this->streamPropertiesCsv($handle);
        fputcsv($handle, []);

        fputcsv($handle, ['--- 2. BOOKINGS & RESERVATIONS (الحجوزات) ---']);
        $this->streamBookingsCsv($handle);
        fputcsv($handle, []);

        fputcsv($handle, ['--- 3. YACHT FLEET & CHARTERS (أسطول اليخوت والشارتر) ---']);
        $this->streamYachtsCsv($handle);
        fputcsv($handle, []);

        fputcsv($handle, ['--- 4. EXPERIENCES & ACTIVITIES (الأنشطة والتجارب البحرية) ---']);
        $this->streamExperiencesCsv($handle);
        fputcsv($handle, []);

        fputcsv($handle, ['--- 5. EVENTS & FESTIVALS (الفعاليات والتذاكر) ---']);
        $this->streamEventsCsv($handle);
        fputcsv($handle, []);

        fputcsv($handle, ['--- 6. PRICING & SEASONS (محرك الأسعار الذكي) ---']);
        $this->streamPricingCsv($handle);
        fputcsv($handle, []);

        fputcsv($handle, ['--- 7. FINANCIAL TRANSACTIONS (المالية والمدفوعات) ---']);
        $this->streamFinancesCsv($handle);
        fputcsv($handle, []);

        fputcsv($handle, ['--- 8. VIP CONCIERGE LEADS (عمليات الكونسيرج) ---']);
        $this->streamLeadsCsv($handle);
        fputcsv($handle, []);

        fputcsv($handle, ['--- 9. CUSTOMERS & INVESTORS (العملاء والمستثمرون) ---']);
        $this->streamCustomersCsv($handle);
        fputcsv($handle, []);

        fputcsv($handle, ['--- 10. SYSTEM USERS & STAFF (المشرفون والصلاحيات) ---']);
        $this->streamUsersCsv($handle);
        fputcsv($handle, []);

        fputcsv($handle, ['--- 11. PLATFORM CONFIGURATION (إعدادات المنصة) ---']);
        $this->streamSettingsCsv($handle);
    }

    // -------------------------------------------------------------------------
    // Word Document (.doc) HTML Builder
    // -------------------------------------------------------------------------

    protected function buildWordDocumentHtml(string $type): string
    {
        $date = now()->format('Y-m-d H:i');
        $propCount = Property::count();
        $bookCount = Booking::count();
        $leadCount = Lead::count();
        $expCount = Experience::count();
        $eventCount = Event::count();
        $yachtCount = Yacht::count();
        $financeCount = PaymentTransaction::count();

        // Tables generation based on type
        $sectionsHtml = '';

        if ($type === 'all' || $type === 'properties') {
            $rows = '';
            foreach (Property::limit(100)->get() as $p) {
                $name = htmlspecialchars($p->title_ar ?: ($p->title_en ?: $p->title));
                $loc = htmlspecialchars($p->location_name ?: ($p->location?->name_ar ?: 'El Gouna'));
                $price = number_format((float) ($p->base_price ?: ($p->base_price_cents ? $p->base_price_cents / 100 : 0)), 2) . ' ' . ($p->currency ?: 'EGP');
                $status = htmlspecialchars($p->status);
                $rows .= "<tr><td>{$p->id}</td><td><b>{$name}</b></td><td>{$p->listing_type}</td><td>{$loc}</td><td>{$p->bedrooms} Beds</td><td>{$price}</td><td>{$status}</td></tr>";
            }
            $sectionsHtml .= "<h2>1. Properties & Luxury Estates Catalog (العقارات والفلل)</h2>
            <table class='data-table'>
                <thead><tr><th>ID</th><th>Property Title</th><th>Type</th><th>Location</th><th>Capacity</th><th>Base Price</th><th>Status</th></tr></thead>
                <tbody>{$rows}</tbody>
            </table>";
        }

        if ($type === 'all' || $type === 'bookings') {
            $rows = '';
            foreach (Booking::with(['customer', 'property', 'bookable'])->limit(100)->get() as $b) {
                $ref = htmlspecialchars($b->reference ?: ($b->booking_reference ?: 'BK-' . $b->id));
                $guest = htmlspecialchars($b->customer?->name ?: ($b->customer?->full_name ?: ($b->guest_name ?: 'VIP Guest')));
                $item = htmlspecialchars($b->property?->title_ar ?: ($b->property?->title_en ?: ($b->bookable?->title_ar ?: ($b->bookable?->name ?: 'Villa'))));
                $dates = ($b->check_in?->format('Y-m-d') ?: 'N/A') . ' &rarr; ' . ($b->check_out?->format('Y-m-d') ?: 'N/A');
                $totalAmt = $b->total_cents ? ($b->total_cents / 100) : ($b->total_amount ?: 0);
                $total = number_format((float) $totalAmt, 2) . ' ' . ($b->currency ?: 'EGP');
                $status = htmlspecialchars($b->status);
                $rows .= "<tr><td><b>{$ref}</b></td><td>{$guest}</td><td>{$item}</td><td>{$dates}</td><td>{$total}</td><td>{$status}</td></tr>";
            }
            $sectionsHtml .= "<h2>2. Bookings & Reservations (الحجوزات والعمليات)</h2>
            <table class='data-table'>
                <thead><tr><th>Reference</th><th>Guest Name</th><th>Property</th><th>Dates</th><th>Total</th><th>Status</th></tr></thead>
                <tbody>{$rows}</tbody>
            </table>";
        }

        if ($type === 'all' || $type === 'yachts') {
            $rows = '';
            foreach (Yacht::limit(50)->get() as $y) {
                $name = htmlspecialchars($y->name_ar ?: ($y->name_en ?: 'Yacht'));
                $brand = htmlspecialchars("{$y->brand} {$y->model}");
                $price = number_format((float) ($y->base_price ?: ($y->base_price_cents ? $y->base_price_cents / 100 : 0)), 2) . ' ' . ($y->currency ?: 'EGP');
                $rows .= "<tr><td>{$y->id}</td><td><b>{$name}</b></td><td>{$brand}</td><td>{$y->length_ft} ft</td><td>{$y->capacity} Guests</td><td>{$price}</td><td>{$y->status}</td></tr>";
            }
            $sectionsHtml .= "<h2>3. Yacht Fleet & Charters (أسطول اليخوت والشارتر)</h2>
            <table class='data-table'>
                <thead><tr><th>ID</th><th>Yacht Name</th><th>Brand / Model</th><th>Length</th><th>Capacity</th><th>Hourly Price</th><th>Status</th></tr></thead>
                <tbody>{$rows}</tbody>
            </table>";
        }

        if ($type === 'all' || $type === 'experiences') {
            $rows = '';
            foreach (Experience::limit(50)->get() as $e) {
                $title = htmlspecialchars($e->title_ar ?: ($e->title_en ?: $e->title));
                $price = number_format((float) ($e->price ?: ($e->price_cents ? $e->price_cents / 100 : 0)), 2) . ' ' . ($e->currency ?: 'EGP');
                $dur = $e->duration_hours ? "{$e->duration_hours}h" : 'Flexible';
                $rows .= "<tr><td>{$e->id}</td><td><b>{$title}</b></td><td>{$dur}</td><td>{$price}</td><td>{$e->max_participants} Guests</td><td>" . ($e->is_published ? 'Published' : 'Draft') . "</td></tr>";
            }
            $sectionsHtml .= "<h2>4. Experiences & Activities (الأنشطة والتجارب البحرية)</h2>
            <table class='data-table'>
                <thead><tr><th>ID</th><th>Title</th><th>Duration</th><th>Price</th><th>Max Guests</th><th>Status</th></tr></thead>
                <tbody>{$rows}</tbody>
            </table>";
        }

        if ($type === 'all' || $type === 'events') {
            $rows = '';
            foreach (Event::limit(50)->get() as $ev) {
                $title = htmlspecialchars($ev->title_ar ?: ($ev->title_en ?: $ev->title));
                $venue = htmlspecialchars($ev->venue_name ?: 'El Gouna');
                $dateStr = $ev->event_date?->format('Y-m-d') ?: (string) $ev->event_date;
                $price = number_format((float) ($ev->min_price ?: ($ev->min_price_cents ? $ev->min_price_cents / 100 : 0)), 2) . ' EGP';
                $rows .= "<tr><td>{$ev->id}</td><td><b>{$title}</b></td><td>{$venue}</td><td>{$dateStr}</td><td>{$price}</td><td>" . ($ev->is_published ? 'Published' : 'Draft') . "</td></tr>";
            }
            $sectionsHtml .= "<h2>5. Events & Festival Galas (الفعاليات والتذاكر والحفلات)</h2>
            <table class='data-table'>
                <thead><tr><th>ID</th><th>Event Title</th><th>Venue</th><th>Date</th><th>Min Price</th><th>Status</th></tr></thead>
                <tbody>{$rows}</tbody>
            </table>";
        }

        if ($type === 'all' || $type === 'finances') {
            $rows = '';
            foreach (PaymentTransaction::limit(100)->get() as $tx) {
                $ref = htmlspecialchars($tx->transaction_id ?: $tx->gateway_reference);
                $amount = number_format((float) ($tx->amount_cents ? $tx->amount_cents / 100 : 0), 2) . ' ' . ($tx->currency ?: 'EGP');
                $rows .= "<tr><td><b>{$ref}</b></td><td>Booking #{$tx->booking_id}</td><td>{$amount}</td><td>{$tx->gateway_provider}</td><td>{$tx->status}</td><td>{$tx->created_at?->format('Y-m-d')}</td></tr>";
            }
            $sectionsHtml .= "<h2>6. Financial Transactions & Payments (المالية والمدفوعات)</h2>
            <table class='data-table'>
                <thead><tr><th>Transaction Ref</th><th>Booking</th><th>Amount</th><th>Gateway</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>{$rows}</tbody>
            </table>";
        }

        if ($type === 'all' || $type === 'leads' || $type === 'concierge') {
            $rows = '';
            foreach (Lead::limit(100)->get() as $l) {
                $name = htmlspecialchars($l->name);
                $contact = htmlspecialchars("{$l->email} | {$l->phone}");
                $srv = htmlspecialchars($l->service_type ?: 'Concierge');
                $msg = htmlspecialchars(mb_strimwidth($l->message ?: $l->notes ?: '', 0, 80, '...'));
                $rows .= "<tr><td>{$l->id}</td><td><b>{$name}</b></td><td>{$contact}</td><td>{$srv}</td><td>{$msg}</td></tr>";
            }
            $sectionsHtml .= "<h2>7. VIP Concierge Inquiries & Client Leads (عمليات الكونسيرج)</h2>
            <table class='data-table'>
                <thead><tr><th>ID</th><th>Client Name</th><th>Contact Details</th><th>Service</th><th>Message</th></tr></thead>
                <tbody>{$rows}</tbody>
            </table>";
        }

        if ($type === 'all' || $type === 'users') {
            $rows = '';
            foreach (User::limit(50)->get() as $u) {
                $name = htmlspecialchars($u->name);
                $email = htmlspecialchars($u->email);
                $role = htmlspecialchars($u->role ?: 'staff');
                $status = $u->is_active ? 'Active' : ($u->status ?: 'Active');
                $tfa = $u->two_factor_secret ? 'Enabled' : 'Disabled';
                $rows .= "<tr><td>{$u->id}</td><td><b>{$name}</b></td><td>{$email}</td><td>{$role}</td><td>{$tfa}</td><td>{$status}</td></tr>";
            }
            $sectionsHtml .= "<h2>8. System Administrators & Staff (المشرفون والصلاحيات)</h2>
            <table class='data-table'>
                <thead><tr><th>ID</th><th>Staff Name</th><th>Email</th><th>Role</th><th>2FA</th><th>Status</th></tr></thead>
                <tbody>{$rows}</tbody>
            </table>";
        }

        return <<<HTML
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<title>GouNow Executive Data Dossier</title>
<style>
    body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; margin: 40px; color: #1e1e1e; }
    .header { border-bottom: 3px solid #8c4c36; padding-bottom: 15px; margin-bottom: 25px; }
    .brand-title { font-size: 26pt; font-weight: bold; color: #8c4c36; margin: 0; }
    .brand-subtitle { font-size: 11pt; color: #666; margin-top: 5px; }
    .meta-box { background: #fdfbf7; border: 1px solid #ebd9c8; padding: 12px 18px; margin-bottom: 25px; border-radius: 6px; }
    .kpi-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    .kpi-table th { background: #8c4c36; color: #fff; padding: 10px; font-size: 10pt; }
    .kpi-table td { background: #f7f3ee; text-align: center; font-size: 13pt; font-weight: bold; padding: 10px; border: 1px solid #e2d7cb; color: #8c4c36; }
    h2 { font-size: 15pt; color: #2e2622; border-bottom: 1px solid #ddd; padding-bottom: 6px; margin-top: 35px; }
    table.data-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 9.5pt; }
    table.data-table th { background: #2e2622; color: #fff; padding: 8px; text-align: left; }
    table.data-table td { padding: 8px; border-bottom: 1px solid #eee; }
    table.data-table tr:nth-child(even) { background: #faf8f5; }
    .footer { margin-top: 50px; font-size: 9pt; color: #888; text-align: center; border-top: 1px solid #ddd; padding-top: 15px; }
</style>
</head>
<body dir="ltr">
    <div class="header">
        <h1 class="brand-title">GOUNOW EL GOUNA</h1>
        <div class="brand-subtitle">EXECUTIVE MANAGEMENT PLATFORM &middot; OFFICIAL DATA DOSSIER</div>
    </div>

    <div class="meta-box">
        <strong>Report Scope:</strong> Comprehensive Data Dossier ({$type})<br>
        <strong>Generated On:</strong> {$date} (UTC)<br>
        <strong>Confidentiality:</strong> Strictly Confidential &middot; Executive Access Only
    </div>

    <table class="kpi-table">
        <tr>
            <th>Properties (الفلل)</th>
            <th>Bookings (الحجوزات)</th>
            <th>Yachts (اليخوت)</th>
            <th>Experiences (التجارب)</th>
            <th>Events (الفعاليات)</th>
            <th>Leads (الكونسيرج)</th>
            <th>Transactions (المالية)</th>
        </tr>
        <tr>
            <td>{$propCount}</td>
            <td>{$bookCount}</td>
            <td>{$yachtCount}</td>
            <td>{$expCount}</td>
            <td>{$eventCount}</td>
            <td>{$leadCount}</td>
            <td>{$financeCount}</td>
        </tr>
    </table>

    {$sectionsHtml}

    <div class="footer">
        &copy; 2026 GouNow Lifestyle &amp; Properties Ltd. El Gouna, Red Sea, Egypt. All rights reserved.
    </div>
</body>
</html>
HTML;
    }
}
