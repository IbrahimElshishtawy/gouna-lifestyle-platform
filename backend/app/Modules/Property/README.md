# Property Module

## 1. Purpose
The **Property Module** encapsulates the domain models, specifications, and presentation for vacation rental homes, beachfront villas, and real estate investment listings in El Gouna. It manages room layouts, amenities, base pricing parameters, and publication state.

---

## 2. Directory Structure
```
app/Modules/Property/
├── Domain/
│   └── Models/
│       ├── Property.php            # Core property aggregate (listing types: stay, sale)
│       ├── PropertyCategory.php    # Categories (Villas, Apartments, Penthouses)
│       ├── PropertyLocation.php    # El Gouna neighborhoods (Marina, Abu Tig, Fanadir)
│       └── Amenity.php             # Amenities (Private Pool, Beach Access, Wi-Fi)
├── Application/
│   └── Queries/
│       └── GetFeaturedPropertiesQuery.php  # Caches and retrieves featured listings
└── Infrastructure/
    └── Observers/
        └── PropertyObserver.php    # Flushes catalog cache tags when properties update
```

---

## 3. High-Concurrency Catalog Optimization
1. **Composite Filtering Indexes:** Uses `idx_properties_catalog_filter (status, is_published, listing_type, is_featured)` to avoid file-sorts during catalog queries.
2. **Metadata Caching:** Location and category lists are cached under `CacheKeys::TAG_METADATA` with a 24-hour TTL, saving hundreds of thousands of redundant queries per day.
3. **Decoupled Media:** Property photos are served via CDN/S3 URLs with optimized responsive formats, eliminating application server bandwidth overhead.
