# Pricing Module

## 1. Purpose
The **Pricing Module** resolves nightly rates, seasonal price rules, minimum stay constraints, cleaning fees, service charges, and promotional discounts. It guarantees that calculations are deterministic, currency-safe, and independent of external state.

---

## 2. Directory Structure
```
app/Modules/Pricing/
├── Application/
│   ├── Queries/
│   │   ├── CalculateBookingQuoteQuery.php      # Resolves full stay pricing breakdown
│   │   ├── AnalyzeSeasonalOverlapQuery.php     # Detects priority conflicts across seasons
│   │   └── GetMonthlyPricingCalendarQuery.php  # Generates day-by-day rates for calendar UI
│   └── DTOs/
│       ├── PricingQuoteDTO.php                 # Complete breakdown with subtotal, fees & deposit
│       └── NightlyBreakdownDTO.php             # Individual date, price, and active rule name
└── Domain/
    └── ValueObjects/
        └── NightlyRate.php                     # Immutable rate for a single night
```

---

## 3. Business Rules Implemented
1. **Hotel Date Rule:** The check-out night is **never** charged. A stay from Oct 1 to Oct 4 comprises 3 charged nights (Oct 1, Oct 2, Oct 3).
2. **Seasonal Priority Resolution:** When multiple seasonal price rules cover the same date, the rule with the highest `priority` value wins.
3. **Minimum Stay Overrides:** A seasonal rule can increase the required minimum stay beyond the property's default `min_stay_nights`.
4. **Currency Safety:** All computations run in integer cents (`Money` VO) to avoid floating-point rounding errors.
