#!/usr/bin/env python3
"""
Master Admin API & RBAC Integration Test Suite
Verifies all newly mounted /api/v1/admin/* endpoints, role checks, and pagination
"""

import sys
import json
import urllib.request
import urllib.error

BASE_URL = "http://127.0.0.1:8000/api/v1"

passed_count = 0
failed_count = 0

def record_test(name: str, passed: bool, evidence: str = ""):
    global passed_count, failed_count
    if passed:
        passed_count += 1
        print(f"[PASS] {name}")
    else:
        failed_count += 1
        print(f"[FAIL] {name} - Evidence: {evidence}")

def request_api(endpoint: str, method="GET", data=None, token=None):
    url = f"{BASE_URL}/{endpoint.lstrip('/')}"
    headers = {"Accept": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    encoded_data = None
    if data is not None:
        headers["Content-Type"] = "application/json"
        encoded_data = json.dumps(data).encode("utf-8")
        
    req = urllib.request.Request(url, data=encoded_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            body = json.loads(resp.read().decode("utf-8"))
            return resp.status, body
    except urllib.error.HTTPError as e:
        try:
            body = json.loads(e.read().decode("utf-8"))
        except Exception:
            body = None
        return e.code, body

print("=" * 65)
print("GOUNOW MASTER ADMIN API & RBAC TEST SUITE")
print("=" * 65)

# 1. Unauthenticated access to /admin/ping must be 401
s, b = request_api("/admin/ping")
record_test("Security: Unauthenticated Guest Rejected on /admin/ping (401)", s == 401, f"Status={s}")

# 2. Login Super Admin
s, b = request_api("/auth/login", method="POST", data={
    "email": "superadmin@gounow.com",
    "password": "SuperAdmin@2026!",
    "token": True
})
token = b.get("data", {}).get("token") if b else None
record_test("Auth: Super Admin Login & Token Issuance", s == 200 and token is not None, f"Status={s}")

if not token:
    print("FATAL: Could not obtain admin token. Exiting.")
    sys.exit(1)

# 3. Admin Ping
s, b = request_api("/admin/ping", token=token)
record_test("Admin Ping: Authenticated & Authorized", s == 200 and b.get("status") == "admin_authenticated", f"Status={s}")

# 4. Admin Dashboard KPIs
s, b = request_api("/admin/dashboard", token=token)
kpis = b.get("data", {}).get("kpis", {}) if b else {}
record_test("Admin Dashboard: Live KPIs & Metrics Retrieved", s == 200 and "totalBookings" in kpis and "totalProperties" in kpis, f"Status={s}")

# 5. Admin Bookings
s, b = request_api("/admin/bookings", token=token)
bookings = b.get("data", []) if b else []
meta = b.get("meta", {}) if b else {}
record_test("Admin Bookings: Paginated List Retrieved", s == 200 and "current_page" in meta, f"Status={s}")

# 6. Admin Staff & Roles
s, b = request_api("/admin/users", token=token)
staff = b.get("data", {}).get("staff", []) if b else []
roles = b.get("data", {}).get("roles", []) if b else []
record_test("Admin Staff: Active Staff & System Roles Retrieved", s == 200 and len(staff) > 0 and len(roles) > 0, f"Status={s}")

# 7. Admin VIP Concierge & Leads
s, b = request_api("/admin/concierge", token=token)
leads = b.get("data", []) if b else []
record_test("Admin Concierge: Inquiries & Leads Retrieved", s == 200 and isinstance(leads, list), f"Status={s}")

# 8. Admin Finances & Transactions
s, b = request_api("/admin/finances", token=token)
record_test("Admin Finances: Transaction Ledger Retrieved", s == 200, f"Status={s}")

# 9. Admin Finance Summary
s, b = request_api("/admin/finances/summary", token=token)
summary = b.get("data", {}) if b else {}
record_test("Admin Finance Summary: Revenue Breakdown Retrieved", s == 200 and "totalRevenueCents" in summary, f"Status={s}")

# 10. Admin Customers CRM
s, b = request_api("/admin/customers", token=token)
customers = b.get("data", []) if b else []
record_test("Admin Customers: CRM Roster & Spending Retrieved", s == 200 and isinstance(customers, list), f"Status={s}")

# 11. Admin Platform Settings
s, b = request_api("/admin/settings", token=token)
record_test("Admin Settings: Key-Value Config Retrieved", s == 200, f"Status={s}")

# 12. Admin Audit Logs
s, b = request_api("/admin/audit-logs", token=token)
logs = b.get("data", []) if b else []
record_test("Admin Audit: Security Activity Timeline Retrieved", s == 200 and isinstance(logs, list), f"Status={s}")

# 13. Admin Properties List & Counters
s, b = request_api("/admin/properties", token=token)
props_list = b.get("data", []) if b else []
props_summary = b.get("summary", {}) if b else {}
record_test("Admin Properties: Complete Inventory & Counters Retrieved", s == 200 and len(props_list) > 0 and "total" in props_summary, f"Status={s}, Count={len(props_list)}")

# 14. Admin Property Display Status Toggle (Pause & Activate)
if len(props_list) > 0:
    prop_id = props_list[0]["id"]
    s_toggle, b_toggle = request_api(f"/admin/properties/{prop_id}/toggle-status", method="PATCH", data={}, token=token)
    new_status = b_toggle.get("data", {}).get("status") if b_toggle else None
    new_published = b_toggle.get("data", {}).get("is_published") if b_toggle else None
    record_test("Admin Properties: Toggle Display Status (Pause)", s_toggle == 200 and new_published is False and new_status == "draft", f"Status={s_toggle}, NewStatus={new_status}, Published={new_published}")
    
    # Toggle back to original active state
    s_toggle2, b_toggle2 = request_api(f"/admin/properties/{prop_id}/toggle-status", method="PATCH", data={}, token=token)
    restored_status = b_toggle2.get("data", {}).get("status") if b_toggle2 else None
    restored_published = b_toggle2.get("data", {}).get("is_published") if b_toggle2 else None
    record_test("Admin Properties: Toggle Display Status (Restore Active)", s_toggle2 == 200 and restored_published is True and restored_status == "published", f"Status={s_toggle2}, RestoredStatus={restored_status}")

# 15. Admin Media Design Homepage CMS
s, b = request_api("/admin/media-design", token=token)
media_data = b.get("data", {}) if b else {}
media_cfg = media_data.get("config", {})
avail_props = media_data.get("available_properties", [])
record_test("Admin Media Design: Homepage CMS Config & Units Retrieved", s == 200 and "hero" in media_cfg and len(avail_props) > 0, f"Status={s}, AvailableProps={len(avail_props)}")

# 16. Admin Media Design Config Update
if media_cfg:
    # Update announcement text
    updated_cfg = dict(media_cfg)
    updated_cfg["announcement"]["text_ar"] = "موسم مهرجان الجونة 2026 - باقات حصرية للإقامات الخاصة"
    s_update, b_update = request_api("/admin/media-design", method="PUT", data=updated_cfg, token=token)
    record_test("Admin Media Design: Update Homepage Configuration", s_update == 200 and b_update.get("success") is True, f"Status={s_update}")

# 17. Public Media Design Settings Endpoint
s_pub, b_pub = request_api("/settings/media-design")
pub_data = b_pub.get("data", {}) if b_pub else {}
record_test("Public Settings: Media Design Configuration Served", s_pub == 200 and "hero" in pub_data and "sections" in pub_data, f"Status={s_pub}")

print("=" * 65)
print(f"TEST SUMMARY: {passed_count} PASSED, {failed_count} FAILED")
print("=" * 65)

sys.exit(0 if failed_count == 0 else 1)
