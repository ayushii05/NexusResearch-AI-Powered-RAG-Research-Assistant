"""NexusResearch — Network Security Module.

Provides:
- SSRF (Server-Side Request Forgery) protection for outgoing web/media requests.
- In-memory sliding-window IP rate limiter with configurable tiers and RFC headers.
- OWASP-compliant security headers middleware.
"""

import ipaddress
import os
import socket
import time
from collections import defaultdict
from threading import Lock
from urllib.parse import urlparse
# pyrefly: ignore [missing-import]
from starlette.middleware.base import BaseHTTPMiddleware
# pyrefly: ignore [missing-import]
from starlette.requests import Request
# pyrefly: ignore [missing-import]
from starlette.responses import JSONResponse, Response


# ============================================================================
# 1. SSRF (Server-Side Request Forgery) Guard
# ============================================================================

_DISALLOWED_HOSTS = {
    "localhost",
    "metadata.google.internal",
    "169.254.169.254", # AWS / GCP / Azure metadata service
    "instance-data",
}

_ALLOWED_SCHEMES = {"http", "https"}


def is_ip_private_or_restricted(ip_str: str) -> bool:
    """Return True if the IP is loopback, private, link-local, multicast, or reserved."""
    try:
        ip = ipaddress.ip_address(ip_str)
        return (
            ip.is_private
            or ip.is_loopback
            or ip.is_link_local
            or ip.is_multicast
            or ip.is_reserved
            or ip.is_unspecified
        )
    except ValueError:
        # Not a raw IP literal (e.g., it's a domain name like en.wikipedia.org)
        return False


def validate_safe_url(url: str) -> str:
    """Validate that `url` is a safe, publicly reachable HTTP/HTTPS destination.

    Raises ValueError if:
    - Scheme is not http or https.
    - Host resolves to localhost, private RFC 1918 IPs, loopback, or cloud metadata.
    - URL structure is malformed.
    """
    if not url or not isinstance(url, str):
        raise ValueError("URL must be a non-empty string.")

    cleaned_url = url.strip()
    parsed = urlparse(cleaned_url)

    if parsed.scheme.lower() not in _ALLOWED_SCHEMES:
        raise ValueError(
            f"Invalid protocol '{parsed.scheme}'. Only HTTP and HTTPS are permitted."
        )

    hostname = parsed.hostname
    if not hostname:
        raise ValueError(f"Could not extract a valid host from URL: '{url}'")

    hostname_lower = hostname.lower()

    if hostname_lower in _DISALLOWED_HOSTS or hostname_lower.endswith(".local") or hostname_lower.endswith(".internal"):
        raise ValueError(
            f"Network Security: Access to internal / private host '{hostname}' is blocked."
        )

    # Check if host itself is a raw IP literal (e.g. 127.0.0.1, 10.0.0.1, 169.254.169.254)
    if is_ip_private_or_restricted(hostname):
        raise ValueError(
            f"Network Security (SSRF Protection): Host '{hostname}' is a restricted private/local IP. Request blocked."
        )

    # Resolve hostname to IPv4 and IPv6 to prevent DNS rebinding / private IP targeting
    try:
        addr_info = socket.getaddrinfo(hostname, parsed.port or (443 if parsed.scheme == "https" else 80), proto=socket.IPPROTO_TCP)
    except socket.gaierror as e:
        raise ValueError(f"DNS resolution failed for host '{hostname}': {e}") from e

    if not addr_info:
        raise ValueError(f"No IP addresses resolved for host '{hostname}'")

    for family, _, _, _, sockaddr in addr_info:
        ip_str = sockaddr[0]
        # pyrefly: ignore [bad-argument-type]
        if is_ip_private_or_restricted(ip_str):
            raise ValueError(
                f"Network Security (SSRF Protection): Host '{hostname}' resolves to restricted IP ({ip_str}). Request blocked."
            )

    return cleaned_url


# ============================================================================
# 2. In-Memory Sliding-Window Rate Limiter
# ============================================================================

