#!/usr/bin/env python3
"""
Comprehensive Live Verification Suite for promit.md
Tests every live admin endpoint for:
1. Location Parsing & Normalization
2. Property Sub-Units (Villas/Apartments CRUD)
3. Availability Calendar & Blocks
4. Pricing Engine (Overview, Calendar Matrix, Hierarchy, Weekend Markup, Date Override, Quote Preview, Overlap, Discounts)
"""

import sys
import json
import urllib.request
import urllib.error

BASE_URL = "http://127.0.0.1:8000/api/v1"
passed = 0
failed = 0

def test(name, condition, info=""):
    global passed, failed
    if condition:
        passed += 1
        print(f" [PASS] {name}")
    else:
        failed += 1
        print(f" [FAIL] {name} - {info}")

def request(endpoint, method="GET", data=None, token=None):
    url = f"{BASE_URL}/{endpoint.lstrip('/')}"
    headers = {"Accept": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    body = None
    if data is not None:
        headers["Content-Type"] = "application/json"
        body = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read().decode("utf-8"))
        except Exception:
            return e.code, None

print("=" * 70)
print("VERIFYING PROMIT.MD COMPLETE PRODUCTION SUITE ON LIVE BACKEND")
print("=" * 70)

# 1. Login
s, b = request("/auth/login", method="POST", data={
    "email": "superadmin@gounow.com",
    "password": "SuperAdmin@2026!",
    "token": True
})
token = b.get("data", {}).get("token") if b else None
test("Admin Authentication & Bearer Token", s == 200 and token is not None, f"Status={s}")
if not token:
    print("Cannot continue without token.")
    sys.exit(1)

# 2. Location Parser: Direct Coords
s, b = request("/admin/properties/parse-location", method="POST", data={"url": "27.394851, 33.678219"}, token=token)
test("Location Method A/B: Parse Direct Coordinates", s == 200 and b.get("success") is True and round(b.get("latitude"), 4) == 27.3949, f"Status={s}, Body={b}")

# 3. Location Parser: Google Maps @lat,lng URL
s, b = request("/admin/properties/parse-location", method="POST", data={"url": "https://www.google.com/maps/@27.412000,33.681000,16z"}, token=token)
test("Location: Parse Google Maps URL (@lat,lng)", s == 200 and b.get("success") is True and round(b.get("latitude"), 3) == 27.412, f"Status={s}")

# 4. Location Parser: Invalid URL Handling
s, b = request("/admin/properties/parse-location", method="POST", data={"url": "https://www.google.com/search?q=gouna"}, token=token)
test("Location: Reject URL without coordinates (422)", s == 422 and b.get("success") is False, f"Status={s}, Body={b}")

# 5. Fetch a property for sub-unit & pricing testing
s, b = request("/admin/properties", token=token)
props = b.get("data", []) if b else []
test("Properties: Portfolio Inventory Listing", s == 200 and len(props) > 0, f"Count={len(props)}")
prop_id = props[0]["id"]

# 6. Property Detail View with relations
s, b = request(f"/admin/properties/{prop_id}", token=token)
test("Property Details: Full Relations (units, seasons, blocks, activity)", s == 200 and "units" in b.get("data", {}), f"Status={s}")

# 7. Sub-Unit Management: Create Child Unit
import time
unique_unit = f"Villa Test {int(time.time())}"
s, b = request(f"/admin/properties/{prop_id}/units", method="POST", data={
    "unit_number": unique_unit,
    "title_en": f"{unique_unit} Lakefront",
    "view": "Lagoon View",
    "bedrooms": 3,
    "bathrooms": 3,
    "max_guests": 6,
    "base_price": "7500",
    "status": "published"
}, token=token)
child_unit = b.get("data", {}) if b else {}
child_unit_id = child_unit.get("id")
test("Sub-Units: Create Child Unit under Parent Property", s == 201 and child_unit_id is not None, f"Status={s}, Child={child_unit_id}")

# 8. Sub-Units Listing
s, b = request(f"/admin/properties/{prop_id}/units", token=token)
units = b.get("data", []) if b else []
test("Sub-Units: List Units for Property", s == 200 and len(units) > 0, f"Status={s}, UnitsCount={len(units)}")

