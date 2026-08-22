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
import httpx
import json
import re
import base64
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent, TextDelta, StreamDone


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
    contractor_id: Optional[str] = None
    citizen_rating: Optional[int] = None


class Contractor(BaseModel):
    id: str
    name: str
    road: str
    region: str
    focus: str


class ContractorScorecard(Contractor):
    total_complaints: int = 0
    resolved: int = 0
    in_progress: int = 0
    resolution_rate_pct: int = 0
    avg_resolution_hours: Optional[float] = None
    avg_rating: Optional[float] = None
    rating_count: int = 0
    trust_score: int = 50
    grade: str = "C"


class RateReport(BaseModel):
    rating: int = Field(ge=1, le=5)


class AuthorityVote(BaseModel):
    road_name: Optional[str] = None
    road_number: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    inferred_authority: Optional[str] = None
    is_correct: bool
    suggested_authority: Optional[str] = None


# ---------------- AI Vision (Claude Sonnet 5) ----------------
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "")

AI_SYSTEM_PROMPT = (
    "You are ROADWATCH's vision inspector. You look at a single photo of a road "
    "problem submitted by a citizen and score it. Respond with ONLY a compact JSON "
    "object (no markdown, no prose) with exactly these fields:\n"
    '{"category": "<one of: Pothole, Damaged Road, Cracks, Waterlogging, Drainage, '
    'Streetlight, Sign, Divider, Traffic Obstruction, Other>",\n'
    ' "severity": "LOW|MEDIUM|HIGH|CRITICAL",\n'
    ' "safety_risk": "LOW|MEDIUM|HIGH",\n'
    ' "confidence": <integer 0-100>,\n'
    ' "priority": "LOW|MEDIUM|HIGH|CRITICAL",\n'
    ' "recommendation": "<one short sentence, actionable>"}\n'
    "Base severity on depth/extent of damage, safety_risk on impact to vehicles/pedestrians, "
    "confidence on how clearly the issue is visible. Never include any extra keys or commentary."
)


def _extract_base64_from_data_url(data_url: str) -> Optional[str]:
    """Return only the base64 payload from a data URL. None if not a data URL."""
    if not data_url or not isinstance(data_url, str):
        return None
    m = re.match(r"^data:image/[a-zA-Z0-9.+-]+;base64,(.+)$", data_url.strip(), re.DOTALL)
    if m:
        return m.group(1)
    # If it's already raw base64
    try:
        base64.b64decode(data_url[:100], validate=True)
        return data_url
    except Exception:
        return None


def _coerce_ai_json(raw: str, hint_category: str) -> dict:
    """Best-effort parse the model output into our AI assessment shape."""
    fallback = mock_ai_assessment(hint_category, "MEDIUM")
    if not raw:
        return fallback
    # Try to extract a JSON object
    match = re.search(r"\{[\s\S]*\}", raw)
    if not match:
        return fallback
    try:
        data = json.loads(match.group(0))
    except Exception:
        return fallback

    def norm(v, allowed, default):
        s = str(v or "").upper().strip()
        return s if s in allowed else default

    severity = norm(data.get("severity"), {"LOW", "MEDIUM", "HIGH", "CRITICAL"}, "MEDIUM")
    priority = norm(data.get("priority"), {"LOW", "MEDIUM", "HIGH", "CRITICAL"}, severity)
    safety = norm(data.get("safety_risk"), {"LOW", "MEDIUM", "HIGH"}, "MEDIUM")
    try:
        conf = int(data.get("confidence", 80))
    except Exception:
        conf = 80
    conf = max(0, min(100, conf))

    return {
        "category": data.get("category") or hint_category,
        "severity": severity,
        "safety_risk": safety,
        "confidence": conf,
        "priority": priority,
        "recommendation": (data.get("recommendation") or "Schedule maintenance based on severity.").strip(),
        "model": "claude-sonnet-5",
    }


