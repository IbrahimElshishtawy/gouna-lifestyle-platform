# Availability Module

## 1. Purpose
The **Availability Module** governs the availability of bookable entities (properties, yachts, experiences). It ensures accurate calendar occupancy reporting, enforces changeover turnover rules, and provides pessimistic concurrency row-locking to prevent race conditions during simultaneous checkout attempts.

---

## 2. Directory Structure
```
app/Modules/Availability/
├── Application/
│   ├── Actions/
│   │   ├── LockAndValidateAvailabilityAction.php  # Locks property & throws if dates are booked
│   │   └── CreateAvailabilityBlockAction.php      # Inserts owner/maintenance blackout dates
│   ├── Queries/
│   │   ├── CheckPropertyAvailabilityQuery.php     # Evaluates if a single property is free
│   │   ├── FilterAvailablePropertiesQuery.php     # Batch-filters properties for catalog search
│   │   └── GetUnavailableDatesQuery.php           # Returns array of booked/blocked dates for UI
│   └── DTOs/
│       └── AvailabilityCheckResultDTO.php         # Result with boolean status & conflict dates
└── Domain/
    └── Exceptions/
        └── BookingUnavailableException.php        # Thrown when dates conflict
```

---

## 3. Concurrency & Turnover Rules
1. **Hotel Changeover Turnover Rule:** A departure and an arrival occurring on the same date do **not** conflict (`existing.check_out == requested.check_in` is permitted because the previous guest checks out at 11:00 AM and the incoming guest checks in at 3:00 PM).
2. **Pessimistic Locking:** `LockAndValidateAvailabilityAction` acquires `SELECT id FROM properties WHERE id = :id FOR UPDATE` inside a database transaction, guaranteeing that concurrent reservation attempts are queued and evaluated sequentially.
3. **Batch Filtering (`FilterAvailablePropertiesQuery`):** Replaces $N$ individual availability queries during catalog browsing with two set-based SQL queries, eliminating the classic N+1 database bottleneck.