class SlidingWindowRateLimiter:
    """Thread-safe sliding-window rate limiter per client IP."""

    def __init__(self):
        self._lock = Lock()
        # Storage: { tier: { ip: [timestamp1, timestamp2, ...] } }
        self._requests: dict[str, dict[str, list[float]]] = defaultdict(lambda: defaultdict(list))
        self._last_cleanup = time.time()

    def _cleanup_expired(self, current_time: float, window_seconds: float = 60.0):
        """Periodically purge expired records to prevent unbounded memory growth."""
        if current_time - self._last_cleanup > 300.0: # Run every 5 minutes
            for tier_dict in self._requests.values():
                for ip in list(tier_dict.keys()):
                    tier_dict[ip] = [t for t in tier_dict[ip] if current_time - t < window_seconds]
                    if not tier_dict[ip]:
                        del tier_dict[ip]
            self._last_cleanup = current_time

    def is_allowed(
        self, client_ip: str, tier: str = "general", max_requests: int = 60, window_seconds: float = 60.0
    ) -> tuple[bool, int, int, int]:
        """Check if request is allowed.

        Returns:
            (allowed: bool, limit: int, remaining: int, retry_after_seconds: int)
        """
        now = time.time()
        window_start = now - window_seconds

        with self._lock:
            self._cleanup_expired(now, window_seconds)
            timestamps = self._requests[tier][client_ip]

            # Filter timestamps within current window
            valid_timestamps = [t for t in timestamps if t > window_start]
            self._requests[tier][client_ip] = valid_timestamps

            count = len(valid_timestamps)
            if count >= max_requests:
                oldest_in_window = valid_timestamps[0]
                retry_after = int(max(1, (oldest_in_window + window_seconds) - now))
                return False, max_requests, 0, retry_after

            # Record this request
            self._requests[tier][client_ip].append(now)
            remaining = max(0, max_requests - (count + 1))
            return True, max_requests, remaining, 0

    def reset_for_test(self):
        """Reset rate limiter state (used in unit tests)."""
        with self._lock:
            self._requests.clear()


rate_limiter = SlidingWindowRateLimiter()


# Tier configurations (requests per minute)
RATE_LIMIT_TIERS = {
    "auth": int(os.getenv("RATE_LIMIT_AUTH", "20")),       # Login, register, guest
    "ingest": int(os.getenv("RATE_LIMIT_INGEST", "40")),   # PDF, URL, YouTube upload
    "chat": int(os.getenv("RATE_LIMIT_CHAT", "60")),       # AI Chat streaming
    "general": int(os.getenv("RATE_LIMIT_GENERAL", "120")), # All other endpoints
}


def get_client_ip(request: Request) -> str:
    """Extract client IP, taking X-Forwarded-For into account if behind a reverse proxy."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        # First IP in list is the client
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "127.0.0.1"


# ============================================================================
# 3. Rate Limit ASGI Middleware
# ============================================================================

class RateLimitMiddleware(BaseHTTPMiddleware):
    """ASGI Middleware that applies rate limits and appends RFC rate limit headers."""

    async def dispatch(self, request: Request, call_next) -> Response:
        path = request.url.path

        # Ignore OPTIONS preflight, root, and docs
        if request.method == "OPTIONS" or path in ("/docs", "/openapi.json", "/redoc", "/"):
            return await call_next(request)

        # Classify route tier
        if path.startswith("/api/auth/"):
            tier = "auth"
        elif path.startswith("/api/ingest/"):
            tier = "ingest"
        elif path.startswith("/api/chat"):
            tier = "chat"
        else:
            tier = "general"

        limit = RATE_LIMIT_TIERS.get(tier, 120)
        client_ip = get_client_ip(request)

        allowed, max_limit, remaining, retry_after = rate_limiter.is_allowed(
            client_ip=client_ip,
            tier=tier,
            max_requests=limit,
            window_seconds=60.0
        )

        if not allowed:
            headers = {
                "X-RateLimit-Limit": str(max_limit),
                "X-RateLimit-Remaining": "0",
                "Retry-After": str(retry_after),
            }
            return JSONResponse(
                status_code=429,
                content={
                    "detail": f"Rate limit exceeded for {tier} requests. Please try again in {retry_after} seconds.",
                    "tier": tier,
                    "retry_after": retry_after
                },
                headers=headers
            )

        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(max_limit)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        return response


# ============================================================================
# 4. OWASP Security Headers Middleware
# ============================================================================

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Applies OWASP-recommended HTTP security headers to all responses."""

    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)

        # 1. Prevent MIME-type sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"

        # 2. Prevent Clickjacking
        response.headers["X-Frame-Options"] = "DENY"

        # 3. Cross-Site Scripting (XSS) Filter in legacy browsers
        response.headers["X-XSS-Protection"] = "1; mode=block"

        # 4. Referrer Policy
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        # 5. Restrict dangerous browser features
        response.headers["Permissions-Policy"] = "geolocation=(), camera=(), microphone=(), payment=()"

        # 6. HTTP Strict Transport Security (HSTS)
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

        # 7. Content-Security-Policy (CSP)
        if "Content-Security-Policy" not in response.headers:
            response.headers["Content-Security-Policy"] = (
                "default-src 'self'; "
                "connect-src 'self' http: https: ws: wss:; "
                "script-src 'self' 'unsafe-inline'; "
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
                "font-src 'self' https://fonts.gstatic.com data:; "
                "img-src 'self' data: https: blob:; "
                "frame-ancestors 'none';"
            )

        return response
