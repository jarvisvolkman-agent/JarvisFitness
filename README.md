# JarvisFitness v3

Lokální fitness workspace postavený na Reactu, .NET 10, PostgreSQL a Docker Compose.

## Stack

- **Backend:** .NET 10 Web API + Entity Framework Core + PostgreSQL
- **Frontend:** React 19 + Vite + TypeScript + lokální CSS design system inspirovaný JarvisCars
- **Databáze:** PostgreSQL 16
- **Nasazení:** Docker Compose
- **Agent helper:** `tools/jarvisfitness-cli.sh`

## Co je v této iteraci nové

- z projektu byla úplně odstraněná oblast Mantinely / preference / constraints
- místo ní přibyla samostatná sekce pro **tréninkové plány**
- přibyla samostatná sekce pro **plánované i odcvičené tréninky**
- dashboard teď ukazuje aktivní plány, plánované tréninky a evidenci odcvičených jednotek
- vyhledávání i export nově pracují s tréninkovými plány a tréninky
- seed data byla přepsaná na ukázkové tréninkové bloky a workout log

## Architektura

- `backend/` obsahuje .NET 10 API, DTOs, controllery a EF Core datovou vrstvu
- `frontend/` obsahuje React aplikaci s Vite buildem
- `docker-compose.yml` spouští PostgreSQL, backend a frontend
- `tools/jarvisfitness-cli.sh` obaluje REST API pro rychlé lokální dotazy

## Rychlý start

```bash
docker compose up --build -d
```

Otevři:

- Frontend: http://localhost:5183
- API: http://localhost:5110/api
- OpenAPI: http://localhost:5110/openapi/v1.json
- PostgreSQL na hostu: `localhost:5434`

Zastavení:

```bash
docker compose down
```

Smazání databázového volume:

```bash
docker compose down -v
```

## API endpointy

| Metoda | Cesta | Popis |
|--------|------|-------|
| GET | `/api/health` | Kontrola stavu služby |
| GET | `/api/profile` | Načtení profilu |
| PUT | `/api/profile` | Uložení profilu |
| GET/POST | `/api/goals` | Seznam nebo vytvoření cílů |
| PUT/DELETE | `/api/goals/:id` | Úprava nebo smazání cíle |
| GET/POST | `/api/check-ins` | Seznam nebo vytvoření kontrol |
| PUT/DELETE | `/api/check-ins/:id` | Úprava nebo smazání kontroly |
| GET/POST | `/api/training-plans` | Seznam nebo vytvoření tréninkových plánů |
| PUT/DELETE | `/api/training-plans/:id` | Úprava nebo smazání tréninkového plánu |
| GET/POST | `/api/workouts` | Seznam nebo vytvoření tréninku |
| PUT/DELETE | `/api/workouts/:id` | Úprava nebo smazání tréninku |
| GET | `/api/dashboard/summary` | Souhrn přehledu |
| GET | `/api/export` | Export všech uložených dat |
| GET | `/api/search?q=...` | Vyhledávání napříč fitness záznamy |

## Agent helper

```bash
./tools/jarvisfitness-cli.sh dashboard
./tools/jarvisfitness-cli.sh profile
./tools/jarvisfitness-cli.sh goals
./tools/jarvisfitness-cli.sh create-goal '{"category":"Weight","title":"Zhubnout 3 kg","targetValue":69,"unit":"kg","timeframe":"12 týdnů","status":"Active"}'
./tools/jarvisfitness-cli.sh create-check-in '{"checkInDate":"2026-03-30","weightKg":71.2,"energy":8,"adherence":9,"notes":"Stabilní týden"}'
./tools/jarvisfitness-cli.sh search "full body"
```

Proměnná `JARVISFITNESS_API_URL` může přesměrovat helper na jinou API základnu. Hodnoty enumů v API kontraktu zůstávají technicky anglické, ale UI a zobrazené lookup hodnoty jsou přeložené do češtiny.

## Lokální vývoj

Backend build:

```bash
cd backend
dotnet build
```

Frontend build:

```bash
cd frontend
npm install
npm run build
```

Vite dev server proxyuje `/api` na `http://localhost:5110`.

## Ověření

Požadované ověření pro tuto iteraci:

```bash
cd frontend && npm run build
cd backend && dotnet build
docker compose up --build -d
curl http://localhost:5110/api/health
curl http://localhost:5110/api/dashboard/summary
```

Pokud prostředí blokuje přístup na `api.nuget.org`, backend build a Docker build backendu neprojdou, protože .NET restore vyžaduje NuGet balíčky.
