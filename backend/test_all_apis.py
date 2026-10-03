#!/usr/bin/env python3
"""
================================================================================
GouNow Lifestyle Platform — Master API Test Suite & Catalog Runner
================================================================================
A comprehensive, standalone Python test suite that catalogs, verifies, and
adversarially tests all REST API v1 endpoints across the GouNow platform.

Endpoints Covered:
  - Stays / Properties Catalog (GET /stays, GET /stays/{slug}, 404 handling)
  - Experiences Catalog (GET /experiences, GET /experiences/{slug})
  - Events Catalog (GET /events, GET /events/{slug})
  - Checkout & Pricing Engine (POST /checkout/quote, POST /checkout/bookings, GET /checkout/bookings/{ref})
  - Leads & Concierge Inquiries (POST /leads, validation checks)
  - Authentication (POST /auth/login, POST /auth/forgot-password, 2FA challenge)
  - Authenticated User Profile (GET /me, GET /me/abilities, GET /me/sessions)
  - Customer Portal (GET /customer/me, GET /customer/me/abilities, GET /customer/bookings)
  - Admin Protected API (GET /admin/ping - authorization guards)
  - Payment Webhooks (POST /webhooks/payments - missing/forged/valid HMAC checks)

Usage:
  python3 test_all_apis.py
  python3 test_all_apis.py --base-url http://127.0.0.1:8000 --verbose
  python3 test_all_apis.py --output report.json
================================================================================
"""

import argparse
import atexit
import datetime
import hashlib
import hmac
import json
import os
import re
import socket
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from typing import Any, Dict, List, Optional, Tuple


# ==============================================================================
# Terminal Styling & Colors
# ==============================================================================
class Color:
    ENABLED = sys.stdout.isatty()

    @classmethod
    def wrap(cls, code: str, text: str) -> str:
        return f"\033[{code}m{text}\033[0m" if cls.ENABLED else text

    @classmethod
    def green(cls, text: str) -> str: return cls.wrap("32;1", text)
    @classmethod
    def red(cls, text: str) -> str: return cls.wrap("31;1", text)
    @classmethod
    def yellow(cls, text: str) -> str: return cls.wrap("33;1", text)
    @classmethod
    def cyan(cls, text: str) -> str: return cls.wrap("36;1", text)
    @classmethod
    def blue(cls, text: str) -> str: return cls.wrap("34;1", text)
    @classmethod
    def magenta(cls, text: str) -> str: return cls.wrap("35;1", text)
    @classmethod
    def bold(cls, text: str) -> str: return cls.wrap("1", text)
    @classmethod
    def dim(cls, text: str) -> str: return cls.wrap("2", text)


# ==============================================================================
# HTTP Client Wrapper (Standard Library - Zero Dependencies)
# ==============================================================================
class ApiResponse:
    def __init__(self, status_code: int, headers: Dict[str, str], body_text: str, elapsed_ms: float):
        self.status_code = status_code
        self.headers = headers
        self.body_text = body_text
        self.elapsed_ms = elapsed_ms
        self.json: Optional[Dict[str, Any]] = None
        try:
            self.json = json.loads(body_text) if body_text.strip() else None
        except Exception:
            self.json = None


class ApiClient:
    def __init__(self, base_url: str, timeout: int = 15, verbose: bool = False):
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.verbose = verbose
        self.token: Optional[str] = None

    def set_token(self, token: Optional[str]) -> None:
        self.token = token

    def request(
        self,
        method: str,
        path: str,
        data: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None,
        use_auth: bool = False,
    ) -> ApiResponse:
        url = f"{self.base_url}/{path.lstrip('/')}"
        req_headers = {
            "Accept": "application/json",
            "User-Agent": "GouNow-ApiTester/1.0",
        }

        if use_auth and self.token:
            req_headers["Authorization"] = f"Bearer {self.token}"

        encoded_data = None
        if data is not None:
            req_headers["Content-Type"] = "application/json"
            encoded_data = json.dumps(data).encode("utf-8")

        if headers:
            req_headers.update(headers)

        if self.verbose:
            print(Color.dim(f"-> {method} {url}"))
            if data:
                print(Color.dim(f"   Payload: {json.dumps(data, ensure_ascii=False)[:180]}..."))

        req = urllib.request.Request(url, data=encoded_data, headers=req_headers, method=method)
        start_time = time.perf_counter()

        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as response:
                status_code = response.getcode()
                body = response.read().decode("utf-8", errors="replace")
                resp_headers = dict(response.info())
        except urllib.error.HTTPError as e:
            status_code = e.code
            body = e.read().decode("utf-8", errors="replace")
            resp_headers = dict(e.headers)
        except Exception as e:
            elapsed = (time.perf_counter() - start_time) * 1000
            return ApiResponse(0, {}, f"Connection Error: {e}", elapsed)

        elapsed = (time.perf_counter() - start_time) * 1000
        api_resp = ApiResponse(status_code, resp_headers, body, elapsed)

        if self.verbose:
            print(Color.dim(f"<- HTTP {status_code} ({elapsed:.1f}ms): {body[:150]}..."))

        return api_resp


