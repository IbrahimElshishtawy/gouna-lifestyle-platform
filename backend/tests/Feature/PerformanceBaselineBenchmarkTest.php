<?php

namespace Tests\Feature;

use App\Models\Property;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use PHPUnit\Framework\Attributes\Group;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

#[Group('perf')]
class PerformanceBaselineBenchmarkTest extends TestCase
{
    private User $admin;

    private Property $property;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::firstOrCreate(
            ['email' => 'admin@gounow.com'],
            [
                'name' => 'Super Admin',
                'password' => bcrypt('GouNow@2026!Secure'),
                'is_admin' => true,
                'is_active' => true,
            ]
        );

        $this->property = Property::where('is_published', true)->first()
            ?? Property::first()
            ?? Property::create([
                'reference_number' => 'PROP-PERF-'.uniqid(),
                'slug' => 'perf-villa-'.uniqid(),
                'title_en' => 'Performance Benchmark Villa',
                'title_ar' => 'فيلا قياس الأداء',
                'listing_type' => 'rent',
                'base_price_cents' => 350000,
                'currency' => 'EGP',
                'is_published' => true,
                'status' => 'published',
            ]);
    }

    #[Test]
    public function benchmark_and_generate_perf_baseline_report(): void
    {
        $checkIn = Carbon::now()->addDays(10)->toDateString();
        $checkOut = Carbon::now()->addDays(13)->toDateString();

        $scenarios = [
            [
                'name' => 'Homepage',
                'method' => 'GET',
                'url' => route('home'),
                'auth' => false,
                'payload' => [],
            ],
            [
                'name' => 'Stays Catalog (/stays)',
                'method' => 'GET',
                'url' => route('properties.index'),
                'auth' => false,
                'payload' => [],
            ],
            [
                'name' => 'Property Detail (/stays/{slug})',
                'method' => 'GET',
                'url' => route('properties.show', $this->property->slug),
                'auth' => false,
                'payload' => [],
            ],
            [
                'name' => 'Quote Calculation (POST /checkout/calculate)',
                'method' => 'POST_JSON',
                'url' => route('checkout.calculate'),
                'auth' => false,
                'payload' => [
                    'property_id' => $this->property->id,
                    'check_in' => $checkIn,
                    'check_out' => $checkOut,
                    'guests' => 2,
                ],
            ],
            [
                'name' => 'Checkout Page (/checkout/{slug})',
                'method' => 'GET',
                'url' => route('checkout.show', [
                    'property' => $this->property->slug,
                    'check_in' => $checkIn,
                    'check_out' => $checkOut,
                    'guests' => 2,
                ]),
                'auth' => false,
                'payload' => [],
            ],
            [
                'name' => 'Curated Experiences (/experiences)',
                'method' => 'GET',
                'url' => route('experiences.index'),
                'auth' => false,
                'payload' => [],
            ],
            [
                'name' => 'Admin Login Page (/admin/login)',
                'method' => 'GET',
                'url' => route('admin.login'),
                'auth' => false,
                'payload' => [],
            ],
            [
                'name' => 'Admin Dashboard (/admin)',
                'method' => 'GET',
                'url' => route('admin.dashboard'),
                'auth' => true,
                'payload' => [],
            ],
            [
                'name' => 'Admin Properties Index (/admin/properties)',
                'method' => 'GET',
                'url' => route('admin.properties.index'),
                'auth' => true,
                'payload' => [],
            ],
            [
                'name' => 'Admin Bookings Index (/admin/bookings)',
                'method' => 'GET',
                'url' => route('admin.bookings.index'),
                'auth' => true,
                'payload' => [],
            ],
        ];

        $reportLines = [];
        $reportLines[] = '# GouNow Performance Baseline Report (Phase 0 — P0-T07)';
        $reportLines[] = '';
        $reportLines[] = '- **Environment**: Local SQLite testing database (`testing.sqlite`)';
        $reportLines[] = '- **Timestamp**: '.Carbon::now()->toIso8601String();
        $reportLines[] = '- **Iterations**: 20 requests per critical endpoint';
        $reportLines[] = '- **Strict Mode Test**: Monitored query logs and executed query counts';
        $reportLines[] = '';
        $reportLines[] = '| Endpoint | Method | Status | Queries Count | p50 Latency (ms) | p95 Latency (ms) | Response Size (Bytes) |';
        $reportLines[] = '|---|---|---|---|---|---|---|';

        foreach ($scenarios as $scenario) {
            $durations = [];
            $queryCount = 0;
            $responseSize = 0;
            $statusCode = 0;

            for ($i = 0; $i < 20; $i++) {
                DB::flushQueryLog();
                DB::enableQueryLog();

                $start = hrtime(true);

                if ($scenario['auth']) {
                    $caller = $this->actingAs($this->admin);
                } else {
                    $caller = $this;
                }

                if ($scenario['method'] === 'POST_JSON') {
                    $response = $caller->postJson($scenario['url'], $scenario['payload']);
                } else {
                    $response = $caller->get($scenario['url']);
                }

                $end = hrtime(true);
                $durations[] = ($end - $start) / 1e6;

                if ($i === 0) {
                    $queryCount = count(DB::getQueryLog());
                    $statusCode = $response->getStatusCode();
                    $content = $response->getContent();
                    $responseSize = strlen($content ?: '');
                }
            }

            sort($durations);
            $p50 = $durations[(int) floor(0.50 * count($durations))];
            $p95 = $durations[(int) floor(0.95 * count($durations))];

            $reportLines[] = sprintf(
                '| %s | %s | %d | %d | %.2f ms | %.2f ms | %d |',
                $scenario['name'],
                $scenario['method'] === 'POST_JSON' ? 'POST' : 'GET',
                $statusCode,
                $queryCount,
                $p50,
                $p95,
                $responseSize
            );
        }

        $reportContent = implode("\n", $reportLines)."\n";
        $reportPath = base_path('../docs/hardening/snapshots/perf_baseline.md');
        file_put_contents($reportPath, $reportContent);

        $this->assertFileExists($reportPath);
        $this->assertStringContainsString('GouNow Performance Baseline Report', $reportContent);
    }
}
