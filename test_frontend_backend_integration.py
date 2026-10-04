#!/usr/bin/env python3
"""
Comprehensive Integration & Security Test Suite for GouNow Platform
Phase 14: Next.js Frontend <-> Laravel Backend Full Integration Verification
"""

import sys
import json
import time
import uuid
import urllib.request
import urllib.error
import urllib.parse

BASE_URL = "http://127.0.0.1:8000/api/v1"
ORIGIN = "http://localhost:3000"

results = []

def record_test(name: str, passed: bool, evidence: str):
    status = "PASS" if passed else "FAIL"
    print(f"[{status}] {name}")
    if not passed:
        print(f"       Evidence: {evidence}")
    results.append({"name": name, "passed": passed, "evidence": evidence})

def make_request(path: str, method="GET", data=None, headers=None):
    url = f"{BASE_URL}/{path.lstrip('/')}"
    req_headers = {
        "Accept": "application/json",
        "Origin": ORIGIN,
    }
    if headers:
        req_headers.update(headers)
    
    encoded_data = None
    if data is not None:
        if isinstance(data, dict):
            encoded_data = json.dumps(data).encode("utf-8")
            req_headers["Content-Type"] = "application/json"
        elif isinstance(data, bytes):
            encoded_data = data

    req = urllib.request.Request(url, data=encoded_data, headers=req_headers, method=method)
    
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            body = resp.read().decode("utf-8")
            try:
                json_body = json.loads(body)
            except Exception:
                json_body = body
            return resp.status, resp.headers, json_body
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            json_body = json.loads(body)
        except Exception:
            json_body = body
        return e.code, e.headers, json_body
    except Exception as e:
        return 0, {}, str(e)


print("=" * 70)
print("PHASE 14 — NEXT.JS <-> LARAVEL BACKEND INTEGRATION TEST SUITE")
print("=" * 70)

# 1. Public Catalog: Stays
status, headers, body = make_request("/stays")
passed = status == 200 and isinstance(body, dict) and "data" in body and len(body["data"]) > 0
record_test(
    "Public API: Stays Listing (JSON:API format)",
    passed,
    f"Status {status}, count={len(body.get('data', [])) if isinstance(body, dict) else 0}"
)

# Extract first stay slug
slug = None
if passed and len(body["data"]) > 0:
    slug = body["data"][0].get("attributes", {}).get("slug")

# 2. Public Detail: Stay by Slug
if slug:
    status, headers, body = make_request(f"/stays/{slug}?include=category,location,amenities,media")
    passed = status == 200 and body.get("data", {}).get("attributes", {}).get("slug") == slug
    record_test(
        f"Public API: Stay Detail with Relationships ({slug})",
        passed,
        f"Status {status}, title={body.get('data', {}).get('attributes', {}).get('title') if isinstance(body, dict) else 'N/A'}"
    )

# 3. Public Catalog: Experiences
status, headers, body = make_request("/experiences")
passed = status == 200 and isinstance(body, dict) and "data" in body
record_test(
    "Public API: Experiences Catalog",
    passed,
    f"Status {status}, count={len(body.get('data', [])) if isinstance(body, dict) else 0}"
)

# 4. Public Catalog: Events
status, headers, body = make_request("/events")
passed = status == 200 and isinstance(body, dict) and "data" in body
record_test(
    "Public API: Events Catalog",
    passed,
    f"Status {status}, count={len(body.get('data', [])) if isinstance(body, dict) else 0}"
)

# 5. Quote Calculation
quote_payload = {
    "property_id": 46,
    "check_in": "2026-11-15",
    "check_out": "2026-11-19",
    "guests": 2
}
status, headers, body = make_request("/checkout/quote", method="POST", data=quote_payload)
passed = status == 200 and body.get("data", {}).get("attributes", {}).get("pricing", {}).get("total_cents", 0) > 0
record_test(
    "Booking Engine: Authoritative Quote Calculation",
    passed,
    f"Status {status}, Total={body.get('data', {}).get('attributes', {}).get('pricing', {}).get('total_cents') if isinstance(body, dict) else 'N/A'} cents"
)

# 6. Anti-Tampering: Client-injected Price Rejected
tampered_payload = {
    "property_id": 46,
    "check_in": "2026-11-15",
    "check_out": "2026-11-19",
    "guests": 2,
    "total": 100,
    "total_cents": 10000
}
status, headers, body = make_request("/checkout/quote", method="POST", data=tampered_payload)
passed = status == 422
record_test(
    "Security Defense: Client Price Tampering Rejected (422)",
    passed,
    f"Status {status}, body={body}"
)

# 7. Booking Creation with Idempotency Key
idem_key = f"e2e-test-{uuid.uuid4()}"
booking_payload = {
    "property_id": 46,
    "check_in": "2026-11-25",
    "check_out": "2026-11-28",
    "guests": 2,
    "first_name": "Integration",
    "last_name": "Tester",
    "email": "e2e_tester@gounow.com",
    "phone": "+201000000999",
    "payment_method": "cash"
}
status, headers, body = make_request(
    "/checkout/bookings",
    method="POST",
    data=booking_payload,
    headers={"Idempotency-Key": idem_key}
)
booking_ref = body.get("data", {}).get("attributes", {}).get("reference") if isinstance(body, dict) else None
access_token = body.get("meta", {}).get("access_token") if isinstance(body, dict) else None
passed = status == 201 and booking_ref is not None and access_token is not None
record_test(
    "Booking Engine: Create Booking with Server Pricing & Token",
    passed,
    f"Status {status}, Ref={booking_ref}"
)