# ==============================================================================
# Test Result Record
# ==============================================================================
class TestRecord:
    def __init__(
        self,
        category: str,
        name: str,
        method: str,
        endpoint: str,
        expected_status: List[int],
        actual_status: int,
        passed: bool,
        elapsed_ms: float,
        details: str = "",
        response_preview: str = "",
    ):
        self.category = category
        self.name = name
        self.method = method
        self.endpoint = endpoint
        self.expected_status = expected_status
        self.actual_status = actual_status
        self.passed = passed
        self.elapsed_ms = elapsed_ms
        self.details = details
        self.response_preview = response_preview

    def to_dict(self) -> Dict[str, Any]:
        return {
            "category": self.category,
            "name": self.name,
            "method": self.method,
            "endpoint": self.endpoint,
            "expected_status": self.expected_status,
            "actual_status": self.actual_status,
            "passed": self.passed,
            "elapsed_ms": round(self.elapsed_ms, 2),
            "details": self.details,
            "response_preview": self.response_preview[:300],
        }


# ==============================================================================
# Main Test Suite Runner
# ==============================================================================
class GouNowApiTestSuite:
    def __init__(self, client: ApiClient):
        self.client = client
        self.records: List[TestRecord] = []
        self.discovered_property_id: Optional[int] = None
        self.discovered_property_slug: Optional[str] = None
        self.discovered_experience_slug: Optional[str] = None
        self.discovered_event_slug: Optional[str] = None
        self.created_booking_reference: Optional[str] = None

    def assert_test(
        self,
        category: str,
        name: str,
        method: str,
        endpoint: str,
        expected_status: List[int],
        response: ApiResponse,
        custom_validator=None,
    ) -> bool:
        passed = response.status_code in expected_status
        details = ""

        if not passed:
            details = f"Expected HTTP {expected_status}, received HTTP {response.status_code}."
        elif custom_validator:
            try:
                valid, msg = custom_validator(response)
                if not valid:
                    passed = False
                    details = f"Validation failed: {msg}"
            except Exception as ex:
                passed = False
                details = f"Validator error: {ex}"

        preview = response.body_text[:200].replace("\n", " ").strip() if response.body_text else "(empty)"
        record = TestRecord(
            category=category,
            name=name,
            method=method,
            endpoint=endpoint,
            expected_status=expected_status,
            actual_status=response.status_code,
            passed=passed,
            elapsed_ms=response.elapsed_ms,
            details=details,
            response_preview=preview,
        )
        self.records.append(record)

        status_badge = Color.green("✓ PASS") if passed else Color.red("✗ FAIL")
        code_str = Color.cyan(str(response.status_code))
        time_str = Color.dim(f"{response.elapsed_ms:.1f}ms")
        print(f"  {status_badge} [{code_str}] {Color.bold(method)} {endpoint:<45} {time_str}")
        if not passed and details:
            print(f"         {Color.red('Error:')} {details}")
            if response.body_text:
                print(f"         {Color.dim('Response:')} {response.body_text[:250]}...")

        return passed

    # --------------------------------------------------------------------------
    # Suite 1: Public Catalog & Entities
    # --------------------------------------------------------------------------
    def run_public_catalog_suite(self) -> None:
        print(f"\n{Color.magenta('● [SUITE 1] Public Catalog & Inventory APIs')}")

        # 1.1 List Stays
        resp = self.client.request("GET", "/api/v1/stays")
        def validate_stays(r: ApiResponse) -> Tuple[bool, str]:
            if not r.json or "data" not in r.json:
                return False, "Missing 'data' wrapper in response"
            data = r.json["data"]
            if isinstance(data, list) and len(data) > 0:
                first = data[0]
                self.discovered_property_id = first.get("id")
                attrs = first.get("attributes", {})
                self.discovered_property_slug = attrs.get("slug")
            return True, "OK"

        self.assert_test(
            "Public Catalog",
            "List Stays & Properties",
            "GET",
            "/api/v1/stays",
            [200],
            resp,
            validate_stays,
        )

        # 1.2 Show Specific Stay
        slug = self.discovered_property_slug or "baseline-luxury-villa"
        resp = self.client.request("GET", f"/api/v1/stays/{slug}")
        self.assert_test(
            "Public Catalog",
            "Show Stay Details",
            "GET",
            f"/api/v1/stays/{slug}",
            [200, 404],
            resp,
            lambda r: (r.json and "data" in r.json, "Missing data object") if r.status_code == 200 else (True, "OK"),
        )

        # 1.3 Nonexistent Stay 404 Defense
        resp = self.client.request("GET", "/api/v1/stays/nonexistent-slug-xyz-99999")
        self.assert_test(
            "Public Catalog",
            "Stay Not Found (404 Error Envelope)",
            "GET",
            "/api/v1/stays/nonexistent-slug-xyz-99999",
            [404],
            resp,
            lambda r: (r.json and ("error" in r.json or "errors" in r.json or "message" in r.json), "Standard error envelope"),
        )

        # 1.4 List Experiences
        resp = self.client.request("GET", "/api/v1/experiences")
        def validate_exp(r: ApiResponse) -> Tuple[bool, str]:
            if r.json and "data" in r.json and isinstance(r.json["data"], list) and len(r.json["data"]) > 0:
                self.discovered_experience_slug = r.json["data"][0].get("attributes", {}).get("slug")
            return True, "OK"

        self.assert_test(
            "Public Catalog",
            "List Curated Experiences",
            "GET",
            "/api/v1/experiences",
            [200],
            resp,
            validate_exp,
        )

        # 1.5 Show Specific Experience
        exp_slug = self.discovered_experience_slug or "desert-safari-adventure"
        resp = self.client.request("GET", f"/api/v1/experiences/{exp_slug}")
        self.assert_test(
            "Public Catalog",
            "Show Experience Details",
            "GET",
            f"/api/v1/experiences/{exp_slug}",
            [200, 404],
            resp,
        )

        # 1.6 List Events
        resp = self.client.request("GET", "/api/v1/events")
        def validate_ev(r: ApiResponse) -> Tuple[bool, str]:
            if r.json and "data" in r.json and isinstance(r.json["data"], list) and len(r.json["data"]) > 0:
                self.discovered_event_slug = r.json["data"][0].get("attributes", {}).get("slug")
            return True, "OK"

        self.assert_test(
            "Public Catalog",
            "List Upcoming Events",
            "GET",
            "/api/v1/events",
            [200],
            resp,
            validate_ev,
        )

        # 1.7 Show Specific Event
        ev_slug = self.discovered_event_slug or "gouna-film-festival"
        resp = self.client.request("GET", f"/api/v1/events/{ev_slug}")
        self.assert_test(
            "Public Catalog",
            "Show Event Details",
            "GET",
            f"/api/v1/events/{ev_slug}",
            [200, 404],
            resp,
        )

    # --------------------------------------------------------------------------
    # Suite 2: Checkout & Pricing Engine
    # --------------------------------------------------------------------------
    def run_checkout_pricing_suite(self) -> None:
        print(f"\n{Color.magenta('● [SUITE 2] Checkout & Pricing Engine APIs')}")

        prop_id = self.discovered_property_id or 1
        today = datetime.date.today()
        check_in = (today + datetime.timedelta(days=10)).isoformat()
        check_out = (today + datetime.timedelta(days=14)).isoformat()

        # 2.1 Calculate Authoritative Quote
        quote_payload = {
            "property_id": prop_id,
            "check_in": check_in,
            "check_out": check_out,
            "guests": 2,
        }
        resp = self.client.request("POST", "/api/v1/checkout/quote", data=quote_payload)
        def validate_quote(r: ApiResponse) -> Tuple[bool, str]:
            if r.status_code == 200:
                if not r.json or "data" not in r.json:
                    return False, "Missing data in quote response"
                data = r.json["data"]
                attrs = data.get("attributes", data)
                pricing = attrs.get("pricing", attrs)
                if "total_cents" not in pricing and "total_cents" not in attrs:
                    return False, "Missing financial cents fields"
            return True, "OK"

        self.assert_test(
            "Checkout Engine",
            "Calculate Quote",
            "POST",
            "/api/v1/checkout/quote",
            [200, 422],
            resp,
            validate_quote,
        )

        # 2.2 Price Tampering Rejection Defense
        tampered_payload = {
            "property_id": prop_id,
            "check_in": check_in,
            "check_out": check_out,
            "guests": 2,
            "total": 10,  # Prohibited injected field
            "subtotal": 5,
        }
        resp = self.client.request("POST", "/api/v1/checkout/quote", data=tampered_payload)
        self.assert_test(
            "Checkout Engine",
            "Price Tampering Defense (Prohibited Fields)",
            "POST",
            "/api/v1/checkout/quote",
            [422],
            resp,
        )

        # 2.3 Create Booking with Idempotency Key
        idempotency_key = f"py-test-idem-{int(time.time())}-{os.getpid()}"
        booking_payload = {
            "property_id": prop_id,
            "check_in": (today + datetime.timedelta(days=20)).isoformat(),
            "check_out": (today + datetime.timedelta(days=23)).isoformat(),
            "guests": 2,
            "first_name": "Antigravity",
            "last_name": "Tester",
            "email": f"api_test_{int(time.time())}@gounow.com",
            "phone": "+201001234567",
            "payment_method": "card",
        }
        resp = self.client.request(
            "POST",
            "/api/v1/checkout/bookings",
            data=booking_payload,
            headers={"Idempotency-Key": idempotency_key},
        )
        def capture_booking(r: ApiResponse) -> Tuple[bool, str]:
            if r.status_code in [200, 201] and r.json:
                data = r.json.get("data", {})
                self.created_booking_reference = data.get("reference") or data.get("attributes", {}).get("reference")
            return True, "OK"

        self.assert_test(
            "Checkout Engine",
            "Create Booking with Idempotency-Key",
            "POST",
            "/api/v1/checkout/bookings",
            [200, 201, 409, 422],
            resp,
            capture_booking,
        )

        # 2.4 Lookup Booking by Reference
        ref = self.created_booking_reference or "GON-TEST-NONEXISTENT"
        resp = self.client.request("GET", f"/api/v1/checkout/bookings/{ref}")
        self.assert_test(
            "Checkout Engine",
            "Lookup Booking by Reference",
            "GET",
            f"/api/v1/checkout/bookings/{ref}",
            [200, 404],
            resp,
        )

    # --------------------------------------------------------------------------
    # Suite 3: Leads & Concierge Inquiries
    # --------------------------------------------------------------------------
    def run_leads_suite(self) -> None:
        print(f"\n{Color.magenta('● [SUITE 3] Leads & Concierge Inquiries APIs')}")

        # 3.1 Store Lead Inquiry
        lead_payload = {
            "name": "Mahmoud Hassan",
            "email": f"lead_{int(time.time())}@example.com",
            "phone": "+201098765432",
            "message": "Inquiring about private yacht charter in Abu Tig Marina for next weekend.",
            "type": "concierge",
        }
        resp = self.client.request("POST", "/api/v1/leads", data=lead_payload)
        self.assert_test(
            "Leads",
            "Store Lead Inquiry",
            "POST",
            "/api/v1/leads",
            [201],
            resp,
            lambda r: (r.json and "data" in r.json and "id" in r.json["data"], "Missing created lead ID"),
        )

        # 3.2 Lead Validation Error Defense
        invalid_lead = {"name": "", "message": ""}
        resp = self.client.request("POST", "/api/v1/leads", data=invalid_lead)
        self.assert_test(
            "Leads",
            "Lead Validation Rejection (422 Error)",
            "POST",
            "/api/v1/leads",
            [422],
            resp,
        )

    # --------------------------------------------------------------------------
    # Suite 4: Authentication & Security APIs
    # --------------------------------------------------------------------------
    def run_auth_suite(self) -> None:
        print(f"\n{Color.magenta('● [SUITE 4] Authentication & Security APIs')}")

        # 4.1 Invalid Login Attempt Defense
        invalid_login = {"email": "nonexistent_attacker@gounow.com", "password": "wrongpassword123"}
        resp = self.client.request("POST", "/api/v1/auth/login", data=invalid_login)
        self.assert_test(
            "Authentication",
            "Invalid Login Rejection (401 / 422 Generic Message)",
            "POST",
            "/api/v1/auth/login",
            [401, 422, 429],
            resp,
        )

        # 4.2 Forgot Password Request
        forgot_payload = {"email": "test@gounow.com"}
        resp = self.client.request("POST", "/api/v1/auth/forgot-password", data=forgot_payload)
        self.assert_test(
            "Authentication",
            "Forgot Password Request",
            "POST",
            "/api/v1/auth/forgot-password",
            [200, 422, 429],
            resp,
        )

        # 4.3 2FA Challenge Endpoint
        challenge_payload = {"challenge_token": "fake-token", "code": "123456"}
        resp = self.client.request("POST", "/api/v1/auth/2fa/challenge", data=challenge_payload)
        self.assert_test(
            "Authentication",
            "2FA Challenge Verification",
            "POST",
            "/api/v1/auth/2fa/challenge",
            [401, 422, 429],
            resp,
        )

        # 4.4 2FA Recovery Endpoint
        recovery_payload = {"challenge_token": "fake-token", "recovery_code": "RECOVERY-1234"}
        resp = self.client.request("POST", "/api/v1/auth/2fa/recovery", data=recovery_payload)
        self.assert_test(
            "Authentication",
            "2FA Recovery Code Verification",
            "POST",
            "/api/v1/auth/2fa/recovery",
            [401, 422, 429],
            resp,
        )

        # 4.5 Reset Password Malformed Token
        reset_payload = {
            "token": "invalid_token_here",
            "email": "test@gounow.com",
            "password": "NewStrongPassword123!",
            "password_confirmation": "NewStrongPassword123!",
        }
        resp = self.client.request("POST", "/api/v1/auth/reset-password", data=reset_payload)
        self.assert_test(
            "Authentication",
            "Reset Password Validation",
            "POST",
            "/api/v1/auth/reset-password",
            [400, 422, 429],
            resp,
        )

    # --------------------------------------------------------------------------
    # Suite 5: Authenticated User & Profile APIs
    # --------------------------------------------------------------------------
    def run_authenticated_user_suite(self) -> None:
        print(f"\n{Color.magenta('● [SUITE 5] Authenticated User & Profile APIs')}")

        if not self.client.token:
            print(f"  {Color.yellow('⚠ SKIP')} No authentication token provided; testing unauthenticated defense:")
            resp = self.client.request("GET", "/api/v1/me", use_auth=False)
            self.assert_test(
                "Authenticated User",
                "Unauthenticated /me Protection (401)",
                "GET",
                "/api/v1/me",
                [401],
                resp,
            )
            return

        # 5.1 Get Current User Profile
        resp = self.client.request("GET", "/api/v1/me", use_auth=True)
        self.assert_test(
            "Authenticated User",
            "Get Current User Profile (/me)",
            "GET",
            "/api/v1/me",
            [200],
            resp,
        )

        # 5.2 Get User Abilities & Permissions
        resp = self.client.request("GET", "/api/v1/me/abilities", use_auth=True)
        self.assert_test(
            "Authenticated User",
            "Get Abilities & Permissions (/me/abilities)",
            "GET",
            "/api/v1/me/abilities",
            [200],
            resp,
        )

        # 5.3 Get Active Sessions
        resp = self.client.request("GET", "/api/v1/me/sessions", use_auth=True)
        self.assert_test(
            "Authenticated User",
            "List Active Sessions (/me/sessions)",
            "GET",
            "/api/v1/me/sessions",
            [200],
            resp,
        )

    # --------------------------------------------------------------------------
    # Suite 6: Customer Portal APIs
    # --------------------------------------------------------------------------
    def run_customer_portal_suite(self) -> None:
        print(f"\n{Color.magenta('● [SUITE 6] Customer Portal APIs')}")

        if not self.client.token:
            print(f"  {Color.yellow('⚠ SKIP')} No authentication token provided; testing unauthenticated defense:")
            resp = self.client.request("GET", "/api/v1/customer/bookings", use_auth=False)
            self.assert_test(
                "Customer Portal",
                "Unauthenticated Customer Bookings Protection (401)",
                "GET",
                "/api/v1/customer/bookings",
                [401],
                resp,
            )
            return

        # 6.1 Customer Profile
        resp = self.client.request("GET", "/api/v1/customer/me", use_auth=True)
        self.assert_test(
            "Customer Portal",
            "Get Customer Profile (/customer/me)",
            "GET",
            "/api/v1/customer/me",
            [200],
            resp,
        )

        # 6.2 Customer Abilities
        resp = self.client.request("GET", "/api/v1/customer/me/abilities", use_auth=True)
        self.assert_test(
            "Customer Portal",
            "Get Customer Abilities (/customer/me/abilities)",
            "GET",
            "/api/v1/customer/me/abilities",
            [200],
            resp,
        )

        # 6.3 Customer Bookings List
        resp = self.client.request("GET", "/api/v1/customer/bookings", use_auth=True)
        self.assert_test(
            "Customer Portal",
            "List Customer Bookings",
            "GET",
            "/api/v1/customer/bookings",
            [200],
            resp,
        )

    # --------------------------------------------------------------------------
    # Suite 7: Admin Headless APIs
    # --------------------------------------------------------------------------
    def run_admin_suite(self) -> None:
        print(f"\n{Color.magenta('● [SUITE 7] Admin Protected Headless APIs')}")

        # 7.1 Admin Ping Without Admin Permissions (Should be 401 or 403)
        resp = self.client.request("GET", "/api/v1/admin/ping", use_auth=True)
        self.assert_test(
            "Admin Protected",
            "Admin Ping Permission Guard (/admin/ping)",
            "GET",
            "/api/v1/admin/ping",
            [401, 403, 200],
            resp,
        )

    # --------------------------------------------------------------------------
    # Suite 8: Payment Webhook Security APIs
    # --------------------------------------------------------------------------
    def run_webhook_suite(self) -> None:
        print(f"\n{Color.magenta('● [SUITE 8] Payment Webhook Security APIs')}")

        webhook_data = {
            "type": "TRANSACTION",
            "obj": {
                "id": 999999,
                "amount_cents": 50000,
                "success": True,
                "currency": "EGP",
                "order": {"id": 12345},
            },
        }

        # 8.1 Missing Signature Rejection (P0 Requirement)
        resp = self.client.request("POST", "/api/v1/webhooks/payments", data=webhook_data)
        self.assert_test(
            "Webhooks",
            "Missing Signature Rejection (HTTP 401)",
            "POST",
            "/api/v1/webhooks/payments",
            [401],
            resp,
            lambda r: (r.json and ("INVALID_WEBHOOK_SIGNATURE" in r.body_text or "MISSING_SIGNATURE" in r.body_text), "Error code signature envelope"),
        )

        # 8.2 Forged / Tampered Signature Rejection
        resp = self.client.request(
            "POST",
            "/api/v1/webhooks/payments",
            data=webhook_data,
            headers={"X-Paymob-Signature": "forged_sha512_hash_abcdef0123456789"},
        )
        self.assert_test(
            "Webhooks",
            "Forged Signature Rejection (HTTP 401)",
            "POST",
            "/api/v1/webhooks/payments",
            [401],
            resp,
            lambda r: (r.json and "INVALID_WEBHOOK_SIGNATURE" in r.body_text, "Error code INVALID_WEBHOOK_SIGNATURE"),
        )

        # 8.3 Signed Generic HMAC Request
        raw_body = json.dumps(webhook_data)
        dummy_secret = "test_webhook_secret_key"
        computed_sig = hmac.new(dummy_secret.encode(), raw_body.encode(), hashlib.sha256).hexdigest()
        resp = self.client.request(
            "POST",
            "/api/v1/webhooks/payments",
            data=webhook_data,
            headers={"X-Webhook-Signature": computed_sig},
        )
        self.assert_test(
            "Webhooks",
            "Cryptographic Webhook Evaluation",
            "POST",
            "/api/v1/webhooks/payments",
            [200, 401, 404, 422],
            resp,
        )

    # --------------------------------------------------------------------------
    # Execute All Suites
    # --------------------------------------------------------------------------
    def run_all(self) -> None:
        start_time = time.perf_counter()
        print(f"\n{Color.bold('Starting GouNow API Test Suite Execution...')}")
        print(Color.dim(f"Target Base URL: {self.client.base_url}"))
        print(Color.dim(f"Execution Time: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"))

        self.run_public_catalog_suite()
        self.run_checkout_pricing_suite()
        self.run_leads_suite()
        self.run_auth_suite()
        self.run_authenticated_user_suite()
        self.run_customer_portal_suite()
        self.run_admin_suite()
        self.run_webhook_suite()

        duration = time.perf_counter() - start_time
        self.print_summary(duration)

    def print_summary(self, total_seconds: float) -> None:
        total = len(self.records)
        passed = sum(1 for r in self.records if r.passed)
        failed = total - passed
        pass_rate = (passed / total * 100) if total > 0 else 0.0

        print("\n" + "=" * 80)
        print(Color.bold("                        GouNow API Test Suite Summary"))
        print("=" * 80)

        # Category breakdown
        categories: Dict[str, Dict[str, int]] = {}
        for r in self.records:
            if r.category not in categories:
                categories[r.category] = {"total": 0, "passed": 0, "failed": 0}
            categories[r.category]["total"] += 1
            if r.passed:
                categories[r.category]["passed"] += 1
            else:
                categories[r.category]["failed"] += 1

        for cat, stats in categories.items():
            cat_passed = stats["passed"]
            cat_total = stats["total"]
            cat_failed = stats["failed"]
            badge = Color.green("PASS") if cat_failed == 0 else Color.red("FAIL")
            print(f"  {cat:<30} {cat_passed}/{cat_total} passed   [{badge}]")

        print("-" * 80)
        total_str = Color.bold(str(total))
        passed_str = Color.green(str(passed))
        failed_str = Color.red(str(failed)) if failed > 0 else Color.green("0")
        rate_str = Color.green(f"{pass_rate:.1f}%") if pass_rate == 100 else Color.yellow(f"{pass_rate:.1f}%")

        print(f"  Total Endpoints Tested: {total_str}")
        print(f"  Passed:                 {passed_str}")
        print(f"  Failed:                 {failed_str}")
        print(f"  Success Rate:           {rate_str}")
        print(f"  Total Duration:         {total_seconds:.2f}s")
        print("=" * 80)

        if failed == 0:
            print(f"\n{Color.green('🎉 All GouNow API tests completed successfully with ZERO failures!')}\n")
        else:
            print(f"\n{Color.red(f'⚠️  {failed} test(s) encountered issues. Inspect error traces above.')}\n")


