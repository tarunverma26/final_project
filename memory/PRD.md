# ROADWATCH — Product Requirements Document

## Original Problem Statement
Design and build a premium animated frontend for ROADWATCH, a civic-tech
platform for identifying roads, reporting potholes, tracking complaints and
showing road information. The entire website should feel like a **living
damaged road** (dark asphalt, water-filled potholes, cracks, faded markings,
puddles, rain, moving headlights, parallax). Includes hero, identify road,
report problem, AI assessment, road profile, 9-step complaint tracking,
dark interactive map, and citizen/authority/admin dashboards. Premium dark
civic-tech aesthetic with glassmorphism and road-warning accents.

## User Choices (Feb 22, 2026)
- **Scope**: Full-stack (React + FastAPI + MongoDB) with persisted reports.
- **AI Assessment**: Mocked/simulated (rule-based mapping).
- **Map**: Leaflet + CartoDB Dark Matter dark tiles.
- **Auth**: Real JWT email/password with a split-screen login (Login as
  Administration / Login as User).

## User Personas
- **Citizen**: reports potholes, tracks their complaint through 9 steps, browses the civic map.
- **Authority / Admin**: sees all reports across the city, advances complaints along the timeline.

## Core Requirements (static)
- Cinematic living-road landing (hero + interactive pothole ripple + floating stats).
- Identify Road via GPS (mocked NH-48 profile).
- Report with 10 category cards, photo upload, severity, geolocation, description.
- AI Assessment card (severity, safety risk, confidence bar, priority, disclaimer).
- 9-step animated complaint timeline (SUBMITTED → RESOLVED).
- Dark Leaflet map with glowing markers.
- Citizen and admin dashboards (stats, list, mini map).
- JWT auth with role gating.

## What's Been Implemented — Feb 22, 2026 (v1)
- Backend `/api` routes: auth (register/login with role gate/me), reports (CRUD, public feed, admin advance), stats overview, mocked road identify. Admin + demo citizen seeded on startup. Bcrypt password hashing. Bearer JWT (localStorage on FE).
- Frontend routes: `/`, `/login`, `/register`, `/identify`, `/report`, `/map`, `/events`, `/contractors`, `/tracking/:id` (protected), `/dashboard` (protected).
- Cinematic UI: asphalt background, moving lane markings, rain particles, headlight sweep, interactive pothole with ripple, GPS pulse, AI scan line, animated timeline, glassmorphism nav & cards.
- Fixes after 1st test iteration: login card centering (framer-motion transform vs. Tailwind translate), mobile hamburger nav, stats fallback only when DB empty, citizen dashboard stat labeling, tracking-advance error surfacing, AI disclaimer contrast.

## Prioritized Backlog
- **P1** — Real AI vision analysis of uploaded photos (Gemini / Claude) replacing the mock.
- **P1** — Reverse-geocoding for `/api/roads/identify` (real OSM Nominatim lookup) instead of static NH-48.
- **P2** — Object-storage uploads for photos (currently base64 in payload; move to signed URLs).
- **P2** — Real events/contractors data + admin CRUD.
- **P2** — Notifications (email/SMS) on timeline advance.
- **P2** — Login rate limiting / brute-force lockout; explicit CORS origins with `allow_credentials`.
- **P3** — Public map projection (drop `user_id`, base64 photo) for `/api/reports/public`.
- **P3** — Charts for road profile (recharts) and month-over-month resolution rate.

## Next Tasks (immediate)
See "Next Action Items" in finish summary.
