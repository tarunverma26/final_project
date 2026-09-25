#!/usr/bin/env python3
"""
RoadWatch Demo Administrator Account Seeder
Creates or updates the official pre-verified demo administrator account.
Safe and idempotent to run multiple times.
"""

import asyncio
import os
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

# Ensure backend root is in sys.path
BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.database import get_database
from app.utils.security import hash_password

DEMO_ADMIN = {
    "name": "Demo Administrator",
    "email": "demo.admin@roadwatch.gov.in",
    "password": os.getenv("DEMO_ADMIN_PASSWORD", "RoadWatch@Demo2026"),
    "authority": "NHAI",
    "department": "NHAI National Corridor Command",
    "invite_code": "NHAI-CORRIDOR-DEMO01",
}


async def seed_demo_admin():
    db = get_database()
    now = datetime.now(timezone.utc).isoformat()
    email = DEMO_ADMIN["email"].lower()

    # 1. Ensure the demo invite code is registered in authority_invite_codes
    existing_code = await db.authority_invite_codes.find_one({"code": DEMO_ADMIN["invite_code"]})
    if not existing_code:
        await db.authority_invite_codes.insert_one({
            "id": str(uuid.uuid4()),
            "authority": DEMO_ADMIN["authority"],
            "code": DEMO_ADMIN["invite_code"],
            "description": "Pre-verified invite code for Demo Administrator testing",
            "is_active": True,
            "created_at": now,
        })
    else:
        await db.authority_invite_codes.update_one(
            {"code": DEMO_ADMIN["invite_code"]},
            {"$set": {"authority": DEMO_ADMIN["authority"], "is_active": True}}
        )

    # 2. Seed or update the Demo Administrator user account
    password_hash = hash_password(DEMO_ADMIN["password"])
    existing_user = await db.users.find_one({"email": email})

    if not existing_user:
        user_doc = {
            "id": str(uuid.uuid4()),
            "name": DEMO_ADMIN["name"],
            "email": email,
            "role": "admin",
            "authority": DEMO_ADMIN["authority"],
            "department": DEMO_ADMIN["department"],
            "password_hash": password_hash,
            "is_active": True,
            "is_verified": True,
            "invite_code_used": DEMO_ADMIN["invite_code"],
            "created_at": now,
            "updated_at": now,
        }
        await db.users.insert_one(user_doc)
        action_taken = "CREATED"
    else:
        await db.users.update_one(
            {"email": email},
            {
                "$set": {
                    "name": DEMO_ADMIN["name"],
                    "role": "admin",
                    "authority": DEMO_ADMIN["authority"],
                    "department": DEMO_ADMIN["department"],
                    "password_hash": password_hash,
                    "is_active": True,
                    "is_verified": True,
                    "invite_code_used": DEMO_ADMIN["invite_code"],
                    "updated_at": now,
                }
            }
        )
        action_taken = "UPDATED (Pre-verified)"

    # Print memorable demo credentials to console
    print("\n" + "=" * 65)
    print("  ROADWATCH — DEMO ADMINISTRATOR CREDENTIALS")
    print("=" * 65)
    print(f"  Status:              {action_taken}")
    print(f"  Full Name:           {DEMO_ADMIN['name']}")
    print(f"  Official Email:      {DEMO_ADMIN['email']}")
    print(f"  Password:            {DEMO_ADMIN['password']}")
    print(f"  Governing Authority: {DEMO_ADMIN['authority']}")
    print(f"  Invite Code Used:    {DEMO_ADMIN['invite_code']}")
    print(f"  Department:          {DEMO_ADMIN['department']}")
    print(f"  Login Portal:        http://localhost:3000/login")
    print(f"  Admin Dashboard:     http://localhost:3000/admin/dashboard")
    print("=" * 65 + "\n")


if __name__ == "__main__":
    asyncio.run(seed_demo_admin())
