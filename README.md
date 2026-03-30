# JarvisFitness v2

Local-first fitness records management rewritten to match the JarvisCars architecture.

## Stack

- **Backend:** .NET 10 Web API with Entity Framework Core + PostgreSQL
- **Frontend:** React 19 + Vite + TypeScript + React Router
- **Database:** PostgreSQL 16
- **Deployment:** Docker Compose
- **Agent helper:** `tools/jarvisfitness-cli.sh`

## What Was Mirrored From JarvisCars

- split repo structure with `backend/`, `frontend/`, `tools/`, `docker-compose.yml`
- .NET 10 API using DTOs, controllers, EF Core data layer, and startup DB provisioning
- React frontend that talks to `/api`
- local Docker Compose stack with separate database, backend, and frontend services
- agent-facing shell helper that wraps the REST API
- README layout centered on local-first workflows

## Fitness Domain Preserved

- profile
- goals
- preferences and constraints
- check-ins
- dashboard summary
- export
- search across stored fitness records

## Quick Start

```bash
docker compose up --build -d
```

Open:

- Frontend: http://localhost:5183
- API: http://localhost:5110/api
- OpenAPI: http://localhost:5110/openapi/v1.json

Stop:

```bash
docker compose down
```

Reset database volume:

```bash
docker compose down -v
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/profile` | Get profile |
| PUT | `/api/profile` | Upsert profile |
| GET/POST | `/api/goals` | List or create goals |
| PUT/DELETE | `/api/goals/:id` | Update or delete goal |
| GET/POST | `/api/preferences` | List or create preference/constraint |
| PUT/DELETE | `/api/preferences/:id` | Update or delete preference item |
| GET/POST | `/api/check-ins` | List or create check-ins |
| PUT/DELETE | `/api/check-ins/:id` | Update or delete check-in |
| GET | `/api/dashboard/summary` | Dashboard summary |
| GET | `/api/export` | Export all stored data |
| GET | `/api/search?q=...` | Search stored fitness content |

## Agent Helper

```bash
./tools/jarvisfitness-cli.sh dashboard
./tools/jarvisfitness-cli.sh profile
./tools/jarvisfitness-cli.sh goals
./tools/jarvisfitness-cli.sh create-goal '{"category":"Weight","title":"Lose 3 kg","targetValue":69,"unit":"kg","timeframe":"12 weeks","status":"Active"}'
./tools/jarvisfitness-cli.sh create-check-in '{"checkInDate":"2026-03-30","weightKg":71.2,"energy":8,"adherence":9}'
./tools/jarvisfitness-cli.sh search "shoulder"
```

Override `JARVISFITNESS_API_URL` to point the helper at a different API base.

## Development

Backend build in Docker:

```bash
docker run --rm -v "$(pwd)/backend:/app" -w /app mcr.microsoft.com/dotnet/sdk:10.0 dotnet build
```

Frontend dev server:

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server proxies `/api` to `http://localhost:5110`.

## Verification

Commands used for this rewrite:

```bash
cd frontend && npm install && npm run build
docker run --rm -v "$(pwd)/backend:/app" -w /app mcr.microsoft.com/dotnet/sdk:10.0 dotnet build
docker compose up --build -d
curl http://localhost:5110/api/health
curl http://localhost:5110/api/dashboard/summary
./tools/jarvisfitness-cli.sh export
```

## Repository Layout

```text
backend/                       .NET 10 API, models, DTOs, controllers, EF Core data layer
frontend/                      React app
tools/jarvisfitness-cli.sh     agent-facing helper
docker-compose.yml
README.md
```
