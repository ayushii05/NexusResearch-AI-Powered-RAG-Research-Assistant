import uuid
# pyrefly: ignore [missing-import]
from fastapi import APIRouter, HTTPException, Depends, status
from models.schemas import (
    UserRegisterRequest,
    UserLoginRequest,
    UserResponse,
    AuthResponse
)
from services.auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user_payload
)
from services.db import (
    create_user,
    get_user_by_email,
    get_user_by_id
)

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(req: UserRegisterRequest):
    clean_email = req.email.strip().lower()
    clean_name = req.name.strip()
    
    if not clean_email or "@" not in clean_email:
        raise HTTPException(status_code=400, detail="Please provide a valid email address.")
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")
    if not clean_name:
        clean_name = clean_email.split("@")[0].capitalize()
        
    existing_user = get_user_by_email(clean_email)
    if existing_user:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
        
    user_id = f"usr_{uuid.uuid4().hex[:12]}"
    pw_hash = hash_password(req.password)
    user = create_user(user_id=user_id, name=clean_name, email=clean_email, password_hash=pw_hash)
    
    token = create_access_token({
        "sub": user["id"],
        "email": user["email"],
        "name": user["name"]
    })
    
    return AuthResponse(
        token=token,
        user=UserResponse(
            id=user["id"],
            name=user["name"],
            email=user["email"],
            created_at=user["created_at"]
        )
    )

@router.post("/login", response_model=AuthResponse)
async def login(req: UserLoginRequest):
    clean_email = req.email.strip().lower()
    user = get_user_by_email(clean_email)
    
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please check your credentials."
        )
        
    token = create_access_token({
        "sub": user["id"],
        "email": user["email"],
        "name": user["name"]
    })
    
    return AuthResponse(
        token=token,
        user=UserResponse(
            id=user["id"],
            name=user["name"],
            email=user["email"],
            created_at=user["created_at"]
        )
    )

@router.get("/me", response_model=UserResponse)
async def get_me(payload: dict = Depends(get_current_user_payload)):
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required or token expired."
        )
        
    user = get_user_by_id(payload["sub"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found."
        )
        
    return UserResponse(
        id=user["id"],
        name=user["name"],
        email=user["email"],
        created_at=user["created_at"]
    )

@router.post("/guest", response_model=AuthResponse)
async def guest_login():
    demo_email = "demo@nexusresearch.ai"
    user = get_user_by_email(demo_email)
    
    if not user:
        user_id = "user_demo_01"
        pw_hash = hash_password("password123")
        user = create_user(
            user_id=user_id,
            name="Demo Researcher",
            email=demo_email,
            password_hash=pw_hash
        )
        
    token = create_access_token({
        "sub": user["id"],
        "email": user["email"],
        "name": user["name"]
    })
    
    return AuthResponse(
        token=token,
        user=UserResponse(
            id=user["id"],
            name=user["name"],
            email=user["email"],
            created_at=user["created_at"]
        )
    )
