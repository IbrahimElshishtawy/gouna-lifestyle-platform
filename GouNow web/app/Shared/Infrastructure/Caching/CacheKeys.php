<?php

declare(strict_types=1);

namespace App\Shared\Infrastructure\Caching;

final class CacheKeys
{
    public const LOCATIONS_ACTIVE = 'metadata:locations:active';
    public const PROPERTY_CATEGORIES_ACTIVE = 'metadata:property_categories:active';
    public const EXPERIENCE_CATEGORIES_ACTIVE = 'metadata:experience_categories:active';
    public const AMENITIES_ACTIVE = 'metadata:amenities:active';
    public const HOMEPAGE_SECTIONS = 'cms:homepage_sections:visible';

    public const TTL_SHORT = 300;       // 5 minutes
    public const TTL_MEDIUM = 3600;     // 1 hour
    public const TTL_LONG = 86400;      // 24 hours
    public const TTL_EXTENDED = 604800; // 7 days

    public static function propertyDetailKey(int|string $idOrSlug): string
    {
        return "property:detail:{$idOrSlug}";
    }

    public static function experienceDetailKey(int|string $idOrSlug): string
    {
        return "experience:detail:{$idOrSlug}";
    }

    public static function monthlyPricingCalendarKey(int $propertyId, int $year, int $month): string
    {
        return "pricing:calendar:{$propertyId}:{$year}:{$month}";
    }
}
