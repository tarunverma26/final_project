import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, Query, status
from app.database import db
from app.models.event import EventCreate, EventOut, EventUpdate
from app.utils.dependencies import require_admin

router = APIRouter(prefix="/events", tags=["Civic Events"])


@router.get("", response_model=List[EventOut])
async def list_events(
    status: Optional[str] = Query(None, description="Filter by status: UPCOMING, ONGOING, COMPLETED"),
    limit: int = Query(50, ge=1, le=100),
):
    """List all scheduled civic consultation events and maintenance drives."""
    query = {}
    if status:
        query["status"] = status.upper()

    cursor = db.events.find(query, {"_id": 0}).sort("date", 1)
    docs = await cursor.to_list(limit)
    return [EventOut(**d) for d in docs]


@router.get("/{event_id}", response_model=EventOut)
async def get_event(event_id: str):
    """Retrieve details for a single civic event."""
    doc = await db.events.find_one({"id": event_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")
    return EventOut(**doc)


@router.post("", response_model=EventOut, status_code=status.HTTP_201_CREATED)
async def create_event(payload: EventCreate, user: dict = Depends(require_admin)):
    """Create a new civic consultation or road maintenance event (Admin only)."""
    event_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "id": event_id,
        "title": payload.title.strip(),
        "description": payload.description.strip(),
        "date": payload.date,
        "time": payload.time,
        "location": payload.location.strip(),
        "organizer": payload.organizer.strip(),
        "status": payload.status,
        "latitude": payload.latitude,
        "longitude": payload.longitude,
        "created_by": user["id"],
        "created_at": now,
    }
    await db.events.insert_one(doc)
    doc.pop("_id", None)
    return EventOut(**doc)


@router.delete("/{event_id}", status_code=status.HTTP_200_OK)
async def delete_event(event_id: str, user: dict = Depends(require_admin)):
    """Delete a civic event (Admin only)."""
    result = await db.events.delete_one({"id": event_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")
    return {"ok": True, "message": "Event deleted successfully."}
