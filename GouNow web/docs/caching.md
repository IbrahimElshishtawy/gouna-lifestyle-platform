# Caching & Cache Invalidation Strategy

## 1. Overview
GouNow utilizes **Redis** for caching, session storage, and rate limiting in production. By keeping database queries off the critical path for read-heavy operations (property browsing, amenities, location filters), the platform can comfortably handle traffic spikes during peak vacation seasons in El Gouna.

---

## 2. Centralized Cache Keys (`CacheKeys.php`)

All cache keys, TTL constants, and cache tags are centralized in [`app/Shared/Infrastructure/Caching/CacheKeys.php`](file:///home/ibrahim-elshishtawy/flutter%20project/gouna-lifestyle-platform/GouNow%20web/app/Shared/Infrastructure/Caching/CacheKeys.php). Hardcoded cache strings in controllers are strictly prohibited.

```php
class CacheKeys
{
    public const TTL_STATIC = 86400;      // 24 hours (Locations, Categories, Amenities)
    public const TTL_CATALOG = 3600;      // 1 hour (Featured items, homepage hero)
    public const TTL_DYNAMIC = 900;       // 15 minutes (Monthly calendars)
    public const TTL_VOLATILE = 120;      // 2 minutes (Real-time availability hints)

    public const TAG_PROPERTIES = 'properties';
    public const TAG_METADATA = 'metadata';
    public const TAG_CALENDAR = 'calendar';
}
```

---

## 3. Cache Tiering & Strategies

| Tier | Data Type | Key Pattern | TTL | Invalidation Trigger |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 1: Metadata** | Locations, Categories, Amenities | `metadata:locations`, `metadata:categories` | 24 Hours | Admin updates/deletes a location or category. |
| **Tier 2: Catalog Lookups** | Homepage featured properties, curated yacht experiences | `catalog:featured_properties`, `catalog:home_sections` | 1 Hour | Admin changes featured flags or updates listing. |
| **Tier 3: Property Details** | Full property attributes, images, amenities | `property:{id}:details` | 1 Hour | Property updated or published status changed. |
| **Tier 4: Availability Calendars** | Monthly blocked/booked date ranges | `property:{id}:calendar:{year}:{month}` | 15 Mins | `BookingConfirmed`, `BookingCancelled`, or `AvailabilityBlockCreated`. |

---

## 4. Cache Invalidation Strategy

GouNow follows an **Event-Driven Cache Invalidation** pattern. When a mutation occurs:

### A. Tagged Invalidation
When using Redis as the cache driver, tagged caching allows invalidating an entire domain slice at once:
```php
Cache::tags([CacheKeys::TAG_PROPERTIES])->flush();
```

### B. Granular Key Invalidation
When a booking is confirmed or cancelled, only the affected property's calendar keys are purged:
```php
public function handle(BookingConfirmed $event): void
{
    $propertyId = $event->booking->bookable_id;
    
    // Purge specific monthly calendar caches for the stay window
    $checkIn = Carbon::parse($event->booking->check_in);
    $checkOut = Carbon::parse($event->booking->check_out);
    
    for ($date = $checkIn->copy(); $date->lte($checkOut); $date->addMonth()) {
        Cache::forget(CacheKeys::propertyCalendar($propertyId, $date->year, $date->month));
    }
}
```

---

## 5. Cache Stampede Protection

To prevent hundreds of concurrent requests from hammering the database when a popular property's cache expires during a campaign:
1. `Cache::flexible()` or atomic locks (`Cache::lock`) are used for expensive aggregations.
2. Background cache warmers pre-populate common search queries on deployment or configuration changes.
