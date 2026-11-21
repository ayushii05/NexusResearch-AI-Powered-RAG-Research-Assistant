"""NexusResearch — Network Security Test Suite.

Validates:
1. OWASP Security Headers across endpoints.
2. In-memory sliding-window Rate Limiting & 429 response handling.
3. SSRF (Server-Side Request Forgery) protection & IP blocking.
4. Security Health & Status endpoint.
"""

import sys
import unittest
# pyrefly: ignore [missing-import]
from fastapi.testclient import TestClient

from main import app
from services.security import (
    rate_limiter,
    validate_safe_url,
    is_ip_private_or_restricted,
    RATE_LIMIT_TIERS
)


class TestNetworkSecurity(unittest.TestCase):

    def setUp(self):
        self.client = TestClient(app)
        rate_limiter.reset_for_test()

    def test_01_security_headers_present(self):
        """Verify all OWASP security headers are present on responses."""
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)

        headers = response.headers
        self.assertEqual(headers.get("x-content-type-options"), "nosniff")
        self.assertEqual(headers.get("x-frame-options"), "DENY")
        self.assertEqual(headers.get("x-xss-protection"), "1; mode=block")
        self.assertEqual(headers.get("referrer-policy"), "strict-origin-when-cross-origin")
        self.assertIn("max-age=31536000", headers.get("strict-transport-security", ""))
        self.assertIn("geolocation=()", headers.get("permissions-policy", ""))
        self.assertIn("default-src 'self'", headers.get("content-security-policy", ""))

    def test_02_rate_limit_headers_injected(self):
        """Verify X-RateLimit-Limit and X-RateLimit-Remaining headers are sent."""
        response = self.client.get("/api/security/status")
        self.assertEqual(response.status_code, 200)
        self.assertIn("x-ratelimit-limit", response.headers)
        self.assertIn("x-ratelimit-remaining", response.headers)

    def test_03_rate_limiting_triggers_429(self):
        """Verify rate limiter blocks client and returns 429 when threshold is exceeded."""
        # Use low threshold for testing
        test_ip = "198.51.100.1" # Test simulated IP

        limit = 5
        # Simulate 5 allowed requests
        for _ in range(limit):
            allowed, max_lim, rem, retry = rate_limiter.is_allowed(test_ip, tier="test_tier", max_requests=limit)
            self.assertTrue(allowed)

        # 6th request must be blocked
        allowed, max_lim, rem, retry = rate_limiter.is_allowed(test_ip, tier="test_tier", max_requests=limit)
        self.assertFalse(allowed)
        self.assertEqual(rem, 0)
        self.assertGreater(retry, 0)

    def test_04_ssrf_blocks_localhost_and_loopback(self):
        """Verify SSRF guard blocks localhost, loopback IPs, and 127.0.0.1."""
        with self.assertRaises(ValueError) as ctx:
            validate_safe_url("http://localhost:8000/api/internal")
        self.assertIn("Network Security", str(ctx.exception))

        with self.assertRaises(ValueError) as ctx:
            validate_safe_url("http://127.0.0.1:8000/secret")
        self.assertIn("Network Security", str(ctx.exception))

    def test_05_ssrf_blocks_cloud_metadata(self):
        """Verify SSRF guard blocks AWS / GCP / Azure metadata endpoint 169.254.169.254."""
        with self.assertRaises(ValueError) as ctx:
            validate_safe_url("http://169.254.169.254/latest/meta-data/")
        self.assertIn("Network Security", str(ctx.exception))

    def test_06_ssrf_blocks_private_lan_ips(self):
        """Verify SSRF guard blocks RFC 1918 private subnets."""
        private_test_urls = [
            "http://10.0.0.1/admin",
            "http://192.168.1.1/router",
            "http://172.16.0.5/internal",
        ]
        for url in private_test_urls:
            with self.assertRaises(ValueError) as ctx:
                validate_safe_url(url)
            self.assertIn("Network Security", str(ctx.exception))

    def test_07_ssrf_blocks_non_http_schemes(self):
        """Verify SSRF guard blocks file://, ftp://, gopher:// schemes."""
        bad_schemes = [
            "file:///etc/passwd",
            "ftp://files.example.com",
            "gopher://internal:70",
        ]
        for url in bad_schemes:
            with self.assertRaises(ValueError):
                validate_safe_url(url)

    def test_08_ssrf_allows_public_https_url(self):
        """Verify SSRF guard allows legitimate public HTTPS domains."""
        public_url = "https://en.wikipedia.org/wiki/Artificial_intelligence"
        validated = validate_safe_url(public_url)
        self.assertEqual(validated, public_url)

    def test_09_security_status_endpoint(self):
        """Verify /api/security/status returns valid active network security posture."""
        response = self.client.get("/api/security/status")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "active")
        self.assertTrue(data["network_protections"]["owasp_security_headers"])
        self.assertTrue(data["network_protections"]["sliding_window_rate_limiting"])
        self.assertTrue(data["network_protections"]["ssrf_protection"])
        self.assertTrue(data["network_protections"]["cors_hardened"])


if __name__ == "__main__":
    unittest.main()
