# Data Models & Database Mapping Guide

This directory contains the Eloquent models representing GouNow's persistent database layer. To keep the architecture clean and maintainable, models are mapped to their respective business domains:

---

## 1. Domain Grouping of Models

### A. Properties & Vacation Stays (`Property` Domain)
| Model | Database Table | Role & Key Relations |
| :--- | :--- | :--- |
| [`Property`](file:///home/ibrahim-elshishtawy/flutter%20project/gouna-lifestyle-platform/GouNow%20web/app/Models/Property.php) | `properties` | Core entity for vacation stays and for-sale real estate. Has many `images`, `seasonalPrices`, `bookings`, `availabilityBlocks`. Belongs to `category`, `location`. |
| [`PropertyCategory`](file:///home/ibrahim-elshishtawy/flutter%20project/gouna-lifestyle-platform/GouNow%20web/app/Models/PropertyCategory.php) | `property_categories` | Categories (e.g. Waterfront Villas, Lagoon Apartments). |
| [`Location`](file:///home/ibrahim-elshishtawy/flutter%20project/gouna-lifestyle-platform/GouNow%20web/app/Models/Location.php) | `locations` | El Gouna neighborhoods (Marina, Abu Tig, Fanadir, Golf). |
| [`Amenity`](file:///home/ibrahim-elshishtawy/flutter%20project/gouna-lifestyle-platform/GouNow%20web/app/Models/Amenity.php) | `amenities` | Features (Private Pool, Beach Access, High-speed Wi-Fi). |

---

### B. Pricing & Availability (`Pricing` & `Availability` Domains)
| Model | Database Table | Role & Key Relations |
| :--- | :--- | :--- |
| [`SeasonalPrice`](file:///home/ibrahim-elshishtawy/flutter%20project/gouna-lifestyle-platform/GouNow%20web/app/Models/SeasonalPrice.php) | `seasonal_prices` | Overrides base price and minimum stay for date windows with an assigned `priority`. |
| [`AvailabilityBlock`](file:///home/ibrahim-elshishtawy/flutter%20project/gouna-lifestyle-platform/GouNow%20web/app/Models/AvailabilityBlock.php) | `availability_blocks` | Blackout ranges (owner stays, maintenance, renovations). |
| [`Fee`](file:///home/ibrahim-elshishtawy/flutter%20project/gouna-lifestyle-platform/GouNow%20web/app/Models/Fee.php) | `fees` | Fixed and percentage service fees or cleaning charges. |
| [`Discount`](file:///home/ibrahim-elshishtawy/flutter%20project/gouna-lifestyle-platform/GouNow%20web/app/Models/Discount.php) | `promo_codes` | Promo codes, max usages, percentage or fixed discounts. |
| [`DiscountUsage`](file:///home/ibrahim-elshishtawy/flutter%20project/gouna-lifestyle-platform/GouNow%20web/app/Models/DiscountUsage.php) | `promo_code_usages` | Logs each time a promo code is consumed by a booking. |

---

### C. Booking & Payments (`Booking` & `Payment` Domains)
| Model | Database Table | Role & Key Relations |
| :--- | :--- | :--- |
| [`Booking`](file:///home/ibrahim-elshishtawy/flutter%20project/gouna-lifestyle-platform/GouNow%20web/app/Models/Booking.php) | `bookings` | Central reservation record. Has polymorphic `bookable`, belongs to `customer`, has many `transactions`, `nightlyPrices`. |
| [`BookingNightlyPrice`](file:///home/ibrahim-elshishtawy/flutter%20project/gouna-lifestyle-platform/GouNow%20web/app/Models/BookingNightlyPrice.php) | `booking_nightly_prices` | Itemized audit log of each night's rate at booking time. |
| [`PaymentTransaction`](file:///home/ibrahim-elshishtawy/flutter%20project/gouna-lifestyle-platform/GouNow%20web/app/Models/PaymentTransaction.php) | `payment_transactions` | Audit log of card 3DS attempts, webhooks, cash receipts. |
| [`PaymentMethod`](file:///home/ibrahim-elshishtawy/flutter%20project/gouna-lifestyle-platform/GouNow%20web/app/Models/PaymentMethod.php) | `payment_methods` | Supported gateways and checkout payment options. |

---

### D. Experiences & Events (`Experience` & `Event` Domains)
| Model | Database Table | Role & Key Relations |
| :--- | :--- | :--- |
| [`Experience`](file:///home/ibrahim-elshishtawy/flutter%20project/gouna-lifestyle-platform/GouNow%20web/app/Models/Experience.php) | `experiences` | Yacht cruises, desert safaris, kitesurfing, private dining. |
| [`ExperienceCategory`](file:///home/ibrahim-elshishtawy/flutter%20project/gouna-lifestyle-platform/GouNow%20web/app/Models/ExperienceCategory.php) | `experience_categories` | Water sports, Boat trips, Desert, Luxury. |
| [`Event`](file:///home/ibrahim-elshishtawy/flutter%20project/gouna-lifestyle-platform/GouNow%20web/app/Models/Event.php) | `events` | Festivals, concerts, beach parties. Has many `ticketTypes`. |
| [`EventTicketType`](file:///home/ibrahim-elshishtawy/flutter%20project/gouna-lifestyle-platform/GouNow%20web/app/Models/EventTicketType.php) | `event_ticket_types` | Tier pricing (Early Bird, VIP, Backstage). |
| [`EventOrder`](file:///home/ibrahim-elshishtawy/flutter%20project/gouna-lifestyle-platform/GouNow%20web/app/Models/EventOrder.php) | `event_orders` | Order header for ticket purchases. |
| [`EventTicket`](file:///home/ibrahim-elshishtawy/flutter%20project/gouna-lifestyle-platform/GouNow%20web/app/Models/EventTicket.php) | `event_tickets` | Individual scannable QR tickets issued to guests. |
| [`TicketScan`](file:///home/ibrahim-elshishtawy/flutter%20project/gouna-lifestyle-platform/GouNow%20web/app/Models/TicketScan.php) | `ticket_scans` | Access control audit log when ticket is scanned at door. |

---

### E. Customers & Leads (`Customer` & `Lead` Domains)
| Model | Database Table | Role & Key Relations |
| :--- | :--- | :--- |
| [`Customer`](file:///home/ibrahim-elshishtawy/flutter%20project/gouna-lifestyle-platform/GouNow%20web/app/Models/Customer.php) | `customers` | Profile of booking guests with contact info. |
| [`Lead`](file:///home/ibrahim-elshishtawy/flutter%20project/gouna-lifestyle-platform/GouNow%20web/app/Models/Lead.php) | `leads` | Inquiries from homepage concierge, property viewings, experience booking requests. |

---

### F. CMS, Media & System
| Model | Database Table | Role & Key Relations |
| :--- | :--- | :--- |
| [`Media`](file:///home/ibrahim-elshishtawy/flutter%20project/gouna-lifestyle-platform/GouNow%20web/app/Models/Media.php) | `media` | Polymorphic image attachment for properties, experiences, events. |
| [`Page`](file:///home/ibrahim-elshishtawy/flutter%20project/gouna-lifestyle-platform/GouNow%20web/app/Models/Page.php) | `pages` | Static legal & editorial pages (About, Terms, Privacy). |
| [`HomepageSection`](file:///home/ibrahim-elshishtawy/flutter%20project/gouna-lifestyle-platform/GouNow%20web/app/Models/HomepageSection.php) | `homepage_sections` | Manageable homepage blocks (Hero, Highlights, Reviews). |
| [`User`](file:///home/ibrahim-elshishtawy/flutter%20project/gouna-lifestyle-platform/GouNow%20web/app/Models/User.php) | `users` | Admin staff and managers with RBAC permissions. |
| [`Role`](file:///home/ibrahim-elshishtawy/flutter%20project/gouna-lifestyle-platform/GouNow%20web/app/Models/Role.php) | `roles` | RBAC roles (`super_admin`, `manager`, `agent`). |
| [`Permission`](file:///home/ibrahim-elshishtawy/flutter%20project/gouna-lifestyle-platform/GouNow%20web/app/Models/Permission.php) | `permissions` | Granular permission keys. |
| [`ActivityLog`](file:///home/ibrahim-elshishtawy/flutter%20project/gouna-lifestyle-platform/GouNow%20web/app/Models/ActivityLog.php) | `activity_logs` | Audit trail of administrative actions. |
