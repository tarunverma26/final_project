from datetime import datetime, timezone
from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Depends, Query, status
from app.database import db
from app.config import KNOWN_AUTHORITIES
from app.models.road import (
    AuthorityVote, AuthorityStatsResponse,
    RoadProfileOverlay, RoadProfileOverlayUpdate
)
from app.services.geocoding import (
    identify_road_from_coords,
    get_authority_stats_for_segment,
    _segment_key,
)
from app.utils.dependencies import get_current_user, require_admin

router = APIRouter(prefix="/roads", tags=["Road Identification & Ownership"])


@router.get("/identify")
async def identify_road(
    lat: float = Query(..., ge=-90, le=90, description="Latitude"),
    lng: float = Query(..., ge=-180, le=180, description="Longitude"),
):
    """
    Reverse geocode road coordinates using OpenStreetMap Nominatim with community ownership consensus.
    """
    return await identify_road_from_coords(lat, lng)


@router.put("/overlay/{osm_id}", response_model=RoadProfileOverlay)
async def upsert_road_overlay(
    osm_id: str,
    payload: RoadProfileOverlayUpdate,
    user: dict = Depends(require_admin),
):
    """
    Update or create a road profile overlay (Admin only).
    Restricted to editing roads under the logged-in admin's own authority.
    """
    admin_auth = user.get("authority")
    existing = await db.road_profile_overlays.find_one({"osm_id": osm_id})
    if existing and existing.get("authority") and admin_auth and existing["authority"] != admin_auth:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"You can only edit road profiles under your authority ({admin_auth}). This road is governed by {existing['authority']}."
        )

    assigned_authority = admin_auth or payload.authority

    now = datetime.now(timezone.utc).isoformat()
    update_data = {
        "osm_id": osm_id,
        "authority": assigned_authority,
        "updated_by": user.get("email"),
        "updated_at": now,
    }
    for k, v in payload.model_dump(exclude_unset=True).items():
        if v is not None and k != "authority":
            update_data[k] = v
    if assigned_authority:
        update_data["authority"] = assigned_authority

    await db.road_profile_overlays.update_one(
        {"osm_id": osm_id},
        {"$set": update_data, "$setOnInsert": {"created_at": now}},
        upsert=True,
    )
    doc = await db.road_profile_overlays.find_one({"osm_id": osm_id}, {"_id": 0})
    return RoadProfileOverlay(**doc)


@router.get("/authority-options")
async def get_authority_options():
    """Return predefined list of road authorities for citizen voting."""
    return {"options": KNOWN_AUTHORITIES}



@router.get("/authority-stats", response_model=AuthorityStatsResponse)
async def get_authority_stats(
    road_name: Optional[str] = None,
    road_number: Optional[str] = None,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
):
    """Retrieve community confirmations and dispute stats for a road segment."""
    key = _segment_key(road_name, road_number, lat, lng)
    if key == "unknown":
        return AuthorityStatsResponse(
            segment_key=key,
            tally=[],
            total_confirmations=0,
            disputes=0,
            community_authority=None,
        )
    stats = await get_authority_stats_for_segment(key)
    return AuthorityStatsResponse(**stats)


@router.post("/confirm-authority")
async def confirm_authority(payload: AuthorityVote, user: dict = Depends(get_current_user)):
    """
    Submit a citizen confirmation or dispute vote for the governing road authority.
    Upserts vote per (segment_key, user_id, authority) to prevent ballot stuffing.
    """
    key = _segment_key(payload.road_name, payload.road_number, payload.latitude, payload.longitude)
    if key == "unknown":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient information to identify road segment."
        )

    if payload.is_correct:
        authority = payload.inferred_authority
        if not authority:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot confirm: no inferred authority provided."
            )
    else:
        authority = payload.suggested_authority
        if not authority:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Please specify your suggested authority."
            )

    now = datetime.now(timezone.utc).isoformat()
    await db.road_authority_votes.update_one(
        {"segment_key": key, "user_id": user["id"], "authority": authority},
        {
            "$set": {
                "segment_key": key,
                "user_id": user["id"],
                "user_name": user.get("name", "Citizen"),
                "authority": authority,
                "is_correct": payload.is_correct,
                "inferred_authority": payload.inferred_authority,
                "road_name": payload.road_name,
                "road_number": payload.road_number,
                "latitude": payload.latitude,
                "longitude": payload.longitude,
                "updated_at": now,
            },
            "$setOnInsert": {"created_at": now},
        },
        upsert=True,
    )

    stats = await get_authority_stats_for_segment(key)
    return {"ok": True, **stats}
