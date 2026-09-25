from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class AuthorityVote(BaseModel):
    road_name: Optional[str] = None
    road_number: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    inferred_authority: Optional[str] = None
    is_correct: bool
    suggested_authority: Optional[str] = None


class AuthorityTallyItem(BaseModel):
    authority: str
    count: int


class AuthorityStatsResponse(BaseModel):
    segment_key: str
    tally: List[AuthorityTallyItem] = Field(default_factory=list)
    total_confirmations: int = 0
    disputes: int = 0
    community_authority: Optional[str] = None


class RoadProfileOverlay(BaseModel):
    osm_id: str
    segment_key: Optional[str] = None
    road_name: Optional[str] = None
    road_number: Optional[str] = None
    authority: Optional[str] = None
    contractor: Optional[str] = None
    surface: Optional[str] = None
    maxspeed: Optional[str] = None
    lanes: Optional[str] = None
    construction_year: Optional[str] = None
    last_maintenance: Optional[str] = None
    updated_by: Optional[str] = None
    updated_at: Optional[str] = None


class RoadProfileOverlayUpdate(BaseModel):
    road_name: Optional[str] = None
    road_number: Optional[str] = None
    authority: Optional[str] = None
    contractor: Optional[str] = None
    surface: Optional[str] = None
    maxspeed: Optional[str] = None
    lanes: Optional[str] = None
    construction_year: Optional[str] = None
    last_maintenance: Optional[str] = None

