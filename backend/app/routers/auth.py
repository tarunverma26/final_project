import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends, status
from app.database import db
from app.config import AUTHORITY_LIST
from app.models.auth import UserRegister, AdminRegister, UserLogin, UserOut, AuthResponse
from app.utils.security import hash_password, verify_password, create_access_token
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.get("/authorities")
async def list_authorities():
    """Return available public road authorities for admin registration."""
    return {"authorities": AUTHORITY_LIST}


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: UserRegister):
    """Register a new citizen account."""
    email = payload.email.lower().strip()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address is already registered."
        )

    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "id": user_id,
        "email": email,
        "name": payload.name.strip(),
        "role": "user",
        "authority": None,
        "department": payload.department,
        "password_hash": hash_password(payload.password),
        "is_active": True,
        "created_at": now,
    }
    await db.users.insert_one(doc)

    token = create_access_token(user_id, email, "user", department=payload.department, authority=None)
    return AuthResponse(
        token=token,
        user=UserOut(
            id=user_id,
            email=email,
            name=payload.name.strip(),
            role="user",
            authority=None,
            department=payload.department
        ),
    )


@router.post("/admin/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register_admin(payload: AdminRegister):
    """
    Register a new administrator account with authority invite-code verification.
    
    NOTE: This uses an authority shared-secret invite code. A production release
    would add domain-based email verification (e.g., official @nhai.gov.in domain)
    and manual superadmin approval as a next security enhancement.
    """
    email = payload.email.lower().strip()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address is already registered."
        )

    target_auth = payload.authority.strip()
    if target_auth not in AUTHORITY_LIST:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid authority '{target_auth}'. Must be one of: {', '.join(AUTHORITY_LIST)}"
        )

    # Validate invite code against authority_invite_codes collection
    submitted_code = payload.invite_code.strip().upper()
    code_record = await db.authority_invite_codes.find_one({
        "authority": target_auth,
        "is_active": True,
    })

    if not code_record or code_record.get("code", "").strip().upper() != submitted_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid invite code for {target_auth}. Please contact your department coordinator."
        )

    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "id": user_id,
        "email": email,
        "name": payload.name.strip(),
        "role": "admin",
        "authority": target_auth,
        "department": f"{target_auth} Administration",
        "password_hash": hash_password(payload.password),
        "is_active": True,
        "created_at": now,
    }
    await db.users.insert_one(doc)

    token = create_access_token(
        user_id,
        email,
        "admin",
        department=f"{target_auth} Administration",
        authority=target_auth,
    )

    return AuthResponse(
        token=token,
        user=UserOut(
            id=user_id,
            email=email,
            name=payload.name.strip(),
            role="admin",
            authority=target_auth,
            department=f"{target_auth} Administration",
        ),
    )


@router.post("/login", response_model=AuthResponse)
async def login(payload: UserLogin):
    """Authenticate citizen or administration user."""
    email = payload.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password combination."
        )

    # Validate role gate
    if payload.role == "admin" and user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account does not have administrative privileges."
        )

    token = create_access_token(
        user["id"],
        user["email"],
        user["role"],
        department=user.get("department"),
        authority=user.get("authority"),
    )
    return AuthResponse(
        token=token,
        user=UserOut(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            role=user["role"],
            authority=user.get("authority"),
            department=user.get("department")
        ),
    )


@router.get("/me", response_model=UserOut)
async def me(user: dict = Depends(get_current_user)):
    """Retrieve profile of currently authenticated user."""
    return UserOut(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        role=user["role"],
        authority=user.get("authority"),
        department=user.get("department")
    )

