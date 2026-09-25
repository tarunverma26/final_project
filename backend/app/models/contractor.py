from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class Contractor(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    road: str
    region: str
    focus: str
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None


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
