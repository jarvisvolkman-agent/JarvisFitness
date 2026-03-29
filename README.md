# JarvisFitness

Local-first fitness tracking MVP — Express API + SQLite + simple built-in web UI.

## What this MVP is

JarvisFitness is an internal-use foundation for a future fitness / nutrition subagent.
This version focuses on structured data capture and local workflows, not AI planning logic.

Included in the MVP:
- profile / onboarding data for training + nutrition context
- goals with status tracking
- preferences and constraints
- weekly-style check-ins
- dashboard summary API
- simple browser UI
- SQLite persistence
- Docker-first local run path
- minimal agent-facing CLI wrapper

## Architecture

- **Backend:** Node.js + TypeScript + Express
- **Persistence:** SQLite via `better-sqlite3`
- **Frontend:** static HTML/CSS/JS served by the backend
- **Runtime:** single local container via Docker Compose

Everything is local-first. No external APIs or cloud dependencies are required.

## Quick Start

### Docker (recommended)

```bash
docker compose up --build -d
```

Then open:
- App + UI: <http://localhost:4000>
- API health: <http://localhost:4000/api/health>

Stop it with:

```bash
docker compose down
```

### Local Node run

Requires Node 22+.

```bash
npm install
npm run build
npm start
```

For development with autoreload:

```bash
npm run dev
```

## Storage

The SQLite database lives in:
- local dev: `./data/jarvisfitness.db`
- Docker: persisted in the `app-data` named volume

You can override storage location with `DATA_DIR`.

## API Overview

All endpoints return JSON under `/api`.

- `GET /api/health` — health check
- `GET /api/profile` — load current profile
- `PUT /api/profile` — create/update the default profile
- `GET /api/goals` — list goals
- `POST /api/goals` — create goal
- `PUT /api/goals/:id` — update goal
- `DELETE /api/goals/:id` — delete goal
- `GET /api/preferences?kind=preference|constraint` — list preference items
- `POST /api/preferences` — create preference/constraint
- `PUT /api/preferences/:id` — update preference/constraint
- `DELETE /api/preferences/:id` — delete preference/constraint
- `GET /api/check-ins` — list check-ins
- `POST /api/check-ins` — create check-in
- `PUT /api/check-ins/:id` — update check-in
- `DELETE /api/check-ins/:id` — delete check-in
- `GET /api/dashboard/summary` — compact dashboard summary for UI/agents
- `GET /api/export` — export all stored MVP data

## Minimal Agent / CLI Helper

Two equivalent ways to use the helper:

```bash
npm run cli -- dashboard
npm run cli -- profile
npm run cli -- export
```

Or via the shell wrapper:

```bash
./tools/jarvisfitness-cli.sh dashboard
./tools/jarvisfitness-cli.sh goals
./tools/jarvisfitness-cli.sh checkins
./tools/jarvisfitness-cli.sh goals:create '{"category":"weight","title":"Lose 3 kg","status":"active"}'
./tools/jarvisfitness-cli.sh checkins:create '{"checkInDate":"2026-03-30","weightKg":71,"energy":8,"adherence":9}'
```

Override the target server with `JARVISFITNESS_API_URL` or `API_URL`.

## Seed Data

On first run the app seeds demo data so the UI and API are immediately usable:
- 1 demo profile
- 2 active goals
- 1 preference
- 1 constraint
- 1 check-in

To reset local data, delete `data/jarvisfitness.db`.

## Validation and Scope

This MVP includes:
- typed domain model
- request validation with Zod
- basic 400/404/500 handling
- simple summary metrics for quick review

This MVP intentionally does **not** yet include:
- training plan generation
- nutrition plan generation
- auth / multi-user support
- file uploads
- advanced analytics or trend charts
- evidence-based recommendation engine

## Verification

Local verification used for this MVP:

```bash
npm install
npm run build
npm test
```

Docker verification:

```bash
docker compose up --build -d
curl http://localhost:4000/api/health
```

## Repository Layout

```text
public/                  simple dashboard UI
src/server.ts            Express API + static app serving
src/db.ts                SQLite schema and data access
src/validation.ts        request validation rules
src/cli.ts               agent-facing CLI client
tools/jarvisfitness-cli.sh  shell wrapper for agents/scripts
Dockerfile
docker-compose.yml
```
