import logging
import time
from typing import Optional, Dict, Any, List
import httpx
from app.database import db

logger = logging.getLogger("roadwatch.geocoding")

NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse"
NOMINATIM_HEADERS = {
    "User-Agent": "CivicBharat-RoadWatch/2.0 (civic infrastructure monitoring platform)",
    "Accept-Language": "en",
}

# In-memory coordinate cache to respect OpenStreetMap rate limits
# Key: (round(lat, 4), round(lng, 4)), Value: (data, timestamp)
_GEOCODE_CACHE: Dict[tuple, tuple] = {}
CACHE_TTL_SECONDS = 3600  # 1 hour


def _segment_key(
    road_name: Optional[str],
    road_number: Optional[str],
    lat: Optional[float] = None,
    lng: Optional[float] = None,
) -> str:
    """Generate canonical road segment identifier for crowdsourcing ownership."""
    if road_number:
        return f"ref:{road_number.strip().lower()}"
    if road_name:
        return f"name:{road_name.strip().lower()}"
    if lat is not None and lng is not None:
        return f"geo:{round(lat, 3)},{round(lng, 3)}"
    return "unknown"


def _infer_authority(ref: Optional[str], country: Optional[str]) -> Optional[str]:
    """Infer governing authority based on road classification in India or internationally."""
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
    if ref_u.startswith("A") or ref_u.startswith("M"):
        return "National Roads Authority"
    return None


def _infer_condition(surface: Optional[str], smoothness: Optional[str]) -> str:
    """Infer roadway surface condition from OSM attributes."""
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


async def get_authority_stats_for_segment(segment_key: str) -> Dict[str, Any]:
    """Aggregate citizen confirmation votes and disputes for a road segment."""
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


OVERPASS_URL = "https://overpass-api.de/api/interpreter"


async def fetch_overpass_tags(lat: float, lng: float) -> Dict[str, Any]:
    """Query Overpass API for rich highway way tags (lanes, maxspeed, surface, operator, etc.)."""
    overpass_q = f"""
    [out:json][timeout:6];
    way(around:40,{lat},{lng})[highway];
    out tags;
    """
    try:
        async with httpx.AsyncClient(timeout=6.0, headers=NOMINATIM_HEADERS) as client:
            resp = await client.post(OVERPASS_URL, data={"data": overpass_q})
            if resp.status_code == 200:
                data = resp.json()
                elements = data.get("elements", [])
                if elements:
                    # Pick closest or largest highway way
                    first_way = elements[0]
                    tags = first_way.get("tags", {})
                    return {
                        "osm_id": str(first_way.get("id")),
                        "osm_type": "way",
                        **tags
                    }
    except Exception as e:
        logger.warning(f"[Geocoding] Overpass query notice: {e}")
    return {}