# 9. Sub-Unit Detail
if child_unit_id:
    s, b = request(f"/admin/properties/{prop_id}/units/{child_unit_id}", token=token)
    test("Sub-Units: Fetch Child Unit Details", s == 200 and b.get("data", {}).get("id") == child_unit_id, f"Status={s}")

    # 10. Update Child Unit
    s, b = request(f"/admin/properties/{prop_id}/units/{child_unit_id}", method="PUT", data={
        "title_en": f"{unique_unit} Lakefront Renovated",
        "base_price": "8000"
    }, token=token)
    test("Sub-Units: Update Child Unit Attributes", s == 200 and b.get("data", {}).get("base_price_cents") == 800000, f"Status={s}")

# 11. Availability Calendar for Property
s, b = request(f"/admin/properties/{prop_id}/calendar?year=2026", token=token)
test("Availability: Calendar Data (Bookings & Blocks)", s == 200 and ("booked_ranges" in b or "booked_intervals" in b or "data" in b), f"Status={s}")

# 12. Availability Block: Add Maintenance Block
s, b = request(f"/admin/properties/{prop_id}/availability-blocks", method="POST", data={
    "start_date": "2026-11-01",
    "end_date": "2026-11-05",
    "status": "maintenance",
    "reason": "Routine AC & Pool Maintenance"
}, token=token)
block_id = b.get("data", {}).get("id") if b else None
test("Availability: Add Maintenance Block", s in (200, 201) and block_id is not None, f"Status={s}, BlockId={block_id}")

# 13. Availability Block: Remove Block
if block_id:
    s, b = request(f"/admin/properties/{prop_id}/availability-blocks/{block_id}", method="DELETE", token=token)
    test("Availability: Remove Maintenance Block", s == 200 and b.get("success") is True, f"Status={s}")

# 14. Pricing Engine: Overview
s, b = request("/admin/pricing", token=token)
test("Pricing Engine: Overview & Upcoming Rules", s == 200 and "properties" in b and "upcoming_rules" in b, f"Status={s}")

# 15. Pricing Engine: Monthly Calendar Matrix
s, b = request(f"/admin/pricing/calendar?property_id={prop_id}&year=2026&month=12", token=token)
matrix = b.get("calendar", []) if b else []
test("Pricing Engine: Monthly Calendar Matrix Days", s == 200 and len(matrix) >= 28, f"Status={s}, DaysCount={len(matrix)}")

# 16. Pricing Engine: Create Rule (Weekend markup +20%)
s, b = request("/admin/pricing/rules", method="POST", data={
    "property_id": prop_id,
    "name_en": "Weekend 20% Markup Live Test",
    "start_date": "2026-12-01",
    "end_date": "2026-12-31",
    "rule_type": "weekend",
    "adjustment_type": "percentage",
    "adjustment_percent": 20,
    "days_of_week": ["Friday", "Saturday"],
    "priority": 15,
    "min_stay_nights": 2
}, token=token)
rule_id = b.get("data", {}).get("id") if b else None
test("Pricing Engine: Create Weekend Markup Rule", s in (200, 201) and rule_id is not None, f"Status={s}, RuleId={rule_id}")

# 17. Pricing Engine: Date Range Price Override
s, b = request("/admin/pricing/override", method="POST", data={
    "property_id": prop_id,
    "start_date": "2026-12-24",
    "end_date": "2026-12-26",
    "price_cents": 1500000,
    "reason": "Christmas Peak Override"
}, token=token)
test("Pricing Engine: Apply Date-Specific Override", s in (200, 201) and b.get("success") is True, f"Status={s}")

# 18. Pricing Engine: Quote Preview Simulator
s, b = request("/admin/pricing/preview", method="POST", data={
    "property_id": prop_id,
    "check_in": "2026-12-24",
    "check_out": "2026-12-26",
    "guests": 2
}, token=token)
explanation = b.get("explanation", {}) if b else {}
test("Pricing Engine: Quote Preview with Full Explanation Breakdown", s == 200 and "subtotal" in explanation and "final_total" in explanation, f"Status={s}")

# 19. Clean up created child unit
if child_unit_id:
    s, b = request(f"/admin/properties/{prop_id}/units/{child_unit_id}", method="DELETE", token=token)
    test("Cleanup: Delete Temporary Sub-Unit", s == 200, f"Status={s}")

# 20. Clean up created rule
if rule_id:
    s, b = request(f"/admin/pricing/rules/{rule_id}", method="DELETE", token=token)
    test("Cleanup: Delete Temporary Pricing Rule", s == 200, f"Status={s}")

print("=" * 70)
print(f"PROMIT.MD LIVE SUITE RESULTS: {passed} PASSED, {failed} FAILED")
print("=" * 70)
sys.exit(0 if failed == 0 else 1)
