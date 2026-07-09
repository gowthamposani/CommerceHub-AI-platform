# CommerceHub AI

Enterprise Multi-Vendor E-commerce Platform.

## Runtime

- Python 3.12
- FastAPI
- SQLAlchemy
- PostgreSQL
- React 18
- Vite
- TypeScript
- Playwright

## Developer 3 Module

Developer 3 owns Admin, Analytics, AI, Notifications, testing, Docker support, and documentation.

Primary documentation:

- [Developer 3 Guide](docs/developer-3-guide.md)
- [Admin Module](docs/admin-module.md)
- [AI Module](docs/ai-module.md)
- [Notification Module](docs/notification-module.md)
- [Testing Guide](docs/testing-guide.md)
- [Playwright Guide](docs/playwright-guide.md)
- [Docker Setup](docs/docker-setup.md)
- [Integration Points](docs/integration-points.md)
- [Known Limitations](docs/known-limitations.md)
- [Developer TODOs](docs/developer-todos.md)

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

The committed Docker Compose files use `backend/.env.example` and `frontend/.env.example` so a fresh clone can start with safe placeholder values. For local overrides, create private environment files from the templates:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Update `POSTGRES_PASSWORD` and the matching password segment in `DATABASE_URL` inside `backend/.env` if you switch Compose to that local file. Keep frontend API settings in `frontend/.env`.

Start the development stack:

```bash
docker compose -f docker/docker-compose.yml up --build
```

Services:

- Backend: `http://localhost:8000`
- Swagger: `http://localhost:8000/docs`
- Health: `http://localhost:8000/health`
- Frontend: `http://localhost:5173`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

The backend container mounts `backend/` into the container and runs Uvicorn with hot reload for development. The frontend container mounts `frontend/`, keeps dependencies in a named Docker volume, and runs Vite with hot reload.

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

## Playwright

Run Admin frontend E2E tests:

```bash
cd frontend
npm install
npm run test:e2e:typecheck
npx playwright install
npx playwright test
```

Open the HTML report:

```bash
npm run test:e2e:report
```

## Developer 3 Validation

Recommended pre-PR validation:

```bash
python -m compileall backend/app
pytest
cd frontend
npm install
npm run lint
npm run build
npm run test:e2e:typecheck
npx playwright test
```

## Known Integration Boundaries

Developer 3 intentionally leaves placeholders where other modules are required:

- Developer 1: authentication, users, customers, sellers, roles
- Developer 2: products, categories, inventory, orders, commerce metrics

See [Integration Points](docs/integration-points.md) and [Developer TODOs](docs/developer-todos.md).
