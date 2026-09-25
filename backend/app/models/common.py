from typing import List, Literal, Optional
from pydantic import BaseModel, Field


class GeoJSONPoint(BaseModel):
    """GeoJSON Point format for MongoDB 2dsphere index compatibility."""
    type: Literal["Point"] = "Point"
    # MongoDB coordinates order: [longitude, latitude]
    coordinates: List[float] = Field(..., min_length=2, max_length=2, description="[longitude, latitude]")

    @classmethod
    def from_lat_lng(cls, lat: Optional[float], lng: Optional[float]) -> Optional["GeoJSONPoint"]:
        if lat is None or lng is None:
            return None
        return cls(coordinates=[lng, lat])
