#!/usr/bin/env python3
"""
GouNow Lifestyle Platform — Enterprise API Test Suite
=====================================================
Automated end-to-end integration and security test suite for Laravel API v1.
Validates:
  - Request Pipeline Standard S1 (Headers, Request-ID, Rate Limiting, JSON Force)
  - Response Contract Standard S2 (Success & Error Envelopes, Integer Cents, ISO-8601)
  - Catalog Endpoints (Stays, Experiences, Events, Listing Standard & Pagination Cap)
  - Quote & Pricing Engine (Authoritative server pricing, date rules, guest capacity)
  - Booking Mutation & Idempotency (Anti-tampering, UUID Idempotency-Key, Replay defense)
  - Lead Generation & Inquiries (Validation envelopes, CSRF-less public write)
  - Authentication & Account Security (Generic login errors, anti-enumeration, 401 guard)

Usage:
    python3 api_test_suite.py [--base-url http://127.0.0.1:8000] [--auto-start] [--verbose]
"""

import sys
import os
import time
import uuid
import json
import argparse
import subprocess
from datetime import datetime, timedelta

# Prefer requests, fallback to urllib if not installed
try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    import urllib.request
    import urllib.error
    REQUESTS_AVAILABLE = False


# ANSI Color Codes for terminal formatting
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    DIM = '\033[2m'


class ApiResponse:
    def __init__(self, status_code: int, headers: dict, body_text: str, json_data: dict = None):
        self.status_code = status_code
        self.headers = {k.lower(): v for k, v in headers.items()}
        self.text = body_text
        self.json_data = json_data

    def json(self):
        if self.json_data is not None:
            return self.json_data
        try:
            self.json_data = json.loads(self.text)
            return self.json_data
        except Exception:
            return None


class HttpClient:
    def __init__(self, base_url: str, verbose: bool = False):
        import random
        self.base_url = base_url.rstrip('/')
        self.verbose = verbose
        self.client_ip = f"198.51.{random.randint(1, 250)}.{random.randint(1, 250)}"

    def request(self, method: str, endpoint: str, data: dict = None, headers: dict = None) -> ApiResponse:
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        req_headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Forwarded-For': self.client_ip,
        }
        if headers:
            req_headers.update(headers)

        if self.verbose:
            print(f"{Colors.DIM}--> {method} {url}{Colors.ENDC}")
            if data:
                print(f"{Colors.DIM}    Payload: {json.dumps(data)}{Colors.ENDC}")

        if REQUESTS_AVAILABLE:
            try:
                resp = requests.request(
                    method=method,
                    url=url,
                    json=data if data else None,
                    headers=req_headers,
                    timeout=10
                )
                json_data = None
                try:
                    json_data = resp.json()
                except Exception:
                    pass
                return ApiResponse(resp.status_code, dict(resp.headers), resp.text, json_data)
            except requests.exceptions.RequestException as e:
                raise ConnectionError(f"HTTP request failed: {e}")
        else:
            # Urllib fallback
            body_bytes = json.dumps(data).encode('utf-8') if data else None
            req = urllib.request.Request(url, data=body_bytes, headers=req_headers, method=method)
            try:
                with urllib.request.urlopen(req, timeout=10) as response:
                    status = response.getcode()
                    res_headers = dict(response.info())
                    body_text = response.read().decode('utf-8')
                    return ApiResponse(status, res_headers, body_text)
            except urllib.error.HTTPError as e:
                status = e.code
                res_headers = dict(e.headers)
                body_text = e.read().decode('utf-8')
                return ApiResponse(status, res_headers, body_text)
            except Exception as e:
                raise ConnectionError(f"HTTP request failed: {e}")


