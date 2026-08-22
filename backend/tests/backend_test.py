"""ROADWATCH backend API tests (auth, reports, stats, roads)."""
import os
import re
import uuid
from pathlib import Path

import pytest
import requests
from dotenv import dotenv_values

frontend_env = dotenv_values("/app/frontend/.env")
base_url = os.environ.get("REACT_APP_BACKEND_URL") or frontend_env.get("REACT_APP_BACKEND_URL")
if not base_url:
    raise RuntimeError("REACT_APP_BACKEND_URL missing")
BASE_URL = base_url.rstrip("/")
API = f"{BASE_URL}/api"


# ---------------- fixtures ----------------
@pytest.fixture(scope="session")
def creds():
    p = Path("/app/memory/test_credentials.md")
    if not p.exists():
        pytest.skip("missing test_credentials.md")
    c = p.read_text()
    emails = re.findall(r"\*\*Email\*\*:\s*(\S+)", c)
    pws = re.findall(r"\*\*Password\*\*:\s*(\S+)", c)
    if len(emails) < 2 or len(pws) < 2:
        pytest.skip("credentials not parseable")
    return {"admin": (emails[0], pws[0]), "user": (emails[1], pws[1])}


@pytest.fixture(scope="session")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


def _login(client, email, password, role):
    return client.post(f"{API}/auth/login", json={"email": email, "password": password, "role": role})


@pytest.fixture(scope="session")
def admin_token(client, creds):
    e, p = creds["admin"]
    r = _login(client, e, p, "admin")
    if r.status_code != 200:
        pytest.fail(f"admin login failed {r.status_code}: {r.text[:300]}")
    return r.json()["token"]


@pytest.fixture(scope="session")
def user_token(client, creds):
    e, p = creds["user"]
    r = _login(client, e, p, "user")
    if r.status_code != 200:
        pytest.fail(f"citizen login failed {r.status_code}: {r.text[:300]}")
    return r.json()["token"]


def H(tok):
    return {"Authorization": f"Bearer {tok}"}


# ---------------- auth ----------------
class TestAuth:
    def test_admin_login_role_admin(self, client, creds):
        e, p = creds["admin"]
        r = _login(client, e, p, "admin")
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["user"]["role"] == "admin"
        assert d["user"]["email"] == e.lower()
        assert isinstance(d["token"], str) and len(d["token"]) > 20
        assert "password_hash" not in d["user"]

    def test_citizen_login_as_admin_rejected(self, client, creds):
        e, p = creds["user"]
        r = _login(client, e, p, "admin")
        assert r.status_code == 403, r.text

    def test_citizen_login_user_role(self, client, creds):
        e, p = creds["user"]
        r = _login(client, e, p, "user")
        assert r.status_code == 200
        assert r.json()["user"]["role"] == "user"

    def test_admin_can_login_as_user_role(self, client, creds):
        e, p = creds["admin"]
        r = _login(client, e, p, "user")
        assert r.status_code == 200
        # token role must remain admin (actual role), not requested role
        assert r.json()["user"]["role"] == "admin"

    def test_wrong_password(self, client, creds):
        e, _ = creds["admin"]
        r = _login(client, e, "wrongpass123", "user")
        assert r.status_code == 401

    def test_unknown_email(self, client):
        r = _login(client, f"nobody_{uuid.uuid4().hex[:6]}@x.dev", "whatever", "user")
        assert r.status_code == 401

    def test_login_invalid_email_format(self, client):
        r = client.post(f"{API}/auth/login", json={"email": "notanemail", "password": "x", "role": "user"})
        assert r.status_code == 422

    def test_register_and_me_and_duplicate(self, client):
        email = f"TEST_{uuid.uuid4().hex[:8]}@roadwatch-qa.com"
        r = client.post(f"{API}/auth/register",
                        json={"email": email, "password": "secret123", "name": "TEST User"})
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["user"]["email"] == email.lower()
        assert d["user"]["role"] == "user"
        tok = d["token"]

        me = client.get(f"{API}/auth/me", headers=H(tok))
        assert me.status_code == 200
        assert me.json()["email"] == email.lower()
        assert me.json()["id"] == d["user"]["id"]

        dup = client.post(f"{API}/auth/register",
                          json={"email": email, "password": "secret123", "name": "TEST User"})
        assert dup.status_code == 400

    def test_register_short_password(self, client):
        r = client.post(f"{API}/auth/register",
                        json={"email": f"TEST_{uuid.uuid4().hex[:6]}@x.dev", "password": "123", "name": "A"})
        assert r.status_code == 422

    def test_me_without_token(self, client):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_me_bad_token(self, client):
        r = requests.get(f"{API}/auth/me", headers=H("garbage.token.here"))
        assert r.status_code == 401

    def test_bcrypt_hash_format(self):
        import asyncio
        from motor.motor_asyncio import AsyncIOMotorClient
        from dotenv import dotenv_values as dv
        env = dv("/app/backend/.env")

        async def go():
            c = AsyncIOMotorClient(env["MONGO_URL"])
            u = await c[env["DB_NAME"]].users.find_one({"email": env["ADMIN_EMAIL"].lower()})
            c.close()
            return u

        u = asyncio.get_event_loop().run_until_complete(go()) if False else asyncio.run(go())
        assert u is not None, "admin not seeded"
        assert u["password_hash"].startswith("$2b$"), u["password_hash"][:10]