async def identify_road_from_coords(lat: float, lng: float) -> Dict[str, Any]:
    """
    Reverse geocode coordinates using OSM Nominatim and Overpass API with LRU cache,
    community consensus, and MongoDB road_profile_overlays merging.
    """
    cache_key = (round(lat, 4), round(lng, 4))
    now = time.time()

    fallback = {
        "osm_id": None, "osm_type": "way",
        "road_name": None, "road_number": None, "district": None,
        "state": None, "country": "India", "condition": "Data unavailable", "authority": None,
        "contractor": None, "construction_year": None,
        "last_maintenance": None, "funding_source": None,
        "surface": None, "maxspeed": None, "lanes": None,
        "latitude": lat, "longitude": lng, "source": "unavailable",
        "segment_key": f"geo:{round(lat, 3)},{round(lng, 3)}",
        "community_authority": None, "community_confirmations": 0,
        "community_disputes": 0, "community_tally": [],
        "authority_source": "unknown",
        "has_overlay": False,
    }

    params = {
        "lat": lat, "lon": lng,
        "format": "json",
        "zoom": 17,
        "addressdetails": 1,
        "extratags": 1,
        "namedetails": 1,
    }

    data = {}
    try:
        async with httpx.AsyncClient(timeout=8.0, headers=NOMINATIM_HEADERS) as client_http:
            resp = await client_http.get(NOMINATIM_URL, params=params)
            if resp.status_code == 200:
                data = resp.json()
    except Exception as e:
        logger.warning(f"[Geocoding] Nominatim query error: {e}")

    # Query Overpass API for detailed highway tags
    overpass_tags = await fetch_overpass_tags(lat, lng)

    addr = data.get("address") or {}
    extras = data.get("extratags") or {}
    names = data.get("namedetails") or {}

    osm_id = str(overpass_tags.get("osm_id") or data.get("osm_id") or f"{round(lat,4)}_{round(lng,4)}")
    osm_type = str(overpass_tags.get("osm_type") or data.get("osm_type") or "way")

    road_name = (
        overpass_tags.get("name")
        or names.get("name")
        or addr.get("road")
        or addr.get("pedestrian")
        or addr.get("footway")
        or addr.get("path")
    )
    ref = overpass_tags.get("ref") or extras.get("ref") or addr.get("ref")
    district = (
        addr.get("city_district") or addr.get("state_district")
        or addr.get("county") or addr.get("suburb")
    )
    city = addr.get("city") or addr.get("town") or addr.get("village") or addr.get("municipality")
    state = addr.get("state")
    country = addr.get("country") or "India"

    surface = overpass_tags.get("surface") or extras.get("surface")
    smoothness = overpass_tags.get("smoothness") or extras.get("smoothness")
    maxspeed = overpass_tags.get("maxspeed") or extras.get("maxspeed")
    lanes = overpass_tags.get("lanes") or extras.get("lanes")
    contractor = overpass_tags.get("contractor") or extras.get("contractor")
    operator = overpass_tags.get("operator") or extras.get("operator")
    start_date = overpass_tags.get("start_date") or extras.get("start_date")
    last_maint = (
        overpass_tags.get("check_date")
        or overpass_tags.get("survey:date")
        or extras.get("check_date")
        or extras.get("survey:date")
    )

    segment_key = _segment_key(road_name, ref, lat, lng)
    stats = await get_authority_stats_for_segment(segment_key)

    inferred_auth = _infer_authority(ref, country) or operator

    result = {
        "osm_id": osm_id,
        "osm_type": osm_type,
        "road_name": road_name,
        "road_number": ref,
        "district": district or city,
        "state": state,
        "country": country,
        "postcode": addr.get("postcode"),
        "condition": _infer_condition(surface, smoothness),
        "authority": inferred_auth,
        "contractor": contractor,
        "construction_year": start_date,
        "last_maintenance": last_maint,
        "funding_source": None,
        "surface": surface,
        "maxspeed": maxspeed,
        "lanes": lanes,
        "display_name": data.get("display_name"),
        "latitude": lat,
        "longitude": lng,
        "source": "openstreetmap",
        "segment_key": segment_key,
        "community_authority": stats["community_authority"],
        "community_confirmations": stats["total_confirmations"],
        "community_disputes": stats["disputes"],
        "community_tally": stats["tally"],
        "authority_source": (
            "community" if stats["community_authority"] and stats["total_confirmations"] >= 3
            else ("inferred" if inferred_auth else "unknown")
        ),
        "has_overlay": False,
    }

    # MERGE MongoDB road_profile_overlays (Overlay data takes priority over "Data unavailable")
    try:
        overlay = await db.road_profile_overlays.find_one(
            {"$or": [{"osm_id": osm_id}, {"segment_key": segment_key}]},
            {"_id": 0}
        )
        if overlay:
            for field in [
                "road_name", "road_number", "authority", "contractor",
                "surface", "maxspeed", "lanes", "construction_year", "last_maintenance"
            ]:
                if overlay.get(field):
                    result[field] = overlay[field]
            result["has_overlay"] = True
            result["overlay_updated_by"] = overlay.get("updated_by")
            result["overlay_updated_at"] = overlay.get("updated_at")
            if overlay.get("authority"):
                result["authority_source"] = "official_overlay"
    except Exception as e:
        logger.warning(f"[Geocoding] Overlay lookup error: {e}")

    _GEOCODE_CACHE[cache_key] = (result, now)
    return result

