import sys
from pathlib import Path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "version" in data


def test_authority_options():
    response = client.get("/api/roads/authority-options")
    assert response.status_code == 200
    data = response.json()
    assert "options" in data
    assert "National Highways Authority of India (NHAI)" in data["options"]


def test_auth_login_validation():
    # Invalid email
    response = client.post("/api/auth/login", json={"email": "not-an-email", "password": "123"})
    assert response.status_code == 422


def test_auth_register_validation():
    # Password too short
    response = client.post("/api/auth/register", json={"email": "citizen@test.com", "password": "123", "name": "Citizen"})
    assert response.status_code == 422


def test_nearby_reports_validation():
    # Missing required lat/lng
    response = client.get("/api/reports/nearby")
    assert response.status_code == 422

    # Invalid latitude out of range
    response = client.get("/api/reports/nearby?lat=95.0&lng=77.0")
    assert response.status_code == 422


def test_upload_unauthenticated():
    # Should require authentication
    response = client.post("/api/upload")
    assert response.status_code == 401


def test_advance_unauthenticated():
    response = client.post("/api/reports/123/advance")
    assert response.status_code == 401
