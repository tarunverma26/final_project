from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import logging
import uuid
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Literal

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field, ConfigDict


# ---------------- Mongo ----------------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# ---------------- App ----------------
app = FastAPI(title="ROADWATCH API")
api_router = APIRouter(prefix="/api")

JWT_ALGORITHM = "HS256"
TIMELINE_STEPS = [
    "SUBMITTED", "UNDER_REVIEW", "FORWARDED", "ASSIGNED",
    "WORK_PLANNED", "WORK_IN_PROGRESS", "RESOLUTION",
    "VERIFIED", "RESOLVED",
]


# ---------------- Helpers ----------------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "access",
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


async def get_current_user(request: Request) -> dict:
    token = None
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header[7:]
    if not token:
        token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


# ---------------- Models ----------------
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = Field(min_length=1, max_length=80)


class UserLogin(BaseModel):
    email: EmailStr
    password: str
    role: Literal["user", "admin"] = "user"


class UserOut(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: str


class AuthResponse(BaseModel):
    token: str
    user: UserOut


class ReportCreate(BaseModel):
    category: str
    severity: Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"] = "MEDIUM"
    description: str = ""
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    road_name: Optional[str] = None
    photo_url: Optional[str] = None


class Report(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    user_name: str
    category: str
    severity: str
    description: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    road_name: Optional[str] = None
    photo_url: Optional[str] = None
    status: str = "SUBMITTED"
    ai_assessment: dict
    timeline: list
    created_at: str


# ---------------- AI Mock ----------------
def mock_ai_assessment(category: str, severity: str) -> dict:
    sev_map = {"LOW": 62, "MEDIUM": 78, "HIGH": 91, "CRITICAL": 96}
    confidence = sev_map.get(severity, 80)
    priority = "CRITICAL" if severity in ("HIGH", "CRITICAL") else "MEDIUM"
    return {
        "category": category,
        "severity": severity,
        "safety_risk": "HIGH" if severity in ("HIGH", "CRITICAL") else "MEDIUM",
        "confidence": confidence,
        "priority": priority,
        "recommendation": "Immediate patching required" if severity == "CRITICAL"
                          else "Schedule maintenance within 7 days",
    }


def initial_timeline() -> list:
    now = datetime.now(timezone.utc).isoformat()
    return [
        {"step": s, "status": "completed" if i == 0 else "pending",
         "timestamp": now if i == 0 else None}
        for i, s in enumerate(TIMELINE_STEPS)
    ]


# ---------------- Auth Routes ----------------
@api_router.post("/auth/register", response_model=AuthResponse)
async def register(payload: UserRegister):
    email = payload.email.lower()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = str(uuid.uuid4())
    doc = {
        "id": user_id,
        "email": email,
        "name": payload.name,
        "role": "user",
        "password_hash": hash_password(payload.password),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(doc)
    token = create_access_token(user_id, email, "user")
    return AuthResponse(
        token=token,
        user=UserOut(id=user_id, email=email, name=payload.name, role="user"),
    )


@api_router.post("/auth/login", response_model=AuthResponse)
async def login(payload: UserLogin):
    email = payload.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if payload.role == "admin" and user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="This account is not an administrator")
    token = create_access_token(user["id"], user["email"], user["role"])
    return AuthResponse(
        token=token,
        user=UserOut(id=user["id"], email=user["email"], name=user["name"], role=user["role"]),
    )


@api_router.get("/auth/me", response_model=UserOut)
async def me(user: dict = Depends(get_current_user)):
    return UserOut(id=user["id"], email=user["email"], name=user["name"], role=user["role"])


# ---------------- Reports Routes ----------------
@api_router.post("/reports", response_model=Report)
async def create_report(payload: ReportCreate, user: dict = Depends(get_current_user)):
    report_id = str(uuid.uuid4())
    doc = {
        "id": report_id,
        "user_id": user["id"],
        "user_name": user["name"],
        "category": payload.category,
        "severity": payload.severity,
        "description": payload.description,
        "latitude": payload.latitude,
        "longitude": payload.longitude,
        "road_name": payload.road_name,
        "photo_url": payload.photo_url,
        "status": "SUBMITTED",
        "ai_assessment": mock_ai_assessment(payload.category, payload.severity),
        "timeline": initial_timeline(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.reports.insert_one(doc)
    doc.pop("_id", None)
    return Report(**doc)


@api_router.get("/reports", response_model=List[Report])
async def list_reports(mine: bool = False, user: dict = Depends(get_current_user)):
    query = {}
    if mine or user.get("role") != "admin":
        query["user_id"] = user["id"]
    if user.get("role") == "admin" and not mine:
        query = {}
    cursor = db.reports.find(query, {"_id": 0}).sort("created_at", -1)
    docs = await cursor.to_list(500)
    return [Report(**d) for d in docs]


@api_router.get("/reports/public", response_model=List[Report])
async def list_public_reports():
    """Public feed for the map view."""
    cursor = db.reports.find({}, {"_id": 0}).sort("created_at", -1)
    docs = await cursor.to_list(500)
    return [Report(**d) for d in docs]


@api_router.get("/reports/{report_id}", response_model=Report)
async def get_report(report_id: str, user: dict = Depends(get_current_user)):
    doc = await db.reports.find_one({"id": report_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Report not found")
    if user["role"] != "admin" and doc["user_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Forbidden")
    return Report(**doc)


@api_router.post("/reports/{report_id}/advance", response_model=Report)
async def advance_report(report_id: str, user: dict = Depends(require_admin)):
    doc = await db.reports.find_one({"id": report_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Report not found")
    timeline = doc["timeline"]
    for i, step in enumerate(timeline):
        if step["status"] == "pending":
            timeline[i]["status"] = "completed"
            timeline[i]["timestamp"] = datetime.now(timezone.utc).isoformat()
            doc["status"] = step["step"]
            break
    await db.reports.update_one(
        {"id": report_id},
        {"$set": {"timeline": timeline, "status": doc["status"]}},
    )
    return Report(**doc)


# ---------------- Stats ----------------
@api_router.get("/stats/overview")
async def stats_overview():
    total = await db.reports.count_documents({})
    resolved = await db.reports.count_documents({"status": "RESOLVED"})
    in_progress = await db.reports.count_documents(
        {"status": {"$in": ["WORK_IN_PROGRESS", "WORK_PLANNED", "ASSIGNED"]}}
    )
    critical = await db.reports.count_documents({"severity": "CRITICAL"})
    if total == 0:
        # Showcase fallbacks when DB is empty (for the marketing hero)
        return {
            "total_problems": 2481,
            "resolved_or_progress_pct": 73,
            "resolved": 0,
            "in_progress": 0,
            "critical": 0,
        }
    pct = round(((resolved + in_progress) / total) * 100)
    return {
        "total_problems": total,
        "resolved_or_progress_pct": pct,
        "resolved": resolved,
        "in_progress": in_progress,
        "critical": critical,
    }


# ---------------- Identify Road (mock) ----------------
@api_router.get("/roads/identify")
async def identify_road(lat: float, lng: float):
    """Mocked GPS road identification."""
    return {
        "road_name": "NH-48 (Delhi-Jaipur Highway)",
        "road_number": "NH-48",
        "district": "Gurugram",
        "state": "Haryana",
        "condition": "Poor - Multiple potholes reported",
        "authority": "National Highways Authority of India",
        "contractor": "IRB Infrastructure Developers",
        "construction_year": 2016,
        "last_maintenance": "2024-03-12",
        "funding_source": "Central Government - MoRTH",
        "latitude": lat,
        "longitude": lng,
    }


# ---------------- Seed ----------------
async def seed_users():
    admin_email = os.environ.get("ADMIN_EMAIL")
    admin_pw = os.environ.get("ADMIN_PASSWORD", "admin123")
    if admin_email:
        existing = await db.users.find_one({"email": admin_email.lower()})
        if not existing:
            await db.users.insert_one({
                "id": str(uuid.uuid4()),
                "email": admin_email.lower(),
                "name": "ROADWATCH Admin",
                "role": "admin",
                "password_hash": hash_password(admin_pw),
                "created_at": datetime.now(timezone.utc).isoformat(),
            })
        elif not verify_password(admin_pw, existing["password_hash"]):
            await db.users.update_one(
                {"email": admin_email.lower()},
                {"$set": {"password_hash": hash_password(admin_pw), "role": "admin"}},
            )
        else:
            # Ensure role is admin
            await db.users.update_one(
                {"email": admin_email.lower()},
                {"$set": {"role": "admin"}},
            )

    # Seed a demo citizen
    citizen_email = "citizen@roadwatch.dev"
    if not await db.users.find_one({"email": citizen_email}):
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": citizen_email,
            "name": "Demo Citizen",
            "role": "user",
            "password_hash": hash_password("citizen123"),
            "created_at": datetime.now(timezone.utc).isoformat(),
        })


@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.reports.create_index("created_at")
    await seed_users()


@app.on_event("shutdown")
async def on_shutdown():
    client.close()


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