# ---------------- reports ----------------
class TestReports:
    created = []

    def test_create_report_and_ai_assessment(self, client, user_token):
        payload = {"category": "Pothole", "severity": "HIGH",
                   "description": "TEST_deep pothole near junction",
                   "latitude": 28.45, "longitude": 77.02, "road_name": "TEST_NH-48"}
        r = client.post(f"{API}/reports", json=payload, headers=H(user_token))
        assert r.status_code == 200, r.text
        d = r.json()
        TestReports.created.append(d["id"])
        assert d["status"] == "SUBMITTED"
        assert d["severity"] == "HIGH"
        assert d["ai_assessment"]["confidence"] == 91
        assert d["ai_assessment"]["priority"] == "CRITICAL"
        assert len(d["timeline"]) == 9
        assert d["timeline"][0]["status"] == "completed"
        assert all(s["status"] == "pending" for s in d["timeline"][1:])
        assert "_id" not in d

        g = client.get(f"{API}/reports/{d['id']}", headers=H(user_token))
        assert g.status_code == 200
        assert g.json()["road_name"] == "TEST_NH-48"
        assert g.json()["description"] == payload["description"]

    def test_create_report_unauthenticated(self, client):
        r = requests.post(f"{API}/reports", json={"category": "Pothole"})
        assert r.status_code == 401

    def test_create_report_invalid_severity(self, client, user_token):
        r = client.post(f"{API}/reports", json={"category": "Pothole", "severity": "NUCLEAR"},
                        headers=H(user_token))
        assert r.status_code == 422

    def test_list_mine_only_own(self, client, user_token, admin_token):
        # admin creates a report
        ar = client.post(f"{API}/reports", json={"category": "Debris", "severity": "LOW",
                                                 "description": "TEST_admin report"},
                         headers=H(admin_token))
        assert ar.status_code == 200
        admin_report_id = ar.json()["id"]
        TestReports.created.append(admin_report_id)

        lst = client.get(f"{API}/reports", headers=H(user_token))
        assert lst.status_code == 200
        ids = [x["id"] for x in lst.json()]
        assert admin_report_id not in ids, "citizen sees other users' reports"

    def test_admin_sees_all(self, client, admin_token, user_token):
        ur = client.post(f"{API}/reports", json={"category": "Pothole", "severity": "MEDIUM",
                                                 "description": "TEST_citizen visible to admin"},
                         headers=H(user_token))
        rid = ur.json()["id"]
        TestReports.created.append(rid)
        lst = client.get(f"{API}/reports", headers=H(admin_token))
        assert lst.status_code == 200
        assert rid in [x["id"] for x in lst.json()]

    def test_admin_mine_filter(self, client, admin_token):
        lst = client.get(f"{API}/reports?mine=true", headers=H(admin_token))
        assert lst.status_code == 200
        me = client.get(f"{API}/auth/me", headers=H(admin_token)).json()
        assert all(x["user_id"] == me["id"] for x in lst.json())

    def test_public_reports_no_auth(self, client):
        r = requests.get(f"{API}/reports/public")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        if data:
            assert "_id" not in data[0]
            assert {"latitude", "longitude", "severity"} <= set(data[0])

    def test_get_other_users_report_forbidden(self, client, admin_token, user_token):
        ar = client.post(f"{API}/reports", json={"category": "Debris", "severity": "LOW",
                                                 "description": "TEST_private admin"},
                         headers=H(admin_token))
        rid = ar.json()["id"]
        TestReports.created.append(rid)
        r = client.get(f"{API}/reports/{rid}", headers=H(user_token))
        assert r.status_code == 403

    def test_get_missing_report_404(self, client, user_token):
        r = client.get(f"{API}/reports/{uuid.uuid4()}", headers=H(user_token))
        assert r.status_code == 404

    def test_advance_requires_admin(self, client, user_token):
        cr = client.post(f"{API}/reports", json={"category": "Pothole", "severity": "LOW",
                                                 "description": "TEST_advance denied"},
                         headers=H(user_token))
        rid = cr.json()["id"]
        TestReports.created.append(rid)
        r = client.post(f"{API}/reports/{rid}/advance", headers=H(user_token))
        assert r.status_code == 403

    def test_advance_full_timeline(self, client, admin_token, user_token):
        cr = client.post(f"{API}/reports", json={"category": "Pothole", "severity": "CRITICAL",
                                                 "description": "TEST_advance flow"},
                         headers=H(user_token))
        rid = cr.json()["id"]
        TestReports.created.append(rid)

        r = client.post(f"{API}/reports/{rid}/advance", headers=H(admin_token))
        assert r.status_code == 200, r.text
        assert r.json()["status"] == "UNDER_REVIEW"
        assert r.json()["timeline"][1]["status"] == "completed"

        # persistence
        g = client.get(f"{API}/reports/{rid}", headers=H(admin_token))
        assert g.json()["status"] == "UNDER_REVIEW"

        # advance to end
        for _ in range(8):
            client.post(f"{API}/reports/{rid}/advance", headers=H(admin_token))
        g = client.get(f"{API}/reports/{rid}", headers=H(admin_token))
        assert g.json()["status"] == "RESOLVED"
        assert all(s["status"] == "completed" for s in g.json()["timeline"])

        # advancing beyond end must not error/regress
        extra = client.post(f"{API}/reports/{rid}/advance", headers=H(admin_token))
        assert extra.status_code == 200, extra.text
        assert extra.json()["status"] == "RESOLVED"

    def test_advance_missing_report_404(self, client, admin_token):
        r = client.post(f"{API}/reports/{uuid.uuid4()}/advance", headers=H(admin_token))
        assert r.status_code == 404

    def test_photo_base64_roundtrip(self, client, user_token):
        data_url = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg=="
        cr = client.post(f"{API}/reports", json={"category": "Pothole", "severity": "MEDIUM",
                                                 "description": "TEST_photo", "photo_url": data_url},
                         headers=H(user_token))
        assert cr.status_code == 200
        rid = cr.json()["id"]
        TestReports.created.append(rid)
        g = client.get(f"{API}/reports/{rid}", headers=H(user_token))
        assert g.json()["photo_url"] == data_url


