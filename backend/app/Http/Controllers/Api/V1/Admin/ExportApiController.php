<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Customer;
use App\Models\Event;
use App\Models\Experience;
use App\Models\Lead;
use App\Models\Property;
use App\Models\Yacht;
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
                'experiences_count' => Experience::count(),
                'events_count' => Event::count(),
                'yachts_count' => Yacht::count(),
                'leads_count' => Lead::count(),
                'customers_count' => Customer::count(),
                'generated_at' => now()->toIso8601String(),
                'supported_formats' => ['excel', 'word', 'json'],
                'supported_types' => ['all', 'properties', 'bookings', 'experiences', 'events', 'yachts', 'leads', 'customers'],
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
                case 'experiences':
                    $this->streamExperiencesCsv($handle);
                    break;
                case 'events':
                    $this->streamEventsCsv($handle);
                    break;
                case 'leads':
                    $this->streamLeadsCsv($handle);
                    break;
                case 'customers':
                    $this->streamCustomersCsv($handle);
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
        if ($type === 'all' || $type === 'experiences') {
            $data['experiences'] = Experience::all();
        }
        if ($type === 'all' || $type === 'events') {
            $data['events'] = Event::all();
        }
        if ($type === 'all' || $type === 'yachts') {
            $data['yachts'] = Yacht::all();
        }
        if ($type === 'all' || $type === 'leads') {
            $data['leads'] = Lead::all();
        }
        if ($type === 'all' || $type === 'customers') {
            $data['customers'] = Customer::all();
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
                    $p->title_ar ?: $p->title_en ?: $p->title,
                    $p->slug,
                    $p->listing_type,
                    $p->location_name ?: ($p->location ? $p->location->name_ar : 'El Gouna'),
                    $p->bedrooms,
                    $p->bathrooms,
                    $p->base_price ?: $p->price_per_night,
                    $p->currency ?: 'EUR',
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

        Booking::with(['customer', 'property'])->chunk(200, function ($bookings) use ($handle) {
            foreach ($bookings as $b) {
                fputcsv($handle, [
                    $b->booking_reference,
                    $b->customer?->full_name ?: ($b->guest_name ?: 'N/A'),
                    $b->customer?->email ?: ($b->guest_email ?: 'N/A'),
                    $b->customer?->phone ?: ($b->guest_phone ?: 'N/A'),
                    $b->property?->title_ar ?: ($b->property?->title_en ?: ($b->property?->title ?: 'El Gouna Villa')),
                    $b->check_in?->format('Y-m-d'),
                    $b->check_out?->format('Y-m-d'),
                    $b->guests_count ?: $b->adults_count,
                    $b->total_amount,
                    $b->currency ?: 'EUR',
                    $b->status,
                    $b->payment_status,
                    $b->created_at?->format('Y-m-d H:i:s'),
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
            'Duration (المدة)',
            'Max Guests (الحد الأقصى للضيوف)',
            'Location (الموقع)',
            'Status (الحالة)',
            'Created At (تاريخ الإضافة)',
        ]);

        Experience::query()->chunk(200, function ($items) use ($handle) {
            foreach ($items as $e) {
                fputcsv($handle, [
                    $e->id,
                    $e->title_ar ?: $e->title_en ?: $e->title,
                    $e->category?->name_ar ?: ($e->category?->name_en ?: 'Marine / Desert'),
                    $e->price ?: $e->base_price,
                    $e->duration_hours ? "{$e->duration_hours} Hours" : 'Flexible',
                    $e->max_participants ?: 12,
                    $e->location_name ?: 'El Gouna Waters',
                    $e->is_active ? 'Active' : 'Inactive',
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
            'Date (تاريخ الانعقاد)',
            'Venue (المكان)',
            'Base Price (سعر التذكرة)',
            'Capacity (السعة الاستيعابية)',
            'Status (الحالة)',
            'Created At (تاريخ الإنشاء)',
        ]);

        Event::query()->chunk(200, function ($items) use ($handle) {
            foreach ($items as $ev) {
                fputcsv($handle, [
                    $ev->id,
                    $ev->title_ar ?: $ev->title_en ?: $ev->title,
                    $ev->start_date ? $ev->start_date->format('Y-m-d H:i') : 'TBA',
                    $ev->venue?->name ?: ($ev->location_name ?: 'El Gouna'),
                    $ev->base_price ?: 0,
                    $ev->capacity ?: 'Unlimited',
                    $ev->status ?: ($ev->is_active ? 'Active' : 'Inactive'),
                    $ev->created_at?->format('Y-m-d H:i:s'),
                ]);
            }
        });
    }

    protected function streamLeadsCsv($handle)
    {
        fputcsv($handle, [
            'ID (المعرف)',
            'Name (اسم العميل)',
            'Email (البريد الإلكتروني)',
            'Phone (الهاتف)',
            'Service (نوع الخدمة المطلوبة)',
            'Status (حالة الطلب)',
            'Notes / Message (الرسالة أو الملاحظات)',
            'Created At (تاريخ الطلب)',
        ]);

        Lead::query()->chunk(200, function ($items) use ($handle) {
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

        Customer::query()->chunk(200, function ($items) use ($handle) {
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

    protected function streamAllCsv($handle)
    {
        fputcsv($handle, ['=== GOUNOW PLATFORM COMPREHENSIVE DATA EXPORT (تصدير شامل لكافة بيانات منصة جونو) ===']);
        fputcsv($handle, ['Export Timestamp:', now()->toIso8601String()]);
        fputcsv($handle, []);

        fputcsv($handle, ['--- SECTION 1: PROPERTIES & LUXURY STAYS (العقارات والفلل) ---']);
        $this->streamPropertiesCsv($handle);
        fputcsv($handle, []);

        fputcsv($handle, ['--- SECTION 2: BOOKINGS & TRANSACTIONS (الحجوزات والعمليات) ---']);
        $this->streamBookingsCsv($handle);
        fputcsv($handle, []);

        fputcsv($handle, ['--- SECTION 3: EXPERIENCES & YACHTS (التجارب واليخوت) ---']);
        $this->streamExperiencesCsv($handle);
        fputcsv($handle, []);

        fputcsv($handle, ['--- SECTION 4: EVENTS & TICKETS (الفعاليات والحفلات) ---']);
        $this->streamEventsCsv($handle);
        fputcsv($handle, []);

        fputcsv($handle, ['--- SECTION 5: CONCIERGE LEADS & INQUIRIES (طلبات الكونسيرج) ---']);
        $this->streamLeadsCsv($handle);
        fputcsv($handle, []);

        fputcsv($handle, ['--- SECTION 6: CLIENTS & GUESTS (قاعدة بيانات العملاء) ---']);
        $this->streamCustomersCsv($handle);
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

        $properties = Property::limit(50)->get();
        $bookings = Booking::with(['customer', 'property'])->limit(50)->get();
        $leads = Lead::limit(50)->get();

        $propRows = '';
        foreach ($properties as $p) {
            $name = htmlspecialchars($p->title_ar ?: ($p->title_en ?: $p->title));
            $loc = htmlspecialchars($p->location_name ?: 'El Gouna');
            $price = number_format((float) ($p->base_price ?: 0), 2) . ' ' . ($p->currency ?: 'EUR');
            $status = htmlspecialchars($p->status);
            $propRows .= "<tr><td>{$p->id}</td><td><b>{$name}</b></td><td>{$loc}</td><td>{$p->bedrooms} Beds</td><td>{$price}</td><td>{$status}</td></tr>";
        }

        $bookRows = '';
        foreach ($bookings as $b) {
            $ref = htmlspecialchars($b->booking_reference);
            $guest = htmlspecialchars($b->customer?->full_name ?: ($b->guest_name ?: 'VIP Guest'));
            $item = htmlspecialchars($b->property?->title_ar ?: ($b->property?->title ?: 'Villa'));
            $dates = ($b->check_in?->format('Y-m-d') ?: 'N/A') . ' &rarr; ' . ($b->check_out?->format('Y-m-d') ?: 'N/A');
            $total = number_format((float) ($b->total_amount ?: 0), 2) . ' ' . ($b->currency ?: 'EUR');
            $status = htmlspecialchars($b->status);
            $bookRows .= "<tr><td><b>{$ref}</b></td><td>{$guest}</td><td>{$item}</td><td>{$dates}</td><td>{$total}</td><td>{$status}</td></tr>";
        }

        $leadRows = '';
        foreach ($leads as $l) {
            $name = htmlspecialchars($l->name);
            $contact = htmlspecialchars("{$l->email} | {$l->phone}");
            $srv = htmlspecialchars($l->service_type ?: 'Concierge');
            $msg = htmlspecialchars(mb_strimwidth($l->message ?: $l->notes ?: '', 0, 80, '...'));
            $leadRows .= "<tr><td>{$l->id}</td><td><b>{$name}</b></td><td>{$contact}</td><td>{$srv}</td><td>{$msg}</td></tr>";
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
    .kpi-table th { background: #8c4c36; color: #fff; padding: 10px; font-size: 11pt; }
    .kpi-table td { background: #f7f3ee; text-align: center; font-size: 14pt; font-weight: bold; padding: 12px; border: 1px solid #e2d7cb; color: #8c4c36; }
    h2 { font-size: 16pt; color: #2e2622; border-bottom: 1px solid #ddd; padding-bottom: 6px; margin-top: 35px; }
    table.data-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 10pt; }
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
            <th>Properties (الفلل والعقارات)</th>
            <th>Bookings (الحجوزات)</th>
            <th>Experiences (اليخوت والتجارب)</th>
            <th>Events (الفعاليات)</th>
            <th>Leads (طلبات الكونسيرج)</th>
        </tr>
        <tr>
            <td>{$propCount}</td>
            <td>{$bookCount}</td>
            <td>{$expCount}</td>
            <td>{$eventCount}</td>
            <td>{$leadCount}</td>
        </tr>
    </table>

    <h2>1. Properties & Luxury Estates Catalog</h2>
    <table class="data-table">
        <thead>
            <tr><th>ID</th><th>Property Title</th><th>Location</th><th>Capacity</th><th>Price</th><th>Status</th></tr>
        </thead>
        <tbody>
            {$propRows}
        </tbody>
    </table>

    <h2>2. Recent Reservations & Operational Stays</h2>
    <table class="data-table">
        <thead>
            <tr><th>Reference</th><th>Guest Name</th><th>Property</th><th>Dates</th><th>Total</th><th>Status</th></tr>
        </thead>
        <tbody>
            {$bookRows}
        </tbody>
    </table>

    <h2>3. VIP Concierge Inquiries & Client Leads</h2>
    <table class="data-table">
        <thead>
            <tr><th>ID</th><th>Client Name</th><th>Contact Details</th><th>Service</th><th>Message</th></tr>
        </thead>
        <tbody>
            {$leadRows}
        </tbody>
    </table>

    <div class="footer">
        &copy; 2026 GouNow Lifestyle &amp; Properties Ltd. El Gouna, Red Sea, Egypt. All rights reserved.
    </div>
</body>
</html>
HTML;
    }
}
