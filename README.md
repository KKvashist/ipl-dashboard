# PitchSide — IPL Data Platform

A full-stack web application for exploring Indian Premier League (IPL) statistics — matches, players, teams, and season-over-season analytics — built on a relational dataset ingested into PostgreSQL.

**Live app:** https://modest-light-production.up.railway.app

---

## Architecture Overview

```
┌─────────────────┐        ┌──────────────────────┐        ┌────────────────┐
│   React + Vite   │  HTTP  │  Node.js / Express    │  SQL   │   PostgreSQL   │
│   (Frontend)      │ ─────▶ │  + Prisma ORM (API)   │ ─────▶ │   (Database)    │
│                   │◀───────│                        │◀───────│                 │
└─────────────────┘        └──────────────────────┘        └────────────────┘
                                      │
                                      ▼
                             OpenAPI / Swagger UI
```

- **Frontend:** React + Vite + TypeScript, Tailwind CSS, Recharts for data visualization. Talks to the backend via a typed API client (`src/services/api.ts`), with shared response types in `src/types/`.
- **Backend:** Node.js + Express + TypeScript, using Prisma as the ORM against PostgreSQL. Exposes REST endpoints for dashboard summary stats, matches (with filtering + pagination), players (top run-scorers, top wicket-takers), teams, seasons, and a points table. Documented with OpenAPI/Swagger.
- **Database:** PostgreSQL, schema managed via Prisma migrations. Seeded from the IPL historical dataset (`matches.csv` / `deliveries.csv`).
- **Containerization:** Docker images for both frontend and backend, orchestrated locally via `docker-compose`.
- **CI:** GitHub Actions runs linting, tests, and Docker image builds on push/PR.
- **Deployment:** Hosted on Railway.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, TypeScript, Tailwind CSS, Recharts |
| Backend | Node.js, Express, TypeScript |
| ORM / Data Access | Prisma |
| Database | PostgreSQL |
| API Docs | OpenAPI / Swagger UI |
| Containerization | Docker, docker-compose |
| CI/CD | GitHub Actions |
| Hosting | Railway |

## Features

- Dashboard with headline stats (matches, teams, players, seasons, total runs, wickets) and top-performer leaderboards
- Full match list with search, season filtering, and pagination
- Player roster with batting/bowling stats, searchable and filterable by role and team
- Team pages with win rates and franchise records
- Analytics page with team wins, title distribution, and wickets-per-season trend charts

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── routes/         # Express route handlers (matches, players, teams, etc.)
│   │   ├── swagger.ts      # OpenAPI/Swagger setup
│   │   └── ...
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── migrations/
│   ├── data/                # matches.csv, deliveries.csv (seed data)
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/           # Dashboard, Matches, Players, Teams, Analytics
│   │   ├── components/
│   │   ├── services/api.ts  # Backend API client
│   │   └── types/            # Shared TypeScript types
│   └── Dockerfile
├── docker-compose.yml
└── .github/workflows/ci.yml
```

## Local Setup

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (if running outside Docker)

### 1. Clone the repository
```bash
git clone https://github.com/KKvashist/ipl-dashboard.git
cd ipl-dashboard
```

### 2. Environment variables
Create a `.env` file in `backend/` with:
```
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/ipl
PORT=4000
```

Create a `.env` file in `frontend/` with:
```
VITE_API_URL=http://localhost:4000
```

### 3. Run with Docker Compose (recommended)
```bash
docker-compose up --build
```
This starts the database, backend, and frontend together.

- Frontend: http://localhost:5173
- Backend API: http://localhost:4000
- Swagger docs: http://localhost:4000/api-docs

### 4. Run manually (without Docker)

**Backend:**
```bash
cd backend
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## API Documentation

Once the backend is running, interactive Swagger docs are available at:
```
http://localhost:4000/api-docs
```

## Testing & CI

GitHub Actions (`.github/workflows/ci.yml`) runs on every push/PR:
- Lint (frontend + backend)
- Unit/integration tests
- Docker image builds

## Deployment

The application is deployed on Railway as three services within one project: frontend, backend, and a managed PostgreSQL database.

- **Frontend:** https://modest-light-production.up.railway.app
- **Backend API:** _(add your backend's Railway domain here, e.g. https://ipl-dashboard-production-XXXX.up.railway.app)_

Both services auto-deploy from the `main` branch via Railway's GitHub integration.

## Notes

This project was built as part of a full-stack engineering assignment, evaluating data modeling, backend/frontend development, containerization, and CI/CD practices against a real-world IPL dataset.