# ---------------- stats & roads ----------------
class TestStatsAndRoads:
    def test_stats_overview(self, client):
        r = client.get(f"{API}/stats/overview")
        assert r.status_code == 200
        d = r.json()
        for k in ("total_problems", "resolved_or_progress_pct", "resolved", "in_progress", "critical"):
            assert k in d
            assert isinstance(d[k], int)

    def test_stats_reflect_created_data(self, client, user_token):
        before = client.get(f"{API}/stats/overview").json()["critical"]
        cr = client.post(f"{API}/reports", json={"category": "Pothole", "severity": "CRITICAL",
                                                 "description": "TEST_stats"}, headers=H(user_token))
        TestReports.created.append(cr.json()["id"])
        after = client.get(f"{API}/stats/overview").json()["critical"]
        assert after == before + 1

    def test_identify_road(self, client):
        r = client.get(f"{API}/roads/identify", params={"lat": 28.45, "lng": 77.02})
        assert r.status_code == 200
        d = r.json()
        assert d["road_number"] == "NH-48"
        assert d["authority"] and d["contractor"]
        assert d["latitude"] == 28.45 and d["longitude"] == 77.02

    def test_identify_road_missing_params(self, client):
        r = client.get(f"{API}/roads/identify")
        assert r.status_code == 422


# ---------------- security observations ----------------
class TestSecurity:
    def test_brute_force_lockout(self, client, creds):
        """Playbook expects lockout after 5 failed attempts."""
        e, _ = creds["user"]
        codes = [_login(client, e, "badpassword!", "user").status_code for _ in range(6)]
        assert any(c == 429 for c in codes), f"no rate limiting/lockout; codes={codes}"


# ---------------- cleanup ----------------
@pytest.fixture(scope="session", autouse=True)
def cleanup():
    yield
    import asyncio
    from motor.motor_asyncio import AsyncIOMotorClient
    env = dotenv_values("/app/backend/.env")

    async def go():
        c = AsyncIOMotorClient(env["MONGO_URL"])
        db = c[env["DB_NAME"]]
        if TestReports.created:
            await db.reports.delete_many({"id": {"$in": TestReports.created}})
        await db.users.delete_many({"email": {"$regex": "^test_", "$options": "i"}})
        c.close()

    asyncio.run(go())
