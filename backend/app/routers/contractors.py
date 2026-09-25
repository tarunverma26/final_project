from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, status
from app.database import db
from app.models.contractor import Contractor, ContractorScorecard

router = APIRouter(prefix="/contractors", tags=["Contractor Scorecards"])


def _grade_from_score(score: int) -> str:
    """Calculate letter grade from numeric trust score."""
    if score >= 85:
        return "A"
    if score >= 70:
        return "B"
    if score >= 55:
        return "C"
    if score >= 40:
        return "D"
    return "F"


async def _scorecard_for(contractor: dict) -> dict:
    """Compute performance scorecard and dynamic trust score for contractor."""
    cid = contractor["id"]
    reports = await db.reports.find({"contractor_id": cid}, {"_id": 0}).to_list(1000)
    total = len(reports)
    resolved = [r for r in reports if r.get("status") == "RESOLVED"]
    in_progress = [
        r for r in reports
        if r.get("status") in (
            "UNDER_REVIEW", "FORWARDED", "ASSIGNED",
            "WORK_PLANNED", "WORK_IN_PROGRESS", "RESOLUTION", "VERIFIED"
        )
    ]
    resolution_rate = (len(resolved) / total) if total else 0.0

    # Calculate average resolution speed in hours
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

    # Calculate average citizen rating
    ratings = [r["citizen_rating"] for r in reports if isinstance(r.get("citizen_rating"), int)]
    avg_rating = round(sum(ratings) / len(ratings), 2) if ratings else None

    # Compute Trust Score: 0 - 100
    # Base: 40 pts
    # Resolution Rate: up to 30 pts
    # Citizen Rating: up to 20 pts
    # Speed: up to 10 pts
    score = 40.0
    score += resolution_rate * 30.0

    if avg_rating is not None:
        score += (avg_rating / 5.0) * 20.0
    else:
        score += 10.0  # Neutral benefit for unrated

    if avg_speed is None:
        score += 5.0
    elif avg_speed < 48:
        score += 10.0
    elif avg_speed < 168:
        score += 5.0

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


@router.get("", response_model=List[ContractorScorecard])
async def list_contractors():
    """List all contractors ranked by Trust Score with complete scorecards."""
    contractors = await db.contractors.find({}, {"_id": 0}).to_list(100)
    cards = [await _scorecard_for(c) for c in contractors]
    cards.sort(key=lambda x: x["trust_score"], reverse=True)
    return [ContractorScorecard(**c) for c in cards]


@router.get("/{cid}")
async def get_contractor(cid: str):
    """Retrieve detailed contractor scorecard along with their assigned reports."""
    contractor = await db.contractors.find_one({"id": cid}, {"_id": 0})
    if not contractor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contractor not found."
        )
    card = await _scorecard_for(contractor)
    reports = await db.reports.find(
        {"contractor_id": cid}, {"_id": 0}
    ).sort("created_at", -1).to_list(200)
    return {"contractor": card, "reports": reports}
