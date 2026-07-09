# CommerceHub AI

Enterprise Multi-Vendor E-commerce Platform.

## Runtime

- Python 3.12
- FastAPI
- SQLAlchemy
- PostgreSQL

## Backend Startup

```bash
python3.12 -m compileall backend/app
uvicorn backend.app.main:app --reload
```

Health check:

```bash
curl http://127.0.0.1:8000/health
```

## Docker Setup

The committed Docker Compose files use `backend/.env.example` so a fresh clone can start with safe placeholder values. For local overrides, create a private backend environment file from the template:

```bash
cp backend/.env.example backend/.env
```

Update `POSTGRES_PASSWORD` and the matching password segment in `DATABASE_URL` inside `backend/.env` if you switch Compose to that local file.

Start the backend development stack:

```bash
docker compose -f docker/docker-compose.yml up --build
```

Services:

- Backend: `http://localhost:8000`
- Swagger: `http://localhost:8000/docs`
- Health: `http://localhost:8000/health`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

The backend container mounts `backend/` into the container and runs Uvicorn with hot reload for development.

## CI

Backend and frontend CI run on pushes and pull requests targeting `develop` and `feature/**` branches.

The backend workflow:

- Sets up Python 3.12
- Installs backend dependencies
- Runs Ruff linting
- Compiles `backend/app`
- Runs pytest for `backend/tests`
- Uploads pytest JUnit results as a workflow artifact

The frontend workflow:

- Sets up Node.js 20
- Installs frontend dependencies
- Runs ESLint
- Builds the React application
- Uploads the frontend build artifact

## Testing

Backend tests use pytest with strict marker/config validation and coverage enabled.

Run the backend test suite:

```bash
pytest
```

Test suites are organized under:

- `backend/tests/unit`
- `backend/tests/integration`
- `backend/tests/api`

Shared fixtures live in `backend/tests/fixtures.py` and are loaded through `backend/tests/conftest.py`.
