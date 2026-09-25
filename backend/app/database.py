import logging
import uuid
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import (
    MONGO_URL, DB_NAME, ADMIN_EMAIL, ADMIN_PASSWORD,
    DEFAULT_INVITE_CODES, DEMO_ADMINS
)


logger = logging.getLogger("roadwatch.database")

# Resilient database connection with local in-memory fallback
def _init_db():
    if MONGO_URL and ("mongodb+srv://" in MONGO_URL or ("mongo" in MONGO_URL and "localhost" not in MONGO_URL)):
        c = AsyncIOMotorClient(MONGO_URL, maxPoolSize=50, minPoolSize=5, serverSelectionTimeoutMS=5000)
        return c, c[DB_NAME]
    try:
        import pymongo
        sync_c = pymongo.MongoClient(MONGO_URL, serverSelectionTimeoutMS=1200)
        sync_c.server_info()
        c = AsyncIOMotorClient(MONGO_URL, maxPoolSize=50, minPoolSize=5, serverSelectionTimeoutMS=5000)
        return c, c[DB_NAME]
    except Exception:
        logger.info("[DB] Local MongoDB not detected at %s. Initializing in-memory AsyncMongoMockClient.", MONGO_URL)
        from mongomock_motor import AsyncMongoMockClient
        c = AsyncMongoMockClient()
        return c, c[DB_NAME]

client, db = _init_db()

CONTRACTORS_SEED = [
    {"name": "IRB Infrastructure Developers", "road": "NH-48", "region": "Delhi–Jaipur Corridor", "focus": "National Highways"},
    {"name": "L&T Construction", "road": "NH-16", "region": "Chennai–Kolkata", "focus": "National Highways"},
    {"name": "Ashoka Buildcon", "road": "SH-32", "region": "Maharashtra", "focus": "State Highways"},
    {"name": "Dilip Buildcon", "road": "NH-8", "region": "Delhi–Mumbai", "focus": "National Highways"},
    {"name": "GR Infraprojects", "road": "SH-6", "region": "Gujarat", "focus": "State Highways"},
    {"name": "PNC Infratech", "road": "MDR-11", "region": "Uttar Pradesh", "focus": "District Roads"},
]

EVENTS_SEED = [
    {
        "title": "Public Consultation — NH-48 Widening",
        "description": "Public consultation and stakeholder review meeting regarding NH-48 lane widening and stormwater drainage.",
        "date": "2026-10-15",
        "time": "10:00 AM",
        "location": "Gurugram Municipal Office",
        "organizer": "NHAI & Municipal Corporation of Gurugram",
        "status": "UPCOMING",
        "latitude": 28.4595,
        "longitude": 77.0266,
    },
    {
        "title": "Monsoon Road Repair & Patching Drive",
        "description": "Rapid patching and pothole repair drive for arterial collector roads across Sector 14 and Sector 17.",
        "date": "2026-10-28",
        "time": "09:00 AM",
        "location": "Ward-14 Community Hall",
        "organizer": "State PWD & RoadWatch Citizen Volunteer Corps",
        "status": "UPCOMING",
        "latitude": 28.4720,
        "longitude": 77.0350,
    }
]


async def init_indexes():
    """Create essential MongoDB indexes and 2dsphere geospatial index."""
    try:
        # Users indexes
        await db.users.create_index("email", unique=True)
        await db.users.create_index("id", unique=True)
        await db.users.create_index("role")

        # Reports indexes
        await db.reports.create_index("id", unique=True)
        await db.reports.create_index("created_at")
        await db.reports.create_index("user_id")
        await db.reports.create_index("status")
        await db.reports.create_index("authority")
        await db.reports.create_index("contractor_id")
        # Geospatial 2dsphere index for proximity queries
        await db.reports.create_index([("location", "2dsphere")], sparse=True)

        # Contractors indexes
        await db.contractors.create_index("name", unique=True)
        await db.contractors.create_index("id", unique=True)

        # Road authority votes indexes
        await db.road_authority_votes.create_index("segment_key")
        await db.road_authority_votes.create_index(
            [("segment_key", 1), ("user_id", 1), ("authority", 1)],
            unique=True
        )

        # Events indexes
        await db.events.create_index("id", unique=True)
        await db.events.create_index("date")
        await db.events.create_index("status")

        # Authority invite codes indexes
        await db.authority_invite_codes.create_index("authority", unique=True)
        await db.authority_invite_codes.create_index("code", unique=True)

        # Road profile overlays indexes
        await db.road_profile_overlays.create_index("osm_id", unique=True)
        await db.road_profile_overlays.create_index("segment_key")

        logger.info("[DB] All indexes verified and created successfully.")
    except Exception as e:
        logger.warning(f"[DB] Index creation notice: {e}")


