from typing import Literal, Optional
from pydantic import BaseModel, EmailStr, Field


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    name: str = Field(min_length=1, max_length=80)
    department: Optional[str] = None
    authority: Optional[str] = None


class AdminRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    name: str = Field(min_length=1, max_length=80)
    authority: str = Field(..., min_length=2, max_length=80)
    invite_code: str = Field(..., min_length=4, max_length=100)


class UserLogin(BaseModel):
    email: EmailStr
    password: str
    role: Literal["user", "admin"] = "user"


class UserOut(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: str
    authority: Optional[str] = None
    department: Optional[str] = None


class AuthResponse(BaseModel):
    token: str
    user: UserOut


class AuthorityInviteCode(BaseModel):
    id: str
    authority: str
    code: str
    description: Optional[str] = None
    is_active: bool = True
    created_at: str

