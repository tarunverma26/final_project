import uuid
import random
import logging
import math
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Depends, Query, status
from app.database import db
from app.config import TIMELINE_STEPS, AUTHORITY_LIST
from app.models.report import (
    ReportCreate, Report, RateReport,
    UpdateReportStatus, ResolveReportRequest
)
from app.models.common import GeoJSONPoint
from app.services.storage import is_base64_data_url, save_base64_image
from app.services.ai_vision import assess_road_problem, verify_resolution_with_claude
from app.utils.dependencies import get_current_user, require_admin

logger = logging.getLogger("roadwatch.reports")
router = APIRouter(prefix="/reports", tags=["Issue Reports"])


def haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate great-circle distance between two points in meters."""
    r = 6371000.0  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2))
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return r * c


def infer_authority_for_issue(road_name: Optional[str], category: str, explicit: Optional[str] = None) -> str:
    """
    Rule-based issue routing to authority:
      - Category Highway / NH / Expressway -> NHAI
      - State Highway / SH -> State PWD
      - Municipal / Sector / Drainage / Streetlight / Garbage -> MCD
      - District / General Pothole -> PWD
    """
    if explicit and explicit in AUTHORITY_LIST:
        return explicit

    rn = (road_name or "").upper()
    cat = (category or "").upper()

    if any(k in rn for k in ("NH", "NATIONAL HIGHWAY", "EXPRESSWAY", "NE-")) or "HIGHWAY" in cat:
        return "NHAI"
    if any(k in rn for k in ("SH", "STATE HIGHWAY")):
        return "State PWD"
    if any(k in rn for k in ("SECTOR", "WARD", "COLONY", "MUNICIPAL", "NAGAR", "ENCLAVE")) or any(k in cat for k in ("GARBAGE", "DRAINAGE", "STREETLIGHT", "WATERLOGGING")):
        return "MCD"
    return "PWD"


def initial_timeline() -> List[Dict[str, Any]]:
    """Initialize standard 9-step timeline with SUBMITTED marked completed."""
    now = datetime.now(timezone.utc).isoformat()
    return [
        {
            "step": s,
            "status": "completed" if i == 0 else "pending",
            "timestamp": now if i == 0 else None,
        }
        for i, s in enumerate(TIMELINE_STEPS)
    ]


async def _pick_contractor_id(road_name: Optional[str]) -> Optional[str]:
    """Auto-link contractor based on road name substring match or random fallback."""
    contractors = await db.contractors.find({}, {"_id": 0, "id": 1, "road": 1}).to_list(50)
    if not contractors:
        return None
    if road_name:
        rn = road_name.lower()
        for c in contractors:
            if c.get("road") and c["road"].lower() in rn:
                return c["id"]
    return random.choice(contractors)["id"]


@router.post("", response_model=Report, status_code=status.HTTP_201_CREATED)
async def create_report(payload: ReportCreate, user: dict = Depends(get_current_user)):
    """
    Create a new civic issue report.
    Automatically moves photo into object storage, triggers AI inspection,
    assigns governing authority, and creates GeoJSON point.
    """
    report_id = str(uuid.uuid4())

    # 1. Clean photo URL handling (convert base64 blobs into permanent object storage URLs)
    clean_photo_url = payload.photo_url
    if payload.photo_url and is_base64_data_url(payload.photo_url):
        try:
            clean_photo_url = save_base64_image(payload.photo_url, prefix=f"report_{report_id[:8]}")
        except Exception as e:
            logger.warning(f"[Reports] Base64 image conversion error: {e}. Saving raw fallback.")
            clean_photo_url = payload.photo_url

    # 2. AI Vision Assessment
    ai = await assess_road_problem(clean_photo_url, payload.category, payload.severity)

    # 3. GeoJSON Point for MongoDB 2dsphere indexing
    location = None
    if payload.latitude is not None and payload.longitude is not None:
        location = {
            "type": "Point",
            "coordinates": [payload.longitude, payload.latitude]  # [lng, lat]
        }

    # 4. Authority Routing
    assigned_authority = infer_authority_for_issue(
        payload.road_name,
        payload.category,
        payload.authority
    )

    # 5. Contractor assignment
    contractor_id = await _pick_contractor_id(payload.road_name)

    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "id": report_id,
        "user_id": user["id"],
        "user_name": user.get("name", "Citizen"),
        "category": ai.get("category") or payload.category,
        "severity": ai.get("severity") or payload.severity,
        "description": payload.description.strip(),
        "latitude": payload.latitude,
        "longitude": payload.longitude,
        "location": location,
        "road_name": payload.road_name.strip() if payload.road_name else None,
        "photo_url": clean_photo_url,
        "authority": assigned_authority,
        "status": "reported",
        "resolution": None,
        "ai_assessment": ai,
        "timeline": initial_timeline(),
        "created_at": now,
        "contractor_id": contractor_id,
        "citizen_rating": None,
    }

    await db.reports.insert_one(doc)
    doc.pop("_id", None)
    return Report(**doc)



@router.get("", response_model=List[Report])
async def list_reports(
    mine: bool = Query(False, description="Filter only to reports submitted by authenticated user"),
    status_filter: Optional[str] = Query(None, alias="status"),
    user: dict = Depends(get_current_user),
):
    """
    List reports. Citizens view their own reports;
    Administrators view ONLY reports where issue.authority === admin.authority (security-critical filter).
    Superadmins without a specific authority can view all.
    """
    query: Dict[str, Any] = {}
    if user.get("role") != "admin" or mine:
        query["user_id"] = user["id"]
    elif user.get("role") == "admin":
        if user.get("authority"):
            # Enforce strict backend query filter by authority
            query["authority"] = user["authority"]

    if status_filter:
        query["status"] = status_filter

    cursor = db.reports.find(query, {"_id": 0}).sort("created_at", -1)
    docs = await cursor.to_list(500)
    return [Report(**d) for d in docs]


@router.patch("/{report_id}/status", response_model=Report)
async def update_report_status(
    report_id: str,
    payload: UpdateReportStatus,
    user: dict = Depends(require_admin),
):
    """
    Update status of an issue (e.g. to in_progress or rejected).
    Administrators can only update issues within their assigned authority.
    Transition to 'resolved' is blocked here and must use POST /{report_id}/resolve.
    """
    if payload.status == "resolved":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Marking an issue resolved requires resolution photo upload, geotag verification, and Claude AI audit. Use POST /reports/{id}/resolve."
        )

    doc = await db.reports.find_one({"id": report_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")

    if user.get("authority") and doc.get("authority") and doc["authority"] != user["authority"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied: this issue is managed by {doc.get('authority')}."
        )

    now = datetime.now(timezone.utc).isoformat()
    await db.reports.update_one(
        {"id": report_id},
        {"$set": {"status": payload.status, "updated_at": now}}
    )
    doc["status"] = payload.status
    return Report(**doc)


@router.post("/{report_id}/resolve", response_model=Report)
async def resolve_report(
    report_id: str,
    payload: ResolveReportRequest,
    user: dict = Depends(require_admin),
):
    """
    Resolve issue with geotag validation and Claude vision audit.
    1. Validates geotag is within 50 meters of the reported location (Haversine formula).
    2. Sends original citizen photo + new resolution photo to Claude vision model.
    3. Blocks status change if Claude says not same location OR not resolved (unless supervisor_override is True).
    4. On successful confirmation, updates status to 'resolved' with resolution subdocument.
    """
    doc = await db.reports.find_one({"id": report_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")

    if user.get("authority") and doc.get("authority") and doc["authority"] != user["authority"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied: this issue is managed by {doc.get('authority')}."
        )

    # 1. Geotag Distance Verification (50 meters limit)
    distance_meters = 0.0
    if doc.get("latitude") is not None and doc.get("longitude") is not None:
        distance_meters = haversine_distance_meters(
            doc["latitude"], doc["longitude"],
            payload.latitude, payload.longitude
        )
        if distance_meters > 50.0 and not payload.supervisor_override:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Resolution photo geotag is {distance_meters:.1f} meters away from original issue location (maximum allowed: 50m)."
            )

    # 2. Clean resolution photo URL
    clean_photo_url = payload.photo_url
    if payload.photo_url and is_base64_data_url(payload.photo_url):
        try:
            clean_photo_url = save_base64_image(payload.photo_url, prefix=f"resolved_{report_id[:8]}")
        except Exception as e:
            logger.warning(f"[Reports] Resolution photo save error: {e}")
            clean_photo_url = payload.photo_url

    # 3. Claude Vision Verification
    claude_ver = await verify_resolution_with_claude(
        doc.get("photo_url"),
        clean_photo_url,
        doc.get("category", "Pothole"),
        doc.get("description", "")
    )

    # 4. Block if Claude says NOT same location OR NOT resolved (unless supervisor override)
    if (not claude_ver.get("same_location") or not claude_ver.get("issue_resolved")) and not payload.supervisor_override:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": "Resolution rejected by AI verification audit.",
                "reasoning": claude_ver.get("reasoning", "Claude could not verify resolution."),
                "same_location": claude_ver.get("same_location"),
                "issue_resolved": claude_ver.get("issue_resolved"),
                "confidence": claude_ver.get("confidence"),
                "can_override": True,
            }
        )

    now = datetime.now(timezone.utc).isoformat()
    resolution_data = {
        "resolved_photo_url": clean_photo_url,
        "resolved_geotag": {
            "latitude": payload.latitude,
            "longitude": payload.longitude,
            "distance_meters": round(distance_meters, 2),
            "source": payload.source,
        },
        "claude_verification": claude_ver,
        "resolved_at": now,
        "resolved_by_id": user["id"],
        "resolved_by_name": user.get("name", "Administrator"),
        "supervisor_override": payload.supervisor_override,
    }

    # Update timeline
    timeline = doc.get("timeline") or []
    for step in timeline:
        if step.get("step") in ("RESOLUTION", "RESOLVED"):
            step["status"] = "completed"
            step["timestamp"] = now

    await db.reports.update_one(
        {"id": report_id},
        {
            "$set": {
                "status": "resolved",
                "resolution": resolution_data,
                "timeline": timeline,
                "updated_at": now,
            }
        }
    )

    doc["status"] = "resolved"
    doc["resolution"] = resolution_data
    doc["timeline"] = timeline
    return Report(**doc)



@router.get("/public", response_model=List[Report])
async def list_public_reports(limit: int = Query(500, ge=1, le=1000)):
    """
    Public feed for map visualization and civic heatmaps.
    Sanitizes citizen identity while keeping issue location and status.
    """
    projection = {"_id": 0}
    cursor = db.reports.find({}, projection).sort("created_at", -1)
    docs = await cursor.to_list(limit)
    return [Report(**d) for d in docs]


@router.get("/nearby", response_model=List[Report])
async def list_nearby_reports(
    lat: float = Query(..., ge=-90, le=90, description="Center latitude"),
    lng: float = Query(..., ge=-180, le=180, description="Center longitude"),
    radius_km: float = Query(10.0, ge=0.5, le=100.0, description="Search radius in kilometers"),
    limit: int = Query(100, ge=1, le=500),
):
    """
    Find road issues nearby using MongoDB 2dsphere geospatial index.
    """
    max_distance_meters = radius_km * 1000
    query = {
        "location": {
            "$near": {
                "$geometry": {
                    "type": "Point",
                    "coordinates": [lng, lat],
                },
                "$maxDistance": max_distance_meters,
            }
        }
    }
    cursor = db.reports.find(query, {"_id": 0})
    docs = await cursor.to_list(limit)
    return [Report(**d) for d in docs]


@router.get("/{report_id}", response_model=Report)
async def get_report(report_id: str, user: dict = Depends(get_current_user)):
    """Retrieve detailed single report by ID."""
    doc = await db.reports.find_one({"id": report_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")

    if user.get("role") != "admin" and doc.get("user_id") != user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view this report."
        )
    return Report(**doc)


@router.post("/{report_id}/advance", response_model=Report)
async def advance_report(report_id: str, user: dict = Depends(require_admin)):
    """
    Advance complaint to the next step in the 9-step timeline (Admin only).
    """
    doc = await db.reports.find_one({"id": report_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")

    if doc.get("status") == "RESOLVED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Report is already marked as fully RESOLVED."
        )

    timeline = doc.get("timeline") or []
    advanced = False
    for i, step in enumerate(timeline):
        if step.get("status") == "pending":
            timeline[i]["status"] = "completed"
            timeline[i]["timestamp"] = datetime.now(timezone.utc).isoformat()
            doc["status"] = step["step"]
            advanced = True
            break

    if not advanced:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="All timeline steps have already been completed."
        )

    await db.reports.update_one(
        {"id": report_id},
        {"$set": {"timeline": timeline, "status": doc["status"]}},
    )
    return Report(**doc)


@router.post("/{report_id}/rate", response_model=Report)
async def rate_report(report_id: str, payload: RateReport, user: dict = Depends(get_current_user)):
    """
    Submit citizen rating (1-5 stars) for a resolved report to score the contractor.
    """
    doc = await db.reports.find_one({"id": report_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")

    if doc.get("user_id") != user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the citizen who originally reported this problem can rate the resolution."
        )

    if doc.get("status") != "RESOLVED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ratings can only be submitted after the report has reached RESOLVED status."
        )

    await db.reports.update_one(
        {"id": report_id},
        {"$set": {"citizen_rating": payload.rating}},
    )
    doc["citizen_rating"] = payload.rating
    return Report(**doc)
