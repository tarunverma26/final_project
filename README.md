# ROADWATCH — Civic Bharat

An open civic infrastructure monitoring, road hazard reporting, and contractor accountability platform.

## Demo Account

A pre-verified administrator account is seeded and ready for immediate evaluation, judging, and dashboard demonstrations:

| Field | Value |
|---|---|
| **Role** | Authority Administrator (Pre-verified) |
| **Full Name** | Demo Administrator |
| **Official Email** | `demo.admin@roadwatch.gov.in` |
| **Password** | `RoadWatch@Demo2026` |
| **Governing Authority** | NHAI (National Highways Authority of India) |
| **Authority Invite Code** | `NHAI-CORRIDOR-DEMO01` |
| **Department** | NHAI National Corridor Command |
| **Admin Portal** | [http://localhost:3000/admin/dashboard](http://localhost:3000/admin/dashboard) |
| **Login URL** | [http://localhost:3000/login](http://localhost:3000/login) |

### Running the Seed Script Manually
You can run the idempotent seed script at any time:
```bash
# Via Python
python backend/seed_demo.py

# Via NPM
npm run seed:demo
```
This script checks for existing records first and ensures the demo account and invite code are active and pre-verified.

---

## Architecture Overview
- **Backend**: FastAPI (Python 3.10+) with async MongoDB / resilient in-memory fallback.
- **Frontend**: React 19, Tailwind CSS, Leaflet, IBM Plex Sans & Outfit typography.
- **Smart Routing & Signals Layer**:
  - `RouteHealthSection`: Compares Fastest vs. Recommended route with health scores and fleet impact telemetry.
  - `StressIndexSection`: Compound Resource Stress Index across municipal wards combining potholes, drainage, and lighting signals.
  - `SmsReportingSection`: Low-data / offline SMS & WhatsApp 24/7 reporting fallback.
