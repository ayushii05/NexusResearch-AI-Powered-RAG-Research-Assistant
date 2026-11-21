"""NexusResearch — FastAPI application entrypoint with Network Security."""

import os
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv
# pyrefly: ignore [missing-import]
from fastapi import FastAPI
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware

from routers import chat, ingest, projects, auth
from services.db import init_db
from services.security import (
    SecurityHeadersMiddleware,
    RateLimitMiddleware,
    RATE_LIMIT_TIERS,
)

load_dotenv()
init_db()

app = FastAPI(title="NexusResearch", description="AI Research Workspace with Network Security")


# Manual OPTIONS catch-all, registered before CORS middleware is added.
# This avoids 400 errors on CORS preflight requests, a known issue with
# FastAPI + the Vite dev server.
@app.options("/{rest_of_path:path}")
async def preflight_handler(rest_of_path: str) -> dict:
    return {}


# 1. OWASP Security Headers Middleware
app.add_middleware(SecurityHeadersMiddleware)

# 2. Network Rate Limiting Middleware
app.add_middleware(RateLimitMiddleware)

# 3. Dynamic CORS Middleware Configuration
raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
allowed_origins = [o.strip() for o in raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-RateLimit-Limit", "X-RateLimit-Remaining", "Retry-After"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(ingest.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(projects.router, prefix="/api")


@app.get("/")
async def root() -> dict:
    return {"status": "ok", "service": "NexusResearch"}


@app.get("/api/security/status")
async def security_status() -> dict:
    """Returns network security status and active protection configurations."""
    return {
        "status": "active",
        "network_protections": {
            "owasp_security_headers": True,
            "sliding_window_rate_limiting": True,
            "ssrf_protection": True,
            "cors_hardened": True,
        },
        "rate_limit_tiers_rpm": RATE_LIMIT_TIERS,
        "allowed_origins": allowed_origins,
    }