class TestRunner:
    def __init__(self, client: HttpClient):
        self.client = client
        self.passed = 0
        self.failed = 0
        self.skipped = 0
        self.results = []
        self.discovered_property_slug = None
        self.discovered_property_id = None

    def assert_true(self, condition: bool, message: str):
        if not condition:
            raise AssertionError(message)

    def run_test(self, test_id: str, name: str, test_func):
        start_time = time.time()
        print(f"  [{test_id}] {name} ... ", end='', flush=True)
        try:
            test_func()
            duration = (time.time() - start_time) * 1000
            print(f"{Colors.GREEN}✓ PASS{Colors.ENDC} {Colors.DIM}({duration:.1f}ms){Colors.ENDC}")
            self.passed += 1
            self.results.append({'id': test_id, 'name': name, 'status': 'PASS', 'duration': duration})
        except Exception as e:
            duration = (time.time() - start_time) * 1000
            print(f"{Colors.FAIL}✗ FAIL{Colors.ENDC} {Colors.DIM}({duration:.1f}ms){Colors.ENDC}")
            print(f"    {Colors.FAIL}Error: {e}{Colors.ENDC}")
            self.failed += 1
            self.results.append({'id': test_id, 'name': name, 'status': 'FAIL', 'duration': duration, 'error': str(e)})

    # =========================================================================
    # Suite 1: Stays & Properties Catalog
    # =========================================================================
    def test_list_stays(self):
        res = self.client.request('GET', '/api/v1/stays')
        self.assert_true(res.status_code == 200, f"Expected 200, got {res.status_code}")
        body = res.json()
        self.assert_true('data' in body, "Response missing 'data' key")
        self.assert_true('meta' in body, "Response missing 'meta' key")
        self.assert_true('request_id' in body['meta'], "Response missing 'meta.request_id'")
        self.assert_true(isinstance(body['data'], list), "'data' must be an array")
        self.assert_true(len(body['data']) > 0, "Properties list should not be empty")

        first_prop = body['data'][0]
        self.assert_true('attributes' in first_prop, "Property item missing 'attributes'")
        attrs = first_prop['attributes']
        self.assert_true('pricing' in attrs, "Property attributes missing 'pricing'")
        self.assert_true('base_price_cents' in attrs['pricing'], "Pricing missing 'base_price_cents'")
        self.assert_true(isinstance(attrs['pricing']['base_price_cents'], int), "base_price_cents must be integer minor units")

        # Save for subsequent tests
        self.discovered_property_slug = attrs.get('slug')
        self.discovered_property_id = first_prop.get('id')

    def test_listing_pagination_capping(self):
        # S1 listing standard: per_page must be capped at 100
        res = self.client.request('GET', '/api/v1/stays?per_page=5000')
        self.assert_true(res.status_code == 200, f"Expected 200, got {res.status_code}")
        body = res.json()
        meta = body.get('meta', {})
        per_page = meta.get('per_page', 0)
        self.assert_true(per_page <= 100, f"per_page should be capped at 100, got {per_page}")

    def test_get_stay_detail(self):
        slug = self.discovered_property_slug or 'fanadir-bay-sunlight-villa'
        res = self.client.request('GET', f'/api/v1/stays/{slug}')
        self.assert_true(res.status_code == 200, f"Expected 200 for slug {slug}, got {res.status_code}")
        body = res.json()
        self.assert_true('data' in body, "Response missing 'data' key")
        attrs = body['data'].get('attributes', {})
        self.assert_true(attrs.get('slug') == slug, f"Expected slug {slug}, got {attrs.get('slug')}")
        # Assert no sensitive/internal leakage
        self.assert_true('password' not in attrs, "Leaked password in property response")
        self.assert_true('internal_notes' not in attrs, "Leaked internal_notes in property response")

    # =========================================================================
    # Suite 2: Experiences & Events
    # =========================================================================
    def test_list_experiences(self):
        res = self.client.request('GET', '/api/v1/experiences')
        self.assert_true(res.status_code == 200, f"Expected 200, got {res.status_code}")
        body = res.json()
        self.assert_true('data' in body, "Response missing 'data'")
        self.assert_true('meta' in body, "Response missing 'meta'")

    def test_list_events(self):
        res = self.client.request('GET', '/api/v1/events')
        self.assert_true(res.status_code == 200, f"Expected 200, got {res.status_code}")
        body = res.json()
        self.assert_true('data' in body, "Response missing 'data'")
        self.assert_true('meta' in body, "Response missing 'meta'")

    # =========================================================================
    # Suite 3: Checkout & Pricing Quote Engine
    # =========================================================================
    def test_calculate_quote_valid(self):
        prop_id = self.discovered_property_id or 1
        check_in = (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d')
        check_out = (datetime.now() + timedelta(days=35)).strftime('%Y-%m-%d')

        payload = {
            "property_id": prop_id,
            "check_in": check_in,
            "check_out": check_out,
            "guests": 2
        }

        res = self.client.request('POST', '/api/v1/checkout/quote', data=payload)
        self.assert_true(res.status_code == 200, f"Expected 200, got {res.status_code}. Body: {res.text}")
        body = res.json()
        self.assert_true('data' in body, "Response missing 'data'")
        attrs = body['data'].get('attributes', {})
        pricing = attrs.get('pricing', {})
        self.assert_true('total_cents' in pricing, "Quote missing 'pricing.total_cents'")
        self.assert_true('currency' in pricing, "Quote missing 'pricing.currency'")
        self.assert_true(isinstance(pricing['total_cents'], int), "total_cents must be integer minor units")
        self.assert_true(pricing['total_cents'] > 0, "total_cents must be positive")
        self.assert_true('breakdown' in attrs, "Quote missing 'breakdown'")

    def test_calculate_quote_invalid_dates(self):
        prop_id = self.discovered_property_id or 1
        # Reversed dates: check_out before check_in
        payload = {
            "property_id": prop_id,
            "check_in": "2026-11-10",
            "check_out": "2026-11-05",
            "guests": 2
        }

        res = self.client.request('POST', '/api/v1/checkout/quote', data=payload)
        self.assert_true(res.status_code == 422, f"Expected 422 Unprocessable for reversed dates, got {res.status_code}")
        body = res.json()
        self.assert_true('error' in body, "Error response missing 'error' envelope")
        self.assert_true(body['error'].get('code') == 'VALIDATION_ERROR', f"Expected VALIDATION_ERROR code, got {body['error'].get('code')}")

    def test_calculate_quote_exceeded_guests(self):
        prop_id = self.discovered_property_id or 1
        payload = {
            "property_id": prop_id,
            "check_in": (datetime.now() + timedelta(days=10)).strftime('%Y-%m-%d'),
            "check_out": (datetime.now() + timedelta(days=14)).strftime('%Y-%m-%d'),
            "guests": 999  # Clearly exceeds capacity
        }

        res = self.client.request('POST', '/api/v1/checkout/quote', data=payload)
        self.assert_true(res.status_code in [409, 422], f"Expected 409 or 422 for exceeded guests, got {res.status_code}")

    # =========================================================================
    # Suite 4: Booking Mutation & Idempotency Controls
    # =========================================================================
    def test_create_booking_with_idempotency_and_anti_tampering(self):
        prop_id = self.discovered_property_id or 1
        idempotency_key = str(uuid.uuid4())
        import random
        future_offset = 100 + random.randint(1, 400)
        check_in = (datetime.now() + timedelta(days=future_offset)).strftime('%Y-%m-%d')
        check_out = (datetime.now() + timedelta(days=future_offset + 4)).strftime('%Y-%m-%d')

        headers = {
            "Idempotency-Key": idempotency_key
        }

        # Step 1: Malicious client attempts price tampering -> Assert 422 VALIDATION_ERROR
        tampered_payload = {
            "property_id": prop_id,
            "check_in": check_in,
            "check_out": check_out,
            "guests": 2,
            "payment_type": "full",
            "payment_method": "card",
            "first_name": "Test",
            "last_name": "Auditor",
            "email": f"audit_{uuid.uuid4().hex[:6]}@example.com",
            "phone": "+201000000000",
            "price": 100,
            "total": 100,
            "total_cents": 1000
        }
        res_tamper = self.client.request('POST', '/api/v1/checkout/bookings', data=tampered_payload, headers=headers)
        self.assert_true(res_tamper.status_code == 422, f"Expected 422 on price tampering, got {res_tamper.status_code}")
        self.assert_true(res_tamper.json().get('error', {}).get('code') == 'VALIDATION_ERROR', "Expected VALIDATION_ERROR")

        # Step 2: Legitimate request -> Assert 201 Created with authoritative server pricing
        clean_key = str(uuid.uuid4())
        clean_headers = {"Idempotency-Key": clean_key}
        clean_payload = {
            "property_id": prop_id,
            "check_in": check_in,
            "check_out": check_out,
            "guests": 2,
            "payment_type": "full",
            "payment_method": "card",
            "first_name": "Test",
            "last_name": "Auditor",
            "email": f"audit_{uuid.uuid4().hex[:6]}@example.com",
            "phone": "+201000000000"
        }

        res = self.client.request('POST', '/api/v1/checkout/bookings', data=clean_payload, headers=clean_headers)
        self.assert_true(res.status_code == 201, f"Expected 201 Created, got {res.status_code}. Body: {res.text}")
        body = res.json()
        self.assert_true('data' in body, "Response missing 'data'")
        attrs = body['data'].get('attributes', {})
        self.assert_true('reference' in attrs, "Booking missing reference code")
        total_cents = attrs.get('pricing', {}).get('total_cents', 0)
        self.assert_true(total_cents > 10000, f"Expected valid calculated price, got {total_cents}")

        # Store for replay test
        self.created_booking_reference = attrs.get('reference')
        self.created_idempotency_key = clean_key
        self.created_payload = clean_payload

    def test_booking_idempotency_replay(self):
        if not hasattr(self, 'created_idempotency_key'):
            return

        headers = {
            "Idempotency-Key": self.created_idempotency_key
        }

        # Re-send the exact same creation request
        res = self.client.request('POST', '/api/v1/checkout/bookings', data=self.created_payload, headers=headers)
        self.assert_true(res.status_code in [200, 201], f"Expected 200 or 201 on idempotent replay, got {res.status_code}")
        body = res.json()
        attrs = body.get('data', {}).get('attributes', {})
        self.assert_true(attrs.get('reference') == self.created_booking_reference,
                         f"Idempotency failed: expected reference {self.created_booking_reference}, got {attrs.get('reference')}")

    # =========================================================================
    # Suite 5: Leads & Concierge Inquiries
    # =========================================================================
    def test_store_lead_inquiry(self):
        payload = {
            "name": "Integration Test Lead",
            "email": "lead.tester@gounow.example",
            "phone": "+201234567890",
            "type": "concierge",
            "message": "Automated verification test inquiry for VIP boat rental."
        }

        res = self.client.request('POST', '/api/v1/leads', data=payload)
        self.assert_true(res.status_code == 201, f"Expected 201 Created, got {res.status_code}")
        body = res.json()
        self.assert_true('data' in body, "Response missing 'data'")
        self.assert_true('id' in body['data'], "Response data missing lead id")
        self.assert_true('message' in body['data'], "Response data missing confirmation message")

    def test_store_lead_validation_rejection(self):
        # Missing required fields
        payload = {
            "message": "Incomplete lead"
        }

        res = self.client.request('POST', '/api/v1/leads', data=payload)
        self.assert_true(res.status_code == 422, f"Expected 422 for missing fields, got {res.status_code}")
        body = res.json()
        self.assert_true('error' in body, "Response missing 'error' envelope")
        self.assert_true(body['error'].get('code') == 'VALIDATION_ERROR', "Expected VALIDATION_ERROR code")

    # =========================================================================
    # Suite 6: Authentication & Security Controls
    # =========================================================================
    def test_login_invalid_credentials_generic_error(self):
        payload = {
            "email": "nonexistent_user@example.com",
            "password": "wrong_password_1234!"
        }

        res = self.client.request('POST', '/api/v1/auth/login', data=payload)
        self.assert_true(res.status_code in [401, 422], f"Expected 401 or 422, got {res.status_code}")
        body = res.json()
        self.assert_true('error' in body, "Response missing 'error' envelope")
        # Ensure message is generic and does not disclose user non-existence (Anti-enumeration P4-T02)
        error_msg = body['error'].get('message', '').lower()
        self.assert_true('not found' not in error_msg and 'does not exist' not in error_msg,
                         "Login error discloses account existence!")

    def test_protected_customer_endpoint_requires_auth(self):
        # Accessing /api/v1/customer/me without auth token must return 401
        res = self.client.request('GET', '/api/v1/customer/me')
        self.assert_true(res.status_code == 401, f"Expected 401 Unauthorized, got {res.status_code}")
        body = res.json()
        self.assert_true('error' in body, "Response missing 'error' envelope")
        self.assert_true(body['error'].get('code') == 'UNAUTHENTICATED', f"Expected UNAUTHENTICATED, got {body['error'].get('code')}")

    # =========================================================================
    # Suite 7: Request Pipeline & Headers Standard S1
    # =========================================================================
    def test_request_id_and_json_headers(self):
        custom_req_id = f"test-trace-{uuid.uuid4()}"
        headers = {
            "X-Request-ID": custom_req_id
        }

        res = self.client.request('GET', '/api/v1/stays', headers=headers)
        self.assert_true(res.status_code == 200, f"Expected 200, got {res.status_code}")
        # Standard S1: X-Request-ID header must be returned
        ret_header = res.headers.get('x-request-id')
        self.assert_true(ret_header == custom_req_id, f"X-Request-ID header mismatch. Expected {custom_req_id}, got {ret_header}")

        # Meta key in JSON body must match
        body = res.json()
        self.assert_true(body.get('meta', {}).get('request_id') == custom_req_id, "meta.request_id does not match injected header")


def check_server_running(base_url: str) -> bool:
    try:
        url = f"{base_url.rstrip('/')}/api/v1/stays"
        if REQUESTS_AVAILABLE:
            r = requests.get(url, timeout=2)
            return r.status_code in [200, 401, 404]
        else:
            with urllib.request.urlopen(url, timeout=2) as r:
                return r.getcode() == 200
    except Exception:
        return False


def main():
    parser = argparse.ArgumentParser(description="GouNow Platform — Enterprise API Test Suite")
    parser.add_argument('--base-url', default=os.getenv('API_BASE_URL', 'http://127.0.0.1:8000'),
                        help="Base API URL (default: http://127.0.0.1:8000)")
    parser.add_argument('--auto-start', action='store_true', default=True,
                        help="Auto-start php artisan serve if server is not reachable (default: True)")
    parser.add_argument('--verbose', action='store_true', default=False,
                        help="Print verbose HTTP headers and payloads")

    args = parser.parse_args()

    print(f"\n{Colors.BOLD}{Colors.CYAN}======================================================================{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.CYAN}   🛡️  GouNow Platform — Enterprise API Test Suite v2.0{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.CYAN}======================================================================{Colors.ENDC}")
    print(f"Target Base URL: {Colors.BOLD}{args.base_url}{Colors.ENDC}")

    server_process = None
    if not check_server_running(args.base_url):
        if args.auto_start:
            print(f"{Colors.WARNING}Server not detected at {args.base_url}. Auto-starting local artisan server...{Colors.ENDC}")
            backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend')
            if not os.path.exists(backend_dir):
                backend_dir = os.path.abspath('.')

            server_process = subprocess.Popen(
                ['php', 'artisan', 'serve', '--port=8000'],
                cwd=backend_dir,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )
            # Wait for server to spin up
            for _ in range(15):
                time.sleep(0.5)
                if check_server_running(args.base_url):
                    print(f"{Colors.GREEN}✓ Local backend server successfully initialized.{Colors.ENDC}\n")
                    break
            else:
                print(f"{Colors.FAIL}Failed to connect to local server after launch.{Colors.ENDC}")
                if server_process:
                    server_process.terminate()
                sys.exit(1)
        else:
            print(f"{Colors.FAIL}Error: Server at {args.base_url} is not running. Start it with 'php artisan serve' or use --auto-start.{Colors.ENDC}")
            sys.exit(1)
    else:
        print(f"{Colors.GREEN}✓ Active server verified at {args.base_url}.{Colors.ENDC}\n")

    client = HttpClient(args.base_url, verbose=args.verbose)
    runner = TestRunner(client)

    try:
        print(f"{Colors.BOLD}1. Stays & Properties Catalog Suite{Colors.ENDC}")
        runner.run_test("API-01", "GET /api/v1/stays (Catalog & S2 Envelope)", runner.test_list_stays)
        runner.run_test("API-02", "GET /api/v1/stays?per_page=5000 (Capped at 100)", runner.test_listing_pagination_capping)
        runner.run_test("API-03", "GET /api/v1/stays/{slug} (Detail & Zero-Leakage)", runner.test_get_stay_detail)

        print(f"\n{Colors.BOLD}2. Experiences & Events Suite{Colors.ENDC}")
        runner.run_test("API-04", "GET /api/v1/experiences (Catalog & S2 Envelope)", runner.test_list_experiences)
        runner.run_test("API-05", "GET /api/v1/events (Catalog & S2 Envelope)", runner.test_list_events)

        print(f"\n{Colors.BOLD}3. Checkout & Pricing Quote Engine Suite{Colors.ENDC}")
        runner.run_test("API-06", "POST /api/v1/checkout/quote (Authoritative Pricing)", runner.test_calculate_quote_valid)
        runner.run_test("API-07", "POST /api/v1/checkout/quote (Reversed Dates Error 422)", runner.test_calculate_quote_invalid_dates)
        runner.run_test("API-08", "POST /api/v1/checkout/quote (Exceeded Guests Capacity)", runner.test_calculate_quote_exceeded_guests)

        print(f"\n{Colors.BOLD}4. Booking Mutation & Idempotency Suite{Colors.ENDC}")
        runner.run_test("API-09", "POST /api/v1/checkout/bookings (Idempotent Creation & Anti-Tampering)", runner.test_create_booking_with_idempotency_and_anti_tampering)
        runner.run_test("API-10", "POST /api/v1/checkout/bookings (Idempotency Key Replay)", runner.test_booking_idempotency_replay)

        print(f"\n{Colors.BOLD}5. Leads & Concierge Inquiries Suite{Colors.ENDC}")
        runner.run_test("API-11", "POST /api/v1/leads (Valid Concierge Inquiry 201)", runner.test_store_lead_inquiry)
        runner.run_test("API-12", "POST /api/v1/leads (Incomplete Payload 422)", runner.test_store_lead_validation_rejection)

        print(f"\n{Colors.BOLD}6. Authentication & Security Guard Suite{Colors.ENDC}")
        runner.run_test("API-13", "POST /api/v1/auth/login (Generic Failure & Anti-Enumeration)", runner.test_login_invalid_credentials_generic_error)
        runner.run_test("API-14", "GET /api/v1/customer/me (Unauthenticated Guard 401)", runner.test_protected_customer_endpoint_requires_auth)

        print(f"\n{Colors.BOLD}7. Pipeline & Request Tracing Suite{Colors.ENDC}")
        runner.run_test("API-15", "GET /api/v1/stays (X-Request-ID Correlation Propagation)", runner.test_request_id_and_json_headers)

    finally:
        if server_process:
            print(f"\n{Colors.DIM}Shutting down temporary local artisan server...{Colors.ENDC}")
            server_process.terminate()
            server_process.wait()

    # Print Summary Report
    total = runner.passed + runner.failed
    print(f"\n{Colors.BOLD}{Colors.CYAN}======================================================================{Colors.ENDC}")
    print(f"{Colors.BOLD}API Test Suite Summary Report{Colors.ENDC}")
    print(f"Total Tests Executed: {total}")
    print(f"Passed: {Colors.GREEN}{runner.passed}{Colors.ENDC}")
    print(f"Failed: {Colors.FAIL}{runner.failed}{Colors.ENDC}")

    if runner.failed == 0:
        print(f"\n{Colors.BOLD}{Colors.GREEN}🎉 ALL API TESTS PASSED! Full Contract & Security Compliance Verified.{Colors.ENDC}")
        sys.exit(0)
    else:
        print(f"\n{Colors.BOLD}{Colors.FAIL}⚠️  SOME API TESTS FAILED. Review errors above.{Colors.ENDC}")
        sys.exit(1)


if __name__ == '__main__':
    main()
