import sys
import os
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

import pytest
from app.utils.security import hash_password, verify_password, create_access_token, decode_access_token
from app.models.common import GeoJSONPoint
from app.models.report import ReportCreate
from app.models.event import EventCreate
from app.services.storage import parse_base64_image, is_base64_data_url, save_base64_image
from app.services.geocoding import _infer_authority, _infer_condition, _segment_key


def test_password_hashing():
    pw = "SuperSecurePassword123!"
    hashed = hash_password(pw)
    assert hashed != pw
    assert verify_password(pw, hashed) is True
    assert verify_password("WrongPassword", hashed) is False


def test_jwt_token_flow():
    token = create_access_token("user-uuid-123", "test@roadwatch.dev", "user", department="Citizen")
    decoded = decode_access_token(token)
    assert decoded["sub"] == "user-uuid-123"
    assert decoded["email"] == "test@roadwatch.dev"
    assert decoded["role"] == "user"
    assert decoded["department"] == "Citizen"
    assert "exp" in decoded


def test_geojson_point():
    point = GeoJSONPoint.from_lat_lng(28.4595, 77.0266)
    assert point is not None
    assert point.type == "Point"
    # [longitude, latitude]
    assert point.coordinates == [77.0266, 28.4595]

    none_point = GeoJSONPoint.from_lat_lng(None, None)
    assert none_point is None


def test_storage_base64_detection_and_saving():
    # 1x1 transparent PNG in base64
    tiny_png_b64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    assert is_base64_data_url(tiny_png_b64) is True
    assert is_base64_data_url("https://example.com/photo.jpg") is False

    img_bytes, ext, mime = parse_base64_image(tiny_png_b64)
    assert len(img_bytes) > 0
    assert ext == "png"
    assert mime == "image/png"

    clean_url = save_base64_image(tiny_png_b64, prefix="test")
    assert clean_url.startswith("/uploads/") or clean_url.startswith("http")
    assert clean_url.endswith(".png")


def test_geocoding_authority_inference():
    assert _infer_authority("NH 48", "India") == "National Highways Authority of India (NHAI)"
    assert _infer_authority("NE 1", "India") == "National Highways Authority of India (NHAI)"
    assert _infer_authority("SH 32", "India") == "State Public Works Department"
    assert _infer_authority("MDR 11", "India") == "Zilla Parishad / District Administration"
    assert _infer_authority("ODR 5", "India") == "Local Panchayat / Municipal Body"


def test_geocoding_condition_inference():
    assert "Good" in _infer_condition("asphalt", "good")
    assert "Poor" in _infer_condition("asphalt", "bad")
    assert "Paved" in _infer_condition("asphalt", None)
    assert "Unpaved" in _infer_condition("gravel", None)


def test_segment_key():
    assert _segment_key(None, "NH48") == "ref:nh48"
    assert _segment_key("Ring Road", None) == "name:ring road"
    assert _segment_key(None, None, 28.4595, 77.0266) == f"geo:{round(28.4595, 3)},{round(77.0266, 3)}"


def test_event_models():
    event = EventCreate(
        title="Public Hearing",
        date="2026-10-15",
        location="Town Hall",
        organizer="Municipal Council",
        status="UPCOMING"
    )
    assert event.title == "Public Hearing"
    assert event.status == "UPCOMING"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