# 8. Idempotency Verification: Resubmission with same key returns identical booking
if booking_ref:
    status2, headers2, body2 = make_request(
        "/checkout/bookings",
        method="POST",
        data=booking_payload,
        headers={"Idempotency-Key": idem_key}
    )
    ref2 = body2.get("data", {}).get("attributes", {}).get("reference") if isinstance(body2, dict) else None
    passed = (status2 in (200, 201)) and ref2 == booking_ref
    record_test(
        "Booking Engine: Idempotent Submission Protection",
        passed,
        f"Status {status2}, Identical Ref={ref2}"
    )

# 9. Booking Show Authorization & IDOR Defense
if booking_ref and access_token:
    # Authorized with token
    status, headers, body = make_request(f"/checkout/bookings/{booking_ref}?token={access_token}")
    passed = status == 200 and body.get("data", {}).get("attributes", {}).get("reference") == booking_ref
    record_test(
        "Booking Show: Token-Authorized Access",
        passed,
        f"Status {status}"
    )

    # Unauthorized without token
    status_unauth, _, _ = make_request(f"/checkout/bookings/{booking_ref}")
    passed = status_unauth == 404
    record_test(
        "Security Defense: IDOR Protection on Booking Show (404 without token)",
        passed,
        f"Status {status_unauth} (Expected 404)"
    )

# 10. Leads & Concierge Inquiries
lead_payload = {
    "name": "Concierge Client",
    "email": "concierge_client@example.com",
    "phone": "+201011112222",
    "message": "Need airport transfer and yacht charter reservation.",
    "type": "concierge"
}
status, headers, body = make_request("/leads", method="POST", data=lead_payload)
passed = status == 201 and isinstance(body, dict) and "data" in body and body["data"].get("id") is not None
record_test(
    "Public API: Store Concierge Lead Inquiry",
    passed,
    f"Status {status}, Lead ID={body.get('data', {}).get('id') if isinstance(body, dict) else 'N/A'}"
)

# 11. Authentication: Valid Login
login_payload = {
    "email": "admin@gounow.com",
    "password": "GouNow@2026!Secure",
    "token": True
}
status, headers, body = make_request("/auth/login", method="POST", data=login_payload)
auth_token = body.get("data", {}).get("token") if isinstance(body, dict) else None
user_id = body.get("data", {}).get("user", {}).get("id") if isinstance(body, dict) else None
passed = status == 200 and auth_token is not None and user_id is not None
record_test(
    "Authentication: Admin Login & Personal Access Token Issuance",
    passed,
    f"Status {status}, UserID={user_id}, Token={auth_token[:15] if auth_token else 'None'}..."
)

# 12. Authenticated Profile & Abilities
if auth_token:
    status, headers, body = make_request("/me", headers={"Authorization": f"Bearer {auth_token}"})
    abilities = body.get("data", {}).get("abilities", []) if isinstance(body, dict) else []
    is_admin = body.get("data", {}).get("is_admin", False) if isinstance(body, dict) else False
    passed = status == 200 and is_admin is True and ("*" in abilities or len(abilities) > 0)
    record_test(
        "Authentication: /me Profile & Resolved Abilities",
        passed,
        f"Status {status}, is_admin={is_admin}, abilities={abilities}"
    )

# 13. Customer Bookings Protected Endpoint
if auth_token:
    status, headers, body = make_request("/customer/bookings", headers={"Authorization": f"Bearer {auth_token}"})
    passed = status == 200 and isinstance(body, dict) and "data" in body
    record_test(
        "Protected Resource: Customer Bookings Listing with Pagination",
        passed,
        f"Status {status}, meta={body.get('meta') if isinstance(body, dict) else 'N/A'}"
    )

# 14. Unauthorized Rejection (401)
status_guest, _, _ = make_request("/me")
passed = status_guest == 401
record_test(
    "Security Defense: Protected Route Rejects Unauthenticated Guest (401)",
    passed,
    f"Status {status_guest} (Expected 401)"
)

# 15. Authentication: Logout & Token Revocation
if auth_token:
    status, headers, body = make_request("/auth/logout", method="POST", headers={"Authorization": f"Bearer {auth_token}"})
    passed = status == 200
    record_test(
        "Authentication: Logout & Revoke Session Token",
        passed,
        f"Status {status}"
    )

    # Verify token is now invalid (401)
    status_revoked, _, _ = make_request("/me", headers={"Authorization": f"Bearer {auth_token}"})
    passed = status_revoked == 401
    record_test(
        "Security Defense: Revoked Token Strictly Rejected (401)",
        passed,
        f"Status {status_revoked} (Expected 401)"
    )

# 16. CORS Configuration & Preflight
options_req = urllib.request.Request(
    f"{BASE_URL}/stays",
    headers={
        "Origin": ORIGIN,
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type,Authorization,X-Request-ID,Idempotency-Key",
    },
    method="OPTIONS"
)
try:
    with urllib.request.urlopen(options_req, timeout=5) as resp:
        cors_origin = resp.headers.get("Access-Control-Allow-Origin")
        cors_creds = resp.headers.get("Access-Control-Allow-Credentials")
        passed = (cors_origin == ORIGIN) and (cors_creds == "true")
        record_test(
            "CORS: Explicit Origin & Credentials Whitelist",
            passed,
            f"Status {resp.status}, Origin={cors_origin}, Credentials={cors_creds}"
        )
except Exception as e:
    record_test("CORS: Explicit Origin & Credentials Whitelist", False, str(e))

# Summary
total = len(results)
passed_count = sum(1 for r in results if r["passed"])
failed_count = total - passed_count

print("=" * 70)
print(f"INTEGRATION TEST SUMMARY: {passed_count}/{total} PASSED, {failed_count} FAILED")
print("=" * 70)

if failed_count > 0:
    sys.exit(1)
sys.exit(0)