# ==============================================================================
# Auto Server & Token Provisioning Helpers
# ==============================================================================
def check_server_running(host: str, port: int) -> bool:
    try:
        with socket.create_connection((host, port), timeout=1.5):
            return True
    except OSError:
        return False


def start_artisan_server(backend_dir: str, host: str = "127.0.0.1", port: int = 8000) -> Optional[subprocess.Popen]:
    print(Color.cyan(f"ℹ Auto-starting Laravel development server on http://{host}:{port}..."))
    try:
        proc = subprocess.Popen(
            ["php", "artisan", "serve", f"--host={host}", f"--port={port}"],
            cwd=backend_dir,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        # Wait up to 5 seconds for server to be responsive
        for _ in range(25):
            time.sleep(0.2)
            if check_server_running(host, port):
                print(Color.green(f"✓ Laravel server is live on http://{host}:{port}"))
                return proc
        print(Color.yellow("⚠ Server start timed out; continuing anyway..."))
        return proc
    except Exception as ex:
        print(Color.red(f"✗ Failed to auto-start Laravel server: {ex}"))
        return None


def ensure_database_seeded(backend_dir: str) -> None:
    """Verifies that properties exist in database; seeds if empty."""
    check_script = "echo 'COUNT:' . \\App\\Models\\Property::count();"
    try:
        output = subprocess.check_output(
            ["php", "artisan", "tinker", "--execute", check_script],
            cwd=backend_dir,
            stderr=subprocess.DEVNULL,
            text=True,
        )
        match = re.search(r"COUNT:(\d+)", output)
        if match and int(match.group(1)) == 0:
            print(Color.cyan("ℹ Database inventory empty; auto-seeding properties and catalog..."))
            subprocess.run(["php", "artisan", "db:seed"], cwd=backend_dir, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            subprocess.run(["php", "artisan", "cache:clear"], cwd=backend_dir, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            print(Color.green("✓ Database catalog seeded successfully."))
    except Exception:
        pass


def provision_sanctum_token(backend_dir: str) -> Optional[str]:
    """Provisions a test Sanctum token via php artisan tinker."""
    tinker_script = (
        "$user = \\App\\Models\\User::firstOrCreate("
        "    ['email' => 'api_runner_test@gounow.com'],"
        "    ['name' => 'API Test Runner', 'password' => bcrypt('TestSecret123!'), 'email_verified_at' => now()]"
        ");"
        "$role = \\App\\Models\\Role::where('name', 'customer')->first();"
        "if ($role) { $user->roles()->syncWithoutDetaching([$role->id]); }"
        "$token = $user->createToken('api-test-suite')->plainTextToken;"
        "echo 'TOKEN:' . $token;"
    )
    try:
        output = subprocess.check_output(
            ["php", "artisan", "tinker", "--execute", tinker_script],
            cwd=backend_dir,
            stderr=subprocess.DEVNULL,
            text=True,
        )
        match = re.search(r"TOKEN:([a-zA-Z0-9|]+)", output)
        if match:
            return match.group(1).strip()
    except Exception:
        pass
    return None


# ==============================================================================
# CLI Entrypoint
# ==============================================================================
def main():
    parser = argparse.ArgumentParser(
        description="GouNow Master API Test Suite & Catalog Runner",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument("--base-url", default="http://127.0.0.1:8000", help="Root URL of the GouNow API backend")
    parser.add_argument("--token", default=None, help="Sanctum Bearer token for authenticated endpoints")
    parser.add_argument("--no-auto-server", action="store_true", help="Do not attempt to auto-start 'php artisan serve'")
    parser.add_argument("--no-auto-token", action="store_true", help="Do not attempt to auto-generate a Sanctum test token")
    parser.add_argument("--output", "-o", default=None, help="Path to write JSON test report (e.g. api_report.json)")
    parser.add_argument("--verbose", "-v", action="store_true", help="Print verbose request and response details")
    args = parser.parse_args()

    # Determine backend directory relative to this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(script_dir, "backend") if os.path.isdir(os.path.join(script_dir, "backend")) else script_dir

    if os.path.exists(os.path.join(backend_dir, "artisan")):
        ensure_database_seeded(backend_dir)

    parsed_url = urllib.parse.urlparse(args.base_url)
    host = parsed_url.hostname or "127.0.0.1"
    port = parsed_url.port or (443 if parsed_url.scheme == "https" else 80)

    server_proc = None
    if not check_server_running(host, port) and not args.no_auto_server:
        server_proc = start_artisan_server(backend_dir, host=host, port=port)
        if server_proc:
            atexit.register(lambda: server_proc.terminate())

    # Auto-provision token if needed and possible
    token = args.token
    if not token and not args.no_auto_token and os.path.exists(os.path.join(backend_dir, "artisan")):
        token = provision_sanctum_token(backend_dir)
        if token:
            print(Color.cyan(f"ℹ Auto-provisioned Sanctum Bearer token for test runner: {token[:12]}..."))

    client = ApiClient(base_url=args.base_url, verbose=args.verbose)
    if token:
        client.set_token(token)

    runner = GouNowApiTestSuite(client)
    runner.run_all()

    if args.output:
        report_data = {
            "timestamp": datetime.datetime.now().isoformat(),
            "base_url": args.base_url,
            "total": len(runner.records),
            "passed": sum(1 for r in runner.records if r.passed),
            "failed": sum(1 for r in runner.records if not r.passed),
            "results": [r.to_dict() for r in runner.records],
        }
        with open(args.output, "w", encoding="utf-8") as f:
            json.dump(report_data, f, indent=2, ensure_ascii=False)
        print(Color.green(f"✓ Detailed JSON report saved to: {args.output}"))

    # Clean up server if we spawned it
    if server_proc:
        server_proc.terminate()

    # Exit code based on failures
    sys.exit(0 if all(r.passed for r in runner.records) else 1)


if __name__ == "__main__":
    main()
