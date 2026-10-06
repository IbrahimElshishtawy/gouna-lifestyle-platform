<?php

declare(strict_types=1);

namespace App\Services;

class LocationParserService
{
    /**
     * Validate geographic latitude.
     */
    public function isValidLatitude(mixed $lat): bool
    {
        if (!is_numeric($lat)) {
            return false;
        }

        $f = (float) $lat;

        return is_finite($f) && $f >= -90.0 && $f <= 90.0;
    }

    /**
     * Validate geographic longitude.
     */
    public function isValidLongitude(mixed $lng): bool
    {
        if (!is_numeric($lng)) {
            return false;
        }

        $f = (float) $lng;

        return is_finite($f) && $f >= -180.0 && $f <= 180.0;
    }

    /**
     * Parse and extract normalized coordinates from a URL or coordinate string.
     */
    public function parse(string $input): array
    {
        $input = trim($input);

        if (empty($input)) {
            return [
                'success' => false,
                'message' => 'Empty location input provided.',
            ];
        }

        // 1. Direct coordinate format: "27.394851, 33.678219" or "27.394851 33.678219"
        if (preg_match('/^([+-]?\d{1,2}(?:\.\d+)?)[,\s]+([+-]?\d{1,3}(?:\.\d+)?)$/', $input, $m)) {
            $lat = (float) $m[1];
            $lng = (float) $m[2];

            if ($this->isValidLatitude($lat) && $this->isValidLongitude($lng)) {
                return [
                    'success' => true,
                    'latitude' => round($lat, 7),
                    'longitude' => round($lng, 7),
                    'source' => 'direct_coordinates',
                    'formatted_coordinates' => round($lat, 6) . ', ' . round($lng, 6),
                    'map_url' => "https://www.google.com/maps?q={$lat},{$lng}",
                ];
            }
        }

        // 2. Resolve shortened URL if maps.app.goo.gl or goo.gl
        $url = $input;
        if (preg_match('/^https?:\/\/(?:maps\.app\.goo\.gl|goo\.gl\/maps)\/[A-Za-z0-9_-]+/i', $url)) {
            $expanded = $this->expandShortUrl($url);
            if ($expanded) {
                $url = $expanded;
            }
        }

        // 3. Match Google Maps patterns
        // Pattern A: /@<lat>,<lng>,<zoom>
        if (preg_match('/@([+-]?\d{1,2}(?:\.\d+)?),([+-]?\d{1,3}(?:\.\d+)?)/', $url, $m)) {
            $lat = (float) $m[1];
            $lng = (float) $m[2];

            if ($this->isValidLatitude($lat) && $this->isValidLongitude($lng)) {
                return [
                    'success' => true,
                    'latitude' => round($lat, 7),
                    'longitude' => round($lng, 7),
                    'source' => 'google_maps_at_coordinates',
                    'formatted_coordinates' => round($lat, 6) . ', ' . round($lng, 6),
                    'map_url' => $url,
                ];
            }
        }

        // Pattern B: Query params q=lat,lng or ll=lat,lng or loc:lat,lng
        if (preg_match('/[?&](?:q|ll|loc|center)=([+-]?\d{1,2}(?:\.\d+)?)[,%2C\s]+([+-]?\d{1,3}(?:\.\d+)?)/i', $url, $m)) {
            $lat = (float) $m[1];
            $lng = (float) $m[2];

            if ($this->isValidLatitude($lat) && $this->isValidLongitude($lng)) {
                return [
                    'success' => true,
                    'latitude' => round($lat, 7),
                    'longitude' => round($lng, 7),
                    'source' => 'google_maps_query_param',
                    'formatted_coordinates' => round($lat, 6) . ', ' . round($lng, 6),
                    'map_url' => $url,
                ];
            }
        }

        // Pattern C: Protobuf data parameters !3d<lat>!4d<lng>
        if (preg_match('/!3d([+-]?\d{1,2}(?:\.\d+)?)!4d([+-]?\d{1,3}(?:\.\d+)?)/', $url, $m)) {
            $lat = (float) $m[1];
            $lng = (float) $m[2];

            if ($this->isValidLatitude($lat) && $this->isValidLongitude($lng)) {
                return [
                    'success' => true,
                    'latitude' => round($lat, 7),
                    'longitude' => round($lng, 7),
                    'source' => 'google_maps_place_data',
                    'formatted_coordinates' => round($lat, 6) . ', ' . round($lng, 6),
                    'map_url' => $url,
                ];
            }
        }

        return [
            'success' => false,
            'message' => 'Unable to detect the exact coordinates from this link. Please choose the location on the map.',
        ];
    }

    /**
     * Follow redirects for shortened Google Maps URLs with a tight timeout.
     */
    private function expandShortUrl(string $url): ?string
    {
        try {
            $ch = curl_init();
            curl_setopt_array($ch, [
                CURLOPT_URL => $url,
                CURLOPT_HEADER => true,
                CURLOPT_NOBODY => true,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_MAXREDIRS => 3,
                CURLOPT_TIMEOUT => 2,
                CURLOPT_USERAGENT => 'Mozilla/5.0 (compatible; GouNowBot/1.0)',
            ]);
            curl_exec($ch);
            $effectiveUrl = curl_getinfo($ch, CURLINFO_EFFECTIVE_URL);
            curl_close($ch);

            return !empty($effectiveUrl) ? (string) $effectiveUrl : null;
        } catch (\Throwable) {
            return null;
        }
    }
}
