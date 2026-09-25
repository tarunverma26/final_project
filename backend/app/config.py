from pathlib import Path
import os
import logging
from dotenv import load_dotenv

# Base backend directory
BACKEND_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BACKEND_DIR / ".env")

# App settings
APP_TITLE = "ROADWATCH API"
APP_VERSION = "0.2.0"
DEBUG = os.getenv("DEBUG", "false").lower() in ("true", "1", "yes")

# Database settings
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "roadwatch")

# Security & JWT settings
JWT_SECRET = os.getenv("JWT_SECRET", "civic-bharat-roadwatch-secure-key-2026")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

# Seed Accounts
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")

# CORS settings
raw_cors = os.getenv("CORS_ORIGINS", "*")
if raw_cors.strip() == "*":
    CORS_ORIGINS = ["*"]
else:
    CORS_ORIGINS = [orig.strip() for orig in raw_cors.split(",") if orig.strip()]

# Storage settings (S3 / Local)
S3_BUCKET = os.getenv("S3_BUCKET")
S3_REGION = os.getenv("S3_REGION", "us-east-1")
S3_ENDPOINT_URL = os.getenv("S3_ENDPOINT_URL")
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
S3_PUBLIC_BASE_URL = os.getenv("S3_PUBLIC_BASE_URL")

# Local uploads directory
UPLOAD_DIR = BACKEND_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Base URL for local asset serving
BASE_URL = os.getenv("REACT_APP_BACKEND_URL", "").rstrip("/")

# AI Vision keys
EMERGENT_LLM_KEY = os.getenv("EMERGENT_LLM_KEY", "")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

# Standard timeline steps
TIMELINE_STEPS = [
    "SUBMITTED", "UNDER_REVIEW", "FORWARDED", "ASSIGNED",
    "WORK_PLANNED", "WORK_IN_PROGRESS", "RESOLUTION",
    "VERIFIED", "RESOLVED",
]

# Canonical authorities for admin routing & verification
AUTHORITY_LIST = [
    "NHAI",
    "MCD",
    "PWD",
    "State PWD",
    "Municipal Corporation",
]

# Default authority invite codes (seeded in DB)
DEFAULT_INVITE_CODES = {
    "NHAI": os.getenv("INVITE_CODE_NHAI", "NHAI-CORRIDOR-2026-X8K9"),
    "MCD": os.getenv("INVITE_CODE_MCD", "MCD-CIVIC-2026-W4M2"),
    "PWD": os.getenv("INVITE_CODE_PWD", "PWD-INFRA-2026-P7R3"),
    "State PWD": os.getenv("INVITE_CODE_STATE_PWD", "SPWD-HIGHWAY-2026-K9T1"),
    "Municipal Corporation": os.getenv("INVITE_CODE_MUNICIPAL", "MUNICIPAL-URBAN-2026-B5N8"),
}

# Seeded Demo Admin Accounts for immediate testing/demos
DEMO_ADMINS = [
    {
        "email": "admin.nhai@roadwatch.demo",
        "password": os.getenv("DEMO_ADMIN_NHAI_PASS", "Nhai@Secure2026!"),
        "name": "NHAI Highway Director",
        "authority": "NHAI",
        "department": "NHAI Corridor Division",
    },
    {
        "email": "admin.mcd@roadwatch.demo",
        "password": os.getenv("DEMO_ADMIN_MCD_PASS", "Mcd@CivicSafe2026!"),
        "name": "MCD Municipal Commissioner",
        "authority": "MCD",
        "department": "MCD Urban Infrastructure",
    },
    {
        "email": "admin.pwd@roadwatch.demo",
        "password": os.getenv("DEMO_ADMIN_PWD_PASS", "Pwd@BuildClean2026!"),
        "name": "PWD Executive Engineer",
        "authority": "PWD",
        "department": "PWD State Roads",
    },
    {
        "email": "demo.admin@roadwatch.gov.in",
        "password": os.getenv("DEMO_ADMIN_PASSWORD", "RoadWatch@Demo2026"),
        "name": "Demo Administrator",
        "authority": "NHAI",
        "department": "NHAI National Corridor Command",
        "invite_code": "NHAI-CORRIDOR-DEMO01",
    },
]

# Known authority options for citizen feedback
KNOWN_AUTHORITIES = [
    "National Highways Authority of India (NHAI)",
    "State Public Works Department",
    "Zilla Parishad / District Administration",
    "Municipal Corporation / Local Body",
    "Border Roads Organisation (BRO)",
    "Cantonment Board",
    "Toll Concessionaire (Private)",
    "Private / Corporate Road",
    "Other",
]