async def seed_default_data(hash_func):
    """Seed administrator, authority invite codes, demo admins, demo citizen, contractors, and initial civic events."""
    now = datetime.now(timezone.utc).isoformat()

    # 1. Seed Authority Invite Codes (Config Table)
    for auth_name, code in DEFAULT_INVITE_CODES.items():
        existing_code = await db.authority_invite_codes.find_one({"authority": auth_name})
        if not existing_code:
            await db.authority_invite_codes.insert_one({
                "id": str(uuid.uuid4()),
                "authority": auth_name,
                "code": code,
                "description": f"Official invite code for {auth_name} administrators and engineers",
                "is_active": True,
                "created_at": now,
            })
            logger.info(f"[DB] Seeded invite code for {auth_name}: {code}")
        else:
            await db.authority_invite_codes.update_one(
                {"authority": auth_name},
                {"$set": {"code": code, "is_active": True}}
            )

    # 2. Seed Demo Admin Accounts (Issue 4b - seeded directly for testing/demos)
    # NHAI (admin.nhai@roadwatch.demo), MCD (admin.mcd@roadwatch.demo), PWD (admin.pwd@roadwatch.demo)
    for admin_spec in DEMO_ADMINS:
        admin_email = admin_spec["email"].lower()
        existing_admin = await db.users.find_one({"email": admin_email})
        if not existing_admin:
            await db.users.insert_one({
                "id": str(uuid.uuid4()),
                "email": admin_email,
                "name": admin_spec["name"],
                "role": "admin",
                "authority": admin_spec["authority"],
                "password_hash": hash_func(admin_spec["password"]),
                "department": f"{admin_spec['authority']} Operations",
                "is_active": True,
                "created_at": now,
            })
            logger.info(f"[DB] Seeded demo admin for {admin_spec['authority']}: {admin_email}")
        else:
            await db.users.update_one(
                {"email": admin_email},
                {
                    "$set": {
                        "role": "admin",
                        "authority": admin_spec["authority"],
                        "password_hash": hash_func(admin_spec["password"]),
                        "department": f"{admin_spec['authority']} Operations",
                        "is_active": True,
                    }
                }
            )

    # 3. Seed Default Admin (if configured via env)
    if ADMIN_EMAIL:
        admin_email = ADMIN_EMAIL.lower()
        existing = await db.users.find_one({"email": admin_email})
        if not existing:
            await db.users.insert_one({
                "id": str(uuid.uuid4()),
                "email": admin_email,
                "name": "ROADWATCH Superadmin",
                "role": "admin",
                "authority": None,  # Superadmin has oversight across all authorities
                "password_hash": hash_func(ADMIN_PASSWORD),
                "department": "Central Administration",
                "is_active": True,
                "created_at": now,
            })
            logger.info(f"[DB] Seeded superadmin user: {admin_email}")
        else:
            await db.users.update_one(
                {"email": admin_email},
                {"$set": {"role": "admin", "password_hash": hash_func(ADMIN_PASSWORD)}}
            )

    # 4. Seed Demo Citizen
    citizen_email = "citizen@roadwatch.dev"
    if not await db.users.find_one({"email": citizen_email}):
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": citizen_email,
            "name": "Demo Citizen",
            "role": "user",
            "authority": None,
            "password_hash": hash_func("citizen123"),
            "department": None,
            "is_active": True,
            "created_at": now,
        })
        logger.info(f"[DB] Seeded demo citizen: {citizen_email}")

    # 5. Seed Contractors
    for c in CONTRACTORS_SEED:
        if not await db.contractors.find_one({"name": c["name"]}):
            await db.contractors.insert_one({
                "id": str(uuid.uuid4()),
                **c,
                "contact_email": None,
                "contact_phone": None,
                "created_at": now,
            })

    # 6. Seed Civic Events
    for e in EVENTS_SEED:
        if not await db.events.find_one({"title": e["title"]}):
            await db.events.insert_one({
                "id": str(uuid.uuid4()),
                **e,
                "created_at": now,
            })

