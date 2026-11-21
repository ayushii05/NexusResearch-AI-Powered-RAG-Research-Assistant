import os
import sys
sys.path.insert(0, os.path.abspath("."))

from services.db import init_db, get_user_by_email, get_user_by_id, create_user
from services.auth import hash_password, verify_password, create_access_token, verify_access_token

def test_auth_services():
    print("Testing init_db...")
    init_db()
    
    # Test demo user
    demo_user = get_user_by_email("demo@nexusresearch.ai")
    assert demo_user is not None, "Demo user should be seeded"
    assert verify_password("password123", demo_user["password_hash"]), "Demo password should verify"
    assert not verify_password("wrongpassword", demo_user["password_hash"]), "Wrong password should fail"
    print("Demo user verified successfully!")
    
    # Test custom user registration
    test_email = "test_researcher@nexus.ai"
    test_pw = "mysecret123"
    pw_hash = hash_password(test_pw)
    assert verify_password(test_pw, pw_hash), "Hashed password should verify"
    
    user = create_user("test_user_id_999", "Dr. Test", test_email, pw_hash)
    fetched = get_user_by_email(test_email)
    # pyrefly: ignore [unsupported-operation]
    assert fetched["name"] == "Dr. Test"
    # pyrefly: ignore [unsupported-operation]
    assert fetched["id"] == "test_user_id_999"
    print("User creation and retrieval verified successfully!")
    
    # Test token signing and verification
    # pyrefly: ignore [unsupported-operation]
    token = create_access_token({"sub": fetched["id"], "email": fetched["email"]})
    payload = verify_access_token(token)
    assert payload is not None, "Token verification failed"
    assert payload["sub"] == "test_user_id_999", "Payload sub mismatch"
    print("Token generation and verification verified successfully!")
    
    # Test invalid / tampered token
    tampered = token[:-4] + "abcd"
    assert verify_access_token(tampered) is None, "Tampered token should not verify"
    print("Tampered token rejection verified successfully!")
    
    print("\nALL AUTH BACKEND UNIT TESTS PASSED!")

if __name__ == "__main__":
    test_auth_services()