async def real_ai_assessment(image_data_url: str, hint_category: str) -> Optional[dict]:
    """Call Claude Sonnet 5 vision via emergentintegrations. Returns None on failure."""
    if not EMERGENT_LLM_KEY:
        return None
    b64 = _extract_base64_from_data_url(image_data_url)
    if not b64:
        return None
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"roadwatch-{uuid.uuid4()}",
            system_message=AI_SYSTEM_PROMPT,
        ).with_model("anthropic", "claude-sonnet-5")

        msg = UserMessage(
            text=(
                f"The citizen selected category: {hint_category}. "
                "Inspect the photo and return the JSON as instructed."
            ),
            file_contents=[ImageContent(image_base64=b64)],
        )
        buf = []
        async for ev in chat.stream_message(msg):
            if isinstance(ev, TextDelta):
                buf.append(ev.content)
            elif isinstance(ev, StreamDone):
                break
        raw = "".join(buf).strip()
        return _coerce_ai_json(raw, hint_category)
    except Exception as e:
        logging.warning(f"[AI] vision assessment failed: {e}")
        return None


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
    # Real AI first (when a photo is present); mock fallback otherwise
    ai = None
    if payload.photo_url:
        ai = await real_ai_assessment(payload.photo_url, payload.category)
    if not ai:
        ai = mock_ai_assessment(payload.category, payload.severity)
    contractor_id = await _pick_contractor_id(payload.road_name)
    doc = {
        "id": report_id,
        "user_id": user["id"],
        "user_name": user["name"],
        "category": ai.get("category") or payload.category,
        "severity": ai.get("severity") or payload.severity,
        "description": payload.description,
        "latitude": payload.latitude,
        "longitude": payload.longitude,
        "road_name": payload.road_name,
        "photo_url": payload.photo_url,
        "status": "SUBMITTED",
        "ai_assessment": ai,
        "timeline": initial_timeline(),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "contractor_id": contractor_id,
        "citizen_rating": None,
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


@api_router.post("/reports/{report_id}/rate", response_model=Report)
async def rate_report(report_id: str, payload: RateReport, user: dict = Depends(get_current_user)):
    doc = await db.reports.find_one({"id": report_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Report not found")
    if doc["user_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Only the reporter can rate this fix")
    if doc.get("status") != "RESOLVED":
        raise HTTPException(status_code=400, detail="You can only rate a resolved report")
    await db.reports.update_one(
        {"id": report_id},
        {"$set": {"citizen_rating": payload.rating}},
    )
    doc["citizen_rating"] = payload.rating
    return Report(**doc)


# ---------------- Contractor Scorecards ----------------
CONTRACTORS_SEED = [
    {"name": "IRB Infrastructure Developers", "road": "NH-48", "region": "Delhi–Jaipur Corridor", "focus": "National Highways"},
    {"name": "L&T Construction", "road": "NH-16", "region": "Chennai–Kolkata", "focus": "National Highways"},
    {"name": "Ashoka Buildcon", "road": "SH-32", "region": "Maharashtra", "focus": "State Highways"},
    {"name": "Dilip Buildcon", "road": "NH-8", "region": "Delhi–Mumbai", "focus": "National Highways"},
    {"name": "GR Infraprojects", "road": "SH-6", "region": "Gujarat", "focus": "State Highways"},
    {"name": "PNC Infratech", "road": "MDR-11", "region": "Uttar Pradesh", "focus": "District Roads"},
]


async def _pick_contractor_id(road_name: Optional[str]) -> Optional[str]:
    contractors = await db.contractors.find({}, {"_id": 0}).to_list(50)
    if not contractors:
        return None
    if road_name:
        rn = road_name.lower()
        for c in contractors:
            if c["road"].lower() in rn:
                return c["id"]
    import random as _rand
    return _rand.choice(contractors)["id"]


def _grade_from_score(score: int) -> str:
    if score >= 85: return "A"
    if score >= 70: return "B"
    if score >= 55: return "C"
    if score >= 40: return "D"
    return "F"


async def _scorecard_for(contractor: dict) -> dict:
    cid = contractor["id"]
    reports = await db.reports.find({"contractor_id": cid}, {"_id": 0}).to_list(500)
    total = len(reports)
    resolved = [r for r in reports if r.get("status") == "RESOLVED"]
    in_progress = [r for r in reports if r.get("status") in (
        "UNDER_REVIEW", "FORWARDED", "ASSIGNED",
        "WORK_PLANNED", "WORK_IN_PROGRESS", "RESOLUTION", "VERIFIED")]
    resolution_rate = (len(resolved) / total) if total else 0

    speeds = []
    for r in resolved:
        try:
            tl = r.get("timeline") or []
            first = tl[0].get("timestamp") if tl else None
            last = None
            for s in tl:
                if s.get("status") == "completed" and s.get("timestamp"):
                    last = s["timestamp"]
            if first and last:
                dt = (datetime.fromisoformat(last) - datetime.fromisoformat(first)).total_seconds() / 3600
                if dt >= 0:
                    speeds.append(dt)
        except Exception:
            continue
    avg_speed = round(sum(speeds) / len(speeds), 1) if speeds else None

    ratings = [r["citizen_rating"] for r in reports if isinstance(r.get("citizen_rating"), int)]
    avg_rating = round(sum(ratings) / len(ratings), 2) if ratings else None

    # Trust score 0-100
    score = 40.0
    score += resolution_rate * 30
    if avg_rating is not None:
        score += (avg_rating / 5.0) * 20
    else:
        score += 10  # neutral for no ratings
    if avg_speed is None:
        score += 5
    elif avg_speed < 48:
        score += 10
    elif avg_speed < 168:
        score += 5
    trust = max(0, min(100, round(score)))

    return {
        **contractor,
        "total_complaints": total,
        "resolved": len(resolved),
        "in_progress": len(in_progress),
        "resolution_rate_pct": round(resolution_rate * 100),
        "avg_resolution_hours": avg_speed,
        "avg_rating": avg_rating,
        "rating_count": len(ratings),
        "trust_score": trust,
        "grade": _grade_from_score(trust),
    }


@api_router.get("/contractors", response_model=List[ContractorScorecard])
async def list_contractors():
    contractors = await db.contractors.find({}, {"_id": 0}).to_list(50)
    cards = [await _scorecard_for(c) for c in contractors]
    cards.sort(key=lambda x: x["trust_score"], reverse=True)
    return [ContractorScorecard(**c) for c in cards]


@api_router.get("/contractors/{cid}")
async def get_contractor(cid: str):
    contractor = await db.contractors.find_one({"id": cid}, {"_id": 0})
    if not contractor:
        raise HTTPException(status_code=404, detail="Contractor not found")
    card = await _scorecard_for(contractor)
    reports = await db.reports.find(
        {"contractor_id": cid}, {"_id": 0}
    ).sort("created_at", -1).to_list(200)
    return {"contractor": card, "reports": reports}


# ---------------- Road Ownership Layer ----------------
KNOWN_AUTHORITIES = [
    "National Highways Authority of India (NHAI)",
    "State Public Works Department",
    "Zilla Parishad / District Administration",
    "Municipal Corporation / Local Body",
    "Border Roads Organisation (BRO)",
    "Cantonment Board",
    "Toll Concessionaire (Private)",
    "Private / Corporate Road",
    "Other",
]


def _segment_key(road_name: Optional[str], road_number: Optional[str],
                 lat: Optional[float] = None, lng: Optional[float] = None) -> str:
    if road_number:
        return f"ref:{road_number.strip().lower()}"
    if road_name:
        return f"name:{road_name.strip().lower()}"
    if lat is not None and lng is not None:
        return f"geo:{round(lat, 3)},{round(lng, 3)}"
    return "unknown"


async def _authority_stats_for(segment_key: str) -> dict:
    pipeline = [
        {"$match": {"segment_key": segment_key, "is_correct": True}},
        {"$group": {"_id": "$authority", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    rows = await db.road_authority_votes.aggregate(pipeline).to_list(20)
    tally = [{"authority": r["_id"], "count": r["count"]} for r in rows if r.get("_id")]
    total = sum(r["count"] for r in tally)
    disputes = await db.road_authority_votes.count_documents(
        {"segment_key": segment_key, "is_correct": False}
    )
    return {
        "segment_key": segment_key,
        "tally": tally,
        "total_confirmations": total,
        "disputes": disputes,
        "community_authority": tally[0]["authority"] if tally else None,
    }


@api_router.post("/roads/confirm-authority")
async def confirm_authority(payload: AuthorityVote, user: dict = Depends(get_current_user)):
    key = _segment_key(payload.road_name, payload.road_number, payload.latitude, payload.longitude)
    if key == "unknown":
        raise HTTPException(status_code=400, detail="Not enough info to identify road segment")

    # Which authority is being voted on?
    if payload.is_correct:
        authority = payload.inferred_authority
        if not authority:
            raise HTTPException(status_code=400, detail="Nothing to confirm — no inferred authority")
    else:
        authority = payload.suggested_authority
        if not authority:
            raise HTTPException(status_code=400, detail="Please suggest the correct authority")

    now = datetime.now(timezone.utc).isoformat()
    # Upsert per (segment_key, user, authority) so a user can update their vote
    await db.road_authority_votes.update_one(
        {"segment_key": key, "user_id": user["id"], "authority": authority},
        {"$set": {
            "segment_key": key,
            "user_id": user["id"],
            "user_name": user.get("name"),
            "authority": authority,
            "is_correct": payload.is_correct,
            "inferred_authority": payload.inferred_authority,
            "road_name": payload.road_name,
            "road_number": payload.road_number,
            "latitude": payload.latitude,
            "longitude": payload.longitude,
            "updated_at": now,
        }, "$setOnInsert": {"created_at": now}},
        upsert=True,
    )
    stats = await _authority_stats_for(key)
    return {"ok": True, **stats}


@api_router.get("/roads/authority-stats")
async def get_authority_stats(
    road_name: Optional[str] = None,
    road_number: Optional[str] = None,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
):
    key = _segment_key(road_name, road_number, lat, lng)
    if key == "unknown":
        return {"segment_key": key, "tally": [], "total_confirmations": 0, "disputes": 0, "community_authority": None}
    return await _authority_stats_for(key)


@api_router.get("/roads/authority-options")
async def authority_options():
    return {"options": KNOWN_AUTHORITIES}


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


# ---------------- Identify Road (real reverse-geocoding via Nominatim) ----------------
NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse"
NOMINATIM_HEADERS = {
    "User-Agent": "ROADWATCH/1.0 (civic-tech platform; contact: tarunverma80098@gmail.com)",
    "Accept-Language": "en",
}


def _infer_authority(ref: Optional[str], country: Optional[str]) -> Optional[str]:
    if not ref:
        return None
    ref_u = ref.upper().replace(" ", "")
    if country and country.lower() == "india":
        if ref_u.startswith("NH") or ref_u.startswith("NE"):
            return "National Highways Authority of India (NHAI)"
        if ref_u.startswith("SH"):
            return "State Public Works Department"
        if ref_u.startswith("MDR"):
            return "Zilla Parishad / District Administration"
        if ref_u.startswith("ODR") or ref_u.startswith("VR"):
            return "Local Panchayat / Municipal Body"
    if ref_u.startswith("A") or ref_u.startswith("M"):  # UK / EU style
        return "National Roads Authority"
    return None


def _infer_condition(surface: Optional[str], smoothness: Optional[str]) -> str:
    if smoothness:
        s = smoothness.lower()
        if any(x in s for x in ("excellent", "good")):
            return f"Good ({smoothness})"
        if any(x in s for x in ("bad", "very_bad", "horrible", "impassable")):
            return f"Poor ({smoothness})"
        return f"Fair ({smoothness})"
    if surface:
        s = surface.lower()
        if any(x in s for x in ("asphalt", "concrete", "paved")):
            return "Paved · condition unknown"
        if any(x in s for x in ("unpaved", "gravel", "dirt", "ground", "sand", "mud")):
            return "Unpaved · likely rough"
    return "Data unavailable"


@api_router.get("/roads/identify")
async def identify_road(lat: float, lng: float):
    """Real reverse-geocoding using OpenStreetMap Nominatim."""
    params = {
        "lat": lat, "lon": lng,
        "format": "json",
        "zoom": 17,
        "addressdetails": 1,
        "extratags": 1,
        "namedetails": 1,
    }
    fallback = {
        "road_name": None, "road_number": None, "district": None,
        "state": None, "condition": "Data unavailable", "authority": None,
        "contractor": None, "construction_year": None,
        "last_maintenance": None, "funding_source": None,
        "latitude": lat, "longitude": lng, "source": "unavailable",
    }
    try:
        async with httpx.AsyncClient(timeout=6.0, headers=NOMINATIM_HEADERS) as client_http:
            r = await client_http.get(NOMINATIM_URL, params=params)
            if r.status_code != 200:
                return fallback
            data = r.json()
    except Exception:
        return fallback

    addr = data.get("address") or {}
    extras = data.get("extratags") or {}
    names = data.get("namedetails") or {}

    road_name = (
        names.get("name") or addr.get("road") or addr.get("pedestrian")
        or addr.get("footway") or addr.get("path")
    )
    ref = extras.get("ref") or addr.get("ref")
    district = (
        addr.get("city_district") or addr.get("state_district")
        or addr.get("county") or addr.get("suburb")
    )
    city = addr.get("city") or addr.get("town") or addr.get("village") or addr.get("municipality")
    state = addr.get("state")
    country = addr.get("country")

    result = {
        "road_name": road_name,
        "road_number": ref,
        "district": district or city,
        "state": state,
        "country": country,
        "postcode": addr.get("postcode"),
        "condition": _infer_condition(extras.get("surface"), extras.get("smoothness")),
        "authority": _infer_authority(ref, country) or extras.get("operator"),
        "contractor": extras.get("contractor"),
        "construction_year": extras.get("start_date"),
        "last_maintenance": extras.get("check_date") or extras.get("survey:date"),
        "funding_source": None,
        "surface": extras.get("surface"),
        "maxspeed": extras.get("maxspeed"),
        "lanes": extras.get("lanes"),
        "display_name": data.get("display_name"),
        "latitude": lat,
        "longitude": lng,
        "source": "openstreetmap",
    }
    # Community-verified authority layer
    key = _segment_key(result["road_name"], result["road_number"], lat, lng)
    stats = await _authority_stats_for(key)
    result["segment_key"] = key
    result["community_authority"] = stats["community_authority"]
    result["community_confirmations"] = stats["total_confirmations"]
    result["community_disputes"] = stats["disputes"]
    result["community_tally"] = stats["tally"]
    result["authority_source"] = (
        "community" if stats["community_authority"] and stats["total_confirmations"] >= 3
        else ("inferred" if result["authority"] else "unknown")
    )
    return result


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


async def seed_contractors():
    for c in CONTRACTORS_SEED:
        if not await db.contractors.find_one({"name": c["name"]}):
            await db.contractors.insert_one({
                "id": str(uuid.uuid4()),
                **c,
                "created_at": datetime.now(timezone.utc).isoformat(),
            })


@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.reports.create_index("created_at")
    await db.reports.create_index("contractor_id")
    await db.contractors.create_index("name", unique=True)
    await db.road_authority_votes.create_index("segment_key")
    await db.road_authority_votes.create_index([("segment_key", 1), ("user_id", 1), ("authority", 1)], unique=True)
    await seed_users()
    await seed_contractors()


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
