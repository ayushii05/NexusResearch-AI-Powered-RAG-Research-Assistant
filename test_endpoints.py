import os
import sys
sys.path.insert(0, os.path.abspath("."))

# pyrefly: ignore [missing-import]
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_auth_endpoints():
    print("Testing /api/auth/guest...")
    res = client.post("/api/auth/guest")
    assert res.status_code == 200, f"Guest login failed: {res.text}"
    guest_data = res.json()
    assert "token" in guest_data
    assert guest_data["user"]["email"] == "demo@nexusresearch.ai"
    token = guest_data["token"]
    print("Guest login endpoint working!")

    print("Testing /api/auth/me...")
    res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200, f"Get me failed: {res.text}"
    me_data = res.json()
    assert me_data["email"] == "demo@nexusresearch.ai"
    print("/api/auth/me working!")

    print("Testing /api/auth/register...")
    import uuid
    new_email = f"user_{uuid.uuid4().hex[:6]}@domain.com"
    res = client.post("/api/auth/register", json={
        "name": "Jane Doe",
        "email": new_email,
        "password": "strongPassword123!"
    })
    assert res.status_code == 201, f"Register failed: {res.text}"
    reg_data = res.json()
    assert reg_data["user"]["name"] == "Jane Doe"
    assert reg_data["user"]["email"] == new_email
    print("/api/auth/register working!")

    print("Testing /api/auth/login...")
    res = client.post("/api/auth/login", json={
        "email": new_email,
        "password": "strongPassword123!"
    })
    assert res.status_code == 200, f"Login failed: {res.text}"
    login_data = res.json()
    assert "token" in login_data
    print("/api/auth/login working!")

    print("Testing /api/auth/login with bad password...")
    res = client.post("/api/auth/login", json={
        "email": new_email,
        "password": "wrongpassword"
    })
    assert res.status_code == 401
    print("Bad password correctly rejected!")

    print("\nALL FASTAPI AUTH ENDPOINT TESTS PASSED!")

if __name__ == "__main__":
    test_auth_endpoints()
