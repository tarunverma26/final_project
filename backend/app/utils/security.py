from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any
import bcrypt
import jwt
from app.config import JWT_SECRET, JWT_ALGORITHM, ACCESS_TOKEN_EXPIRE_DAYS


def hash_password(password: str) -> str:
    """Hash plaintext password with bcrypt."""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plaintext password against bcrypt hash."""
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False


def create_access_token(
    user_id: str,
    email: str,
    role: str,
    department: Optional[str] = None,
    authority: Optional[str] = None,
) -> str:
    """Create signed HS256 JWT access token with expiration."""
    payload: Dict[str, Any] = {
        "sub": user_id,
        "email": email,
        "role": role,
        "department": department,
        "authority": authority,
        "exp": datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS),
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)



def decode_access_token(token: str) -> Dict[str, Any]:
    """Decode and validate JWT access token."""
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
