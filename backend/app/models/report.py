from typing import Optional, List, Literal, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from app.models.common import GeoJSONPoint


class ReportCreate(BaseModel):
    category: str = Field(..., min_length=1, max_length=50)
    severity: Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"] = "MEDIUM"
    description: str = Field(default="", max_length=2000)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    road_name: Optional[str] = Field(default=None, max_length=200)
    photo_url: Optional[str] = None
    authority: Optional[str] = None


class TimelineStep(BaseModel):
    step: str
    status: Literal["pending", "completed"] = "pending"
    timestamp: Optional[str] = None


class ResolvedGeotag(BaseModel):
    latitude: float
    longitude: float
    distance_meters: float
    source: Literal["exif", "browser_gps", "manual"] = "browser_gps"


class ClaudeVerification(BaseModel):
    same_location: bool
    issue_resolved: bool
    confidence: int = Field(default=0, ge=0, le=100)
    reasoning: str = ""
    verified_at: str
    model: Optional[str] = None


class ResolutionInfo(BaseModel):
    resolved_photo_url: str
    resolved_geotag: ResolvedGeotag
    claude_verification: ClaudeVerification
    resolved_at: str
    resolved_by_id: str
    resolved_by_name: str
    supervisor_override: bool = False


class Report(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    user_name: str
    category: str
    severity: str
    description: str = ""
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location: Optional[GeoJSONPoint] = None
    road_name: Optional[str] = None
    photo_url: Optional[str] = None
    authority: Optional[str] = None
    status: str = "reported"
    resolution: Optional[ResolutionInfo] = None
    ai_assessment: Dict[str, Any] = Field(default_factory=dict)
    timeline: List[Dict[str, Any]] = Field(default_factory=list)
    created_at: str
    contractor_id: Optional[str] = None
    citizen_rating: Optional[int] = None


class RateReport(BaseModel):
    rating: int = Field(ge=1, le=5, description="1 to 5 star rating for the resolved road repair")


class UpdateReportStatus(BaseModel):
    status: Literal["reported", "in_progress", "resolved", "rejected"]


class ResolveReportRequest(BaseModel):
    photo_url: str
    latitude: float
    longitude: float
    source: Literal["exif", "browser_gps"] = "browser_gps"
    supervisor_override: bool = False


class SMSSimulateRequest(BaseModel):
    message: str
    phone: Optional[str] = "+91 98712 34567"


