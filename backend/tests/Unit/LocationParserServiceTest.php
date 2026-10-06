<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Services\LocationParserService;
use PHPUnit\Framework\TestCase;

class LocationParserServiceTest extends TestCase
{
    private LocationParserService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new LocationParserService();
    }

    public function test_parses_direct_coordinates_string(): void
    {
        $result = $this->service->parse('27.394851, 33.678219');

        $this->assertTrue($result['success']);
        $this->assertEquals(27.394851, $result['latitude']);
        $this->assertEquals(33.678219, $result['longitude']);
        $this->assertEquals('direct_coordinates', $result['source']);
    }

    public function test_parses_google_maps_at_coordinates_url(): void
    {
        $url = 'https://www.google.com/maps/@27.3948512,33.6782194,15z';
        $result = $this->service->parse($url);

        $this->assertTrue($result['success']);
        $this->assertEquals(27.3948512, $result['latitude']);
        $this->assertEquals(33.6782194, $result['longitude']);
    }

    public function test_parses_google_maps_query_param_url(): void
    {
        $url = 'https://maps.google.com/?q=27.394851,33.678219';
        $result = $this->service->parse($url);

        $this->assertTrue($result['success']);
        $this->assertEquals(27.394851, $result['latitude']);
        $this->assertEquals(33.678219, $result['longitude']);
    }

    public function test_parses_google_maps_place_protobuf_url(): void
    {
        $url = 'https://www.google.com/maps/place/El+Gouna/@27.3948512,33.6782194,15z/data=!3m1!1e3!4m6!3m5!1s0x1452f1234!8m2!3d27.3955!4d33.6799';
        $result = $this->service->parse($url);

        $this->assertTrue($result['success']);
        $this->assertNotNull($result['latitude']);
        $this->assertNotNull($result['longitude']);
    }

    public function test_rejects_invalid_url_without_coordinates(): void
    {
        $url = 'https://www.google.com/search?q=el+gouna';
        $result = $this->service->parse($url);

        $this->assertFalse($result['success']);
        $this->assertStringContainsString('Unable to detect the exact coordinates', $result['message']);
    }

    public function test_rejects_out_of_range_latitude(): void
    {
        $result = $this->service->parse('95.123456, 33.678219');

        $this->assertFalse($result['success']);
    }

    public function test_rejects_out_of_range_longitude(): void
    {
        $result = $this->service->parse('27.394851, 195.678219');

        $this->assertFalse($result['success']);
    }
}
