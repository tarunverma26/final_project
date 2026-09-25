import sys
from pathlib import Path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.config import DEFAULT_INVITE_CODES, DEMO_ADMINS

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


def test_seeded_demo_admins_login(client):
    """Test 4b: All 3 seeded demo admin accounts can authenticate successfully."""
    for admin in DEMO_ADMINS:
        res = client.post("/api/auth/login", json={
            "email": admin["email"],
            "password": admin["password"],
            "role": "admin"
        })
        assert res.status_code == 200, f"Failed to login seeded admin {admin['email']}: {res.text}"
        data = res.json()
        assert "token" in data
        assert data["user"]["role"] == "admin"
        assert data["user"]["authority"] == admin["authority"]


def test_admin_signup_with_invite_code(client):
    """Test 4a: Admin signup requires authority-matching invite code."""
    # 1. Invalid invite code must be rejected
    res_fail = client.post("/api/auth/admin/register", json={
        "email": "bad.invite@nhai.demo",
        "password": "SecurePassword123!",
        "name": "Unauthorized Officer",
        "authority": "NHAI",
        "invite_code": "WRONG-CODE-999"
    })
    assert res_fail.status_code == 400
    assert "Invalid invite code" in res_fail.text

    # 2. Valid invite code must succeed
    valid_code = DEFAULT_INVITE_CODES["NHAI"]
    res_ok = client.post("/api/auth/admin/register", json={
        "email": "new.nhai.officer@roadwatch.demo",
        "password": "SecurePassword123!",
        "name": "Verified NHAI Officer",
        "authority": "NHAI",
        "invite_code": valid_code
    })
    assert res_ok.status_code == 201
    data = res_ok.json()
    assert data["user"]["role"] == "admin"
    assert data["user"]["authority"] == "NHAI"


def test_issue_auto_routing(client):
    """Test 4c: Reports automatically route to the appropriate authority based on road/category."""
    # Login citizen
    login_res = client.post("/api/auth/login", json={
        "email": "citizen@roadwatch.dev",
        "password": "citizen123"
    })
    assert login_res.status_code == 200, login_res.text
    token = login_res.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Highway -> NHAI
    res1 = client.post("/api/reports", json={
        "category": "Pothole",
        "severity": "HIGH",
        "description": "Deep pothole on expressway",
        "road_name": "NH-48 Express Corridor",
        "latitude": 28.4595,
        "longitude": 77.0266,
    }, headers=headers)
    assert res1.status_code == 201
    assert res1.json()["authority"] == "NHAI"

    # 2. Municipal / Sector -> MCD
    res2 = client.post("/api/reports", json={
        "category": "Streetlight",
        "severity": "LOW",
        "description": "Broken municipal light",
        "road_name": "Sector 14 Internal Road",
        "latitude": 28.4600,
        "longitude": 77.0300,
    }, headers=headers)
    assert res2.status_code == 201
    assert res2.json()["authority"] == "MCD"


def test_admin_authority_filtering(client):
    """Test 4d: Admin GET /api/reports is strictly filtered to admin.authority."""
    # Login NHAI Admin
    nhai_login = client.post("/api/auth/login", json={
        "email": "admin.nhai@roadwatch.demo",
        "password": DEMO_ADMINS[0]["password"],
        "role": "admin"
    })
    assert nhai_login.status_code == 200
    nhai_token = nhai_login.json()["token"]

    # Fetch reports as NHAI admin
    res = client.get("/api/reports", headers={"Authorization": f"Bearer {nhai_token}"})
    assert res.status_code == 200
    reports = res.json()
    assert len(reports) > 0
    for r in reports:
        assert r["authority"] == "NHAI", f"Expected only NHAI reports, got {r['authority']}"


def test_resolution_geotag_distance_validation(client):
    """Test 4e: Resolution requires geotag within 50m of report location."""
    # Create issue as citizen
    cit_login = client.post("/api/auth/login", json={
        "email": "citizen@roadwatch.dev",
        "password": "citizen123"
    })
    assert cit_login.status_code == 200
    cit_token = cit_login.json()["token"]
    rep_res = client.post("/api/reports", json={
        "category": "Pothole",
        "severity": "CRITICAL",
        "road_name": "NH-48 Sector 31",
        "latitude": 28.4595,
        "longitude": 77.0266,
    }, headers={"Authorization": f"Bearer {cit_token}"})
    assert rep_res.status_code == 201
    report_id = rep_res.json()["id"]

    # Login NHAI admin
    nhai_login = client.post("/api/auth/login", json={
        "email": "admin.nhai@roadwatch.demo",
        "password": DEMO_ADMINS[0]["password"],
        "role": "admin"
    })
    assert nhai_login.status_code == 200
    admin_token = nhai_login.json()["token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Advance to in_progress
    status_res = client.patch(f"/api/reports/{report_id}/status", json={"status": "in_progress"}, headers=admin_headers)
    assert status_res.status_code == 200
    assert status_res.json()["status"] == "in_progress"

    # 1. Geotag > 50 meters away (~610 meters away) -> Must reject with 400
    far_res = client.post(f"/api/reports/{report_id}/resolve", json={
        "photo_url": "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7",
        "latitude": 28.4650,
        "longitude": 77.0266,
        "source": "browser_gps"
    }, headers=admin_headers)
    assert far_res.status_code == 400
    assert "50m" in far_res.text

    # 2. Geotag <= 50 meters away (~5.5 meters away) -> Must succeed
    close_res = client.post(f"/api/reports/{report_id}/resolve", json={
        "photo_url": "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7",
        "latitude": 28.45955,
        "longitude": 77.02662,
        "source": "browser_gps"
    }, headers=admin_headers)
    assert close_res.status_code == 200
    data = close_res.json()
    assert data["status"] == "resolved"
    assert data["resolution"] is not None
    assert data["resolution"]["resolved_geotag"]["distance_meters"] <= 50.0


def test_road_profile_overlay(client):
    """Test Issue 3: Admin road profile overlay upsert and retrieval."""
    # Login NHAI admin
    nhai_login = client.post("/api/auth/login", json={
        "email": "admin.nhai@roadwatch.demo",
        "password": DEMO_ADMINS[0]["password"],
        "role": "admin"
    })
    assert nhai_login.status_code == 200
    token = nhai_login.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Upsert road overlay for osm_id 999888777
    res = client.put("/api/roads/overlay/999888777", json={
        "road_name": "NH-48 Express Test Corridor",
        "road_number": "NH-48",
        "authority": "NHAI",
        "contractor": "IRB Infrastructure",
        "lanes": "8",
        "maxspeed": "100 km/h",
        "last_maintenance": "2026-09"
    }, headers=headers)
    assert res.status_code == 200
    overlay = res.json()
    assert overlay["osm_id"] == "999888777"
    assert overlay["contractor"] == "IRB Infrastructure"
    assert overlay["lanes"] == "8"
