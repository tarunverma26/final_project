from typing import Optional, Literal
from pydantic import BaseModel, Field, ConfigDict


class EventCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=150)
    description: str = Field(default="", max_length=1000)
    date: str = Field(..., description="Date formatted as YYYY-MM-DD or readable string")
    time: Optional[str] = Field(default=None, max_length=30)
    location: str = Field(..., min_length=2, max_length=150)
    organizer: str = Field(default="Municipal Corporation", max_length=100)
    status: Literal["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"] = "UPCOMING"
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None
    location: Optional[str] = None
    organizer: Optional[str] = None
    status: Optional[Literal["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"]] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class EventOut(EventCreate):
    model_config = ConfigDict(extra="ignore")
    id: str
    created_at: str
